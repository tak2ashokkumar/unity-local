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
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import {
  EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE,
  EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS
} from './event-analytics-dashboard.const';
import { EventAnalyticsDashboardService } from './event-analytics-dashboard.service';
import {
  DashboardFilterCriteria,
  DashboardFilters,
  DashboardHeader,
  EventAnalyticsTicketTab,
  EventAnalyticsTone,
  IncidentAlertByDeviceViewData,
  IncidentTicketViewData,
  MetricViewData,
  NoisyEventRowViewData,
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
  timelineMaxDate: Date = new Date();
  analyticsViewByOptions: SelectOption[] = [];
  analyticsSourceTypeOptions: SelectOption[] = [];
  analyticsSeverityTypeOptions: SelectOption[] = [];
  analyticsDatacenterOptions: SelectOption[] = [];
  analyticsCloudOptions: SelectOption[] = [];
  analyticsDurationOptions: SelectOption[] = [];

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

  eventAlertAnalyticsMetrics: MetricViewData[] = [];
  eventReductionFlowOptions: EChartsOption;
  incidentResolutionFlowOptions: EChartsOption;

  noisyEvents: NoisyEventRowViewData[] = [];
  noisyHosts: NoisyEventRowViewData[] = [];
  noisyHostsOptions: EChartsOption;

  incidentAlertRows: IncidentAlertByDeviceViewData[] = [];
  openIncidentTickets: IncidentTicketViewData[] = [];
  resolvedIncidentTickets: IncidentTicketViewData[] = [];

  ticketManagementAccounts: TicketMgmtList[] = [];
  selectedTicketManagementAccount: TicketMgmtList;
  ticketManagementTabs: EventAnalyticsTicketTab[] = [];
  selectedTicketManagementTab: EventAnalyticsTicketTab;
  ticketManagementCriteria: SearchCriteria;
  ticketManagementLoaded: boolean = false;

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
    incidentManagement: 'eventAnalyticsIncidentManagementLoader',
    ticketManagement: 'eventAnalyticsTicketManagementLoader'
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
    this.getHeaderData();
    this.getDashboardFilters();
    this.getTicketManagementAccounts();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.loadData();
  }

  onTimelineChange() {
    this.syncCustomTimelineControls();
    if (this.isTimelineReady()) {
      this.loadData();
    }
  }

  onCustomTimelineChange() {
    if (!this.isCustomTimelineSelected()) {
      return;
    }
    this.timelineMaxDate = new Date();
    this.filterForm.updateValueAndValidity({ emitEvent: false });
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

  onTrendTimelineChange() {
    this.syncTrendCustomTimelineControls();
    if (this.isTrendTimelineReady()) {
      this.getTrendByTimeline(this.getFilterCriteria());
    }
  }

  onTrendCustomTimelineChange() {
    if (!this.isTrendCustomTimelineSelected()) {
      return;
    }
    this.timelineMaxDate = new Date();
    this.filterForm.updateValueAndValidity({ emitEvent: false });
    if (this.isTrendTimelineReady()) {
      this.getTrendByTimeline(this.getFilterCriteria());
    }
  }

  onAlertSegregationCategoryChange(category: string) {
    this.filterForm.get('alertSegregationCategory').setValue(category);
    this.getAlertSegregation(this.getFilterCriteria());
  }

  onAnalyticsFilterChange() {
    this.getEventAlertAnalytics(this.getFilterCriteria());
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

  getHeaderData() {
    this.svc.getHeaderTextData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.headerData = res;
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get event analytics headers. Try again later.'));
    });
  }

  getDashboardFilters() {
    this.svc.getDashboardFilters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.applyDashboardFilters(res);
      this.buildFilterForm(res);
      this.ensureFilterSelections();
      this.syncCustomTimelineControls();
      this.syncTrendCustomTimelineControls();
      this.loadData();
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get event analytics filters. Try again later.'));
      const filters = this.svc.getDefaultDashboardFilters();
      this.applyDashboardFilters(filters);
      this.buildFilterForm(filters);
      this.ensureFilterSelections();
      this.syncCustomTimelineControls();
      this.syncTrendCustomTimelineControls();
      this.loadData();
    });
  }

  getTicketManagementAccounts() {
    this.ticketManagementLoaded = false;
    this.ticketManagementAccounts = [];
    this.selectedTicketManagementAccount = null;
    this.ticketManagementTabs = [];
    this.selectedTicketManagementTab = null;
    this.ticketManagementCriteria = null;
    this.spinnerService.start(this.loaderNames.ticketManagement);
    this.svc.getTicketManagementAccounts().pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.spinnerService.stop(this.loaderNames.ticketManagement))
    ).subscribe(res => {
      this.ticketManagementAccounts = res || [];
      const defaultAccount = this.ticketManagementAccounts.find(account => account.default) || this.ticketManagementAccounts[0];
      this.setTicketManagementAccount(defaultAccount);
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get ticket management accounts. Try again later.'));
      this.ticketManagementLoaded = true;
    });
  }

  onTicketManagementAccountChange(accountUuid: string) {
    const account = this.ticketManagementAccounts.find(item => item.uuid === accountUuid);
    this.setTicketManagementAccount(account);
  }

  selectTicketManagementTab(tab: EventAnalyticsTicketTab) {
    if (!tab) {
      this.selectedTicketManagementTab = null;
      this.ticketManagementCriteria = null;
      return;
    }
    this.selectedTicketManagementTab = tab;
    this.ticketManagementCriteria = null;
    const criteria = this.buildTicketManagementCriteria(tab);
    setTimeout(() => {
      this.ticketManagementCriteria = criteria;
    }, 0);
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
  }

  getExecutiveSummary(criteria: DashboardFilterCriteria) {
    this.summaryMetrics = [];
    this.loadWidget(this.loaderNames.summaryMetrics, this.svc.getSummary(criteria), res => {
      this.summaryMetrics = this.svc.convertToSummaryMetrics(res);
    }, () => {
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
      this.eventByDeviceCategoryOptions = this.svc.convertToDeviceCategoryChart(res.donut);
      this.eventDeviceCategoryOptions = res.category_options?.length ? res.category_options : this.eventDeviceCategoryOptions;
      this.ensureSelectSelection('eventDeviceCategory', this.eventDeviceCategoryOptions, res.active_category || criteria.eventDeviceCategory);
    }, () => {
      this.notification.error(new Notification('Failed to get event by device category data. Try again later.'));
    });
  }

  getAlertGenerated(criteria: DashboardFilterCriteria) {
    this.alertGeneratedMetrics = [];
    this.alertGeneratedOptions = null;
    this.loadWidget(this.loaderNames.alertGenerated, this.svc.getAlertsGenerated(criteria), res => {
      this.alertGeneratedMetrics = this.svc.convertToMetricKpis(res.kpis);
      this.alertGeneratedOptions = this.svc.convertToDonutChart(res.donut, ['52%', '72%']);
    }, () => {
      this.notification.error(new Notification('Failed to get alert generated data. Try again later.'));
    });
  }

  getAlertStatus(criteria: DashboardFilterCriteria) {
    this.alertStatusMetrics = [];
    this.alertStatusOptions = null;
    this.loadWidget(this.loaderNames.alertStatus, this.svc.getAlertStatus(criteria), res => {
      this.alertStatusMetrics = this.svc.convertToMetricKpis(res.kpis);
      this.alertStatusOptions = this.svc.convertToDonutChart(res.donut, ['50%', '72%']);
    }, () => {
      this.notification.error(new Notification('Failed to get alert status data. Try again later.'));
    });
  }

  getTrendByTimeline(criteria: DashboardFilterCriteria) {
    if (!this.isTrendTimelineReady()) {
      return;
    }
    this.trendByTimelineOptions = null;
    this.loadWidget(this.loaderNames.trendByTimeline, this.svc.getTrendByTimeline(criteria), res => {
      this.trendByTimelineOptions = this.svc.convertToTrendChartData(res);
    }, () => {
      this.notification.error(new Notification('Failed to get trend by timeline data. Try again later.'));
    });
  }

  getAlertSegregation(criteria: DashboardFilterCriteria) {
    this.alertSegregationMetrics = [];
    this.alertSegregationOptions = null;
    this.loadWidget(this.loaderNames.alertSegregation, this.svc.getAlertSegregation(criteria), res => {
      this.alertSegregationMetrics = this.svc.convertToAlertSegregationSummary(res);
      this.alertSegregationOptions = this.svc.convertToAlertSegregationChart(res.rows);
      this.alertSegregationCategoryOptions = res.category_options?.length ? res.category_options : this.alertSegregationCategoryOptions;
      this.ensureSelectSelection('alertSegregationCategory', this.alertSegregationCategoryOptions, res.active_category || criteria.alertSegregationCategory);
    }, () => {
      this.notification.error(new Notification('Failed to get alert segregation data. Try again later.'));
    });
  }

  getEventAlertAnalytics(criteria: DashboardFilterCriteria) {
    this.eventAlertAnalyticsMetrics = [];
    this.eventReductionFlowOptions = null;
    this.incidentResolutionFlowOptions = null;
    this.loadWidget(this.loaderNames.eventAlertAnalytics, this.svc.getEventAlertAnalytics(criteria), res => {
      this.eventAlertAnalyticsMetrics = this.svc.convertToEventAlertAnalyticsMetrics(res);
      this.eventReductionFlowOptions = this.svc.convertToSankeyOptions(res.reductionFlow, 4);
      this.incidentResolutionFlowOptions = this.svc.convertToSankeyOptions(res.resolutionFlow, 8);
    }, () => {
      this.notification.error(new Notification('Failed to get event and alert analytics data. Try again later.'));
    });
  }

  getNoisyEvents(criteria: DashboardFilterCriteria) {
    this.noisyEvents = [];
    this.loadWidget(this.loaderNames.noisyEvents, this.svc.getNoisyEvents(criteria), res => {
      this.noisyEvents = this.svc.convertToNoisyEventTableData(res.rows);
      this.noisyEventsCategoryOptions = res.category_options?.length ? res.category_options : this.noisyEventsCategoryOptions;
      this.ensureSelectSelection('noisyEventsCategory', this.noisyEventsCategoryOptions, res.active_category || criteria.noisyEventsCategory);
    }, () => {
      this.notification.error(new Notification('Failed to get noisy events data. Try again later.'));
    });
  }

  getNoisyHosts(criteria: DashboardFilterCriteria) {
    this.noisyHosts = [];
    this.noisyHostsOptions = null;
    this.loadWidget(this.loaderNames.noisyHosts, this.svc.getNoisyHosts(criteria), res => {
      this.noisyHosts = this.svc.convertToNoisyEventTableData(res.rows);
      this.noisyHostsOptions = this.svc.convertToNoisyHostsChart(res.chart);
      this.noisyHostsCategoryOptions = res.category_options?.length ? res.category_options : this.noisyHostsCategoryOptions;
      this.ensureSelectSelection('noisyHostsCategory', this.noisyHostsCategoryOptions, res.active_category || criteria.noisyHostsCategory);
    }, () => {
      this.notification.error(new Notification('Failed to get noisy hosts data. Try again later.'));
    });
  }

  getIncidentManagement(criteria: DashboardFilterCriteria) {
    this.incidentAlertRows = [];
    this.openIncidentTickets = [];
    this.resolvedIncidentTickets = [];
    this.loadWidget(this.loaderNames.incidentManagement, this.svc.getIncidentManagement(criteria), res => {
      this.incidentAlertRows = this.svc.convertToIncidentAlertRows(res.alert_generated_by_device_type);
      this.openIncidentTickets = this.svc.convertToIncidentTicketRows(res.open_incident_tickets);
      this.resolvedIncidentTickets = this.svc.convertToIncidentTicketRows(res.resolved_incident_tickets);
      this.incidentCategoryOptions = res.category_options?.length ? res.category_options : this.incidentCategoryOptions;
      this.ensureSelectSelection('incidentCategory', this.incidentCategoryOptions, res.active_category || criteria.incidentCategory);
    }, () => {
      this.notification.error(new Notification('Failed to get incident management data. Try again later.'));
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

  openTicketManagementDetails() {
    if (this.selectedTicketManagementTab?.drillDownLink) {
      this.openRouteInNewTab(this.selectedTicketManagementTab.drillDownLink);
      return;
    }
    if (this.selectedTicketManagementAccount?.uuid) {
      this.openRouteInNewTab(`/support/ticketmgmt/${this.selectedTicketManagementAccount.uuid}`);
    }
  }

  private setTicketManagementAccount(account: TicketMgmtList) {
    this.selectedTicketManagementAccount = account;
    this.ticketManagementTabs = [];
    this.selectedTicketManagementTab = null;
    this.ticketManagementCriteria = null;
    this.ticketManagementLoaded = false;
    if (!account) {
      this.ticketManagementLoaded = true;
      return;
    }
    if (account.type === 'Jira') {
      this.spinnerService.start(this.loaderNames.ticketManagement);
      this.svc.getJiraProjects(account.uuid).pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.spinnerService.stop(this.loaderNames.ticketManagement))
      ).subscribe(projects => {
        this.ticketManagementTabs = this.svc.getTicketManagementTabs(account, projects);
        this.selectTicketManagementTab(this.ticketManagementTabs[0]);
        this.ticketManagementLoaded = true;
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get JIRA projects. Try again later.'));
        this.ticketManagementLoaded = true;
      });
      return;
    }
    this.ticketManagementTabs = this.svc.getTicketManagementTabs(account);
    this.selectTicketManagementTab(this.ticketManagementTabs[0]);
    this.ticketManagementLoaded = true;
  }

  private buildTicketManagementCriteria(tab: EventAnalyticsTicketTab): SearchCriteria {
    const params: { [key: string]: any } = {
      instanceId: this.selectedTicketManagementAccount?.uuid
    };
    if (this.selectedTicketManagementAccount?.type === 'Jira') {
      params.project_id = tab?.projectId;
      params.serviceDeskId = tab?.serviceDeskId;
    } else {
      params.ticket_type = tab?.ticketType == null ? null : tab.ticketType;
    }
    return {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [params] as [{ [key: string]: any }]
    };
  }

  private applyDashboardFilters(filters: DashboardFilters) {
    this.timeRangeOptions = filters?.timeRange || [];
    this.trendTimelineOptions = filters?.trendTimeline || this.timeRangeOptions;
    this.eventDeviceCategoryOptions = filters?.eventDeviceCategory || filters?.category || [];
    this.alertSegregationCategoryOptions = filters?.alertSegregationCategory || filters?.category || [];
    this.analyticsViewByOptions = filters?.analyticsViewBy || [];
    this.analyticsSourceTypeOptions = filters?.analyticsSourceType || [];
    this.analyticsSeverityTypeOptions = filters?.analyticsSeverityType || [];
    this.analyticsDatacenterOptions = filters?.analyticsDatacenter || [];
    this.analyticsCloudOptions = filters?.analyticsCloud || [];
    this.analyticsCategoryOptions = filters?.analyticsCategory || filters?.category || [];
    this.analyticsDurationOptions = filters?.analyticsDuration || [];
    this.noisyEventsCategoryOptions = filters?.noisyEventsCategory || filters?.category || [];
    this.noisyHostsCategoryOptions = filters?.noisyHostsCategory || filters?.category || [];
    this.incidentCategoryOptions = filters?.incidentCategory || filters?.category || [];
  }

  private getFilterCriteria(): DashboardFilterCriteria {
    return this.filterForm?.getRawValue();
  }

  private ensureFilterSelections() {
    this.ensureSelectSelection('timeline', this.timeRangeOptions, 'last_month');
    this.ensureSelectSelection('trendTimeline', this.trendTimelineOptions, 'last_month');
    this.ensureSelectSelection('eventDeviceCategory', this.eventDeviceCategoryOptions, 'application');
    this.ensureSelectSelection('alertSegregationCategory', this.alertSegregationCategoryOptions, 'application');
    this.ensureSelectSelection('analyticsViewBy', this.analyticsViewByOptions, 'source');
    this.ensureSelectSelection('analyticsSourceType', this.analyticsSourceTypeOptions, 'all_source');
    this.ensureSelectSelection('analyticsSeverityType', this.analyticsSeverityTypeOptions, 'all_severity');
    this.ensureSelectSelection('analyticsDatacenter', this.analyticsDatacenterOptions, 'all_datacenter');
    this.ensureSelectSelection('analyticsCloud', this.analyticsCloudOptions, 'all_cloud');
    this.ensureSelectSelection('analyticsCategory', this.analyticsCategoryOptions, 'application');
    this.ensureSelectSelection('analyticsDuration', this.analyticsDurationOptions, 'last_7_days');
    this.ensureSelectSelection('noisyEventsCategory', this.noisyEventsCategoryOptions, 'application');
    this.ensureSelectSelection('noisyHostsCategory', this.noisyHostsCategoryOptions, 'application');
    this.ensureSelectSelection('incidentCategory', this.incidentCategoryOptions, 'application');
  }

  private ensureSelectSelection(controlName: string, options: SelectOption[], preferredValue?: string) {
    const control = this.filterForm?.get(controlName);
    if (!control || !options?.length) {
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
    this.timelineMaxDate = new Date();
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
    this.timelineMaxDate = new Date();
    if (this.isTrendCustomTimelineSelected()) {
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
