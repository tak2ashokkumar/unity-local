import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { EChartsOption } from 'echarts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatabaseServersService } from 'src/app/united-cloud/shared/database-servers/database-servers.service';
import { DatabaseDashboardService } from './database-dashboard.service';
import {
  DatabaseDashboardAlertSummaryMetric,
  DatabaseDashboardCapacityMetric,
  DatabaseDashboardCriticalAlertViewData,
  DatabaseDashboardFilterCriteria,
  DatabaseDashboardFilterOption,
  DbDashboardHealthGroup,
  DatabaseDashboardMetric,
  DbDashboardSummary,
  DatabaseDashboardSelectOption,
  DatabaseDashboardTagItem,
  DatabaseDashboardTone,
  DatabaseDashboardVersionItem,
  DbDashboardReplicationSyncSummaryData,
  DBDashboardTopServersViewData,
  DatabaseDashboardTop10UtilizationViewData,
  DBDashboardEfficiencyGaugeViewData,
  DBDashboardTemporaryTablePerformanceViewData,
  DBDashboardEfficiencyServerViewData,
  DatabaseDashboardMetricInfo,
  DatabaseDashboardMetricInfoStatus,
  DatabaseDashboardStatusInfo
} from './database-dashboard.type';
import {
  DATABASE_DASHBOARD_EFFICIENCY_STATUS_INFO,
  DATABASE_DASHBOARD_METRIC_INFO_CONFIG,
  DATABASE_DASHBOARD_CUSTOM_TIMELINE_VALUE,
  DATABASE_DASHBOARD_TIME_RANGE_OPTIONS
} from './database-dashboard.const';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import moment from 'moment';
import { DateRangeOption, DateRangeSubmitPayload } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';

