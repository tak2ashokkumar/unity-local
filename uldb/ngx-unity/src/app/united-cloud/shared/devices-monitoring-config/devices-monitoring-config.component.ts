import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { MonitoringTemplate } from 'src/app/shared/SharedEntityTypes/monitoring-templates.type';
import { DOWNLOAD_AGENT_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, AuthLevelMapping, DeviceMapping, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { SNMPCrudType } from '../entities/snmp-crud.type';
import { DevicesMonitoringConfigService } from './devices-monitoring-config.service';
import { AUTH_ALGOS, CRYPTO_ALGOS } from '../../../app-constants'
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'devices-monitoring-config',
  templateUrl: './devices-monitoring-config.component.html',
  styleUrls: ['./devices-monitoring-config.component.scss']
})
export class DevicesMonitoringConfigComponent implements OnInit, OnDestroy {
  monitoringDetails: SNMPCrudType;
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;
  deviceId: string = '';
  device: DeviceTabData;
  pcId: string;
  itemId: string;

  monitoringEnabled: boolean;
  SNMPVersionMapping = SNMPVersionMapping;
  AuthLevelMapping = AuthLevelMapping;
  monitoring: DeviceMonitoringType;
  nonFieldErr: string = '';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  authAlgos = AUTH_ALGOS;
  cryptoAlgos = CRYPTO_ALGOS;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  downloadAgentUrl: string;

