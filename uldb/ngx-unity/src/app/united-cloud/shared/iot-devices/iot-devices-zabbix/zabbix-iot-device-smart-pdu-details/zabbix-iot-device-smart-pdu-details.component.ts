import { Component, OnDestroy, OnInit } from '@angular/core';
import { SmartPduType, ZabbixIotDeviceSmartPduDetailsService } from './zabbix-iot-device-smart-pdu-details.service';
import { Subject } from 'rxjs';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { cloneDeep as _clone } from 'lodash-es';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';

@Component({
  selector: 'zabbix-iot-device-smart-pdu-details',
  templateUrl: './zabbix-iot-device-smart-pdu-details.component.html',
  styleUrls: ['./zabbix-iot-device-smart-pdu-details.component.scss'],
  providers: [ZabbixIotDeviceSmartPduDetailsService]
})
export class ZabbixIotDeviceSmartPduDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  deviceId: string;
  device: DeviceTabData;
  view: SmartPduType;

  nonFieldErr: string = '';
  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  isDetailsFormOpen: boolean = true;
  isLocationFormOpen: boolean = true;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  locationForm: FormGroup;
  locationFormErrors: any;
  locationFormValidationMessages: any;
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];

  constructor(private svc: ZabbixIotDeviceSmartPduDetailsService,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,
    private utilService: AppUtilityService) {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
      if (this.deviceId) {
        this.spinner.start('main');
        this.getDeviceDetails();
        this.getCollectors();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getDeviceDetails();
  }

  async getDeviceDetails() {
    let dropdownData = await this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).toPromise();
    this.datacenters = _clone(dropdownData[0]);
    this.svc.getDeviceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.view = res;
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  getCollectors() {
    this.collectors = [];
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  buildForm() {
    this.detailForm = null;
    this.locationForm = null;
    setTimeout(() => {
      this.buildDetailsForm();
      this.buildLocationForm();
      this.spinner.stop('main');
    }, 0);
  }

  buildDetailsForm() {
    this.detailForm = this.svc.buildDetailForm(_clone(this.view));
    this.detailFormErrors = this.svc.resetDetailFormErrors();
    this.detailFormValidationMessages = this.svc.detailFormValidationMessages;
    this.detailForm.disable({ emitEvent: false });
  }

  buildLocationForm() {
    this.locationForm = this.svc.buildLocationForm(_clone(this.view));
    this.locationFormErrors = this.svc.resetLocationFormErrors();
    this.locationFormValidationMessages = this.svc.locationFormValidationMessages;

    this.getCabinets(this.locationForm.get('datacenter.uuid').value, false);

    this.locationForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getCabinets(val, true);
    });
    this.locationForm.disable({ emitEvent: false });
  }

  getCabinets(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.cabinets = [];
    this.svc.getCabinets(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res;
      if (patchValue) {
        this.locationForm.patchValue({ cabinet: { id: '' } });
      }
    });
  }

  manageDetailsForm() {
    if (this.detailForm.disabled) {
      this.detailForm.get('asset_tag').enable({ emitEvent: false });
      this.detailForm.get('description').enable({ emitEvent: false });
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

  toggleDetailsFormAccordion() {
    this.isDetailsFormOpen = !this.isDetailsFormOpen;
  }

  toggleLocationFormAccordion() {
    this.isLocationFormOpen = !this.isLocationFormOpen;
  }

  handleError(err: any) {
    this.detailFormErrors = this.svc.resetDetailFormErrors();
    this.locationFormErrors = this.svc.resetLocationFormErrors();
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
      this.spinner.start('main');
      let locationFormValue = this.svc.buildLocationForm(_clone(this.view)).getRawValue();
      let obj = Object.assign({}, this.detailForm.getRawValue(), locationFormValue);
      this.svc.updateDevice(this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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
      let detailFormValue = this.svc.buildDetailForm(_clone(this.view)).getRawValue();
      let obj = Object.assign({}, detailFormValue, this.locationForm.getRawValue());
      this.svc.updateDevice(this.view.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getDeviceDetails();
        this.notification.success(new Notification('Device Updated Successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

}
