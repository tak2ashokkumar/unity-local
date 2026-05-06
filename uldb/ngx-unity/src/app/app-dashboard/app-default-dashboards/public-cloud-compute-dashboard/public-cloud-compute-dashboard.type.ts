import { EChartsOption } from 'echarts';

export type PublicCloudPlatform = 'aws' | 'azure' | 'gcp' | 'oracle';
export type PublicCloudStatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface PublicCloudFilterOption {
  value: string;
  label: string;
}

export interface PublicCloudRegionOption extends PublicCloudFilterOption {
  platforms: PublicCloudPlatform[];
}

export interface PublicCloudAccountOption extends PublicCloudFilterOption {
  platform: PublicCloudPlatform;
  region: string;
}

export interface PublicCloudDashboardFilterCriteria {
  platforms: string[];
  regions: string[];
  accounts: string[];
}

export interface PublicCloudSummaryMetric {
  label: string;
  value: string;
  tone?: PublicCloudStatusTone;
}

export type PublicCloudInventorySummaryKey = 'cloud_accounts' | 'active_regions' | 'vms' | 'services' | 'running_resources' | 'stopped_resources';
export type PublicCloudProviderDistributionKey = 'aws' | 'azure' | 'gcp' | 'oci';

export interface PublicCloudInventorySummaryResponse {
  summary: Record<PublicCloudInventorySummaryKey, number>;
  distribution: Record<PublicCloudProviderDistributionKey, number>;
  distribution_percentages: Record<PublicCloudProviderDistributionKey, string>;
  tags: PublicCloudInventoryTagResponse[];
}

export interface PublicCloudInventoryTagResponse {
  label: string;
  count: number;
}

export interface PublicCloudProviderDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface PublicCloudTagItem {
  name: string;
  count: string;
  textColor: string;
  backgroundColor: string;
}

export interface PublicCloudHeatmapGroup {
  name: string;
  color: string;
  labelX: number;
  labelY: number;
  children: PublicCloudHeatmapItem[];
}

export interface PublicCloudHeatmapItem {
  name: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  usage?: string;
}

export type PublicCloudComputeBreakdownProviderKey = 'google_cloud' | 'azure' | 'aws' | 'oracle';
export type PublicCloudComputeBreakdownStatKey = 'virtual_machine' | 'containers' | 'kubernetes';
export type PublicCloudComputeBreakdownResponse = Record<PublicCloudComputeBreakdownProviderKey, Record<PublicCloudComputeBreakdownStatKey, number>>;

export interface PublicCloudComputeBreakdownProvider {
  name: string;
  displayName: string;
  brandClass: string;
  logoPath: string;
  stats: PublicCloudComputeBreakdownStat[];
}

export interface PublicCloudComputeBreakdownStat {
  name: string;
  value: number;
}

