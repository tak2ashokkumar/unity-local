import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { EChartsOption } from 'echarts';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PublicCloudComputeDashboardService } from './public-cloud-compute-dashboard.service';
import {
  PublicCloudAccountOption,
  PublicCloudAlertSummaryMetric,
  PublicCloudComputeBreakdownProvider,
  PublicCloudComputeBreakdownStat,
  PublicCloudActiveDatabaseWorkloadViewData,
  PublicCloudDatabaseBarItem,
  PublicCloudDatabaseConsumerRow,
  PublicCloudDatabaseHealthScoreViewData,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDashboardFilterOptions,
  PublicCloudFilterOption,
  PublicCloudIdleDeviceRow,
  PublicCloudIdleDurationItem,
  PublicCloudInventorySummaryKey,
  PublicCloudLatencyHeatmapRow,
  PublicCloudLockContentionRow,
  PublicCloudOrphanedCategoryItem,
  PublicCloudOrphanedDeviceRow,
  PublicCloudProviderDistributionKey,
  PublicCloudProviderDistributionItem,
  PublicCloudQueueBacklogRow,
  PublicCloudRecentAlert,
  PublicCloudRegionOption,
  PublicCloudStorageBarItem,
  PublicCloudStorageConsumerRow,
  PublicCloudStorageDistributionItem,
  PublicCloudStorageKpi,
  PublicCloudStorageTrendViewData,
  PublicCloudSummaryMetric,
  PublicCloudTagItem
} from './public-cloud-compute-dashboard.type';

interface PublicCloudFilterScopeSummary {
  primaryLabel: string;
  remainingLabels: string[];
}