@Component({
  selector: 'database-dashboard',
  templateUrl: './database-dashboard.component.html',
  styleUrls: ['./database-dashboard.component.scss'],
  providers: [DatabaseDashboardService, DatabaseServersService]
})
export class DatabaseDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private appliedDatabaseFilterKey: string = '';
  readonly customTimelineValue = DATABASE_DASHBOARD_CUSTOM_TIMELINE_VALUE;
  refreshedText: string = '';
  filterForm: FormGroup;
  databaseOptions: DatabaseDashboardFilterOption[] = [];
  timeRangeOptions: DatabaseDashboardSelectOption[] = DATABASE_DASHBOARD_TIME_RANGE_OPTIONS;
  timeRangeDropdownOptions: DateRangeOption[] = this.getDateDropdownOptions(this.timeRangeOptions);
  metricInfoMap = DATABASE_DASHBOARD_METRIC_INFO_CONFIG;
  databaseEfficiencyStatusInfo: DatabaseDashboardStatusInfo[] = DATABASE_DASHBOARD_EFFICIENCY_STATUS_INFO;

  summaryMetrics: DatabaseDashboardMetric[] = [];
  // cloudTypeDistribution: DatabaseDashboardDonutItem[] = [];
  cloudTypeDistributionOptions: EChartsOption;
  dbCountByPlatformOptions: EChartsOption;
  dbByEnvironmentOptions: EChartsOption;
  tags: DatabaseDashboardTagItem[] = [];
  databaseVersions: DatabaseDashboardVersionItem[] = [];

  utilizationRows: DatabaseDashboardTop10UtilizationViewData[] = [];
  queryResponseOptions: EChartsOption;
  queryLatencyOptions: EChartsOption;
  activeSessionsOptions: EChartsOption;
  errorRateOptions: EChartsOption;
  transactionThroughputOptions: EChartsOption;
  cacheHitRatioOptions: EChartsOption;

  capacityMetrics: DatabaseDashboardCapacityMetric[] = [];
  storageRows: DBDashboardTopServersViewData[] = [];
  tablespaceUsageOptions: EChartsOption;
  storageGrowthOptions: EChartsOption;
  archiveLogGrowthOptions: EChartsOption;
  logGrowthRateOptions: EChartsOption;
  dbSizeByServerOptions: EChartsOption;
  logSizeByServerOptions: EChartsOption;
  diskUtilizationOptions: EChartsOption;
  bufferCacheEfficiency: DBDashboardEfficiencyGaugeViewData;
  databaseObjectUtilization: DBDashboardEfficiencyGaugeViewData;
  temporaryTablePerformance: DBDashboardTemporaryTablePerformanceViewData;
  databaseEfficiencyRows: DBDashboardEfficiencyServerViewData[] = [];

  healthGroups: DbDashboardHealthGroup[] = [];
  databaseAvailabilityStatus: DbDashboardSummary;
  replicationSync: DbDashboardReplicationSyncSummaryData;

  alertSummaryMetrics: DatabaseDashboardAlertSummaryMetric[] = [];
  criticalAlerts: DatabaseDashboardCriticalAlertViewData[] = [];

  loaderNames = {
    // filters: 'databaseDashboardFiltersLoader',
    inventoryOverview: 'inventoryOverviewWidgetLoader',
    performancWorkloadUtilization: 'workloadUtilizationWidgetLoader',
    performanceQueryResponse: 'queryResponceWidgetLoader',
    capacityGrowth: 'capacityGrowthWidgetLoader',
    healthOverview: 'healthOverviewWidgetLoader',
    alertAndEvents: 'alertAndEventsWidgetLoader',

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
    databaseEfficiency: 'databaseDashboardDatabaseEfficiencyLoader',
    databaseEfficiencyTop10Overview: 'databaseDashboardDatabaseEfficiencyTop10TableLoader',
    healthGroups: 'databaseDashboardHealthGroupsLoader',
    alertSummary: 'databaseDashboardAlertSummaryLoader',
    criticalAlerts: 'databaseDashboardCriticalAlertsLoader'
  };

  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-sm btn-block shadow-none',
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
  currentCriteria: SearchCriteria;

  sortColumn: string = 'cpu_usage_system_percent';
  sortDirection: string = 'asc';
  databaseEfficiencySortColumn: string = 'buffer_pool_efficiency';
  databaseEfficiencySortDirection: string = 'desc';

  constructor(private svc: DatabaseDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private alertDetailSvc: AimlAlertDetailsService,    
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.loadHeaderInfo(), 0);
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /** Loads database options first, then creates the filter form and starts widget loading. */
  loadHeaderInfo() {
    this.svc.getHeaderInfo().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshedText = this.convertLastRefreshTime(res?.refresh_time);
    }, () => {
      this.refreshedText = this.convertLastRefreshTime();
    });
  }

  /** Applies selected database filters to every database dashboard widget request. */
  applyFilters() {
    const filterFormOutput = this.getFilterFormOutput();
    if (this.getAppliedFilterKey(filterFormOutput) === this.appliedDatabaseFilterKey) {
      return;
    }
    this.loadData();
  }

  /** Reloads database filter options and rebuilds the dashboard after the filter form is ready. */
  refreshData() {
    this.loadFilterOptionsAndDashboard();
  }

  onDurationDropdownSubmit(event: DateRangeSubmitPayload) {
    this.patchDurationRange(event);
    this.syncCustomDurationControls();
    if (this.isDurationReady()) {
      this.loadData();
    }
  }

  // /** Reloads all filter options and recreates the filter form only after database data is ready. */
  // refreshFilters() {
  //   this.loadFilterOptionsAndDashboard();
  // }

  /** Loads database options first, then creates the filter form and starts widget loading. */
  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    // this.refreshedText = this.getCurrentRefreshedText();
    this.svc.getDatabases().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.databaseOptions = res || [];
      this.buildFilterForm();
      this.loadData();
    }, () => {
      this.databaseOptions = [];
      this.buildFilterForm();
      this.loadData();
    });
  }

  /** Creates the filter form with all currently loaded database options selected by default. */
  private buildFilterForm() {
    const selectedDatabases = this.databaseOptions.slice();
    this.filterForm = this.svc.buildFilterForm(selectedDatabases);
    this.syncCustomDurationControls();
  }

  /** Clears existing filter form/options so a fresh filter loading sequence can run. */
  private resetFilterState() {
    this.filterForm = null;
    this.databaseOptions = [];
    this.appliedDatabaseFilterKey = '';
  }

  /** Reads selected option values from a filter form control. */
  private getSelectedValues(controlName: string): string[] {
    const values = this.filterForm?.get(controlName)?.value || [];
    return this.getValuesFromOptions(values);
  }

  /** Normalizes selected filter option objects into API-friendly string values. */
  private getValuesFromOptions(options: Array<DatabaseDashboardFilterOption | string>): string[] {
    return (options || [])
      .map((item: DatabaseDashboardFilterOption | string) => typeof item === 'string' ? item : item?.uuid)
      .filter((value: string | undefined) => !!value) as string[];
  }

  /** Returns the normalized filter form output passed to all dashboard service calls. */
  private getFilterFormOutput(): DatabaseDashboardFilterCriteria {
    return {
      databases: this.getSelectedValues('databases'),
      duration: this.filterForm?.get('duration')?.value || '',
      durationFrom: this.filterForm?.get('durationFrom')?.value,
      durationTo: this.filterForm?.get('durationTo')?.value
    };
  }

  isCustomDurationSelected(): boolean {
    return this.filterForm?.get('duration')?.value === this.customTimelineValue;
  }

  get durationDropdownDefault(): string | DateRangeOption {
    const period = this.filterForm?.get('duration')?.value;
    if (period !== this.customTimelineValue) {
      return period;
    }
    return {
      value: this.customTimelineValue,
      label: 'Custom',
      from: this.filterForm?.get('durationFrom')?.value,
      to: this.filterForm?.get('durationTo')?.value
    };
  }

  /** Confirms the filter form exists and has loaded option data before widget APIs are called. */
  private hasFilterFormData(): boolean {
    return !!this.filterForm && !!this.databaseOptions.length;
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
      return options?.find(option => option.uuid === selectedValues[0])?.name || allLabel;
    }
    return `${selectedValues.length} ${pluralLabel}`;
  }

  onSorted($event: SearchCriteria) {
    this.sortColumn = $event.sortColumn;
    this.sortDirection = $event.sortDirection;
    this.getWorkloadInsightsTop10UtilData(this.getFilterFormOutput());
  }

  getSortDirection(columnName: string): string {
    return this.sortColumn === columnName ? this.sortDirection : '';
  }

  isSortedColumn(columnName: string): boolean {
    return !!this.getSortDirection(columnName);
  }

  onDatabaseEfficiencySorted($event: SearchCriteria) {
    this.databaseEfficiencySortColumn = $event.sortColumn;
    this.databaseEfficiencySortDirection = $event.sortDirection;
    this.getCapacityGrowthInsightsDBEfficiencyTableData(this.getFilterFormOutput());
  }

  getDatabaseEfficiencySortDirection(columnName: string): string {
    return this.databaseEfficiencySortColumn === columnName ? this.databaseEfficiencySortDirection : '';
  }

  isDatabaseEfficiencySortedColumn(columnName: string): boolean {
    return !!this.getDatabaseEfficiencySortDirection(columnName);
  }

  private convertLastRefreshTime(refreshTime?: string): string {
    const istOffsetMinutes = 330;
    const refreshMoment = refreshTime ? moment(refreshTime).utcOffset(istOffsetMinutes) : moment().utcOffset(istOffsetMinutes);
    const refreshedAt = refreshMoment.isValid() ? refreshMoment : moment().utcOffset(istOffsetMinutes);
    const today = moment().utcOffset(istOffsetMinutes);
    const yesterday = today.clone().subtract(1, 'day');
    const timeText = refreshedAt.format('HH:mm');

    if (refreshedAt.isSame(today, 'day')) {
      return `Today ${timeText} IST`;
    }
    if (refreshedAt.isSame(yesterday, 'day')) {
      return `Yesterday ${timeText} IST`;
    }

    return `${refreshedAt.format('dddd, DD MMM YYYY')} : ${timeText} IST`;
  }

  private syncCustomDurationControls() {
    const fromControl = this.filterForm?.get('durationFrom');
    const toControl = this.filterForm?.get('durationTo');
    if (!fromControl || !toControl) {
      return;
    }
    if (this.isCustomDurationSelected()) {
      fromControl.enable({ emitEvent: false });
      toControl.enable({ emitEvent: false });
    } else {
      fromControl.disable({ emitEvent: false });
      toControl.disable({ emitEvent: false });
    }
    this.filterForm.updateValueAndValidity({ emitEvent: false });
  }

  private isDurationReady(): boolean {
    if (!this.isCustomDurationSelected()) {
      return true;
    }
    const from = this.filterForm?.get('durationFrom')?.value;
    const to = this.filterForm?.get('durationTo')?.value;
    return !this.filterForm?.errors?.durationFromSameAsOrAfterTo &&
      !!from &&
      !!to &&
      !isNaN(new Date(from).getTime()) &&
      !isNaN(new Date(to).getTime());
  }

  private patchDurationRange(event: DateRangeSubmitPayload) {
    if (!this.filterForm) {
      return;
    }
    this.filterForm.patchValue({
      duration: event?.period || '',
      durationFrom: event?.from || null,
      durationTo: event?.to || null
    }, { emitEvent: false });
  }

  private getDateDropdownOptions(options: DatabaseDashboardSelectOption[]): DateRangeOption[] {
    return (options || [])
      .filter(option => option?.value !== this.customTimelineValue)
      .map(option => ({ label: option.label, value: option.value }));
  }

  private getAppliedFilterKey(criteria: DatabaseDashboardFilterCriteria): string {
    const durationFrom = criteria?.durationFrom ? moment(criteria.durationFrom).format('YYYY-MM-DD HH:mm:ss') : '';
    const durationTo = criteria?.durationTo ? moment(criteria.durationTo).format('YYYY-MM-DD HH:mm:ss') : '';
    return [
      (criteria?.databases || []).join('|'),
      criteria?.duration || '',
      durationFrom,
      durationTo
    ].join('__');
  }

  /** Loads all dashboard widgets only after the filter form exists and has loaded filter data. */
  loadData() {
    // if (!this.hasFilterFormData()) {
    //   return;
    // }
    const filterFormOutput = this.getFilterFormOutput();
    this.appliedDatabaseFilterKey = this.getAppliedFilterKey(filterFormOutput);
    setTimeout(() => {
      this.getInventoryOverviewWidgetData(filterFormOutput);
      this.getWorkloadInsightsTop10UtilData(filterFormOutput);
      this.getWorkloadInsightsTop10QueryWidgetData(filterFormOutput);
      // this.getCapacityGrowthInsightsWidgetData(filterFormOutput);
      this.getCapacityGrowthInsightsDBEfficiencyWidgetData(filterFormOutput);
      this.getCapacityGrowthInsightsDBEfficiencyTableData(filterFormOutput);
      this.getHealthOverviewWidgetData(filterFormOutput);
      this.getAlertsOverviewWidgetData(filterFormOutput);
    }, 0);
  }

  getInventoryOverviewWidgetData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    // this.spinnerService.start(this.loaderNames.inventoryOverview);
    this.spinnerService.start(this.loaderNames.summaryMetrics);
    this.spinnerService.start(this.loaderNames.cloudTypeDistribution);
    this.spinnerService.start(this.loaderNames.platformCounts);
    this.spinnerService.start(this.loaderNames.environmentCounts);
    this.spinnerService.start(this.loaderNames.tags);
    this.spinnerService.start(this.loaderNames.databaseVersions);
    this.summaryMetrics = [];
    this.cloudTypeDistributionOptions = null;
    this.dbCountByPlatformOptions = null;
    this.dbByEnvironmentOptions = null;
    this.tags = [];
    this.databaseVersions = [];
    this.svc.getInventoryOverviewWidgetData(filterFormOutput)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          // console.log("inventory resp,", res)
          this.summaryMetrics = this.svc.convertToSummaryViewData(res);
          this.cloudTypeDistributionOptions = this.svc.convertToCloudTypeDistributionOptions(res.by_cloud_type);
          this.dbCountByPlatformOptions = this.svc.convertToPlatformCountOptions(res.by_type);
          this.dbByEnvironmentOptions = this.svc.convertToEnvironmentOptions(res.by_environment);
          this.tags = this.svc.convertToTagsViewData(res.by_tags);
          this.databaseVersions = this.svc.convertToDatabaseVersionsViewData(res.by_version);
        }
        // this.spinnerService.stop(this.loaderNames.inventoryOverview);
        this.spinnerService.stop(this.loaderNames.summaryMetrics);
        this.spinnerService.stop(this.loaderNames.cloudTypeDistribution);
        this.spinnerService.stop(this.loaderNames.platformCounts);
        this.spinnerService.stop(this.loaderNames.environmentCounts);
        this.spinnerService.stop(this.loaderNames.tags);
        this.spinnerService.stop(this.loaderNames.databaseVersions);
      }, (_err: HttpErrorResponse) => {
        // this.spinnerService.stop(this.loaderNames.inventoryOverview);
        this.spinnerService.stop(this.loaderNames.summaryMetrics);
        this.spinnerService.stop(this.loaderNames.cloudTypeDistribution);
        this.spinnerService.stop(this.loaderNames.platformCounts);
        this.spinnerService.stop(this.loaderNames.environmentCounts);
        this.spinnerService.stop(this.loaderNames.tags);
        this.spinnerService.stop(this.loaderNames.databaseVersions);
        this.notification.error(new Notification('Failed to get inventory overview data. Try again later'));
      });
  }

  getWorkloadInsightsTop10UtilData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.spinnerService.start(this.loaderNames.performancWorkloadUtilization);
    this.utilizationRows = [];

    this.svc.getWorkloadInsightsTop10UtilizationViewData(filterFormOutput, this.sortColumn, this.sortDirection)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          // console.log("top 10 util resp,", res)
          this.utilizationRows = this.svc.convertToUtilizationRowsViewData(res);
        }
        this.spinnerService.stop(this.loaderNames.performancWorkloadUtilization);
      }, (_err: HttpErrorResponse) => {
        this.spinnerService.stop(this.loaderNames.performancWorkloadUtilization);
        this.notification.error(new Notification('Failed to get top 10 utilization data. Try again later'));
      });
  }

  getWorkloadInsightsTop10QueryWidgetData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    // this.spinnerService.start(this.loaderNames.performanceQueryResponse);
    this.spinnerService.start(this.loaderNames.queryResponse);
    this.spinnerService.start(this.loaderNames.queryLatency);
    this.spinnerService.start(this.loaderNames.activeSessions);
    this.spinnerService.start(this.loaderNames.errorRate);
    this.spinnerService.start(this.loaderNames.transactionThroughput);
    this.spinnerService.start(this.loaderNames.cacheHitRatio);
    this.queryResponseOptions = null;
    this.queryLatencyOptions = null;
    this.activeSessionsOptions = null;
    this.errorRateOptions = null;
    this.transactionThroughputOptions = null;
    this.cacheHitRatioOptions = null;
    this.svc.getWorkloadInsightsTop10QueryWidgetData(filterFormOutput)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          // console.log("top 10 query resp,", res)
          this.queryResponseOptions = this.svc.convertToQueryResponseOptions(res.top_response_time);
          this.queryLatencyOptions = this.svc.convertToQueryLatencyOptions(res.top_latency);
          this.activeSessionsOptions = this.svc.convertToActiveSessionsOptions(res.top_connections);
          this.errorRateOptions = this.svc.convertToErrorRateOptions(res.top_errors_deadlocks);
          this.transactionThroughputOptions = this.svc.convertToTransactionThroughputOptions(res.top_throughput);
          this.cacheHitRatioOptions = this.svc.convertToCacheHitRatioOptions(res.top_cache_hit_ratio);
        }
        // this.spinnerService.stop(this.loaderNames.performanceQueryResponse);
        this.spinnerService.stop(this.loaderNames.queryResponse);
        this.spinnerService.stop(this.loaderNames.queryLatency);
        this.spinnerService.stop(this.loaderNames.activeSessions);
        this.spinnerService.stop(this.loaderNames.errorRate);
        this.spinnerService.stop(this.loaderNames.transactionThroughput);
        this.spinnerService.stop(this.loaderNames.cacheHitRatio);
      }, (_err: HttpErrorResponse) => {
        // this.spinnerService.stop(this.loaderNames.performanceQueryResponse);
        this.spinnerService.stop(this.loaderNames.queryResponse);
        this.spinnerService.stop(this.loaderNames.queryLatency);
        this.spinnerService.stop(this.loaderNames.activeSessions);
        this.spinnerService.stop(this.loaderNames.errorRate);
        this.spinnerService.stop(this.loaderNames.transactionThroughput);
        this.spinnerService.stop(this.loaderNames.cacheHitRatio);
        this.notification.error(new Notification('Failed to get workload insights data. Try again later'));
      });
  }

  getCapacityGrowthInsightsWidgetData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    // this.spinnerService.start(this.loaderNames.capacityGrowth);
    this.spinnerService.start(this.loaderNames.storageGrowth);
    this.spinnerService.start(this.loaderNames.tablespaceUsage);
    this.spinnerService.start(this.loaderNames.storageGrowth);
    this.spinnerService.start(this.loaderNames.archiveLogGrowth);
    this.spinnerService.start(this.loaderNames.logGrowthRate);
    this.spinnerService.start(this.loaderNames.dbSizeByServer);
    this.spinnerService.start(this.loaderNames.logSizeByServer);
    this.spinnerService.start(this.loaderNames.diskUtilization);
    this.capacityMetrics = [];
    this.storageRows = [];
    this.tablespaceUsageOptions = null;
    this.storageGrowthOptions = null;
    this.archiveLogGrowthOptions = null;
    this.logGrowthRateOptions = null;
    this.dbSizeByServerOptions = null;
    this.logSizeByServerOptions = null;
    this.diskUtilizationOptions = null;
    this.svc.getCapacityGrowthInsightsWidgetData(filterFormOutput)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          // console.log("capacity growth insights,", res)
          this.capacityMetrics = this.svc.convertToCapacityMetricsViewData(res.summary_stats);
          this.storageRows = this.svc.convertToStorageRowsViewData(res.top_servers);
          this.tablespaceUsageOptions = this.svc.convertToTablespaceUsageOptions(res.top_tablespace_filesystem_usage);
          this.storageGrowthOptions = this.svc.convertToStorageGrowthOptions(res.storage_growth_trend);
          this.archiveLogGrowthOptions = this.svc.convertToArchiveLogGrowthOptions(res.archive_log_growth_trend);
          this.logGrowthRateOptions = this.svc.convertToLogGrowthRateOptions(res.log_growth_rate);
          this.dbSizeByServerOptions = this.svc.convertToDbSizeByServerOptions(res.db_size_by_server);
          this.logSizeByServerOptions = this.svc.convertToLogSizeByServerOptions(res.log_size_by_server);
          this.diskUtilizationOptions = this.svc.convertToDiskUtilizationOptions(res.disk_utilization);
        }
        // this.spinnerService.stop(this.loaderNames.capacityGrowth);
        this.spinnerService.stop(this.loaderNames.storageGrowth);
        this.spinnerService.stop(this.loaderNames.tablespaceUsage);
        this.spinnerService.stop(this.loaderNames.storageGrowth);
        this.spinnerService.stop(this.loaderNames.archiveLogGrowth);
        this.spinnerService.stop(this.loaderNames.logGrowthRate);
        this.spinnerService.stop(this.loaderNames.dbSizeByServer);
        this.spinnerService.stop(this.loaderNames.logSizeByServer);
        this.spinnerService.stop(this.loaderNames.diskUtilization);
      }, (_err: HttpErrorResponse) => {
        // this.spinnerService.stop(this.loaderNames.capacityGrowth);
        this.spinnerService.stop(this.loaderNames.storageGrowth);
        this.spinnerService.stop(this.loaderNames.tablespaceUsage);
        this.spinnerService.stop(this.loaderNames.storageGrowth);
        this.spinnerService.stop(this.loaderNames.archiveLogGrowth);
        this.spinnerService.stop(this.loaderNames.logGrowthRate);
        this.spinnerService.stop(this.loaderNames.dbSizeByServer);
        this.spinnerService.stop(this.loaderNames.logSizeByServer);
        this.spinnerService.stop(this.loaderNames.diskUtilization);
        this.notification.error(new Notification('Failed to get capacity growth insights data. Try again later'));
      });
  }

  getCapacityGrowthInsightsDBEfficiencyWidgetData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.spinnerService.start(this.loaderNames.databaseEfficiency);
    this.bufferCacheEfficiency = null;
    this.databaseObjectUtilization = null;
    this.temporaryTablePerformance = null;
    this.svc.getDatabaseEfficiencyWidgetData(filterFormOutput)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.bufferCacheEfficiency = this.svc.convertToBufferCacheEfficiencyViewData(res.buffer_cache_efficiency);
          this.databaseObjectUtilization = this.svc.convertToDatabaseObjectUtilizationViewData(res.database_object_utilization);
          this.temporaryTablePerformance = this.svc.convertToTemporaryTablePerformanceViewData(res.temporary_table_performance);
        }
        this.spinnerService.stop(this.loaderNames.databaseEfficiency);
      }, (_err: HttpErrorResponse) => {
        this.spinnerService.stop(this.loaderNames.databaseEfficiency);
        this.notification.error(new Notification('Failed to get database efficiency data. Try again later'));
      });
  }

  getCapacityGrowthInsightsDBEfficiencyTableData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.spinnerService.start(this.loaderNames.databaseEfficiencyTop10Overview);
    this.databaseEfficiencyRows = [];
    this.svc.getDatabaseEfficiencyTableData(filterFormOutput, this.databaseEfficiencySortColumn, this.databaseEfficiencySortDirection)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.databaseEfficiencyRows = this.svc.convertToDatabaseEfficiencyRowsViewData(res.servers);
        }
        this.spinnerService.stop(this.loaderNames.databaseEfficiencyTop10Overview);
      }, (_err: HttpErrorResponse) => {
        this.spinnerService.stop(this.loaderNames.databaseEfficiencyTop10Overview);
        this.notification.error(new Notification('Failed to get database efficiency overview data. Try again later'));
      });
  }

  getHealthOverviewWidgetData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    this.spinnerService.start(this.loaderNames.healthOverview);
    this.databaseAvailabilityStatus = null;
    this.replicationSync = null;
    this.svc.getHealthOverviewWidgetData(filterFormOutput)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          // console.log("health overview,", res);
          this.databaseAvailabilityStatus = this.svc.convertTodatabaseAvailabilityStatus(res.summary);
          this.replicationSync = this.svc.convertToReplicationSync(res.replication_sync);
        }
        this.spinnerService.stop(this.loaderNames.healthOverview);
      }, (_err: HttpErrorResponse) => {
        this.spinnerService.stop(this.loaderNames.healthOverview);
        this.notification.error(new Notification('Failed to get health overview data. Try again later'));
      });
  }

  getAlertsOverviewWidgetData(filterFormOutput: DatabaseDashboardFilterCriteria) {
    // this.spinnerService.start(this.loaderNames.alertAndEvents);
    this.spinnerService.start(this.loaderNames.alertSummary);
    this.spinnerService.start(this.loaderNames.criticalAlerts);
    this.alertSummaryMetrics = [];
    this.criticalAlerts = [];
    this.svc.getAlertsOverviewWidgetData(filterFormOutput)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          // console.log("alerts and events resp,", res)
          this.alertSummaryMetrics = this.svc.convertToAlertSummaryViewData(res.summary);
          this.criticalAlerts = this.svc.convertToCriticalAlertsTableData(res.critical_alerts);
        }
        // this.spinnerService.stop(this.loaderNames.alertAndEvents);
        this.spinnerService.stop(this.loaderNames.alertSummary);
        this.spinnerService.stop(this.loaderNames.criticalAlerts);
      }, (_err: HttpErrorResponse) => {
        // this.spinnerService.stop(this.loaderNames.alertAndEvents);        
        this.spinnerService.stop(this.loaderNames.alertSummary);
        this.spinnerService.stop(this.loaderNames.criticalAlerts);
        this.notification.error(new Notification('Failed to get alerts and events overview data. Try again later'));
      });
  }

  getStatusClass(tone: DatabaseDashboardTone): string {
    return tone ? `tone-${tone}` : '';
  }

  getMetricInfo(headerName: string): DatabaseDashboardMetricInfo {
    return this.metricInfoMap[headerName];
  }

  trackByMetricInfoStatus(_: number, status: DatabaseDashboardMetricInfoStatus): string {
    return `${status.name}-${status.range}`;
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByValue(_: number, option: DatabaseDashboardFilterOption): string {
    return option.uuid;
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  openDatabaseServersList(){
    this.openRouteInNewTab('/unitycloud/devices/databases');
  }

  openDatabaseServerDetails(dbServerUUID: string){
    if(!dbServerUUID) {return;}
    this.openRouteInNewTab(`/unitycloud/devices/databases/${dbServerUUID}/details`);
  }

  openDatabaseDetails(dbServerUUID: string, dbUUID){   
    this.openRouteInNewTab(`/unitycloud/devices/databases/${dbServerUUID}/details/database_details/${dbUUID}`);
  }

  openSummaryMetric(metric: DatabaseDashboardMetric) {
    const routes: Record<string, string> = {
      total_databases:'/unitycloud/devices/databases',
    };
    if (!metric || !routes[metric.key]) { return; }
    this.openRouteInNewTab(routes[metric.key]);
  }

  onInventoryChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(`/unitycloud/devices/databases`);
    });
  }

  onTop10QueryRespChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(`/unitycloud/devices/databases/${params.data.db_uuid}/details`);
    });
  }

  onGrowthInsightsChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      this.openRouteInNewTab(`/unitycloud/devices/databases/${params.data.db_uuid}/details`);
    });
  }

  viewAlertDetails(uuid: string) {
    if(!uuid) { return; }
    this.alertDetailSvc.showAlertDetails(uuid);
  }

  openAlertsPage(metric: DatabaseDashboardAlertSummaryMetric) {
    const routes: Record<string, string> = {
      critical_alerts: '/services/aiml-event-mgmt/alerts',
      high_alerts: '/services/aiml-event-mgmt/alerts',
      // open_itsm_tickets: '/services/aiml-event-mgmt/alerts',
      // automation_success_pct: '/services/aiml-event-mgmt/alerts',
    };
    if (!metric || !routes[metric.key]) { return; }
    this.openRouteInNewTab(routes[metric.key]);
  }

  private bindChartClick(chartInstance: any, handler: (params: any) => void) {
    chartInstance.on('click', handler);
  }

  private openRouteInNewTab(url: string) {
    // const routeUrl = this.router.serializeUrl(this.router.createUrlTree(commands));
    const externalUrl = this.location.prepareExternalUrl(url);
    window.open(externalUrl, '_blank', 'noopener');
  }

  // private loadWidget<T>(loaderName: string, request: Observable<T>, onSuccess: (res: T) => void, onError: () => void) {
  //   this.spinnerService.start(loaderName);
  //   request.pipe(
  //     takeUntil(this.ngUnsubscribe),
  //     finalize(() => setTimeout(() => this.spinnerService.stop(loaderName), 0))
  //   ).subscribe(res => {
  //     onSuccess(res);
  //   }, () => {
  //     onError();
  //   });
  // }

}
