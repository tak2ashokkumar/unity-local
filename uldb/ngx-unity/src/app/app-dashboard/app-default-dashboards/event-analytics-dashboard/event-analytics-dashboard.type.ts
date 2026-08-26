export type EventAnalyticsTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'info' | string;

export interface SelectOption {
  value: string;
  label: string;
}

export type DashboardFilterOptionValue = SelectOption | string;

export interface DashboardHeaderApiResponse {
  lastRefreshed: string;
  scope: {
    sources: string;
    deviceTypes: string;
  };
  activeSources: string[];
}

export interface DashboardFiltersApiResponse {
  source: SelectOption[];
  timeRange: SelectOption[];
  deviceType: SelectOption[];
}

export interface ExecutiveSummaryApiResponse {
  totalInferenceAlerts: number;
  events: number;
  alerts: number;
  conditions: number;
  cumulativeReduction: number;
  severity: {
    critical: number;
    warning: number;
    information: number;
  };
  noiseReduction: number;
  correlationReduction: number;
}

export interface PipelineStageApiResponse {
  stage: string;
  label: string;
  count: number;
  kpi: string | null;
}

export interface PipelineApiResponse {
  funnel: PipelineStageApiResponse[];
  kpis: {
    rawEvents: number;
    noiseReduction: string;
    correlationPct: string;
  };
}

export interface EventByDeviceTypeApiItem {
  key: string;
  label: string;
  count: number;
  percentage?: number;
}

export interface CategoryFilterApiResponse {
  categoryOptions?: SelectOption[];
  activeCategory?: string | string[];
}

export interface TimeRangeFilterApiResponse {
  activeTimeRange?: string;
  timeRangeOptions?: SelectOption[];
}

export interface EventByDeviceTypeApiResponse extends CategoryFilterApiResponse {
  donut: EventByDeviceTypeApiItem[];
  tiles: EventByDeviceTypeApiItem[];
  total: number;
}

export interface AlertMetricApiResponse {
  key: string;
  label: string;
  value: number;
  tone?: EventAnalyticsTone;
}

export interface AlertWidgetApiResponse {
  kpis: AlertMetricApiResponse[];
  donut: AlertMetricApiResponse[];
}

export interface TrendByTimelineApiResponse extends TimeRangeFilterApiResponse {
  series: {
    events: TrendTimelinePoint[];
    alerts: TrendTimelinePoint[];
    conditions: TrendTimelinePoint[];
  };
  entityTypeOptions?: SelectOption[];
  activeEntityType?: string | string[];
  granularity?: string;
}

export interface AlertByDeviceTypeApiRow {
  deviceName: string;
  deviceType: string;
  critical: number;
  information: number;
  available: number;
  warning: number;
  unknown: number;
  total: number;
  ticketCount: number;
}

export interface AlertByDeviceTypeApiResponse extends CategoryFilterApiResponse {
  rows: AlertByDeviceTypeApiRow[];
}

export interface IncidentTicketApiRow {
  uuid: string;
  ticketId: string;
  ticketUuid: string;
  deviceName?: string;
  affectedService: string;
  availabilityState: string;
  ticketCount: number;
  tone: EventAnalyticsTone;
  severity: string;
  firstAlertDatetime?: string;
  resolvedDatetime?: string;
}

export interface IncidentTicketApiResponse extends CategoryFilterApiResponse {
  rows: IncidentTicketApiRow[];
  total: number;
}

export interface NoisyEventsApiRow {
  uuid: string;
  device: string;
  deviceType: string;
  count: number;
  description?: string;
  source?: string;
  lastReported?: string;
  severity?: string;
  tone?: EventAnalyticsTone;
}

export interface NoisyEventsApiResponse extends CategoryFilterApiResponse {
  rows: NoisyEventsApiRow[];
}

export interface NoisyHostsApiRow {
  hostName: string;
  deviceType: string;
  count: number;
  description?: string;
  managementIp?: string;
  source?: string;
  severity?: string;
  lastReported?: string;
}

export interface NoisyHostsApiChartRow {
  hostName: string;
  critical: number;
  warning: number;
  information: number;
}

