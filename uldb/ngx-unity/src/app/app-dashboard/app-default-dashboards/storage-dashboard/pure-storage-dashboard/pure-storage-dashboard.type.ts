import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

export type PureStorageTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';
export type PureStorageViewMode = 'chart' | 'table';
export type PureStorageSectionKey = 'arrays' | 'hosts' | 'hostGroups' | 'volumes' | 'volumeSnapshots'
  | 'volumeGroups' | 'protectionReplication' | 'protectionGroupSnapshots' | 'activeCluster'
  | 'performance' | 'capacityPlanning' | 'hardware' | 'alerts';
export type PureStorageChartType = 'bar' | 'horizontalBar' | 'groupedBar' | 'stackedBar' | 'line'
  | 'mixedBarLine' | 'pie' | 'doughnut' | 'polarArea' | 'scatter' | 'treemap' | 'sankey'
  | 'funnel' | 'lollipop' | 'radar' | 'heatmap' | 'sunburst' | 'parallelCoordinates';
export type PureStorageColumnFormat = 'text' | 'number' | 'capacity' | 'percent' | 'ratio'
  | 'datetime' | 'date' | 'boolean' | 'list';
export type PureStorageRatioValue = number | string;

export interface PureStorageApiCapacityValue {
  value: number;
  unit: string;
}

export interface PureStorageAvailabilityTrendApi {
  up: number;
  down: number;
  unknown: number;
}

export interface PureStorageExecutiveSummaryApiData {
  total_arrays: number;
  free_capacity: PureStorageApiCapacityValue;
  used_capacity?: PureStorageApiCapacityValue;
  total_raw_capacity?: PureStorageApiCapacityValue;
  effective_capacity: PureStorageApiCapacityValue;
  data_reduction_ratio: PureStorageRatioValue;
  total_data_reduction_ratio: PureStorageRatioValue;
  space_savings_percentage: number;
  space_savings?: PureStorageApiCapacityValue;
  availability_percentage: number;
  availability_trend: PureStorageAvailabilityTrendApi;
  active_alerts: number;
  total_volumes: number;
  total_hosts: number;
  total_host_groups: number;
  total_protection_groups: number;
}

export interface PureStorageExecutiveSummaryResponse {
  status: boolean;
  message?: string;
  last_updated?: string;
  data: PureStorageExecutiveSummaryApiData;
}

export interface PureStorageAutoRemediationSummaryApiData {
  auto_remediations: number;
  runbook_success: number;
  runbook_failures: number;
  average_mttr_minutes: number;
}

export interface PureStorageAutoRemediationSummaryResponse {
  status: boolean;
  message?: string;
  summary: PureStorageAutoRemediationSummaryApiData;
}

export interface PureStorageGraphSeriesApi {
  name: string;
  unit?: string;
  data: number[];
}

export interface PureStorageGraphAxisApi {
  name: string;
  unit?: string;
}

export interface PureStorageGraphDatumApi {
  name?: string;
  value?: number;
  unit?: string;
  children?: PureStorageGraphDatumApi[];
  x?: number;
  y?: number;
  size?: number;
  pod_name?: string;
  array_name?: string;
  health_score?: number;
  days_in_status?: number;
  status?: string;
  schedule_hours?: number;
  connected_snapshots?: number;
  retention_days?: number;
}

export type PureStorageGraphMatrixDataApi = number[][];
export type PureStorageGraphDataApi = PureStorageGraphDatumApi[] | PureStorageGraphMatrixDataApi;

export interface PureStorageGraphNodeApi {
  name: string;
  type?: string;
}

export interface PureStorageGraphLinkApi {
  source: string;
  target: string;
  value: number;
}

export interface PureStorageGraphApi {
  key: string;
  title: string;
  chart_type: string;
  categories?: string[];
  x_categories?: string[];
  y_categories?: string[];
  dimensions?: string[];
  series?: PureStorageGraphSeriesApi[];
  data?: PureStorageGraphDataApi;
  nodes?: PureStorageGraphNodeApi[];
  links?: PureStorageGraphLinkApi[];
  x_axis?: PureStorageGraphAxisApi;
  y_axis?: PureStorageGraphAxisApi;
}

export interface PureStorageGraphWidgetDefinition {
  key: string;
  title: string;
  chart_type: string;
  tooltip?: string;
  span?: number;
}

export interface PureStorageGraphResponse<TSummary = PureStorageSummaryApi> {
  status: boolean;
  message?: string;
  summary?: TSummary;
  graphs: PureStorageGraphApi[];
}

export interface PureStorageTableResponse<TSummary, TRow> {
  status: boolean;
  message?: string;
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  page_size: number;
  total_pages: number;
  summary?: TSummary;
  results: TRow[];
}

