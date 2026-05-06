import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatabaseServersService } from 'src/app/united-cloud/shared/database-servers/database-servers.service';
import { DatabaseDashboardService } from './database-dashboard.service';
import {
  DatabaseDashboardAlertSummaryMetric,
  DatabaseDashboardCapacityMetric,
  DatabaseDashboardCriticalAlert,
  DatabaseDashboardDonutItem,
  DatabaseDashboardFilterCriteria,
  DatabaseDashboardFilterOption,
  DatabaseDashboardHealthGroup,
  DatabaseDashboardMetric,
  DatabaseDashboardStorageRow,
  DatabaseDashboardTagItem,
  DatabaseDashboardTone,
  DatabaseDashboardUtilizationViewRow,
  DatabaseDashboardVersionItem
} from './database-dashboard.type';

@Component({
  selector: 'database-dashboard',
  templateUrl: './database-dashboard.component.html',
  styleUrls: ['./database-dashboard.component.scss'],
  providers: [DatabaseDashboardService, DatabaseServersService]
})
export class DatabaseDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  filterForm: FormGroup;
  databaseOptions: DatabaseDashboardFilterOption[] = [];

  summaryMetrics: DatabaseDashboardMetric[] = [];
  cloudTypeDistribution: DatabaseDashboardDonutItem[] = [];
  cloudTypeDistributionOptions: EChartsOption = {};
  dbCountByPlatformOptions: EChartsOption = {};
  dbByEnvironmentOptions: EChartsOption = {};
  tags: DatabaseDashboardTagItem[] = [];
  databaseVersions: DatabaseDashboardVersionItem[] = [];
  utilizationRows: DatabaseDashboardUtilizationViewRow[] = [];
  queryResponseOptions: EChartsOption = {};
  queryLatencyOptions: EChartsOption = {};
  activeSessionsOptions: EChartsOption = {};
  errorRateOptions: EChartsOption = {};
  transactionThroughputOptions: EChartsOption = {};
  cacheHitRatioOptions: EChartsOption = {};
  capacityMetrics: DatabaseDashboardCapacityMetric[] = [];
  storageRows: DatabaseDashboardStorageRow[] = [];
  tablespaceUsageOptions: EChartsOption = {};
  storageGrowthOptions: EChartsOption = {};
  archiveLogGrowthOptions: EChartsOption = {};
  logGrowthRateOptions: EChartsOption = {};
  dbSizeByServerOptions: EChartsOption = {};
  logSizeByServerOptions: EChartsOption = {};
  diskUtilizationOptions: EChartsOption = {};
  healthGroups: DatabaseDashboardHealthGroup[] = [];
  alertSummaryMetrics: DatabaseDashboardAlertSummaryMetric[] = [];
  criticalAlerts: DatabaseDashboardCriticalAlert[] = [];

  loaderNames = {
    filters: 'databaseDashboardFiltersLoader',
    summaryMetrics: 'databaseDashboardSummaryMetricsLoader',
    cloudTypeDistribution: 'databaseDashboardCloudTypeDistributionLoader',
    platformCounts: 'databaseDashboardPlatformCountsLoader',
    environmentCounts: 'databaseDashboardEnvironmentCountsLoader',
    tags: 'databaseDashboardTagsLoader',
    databaseVersions: 'databaseDashboardVersionsLoader',
    utilization: 'databaseDashboardUtilizationLoader',
    queryResponse: 'databaseDashboardQueryResponseLoader',
    queryLatency: 'databaseDashboardQueryLatencyLoader',
    activeSessions: 'databaseDashboardActiveSessionsLoader',
    errorRate: 'databaseDashboardErrorRateLoader',
    transactionThroughput: 'databaseDashboardTransactionThroughputLoader',
    cacheHitRatio: 'databaseDashboardCacheHitRatioLoader',
    capacityMetrics: 'databaseDashboardCapacityMetricsLoader',
    storageRows: 'databaseDashboardStorageRowsLoader',
    tablespaceUsage: 'databaseDashboardTablespaceUsageLoader',
    storageGrowth: 'databaseDashboardStorageGrowthLoader',
    archiveLogGrowth: 'databaseDashboardArchiveLogGrowthLoader',
    logGrowthRate: 'databaseDashboardLogGrowthRateLoader',
    dbSizeByServer: 'databaseDashboardDbSizeByServerLoader',
    logSizeByServer: 'databaseDashboardLogSizeByServerLoader',
    diskUtilization: 'databaseDashboardDiskUtilizationLoader',
    healthGroups: 'databaseDashboardHealthGroupsLoader',
    alertSummary: 'databaseDashboardAlertSummaryLoader',
    criticalAlerts: 'databaseDashboardCriticalAlertsLoader'
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

  constructor(private svc: DatabaseDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /** Applies the current filter form output to every database dashboard widget request. */
  applyFilters() {
    this.loadData();
  }

  /** Reloads database filter options and rebuilds the dashboard after the filter form is ready. */
  refreshData() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Reloads all filter options and recreates the filter form only after database data is ready. */
  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  /** Loads database options first, then creates the filter form and starts widget loading. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.spinnerService.start(this.loaderNames.filters);
    this.svc.getDatabases().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOptions = res || [];
      this.buildFilterForm();
      this.stopFilterLoader();
      this.loadData();
    }, () => {
      this.databaseOptions = this.svc.getFallbackDatabases();
      this.buildFilterForm();
      this.stopFilterLoader();
      this.loadData();
    });
  }

  /** Creates the filter form with all currently loaded database options selected by default. */
  private buildFilterForm() {
    this.filterForm = this.svc.buildFilterForm(this.databaseOptions);
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterForm = null;
    this.databaseOptions = [];
  }

  /** Reads selected option values from a filter form control. */
  private getSelectedValues(controlName: string): string[] {
    const values = this.filterForm?.get(controlName)?.value || [];
    return this.getValuesFromOptions(values);
  }

  /** Normalizes selected filter option objects into API-friendly string values. */
  private getValuesFromOptions(options: Array<DatabaseDashboardFilterOption | string>): string[] {
    return (options || [])
      .map((item: DatabaseDashboardFilterOption | string) => typeof item === 'string' ? item : item?.value)
      .filter((value: string | undefined) => !!value) as string[];
  }

  /** Returns the normalized filter form output passed to all dashboard service calls. */
  private getFilterFormOutput(): DatabaseDashboardFilterCriteria {
    return {
      databases: this.getSelectedValues('databases')
    };
  }

  /** Confirms the filter form exists and has loaded option data before widget APIs are called. */
  private hasFilterFormData(): boolean {
    return !!this.filterForm && !!this.databaseOptions.length;
  }

  /** Stops the top filter loader in the next tick so synchronous static responses still render the loader correctly. */
  private stopFilterLoader() {
    setTimeout(() => this.spinnerService.stop(this.loaderNames.filters), 0);
  }

  /** Builds the visible scope text from the current database filter selections. */
  get scopeText(): string {
    if (!this.filterForm) {
      return 'Loading filters';
    }
    return this.getSelectedLabel(this.databaseOptions, this.getSelectedValues('databases'), 'All databases', 'databases', 'No databases');
  }

  /** Converts selected values into a compact filter label for the header scope text. */
  getSelectedLabel(options: DatabaseDashboardFilterOption[], selectedValues: string[], allLabel: string, pluralLabel: string, emptyLabel: string): string {
    if (!selectedValues.length) {
      return emptyLabel;
    }
    if (options?.length && selectedValues.length === options.length) {
      return allLabel;
    }
    if (selectedValues.length === 1) {
      return options?.find(option => option.value === selectedValues[0])?.label || allLabel;
    }
    return `${selectedValues.length} ${pluralLabel}`;
  }

  /** Loads all dashboard widgets only after the filter form exists and has loaded filter data. */
  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    const filterFormOutput = this.getFilterFormOutput();
    setTimeout(() => {
      this.getSummaryMetrics(filterFormOutput);
      this.getCloudTypeDistribution(filterFormOutput);
      this.getPlatformCounts(filterFormOutput);
      this.getEnvironmentCounts(filterFormOutput);
      this.getTags(filterFormOutput);
      this.getDatabaseVersions(filterFormOutput);
      this.getUtilizationRows(filterFormOutput);
      this.getQueryResponse(filterFormOutput);
      this.getQueryLatency(filterFormOutput);
      this.getActiveSessions(filterFormOutput);
      this.getErrorRate(filterFormOutput);
      this.getTransactionThroughput(filterFormOutput);
      this.getCacheHitRatio(filterFormOutput);
      this.getCapacityMetrics(filterFormOutput);
      this.getStorageRows(filterFormOutput);
      this.getTablespaceUsage(filterFormOutput);
      this.getStorageGrowth(filterFormOutput);
      this.getArchiveLogGrowth(filterFormOutput);
      this.getLogGrowthRate(filterFormOutput);
      this.getDbSizeByServer(filterFormOutput);
      this.getLogSizeByServer(filterFormOutput);
      this.getDiskUtilization(filterFormOutput);
      this.getHealthGroups(filterFormOutput);
      this.getAlertSummaryMetrics(filterFormOutput);
      this.getCriticalAlerts(filterFormOutput);
    }, 0);
  }

  getSummaryMetrics(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.summaryMetrics = [];
    this.loadWidget(this.loaderNames.summaryMetrics, this.svc.getSummaryMetrics(filterFormOutput), res => {
      this.summaryMetrics = this.svc.convertToMetricsViewData(res);
    }, () => {
      this.summaryMetrics = [];
    });
  }

  getCloudTypeDistribution(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.cloudTypeDistribution = [];
    this.cloudTypeDistributionOptions = {};
    this.loadWidget(this.loaderNames.cloudTypeDistribution, this.svc.getCloudTypeDistribution(filterFormOutput), res => {
      this.cloudTypeDistribution = this.svc.convertToCloudTypeDistributionViewData(res);
      this.cloudTypeDistributionOptions = this.svc.convertToCloudTypeDistributionOptions(this.cloudTypeDistribution);
    }, () => {
      this.cloudTypeDistribution = [];
      this.cloudTypeDistributionOptions = {};
    });
  }

  getPlatformCounts(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.dbCountByPlatformOptions = {};
    this.loadWidget(this.loaderNames.platformCounts, this.svc.getPlatformCounts(filterFormOutput), res => {
      this.dbCountByPlatformOptions = this.svc.convertToPlatformCountOptions(res);
    }, () => {
      this.dbCountByPlatformOptions = {};
    });
  }

  getEnvironmentCounts(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.dbByEnvironmentOptions = {};
    this.loadWidget(this.loaderNames.environmentCounts, this.svc.getEnvironmentCounts(filterFormOutput), res => {
      this.dbByEnvironmentOptions = this.svc.convertToEnvironmentOptions(res);
    }, () => {
      this.dbByEnvironmentOptions = {};
    });
  }

  getTags(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.tags = [];
    this.loadWidget(this.loaderNames.tags, this.svc.getTags(filterFormOutput), res => {
      this.tags = this.svc.convertToTagsViewData(res);
    }, () => {
      this.tags = [];
    });
  }

  getDatabaseVersions(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.databaseVersions = [];
    this.loadWidget(this.loaderNames.databaseVersions, this.svc.getDatabaseVersions(filterFormOutput), res => {
      this.databaseVersions = this.svc.convertToDatabaseVersionsViewData(res);
    }, () => {
      this.databaseVersions = [];
    });
  }

  getUtilizationRows(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.utilizationRows = [];
    this.loadWidget(this.loaderNames.utilization, this.svc.getUtilizationRows(filterFormOutput), res => {
      this.utilizationRows = this.svc.convertToUtilizationRowsViewData(res);
    }, () => {
      this.utilizationRows = [];
    });
  }

  getQueryResponse(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.queryResponseOptions = {};
    this.loadWidget(this.loaderNames.queryResponse, this.svc.getQueryResponse(filterFormOutput), res => {
      this.queryResponseOptions = this.svc.convertToQueryResponseOptions(res);
    }, () => {
      this.queryResponseOptions = {};
    });
  }

  getQueryLatency(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.queryLatencyOptions = {};
    this.loadWidget(this.loaderNames.queryLatency, this.svc.getQueryLatency(filterFormOutput), res => {
      this.queryLatencyOptions = this.svc.convertToQueryLatencyOptions(res);
    }, () => {
      this.queryLatencyOptions = {};
    });
  }

  getActiveSessions(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.activeSessionsOptions = {};
    this.loadWidget(this.loaderNames.activeSessions, this.svc.getActiveSessions(filterFormOutput), res => {
      this.activeSessionsOptions = this.svc.convertToActiveSessionsOptions(res);
    }, () => {
      this.activeSessionsOptions = {};
    });
  }

  getErrorRate(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.errorRateOptions = {};
    this.loadWidget(this.loaderNames.errorRate, this.svc.getErrorRate(filterFormOutput), res => {
      this.errorRateOptions = this.svc.convertToErrorRateOptions(res);
    }, () => {
      this.errorRateOptions = {};
    });
  }

  getTransactionThroughput(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.transactionThroughputOptions = {};
    this.loadWidget(this.loaderNames.transactionThroughput, this.svc.getTransactionThroughput(filterFormOutput), res => {
      this.transactionThroughputOptions = this.svc.convertToTransactionThroughputOptions(res);
    }, () => {
      this.transactionThroughputOptions = {};
    });
  }

  getCacheHitRatio(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.cacheHitRatioOptions = {};
    this.loadWidget(this.loaderNames.cacheHitRatio, this.svc.getCacheHitRatio(filterFormOutput), res => {
      this.cacheHitRatioOptions = this.svc.convertToCacheHitRatioOptions(res);
    }, () => {
      this.cacheHitRatioOptions = {};
    });
  }

  getCapacityMetrics(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.capacityMetrics = [];
    this.loadWidget(this.loaderNames.capacityMetrics, this.svc.getCapacityMetrics(filterFormOutput), res => {
      this.capacityMetrics = this.svc.convertToCapacityMetricsViewData(res);
    }, () => {
      this.capacityMetrics = [];
    });
  }

  getStorageRows(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.storageRows = [];
    this.loadWidget(this.loaderNames.storageRows, this.svc.getStorageRows(filterFormOutput), res => {
      this.storageRows = this.svc.convertToStorageRowsViewData(res);
    }, () => {
      this.storageRows = [];
    });
  }

  getTablespaceUsage(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.tablespaceUsageOptions = {};
    this.loadWidget(this.loaderNames.tablespaceUsage, this.svc.getTablespaceUsage(filterFormOutput), res => {
      this.tablespaceUsageOptions = this.svc.convertToTablespaceUsageOptions(res);
    }, () => {
      this.tablespaceUsageOptions = {};
    });
  }

  getStorageGrowth(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.storageGrowthOptions = {};
    this.loadWidget(this.loaderNames.storageGrowth, this.svc.getStorageGrowth(filterFormOutput), res => {
      this.storageGrowthOptions = this.svc.convertToStorageGrowthOptions(res);
    }, () => {
      this.storageGrowthOptions = {};
    });
  }

  getArchiveLogGrowth(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.archiveLogGrowthOptions = {};
    this.loadWidget(this.loaderNames.archiveLogGrowth, this.svc.getArchiveLogGrowth(filterFormOutput), res => {
      this.archiveLogGrowthOptions = this.svc.convertToArchiveLogGrowthOptions(res);
    }, () => {
      this.archiveLogGrowthOptions = {};
    });
  }

  getLogGrowthRate(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.logGrowthRateOptions = {};
    this.loadWidget(this.loaderNames.logGrowthRate, this.svc.getLogGrowthRate(filterFormOutput), res => {
      this.logGrowthRateOptions = this.svc.convertToLogGrowthRateOptions(res);
    }, () => {
      this.logGrowthRateOptions = {};
    });
  }

  getDbSizeByServer(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.dbSizeByServerOptions = {};
    this.loadWidget(this.loaderNames.dbSizeByServer, this.svc.getDbSizeByServer(filterFormOutput), res => {
      this.dbSizeByServerOptions = this.svc.convertToDbSizeByServerOptions(res);
    }, () => {
      this.dbSizeByServerOptions = {};
    });
  }

  getLogSizeByServer(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.logSizeByServerOptions = {};
    this.loadWidget(this.loaderNames.logSizeByServer, this.svc.getLogSizeByServer(filterFormOutput), res => {
      this.logSizeByServerOptions = this.svc.convertToLogSizeByServerOptions(res);
    }, () => {
      this.logSizeByServerOptions = {};
    });
  }

  getDiskUtilization(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.diskUtilizationOptions = {};
    this.loadWidget(this.loaderNames.diskUtilization, this.svc.getDiskUtilization(filterFormOutput), res => {
      this.diskUtilizationOptions = this.svc.convertToDiskUtilizationOptions(res);
    }, () => {
      this.diskUtilizationOptions = {};
    });
  }

  getHealthGroups(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.healthGroups = [];
    this.loadWidget(this.loaderNames.healthGroups, this.svc.getHealthGroups(filterFormOutput), res => {
      this.healthGroups = this.svc.convertToHealthGroupsViewData(res);
    }, () => {
      this.healthGroups = [];
    });
  }

  getAlertSummaryMetrics(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.alertSummaryMetrics = [];
    this.loadWidget(this.loaderNames.alertSummary, this.svc.getAlertSummaryMetrics(filterFormOutput), res => {
      this.alertSummaryMetrics = this.svc.convertToAlertSummaryMetricsViewData(res);
    }, () => {
      this.alertSummaryMetrics = [];
    });
  }

  getCriticalAlerts(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.criticalAlerts = [];
    this.loadWidget(this.loaderNames.criticalAlerts, this.svc.getCriticalAlerts(filterFormOutput), res => {
      this.criticalAlerts = this.svc.convertToCriticalAlertsViewData(res);
    }, () => {
      this.criticalAlerts = [];
    });
  }

  getStatusClass(tone: DatabaseDashboardTone): string {
    return tone ? `tone-${tone}` : '';
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByValue(_: number, option: DatabaseDashboardFilterOption): string {
    return option.value;
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private loadWidget<T>(loaderName: string, request: Observable<T>, onSuccess: (res: T) => void, onError: () => void) {
    this.spinnerService.start(loaderName);
    request.pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => setTimeout(() => this.spinnerService.stop(loaderName), 0))
    ).subscribe(res => {
      onSuccess(res);
    }, () => {
      onError();
    });
  }
}
