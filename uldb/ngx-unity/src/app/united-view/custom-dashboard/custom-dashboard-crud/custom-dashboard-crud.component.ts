import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep as _clone } from 'lodash-es';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartData } from 'src/app/shared/chart-config.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { GraphViewData, MetricesMappingViewData, NetworkTrafficViewData } from '../custom-dashboard.service';
import { CPUHostData, CustomDashboardCrudService, InfraCloudData, MemoryHostData, accountData, alertSourceData, alertStatusData, cloudData, cpuGraphData, datacenterData, deviceTypeData, deviceTypes, filterTypes, graphTypes, groupByList, groupByTypes, hostAvailabilityDeviceTypeData, hostAvailabilitycloudData, hostAvailabilitydatacenterData, hostAvailabilitystatusData, hostAvailabilitytagData, locationData, metricTypes, metricesColumns, networkTrafficHostData, osTypeData, osVersionData, periodTypes, regionData, resourceData, serviceData, severityData, statusData, storageGraphData, storageHostData, subTabs, tagData, viewByTypes } from './custom-dashboard-crud.service';
import { CustomDashboardDevices, CustomDashboardWidget, PreviewWidgetTypeMapping, WidgetCloudList, WidgetTab } from './custom-dashboard-crud.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { IPageInfo } from 'ngx-virtual-scroller';
import { StringValueConfig } from '@rxweb/reactive-form-validators/models/config/string-value-config';

@Component({
  selector: 'custom-dashboard-crud',
  templateUrl: './custom-dashboard-crud.component.html',
  styleUrls: ['./custom-dashboard-crud.component.scss'],
  providers: [CustomDashboardCrudService]
})
export class CustomDashboardCrudComponent implements OnInit, OnDestroy {

  cloudSettings: IMultiSelectSettings = {
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

  cloudSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    checked: 'cloud',
    checkedPlural: 'clouds',
    defaultTitle: 'Select Clouds',
    allSelected: 'All Clouds',
  };

  filterSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    checked: 'filter',
    checkedPlural: 'filters',
    defaultTitle: 'Select filters',
    allSelected: 'All filters',
  };

  groupByFilterSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  graphTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'name',
    lableToDisplay: 'displayName',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'name',
    lableToDisplay: 'displayName',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  deviceSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'uuid',
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  private ngUnsubscribe = new Subject();
  widgetId: string = '';
  subTabs: WidgetTab[] = subTabs;
  selectedTab: string = '';
  isPreview: boolean = false;
  cloudList: WidgetCloudList = null;
  selectedCloudList: string[] = []
  groupByListSrc = groupByList;
  filteredGroupByList:  Array<{ name: string, value: string }> = [];
  chartViewData: UnityChartData = new UnityChartData();
  chartLengendData: GraphViewData[] | string[] = [];
  tableViewData: GraphViewData[] | NetworkTrafficViewData[] = [];
  previewWidgetType: string = '';
  columns: string[] = [];
  nonFieldErr: string = ''
  actionMessage: 'Create' | 'Update';
  filterTypeList: Array<{ name: string, displayName: string }> = filterTypes;
  deviceTypeList: Array<{ name: string, displayName: string }> = deviceTypes;
  graphTypeList: Array<{ name: string, displayName: string }> = graphTypes;
  periodTypeList: Array<{ name: string, displayName: string }> = periodTypes;
  metricTypeList: Array<{ name: string, displayName: string }> = metricTypes;
  groupByTypeList: Array<{ name: string, displayName: string }> = groupByTypes;
  viewByTypeList: Array<{ name: string, displayName: string }> = viewByTypes;
  metricsPreview: boolean = false;
  metricsPreviewViewData: any[][] = [];
  metricesColumns: any[][] = metricesColumns;
  graphTypes: string[] = [];
  deviceList: Array<CustomDashboardDevices> = [];
  infiniteDeviceList: Array<CustomDashboardDevices> = [];
  selectedDevice: CustomDashboardDevices;
  infiniteMetricList: Array<any> = [];
  deviceCount: number = 0;;
  widgetDetails: CustomDashboardWidget = null;
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
  metricesMappingViewData: MetricesMappingViewData[] = [];
  isMetricesMappingInvalid: boolean = false;

  metricesMappingForm: FormGroup;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  metricsForm: FormGroup;
  metricsFormErrors: any;
  metricsValidationMessages: any;
  
  groupByFilterList: string[];
  showGroupByfliter: boolean = false;

  @ViewChild(InfiniteScrollDirective) infiniteScrollDirective;

  @ViewChildren('hideTooltip') hideTooltips: QueryList<ElementRef>;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudService: CustomDashboardCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => this.widgetId = params.get('widgetId'));
    this.deviceCurrentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TWENTY };
    this.metricCurrentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TWENTY, params: [{ device_type: '', device_uuid: '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.widgetId) {
      this.actionMessage = 'Update';
      // this.getCloudList();
      this.getWidgetDetails();
    } else {
      this.actionMessage = 'Create';
      // this.getCloudList();
      // this.buildForm(null);
      this.activeTab(this.subTabs[0]);
      this.spinner.stop('main');
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

  getGroupByOptions(type: string, cloud?: string) {
    this.filteredGroupByList = [];
    const options = this.groupByListSrc.find(a => a.name == type);
    this.filteredGroupByList = options.list;
    if (type == 'cloud') {
      if (cloud == 'public_cloud') {
        this.selectedCloudList = this.cloudList?.public_cloud_data;
        this.filteredGroupByList = options.pc_list;
      }
      else {
        this.selectedCloudList = this.cloudList?.private_cloud_data;
      }
    }
  }

  getWidgetDetails() {
    this.widgetDetails = null;
    this.selectedMetricesList = [];
    this.crudService.getWidgetDetails(this.widgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.widgetDetails = res;
      this.selectedTab = res.widget_type;
      this.getGroupByOptions(res.widget_type, res.cloud);
      if (res.widget_type == 'metrices') {
        if (res.filter_by == 'custom') {
          this.getDeviceList(res.device_type);
        } else {
          this.buildMetricsForm(res);
        }
        if (res.filter_by == 'metric') {
          this.buildMetricesMappingform();
          this.selectedMetricesList = res.device_items ? res.device_items : [];
        }
      } else {
        if (res.widget_type == 'cloud') { this.getCloudList(); };
        this.buildForm(res);
      }
      this.spinner.stop('main');
    }, (error: HttpErrorResponse) => {
      this.widgetDetails = null;
      this.notification.error(new Notification("Failed to get widget details"));
      this.spinner.stop('main');
    });
  }

  getCloudList() {
    this.crudService.getClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cloudList = res;
      // if (this.widgetId) this.getWidgetDetails();
      const cloud = this.widgetId ? this.widgetDetails?.cloud : null;
      this.getGroupByOptions(this.selectedTab, cloud);
    }, (error: HttpErrorResponse) => {
      this.notification.error(new Notification("Failed to get cloud List"));
    });
  }

  getDeviceList(deviceType: string, deviceValueChange?: boolean, metricesMapping?: boolean, onScroll?: string) {
    this.deviceList = [];
    this.crudService.getDevicesByDeviceType(deviceType, metricesMapping, this.deviceCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceCount = metricesMapping ? (res as PaginatedResult<CustomDashboardDevices>).count : 0;
      if (deviceType == 'baremetal') {
        // this.deviceList = this.deviceList.concat(res.map(data => data.server));
        this.deviceList = metricesMapping ? (res as PaginatedResult<CustomDashboardDevices>).results.map(data => data.server) : (res as CustomDashboardDevices[]).map(data => data.server);
        if (!deviceValueChange) {
          this.buildMetricsForm(this.widgetDetails);
        }
      } else {
        // this.deviceList = this.deviceList.concat(res);
        this.deviceList = metricesMapping ? (res as PaginatedResult<CustomDashboardDevices>).results : (res as CustomDashboardDevices[]);
        if (!deviceValueChange) {
          this.buildMetricsForm(this.widgetDetails);
        }
      }
      if (metricesMapping) {
        this.deviceList = this.deviceList.map(device => { return { ...device, isSelected: false } });
        if (onScroll == 'down') {
          this.infiniteDeviceList = this.infiniteDeviceList.concat(this.deviceList);
          if (this.infiniteDeviceList.length > 40) {
            this.infiniteDeviceList.splice(0, 20);
          }
        }
        if (onScroll == 'up') {
          this.infiniteDeviceList.unshift(...this.deviceList);
          // this.infiniteDeviceList = this.deviceList.concat(this.infiniteDeviceList);
          if (this.infiniteDeviceList.length > 40) {
            this.infiniteDeviceList.splice(-20, 20);
          } else if (this.infiniteDeviceList.length > 20) {
            this.infiniteDeviceList.splice(-20, this.infiniteDeviceList.length - 20);
          }
          const deviceScrollContainer = document.getElementById('deviceScrollContainer');
          if (deviceScrollContainer) {
            deviceScrollContainer.scrollTop = 1;
          }
        }
        if (this.selectedDevice) {
          const index = this.infiniteDeviceList.findIndex(device => device.uuid == this.selectedDevice.uuid);
          if (index > -1) {
            this.infiniteDeviceList[index].isSelected = true;
          }
        }
        this.isDeviceBottomLoader = false;
        this.infiniteScrollDirective.disposeScroller.unsubscribe();
        this.infiniteScrollDirective.setup();
      }
    }, (err: HttpErrorResponse) => {
      this.isDeviceBottomLoader = false;
      // this.notification.error(new Notification('Failed to get devices.'));
    });
  }

  getDevices(deviceType: string, metricesMapping?: boolean) {
    this.isDeviceBottomLoader = this.isDeviceLoader ? false : true;
    this.crudService.getDevicesByDeviceType(deviceType, metricesMapping, this.deviceCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceCount = metricesMapping ? (res as PaginatedResult<CustomDashboardDevices>).count : 0;
      if (deviceType == 'baremetal') {
        // this.deviceList = this.deviceList.concat(res.map(data => data.server));
        this.deviceList = metricesMapping ? (res as PaginatedResult<CustomDashboardDevices>).results.map(data => data.server) : (res as CustomDashboardDevices[]).map(data => data.server);
      } else {
        // this.deviceList = this.deviceList.concat(res);
        this.deviceList = metricesMapping ? (res as PaginatedResult<CustomDashboardDevices>).results : (res as CustomDashboardDevices[]);
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
    this.getDevices(this.metricesMappingForm.get('device_type').value, true);
  }

  //misc code for ngx-infinte-scroll 
  getMetricesList(deviceType: string, deviceId: string, onScroll?: string) {
    this.crudService.getMetricesByDevice(deviceType, deviceId, this.metricCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.metricsCount = res.count;
      if (onScroll == 'down') {
        this.infiniteMetricList = this.infiniteMetricList.concat(res.results);
        if (this.infiniteMetricList.length > 40) {
          this.infiniteMetricList.splice(0, 20);
        }
      }
      if (onScroll == 'up') {
        this.infiniteMetricList.unshift(...res.results);
        if (this.infiniteMetricList.length > 40) {
          this.infiniteMetricList.splice(-20, 20);
        } else if (this.infiniteMetricList.length > 20) {
          this.infiniteMetricList.splice(-20, this.infiniteMetricList.length - 20);
        }
        const metricScrollContainer = document.getElementById('metricScrollContainer');
        if (metricScrollContainer) {
          metricScrollContainer.scrollTop = 1;
        }
      }
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
      this.isMetricesBottomLoader = false;
      // this.infiniteScrollDirective.disposeScroller.unsubscribe();
      // this.infiniteScrollDirective.setup();
    }, (err: HttpErrorResponse) => {
      this.isMetricesBottomLoader = false;
    });
  }

  getMetrices(deviceType: string, deviceId: string) {
    this.isMetricesBottomLoader = this.isMetricLoader ? false : true;
    this.crudService.getMetricesByDevice(deviceType, deviceId, this.metricCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  removeGroupByFilterControl(){
    if (this.form?.get('group_by_filter')) {
      this.showGroupByfliter = false;
      this.form.removeControl('group_by_filter');
    }
  }

  groupByFilterDropdownHandler(val : string){
    this.removeGroupByFilterControl();
    if (this.selectedTab == 'cloud' && this.form.get('group_by').value == 'cloud_type') {
      this.showGroupByfliter = false;
      return;
    }
    this.getGroupByFilterOptions(val);
    this.form.addControl('group_by_filter', new FormControl([], [Validators.required]));
    this.showGroupByfliter = true;
  }

  subscribeCloudTabChanges(){
    this.form.get('cloud')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if(val){
        this.getGroupByOptions(this.selectedTab, val);
        this.form.get('platform_type').setValue([]);
        this.form.get('group_by').setValue('');
        this.removeGroupByFilterControl();
      }
    });
    this.form.get('platform_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if(val.length !== 0){
        this.form.get('group_by').setValue('');
        this.removeGroupByFilterControl();
      }
    });
  }

  subscribeGroupByChanges() {
    this.form.get('group_by').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.groupByFilterDropdownHandler(val);
      }
    });
    this.subscribeCloudTabChanges();
  }
  
  manageForm() {
    if (this.selectedTab == 'cloud') {
      this.form.addControl('cloud', new FormControl('private_cloud'));
      this.form.addControl('platform_type', new FormControl([], [Validators.required]));
      this.subscribeCloudTabChanges();
    } else {
      if (this.form.get('cloud')) {
        this.form.removeControl('cloud');
        this.form.removeControl('platform_type');
      }
    }

    this.subscribeGroupByChanges();
  }

  buildForm(data: any) {
    // if (data?.widget_type == 'metrices') return;
    this.form = this.crudService.buildForm(data);
    this.formErrors = this.crudService.resetFormErrors();
    this.validationMessages = this.crudService.validationMessages;
    this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => { this.isPreview = false });
    if (this.widgetId && this.selectedTab != 'metrices') {
      if((data?.widget_type == 'cloud' && data?.group_by == 'cloud_type')){
        this.removeGroupByFilterControl();
      }
      else{
        this.getGroupByFilterOptions(data?.group_by);
        this.showGroupByfliter = data?.group_by_filter ? true : false;
      }

      // if(this.widgetDetails.name){
      //   this.form.get('name').setValue(this.widgetDetails.name);
      // }
    }
    if (!this.widgetId) {
      this.manageForm();
    }
    this.subscribeGroupByChanges();
  }

  getGroupByFilterOptions(groupBy?: string) {
    if (!groupBy) return;
    this.spinner.start('main');
    let filterCloud: string[] = [];
    if (this.selectedTab === 'cloud') {
      filterCloud = this.form.get('platform_type')?.value;
    }
    this.crudService.getGroupByData(groupBy, this.selectedTab, filterCloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.groupByFilterList = res;
      if (res.length === 0) {
        this.form.get('group_by_filter')?.disable();
      } else {
        this.form.get('group_by_filter')?.enable();
      }
      this.spinner.stop('main');
    }, (error: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Group by List'));
    });
  }

  buildMetricsForm(data: CustomDashboardWidget) {
    this.metricsForm = this.crudService.buildMetricsForm(data);
    this.metricsFormErrors = this.crudService.resetMetricsFormErrors();
    this.metricsValidationMessages = this.crudService.metricsValidationMessages;
    this.manageMetricsForm();
  }

  manageMetricsForm() {
    if (this.widgetId) {
      if (this.widgetDetails.graph_type == 'network') {
        this.metricsForm.get('network_group_by').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          if (val == 'devices') {
            this.metricsForm.addControl('view_by', new FormControl('', [Validators.required]));
          } else if (val == 'interfaces') {
            this.metricsForm.removeControl('view_by');
          }
        });
      }
      if (this.widgetDetails.filter_by == 'custom') {
        this.metricsForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.metricsForm.get('devices').setValue([]);
          this.deviceList = [];
          this.getDeviceList(val, true);
          // if device type field is multiselect
          // val.forEach(v => {
          //   this.getDeviceList(v);
          // });
        });
      }
      if (this.widgetDetails.filter_by == 'metric') {
        this.metricsForm.removeControl('graph_type');
        this.metricsForm.removeControl('period');
      }
    }
    this.metricsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => this.isPreview = false);
    this.metricsForm.get('filter_by').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (!this.metricsForm.get('graph_type') || !this.metricsForm.get('period')) {
        this.metricsForm.addControl('graph_type', new FormControl('', [Validators.required]));
        this.metricsForm.addControl('period', new FormControl('', [Validators.required]));
        this.managePeriodChanges();
        this.manageGraphTypeChanges();
      }
      if (this.metricsForm.get('filter_by').value != 'metric') {
        this.managePeriodChanges();
        this.manageGraphTypeChanges();
      }
      this.metricsForm.get('period').setValue('');
      this.metricsForm.get('graph_type').setValue('');
      this.metricsForm.removeControl('period_hour');
      this.metricsForm.removeControl('period_min');
      if (val == 'top') {
        this.metricsForm.addControl('top_count', new FormControl(10, [Validators.required, Validators.min(0), Validators.max(10)]));
        this.metricsForm.removeControl('device_type');
        this.metricsForm.removeControl('devices');
      } else if (val == 'custom') {
        this.metricsForm.addControl('device_type', new FormControl('', [Validators.required]));
        this.metricsForm.addControl('devices', new FormControl([], [Validators.required]));
        this.metricsForm.removeControl('top_count');
        this.metricsForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.metricsForm.get('devices').setValue([]);
          this.deviceList = [];
          this.getDeviceList(val, true);
          // if device type field is multiselect
          // val.forEach(v => {
          //   this.getDeviceList(v);
          // });
        });
      } else if (val == 'metric') {
        this.metricsForm.removeControl('graph_type');
        this.metricsForm.removeControl('period');
        this.buildMetricesMappingform();
      }
    });
  }

  managePeriodChanges() {
    this.metricsForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'last') {
        this.metricsForm.addControl('period_hour', new FormControl(0, [Validators.required, Validators.min(0), Validators.max(23)]));
        this.metricsForm.addControl('period_min', new FormControl(5, [Validators.required, Validators.min(0), Validators.max(59)]));
      } else if (val == 'latest') {
        this.metricsForm.removeControl('period_hour');
        this.metricsForm.removeControl('period_min');
      }
    });
  }

  manageGraphTypeChanges() {
    this.metricsForm.get('graph_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      // val.includes('network') if graph_type is multiselect
      if (val == 'network') {
        this.metricsForm.addControl('metrics_network_data', new FormControl('', [Validators.required]));
        this.metricsForm.addControl('network_group_by', new FormControl('', [Validators.required]));
        this.metricsForm.get('network_group_by').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          if (val == 'devices') {
            this.metricsForm.addControl('view_by', new FormControl('', [Validators.required]));
          } else if (val == 'interfaces') {
            this.metricsForm.removeControl('view_by');
          }
        });
      } else {
        this.metricsForm.removeControl('metrics_network_data');
        this.metricsForm.removeControl('network_group_by');
        this.metricsForm.removeControl('view_by');
      }
    });
  }

  buildMetricesMappingform() {
    this.metricesMappingForm = this.crudService.buildMetricesMappingform();
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

  getDeviceClass(device: CustomDashboardDevices) {
    const index = this.infiniteDeviceList.findIndex(d => d.uuid == device.uuid);
    if (index > -1) {
      if (this.infiniteDeviceList[index].isSelected) {
        return 'fas fa-check-circle text-primary';
      } else {
        return 'far fa-circle text-primary';
      }
    }
  }

  selectDevice(device: CustomDashboardDevices) {
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

  deviceOnScrollDown(event: any) {
    this.isDeviceScrollDown = true;
    if (this.deviceCurrentCriteria.pageNo > this.deviceCount / PAGE_SIZES.TWENTY) {
      return;
    }
    this.deviceCurrentCriteria.pageNo += 1;
    this.getDeviceList(this.metricesMappingForm.get('device_type').value, true, true, 'down');
  }

  deviceOnScrollUp(event: any) {
    if (this.deviceCurrentCriteria.pageNo > 1) {
      this.deviceCurrentCriteria.pageNo -= this.isDeviceScrollDown && this.deviceCurrentCriteria.pageNo > 2 ? 2 : 1;
      this.isDeviceScrollDown = false;
      this.getDeviceList(this.metricesMappingForm.get('device_type').value, true, true, 'up');
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

  metricOnScrollDown(event: any) {
    this.isMetricScrollDown = true;
    if (this.metricCurrentCriteria.pageNo > this.metricsCount / PAGE_SIZES.TWENTY) {
      return;
    }
    setTimeout(() => {
      this.metricCurrentCriteria.pageNo += 1;
      this.getMetricesList(this.metricesMappingForm.get('device_type').value, this.selectedDevice.uuid, 'down');
    }, 300);
  }

  metricOnScrollUp(event: any) {
    if (this.metricCurrentCriteria.pageNo > 1) {
      this.metricCurrentCriteria.pageNo -= this.isMetricScrollDown && this.metricCurrentCriteria.pageNo > 2 ? 2 : 1;
      this.isMetricScrollDown = false;
      this.getMetricesList(this.metricesMappingForm.get('device_type').value, this.selectedDevice.uuid, 'up');
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
    this.isPreview = false;
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
    this.isPreview = false;
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

  activeTab(tab: WidgetTab) {
    if(tab.value == this.widgetDetails?.widget_type){
      this.getWidgetDetails();
      return;
    }
    this.selectedTab = tab.value;
    this.showGroupByfliter = false;
    if (tab.value == 'metrices') {
      this.previewWidgetType = '';
      this.form = null;
      this.buildMetricsForm(null);
      this.metricsForm.get('widget_type').setValue(tab.value);
    } else {
      this.metricsPreview = false;
      this.metricsForm = null;
      if (tab.value == 'cloud') { this.getCloudList(); };
      this.buildForm(null);
      this.form.get('widget_type').setValue(tab.value);
      this.manageForm();
    }
    this.isPreview = false;
    this.tableViewData = [];
    this.getGroupByOptions(tab.value);
  }

  togglePreview() {
    if (this.selectedTab == 'metrices') {
      if (this.metricsForm.invalid) {
        this.metricsFormErrors = this.utilService.validateForm(this.metricsForm, this.metricsValidationMessages, this.metricsFormErrors);
        this.metricsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.metricsFormErrors = this.utilService.validateForm(this.metricsForm, this.metricsValidationMessages, this.metricsFormErrors);
          });
      } else {
        this.managePreview();
      }
    } else {
      if (this.form.invalid) {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
          });
      } else {
        this.managePreview();
      }
    }
  }

  managePreview() {
    this.isPreview = !this.isPreview;
    this.graphTypes = [];
    this.metricsPreview = false;
    this.metricsPreviewViewData = [];
    this.chartViewData = null;
    this.chartLengendData = null;
    this.tableViewData = [];
    this.columns = [];
    this.previewWidgetType = '';
    let widgetType: string = ''
    if (this.form) {
      widgetType = this.form.get('widget_type').value;
    } else {
      widgetType = this.metricsForm.get('widget_type').value;
    }
    switch (widgetType) {
      case 'host_availability':
        this.createHostGraphs()
        break;
      case 'cloud':
        this.createCloudGraphs()
        break;
      case 'infra_summary':
        this.createInfrasummaryGraphs()
        break;
      case 'cloud_cost':
        this.createCloudCostGraphs()
        break;
      case 'alerts':
        this.createAlertsGraphs()
        break;
      case 'sustainability':
        this.createSustainabilityGraphs()
        break;
      case 'metrices':
        if (this.metricsForm.get('filter_by').value != 'metric') {
          this.createMetricsGraphs();
        } else {
          this.metricesMappingViewData = this.crudService.convertToMetricesMappingData(this.formartMetricesData(), false);
          this.previewWidgetType = 'metric';
        }
        this.metricsPreview = true;
        break;
      case 'device_by_os':
        this.createOsTypeGraphs()
        break;
    }
  }

  createHostGraphs() {
    switch (this.form.get('group_by').value) {
      case 'device_type':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(hostAvailabilityDeviceTypeData);
        this.chartLengendData = hostAvailabilityDeviceTypeData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(hostAvailabilitydatacenterData);
        this.chartLengendData = hostAvailabilitydatacenterData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(hostAvailabilitycloudData);
        this.chartLengendData = hostAvailabilitycloudData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
      case 'status':
        this.chartViewData = this.crudService.convertHostAvailabilityStatusGraphData(hostAvailabilitystatusData);
        this.previewWidgetType = 'chart';
        break;
      case 'tags':
        this.chartViewData = this.crudService.convertHostAvailabilityGraphData(hostAvailabilitytagData);
        this.chartLengendData = hostAvailabilitytagData;
        this.previewWidgetType = 'hostAvailabilityChart';
        break;
    }
  }

  createCloudGraphs() {
    switch (this.form.get('group_by').value) {
      case 'tags':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(tagData);
        this.previewWidgetType = 'chart';
        break;
      case 'locations':
        this.tableViewData = this.crudService.convertToTableData(locationData);
        this.previewWidgetType = 'table';
        this.columns = ['Location', 'Count'];
        break;
      case 'regions':
        this.tableViewData = this.crudService.convertToTableData(regionData);
        this.previewWidgetType = 'table';
        this.columns = ['Region Name', 'Resources'];
        break;
      case 'resource_types':
        this.tableViewData = this.crudService.convertToTableData(resourceData);
        this.previewWidgetType = 'table';
        this.columns = ['Resource Name', 'Count'];
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(cloudData);
        this.previewWidgetType = 'chart';
        break;
    }
  }

  createInfrasummaryGraphs() {
    switch (this.form.get('group_by').value) {
      case 'device_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(deviceTypeData);
        this.previewWidgetType = 'chart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(datacenterData);
        this.previewWidgetType = 'chart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(InfraCloudData, null, 'doughnut', null, true);
        this.previewWidgetType = 'chart';
        break;
      case 'tags':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(tagData);
        this.previewWidgetType = 'chart';
        break;
    }
  }

  createCloudCostGraphs() {
    let unitConfig = { unit: '$', position: 'left' };
    switch (this.form.get('group_by').value) {
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(cloudData, unitConfig);
        this.previewWidgetType = 'chart';
        break;
      case 'account_name':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(accountData, unitConfig);
        this.previewWidgetType = 'chart';
        break;
      case 'regions':
        this.tableViewData = this.crudService.convertToTableData(regionData);
        this.previewWidgetType = 'table';
        this.columns = ['Region Name', 'Cost($)'];
        break;
      case 'service':
        this.tableViewData = this.crudService.convertToTableData(serviceData);
        this.previewWidgetType = 'table';
        this.columns = ['Service Name', 'Cost($)'];
        break;
    }
  }

  createAlertsGraphs() {
    switch (this.form.get('group_by').value) {
      case 'alert_source':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(alertSourceData);
        this.previewWidgetType = 'chart';
        break;
      case 'severity':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(severityData, null, 'doughnut', true);
        this.previewWidgetType = 'chart';
        break;
      case 'device_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(deviceTypeData);
        this.previewWidgetType = 'chart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(datacenterData);
        this.previewWidgetType = 'chart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(cloudData);
        this.previewWidgetType = 'chart';
        break;
      case 'status':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(alertStatusData, null, 'pie');
        this.previewWidgetType = 'chart';
        break;
    }
  }

  createSustainabilityGraphs() {
    let unitConfig = { unit: 'TCo2e', position: 'right' };
    switch (this.form.get('group_by').value) {
      case 'device_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(deviceTypeData, unitConfig);
        this.previewWidgetType = 'chart';
        break;
      case 'datacenter':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(datacenterData, unitConfig);
        this.previewWidgetType = 'chart';
        break;
      case 'cloud_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(cloudData, unitConfig);
        this.previewWidgetType = 'chart';
        break;
      case 'tags':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(tagData, unitConfig);
        this.previewWidgetType = 'chart';
        break;
    }
  }

  createMetricsGraphs() {
    if (this.metricsForm && this.metricsForm.get('period').value == 'latest') {
      if (this.metricsForm.get('graph_type').value == 'network' && this.metricsForm.get('network_group_by').value == 'devices') {
        if (this.metricsForm.get('metrics_network_data').value == 'bandwidth') {
          this.graphTypes.push('bandwidthUtilization');
        } else {
          this.graphTypes.push('networkDevices');
        }
      } else {
        this.graphTypes.push(this.metricsForm.get('graph_type').value + 'Latest');
      }
      this.metricsPreviewViewData.push(this.convertToMetricesData(this.metricsForm.get('graph_type').value + 'Latest'));
    } else {
      this.graphTypes.push(this.metricsForm.get('graph_type').value);
      this.metricsPreviewViewData.push(this.convertToMetricesData(this.metricsForm.get('graph_type').value));
    }
    // if graph_type changes to multiselect
    // this.metricsForm.get('graph_type').value.forEach(val => {
    //   if (this.metricsForm && this.metricsForm.get('period').value == 'latest') {
    //     this.graphTypes.push(val + 'Latest');
    //     this.metricsPreviewViewData.push(this.convertToMetricesData(val + 'Latest'));
    //   } else {
    //     this.graphTypes.push(val);
    //     this.metricsPreviewViewData.push(this.convertToMetricesData(val));
    //   }
    // });
  }

  convertToMetricesData(widget: string) {
    switch (widget) {
      case 'cpuLatest':
        return this.crudService.convertToTableData(CPUHostData);
      case 'memoryLatest':
        return this.crudService.convertToTableData(MemoryHostData);
      case 'storageLatest':
        return this.crudService.convertToTableData(storageHostData);
      case 'networkLatest':
        const hostData = this.manageNetworkColumns();
        return this.crudService.convertToTrafficHostTableData(hostData, this.metricsForm.get('network_group_by').value);
      case 'cpu':
        return this.crudService.convertToLineChartData(cpuGraphData, true);
      case 'memory':
        return this.crudService.convertToLineChartData(cpuGraphData.reverse(), true);
      case 'storage':
        return this.crudService.convertToLineChartData(storageGraphData, true);
      case 'network':
        return this.crudService.convertToLineChartData(storageGraphData.reverse(), true);
    }
  }

  manageNetworkColumns() {
    let hostData = networkTrafficHostData;
    let number = 0.00;
    if (this.metricsForm.get('network_group_by').value == 'interfaces') {
      this.metricesColumns[3] = ['Interface Name', 'Host'];
    } else {
      this.metricesColumns[3] = ['Name'];
    }
    switch (this.metricsForm.get('metrics_network_data').value) {
      case 'receive':
        this.metricesColumns[3].push('Receive');
        return hostData.map(data => {
          number = Math.round((Math.random() * (50 - 10) + 10) * 100) / 100;
          return { ...data, value: `${number} bps` };
        });
      case 'transmit':
        this.metricesColumns[3].push('Transmit');
        return hostData.map(data => {
          number = Math.round((Math.random() * (50 - 10) + 10) * 100) / 100;
          return { ...data, value: `${number} bps` };
        });
      case 'bandwidth':
        this.metricesColumns[3].push('Bandwidth Utilization');
        return hostData.map(data => {
          number = Math.floor(Math.random() * (90 - 10 + 1)) + 10;
          return { ...data, value: `${number}` };
        });
      case 'speed':
        this.metricesColumns[3].push('Speed');
        return hostData.map(data => {
          number = Math.round((Math.random() * (50 - 10) + 10) * 100) / 100;
          return { ...data, value: `${number} mbps` };
        });
      case 'inbound_error':
        this.metricesColumns[3].push('Inbound Error');
        return hostData.map(data => {
          number = Math.round((Math.random() * (50 - 10) + 10) * 100) / 100;
          return { ...data, value: `${number}` };
        });
      case 'inbound_discard':
        this.metricesColumns[3].push('Inbound Discard');
        return hostData.map(data => {
          number = Math.round((Math.random() * (50 - 10) + 10) * 100) / 100;
          return { ...data, value: `${number}` };
        });
      case 'outbound_error':
        this.metricesColumns[3].push('Outbound Error');
        return hostData.map(data => {
          number = Math.round((Math.random() * (50 - 10) + 10) * 100) / 100;
          return { ...data, value: `${number}` };
        });
      case 'outbound_discard':
        this.metricesColumns[3].push('Outbound Discard');
        return hostData.map(data => {
          number = Math.round((Math.random() * (50 - 10) + 10) * 100) / 100;
          return { ...data, value: `${number}` };
        });
    }
  }

  createOsTypeGraphs() {
    switch (this.form.get('group_by').value) {
      case 'os_type':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(osTypeData);
        this.previewWidgetType = 'chart';
        break;
      case 'os_version':
        this.chartViewData = this.crudService.convertToResponsiveDonutChartData(osVersionData);
        this.previewWidgetType = 'chart';
        break;
    }
  }

  //Need to get all icons and names
  getDeviceIcon(device: string) {
    switch (device) {
      case 'switch': return `${FaIconMapping.SWITCH} switches`;
      case 'firewall': return `${FaIconMapping.FIREWALL} firewalls`;
      case 'load_balancer': return `${FaIconMapping.LOAD_BALANCER} lbs`;
      case 'hypervisor': return `${FaIconMapping.HYPERVISOR} hypervisor`;
      case 'bm_server': return `${FaIconMapping.BARE_METAL_SERVER} bms`;
      case 'storage_device': return `${FaIconMapping.STORAGE_DEVICE} storage`;
      case 'mac_device': return `${FaIconMapping.MAC_MINI} mac devices`;
      case 'customdevice': return `${FaIconMapping.OTHER_DEVICES} otherdev`;
      case 'custom_vm': return `${FaIconMapping.VIRTUAL_MACHINE} vms`;
      case 'PDU': return `${FaIconMapping.PDU} pdus`;
      case 'URL': return `${FaIconMapping.URL} text-primary`;
      case 'VM': return `${FaIconMapping.VIRTUAL_MACHINE} vms`;
      case 'cabinet': return `${FaIconMapping.CABINET} cabinets`;
      case 'pod': return `${FaIconMapping.KUBERNETES}`;
      default: return '';
    }
  }

  getDeviceDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'bm_server': return 'Bare Metal';
      case 'vm': return 'VM';
      case 'storage_device': return 'Storage';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      case 'pdu': return 'PDU';
      case 'cabinet': return 'Cabinet';
      default: return deviceType;
    }
  }

  handleError(err: any) {
    this.formErrors = this.crudService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  handleMetricesFormError(err: any) {
    this.metricsFormErrors = this.crudService.resetMetricsFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.metricsForm.controls) {
          this.metricsFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.selectedTab == 'metrices') {
      if (this.metricsForm.invalid) {
        this.metricsFormErrors = this.utilService.validateForm(this.metricsForm, this.metricsValidationMessages, this.metricsFormErrors);
        this.metricsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.metricsFormErrors = this.utilService.validateForm(this.metricsForm, this.metricsValidationMessages, this.metricsFormErrors);
          });
      } else {
        this.manageSubmit(this.metricsForm.getRawValue());
      }
    } else {
      if (this.form.invalid) {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: any) => {
            this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
          });
      } else {
        this.manageSubmit(this.form.getRawValue());
      }
    }
  }

  manageSubmit(formData: any) {
    let obj = Object.assign({}, formData);
    if (this.selectedMetricesList.length) {
      obj['device_items'] = this.formartMetricesData();
    }
    if (this.metricsForm) {
      if (this.metricsForm.get('filter_by').value == 'metric' && !this.selectedMetricesList.length) {
        this.isMetricesMappingInvalid = true;
        return;
      }
    }
    this.spinner.start('main');
    if (this.widgetId) {
      this.crudService.updateWidget(obj, this.widgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.notification.success(new Notification("Widget updated successfully."));
        this.goBack();
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        if (this.metricsForm) {
          this.handleMetricesFormError(err.error);
        } else {
          this.handleError(err.error);
        }
      });
    } else {
      this.crudService.createWidget(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.notification.success(new Notification("Widget created successfully."));
        this.goBack();
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        if (this.metricsForm) {
          this.handleMetricesFormError(err.error);
        } else {
          this.handleError(err.error);
        }
      });
    }
  }

  getWidgetWidth(previewWidgetType: string) {
    switch (previewWidgetType) {
      case PreviewWidgetTypeMapping.HOST_AVAILABILITY: return 'w-45';
      default: return 'w-35';
    }
  }

  getPercentageClass(value: number): string {
    return value < 65 ? 'text-success' : value >= 65 && value < 85 ? 'text-warning' : 'text-danger';
  }

  getMetricesWidgetType(name: string) {
    if (this.metricsForm && this.metricsForm.get('period').value == 'latest') {
      return name + 'Latest';
    } else {
      return name;
    }
  }

  customTooltipHide() {
    if (this.selectedMetricesList.length) {
      this.hideTooltips.forEach((tooltip: ElementRef) => {
        const nativeElement = tooltip.nativeElement;
        if (nativeElement.scrollWidth > nativeElement.clientWidth) {
          this.renderer.removeClass(nativeElement.parentNode, 'custom-tooltip-hide');
        } else {
          this.renderer.addClass(nativeElement.parentNode, 'custom-tooltip-hide');
        }
      });
    }
  }

  onDeviceSelect(index: number) {
    this.metricesMappingViewData[index].isSelected = !this.metricesMappingViewData[index].isSelected;
    this.cdr.detectChanges();
    this.customTooltipHide();
  }

  goBack() {
    if (this.widgetId) {
      this.router.navigate(['../../../', 'widgets'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../', 'widgets'], { relativeTo: this.route });
    }
  }
}