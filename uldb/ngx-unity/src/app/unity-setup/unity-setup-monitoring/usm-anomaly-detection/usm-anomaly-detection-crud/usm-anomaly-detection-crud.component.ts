import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsmAnomalyDetectionCrudService, ZABBIX_TRIGGER_FUNCTIONS, ZABBIX_TRIGGER_OPERATORS, ZabbixTriggerFunction, ZabbixTriggerOperator, deviceTypesOptions, units } from './usm-anomaly-detection-crud.service';
import { Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { DeviceTypesOptionsType, ZabbixAnomalyDetectionTriggerGraphItemsType, ZabbixAnomalyDetectionTriggerRuleCRUDType, ZabbixAnomalyDetectionTriggerType, devicesType } from './usm-anomaly-detection-crud.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'usm-anomaly-detection-crud',
  templateUrl: './usm-anomaly-detection-crud.component.html',
  styleUrls: ['./usm-anomaly-detection-crud.component.scss'],
  providers: [UsmAnomalyDetectionCrudService]
})
export class UsmAnomalyDetectionCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  action: 'Create' | 'Edit';
  anomalyDetctionTriggerId: string;
  items: ZabbixAnomalyDetectionTriggerGraphItemsType[] = [];
  nonFieldErr: string = '';
  deviceTypes: Array<DeviceTypesOptionsType> = deviceTypesOptions;
  device: DeviceTabData;
  devices: devicesType[] = [];
  triggerDetails: ZabbixAnomalyDetectionTriggerType;

  triggerForm: FormGroup;
  triggerFormErrors: any;
  triggerFormValidationMessages: any;

  triggerRulesForm: FormGroup;
  triggerRulesFormErrors: any;
  triggerRulesFormValidationMessages: any;
  zabbixTriggerFunctions: ZabbixTriggerFunction[] = ZABBIX_TRIGGER_FUNCTIONS;
  zabbixTriggerFunctionUnits: string[] = ['now/h', 'now/d'];
  zabbixTriggerOperators: ZabbixTriggerOperator[] = ZABBIX_TRIGGER_OPERATORS;
  detectionPeriodUnits: LabelValueType[] = _clone(units);
  seasonUnits: LabelValueType[] = _clone(units);

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

  constructor(private crudSvc: UsmAnomalyDetectionCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.anomalyDetctionTriggerId = params.get('anomalyDetctionTriggerId');
      this.action = this.anomalyDetctionTriggerId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    setTimeout(() => {
      if (this.anomalyDetctionTriggerId) {
        this.getTriggerDetails();
      } else {
        this.buildTriggerForm();
        this.buildTriggerRulesForm();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  getTriggerDetails() {
    this.crudSvc.getTriggerDetails(this.device, this.anomalyDetctionTriggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.triggerDetails = res;
      this.getDevices(this.triggerDetails.device_types);
      setTimeout(() => {
        this.buildTriggerForm();
        this.buildTriggerRulesForm();
      }, 2600);
    });
  }

  buildTriggerForm() {
    this.triggerForm = this.crudSvc.createTriggerForm(this.triggerDetails, this.anomalyDetctionTriggerId);
    this.triggerFormErrors = this.crudSvc.resetTriggerFormErrors();
    this.triggerFormValidationMessages = this.crudSvc.triggerFormValidationMessages;
    this.triggerForm.get('device_types').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((deviceTypes: string[]) => {
      this.devices = [];
      this.triggerForm.get('devices').setValue([], { emitEvent: false });
      this.getDevices(deviceTypes);
    });
    this.triggerForm.get('devices').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((devices: devicesType[]) => {
      this.items = [];
      this.getItems(devices);
    });
    if (this.anomalyDetctionTriggerId) {
      let devices = (<devicesType[]>this.triggerForm.get('devices').value).map((device) => device.uuid);
      this.triggerForm.get('devices').setValue(this.devices.filter((device) => devices.includes(device.uuid)));
      this.triggerForm.get('devices').disable({ emitEvent: false });
    }
    this.spinner.stop('main');
  }

  getDevices(deviceTypes: string[]) {
    this.crudSvc.getDevices(deviceTypes).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.devices = res;
    });
  }

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
    this.crudSvc.getGraphItems(mappingDevicesObj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.items = res;
      // this.buildTriggerRulesForm();
    }, (err: HttpErrorResponse) => {
      this.items = [];
      this.notification.error(new Notification('Failed to fetch Metrics data'));
      this.spinner.stop('main');
    })
  }

  buildTriggerRulesForm(rule?: ZabbixAnomalyDetectionTriggerRuleCRUDType) {
    // if (!this.items.length) {
    //   // this.notification.error(new Notification('Items are not available to add rule.'));
    //   return;
    // }
    this.triggerRulesForm = this.crudSvc.createTriggerRulesForm(rule);
    this.triggerRulesFormErrors = this.crudSvc.resetTriggerRulesFormErrors();
    this.triggerRulesFormValidationMessages = this.crudSvc.triggerRulesFormValidationMessages;
  }

  confirmTriggerRuleCreate() {
    if (this.triggerRulesForm.invalid) {
      this.triggerRulesFormErrors = this.utilService.validateForm(this.triggerRulesForm, this.triggerRulesFormValidationMessages, this.triggerRulesFormErrors);
      this.triggerRulesForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.triggerRulesFormErrors = this.utilService.validateForm(this.triggerRulesForm, this.triggerRulesFormValidationMessages, this.triggerRulesFormErrors); });
    } else {
      let obj: any = Object.assign({}, this.triggerRulesForm.getRawValue());
      const temp: string = `${obj.item_key?.name}: Anomaly Detection ${obj.function_value ? 'for '.concat(obj.function_value).concat(' ').concat(obj.function_unit).concat(' ') : ''}${obj.operator?.name} ${obj.value}`;
      this.triggerForm.get('problem_expression').setValue(temp);

      obj.function = 'trendstl';
      obj.item_key = obj.item_key;
      obj.operator = obj.operator?.key;
      obj.default = 'last';
      if (this.triggerForm.controls.rules) {
        this.triggerForm.get('rules').patchValue(obj);
        this.triggerForm.get('rules').updateValueAndValidity();
      } else {
        this.triggerForm.addControl('rules', new FormControl(obj));
      }
    }
  }

  confirmTriggerCreate() {
    if (this.triggerForm.invalid) {
      this.triggerFormErrors = this.utilService.validateForm(this.triggerForm, this.triggerFormValidationMessages, this.triggerFormErrors);
      this.triggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.triggerFormErrors = this.utilService.validateForm(this.triggerForm, this.triggerFormValidationMessages, this.triggerFormErrors); });
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.triggerForm.getRawValue());
      if ('rules' in obj) {
        obj.rules.detect_period = obj.rules?.detect_period_value?.concat(obj.rules?.detect_period_unit);
        obj.rules.season = obj.rules?.season_value?.concat(obj.rules?.season_unit);
        delete obj.rules?.detect_period_value;
        delete obj.rules?.detect_period_unit;
        delete obj.rules?.season_value;
        delete obj.rules?.season_unit;
      }
      if (this.anomalyDetctionTriggerId) {
        this.crudSvc.updateTrigger(this.device, obj, this.anomalyDetctionTriggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Trigger updated Successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createTrigger(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Triggers are being created.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    this.triggerFormErrors = this.crudSvc.resetTriggerFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.triggerForm.controls) {
          this.triggerFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goBack() {
    if (this.anomalyDetctionTriggerId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
