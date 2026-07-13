import { Component, OnDestroy, OnInit } from '@angular/core';
import { DiscoveryDashboardService } from './discovery-dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { CmdbSyncInsightsViewData, DiscoveryDashboardFilterCriteria, DiscoveryDashboardFilterFormValue, DiscoveryDashboardFilterOption, DiscoveryTrendAnalyticsData, DiscoveryTrendAnalyticsItemData, ExecutiveKpiViewData, NewlyDiscoveredDeviceItemViewData, OperatingSystemsItemViewData, RecentSyncConfigItemViewData, ResourceDiscoveryViewData, TopDiscoveryFailuresItemViewData } from './discovery-dashboard.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { HttpErrorResponse } from '@angular/common/http';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'discovery-dashboard',
  templateUrl: './discovery-dashboard.component.html',
  styleUrls: ['./discovery-dashboard.component.scss'],
  providers: [DiscoveryDashboardService]
})
export class DiscoveryDashboardComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();
  private filterFormUnsubscribe = new Subject<void>();
  filterForm: FormGroup;
  filterLoadFailed = false;
  timeRangeOptions: DiscoveryDashboardFilterOption[] = [];
  regionOptions: DiscoveryDashboardFilterOption[] = [];
  discoveryTypeOptions: DiscoveryDashboardFilterOption[] = [];
  discoveryTypeDropdownOptions: string[] = [];
  executiveKpiViewData: ExecutiveKpiViewData = new ExecutiveKpiViewData();
  cmdbSyncInsights: CmdbSyncInsightsViewData = new CmdbSyncInsightsViewData();
  ciDistributionByDeviceChartData: EChartsOption = null;
  ciDistributionChartData: EChartsOption = null;
  ciDistributionLegendItems: Array<{ label: string; color: string }> = [];
  ciDistributionByDiscoveryChartData: EChartsOption = null;
  ciDistributionByDeviceLegendItems: Array<{ label: string; color: string }> = [];
  ciDistributionByDiscoveryLegendItems: Array<{ label: string; color: string }> = [];
  newlyDiscoveredDevices: NewlyDiscoveredDeviceItemViewData[] = [];
  topDiscoveryFailures: TopDiscoveryFailuresItemViewData[] = [];
  operatingSystems: OperatingSystemsItemViewData[] = [];
  recentSyncConfig: RecentSyncConfigItemViewData[] = [];
  newlyDiscoveredDevicesSearch: string = '';
  recentSyncConfigSearch: string = '';
  resourceDiscoveryData: ResourceDiscoveryViewData[] = [];
  cmdbSyncTrend: EChartsOption = null;
  trendAnalyticsChartOptions: EChartsOption = null;
  sucessAndFailureChartOptions: EChartsOption = null;

  appliedFilters: DiscoveryDashboardFilterCriteria = {
    region: [],
    discoveryType: [],
    timeRange: 'last_month'
  };
  loaderNames = {
    filters: 'dashboardFiltersLoader',
    executiveKpis: 'executiveKpisLoader',
    trendAnalytics: 'trendAnalyticsLoader',
    successAndFailure: 'successAndFailureLoader',
    cmdbSyncTrend: 'cmdbSyncTrendLoader',
    cmdbSyncInsights: 'cmdbSyncInsightsLoader',
    ciDistributionByDevice: 'ciDistributionByDeviceLoader',
    ciDistribution: 'ciDistributionLoader',
    ciDistributionByDiscovery: 'ciDistributionByDiscoveryLoader',
    newlyDiscoveredDevices: 'newlyDiscoveredDeviesLoader',
    topDiscoveryFailures: 'topDiscoveryFailures',
    operatingSystems: 'operatingSystemsLoader',
    recentSyncConfig: 'recentSyncConfigLoader',
    resourceDiscovery: 'resourceDiscoveryLoader'

  };
  regionMultiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    maxHeight: '240px'
  };
  regionMultiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select regions',
    allSelected: 'All Selected'
  };
  discoveryTypeMultiselectSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    maxHeight: '240px'
  };
  discoveryTypeMultiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select discovery type',
    allSelected: 'All Selected'
  };

  constructor(private svc: DiscoveryDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.filterFormUnsubscribe.next();
    this.filterFormUnsubscribe.complete();
  }

  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.spinner.start(this.loaderNames.filters);
    this.svc.getFilterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.timeRangeOptions = this.normalizeFilterOptions(res?.time_range);
      this.discoveryTypeOptions = this.normalizeFilterOptions(res?.discovery_type);
      this.discoveryTypeDropdownOptions = this.discoveryTypeOptions.map(option => option.label);
      this.regionOptions = this.convertRegionOptions(res?.regions || []);
      this.appliedFilters.region = this.getDefaultRegionSelectionValues();
      this.appliedFilters.discoveryType = this.getDefaultDiscoveryTypeSelection();
      this.buildFilterForm();
      this.applyFilters();
      this.stopFilterLoader();
      this.loadData();
    }, () => {
      this.filterLoadFailed = true;
      this.notification.error(new Notification('Failed to load discovery dashboard filters. Try again later.'));
      this.stopFilterLoader();
    });
  }

  private hasFilterFormData(): boolean {
    return !!this.filterForm;
  }

  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    setTimeout(() => {
      this.getExecutiveKpiData();
      this.getDiscoveryTrendAnalyticsData();
      this.getDiscoverySuccessandFailureData();
      this.getCmdbSyncTrend();
      this.getCmdbInsightsData();
      this.getCiDistributionByDevice();
      this.getCiDistributionByDiscovery();
      this.getNewlyDiscoveredDevices();
      this.getTopDiscoveryFailures();
      this.getTOperatingSystems();
      this.getRecentSyncConfig();
      this.getCiDistribution();
      this.getResourceDiscovery();
    }, 0);
  }

  getExecutiveKpiData() {
    this.spinner.start(this.loaderNames.executiveKpis);
    this.svc.getExecutiveKpisData(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.executiveKpiViewData = this.svc.convertToExecutiveKpiViewData(res);
        this.spinner.stop(this.loaderNames.executiveKpis);
      }
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  getDiscoveryTrendAnalyticsData() {
    this.spinner.start(this.loaderNames.trendAnalytics);
    this.svc.getDiscoveryTrendAnalyticsData(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.trendAnalyticsChartOptions = this.svc.convertToDiscoveryTrendAnalyticsChartView(res);
          this.spinner.stop(this.loaderNames.trendAnalytics);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  getDiscoverySuccessandFailureData() {
    this.sucessAndFailureChartOptions = null;
    this.spinner.start(this.loaderNames.successAndFailure);
    this.svc.getDiscoverySuccessandFailureData(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.sucessAndFailureChartOptions = this.svc.convertToDiscoverySuccessFailureChartView(res);
        this.spinner.stop(this.loaderNames.successAndFailure);
      }
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  getCmdbInsightsData() {
    this.spinner.start(this.loaderNames.cmdbSyncInsights);
    this.svc.getCmdbInsightsData(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.cmdbSyncInsights = this.svc.convertToCmdbSyncInsightsViewData(res);
        this.spinner.stop(this.loaderNames.cmdbSyncInsights);
      }
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  getCiDistributionByDevice() {
    this.ciDistributionByDeviceChartData = null;
    this.ciDistributionByDeviceLegendItems = [];
    this.spinner.start(this.loaderNames.ciDistributionByDevice);
    this.svc.getCiDistributionByDevice(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.ciDistributionByDeviceChartData = this.svc.convertToCiDistributionByDeviceChartView(res);
          this.ciDistributionByDeviceLegendItems = this.buildCiDistributionLegendItems(this.ciDistributionByDeviceChartData);
          this.spinner.stop(this.loaderNames.ciDistributionByDevice);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  getCiDistributionByDiscovery() {
    this.ciDistributionByDiscoveryChartData = null;
    this.ciDistributionByDiscoveryLegendItems = [];
    this.spinner.start(this.loaderNames.ciDistributionByDiscovery);
    this.svc.getCiDistributionByDicovery(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.ciDistributionByDiscoveryChartData = this.svc.convertToCiDistributionByDiscoveryChartView(res);
          this.ciDistributionByDiscoveryLegendItems = this.buildCiDistributionLegendItems(this.ciDistributionByDiscoveryChartData);
          this.spinner.stop(this.loaderNames.ciDistributionByDiscovery);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  newlyDiscoveredDevicesCount: number
  newlyDiscoveredDevicesPageNo = 1;
  newlyDiscoveredDevicesPageSize = 10;
  newlyDiscoveredDevicesTotal = 0;
  topDiscoveryFailuresCount: number;
  topDiscoveryFailuresPageNo = 1;
  topDiscoveryFailuresPageSize = 10;
  operatingSystemsCount: number;
  operatingSystemsPageNo = 1;
  operatingSystemsPageSize = 10;
  recentSyncConfigCount: number;
  recentSyncConfigPageNo = 1;
  recentSyncConfigPageSize = 10;

  getNewlyDiscoveredDevices() {
    this.newlyDiscoveredDevices = [];
    this.spinner.start(this.loaderNames.newlyDiscoveredDevices);
    this.svc.getNewlyDiscoveredDevices(
      this.newlyDiscoveredDevicesPageNo,
      this.newlyDiscoveredDevicesPageSize,
      this.newlyDiscoveredDevicesSearch,
      this.appliedFilters
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.newlyDiscoveredDevicesCount = res.count;
          this.newlyDiscoveredDevices = this.svc.convertToNewlyDiscoveredDeviceViewData(res.results);
          this.spinner.stop(this.loaderNames.newlyDiscoveredDevices);
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  onNewlyDiscoveredDevicesSearched(event: string) {
    this.newlyDiscoveredDevicesSearch = event;
    this.newlyDiscoveredDevicesPageNo = 1;
    this.getNewlyDiscoveredDevices();
  }

  newlyDiscoveredDevicesPageChange(pageNo: number) {
    if (this.newlyDiscoveredDevicesPageNo === pageNo) {
      return;
    }
    this.newlyDiscoveredDevicesPageNo = pageNo;
    this.getNewlyDiscoveredDevices();
  }

  newlyDiscoveredDevicesPageSizeChange(event: Event) {
    this.newlyDiscoveredDevicesPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.newlyDiscoveredDevicesPageNo = 1;
    this.getNewlyDiscoveredDevices();
  }

  getTopDiscoveryFailures() {
    this.topDiscoveryFailures = [];
    this.spinner.start(this.loaderNames.topDiscoveryFailures);
    this.svc.getTopDiscoveryFailures(this.topDiscoveryFailuresPageNo, this.topDiscoveryFailuresPageSize, this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.topDiscoveryFailuresCount = res.count;
          this.topDiscoveryFailures = this.svc.convertToTopDiscoveryFailuresViewData(res.results);
          this.spinner.stop(this.loaderNames.topDiscoveryFailures);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  topDiscoveryFailuresPageChange(pageNo: number) {
    if (this.topDiscoveryFailuresPageNo === pageNo) {
      return;
    }
    this.topDiscoveryFailuresPageNo = pageNo;
    this.getTopDiscoveryFailures();
  }

  topDiscoveryFailuresPageSizeChange(event: Event) {
    this.topDiscoveryFailuresPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.topDiscoveryFailuresPageNo = 1;
    this.getTopDiscoveryFailures();
  }

  getTOperatingSystems() {
    this.operatingSystems = [];
    this.spinner.start(this.loaderNames.operatingSystems);
    this.svc.getTOperatingSystems(this.operatingSystemsPageNo, this.operatingSystemsPageSize, this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.operatingSystemsCount = res.count;
          this.operatingSystems = this.svc.convertToOperatingSystemsViewData(res.results);
          this.spinner.stop(this.loaderNames.operatingSystems);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  operatingSystemsPageChange(pageNo: number) {
    if (this.operatingSystemsPageNo === pageNo) {
      return;
    }
    this.operatingSystemsPageNo = pageNo;
    this.getTOperatingSystems();
  }

  operatingSystemsPageSizeChange(event: Event) {
    this.operatingSystemsPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.operatingSystemsPageNo = 1;
    this.getTOperatingSystems();
  }

  getRecentSyncConfig() {
    this.recentSyncConfig = [];
    this.spinner.start(this.loaderNames.recentSyncConfig);
    this.svc.getRecentSyncConfig(this.recentSyncConfigPageNo, this.recentSyncConfigPageSize, this.recentSyncConfigSearch, this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.recentSyncConfigCount = res.count;
          this.recentSyncConfig = this.svc.convertToRecentSyncConfigViewData(res.results);
          this.spinner.stop(this.loaderNames.recentSyncConfig);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }


  onRecentSyncConfigSearched(event: string) {
    this.recentSyncConfigSearch = event;
    this.recentSyncConfigPageNo = 1;
    this.getRecentSyncConfig();
  }

  recentSyncConfigPageChange(pageNo: number) {
    if (this.recentSyncConfigPageNo === pageNo) {
      return;
    }
    this.recentSyncConfigPageNo = pageNo;
    this.getRecentSyncConfig();
  }

  recentSyncConfigPageSizeChange(event: Event) {
    this.recentSyncConfigPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.recentSyncConfigPageNo = 1;
    this.getRecentSyncConfig();
  }

  getCmdbSyncTrend() {
    this.cmdbSyncTrend = null;
    this.spinner.start(this.loaderNames.cmdbSyncTrend);
    this.svc.getCmdbSyncTrend(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.cmdbSyncTrend = this.svc.convertToCmdbSyncTrendChartView(res);
          this.spinner.stop(this.loaderNames.cmdbSyncTrend);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  getCiDistribution() {
    this.ciDistributionChartData = null;
    this.ciDistributionLegendItems = [];
    this.spinner.start(this.loaderNames.ciDistribution);
    this.svc.getCiDistribution(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.ciDistributionChartData = this.svc.convertToCiDistributionChartView(res);
          this.ciDistributionLegendItems = this.buildCiDistributionLegendItems(this.ciDistributionChartData);
          this.spinner.stop(this.loaderNames.ciDistribution);
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  getResourceDiscovery() {
    this.resourceDiscoveryData = [];
    this.spinner.start(this.loaderNames.resourceDiscovery);
    this.svc.getResourceDiscovery(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.resourceDiscoveryData = this.svc.convertToResourceDiscoveryViewData(res);
          this.spinner.stop(this.loaderNames.resourceDiscovery);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }




  applyFilters() {
    this.appliedFilters = this.getFilterFormOutput();
  }

  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm(this.getFilterFormDefaults());
    this.watchFilterChanges();
  }

  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.filterLoadFailed = false;
    this.timeRangeOptions = [];
    this.regionOptions = [];
    this.discoveryTypeOptions = [];
    this.discoveryTypeDropdownOptions = [];
    this.executiveKpiViewData = new ExecutiveKpiViewData();
    this.cmdbSyncInsights = new CmdbSyncInsightsViewData();
    this.ciDistributionChartData = null;
    this.ciDistributionLegendItems = [];
    this.ciDistributionByDeviceChartData = null;
    this.ciDistributionByDiscoveryChartData = null;
    this.ciDistributionByDeviceLegendItems = [];
    this.ciDistributionByDiscoveryLegendItems = [];
    this.newlyDiscoveredDevices = [];
    this.topDiscoveryFailures = [];
    this.operatingSystems = [];
    this.recentSyncConfig = [];
    this.resourceDiscoveryData = [];
    this.newlyDiscoveredDevicesCount = 0;
    this.topDiscoveryFailuresCount = 0;
    this.operatingSystemsCount = 0;
    this.recentSyncConfigCount = 0;
    this.cmdbSyncTrend = null;
    this.trendAnalyticsChartOptions = null;
    this.sucessAndFailureChartOptions = null;
    this.appliedFilters = {
      region: [],
      discoveryType: [],
      timeRange: 'last_month'
    };
    this.newlyDiscoveredDevicesSearch = '';
    this.recentSyncConfigSearch = '';
    this.newlyDiscoveredDevicesPageNo = 1;
    this.recentSyncConfigPageNo = 1;
  }

  private getFilterFormOutput(): DiscoveryDashboardFilterCriteria {
    const rawValue = this.filterForm?.getRawValue() || {};
    return {
      region: this.getSelectedRegionValues(rawValue.region),
      discoveryType: this.getSelectedDiscoveryTypeValues(rawValue.discoveryType),
      timeRange: rawValue.timeRange || 'last_month'
    };
  }

  private convertRegionOptions(regions: string[]): DiscoveryDashboardFilterOption[] {
    return (regions || [])
      .filter((region, index, list) => !!region && list.indexOf(region) === index)
      .map(region => ({
        label: this.formatRegionLabel(region),
        value: region
      }));
  }

  private normalizeFilterOptions(
    options?: string | string[] | DiscoveryDashboardFilterOption[]
  ): DiscoveryDashboardFilterOption[] {
    const normalizedOptions = Array.isArray(options)
      ? options
      : options
        ? [options]
        : [];

    return normalizedOptions
      .map(option => {
        if (typeof option === 'string') {
          return {
            label: this.formatFilterOptionLabel(option),
            value: option
          };
        }

        if (option?.value) {
          return {
            label: option.label || this.formatFilterOptionLabel(option.value),
            value: option.value
          };
        }

        return null;
      })
      .filter((option): option is DiscoveryDashboardFilterOption => !!option);
  }

  private formatFilterOptionLabel(value: string): string {
    return String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, match => match.toUpperCase());
  }

  private formatRegionLabel(region: string): string {
    return String(region || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, match => match.toUpperCase());
  }

  private watchFilterChanges() {
    this.filterForm.get('region').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => this.applyFilters());

    this.filterForm.get('discoveryType').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => this.applyFilters());
  }

  private getFilterFormDefaults(): DiscoveryDashboardFilterFormValue {
    return {
      region: this.getSelectedRegionOptions(this.appliedFilters.region),
      discoveryType: this.getSelectedDiscoveryTypeLabels(this.appliedFilters.discoveryType),
      timeRange: this.appliedFilters.timeRange
    };
  }

  private getDefaultRegionSelection(): DiscoveryDashboardFilterOption[] {
    return this.regionOptions;
  }

  private getDefaultRegionSelectionValues(): string[] {
    return ['all'];
  }

  private getSelectedRegionOptions(selectedValues: string[]): DiscoveryDashboardFilterOption[] {
    if (this.isAllSelection(selectedValues)) {
      return this.getDefaultRegionSelection();
    }

    const nextOptions = this.regionOptions.filter(option => (selectedValues || []).includes(option.value));
    return nextOptions.length ? nextOptions : this.getDefaultRegionSelection();
  }

  private getSelectedRegionValues(selectedOptions: DiscoveryDashboardFilterOption[]): string[] {
    const selectedValues = (selectedOptions || [])
      .map(option => option?.value)
      .filter(value => !!value);

    if (!selectedValues.length || selectedValues.length === this.regionOptions.length) {
      return this.getDefaultRegionSelectionValues();
    }

    return selectedValues;
  }

  private getDefaultDiscoveryTypeSelection(): string[] {
    return ['all'];
  }

  private getSelectedDiscoveryTypeLabels(selectedValues: string[]): string[] {
    if (this.isAllSelection(selectedValues)) {
      return [...this.discoveryTypeDropdownOptions];
    }

    const selectedLabels = this.discoveryTypeOptions
      .filter(option => (selectedValues || []).includes(option.value))
      .map(option => option.label);

    if (!selectedLabels.length) {
      return [...this.discoveryTypeDropdownOptions];
    }

    return selectedLabels;
  }

  private getSelectedDiscoveryTypeValues(selectedLabels: string[]): string[] {
    const selectedValues = (selectedLabels || [])
      .map(label => this.discoveryTypeOptions.find(option => option.label === label)?.value)
      .filter((value): value is string => !!value);

    if (!selectedValues.length || selectedValues.length === this.discoveryTypeOptions.length) {
      return this.getDefaultDiscoveryTypeSelection();
    }

    return selectedValues;
  }

  private isAllSelection(selectedValues: string[]): boolean {
    return !selectedValues?.length || selectedValues.includes('all');
  }

  private stopFilterLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.filters), 4);
  }

  private stopTrendAnalyticsLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.trendAnalytics), 4);
  }

  private stopSuccessAndFailureLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.successAndFailure), 4);
  }

  private stopCmdbSyncTrendLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.cmdbSyncTrend), 4);
  }

  private stopCmdbSyncInsightsLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.cmdbSyncInsights), 4);
  }

  private stopCiDistributionByDeviceLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.ciDistributionByDevice), 4);
  }

  private stopCiDistributionLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.ciDistribution), 4);
  }

  private stopCiDistributionByDiscoveryLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.ciDistributionByDiscovery), 4);
  }

  private stopNewlyDiscoveredDevicesLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.newlyDiscoveredDevices), 4);
  }

  private stopTopDiscoveryFailuresLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.topDiscoveryFailures), 4);
  }

  private stopOperatingSystemsLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.operatingSystems), 4);
  }

  private stopRecentSyncConfigLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.recentSyncConfig), 4);
  }

  private stopResourceDiscoveryLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.resourceDiscovery), 4);
  }

  private buildCiDistributionLegendItems(chartOptions: EChartsOption): Array<{ label: string; color: string }> {
    const palette = Array.isArray(chartOptions?.color) ? chartOptions.color as string[] : [];
    const series = Array.isArray(chartOptions?.series) ? chartOptions.series[0] as { data?: Array<{ name: string; itemStyle?: { color?: string } }> } : null;
    const data = series?.data || [];

    return data.map((item, index) => ({
      label: item?.name || '',
      color: item?.itemStyle?.color || palette[index % palette.length] || '#3b82f6'
    }));
  }

}
