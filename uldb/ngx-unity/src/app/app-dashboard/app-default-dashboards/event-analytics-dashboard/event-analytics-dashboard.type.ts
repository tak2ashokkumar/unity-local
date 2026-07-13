export type EventAnalyticsTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'info' | string;

export interface SelectOption {
  value: string;
  label: string;
}

export interface EventAnalyticsTicketTab {
  key: string;
  name: string;
  ticketType?: string | null;
  projectId?: string;
  serviceDeskId?: string;
  drillDownLink: string;
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
  analyticsCategory: SelectOption[];
  analyticsDuration: SelectOption[];
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
  analyticsSourceType: string;
  analyticsSeverityType: string;
  analyticsDatacenter: string;
  analyticsCloud: string;
  analyticsCategory: string;
  analyticsDuration: string;
  noisyEventsCategory: string;
  noisyHostsCategory: string;
  incidentCategory: string;
}

export interface MetricViewData {
  key: string;
  label: string;
  value: string;
  tone?: EventAnalyticsTone;
}

export interface ExecutiveSummaryResponse {
  total_inference_alerts: number;
  events: number;
  alerts: number;
  conditions: number;
  cumulative_reduction: number;
}

export interface PipelineResponse {
  raw_events: number;
  noise_reduction: number;
  alerts: number;
  correlation_pct: number;
  conditions: number;
}

export interface PipelineViewData {
  rawEvents: string;
  noiseReduction: string;
  alerts: string;
  correlationPct: string;
  conditions: string;
}

export interface DeviceCategoryItem {
  key: string;
  label: string;
  count: number;
  percentage?: number;
}

export interface EventByDeviceCategoryResponse {
  donut: DeviceCategoryItem[];
  tiles: DeviceCategoryItem[];
  active_category: string;
  category_options: SelectOption[];
}

export interface AlertMetricResponse {
  key: string;
  label: string;
  value: number;
  tone: EventAnalyticsTone;
}

export interface DonutSegmentResponse {
  key: string;
  label: string;
  value: number;
}

export interface AlertGeneratedResponse {
  kpis: AlertMetricResponse[];
  donut: DonutSegmentResponse[];
}

export interface AlertStatusResponse {
  kpis: AlertMetricResponse[];
  donut: DonutSegmentResponse[];
}

export interface TrendTimelinePoint {
  label?: string;
  start_time?: string;
  end_time?: string;
  count: number;
}

export interface TrendTimelineSeries {
  events: TrendTimelinePoint[];
  alerts: TrendTimelinePoint[];
  conditions: TrendTimelinePoint[];
}

export interface TrendByTimelineResponse {
  series: TrendTimelineSeries;
  active_category?: string;
  active_alert_types?: string[];
}

export interface SeveritySummary {
  critical: number;
  warning: number;
  information: number;
}

export interface AlertSegregationRow {
  key: string;
  label: string;
  critical: number;
  warning: number;
  information: number;
}

export interface AlertSegregationResponse {
  summary: SeveritySummary;
  rows: AlertSegregationRow[];
  active_category: string;
  category_options: SelectOption[];
}

export interface SankeyNode {
  name: string;
  value?: number;
  itemStyle?: { color?: string };
  label?: { color?: string };
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

export interface EventAlertAnalyticsResponse {
  metrics: MetricViewData[];
  reductionFlow: SankeyData;
  resolutionFlow: SankeyData;
}

export interface NoisyEventRowResponse {
  uuid: string;
  device: string;
  device_type: string;
  count: number;
  description: string;
  source: string;
  last_reported: string;
  severity: string;
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

export interface NoisyEventsResponse {
  rows: NoisyEventRowResponse[];
  active_category: string;
  category_options: SelectOption[];
}

export interface NoisyHostChartRow {
  host_name: string;
  critical: number;
  warning: number;
  information: number;
}

export interface NoisyHostsResponse {
  rows: NoisyEventRowResponse[];
  chart: NoisyHostChartRow[];
  active_category: string;
  category_options: SelectOption[];
}

export interface IncidentAlertByDeviceRow {
  key: string;
  device_name: string;
  critical: number;
  warning: number;
  information: number;
  ticket_count: number;
}

export interface IncidentAlertByDeviceViewData {
  key: string;
  deviceName: string;
  critical: number;
  warning: number;
  information: number;
  ticketCount: number;
}

export interface IncidentTicketRow {
  uuid: string;
  ticket_id: string;
  device_name: string;
  alert_type: string;
  tone: EventAnalyticsTone;
  ticket_count: number;
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

export interface IncidentManagementResponse {
  alert_generated_by_device_type: IncidentAlertByDeviceRow[];
  open_incident_tickets: IncidentTicketRow[];
  resolved_incident_tickets: IncidentTicketRow[];
  active_category: string;
  category_options: SelectOption[];
}
