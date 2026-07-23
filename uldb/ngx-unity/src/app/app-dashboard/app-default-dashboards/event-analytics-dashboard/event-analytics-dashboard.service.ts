import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import {
  ALERT_BY_DEVICE_TYPE_API_DUMMY,
  DASHBOARD_FILTERS_DUMMY,
  DASHBOARD_TOP_FILTERS_API_DUMMY,
  DASHBOARD_HEADER_API_DUMMY,
  EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE,
  EVENT_ANALYTICS_CATEGORY_OPTIONS,
  EVENT_ANALYTICS_DONUT_COLORS,
  EVENT_ANALYTICS_CATEGORY_COLOR_MAP,
  EVENT_ALERT_ANALYTICS_NODE_IMAGE_MAP,
  EVENT_ANALYTICS_ALERT_BY_DEVICE_TYPE_ENDPOINT,
  EVENT_ANALYTICS_ALERT_SEGREGATION_ENDPOINT,
  ALERT_GENERATED_DUMMY,
  ALERT_STATUS_DUMMY,
  EVENT_ANALYTICS_ALERT_GENERATED_ENDPOINT,
  EVENT_ANALYTICS_ALERT_STATUS_ENDPOINT,
  EVENT_ANALYTICS_DASHBOARD_FILTERS_ENDPOINT,
  EVENT_ANALYTICS_EVENT_ALERT_ANALYTICS_ENDPOINT,
  EVENT_ANALYTICS_EVENT_BY_DEVICE_CATEGORY_ENDPOINT,
  EVENT_ANALYTICS_ITSM_TICKET_VIEW_ENDPOINT,
  EVENT_ANALYTICS_ITSM_PRIORITY_COLORS,
  EVENT_ANALYTICS_ITSM_RESPONSE_TIME_COLORS,
  EVENT_ANALYTICS_ITSM_STATUS_COLORS,
  EVENT_ANALYTICS_NOISY_EVENTS_ENDPOINT,
  EVENT_ANALYTICS_NOISY_HOSTS_ENDPOINT,
  EVENT_ANALYTICS_OPEN_INCIDENTS_ENDPOINT,
  EVENT_ANALYTICS_PIPELINE_ENDPOINT,
  EVENT_ANALYTICS_RESOLVED_INCIDENTS_ENDPOINT,
  EVENT_ANALYTICS_STATUS_COLORS,
  EVENT_ANALYTICS_SUMMARY_ENDPOINT,
  EVENT_ANALYTICS_TIME_RANGE_OPTIONS,
  EVENT_ANALYTICS_TOP_HEADER_ENDPOINT,
  EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS,
  EVENT_ANALYTICS_TREND_BY_TIMELINE_ENDPOINT,
  EVENT_ALERT_ANALYTICS_API_DUMMY,
  EVENT_BY_DEVICE_TYPE_API_DUMMY,
  EXECUTIVE_SUMMARY_API_DUMMY,
  ITSM_TICKET_VIEW_API_DUMMY,
  NOISY_EVENTS_API_DUMMY,
  NOISY_HOSTS_API_DUMMY,
  OPEN_INCIDENT_TICKETS_API_DUMMY,
  PIPELINE_API_DUMMY,
  RESOLVED_INCIDENT_TICKETS_API_DUMMY,
  TREND_BY_TIMELINE_API_DUMMY,
  ALERT_SEGREGATION_API_DUMMY
} from './event-analytics-dashboard.const';
import {
  AlertWidgetApiResponse,
  AlertMetricApiResponse,
  AlertByDeviceTypeApiResponse,
  AlertSegregationApiResponse,
  AlertSegregationApiRow,
  DashboardFiltersApiResponse,
  DashboardHeaderApiResponse,
  DashboardFilterCriteria,
  DashboardFilters,
  DashboardHeader,
  EventAlertAnalyticsApiResponse,
  EventAlertAnalyticsGraphApiResponse,
  EventAlertAnalyticsGraphLinkApiResponse,
  EventAlertAnalyticsGraphNodeApiResponse,
  EventAlertAnalyticsFlowSourceApiResponse,
  EventAnalyticsTone,
  EventByDeviceTypeApiItem,
  EventByDeviceTypeApiResponse,
  ExecutiveSummaryApiResponse,
  IncidentAlertByDeviceViewData,
  IncidentAlertTableSortColumn,
  IncidentTicketApiRow,
  IncidentTicketViewData,
  IncidentTicketApiResponse,
  IncidentTicketTableSortColumn,
  ItsmTicketRowViewData,
  ItsmTicketSummaryBucketApiResponse,
  ItsmTicketTableRowApiResponse,
  ItsmTicketViewApiResponse,
  MetricViewData,
  NoisyEventsApiResponse,
  NoisyEventsApiRow,
  NoisyEventRowViewData,
  NoisyHostsApiResponse,
  NoisyHostsApiChartRow,
  NoisyHostsApiRow,
  NoisyTableSortColumn,
  PipelineApiResponse,
  PipelineViewData,
  SankeyData,
  SelectOption,
  TrendByTimelineApiResponse,
  TrendTimelinePoint,
} from './event-analytics-dashboard.type';

