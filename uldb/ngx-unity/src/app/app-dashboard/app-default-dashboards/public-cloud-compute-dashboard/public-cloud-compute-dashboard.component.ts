import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { EChartsOption } from 'echarts';
import { forkJoin, of, Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PublicCloudComputeDashboardService } from './public-cloud-compute-dashboard.service';
import {
  PUBLIC_CLOUD_ALL_SELECTED_VALUE,
  PUBLIC_CLOUD_TIME_RANGE_DEFAULT,
  PUBLIC_CLOUD_TIME_RANGE_OPTIONS
} from './public-cloud-compute-dashboard.const';
import {
  PublicCloudAccountOption,
  PublicCloudAccountSubscriptionMetricRow,
  PublicCloudCapacityPerformanceRow,
  PublicCloudStorageVolumeRow,
  PublicCloudStorageTierLegendItem,
  PublicCloudProvisioningRow,
  PublicCloudProvisioningSummaryMetric,
  PublicCloudProvisioningReachabilityLegendItem,
  PublicCloudDatabaseSummaryMetric,
  PublicCloudDatabaseMonitoredCard,
  PublicCloudDbWorkloadRow,
  PublicCloudAlertSeverityLegendItem,
  PublicCloudCostRow,
  PublicCloudSpendSavingsLegendItem,
  PublicCloudCostSummaryMetric,
  PublicCloudAutoRemediationSummaryViewData,
  PublicCloudCoverageCard,
  PublicCloudCoverageGroup,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDashboardFilterOptions,
  PublicCloudFilterOption,
  PublicCloudGeoCell,
  PublicCloudGeoDistributionLegendItem,
  PublicCloudGeoDistributionSummary,
  PublicCloudInventorySummaryKey,
  PublicCloudOrphanedCategoryItem,
  PublicCloudOrphanedDeviceRow,
  PublicCloudProviderDistributionKey,
  PublicCloudProviderDistributionItem,
  PublicCloudRecentAlertRow,
  PublicCloudRegionOption,
  PublicCloudSortState,
  PublicCloudSummaryMetric,
  PublicCloudComputeMonitoredCard,
  PublicCloudOsTypeItem,
  PublicCloudAlertsSeverityItem
} from './public-cloud-compute-dashboard.type';

interface PublicCloudFilterScopeSummary {
  primaryLabel: string;
  remainingLabels: string[];
}

