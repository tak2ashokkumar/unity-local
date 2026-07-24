import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ColumnSortedEvent } from 'src/app/shared/table-functionality/sortable-column/sort.service';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import {
  EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE,
  EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS
} from './event-analytics-dashboard.const';
import { EventAnalyticsDashboardService } from './event-analytics-dashboard.service';
import {
  EventAlertAnalyticsApiResponse,
  DashboardFilterCriteria,
  DashboardFilters,
  DashboardHeader,
  EventAnalyticsTone,
  IncidentAlertByDeviceViewData,
  IncidentAlertTableSortColumn,
  IncidentTicketViewData,
  IncidentTicketTableSortColumn,
  ItsmTicketRowViewData,
  ItsmTicketViewApiResponse,
  MetricViewData,
  NoisyEventRowViewData,
  NoisyTableSortColumn,
  PipelineViewData,
  SelectOption
} from './event-analytics-dashboard.type';

@Component({
  selector: 'event-analytics-dashboard',
  templateUrl: './event-analytics-dashboard.component.html',
  styleUrls: ['./event-analytics-dashboard.component.scss'],
  providers: [EventAnalyticsDashboardService]
})
export class EventAnalyticsDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  filterForm: FormGroup;
  headerData: DashboardHeader;

  timeRangeOptions: SelectOption[] = [];
  trendTimelineOptions: SelectOption[] = [];
  eventDeviceCategoryOptions: SelectOption[] = [];
  alertSegregationCategoryOptions: SelectOption[] = [];
  analyticsCategoryOptions: SelectOption[] = [];
  noisyEventsCategoryOptions: SelectOption[] = [];
  noisyHostsCategoryOptions: SelectOption[] = [];
  incidentCategoryOptions: SelectOption[] = [];
  trendAlertTypeOptions: SelectOption[] = EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS;
  readonly customTimelineValue = EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE;
  analyticsViewByOptions: SelectOption[] = [];
  analyticsSourceTypeOptions: SelectOption[] = [];
  analyticsSeverityTypeOptions: SelectOption[] = [];
  analyticsDatacenterOptions: SelectOption[] = [];
  analyticsCloudOptions: SelectOption[] = [];
  eventAndAlertTimelineOptions: SelectOption[] = [];
  timeRangeDropdownOptions: DateRangeOption[] = [];
  trendTimelineDropdownOptions: DateRangeOption[] = [];
  eventAndAlertTimelineDropdownOptions: DateRangeOption[] = [];

  summaryMetrics: MetricViewData[] = [];
  pipelineData: PipelineViewData;

  eventByDeviceCategoryCards: MetricViewData[] = [];
  eventByDeviceCategoryOptions: EChartsOption;

  alertGeneratedMetrics: MetricViewData[] = [];
  alertGeneratedOptions: EChartsOption;
  alertStatusMetrics: MetricViewData[] = [];
  alertStatusOptions: EChartsOption;
  trendByTimelineOptions: EChartsOption;
  alertSegregationMetrics: MetricViewData[] = [];
  alertSegregationOptions: EChartsOption;

  eventAlertAnalyticsLeftMetrics: MetricViewData[] = [];
  eventAlertAnalyticsRightMetrics: MetricViewData[] = [];
  eventReductionFlowOptions: EChartsOption;
  incidentResolutionFlowOptions: EChartsOption;
  private eventAlertAnalyticsResponse: EventAlertAnalyticsApiResponse | null = null;

  noisyEvents: NoisyEventRowViewData[] = [];
  noisyHosts: NoisyEventRowViewData[] = [];
  noisyHostsOptions: EChartsOption;
  noisyEventsSortState: { sortColumn: NoisyTableSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  noisyHostsSortState: { sortColumn: NoisyTableSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };

  incidentAlertRows: IncidentAlertByDeviceViewData[] = [];
  openIncidentTickets: IncidentTicketViewData[] = [];
  resolvedIncidentTickets: IncidentTicketViewData[] = [];
  incidentAlertSortState: { sortColumn: IncidentAlertTableSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  openIncidentSortState: { sortColumn: IncidentTicketTableSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  resolvedIncidentSortState: { sortColumn: IncidentTicketTableSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  itsmTicketTabOptions: SelectOption[] = [];
  itsmTicketStateOptions: SelectOption[] = [];
  itsmTicketPriorityOptions: SelectOption[] = [];
  itsmTicketTypeOptions: SelectOption[] = [];
  itsmTicketsByPriorityOptions: EChartsOption;
  itsmTicketsByStatusOptions: EChartsOption;
  itsmSolvedByResponseTimeOptions: EChartsOption;
  itsmTicketRows: ItsmTicketRowViewData[] = [];
  itsmTicketTotal = 0;

  loaderNames = {
    summaryMetrics: 'eventAnalyticsSummaryMetricsLoader',
    pipeline: 'eventAnalyticsPipelineLoader',
    eventByDeviceCategory: 'eventAnalyticsEventByDeviceCategoryLoader',
    alertGenerated: 'eventAnalyticsAlertGeneratedLoader',
    alertStatus: 'eventAnalyticsAlertStatusLoader',
    trendByTimeline: 'eventAnalyticsTrendByTimelineLoader',
    alertSegregation: 'eventAnalyticsAlertSegregationLoader',
    eventAlertAnalytics: 'eventAnalyticsEventAlertAnalyticsLoader',
    noisyEvents: 'eventAnalyticsNoisyEventsLoader',
    noisyHosts: 'eventAnalyticsNoisyHostsLoader',
    incidentAlertByDeviceType: 'eventAnalyticsIncidentAlertByDeviceTypeLoader',
    openIncidentTickets: 'eventAnalyticsOpenIncidentTicketsLoader',
    resolvedIncidentTickets: 'eventAnalyticsResolvedIncidentTicketsLoader',
    itsmTicketView: 'eventAnalyticsItsmTicketViewLoader'
  };

  trendAlertTypeMultiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-sm btn-block shadow-none',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: false,
    selectAsObject: false,
    mandatoryLimit: 1,
    maxHeight: '180px'
  };

  trendAlertTypeMultiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'type selected',
    checkedPlural: 'types selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Alert Type',
    allSelected: 'All'
  };

  constructor(private svc: EventAnalyticsDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.initializeDefaultWidgetSummaries();
    this.getHeaderData();
    this.getDashboardFilters();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.loadData();
  }

  onTimelineDropdownSubmit(event: { period?: string; from?: Date | string; to?: Date | string }) {
    this.patchTimelineRange('timeline', 'timelineFrom', 'timelineTo', event);
    this.syncCustomTimelineControls();
    if (this.isTimelineReady()) {
      this.loadData();
    }
  }

  onEventDeviceCategoryChange(category: string) {
    this.filterForm.get('eventDeviceCategory').setValue(category);
    this.getEventByDeviceCategory(this.getFilterCriteria());
  }

  onTrendAlertTypesChange() {
    this.getTrendByTimeline(this.getFilterCriteria());
  }

  onTrendTimelineDropdownSubmit(event: { period?: string; from?: Date | string; to?: Date | string }) {
    this.patchTimelineRange('trendTimeline', 'trendTimelineFrom', 'trendTimelineTo', event);
    this.syncTrendCustomTimelineControls();
    if (this.isTrendTimelineReady()) {
      this.getTrendByTimeline(this.getFilterCriteria());
    }
  }

  onAlertSegregationCategoryChange(category: string) {
    this.filterForm.get('alertSegregationCategory').setValue(category);
    this.getAlertSegregation(this.getFilterCriteria());
  }

  onAnalyticsViewByChange() {
    this.applyEventAlertAnalyticsView();
  }

  onAnalyticsFilterChange() {
    this.getEventAlertAnalytics(this.getFilterCriteria());
  }

  onEventAndAlertTimelineDropdownSubmit(event: { period?: string; from?: Date | string; to?: Date | string }) {
    this.patchTimelineRange('eventAndAlertTimeline', 'eventAndAlertTimelineFrom', 'eventAndAlertTimelineTo', event);
    this.syncEventAndAlertTimelineControls();
    if (this.isEventAndAlertTimelineReady()) {
      this.getEventAlertAnalytics(this.getFilterCriteria());
    }
  }

  onNoisyEventsCategoryChange(category: string) {
    this.filterForm.get('noisyEventsCategory').setValue(category);
    this.getNoisyEvents(this.getFilterCriteria());
  }

  onNoisyHostsCategoryChange(category: string) {
    this.filterForm.get('noisyHostsCategory').setValue(category);
    this.getNoisyHosts(this.getFilterCriteria());
  }

  onIncidentCategoryChange(category: string) {
    this.filterForm.get('incidentCategory').setValue(category);
    this.getIncidentManagement(this.getFilterCriteria());
  }

  onItsmTicketTabChange(tab: string) {
    this.filterForm.patchValue({
      itsmTicketTab: tab,
      itsmTicketPage: 1
    }, { emitEvent: false });
    this.getItsmTicketView(this.getFilterCriteria());
  }

  applyItsmTicketFilters() {
    this.svc.syncItsmTicketDateRange(this.filterForm);
    this.filterForm.patchValue({
      itsmTicketPage: 1
    }, { emitEvent: false });
    this.getItsmTicketView(this.getFilterCriteria());
  }

  onItsmTicketPageChange(pageNo: number) {
    if (this.filterForm?.get('itsmTicketPage')?.value === pageNo) {
      return;
    }
    this.filterForm.patchValue({
      itsmTicketPage: pageNo
    }, { emitEvent: false });
    this.getItsmTicketView(this.getFilterCriteria());
  }

  onItsmTicketPageSizeChange(pageSize: number) {
    this.filterForm.patchValue({
      itsmTicketPerPage: pageSize,
      itsmTicketPage: 1
    }, { emitEvent: false });
    this.getItsmTicketView(this.getFilterCriteria());
  }

  onItsmTicketSorted(event: { sortColumn?: string; sortDirection?: '' | 'asc' | 'desc' }) {
    this.filterForm.patchValue({
      itsmTicketSortColumn: event?.sortColumn || '',
      itsmTicketSortDirection: event?.sortDirection || '',
      itsmTicketPage: 1
    }, { emitEvent: false });
    this.getItsmTicketView(this.getFilterCriteria());
  }

  get hasEventByDeviceCategoryChart(): boolean {
    return !!this.eventByDeviceCategoryOptions;
  }

  get hasEventByDeviceCategoryCardsData(): boolean {
    return !!this.eventByDeviceCategoryCards?.length;
  }

  get hasEventByDeviceCategoryData(): boolean {
    return this.hasEventByDeviceCategoryChart || this.hasEventByDeviceCategoryCardsData;
  }

  getHeaderData() {
    this.svc.getHeaderTextData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.headerData = this.svc.buildHeaderData(res);
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get event analytics headers. Try again later.'));
    });
  }

  getDashboardFilters() {
    this.svc.getDashboardFilters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const filters = this.svc.buildDashboardFilters(res);
      this.applyDashboardFilters(filters);
      this.buildFilterForm(filters);
      this.ensureFilterSelections();
      this.syncCustomTimelineControls();
      this.syncTrendCustomTimelineControls();
      this.syncEventAndAlertTimelineControls();
      this.loadData();
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get event analytics filters. Try again later.'));
      const filters = this.svc.getDefaultDashboardFilters();
      this.applyDashboardFilters(filters);
      this.buildFilterForm(filters);
      this.ensureFilterSelections();
      this.syncCustomTimelineControls();
      this.syncTrendCustomTimelineControls();
      this.syncEventAndAlertTimelineControls();
      this.loadData();
    });
  }

  buildFilterForm(filters?: DashboardFilters) {
    this.filterForm = this.svc.buildFilterForm(filters);
  }

  loadData() {
    const criteria = this.getFilterCriteria();
    if (!criteria || !this.isTimelineReady()) {
      return;
    }
    this.getExecutiveSummary(criteria);
    this.getEventPipeline(criteria);
    this.getEventByDeviceCategory(criteria);
    this.getAlertGenerated(criteria);
    this.getAlertStatus(criteria);
    if (this.isTrendTimelineReady()) {
      this.getTrendByTimeline(criteria);
    }
    this.getAlertSegregation(criteria);
    this.getEventAlertAnalytics(criteria);
    this.getNoisyEvents(criteria);
    this.getNoisyHosts(criteria);
    this.getIncidentManagement(criteria);
    this.getItsmTicketView(criteria);
  }

  private initializeDefaultWidgetSummaries() {
    this.summaryMetrics = this.svc.getDefaultSummaryMetrics();
    this.alertGeneratedMetrics = this.svc.getDefaultAlertGeneratedMetrics();
    this.alertStatusMetrics = this.svc.getDefaultAlertStatusMetrics();
    this.alertSegregationMetrics = this.svc.getDefaultAlertSegregationMetrics();
    const analyticsMetricGroups = this.svc.convertToEventAlertAnalyticsMetricGroups();
    this.eventAlertAnalyticsLeftMetrics = analyticsMetricGroups.left;
    this.eventAlertAnalyticsRightMetrics = analyticsMetricGroups.right;
  }

  getExecutiveSummary(criteria: DashboardFilterCriteria) {
    this.summaryMetrics = this.svc.getDefaultSummaryMetrics();
    this.loadWidget(this.loaderNames.summaryMetrics, this.svc.getSummary(criteria), res => {
      this.summaryMetrics = this.svc.convertToSummaryMetrics(res);
    }, () => {
      this.summaryMetrics = this.svc.getDefaultSummaryMetrics();
      this.notification.error(new Notification('Failed to get event analytics summary. Try again later.'));
    });
  }

  getEventPipeline(criteria: DashboardFilterCriteria) {
    this.pipelineData = null;
    this.loadWidget(this.loaderNames.pipeline, this.svc.getEventPipeline(criteria), res => {
      this.pipelineData = this.svc.convertToPipelineData(res);
    }, () => {
      this.notification.error(new Notification('Failed to get event processing pipeline data. Try again later.'));
    });
  }

  getEventByDeviceCategory(criteria: DashboardFilterCriteria) {
    this.eventByDeviceCategoryCards = [];
    this.eventByDeviceCategoryOptions = null;
    this.loadWidget(this.loaderNames.eventByDeviceCategory, this.svc.getEventByDeviceCategory(criteria), res => {
      this.eventByDeviceCategoryCards = this.svc.convertToDeviceCategoryCards(res.tiles);
      this.eventByDeviceCategoryOptions = this.svc.convertToDeviceCategoryChart(res.tiles);
      this.eventDeviceCategoryOptions = this.svc.getCategoryOptions(res.categoryOptions);
      this.ensureSelectSelection('eventDeviceCategory', this.eventDeviceCategoryOptions, this.svc.getActiveCategory(res.activeCategory, criteria.eventDeviceCategory));
    }, () => {
      this.notification.error(new Notification('Failed to get event by device category data. Try again later.'));
    });
  }

  getAlertGenerated(criteria: DashboardFilterCriteria) {
    this.alertGeneratedMetrics = this.svc.getDefaultAlertGeneratedMetrics();
    this.alertGeneratedOptions = null;
    this.loadWidget(this.loaderNames.alertGenerated, this.svc.getAlertsGenerated(criteria), res => {
      this.alertGeneratedMetrics = this.svc.convertToMetricKpis(res.kpis, this.svc.getAlertGeneratedMetricFallback());
      this.alertGeneratedOptions = this.svc.convertToDonutChart(res.donut, ['50%', '70%']);
    }, () => {
      this.alertGeneratedMetrics = this.svc.getDefaultAlertGeneratedMetrics();
      this.notification.error(new Notification('Failed to get alert generated data. Try again later.'));
    });
  }

  getAlertStatus(criteria: DashboardFilterCriteria) {
    this.alertStatusMetrics = this.svc.getDefaultAlertStatusMetrics();
    this.alertStatusOptions = null;
    this.loadWidget(this.loaderNames.alertStatus, this.svc.getAlertStatus(criteria), res => {
      this.alertStatusMetrics = this.svc.convertToMetricKpis(res.kpis, this.svc.getAlertStatusMetricFallback());
      this.alertStatusOptions = this.svc.convertToDonutChart(res.donut, ['50%', '70%']);
    }, () => {
      this.alertStatusMetrics = this.svc.getDefaultAlertStatusMetrics();
      this.notification.error(new Notification('Failed to get alert status data. Try again later.'));
    });
  }

  getTrendByTimeline(criteria: DashboardFilterCriteria) {
    if (!this.isTrendTimelineReady()) {
      return;
    }
    this.trendByTimelineOptions = null;
    this.loadWidget(this.loaderNames.trendByTimeline, this.svc.getTrendByTimeline(criteria), res => {
      this.trendAlertTypeOptions = this.svc.getTrendAlertTypeOptions(res.entityTypeOptions);
      const selectedTrendAlertTypes = this.svc.getActiveTrendAlertTypes(
        res.activeEntityType,
        res.entityTypeOptions,
        criteria.trendAlertTypes
      );
      this.filterForm.get('trendAlertTypes')?.setValue(selectedTrendAlertTypes, { emitEvent: false });
      this.trendByTimelineOptions = this.svc.convertToTrendChartData(res, selectedTrendAlertTypes);
      const trendOptions = this.svc.getTimeRangeOptions(res.timeRangeOptions);
      if (trendOptions?.length) {
        this.trendTimelineOptions = trendOptions;
        this.trendTimelineDropdownOptions = this.getDateDropdownOptions(trendOptions);
      }
      this.ensureSelectSelection('trendTimeline', this.trendTimelineOptions, this.svc.getActiveTimeRange(res.activeTimeRange, criteria.trendTimeline));
    }, () => {
      this.notification.error(new Notification('Failed to get trend by timeline data. Try again later.'));
    });
  }

  getAlertSegregation(criteria: DashboardFilterCriteria) {
    this.alertSegregationMetrics = this.svc.getDefaultAlertSegregationMetrics();
    this.alertSegregationOptions = null;
    this.loadWidget(this.loaderNames.alertSegregation, this.svc.getAlertSegregation(criteria), res => {
      this.alertSegregationMetrics = this.svc.convertToAlertSegregationSummary(res);
      this.alertSegregationOptions = this.svc.convertToAlertSegregationChart(res.bars);
      this.alertSegregationCategoryOptions = this.svc.getCategoryOptions(res.categoryOptions);
      this.ensureSelectSelection('alertSegregationCategory', this.alertSegregationCategoryOptions, this.svc.getActiveCategory(res.activeCategory, criteria.alertSegregationCategory));
    }, () => {
      this.alertSegregationMetrics = this.svc.getDefaultAlertSegregationMetrics();
      this.notification.error(new Notification('Failed to get alert segregation data. Try again later.'));
    });
  }

  getEventAlertAnalytics(criteria: DashboardFilterCriteria) {
    const defaultMetricGroups = this.svc.convertToEventAlertAnalyticsMetricGroups();
    this.eventAlertAnalyticsLeftMetrics = defaultMetricGroups.left;
    this.eventAlertAnalyticsRightMetrics = defaultMetricGroups.right;
    this.eventAlertAnalyticsResponse = null;
    this.eventReductionFlowOptions = null;
    this.incidentResolutionFlowOptions = null;
    this.loadWidget(this.loaderNames.eventAlertAnalytics, this.svc.getEventAlertAnalytics(criteria), res => {
      this.eventAlertAnalyticsResponse = res;
      const metricGroups = this.svc.convertToEventAlertAnalyticsMetricGroups(res);
      this.eventAlertAnalyticsLeftMetrics = metricGroups.left;
      this.eventAlertAnalyticsRightMetrics = metricGroups.right;
      this.analyticsViewByOptions = res.viewOptions?.length ? res.viewOptions : this.analyticsViewByOptions;
      this.analyticsSourceTypeOptions = res.sourceOptions?.length ? res.sourceOptions : this.analyticsSourceTypeOptions;
      this.analyticsSeverityTypeOptions = res.severityOptions?.length ? res.severityOptions : this.analyticsSeverityTypeOptions;
      this.analyticsDatacenterOptions = res.datacenterOptions?.length ? res.datacenterOptions : this.analyticsDatacenterOptions;
      this.analyticsCloudOptions = res.cloudOptions?.length ? res.cloudOptions : this.analyticsCloudOptions;
      this.analyticsCategoryOptions = this.svc.getCategoryOptions(res.categoryOptions);
      if (res.timeRangeOptions?.length) {
        const eventAndAlertTimelineOptions = this.svc.getTimeRangeOptions(res.timeRangeOptions);
        this.eventAndAlertTimelineOptions = eventAndAlertTimelineOptions;
        this.eventAndAlertTimelineDropdownOptions = this.getDateDropdownOptions(eventAndAlertTimelineOptions);
      }
      this.ensureSelectSelection('analyticsViewBy', this.analyticsViewByOptions, criteria.analyticsViewBy || res.viewBy);
      this.ensureSelectSelection('analyticsSourceType', this.analyticsSourceTypeOptions, criteria.analyticsSourceType);
      this.ensureSelectSelection('analyticsSeverityType', this.analyticsSeverityTypeOptions, criteria.analyticsSeverityType);
      this.ensureSelectSelection('analyticsDatacenter', this.analyticsDatacenterOptions, criteria.analyticsDatacenter);
      this.ensureSelectSelection('analyticsCloud', this.analyticsCloudOptions, criteria.analyticsCloud);
      this.ensureSelectSelection('analyticsCategory', this.analyticsCategoryOptions, this.svc.getActiveCategory(res.activeCategory, criteria.analyticsCategory));
      this.ensureSelectSelection('eventAndAlertTimeline', this.eventAndAlertTimelineOptions, this.svc.getActiveTimeRange(res.activeTimeRange, criteria.eventAndAlertTimeline));
      this.applyEventAlertAnalyticsView();
    }, () => {
      this.eventAlertAnalyticsResponse = null;
      const fallbackMetricGroups = this.svc.convertToEventAlertAnalyticsMetricGroups();
      this.eventAlertAnalyticsLeftMetrics = fallbackMetricGroups.left;
      this.eventAlertAnalyticsRightMetrics = fallbackMetricGroups.right;
      this.notification.error(new Notification('Failed to get event and alert analytics data. Try again later.'));
    });
  }

  private applyEventAlertAnalyticsView() {
    const response = this.eventAlertAnalyticsResponse;
    if (!response) {
      this.eventReductionFlowOptions = null;
      this.incidentResolutionFlowOptions = null;
      return;
    }
    const selectedView = this.filterForm?.get('analyticsViewBy')?.value || response.viewBy || 'source';
    const leftGraph = selectedView === 'severity' ? response.severityGraph : response.sourceGraph;
    this.eventReductionFlowOptions = leftGraph
      ? this.svc.convertToEventAlertAnalyticsLeftGraphOptions(leftGraph)
      : this.svc.convertToEventReductionSankeyOptions(this.svc.buildEventAlertAnalyticsReductionFlow(response, selectedView));
    this.incidentResolutionFlowOptions = response.rightGraph
      ? this.svc.convertToEventAlertAnalyticsRightGraphOptions(response.rightGraph)
      : this.svc.convertToEventResolutionSankeyOptions(this.svc.buildEventAlertAnalyticsResolutionFlow(response));
  }

  getNoisyEvents(criteria: DashboardFilterCriteria) {
    this.noisyEvents = [];
    this.loadWidget(this.loaderNames.noisyEvents, this.svc.getNoisyEvents(criteria, this.noisyEventsSortState.sortColumn, this.noisyEventsSortState.sortDirection), res => {
      this.noisyEvents = this.svc.convertToNoisyEventTableData(res.rows);
      this.noisyEventsCategoryOptions = this.svc.getCategoryOptions(res.categoryOptions);
      this.ensureSelectSelection('noisyEventsCategory', this.noisyEventsCategoryOptions, this.svc.getActiveCategory(res.activeCategory, criteria.noisyEventsCategory));
    }, () => {
      this.notification.error(new Notification('Failed to get noisy events data. Try again later.'));
    });
  }

  getNoisyHosts(criteria: DashboardFilterCriteria) {
    this.noisyHosts = [];
    this.noisyHostsOptions = null;
    this.loadWidget(this.loaderNames.noisyHosts, this.svc.getNoisyHosts(criteria, this.noisyHostsSortState.sortColumn, this.noisyHostsSortState.sortDirection), res => {
      this.noisyHosts = this.svc.convertToNoisyHostsTableData(res.rows);
      this.noisyHostsOptions = this.svc.convertToNoisyHostsChart(res.chart);
      this.noisyHostsCategoryOptions = this.svc.getCategoryOptions(res.categoryOptions);
      this.ensureSelectSelection('noisyHostsCategory', this.noisyHostsCategoryOptions, this.svc.getActiveCategory(res.activeCategory, criteria.noisyHostsCategory));
    }, () => {
      this.notification.error(new Notification('Failed to get noisy hosts data. Try again later.'));
    });
  }

  getIncidentManagement(criteria: DashboardFilterCriteria) {
    this.getIncidentAlertByDeviceType(criteria);
    this.getOpenIncidentTickets(criteria);
    this.getResolvedIncidentTickets(criteria);
  }

  getIncidentAlertByDeviceType(criteria: DashboardFilterCriteria) {
    this.incidentAlertRows = [];
    this.loadWidget(this.loaderNames.incidentAlertByDeviceType, this.svc.getIncidentAlertByDeviceType(criteria, this.incidentAlertSortState.sortColumn, this.incidentAlertSortState.sortDirection), res => {
      this.incidentAlertRows = this.svc.convertToIncidentAlertRows(res.rows);
      this.incidentCategoryOptions = this.svc.getCategoryOptions(res.categoryOptions);
      this.ensureSelectSelection('incidentCategory', this.incidentCategoryOptions, this.svc.getActiveCategory(res.activeCategory, criteria.incidentCategory));
    }, () => {
      this.notification.error(new Notification('Failed to get incident alert by device type data. Try again later.'));
    });
  }

  getOpenIncidentTickets(criteria: DashboardFilterCriteria) {
    this.openIncidentTickets = [];
    this.loadWidget(this.loaderNames.openIncidentTickets, this.svc.getOpenIncidentTickets(criteria, this.openIncidentSortState.sortColumn, this.openIncidentSortState.sortDirection), res => {
      this.openIncidentTickets = this.svc.convertToIncidentTicketRows(res.rows);
    }, () => {
      this.notification.error(new Notification('Failed to get open incident ticket data. Try again later.'));
    });
  }

  getResolvedIncidentTickets(criteria: DashboardFilterCriteria) {
    this.resolvedIncidentTickets = [];
    this.loadWidget(this.loaderNames.resolvedIncidentTickets, this.svc.getResolvedIncidentTickets(criteria, this.resolvedIncidentSortState.sortColumn, this.resolvedIncidentSortState.sortDirection), res => {
      this.resolvedIncidentTickets = this.svc.convertToIncidentTicketRows(res.rows);
    }, () => {
      this.notification.error(new Notification('Failed to get resolved incident ticket data. Try again later.'));
    });
  }

  onNoisyEventsSorted(event: ColumnSortedEvent) {
    if (!this.noisyEvents?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as NoisyTableSortColumn;
    this.noisyEventsSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.getNoisyEvents(this.getFilterCriteria());
  }

  onNoisyHostsSorted(event: ColumnSortedEvent) {
    if (!this.noisyHosts?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as NoisyTableSortColumn;
    this.noisyHostsSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.getNoisyHosts(this.getFilterCriteria());
  }

  getNoisyEventsSortDirection(sortColumn: NoisyTableSortColumn): string {
    if (this.noisyEventsSortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.noisyEventsSortState.sortDirection;
  }

  getNoisyHostsSortDirection(sortColumn: NoisyTableSortColumn): string {
    if (this.noisyHostsSortState.sortColumn !== sortColumn) {
      return '';
    }
    return this.noisyHostsSortState.sortDirection;
  }

  onIncidentAlertSorted(event: ColumnSortedEvent) {
    if (!this.incidentAlertRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }
    this.incidentAlertSortState = {
      sortColumn: event.sortColumn as IncidentAlertTableSortColumn,
      sortDirection: event.sortDirection
    };
    this.getIncidentAlertByDeviceType(this.getFilterCriteria());
  }

  onOpenIncidentSorted(event: ColumnSortedEvent) {
    if (!this.openIncidentTickets?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }
    this.openIncidentSortState = {
      sortColumn: event.sortColumn as IncidentTicketTableSortColumn,
      sortDirection: event.sortDirection
    };
    this.getOpenIncidentTickets(this.getFilterCriteria());
  }

  onResolvedIncidentSorted(event: ColumnSortedEvent) {
    if (!this.resolvedIncidentTickets?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }
    this.resolvedIncidentSortState = {
      sortColumn: event.sortColumn as IncidentTicketTableSortColumn,
      sortDirection: event.sortDirection
    };
    this.getResolvedIncidentTickets(this.getFilterCriteria());
  }

  getIncidentAlertSortDirection(sortColumn: IncidentAlertTableSortColumn): string {
    return this.incidentAlertSortState.sortColumn === sortColumn ? this.incidentAlertSortState.sortDirection : '';
  }

  getOpenIncidentSortDirection(sortColumn: IncidentTicketTableSortColumn): string {
    return this.openIncidentSortState.sortColumn === sortColumn ? this.openIncidentSortState.sortDirection : '';
  }

  getResolvedIncidentSortDirection(sortColumn: IncidentTicketTableSortColumn): string {
    return this.resolvedIncidentSortState.sortColumn === sortColumn ? this.resolvedIncidentSortState.sortDirection : '';
  }

  getItsmTicketView(criteria: DashboardFilterCriteria) {
    this.itsmTicketRows = [];
    this.itsmTicketTotal = 0;
    this.itsmTicketsByPriorityOptions = null;
    this.itsmTicketsByStatusOptions = null;
    this.itsmSolvedByResponseTimeOptions = null;
    this.loadWidget(this.loaderNames.itsmTicketView, this.svc.getItsmTicketView(criteria), (res: ItsmTicketViewApiResponse) => {
      this.itsmTicketTabOptions = this.svc.convertToItsmTicketTabOptions(res.tabOptions);
      this.itsmTicketStateOptions = this.svc.convertToItsmTicketFilterOptions(res.filterOptions?.state);
      this.itsmTicketPriorityOptions = this.svc.convertToItsmTicketFilterOptions(res.filterOptions?.priority);
      this.itsmTicketTypeOptions = this.svc.convertToItsmTicketFilterOptions(res.filterOptions?.type);
      this.itsmTicketsByPriorityOptions = this.svc.convertToItsmPriorityChart(res.ticketsByPriority);
      this.itsmTicketsByStatusOptions = this.svc.convertToItsmStatusChart(res.ticketsByStatus);
      this.itsmSolvedByResponseTimeOptions = this.svc.convertToItsmResponseTimeChart(res.solvedByResponseTime?.buckets);
      this.itsmTicketRows = this.svc.convertToItsmTicketRows(res.tickets);
      this.itsmTicketTotal = res.total || 0;
      this.filterForm.patchValue(this.svc.buildItsmTicketFilterPatch(res), { emitEvent: false });
    }, () => {
      this.notification.error(new Notification('Failed to get ITSM ticket view data. Try again later.'));
    });
  }

  getStatusClass(tone?: EventAnalyticsTone): string {
    return this.svc.getStatusClass(tone);
  }

  trackByKey(index: number, item: any): string | number {
    return item?.key || item?.value || item?.uuid || item?.ticketId || item?.device || index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  openEventsPage() {
    this.openRouteInNewTab('/services/aiml-event-mgmt/events');
  }

  openCondition(ticket: IncidentTicketViewData) {
    if (!ticket?.uuid) {
      this.openRouteInNewTab('/services/aiml-event-mgmt/conditions');
      return;
    }
    this.openRouteInNewTab(`/services/aiml-event-mgmt/conditions/${ticket.uuid}`);
  }

  private applyDashboardFilters(filters: DashboardFilters) {
    this.timeRangeOptions = filters?.timeRange || [];
    this.trendTimelineOptions = filters?.trendTimeline || this.timeRangeOptions;
    this.timeRangeDropdownOptions = this.getDateDropdownOptions(this.timeRangeOptions);
    this.trendTimelineDropdownOptions = this.getDateDropdownOptions(this.trendTimelineOptions);
    this.eventDeviceCategoryOptions = this.svc.getCategoryOptions();
    this.alertSegregationCategoryOptions = this.svc.getCategoryOptions();
    this.analyticsViewByOptions = filters?.analyticsViewBy || [];
    this.analyticsSourceTypeOptions = filters?.analyticsSourceType || [];
    this.analyticsSeverityTypeOptions = filters?.analyticsSeverityType || [];
    this.analyticsDatacenterOptions = filters?.analyticsDatacenter || [];
    this.analyticsCloudOptions = filters?.analyticsCloud || [];
    this.analyticsCategoryOptions = this.svc.getCategoryOptions();
    this.eventAndAlertTimelineOptions = filters?.eventAndAlertTimeline || [];
    this.eventAndAlertTimelineDropdownOptions = this.getDateDropdownOptions(this.eventAndAlertTimelineOptions);
    this.noisyEventsCategoryOptions = this.svc.getCategoryOptions();
    this.noisyHostsCategoryOptions = this.svc.getCategoryOptions();
    this.incidentCategoryOptions = this.svc.getCategoryOptions();
    this.itsmTicketTabOptions = [];
    this.itsmTicketStateOptions = [];
    this.itsmTicketPriorityOptions = [];
    this.itsmTicketTypeOptions = [];
  }

  private getFilterCriteria(): DashboardFilterCriteria {
    return this.filterForm?.getRawValue();
  }

  private ensureFilterSelections() {
    this.ensureSelectSelection('timeline', this.timeRangeOptions, 'last_month');
    this.ensureSelectSelection('trendTimeline', this.trendTimelineOptions, 'last_month');
    this.ensureSelectSelection('eventDeviceCategory', this.eventDeviceCategoryOptions, 'all');
    this.ensureSelectSelection('alertSegregationCategory', this.alertSegregationCategoryOptions, 'all');
    this.ensureSelectSelection('analyticsViewBy', this.analyticsViewByOptions, 'source');
    this.ensureSelectSelection('analyticsSourceType', this.analyticsSourceTypeOptions, 'all_source');
    this.ensureSelectSelection('analyticsSeverityType', this.analyticsSeverityTypeOptions, 'all_severity');
    this.ensureSelectSelection('analyticsDatacenter', this.analyticsDatacenterOptions, 'all_datacenter');
    this.ensureSelectSelection('analyticsCloud', this.analyticsCloudOptions, 'all_cloud');
    this.ensureSelectSelection('analyticsCategory', this.analyticsCategoryOptions, 'all');
    this.ensureSelectSelection('eventAndAlertTimeline', this.eventAndAlertTimelineOptions, 'last_week');
    this.ensureSelectSelection('noisyEventsCategory', this.noisyEventsCategoryOptions, 'all');
    this.ensureSelectSelection('noisyHostsCategory', this.noisyHostsCategoryOptions, 'all');
    this.ensureSelectSelection('incidentCategory', this.incidentCategoryOptions, 'all');
  }

  private ensureSelectSelection(controlName: string, options: SelectOption[], preferredValue?: string) {
    const control = this.filterForm?.get(controlName);
    if (!control || !options?.length) {
      return;
    }
    const allowsCustomValue = ['timeline', 'trendTimeline', 'eventAndAlertTimeline'].indexOf(controlName) > -1;
    if (allowsCustomValue && control.value === this.customTimelineValue) {
      return;
    }
    const preferredOption = options.find(option => option.value === preferredValue);
    if (preferredOption) {
      control.setValue(preferredOption.value, { emitEvent: false });
      return;
    }
    if (options.some(option => option.value === control.value)) {
      return;
    }
    control.setValue(options[0].value, { emitEvent: false });
  }


  isCustomTimelineSelected(): boolean {
    return this.filterForm?.get('timeline')?.value === this.customTimelineValue;
  }

  isTrendCustomTimelineSelected(): boolean {
    return this.filterForm?.get('trendTimeline')?.value === this.customTimelineValue;
  }

  private syncCustomTimelineControls() {
    const fromControl = this.filterForm?.get('timelineFrom');
    const toControl = this.filterForm?.get('timelineTo');
    if (!fromControl || !toControl) {
      return;
    }
    if (this.isCustomTimelineSelected()) {
      fromControl.enable({ emitEvent: false });
      toControl.enable({ emitEvent: false });
    } else {
      fromControl.disable({ emitEvent: false });
      toControl.disable({ emitEvent: false });
    }
    this.filterForm.updateValueAndValidity({ emitEvent: false });
  }

  private syncTrendCustomTimelineControls() {
    const fromControl = this.filterForm?.get('trendTimelineFrom');
    const toControl = this.filterForm?.get('trendTimelineTo');
    if (!fromControl || !toControl) {
      return;
    }
    if (this.isTrendCustomTimelineSelected()) {
      fromControl.enable({ emitEvent: false });
      toControl.enable({ emitEvent: false });
    } else {
      fromControl.disable({ emitEvent: false });
      toControl.disable({ emitEvent: false });
    }
    this.filterForm.updateValueAndValidity({ emitEvent: false });
  }

  private syncEventAndAlertTimelineControls() {
    const fromControl = this.filterForm?.get('eventAndAlertTimelineFrom');
    const toControl = this.filterForm?.get('eventAndAlertTimelineTo');
    if (!fromControl || !toControl) {
      return;
    }
    if (this.isEventAndAlertTimelineCustomSelected()) {
      fromControl.enable({ emitEvent: false });
      toControl.enable({ emitEvent: false });
    } else {
      fromControl.disable({ emitEvent: false });
      toControl.disable({ emitEvent: false });
    }
    this.filterForm.updateValueAndValidity({ emitEvent: false });
  }

  private isTimelineReady(): boolean {
    if (!this.isCustomTimelineSelected()) {
      return true;
    }
    const from = this.filterForm?.get('timelineFrom')?.value;
    const to = this.filterForm?.get('timelineTo')?.value;
    return !this.filterForm?.errors?.timelineFromSameAsOrAfterTo &&
      !!from &&
      !!to &&
      !isNaN(new Date(from).getTime()) &&
      !isNaN(new Date(to).getTime());
  }

  private isTrendTimelineReady(): boolean {
    if (!this.isTrendCustomTimelineSelected()) {
      return true;
    }
    const from = this.filterForm?.get('trendTimelineFrom')?.value;
    const to = this.filterForm?.get('trendTimelineTo')?.value;
    return !this.filterForm?.errors?.trendTimelineFromSameAsOrAfterTo &&
      !!from &&
      !!to &&
      !isNaN(new Date(from).getTime()) &&
      !isNaN(new Date(to).getTime());
  }

  private isEventAndAlertTimelineReady(): boolean {
    if (!this.isEventAndAlertTimelineCustomSelected()) {
      return true;
    }
    const from = this.filterForm?.get('eventAndAlertTimelineFrom')?.value;
    const to = this.filterForm?.get('eventAndAlertTimelineTo')?.value;
    return !this.filterForm?.errors?.eventAndAlertTimelineFromSameAsOrAfterTo &&
      !!from &&
      !!to &&
      !isNaN(new Date(from).getTime()) &&
      !isNaN(new Date(to).getTime());
  }

  private isEventAndAlertTimelineCustomSelected(): boolean {
    return this.filterForm?.get('eventAndAlertTimeline')?.value === this.customTimelineValue;
  }

  private patchTimelineRange(periodControlName: string, fromControlName: string, toControlName: string, event: { period?: string; from?: Date | string; to?: Date | string }) {
    if (!this.filterForm) {
      return;
    }
    this.filterForm.patchValue({
      [periodControlName]: event?.period || '',
      [fromControlName]: event?.from || null,
      [toControlName]: event?.to || null
    }, { emitEvent: false });
  }

  private getDateDropdownOptions(options: SelectOption[]): DateRangeOption[] {
    return (options || [])
      .filter(option => option?.value !== this.customTimelineValue)
      .map(option => ({ label: option.label, value: option.value }));
  }

  get timelineDropdownDefault(): string | DateRangeOption {
    return this.getDateDropdownDefault('timeline', 'timelineFrom', 'timelineTo');
  }

  get trendTimelineDropdownDefault(): string | DateRangeOption {
    return this.getDateDropdownDefault('trendTimeline', 'trendTimelineFrom', 'trendTimelineTo');
  }

  get eventAndAlertTimelineDropdownDefault(): string | DateRangeOption {
    return this.getDateDropdownDefault('eventAndAlertTimeline', 'eventAndAlertTimelineFrom', 'eventAndAlertTimelineTo');
  }

  private getDateDropdownDefault(periodControlName: string, fromControlName: string, toControlName: string): string | DateRangeOption {
    const period = this.filterForm?.get(periodControlName)?.value;
    if (period !== this.customTimelineValue) {
      return period;
    }
    return {
      value: this.customTimelineValue,
      label: 'Custom',
      from: this.filterForm?.get(fromControlName)?.value,
      to: this.filterForm?.get(toControlName)?.value
    };
  }

  private openRouteInNewTab(url: string) {
    const externalUrl = this.location.prepareExternalUrl(url);
    window.open(externalUrl, '_blank', 'noopener');
  }

  private loadWidget<T>(loaderName: string, request: Observable<T>, onSuccess: (res: T) => void, onError: () => void) {
    this.spinnerService.start(loaderName);
    request.pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.spinnerService.stop(loaderName))
    ).subscribe(res => {
      onSuccess(res);
    }, () => {
      onError();
    });
  }
}
