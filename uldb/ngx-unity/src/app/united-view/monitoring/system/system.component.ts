import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { from, Subject } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping, DeviceModelMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SystemMonitoringWidgetDevice } from './system-monitoring.type';
import { DateRange, DateRangeOptions, DEVICE_TYPES, SystemMonitoringWidgetDeviceTypeMapping, SystemMonitoringWidgetGraphViewData, SystemMonitoringWidgetViewData, SystemService } from './system.service';

/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};


@Component({
  selector: 'system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
  providers: [SystemService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },],
})
export class SystemComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  dateRangeFilterForm: FormGroup;
  dateRangeFilterFormErrors: any;
  dateRangeFilterFormValidationMessages: any;
  dateRange: DateRange;
  dateRangeOptions = DateRangeOptions;
  now: any;


  widgets: Array<SystemMonitoringWidgetViewData> = [];
  selectedWidget: SystemMonitoringWidgetViewData = new SystemMonitoringWidgetViewData();
  action: 'Add' | 'Edit';
  deviceTypes: Array<{ type: string, mapping: DeviceMapping, modelMapping: DeviceModelMapping }> = DEVICE_TYPES;
  devices: Array<SystemMonitoringWidgetDevice> = [];
  deviceGraphs: SystemMonitoringWidgetGraphViewData[] = [];

  @ViewChild('widgetFormRef') widgetFormRef: ElementRef;
  widgetFormModelRef: BsModalRef;
  widgetForm: FormGroup;
  widgetFormErrors: any;
  widgetFormValidationMessages: any;
  nonFieldErr: string = '';

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  mySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  constructor(private viewService: SystemService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService, ) {
    setInterval(() => { this.now = moment(); }, 1);
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getWidgets();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getWidgets();
  }

  getWidgets() {
    this.viewService.getWidgets().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.widgets = this.viewService.convertToViewData(data);
      if (this.widgets.length) {
        this.buildForm();
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  buildForm() {
    this.dateRange = this.viewService.getDateRangeByPeriod(this.dateRangeOptions.LAST_24_HOURS);
    this.dateRangeFilterForm = this.viewService.buildDateRangeFilterForm(this.dateRange);
    this.dateRangeFilterFormErrors = this.viewService.resetDateRangeFilterFormErrors();
    this.dateRangeFilterFormValidationMessages = this.viewService.dateRangeFilterFormValidationMessages;

    this.dateRangeFilterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: DateRangeOptions) => {
      this.dateRange = this.viewService.getDateRangeByPeriod(val);
      if (this.dateRange) {
        this.dateRangeFilterForm.get('from').patchValue(new Date(this.dateRange.from))
        this.dateRangeFilterForm.get('to').patchValue(new Date(this.dateRange.to))
      }
      if (val == this.dateRangeOptions.CUSTOM) {
        this.dateRangeFilterForm.get('from').enable();
        this.dateRangeFilterForm.get('to').enable();
      } else {
        this.dateRangeFilterForm.get('from').disable();
        this.dateRangeFilterForm.get('to').disable();
      }
      this.dateRangeFilterForm.get('from').updateValueAndValidity();
      this.dateRangeFilterForm.get('to').updateValueAndValidity();
    });
    this.getWidgetGraphImages();
  }

  getWidgetGraphImages() {
    from(this.widgets).pipe(
      map((e) => this.getGraphImages(e, e.graphs)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getGraphImages(widget: SystemMonitoringWidgetViewData, graphs: SystemMonitoringWidgetGraphViewData[]) {
    from(graphs).pipe(mergeMap(g => this.viewService.getGraphImages(widget.deviceType, widget.device, g, this.dateRangeFilterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let index = graphs.map(g => g.name).indexOf(key);
          if (res.get(key)) {
            widget.graphs[index].image = res.get(key);
            widget.graphs[index].isLoaded = true;
          } else {
            widget.graphs[index].image = null;
            widget.graphs[index].isLoaded = true;
          }
        }
      )
  }

  onSubmitDateRangeFilterForm() {
    if (this.dateRangeFilterForm.invalid) {
      this.dateRangeFilterFormErrors = this.utilService.validateForm(this.dateRangeFilterForm, this.dateRangeFilterFormValidationMessages, this.dateRangeFilterFormErrors);
      this.dateRangeFilterForm.valueChanges
        .subscribe((data: any) => { this.dateRangeFilterFormErrors = this.utilService.validateForm(this.dateRangeFilterForm, this.dateRangeFilterFormValidationMessages, this.dateRangeFilterFormErrors); });
      return;
    } else {
      this.widgets.map(wd => {
        wd.graphs.map(wdg => {
          wdg.image = null;
          wdg.isLoaded = false;
        })
      })
      this.getWidgetGraphImages();
    }
  }

  getDevices(deviceType: SystemMonitoringWidgetDeviceTypeMapping) {
    this.viewService.getDevices(deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.devices = data;
    });
  }

  getDeviceGraphNames(deviceType: SystemMonitoringWidgetDeviceTypeMapping, device: SystemMonitoringWidgetDevice) {
    this.viewService.getDeviceGraphNames(deviceType, device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceGraphs = data;
    });
  }

  buildAddEditForm(widget?: SystemMonitoringWidgetViewData) {
    if (widget) {
      this.widgetForm = this.viewService.buildWidgetForm(widget, this.devices, this.deviceGraphs);
    } else {
      this.widgetForm = this.viewService.buildWidgetForm();
    }
    this.widgetFormErrors = this.viewService.resetWidgetFormErrors();
    this.widgetFormValidationMessages = this.viewService.widgetFormValidationMessages;
    this.widgetForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: SystemMonitoringWidgetDeviceTypeMapping) => {
      this.devices = [];
      this.deviceGraphs = [];
      if (this.widgetForm.controls.graphs) {
        this.widgetForm.get('graphs').reset();
      }
      this.getDevices(<SystemMonitoringWidgetDeviceTypeMapping>val);
      if (!this.widgetForm.controls.device) {
        this.widgetForm.addControl('device', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        this.widgetForm.get('device').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: SystemMonitoringWidgetDevice) => {
          this.deviceGraphs = [];
          if (this.widgetForm.controls.graphs) {
            this.widgetForm.get('graphs').reset();
          } else {
            this.widgetForm.addControl('graphs', new FormControl([], [Validators.required]));
          }
          this.getDeviceGraphNames(<SystemMonitoringWidgetDeviceTypeMapping>this.widgetForm.get('device_type').value, val);
        });
      }
    });
    this.widgetFormModelRef = this.modalService.show(this.widgetFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.widgetFormErrors = this.viewService.resetWidgetFormErrors();
    if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.widgetForm.controls) {
          this.widgetFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.widgetFormModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmWidgetCreate() {
    if (this.widgetForm.invalid) {
      this.widgetFormErrors = this.utilService.validateForm(this.widgetForm, this.widgetFormValidationMessages, this.widgetFormErrors);
      this.widgetForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.widgetFormErrors = this.utilService.validateForm(this.widgetForm, this.widgetFormValidationMessages, this.widgetFormErrors); });
    } else {
      this.spinner.start('main');
      if (this.selectedWidget) {
        this.viewService.updateWidget(this.selectedWidget.widgetId, this.widgetForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.widgetFormModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Widget updated successfully.'));
          this.refreshData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.viewService.createWidget(this.widgetForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.widgetFormModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Widget created successfully.'));
          this.refreshData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  addWidget() {
    this.action = 'Add';
    this.selectedWidget = null;
    this.nonFieldErr = '';
    this.buildAddEditForm();
  }

  editWidget(view: SystemMonitoringWidgetViewData) {
    this.action = 'Edit';
    this.selectedWidget = view;
    this.nonFieldErr = '';
    this.devices = [];
    this.deviceGraphs = [];

    this.spinner.start('main');
    this.viewService.getDevicesAndGraphNames(view).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devices = res[0];
      this.deviceGraphs = res[1];
      this.spinner.stop('main');
      this.buildAddEditForm(view);
    }, err => {
      this.spinner.stop('main');
    });
  }

  deleteWidget(view: SystemMonitoringWidgetViewData) {
    this.selectedWidget = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmDeleteModalRef.hide();
    this.spinner.start('main');
    this.viewService.deleteWidget(this.selectedWidget.widgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Widget deleted successfully.'));
      this.refreshData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Widget could not be deleted!!'));
    });
  }



}