interface PublicCloudWidgetLoadingState {
  inventorySummary: boolean;
  geoDistribution: boolean;
  publicCloudCoverage: boolean;
  accountSubscriptionProjectMetrics: boolean;
  capacityPerformance: boolean;
  storageVolumesDisks: boolean;
  publicCloudDatabase: boolean;
  databasePerformance: boolean;
  costOptimization: boolean;
  orphanedDevices: boolean;
  orphanedByCategory: boolean;
  recentAlerts: boolean;
  autoRemediationSummary: boolean;
  instanceProvisioning: boolean;
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
    'accountSubscriptionProjectMetrics',
    'capacityPerformance',
    'storageVolumesDisks',
    'publicCloudDatabase',
    'databasePerformance',
    'orphanedDevices',
    'orphanedByCategory',
    'recentAlerts',
    'autoRemediationSummary',
    'instanceProvisioning',
    'costOptimization'
  ];
  private readonly linkRoutes = {
    publicCloud: ['/unitycloud/publiccloud'],
    devices: ['/unitycloud/devices'],
    vmAll: ['/unitycloud/devices/vms/allvms'],
    alerts: ['/services/aiml-event-mgmt/alerts'],
    gpu: ['/services/ai-observability/gpu'],
    storage: ['/unitycloud/devices/storagedevices'],
    bmservers: ['/unitycloud/devices/bmservers'],
    provider: {
      aws: ['/unitycloud/publiccloud/aws'],
      azure: ['/unitycloud/publiccloud/azure'],
      gcp: ['/unitycloud/publiccloud/gcp'],
      oci: ['/unitycloud/publiccloud/oracle'],
      oracle: ['/unitycloud/publiccloud/oracle']
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
  monitoredProviders: PublicCloudComputeMonitoredCard[] = [];
  providerDistribution: PublicCloudProviderDistributionItem[] = [];
  providerDistributionOptions: EChartsOption = {};
  providerDistributionTotalLabel = '';
  utilizationByProviderOptions: EChartsOption = {};
  utilizationByProviderHasData = false;
  osTypeDistribution: PublicCloudOsTypeItem[] = [];
  osTypeOptions: EChartsOption = {};
  osTypeTotalLabel = '';
  alertsSeverity: PublicCloudAlertsSeverityItem[] = [];
  geoDistributionCells: PublicCloudGeoCell[] = [];
  geoHeatmapOptions: EChartsOption = {};
  geoDistributionSummary: PublicCloudGeoDistributionSummary = { totalLocations: 0, totalResources: 0, totalAlerts: 0 };
  geoDistributionCloudOptions: PublicCloudFilterOption[] = [{ value: PUBLIC_CLOUD_ALL_SELECTED_VALUE, label: 'Select All' }];
  geoDistributionLegends: PublicCloudGeoDistributionLegendItem[] = [];
  selectedGeoDistributionCloudType = PUBLIC_CLOUD_ALL_SELECTED_VALUE;
  publicCloudCoverageGroups: PublicCloudCoverageGroup[] = [];
  publicCloudCoverageGroupsSource: PublicCloudCoverageGroup[] = [];
  publicCloudCoverageTotal = '0';
  publicCloudCoverageSortOrder: 'asc' | 'desc' = 'asc';
  accountSubscriptionProjectMetricRows: PublicCloudAccountSubscriptionMetricRow[] = [];
  accountSubscriptionProjectMetricsTotal = 0;
  accountSubscriptionProjectMetricsPageNo = 1;
  accountSubscriptionProjectMetricsPageSize = 10;
  accountSubscriptionProjectMetricsSearch = '';
  accountSubscriptionProjectMetricsView: 'table' | 'chart' = 'table';
  accountSubscriptionProjectInstanceOptions: EChartsOption = {};
  accountSubscriptionProjectCostOptions: EChartsOption = {};
  accountSubscriptionProjectVcpuOptions: EChartsOption = {};
  accountSubscriptionProjectEfficiencyOptions: EChartsOption = {};
  capacityPerformanceRows: PublicCloudCapacityPerformanceRow[] = [];
  capacityPerformanceTotal = 0;
  capacityPerformancePageNo = 1;
  capacityPerformancePageSize = 10;
  capacityPerformanceSearch = '';
  capacityPerformanceView: 'table' | 'chart' = 'table';
  capacityFleetStatusOptions: EChartsOption = {};
  capacityCpuDistributionOptions: EChartsOption = {};
  capacityTop10CpuOptions: EChartsOption = {};
  capacityTop10DiskIopsOptions: EChartsOption = {};
  capacityTop10NetworkOptions: EChartsOption = {};
  capacityGrowthInsightsOptions: EChartsOption = {};
  storageVolumesRows: PublicCloudStorageVolumeRow[] = [];
  storageVolumesTotal = 0;
  storageVolumesPageNo = 1;
  storageVolumesPageSize = 10;
  storageVolumesSearch = '';
  storageVolumesView: 'table' | 'chart' = 'table';
  storageProvisionedByProviderOptions: EChartsOption = {};
  storageTopVolumesOptions: EChartsOption = {};
  storageIopsTierOptions: EChartsOption = {};
  storageIopsTierLegend: PublicCloudStorageTierLegendItem[] = [];
  databaseSummaryMetrics: PublicCloudDatabaseSummaryMetric[] = [];
  databaseMonitoredCards: PublicCloudDatabaseMonitoredCard[] = [];
  databasePerformanceRows: PublicCloudDbWorkloadRow[] = [];
  databasePerformanceTotal = 0;
  databasePerformancePageNo = 1;
  databasePerformancePageSize = 10;
  databasePerformanceSearch = '';
  databasePerformanceView: 'table' | 'chart' = 'table';
  dbCacheHitOptions: EChartsOption = {};
  dbLatencyOptions: EChartsOption = {};
  dbResponseTimeOptions: EChartsOption = {};
  dbConnectionsOptions: EChartsOption = {};
  dbDeadlocksOptions: EChartsOption = {};
  dbThroughputTrendOptions: EChartsOption = {};
  orphanedDevices: PublicCloudOrphanedDeviceRow[] = [];
  orphanedDevicesTotal = 0;
  orphanedDevicesPageNo = 1;
  orphanedDevicesPageSize = 10;
  orphanedByCategory: PublicCloudOrphanedCategoryItem[] = [];
  orphanedByCategoryOptions: EChartsOption = {};
  orphanedByCategoryHasData = false;
  recentAlertsView: 'table' | 'chart' = 'table';
  recentAlertsSearch = '';
  recentAlertsSort: PublicCloudSortState = { key: 'raisedHours', direction: 'asc' };
  recentAlertsPageNo = 1;
  recentAlertsPageSize = 10;
  recentAlerts: PublicCloudRecentAlertRow[] = [];
  recentAlertsTotal = 0;
  alertsBySeverityOptions: EChartsOption = {};
  alertsBySeverityLegend: PublicCloudAlertSeverityLegendItem[] = [];
  alertsByProviderOptions: EChartsOption = {};
  alertsByAgeOptions: EChartsOption = {};
  private recentAlertsAllRows: PublicCloudRecentAlertRow[] = [];
  costOptimizationView: 'table' | 'chart' = 'table';
  costOptimizationSearch = '';
  costOptimizationSort: PublicCloudSortState = { key: '', direction: 'desc' };
  costOptimizationPageNo = 1;
  costOptimizationPageSize = 10;
  costOptimizationRows: PublicCloudCostRow[] = [];
  costOptimizationTotal = 0;
  spendVsSavingsOptions: EChartsOption = {};
  spendVsSavingsLegend: PublicCloudSpendSavingsLegendItem[] = [];
  recommendedActionsOptions: EChartsOption = {};
  potentialSavingsByProviderOptions: EChartsOption = {};
  costSummaryMetrics: PublicCloudCostSummaryMetric[] = [];
  autoRemediationSummary: PublicCloudAutoRemediationSummaryViewData = null;
  provisioningRows: PublicCloudProvisioningRow[] = [];
  provisioningSort: PublicCloudSortState = { key: 'daysSinceProvisioned', direction: 'asc' };
  provisioningView: 'table' | 'chart' = 'table';
  provisioningSummaryMetrics: PublicCloudProvisioningSummaryMetric[] = [];
  provisioningReachabilityOptions: EChartsOption = {};
  provisioningReachabilityLegend: PublicCloudProvisioningReachabilityLegendItem[] = [];
  provisionedByProviderOptions: EChartsOption = {};
  recentlyProvisionedOptions: EChartsOption = {};
  widgetLoading: PublicCloudWidgetLoadingState = {
    inventorySummary: false,
    geoDistribution: false,
    publicCloudCoverage: false,
    accountSubscriptionProjectMetrics: false,
    capacityPerformance: false,
    storageVolumesDisks: false,
    publicCloudDatabase: false,
    databasePerformance: false,
    costOptimization: false,
    orphanedDevices: false,
    orphanedByCategory: false,
    recentAlerts: false,
    autoRemediationSummary: false,
    instanceProvisioning: false
  };

  loaderNames = {
    filters: 'publicCloudFiltersLoader',
    inventoryCard: 'publicCloudInventoryCardLoader',
    geoDistribution: 'publicCloudGeoDistributionLoader',
    publicCloudCoverage: 'publicCloudInfraCoverageLoader',
    accountSubscriptionProjectMetrics: 'publicCloudAccountSubscriptionProjectMetricsLoader',
    capacityPerformance: 'publicCloudCapacityPerformanceLoader',
    storageVolumesDisks: 'publicCloudStorageVolumesDisksLoader',
    publicCloudDatabase: 'publicCloudDatabaseLoader',
    databasePerformance: 'publicCloudDatabasePerformanceLoader',
    costOptimization: 'publicCloudCostOptimizationLoader',
    orphanedDevices: 'publicCloudOrphanedDevicesLoader',
    orphanedDevicesByCategory: 'publicCloudOrphanedDevicesByCategoryLoader',
    recentAlertSummary: 'publicCloudRecentAlertSummaryLoader',
    recentAlerts: 'publicCloudRecentAlertsLoader',
    autoRemediationSummary: 'publicCloudAutoRemediationSummaryLoader',
    instanceProvisioning: 'publicCloudInstanceProvisioningLoader'
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
    this.accountSubscriptionProjectMetricsPageNo = 1;
    this.capacityPerformancePageNo = 1;
    this.storageVolumesPageNo = 1;
    this.databasePerformancePageNo = 1;
    this.recentAlertsPageNo = 1;
    this.costOptimizationPageNo = 1;
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
    this.accountSubscriptionProjectMetricsPageNo = 1;
    this.capacityPerformancePageNo = 1;
    this.storageVolumesPageNo = 1;
    this.databasePerformancePageNo = 1;
    this.recentAlertsPageNo = 1;
    this.costOptimizationPageNo = 1;
    this.accountSubscriptionProjectMetricsSearch = '';
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
      this.getAccountSubscriptionProjectMetrics(filterFormOutput);
      this.getCapacityPerformance(filterFormOutput);
      this.getStorageVolumesDisks(filterFormOutput);
      this.getPublicCloudDatabase(filterFormOutput);
      this.getDatabasePerformance(filterFormOutput);
      this.getCostOptimization(filterFormOutput);
      this.getOrphanedDevices(filterFormOutput);
      this.getOrphanedDevicesByCategory(filterFormOutput);
      this.getRecentAlerts(filterFormOutput);
      this.getAutoRemediationSummary(filterFormOutput);
      this.getInstanceProvisioning(filterFormOutput);
    }, 0);
  }

  getInventorySummary(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearInventorySummaryViewData();
    this.widgetLoading.inventorySummary = true;
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.inventoryCard, forkJoin({
      summary: this.svc.getInventorySummary(filterFormOutput).pipe(catchError(() => of(null))),
      monitored: this.svc.getComputeMonitored(filterFormOutput).pipe(catchError(() => of(null))),
      distribution: this.svc.getCloudProviderDistribution(filterFormOutput).pipe(catchError(() => of(null))),
      utilization: this.svc.getUtilizationByProvider(filterFormOutput).pipe(catchError(() => of(null))),
      osType: this.svc.getComputeInstanceByOsType(filterFormOutput).pipe(catchError(() => of(null))),
      alerts: this.svc.getAlertsSeverity(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      this.summaryMetrics = this.svc.convertToSummaryMetricsViewData(data.summary);
      this.monitoredProviders = this.svc.convertToComputeMonitoredViewData(data.monitored);
      this.providerDistribution = this.svc.convertToProviderDistributionViewData(data.distribution);
      this.providerDistributionTotalLabel = this.svc.getProviderDistributionTotalLabel(data.distribution);
      this.providerDistributionOptions = this.svc.convertToProviderDistributionOptions(this.providerDistribution, this.providerDistributionTotalLabel);
      this.utilizationByProviderOptions = this.svc.convertToUtilizationByProviderOptions(data.utilization);
      this.utilizationByProviderHasData = this.svc.hasUtilizationByProviderData(data.utilization);
      this.osTypeDistribution = this.svc.convertToOsTypeViewData(data.osType);
      this.osTypeTotalLabel = this.svc.getOsTypeTotalLabel(data.osType);
      this.osTypeOptions = this.svc.convertToOsTypeOptions(this.osTypeDistribution, this.osTypeTotalLabel);
      this.alertsSeverity = this.svc.convertToAlertsSeverityViewData(data.alerts);
    }, () => {
      this.clearInventorySummaryViewData();
    }, () => this.widgetLoading.inventorySummary = false);
  }

  private clearInventorySummaryViewData() {
    this.summaryMetrics = [];
    this.monitoredProviders = [];
    this.providerDistribution = [];
    this.providerDistributionOptions = {};
    this.providerDistributionTotalLabel = '';
    this.utilizationByProviderOptions = {};
    this.utilizationByProviderHasData = false;
    this.osTypeDistribution = [];
    this.osTypeOptions = {};
    this.osTypeTotalLabel = '';
    this.alertsSeverity = [];
  }

  getGeoDistribution(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearGeoDistributionViewData();
    this.clearAccountSubscriptionProjectMetricsViewData();
    this.widgetLoading.geoDistribution = true;
    this.loadWidget(this.loaderNames.geoDistribution, this.svc.getGeoDistribution(filterFormOutput), res => {
      this.geoDistributionCells = res || [];
      this.geoDistributionCloudOptions = this.svc.convertToGeoDistributionCloudOptions(this.geoDistributionCells);
      if (!this.geoDistributionCloudOptions.some(option => option.value === this.selectedGeoDistributionCloudType)) {
        this.selectedGeoDistributionCloudType = PUBLIC_CLOUD_ALL_SELECTED_VALUE;
      }
      this.applyGeoDistributionCloudTypeFilter();
    }, () => {
      this.clearGeoDistributionViewData();
    }, () => this.widgetLoading.geoDistribution = false);
  }

  onGeoDistributionCloudTypeChange(event: Event) {
    this.selectedGeoDistributionCloudType = String((event.target as HTMLSelectElement)?.value || PUBLIC_CLOUD_ALL_SELECTED_VALUE);
    this.applyGeoDistributionCloudTypeFilter();
  }

  /** Re-derives the KPI strip, the chart and the legend from the cells the selected Cloud Type leaves visible. */
  private applyGeoDistributionCloudTypeFilter() {
    const selectedCloudType = this.selectedGeoDistributionCloudType;
    const displayCells = selectedCloudType === PUBLIC_CLOUD_ALL_SELECTED_VALUE
      ? this.geoDistributionCells
      : (this.geoDistributionCells || []).filter(cell => this.getGeoDistributionCloudTypeKey(cell.cloudType) === selectedCloudType);
    this.geoDistributionSummary = this.svc.convertToGeoDistributionSummary(displayCells);
    this.geoHeatmapOptions = this.svc.convertToGeoHeatmapOptions(displayCells);
    this.geoDistributionLegends = this.svc.convertToGeoDistributionLegends(displayCells);
  }

  private getGeoDistributionCloudTypeKey(cloudType: string): string {
    return String(cloudType || 'Unknown').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'unknown';
  }

  private clearGeoDistributionViewData() {
    this.geoDistributionCells = [];
    this.geoHeatmapOptions = {};
    this.geoDistributionSummary = { totalLocations: 0, totalResources: 0, totalAlerts: 0 };
    this.geoDistributionCloudOptions = [{ value: PUBLIC_CLOUD_ALL_SELECTED_VALUE, label: 'Select All' }];
    this.geoDistributionLegends = [];
  }

  getPublicCloudCoverage(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.publicCloudCoverageGroups = [];
    this.publicCloudCoverageGroupsSource = [];
    this.publicCloudCoverageTotal = '0';
    this.widgetLoading.publicCloudCoverage = true;
    this.loadWidget(this.loaderNames.publicCloudCoverage, this.svc.getPublicCloudCoverage(filterFormOutput), res => {
      this.publicCloudCoverageGroupsSource = this.svc.convertToCoverageGroupsViewData(res);
      this.publicCloudCoverageGroups = this.getSortedPublicCloudCoverageGroups(this.publicCloudCoverageGroupsSource);
      this.publicCloudCoverageTotal = this.svc.getCoverageGroupsResourceTotal(this.publicCloudCoverageGroups);
    }, () => {
      this.publicCloudCoverageGroups = [];
      this.publicCloudCoverageGroupsSource = [];
      this.publicCloudCoverageTotal = '0';
    }, () => this.widgetLoading.publicCloudCoverage = false);
  }

  onPublicCloudCoverageSortChange(order: 'asc' | 'desc') {
    if (this.publicCloudCoverageSortOrder === order) {
      return;
    }

    this.publicCloudCoverageSortOrder = order;
    this.publicCloudCoverageGroups = this.getSortedPublicCloudCoverageGroups(this.publicCloudCoverageGroupsSource);
  }

  private getSortedPublicCloudCoverageGroups(groups: PublicCloudCoverageGroup[]): PublicCloudCoverageGroup[] {
    const sortDirection = this.publicCloudCoverageSortOrder === 'asc' ? 1 : -1;
    return (groups || []).map(group => ({
      ...group,
      cards: (group.cards || []).map(card => ({
        ...card,
        rows: (card.rows || []).slice().sort((first, second) =>
          String(first.label || '').localeCompare(String(second.label || ''), undefined, { sensitivity: 'base' }) * sortDirection
        )
      }))
    }));
  }

  getAccountSubscriptionProjectMetrics(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearAccountSubscriptionProjectMetricsViewData();
    this.widgetLoading.accountSubscriptionProjectMetrics = true;
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.accountSubscriptionProjectMetrics, forkJoin({
      table: this.svc.getAccountSubscriptionProjectMetrics(filterFormOutput, this.accountSubscriptionProjectMetricsSearch, this.accountSubscriptionProjectMetricsPageNo, this.accountSubscriptionProjectMetricsPageSize).pipe(catchError(() => of(null))),
      instance: this.svc.getComputeInstanceByAccount(filterFormOutput).pipe(catchError(() => of(null))),
      cost: this.svc.getEstimatedMonthlyCostByAccount(filterFormOutput).pipe(catchError(() => of(null))),
      vcpu: this.svc.getVcpuUtilizationByAccount(filterFormOutput).pipe(catchError(() => of(null))),
      efficiency: this.svc.getCostEfficiencyByAccount(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      this.accountSubscriptionProjectMetricRows = this.svc.convertToAccountSubscriptionMetricRows(data.table);
      this.accountSubscriptionProjectMetricsTotal = this.svc.getAccountSubscriptionProjectMetricsTotal(data.table);
      this.accountSubscriptionProjectInstanceOptions = this.svc.convertToAccountSubscriptionInstanceChartOptions(data.instance);
      this.accountSubscriptionProjectCostOptions = this.svc.convertToAccountSubscriptionCostChartOptions(data.cost);
      this.accountSubscriptionProjectVcpuOptions = this.svc.convertToAccountSubscriptionVcpuChartOptions(data.vcpu);
      this.accountSubscriptionProjectEfficiencyOptions = this.svc.convertToAccountSubscriptionEfficiencyChartOptions(data.efficiency);
    }, () => {
      this.clearAccountSubscriptionProjectMetricsViewData();
    }, () => this.widgetLoading.accountSubscriptionProjectMetrics = false);
  }

  setAccountSubscriptionProjectMetricsView(view: 'table' | 'chart') {
    this.accountSubscriptionProjectMetricsView = view;
  }

  onAccountSubscriptionProjectMetricsSearch(event: Event) {
    this.accountSubscriptionProjectMetricsSearch = String((event.target as HTMLInputElement)?.value || '');
    this.accountSubscriptionProjectMetricsPageNo = 1;
    this.getAccountSubscriptionProjectMetricsTableRows(this.appliedFilterCriteria);
  }

  accountSubscriptionProjectMetricsPageChange(pageNo: number) {
    if (this.accountSubscriptionProjectMetricsPageNo === pageNo) {
      return;
    }
    this.accountSubscriptionProjectMetricsPageNo = pageNo;
    this.getAccountSubscriptionProjectMetricsTableRows(this.appliedFilterCriteria);
  }

  // Re-fetches ONLY the paginated table endpoint (search / page change); the chart endpoints are
  // filter-scoped, not page-scoped, so they are left untouched here.
  private getAccountSubscriptionProjectMetricsTableRows(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.widgetLoading.accountSubscriptionProjectMetrics = true;
    this.loadWidget(this.loaderNames.accountSubscriptionProjectMetrics,
      this.svc.getAccountSubscriptionProjectMetrics(filterFormOutput, this.accountSubscriptionProjectMetricsSearch, this.accountSubscriptionProjectMetricsPageNo, this.accountSubscriptionProjectMetricsPageSize),
      data => {
        this.accountSubscriptionProjectMetricRows = this.svc.convertToAccountSubscriptionMetricRows(data);
        this.accountSubscriptionProjectMetricsTotal = this.svc.getAccountSubscriptionProjectMetricsTotal(data);
      }, () => {
        this.accountSubscriptionProjectMetricRows = [];
        this.accountSubscriptionProjectMetricsTotal = 0;
      }, () => this.widgetLoading.accountSubscriptionProjectMetrics = false);
  }

  private clearAccountSubscriptionProjectMetricsViewData() {
    this.accountSubscriptionProjectMetricRows = [];
    this.accountSubscriptionProjectMetricsTotal = 0;
    this.accountSubscriptionProjectInstanceOptions = {};
    this.accountSubscriptionProjectCostOptions = {};
    this.accountSubscriptionProjectVcpuOptions = {};
    this.accountSubscriptionProjectEfficiencyOptions = {};
  }

  getCapacityPerformance(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearCapacityPerformanceViewData();
    this.widgetLoading.capacityPerformance = true;
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.capacityPerformance, forkJoin({
      table: this.svc.getCapacityPerformanceTable(filterFormOutput, this.capacityPerformanceSearch, this.capacityPerformancePageNo, this.capacityPerformancePageSize).pipe(catchError(() => of(null))),
      charts: this.svc.getCapacityPerformanceCharts(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      this.capacityPerformanceRows = this.svc.convertToCapacityPerformanceRows(data.table);
      this.capacityPerformanceTotal = this.svc.getCapacityPerformanceTotal(data.table);
      this.capacityFleetStatusOptions = this.svc.convertToCapacityFleetStatusOptions(data.charts?.fleetStatusByProvider);
      this.capacityCpuDistributionOptions = this.svc.convertToCapacityCpuDistributionOptions(data.charts?.cpuDistribution);
      this.capacityTop10CpuOptions = this.svc.convertToCapacityTopOptions(data.charts?.top10Cpu, '%');
      this.capacityTop10DiskIopsOptions = this.svc.convertToCapacityTopOptions(data.charts?.top10DiskIops, 'IOPS');
      this.capacityTop10NetworkOptions = this.svc.convertToCapacityTopOptions(data.charts?.top10NetworkThroughput, 'Mbps');
      this.capacityGrowthInsightsOptions = this.svc.convertToCapacityGrowthOptions(data.charts?.capacityAndGrowthInsights);
    }, () => {
      this.clearCapacityPerformanceViewData();
    }, () => this.widgetLoading.capacityPerformance = false);
  }

  setCapacityPerformanceView(view: 'table' | 'chart') {
    this.capacityPerformanceView = view;
  }

  onCapacityPerformanceSearch(event: Event) {
    this.capacityPerformanceSearch = String((event.target as HTMLInputElement)?.value || '');
    this.capacityPerformancePageNo = 1;
    this.getCapacityPerformanceTableRows(this.appliedFilterCriteria);
  }

  capacityPerformancePageChange(pageNo: number) {
    if (this.capacityPerformancePageNo === pageNo) {
      return;
    }
    this.capacityPerformancePageNo = pageNo;
    this.getCapacityPerformanceTableRows(this.appliedFilterCriteria);
  }

  // Re-fetches ONLY the paginated table endpoint (search / page change); the chart endpoints are
  // filter-scoped, not page-scoped, so they are left untouched here.
  private getCapacityPerformanceTableRows(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.widgetLoading.capacityPerformance = true;
    this.loadWidget(this.loaderNames.capacityPerformance,
      this.svc.getCapacityPerformanceTable(filterFormOutput, this.capacityPerformanceSearch, this.capacityPerformancePageNo, this.capacityPerformancePageSize),
      data => {
        this.capacityPerformanceRows = this.svc.convertToCapacityPerformanceRows(data);
        this.capacityPerformanceTotal = this.svc.getCapacityPerformanceTotal(data);
      }, () => {
        this.capacityPerformanceRows = [];
        this.capacityPerformanceTotal = 0;
      }, () => this.widgetLoading.capacityPerformance = false);
  }

  private clearCapacityPerformanceViewData() {
    this.capacityPerformanceRows = [];
    this.capacityPerformanceTotal = 0;
    this.capacityFleetStatusOptions = {};
    this.capacityCpuDistributionOptions = {};
    this.capacityTop10CpuOptions = {};
    this.capacityTop10DiskIopsOptions = {};
    this.capacityTop10NetworkOptions = {};
    this.capacityGrowthInsightsOptions = {};
  }

  getStorageVolumesDisks(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearStorageVolumesViewData();
    this.widgetLoading.storageVolumesDisks = true;
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.storageVolumesDisks, forkJoin({
      table: this.svc.getStorageVolumesTable(filterFormOutput, this.storageVolumesSearch, this.storageVolumesPageNo, this.storageVolumesPageSize).pipe(catchError(() => of(null))),
      provisionedByProvider: this.svc.getStorageProvisionedByProvider(filterFormOutput).pipe(catchError(() => of(null))),
      topVolumes: this.svc.getStorageTopVolumesByDiskIops(filterFormOutput).pipe(catchError(() => of(null))),
      tierDistribution: this.svc.getStorageIopsTierDistribution(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      this.storageVolumesRows = this.svc.convertToStorageVolumeRows(data.table);
      this.storageVolumesTotal = this.svc.getStorageVolumesTotal(data.table);
      this.storageProvisionedByProviderOptions = this.svc.convertToStorageProvisionedByProviderOptions(data.provisionedByProvider);
      this.storageTopVolumesOptions = this.svc.convertToStorageTopVolumesOptions(data.topVolumes);
      this.storageIopsTierOptions = this.svc.convertToStorageIopsTierOptions(data.tierDistribution);
      this.storageIopsTierLegend = this.svc.convertToStorageTierLegend(data.tierDistribution);
    }, () => {
      this.clearStorageVolumesViewData();
    }, () => this.widgetLoading.storageVolumesDisks = false);
  }

  setStorageVolumesView(view: 'table' | 'chart') {
    this.storageVolumesView = view;
  }

  onStorageVolumesSearch(event: Event) {
    this.storageVolumesSearch = String((event.target as HTMLInputElement)?.value || '');
    this.storageVolumesPageNo = 1;
    this.getStorageVolumesTableRows(this.appliedFilterCriteria);
  }

  storageVolumesPageChange(pageNo: number) {
    if (this.storageVolumesPageNo === pageNo) {
      return;
    }
    this.storageVolumesPageNo = pageNo;
    this.getStorageVolumesTableRows(this.appliedFilterCriteria);
  }

  // Re-fetches ONLY the paginated table endpoint (search / page change); the chart endpoints are
  // filter-scoped, not page-scoped, so they are left untouched here.
  private getStorageVolumesTableRows(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.widgetLoading.storageVolumesDisks = true;
    this.loadWidget(this.loaderNames.storageVolumesDisks,
      this.svc.getStorageVolumesTable(filterFormOutput, this.storageVolumesSearch, this.storageVolumesPageNo, this.storageVolumesPageSize),
      data => {
        this.storageVolumesRows = this.svc.convertToStorageVolumeRows(data);
        this.storageVolumesTotal = this.svc.getStorageVolumesTotal(data);
      }, () => {
        this.storageVolumesRows = [];
        this.storageVolumesTotal = 0;
      }, () => this.widgetLoading.storageVolumesDisks = false);
  }

  private clearStorageVolumesViewData() {
    this.storageVolumesRows = [];
    this.storageVolumesTotal = 0;
    this.storageProvisionedByProviderOptions = {};
    this.storageTopVolumesOptions = {};
    this.storageIopsTierOptions = {};
    this.storageIopsTierLegend = [];
  }

  getPublicCloudDatabase(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearPublicCloudDatabaseViewData();
    this.widgetLoading.publicCloudDatabase = true;
    this.loadWidget(this.loaderNames.publicCloudDatabase, this.svc.getPublicCloudDatabase(filterFormOutput), data => {
      this.databaseSummaryMetrics = this.svc.convertToDatabaseSummaryMetrics(data);
      this.databaseMonitoredCards = this.svc.convertToDatabaseMonitoredCards(data);
    }, () => {
      this.clearPublicCloudDatabaseViewData();
    }, () => this.widgetLoading.publicCloudDatabase = false);
  }

  private clearPublicCloudDatabaseViewData() {
    this.databaseSummaryMetrics = [];
    this.databaseMonitoredCards = [];
  }

  getDatabasePerformance(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearDatabasePerformanceViewData();
    this.widgetLoading.databasePerformance = true;
    // The workload endpoint returns the full list; search + pagination are applied client-side here.
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.databasePerformance, forkJoin({
      workload: this.svc.getDbWorkload(filterFormOutput).pipe(catchError(() => of([]))),
      queryPerf: this.svc.getDbQueryPerformance(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      const queryPerf: any = data.queryPerf || {};
      const search = this.databasePerformanceSearch.toLowerCase().trim();
      const filtered = search
        ? (data.workload || []).filter(row => String(row?.name || '').toLowerCase().indexOf(search) > -1)
        : (data.workload || []);
      this.databasePerformanceTotal = filtered.length;
      const startIndex = (this.databasePerformancePageNo - 1) * this.databasePerformancePageSize;
      const pageRows = filtered.slice(startIndex, startIndex + this.databasePerformancePageSize);
      this.databasePerformanceRows = this.svc.convertToDbWorkloadRows(pageRows, queryPerf);
      this.dbCacheHitOptions = this.svc.convertToDbCacheHitOptions(queryPerf.top_cache_hit_ratio);
      this.dbLatencyOptions = this.svc.convertToDbLatencyOptions(queryPerf.top_latency);
      this.dbResponseTimeOptions = this.svc.convertToDbResponseTimeOptions(queryPerf.top_response_time);
      this.dbConnectionsOptions = this.svc.convertToDbConnectionsOptions(queryPerf.top_connections);
      this.dbDeadlocksOptions = this.svc.convertToDbDeadlocksOptions(queryPerf.top_errors_deadlocks);
      this.dbThroughputTrendOptions = this.svc.convertToDbThroughputTrendOptions(queryPerf.top_throughput);
    }, () => {
      this.clearDatabasePerformanceViewData();
    }, () => this.widgetLoading.databasePerformance = false);
  }

  setDatabasePerformanceView(view: 'table' | 'chart') {
    this.databasePerformanceView = view;
  }

  onDatabasePerformanceSearch(event: Event) {
    this.databasePerformanceSearch = String((event.target as HTMLInputElement)?.value || '');
    this.databasePerformancePageNo = 1;
    this.getDatabasePerformance(this.appliedFilterCriteria);
  }

  databasePerformancePageChange(pageNo: number) {
    if (this.databasePerformancePageNo === pageNo) {
      return;
    }
    this.databasePerformancePageNo = pageNo;
    this.getDatabasePerformance(this.appliedFilterCriteria);
  }

  private clearDatabasePerformanceViewData() {
    this.databasePerformanceRows = [];
    this.databasePerformanceTotal = 0;
    this.dbCacheHitOptions = {};
    this.dbLatencyOptions = {};
    this.dbResponseTimeOptions = {};
    this.dbConnectionsOptions = {};
    this.dbDeadlocksOptions = {};
    this.dbThroughputTrendOptions = {};
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

  getRecentAlerts(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearRecentAlertsViewData();
    this.widgetLoading.recentAlerts = true;
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.recentAlerts, forkJoin({
      table: this.svc.getRecentAlerts(filterFormOutput).pipe(catchError(() => of(null))),
      severity: this.svc.getAlertsBySeverity(filterFormOutput).pipe(catchError(() => of(null))),
      byProvider: this.svc.getAlertsByProvider(filterFormOutput).pipe(catchError(() => of(null))),
      byAge: this.svc.getAlertsByAge(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      this.recentAlertsAllRows = this.svc.convertToRecentAlertRows(data.table);
      this.applyRecentAlertsTable();
      this.alertsBySeverityOptions = this.svc.convertToAlertsBySeverityOptions(data.severity);
      this.alertsBySeverityLegend = this.svc.convertToAlertsBySeverityLegend(data.severity);
      this.alertsByProviderOptions = this.svc.convertToAlertsByProviderOptions(data.byProvider);
      this.alertsByAgeOptions = this.svc.convertToAlertsByAgeOptions(data.byAge);
    }, () => {
      this.clearRecentAlertsViewData();
    }, () => this.widgetLoading.recentAlerts = false);
  }

  setRecentAlertsView(view: 'table' | 'chart') {
    this.recentAlertsView = view;
  }

  onRecentAlertsSearch(event: Event) {
    this.recentAlertsSearch = String((event.target as HTMLInputElement)?.value || '');
    this.recentAlertsPageNo = 1;
    this.applyRecentAlertsTable();
  }

  sortRecentAlerts(key: string) {
    this.recentAlertsSort = this.nextSortState(this.recentAlertsSort, key);
    this.recentAlertsPageNo = 1;
    this.applyRecentAlertsTable();
  }

  recentAlertsPageChange(pageNo: number) {
    if (this.recentAlertsPageNo === pageNo) {
      return;
    }
    this.recentAlertsPageNo = pageNo;
    this.applyRecentAlertsTable();
  }

  // Search + sort + paginate the full alert list client-side (the recent_alerts response is a single
  // unpaginated payload, so the same view logic serves the static and live data).
  private applyRecentAlertsTable() {
    const search = this.recentAlertsSearch.toLowerCase().trim();
    const filtered = search
      ? this.recentAlertsAllRows.filter(row => [row.instanceName, row.alert, row.provider, row.severityLabel]
        .some(value => String(value || '').toLowerCase().indexOf(search) > -1))
      : this.recentAlertsAllRows;
    const sorted = this.sortRows(filtered, this.recentAlertsSort);
    this.recentAlertsTotal = sorted.length;
    const startIndex = (this.recentAlertsPageNo - 1) * this.recentAlertsPageSize;
    this.recentAlerts = sorted.slice(startIndex, startIndex + this.recentAlertsPageSize);
  }

  private clearRecentAlertsViewData() {
    this.recentAlertsAllRows = [];
    this.recentAlerts = [];
    this.recentAlertsTotal = 0;
    this.alertsBySeverityOptions = {};
    this.alertsBySeverityLegend = [];
    this.alertsByProviderOptions = {};
    this.alertsByAgeOptions = {};
  }

  getCostOptimization(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearCostOptimizationViewData();
    this.widgetLoading.costOptimization = true;
    // The table endpoint is server-paginated ({ count, results }); search + page are sent to it.
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.costOptimization, forkJoin({
      table: this.svc.getCostOptimization(filterFormOutput, this.costOptimizationSearch, this.costOptimizationPageNo, this.costOptimizationPageSize).pipe(catchError(() => of(null))),
      spend: this.svc.getSpendVsSavings(filterFormOutput).pipe(catchError(() => of(null))),
      actions: this.svc.getRecommendedActions(filterFormOutput).pipe(catchError(() => of(null))),
      savingsByProvider: this.svc.getPotentialSavingsByProvider(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      this.costOptimizationTotal = this.svc.getCostOptimizationTotal(data.table);
      this.applyCostOptimizationTable(this.svc.convertToCostRows(data.table));
      this.spendVsSavingsOptions = this.svc.convertToSpendVsSavingsOptions(data.spend);
      this.spendVsSavingsLegend = this.svc.convertToSpendVsSavingsLegend(data.spend);
      this.recommendedActionsOptions = this.svc.convertToRecommendedActionsOptions(data.actions);
      this.potentialSavingsByProviderOptions = this.svc.convertToPotentialSavingsByProviderOptions(data.savingsByProvider);
      this.costSummaryMetrics = this.svc.convertToCostSummaryMetrics(data.spend, data.actions);
    }, () => {
      this.clearCostOptimizationViewData();
    }, () => this.widgetLoading.costOptimization = false);
  }

  setCostOptimizationView(view: 'table' | 'chart') {
    this.costOptimizationView = view;
  }

  onCostOptimizationSearch(event: Event) {
    this.costOptimizationSearch = String((event.target as HTMLInputElement)?.value || '');
    this.costOptimizationPageNo = 1;
    this.getCostOptimizationTableRows(this.appliedFilterCriteria);
  }

  sortCostOptimization(key: string) {
    this.costOptimizationSort = this.nextSortState(this.costOptimizationSort, key);
    this.applyCostOptimizationTable(this.costOptimizationRows);
  }

  costOptimizationPageChange(pageNo: number) {
    if (this.costOptimizationPageNo === pageNo) {
      return;
    }
    this.costOptimizationPageNo = pageNo;
    this.getCostOptimizationTableRows(this.appliedFilterCriteria);
  }

  // Re-fetches ONLY the paginated table endpoint (search / page change); the chart endpoints are
  // filter-scoped, not page-scoped, so they are left untouched here.
  private getCostOptimizationTableRows(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.widgetLoading.costOptimization = true;
    this.loadWidget(this.loaderNames.costOptimization,
      this.svc.getCostOptimization(filterFormOutput, this.costOptimizationSearch, this.costOptimizationPageNo, this.costOptimizationPageSize),
      data => {
        this.costOptimizationTotal = this.svc.getCostOptimizationTotal(data);
        this.applyCostOptimizationTable(this.svc.convertToCostRows(data));
      }, () => {
        this.costOptimizationRows = [];
        this.costOptimizationTotal = 0;
      }, () => this.widgetLoading.costOptimization = false);
  }

  // Search + pagination are server-side (the endpoint returns { count, results } per page).
  // A header click sorts the rows on the currently visible page only.
  private applyCostOptimizationTable(rows: PublicCloudCostRow[]) {
    this.costOptimizationRows = this.costOptimizationSort.key
      ? this.sortRows(rows, this.costOptimizationSort)
      : rows;
  }

  private clearCostOptimizationViewData() {
    this.costOptimizationRows = [];
    this.costOptimizationTotal = 0;
    this.spendVsSavingsOptions = {};
    this.spendVsSavingsLegend = [];
    this.recommendedActionsOptions = {};
    this.potentialSavingsByProviderOptions = {};
    this.costSummaryMetrics = [];
  }

  getAutoRemediationSummary(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.autoRemediationSummary = null;
    this.widgetLoading.autoRemediationSummary = true;
    this.loadWidget(this.loaderNames.autoRemediationSummary, this.svc.getAutoRemediationSummary(filterFormOutput), res => {
      this.autoRemediationSummary = this.svc.convertToAutoRemediationSummaryViewData(res);
    }, () => {
      this.autoRemediationSummary = null;
    }, () => this.widgetLoading.autoRemediationSummary = false);
  }

  private clearAutoRemediationSummaryViewData() {
    this.autoRemediationSummary = null;
  }

  getInstanceProvisioning(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.clearProvisioningViewData();
    this.widgetLoading.instanceProvisioning = true;
    // Each source rescues itself so one dead endpoint drops only its own part, not the whole widget.
    this.loadWidget(this.loaderNames.instanceProvisioning, forkJoin({
      table: this.svc.getInstanceProvisioningTable(filterFormOutput).pipe(catchError(() => of(null))),
      reachability: this.svc.getProvisioningReachability(filterFormOutput).pipe(catchError(() => of(null))),
      byProvider: this.svc.getProvisionedByProvider(filterFormOutput).pipe(catchError(() => of(null))),
      recently: this.svc.getRecentlyProvisioned(filterFormOutput).pipe(catchError(() => of(null))),
      metrics: this.svc.getProvisioningSummaryMetrics(filterFormOutput).pipe(catchError(() => of(null)))
    }), data => {
      this.provisioningRows = this.sortRows(this.svc.convertToProvisioningRows(data.table), this.provisioningSort);
      this.provisioningSummaryMetrics = this.svc.convertToProvisioningSummaryMetrics(data.metrics);
      this.provisioningReachabilityOptions = this.svc.convertToProvisioningReachabilityOptions(data.reachability);
      this.provisioningReachabilityLegend = this.svc.convertToProvisioningReachabilityLegend(data.reachability);
      this.provisionedByProviderOptions = this.svc.convertToProvisioningByProviderOptions(data.byProvider);
      this.recentlyProvisionedOptions = this.svc.convertToRecentlyProvisionedOptions(data.recently);
    }, () => {
      this.clearProvisioningViewData();
    }, () => this.widgetLoading.instanceProvisioning = false);
  }

  setProvisioningView(view: 'table' | 'chart') {
    this.provisioningView = view;
  }

  sortProvisioning(key: string) {
    this.provisioningSort = this.nextSortState(this.provisioningSort, key);
    this.provisioningRows = this.sortRows(this.provisioningRows, this.provisioningSort);
  }

  private clearProvisioningViewData() {
    this.provisioningRows = [];
    this.provisioningSummaryMetrics = [];
    this.provisioningReachabilityOptions = {};
    this.provisioningReachabilityLegend = [];
    this.provisionedByProviderOptions = {};
    this.recentlyProvisionedOptions = {};
  }

  private clearDashboardViewData() {
    this.clearInventorySummaryViewData();
    this.clearGeoDistributionViewData();
    this.publicCloudCoverageGroups = [];
    this.publicCloudCoverageGroupsSource = [];
    this.publicCloudCoverageTotal = '0';
    this.orphanedDevices = [];
    this.orphanedDevicesTotal = 0;
    this.orphanedByCategory = [];
    this.orphanedByCategoryOptions = {};
    this.orphanedByCategoryHasData = false;
    this.clearRecentAlertsViewData();
    this.clearAccountSubscriptionProjectMetricsViewData();
    this.clearAutoRemediationSummaryViewData();
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

  get hasMonitoredProviders(): boolean {
    return this.widgetLoading.inventorySummary || !!this.monitoredProviders.length;
  }

  get hasProviderDistribution(): boolean {
    return this.widgetLoading.inventorySummary || this.hasProviderDistributionData;
  }

  get hasProviderDistributionData(): boolean {
    return (this.providerDistribution || []).some(provider => Number(provider?.count || 0) > 0 || Number(provider?.value || 0) > 0);
  }

  get hasUtilizationByProvider(): boolean {
    return this.widgetLoading.inventorySummary || this.utilizationByProviderHasData;
  }

  get hasOsTypeData(): boolean {
    return this.svc.hasOsTypeData(this.osTypeDistribution);
  }

  get hasOsType(): boolean {
    return this.widgetLoading.inventorySummary || this.hasOsTypeData;
  }

  get hasAlertsSeverity(): boolean {
    return this.widgetLoading.inventorySummary || this.hasMetricValues(this.alertsSeverity);
  }

  get hasGeoDistribution(): boolean {
    return this.widgetLoading.geoDistribution || this.hasGeoDistributionSourceData();
  }

  private hasGeoDistributionSourceData(): boolean {
    return (this.geoDistributionCells || []).some(cell => cell.totalResources > 0);
  }

  get hasPublicCloudCoverage(): boolean {
    return this.widgetLoading.publicCloudCoverage ||
      (this.publicCloudCoverageGroups || []).some(group => this.hasCoverageValues(group.cards));
  }

  get hasAccountSubscriptionProjectMetrics(): boolean {
    return this.widgetLoading.accountSubscriptionProjectMetrics ||
      !!this.accountSubscriptionProjectMetricRows?.length ||
      this.hasChartData(this.accountSubscriptionProjectInstanceOptions);
  }

  get hasCapacityPerformance(): boolean {
    return this.widgetLoading.capacityPerformance ||
      !!this.capacityPerformanceRows?.length ||
      this.hasChartData(this.capacityFleetStatusOptions);
  }

  get hasStorageVolumesDisks(): boolean {
    return this.widgetLoading.storageVolumesDisks ||
      !!this.storageVolumesRows?.length ||
      this.hasChartData(this.storageProvisionedByProviderOptions);
  }

  get hasDatabaseSummary(): boolean {
    return this.widgetLoading.publicCloudDatabase || this.hasMetricValues(this.databaseSummaryMetrics);
  }

  get hasPublicCloudDatabase(): boolean {
    return this.hasDatabaseSummary || !!this.databaseMonitoredCards?.length;
  }

  get hasDatabasePerformance(): boolean {
    return this.widgetLoading.databasePerformance ||
      !!this.databasePerformanceRows?.length ||
      this.hasChartData(this.dbCacheHitOptions);
  }

  get hasCostSummary(): boolean {
    return this.widgetLoading.costOptimization || this.hasMetricValues(this.costSummaryMetrics);
  }

  get hasCostOptimization(): boolean {
    return this.widgetLoading.costOptimization ||
      !!this.costOptimizationRows?.length ||
      this.hasCostSummary ||
      this.hasChartData(this.spendVsSavingsOptions);
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

  get hasRecentAlerts(): boolean {
    return this.widgetLoading.recentAlerts ||
      !!this.recentAlertsAllRows?.length ||
      this.hasChartData(this.alertsBySeverityOptions);
  }

  get hasAutoRemediationSummary(): boolean {
    return this.widgetLoading.autoRemediationSummary || !!this.autoRemediationSummary?.hasData;
  }

  get hasProvisioningSummary(): boolean {
    return this.widgetLoading.instanceProvisioning || this.hasMetricValues(this.provisioningSummaryMetrics);
  }

  get hasInstanceProvisioning(): boolean {
    return this.widgetLoading.instanceProvisioning ||
      !!this.provisioningRows?.length ||
      this.hasProvisioningSummary ||
      this.hasChartData(this.provisioningReachabilityOptions);
  }

  get hasAnyDashboardWidget(): boolean {
    return this.hasSummaryMetrics ||
      this.hasMonitoredProviders ||
      this.hasProviderDistribution ||
      this.hasUtilizationByProvider ||
      this.hasOsType ||
      this.hasAlertsSeverity ||
      this.hasGeoDistribution ||
      this.hasPublicCloudCoverage ||
      this.hasAccountSubscriptionProjectMetrics ||
      this.hasCapacityPerformance ||
      this.hasStorageVolumesDisks ||
      this.hasPublicCloudDatabase ||
      this.hasDatabasePerformance ||
      this.hasCostOptimization ||
      this.hasOrphanedDevices ||
      this.hasOrphanedByCategory ||
      this.hasRecentAlerts ||
      this.hasAutoRemediationSummary ||
      this.hasInstanceProvisioning;
  }

  get hasInventoryWidgets(): boolean {
    return this.hasSummaryMetrics ||
      this.hasMonitoredProviders ||
      this.hasProviderDistribution ||
      this.hasUtilizationByProvider ||
      this.hasOsType ||
      this.hasAlertsSeverity;
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
      compute_vm: this.linkRoutes.vmAll,
      platform_services_count: this.linkRoutes.publicCloud,
      other_services_count: this.linkRoutes.publicCloud,
      running_compute_instances: this.linkRoutes.vmAll,
      stopped_compute_instances: this.linkRoutes.vmAll
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

  /** Section header link: opens the selected Cloud Type's page, or the public cloud listing when none is selected. */
  openPublicCloudGeoDistribution() {
    this.openRouteInNewTab(this.getGeoDistributionCloudRoute(this.getSelectedGeoDistributionCloudLabel()));
  }

  /** Each tile carries its own cloud type, so a tile click opens that provider's page. */
  onGeoDistributionChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(this.getGeoDistributionCloudRoute(params?.data?.cloudType));
    });
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

  openRecentAlerts() {
    this.openRouteInNewTab(this.linkRoutes.alerts);
  }

  showAlertDetails(alert: PublicCloudRecentAlertRow) {
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

  /**
   * Maps a Geo Distribution cloud type to its public cloud page. The API can return a combined cloud
   * type for a region shared by providers (e.g. 'Azure, GCP'), which cannot resolve to a single
   * provider page - those, and unrecognized types, open the public cloud listing instead.
   */
  private getGeoDistributionCloudRoute(cloudType: string | undefined): any[] {
    const providerRoutes = String(cloudType || '')
      .split(/[,/&]+/)
      .map(cloudTypePart => this.getProviderRoute(cloudTypePart, false))
      .filter((route): route is any[] => !!route);
    const distinctRoutes = providerRoutes.filter((route, index) =>
      providerRoutes.findIndex(item => item[0] === route[0]) === index);
    return distinctRoutes.length === 1 ? distinctRoutes[0] : this.linkRoutes.publicCloud;
  }

  /** Resolves the applied Cloud Type filter back to its raw API label (empty when Select All is active). */
  private getSelectedGeoDistributionCloudLabel(): string {
    if (this.selectedGeoDistributionCloudType === PUBLIC_CLOUD_ALL_SELECTED_VALUE) {
      return '';
    }
    return (this.geoDistributionCloudOptions || [])
      .find(option => option.value === this.selectedGeoDistributionCloudType)?.label || '';
  }

  private getProviderRoute(value: string): any[];
  private getProviderRoute(value: string, withFallback: boolean): any[] | null;
  private getProviderRoute(value: string, withFallback = true): any[] | null {
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
        return withFallback ? this.linkRoutes.publicCloud : null;
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
