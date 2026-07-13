import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JiraInstanceProject, JiraInstanceProjects } from 'src/app/shared/SharedEntityTypes/jira.type';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { GET_TICKET_MGMT_LIST } from 'src/app/shared/api-endpoint.const';
import {
  DASHBOARD_FILTERS_DUMMY,
  EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE,
  EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY,
  EVENT_ANALYTICS_DONUT_COLORS,
  EVENT_ANALYTICS_ALERT_BY_DEVICE_TYPE_ENDPOINT,
  EVENT_ANALYTICS_ALERT_GENERATED_ENDPOINT,
  EVENT_ANALYTICS_ALERT_STATUS_ENDPOINT,
  EVENT_ANALYTICS_DASHBOARD_FILTERS_ENDPOINT,
  EVENT_ANALYTICS_EVENT_ALERT_ANALYTICS_ENDPOINT,
  EVENT_ANALYTICS_EVENT_BY_DEVICE_CATEGORY_ENDPOINT,
  EVENT_ANALYTICS_JIRA_PROJECTS_ENDPOINT,
  EVENT_ANALYTICS_MS_DYNAMICS_TICKET_TABS,
  EVENT_ANALYTICS_NOISY_EVENTS_ENDPOINT,
  EVENT_ANALYTICS_NOISY_HOSTS_ENDPOINT,
  EVENT_ANALYTICS_OPEN_INCIDENTS_ENDPOINT,
  EVENT_ANALYTICS_PIPELINE_ENDPOINT,
  EVENT_ANALYTICS_RESOLVED_INCIDENTS_ENDPOINT,
  EVENT_ANALYTICS_SERVICE_NOW_TICKET_TABS,
  EVENT_ANALYTICS_STATUS_COLORS,
  EVENT_ANALYTICS_SUMMARY_ENDPOINT,
  EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  EVENT_ANALYTICS_TOP_HEADER_ENDPOINT,
  EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS,
  EVENT_ANALYTICS_TREND_BY_TIMELINE_ENDPOINT,
  EVENT_ANALYTICS_ZENDESK_TICKET_TABS
} from './event-analytics-dashboard.const';
import {
  AlertGeneratedResponse,
  AlertMetricResponse,
  AlertSegregationResponse,
  AlertSegregationRow,
  AlertStatusResponse,
  DashboardFilterCriteria,
  DashboardFilters,
  DashboardHeader,
  DeviceCategoryItem,
  DonutSegmentResponse,
  EventAlertAnalyticsResponse,
  EventAnalyticsTicketTab,
  EventAnalyticsTone,
  EventByDeviceCategoryResponse,
  ExecutiveSummaryResponse,
  IncidentAlertByDeviceRow,
  IncidentAlertByDeviceViewData,
  IncidentManagementResponse,
  IncidentTicketRow,
  IncidentTicketViewData,
  MetricViewData,
  NoisyEventRowResponse,
  NoisyEventRowViewData,
  NoisyEventsResponse,
  NoisyHostChartRow,
  NoisyHostsResponse,
  PipelineResponse,
  PipelineViewData,
  SankeyData,
  SelectOption,
  TrendByTimelineResponse,
  TrendTimelinePoint
} from './event-analytics-dashboard.type';

