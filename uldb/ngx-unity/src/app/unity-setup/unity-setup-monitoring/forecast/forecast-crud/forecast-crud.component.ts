import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ForecastCrudService, OPERATORS } from './forecast-crud.service';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { isString } from 'lodash-es';
import { DeviceTypesOptionsType } from 'src/app/shared/SharedEntityTypes/device-interface.type';
import { deviceTypesOptions } from 'src/app/app-shared-crud/device-interface-crud/device-interface-crud.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { devicesType, ZabbixAnomalyDetectionTriggerGraphItemsType } from '../../usm-anomaly-detection/usm-anomaly-detection-crud/usm-anomaly-detection-crud.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'forecast-crud',
  templateUrl: './forecast-crud.component.html',
  styleUrls: ['./forecast-crud.component.scss'],
  providers: [ForecastCrudService]
})
export class ForecastCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  forecastForm: FormGroup;
  forecastFormErrors: any;
  forecastValidationMessages: any;
  action: string = 'Create';
  itemId: string;
  credentialList: DeviceDiscoveryCredentials[] = [];
  forecastDetails: any;
  nonFieldErr: string = "";
  deviceTypes: Array<DeviceTypesOptionsType> = deviceTypesOptions;
  devices: devicesType[] = [];
  items: ZabbixAnomalyDetectionTriggerGraphItemsType[] = [];
  operators = OPERATORS;
  deviceData: any;

  deviceTypesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  devicesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  metricSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    selectionLimit: 1,
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private svc: ForecastCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private renderer: Renderer2,
    private element: ElementRef,
    private builder: FormBuilder,
    private storage: StorageService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.itemId = params.get('itemId');
      this.action = this.itemId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getMetadata();
  }

  getMetadata() {
    if (this.itemId) {
      this.deviceData = this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
      this.svc.getForecastDetails(this.itemId, this.deviceData.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        this.forecastDetails = res;
        this.buildForm();
      });
    } else {
      this.buildForm();
    }
  }

  buildForm() {
    this.forecastForm = this.svc.createForecastForm(this.forecastDetails);
    this.forecastFormErrors = this.svc.resetForecastFormErrors();
    this.forecastValidationMessages = this.svc.forecastFormValidationMessages;
    this.handleForecastSubscription();
    this.spinner.stop('main');
  }

  handleForecastSubscription() {
    if (this.forecastDetails) {
      this.forecastForm.get('analysis_time_frame').setValue(this.forecastDetails.analysis_time_frame[0], Validators.required);
      this.forecastForm.get('analysis_time_unit').setValue(this.forecastDetails.analysis_time_frame[1], Validators.required);
      this.forecastForm.get('projection_period').setValue(this.forecastDetails.projection_period[0], Validators.required);
      this.forecastForm.get('projection_unit').setValue(this.forecastDetails.projection_period[1], Validators.required);

      let mappingDevicesObj: { [key: string]: string[] } = {};
      mappingDevicesObj[this.deviceData.deviceType] = [];
      mappingDevicesObj[this.deviceData.deviceType].push(this.deviceData.uuid);

      this.svc.getGraphItems(mappingDevicesObj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.items = res;
        const matchedEntry = this.items.find(entry =>
          entry.device_data.find(d =>
            d.item_id == this.forecastDetails.selected_item_id
          )
        );
        this.forecastForm.get('metric').setValue(matchedEntry, [Validators.required]);
      }, (err: HttpErrorResponse) => {
        this.items = [];
        this.notification.error(new Notification('Failed to fetch Metrics data'));
        this.spinner.stop('main');
      })
    } else {
      this.forecastForm.get('device_types')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((deviceTypes: string[]) => {
        if (deviceTypes.length) {
          // this.forecastForm.get('ip_addresses').disable({ emitEvent: false });
          // this.forecastForm.get('ip_addresses').setValue('', { emitEvent: false });
          // this.selectedDeviceTypes = deviceTypes;
          this.devices = [];
          this.forecastForm.get('devices').setValue([], { emitEvent: false });
          // this.forecastForm.get('trigger_ids').setValue([], { emitEvent: false });
          this.getDevices(deviceTypes);
        } else {
          // this.forecastForm.get('ip_addresses').enable({ emitEvent: false });
          this.forecastForm.get('devices').setValue([], { emitEvent: false });
          // this.forecastForm.get('trigger_ids').setValue([], { emitEvent: false });
        }
      });
      this.forecastForm.get('devices')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((devices: devicesType[]) => {
        // this.triggers=this.forecastSvc.getTriggers(devices);
        if (devices.length) {
          this.items = [];
          this.getItems(devices);
        } else {
        }
      });
    }
    this.forecastForm.get('alerting')?.valueChanges.subscribe(enabled => {
      if (enabled) {
        this.forecastForm.addControl('threshold', new FormControl('', [Validators.required]));
        this.forecastForm.addControl('operator', new FormControl('', [Validators.required]));
        // this.handleAutoRemidiationSubscription();
      } else {
        this.forecastForm.removeControl('threshold');
        this.forecastForm.removeControl('operator');
      }
    });

  }

  // handleAutoRemidiationSubscription() {
  //   this.forecastForm.get('auto_remediation')?.valueChanges.subscribe(enabled => {
  //     if (enabled) {
  //       this.forecastForm.addControl('task', new FormControl('', [Validators.required]));
  //     } else {
  //       this.forecastForm.removeControl('task');
  //     }
  //   });
  // }

  getItems(devices: devicesType[]) {
    let mappingDevicesObj: { [key: string]: string[] } = {};
    for (let d = 0; d < devices.length; d++) {
      if (devices[d].device_type in mappingDevicesObj) {
        mappingDevicesObj[devices[d].device_type].push(devices[d].uuid);
      } else {
        mappingDevicesObj[devices[d].device_type] = [];
        mappingDevicesObj[devices[d].device_type].push(devices[d].uuid);
      }
    }
    this.svc.getGraphItems(mappingDevicesObj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.items = res;
      // this.buildTriggerRulesForm();
    }, (err: HttpErrorResponse) => {
      this.items = [];
      this.notification.error(new Notification('Failed to fetch Metrics data'));
      this.spinner.stop('main');
    })
  }

  getDevices(deviceTypes: string[]) {
    this.spinner.start('main');
    this.svc.getDevices(deviceTypes).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.devices = res;
      this.spinner.stop('main');
    });
  }

  confirmforecastCreate() {
    if (this.forecastForm.invalid) {
      this.forecastFormErrors = this.utilService.validateForm(this.forecastForm, this.forecastValidationMessages, this.forecastFormErrors);
      this.forecastForm.valueChanges
        .subscribe((data: any) => { this.forecastFormErrors = this.utilService.validateForm(this.forecastForm, this.forecastValidationMessages, this.forecastFormErrors); });
      return;
    } else {
      // this.spinner.start('main');
      const rawValues = this.forecastForm.getRawValue();
      if (this.forecastDetails) {
        rawValues.host = this.forecastDetails.host;
        rawValues.trigger_id = this.forecastDetails.trigger_id;
        rawValues.item_id = this.forecastDetails.item_id;
      }
      rawValues.analysis_time_frame = `${rawValues.analysis_time_frame}${rawValues.analysis_time_unit}`;
      rawValues.projection_period = `${rawValues.projection_period}${rawValues.projection_unit}`;
      delete rawValues.analysis_time_unit;
      delete rawValues.projection_unit;
      // rawValues.metric = rawValues.metric[0];
      this.svc.createForecast(rawValues, this.itemId).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.router.navigate(['../'], { relativeTo: this.route });
          if (this.itemId) {
            this.notification.success(new Notification('Forecast Updated successfully'));
          } else {
            this.notification.success(new Notification('Forecast Created successfully'));
          }
          this.goBack();
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.handleError(err);
          this.spinner.stop('main');
          if (this.itemId) {
            this.notification.error(new Notification('Forecast Update Failed'));
          } else {
            this.notification.error(new Notification('Forecast Create failed'));
          }
        });
    }
  }

  handleError(err: any) {
    if (err.error.non_field_errors) {
      this.nonFieldErr = err.error.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.forecastForm.controls) {
          this.forecastFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  // getCloudAccountDropdown(event: any) {
  //   this.forecastForm.get('metric').setValue(event);
  // }

  toggleStatus(status: boolean) {
    if (status) {
      this.forecastForm.get('alerting').setValue(true);
    } else {
      this.forecastForm.get('alerting').setValue(false);
    }
  }

  goBack() {
    if (this.itemId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }


}
