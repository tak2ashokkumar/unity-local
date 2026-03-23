import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, deviceDiscoveryMethodOptions, deviceEnvironmentOptions, deviceStatusOptions } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { PDUCRUDManufacturer, PDUCRUDModel, PDUCRUDPowerCircuit } from 'src/app/shared/pdu-crud/pdu-crud.type';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { PDU } from '../../../entities/pdus.type';
import { DataCenter } from '../../../tabs';
import { ZabbixDcPduDetailsService } from './zabbix-dc-pdu-details.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'zabbix-dc-pdu-details',
  templateUrl: './zabbix-dc-pdu-details.component.html',
  styleUrls: ['./zabbix-dc-pdu-details.component.scss'],
  providers: [ZabbixDcPduDetailsService]
})
export class ZabbixDcPduDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  dcId: string;
  
  view: PDU;
  device: DeviceTabData;
  
  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  manufacturers: Array<PDUCRUDManufacturer> = [];
  models: Array<PDUCRUDModel> = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  deviceEnvironmentOptions: string[] = deviceEnvironmentOptions;
  deviceStatusOptions: string[] = deviceStatusOptions;
  deviceDiscoveryMethodOptions: string[] = deviceDiscoveryMethodOptions;

  locationForm: FormGroup;
  locationFormErrors: any;
  locationFormValidationMessages: any;
  datacenter: DataCenter;
  cabinets: Array<CabinetFast> = [];
  powercircuits: Array<PDUCRUDPowerCircuit> = [];

  nonFieldErr: string = '';
  now: any;

  constructor(private detailService: ZabbixDcPduDetailsService,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private storageService: StorageService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.dcId = params.get('dcId'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    setInterval(() => { this.now = moment(); }, 1);
  }

  ngOnInit() {
    this.getDeviceDetails();
    this.getCollectors();
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDeviceDetails();
  }

  async getDeviceDetails() {
    this.spinner.start('main');
    this.manufacturers = [];
    this.powercircuits = [];
    this.cabinets = [];
    let dropdownData = await this.detailService.getDropdownData(this.dcId).pipe(takeUntil(this.ngUnsubscribe)).toPromise();
    this.manufacturers = _clone(dropdownData[0]);
    this.datacenter = _clone(dropdownData[1]);
    this.cabinets = _clone(dropdownData[2]);
    this.powercircuits = _clone(dropdownData[3]);
    this.detailService.getDeviceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
      this.buildForm();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
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

  getCollectors() {
    this.detailService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  buildForm() {
    this.detailForm = null;
    this.locationForm = null;
    setTimeout(() => {
      this.buildDetailForm();
      this.buildLocationForm();
      this.syncSerialNumber();
      this.syncUptime();
      this.spinner.stop('main');
    })
  }

  buildDetailForm() {
    this.detailForm = this.detailService.buildDetailForm(_clone(this.view));
    this.detailFormErrors = this.detailService.resetDetailFormErrors();
    this.detailFormValidationMessages = this.detailService.detailFormValidationMessages;
    if (status) {
      this.detailForm.get('availability_status').setValue(this.utilService.getDeviceAvailabilityStatus(status));
    } else {
      this.getDeviceData();
    }
    this.getModels(this.detailForm.get('manufacturer.id').value, false);
    this.detailForm.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getModels(val, true);
    });
    this.detailForm.disable({ emitEvent: false });
  }

  getDeviceData() {
    this.detailService.getDeviceData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.detailForm.get('availability_status').setValue(this.utilService.getDeviceAvailabilityStatus(res.device_data.status));
    })
  }

  buildLocationForm() {
    this.locationForm = this.detailService.buildLocationForm(_clone(this.view), this.datacenter);
    this.locationFormErrors = this.detailService.resetLocationFormErrors();
    this.locationFormValidationMessages = this.detailService.locationFormValidationMessages;

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

  manageLocationForm() {
    if (this.locationForm.disabled) {
      this.locationForm.enable({ emitEvent: false });
    } else {
      this.locationForm.disable({ emitEvent: false });
    }
  }

  handleError(err: any) {
    this.detailFormErrors = this.detailService.resetDetailFormErrors();
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
      let obj = Object.assign({}, this.detailForm.getRawValue(), this.detailService.buildLocationForm(_clone(this.view), this.datacenter).getRawValue());
      this.detailService.updateDevice(this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
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
      let obj = Object.assign({}, this.locationForm.getRawValue(), this.detailService.buildDetailForm(_clone(this.view)).getRawValue());
      this.detailService.updateDevice(this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
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
}