export interface NoisyHostsApiResponse extends CategoryFilterApiResponse, TimeRangeFilterApiResponse {
  rows: NoisyHostsApiRow[];
  chart: NoisyHostsApiChartRow[];
}

export interface AlertSegregationApiRow {
  key: string;
  label: string;
  critical: number;
  warning: number;
  information: number;
}

export interface AlertSegregationApiResponse extends CategoryFilterApiResponse {
  totalCritical: number;
  totalWarning: number;
  totalInfo: number;
  bars: AlertSegregationApiRow[];
}

export interface EventAlertAnalyticsSourceRowApiResponse {
  key: string;
  label: string;
  critical: number;
  warning: number;
  information: number;
  total: number;
}

export interface EventAlertAnalyticsSeverityRowApiResponse {
  key: string;
  label: string;
  count: number;
  tone: EventAnalyticsTone;
}

export interface EventAlertAnalyticsFlowSourceApiResponse {
  name: string;
  label?: string;
  eventCount: number;
  flowValue?: number;
  color?: string;
}

export interface EventAlertAnalyticsFlowApiResponse {
  sources: EventAlertAnalyticsFlowSourceApiResponse[];
  events?: number;
  alerts: number;
  dedupeEvents: number;
  suppressedEvents: number;
  conditions: number;
  resolutionCondition?: number;
  ticketGenerated: number;
  noTicketGenerated: number;
  open: number;
  resolved: number;
  acknowledged: number;
  autoHealed: number;
  autoRemediated: number;
}

export interface EventAlertAnalyticsKpisApiResponse {
  cumulativeReduction: string;
  noiseReduction: string;
  correlation: string;
  mtta: string;
  mttr: string;
}

export interface EventAlertAnalyticsGraphNodeApiResponse {
  id: number;
  name: string;
  value: number;
}

export interface EventAlertAnalyticsGraphLinkApiResponse {
  sourceId: number;
  targetId: number;
  value: number;
}

export interface EventAlertAnalyticsGraphApiResponse {
  nodes: EventAlertAnalyticsGraphNodeApiResponse[];
  links: EventAlertAnalyticsGraphLinkApiResponse[];
}

export interface EventAlertAnalyticsApiResponse extends CategoryFilterApiResponse, TimeRangeFilterApiResponse {
  viewBy: string;
  total: number;
  rows: Array<EventAlertAnalyticsSourceRowApiResponse | EventAlertAnalyticsSeverityRowApiResponse>;
  viewOptions?: SelectOption[];
  sourceOptions?: SelectOption[];
  severityOptions?: SelectOption[];
  datacenterOptions?: SelectOption[];
  cloudOptions?: SelectOption[];
  kpis: EventAlertAnalyticsKpisApiResponse;
  flow: EventAlertAnalyticsFlowApiResponse;
  sourceGraph?: EventAlertAnalyticsGraphApiResponse;
  severityGraph?: EventAlertAnalyticsGraphApiResponse;
  rightGraph?: EventAlertAnalyticsGraphApiResponse;
}

export interface ItsmTicketSummaryBucketApiResponse {
  key: string;
  label: string;
  count: number;
  value: number;
}

export interface ItsmTicketSolvedByResponseTimeApiResponse {
  buckets: ItsmTicketSummaryBucketApiResponse[];
}

export interface ItsmTicketFiltersApiResponse {
  search: string;
  state: string;
  priority: string;
  type: string;
  startDate: string;
  endDate: string;
}

export interface ItsmTicketFilterOptionsApiResponse {
  state: SelectOption[];
  priority: SelectOption[];
  type: SelectOption[];
}

export interface ItsmTicketTableRowApiResponse {
  ticketId: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
}

export interface ItsmTicketViewApiResponse {
  tab: string;
  tabOptions: SelectOption[];
  ticketsByPriority: ItsmTicketSummaryBucketApiResponse[];
  ticketsByStatus: ItsmTicketSummaryBucketApiResponse[];
  solvedByResponseTime: ItsmTicketSolvedByResponseTimeApiResponse;
  filters: ItsmTicketFiltersApiResponse;
  filterOptions: ItsmTicketFilterOptionsApiResponse;
  tickets: ItsmTicketTableRowApiResponse[];
  total: number;
  page: number;
  perPage: number;
}