  isTenantOrg: boolean = false;
  templates: MonitoringTemplate[] = [];
  filteredTemplates: MonitoringTemplate[] = [];
  fieldsToFilterOn: string[] = ['template_name'];
  selectedTemplates: MonitoringTemplate[] = [];
  searchValue: string = '';
  isAPIOptionRequired: boolean = false;
  isAgentOptionRequired: boolean = false;
  isSNMPOptionRequired: boolean = false;
  showSNMPTrap: boolean = false;
  formButtons: boolean = true;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  onPublicCloudVmConfig: boolean = false;
  constructor(private configSvc: DevicesMonitoringConfigService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private userInfo: UserInfoService,
    private refreshService: DataRefreshBtnService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private router: Router,
    private builder: FormBuilder) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.onPublicCloudVmConfig = this.router.url.includes('configureAzure') ? true : false;
  }

  ngOnInit() {
    this.isTenantOrg = this.userInfo.isTenantOrg;
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);

    const apiDeviceTypes = new Set([
      'Azure VM',
      DeviceMapping.VIPTELA_ACCOUNT,
      DeviceMapping.MERAKI_ACCOUNT,
      DeviceMapping.HYPERVISOR,
      DeviceMapping.VMWARE_VIRTUAL_MACHINE,
      DeviceMapping.RFID_READER
    ]);
    this.isAPIOptionRequired = apiDeviceTypes.has(this.device?.deviceType) || this.device?.hasPureOs;
    this.isAgentOptionRequired = !(this.device?.isCluster || this.device?.hasPureOs || this.device?.deviceType == DeviceMapping.VIPTELA_ACCOUNT || this.device?.deviceType == DeviceMapping.MERAKI_ACCOUNT || this.device?.deviceType == DeviceMapping.SENSOR || this.device?.deviceType == DeviceMapping.SMART_PDU || this.device?.deviceType == DeviceMapping.RFID_READER);
    this.isSNMPOptionRequired = !(this.device?.deviceType == DeviceMapping.VIPTELA_ACCOUNT || this.device?.deviceType == DeviceMapping.MERAKI_ACCOUNT);

    /** THIS IS BC FOR STATS DRILLDOWN
    *   OBSERVIUM server.uuid is used and zabbix bms.uuid is used
    *     a.bmServerId = server.uuid;
    *     a.serverId = server.server.uuid;
    *   BUT FOR MONITORING CONFIG APIS bms.uuid is used
    * */
    if (this.device.deviceType == DeviceMapping.BARE_METAL_SERVER) {
      this.deviceId = this.device.uuid;
    }
    this.itemId = this.deviceId ? this.deviceId : this.pcId;
    this.downloadAgentUrl = DOWNLOAD_AGENT_BY_DEVICE_TYPE(this.device.deviceType, this.itemId);
    this.getTemplates();
    this.onPublicCloudVmConfig && this.getCollectors();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.spinnerService.stop('main');
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  onSearched(event: string) {
    this.searchValue = event;
    this.filteredTemplates = this.clientSideSearchPipe.transform(this.templates, event, this.fieldsToFilterOn);
  }

  refreshData() {
    this.getTemplates();
  }

  getTemplates() {
    this.spinnerService.start('main');
    this.configSvc.getTemplates().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.templates = res;
      this.filteredTemplates = res;
      this.getDeviceMonitoring();
      this.spinnerService.stop('main');
    }, err => {
      this.templates = [];
      this.filteredTemplates = [];
      this.getDeviceMonitoring();
      this.spinnerService.stop('main');
    });
  }

  getDeviceMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.getDeviceMonitoring(this.itemId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring = res.monitoring;
      this.getMonitoringDetails();
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getMonitoringDetails() {
    this.configSvc.getMonitoringConfig(this.itemId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoringDetails = res;
      if (this.device.deviceType == DeviceMapping.CONTAINER_CONTROLLER) {
        this.monitoringDetails.connection_type = 'Agent';
      }
      this.spinnerService.stop('main');
      this.buildForm();
    }, err => {
      this.monitoringDetails = null;
      if (this.device.deviceType == DeviceMapping.CONTAINER_CONTROLLER) {
        this.monitoringDetails = { connection_type: 'Agent', ip_address: '' };
      }
      this.spinnerService.stop('main');
      this.buildForm();
    });
  }

  getCollectors() {
    this.configSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  buildForm() {
    this.selectedTemplates = [];
    this.nonFieldErr = '';
    this.showSNMPTrap = this.device.deviceType == DeviceMapping.STORAGE_DEVICES &&
      this.monitoringDetails.is_snmptrap_enabled != null;
    this.form = this.configSvc.buildForm(this.monitoringDetails, this.device.deviceType, this.onPublicCloudVmConfig);
    this.formErrors = this.configSvc.resetFormErrors();
    this.formValidationMessages = this.configSvc.switchValidationMessages;
    if (this.form.get('connection_type').value == "API") {
      this.form.removeControl('ip_address');
      this.form.removeControl('mtp_templates');
      this.formButtons = [DeviceMapping.VIPTELA_ACCOUNT, DeviceMapping.MERAKI_ACCOUNT, DeviceMapping.HYPERVISOR, DeviceMapping.VMWARE_VIRTUAL_MACHINE, DeviceMapping.RFID_READER].includes(this.device.deviceType) || this.device.hasPureOs;
      this.showSNMPTrap = false;
    } else {
      if (!this.deviceId) {
        this.form.get('connection_type').disable({ emitEvent: false });
      }
      if (this.device?.configured) {
        this.form.get('connection_type').disable({ emitEvent: false });
      }
      this.formButtons = true;
      let templates = <number[]>this.form.get('mtp_templates').value;
      if (templates.length) {
        templates.map(tId => {
          let template = this.filteredTemplates.find(tmpl => tmpl.template_id == tId);
          if (template) {
            template.isSelected = true;
            this.selectedTemplates.push(template);
          }
        })
      }
    }
    this.form.get('connection_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'SNMP') {
        this.onPublicCloudVmConfig && this.addCollectorField();
        this.formButtons = true;
        this.configSvc.setSnmpFields();
        this.subscribeToSnmpVerionChanges();
      } else if (val == 'HTTP') {
        this.onPublicCloudVmConfig && this.form.removeControl('collector');
        this.formButtons = true;
        this.configSvc.setHTTPField();
      } else if (val == 'Agent') {
        this.onPublicCloudVmConfig && this.addCollectorField();
        this.formButtons = true;
        this.configSvc.setAgentField();
      } else if (val == 'API') {
        this.onPublicCloudVmConfig && this.form.removeControl('collector');
        this.configSvc.setAPIField();
        this.formButtons = [DeviceMapping.VIPTELA_ACCOUNT, DeviceMapping.MERAKI_ACCOUNT, DeviceMapping.HYPERVISOR, DeviceMapping.VMWARE_VIRTUAL_MACHINE, DeviceMapping.RFID_READER].includes(this.device.deviceType) || this.device.hasPureOs;
        this.showSNMPTrap = false;
      }
    });
    if (this.form.get('snmp_version')) {
      this.subscribeToSnmpVerionChanges();
    }
  }

  subscribeToSnmpVerionChanges() {
    if (this.form.get('snmp_version')) {
      this.form.get('snmp_version').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res == SNMPVersionMapping.V3) {
          this.form = this.configSvc.setV3Fields();
          this.subscr = this.form.get('snmp_authlevel').valueChanges.subscribe(res => {
            if (res == AuthLevelMapping.NoAuthNoPriv) {
              this.form = this.configSvc.setNoAuthNoPrivFields();
            } else if (res == AuthLevelMapping.AuthNoPriv) {
              this.form = this.configSvc.setAtuhNoPrivFields();
            } else {
              this.form = this.configSvc.setAuthPrivFields();
            }
            this.form.updateValueAndValidity();
          });
        } else {
          this.form = this.configSvc.setV1_V2Fields();
          if (this.subscr && !this.subscr.closed) {
            this.subscr.unsubscribe();
          }
        }
        this.form.updateValueAndValidity();
      });
    }
  }

  addCollectorField() {
    this.form.addControl('collector', this.builder.group({
      uuid: ['', [Validators.required]]
    }));
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    }
  }

  handleError(err: any) {
    this.formErrors = this.configSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  resetConfig(configState: boolean) {
    this.device.configured = configState;
    this.storageService.put('device', this.device, StorageType.SESSIONSTORAGE);
    this.configSvc.monitoringEnabled();
  }

  confirmMonitoringConfig() {
    if (this.isTenantOrg) {
      let templatesSelected = this.selectedTemplates.map(t => t.template_id);
      this.form.get('mtp_templates')?.setValue(templatesSelected);
      this.form.get('mtp_templates')?.setValidators([Validators.required]);
    } else {
      this.form.removeControl('mtp_templates');
    }
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      let arr = [DeviceMapping.AZURE_VIRTUAL_MACHINE, DeviceMapping.VMWARE_VIRTUAL_MACHINE, DeviceMapping.VCLOUD, DeviceMapping.HYPER_V,
      DeviceMapping.ESXI, DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, DeviceMapping.CUSTOM_VIRTUAL_MACHINE, DeviceMapping.HYPERVISOR,
      DeviceMapping.STORAGE_DEVICES, DeviceMapping.CONTAINER_CONTROLLER]
      if (this.form.get('connection_type').value == 'Agent' && !arr.includes(this.device.deviceType)) {
        return;
      }
      this.spinnerService.start('main');
      if (this.monitoring?.configured && this.monitoringDetails) {
        this.configSvc.updateMonitoring(this.itemId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Monitoring details updated successfully.'));
          this.getTemplates();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.configSvc.enableMonitoring(this.itemId, this.device.deviceType, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.form = null;
          this.resetConfig(true);
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Monitoring enabled successfully.'));
          this.getTemplates();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  deleteMonitoringConfig() {
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteConfig() {
    this.spinnerService.start('main');
    this.confirmDeleteModalRef.hide();
    this.configSvc.deleteMonitoring(this.itemId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.form = null;
      this.resetConfig(false);
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Monitoring configuration deleted successfully.'));
      this.getTemplates();
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Something went wrong!! Please try again'));
    });
  }

  toggleMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.toggleMonitoring(this.itemId, this.device.deviceType, this.monitoring.enabled).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring.enabled = !this.monitoring.enabled;
      this.spinnerService.stop('main');
      this.getTemplates();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  selectTemplate(i: number) {
    if (this.filteredTemplates[i].isSelected) {
      this.filteredTemplates[i].isSelected = false;
    } else {
      this.filteredTemplates[i].isSelected = true;
    }
  }

  updateSelectedTemplates() {
    this.selectedTemplates = this.filteredTemplates.filter(tmpl => tmpl.isSelected);
    this.form.get('mtp_templates').setValue(this.selectedTemplates.map(t => t.template_id));
  }

  unSelectTemplate(i: number) {
    let tmplIndex = this.filteredTemplates.findIndex(tmpl => tmpl.template_id == this.selectedTemplates[i].template_id);
    if (tmplIndex != -1) {
      this.filteredTemplates[tmplIndex].isSelected = false;
    }
    this.selectedTemplates.splice(i, 1);
    this.form.get('mtp_templates').setValue(this.selectedTemplates.map(t => t.template_id));
  }

  toggleSNMPTraps() {
    this.spinnerService.start('main');
    this.configSvc.toggleSNMPTraps(this.itemId, this.monitoringDetails.is_snmptrap_enabled).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getTemplates();
      this.notification.success(new Notification(`SNMP Trap ${this.monitoringDetails.is_snmptrap_enabled ? 'disabled' : 'enabled'} successfully.`));
      this.spinnerService.stop('main');
    }, err => {
      this.notification.error(new Notification(`Failed to ${this.monitoringDetails.is_snmptrap_enabled ? 'disable' : 'enable'} SNMP Trap`));
      this.spinnerService.stop('main');
    });
  }
}