@Injectable()
export class EventAnalyticsDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  buildFilterForm(filters?: DashboardFilters): FormGroup {
    const dashboardFilters = filters || DASHBOARD_FILTERS_DUMMY;
    const selectedTrendAlertTypes = EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS.map(option => option.value);
    const customTimelineRange = this.getDefaultCustomTimelineRange();
    return this.builder.group({
      timeline: [this.getDefaultOptionValue(dashboardFilters.timeRange, 'last_month')],
      timelineFrom: [{ value: customTimelineRange.from, disabled: true }, [Validators.required]],
      timelineTo: [{ value: customTimelineRange.to, disabled: true }, [Validators.required]],
      eventDeviceCategory: [this.getDefaultOptionValue(dashboardFilters.eventDeviceCategory, 'application')],
      trendAlertTypes: [selectedTrendAlertTypes],
      trendTimeline: [this.getDefaultOptionValue(dashboardFilters.trendTimeline, 'last_month')],
      trendTimelineFrom: [{ value: customTimelineRange.from, disabled: true }, [Validators.required]],
      trendTimelineTo: [{ value: customTimelineRange.to, disabled: true }, [Validators.required]],
      alertSegregationCategory: [this.getDefaultOptionValue(dashboardFilters.alertSegregationCategory, 'application')],
      analyticsViewBy: [this.getDefaultOptionValue(dashboardFilters.analyticsViewBy, 'source')],
      analyticsSourceType: [this.getDefaultOptionValue(dashboardFilters.analyticsSourceType, 'all_source')],
      analyticsSeverityType: [this.getDefaultOptionValue(dashboardFilters.analyticsSeverityType, 'all_severity')],
      analyticsDatacenter: [this.getDefaultOptionValue(dashboardFilters.analyticsDatacenter, 'all_datacenter')],
      analyticsCloud: [this.getDefaultOptionValue(dashboardFilters.analyticsCloud, 'all_cloud')],
      analyticsCategory: [this.getDefaultOptionValue(dashboardFilters.analyticsCategory, 'application')],
      analyticsDuration: [this.getDefaultOptionValue(dashboardFilters.analyticsDuration, 'last_7_days')],
      noisyEventsCategory: [this.getDefaultOptionValue(dashboardFilters.noisyEventsCategory, 'application')],
      noisyHostsCategory: [this.getDefaultOptionValue(dashboardFilters.noisyHostsCategory, 'application')],
      incidentCategory: [this.getDefaultOptionValue(dashboardFilters.incidentCategory, 'application')]
    }, { validators: this.customTimelineRangeValidator });
  }

  getDefaultDashboardFilters(): DashboardFilters {
    return this.mapDashboardFiltersResponse(null);
  }

  getHeaderTextData(): Observable<DashboardHeader> {
    return this.http.get<any>(EVENT_ANALYTICS_TOP_HEADER_ENDPOINT).pipe(
      map(res => this.mapHeaderResponse(res))
    );
  }

  getDashboardFilters(): Observable<DashboardFilters> {
    return this.http.get<any>(EVENT_ANALYTICS_DASHBOARD_FILTERS_ENDPOINT).pipe(
      map(res => this.mapDashboardFiltersResponse(res))
    );
  }

  getTicketManagementAccounts(): Observable<TicketMgmtList[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<TicketMgmtList[]>(GET_TICKET_MGMT_LIST(), { params });
  }

  getTicketManagementTabs(account: TicketMgmtList, jiraProjects: JiraInstanceProject[] = []): EventAnalyticsTicketTab[] {
    if (!account?.uuid) {
      return [];
    }
    switch (account.type) {
      case 'ServiceNow':
        return EVENT_ANALYTICS_SERVICE_NOW_TICKET_TABS(account.uuid);
      case 'DynamicsCrm':
        return EVENT_ANALYTICS_MS_DYNAMICS_TICKET_TABS(account.uuid);
      case 'Jira':
        return (jiraProjects || []).map(project => ({
          key: project.project_id,
          name: project.project_name,
          projectId: project.project_id,
          serviceDeskId: project.serviceDeskId,
          drillDownLink: `/support/ticketmgmt/${account.uuid}/jira/projects/${project.project_id}`
        }));
      case 'Zendesk':
        return EVENT_ANALYTICS_ZENDESK_TICKET_TABS(account.uuid);
      default:
        return [];
    }
  }

  getJiraProjects(instanceId: string): Observable<JiraInstanceProject[]> {
    return this.http.get<JiraInstanceProjects>(EVENT_ANALYTICS_JIRA_PROJECTS_ENDPOINT(instanceId)).pipe(
      map(res => res?.projects_selected || res?.project_list || (res as any)?.project_details || [])
    );
  }

  getSummary(criteria: DashboardFilterCriteria): Observable<ExecutiveSummaryResponse> {
    return this.http.get<any>(EVENT_ANALYTICS_SUMMARY_ENDPOINT, this.getRequestOptions(criteria)).pipe(
      map(res => this.mapSummaryResponse(res))
    );
  }

  getEventPipeline(criteria: DashboardFilterCriteria): Observable<PipelineResponse> {
    return this.http.get<any>(EVENT_ANALYTICS_PIPELINE_ENDPOINT, this.getRequestOptions(criteria)).pipe(
      map(res => this.mapPipelineResponse(res))
    );
  }

  getEventByDeviceCategory(criteria: DashboardFilterCriteria): Observable<EventByDeviceCategoryResponse> {
    return this.http.get<any>(EVENT_ANALYTICS_EVENT_BY_DEVICE_CATEGORY_ENDPOINT, this.getRequestOptions(criteria, {
      event_by_device_type_category: criteria?.eventDeviceCategory
    })).pipe(
      map(res => this.mapEventByDeviceCategoryResponse(res, criteria?.eventDeviceCategory))
    );
  }

  getAlertsGenerated(criteria: DashboardFilterCriteria): Observable<AlertGeneratedResponse> {
    return this.http.get<AlertGeneratedResponse>(EVENT_ANALYTICS_ALERT_GENERATED_ENDPOINT, this.getRequestOptions(criteria));
  }

  getAlertStatus(criteria: DashboardFilterCriteria): Observable<AlertStatusResponse> {
    return this.http.get<AlertStatusResponse>(EVENT_ANALYTICS_ALERT_STATUS_ENDPOINT, this.getRequestOptions(criteria));
  }

  getTrendByTimeline(criteria: DashboardFilterCriteria): Observable<TrendByTimelineResponse> {
    const trendTimelineParams: Record<string, string | undefined> = {
      trend_timeline: criteria?.trendTimeline
    };
    if (criteria?.trendTimeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE) {
      trendTimelineParams.trend_timeline_from = this.formatApiDate(criteria?.trendTimelineFrom);
      trendTimelineParams.trend_timeline_to = this.formatApiDate(criteria?.trendTimelineTo);
    }
    return this.http.get<any>(EVENT_ANALYTICS_TREND_BY_TIMELINE_ENDPOINT, this.getRequestOptions(criteria, trendTimelineParams, {
      alert_type: criteria?.trendAlertTypes
    })).pipe(
      map(res => this.mapTrendByTimelineResponse(res, criteria?.trendAlertTypes))
    );
  }

  getAlertSegregation(criteria: DashboardFilterCriteria): Observable<AlertSegregationResponse> {
    return this.http.get<any>(EVENT_ANALYTICS_ALERT_BY_DEVICE_TYPE_ENDPOINT, this.getRequestOptions(criteria, {
      alert_by_device_type_category: criteria?.alertSegregationCategory
    })).pipe(
      map(res => this.mapAlertSegregationResponse(res, criteria?.alertSegregationCategory))
    );
  }

  getEventAlertAnalytics(criteria: DashboardFilterCriteria): Observable<EventAlertAnalyticsResponse> {
    return this.http.get<any>(EVENT_ANALYTICS_EVENT_ALERT_ANALYTICS_ENDPOINT, this.getRequestOptions(criteria, {
      view_by: criteria?.analyticsViewBy,
      source_type: criteria?.analyticsSourceType,
      severity_type: criteria?.analyticsSeverityType,
      datacenter: criteria?.analyticsDatacenter,
      cloud: criteria?.analyticsCloud,
      analytics_category: criteria?.analyticsCategory,
      duration: criteria?.analyticsDuration
    })).pipe(
      map(res => this.mapEventAlertAnalyticsResponse(res))
    );
  }

  getNoisyEvents(criteria: DashboardFilterCriteria): Observable<NoisyEventsResponse> {
    return this.http.get<any>(EVENT_ANALYTICS_NOISY_EVENTS_ENDPOINT, this.getRequestOptions(criteria, {
      category: criteria?.noisyEventsCategory
    })).pipe(
      map(res => this.mapNoisyEventsResponse(res, criteria?.noisyEventsCategory))
    );
  }

  getNoisyHosts(criteria: DashboardFilterCriteria): Observable<NoisyHostsResponse> {
    return this.http.get<any>(EVENT_ANALYTICS_NOISY_HOSTS_ENDPOINT, this.getRequestOptions(criteria, {
      category: criteria?.noisyHostsCategory
    })).pipe(
      map(res => this.mapNoisyHostsResponse(res, criteria?.noisyHostsCategory))
    );
  }

  getIncidentManagement(criteria: DashboardFilterCriteria): Observable<IncidentManagementResponse> {
    return forkJoin({
      alertByDeviceType: this.http.get<any>(EVENT_ANALYTICS_ALERT_BY_DEVICE_TYPE_ENDPOINT, this.getRequestOptions(criteria, {
        alert_by_device_type_category: criteria?.incidentCategory
      })),
      openIncidents: this.http.get<any>(EVENT_ANALYTICS_OPEN_INCIDENTS_ENDPOINT, this.getRequestOptions(criteria, {
        category: criteria?.incidentCategory
      })),
      resolvedIncidents: this.http.get<any>(EVENT_ANALYTICS_RESOLVED_INCIDENTS_ENDPOINT, this.getRequestOptions(criteria, {
        category: criteria?.incidentCategory
      }))
    }).pipe(
      map(res => this.mapIncidentManagementResponse(res, criteria?.incidentCategory))
    );
  }

  convertToSummaryMetrics(data: ExecutiveSummaryResponse): MetricViewData[] {
    return [
      { key: 'total_inference_alerts', label: 'Total Inference Alerts', value: this.formatNumber(data?.total_inference_alerts) },
      { key: 'events', label: 'Events', value: this.formatNumber(data?.events) },
      { key: 'alerts', label: 'Alerts', value: this.formatNumber(data?.alerts) },
      { key: 'conditions', label: 'Conditions', value: this.formatNumber(data?.conditions) },
      { key: 'cumulative_reduction', label: 'Cumulative Reduction', value: `${this.formatNumber(data?.cumulative_reduction)}%`, tone: 'primary' }
    ];
  }

  convertToPipelineData(data: PipelineResponse): PipelineViewData {
    return {
      rawEvents: this.formatNumber(data?.raw_events),
      noiseReduction: `${this.formatPercent(data?.noise_reduction)}%`,
      alerts: this.formatNumber(data?.alerts),
      correlationPct: `${this.formatPercent(data?.correlation_pct)}%`,
      conditions: this.formatNumber(data?.conditions)
    };
  }

  convertToDeviceCategoryCards(data: DeviceCategoryItem[]): MetricViewData[] {
    return (data || []).map((item, index) => ({
      key: item.key,
      label: item.label,
      value: this.formatNumber(item.count),
      tone: index % 2 ? 'success' : 'primary'
    }));
  }

  convertToDeviceCategoryChart(data: DeviceCategoryItem[]): EChartsOption {
    const rows = (data || [])
      .map((item, index) => ({
        key: item.key,
        name: item.label,
        value: this.getNumber(item.count),
        color: EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length]
      }))
      .filter(item => item.value > 0);
    return rows.length ? this.getDonutChartOptions(rows, ['40%', '68%'], ['47%', '48%'], true) : null;
  }

  convertToMetricKpis(data: AlertMetricResponse[]): MetricViewData[] {
    return (data || []).map(metric => ({
      key: metric.key,
      label: metric.label,
      value: this.formatNumber(metric.value),
      tone: metric.tone
    }));
  }

  convertToDonutChart(data: DonutSegmentResponse[], radius: string[] = ['52%', '72%']): EChartsOption {
    const rows = (data || []).map((item, index) => ({
      key: item.key,
      name: item.label,
      value: this.getNumber(item.value),
      color: EVENT_ANALYTICS_STATUS_COLORS[item.key] || EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length]
    })).filter(item => item.value > 0);
    return rows.length ? this.getDonutChartOptions(rows, radius, ['50%', '47%'], false) : null;
  }

  convertToTrendChartData(data: TrendByTimelineResponse): EChartsOption {
    const selectedTypes = this.getSelectedTrendAlertTypes(data?.active_alert_types);
    const trendSeries = [
      { key: 'conditions', name: 'Condition', color: '#42c8bb', points: data?.series?.conditions || [] },
      { key: 'alerts', name: 'Alerts', color: '#488bd7', points: data?.series?.alerts || [] },
      { key: 'events', name: 'Events', color: '#7d61d0', points: data?.series?.events || [] }
    ].filter(item => selectedTypes.indexOf(item.key) > -1);
    const labelPoints = trendSeries.map(item => item.points).find(points => points.length);
    const labels = (labelPoints || []).map(point => this.formatTrendLabel(point));
    if (!labels.length || !trendSeries.length) {
      return null;
    }
    return {
      animation: false,
      color: trendSeries.map(item => item.color),
      grid: { left: 42, right: 18, top: 36, bottom: 58 },
      legend: {
        top: 2,
        left: 'center',
        icon: 'rect',
        itemWidth: 18,
        itemHeight: 6,
        textStyle: { fontSize: 10, color: '#637181' },
        data: trendSeries.map(item => item.name)
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisTick: { show: false },
        axisLabel: { color: '#7a8794', fontSize: 9, rotate: 55 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitNumber: 5,
        axisLabel: { color: '#7a8794', fontSize: 10 },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      series: trendSeries.map(item => this.getTrendSeries(item.name, item.points, item.color))
    };
  }

  convertToAlertSegregationSummary(data: AlertSegregationResponse): MetricViewData[] {
    return [
      { key: 'critical', label: 'Critical', value: this.formatNumber(data?.summary?.critical), tone: 'danger' },
      { key: 'warning', label: 'Warning', value: this.formatNumber(data?.summary?.warning), tone: 'warning' },
      { key: 'information', label: 'Info', value: this.formatNumber(data?.summary?.information), tone: 'info' }
    ];
  }

  convertToAlertSegregationChart(data: AlertSegregationRow[]): EChartsOption {
    const rows = data || [];
    if (!rows.length) {
      return null;
    }
    return {
      animation: false,
      color: [EVENT_ANALYTICS_STATUS_COLORS.critical, EVENT_ANALYTICS_STATUS_COLORS.warning, EVENT_ANALYTICS_STATUS_COLORS.information],
      grid: { left: 48, right: 20, top: 24, bottom: 58 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: '#5d6874', fontSize: 11 },
        data: ['Critical', 'Warning', 'Info']
      },
      xAxis: {
        type: 'category',
        data: rows.map(row => row.label),
        axisTick: { show: false },
        axisLabel: {
          color: '#637181',
          fontSize: 10,
          interval: 0,
          width: 70,
          overflow: 'break'
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 220,
        splitNumber: 5,
        axisLabel: { color: '#7a8794', fontSize: 10 },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      series: [
        { name: 'Info', type: 'bar', stack: 'total', barWidth: 22, data: rows.map(row => row.information) },
        { name: 'Warning', type: 'bar', stack: 'total', barWidth: 22, data: rows.map(row => row.warning) },
        { name: 'Critical', type: 'bar', stack: 'total', barWidth: 22, data: rows.map(row => row.critical) }
      ]
    };
  }

  convertToEventAlertAnalyticsMetrics(data: EventAlertAnalyticsResponse): MetricViewData[] {
    return data?.metrics || [];
  }

  convertToSankeyOptions(data: SankeyData, leftPadding: number = 8): EChartsOption {
    if (!data?.nodes?.length) {
      return null;
    }
    return {
      animation: false,
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [
        {
          type: 'sankey',
          left: leftPadding,
          right: 10,
          top: 10,
          bottom: 10,
          nodeWidth: 9,
          nodeGap: 13,
          draggable: false,
          emphasis: { focus: 'adjacency' },
          label: {
            color: '#26313b',
            fontSize: 11
          },
          lineStyle: {
            color: 'gradient',
            curveness: 0.52,
            opacity: 0.5
          },
          data: data.nodes,
          links: data.links
        }
      ]
    } as EChartsOption;
  }

  convertToNoisyEventTableData(data: NoisyEventRowResponse[]): NoisyEventRowViewData[] {
    return (data || []).map(item => ({
      uuid: item.uuid || '',
      device: item.device || 'N/A',
      deviceType: item.device_type || 'N/A',
      count: this.formatNumber(item.count),
      description: item.description || 'N/A',
      source: item.source || 'N/A',
      lastReported: this.formatDateTime(item.last_reported),
      severity: item.severity || 'Information',
      severityIcon: this.getSeverityIcon(item.severity),
      severityClass: this.getSeverityClass(item.severity)
    }));
  }

  convertToNoisyHostsChart(data: NoisyHostChartRow[]): EChartsOption {
    const rows = data || [];
    if (!rows.length) {
      return null;
    }
    return {
      animation: false,
      color: [EVENT_ANALYTICS_STATUS_COLORS.critical, EVENT_ANALYTICS_STATUS_COLORS.warning, EVENT_ANALYTICS_STATUS_COLORS.information],
      grid: { left: 118, right: 16, top: 18, bottom: 38 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontSize: 10, color: '#5d6874' },
        data: ['Critical', 'Warning', 'Information']
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#7a8794', fontSize: 10 },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      yAxis: {
        type: 'category',
        data: rows.map(row => row.host_name),
        axisTick: { show: false },
        axisLabel: {
          color: '#6c7784',
          fontSize: 10,
          width: 106,
          overflow: 'truncate'
        }
      },
      series: [
        { name: 'Critical', type: 'bar', stack: 'total', barWidth: 16, data: rows.map(row => row.critical) },
        { name: 'Warning', type: 'bar', stack: 'total', barWidth: 16, data: rows.map(row => row.warning) },
        { name: 'Information', type: 'bar', stack: 'total', barWidth: 16, data: rows.map(row => row.information) }
      ]
    };
  }

  convertToIncidentAlertRows(data: IncidentAlertByDeviceRow[]): IncidentAlertByDeviceViewData[] {
    return (data || []).map(row => ({
      key: row.key,
      deviceName: row.device_name || 'N/A',
      critical: this.getNumber(row.critical),
      warning: this.getNumber(row.warning),
      information: this.getNumber(row.information),
      ticketCount: this.getNumber(row.ticket_count)
    }));
  }

  convertToIncidentTicketRows(data: IncidentTicketRow[]): IncidentTicketViewData[] {
    return (data || []).map(row => ({
      uuid: row.uuid,
      ticketId: row.ticket_id || 'N/A',
      deviceName: row.device_name || 'N/A',
      alertType: row.alert_type || 'Information',
      tone: row.tone || this.getTicketTone(row.alert_type),
      ticketCount: this.getNumber(row.ticket_count),
      severityIcon: this.getSeverityIcon(row.alert_type),
      severityClass: this.getSeverityClass(row.alert_type)
    }));
  }

  getStatusClass(tone?: EventAnalyticsTone): string {
    return tone ? `tone-${tone}` : 'tone-muted';
  }

  getTicketTone(severity: string): EventAnalyticsTone {
    const key = this.normalizeKey(severity);
    if (key.includes('critical')) {
      return 'danger';
    }
    if (key.includes('warning')) {
      return 'warning';
    }
    return 'info';
  }

  private mapHeaderResponse(res: any): DashboardHeader {
    const scopeText = res?.scopeText || [res?.scope?.sources, res?.scope?.deviceTypes].filter(label => !!label).join(' - ');
    return {
      lastRefreshed: res?.lastRefreshed || res?.last_refreshed || '',
      scopeText: scopeText || ''
    };
  }

  private mapDashboardFiltersResponse(res: any): DashboardFilters {
    const payload = res?.filters || res?.data || res;
    const timeRange = EVENT_ANALYTICS_TIME_RANGE_OPTIONS;
    const trendTimeline = EVENT_ANALYTICS_TIME_RANGE_OPTIONS;
    const category = this.getFilterOptions(payload, ['category', 'categoryOptions', 'category_options'], DASHBOARD_FILTERS_DUMMY.category || EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY);
    return {
      timeRange,
      trendTimeline,
      category,
      eventDeviceCategory: this.getFilterOptions(payload, [
        'eventDeviceCategory',
        'eventByDeviceCategory',
        'event_device_category',
        'event_by_device_category',
        'event_by_device_type_category',
        'eventDeviceCategoryOptions',
        'eventByDeviceCategoryOptions',
        'event_device_category_options',
        'event_by_device_category_options',
        'event_by_device_type_category_options'
      ], category),
      alertSegregationCategory: this.getFilterOptions(payload, [
        'alertSegregationCategory',
        'alertByDeviceCategory',
        'alert_segregation_category',
        'alert_by_device_category',
        'alert_by_device_type_category',
        'alertSegregationCategoryOptions',
        'alertByDeviceCategoryOptions',
        'alert_segregation_category_options',
        'alert_by_device_category_options',
        'alert_by_device_type_category_options'
      ], category),
      analyticsViewBy: this.getFilterOptions(payload, ['analyticsViewBy', 'analytics_view_by'], DASHBOARD_FILTERS_DUMMY.analyticsViewBy),
      analyticsSourceType: this.getFilterOptions(payload, ['analyticsSourceType', 'analytics_source_type'], DASHBOARD_FILTERS_DUMMY.analyticsSourceType),
      analyticsSeverityType: this.getFilterOptions(payload, ['analyticsSeverityType', 'analytics_severity_type'], DASHBOARD_FILTERS_DUMMY.analyticsSeverityType),
      analyticsDatacenter: this.getFilterOptions(payload, ['analyticsDatacenter', 'analytics_datacenter'], DASHBOARD_FILTERS_DUMMY.analyticsDatacenter),
      analyticsCloud: this.getFilterOptions(payload, ['analyticsCloud', 'analytics_cloud'], DASHBOARD_FILTERS_DUMMY.analyticsCloud),
      analyticsCategory: this.getFilterOptions(payload, ['analyticsCategory', 'analytics_category', 'analyticsCategoryOptions', 'analytics_category_options'], category),
      analyticsDuration: this.getFilterOptions(payload, ['analyticsDuration', 'analytics_duration'], DASHBOARD_FILTERS_DUMMY.analyticsDuration),
      noisyEventsCategory: this.getFilterOptions(payload, ['noisyEventsCategory', 'noisy_events_category', 'noisyEventsCategoryOptions', 'noisy_events_category_options'], category),
      noisyHostsCategory: this.getFilterOptions(payload, ['noisyHostsCategory', 'noisy_hosts_category', 'noisyHostsCategoryOptions', 'noisy_hosts_category_options'], category),
      incidentCategory: this.getFilterOptions(payload, ['incidentCategory', 'incident_category', 'incidentCategoryOptions', 'incident_category_options'], category)
    };
  }

  private mapSummaryResponse(res: any): ExecutiveSummaryResponse {
    return {
      total_inference_alerts: this.getNumber(res?.total_inference_alerts ?? res?.totalInferenceAlerts),
      events: this.getNumber(res?.events),
      alerts: this.getNumber(res?.alerts),
      conditions: this.getNumber(res?.conditions),
      cumulative_reduction: this.getNumber(res?.cumulative_reduction ?? res?.cumulativeReduction)
    };
  }

  private mapPipelineResponse(res: any): PipelineResponse {
    const kpis = res?.kpis || res || {};
    return {
      raw_events: this.getNumber(res?.raw_events ?? kpis?.rawEvents ?? kpis?.raw_events),
      noise_reduction: this.getNumber(res?.noise_reduction ?? kpis?.noiseReduction ?? kpis?.noise_reduction),
      alerts: this.getNumber(res?.alerts ?? res?.funnel?.find((item: any) => item?.stage === 'Alerts')?.count),
      correlation_pct: this.getNumber(res?.correlation_pct ?? kpis?.correlationPct ?? kpis?.correlation_pct),
      conditions: this.getNumber(res?.conditions ?? res?.funnel?.find((item: any) => item?.stage === 'Conditions')?.count)
    };
  }

  private mapEventByDeviceCategoryResponse(res: any, selectedCategory?: string): EventByDeviceCategoryResponse {
    return {
      donut: (res?.donut || []).map((item: any) => this.mapDeviceCategoryItem(item)),
      tiles: (res?.tiles || []).map((item: any) => this.mapDeviceCategoryItem(item)),
      active_category: this.getActiveCategory(res, selectedCategory),
      category_options: this.getCategoryOptions(res)
    };
  }

  private mapTrendByTimelineResponse(res: any, selectedAlertTypes?: string[]): TrendByTimelineResponse {
    return {
      series: {
        events: res?.series?.events || [],
        alerts: res?.series?.alerts || [],
        conditions: res?.series?.conditions || []
      },
      active_category: this.getActiveCategory(res),
      active_alert_types: this.getSelectedTrendAlertTypes(selectedAlertTypes)
    };
  }

  private mapAlertSegregationResponse(res: any, selectedCategory?: string): AlertSegregationResponse {
    const rows: AlertSegregationRow[] = this.getResponseRows(res).map((row: any) => ({
      key: row?.key || this.normalizeKey(row?.displayName || row?.display_name || row?.label || ''),
      label: row?.label || row?.displayName || row?.display_name || 'N/A',
      critical: this.getNumber(row?.critical),
      warning: this.getNumber(row?.warning),
      information: this.getNumber(row?.information ?? row?.available)
    }));
    return {
      summary: {
        critical: rows.reduce((sum, row) => sum + row.critical, 0),
        warning: rows.reduce((sum, row) => sum + row.warning, 0),
        information: rows.reduce((sum, row) => sum + row.information, 0)
      },
      rows,
      active_category: this.getActiveCategory(res, selectedCategory),
      category_options: this.getCategoryOptions(res)
    };
  }

  private mapEventAlertAnalyticsResponse(res: any): EventAlertAnalyticsResponse {
    const payload = res?.analytics || res?.data || res || {};
    const metrics = (payload?.metrics || []).map((metric: any) => ({
      key: metric?.key || this.normalizeKey(metric?.label || metric?.name || ''),
      label: metric?.label || metric?.name || 'N/A',
      value: String(metric?.value ?? '0'),
      tone: metric?.tone || metric?.status || 'primary'
    }));
    return {
      metrics,
      reductionFlow: this.mapSankeyData(payload?.reductionFlow || payload?.reduction_flow || payload?.eventReductionFlow || payload?.event_reduction_flow),
      resolutionFlow: this.mapSankeyData(payload?.resolutionFlow || payload?.resolution_flow || payload?.incidentResolutionFlow || payload?.incident_resolution_flow)
    };
  }

  private mapNoisyEventsResponse(res: any, selectedCategory?: string): NoisyEventsResponse {
    return {
      rows: this.getResponseRows(res).map((row: any) => this.mapNoisyEventRow(row)),
      active_category: this.getActiveCategory(res, selectedCategory),
      category_options: this.getCategoryOptions(res)
    };
  }

  private mapNoisyHostsResponse(res: any, selectedCategory?: string): NoisyHostsResponse {
    return {
      rows: this.getResponseRows(res).map((row: any) => this.mapNoisyHostRow(row)),
      chart: (res?.chart || []).map((row: any) => ({
        host_name: row?.host_name || row?.hostName || '',
        critical: this.getNumber(row?.critical),
        warning: this.getNumber(row?.warning),
        information: this.getNumber(row?.information)
      })),
      active_category: this.getActiveCategory(res, selectedCategory),
      category_options: this.getCategoryOptions(res)
    };
  }

  private mapIncidentManagementResponse(res: any, selectedCategory?: string): IncidentManagementResponse {
    return {
      alert_generated_by_device_type: this.mapIncidentAlertByDeviceRows(this.getResponseRows(res?.alertByDeviceType)),
      open_incident_tickets: this.mapIncidentTicketRows(this.getResponseRows(res?.openIncidents)),
      resolved_incident_tickets: this.mapIncidentTicketRows(this.getResponseRows(res?.resolvedIncidents)),
      active_category: this.getActiveCategory(res?.alertByDeviceType, selectedCategory),
      category_options: this.getCategoryOptions(res?.alertByDeviceType)
    };
  }

  private mapDeviceCategoryItem(item: any): DeviceCategoryItem {
    return {
      key: item?.key || '',
      label: item?.label || 'N/A',
      count: this.getNumber(item?.count),
      percentage: this.getNumber(item?.percentage)
    };
  }

  private mapSankeyData(data: any): SankeyData {
    return {
      nodes: (data?.nodes || []).map((node: any) => {
        const labelConfig = node?.labelStyle || node?.label_style || (typeof node?.label === 'object' ? node.label : undefined);
        const displayLabel = typeof node?.label === 'string' ? node.label : '';
        return {
          name: node?.name || displayLabel,
          value: node?.value,
          itemStyle: node?.itemStyle || node?.item_style,
          label: labelConfig
        };
      }),
      links: (data?.links || []).map((link: any) => ({
        source: link?.source || '',
        target: link?.target || '',
        value: this.getNumber(link?.value),
        lineStyle: link?.lineStyle || link?.line_style
      }))
    };
  }

  private mapNoisyEventRow(row: any): NoisyEventRowResponse {
    return {
      uuid: row?.uuid || '',
      device: row?.device || row?.device_name || 'N/A',
      device_type: row?.device_type || row?.deviceType || 'N/A',
      count: this.getNumber(row?.count),
      description: row?.description || 'N/A',
      source: row?.source || 'N/A',
      last_reported: row?.last_reported || row?.lastReported || '',
      severity: row?.severity || 'Information'
    };
  }

  private mapNoisyHostRow(row: any): NoisyEventRowResponse {
    return {
      uuid: row?.uuid || '',
      device: row?.device || row?.hostName || row?.host_name || 'N/A',
      device_type: row?.device_type || row?.deviceType || 'N/A',
      count: this.getNumber(row?.count),
      description: row?.description || row?.managementIp || row?.management_ip || 'N/A',
      source: row?.source || 'N/A',
      last_reported: row?.last_reported || row?.lastReported || '',
      severity: row?.severity || 'Information'
    };
  }

  private mapIncidentAlertByDeviceRows(rows: any[]): IncidentAlertByDeviceRow[] {
    return (rows || []).map(row => ({
      key: row?.key || this.normalizeKey(row?.displayName || row?.display_name || row?.device_name || ''),
      device_name: row?.device_name || row?.displayName || row?.display_name || 'N/A',
      critical: this.getNumber(row?.critical),
      warning: this.getNumber(row?.warning),
      information: this.getNumber(row?.information ?? row?.available),
      ticket_count: this.getNumber(row?.ticket_count ?? row?.ticketCount)
    }));
  }

  private mapIncidentTicketRows(rows: any[]): IncidentTicketRow[] {
    return (rows || []).map(row => ({
      uuid: row?.uuid || '',
      ticket_id: row?.ticket_id || row?.ticketId || row?.ticketUuid || 'N/A',
      device_name: row?.device_name || row?.deviceName || row?.affectedService || row?.availabilityState || 'N/A',
      alert_type: row?.alert_type || row?.alertType || row?.severity || row?.availabilityState || 'Information',
      tone: row?.tone || this.getTicketTone(row?.alert_type || row?.alertType || row?.severity || row?.availabilityState),
      ticket_count: this.getNumber(row?.ticket_count ?? row?.ticketCount)
    }));
  }

  private getResponseRows(res: any): any[] {
    return Array.isArray(res) ? res : res?.rows || res?.results || [];
  }

  private getFilterOptions(res: any, keys: string[], fallback: SelectOption[]): SelectOption[] {
    const key = keys.find(filterKey => Array.isArray(res?.[filterKey]));
    return key ? res[key] : fallback;
  }

  private getCategoryOptions(res: any): SelectOption[] {
    return res?.category_options || res?.categoryOptions || res?.category || EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY;
  }

  private getDefaultOptionValue(options: SelectOption[], preferredValue?: string): string {
    const availableOptions = options || [];
    const preferredOption = availableOptions.find(option => option.value === preferredValue);
    return preferredOption?.value || availableOptions[0]?.value || '';
  }

  private getActiveCategory(res: any, selectedCategory?: string): string {
    const activeCategory = res?.active_category || res?.activeCategory || selectedCategory;
    if (Array.isArray(activeCategory)) {
      return activeCategory[0] || EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY[0].value;
    }
    return activeCategory || EVENT_ANALYTICS_CATEGORY_OPTIONS_DUMMY[0].value;
  }

  private getRequestOptions(criteria?: DashboardFilterCriteria, extraParams?: Record<string, string | undefined>, extraMultiParams?: Record<string, string[] | undefined>): { params: HttpParams } {
    return {
      params: this.convertFiltersToApiParams(criteria, extraParams, extraMultiParams)
    };
  }

  private convertFiltersToApiParams(criteria?: DashboardFilterCriteria, extraParams?: Record<string, string | undefined>, extraMultiParams?: Record<string, string[] | undefined>): HttpParams {
    let params = new HttpParams();
    params = this.appendParam(params, 'timeline', criteria?.timeline);
    if (criteria?.timeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE) {
      params = this.appendDateParam(params, 'from', criteria?.timelineFrom);
      params = this.appendDateParam(params, 'to', criteria?.timelineTo);
    }
    const requestParams = extraParams || {};
    Object.keys(requestParams).forEach(key => {
      params = this.appendParam(params, key, requestParams[key]);
    });
    const requestMultiParams = extraMultiParams || {};
    Object.keys(requestMultiParams).forEach(key => {
      params = this.appendMultiValueParam(params, key, requestMultiParams[key]);
    });
    return params;
  }

  private appendParam(params: HttpParams, key: string, value?: string): HttpParams {
    if (!value || value === 'all' || value.indexOf('all_') === 0) {
      return params;
    }
    return params.append(key, value);
  }

  private appendDateParam(params: HttpParams, key: string, value?: Date | string): HttpParams {
    const formattedDate = this.formatApiDate(value);
    if (!formattedDate) {
      return params;
    }
    return params.append(key, formattedDate);
  }

  private formatApiDate(value?: Date | string): string | undefined {
    const date = moment(value);
    return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : undefined;
  }

  private getDefaultCustomTimelineRange(): { from: Date; to: Date } {
    return {
      from: moment().subtract(24, 'hours').toDate(),
      to: moment().toDate()
    };
  }

  private customTimelineRangeValidator(control: AbstractControl): ValidationErrors | null {
    const errors: ValidationErrors = {};
    const timeline = control.get('timeline')?.value;
    const trendTimeline = control.get('trendTimeline')?.value;
    const isTimelineInvalid = timeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE &&
      EventAnalyticsDashboardService.isSameOrAfterRange(control.get('timelineFrom')?.value, control.get('timelineTo')?.value);
    const isTrendTimelineInvalid = trendTimeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE &&
      EventAnalyticsDashboardService.isSameOrAfterRange(control.get('trendTimelineFrom')?.value, control.get('trendTimelineTo')?.value);
    if (isTimelineInvalid) {
      errors.timelineFromSameAsOrAfterTo = true;
    }
    if (isTrendTimelineInvalid) {
      errors.trendTimelineFromSameAsOrAfterTo = true;
    }
    return Object.keys(errors).length ? errors : null;
  }

  private static isSameOrAfterRange(from?: Date | string, to?: Date | string): boolean {
    if (!from || !to) {
      return false;
    }
    return moment(from).isSameOrAfter(moment(to));
  }

  private appendMultiValueParam(params: HttpParams, key: string, values?: string[]): HttpParams {
    (values || []).forEach(value => {
      params = this.appendParam(params, key, value);
    });
    return params;
  }

  private getSelectedTrendAlertTypes(values?: any[]): string[] {
    const validTypes = EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS.map(option => option.value);
    if (!values) {
      return validTypes;
    }
    return values
      .map(value => typeof value === 'string' ? value : value?.value)
      .filter(value => validTypes.indexOf(value) > -1);
  }

  private getDonutChartOptions(items: Array<{ key: string; name: string; value: number; color: string }>, radius: string[], center: string[], showLegend: boolean): EChartsOption {
    return {
      animation: false,
      color: items.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      legend: showLegend ? {
        show: false
      } : {
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: '#5d6874', fontSize: 10 },
        data: items.map(item => item.name)
      },
      series: [
        {
          type: 'pie',
          radius,
          center,
          minAngle: 5,
          avoidLabelOverlap: true,
          label: {
            show: true,
            color: '#4d5965',
            fontSize: 10,
            formatter: '{c}'
          },
          labelLine: {
            length: 14,
            length2: 12,
            lineStyle: { color: '#8da0b4' }
          },
          data: items.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }

  private getTrendSeries(name: string, points: TrendTimelinePoint[], color: string): any {
    return {
      name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      areaStyle: { color: this.hexToRgba(color, 0.14) },
      data: (points || []).map(point => this.getNumber(point.count))
    };
  }

  private formatTrendLabel(point: TrendTimelinePoint): string {
    if (point?.label) {
      return point.label;
    }
    const rawDate = point?.start_time || point?.end_time;
    const date = moment(rawDate);
    return date.isValid() ? date.format('MMM D') : String(rawDate || '');
  }

  private formatDateTime(value: string): string {
    if (!value) {
      return 'N/A';
    }
    const parsedValue = moment(value);
    return parsedValue.isValid() ? parsedValue.format('MMM DD, YYYY, HH:mm:ss') : value;
  }

  private formatNumber(value: number | string): string {
    return this.getNumber(value).toLocaleString('en-US');
  }

  private formatPercent(value: number | string): string {
    return this.getNumber(value).toFixed(2);
  }

  private getNumber(value: number | string): number {
    const numericValue = Number(String(value == null ? 0 : value).replace(/[^0-9.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }

  private getSeverityIcon(severity: string): string {
    const key = this.normalizeKey(severity);
    if (key.includes('critical')) {
      return 'fa-exclamation-triangle';
    }
    if (key.includes('warning')) {
      return 'fa-exclamation-circle';
    }
    return 'fa-info-circle';
  }

  private getSeverityClass(severity: string): string {
    const key = this.normalizeKey(severity);
    if (key.includes('critical')) {
      return 'text-danger';
    }
    if (key.includes('warning')) {
      return 'text-warning';
    }
    return 'text-primary';
  }

  private normalizeKey(value: string): string {
    return String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  }

  private hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}
