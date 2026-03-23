import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping, deviceEnvironmentOptions } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceInterfaceCrudService } from 'src/app/shared/device-interface-crud/device-interface-crud.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { VirtualMachineDetails } from '../../../entities/vm.type';
import { ZabbixVmsDetailsService } from './zabbix-vms-details.service';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
import { CredentialMap } from 'src/app/app-constants';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { LifeCycleStageOptions, LifeCycleStageStatusOptions } from '../../../hypervisors/hypervisors-crud/hypervisors-crud.service';

@Component({
  selector: 'zabbix-vms-details',
  templateUrl: './zabbix-vms-details.component.html',
  styleUrls: ['./zabbix-vms-details.component.scss'],
  providers: [ZabbixVmsDetailsService]
})
export class ZabbixVmsDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceType: DeviceMapping;
  deviceId: string;
  scrollStrategy: ScrollStrategy;
  customVM: DeviceMapping = DeviceMapping.CUSTOM_VIRTUAL_MACHINE;

  view: VirtualMachineDetails;
  device: DeviceTabData;

  isEditable: boolean = false;
  isHypervVm: boolean = false;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  deviceEnvironmentOptions: string[] = deviceEnvironmentOptions;
  credentials: UnityCredentialsFast[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  metaDataForm: FormGroup;
  metaDataFormErrors: any;
  metaDataFormValidationMessages: any;

  locationForm: FormGroup;
  locationFormErrors: any;
  locationFormValidationMessages: any;
  datacenters: Array<DatacenterFast> = [];
  devicePowerStatus: boolean = false;
  deviceStatus: string;
  nonFieldErr: string = '';
  now: any;
  credentialMap = CredentialMap;

  credentialSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'nameWithType',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    // selectAsObject: true,
    keyToSelect: 'uuid',
    disableOptionsOfSameType: true
  };

  lifeCycleStageOptions: string[] = LifeCycleStageOptions;
  lifeCycleStageStatusOptions: string[] = LifeCycleStageStatusOptions;
  
  constructor(private detailService: ZabbixVmsDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private readonly sso: ScrollStrategyOptions,
    private storage: StorageService,
    private interfaceCrudSvc: DeviceInterfaceCrudService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
      this.device.uuid = this.deviceId;
      this.deviceType = this.device.deviceType;
      this.isEditable = this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE || this.deviceType == DeviceMapping.HYPER_V;
      this.isHypervVm = this.deviceType == DeviceMapping.HYPER_V;
      this.getCollectors();
      this.getDeviceDetails();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getCredentials();
    this.getCollectors();
    this.getDeviceDetails();
  }

  getDeviceDetails(isDeviceUpdated?: boolean) {
    if (!isDeviceUpdated) {
      this.spinner.start('main');
    }
    // this.datacenters = [];
    // let dropdownData = await this.detailService.getDropdownData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).toPromise();
    // this.deviceStatus = dropdownData[0].device_data.status;
    // this.datacenters = _clone(dropdownData[0]);
    this.detailService.getDeviceDetails(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
      this.getCredentials();
      let os = this.detailService.getOs(res.os);
      let ssrOS = this.detailService.getSSROS(res);
      this.storage.put('device', { name: res.name, deviceType: this.deviceType, configured: res.monitoring.configured, os: os, ssr_os: ssrOS }, StorageType.SESSIONSTORAGE);
      this.buildForm();
      if (this.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE) {
        this.syncPerformance();
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  syncPerformance() {
    this.detailService.syncPerformance(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.detailService.getDeviceDetails(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.view = res;
        this.buildMetaDataForm();
      }, err => {
        this.spinner.stop('main');
        this.notification.error(new Notification("Failed to get device details"));
      })
    })
  }

  getCredentials() {
    this.credentials = [];
    this.detailService.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.credentials = res;
      if (this.view?.credentials_m2m) {
        const normalize = (str: string) => this.credentialMap[str.toLowerCase()] || str.toLowerCase();
        const connection_types = this.credentials.filter(credential => this.view.credentials_m2m.map(cred => cred.uuid)
          .includes(credential.uuid)).map(c => normalize(c.connection_type));
        const databaseCredentialTypeCredentials = this.view?.credentials_m2m?.filter(credential => credential.connection_type == 'DATABASE');
        this.credentials.forEach(c => {
          if (connection_types.includes(normalize(c.connection_type)) && !this.view.credentials_m2m.map(c => c.uuid).includes(c.uuid)) {
            if (c.connection_type == 'DATABASE') {
              databaseCredentialTypeCredentials.forEach(dtCred => {
                if (dtCred.database_type == c.database_type) {
                  c.isDisabled = true;
                }
              });
            } else {
              c.isDisabled = true;
            }
          }
        })
      }
    });
  }

  getCollectors() {
    this.collectors = [];
    this.detailService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  buildForm() {
    this.detailForm = null;
    this.locationForm = null;
    this.metaDataForm = null;
    setTimeout(() => {
      this.buildDetailForm();
      this.buildMetaDataForm();
      this.buildLocationForm();
      this.syncSerialNumber();
      this.syncUptime();
      this.spinner.stop('main');
    })
  }

  buildDetailForm() {
    this.detailForm = this.detailService.buildDetailForm(_clone(this.view), this.deviceType);
    this.detailFormErrors = this.detailService.resetDetailFormErrors();
    this.detailFormValidationMessages = this.detailService.detailFormValidationMessages;
    let status = this.detailForm.get('availability_status').value;
    if (status) {
      this.detailForm.get('availability_status').setValue(this.utilService.getDeviceAvailabilityStatus(status));
    } else {
      this.getDeviceData();
    }
    this.detailForm.disable({ emitEvent: false });
    this.detailForm.get('credentials_m2m').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      if (val.length) {
        const credentialType = [...new Set(this.credentials.filter(credential => val.includes(credential.uuid)).map(c => c.connection_type))].join(', ');
        this.detailForm.get('credentials_type').setValue(credentialType ? credentialType : '');
      } else {
        this.detailForm.get('credentials_type').setValue('');
      }
    });
  }

  getDeviceData() {
    this.detailService.getDeviceData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.detailForm.get('availability_status').setValue(this.utilService.getDeviceAvailabilityStatus(res.device_data.status));
    })
  }

  buildMetaDataForm() {
    this.metaDataForm = this.detailService.buildMetaDataForm(_clone(this.view), this.deviceType);
    this.metaDataFormErrors = this.detailService.resetMetaDataFormErrors();
    this.metaDataFormValidationMessages = this.detailService.metaDataFormValidationMessages;
    this.metaDataForm.disable({ emitEvent: false });
  }

  buildLocationForm() {
    this.locationForm = this.detailService.buildLocationForm(_clone(this.view));
    this.locationFormErrors = this.detailService.resetLocationFormErrors();
    this.locationFormValidationMessages = this.detailService.locationFormValidationMessages;
    this.locationForm.disable({ emitEvent: false });
  }

  isRequiredFieldInDetailForm(field: string) {
    if (this.detailForm.controls[field]) {
      let abstractControl = this.detailForm.controls[field];
      return abstractControl.hasValidator(Validators.required);
    }
  }

  isRequiredFieldInMetaDataForm(field: string) {
    if (this.metaDataForm.controls[field]) {
      let abstractControl = this.metaDataForm.controls[field];
      return abstractControl.hasValidator(Validators.required);
    }
  }

  manageDetailsForm() {
    if (this.detailForm.disabled) {
      this.detailForm.enable({ emitEvent: false });
      this.detailForm.get('template')?.disable({ emitEvent: false });
      if (this.isHypervVm) {
        this.detailForm.get('mac_address').disable({ emitEvent: false });
      }
      this.detailForm.get('serial_number')?.value ? this.detailForm.get('serial_number').disable({ emitEvent: false }) : null;
      if (this.view.cloud.platform_type !== 'VMware' && this.view.cloud.platform_type !== 'ESXi') {
        this.detailForm.get('collector.uuid')?.disable({ emitEvent: false });
      }
    } else {
      this.detailForm.disable({ emitEvent: false });
    }
  }

  manageMetaDataForm() {
    if (this.metaDataForm.disabled) {
      this.metaDataForm.enable({ emitEvent: false });
      this.metaDataForm.get('available_memory')?.disable({ emitEvent: false });
      this.metaDataForm.get('used_memory')?.disable({ emitEvent: false });
      this.metaDataForm.get('available_storage')?.disable({ emitEvent: false });
      this.metaDataForm.get('used_storage')?.disable({ emitEvent: false });
      this.metaDataForm.get('last_updated')?.disable({ emitEvent: false });
    } else {
      this.metaDataForm.disable({ emitEvent: false });
    }
  }

  handleError(err: any) {
    this.detailFormErrors = this.detailService.resetDetailFormErrors();
    this.metaDataFormErrors = this.detailService.resetMetaDataFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.detailForm.controls) {
          if (typeof this.detailFormErrors[field] === 'string') {
            this.detailFormErrors[field] = err[field][0];
          } else {
            this.detailFormErrors[field][Object.keys(this.detailFormErrors[field])[0]] = err[field][0];
          }
        }
        if (field in this.metaDataForm.controls) {
          if (typeof this.metaDataFormErrors[field] === 'string') {
            this.metaDataFormErrors[field] = err[field][0];
          } else {
            this.metaDataFormErrors[field][Object.keys(this.metaDataFormErrors[field])[0]] = err[field][0];
          }
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submitDetailForm() {
    if (this.detailForm.invalid) {
      this.detailFormErrors = this.utilService.validateForm(this.detailForm, this.detailFormValidationMessages, this.detailFormErrors);
      this.detailForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.detailFormErrors = this.utilService.validateForm(this.detailForm, this.detailFormValidationMessages, this.detailFormErrors); });
    } else {
      this.spinner.start('main');
      let detailFormValue = this.detailForm.getRawValue();
      if (!detailFormValue.credentials_m2m) {
        detailFormValue.credentials_m2m = null;
      } else {
        detailFormValue.credentials_m2m = this.credentials.filter(c => detailFormValue.credentials_m2m.includes(c.uuid));
      }
      let obj = Object.assign({}, detailFormValue, this.detailService.buildMetaDataForm(_clone(this.view), this.deviceType).getRawValue(), this.detailService.buildLocationForm(_clone(this.view)).getRawValue());
      if (this.isHypervVm) {
        const hypervVmFields = { vm_id: this.view.vm_id, vm_name: this.view.vm_name, status: this.view.status, cluster: this.view.cluster }
        obj = Object.assign(obj, hypervVmFields);
      }
      this.detailService.updateDevice(this.deviceType, this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if ((obj.credentials && ((!this.view.credentials) || this.view.credentials.uuid != obj.credentials.uuid))
          || (obj.os_name && (this.view.os != obj.os_name)) || (obj.os && (this.view.os != obj.os))) {
          this.spinner.stop('main');
          this.refreshService.refreshData(1);
        } else {
          this.getDeviceDetails(true);
        }
        this.notification.success(new Notification('Device Updated Successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  submitMetaDataForm() {
    if (this.metaDataForm.invalid) {
      this.metaDataFormErrors = this.utilService.validateForm(this.metaDataForm, this.metaDataFormValidationMessages, this.metaDataFormErrors);
      this.metaDataForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.metaDataFormErrors = this.utilService.validateForm(this.metaDataForm, this.metaDataFormValidationMessages, this.metaDataFormErrors); });
    } else {
      this.spinner.start('main');
      let detailFormValue = this.detailService.buildDetailForm(_clone(this.view), this.deviceType).getRawValue();
      if (!detailFormValue.credentials_m2m) {
        detailFormValue.credentials_m2m = null;
      } else {
        if (this.isHypervVm) {
          detailFormValue.credentials_m2m = this.credentials.filter(c => detailFormValue.credentials_m2m.includes(c.uuid));
        }
      }
      let obj = Object.assign({}, detailFormValue, this.metaDataForm.getRawValue(), this.detailService.buildLocationForm(_clone(this.view)).getRawValue());
      if (this.isHypervVm) {
        const hypervVmFields = { vm_id: this.view.vm_id, vm_name: this.view.vm_name, status: this.view.status, cluster: this.view.cluster };
        obj = Object.assign(obj, hypervVmFields);
      }
      this.detailService.updateDevice(this.deviceType, this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getDeviceDetails(true);
        this.notification.success(new Notification('Device Updated Successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  syncSerialNumber() {
    this.detailService.syncSerialNumber(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: string) => {
      let serialNumber: string = res ? res : null;
      this.detailForm.get('serial_number').setValue(serialNumber);
    })
  }

  syncUptime() {
    this.detailService.syncUptime(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.detailForm.get('uptime').setValue(res);
    })
  }
}
