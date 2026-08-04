import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { EChartsOption } from 'echarts';
import { forkJoin, Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';
import { PublicCloudComputeDashboardService } from './public-cloud-compute-dashboard.service';
import {
  PUBLIC_CLOUD_DATABASE_CAPACITY_DEFAULT_SORT,
  PUBLIC_CLOUD_STORAGE_RESOURCE_DEFAULT_SORT,
  PUBLIC_CLOUD_DATABASE_OVERVIEW_SORT_COLUMNS,
  PUBLIC_CLOUD_DATABASE_SPACE_SORT_COLUMNS,
  PUBLIC_CLOUD_PERFORMANCE_HOTSPOTS_DEFAULT_SORT,
  PUBLIC_CLOUD_STORAGE_RESOURCE_SORT_COLUMNS,
  PUBLIC_CLOUD_STORAGE_PERFORMANCE_METRICS,
  PUBLIC_CLOUD_STORAGE_STATUS_LEGEND,
  PUBLIC_CLOUD_TIME_RANGE_DEFAULT,
  PUBLIC_CLOUD_TIME_RANGE_OPTIONS
} from './public-cloud-compute-dashboard.const';
import {
  PublicCloudAccountOption,
  PublicCloudAlertSummaryMetric,
  PublicCloudCoverageCard,
  PublicCloudCoverageGroup,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDashboardFilterOptions,
  PublicCloudDatabaseKpi,
  PublicCloudDatabaseOverviewRow,
  PublicCloudDatabaseSpaceRow,
  PublicCloudFilterOption,
  PublicCloudIdleDeviceRow,
  PublicCloudIdleDurationItem,
  PublicCloudInventorySummaryKey,
  PublicCloudOrphanedCategoryItem,
  PublicCloudOrphanedDeviceRow,
  PublicCloudPerformanceHotspotRow,
  PublicCloudProviderDistributionKey,
  PublicCloudProviderDistributionItem,
  PublicCloudRecentAlert,
  PublicCloudRegionOption,
  PublicCloudSortState,
  PublicCloudStoragePerformanceCard,
  PublicCloudStorageResourceRow,
  PublicCloudWritePerformanceViewData,
  PublicCloudLatencyBreakdownViewData,
  PublicCloudSummaryMetric,
  PublicCloudTagItem
} from './public-cloud-compute-dashboard.type';

interface PublicCloudFilterScopeSummary {
  primaryLabel: string;
  remainingLabels: string[];
}

interface PublicCloudWidgetLoadingState {
  inventorySummary: boolean;
  geoDistribution: boolean;
  publicCloudCoverage: boolean;
  performanceHotspots: boolean;
  orphanedDevices: boolean;
  orphanedByCategory: boolean;
  idleDevices: boolean;
  idleDuration: boolean;
  recentAlerts: boolean;
  databaseOverview: boolean;
  databasePerformanceTrend: boolean;
  databaseSpaceConsumption: boolean;
  databaseCapacityResources: boolean;
  storagePerformance: boolean;
  storageResources: boolean;
  writePerformanceTrend: boolean;
  latencyBreakdown: boolean;
}

@Component({
  selector: 'public-cloud-compute-dashboard',
  templateUrl: './public-cloud-compute-dashboard.component.html',
  styleUrls: ['./public-cloud-compute-dashboard.component.scss'],
  providers: [PublicCloudComputeDashboardService]
})
export class PublicCloudComputeDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private filterFormUnsubscribe = new Subject<void>();
  private allAccountOptions: PublicCloudAccountOption[] = [];
  private readonly widgetLoadingKeys: Array<keyof PublicCloudWidgetLoadingState> = [
    'inventorySummary',
    'geoDistribution',
    'publicCloudCoverage',
    'performanceHotspots',
    'orphanedDevices',
    'orphanedByCategory',
    'idleDevices',
    'idleDuration',
    'recentAlerts',
    'databaseOverview',
    'databasePerformanceTrend',
    'databaseSpaceConsumption',
    'databaseCapacityResources',
    'storagePerformance',
    'storageResources',
    'writePerformanceTrend',
    'latencyBreakdown'
  ];
  private readonly linkRoutes = {
    publicCloud: ['/unitycloud/publiccloud'],
    devices: ['/unitycloud/devices'],
    vmAll: ['/unitycloud/devices/vms/allvms'],
    alerts: ['/services/aiml-event-mgmt/alerts'],
    gpu: ['/services/ai-observability/gpu'],
    storage: ['/unitycloud/devices/storagedevices'],
    databases: ['/unitycloud/devices/databases'],
    bmservers: ['/unitycloud/devices/bmservers'],
    provider: {
      aws: ['/unitycloud/publiccloud/aws'],
      azure: ['/unitycloud/publiccloud/azure'],
      gcp: ['/unitycloud/publiccloud/gcp'],
      oci: ['/unitycloud/publiccloud/oracle'],
      oracle: ['/unitycloud/publiccloud/oracle']
    },
    providerVm: {
      aws: ['/unitycloud/devices/vms/aws'],
      azure: ['/unitycloud/devices/vms/azure'],
      gcp: ['/unitycloud/devices/vms/gcp'],
      oracle: ['/unitycloud/devices/vms/oracle']
    }
  };

  filterForm: FormGroup;
  platformOptions: PublicCloudFilterOption[] = [];
  regionOptions: PublicCloudRegionOption[] = [];
  accountOptions: PublicCloudAccountOption[] = [];
  filtersUnavailable = false;
  refreshedText = '';
  // Global Time Range live selection (applied to every widget only on Apply).
  readonly timeRangeOptions = PUBLIC_CLOUD_TIME_RANGE_OPTIONS;
  selectedTimeRange: string = PUBLIC_CLOUD_TIME_RANGE_DEFAULT;
  private selectedTimeRangeDates: { from: string; to: string } | null = null;
  appliedFilterCriteria: PublicCloudDashboardFilterCriteria = {
    platforms: [],
    regions: [],
    accounts: [],
    timeRange: PUBLIC_CLOUD_TIME_RANGE_DEFAULT
  };

  summaryMetrics: PublicCloudSummaryMetric[] = [];
  providerDistribution: PublicCloudProviderDistributionItem[] = [];
  providerDistributionOptions: EChartsOption = {};
  tags: PublicCloudTagItem[] = [];
  geoHeatmapOptions: EChartsOption = {};
  publicCloudCoverageGroups: PublicCloudCoverageGroup[] = [];
  publicCloudCoverageTotal = '0';
  performanceHotspots: PublicCloudPerformanceHotspotRow[] = [];
  performanceHotspotsSort = PUBLIC_CLOUD_PERFORMANCE_HOTSPOTS_DEFAULT_SORT;
  performanceHotspotsLoaded = false;
  orphanedDevices: PublicCloudOrphanedDeviceRow[] = [];
  orphanedDevicesTotal = 0;
  orphanedDevicesPageNo = 1;
  orphanedDevicesPageSize = 10;
  orphanedByCategory: PublicCloudOrphanedCategoryItem[] = [];
  orphanedByCategoryOptions: EChartsOption = {};
  orphanedByCategoryHasData = false;
  idleDevices: PublicCloudIdleDeviceRow[] = [];
  idleDevicesTotal = 0;
  idleDevicesPageNo = 1;
  idleDevicesPageSize = 10;
  idleDurationRows: PublicCloudIdleDurationItem[] = [];
  idleDurationOptions: EChartsOption = {};
  idleDurationHasData = false;
  databaseOverviewKpis: PublicCloudDatabaseKpi[] = [];
  databaseOverviewRows: PublicCloudDatabaseOverviewRow[] = [];
  databaseOverviewSort: PublicCloudSortState = { key: 'writeThroughput', direction: 'desc' };
  databaseOverviewSortColumns = PUBLIC_CLOUD_DATABASE_OVERVIEW_SORT_COLUMNS;
  databaseWritePerformanceOptions: EChartsOption = {};
  databaseReadPerformanceOptions: EChartsOption = {};
  databaseTrendHasData = false;
  databaseWriteTrendHasData = false;
  databaseReadTrendHasData = false;
  databaseSpaceKpis: PublicCloudDatabaseKpi[] = [];
  databaseSpaceRows: PublicCloudDatabaseSpaceRow[] = [];
  databaseSpaceSortColumns = PUBLIC_CLOUD_DATABASE_SPACE_SORT_COLUMNS;
  databaseCapacitySort = PUBLIC_CLOUD_DATABASE_CAPACITY_DEFAULT_SORT;
  storagePerformanceCards: PublicCloudStoragePerformanceCard[] = [];
  storageResources: PublicCloudStorageResourceRow[] = [];
  storageResourceSortColumns = PUBLIC_CLOUD_STORAGE_RESOURCE_SORT_COLUMNS;
  storageResourcesSort = PUBLIC_CLOUD_STORAGE_RESOURCE_DEFAULT_SORT;
  storageStatusLegend = PUBLIC_CLOUD_STORAGE_STATUS_LEGEND;
  writePerformanceTrend: PublicCloudWritePerformanceViewData = { labels: [], rows: [] };
  latencyBreakdown: PublicCloudLatencyBreakdownViewData = null;
  latencyBreakdownOptions: EChartsOption = {};
  recentAlertSummaryMetrics: PublicCloudAlertSummaryMetric[] = [];
  recentAlerts: PublicCloudRecentAlert[] = [];
  widgetLoading: PublicCloudWidgetLoadingState = {
    inventorySummary: false,
    geoDistribution: false,
    publicCloudCoverage: false,
    performanceHotspots: false,
    orphanedDevices: false,
    orphanedByCategory: false,
    idleDevices: false,
    idleDuration: false,
    recentAlerts: false,
    databaseOverview: false,
    databasePerformanceTrend: false,
    databaseSpaceConsumption: false,
    databaseCapacityResources: false,
    storagePerformance: false,
    storageResources: false,
    writePerformanceTrend: false,
    latencyBreakdown: false
  };

  loaderNames = {
    filters: 'publicCloudFiltersLoader',
    inventoryCard: 'publicCloudInventoryCardLoader',
    publicCloudCoverage: 'publicCloudInfraCoverageLoader',
    performanceHotspots: 'publicCloudPerformanceHotspotsLoader',
    orphanedDevices: 'publicCloudOrphanedDevicesLoader',
    orphanedDevicesByCategory: 'publicCloudOrphanedDevicesByCategoryLoader',
    idleDevices: 'publicCloudIdleDevicesLoader',
    idleDuration: 'publicCloudIdleDurationLoader',
    databaseOverview: 'publicCloudDatabaseOverviewLoader',
    databasePerformanceTrend: 'publicCloudDatabasePerformanceTrendLoader',
    databaseSpaceConsumption: 'publicCloudDatabaseSpaceConsumptionLoader',
    databaseCapacityResources: 'publicCloudDatabaseCapacityResourcesLoader',
    storagePerformance: 'publicCloudStoragePerformanceLoader',
    storageResources: 'publicCloudStorageResourcesLoader',
    writePerformanceTrend: 'publicCloudWritePerformanceTrendLoader',
    latencyBreakdown: 'publicCloudLatencyBreakdownLoader',
    recentAlertSummary: 'publicCloudRecentAlertSummaryLoader',
    recentAlerts: 'publicCloudRecentAlertsLoader'
  };

  multiselectSettings: IMultiSelectSettings = {
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

  multiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected'
  };

  constructor(private svc: PublicCloudComputeDashboardService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private alertDetailSvc: AimlAlertDetailsService) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.filterFormUnsubscribe.next();
    this.filterFormUnsubscribe.complete();
  }

  /** Applies the current filter form output to every widget request. */
  applyFilters() {
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.updateAppliedFilterCriteria();
    this.loadData();
  }

  /** Captures the global Time Range selection (named period or custom range). Applied to widgets only on Apply. */
  onTimeRangeChange(event: { period?: string; from?: string | Date; to?: string | Date }) {
    this.selectedTimeRange = event?.period || this.selectedTimeRange;
    this.selectedTimeRangeDates = event?.period === 'custom'
      ? { from: this.formatTimeRangeDate(event?.from, false), to: this.formatTimeRangeDate(event?.to, true) }
      : null;
  }

  /** Formats a custom-range boundary as UTC ISO-8601 (e.g. 2026-07-01T00:00:00Z) for start_datetime / end_datetime. */
  private formatTimeRangeDate(value: string | Date | undefined, isEnd: boolean): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${isEnd ? '23:59:59' : '00:00:00'}Z`;
  }

  /** Reloads the page filters from the source sequence and then refreshes all widgets. */
  refreshData() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Reloads all filter options and recreates the filter form before widgets are refreshed. */
  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Loads filter options first, then creates the filter form and starts widget loading. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.refreshedText = this.getCurrentRefreshedText();
    this.spinnerService.start(this.loaderNames.filters);
    this.svc.getFilterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.applyFilterOptionsAndDashboard(res);
    }, () => {
      this.showDashboardNoDataState();
    });
  }

  /** Applies loaded filter options, creates default selections, and starts dashboard loading. */
  private applyFilterOptionsAndDashboard(filterOptions: PublicCloudDashboardFilterOptions) {
    if (!this.hasUsableFilterOptions(filterOptions)) {
      this.showDashboardNoDataState();
      return;
    }
    this.platformOptions = filterOptions?.platforms || [];
    this.regionOptions = filterOptions?.regions || [];
    this.allAccountOptions = filterOptions?.accounts || [];
    this.accountOptions = this.svc.filterAccountsForSelection(
      this.allAccountOptions,
      this.getValuesFromOptions(this.platformOptions),
      this.getValuesFromOptions(this.regionOptions)
    );
    this.buildFilterForm();
    this.updateAppliedFilterCriteria();
    this.stopFilterLoader();
    this.loadData();
  }

  /** Confirms the filter API returned enough option data to drive widget requests. */
  private hasUsableFilterOptions(filterOptions: PublicCloudDashboardFilterOptions): boolean {
    return !!filterOptions?.platforms?.length && !!filterOptions?.regions?.length;
  }

  /** Shows the dashboard-level empty state when filters cannot be loaded from the API. */
  private showDashboardNoDataState() {
    this.filtersUnavailable = true;
    this.filterForm = null;
    this.clearDashboardViewData();
    this.clearWidgetLoadingState();
    this.stopFilterLoader();
  }

  /** Wires dependent filter changes without reloading widgets until the filter button is clicked. */
  private watchFilterChanges() {
    this.filterForm.get('platforms').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.spinnerService.start(this.loaderNames.filters);
        this.loadRegionOptionsForForm();
      });

    this.filterForm.get('regions').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => {
        this.spinnerService.start(this.loaderNames.filters);
        this.loadAccountOptionsForForm();
      });
  }

  /** Refreshes region options for the current platform selections and keeps still-valid region selections. */
  private loadRegionOptionsForForm() {
    this.patchSelectedOptions('regions', this.regionOptions);
    this.loadAccountOptionsForForm();
  }

  /** Refreshes account options for the current platform and region selections and keeps still-valid account selections. */
  private loadAccountOptionsForForm() {
    this.accountOptions = this.svc.filterAccountsForSelection(this.allAccountOptions, this.getSelectedValues('platforms'), this.getSelectedValues('regions'));
    this.patchSelectedOptions('accounts', this.accountOptions);
    this.stopFilterLoader();
  }

  /** Creates the filter form with all currently loaded filter options selected by default. */
  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm(this.platformOptions, this.regionOptions, this.accountOptions);
    this.onTimeRangeChange({ period: this.selectedTimeRange });
    this.watchFilterChanges();
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.orphanedDevicesPageNo = 1;
    this.idleDevicesPageNo = 1;
    this.platformOptions = [];
    this.regionOptions = [];
    this.accountOptions = [];
    this.allAccountOptions = [];
    this.filtersUnavailable = false;
    this.selectedTimeRange = PUBLIC_CLOUD_TIME_RANGE_DEFAULT;
    this.selectedTimeRangeDates = null;
    this.appliedFilterCriteria = {
      platforms: [],
      regions: [],
      accounts: [],
      timeRange: PUBLIC_CLOUD_TIME_RANGE_DEFAULT
    };
  }

  /** Keeps current selections when still available; if none remain, dependent options default to all available options. */
  private patchSelectedOptions(controlName: string, options: PublicCloudFilterOption[]) {
    const selectedValues = this.getSelectedValues(controlName);
    let nextValue: PublicCloudFilterOption[] = [];
    if (selectedValues.length) {
      const selectedOptions = options.filter(option => selectedValues.includes(option.value));
      nextValue = selectedOptions.length ? selectedOptions : options;
    }
    this.setControlValue(controlName, nextValue);
  }

  /** Sets a filter control value without triggering dependent filter subscriptions. */
  private setControlValue(controlName: string, value: PublicCloudFilterOption[]) {
    this.filterForm.get(controlName).setValue(value, { emitEvent: false });
  }

  /** Reads selected option values from a filter form control. */
  private getSelectedValues(controlName: string): string[] {
    const values = this.filterForm?.get(controlName)?.value || [];
    return this.getValuesFromOptions(values);
  }

  /** Normalizes selected filter option objects into API-friendly string values. */
  private getValuesFromOptions(options: Array<PublicCloudFilterOption | string>): string[] {
    return (options || [])
      .map((item: PublicCloudFilterOption | string) => typeof item === 'string' ? item : item?.value)
      .filter((value: string | undefined) => !!value) as string[];
  }

  /** Returns the normalized filter form output passed to all dashboard service calls. */
  private getFilterFormOutput(): PublicCloudDashboardFilterCriteria {
    const isCustom = this.selectedTimeRange === 'custom';
    return {
      platforms: this.getSelectedValues('platforms'),
      regions: this.getSelectedValues('regions'),
      accounts: this.getSelectedValues('accounts'),
      timeRange: this.selectedTimeRange,
      startDate: isCustom ? (this.selectedTimeRangeDates?.from || '') : '',
      endDate: isCustom ? (this.selectedTimeRangeDates?.to || '') : ''
    };
  }

  /** Stores the filter set currently driving the rendered widget data. */
  private updateAppliedFilterCriteria() {
    this.appliedFilterCriteria = this.getFilterFormOutput();
  }

  /** Confirms the filter form exists and has loaded option data before widget APIs are called. */
  private hasFilterFormData(): boolean {
    return !!this.filterForm;
  }

  /** Stops the top filter loader in the next tick so synchronous static responses still render the loader correctly. */
  private stopFilterLoader() {
    setTimeout(() => this.spinnerService.stop(this.loaderNames.filters), 0);
  }

  get platformScopeSummary(): PublicCloudFilterScopeSummary {
    return this.getScopeSummary(this.platformOptions, this.appliedFilterCriteria.platforms, 'No providers');
  }

  get regionScopeSummary(): PublicCloudFilterScopeSummary {
    return this.getScopeSummary(this.regionOptions, this.appliedFilterCriteria.regions, 'No regions');
  }

  get accountScopeSummary(): PublicCloudFilterScopeSummary {
    return this.getScopeSummary(this.allAccountOptions, this.appliedFilterCriteria.accounts, 'No accounts');
  }

  private getScopeSummary(options: PublicCloudFilterOption[], selectedValues: string[], emptyLabel: string): PublicCloudFilterScopeSummary {
    const labels = (selectedValues || [])
      .map(value => options?.find(option => option.value === value)?.label || value)
      .filter(label => !!label);
    if (!labels.length) {
      return {
        primaryLabel: emptyLabel,
        remainingLabels: []
      };
    }
    return {
      primaryLabel: labels[0],
      remainingLabels: labels.slice(1)
    };
  }

  private getCurrentRefreshedText(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `Today ${hours}:${minutes} IST`;
  }

  /** Loads all dashboard widgets only after the filter form exists and has loaded filter data. */
  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    const filterFormOutput = this.appliedFilterCriteria;
    this.startWidgetLoadingState();
    setTimeout(() => {
      this.getInventorySummary(filterFormOutput);
      this.getGeoDistribution(filterFormOutput);
      this.getPublicCloudCoverage(filterFormOutput);
      this.getPerformanceHotspots(filterFormOutput);
      this.getDatabaseOverview(filterFormOutput);
      this.getDatabasePerformanceTrend(filterFormOutput);
      this.getDatabaseSpaceConsumption(filterFormOutput);
      this.getDatabaseCapacityResources(filterFormOutput);
      this.getStoragePerformance(filterFormOutput);
      this.getStorageResources(filterFormOutput);
      this.getWritePerformanceTrend(filterFormOutput);
      this.getLatencyBreakdown(filterFormOutput);
      this.getOrphanedDevices(filterFormOutput);
      this.getOrphanedDevicesByCategory(filterFormOutput);
      this.getIdleDevices(filterFormOutput);
      this.getIdleDevicesByDuration(filterFormOutput);
      this.getRecentAlerts(filterFormOutput);
    }, 0);
  }

  // The inventory card shares one loader with getGeoDistribution: the spinner service is
  // reference-counted, so the single overlay hides only after BOTH requests finish.
  getInventorySummary(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearInventorySummaryViewData();
    this.widgetLoading.inventorySummary = true;
    this.loadWidget(this.loaderNames.inventoryCard, this.svc.getInventorySummary(filterFormOutput), res => {
      this.summaryMetrics = this.svc.convertToSummaryMetricsViewData(res);
      this.providerDistribution = this.svc.convertToProviderDistributionViewData(res);
      this.providerDistributionOptions = this.svc.convertToProviderDistributionOptions(this.providerDistribution);
      this.tags = this.svc.convertToTagsViewData(res);
    }, () => {
      this.clearInventorySummaryViewData();
    }, () => this.widgetLoading.inventorySummary = false);
  }

  private clearInventorySummaryViewData() {
    this.summaryMetrics = [];
    this.providerDistribution = [];
    this.providerDistributionOptions = {};
    this.tags = [];
  }

  getGeoDistribution(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.geoHeatmapOptions = {};
    this.widgetLoading.geoDistribution = true;
    this.loadWidget(this.loaderNames.inventoryCard, this.svc.getGeoDistribution(filterFormOutput), res => {
      this.geoHeatmapOptions = this.svc.convertToGeoHeatmapOptions(res);
    }, () => {
      this.geoHeatmapOptions = {};
    }, () => this.widgetLoading.geoDistribution = false);
  }

  getPublicCloudCoverage(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.publicCloudCoverageGroups = [];
    this.publicCloudCoverageTotal = '0';
    this.widgetLoading.publicCloudCoverage = true;
    this.loadWidget(this.loaderNames.publicCloudCoverage, this.svc.getPublicCloudCoverage(filterFormOutput), res => {
      this.publicCloudCoverageGroups = this.svc.convertToCoverageGroupsViewData(res);
      this.publicCloudCoverageTotal = this.svc.getCoverageGroupsResourceTotal(this.publicCloudCoverageGroups);
    }, () => {
      this.publicCloudCoverageGroups = [];
      this.publicCloudCoverageTotal = '0';
    }, () => this.widgetLoading.publicCloudCoverage = false);
  }

  getPerformanceHotspots(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.performanceHotspots = [];
    this.widgetLoading.performanceHotspots = true;
    this.loadWidget(this.loaderNames.performanceHotspots, this.svc.getPerformanceHotspots(filterFormOutput, this.performanceHotspotsSort), res => {
      this.performanceHotspots = res;
    }, () => {
      this.performanceHotspots = [];
    }, () => {
      this.widgetLoading.performanceHotspots = false;
      this.performanceHotspotsLoaded = true;
    });
  }

  sortPerformanceHotspots(sortKey: string) {
    if (this.performanceHotspotsSort === sortKey) {
      return;
    }
    this.performanceHotspotsSort = sortKey;
    this.getPerformanceHotspots(this.appliedFilterCriteria);
  }

  isHotspotSortActive(sortKey: string): boolean {
    return this.performanceHotspotsSort === sortKey;
  }

  getDatabaseOverview(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseOverviewKpis = [];
    this.databaseOverviewRows = [];
    this.widgetLoading.databaseOverview = true;
    this.loadWidget(this.loaderNames.databaseOverview, this.svc.getDatabaseOverview(filterFormOutput), res => {
      this.databaseOverviewKpis = this.svc.convertToDatabaseOverviewKpis(res);
      this.databaseOverviewRows = this.sortRows(this.svc.convertToDatabaseOverviewRows(res), this.databaseOverviewSort);
    }, () => {
      this.databaseOverviewKpis = [];
      this.databaseOverviewRows = [];
    }, () => this.widgetLoading.databaseOverview = false);
  }

  getDatabasePerformanceTrend(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseWritePerformanceOptions = {};
    this.databaseReadPerformanceOptions = {};
    this.databaseTrendHasData = false;
    this.databaseWriteTrendHasData = false;
    this.databaseReadTrendHasData = false;
    this.widgetLoading.databasePerformanceTrend = true;
    const trend$ = forkJoin([this.svc.getDatabaseWriteTrend(filterFormOutput), this.svc.getDatabaseReadTrend(filterFormOutput)]);
    this.loadWidget(this.loaderNames.databasePerformanceTrend, trend$, ([writeRes, readRes]) => {
      const hasWrite = this.svc.hasDatabaseTrendSeries(writeRes);
      const hasRead = this.svc.hasDatabaseTrendSeries(readRes);
      this.databaseTrendHasData = hasWrite || hasRead;
      this.databaseWriteTrendHasData = hasWrite;
      this.databaseReadTrendHasData = hasRead;
      this.databaseWritePerformanceOptions = hasWrite ? this.svc.convertToDatabaseWritePerformanceOptions(writeRes) : {};
      this.databaseReadPerformanceOptions = hasRead ? this.svc.convertToDatabaseReadPerformanceOptions(readRes) : {};
    }, () => {
      this.databaseWritePerformanceOptions = {};
      this.databaseReadPerformanceOptions = {};
      this.databaseTrendHasData = false;
      this.databaseWriteTrendHasData = false;
      this.databaseReadTrendHasData = false;
    }, () => this.widgetLoading.databasePerformanceTrend = false);
  }

  getDatabaseSpaceConsumption(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseSpaceKpis = [];
    this.widgetLoading.databaseSpaceConsumption = true;
    this.loadWidget(this.loaderNames.databaseSpaceConsumption, this.svc.getDatabaseSpaceConsumption(filterFormOutput), res => {
      this.databaseSpaceKpis = this.svc.convertToDatabaseSpaceKpis(res);
    }, () => {
      this.databaseSpaceKpis = [];
    }, () => this.widgetLoading.databaseSpaceConsumption = false);
  }

  getDatabaseCapacityResources(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseSpaceRows = [];
    this.widgetLoading.databaseCapacityResources = true;
    this.loadWidget(this.loaderNames.databaseCapacityResources, this.svc.getDatabaseCapacityResources(filterFormOutput, this.databaseCapacitySort), res => {
      this.databaseSpaceRows = this.svc.convertToDatabaseCapacityRows(res);
    }, () => {
      this.databaseSpaceRows = [];
    }, () => this.widgetLoading.databaseCapacityResources = false);
  }

  getStoragePerformance(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.storagePerformanceCards = [];
    this.widgetLoading.storagePerformance = true;
    const cards$ = forkJoin(
      PUBLIC_CLOUD_STORAGE_PERFORMANCE_METRICS.map(metric => this.svc.getStoragePerformanceMetric(metric.endpoint, filterFormOutput))
    );
    this.loadWidget(this.loaderNames.storagePerformance, cards$, results => {
      this.storagePerformanceCards = results.map((res, index) => {
        const metric = PUBLIC_CLOUD_STORAGE_PERFORMANCE_METRICS[index];
        return metric.kind === 'highLatency'
          ? this.svc.convertToStorageHighLatencyCard(res, metric.color)
          : this.svc.convertToStorageTrendCard(res, metric.color);
      }).filter(card => card.hasData);
    }, () => {
      this.storagePerformanceCards = [];
    }, () => this.widgetLoading.storagePerformance = false);
  }

  getStorageResources(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.storageResources = [];
    this.widgetLoading.storageResources = true;
    this.loadWidget(this.loaderNames.storageResources, this.svc.getStorageResources(filterFormOutput, this.storageResourcesSort), res => {
      this.storageResources = this.svc.convertToStorageResourceRows(res);
    }, () => {
      this.storageResources = [];
    }, () => this.widgetLoading.storageResources = false);
  }

  getWritePerformanceTrend(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.writePerformanceTrend = { labels: [], rows: [] };
    this.widgetLoading.writePerformanceTrend = true;
    this.loadWidget(this.loaderNames.writePerformanceTrend, this.svc.getWritePerformanceTrend(filterFormOutput), res => {
      this.writePerformanceTrend = this.svc.convertToWritePerformanceViewData(res);
    }, () => {
      this.writePerformanceTrend = { labels: [], rows: [] };
    }, () => this.widgetLoading.writePerformanceTrend = false);
  }

  getLatencyBreakdown(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.latencyBreakdown = null;
    this.latencyBreakdownOptions = {};
    this.widgetLoading.latencyBreakdown = true;
    this.loadWidget(this.loaderNames.latencyBreakdown, this.svc.getLatencyBreakdown(filterFormOutput), res => {
      this.latencyBreakdown = this.svc.convertToLatencyBreakdownViewData(res);
      this.latencyBreakdownOptions = this.latencyBreakdown.hasData ? this.svc.convertToLatencyBreakdownOptions(this.latencyBreakdown) : {};
    }, () => {
      this.latencyBreakdown = null;
      this.latencyBreakdownOptions = {};
    }, () => this.widgetLoading.latencyBreakdown = false);
  }

  sortDatabaseOverview(key: string) {
    this.databaseOverviewSort = this.nextSortState(this.databaseOverviewSort, key);
    this.databaseOverviewRows = this.sortRows(this.databaseOverviewRows, this.databaseOverviewSort);
  }

  sortDatabaseCapacity(sortBy?: string) {
    if (!sortBy || this.databaseCapacitySort === sortBy) {
      return;
    }
    this.databaseCapacitySort = sortBy;
    this.getDatabaseCapacityResources(this.appliedFilterCriteria);
  }

  isCapacitySortActive(sortBy?: string): boolean {
    return !!sortBy && this.databaseCapacitySort === sortBy;
  }

  sortStorageResources(sortBy?: string) {
    if (!sortBy || this.storageResourcesSort === sortBy) {
      return;
    }
    this.storageResourcesSort = sortBy;
    this.getStorageResources(this.appliedFilterCriteria);
  }

  isStorageSortActive(sortBy?: string): boolean {
    return !!sortBy && this.storageResourcesSort === sortBy;
  }

  getSortIconClass(sort: PublicCloudSortState, key: string): string {
    if (sort.key !== key) {
      return 'fas fa-sort';
    }
    return sort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  private nextSortState(current: PublicCloudSortState, key: string): PublicCloudSortState {
    if (current.key === key) {
      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    }
    return { key, direction: 'desc' };
  }

  private sortRows<T>(rows: T[], sort: PublicCloudSortState): T[] {
    const sorted = [...(rows || [])];
    const factor = sort.direction === 'asc' ? 1 : -1;
    sorted.sort((first, second) => {
      const firstValue = (first as Record<string, unknown>)[sort.key];
      const secondValue = (second as Record<string, unknown>)[sort.key];
      if (typeof firstValue === 'number' && typeof secondValue === 'number') {
        return (firstValue - secondValue) * factor;
      }
      return String(firstValue ?? '').localeCompare(String(secondValue ?? '')) * factor;
    });
    return sorted;
  }

  getOrphanedDevices(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.orphanedDevices = [];
    this.orphanedDevicesTotal = 0;
    this.widgetLoading.orphanedDevices = true;
    this.loadWidget(this.loaderNames.orphanedDevices, this.svc.getOrphanedDevices(filterFormOutput, this.orphanedDevicesPageNo, this.orphanedDevicesPageSize), res => {
      this.orphanedDevices = this.svc.convertToOrphanedDevicesViewData(res);
      this.orphanedDevicesTotal = this.svc.convertToOrphanedDevicesTotal(res);
    }, () => {
      this.orphanedDevices = [];
      this.orphanedDevicesTotal = 0;
    }, () => this.widgetLoading.orphanedDevices = false);
  }

  getOrphanedDevicesByCategory(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.orphanedByCategory = [];
    this.orphanedByCategoryOptions = {};
    this.orphanedByCategoryHasData = false;
    this.widgetLoading.orphanedByCategory = true;
    this.loadWidget(this.loaderNames.orphanedDevicesByCategory, this.svc.getOrphanedDevicesByCategory(filterFormOutput), res => {
      this.orphanedByCategory = this.svc.convertToOrphanedByCategoryViewData(res);
      this.orphanedByCategoryOptions = this.svc.convertToOrphanedByCategoryOptions(this.orphanedByCategory);
      this.orphanedByCategoryHasData = this.svc.hasOrphanedByCategoryData(this.orphanedByCategory);
    }, () => {
      this.orphanedByCategory = [];
      this.orphanedByCategoryOptions = {};
      this.orphanedByCategoryHasData = false;
    }, () => this.widgetLoading.orphanedByCategory = false);
  }

  orphanedDevicesPageChange(pageNo: number) {
    if (this.orphanedDevicesPageNo === pageNo) {
      return;
    }
    this.orphanedDevicesPageNo = pageNo;
    this.getOrphanedDevices(this.appliedFilterCriteria);
  }

  getIdleDevices(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.idleDevices = [];
    this.idleDevicesTotal = 0;
    this.widgetLoading.idleDevices = true;
    this.loadWidget(this.loaderNames.idleDevices, this.svc.getIdleDevices(filterFormOutput, this.idleDevicesPageNo, this.idleDevicesPageSize), res => {
      this.idleDevices = this.svc.convertToIdleDevicesViewData(res);
      this.idleDevicesTotal = this.svc.convertToIdleDevicesTotal(res);
    }, () => {
      this.idleDevices = [];
      this.idleDevicesTotal = 0;
    }, () => this.widgetLoading.idleDevices = false);
  }

  getIdleDevicesByDuration(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.idleDurationRows = [];
    this.idleDurationOptions = {};
    this.idleDurationHasData = false;
    this.widgetLoading.idleDuration = true;
    this.loadWidget(this.loaderNames.idleDuration, this.svc.getIdleDevicesByDuration(filterFormOutput), res => {
      this.idleDurationRows = this.svc.convertToIdleDurationViewData(res);
      this.idleDurationHasData = this.svc.hasIdleDurationData(this.idleDurationRows);
      this.idleDurationOptions = this.idleDurationHasData ? this.svc.convertToIdleDurationOptions(this.idleDurationRows) : {};
    }, () => {
      this.idleDurationRows = [];
      this.idleDurationOptions = {};
      this.idleDurationHasData = false;
    }, () => this.widgetLoading.idleDuration = false);
  }

  idleDevicesPageChange(pageNo: number) {
    if (this.idleDevicesPageNo === pageNo) {
      return;
    }
    this.idleDevicesPageNo = pageNo;
    this.getIdleDevices(this.appliedFilterCriteria);
  }

  getRecentAlerts(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.recentAlertSummaryMetrics = [];
    this.recentAlerts = [];
    this.widgetLoading.recentAlerts = true;
    this.startRecentAlertsLoaders();
    this.svc.getRecentAlerts(filterFormOutput).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.widgetLoading.recentAlerts = false;
        this.stopRecentAlertsLoaders();
      })
    ).subscribe(res => {
      this.recentAlertSummaryMetrics = this.svc.convertToRecentAlertSummaryMetricsViewData(res);
      this.recentAlerts = this.svc.convertToRecentAlertsViewData(res);
    }, () => {
      this.clearRecentAlertsViewData();
    });
  }

  private startRecentAlertsLoaders() {
    [
      this.loaderNames.recentAlertSummary,
      this.loaderNames.recentAlerts
    ].forEach(loaderName => this.spinnerService.start(loaderName));
  }

  private stopRecentAlertsLoaders() {
    setTimeout(() => {
      [
        this.loaderNames.recentAlertSummary,
        this.loaderNames.recentAlerts
      ].forEach(loaderName => this.spinnerService.stop(loaderName));
    }, 0);
  }

  private clearRecentAlertsViewData() {
    this.recentAlertSummaryMetrics = [];
    this.recentAlerts = [];
  }

  private clearDashboardViewData() {
    this.clearInventorySummaryViewData();
    this.geoHeatmapOptions = {};
    this.publicCloudCoverageGroups = [];
    this.publicCloudCoverageTotal = '0';
    this.performanceHotspots = [];
    this.performanceHotspotsLoaded = false;
    this.orphanedDevices = [];
    this.orphanedDevicesTotal = 0;
    this.orphanedByCategory = [];
    this.orphanedByCategoryOptions = {};
    this.orphanedByCategoryHasData = false;
    this.idleDevices = [];
    this.idleDevicesTotal = 0;
    this.idleDurationRows = [];
    this.idleDurationOptions = {};
    this.idleDurationHasData = false;
    this.clearCloudDatabasePerformanceViewData();
    this.clearCloudStorageHealthViewData();
    this.clearRecentAlertsViewData();
  }

  private clearCloudDatabasePerformanceViewData() {
    this.databaseOverviewKpis = [];
    this.databaseOverviewRows = [];
    this.databaseWritePerformanceOptions = {};
    this.databaseReadPerformanceOptions = {};
    this.databaseTrendHasData = false;
    this.databaseWriteTrendHasData = false;
    this.databaseReadTrendHasData = false;
    this.databaseSpaceKpis = [];
    this.databaseSpaceRows = [];
  }

  private clearCloudStorageHealthViewData() {
    this.storagePerformanceCards = [];
    this.storageResources = [];
    this.writePerformanceTrend = { labels: [], rows: [] };
    this.latencyBreakdown = null;
    this.latencyBreakdownOptions = {};
  }

  private startWidgetLoadingState() {
    this.widgetLoadingKeys.forEach(key => this.widgetLoading[key] = true);
  }

  private clearWidgetLoadingState() {
    this.widgetLoadingKeys.forEach(key => this.widgetLoading[key] = false);
  }

  get hasSummaryMetrics(): boolean {
    return this.widgetLoading.inventorySummary || this.hasMetricValues(this.summaryMetrics);
  }

  get hasProviderDistribution(): boolean {
    return this.widgetLoading.inventorySummary || this.hasProviderDistributionData;
  }

  get hasProviderDistributionData(): boolean {
    return (this.providerDistribution || []).some(provider => Number(provider?.count || 0) > 0 || Number(provider?.value || 0) > 0);
  }

  get hasTags(): boolean {
    return this.widgetLoading.inventorySummary || !!this.tags?.length;
  }

  get hasGeoDistributionData(): boolean {
    return !!Object.keys(this.geoHeatmapOptions || {}).length;
  }

  get hasGeoDistribution(): boolean {
    return this.widgetLoading.geoDistribution || this.hasGeoDistributionData;
  }

  get hasPublicCloudCoverage(): boolean {
    return this.widgetLoading.publicCloudCoverage ||
      (this.publicCloudCoverageGroups || []).some(group => this.hasCoverageValues(group.cards));
  }

  get hasPerformanceHotspots(): boolean {
    return this.widgetLoading.performanceHotspots || !!this.performanceHotspots?.length;
  }

  /** Keeps the widget visible after a load attempt so empty / failed responses show a message instead of vanishing. */
  get showPerformanceHotspots(): boolean {
    return this.widgetLoading.performanceHotspots || this.performanceHotspotsLoaded;
  }

  private hasCoverageValues(cards: PublicCloudCoverageCard[]): boolean {
    return (cards || []).some(card => (card.rows || []).some(row => this.getNumericValue(row?.value) > 0));
  }

  get hasOrphanedDevices(): boolean {
    return this.widgetLoading.orphanedDevices || !!this.orphanedDevices?.length;
  }

  get hasOrphanedByCategory(): boolean {
    return this.widgetLoading.orphanedByCategory || this.orphanedByCategoryHasData;
  }

  get hasIdleDevices(): boolean {
    return this.widgetLoading.idleDevices || !!this.idleDevices?.length;
  }

  get hasIdleDuration(): boolean {
    return this.widgetLoading.idleDuration || this.idleDurationHasData;
  }

  get hasRecentAlerts(): boolean {
    return this.widgetLoading.recentAlerts || !!this.recentAlerts?.length;
  }

  get hasRecentAlertSummary(): boolean {
    return this.widgetLoading.recentAlerts || this.hasMetricValues(this.recentAlertSummaryMetrics);
  }

  get hasDatabaseOverviewData(): boolean {
    return this.widgetLoading.databaseOverview || this.hasMetricValues(this.databaseOverviewKpis) || !!this.databaseOverviewRows?.length;
  }

  get hasDatabaseOverviewKpis(): boolean {
    return this.widgetLoading.databaseOverview || this.hasMetricValues(this.databaseOverviewKpis);
  }

  get hasDatabaseTrendData(): boolean {
    return this.widgetLoading.databasePerformanceTrend || this.databaseTrendHasData;
  }

  get hasDatabaseWriteTrend(): boolean {
    return this.widgetLoading.databasePerformanceTrend || this.databaseWriteTrendHasData;
  }

  get hasDatabaseReadTrend(): boolean {
    return this.widgetLoading.databasePerformanceTrend || this.databaseReadTrendHasData;
  }

  get hasDatabaseSpaceData(): boolean {
    return this.widgetLoading.databaseSpaceConsumption || this.hasMetricValues(this.databaseSpaceKpis);
  }

  get hasDatabaseCapacityData(): boolean {
    return this.widgetLoading.databaseCapacityResources || !!this.databaseSpaceRows?.length;
  }

  get hasDatabaseSpaceSection(): boolean {
    return this.hasDatabaseSpaceData || this.hasDatabaseCapacityData;
  }

  get hasCloudDatabasePerformanceSection(): boolean {
    return this.hasDatabaseOverviewData || this.hasDatabaseTrendData;
  }

  get hasStoragePerformanceData(): boolean {
    return this.widgetLoading.storagePerformance || !!this.storagePerformanceCards?.length;
  }

  get hasStorageResourcesData(): boolean {
    return this.widgetLoading.storageResources || !!this.storageResources?.length;
  }

  get hasWritePerformanceTrendData(): boolean {
    return this.widgetLoading.writePerformanceTrend || !!this.writePerformanceTrend?.rows?.length;
  }

  get hasLatencyBreakdownData(): boolean {
    return this.widgetLoading.latencyBreakdown || !!this.latencyBreakdown?.hasData;
  }

  get hasLatencyMetricSection(): boolean {
    return this.hasWritePerformanceTrendData || this.hasLatencyBreakdownData;
  }

  get hasCloudStorageHealthSection(): boolean {
    return this.hasStoragePerformanceData || this.hasStorageResourcesData;
  }

  get hasAnyDashboardWidget(): boolean {
    return this.hasSummaryMetrics ||
      this.hasProviderDistribution ||
      this.hasTags ||
      this.hasGeoDistribution ||
      this.hasPublicCloudCoverage ||
      this.hasPerformanceHotspots ||
      this.hasCloudDatabasePerformanceSection ||
      this.hasDatabaseSpaceSection ||
      this.hasCloudStorageHealthSection ||
      this.hasLatencyMetricSection ||
      this.hasOrphanedDevices ||
      this.hasOrphanedByCategory ||
      this.hasIdleDevices ||
      this.hasIdleDuration ||
      this.hasRecentAlerts ||
      this.hasRecentAlertSummary;
  }

  get hasInventoryWidgets(): boolean {
    return this.hasSummaryMetrics || this.hasProviderDistribution || this.hasTags || this.hasGeoDistribution;
  }

  private hasMetricValues(metrics: Array<{ value?: string | number }>): boolean {
    return (metrics || []).some(metric => this.getNumericValue(metric?.value) > 0);
  }

  private getNumericValue(value: string | number | undefined | null): number {
    return Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
  }

  getStatusClass(tone?: string): string {
    return `tone-${tone || 'muted'}`;
  }

  getDeltaIconClass(direction: string): string {
    return direction === 'down' ? 'fas fa-caret-down' : 'fas fa-caret-up';
  }

  getStorageStatusIconClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'healthy':
      case 'up':
      case 'ok':
      case 'success':
        return 'fas fa-check-circle text-success font-xs-sm';
      case 'warning':
      case 'degraded':
      case 'warn':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';
      case 'critical':
      case 'down':
      case 'error':
      case 'failed':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';
      default:
        return 'fas fa-circle text-muted font-xs-sm';
    }
  }

  getOrphanedStatusIconClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'success':
      case 'healthy':
      case 'ok':
      case 'up':
        return 'fas fa-check-circle text-success font-xs-sm';
      case 'warning':
      case 'warn':
      case 'unknown':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';
      case 'error':
      case 'critical':
      case 'down':
      case 'failed':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';
      default:
        return 'fas fa-question-circle text-muted font-xs-sm';
    }
  }

  trackByValue(index: number, option: PublicCloudFilterOption) {
    return option.value;
  }

  trackByIndex(index: number) {
    return index;
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  openSummaryMetric(metric: PublicCloudSummaryMetric) {
    const routes: Record<PublicCloudInventorySummaryKey, any[]> = {
      cloud_accounts: this.linkRoutes.publicCloud,
      active_regions: this.linkRoutes.publicCloud,
      vms: this.linkRoutes.vmAll,
      services: this.linkRoutes.publicCloud,
      running_resources: this.linkRoutes.publicCloud,
      stopped_resources: this.linkRoutes.publicCloud,
      orphaned_vms: this.linkRoutes.vmAll,
      idle_vms: this.linkRoutes.vmAll
    };
    this.openRouteInNewTab(routes[metric.key] || this.linkRoutes.publicCloud);
  }

  openProviderDistribution(provider: PublicCloudProviderDistributionItem) {
    this.openProviderRoute(provider.key);
  }

  onProviderDistributionChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openProviderRoute(this.getProviderDistributionKey(params?.data?.key || params?.name));
    });
  }

  onGeoDistributionChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, () => this.openRouteInNewTab(this.linkRoutes.publicCloud));
  }

  /** Public Cloud coverage links the provider total and each service count to that provider's public cloud page. */
  openPublicCloudProvider(provider?: PublicCloudCoverageCard) {
    this.openRouteInNewTab(this.getProviderRoute(provider?.title || ''));
  }

  canOpenPublicCloudProvider(provider?: PublicCloudCoverageCard): boolean {
    return !!provider?.title;
  }

  hasChartData(options?: EChartsOption): boolean {
    return !!options && !!Object.keys(options).length;
  }

  openHotspotInstance(row: PublicCloudPerformanceHotspotRow) {
    this.openRouteInNewTab(this.getProviderVmRoute(row?.cloud || ''));
  }

  openDatabaseInstance(row: PublicCloudDatabaseOverviewRow | PublicCloudDatabaseSpaceRow) {
    if (row?.instance) {
      this.openRouteInNewTab(this.linkRoutes.databases);
    }
  }

  openStorageResource(row: PublicCloudStorageResourceRow) {
    if (row?.deviceName) {
      this.openRouteInNewTab(this.linkRoutes.storage);
    }
  }

  openOrphanedDevices() {
    this.openRouteInNewTab(this.linkRoutes.devices);
  }

  openOrphanedCategory(item: PublicCloudOrphanedCategoryItem) {
    this.openRouteInNewTab(this.getOrphanedCategoryRoute(item.category));
  }

  onOrphanedCategoryChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(this.getOrphanedCategoryRoute(params?.data?.category || params?.name));
    });
  }

  openIdleDevice(device: PublicCloudIdleDeviceRow) {
    this.openRouteInNewTab(this.getIdleDeviceRoute(device));
  }

  openRecentAlerts() {
    this.openRouteInNewTab(this.linkRoutes.alerts);
  }

  showAlertDetails(alert: PublicCloudRecentAlert) {
    const alertId = alert?.uuid || alert?.id;
    if (alertId) {
      this.alertDetailSvc.showAlertDetails(alertId);
    }
  }

  private openRouteInNewTab(commands: any[]) {
    const routeUrl = this.router.serializeUrl(this.router.createUrlTree(commands));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  private bindChartClick(chartInstance: any, handler: (params: any) => void) {
    if (!chartInstance?.on) {
      return;
    }
    if (chartInstance.off) {
      chartInstance.off('click');
    }
    chartInstance.on('click', handler);
  }

  private openProviderRoute(key: string) {
    this.openRouteInNewTab(this.getProviderRoute(key));
  }

  private getProviderRoute(value: string): any[] {
    switch (this.getProviderKey(value)) {
      case 'aws':
        return this.linkRoutes.provider.aws;
      case 'azure':
        return this.linkRoutes.provider.azure;
      case 'gcp':
        return this.linkRoutes.provider.gcp;
      case 'oci':
      case 'oracle':
        return this.linkRoutes.provider.oracle;
      default:
        return this.linkRoutes.publicCloud;
    }
  }

  private getProviderVmRoute(value: string): any[] {
    switch (this.getProviderKey(value)) {
      case 'aws':
        return this.linkRoutes.providerVm.aws;
      case 'azure':
        return this.linkRoutes.providerVm.azure;
      case 'gcp':
        return this.linkRoutes.providerVm.gcp;
      case 'oci':
      case 'oracle':
        return this.linkRoutes.providerVm.oracle;
      default:
        return this.linkRoutes.vmAll;
    }
  }

  private getProviderDistributionKey(value: string): PublicCloudProviderDistributionKey {
    const provider = this.getProviderKey(value);
    return provider === 'oracle' ? 'oci' : provider as PublicCloudProviderDistributionKey;
  }

  private getProviderKey(value: string): string {
    const normalizedValue = this.normalizeLinkText(value);
    if (normalizedValue.includes('aws') || normalizedValue.includes('amazon')) {
      return 'aws';
    }
    if (normalizedValue.includes('azure') || normalizedValue.includes('microsoft')) {
      return 'azure';
    }
    if (normalizedValue.includes('gcp') || normalizedValue.includes('google')) {
      return 'gcp';
    }
    if (normalizedValue.includes('oci') || normalizedValue.includes('oracle')) {
      return 'oracle';
    }
    if (normalizedValue.includes('custom')) {
      return 'custom';
    }
    return normalizedValue;
  }

  private getOrphanedCategoryRoute(category: string): any[] {
    const normalizedCategory = this.normalizeLinkText(category);
    if (normalizedCategory.includes('vm') || normalizedCategory.includes('virtual_machine')) {
      return this.linkRoutes.vmAll;
    }
    if (normalizedCategory.includes('bare_metal') || normalizedCategory.includes('baremetal')) {
      return this.linkRoutes.bmservers;
    }
    if (normalizedCategory.includes('gpu')) {
      return this.linkRoutes.gpu;
    }
    if (normalizedCategory.includes('storage') || normalizedCategory.includes('volume')) {
      return this.linkRoutes.storage;
    }
    return this.linkRoutes.devices;
  }

  private getIdleDeviceRoute(device: PublicCloudIdleDeviceRow): any[] {
    const resourceType = this.normalizeLinkText(device?.resourceType);
    if (this.isStorageResource(resourceType)) {
      return this.getStorageDetailRoute(device) || this.linkRoutes.storage;
    }
    if (this.isGpuResource(resourceType)) {
      return this.linkRoutes.gpu;
    }
    if (this.isVmResource(resourceType)) {
      return this.getVmDetailRoute(device) || this.getProviderVmRoute(this.getIdleDeviceProvider(device));
    }
    return this.linkRoutes.devices;
  }

  private getStorageDetailRoute(device: PublicCloudIdleDeviceRow): any[] | null {
    const deviceId = this.getIdleDeviceId(device);
    const monitoringRoute = this.getMonitoringRouteSegment(device);
    if (!deviceId || !monitoringRoute) {
      return null;
    }
    return monitoringRoute === 'zbx' ?
      ['/unitycloud/devices/storagedevices', deviceId, 'zbx', 'details'] :
      ['/unitycloud/devices/storagedevices', deviceId, 'obs', 'overview'];
  }

  private getVmDetailRoute(device: PublicCloudIdleDeviceRow): any[] | null {
    const provider = this.getIdleDeviceProvider(device);
    const deviceId = this.getIdleDeviceId(device);
    const monitoringRoute = this.getMonitoringRouteSegment(device);
    if (!deviceId || !monitoringRoute || provider !== 'custom') {
      return null;
    }
    return monitoringRoute === 'zbx' ?
      ['/unitycloud/devices/vms/custom', deviceId, 'zbx', 'details'] :
      ['/unitycloud/devices/vms/custom', deviceId, 'obs', 'overview'];
  }

  private getIdleDeviceId(device: PublicCloudIdleDeviceRow): string {
    return device?.deviceId || device?.resourceId || device?.uuid || device?.id || '';
  }

  private getIdleDeviceProvider(device: PublicCloudIdleDeviceRow): string {
    return this.getProviderKey([device?.provider, device?.cloudType, device?.resourceType].filter(value => !!value).join(' '));
  }

  private getMonitoringRouteSegment(device: PublicCloudIdleDeviceRow): 'obs' | 'zbx' | null {
    const monitoringType = this.normalizeLinkText(device?.monitoringType);
    if (device?.monitoring?.zabbix || monitoringType.includes('zabbix') || monitoringType.includes('zbx')) {
      return 'zbx';
    }
    if (device?.monitoring?.observium || monitoringType.includes('observium') || monitoringType.includes('obs')) {
      return 'obs';
    }
    return null;
  }

  private isVmResource(value: string): boolean {
    return value.includes('vm') || value.includes('virtual_machine') || value.includes('instance');
  }

  private isStorageResource(value: string): boolean {
    return value.includes('storage') || value.includes('volume') || value.includes('disk');
  }

  private isGpuResource(value: string): boolean {
    return value.includes('gpu');
  }

  private normalizeLinkText(value: string): string {
    return String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  }

  private loadWidget<T>(loaderName: string, request: Observable<T>, onSuccess: (res: T) => void, onError: () => void, onFinalize?: () => void) {
    this.spinnerService.start(loaderName);
    request.pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        if (onFinalize) {
          onFinalize();
        }
        setTimeout(() => this.spinnerService.stop(loaderName), 0);
      })
    ).subscribe(res => {
      onSuccess(res);
    }, () => {
      onError();
    });
  }
}