@Injectable()
export class EventAnalyticsDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  buildFilterForm(filters?: DashboardFilters): FormGroup {
    const dashboardFilters = filters || DASHBOARD_FILTERS_DUMMY;
    const selectedTrendAlertTypes = EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS.map(option => option.value);
    const customTimelineRange = this.getDefaultCustomTimelineRange();
    const itsmRange = this.getDefaultItsmTicketRange();
    return this.builder.group({
      timeline: [this.getDefaultOptionValue(dashboardFilters.timeRange, 'last_month')],
      timelineFrom: [{ value: customTimelineRange.from, disabled: true }, [Validators.required]],
      timelineTo: [{ value: customTimelineRange.to, disabled: true }, [Validators.required]],
      eventDeviceCategory: [this.getDefaultOptionValue(dashboardFilters.eventDeviceCategory, 'all')],
      trendAlertTypes: [selectedTrendAlertTypes],
      trendTimeline: [this.getDefaultOptionValue(dashboardFilters.trendTimeline, 'last_month')],
      trendTimelineFrom: [{ value: customTimelineRange.from, disabled: true }, [Validators.required]],
      trendTimelineTo: [{ value: customTimelineRange.to, disabled: true }, [Validators.required]],
      alertSegregationCategory: [this.getDefaultOptionValue(dashboardFilters.alertSegregationCategory, 'all')],
      analyticsViewBy: [this.getDefaultOptionValue(dashboardFilters.analyticsViewBy, 'source')],
      analyticsSourceType: [this.getDefaultOptionValue(dashboardFilters.analyticsSourceType, 'all_source')],
      analyticsSeverityType: [this.getDefaultOptionValue(dashboardFilters.analyticsSeverityType, 'all_severity')],
      analyticsDatacenter: [this.getDefaultOptionValue(dashboardFilters.analyticsDatacenter, 'all_datacenter')],
      analyticsCloud: [this.getDefaultOptionValue(dashboardFilters.analyticsCloud, 'all_cloud')],
      analyticsCategory: [this.getDefaultOptionValue(dashboardFilters.analyticsCategory, 'all')],
      eventAndAlertTimeline: [this.getDefaultOptionValue(dashboardFilters.eventAndAlertTimeline, 'last_week')],
      eventAndAlertTimelineFrom: [{ value: customTimelineRange.from, disabled: true }, [Validators.required]],
      eventAndAlertTimelineTo: [{ value: customTimelineRange.to, disabled: true }, [Validators.required]],
      noisyEventsCategory: [this.getDefaultOptionValue(dashboardFilters.noisyEventsCategory, 'all')],
      noisyHostsCategory: [this.getDefaultOptionValue(dashboardFilters.noisyHostsCategory, 'all')],
      incidentCategory: [this.getDefaultOptionValue(dashboardFilters.incidentCategory, 'all')],
      itsmTicketTab: ['all'],
      itsmTicketSearch: [''],
      itsmTicketState: [''],
      itsmTicketPriority: [''],
      itsmTicketType: ['all'],
      itsmTicketDateRange: [[moment(itsmRange.startDate), moment(itsmRange.endDate)]],
      itsmTicketStartDate: [itsmRange.startDate],
      itsmTicketEndDate: [itsmRange.endDate],
      itsmTicketPage: [1],
      itsmTicketPerPage: [10],
      itsmTicketSortColumn: [''],
      itsmTicketSortDirection: ['']
    }, { validators: this.customTimelineRangeValidator });
  }

  getDefaultDashboardFilters(): DashboardFilters {
    return DASHBOARD_FILTERS_DUMMY;
  }

  buildHeaderData(response: DashboardHeaderApiResponse): DashboardHeader {
    return this.mapHeaderResponse(response);
  }

  buildDashboardFilters(response?: DashboardFiltersApiResponse): DashboardFilters {
    return this.mapDashboardFiltersResponse(response);
  }

  getHeaderTextData(): Observable<DashboardHeaderApiResponse> {
    // return of(DASHBOARD_HEADER_API_DUMMY);
    return this.http.get<DashboardHeaderApiResponse>(EVENT_ANALYTICS_TOP_HEADER_ENDPOINT);
  }

  getDashboardFilters(): Observable<DashboardFiltersApiResponse> {
    // return of(DASHBOARD_TOP_FILTERS_API_DUMMY);
    return this.http.get<DashboardFiltersApiResponse>(EVENT_ANALYTICS_DASHBOARD_FILTERS_ENDPOINT);
  }

  getSummary(criteria: DashboardFilterCriteria): Observable<ExecutiveSummaryApiResponse> {
    // return of(EXECUTIVE_SUMMARY_API_DUMMY);
    return this.http.post<ExecutiveSummaryApiResponse>(EVENT_ANALYTICS_SUMMARY_ENDPOINT, {}, this.getRequestOptions(criteria));
  }

  getEventPipeline(criteria: DashboardFilterCriteria): Observable<PipelineApiResponse> {
    // return of(PIPELINE_API_DUMMY);
    return this.http.post<PipelineApiResponse>(EVENT_ANALYTICS_PIPELINE_ENDPOINT, {}, this.getRequestOptions(criteria));
  }

  getEventByDeviceCategory(criteria: DashboardFilterCriteria): Observable<EventByDeviceTypeApiResponse> {
    // return of(EVENT_BY_DEVICE_TYPE_API_DUMMY);
    return this.http.post<EventByDeviceTypeApiResponse>(EVENT_ANALYTICS_EVENT_BY_DEVICE_CATEGORY_ENDPOINT, {}, this.getRequestOptions(criteria, {
      event_by_device_type_category: criteria?.eventDeviceCategory
    }));
  }

  getAlertsGenerated(criteria: DashboardFilterCriteria): Observable<AlertWidgetApiResponse> {
    // return of(ALERT_GENERATED_DUMMY);
    return this.http.post<AlertWidgetApiResponse>(EVENT_ANALYTICS_ALERT_GENERATED_ENDPOINT, {}, this.getRequestOptions(criteria));
  }

  getAlertStatus(criteria: DashboardFilterCriteria): Observable<AlertWidgetApiResponse> {
    // return of(ALERT_STATUS_DUMMY);
    return this.http.post<AlertWidgetApiResponse>(EVENT_ANALYTICS_ALERT_STATUS_ENDPOINT, {}, this.getRequestOptions(criteria));
  }

  getTrendByTimeline(criteria: DashboardFilterCriteria): Observable<TrendByTimelineApiResponse> {
    // return of(TREND_BY_TIMELINE_API_DUMMY);
    const trendTimelineParams: Record<string, string | undefined> = {
      trend_timeline: criteria?.trendTimeline
    };
    if (criteria?.trendTimeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE) {
      trendTimelineParams.trend_timeline_from = this.formatApiDate(criteria?.trendTimelineFrom);
      trendTimelineParams.trend_timeline_to = this.formatApiDate(criteria?.trendTimelineTo);
    }
    return this.http.get<TrendByTimelineApiResponse>(EVENT_ANALYTICS_TREND_BY_TIMELINE_ENDPOINT, this.getRequestOptions(criteria, trendTimelineParams, {
      alert_type: criteria?.trendAlertTypes
    }));
  }

  getAlertSegregation(criteria: DashboardFilterCriteria): Observable<AlertSegregationApiResponse> {
    // return of(ALERT_SEGREGATION_API_DUMMY);
    return this.http.get<AlertSegregationApiResponse>(EVENT_ANALYTICS_ALERT_SEGREGATION_ENDPOINT, this.getRequestOptions(criteria, {
      category: criteria?.alertSegregationCategory
    }));
  }

  getEventAlertAnalytics(criteria: DashboardFilterCriteria): Observable<EventAlertAnalyticsApiResponse> {
    // return of(EVENT_ALERT_ANALYTICS_API_DUMMY);
    const analyticsParams: Record<string, string | undefined> = {
      view_by: criteria?.analyticsViewBy,
      source_type: criteria?.analyticsSourceType,
      severity_type: criteria?.analyticsSeverityType,
      datacenter: criteria?.analyticsDatacenter,
      cloud: criteria?.analyticsCloud,
      analytics_category: criteria?.analyticsCategory,
      event_and_alert_timeline: criteria?.eventAndAlertTimeline
    };
    if (criteria?.eventAndAlertTimeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE) {
      analyticsParams.event_and_alert_timeline_from = this.formatApiDate(criteria?.eventAndAlertTimelineFrom);
      analyticsParams.event_and_alert_timeline_to = this.formatApiDate(criteria?.eventAndAlertTimelineTo);
    }
    return this.http.get<EventAlertAnalyticsApiResponse>(EVENT_ANALYTICS_EVENT_ALERT_ANALYTICS_ENDPOINT, this.getRequestOptions(criteria, analyticsParams));
  }

  getNoisyEvents(criteria: DashboardFilterCriteria, sortColumn?: NoisyTableSortColumn | '', sortDirection?: string): Observable<NoisyEventsApiResponse> {
    // return of({
    //   ...NOISY_EVENTS_API_DUMMY,
    //   rows: this.sortNoisyEventApiRows(NOISY_EVENTS_API_DUMMY.rows, sortColumn, sortDirection)
    // });
    return this.http.get<NoisyEventsApiResponse>(EVENT_ANALYTICS_NOISY_EVENTS_ENDPOINT, this.getRequestOptions(criteria, {
      category: criteria?.noisyEventsCategory,
      ordering: this.getOrderingParam(sortColumn, sortDirection)
    }));
  }

  getNoisyHosts(criteria: DashboardFilterCriteria, sortColumn?: NoisyTableSortColumn | '', sortDirection?: string): Observable<NoisyHostsApiResponse> {
    // return of({
    //   ...NOISY_HOSTS_API_DUMMY,
    //   rows: this.sortNoisyHostsApiRows(NOISY_HOSTS_API_DUMMY.rows, sortColumn, sortDirection)
    // });
    return this.http.get<NoisyHostsApiResponse>(EVENT_ANALYTICS_NOISY_HOSTS_ENDPOINT, this.getRequestOptions(criteria, {
      category: criteria?.noisyHostsCategory,
      ordering: this.getOrderingParam(this.getNoisyHostsOrderingColumn(sortColumn), sortDirection)
    }));
  }

  getIncidentAlertByDeviceType(criteria: DashboardFilterCriteria, sortColumn?: IncidentAlertTableSortColumn | '', sortDirection?: string): Observable<AlertByDeviceTypeApiResponse> {
    // return of({
    //   ...ALERT_BY_DEVICE_TYPE_API_DUMMY,
    //   rows: this.sortIncidentAlertApiRows(ALERT_BY_DEVICE_TYPE_API_DUMMY.rows, sortColumn, sortDirection)
    // });
    return this.http.post<AlertByDeviceTypeApiResponse>(EVENT_ANALYTICS_ALERT_BY_DEVICE_TYPE_ENDPOINT, {}, this.getRequestOptions(criteria, {
      alert_by_device_type_category: criteria?.incidentCategory,
      ordering: this.getOrderingParam(sortColumn, sortDirection)
    }));
  }

  getOpenIncidentTickets(criteria: DashboardFilterCriteria, sortColumn?: IncidentTicketTableSortColumn | '', sortDirection?: string): Observable<IncidentTicketApiResponse> {
    // return of({
    //   ...OPEN_INCIDENT_TICKETS_API_DUMMY,
    //   rows: this.sortIncidentTicketApiRows(OPEN_INCIDENT_TICKETS_API_DUMMY.rows, sortColumn, sortDirection)
    // });
    return this.http.get<IncidentTicketApiResponse>(EVENT_ANALYTICS_OPEN_INCIDENTS_ENDPOINT, this.getRequestOptions(criteria, {
      category: criteria?.incidentCategory,
      ordering: this.getOrderingParam(this.getIncidentTicketOrderingColumn(sortColumn), sortDirection)
    }));
  }

  getResolvedIncidentTickets(criteria: DashboardFilterCriteria, sortColumn?: IncidentTicketTableSortColumn | '', sortDirection?: string): Observable<IncidentTicketApiResponse> {
    // return of({
    //   ...RESOLVED_INCIDENT_TICKETS_API_DUMMY,
    //   rows: this.sortIncidentTicketApiRows(RESOLVED_INCIDENT_TICKETS_API_DUMMY.rows, sortColumn, sortDirection)
    // });
    return this.http.get<IncidentTicketApiResponse>(EVENT_ANALYTICS_RESOLVED_INCIDENTS_ENDPOINT, this.getRequestOptions(criteria, {
      category: criteria?.incidentCategory,
      ordering: this.getOrderingParam(this.getIncidentTicketOrderingColumn(sortColumn), sortDirection)
    }));
  }

  getItsmTicketView(criteria: DashboardFilterCriteria): Observable<ItsmTicketViewApiResponse> {
    // return of(ITSM_TICKET_VIEW_API_DUMMY);
    const params: Record<string, string | undefined> = {
      tab: criteria?.itsmTicketTab || 'all',
      search: criteria?.itsmTicketSearch,
      state: criteria?.itsmTicketState,
      priority: criteria?.itsmTicketPriority,
      type: criteria?.itsmTicketType,
      start_date: this.formatApiDay(criteria?.itsmTicketStartDate),
      end_date: this.formatApiDay(criteria?.itsmTicketEndDate),
      page: String(criteria?.itsmTicketPage || 1),
      per_page: String(criteria?.itsmTicketPerPage || 10),
      sort_column: criteria?.itsmTicketSortColumn,
      sort_direction: criteria?.itsmTicketSortDirection
    };
    return this.http.get<ItsmTicketViewApiResponse>(EVENT_ANALYTICS_ITSM_TICKET_VIEW_ENDPOINT, this.getRequestOptions(criteria, params));
  }

  convertToSummaryMetrics(data: ExecutiveSummaryApiResponse): MetricViewData[] {
    return [
      { key: 'total_inference_alerts', label: 'Total Inference Alerts', value: this.formatNumber(data?.totalInferenceAlerts) },
      { key: 'events', label: 'Events', value: this.formatNumber(data?.events) },
      { key: 'alerts', label: 'Alerts', value: this.formatNumber(data?.alerts) },
      { key: 'conditions', label: 'Conditions', value: this.formatNumber(data?.conditions) },
      { key: 'cumulative_reduction', label: 'Cumulative Reduction', value: `${this.formatNumber(data?.cumulativeReduction)}%`, tone: 'primary' }
    ];
  }

  getDefaultSummaryMetrics(): MetricViewData[] {
    return this.convertToSummaryMetrics({} as ExecutiveSummaryApiResponse);
  }

  convertToPipelineData(data: PipelineApiResponse): PipelineViewData {
    return {
      rawEvents: this.formatNumber(data?.kpis?.rawEvents),
      noiseReduction: `${this.formatPercent(data?.kpis?.noiseReduction)}%`,
      alerts: this.formatNumber((data as any)?.alerts ?? data?.funnel?.find(item => item?.stage === 'Alerts')?.count),
      correlationPct: `${this.formatPercent(data?.kpis?.correlationPct)}%`,
      conditions: this.formatNumber((data as any)?.conditions ?? data?.funnel?.find(item => item?.stage === 'Conditions')?.count)
    };
  }

  convertToDeviceCategoryCards(data: EventByDeviceTypeApiItem[]): MetricViewData[] {
    return this.getVisibleDeviceCategoryItems(data).map((item, index) => ({
      key: this.normalizeCategoryValue(item.key),
      label: this.normalizeCategoryLabel(item.key, item.label),
      value: this.formatNumber(item.count),
      tone: index % 2 ? 'success' : 'primary',
      color: this.getCategoryColor(this.normalizeCategoryValue(item.key), index)
    }));
  }

  convertToDeviceCategoryChart(data: EventByDeviceTypeApiItem[]): EChartsOption {
    const rows = this.getVisibleDeviceCategoryItems(data)
      .map((item, index) => ({
        key: this.normalizeCategoryValue(item.key),
        name: this.normalizeCategoryLabel(item.key, item.label),
        value: this.getNumber(item.count),
        color: this.getCategoryColor(this.normalizeCategoryValue(item.key), index)
      }));
    return rows.length ? this.getDonutChartOptions(rows, ['40%', '70%'], ['48%', '48%'], true) : null;
  }

  convertToMetricKpis(data: AlertMetricApiResponse[], fallbackMetrics: AlertMetricApiResponse[] = data): MetricViewData[] {
    return this.convertMetricKpisWithFallback(data, fallbackMetrics);
  }

  getDefaultAlertGeneratedMetrics(): MetricViewData[] {
    return this.convertMetricKpisWithFallback([], ALERT_GENERATED_DUMMY.kpis);
  }

  getAlertGeneratedMetricFallback(): AlertMetricApiResponse[] {
    return ALERT_GENERATED_DUMMY.kpis || [];
  }

  getDefaultAlertStatusMetrics(): MetricViewData[] {
    return this.convertMetricKpisWithFallback([], ALERT_STATUS_DUMMY.kpis);
  }

  getAlertStatusMetricFallback(): AlertMetricApiResponse[] {
    return ALERT_STATUS_DUMMY.kpis || [];
  }

  private convertMetricKpisWithFallback(data: AlertMetricApiResponse[] = [], fallbackMetrics: AlertMetricApiResponse[] = data): MetricViewData[] {
    const sourceMetrics = (fallbackMetrics?.length ? fallbackMetrics : data) || [];
    return sourceMetrics.map(metric => {
      const matchedMetric = (data || []).find(item => this.normalizeKey(item?.key) === this.normalizeKey(metric?.key));
      return {
        key: metric.key,
        label: metric.label || this.getDisplayLabel(metric.key),
        value: this.formatNumber(matchedMetric?.value),
        tone: metric.tone || matchedMetric?.tone || this.getAlertMetricTone(metric.key)
      };
    });
  }

  convertToDonutChart(data: Array<{ key?: string; label?: string; value?: number }>, radius: string[] = ['50%', '75%']): EChartsOption {
    const rows = (data || []).map((item, index) => ({
      key: item.key,
      name: item.label || this.getDisplayLabel(item.key),
      value: this.getNumber(item.value),
      color: EVENT_ANALYTICS_STATUS_COLORS[item.key] || EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length]
    })).filter(item => item.value > 0);
    return rows.length ? this.getDonutChartOptions(rows, radius, ['50%', '47%'], false) : null;
  }

  convertToTrendChartData(data: TrendByTimelineApiResponse, selectedAlertTypes?: string[]): EChartsOption {
    const selectedTypes = this.getSelectedTrendAlertTypes(selectedAlertTypes);
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

  convertToAlertSegregationSummary(data: AlertSegregationApiResponse): MetricViewData[] {
    return [
      { key: 'critical', label: 'Critical', value: this.formatNumber(data?.totalCritical), tone: 'danger' },
      { key: 'warning', label: 'Warning', value: this.formatNumber(data?.totalWarning), tone: 'warning' },
      { key: 'information', label: 'Info', value: this.formatNumber(data?.totalInfo), tone: 'info' }
    ];
  }

  getDefaultAlertSegregationMetrics(): MetricViewData[] {
    return this.convertToAlertSegregationSummary({} as AlertSegregationApiResponse);
  }

  convertToAlertSegregationChart(data: AlertSegregationApiRow[]): EChartsOption {
    const rows = (data || []).map(row => ({
      ...row,
      key: this.normalizeCategoryValue(row.key),
      label: this.normalizeCategoryLabel(row.key, row.label)
    })).filter(row => this.getAlertSegregationRowTotal(row) > 0);
    if (!rows.length) {
      return null;
    }
    const isSingleBar = rows.length === 1;
    const barWidth = isSingleBar ? 92 : rows.length <= 3 ? 38 : 22;
    const barCategoryGap = isSingleBar ? '0%' : rows.length <= 3 ? '30%' : '45%';
    const maxValue = rows.reduce((currentMax, row) => {
      const total = this.getNumber(row.critical) + this.getNumber(row.warning) + this.getNumber(row.information);
      return Math.max(currentMax, total);
    }, 0);
    const axisScale = this.getRoundedChartAxisScale(maxValue, 5);
    return {
      animation: false,
      color: [EVENT_ANALYTICS_STATUS_COLORS.critical, EVENT_ANALYTICS_STATUS_COLORS.warning, EVENT_ANALYTICS_STATUS_COLORS.information],
      grid: { left: 48, right: isSingleBar ? 48 : 20, top: 24, bottom: 58 },
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
        boundaryGap: !isSingleBar,
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
        max: axisScale.max,
        interval: axisScale.interval,
        splitNumber: 5,
        axisLabel: { color: '#7a8794', fontSize: 10 },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      series: [
        {
          name: 'Info',
          type: 'bar',
          stack: 'total',
          barWidth,
          barCategoryGap,
          itemStyle: { color: EVENT_ANALYTICS_STATUS_COLORS.information, borderWidth: 0 },
          data: rows.map(row => row.information)
        },
        {
          name: 'Warning',
          type: 'bar',
          stack: 'total',
          barWidth,
          barCategoryGap,
          itemStyle: { color: EVENT_ANALYTICS_STATUS_COLORS.warning, borderWidth: 0 },
          data: rows.map(row => row.warning)
        },
        {
          name: 'Critical',
          type: 'bar',
          stack: 'total',
          barWidth,
          barCategoryGap,
          itemStyle: { color: EVENT_ANALYTICS_STATUS_COLORS.critical, borderWidth: 0 },
          data: rows.map(row => row.critical)
        }
      ]
    };
  }

  convertToEventAlertAnalyticsMetrics(data: EventAlertAnalyticsApiResponse): MetricViewData[] {
    return this.mapEventAlertAnalyticsMetrics(data);
  }

  convertToEventAlertAnalyticsMetricGroups(data?: EventAlertAnalyticsApiResponse): { left: MetricViewData[]; right: MetricViewData[] } {
    const metrics = this.mapEventAlertAnalyticsMetrics(data || {} as EventAlertAnalyticsApiResponse);
    const leftKeys = ['cumulative_reduction', 'noise_reduction', 'correlation'];
    const rightKeys = ['mtta', 'mttr'];
    return {
      left: leftKeys.map(key => metrics.find(metric => metric.key === key) || this.getEmptyAnalyticsMetric(key)),
      right: rightKeys.map(key => metrics.find(metric => metric.key === key) || this.getEmptyAnalyticsMetric(key))
    };
  }

  convertToEventReductionSankeyOptions(data: SankeyData): EChartsOption {
    return this.convertToSankeyOptions(data, {
      left: '2%',
      right: '2%',
      top: '5%',
      bottom: '5%',
      nodeWidth: 10,
      nodeGap: 18,
      lineCurveness: 0.4
    });
  }

  convertToEventResolutionSankeyOptions(data: SankeyData): EChartsOption {
    return this.convertToSankeyOptions(data, {
      left: '2%',
      right: '2%',
      top: '5%',
      bottom: '5%',
      nodeWidth: 10,
      nodeGap: 20,
      lineCurveness: 0.4
    });
  }

  convertToEventAlertAnalyticsLeftGraphOptions(graph?: EventAlertAnalyticsGraphApiResponse): EChartsOption {
    return this.convertToEventReductionSankeyOptions(this.convertEventAlertAnalyticsGraphToSankeyData(graph, 'left'));
  }

  convertToEventAlertAnalyticsRightGraphOptions(graph?: EventAlertAnalyticsGraphApiResponse): EChartsOption {
    return this.convertToEventResolutionSankeyOptions(this.convertEventAlertAnalyticsGraphToSankeyData(graph, 'right'));
  }

  convertToSankeyOptions(data: SankeyData, configOrLeftPadding: number | any = 8): EChartsOption {
    const sankeyData = this.pruneUnusedSankeyNodes(data);
    if (!sankeyData?.nodes?.length || !sankeyData?.links?.length) {
      return null;
    }
    const sankeyConfig = typeof configOrLeftPadding === 'number'
      ? { left: configOrLeftPadding }
      : (configOrLeftPadding || {});
    const nodes = (sankeyData.nodes || []).map((node, index) => {
      const imagePath = this.getEventAlertAnalyticsNodeImage(node?.name || node?.labelText);
      const richLogoKey = imagePath ? `logo_${index}` : '';
      return {
        ...node,
        richLogoKey,
        imagePath
      };
    });
    const richStyles: any = {
      label: {
        color: '#26313b',
        fontSize: 11,
        lineHeight: 14
      }
    };
    nodes.forEach((node: any) => {
      if (node.imagePath && node.richLogoKey) {
        richStyles[node.richLogoKey] = {
          width: 66,
          height: 14,
          align: 'center',
          backgroundColor: { image: node.imagePath }
        };
      }
    });
    return {
      animation: false,
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [
        {
          type: 'sankey',
          left: sankeyConfig.left ?? 8,
          right: sankeyConfig.right ?? 10,
          top: sankeyConfig.top ?? 10,
          bottom: sankeyConfig.bottom ?? 10,
          nodeWidth: sankeyConfig.nodeWidth ?? 9,
          nodeGap: sankeyConfig.nodeGap ?? 13,
          nodeAlign: 'left',
          layoutIterations: sankeyConfig.layoutIterations ?? 32,
          draggable: false,
          emphasis: { focus: 'adjacency' },
          label: {
            color: '#26313b',
            fontSize: 11,
            lineHeight: 14,
            formatter: (params: any) => {
              const labelText = params?.data?.labelText || params?.name || '';
              const logoKey = params?.data?.richLogoKey;
              return logoKey ? `{${logoKey}|}\n{label|${labelText}}` : labelText;
            },
            rich: richStyles
          },
          lineStyle: {
            color: 'gradient',
            curveness: sankeyConfig.lineCurveness ?? 0.52,
            opacity: 0.46
          },
          data: nodes,
          links: sankeyData.links
        }
      ]
    } as EChartsOption;
  }

  convertToNoisyEventTableData(data: Array<NoisyEventsApiRow | NoisyHostsApiRow>): NoisyEventRowViewData[] {
    return (data || []).map((item: NoisyEventsApiRow) => ({
      uuid: item?.uuid || '',
      device: item?.device || 'N/A',
      deviceType: item?.deviceType || 'N/A',
      count: this.formatNumber(item?.count),
      description: item?.description || 'N/A',
      source: item?.source || 'N/A',
      lastReported: this.formatDateTime(item?.lastReported || ''),
      severity: item?.severity || 'Unknown',
      severityIcon: this.getSeverityIcon(item?.severity),
      severityClass: this.getSeverityClass(item?.severity)
    }));
  }

  convertToNoisyHostsTableData(data: NoisyHostsApiRow[]): NoisyEventRowViewData[] {
    return (data || []).map(item => ({
      uuid: '',
      device: item?.hostName || 'N/A',
      deviceType: item?.deviceType || 'N/A',
      count: this.formatNumber(item?.count),
      description: item?.description || item?.managementIp || 'N/A',
      source: item?.source || 'N/A',
      lastReported: this.formatDateTime(item?.lastReported || ''),
      severity: item?.severity || 'Unknown',
      severityIcon: this.getSeverityIcon(item?.severity),
      severityClass: this.getSeverityClass(item?.severity)
    }));
  }

  sortNoisyTableRows(
    rows: NoisyEventRowViewData[],
    sortColumn: NoisyTableSortColumn,
    sortDirection: string
  ): NoisyEventRowViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const comparison = this.compareNoisyTableValues(left, right, sortColumn);
      return comparison * directionMultiplier;
    });
  }

  private sortNoisyEventApiRows(
    rows: NoisyEventsApiRow[],
    sortColumn?: NoisyTableSortColumn | '',
    sortDirection?: string
  ): NoisyEventsApiRow[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'count':
          comparison = this.getNumber(left?.count) - this.getNumber(right?.count);
          break;
        case 'lastReported':
          comparison = this.getDateSortValue(left?.lastReported) - this.getDateSortValue(right?.lastReported);
          break;
        case 'severity':
          comparison = this.getSeverityRank(left?.severity) - this.getSeverityRank(right?.severity);
          if (!comparison) {
            comparison = this.compareStrings(left?.severity, right?.severity);
          }
          break;
        case 'source':
          comparison = this.compareStrings(left?.source, right?.source);
          break;
        case 'deviceType':
          comparison = this.compareStrings(left?.deviceType, right?.deviceType);
          break;
        default:
          comparison = this.compareStrings(left?.device, right?.device);
      }
      return comparison * directionMultiplier;
    });
  }

  private sortNoisyHostsApiRows(
    rows: NoisyHostsApiRow[],
    sortColumn?: NoisyTableSortColumn | '',
    sortDirection?: string
  ): NoisyHostsApiRow[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'count':
          comparison = this.getNumber(left?.count) - this.getNumber(right?.count);
          break;
        case 'lastReported':
          comparison = this.getDateSortValue(left?.lastReported) - this.getDateSortValue(right?.lastReported);
          break;
        case 'severity':
          comparison = this.getSeverityRank(left?.severity) - this.getSeverityRank(right?.severity);
          if (!comparison) {
            comparison = this.compareStrings(left?.severity, right?.severity);
          }
          break;
        case 'source':
          comparison = this.compareStrings(left?.source, right?.source);
          break;
        case 'deviceType':
          comparison = this.compareStrings(left?.deviceType, right?.deviceType);
          break;
        default:
          comparison = this.compareStrings(left?.hostName, right?.hostName);
      }
      return comparison * directionMultiplier;
    });
  }

  private sortIncidentAlertApiRows(
    rows: AlertByDeviceTypeApiResponse['rows'],
    sortColumn?: IncidentAlertTableSortColumn | '',
    sortDirection?: string
  ): AlertByDeviceTypeApiResponse['rows'] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const comparison = sortColumn === 'ticketCount'
        ? this.getNumber(left?.ticketCount) - this.getNumber(right?.ticketCount)
        : this.compareStrings(left?.deviceName, right?.deviceName);
      return comparison * directionMultiplier;
    });
  }

  private sortIncidentTicketApiRows(
    rows: IncidentTicketApiRow[],
    sortColumn?: IncidentTicketTableSortColumn | '',
    sortDirection?: string
  ): IncidentTicketApiRow[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'ticketId':
          comparison = this.compareStrings(left?.ticketId || left?.ticketUuid, right?.ticketId || right?.ticketUuid);
          break;
        case 'ticketCount':
          comparison = this.getNumber(left?.ticketCount) - this.getNumber(right?.ticketCount);
          break;
        case 'alertType':
          comparison = this.getSeverityRank(left?.severity) - this.getSeverityRank(right?.severity);
          if (!comparison) {
            comparison = this.compareStrings(left?.severity, right?.severity);
          }
          break;
        default:
          comparison = this.compareStrings(left?.deviceName || left?.affectedService, right?.deviceName || right?.affectedService);
      }
      return comparison * directionMultiplier;
    });
  }

  convertToNoisyHostsChart(data: NoisyHostsApiChartRow[]): EChartsOption {
    const rows = (data || []).filter(row => this.getNoisyHostsChartRowTotal(row) > 0);
    if (!rows.length) {
      return null;
    }
    return {
      animation: false,
      color: [EVENT_ANALYTICS_STATUS_COLORS.critical, EVENT_ANALYTICS_STATUS_COLORS.warning, EVENT_ANALYTICS_STATUS_COLORS.information],
      grid: { left: 10, right: 10, top: 10, bottom: 10, containLabel: true },
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
        data: rows.map(row => row.hostName),
        axisTick: { show: false },
        axisLabel: {
          color: '#6c7784',
          fontSize: 10,
          width: 110,
          overflow: 'truncate',
          hideOverlap: true 
        }
      },
      series: [
        { name: 'Critical', type: 'bar', stack: 'total', barWidth: 16, itemStyle: { borderWidth: 0 }, data: rows.map(row => row.critical) },
        { name: 'Warning', type: 'bar', stack: 'total', barWidth: 16, itemStyle: { borderWidth: 0 }, data: rows.map(row => row.warning) },
        { name: 'Information', type: 'bar', stack: 'total', barWidth: 16, itemStyle: { borderWidth: 0 }, data: rows.map(row => row.information) }
      ]
    };
  }

  convertToIncidentTicketRows(data: IncidentTicketApiRow[]): IncidentTicketViewData[] {
    return (data || []).map(row => ({
      uuid: row.uuid,
      ticketId: row.ticketId || row.ticketUuid || 'N/A',
      deviceName: row.deviceName || row.affectedService || 'N/A',
      alertType: row.severity || 'Unknown',
      tone: row.tone || this.getTicketTone(row.severity),
      ticketCount: this.getNumber(row.ticketCount),
      severityIcon: this.getSeverityIcon(row.severity),
      severityClass: this.getSeverityClass(row.severity)
    }));
  }

  public convertToIncidentAlertRows(data: AlertByDeviceTypeApiResponse['rows']): IncidentAlertByDeviceViewData[] {
    return (data || []).map(row => ({
      deviceName: row?.deviceName || 'N/A',
      critical: this.getNumber(row?.critical),
      warning: this.getNumber(row?.warning),
      information: this.getNumber((row as any)?.information ?? row?.available),
      ticketCount: this.getNumber(row?.ticketCount)
    }));
  }

  convertToItsmTicketRows(rows: ItsmTicketTableRowApiResponse[]): ItsmTicketRowViewData[] {
    return (rows || []).map(row => ({
      ticketId: row?.ticketId || 'N/A',
      shortDescription: row?.shortDescription || 'N/A',
      state: row?.state || 'N/A',
      priority: row?.priority || 'N/A',
      createdOn: this.formatDateTime(row?.createdOn),
      updatedOn: this.formatDateTime(row?.updatedOn),
      resolution: row?.resolution || 'N/A'
    }));
  }

  convertToItsmTicketTabOptions(options: SelectOption[]): SelectOption[] {
    return (options || []).map(option => ({
      value: option?.value || '',
      label: option?.label || 'N/A'
    }));
  }

  convertToItsmTicketFilterOptions(options: SelectOption[]): SelectOption[] {
    return this.convertToItsmTicketTabOptions(options);
  }

  convertToItsmTicketDonutChart(data: ItsmTicketSummaryBucketApiResponse[], colors?: string[]): EChartsOption {
    const rows = (data || []).map((item, index) => ({
      key: item?.key,
      name: item?.label || item?.key || 'N/A',
      value: this.getNumber(item?.value ?? item?.count),
      color: colors?.[index] || EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length]
    })).filter(item => item.value > 0);
    return rows.length ? this.getDonutChartOptions(rows, ['50%', '75%'], ['50%', '45%'], false) : null;
  }

  convertToItsmPriorityChart(data: ItsmTicketSummaryBucketApiResponse[]): EChartsOption {
    return this.convertToItsmTicketDonutChart(data, EVENT_ANALYTICS_ITSM_PRIORITY_COLORS);
  }

  convertToItsmStatusChart(data: ItsmTicketSummaryBucketApiResponse[]): EChartsOption {
    return this.convertToItsmTicketDonutChart(data, EVENT_ANALYTICS_ITSM_STATUS_COLORS);
  }

  convertToItsmResponseTimeChart(data: ItsmTicketSummaryBucketApiResponse[]): EChartsOption {
    return this.convertToItsmTicketDonutChart(data, EVENT_ANALYTICS_ITSM_RESPONSE_TIME_COLORS);
  }

  buildItsmTicketFilterPatch(data?: ItsmTicketViewApiResponse): Partial<DashboardFilterCriteria> {
    const startDate = data?.filters?.startDate || this.getDefaultItsmTicketRange().startDate;
    const endDate = data?.filters?.endDate || this.getDefaultItsmTicketRange().endDate;
    return {
      itsmTicketTab: data?.tab || 'all',
      itsmTicketSearch: data?.filters?.search || '',
      itsmTicketState: data?.filters?.state || '',
      itsmTicketPriority: data?.filters?.priority || '',
      itsmTicketType: data?.filters?.type || 'all',
      itsmTicketDateRange: this.getItsmTicketDateRangeValue(startDate, endDate),
      itsmTicketStartDate: startDate,
      itsmTicketEndDate: endDate,
      itsmTicketPage: data?.page || 1,
      itsmTicketPerPage: data?.perPage || 10
    };
  }

  syncItsmTicketDateRange(form: FormGroup): void {
    if (!form) {
      return;
    }
    const dateRange = form.get('itsmTicketDateRange')?.value || [];
    const [startDate, endDate] = dateRange || [];
    form.patchValue({
      itsmTicketStartDate: this.formatApiDay(startDate),
      itsmTicketEndDate: this.formatApiDay(endDate)
    }, { emitEvent: false });
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

  private mapHeaderResponse(res: DashboardHeaderApiResponse): DashboardHeader {
    const scopeText = [res?.scope?.sources, res?.scope?.deviceTypes].filter(label => !!label).join(' - ');
    return {
      lastRefreshed: res?.lastRefreshed || '',
      scopeText: scopeText || ''
    };
  }

  private mapDashboardFiltersResponse(res?: DashboardFiltersApiResponse): DashboardFilters {
    const timeRange = this.buildTimeRangeOptions( EVENT_ANALYTICS_TIME_RANGE_OPTIONS);
    const trendTimeline = this.buildTimeRangeOptions(timeRange);
    const eventAndAlertTimeline = this.buildTimeRangeOptions(timeRange);
    const category = this.getCategoryOptions();
    return {
      timeRange,
      trendTimeline,
      category,
      eventDeviceCategory: category,
      alertSegregationCategory: category,
      analyticsViewBy: DASHBOARD_FILTERS_DUMMY.analyticsViewBy,
      analyticsSourceType: DASHBOARD_FILTERS_DUMMY.analyticsSourceType,
      analyticsSeverityType: DASHBOARD_FILTERS_DUMMY.analyticsSeverityType,
      analyticsDatacenter: DASHBOARD_FILTERS_DUMMY.analyticsDatacenter,
      analyticsCloud: DASHBOARD_FILTERS_DUMMY.analyticsCloud,
      analyticsCategory: category,
      eventAndAlertTimeline,
      noisyEventsCategory: category,
      noisyHostsCategory: category,
      incidentCategory: category
    };
  }

  private mapEventAlertAnalyticsMetrics(payload: any): MetricViewData[] {
    if (Array.isArray(payload?.metrics)) {
      return payload.metrics.map((metric: any) => ({
        key: metric?.key || this.normalizeKey(metric?.label || metric?.name || ''),
        label: metric?.label || metric?.name || 'N/A',
        value: String(metric?.value ?? '0'),
        tone: metric?.tone || metric?.status || 'primary'
      }));
    }
    const kpis = payload?.kpis || {};
    return [
      { key: 'cumulative_reduction', label: 'Cumulative Reduction', value: String(kpis?.cumulativeReduction ?? '0%'), tone: 'primary' },
      { key: 'noise_reduction', label: 'Noise Reduction', value: String(kpis?.noiseReduction ?? '0%'), tone: 'primary' },
      { key: 'correlation', label: 'Correlation', value: String(kpis?.correlation ?? '0%'), tone: 'primary' },
      { key: 'mtta', label: 'MTTA', value: String(kpis?.mtta ?? '0'), tone: 'primary' },
      { key: 'mttr', label: 'MTTR', value: String(kpis?.mttr ?? '0'), tone: 'primary' }
    ];
  }

  private convertEventAlertAnalyticsGraphToSankeyData(graph: EventAlertAnalyticsGraphApiResponse | undefined, side: 'left' | 'right'): SankeyData {
    if (!graph?.nodes?.length) {
      return { nodes: [], links: [] };
    }
    const nodeMap = new Map<number, EventAlertAnalyticsGraphNodeApiResponse>();
    const nodes = (graph.nodes || []).map((node, index) => {
      nodeMap.set(node.id, node);
      const color = this.getEventAlertAnalyticsGraphNodeColor(node.name, index, side);
      return {
        name: node.name,
        labelText: this.getEventAlertAnalyticsGraphLabel(node.name, node.value),
        itemStyle: { color },
        label: this.getEventAlertAnalyticsGraphLabelConfig(node.name, side)
      };
    });
    const links: any[] = (graph.links || []).reduce((acc: any[], link: EventAlertAnalyticsGraphLinkApiResponse) => {
      const sourceNode = nodeMap.get(link.sourceId);
      const targetNode = nodeMap.get(link.targetId);
      const linkValue = this.getNumber(link.value);
      if (!sourceNode || !targetNode || linkValue <= 0) {
        return acc;
      }
      const sourceColor = this.getEventAlertAnalyticsGraphNodeColor(sourceNode.name, 0, side);
      acc.push({
        source: sourceNode.name,
        target: targetNode.name,
        value: linkValue,
        lineStyle: { color: this.hexToRgba(sourceColor, 0.24), opacity: 0.55 }
      });
      return acc;
    }, []);
    return this.pruneUnusedSankeyNodes({ nodes, links });
  }

  buildEventAlertAnalyticsReductionFlow(payload: EventAlertAnalyticsApiResponse, selectedView?: string): SankeyData {
    const flow: Partial<EventAlertAnalyticsApiResponse['flow']> = payload?.flow || {};
    const viewBy = selectedView || payload?.viewBy || 'source';
    const fallbackEventCountFromSources = (flow?.sources || []).reduce((sum, source) => {
      return sum + this.getNumber(source?.flowValue ?? source?.eventCount);
    }, 0);
    const eventCount = this.getNumber(flow?.events) || fallbackEventCountFromSources || this.getNumber(payload?.total);
    const alertCount = this.getNumber(flow?.alerts ?? payload?.total);
    const dedupeCount = this.getNumber(flow?.dedupeEvents);
    const suppressedCount = this.getNumber(flow?.suppressedEvents);
    const conditionsCount = this.getNumber(flow?.conditions);
    const ticketGeneratedCount = this.getNumber(flow?.ticketGenerated);
    const noTicketGeneratedCount = this.getNumber(flow?.noTicketGenerated);
    const rows = payload?.rows || [];
    const nodes: any[] = [];
    const links: any[] = [];
    const bridgeNodeName = 'reduction_events';

    const sourceRows = (flow?.sources || []).map((source: EventAlertAnalyticsFlowSourceApiResponse, index: number) => ({
      key: this.normalizeKey(source?.name || source?.label || `source_${index}`),
      label: source?.name || source?.label || 'N/A',
      count: this.getNumber(source?.eventCount),
      flowValue: this.getNumber(source?.flowValue ?? source?.eventCount),
      color: source?.color || EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length]
    })).filter(item => item.count > 0 && item.flowValue > 0);

    if (sourceRows.length) {
      sourceRows.forEach(item => {
        nodes.push({
          name: `${viewBy}_${item.key}`,
          labelText: `${item.label}\n(${this.formatNumber(item.count)})`,
          itemStyle: { color: item.color },
          label: { position: 'right', width: 84, overflow: 'break', align: 'left' }
        });
        links.push({
          source: `${viewBy}_${item.key}`,
          target: bridgeNodeName,
          value: item.flowValue,
          lineStyle: { color: this.hexToRgba(item.color, 0.25), opacity: 0.55 }
        });
      });
    } else if (viewBy === 'severity') {
      const severityRows = (rows || []).map((row: any) => ({
        key: row?.key || this.normalizeKey(row?.label || ''),
        label: row?.label || row?.key || 'N/A',
        count: this.getNumber(row?.count ?? row?.value),
        color: EVENT_ANALYTICS_STATUS_COLORS[row?.key] || EVENT_ANALYTICS_STATUS_COLORS[this.normalizeKey(row?.tone || '')] || EVENT_ANALYTICS_STATUS_COLORS[this.normalizeKey(row?.label || '')] || EVENT_ANALYTICS_STATUS_COLORS.info
      })).filter(item => item.count > 0);
      const severityTotal = severityRows.reduce((sum, item) => sum + item.count, 0) || 1;
      severityRows.forEach(item => {
        const scaledValue = eventCount > 0 ? Math.round((item.count / severityTotal) * eventCount) : item.count;
        nodes.push({
          name: `severity_${item.key}`,
          labelText: `${item.label} (${this.formatNumber(item.count)})`,
          itemStyle: { color: item.color },
          label: { position: 'right', width: 94, overflow: 'break', align: 'left' }
        });
        links.push({
          source: `severity_${item.key}`,
          target: bridgeNodeName,
          value: Math.max(scaledValue, 1),
          lineStyle: { color: this.hexToRgba(item.color, 0.28), opacity: 0.55 }
        });
      });
    } else {
      (rows || []).forEach((row: any, index: number) => {
        const rowLabel = row?.label || row?.key || 'N/A';
        const rowCount = this.getNumber(row?.total ?? row?.count ?? row?.value);
        const rowColor = EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length];
        if (rowCount <= 0) {
          return;
        }
        nodes.push({
          name: `source_${this.normalizeKey(rowLabel)}`,
          labelText: `${rowLabel}\n(${this.formatNumber(rowCount)})`,
          itemStyle: { color: rowColor },
          label: { position: 'right', width: 84, overflow: 'break', align: 'left' }
        });
        links.push({
          source: `source_${this.normalizeKey(rowLabel)}`,
          target: bridgeNodeName,
          value: rowCount,
          lineStyle: { color: this.hexToRgba(rowColor, 0.25), opacity: 0.55 }
        });
      });
    }

    nodes.push(
      {
        name: bridgeNodeName,
        labelText: `Events ${this.formatNumber(eventCount)}`,
        itemStyle: { color: '#39c8c7' },
        label: { position: 'inside', width: 64, overflow: 'truncate', align: 'left' }
      },
      {
        name: 'reduction_alerts',
        labelText: `Alerts ${this.formatNumber(alertCount)}`,
        itemStyle: { color: '#6e56c7' },
        label: { position: 'right', width: 82, overflow: 'truncate', align: 'left' }
      },
      {
        name: 'reduction_dedupe',
        labelText: `Dedupe Events\n${this.formatNumber(dedupeCount)}`,
        itemStyle: { color: '#c8c1f0' },
        label: { position: 'right', width: 86, overflow: 'break', align: 'left' }
      },
      {
        name: 'reduction_suppressed',
        labelText: `Suppressed\nEvents ${this.formatNumber(suppressedCount)}`,
        itemStyle: { color: '#c8c1f0' },
        label: { position: 'right', width: 92, overflow: 'break', align: 'left' }
      },
      {
        name: 'reduction_conditions',
        labelText: `Conditions ${this.formatNumber(conditionsCount)}`,
        itemStyle: { color: '#6b6f73' },
        label: { position: 'right', width: 86, overflow: 'truncate', align: 'left' }
      },
      {
        name: 'reduction_ticket_generated',
        labelText: viewBy === 'severity'
          ? `Root Cause\nIdentified\n${this.formatNumber(ticketGeneratedCount)}`
          : `Ticket\nGenerated\n${this.formatNumber(ticketGeneratedCount)}`,
        itemStyle: { color: '#59c798' },
        label: { position: 'right', width: 72, overflow: 'break', align: 'left' }
      },
      {
        name: 'reduction_no_ticket_generated',
        labelText: viewBy === 'severity'
          ? `Root Cause\nUnknown\n${this.formatNumber(noTicketGeneratedCount)}`
          : `No Ticket\nGenerated\n${this.formatNumber(noTicketGeneratedCount)}`,
        itemStyle: { color: '#e59095' },
        label: { position: 'right', width: 76, overflow: 'break', align: 'left' }
      }
    );

    this.pushSankeyLink(links, bridgeNodeName, 'reduction_alerts', alertCount, '#d8c8f6');
    this.pushSankeyLink(links, bridgeNodeName, 'reduction_dedupe', dedupeCount, '#e3ddfb');
    this.pushSankeyLink(links, bridgeNodeName, 'reduction_suppressed', suppressedCount, '#ead8ea');
    this.pushSankeyLink(links, 'reduction_alerts', 'reduction_conditions', conditionsCount, '#d1ebdf');
    this.pushSankeyLink(links, 'reduction_conditions', 'reduction_ticket_generated', ticketGeneratedCount, '#d6efe2');
    this.pushSankeyLink(links, 'reduction_conditions', 'reduction_no_ticket_generated', noTicketGeneratedCount, '#f0d5d8');

    return this.pruneUnusedSankeyNodes({
      nodes,
      links
    });
  }

  buildEventAlertAnalyticsResolutionFlow(payload: EventAlertAnalyticsApiResponse): SankeyData {
    const flow: Partial<EventAlertAnalyticsApiResponse['flow']> = payload?.flow || {};
    const conditionCount = this.getNumber(flow?.resolutionCondition ?? flow?.conditions);
    const openCount = this.getNumber(flow?.open);
    const resolvedCount = this.getNumber(flow?.resolved);
    const acknowledgedCount = this.getNumber(flow?.acknowledged);
    const autoHealedCount = this.getNumber(flow?.autoHealed);
    const autoRemediatedCount = this.getNumber(flow?.autoRemediated);
    const nodes: any[] = [
      {
        name: 'resolution_condition',
        labelText: `Condition ${this.formatNumber(conditionCount)}`,
        itemStyle: { color: '#39c8c7' },
        label: { position: 'inside', width: 84, overflow: 'truncate', align: 'left' }
      },
      {
        name: 'resolution_open',
        labelText: `Open ${this.formatNumber(openCount)}`,
        itemStyle: { color: '#6e56c7' },
        label: { position: 'right', width: 68, overflow: 'truncate', align: 'left' }
      },
      {
        name: 'resolution_resolved',
        labelText: `Resolved ${this.formatNumber(resolvedCount)}`,
        itemStyle: { color: '#6e56c7' },
        label: { position: 'inside', width: 76, overflow: 'truncate', align: 'left' }
      },
      {
        name: 'resolution_acknowledged',
        labelText: `Acknowledged\n${this.formatNumber(acknowledgedCount)}`,
        itemStyle: { color: '#f3b7be' },
        label: { position: 'inside', width: 92, overflow: 'break', align: 'left' }
      },
      {
        name: 'resolution_auto_healed',
        labelText: `Auto Healed\n${this.formatNumber(autoHealedCount)}`,
        itemStyle: { color: '#f3b7be' },
        label: { position: 'inside', width: 92, overflow: 'break', align: 'left' }
      },
      {
        name: 'resolution_auto_remediated',
        labelText: `Auto\nRemediation\n${this.formatNumber(autoRemediatedCount)}`,
        itemStyle: { color: '#f3b7be' },
        label: { position: 'inside', width: 92, overflow: 'break', align: 'left' }
      }
    ];
    const links: any[] = [];

    this.pushSankeyLink(links, 'resolution_condition', 'resolution_open', openCount, '#d9d0f6');
    this.pushSankeyLink(links, 'resolution_condition', 'resolution_resolved', resolvedCount, '#bfe8ef');
    this.pushSankeyLink(links, 'resolution_resolved', 'resolution_acknowledged', acknowledgedCount, '#f2d2d9');
    this.pushSankeyLink(links, 'resolution_resolved', 'resolution_auto_healed', autoHealedCount, '#dbd1f7');
    this.pushSankeyLink(links, 'resolution_resolved', 'resolution_auto_remediated', autoRemediatedCount, '#f5d6da');

    [
      { nodeName: 'resolution_acknowledged', count: acknowledgedCount, keyPrefix: 'ack' },
      { nodeName: 'resolution_auto_healed', count: autoHealedCount, keyPrefix: 'healed' },
      { nodeName: 'resolution_auto_remediated', count: autoRemediatedCount, keyPrefix: 'remediation' }
    ].forEach(item => {
      const splits = this.splitIntoResolutionBuckets(item.count);
      [
        { key: `${item.keyPrefix}_5_min`, label: `5 Min : ${this.formatNumber(splits[0])}`, value: splits[0], color: '#24a864' },
        { key: `${item.keyPrefix}_30_min`, label: `30 Min : ${this.formatNumber(splits[1])}`, value: splits[1], color: '#ff8a00' },
        { key: `${item.keyPrefix}_gt_30_min`, label: `> 30 Min : ${this.formatNumber(splits[2])}`, value: splits[2], color: '#d90000' }
      ].forEach(bucket => {
        if (bucket.value <= 0) {
          return;
        }
        nodes.push({
          name: bucket.key,
          labelText: bucket.label,
          itemStyle: { color: bucket.color },
          label: { position: 'right', width: 72, overflow: 'truncate', align: 'left' }
        });
        links.push({
          source: item.nodeName,
          target: bucket.key,
          value: bucket.value,
          lineStyle: { color: this.hexToRgba(bucket.color, 0.24), opacity: 0.55 }
        });
      });
    });

    return this.pruneUnusedSankeyNodes({
      nodes,
      links
    });
  }

  private pushSankeyLink(links: any[], source: string, target: string, value: number, color: string) {
    if (!source || !target || value <= 0) {
      return;
    }
    links.push({
      source,
      target,
      value,
      lineStyle: { color, opacity: 0.55 }
    });
  }

  private splitIntoResolutionBuckets(total: number): number[] {
    if (total <= 0) {
      return [0, 0, 0];
    }
    const first = Math.round(total * 0.39);
    const second = Math.round(total * 0.36);
    const third = Math.max(total - first - second, 0);
    return [first, second, third];
  }

  getTimeRangeOptions(options?: SelectOption[]): SelectOption[] {
    return this.buildTimeRangeOptions(options);
  }

  getTrendAlertTypeOptions(options?: SelectOption[], fallback: SelectOption[] = EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS): SelectOption[] {
    const normalizedOptions = (options || [])
      .map(option => this.normalizeTrendAlertTypeOption(option))
      .filter((option): option is SelectOption => !!option?.value);
    return normalizedOptions.length ? normalizedOptions : fallback;
  }

  getActiveTrendAlertTypes(
    activeEntityType?: string | string[],
    options?: SelectOption[],
    fallback?: string[]
  ): string[] {
    const availableOptions = this.getTrendAlertTypeOptions(options);
    const validTypes = availableOptions
      .map(option => option?.value)
      .filter(value => !!value && value !== 'all');
    const normalizedActiveValues = (Array.isArray(activeEntityType) ? activeEntityType : [activeEntityType])
      .map(value => this.normalizeTrendAlertTypeValue(value))
      .filter(value => !!value);

    if (normalizedActiveValues.includes('all')) {
      return validTypes;
    }

    const matchedValues = normalizedActiveValues.filter(value => validTypes.includes(value));
    if (matchedValues.length) {
      return matchedValues;
    }

    const fallbackValues = this.getSelectedTrendAlertTypes(fallback, availableOptions);
    return fallbackValues.length ? fallbackValues : validTypes;
  }

  getCategoryOptions(options?: SelectOption[], fallback: SelectOption[] = EVENT_ANALYTICS_CATEGORY_OPTIONS): SelectOption[] {
    const normalizedOptions = (options || []).map(option => this.normalizeCategoryOption(option)).filter(option => !!option.value);
    return normalizedOptions.length ? normalizedOptions : fallback;
  }

  getActiveCategory(activeCategory?: string | string[], fallback?: string): string {
    if (Array.isArray(activeCategory)) {
      return this.normalizeCategoryValue(activeCategory[0] || fallback || '');
    }
    return this.normalizeCategoryValue(activeCategory || fallback || '');
  }

  getActiveTimeRange(activeTimeRange?: string, fallback?: string): string {
    return this.normalizeTimeRangeValue(activeTimeRange) || fallback || '';
  }

  private buildTimeRangeOptions(options?: SelectOption[]): SelectOption[] {
    const normalizedOptions = (options || []).map(option => ({
      value: this.normalizeTimeRangeValue(option?.value),
      label: this.normalizeTimeRangeLabel(option?.value, option?.label)
    })).filter(option => !!option.value);
    if (!normalizedOptions.some(option => option.value === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE)) {
      normalizedOptions.push({
        value: EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE,
        label: 'Custom'
      });
    }
    return normalizedOptions;
  }

  private getDefaultOptionValue(options: SelectOption[], preferredValue?: string): string {
    const availableOptions = options || [];
    const preferredOption = availableOptions.find(option => option.value === preferredValue);
    return preferredOption?.value || availableOptions[0]?.value || '';
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
    if (value == null || value === '') {
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

  private formatApiDay(value?: Date | string): string | undefined {
    const date = moment(value);
    return date.isValid() ? date.format('YYYY-MM-DD') : undefined;
  }

  private getDefaultCustomTimelineRange(): { from: Date; to: Date } {
    return {
      from: moment().subtract(24, 'hours').toDate(),
      to: moment().toDate()
    };
  }

  private getDefaultItsmTicketRange(): { startDate: string; endDate: string } {
    return {
      startDate: moment().subtract(14, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD')
    };
  }

  private getItsmTicketDateRangeValue(startDate?: string, endDate?: string): any[] {
    const start = moment(startDate);
    const end = moment(endDate);
    if (!start.isValid() || !end.isValid()) {
      return [];
    }
    return [start, end];
  }

  private customTimelineRangeValidator(control: AbstractControl): ValidationErrors | null {
    const errors: ValidationErrors = {};
    const timeline = control.get('timeline')?.value;
    const trendTimeline = control.get('trendTimeline')?.value;
    const eventAndAlertTimeline = control.get('eventAndAlertTimeline')?.value;
    const isTimelineInvalid = timeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE &&
      EventAnalyticsDashboardService.isSameOrAfterRange(control.get('timelineFrom')?.value, control.get('timelineTo')?.value);
    const isTrendTimelineInvalid = trendTimeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE &&
      EventAnalyticsDashboardService.isSameOrAfterRange(control.get('trendTimelineFrom')?.value, control.get('trendTimelineTo')?.value);
    const isEventAndAlertTimelineInvalid = eventAndAlertTimeline === EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE &&
      EventAnalyticsDashboardService.isSameOrAfterRange(control.get('eventAndAlertTimelineFrom')?.value, control.get('eventAndAlertTimelineTo')?.value);
    if (isTimelineInvalid) {
      errors.timelineFromSameAsOrAfterTo = true;
    }
    if (isTrendTimelineInvalid) {
      errors.trendTimelineFromSameAsOrAfterTo = true;
    }
    if (isEventAndAlertTimelineInvalid) {
      errors.eventAndAlertTimelineFromSameAsOrAfterTo = true;
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

  private getSelectedTrendAlertTypes(values?: any[], options: SelectOption[] = EVENT_ANALYTICS_TREND_ALERT_TYPE_OPTIONS): string[] {
    const validTypes = options
      .map(option => this.normalizeTrendAlertTypeValue(option?.value))
      .filter(value => !!value && value !== 'all');
    if (!values) {
      return validTypes;
    }
    return values
      .map(value => this.normalizeTrendAlertTypeValue(typeof value === 'string' ? value : value?.value))
      .filter(value => validTypes.indexOf(value) > -1);
  }

  private normalizeTrendAlertTypeOption(option?: SelectOption): SelectOption | null {
    const value = this.normalizeTrendAlertTypeValue(option?.value);
    if (!value) {
      return null;
    }
    return {
      value,
      label: this.normalizeTrendAlertTypeLabel(value, option?.label)
    };
  }

  private normalizeTrendAlertTypeValue(value?: string): string {
    const normalizedValue = this.normalizeKey(value || '');
    if (!normalizedValue) {
      return '';
    }
    if (normalizedValue === 'all') {
      return 'all';
    }
    if (normalizedValue === 'alert') {
      return 'alerts';
    }
    if (normalizedValue === 'condition') {
      return 'conditions';
    }
    if (normalizedValue === 'event') {
      return 'events';
    }
    return normalizedValue;
  }

  private normalizeTrendAlertTypeLabel(value?: string, label?: string): string {
    const normalizedValue = this.normalizeTrendAlertTypeValue(value);
    if (normalizedValue === 'all') {
      return label || 'All';
    }
    if (normalizedValue === 'alerts') {
      return label || 'Alerts';
    }
    if (normalizedValue === 'conditions') {
      return label || 'Conditions';
    }
    if (normalizedValue === 'events') {
      return label || 'Events';
    }
    return label || this.getDisplayLabel(normalizedValue);
  }

  private getEventAlertAnalyticsNodeImage(name?: string): string {
    const key = this.normalizeKey(name || '');
    if (!key) {
      return '';
    }
    if (key.indexOf('unityonecloud') > -1) {
      return EVENT_ALERT_ANALYTICS_NODE_IMAGE_MAP.unityonecloud;
    }
    if (key.indexOf('logicmonitor') > -1) {
      return EVENT_ALERT_ANALYTICS_NODE_IMAGE_MAP.logicmonitor;
    }
    if (key.indexOf('opsramp') > -1) {
      return EVENT_ALERT_ANALYTICS_NODE_IMAGE_MAP.opsramp;
    }
    if (key.indexOf('dynatrace') > -1) {
      return EVENT_ALERT_ANALYTICS_NODE_IMAGE_MAP.dynatrace;
    }
    if (key.indexOf('new_relic') > -1 || key.indexOf('newrelic') > -1) {
      return EVENT_ALERT_ANALYTICS_NODE_IMAGE_MAP.newrelic;
    }
    return '';
  }

  private getEventAlertAnalyticsGraphLabel(name: string, value: number): string {
    const label = name || 'N/A';
    const formattedValue = this.formatNumber(value);
    switch (this.normalizeKey(name)) {
      case 'ticket_generated':
        return `Ticket\nGenerated\n${formattedValue}`;
      case 'no_ticket_generated':
        return `No Ticket\nGenerated\n${formattedValue}`;
      case 'root_cause_identified':
        return `Root Cause\nIdentified\n${formattedValue}`;
      case 'root_cause_unknown':
        return `Root Cause\nUnknown\n${formattedValue}`;
      case 'dedupe_events':
        return `Dedupe Events\n${formattedValue}`;
      case 'suppressed_events':
        return `Suppressed Events\n${formattedValue}`;
      case 'auto_healed':
        return `Auto Healed\n${formattedValue}`;
      case 'auto_remediation':
        return `Auto Remediation\n${formattedValue}`;
      case '5_min':
      case '30_min':
      case '>30_min':
        return `${label} : ${formattedValue}`;
      default:
        return `${label} ${formattedValue}`;
    }
  }

  private getEventAlertAnalyticsGraphLabelConfig(name: string, side: 'left' | 'right'): { position: string; width: number; overflow: string; align: string } {
    const key = this.normalizeKey(name);
    const insideLeftKeys = ['events', 'conditions', 'condition', 'resolved', 'acknowledged', 'auto_healed', 'auto_remediation'];
    const insideRightKeys = ['open'];
    const isInside = insideLeftKeys.indexOf(key) > -1 || (side === 'right' && insideRightKeys.indexOf(key) > -1);
    return {
      position: isInside ? 'inside' : 'right',
      width: side === 'right' ? 88 : 92,
      overflow: 'break',
      align: 'left'
    };
  }

  private getEventAlertAnalyticsGraphNodeColor(name: string, index: number, side: 'left' | 'right'): string {
    const key = this.normalizeKey(name);
    const leftColorMap: Record<string, string> = {
      critical: EVENT_ANALYTICS_STATUS_COLORS.critical,
      warning: EVENT_ANALYTICS_STATUS_COLORS.warning,
      information: EVENT_ANALYTICS_STATUS_COLORS.information,
      unity: '#38c2a4',
      zabbix: '#2f80d1',
      dynatrace: '#7b61d0',
      logicmonitor: '#315fbd',
      new_relic: '#24a864',
      newrelic: '#24a864',
      opsramp: '#ef7aa9',
      vcenter: '#f4bf4f',
      aws: '#f39a2f',
      azure: '#58b8d8',
      events: '#39c8c7',
      alerts: '#6e56c7',
      dedupe_events: '#c8c1f0',
      suppressed_events: '#c8c1f0',
      conditions: '#6b6f73',
      ticket_generated: '#59c798',
      no_ticket_generated: '#e59095',
      root_cause_identified: '#59c798',
      root_cause_unknown: '#e59095'
    };
    const rightColorMap: Record<string, string> = {
      condition: '#39c8c7',
      conditions: '#39c8c7',
      open: '#6e56c7',
      resolved: '#6e56c7',
      acknowledged: '#f3b7be',
      auto_healed: '#f3b7be',
      auto_remediation: '#f3b7be',
      '5_min': '#24a864',
      '30_min': '#ff8a00',
      '>30_min': '#d90000'
    };
    const palette = side === 'right' ? rightColorMap : leftColorMap;
    return palette[key] || EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length];
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
        data: items.map(item => item.name),
        type: 'scroll'
      },
      series: [
        {
          type: 'pie',
          roseType: 'radius',
          radius,
          center,
          minAngle: 8,
          top: 5,
          bottom: 14,
          avoidLabelOverlap: true,
          label: {
            show: true,
            color: '#4d5965',
            fontSize: 10,
            formatter: '{c}',
            // width: 120,
            // overflow: 'truncate',
          },
          labelLine: {
            length: 14,
            length2: 12,
            lineStyle: { color: '#8da0b4' },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            borderType: 'solid',
            borderRadius: 2
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
      smooth: 0.22,
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
    if (!key) {
      return 'fa-question-circle';
    }
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
    if (!key) {
      return 'text-muted';
    }
    if (key.includes('critical')) {
      return 'text-danger';
    }
    if (key.includes('warning')) {
      return 'text-warning';
    }
    return 'text-primary';
  }

  private compareNoisyTableValues(
    left: NoisyEventRowViewData,
    right: NoisyEventRowViewData,
    sortColumn: NoisyTableSortColumn
  ): number {
    switch (sortColumn) {
      case 'count':
        return this.getNumber(left?.count) - this.getNumber(right?.count);
      case 'lastReported': {
        const leftDate = moment(left?.lastReported, 'MMM DD, YYYY, HH:mm:ss', true);
        const rightDate = moment(right?.lastReported, 'MMM DD, YYYY, HH:mm:ss', true);
        const leftValue = leftDate.isValid() ? leftDate.valueOf() : -1;
        const rightValue = rightDate.isValid() ? rightDate.valueOf() : -1;
        return leftValue - rightValue;
      }
      case 'severity': {
        const leftRank = this.getSeverityRank(left?.severity);
        const rightRank = this.getSeverityRank(right?.severity);
        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }
        return this.compareStrings(left?.severity, right?.severity);
      }
      default:
        return this.compareStrings(left?.[sortColumn], right?.[sortColumn]);
    }
  }

  private compareStrings(left?: string, right?: string): number {
    return String(left || '').localeCompare(String(right || ''), undefined, {
      sensitivity: 'base',
      numeric: true
    });
  }

  private getDateSortValue(value?: string): number {
    const parsedDate = moment(value);
    return parsedDate.isValid() ? parsedDate.valueOf() : -1;
  }

  private getSeverityRank(severity?: string): number {
    const key = this.normalizeKey(severity || '');
    if (key.includes('critical')) {
      return 0;
    }
    if (key.includes('warning')) {
      return 1;
    }
    if (key.includes('information') || key.includes('info')) {
      return 2;
    }
    return 3;
  }

  private getOrderingParam(sortColumn?: string | '', sortDirection?: string): string | undefined {
    if (!sortColumn || !sortDirection) {
      return undefined;
    }
    return sortDirection === 'asc' ? sortColumn : `-${sortColumn}`;
  }

  private getNoisyHostsOrderingColumn(sortColumn?: NoisyTableSortColumn | ''): string | undefined {
    if (sortColumn === 'device') {
      return 'hostName';
    }
    return sortColumn || undefined;
  }

  private getIncidentTicketOrderingColumn(sortColumn?: IncidentTicketTableSortColumn | ''): string | undefined {
    switch (sortColumn) {
      case 'deviceName':
        return 'affectedService';
      case 'alertType':
        return 'severity';
      default:
        return sortColumn || undefined;
    }
  }

  private normalizeKey(value: string): string {
    return String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  }

  private normalizeAlertMetricLabel(key?: string, label?: string): string {
    return label || this.getDisplayLabel(key) || 'N/A';
  }

  private getAlertMetricTone(key?: string): EventAnalyticsTone {
    const normalizedKey = this.normalizeKey(key || '');
    if (normalizedKey === 'critical' || normalizedKey === 'ticketed') {
      return 'danger';
    }
    if (normalizedKey === 'warning') {
      return 'warning';
    }
    if (normalizedKey === 'information' || normalizedKey === 'info' || normalizedKey === 'success') {
      return 'info';
    }
    if (normalizedKey === 'correlated' || normalizedKey === 'closed') {
      return 'success';
    }
    return normalizedKey === 'suppressed' ? 'info' : 'primary';
  }

  private normalizeTimeRangeValue(value?: string): string {
    switch (value) {
      case 'last_1_hour':
        return 'last_hour';
      case 'last_7_days':
        return 'last_week';
      case 'last_90_days':
        return 'last_quarter';
      default:
        return value || '';
    }
  }

  private normalizeTimeRangeLabel(value?: string, label?: string): string {
    switch (value) {
      case 'last_hour':
      case 'last_1_hour':
        return '1 Hour';
      case 'last_24_hours':
        return '24 Hour';
      case 'last_week':
      case 'last_7_days':
        return '7 Days';
      case 'last_month':
        return '30 Days';
      case 'last_60_days':
        return '60 Days';
      case 'last_quarter':
      case 'last_90_days':
        return '90 Days';
      case EVENT_ANALYTICS_CUSTOM_TIMELINE_VALUE:
        return 'Custom';
      default:
        return label || '';
    }
  }

  private normalizeCategoryOption(option?: SelectOption): SelectOption {
    const value = this.normalizeCategoryValue(option?.value);
    return {
      value,
      label: this.normalizeCategoryLabel(value, option?.label)
    };
  }

  private normalizeCategoryValue(value?: string): string {
    switch (this.normalizeKey(value || '')) {
      case 'applications':
        return 'application';
      case 'baremetal_servers':
      case 'baremetals':
        return 'baremetal';
      case 'containers':
        return 'container';
      default:
        return this.normalizeKey(value || '');
    }
  }

  private normalizeCategoryLabel(value?: string, label?: string): string {
    const normalizedValue = this.normalizeCategoryValue(value);
    const matchedOption = EVENT_ANALYTICS_CATEGORY_OPTIONS.find(option => option.value === normalizedValue);
    return matchedOption?.label || label || this.getDisplayLabel(normalizedValue) || 'N/A';
  }

  private getVisibleDeviceCategoryItems(data: EventByDeviceTypeApiItem[] = []): EventByDeviceTypeApiItem[] {
    return (data || []).filter(item => this.getNumber(item?.count) > 0);
  }

  private getAlertSegregationRowTotal(row: AlertSegregationApiRow): number {
    return this.getNumber(row?.critical) + this.getNumber(row?.warning) + this.getNumber(row?.information);
  }

  private getNoisyHostsChartRowTotal(row: NoisyHostsApiChartRow): number {
    return this.getNumber(row?.critical) + this.getNumber(row?.warning) + this.getNumber(row?.information);
  }

  private pruneUnusedSankeyNodes(data?: SankeyData): SankeyData {
    if (!data?.nodes?.length || !data?.links?.length) {
      return { nodes: [], links: [] };
    }
    const activeNodeNames = new Set<string>();
    const links = (data.links || []).filter(link => {
      const value = this.getNumber(link?.value);
      if (!link?.source || !link?.target || value <= 0) {
        return false;
      }
      activeNodeNames.add(String(link.source));
      activeNodeNames.add(String(link.target));
      return true;
    });
    const nodes = (data.nodes || []).filter(node => activeNodeNames.has(node?.name));
    return { nodes, links };
  }

  private getDisplayLabel(key?: string): string {
    const normalizedKey = this.normalizeKey(key || '');
    if (!normalizedKey) {
      return '';
    }
    return normalizedKey
      .split('_')
      .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : '')
      .join(' ');
  }

  private getRoundedChartAxisScale(maxValue: number, splitCount: number): { max: number; interval: number } {
    const safeMaxValue = this.getNumber(maxValue);
    if (safeMaxValue <= 0 || splitCount <= 0) {
      return { max: 5, interval: 1 };
    }
    const paddedMax = safeMaxValue * 1.1;
    const rawInterval = paddedMax / splitCount;
    const interval = this.getRoundedAxisInterval(rawInterval);
    return {
      max: interval * splitCount,
      interval
    };
  }

  private getRoundedAxisInterval(rawInterval: number): number {
    if (rawInterval <= 0) {
      return 1;
    }
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
    const normalized = rawInterval / magnitude;
    const steps = [1, 1.5, 2, 2.5, 5, 10];
    const matchedStep = steps.find(step => normalized <= step) || 10;
    return matchedStep * magnitude;
  }

  private hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  private getCategoryColor(key?: string, index: number = 0): string {
    return EVENT_ANALYTICS_CATEGORY_COLOR_MAP[this.normalizeKey(key || '')] || EVENT_ANALYTICS_DONUT_COLORS[index % EVENT_ANALYTICS_DONUT_COLORS.length];
  }

  private getEmptyAnalyticsMetric(key: string): MetricViewData {
    const isDurationMetric = key === 'mtta' || key === 'mttr';
    return {
      key,
      label: this.getDisplayLabel(key),
      value: isDurationMetric ? '0' : '0%',
      tone: 'primary'
    };
  }
}
