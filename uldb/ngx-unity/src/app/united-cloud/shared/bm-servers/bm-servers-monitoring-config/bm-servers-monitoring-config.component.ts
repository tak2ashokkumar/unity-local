import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { merge as _merge } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, AuthLevelMapping, BMServerSidePlatformMapping, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { BMServer } from '../../entities/bm-server.type';
import { SNMPCrudType } from '../../entities/snmp-crud.type';
import { BmServersMonitoringConfigService } from './bm-servers-monitoring-config.service';
import { DOWNLOAD_AGENT_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { MonitoringTemplate } from 'src/app/shared/SharedEntityTypes/monitoring-templates.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { AUTH_ALGOS, CRYPTO_ALGOS } from 'src/app/app-constants';


@Component({
  selector: 'bm-servers-monitoring-config',
  templateUrl: './bm-servers-monitoring-config.component.html',
  styleUrls: ['./bm-servers-monitoring-config.component.scss'],
  providers: [BmServersMonitoringConfigService]
})
export class BmServersMonitoringConfigComponent implements OnInit {
  monitoringDetails: SNMPCrudType;
  bmServer: BMServer;
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;
  monitoringEnabled: boolean;

  BMPlatFormMappingEnum = BMServerSidePlatformMapping;
  SNMPVersionMapping = SNMPVersionMapping;
  AuthLevelMapping = AuthLevelMapping;
  authAlgos = AUTH_ALGOS;
  cryptoAlgos = CRYPTO_ALGOS;

  deviceId: string = '';
  device: DeviceTabData;
  monitoring: DeviceMonitoringType;

  nonFieldErr: string = '';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  bmcTypeForm: FormGroup;
  IPMIorDRACForm: FormGroup;
  IPMIorDRACFormErrors: any;
  IPMIorDRACFormValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  downloadAgentUrl: string;

  isTenantOrg: boolean = false;
  templates: MonitoringTemplate[] = [];
  filteredTemplates: MonitoringTemplate[] = [];
  fieldsToFilterOn: string[] = ['template_name'];
  selectedTemplates: MonitoringTemplate[] = [];
  searchValue: string = '';
  constructor(private configSvc: BmServersMonitoringConfigService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private userInfo: UserInfoService,
    private clientSideSearchPipe: ClientSideSearchPipe) { }

  ngOnInit() {
    this.isTenantOrg = this.userInfo.isTenantOrg;
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);

    /** THIS IS BC FOR STATS DRILLDOWN
    *   OBSERVIUM server.uuid is used and zabbix bms.uuid is used 
    *     a.bmServerId = server.uuid;
    *     a.serverId = server.server.uuid;
    *   BUT FOR MONITORING CONFIG APIS bms.uuid is used
    * */
    this.deviceId = this.device.uuid;
    this.downloadAgentUrl = DOWNLOAD_AGENT_BY_DEVICE_TYPE(this.device.deviceType, this.deviceId);
    this.getTemplates();
    // this.getDeviceMonitoring();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.spinnerService.stop('main');
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  onSearched(event: string) {
    this.searchValue = event;
    this.filteredTemplates = this.clientSideSearchPipe.transform(this.templates, event, this.fieldsToFilterOn);
  }

  getDeviceMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.getDeviceMonitoring(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.bmServer = res;
      this.monitoring = res.monitoring;
      this.getMonitoringDetails();
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getMonitoringDetails() {
    this.configSvc.getMonitoringConfig(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoringDetails = res;
      this.spinnerService.stop('main');
      this.buildForm();
    }, err => {
      this.monitoringDetails = null;
      this.spinnerService.stop('main');
      this.buildForm();
    });
  }

  resetOtherForm() {
    this.IPMIorDRACForm = null;
    this.IPMIorDRACFormErrors = null;
    this.IPMIorDRACFormValidationMessages = null;
  }

  createOtherForm(bmcType: string) {
    this.resetOtherForm();
    switch (bmcType) {
      case BMServerSidePlatformMapping.IPMI:
        this.IPMIorDRACForm = this.configSvc.createIPMIForm(this.bmServer);
        this.IPMIorDRACFormErrors = this.configSvc.resetIPMIFormErrors();
        this.IPMIorDRACFormValidationMessages = this.configSvc.IPMIFormValidationMessages;
        break;
      case BMServerSidePlatformMapping.DRAC:
        this.IPMIorDRACForm = this.configSvc.createDARCForm(this.bmServer);
        this.IPMIorDRACFormErrors = this.configSvc.resetDRACFormErrors();
        this.IPMIorDRACFormValidationMessages = this.configSvc.DRACFormValidationMessages;
        break;
      case BMServerSidePlatformMapping.None:
        this.resetOtherForm();
        break;
      default:
        break;
    }
  }

  buildForm() {
    this.selectedTemplates = [];
    this.nonFieldErr = '';
    this.form = this.configSvc.buildForm(this.monitoringDetails);
    this.formErrors = this.configSvc.resetFormErrors();
    this.formValidationMessages = this.configSvc.switchValidationMessages;
    let templates = <number[]>this.form.get('mtp_templates').value;
    if (templates.length) {
      templates.forEach(tId => {
        let template = this.filteredTemplates.find(tmpl => tmpl.template_id == tId);
        if (template) {
          this.selectedTemplates.push(template);
        }
      })
    }
    this.bmcTypeForm = this.configSvc.buildBMCTypeForm(this.bmServer);
    this.createOtherForm(this.bmServer.bmc_type);
    this.bmcTypeForm.get('bmc_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((bmcType: string) => {
      this.createOtherForm(bmcType);
    });
    this.form.get('connection_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'SNMP') {
        this.configSvc.setSnmpFields();
        this.subscribeToSnmpVerionChanges();
      } else if (val == 'Agent') {
        this.configSvc.setAgentField();
      }
    });
    if (this.form.get('snmp_version')) {
      this.subscribeToSnmpVerionChanges();
    }
  }

  subscribeToSnmpVerionChanges() {
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
        if (this.IPMIorDRACForm && field in this.IPMIorDRACForm.controls) {
          this.IPMIorDRACFormErrors[field] = err[field][0];
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

  confirmMonitoringConfiguration(data: any) {
    this.spinnerService.start('main');
    let obj = Object.assign({}, data);
    if (this.monitoring.configured && this.monitoringDetails) {
      this.configSvc.updateMonitoring(this.deviceId, this.device.deviceType, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinnerService.stop('main');
        this.notification.success(new Notification('Monitoring details updated successfully.'));
        this.getDeviceMonitoring();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.configSvc.enableMonitoring(this.deviceId, this.device.deviceType, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.form = null;
        this.resetConfig(true);
        this.spinnerService.stop('main');
        this.notification.success(new Notification('Monitoring enabled successfully.'));
        this.getDeviceMonitoring();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  confirmMonitoringConfig() {
    if (this.isTenantOrg) {
      let templatesSelected = this.selectedTemplates.map(t => t.template_id);
      this.form.get('mtp_templates').setValue(templatesSelected);
      this.form.get('mtp_templates').setValidators([Validators.required]);
    } else {
      this.form.removeControl('mtp_templates');
    }
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    }
    if (this.IPMIorDRACForm && this.IPMIorDRACForm.invalid) {
      this.IPMIorDRACFormErrors = this.utilService.validateForm(this.IPMIorDRACForm, this.IPMIorDRACFormValidationMessages, this.IPMIorDRACFormErrors);
      this.IPMIorDRACForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.IPMIorDRACFormErrors = this.utilService.validateForm(this.IPMIorDRACForm, this.IPMIorDRACFormValidationMessages, this.IPMIorDRACFormErrors); });
    }

    if (this.form.valid) {
      if (this.IPMIorDRACForm && this.IPMIorDRACForm.valid) {
        this.confirmMonitoringConfiguration(_merge({}, this.form.getRawValue(), this.bmcTypeForm.getRawValue(), this.IPMIorDRACForm.getRawValue()));
      } else {
        this.confirmMonitoringConfiguration(_merge({}, this.form.getRawValue(), this.bmcTypeForm.getRawValue()));
      }
    }
  }

  confirmDeleteConfig() {
    this.spinnerService.start('main');
    this.confirmDeleteModalRef.hide();
    this.configSvc.deleteMonitoring(this.deviceId, this.device.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.form = null;
      this.resetConfig(false);
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Monitoring configuration deleted successfully.'));
      this.getDeviceMonitoring();
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Something went wrong!! Please try again'));
    });
  }

  deleteMonitoringConfig() {
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  toggleMonitoring() {
    this.spinnerService.start('main');
    this.configSvc.toggleMonitoring(this.deviceId, this.device.deviceType, this.monitoring.enabled).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoring.enabled = !this.monitoring.enabled;
      this.spinnerService.stop('main');
      this.getDeviceMonitoring();
    }, err => {
      this.spinnerService.stop('main');
    });
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
}