interface PublicCloudWidgetLoadingState {
  inventorySummary: boolean;
  computeBreakdown: boolean;
  orphanedDevices: boolean;
  orphanedByCategory: boolean;
  idleDevices: boolean;
  idleDuration: boolean;
  recentAlerts: boolean;
  databaseHealthScore: boolean;
  activeDatabaseWorkload: boolean;
  databaseLatencyOverview: boolean;
  topLockContention: boolean;
  topMemoryConsumers: boolean;
  topStorageConsumers: boolean;
  cloudStorageHealth: boolean;
  storageUtilizationByCloud: boolean;
  readVsWriteTraffic: boolean;
  cloudStorageTopConsumers: boolean;
  transactionVolumeTrend: boolean;
  objectFileGrowthTrend: boolean;
  storageServicesVisibility: boolean;
  cloudStorageDistribution: boolean;
  latencyHeatmap: boolean;
  queueBacklogMonitor: boolean;
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
    'computeBreakdown',
    'orphanedDevices',
    'orphanedByCategory',
    'idleDevices',
    'idleDuration',
    'recentAlerts',
    'databaseHealthScore',
    'activeDatabaseWorkload',
    'databaseLatencyOverview',
    'topLockContention',
    'topMemoryConsumers',
    'topStorageConsumers',
    'cloudStorageHealth',
    'storageUtilizationByCloud',
    'readVsWriteTraffic',
    'cloudStorageTopConsumers',
    'transactionVolumeTrend',
    'objectFileGrowthTrend',
    'storageServicesVisibility',
    'cloudStorageDistribution',
    'latencyHeatmap',
    'queueBacklogMonitor'
  ];
  private readonly linkRoutes = {
    publicCloud: ['/unitycloud/publiccloud'],
    devices: ['/unitycloud/devices'],
    vmAll: ['/unitycloud/devices/vms/allvms'],
    kubernetes: ['/unitycloud/devices/kubernetes'],
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
  appliedFilterCriteria: PublicCloudDashboardFilterCriteria = {
    platforms: [],
    regions: [],
    accounts: []
  };

  summaryMetrics: PublicCloudSummaryMetric[] = [];
  providerDistribution: PublicCloudProviderDistributionItem[] = [];
  providerDistributionOptions: EChartsOption = {};
  tags: PublicCloudTagItem[] = [];
  computeBreakdown: PublicCloudComputeBreakdownProvider[] = [];
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
  databaseHealthScore: PublicCloudDatabaseHealthScoreViewData = null;
  activeDatabaseWorkload: PublicCloudActiveDatabaseWorkloadViewData = null;
  activeDatabaseWorkloadOptions: EChartsOption = {};
  databaseLatencyRows: PublicCloudDatabaseBarItem[] = [];
  databaseLatencyOptions: EChartsOption = {};
  topLockContentionRows: PublicCloudLockContentionRow[] = [];
  topMemoryConsumerRows: PublicCloudDatabaseConsumerRow[] = [];
  topStorageConsumerRows: PublicCloudDatabaseConsumerRow[] = [];
  cloudStorageHealthMetrics: PublicCloudStorageKpi[] = [];
  storageUtilizationRows: PublicCloudStorageBarItem[] = [];
  storageUtilizationOptions: EChartsOption = {};
  readVsWriteTrend: PublicCloudStorageTrendViewData = null;
  readVsWriteOptions: EChartsOption = {};
  cloudStorageTopConsumerRows: PublicCloudStorageConsumerRow[] = [];
  transactionVolumeTrend: PublicCloudStorageTrendViewData = null;
  transactionVolumeTrendOptions: EChartsOption = {};
  objectFileGrowthTrend: PublicCloudStorageTrendViewData = null;
  objectFileGrowthTrendOptions: EChartsOption = {};
  storageServicesVisibilityMetrics: PublicCloudStorageKpi[] = [];
  cloudStorageDistributionRows: PublicCloudStorageDistributionItem[] = [];
  cloudStorageDistributionOptions: EChartsOption = {};
  latencyHeatmapRows: PublicCloudLatencyHeatmapRow[] = [];
  queueBacklogRows: PublicCloudQueueBacklogRow[] = [];
  recentAlertSummaryMetrics: PublicCloudAlertSummaryMetric[] = [];
  recentAlerts: PublicCloudRecentAlert[] = [];
  widgetLoading: PublicCloudWidgetLoadingState = {
    inventorySummary: false,
    computeBreakdown: false,
    orphanedDevices: false,
    orphanedByCategory: false,
    idleDevices: false,
    idleDuration: false,
    recentAlerts: false,
    databaseHealthScore: false,
    activeDatabaseWorkload: false,
    databaseLatencyOverview: false,
    topLockContention: false,
    topMemoryConsumers: false,
    topStorageConsumers: false,
    cloudStorageHealth: false,
    storageUtilizationByCloud: false,
    readVsWriteTraffic: false,
    cloudStorageTopConsumers: false,
    transactionVolumeTrend: false,
    objectFileGrowthTrend: false,
    storageServicesVisibility: false,
    cloudStorageDistribution: false,
    latencyHeatmap: false,
    queueBacklogMonitor: false
  };

  loaderNames = {
    filters: 'publicCloudFiltersLoader',
    summaryMetrics: 'publicCloudSummaryMetricsLoader',
    providerDistribution: 'publicCloudProviderDistributionLoader',
    tags: 'publicCloudTagsLoader',
    computeBreakdown: 'publicCloudComputeBreakdownLoader',
    orphanedDevices: 'publicCloudOrphanedDevicesLoader',
    orphanedDevicesByCategory: 'publicCloudOrphanedDevicesByCategoryLoader',
    idleDevices: 'publicCloudIdleDevicesLoader',
    idleDuration: 'publicCloudIdleDurationLoader',
    databaseHealthScore: 'publicCloudDatabaseHealthScoreLoader',
    activeDatabaseWorkload: 'publicCloudActiveDatabaseWorkloadLoader',
    databaseLatencyOverview: 'publicCloudDatabaseLatencyOverviewLoader',
    topLockContention: 'publicCloudTopLockContentionLoader',
    topMemoryConsumers: 'publicCloudTopMemoryConsumersLoader',
    topStorageConsumers: 'publicCloudTopStorageConsumersLoader',
    cloudStorageHealth: 'publicCloudStorageHealthLoader',
    storageUtilizationByCloud: 'publicCloudStorageUtilizationByCloudLoader',
    readVsWriteTraffic: 'publicCloudReadVsWriteTrafficLoader',
    cloudStorageTopConsumers: 'publicCloudStorageTopConsumersLoader',
    transactionVolumeTrend: 'publicCloudTransactionVolumeTrendLoader',
    objectFileGrowthTrend: 'publicCloudObjectFileGrowthTrendLoader',
    storageServicesVisibility: 'publicCloudStorageServicesVisibilityLoader',
    cloudStorageDistribution: 'publicCloudStorageDistributionLoader',
    latencyHeatmap: 'publicCloudLatencyHeatmapLoader',
    queueBacklogMonitor: 'publicCloudQueueBacklogMonitorLoader',
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
    this.appliedFilterCriteria = {
      platforms: [],
      regions: [],
      accounts: []
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
    return {
      platforms: this.getSelectedValues('platforms'),
      regions: this.getSelectedValues('regions'),
      accounts: this.getSelectedValues('accounts')
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
      this.getComputeBreakdown(filterFormOutput);
      this.getDatabaseHealthScore(filterFormOutput);
      this.getActiveDatabaseWorkload(filterFormOutput);
      this.getDatabaseLatencyOverview(filterFormOutput);
      this.getTopLockContention(filterFormOutput);
      this.getTopMemoryConsumers(filterFormOutput);
      this.getTopStorageConsumers(filterFormOutput);
      this.getCloudStorageHealth(filterFormOutput);
      this.getStorageUtilizationByCloud(filterFormOutput);
      this.getReadVsWriteTraffic(filterFormOutput);
      this.getCloudStorageTopConsumers(filterFormOutput);
      this.getTransactionVolumeTrend(filterFormOutput);
      this.getObjectFileGrowthTrend(filterFormOutput);
      this.getStorageServicesVisibility(filterFormOutput);
      this.getCloudStorageDistribution(filterFormOutput);
      this.getLatencyHeatmap(filterFormOutput);
      this.getQueueBacklogMonitor(filterFormOutput);
      this.getOrphanedDevices(filterFormOutput);
      this.getOrphanedDevicesByCategory(filterFormOutput);
      this.getIdleDevices(filterFormOutput);
      this.getIdleDevicesByDuration(filterFormOutput);
      this.getRecentAlerts(filterFormOutput);
    }, 0);
  }

  getInventorySummary(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.summaryMetrics = [];
    this.providerDistribution = [];
    this.providerDistributionOptions = {};
    this.tags = [];
    this.widgetLoading.inventorySummary = true;
    this.startInventorySummaryLoaders();
    this.svc.getInventorySummary(filterFormOutput).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => {
        this.widgetLoading.inventorySummary = false;
        this.stopInventorySummaryLoaders();
      })
    ).subscribe(res => {
      this.summaryMetrics = this.svc.convertToSummaryMetricsViewData(res);
      this.providerDistribution = this.svc.convertToProviderDistributionViewData(res);
      this.providerDistributionOptions = this.svc.convertToProviderDistributionOptions(this.providerDistribution);
      this.tags = this.svc.convertToTagsViewData(res);
    }, () => {
      this.clearInventorySummaryViewData();
    });
  }

  private startInventorySummaryLoaders() {
    [
      this.loaderNames.summaryMetrics,
      this.loaderNames.providerDistribution,
      this.loaderNames.tags
    ].forEach(loaderName => this.spinnerService.start(loaderName));
  }

  private stopInventorySummaryLoaders() {
    setTimeout(() => {
      [
        this.loaderNames.summaryMetrics,
        this.loaderNames.providerDistribution,
        this.loaderNames.tags
      ].forEach(loaderName => this.spinnerService.stop(loaderName));
    }, 0);
  }

  private clearInventorySummaryViewData() {
    this.summaryMetrics = [];
    this.providerDistribution = [];
    this.providerDistributionOptions = {};
    this.tags = [];
  }

  getComputeBreakdown(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.computeBreakdown = [];
    this.widgetLoading.computeBreakdown = true;
    this.loadWidget(this.loaderNames.computeBreakdown, this.svc.getComputeBreakdown(filterFormOutput), res => {
      this.computeBreakdown = this.svc.convertToComputeBreakdownViewData(res, filterFormOutput);
    }, () => {
      this.computeBreakdown = [];
    }, () => this.widgetLoading.computeBreakdown = false);
  }

  getDatabaseHealthScore(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseHealthScore = null;
    this.widgetLoading.databaseHealthScore = true;
    this.loadWidget(this.loaderNames.databaseHealthScore, this.svc.getDatabaseHealthScore(filterFormOutput), res => {
      this.databaseHealthScore = this.svc.convertToDatabaseHealthScoreViewData(res);
    }, () => {
      this.databaseHealthScore = null;
    }, () => this.widgetLoading.databaseHealthScore = false);
  }

  getActiveDatabaseWorkload(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.activeDatabaseWorkload = null;
    this.activeDatabaseWorkloadOptions = {};
    this.widgetLoading.activeDatabaseWorkload = true;
    this.loadWidget(this.loaderNames.activeDatabaseWorkload, this.svc.getActiveDatabaseWorkload(filterFormOutput), res => {
      this.activeDatabaseWorkload = this.svc.convertToActiveDatabaseWorkloadViewData(res);
      this.activeDatabaseWorkloadOptions = this.activeDatabaseWorkload?.rows?.length ?
        this.svc.convertToActiveDatabaseWorkloadOptions(this.activeDatabaseWorkload.rows) : {};
    }, () => {
      this.activeDatabaseWorkload = null;
      this.activeDatabaseWorkloadOptions = {};
    }, () => this.widgetLoading.activeDatabaseWorkload = false);
  }

  getDatabaseLatencyOverview(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.databaseLatencyRows = [];
    this.databaseLatencyOptions = {};
    this.widgetLoading.databaseLatencyOverview = true;
    this.loadWidget(this.loaderNames.databaseLatencyOverview, this.svc.getDatabaseLatencyOverview(filterFormOutput), res => {
      this.databaseLatencyRows = this.svc.convertToDatabaseLatencyRows(res);
      this.databaseLatencyOptions = this.databaseLatencyRows.length ? this.svc.convertToDatabaseLatencyOptions(this.databaseLatencyRows) : {};
    }, () => {
      this.databaseLatencyRows = [];
      this.databaseLatencyOptions = {};
    }, () => this.widgetLoading.databaseLatencyOverview = false);
  }

  getTopLockContention(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.topLockContentionRows = [];
    this.widgetLoading.topLockContention = true;
    this.loadWidget(this.loaderNames.topLockContention, this.svc.getTopLockContention(filterFormOutput), res => {
      this.topLockContentionRows = this.svc.convertToTopLockContentionRows(res);
    }, () => {
      this.topLockContentionRows = [];
    }, () => this.widgetLoading.topLockContention = false);
  }

  getTopMemoryConsumers(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.topMemoryConsumerRows = [];
    this.widgetLoading.topMemoryConsumers = true;
    this.loadWidget(this.loaderNames.topMemoryConsumers, this.svc.getTopMemoryConsumers(filterFormOutput), res => {
      this.topMemoryConsumerRows = this.svc.convertToTopMemoryConsumersRows(res);
    }, () => {
      this.topMemoryConsumerRows = [];
    }, () => this.widgetLoading.topMemoryConsumers = false);
  }

  getTopStorageConsumers(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.topStorageConsumerRows = [];
    this.widgetLoading.topStorageConsumers = true;
    this.loadWidget(this.loaderNames.topStorageConsumers, this.svc.getTopStorageConsumers(filterFormOutput), res => {
      this.topStorageConsumerRows = this.svc.convertToTopStorageConsumersRows(res);
    }, () => {
      this.topStorageConsumerRows = [];
    }, () => this.widgetLoading.topStorageConsumers = false);
  }

  getCloudStorageHealth(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.cloudStorageHealthMetrics = [];
    this.widgetLoading.cloudStorageHealth = true;
    this.loadWidget(this.loaderNames.cloudStorageHealth, this.svc.getCloudStorageHealth(filterFormOutput), res => {
      this.cloudStorageHealthMetrics = this.svc.convertToCloudStorageHealthMetrics(res);
    }, () => {
      this.cloudStorageHealthMetrics = [];
    }, () => this.widgetLoading.cloudStorageHealth = false);
  }

  getStorageUtilizationByCloud(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.storageUtilizationRows = [];
    this.storageUtilizationOptions = {};
    this.widgetLoading.storageUtilizationByCloud = true;
    this.loadWidget(this.loaderNames.storageUtilizationByCloud, this.svc.getStorageUtilizationByCloud(filterFormOutput), res => {
      this.storageUtilizationRows = this.svc.convertToStorageUtilizationRows(res);
      this.storageUtilizationOptions = this.storageUtilizationRows.length ? this.svc.convertToStorageUtilizationOptions(this.storageUtilizationRows) : {};
    }, () => {
      this.storageUtilizationRows = [];
      this.storageUtilizationOptions = {};
    }, () => this.widgetLoading.storageUtilizationByCloud = false);
  }

  getReadVsWriteTraffic(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.readVsWriteTrend = null;
    this.readVsWriteOptions = {};
    this.widgetLoading.readVsWriteTraffic = true;
    this.loadWidget(this.loaderNames.readVsWriteTraffic, this.svc.getReadVsWriteTraffic(filterFormOutput), res => {
      this.readVsWriteTrend = this.svc.convertToReadVsWriteTrend(res);
      this.readVsWriteOptions = this.hasStorageTrendData(this.readVsWriteTrend) ? this.svc.convertToReadVsWriteOptions(this.readVsWriteTrend) : {};
    }, () => {
      this.readVsWriteTrend = null;
      this.readVsWriteOptions = {};
    }, () => this.widgetLoading.readVsWriteTraffic = false);
  }

  getCloudStorageTopConsumers(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.cloudStorageTopConsumerRows = [];
    this.widgetLoading.cloudStorageTopConsumers = true;
    this.loadWidget(this.loaderNames.cloudStorageTopConsumers, this.svc.getCloudStorageTopConsumers(filterFormOutput), res => {
      this.cloudStorageTopConsumerRows = this.svc.convertToCloudStorageTopConsumersRows(res);
    }, () => {
      this.cloudStorageTopConsumerRows = [];
    }, () => this.widgetLoading.cloudStorageTopConsumers = false);
  }

  getTransactionVolumeTrend(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.transactionVolumeTrend = null;
    this.transactionVolumeTrendOptions = {};
    this.widgetLoading.transactionVolumeTrend = true;
    this.loadWidget(this.loaderNames.transactionVolumeTrend, this.svc.getTransactionVolumeTrend(filterFormOutput), res => {
      this.transactionVolumeTrend = this.svc.convertToTransactionVolumeTrend(res);
      this.transactionVolumeTrendOptions = this.hasStorageTrendData(this.transactionVolumeTrend) ? this.svc.convertToStorageTrendOptions(this.transactionVolumeTrend) : {};
    }, () => {
      this.transactionVolumeTrend = null;
      this.transactionVolumeTrendOptions = {};
    }, () => this.widgetLoading.transactionVolumeTrend = false);
  }

  getObjectFileGrowthTrend(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.objectFileGrowthTrend = null;
    this.objectFileGrowthTrendOptions = {};
    this.widgetLoading.objectFileGrowthTrend = true;
    this.loadWidget(this.loaderNames.objectFileGrowthTrend, this.svc.getObjectFileGrowthTrend(filterFormOutput), res => {
      this.objectFileGrowthTrend = this.svc.convertToObjectFileGrowthTrend(res);
      this.objectFileGrowthTrendOptions = this.hasStorageTrendData(this.objectFileGrowthTrend) ? this.svc.convertToStorageTrendOptions(this.objectFileGrowthTrend) : {};
    }, () => {
      this.objectFileGrowthTrend = null;
      this.objectFileGrowthTrendOptions = {};
    }, () => this.widgetLoading.objectFileGrowthTrend = false);
  }

  getStorageServicesVisibility(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.storageServicesVisibilityMetrics = [];
    this.widgetLoading.storageServicesVisibility = true;
    this.loadWidget(this.loaderNames.storageServicesVisibility, this.svc.getStorageServicesVisibility(filterFormOutput), res => {
      this.storageServicesVisibilityMetrics = this.svc.convertToStorageServicesVisibilityMetrics(res);
    }, () => {
      this.storageServicesVisibilityMetrics = [];
    }, () => this.widgetLoading.storageServicesVisibility = false);
  }

  getCloudStorageDistribution(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.cloudStorageDistributionRows = [];
    this.cloudStorageDistributionOptions = {};
    this.widgetLoading.cloudStorageDistribution = true;
    this.loadWidget(this.loaderNames.cloudStorageDistribution, this.svc.getCloudStorageDistribution(filterFormOutput), res => {
      this.cloudStorageDistributionRows = this.svc.convertToCloudStorageDistributionRows(res);
      this.cloudStorageDistributionOptions = this.cloudStorageDistributionRows.length ?
        this.svc.convertToCloudStorageDistributionOptions(this.cloudStorageDistributionRows) : {};
    }, () => {
      this.cloudStorageDistributionRows = [];
      this.cloudStorageDistributionOptions = {};
    }, () => this.widgetLoading.cloudStorageDistribution = false);
  }

  getLatencyHeatmap(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.latencyHeatmapRows = [];
    this.widgetLoading.latencyHeatmap = true;
    this.loadWidget(this.loaderNames.latencyHeatmap, this.svc.getLatencyHeatmap(filterFormOutput), res => {
      this.latencyHeatmapRows = this.svc.convertToLatencyHeatmapRows(res);
    }, () => {
      this.latencyHeatmapRows = [];
    }, () => this.widgetLoading.latencyHeatmap = false);
  }

  getQueueBacklogMonitor(filterFormOutput: PublicCloudDashboardFilterCriteria) {
    this.queueBacklogRows = [];
    this.widgetLoading.queueBacklogMonitor = true;
    this.loadWidget(this.loaderNames.queueBacklogMonitor, this.svc.getQueueBacklogMonitor(filterFormOutput), res => {
      this.queueBacklogRows = this.svc.convertToQueueBacklogRows(res);
    }, () => {
      this.queueBacklogRows = [];
    }, () => this.widgetLoading.queueBacklogMonitor = false);
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

  orphanedDevicesPageSizeChange(event: Event) {
    this.orphanedDevicesPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.orphanedDevicesPageNo = 1;
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

  idleDevicesPageSizeChange(event: Event) {
    this.idleDevicesPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.idleDevicesPageNo = 1;
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
    this.computeBreakdown = [];
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
    this.databaseHealthScore = null;
    this.activeDatabaseWorkload = null;
    this.activeDatabaseWorkloadOptions = {};
    this.databaseLatencyRows = [];
    this.databaseLatencyOptions = {};
    this.topLockContentionRows = [];
    this.topMemoryConsumerRows = [];
    this.topStorageConsumerRows = [];
  }

  private clearCloudStorageHealthViewData() {
    this.cloudStorageHealthMetrics = [];
    this.storageUtilizationRows = [];
    this.storageUtilizationOptions = {};
    this.readVsWriteTrend = null;
    this.readVsWriteOptions = {};
    this.cloudStorageTopConsumerRows = [];
    this.transactionVolumeTrend = null;
    this.transactionVolumeTrendOptions = {};
    this.objectFileGrowthTrend = null;
    this.objectFileGrowthTrendOptions = {};
    this.storageServicesVisibilityMetrics = [];
    this.cloudStorageDistributionRows = [];
    this.cloudStorageDistributionOptions = {};
    this.latencyHeatmapRows = [];
    this.queueBacklogRows = [];
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
    return this.widgetLoading.inventorySummary || (this.providerDistribution || []).some(provider => Number(provider?.count || 0) > 0 || Number(provider?.value || 0) > 0);
  }

  get hasTags(): boolean {
    return this.widgetLoading.inventorySummary || !!this.tags?.length;
  }

  get hasComputeBreakdown(): boolean {
    return this.widgetLoading.computeBreakdown || !!this.computeBreakdown?.length;
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

  get hasDatabaseHealthScoreData(): boolean {
    return !!this.databaseHealthScore?.hasData;
  }

  get hasActiveDatabaseWorkloadData(): boolean {
    return !!this.activeDatabaseWorkload?.rows?.length;
  }

  get hasDatabaseLatencyOverviewData(): boolean {
    return !!this.databaseLatencyRows?.length;
  }

  get hasTopLockContentionData(): boolean {
    return !!this.topLockContentionRows?.length;
  }

  get hasTopMemoryConsumersData(): boolean {
    return !!this.topMemoryConsumerRows?.length;
  }

  get hasTopStorageConsumersData(): boolean {
    return !!this.topStorageConsumerRows?.length;
  }

  get hasCloudDatabasePerformanceLoading(): boolean {
    return this.widgetLoading.databaseHealthScore ||
      this.widgetLoading.activeDatabaseWorkload ||
      this.widgetLoading.databaseLatencyOverview ||
      this.widgetLoading.topLockContention ||
      this.widgetLoading.topMemoryConsumers ||
      this.widgetLoading.topStorageConsumers;
  }

  get hasCloudDatabasePerformanceSection(): boolean {
    return this.hasCloudDatabasePerformanceLoading ||
      this.hasDatabaseHealthScoreData ||
      this.hasActiveDatabaseWorkloadData ||
      this.hasDatabaseLatencyOverviewData ||
      this.hasTopLockContentionData ||
      this.hasTopMemoryConsumersData ||
      this.hasTopStorageConsumersData;
  }

  get hasCloudStorageHealthData(): boolean {
    return this.hasMetricValues(this.cloudStorageHealthMetrics);
  }

  get hasStorageUtilizationByCloudData(): boolean {
    return !!this.storageUtilizationRows?.length;
  }

  get hasReadVsWriteTrafficData(): boolean {
    return this.hasStorageTrendData(this.readVsWriteTrend);
  }

  get hasCloudStorageTopConsumersData(): boolean {
    return !!this.cloudStorageTopConsumerRows?.length;
  }

  get hasTransactionVolumeTrendData(): boolean {
    return this.hasStorageTrendData(this.transactionVolumeTrend);
  }

  get hasObjectFileGrowthTrendData(): boolean {
    return this.hasStorageTrendData(this.objectFileGrowthTrend);
  }

  get hasStorageServicesVisibilityData(): boolean {
    return this.hasMetricValues(this.storageServicesVisibilityMetrics);
  }

  get hasCloudStorageDistributionData(): boolean {
    return !!this.cloudStorageDistributionRows?.length;
  }

  get hasLatencyHeatmapData(): boolean {
    return !!this.latencyHeatmapRows?.length;
  }

  get hasQueueBacklogMonitorData(): boolean {
    return !!this.queueBacklogRows?.length;
  }

  get hasCloudStorageHealthLoading(): boolean {
    return this.widgetLoading.cloudStorageHealth ||
      this.widgetLoading.storageUtilizationByCloud ||
      this.widgetLoading.readVsWriteTraffic ||
      this.widgetLoading.cloudStorageTopConsumers ||
      this.widgetLoading.transactionVolumeTrend ||
      this.widgetLoading.objectFileGrowthTrend ||
      this.widgetLoading.storageServicesVisibility ||
      this.widgetLoading.cloudStorageDistribution ||
      this.widgetLoading.latencyHeatmap ||
      this.widgetLoading.queueBacklogMonitor;
  }

  get hasCloudStorageHealthSection(): boolean {
    return this.hasCloudStorageHealthLoading ||
      this.hasCloudStorageHealthData ||
      this.hasStorageUtilizationByCloudData ||
      this.hasReadVsWriteTrafficData ||
      this.hasCloudStorageTopConsumersData ||
      this.hasTransactionVolumeTrendData ||
      this.hasObjectFileGrowthTrendData ||
      this.hasStorageServicesVisibilityData ||
      this.hasCloudStorageDistributionData ||
      this.hasLatencyHeatmapData ||
      this.hasQueueBacklogMonitorData;
  }

  get hasAnyDashboardWidget(): boolean {
    return this.hasSummaryMetrics ||
      this.hasProviderDistribution ||
      this.hasTags ||
      this.hasComputeBreakdown ||
      this.hasCloudDatabasePerformanceSection ||
      this.hasCloudStorageHealthSection ||
      this.hasOrphanedDevices ||
      this.hasOrphanedByCategory ||
      this.hasIdleDevices ||
      this.hasIdleDuration ||
      this.hasRecentAlerts ||
      this.hasRecentAlertSummary;
  }

  get hasInventoryWidgets(): boolean {
    return this.hasSummaryMetrics || this.hasProviderDistribution || this.hasTags;
  }

  private hasMetricValues(metrics: Array<{ value?: string | number }>): boolean {
    return (metrics || []).some(metric => this.getNumericValue(metric?.value) > 0);
  }

  private hasStorageTrendData(data: PublicCloudStorageTrendViewData): boolean {
    return (data?.series || []).some(series => !!series?.values?.length);
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
      vms: this.linkRoutes.vmAll,
      services: this.linkRoutes.publicCloud,
      running_resources: this.linkRoutes.publicCloud,
      stopped_resources: this.linkRoutes.publicCloud
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

  openComputeProvider(provider: PublicCloudComputeBreakdownProvider) {
    this.openRouteInNewTab(this.getProviderRoute(provider.name));
  }

  openComputeStat(provider: PublicCloudComputeBreakdownProvider, stat: PublicCloudComputeBreakdownStat) {
    if (stat.key === 'virtual_machine') {
      this.openRouteInNewTab(this.getProviderVmRoute(provider.name));
      return;
    }
    this.openRouteInNewTab(this.linkRoutes.kubernetes);
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