export interface PureStorageArraySummaryApi {
  total_arrays: number;
  total_capacity?: PureStorageApiCapacityValue;
  used_capacity?: PureStorageApiCapacityValue;
  total_capacity_pb?: number;
  used_capacity_pb?: number;
  average_read_latency_ms: number;
  average_write_latency_ms: number;
  total_iops: number;
}

export interface PureStorageHostSummaryApi {
  total_hosts: number;
  host_groups: number;
  average_latency_ms: number;
  total_iops_per_host: number;
  throughput_per_host_mbps: number;
  average_volumes_mapped_per_host: number;
}

export interface PureStorageVolumeSummaryApi {
  total_volumes: number;
  provisioned_size_pb: number;
  used_capacity_tb: number;
  average_latency_ms: number;
  san_latency_ms: number;
}

export interface PureStorageCapacityPlanningSummaryApi {
  used_capacity_tb: number;
  free_capacity_tb: number;
  effective_capacity_pb: number;
  monthly_growth_tb?: number;
  growth_rate_tb_per_day?: number;
  data_reduction_ratio?: PureStorageRatioValue;
  thin_provisioning_savings_pb?: number;
  days_until_full?: number;
}

export interface PureStorageHardwareSummaryApi {
  total_network_ports: number;
  manufacturer: string;
  os_version?: string;
  total_disk_space_pb?: number;
}

export interface PureStorageAlertsSummaryApi {
  total_alerts: number;
  critical: number;
  warning: number;
  information: number;
  active?: number;
  resolved?: number;
}

export interface PureStorageActiveClusterSummaryApi {
  total_pods: number;
  online_pods: number;
  synchronizing_pods: number;
  alerting_offline_pods: number;
}

export interface PureStoragePerformanceSummaryApi {
  total_iops_k: number;
  read_iops_k: number;
  write_iops_k: number;
  read_throughput_gbps: number;
  write_throughput_gbps: number;
  bandwidth_gbps: number;
  read_latency_ms: number;
  write_latency_ms: number;
  queue_depth: number;
}

export type PureStorageSummaryApi = PureStorageArraySummaryApi | PureStorageHostSummaryApi
  | PureStorageVolumeSummaryApi | PureStorageCapacityPlanningSummaryApi | PureStorageHardwareSummaryApi
  | PureStorageAlertsSummaryApi | PureStorageActiveClusterSummaryApi | PureStoragePerformanceSummaryApi
  | Record<string, never>;

export interface PureStorageArrayTableRowApi {
  array_hostname: string;
  total_capacity_tb: number;
  used_capacity_tb: number;
  free_capacity_tb: number;
  utilization_percentage: number;
  data_reduction_ratio: PureStorageRatioValue;
  thin_provisioning_percentage: number;
  read_iops: number;
  write_iops: number;
  read_latency_ms: number;
  write_latency_ms: number;
  combined_bandwidth_mbps: number;
}

export interface PureStorageHostTableRowApi {
  array_hostname: string;
  host_name: string;
  size_gb: number;
  data_reduction_ratio: PureStorageRatioValue;
  volume_gb: number;
  snapshots_gb: number;
  shared_gb: number;
  system_gb: number;
  total_gb: number;
  connected_volumes: string[];
  protection_groups: string[];
}

export interface PureStorageHostGroupTableRowApi {
  array_hostname: string;
  host_group_name: string;
  size_gb: number;
  host_count: number;
  data_reduction_ratio: PureStorageRatioValue;
  volume_gb: number;
  snapshots_gb: number;
  shared_gb: number;
  system_gb: number;
  total_gb: number;
}

export interface PureStorageVolumeTableRowApi {
  array_hostname: string;
  volume_name: string;
  serial_number: string;
  provisioned_size_gb: number;
  used_capacity_gb: number;
  data_reduction_ratio: PureStorageRatioValue;
  thin_provisioning_percentage: number;
  read_iops: number;
  write_iops: number;
  read_latency_ms: number;
  write_latency_ms: number;
  san_latency_ms: number;
}

export interface PureStorageVolumeSnapshotTableRowApi {
  array_hostname: string;
  snapshot_name: string;
  serial_number: string;
  parent_volume: string;
  snapshot_size_gb: number;
  snapshot_time: string;
}

export interface PureStorageVolumeGroupTableRowApi {
  array_hostname: string;
  volume_group_name: string;
  size_gb: number;
  volumes: number;
  snapshots: number;
  data_reduction_ratio: PureStorageRatioValue;
  protection_group: string;
}