export interface PublicCloudStorageUtilization {
  capacity: string;
  used: string;
  free: string;
  percent: number;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudDiskIops {
  label: string;
  percent: number;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudUtilizationRow {
  name: string;
  cpuSeries: number[];
  cpuStatus: number;
  cpuTone: PublicCloudStatusTone;
  memorySeries: number[];
  memoryStatus: number;
  memoryTone: PublicCloudStatusTone;
  storage: PublicCloudStorageUtilization;
  diskIops: PublicCloudDiskIops;
  upTime: string;
}

export interface PublicCloudUtilizationViewRow extends PublicCloudUtilizationRow {
  cpuChartOptions: EChartsOption;
  memoryChartOptions: EChartsOption;
}

export interface PublicCloudHorizontalBarItem {
  name: string;
  value: number;
  label: string;
  color: string;
}

export interface PublicCloudDatabaseLatencyBadge {
  name: string;
  value: string;
  textColor: string;
  backgroundColor: string;
}

export type PublicCloudAlertSummaryKey = 'critical_alerts' | 'high_alerts' | 'open_itsm_tickets' | 'automation_success' | 'avg_mttr';

export interface PublicCloudTopCriticalAlertsSummary {
  critical_alerts: number;
  high_alerts: number;
  open_itsm_tickets: number;
  automation_success: string;
  avg_mttr: string;
}

export interface PublicCloudTopCriticalAlertsResponse {
  summary: PublicCloudTopCriticalAlertsSummary;
  top_alerts: PublicCloudCriticalAlertResponse[];
}

export interface PublicCloudAlertSummaryMetric {
  label: string;
  value: string;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudCriticalAlertResponse {
  id: string;
  device_name: string;
  severity: 'critical' | 'high';
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}

export interface PublicCloudCriticalAlert {
  id: string;
  deviceName: string;
  severity: 'critical' | 'high';
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}

export type PublicCloudAlertPieKey = 'raw_events' | 'alerts' | 'conditions';
export type PublicCloudAIOpsGraphGroupKey = 'raw_events' | 'noise_reduction' | 'first_response';
export type PublicCloudAIOpsGraphMetricKey = 'critical' | 'warning' | 'informative' | 'dedupe' | 'suppressed' | 'correlated' | 'auto_cloned' | 'ticket_created' | 'auto_closed';

export interface PublicCloudAIOpsDetailsResponse {
  alerts_pie: Record<PublicCloudAlertPieKey, number>;
  aiops_graph: PublicCloudAIOpsGraph;
  raw_events_details: PublicCloudAIOpsDetailsRawEventsDetails;
}

export interface PublicCloudAIOpsGraph {
  raw_events: PublicCloudAIOpsRawEventsGraph;
  noise_reduction: PublicCloudAIOpsNoiseReductionGraph;
  first_response: PublicCloudAIOpsFirstResponseGraph;
}

export interface PublicCloudAIOpsRawEventsGraph {
  critical: number;
  warning: number;
  informative: number;
}

export interface PublicCloudAIOpsNoiseReductionGraph {
  dedupe: number;
  suppressed: number;
  correlated: number;
}

export interface PublicCloudAIOpsFirstResponseGraph {
  auto_cloned: number;
  ticket_created: number;
  auto_closed: number;
}

export interface PublicCloudAIOpsDetailsRawEventsDetails {
  raw_events: number;
  critical: number;
  warning: number;
  informative: number;
  noise_reduction: string;
  dedupe_events: number;
  suppressed_events: number;
  correlated: number;
  first_response: string;
  auto_cloned: number;
  ticket_created: number;
  auto_closed: number;
}

export interface PublicCloudAlertTrendLegendItem {
  name: string;
  value: number;
  color: string;
}

export interface PublicCloudAlertTrendStackItem {
  label: string;
  value: number;
  color: string;
}

export interface PublicCloudAlertTrendBarGroup {
  name: string;
  items: PublicCloudAlertTrendStackItem[];
}

export interface PublicCloudAlertTrendStackLegendItem extends PublicCloudAlertTrendStackItem { }

export interface PublicCloudAlertSideMetric {
  label: string;
  value: string;
  tone?: PublicCloudStatusTone;
}

export interface PublicCloudAlertSideCard {
  title: string;
  value: string;
  metrics: PublicCloudAlertSideMetric[];
}

export type PublicCloudTicketResponseTimeKey = 'one_day' | 'one_week' | 'one_month' | 'greaterthan_month';

export interface PublicCloudTicketGraphDataResponse {
  by_state: Record<string, number>;
  by_priority: Record<string, number>;
  closed_tickets_count_by_response_time: Record<PublicCloudTicketResponseTimeKey, number>;
}

export interface PublicCloudTicketDonutItem {
  name: string;
  value: number;
  color: string;
}

export interface PublicCloudTicketField {
  display_value: string;
  value: string;
}

export interface PublicCloudTicketResponseItem {
  description: PublicCloudTicketField;
  task_effective_number: PublicCloudTicketField;
  ticket_type: string;
  sys_updated_on: PublicCloudTicketField;
  number: PublicCloudTicketField;
  priority: PublicCloudTicketField;
  state: PublicCloudTicketField;
  sys_id: PublicCloudTicketField;
  opened_at: PublicCloudTicketField;
  short_description: PublicCloudTicketField;
  urgency: PublicCloudTicketField;
  resolved_at?: PublicCloudTicketField;
}

export interface PublicCloudTicketsResponse {
  count: string | number;
  results: PublicCloudTicketResponseItem[];
}

export interface PublicCloudTicketFilterCriteria {
  state: string;
  ticket_type: string;
  search: string;
  priority: string;
  dateRange: string;
  start_date: string;
  end_date: string;
  page: number;
  page_size: number;
}

export interface PublicCloudTicketRow {
  id: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
}
