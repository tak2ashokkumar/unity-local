import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { isString } from 'lodash';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IPageInfo } from 'ngx-virtual-scroller';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { customDateRangeOptions, CustomDropdownOptions, deviceTypes, refreshIntervals, widgetCategories } from '../app-dashboard.service';
import { AppDashboardListType } from '../app-dashboard.type';
import { AppDashboardCrudService, AppDashboardWidgetCategoryOptions, MetricesMappingViewData } from './app-dashboard-crud.service';
import { DashboardDevice } from './app-dashboard-crud.type';

@Component({
  selector: 'app-dashboard-crud',
  templateUrl: './app-dashboard-crud.component.html',
  styleUrls: ['./app-dashboard-crud.component.scss'],
  providers: [AppDashboardCrudService]
})
export class AppDashboardCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  viewId: string;
  viewData: AppDashboardListType;

  detailsForm: FormGroup;
  detailsFormErrors: any;
  detailsFormValidationMessages: any;

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;
  refreshIntervals: any[] = refreshIntervals;
  timeframeDropdownOptions: CustomDateRangeType[] = customDateRangeOptions;
  defaultTimeFrameSelected: string = customDateRangeOptions[0]?.value;

  dashboardWidgets: any[] = [];
  widgetCriteria: SearchCriteria;
  selectedDashboardWidget: any;
  @ViewChild('confirmWidgetDeleteRef') confirmWidgetDeleteRef: ElementRef;
  modalRef: BsModalRef;

  widgetForm: FormGroup;
  widgetFormErrors: any;
  widgetFormValidationMessages: any;
  widgetCategories: AppDashboardWidgetCategoryOptions[] = widgetCategories;
  widgetGroupByOptions: AppDashboardWidgetCategoryOptions[] = [];
  widgetGroupByFilterOptions: string[] = [];
  showWidgetGroupByFilter: boolean = false;
  customDropdownOptions = CustomDropdownOptions;
  widgetGroupByFilterSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };
  widgetGroupByFilterTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    checked: 'filter',
    checkedPlural: 'filters',
    defaultTitle: 'Select filters',
    allSelected: 'All filters',
  };

  activeForm: string = 'detailsForm';
  nonFieldErr: string = '';

  deviceList: Array<DashboardDevice> = [];
  infiniteDeviceList: Array<DashboardDevice> = [];
  selectedDevice: DashboardDevice;
  infiniteMetricList: Array<any> = [];
  deviceCount: number = 0;
  // widgetDetails: CustomDashboardWidget = null;
  metricesToBeAdded: any[] = [];
  metricesToBeRemoved: any[] = [];
  previousIndex: number;
  metricesList: Array<any> = [];
  selectedMetricesList: Array<any> = [];
  isDeviceBottomLoader: boolean = false;
  isDeviceLoader: boolean = false;
  deviceCurrentCriteria: SearchCriteria;
  isDeviceScrollDown: boolean = false;
  isMetricesBottomLoader: boolean = false;
  isMetricLoader: boolean = false;
  metricCurrentCriteria: SearchCriteria;
  isMetricScrollDown: boolean = false;
  metricsCount: number = 0;
  metricesMappingForm: FormGroup;
  metricesMappingViewData: MetricesMappingViewData[] = [];
  isMetricesMappingInvalid: boolean = false;
  deviceTypeList: Array<{ name: string, displayName: string }> = deviceTypes;
  customDateRange: any;
  customDateRangeValue: any = 'last_24_hours';
  constructor(private svc: AppDashboardCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private modalSvc: BsModalService,) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.viewId = params.get('id');
    });
    this.widgetCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
    this.deviceCurrentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TWENTY };
    this.metricCurrentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TWENTY, params: [{ device_type: '', device_uuid: '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.viewId) {
      this.getViewDetails();
    } else {
      this.manageActiveForm('detailsForm');
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onDeviceSearch(event: string) {
    this.infiniteDeviceList = [];
    this.isDeviceLoader = true;
    this.deviceCount = 0;
    this.deviceCurrentCriteria.searchValue = event;
    this.deviceCurrentCriteria.pageNo = 1;
    this.getDevices(this.metricesMappingForm.get('device_type').value, true);
  }

  onMetricesSearch(event: string) {
    if (!this.selectedDevice) {
      return;
    }
    this.infiniteMetricList = [];
    this.metricsCount = 0;
    this.isMetricLoader = true;
    this.metricCurrentCriteria.searchValue = event;
    this.metricCurrentCriteria.pageNo = 1;
    this.getMetrices(this.metricesMappingForm.get('device_type').value, this.selectedDevice.uuid);
  }

  getViewDetails() {
    this.svc.getViewDetails(this.viewId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = res;
      this.defaultTimeFrameSelected = this.viewData.timeframe;
      this.getDashboardWidgets();
      this.manageActiveForm('detailsForm');
    }, err => {
      this.viewData = null;
      this.manageActiveForm('detailsForm');
    });
  }

  getDevices(deviceType: string, metricesMapping?: boolean) {
    this.isDeviceBottomLoader = this.isDeviceLoader ? false : true;
    this.svc.getDevicesByDeviceType(deviceType, metricesMapping, this.deviceCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceCount = metricesMapping ? (res as PaginatedResult<DashboardDevice>).count : 0;
      if (deviceType == 'baremetal') {
        // this.deviceList = this.deviceList.concat(res.map(data => data.server));
        this.deviceList = metricesMapping ? (res as PaginatedResult<DashboardDevice>).results.map(data => data.server) : (res as DashboardDevice[]).map(data => data.server);
      } else {
        // this.deviceList = this.deviceList.concat(res);
        this.deviceList = metricesMapping ? (res as PaginatedResult<DashboardDevice>).results : (res as DashboardDevice[]);
      }
      this.infiniteDeviceList = this.infiniteDeviceList.concat(this.deviceList);
      this.isDeviceLoader = false;
      this.isDeviceBottomLoader = false;
    }, (err: HttpErrorResponse) => {
      this.isDeviceLoader = false;
      this.isDeviceBottomLoader = false;
    });
  }

  fetchMoreDevices(event: IPageInfo) {
    if ((this.infiniteDeviceList.length % this.deviceCurrentCriteria.pageSize != 0) || event.endIndex !== this.infiniteDeviceList.length - 1) {
      return;
    }
    this.deviceCurrentCriteria.pageNo = this.infiniteDeviceList.length / this.deviceCurrentCriteria.pageSize + 1;
    this.metricesMappingForm.get('device_type').value && this.getDevices(this.metricesMappingForm.get('device_type').value, true);
  }

  getMetrices(deviceType: string, deviceId: string) {
    this.isMetricesBottomLoader = this.isMetricLoader ? false : true;
    this.svc.getMetricesByDevice(deviceType, deviceId, this.metricCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.metricsCount = res.count;
      this.infiniteMetricList = this.infiniteMetricList.concat(res.results.map(device => { return { ...device, isSelected: false } }));
      if (this.selectedMetricesList.length) {
        this.selectedMetricesList.forEach(device => {
          device.items.forEach(item => {
            const index = this.infiniteMetricList.findIndex(metric => metric.item_id == item.item_id);
            if (index > -1) {
              this.infiniteMetricList[index].isSelected = true;
            }
          })
        });
      }
      if (this.metricesToBeAdded.length) {
        this.metricesToBeAdded.forEach(m => {
          const index = this.infiniteMetricList.findIndex(metric => metric.item_id == m.item_id);
          if (index > -1) {
            this.infiniteMetricList[index].isSelected = true;
          }
        })
      }
      this.isMetricLoader = false;
      this.isMetricesBottomLoader = false;
    }, (err: HttpErrorResponse) => {
      this.isMetricLoader = false;
      this.isMetricesBottomLoader = false;
    });
  }

  fetchMoreMetrics(event: IPageInfo) {
    if ((this.infiniteMetricList.length % this.metricCurrentCriteria.pageSize != 0) || event.endIndex !== this.infiniteMetricList.length - 1 || !this.selectedDevice) {
      return;
    }
    this.metricCurrentCriteria.pageNo = this.infiniteMetricList.length / this.metricCurrentCriteria.pageSize + 1;
    this.getMetrices(this.metricesMappingForm.get('device_type').value, this.selectedDevice.uuid);
  }

  manageActiveForm(formName: string) {
    switch (formName) {
      case 'detailsForm':
        if (this.viewId && this.viewData) {
          this.buildDetailsForm(this.viewData);
        } else {
          this.buildDetailsForm();
        }
        this.activeForm = formName;
        break;
      // case 'filterForm':
      //   if (this.detailsForm?.valid && (this.viewId || this.viewData?.uuid)) {
      //     this.activeForm = formName;
      //     this.buildFilterForm();
      //   } else {
      //     this.notification.warning(new Notification('Please fill in the Dashboard details before adding Filters'));
      //   }
      //   break;
      case 'widgetForm':
        if (this.viewId && this.viewData.uuid) {
          // in edit flow
          this.activeForm = formName;
          this.buildWidgetForm();
        } else if (this.detailsForm?.valid && (this.viewId || this.viewData?.uuid)) {
          this.activeForm = formName;
          this.buildWidgetForm();
        } else {
          this.notification.warning(new Notification('Please fill in the Dashboard & Filter details before creating Widgets'));
        }
        break;
      default:
        this.activeForm = formName;
        this.spinner.stop('main');
        break;
    }
    this.spinner.stop('main');
  }

  buildDetailsForm(viewData?: any) {
    this.nonFieldErr = '';
    this.detailsForm = this.svc.buildDetailsForm(viewData);
    this.detailsFormErrors = this.svc.resetDetailsFormErrors();
    this.detailsFormValidationMessages = this.svc.detailsFormValidationMessages;
    this.detailsForm.get('refresh').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.detailsForm.addControl('refresh_interval_in_sec', new FormControl(null, [Validators.required, NoWhitespaceValidator]));
      } else {
        this.detailsForm.removeControl('refresh_interval_in_sec');
      }
    })
  }

  onSubmitDetailsForm() {
    if (this.detailsForm.invalid) {
      this.detailsFormErrors = this.utilService.validateForm(this.detailsForm, this.detailsFormValidationMessages, this.detailsFormErrors);
      this.detailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.detailsFormErrors = this.utilService.validateForm(this.detailsForm, this.detailsFormValidationMessages, this.detailsFormErrors);
      });
      return;
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, <any>this.detailsForm.getRawValue());
      if (this.viewId) {
        this.svc.saveDashboardData(obj, this.viewId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.viewData = res;
          this.manageActiveForm('widgetForm');
        }, (err: HttpErrorResponse) => {
          this.handleDetailsFormErrors(err.error);
        });
      } else {
        this.svc.saveDashboardData(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.viewData = res;
          this.getDashboardWidgets();
          this.manageActiveForm('widgetForm');
        }, (err: HttpErrorResponse) => {
          this.handleDetailsFormErrors(err.error);
        });
      }
    }
  }

  handleDetailsFormErrors(err: any) {
    this.detailsFormErrors = this.svc.resetDetailsFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.detailsForm.controls) {
          this.detailsFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  // buildFilterForm() {
  //   this.nonFieldErr = '';
  //   this.filterForm = this.svc.buildFilterForm(this.viewData);
  //   this.filterFormErrors = this.svc.resetFilterFormErrors();
  //   this.filterFormValidationMessages = this.svc.filterFormValidationMessages;
  //   this.filterForm.get('refresh').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
  //     if (val) {
  //       this.filterForm.addControl('refresh_interval_in_sec', new FormControl(null, [Validators.required, NoWhitespaceValidator]));
  //     } else {
  //       this.filterForm.removeControl('refresh_interval_in_sec');
  //     }
  //   })
  // }

  onCustomDateSubmit(event: any) {
    this.customDateRange = event;
  }

  buildMetricesMappingform() {
    this.metricesMappingForm = this.svc.buildMetricesMappingform();
    this.metricesMappingForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.deviceCurrentCriteria.pageNo = 1;
      this.metricCurrentCriteria.pageNo = 1;
      this.deviceCount = 0;
      this.metricsCount = 0;
      this.selectedDevice = null;
      this.infiniteMetricList = [];
      this.infiniteDeviceList = [];
      // this.getDeviceList(val, true, true, 'down');
      this.isDeviceLoader = true;
      this.getDevices(val, true);
    });
  }

  getDeviceClass(device: DashboardDevice) {
    const index = this.infiniteDeviceList.findIndex(d => d.uuid == device.uuid);
    if (index > -1) {
      if (this.infiniteDeviceList[index].isSelected) {
        return 'fas fa-check-circle text-primary';
      } else {
        return 'far fa-circle text-primary';
      }
    }
  }

  selectDevice(device: DashboardDevice) {
    this.deviceCurrentCriteria.pageNo = 1;
    this.metricCurrentCriteria.pageNo = 1;
    const index = this.infiniteDeviceList.findIndex(d => d.uuid == device.uuid);
    if (index > -1) {
      this.selectedDevice = _clone(this.infiniteDeviceList[index]);
      this.metricsCount = 0;
      this.infiniteMetricList = [];
      this.metricesToBeAdded = [];
      this.infiniteDeviceList.forEach((device, deviceIndex) => {
        if (index != deviceIndex) {
          device.isSelected = false;
        }
      });
      this.infiniteDeviceList[index].isSelected = !this.infiniteDeviceList[index].isSelected;
      if (this.infiniteDeviceList[index].isSelected) {
        this.isMetricLoader = true;
        // this.getMetricesList(this.metricesMappingForm.get('device_type').value, device.uuid, 'down');
        this.getMetrices(this.metricesMappingForm.get('device_type').value, this.selectedDevice.uuid);
      }
    }
  }

  getMetricClass(metric: any) {
    const index = this.infiniteMetricList.findIndex(m => m.item_id == metric.item_id);
    if (index > -1) {
      if (this.infiniteMetricList[index].isSelected) {
        return 'fas fa-check-square text-primary';
      } else {
        return 'far fa-square text-primary';
      }
    } else {
      return 'far fa-square text-primary';
    }
  }

  selectMetricsToBeAdded(selectedMetric: any) {
    const index = this.infiniteMetricList.findIndex(m => m.item_id == selectedMetric.item_id);
    if (index > -1) {
      for (let sIndex = 0; sIndex < this.selectedMetricesList.length; sIndex++) {
        if (this.selectedMetricesList[sIndex].items.some(item => item.item_id == this.infiniteMetricList[index].item_id)) {
          return;
        }
      }
      this.infiniteMetricList[index].isSelected = !this.infiniteMetricList[index].isSelected;
      if (this.infiniteMetricList[index].isSelected) {
        this.metricesToBeAdded.push(_clone(this.infiniteMetricList[index]));
      } else {
        const metricIndex = this.metricesToBeAdded.findIndex(metric => metric.item_id == this.infiniteMetricList[index].item_id);
        if (metricIndex > -1) {
          this.metricesToBeAdded.splice(metricIndex, 1);
        }
      }
    }
  }

  addMetrices() {
    if (!this.metricesToBeAdded.length) {
      return;
    }
    const index = this.selectedMetricesList.findIndex(device => device.uuid == this.selectedDevice.uuid);
    if (index > -1) {
      const filteredMetrices = this.metricesToBeAdded.filter(metric => !this.selectedMetricesList[index].items.includes(metric));
      if (filteredMetrices.length) {
        filteredMetrices.forEach(metric => {
          metric.isSelected = false;
        });
        this.selectedMetricesList[index].items = this.selectedMetricesList[index].items.concat(_clone(filteredMetrices));
      }
    } else {
      this.selectedDevice.isSelected = false;
      this.selectedMetricesList.push(_clone(this.selectedDevice));
      this.metricesToBeAdded.forEach(metric => {
        metric.isSelected = false;
      });
      this.selectedMetricesList[this.selectedMetricesList.length - 1]['items'] = _clone([...this.metricesToBeAdded]);
      this.selectedMetricesList[this.selectedMetricesList.length - 1]['device_type'] = this.metricesMappingForm.get('device_type').value;
    }
    this.isMetricesMappingInvalid = false;
    // this.isPreview = false;
    this.metricesToBeAdded = [];
  }

  getSelectedDevice(index: number) {
    if (this.selectedMetricesList[index].isSelected) {
      return 'fas fa-check-square text-primary';
    } else {
      return 'far fa-square text-primary';
    }
  }

  getSelectedMetricClass(deviceIndex: number, metricIndex: number) {
    if (this.selectedMetricesList[deviceIndex].items[metricIndex].isSelected) {
      return 'fas fa-check-square text-primary';
    } else {
      return 'far fa-square text-primary';
    }
  }

  selectAllMetricesUnderDevice(index: number) {
    this.selectedMetricesList[index].isSelected = !this.selectedMetricesList[index].isSelected
    if (this.selectedMetricesList[index].isSelected) {
      this.selectedMetricesList[index].items.forEach(metric => {
        metric.isSelected = true;
        this.metricesToBeRemoved.push(metric)
      });
    } else {
      this.selectedMetricesList[index].items.forEach(metric => {
        metric.isSelected = false;
        const metricIndex = this.metricesToBeRemoved.findIndex(m => m.item_id == metric.item_id);
        this.metricesToBeRemoved.splice(metricIndex, 1);
      });
    }
  }

  selectMetricsToBeRemoved(deviceIndex: number, metricIndex: number) {
    this.selectedMetricesList[deviceIndex].items[metricIndex].isSelected = !this.selectedMetricesList[deviceIndex].items[metricIndex].isSelected;
    this.selectedMetricesList.forEach(device => {
      device.isSelected = device.items.every(metric => metric.isSelected);
    });
    if (this.selectedMetricesList[deviceIndex].items[metricIndex].isSelected) {
      this.metricesToBeRemoved.push(_clone(this.selectedMetricesList[deviceIndex].items[metricIndex]));
    } else {
      const mIndex = this.metricesToBeRemoved.findIndex(metric => metric == this.selectedMetricesList[deviceIndex].items[metricIndex]);
      this.metricesToBeRemoved.splice(mIndex, 1);
    }
  }

  removeMetrices() {
    if (!this.metricesToBeRemoved.length) {
      return;
    }
    if (this.infiniteMetricList.length) {
      this.metricesToBeRemoved.forEach(metric => {
        const index = this.infiniteMetricList.findIndex(m => m.item_id == metric.item_id);
        if (index > -1) {
          this.infiniteMetricList[index].isSelected = false;
        }
      });
    }
    this.selectedMetricesList.forEach(device => {
      device.items = device.items.filter(metric =>
        !this.metricesToBeRemoved.some(m => m.item_id == metric.item_id)
      );
    });
    this.selectedMetricesList = this.selectedMetricesList.filter(device => device.items.length > 0);
    // this.isPreview = false;
    this.metricesToBeRemoved = [];
  }

  formartMetricesData(): any {
    return this.selectedMetricesList.map(device => ({
      name: device.name,
      device_type: device.device_type,
      uuid: device.uuid,
      status: device.status,
      items: device.items.map(metric => ({
        item_name: metric.item_name,
        item_id: metric.item_id,
        latest_value: metric.latest_value,
        unit: metric.unit
      }))
    }));
  }

  onTimeFrameChange(formData: any) {
    // this.filterForm.get('timeframe').setValue(formData.period);
    this.detailsForm.get('timeframe').setValue(formData.period);
  }

  // onSubmitFilterForm() {
  //   if (this.filterForm.invalid) {
  //     this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
  //     this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
  //       this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
  //     });
  //     return;
  //   } else {
  //     this.spinner.start('main');
  //     let filterFormValue = this.filterForm.getRawValue();
  //     if (filterFormValue.refresh_interval_in_sec) {
  //       filterFormValue.refresh_interval_in_sec = Number(filterFormValue.refresh_interval_in_sec);
  //     }
  //     let obj = Object.assign({}, <any>filterFormValue);
  //     this.svc.saveDashboardData(obj, this.viewData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
  //       this.viewData = res;
  //       this.manageActiveForm('widgetForm');
  //     }, (err: HttpErrorResponse) => {
  //       this.handleFilterFormErrors(err.error);
  //     });
  //   }
  // }

  // handleFilterFormErrors(err: any) {
  //   this.filterFormErrors = this.svc.resetFilterFormErrors();
  //   if (err.non_field_errors) {
  //     this.nonFieldErr = err.non_field_errors[0];
  //   } else if (err) {
  //     if (isString(err)) {
  //       this.nonFieldErr = err;
  //     }
  //     for (const field in err) {
  //       if (field in this.filterForm.controls) {
  //         this.filterFormErrors[field] = err[field][0];
  //       }
  //     }
  //   } else {
  //     this.notification.error(new Notification('Something went wrong!! Please try again.'));
  //   }
  //   this.spinner.stop('main');
  // }

  getDashboardWidgets() {
    let dashboardId = this.viewId ? this.viewId : this.viewData.uuid;
    this.svc.getDashboardWidgets(dashboardId, this.widgetCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dashboardWidgets = res;
    }, err => {
      this.dashboardWidgets = [];
    });
  }

  onWidgetSearched(event: string) {
    this.widgetCriteria.searchValue = event;
    this.widgetCriteria.pageNo = 1;
    this.getDashboardWidgets();
  }

  resetWidgetForm() {
    // this.nonFieldErr = '';
    // this.widgetGroupByOptions = [];
    // this.showWidgetGroupByFilter = false;
    // this.widgetGroupByFilterOptions = [];
    this.buildWidgetForm();
  }

  buildWidgetForm() {
    this.nonFieldErr = '';
    this.widgetGroupByOptions = [];
    this.showWidgetGroupByFilter = false;
    this.widgetGroupByFilterOptions = [];
    this.metricesMappingForm = null;
    this.selectedMetricesList = [];
    this.infiniteDeviceList = [];
    this.infiniteMetricList = [];
    if (this?.selectedDashboardWidget?.widget_type == 'monitoring') {
      if (this?.selectedDashboardWidget?.period == 'custom') {
        let val: DateRangeOption = { from: this?.selectedDashboardWidget?.start_time, to: this?.selectedDashboardWidget?.start_time, value: 'custom' }
        this.customDateRangeValue = val;
      } else {
        this.customDateRangeValue = this?.selectedDashboardWidget?.period ? this?.selectedDashboardWidget?.period : 'last_24_hours';
      }
    }
    this.widgetForm = this.svc.buildWidgetForm(this.selectedDashboardWidget);
    this.widgetFormErrors = this.svc.resetWidgetFormErrors();
    this.widgetFormValidationMessages = this.svc.widgetFormValidationMessages;
    if (this.widgetForm.get('widget_type').value) {
      let widgetType = this.widgetCategories.find(c => c.value == this.widgetForm.get('widget_type').value);
      this.widgetGroupByOptions = widgetType.group_by;
      if (this.selectedDashboardWidget.group_by) {
        this.getWidgetGroupByFilterOptions(this.widgetForm.get('group_by').value);
      }
    }
    this.widgetForm.get('widget_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      let widgetType = this.widgetCategories.find(c => c.value == val);
      this.widgetGroupByOptions = widgetType.group_by;
      if (val == 'monitoring') {
        this.widgetForm.removeControl('group_by');
        this.manageMonitoring();
      } else {
        this.metricesMappingForm = null;
        this.widgetForm.removeControl('filter_by');
        if (val == 'private_cloud') {
          this.getSupportedPrivateCloudTypes();
        } else if (val == 'public_cloud') {
          this.getSupportedPublicCloudTypes();
        }
        this.widgetForm.addControl('group_by', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        this.widgetForm.get('group_by')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(grpByVal => {
          this.showWidgetGroupByFilter = false;
          this.widgetGroupByFilterOptions = [];
          if (val == 'public_cloud' && grpByVal == 'cloud_type') {
            if (this.widgetForm.get('group_by_filter')) {
              this.widgetForm.removeControl('group_by_filter');
            }
          } else {
            if (this.widgetForm.get('group_by_filter')) {
              this.widgetForm.removeControl('group_by_filter');
            }
            if (this.widgetForm.get('group_by_filter')) {
              this.widgetForm.get('group_by_filter').setValue(new FormControl([], [Validators.required]));
            } else {
              this.widgetForm.addControl('group_by_filter', new FormControl([], [Validators.required]));
            }
            this.getWidgetGroupByFilterOptions(grpByVal);
          }
        })
      }
    })
    if (this?.selectedDashboardWidget?.widget_type == 'monitoring') {
      // if (this?.selectedDashboardWidget?.period != 'custom') {
      //   this.customDateRangeValue = this?.selectedDashboardWidget?.period ? this?.selectedDashboardWidget?.period : 'last_24_hours';
      // } else {
      //   let val: DateRangeOption = { from: this?.selectedDashboardWidget?.start_time, to: this?.selectedDashboardWidget?.start_time, value: 'custom' }
      //   this.customDateRangeValue = val;
      // }
      this.manageMonitoring();
      this.selectedMetricesList = this.selectedDashboardWidget?.device_items ? this.selectedDashboardWidget?.device_items : [];
    }
  }

  supportedPrivateCloudTypes: string[] = [];
  getSupportedPrivateCloudTypes() {
    this.svc.getSupportedPrivateCloudTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Array.isArray(res)) {
        this.supportedPrivateCloudTypes = res;
      } else {
        this.supportedPrivateCloudTypes = [];
      }
    }, err => {
      this.supportedPrivateCloudTypes = [];
    });
  }

  supportedPublicCloudTypes: string[] = [];
  getSupportedPublicCloudTypes() {
    this.svc.getSupportedPublicCloudTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.supportedPublicCloudTypes = res;
    }, err => {
      this.supportedPublicCloudTypes = [];
    });
  }

  getWidgetGroupByFilterOptions(group_by_selector: string) {
    this.showWidgetGroupByFilter = false;
    let widgetType = this.widgetForm.get('widget_type').value;
    let widgetName = (widgetType == 'private_cloud' || widgetType == 'public_cloud') ? 'cloud' : widgetType;
    let filter_cloud: string[] = widgetType == 'private_cloud' ? this.supportedPrivateCloudTypes : widgetType == 'public_cloud' ? this.supportedPublicCloudTypes : [];
    this.svc.getWidgetGroupByFilterOptions(widgetName, group_by_selector, filter_cloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.widgetGroupByFilterOptions = res;
      this.showWidgetGroupByFilter = true;
    }, err => {
      this.widgetGroupByFilterOptions = [];
      this.showWidgetGroupByFilter = true;
    });
  }

  manageMonitoring() {
    this.widgetForm.addControl('filter_by', new FormControl(this.selectedDashboardWidget?.filter_by ? this.selectedDashboardWidget.filter_by : 'latest'));
    this.buildMetricesMappingform();
  }

  onSubmitWidgetForm() {
    if (this.metricesMappingForm && this.widgetForm.get('widget_type').value == 'monitoring' && !this.selectedMetricesList.length) {
      this.isMetricesMappingInvalid = true;
      // return;
    }
    if (this.widgetForm.invalid) {
      this.widgetFormErrors = this.utilService.validateForm(this.widgetForm, this.widgetFormValidationMessages, this.widgetFormErrors);
      this.widgetForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.widgetFormErrors = this.utilService.validateForm(this.widgetForm, this.widgetFormValidationMessages, this.widgetFormErrors);
      });
      return;
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, <any>this.widgetForm.getRawValue());
      if (obj.widget_type == 'private_cloud') {
        obj['platform_type'] = this.supportedPrivateCloudTypes;
      } else if (obj.widget_type == 'public_cloud') {
        obj['platform_type'] = this.supportedPublicCloudTypes;
      }
      if (obj.widget_type == 'monitoring' && obj?.filter_by != 'latest') {
        if (this.customDateRange.period == 'custom') {
          obj['start_time'] = this.customDateRange.from;
          obj['end_time'] = this.customDateRange.to;
          obj['period'] = this.customDateRange.period;
        } else {
          obj['period'] = this.customDateRange.period;
          obj['start_time'] = null;
          obj['end_time'] = null;
        }
      } else if (obj.widget_type == 'monitoring' && obj?.filter_by == 'latest') {
        obj['start_time'] = null;
        obj['end_time'] = null;
      }
      if (this.selectedMetricesList.length) {
        obj['device_items'] = this.formartMetricesData();
      }
      if (this.selectedDashboardWidget) {
        this.svc.updateDashboardWidget(obj, this.selectedDashboardWidget.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.getDashboardWidgets();
          this.selectedDashboardWidget = null;
          this.resetWidgetForm();
          this.notification.success(new Notification('Widget updated successfully.'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleWidgetFormErrors(err.error);
        });
      } else {
        this.svc.createDashboardWidget(obj, this.viewData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.getDashboardWidgets();
          this.resetWidgetForm();
          this.notification.success(new Notification('Widget Created successfully.'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleWidgetFormErrors(err.error);
        });
      }
    }
  }

  handleWidgetFormErrors(err: any) {
    this.widgetFormErrors = this.svc.resetWidgetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.widgetForm.controls) {
          this.widgetFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  addWidget() {
    this.selectedDashboardWidget = null;
    this.buildWidgetForm();
  }

  editWidget(widget: any) {
    this.selectedDashboardWidget = widget;
    this.buildWidgetForm();
  }

  deleteWidget(widget: any) {
    this.selectedDashboardWidget = widget;
    this.modalRef = this.modalSvc.show(this.confirmWidgetDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmWidgetDelete() {
    this.modalRef.hide();
    this.svc.deleteDashboardWidget(this.selectedDashboardWidget.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedDashboardWidget = null;
      this.getDashboardWidgets();
      this.notification.success(new Notification('Widget deleted successfully.'));
    }, err => {
      this.selectedDashboardWidget = null;
      this.notification.error(new Notification('Failed to delete Widget!! Please try again.'));
    });
  }

  goBack() {
    if (this.viewId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