export interface PureStorageProtectionReplicationTableRowApi {
  array_hostname: string;
  session_group_name: string;
  type: string;
  source_array: string;
  target_array: string;
  status: string;
  direction: string;
  snapshot_count: number;
  last_sync_time: string | null;
}

export interface PureStorageProtectionGroupSnapshotTableRowApi {
  array_hostname: string;
  protection_group_name: string;
  connected_volumes: number;
  connected_hosts: number;
  connected_host_groups: number;
  connected_snapshots: number;
  snapshot_schedule: string;
  snapshot_retention_days: number;
  replication_enabled: boolean;
  replication_frequency: string;
  target_retention_days: number;
}

export interface PureStorageActiveClusterTableRowApi {
  pod_name: string;
  array_name: string;
  status: string;
  mediator_connected: boolean;
  health_score: number;
  days_in_status: number;
}

export interface PureStoragePerformanceTableRowApi {
  resource_name: string;
  resource_type: string;
  read_iops_k: number;
  write_iops_k: number;
  total_iops_k: number;
  throughput_mbps: number;
  read_latency_ms: number;
  write_latency_ms: number;
  san_latency_ms: number;
}

export interface PureStorageCapacityPlanningTableRowApi {
  array_name: string;
  total_capacity_tb?: number;
  current_used_capacity_tb: number;
  current_free_capacity_tb: number;
  utilization_percentage: number;
  data_reduction_ratio?: PureStorageRatioValue;
  growth_rate_percentage: number;
  growth_rate_tb_per_month?: number;
  thin_provisioning_savings_tb?: number;
  days_until_full?: number | null;
  forecast_30_days_tb: number;
  forecast_60_days_tb: number;
  forecast_90_days_tb: number;
  estimated_full_date: string | null;
}

export interface PureStorageHardwareTableRowApi {
  component_name: string;
  component_type: string;
  manufacturer: string;
  model: string;
  os_version: string;
  management_ip?: string;
  cpu_cores: number;
  memory_gb: number;
  disk_space_tb: number;
  ports_count: number;
  health_status: string;
}

