import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { from, Subject } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping, DeviceModelMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DEVICE_TYPES, PerformanceService, PerformanceWidgetGraphViewData, PerformanceWidgetViewData, PerformanceWidgetDeviceTypeMapping } from './performance.service';
import { MonitoringPerformanceWidgetDevice } from './performance.type';

@Component({
  selector: 'performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss'],
  providers: [PerformanceService]
})
export class PerformanceComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  widgets: Array<PerformanceWidgetViewData> = [];
  selectedWidget: PerformanceWidgetViewData = new PerformanceWidgetViewData();
  action: 'Add' | 'Edit';
  deviceTypes: Array<{ type: string, mapping: DeviceMapping, modelMapping: DeviceModelMapping }> = DEVICE_TYPES;
  devices: Array<MonitoringPerformanceWidgetDevice> = [];
  deviceGraphs: PerformanceWidgetGraphViewData[] = [];

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
    dynamicTitleMaxItems: 3,
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

  constructor(private viewService: PerformanceService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService, ) { }

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
      this.getWidgetGraphImages();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  getWidgetGraphImages() {
    from(this.widgets).pipe(
      map((e) => this.getGraphImages(e, e.graphs)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getGraphImages(widget: PerformanceWidgetViewData, graphs: PerformanceWidgetGraphViewData[]) {
    from(graphs).pipe(mergeMap(g => this.viewService.getGraphImages(widget.deviceType, widget.device, g).pipe(takeUntil(this.ngUnsubscribe))))
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

  getDevices(deviceType: PerformanceWidgetDeviceTypeMapping) {
    this.viewService.getDevices(deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.devices = data;
    });
  }

  getDeviceGraphNames(deviceType: PerformanceWidgetDeviceTypeMapping, device: MonitoringPerformanceWidgetDevice) {
    this.viewService.getDeviceGraphNames(deviceType, device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.deviceGraphs = data;
    });
  }

  buildAddEditForm(widget?: PerformanceWidgetViewData) {
    if (widget) {
      this.widgetForm = this.viewService.buildWidgetForm(widget, this.devices, this.deviceGraphs);
    } else {
      this.widgetForm = this.viewService.buildWidgetForm();
    }
    this.widgetFormErrors = this.viewService.resetWidgetFormErrors();
    this.widgetFormValidationMessages = this.viewService.widgetFormValidationMessages;
    this.widgetForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: PerformanceWidgetDeviceTypeMapping) => {
      this.devices = [];
      this.deviceGraphs = [];
      this.widgetForm.get('graphs').reset();
      this.getDevices(<PerformanceWidgetDeviceTypeMapping>val);
    });
    this.widgetForm.get('device').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: MonitoringPerformanceWidgetDevice) => {
      this.deviceGraphs = [];
      this.widgetForm.get('graphs').reset();
      this.getDeviceGraphNames(<PerformanceWidgetDeviceTypeMapping>this.widgetForm.get('device_type').value, val);
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

  editWidget(view: PerformanceWidgetViewData) {
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

  deleteWidget(view: PerformanceWidgetViewData) {
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
