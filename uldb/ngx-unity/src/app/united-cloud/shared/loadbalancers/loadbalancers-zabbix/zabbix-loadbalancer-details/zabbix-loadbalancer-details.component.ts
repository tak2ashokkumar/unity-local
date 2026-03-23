import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping, deviceDiscoveryMethodOptions, deviceEnvironmentOptions, deviceStatusOptions } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceInterfaceCrudService } from 'src/app/shared/device-interface-crud/device-interface-crud.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceFast } from 'src/app/shared/SharedEntityTypes/device-response.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { LoadBalancerCRUDManufacturer, LoadBalancerCRUDModel } from '../../../entities/loadbalancer-crud.type';
import { LoadBalancer } from '../../../entities/loadbalancer.type';
import { ZabbixLoadbalancerDetailsService } from './zabbix-loadbalancer-details.service';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
import { CredentialMap } from 'src/app/app-constants';

@Component({
  selector: 'zabbix-loadbalancer-details',
  templateUrl: './zabbix-loadbalancer-details.component.html',
  styleUrls: ['./zabbix-loadbalancer-details.component.scss'],
  providers: [ZabbixLoadbalancerDetailsService]
})
export class ZabbixLoadbalancerDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  scrollStrategy: ScrollStrategy;

  view: LoadBalancer;
  device: DeviceTabData;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  manufacturers: Array<LoadBalancerCRUDManufacturer> = [];
  models: Array<LoadBalancerCRUDModel> = [];
  credentials: UnityCredentialsFast[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  metaDataForm: FormGroup;
  metaDataFormErrors: any;
  metaDataFormValidationMessages: any;

  locationForm: FormGroup;
  locationFormErrors: any;
  locationFormValidationMessages: any;
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  pdus: Array<DeviceFast> = [];

  deviceEnvironmentOptions: string[] = deviceEnvironmentOptions;
  deviceStatusOptions: string[] = deviceStatusOptions;
  deviceDiscoveryMethodOptions: string[] = deviceDiscoveryMethodOptions;

  nonFieldErr: string = '';
  now: any;

  credentialMap = CredentialMap;

  cloudSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true
  };

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

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all clouds',
    uncheckAll: 'Unselect all',
    checked: 'cloud',
    checkedPlural: 'clouds',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select cloud',
    allSelected: 'All clouds selected',
  };

  constructor(private detailService: ZabbixLoadbalancerDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private readonly sso: ScrollStrategyOptions,
    private storageService: StorageService,
    private interfaceCrudSvc: DeviceInterfaceCrudService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
      if (this.deviceId) {
        this.spinner.start('main');
        this.getCollectors();
        this.getDeviceDetails();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    setInterval(() => { this.now = moment(); }, 1);
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getDeviceDetails();
  }

  async getDeviceDetails() {
    this.manufacturers = [];
    this.datacenters = [];
    let dropdownData = await this.detailService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).toPromise();
    this.manufacturers = _clone(dropdownData[0]);
    this.datacenters = _clone(dropdownData[1]);
    this.detailService.getDeviceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
      this.getCredentials();
      this.storageService.put('device', { name: res.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: res.monitoring.configured }, StorageType.SESSIONSTORAGE);
      this.buildForm();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
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

  getModels(manufacturer: string, patchValue: boolean) {
    this.models = [];
    this.detailService.getModels(manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.models = res;
      if (patchValue) {
        this.detailForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getCabinets(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.cabinets = [];
    this.detailService.getCabinets(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res;
      if (patchValue) {
        this.locationForm.patchValue({ cabinet: { id: '' } });
      }
    });
  }

  getPrivateClouds(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.privateclouds = [];
    this.detailService.getPrivateClouds(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds = res;
      if (patchValue) {
        this.locationForm.patchValue({ cloud: [] });
      } else {
        let clouds = (<DeviceCRUDPrivateCloudFast[]>this.locationForm.get('cloud').value).map(c => c.uuid);
        this.locationForm.get('cloud').setValue(this.privateclouds.filter(pc => clouds.includes(pc.uuid)));
      }
    });
  }

  getPDUs() {
    this.pdus = [];
    this.detailService.getPDUs().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.pdus = res;
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
      this.syncLogicalSystem();
      this.syncResourcePool();
      this.spinner.stop('main');
    })
  }

  buildDetailForm() {
    this.detailForm = this.detailService.buildDetailForm(_clone(this.view));
    this.detailFormErrors = this.detailService.resetDetailFormErrors();
    this.detailFormValidationMessages = this.detailService.detailFormValidationMessages;
    let status = this.detailForm.get('availability_status').value;
    if (status) {
      this.detailForm.get('availability_status').setValue(this.utilService.getDeviceAvailabilityStatus(status));
    } else {
      this.getDeviceData();
    }
    this.getModels(this.detailForm.get('manufacturer').value, false);
    this.detailForm.get('manufacturer').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getModels(val, true);
    });
    this.detailForm.get('credentials_m2m').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      if (val.length) {
        const credentialType = [... new Set(this.credentials.filter(credential => val.includes(credential.uuid)).map(c => c.connection_type))].join(', ');
        this.detailForm.get('credentials_type').setValue(credentialType ? credentialType : '');
      } else {
        this.detailForm.get('credentials_type').setValue('');
      }
    });
    this.detailForm.disable({ emitEvent: false });
  }

  getDeviceData() {
    this.detailService.getDeviceData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.detailForm.get('availability_status').setValue(this.utilService.getDeviceAvailabilityStatus(res.device_data.status));
    })
  }

  buildMetaDataForm() {
    this.metaDataForm = this.detailService.buildMetaDataForm(_clone(this.view));
    this.metaDataFormErrors = this.detailService.resetMetaDataFormErrors();
    this.metaDataFormValidationMessages = this.detailService.metaDataFormValidationMessages;
    this.metaDataForm.disable({ emitEvent: false });
  }

  buildLocationForm() {
    this.locationForm = this.detailService.buildLocationForm(_clone(this.view));
    this.locationFormErrors = this.detailService.resetLocationFormErrors();
    this.locationFormValidationMessages = this.detailService.locationFormValidationMessages;
    this.getCabinets(this.locationForm.get('datacenter.uuid').value, false);
    this.getPrivateClouds(this.locationForm.get('datacenter.uuid').value, false);

    this.locationForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getCabinets(val, true);
      this.getPrivateClouds(val, true);
    });

    this.locationForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.locationForm.get('position').setValue('');
      if (val) {
        this.locationForm.get('position').enable();
      } else {
        this.locationForm.get('position').disable();
      }
    });
    this.locationForm.disable({ emitEvent: false });
  }

  manageDetailsForm() {
    if (this.detailForm.disabled) {
      this.detailForm.enable({ emitEvent: false });
    } else {
      this.detailForm.disable({ emitEvent: false });
    }
  }

  manageMetaDataForm() {
    if (this.metaDataForm.disabled) {
      this.metaDataForm.enable({ emitEvent: false });
    } else {
      this.metaDataForm.disable({ emitEvent: false });
    }
  }

  manageLocationForm() {
    if (this.locationForm.disabled) {
      this.locationForm.enable({ emitEvent: false });
    } else {
      this.locationForm.disable({ emitEvent: false });
    }
  }

  handleError(err: any) {
    this.detailFormErrors = this.detailService.resetDetailFormErrors();
    this.metaDataFormErrors = this.detailService.resetMetaDataFormErrors();
    this.locationFormErrors = this.detailService.resetLocationFormErrors();
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
        if (field in this.locationForm.controls) {
          if (typeof this.locationFormErrors[field] === 'string') {
            this.locationFormErrors[field] = err[field][0];
          } else {
            this.locationFormErrors[field][Object.keys(this.locationFormErrors[field])[0]] = err[field][0];
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
      let obj = Object.assign({}, detailFormValue, this.detailService.buildMetaDataForm(_clone(this.view)).getRawValue(), this.detailService.buildLocationForm(_clone(this.view)).getRawValue());
      this.detailService.updateDevice(this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getDeviceDetails();
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
      let detailFormValue = this.detailService.buildDetailForm(_clone(this.view)).getRawValue();
      if (!detailFormValue.credentials_m2m) {
        detailFormValue.credentials_m2m = null;
      }
      let obj = Object.assign({}, detailFormValue, this.metaDataForm.getRawValue(), this.detailService.buildLocationForm(_clone(this.view)).getRawValue());
      this.detailService.updateDevice(this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getDeviceDetails();
        this.notification.success(new Notification('Device Updated Successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  submitLocationForm() {
    if (this.locationForm.invalid) {
      this.locationFormErrors = this.utilService.validateForm(this.locationForm, this.locationFormValidationMessages, this.locationFormErrors);
      this.locationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.locationFormErrors = this.utilService.validateForm(this.locationForm, this.locationFormValidationMessages, this.locationFormErrors); });
    } else {
      this.spinner.start('main');
      let detailFormValue = this.detailService.buildDetailForm(_clone(this.view)).getRawValue();
      if (!detailFormValue.credentials_m2m) {
        detailFormValue.credentials_m2m = null;
      }
      let obj = Object.assign({}, detailFormValue, this.detailService.buildMetaDataForm(_clone(this.view)).getRawValue(), this.locationForm.getRawValue());
      this.detailService.updateDevice(this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getDeviceDetails();
        this.notification.success(new Notification('Device Updated Successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  syncSerialNumber() {
    this.detailService.syncSerialNumber(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: string) => {
      let serialNumber: string = res ? res : '';
      this.detailForm.get('serial_number').setValue(serialNumber);
    })
  }

  syncUptime() {
    this.detailService.syncUptime(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.detailForm.get('uptime').setValue(res);
    })
  }

  syncLogicalSystem() {
    this.detailService.syncLogicalSystem(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // this.detailForm.get('uptime').setValue(res);
    })
  }

  syncResourcePool() {
    this.detailService.syncResourcePool(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // this.detailForm.get('uptime').setValue(res);
    })
  }
}