export interface DashboardHeader {
  lastRefreshed: string;
  scopeText: string;
}

export interface DashboardFilters {
  timeRange: SelectOption[];
  trendTimeline: SelectOption[];
  category?: SelectOption[];
  eventDeviceCategory: SelectOption[];
  alertSegregationCategory: SelectOption[];
  analyticsViewBy: SelectOption[];
  analyticsSourceType: SelectOption[];
  analyticsSeverityType: SelectOption[];
  analyticsDatacenter: SelectOption[];
  analyticsCloud: SelectOption[];
  analyticsDeviceTypes: SelectOption[];
  eventAndAlertTimeline: SelectOption[];
  noisyEventsCategory: SelectOption[];
  noisyHostsCategory: SelectOption[];
  incidentCategory: SelectOption[];
}

export interface DashboardFilterCriteria {
  timeline: string;
  timelineFrom?: Date | string;
  timelineTo?: Date | string;
  eventDeviceCategory: string;
  trendAlertTypes: string[];
  trendTimeline: string;
  trendTimelineFrom?: Date | string;
  trendTimelineTo?: Date | string;
  alertSegregationCategory: string;
  analyticsViewBy: string;
  analyticsSourceTypes: DashboardFilterOptionValue[];
  analyticsSeverityTypes: DashboardFilterOptionValue[];
  analyticsDatacenters: DashboardFilterOptionValue[];
  analyticsClouds: DashboardFilterOptionValue[];
  analyticsDeviceTypes: DashboardFilterOptionValue[];
  eventAndAlertTimeline: string;
  eventAndAlertTimelineFrom?: Date | string;
  eventAndAlertTimelineTo?: Date | string;
  noisyEventsCategory: string;
  noisyHostsCategory: string;
  incidentCategory: string;
  itsmTicketTab: string;
  itsmTicketSearch: string;
  itsmTicketState: string;
  itsmTicketPriority: string;
  itsmTicketType: string;
  itsmTicketDateRange?: any[];
  itsmTicketStartDate?: Date | string;
  itsmTicketEndDate?: Date | string;
  itsmTicketPage: number;
  itsmTicketPerPage: number;
  itsmTicketSortColumn?: string;
  itsmTicketSortDirection?: '' | 'asc' | 'desc';
}

export interface MetricViewData {
  key: string;
  label: string;
  value: string;
  tone?: EventAnalyticsTone;
  color?: string;
}

export interface PipelineViewData {
  rawEvents: string;
  noiseReduction: string;
  alerts: string;
  correlationPct: string;
  conditions: string;
}

export interface TrendTimelinePoint {
  label?: string;
  start_time?: string;
  end_time?: string;
  count: number;
}

export interface SankeyNode {
  name: string;
  labelText?: string;
  value?: number;
  itemStyle?: { color?: string };
  label?: { color?: string; position?: string };
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  lineStyle?: { color?: string; opacity?: number };
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface NoisyEventRowViewData {
  uuid: string;
  device: string;
  deviceType: string;
  count: string;
  description: string;
  source: string;
  lastReported: string;
  severity: string;
  severityIcon: string;
  severityClass: string;
}

export type NoisyTableSortColumn =
  | 'device'
  | 'deviceType'
  | 'count'
  | 'source'
  | 'lastReported'
  | 'severity';

export type IncidentAlertTableSortColumn =
  | 'deviceName'
  | 'ticketCount';

export type IncidentTicketTableSortColumn =
  | 'ticketId'
  | 'deviceName'
  | 'alertType'
  | 'ticketCount';

export interface IncidentAlertByDeviceViewData {
  deviceName: string;
  critical: number;
  warning: number;
  information: number;
  ticketCount: number;
}

export interface IncidentTicketViewData {
  uuid: string;
  ticketId: string;
  deviceName: string;
  alertType: string;
  tone: EventAnalyticsTone;
  ticketCount: number;
  severityIcon: string;
  severityClass: string;
}

export type ItsmTicketRowViewData = ItsmTicketTableRowApiResponse;