export interface PureStorageAlertTableRowApi {
  alert_id: string;
  array_hostname: string;
  resource_name: string;
  alert_name: string;
  count?: number;
  category: string;
  severity: string;
  status: string;
  event_metric?: string;
  message: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export type PureStorageAnyTableRowApi = PureStorageArrayTableRowApi | PureStorageHostTableRowApi
  | PureStorageHostGroupTableRowApi | PureStorageVolumeTableRowApi | PureStorageVolumeSnapshotTableRowApi
  | PureStorageVolumeGroupTableRowApi | PureStorageProtectionReplicationTableRowApi
  | PureStorageProtectionGroupSnapshotTableRowApi | PureStorageActiveClusterTableRowApi
  | PureStoragePerformanceTableRowApi | PureStorageCapacityPlanningTableRowApi
  | PureStorageHardwareTableRowApi | PureStorageAlertTableRowApi;

export type PureStorageAnyTableResponse = PureStorageTableResponse<PureStorageSummaryApi, PureStorageAnyTableRowApi>;
export type PureStorageAnyGraphResponse = PureStorageGraphResponse<PureStorageSummaryApi>;
export type PureStorageArraysGraphResponse = PureStorageGraphResponse<PureStorageArraySummaryApi>;
export type PureStorageArraysTableResponse = PureStorageTableResponse<PureStorageArraySummaryApi, PureStorageArrayTableRowApi>;
export type PureStorageHostsGraphResponse = PureStorageGraphResponse<PureStorageHostSummaryApi>;
export type PureStorageHostsTableResponse = PureStorageTableResponse<PureStorageHostSummaryApi, PureStorageHostTableRowApi>;
export type PureStorageHostGroupsGraphResponse = PureStorageGraphResponse<Record<string, never>>;
export type PureStorageHostGroupsTableResponse = PureStorageTableResponse<Record<string, never>, PureStorageHostGroupTableRowApi>;
export type PureStorageVolumesGraphResponse = PureStorageGraphResponse<PureStorageVolumeSummaryApi>;
export type PureStorageVolumesTableResponse = PureStorageTableResponse<PureStorageVolumeSummaryApi, PureStorageVolumeTableRowApi>;
export type PureStorageVolumeSnapshotsGraphResponse = PureStorageGraphResponse<Record<string, never>>;
export type PureStorageVolumeSnapshotsTableResponse = PureStorageTableResponse<Record<string, never>, PureStorageVolumeSnapshotTableRowApi>;
export type PureStorageVolumeGroupsGraphResponse = PureStorageGraphResponse<Record<string, never>>;
export type PureStorageVolumeGroupsTableResponse = PureStorageTableResponse<Record<string, never>, PureStorageVolumeGroupTableRowApi>;
export type PureStorageProtectionReplicationGraphResponse = PureStorageGraphResponse<Record<string, never>>;
export type PureStorageProtectionReplicationTableResponse = PureStorageTableResponse<Record<string, never>, PureStorageProtectionReplicationTableRowApi>;
export type PureStorageProtectionGroupSnapshotsGraphResponse = PureStorageGraphResponse<Record<string, never>>;
export type PureStorageProtectionGroupSnapshotsTableResponse = PureStorageTableResponse<Record<string, never>, PureStorageProtectionGroupSnapshotTableRowApi>;
export type PureStorageActiveClusterGraphResponse = PureStorageGraphResponse<PureStorageActiveClusterSummaryApi>;
export type PureStorageActiveClusterTableResponse = PureStorageTableResponse<PureStorageActiveClusterSummaryApi,
  PureStorageActiveClusterTableRowApi>;
export type PureStoragePerformanceGraphResponse = PureStorageGraphResponse<PureStoragePerformanceSummaryApi>;
export type PureStoragePerformanceTableResponse = PureStorageTableResponse<PureStoragePerformanceSummaryApi,
  PureStoragePerformanceTableRowApi>;
export type PureStorageCapacityPlanningGraphResponse = PureStorageGraphResponse<PureStorageCapacityPlanningSummaryApi>;
export type PureStorageCapacityPlanningTableResponse = PureStorageTableResponse<PureStorageCapacityPlanningSummaryApi, PureStorageCapacityPlanningTableRowApi>;
export type PureStorageHardwareGraphResponse = PureStorageGraphResponse<PureStorageHardwareSummaryApi>;
export type PureStorageHardwareTableResponse = PureStorageTableResponse<PureStorageHardwareSummaryApi, PureStorageHardwareTableRowApi>;
export type PureStorageAlertsGraphResponse = PureStorageGraphResponse<PureStorageAlertsSummaryApi>;
export type PureStorageAlertsTableResponse = PureStorageTableResponse<PureStorageAlertsSummaryApi, PureStorageAlertTableRowApi>;

export interface PureStorageSectionGraphViewModel {
  metrics: PureStorageMetricViewModel[];
  charts: PureStorageChartCardViewModel[];
}

export interface PureStorageTableColumn {
  label: string;
  sortKey: string;
  format?: PureStorageColumnFormat;
}

export interface PureStorageAvailabilityTrendViewModel {
  up: number;
  down: number;
  unknown: number;
}

export class PureStorageMetricViewModel {
  label = '';
  value = '--';
  tone?: PureStorageTone;
  trend?: PureStorageAvailabilityTrendViewModel;

  constructor(init?: Partial<PureStorageMetricViewModel>) {
    Object.assign(this, init);
  }
}

export class PureStorageTableRowViewModel {
  resourceId?: string;
  cells: string[] = [];

  constructor(init?: Partial<PureStorageTableRowViewModel>) {
    Object.assign(this, init);
  }
}

export class PureStorageChartCardViewModel {
  key = '';
  title = '';
  chartType: PureStorageChartType = 'bar';
  tooltip?: string;
  span = 4;
  hasData = false;
  loading = false;
  loader = '';
  chartData: UnityChartDetails = new UnityChartDetails();
  defaultHeight = 200;

  constructor(init?: Partial<PureStorageChartCardViewModel>) {
    Object.assign(this, init);
  }
}

export class PureStorageTableStateViewModel {
  columns: PureStorageTableColumn[] = [];
  rows: PureStorageTableRowViewModel[] = [];
  criteria: SearchCriteria = { sortColumn: '', sortDirection: 'asc', searchValue: '', pageNo: 1, pageSize: 10 };
  count = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  hasLoaded = false;
  noData = false;
  loader = '';
  rawResponse?: PureStorageAnyTableResponse;

  constructor(init?: Partial<PureStorageTableStateViewModel>) {
    Object.assign(this, init);
  }
}

export class PureStorageSectionViewModel {
  key: PureStorageSectionKey = 'arrays';
  title = '';
  tooltip?: string;
  metrics: PureStorageMetricViewModel[] = [];
  charts: PureStorageChartCardViewModel[] = [];
  showChartWidgets = false;
  loading = false;
  viewMode: PureStorageViewMode = 'chart';
  chartLoader = '';
  chartNoData = false;
  hidden = false;
  table = new PureStorageTableStateViewModel();
  rawGraphResponse?: PureStorageAnyGraphResponse;

  constructor(init: Partial<PureStorageSectionViewModel> & { key: PureStorageSectionKey }) {
    Object.assign(this, init);
  }
}
