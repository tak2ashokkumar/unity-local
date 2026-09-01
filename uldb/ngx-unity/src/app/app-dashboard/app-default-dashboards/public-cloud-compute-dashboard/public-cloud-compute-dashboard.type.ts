import { EChartsOption } from 'echarts';

export type PublicCloudPlatform = 'aws' | 'azure' | 'gcp' | 'oracle' | 'oci';
export type PublicCloudStatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface PublicCloudFilterOption {
  value: string;
  label: string;
}

export interface PublicCloudRegionOption extends PublicCloudFilterOption {
  platforms?: PublicCloudPlatform[];
}

export interface PublicCloudAccountOption extends PublicCloudFilterOption {
  platform: PublicCloudPlatform;
  region?: string;
}

export interface PublicCloudDashboardFilterCriteria {
  platforms: string[];
  regions: string[];
  accounts: string[];
  // Global Time Range: startDate/endDate are only sent for the 'custom' range (start_datetime / end_datetime).
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export interface PublicCloudFilterAccountResponseItem {
  cloud_type?: string;
  uuid?: string;
  name?: string;
}

export interface PublicCloudFiltersResponse {
  platform?: string[];
  region?: string[];
  account?: PublicCloudFilterAccountResponseItem[];
}

export interface PublicCloudDashboardFilterOptions {
  platforms: PublicCloudFilterOption[];
  regions: PublicCloudRegionOption[];
  accounts: PublicCloudAccountOption[];
}

export interface PublicCloudSummaryMetric {
  key: PublicCloudInventorySummaryKey;
  label: string;
  value: string;
  tone?: PublicCloudStatusTone;
}

export type PublicCloudInventorySummaryKey = 'cloud_accounts' | 'active_regions' | 'vms' | 'services' | 'running_resources' | 'stopped_resources' | 'orphaned_vms' | 'idle_vms';
export type PublicCloudProviderDistributionKey = 'aws' | 'azure' | 'gcp' | 'oci';

export interface PublicCloudInventorySummaryResponse {
  summary: Record<PublicCloudInventorySummaryKey, number>;
  distribution: Record<PublicCloudProviderDistributionKey, number>;
  distribution_percentages?: Record<PublicCloudProviderDistributionKey, string>;
  tags: PublicCloudInventoryTags;
}

export interface PublicCloudInventoryTagResponse {
  label: string;
  count: number;
}

// Inventory tags arrive as a keyed map ({ tagName: count }) from the current inventory_summary
// response, or as an array ([{ label, count }]) from older responses.
export type PublicCloudInventoryTags = PublicCloudInventoryTagResponse[] | Record<string, number>;

export interface PublicCloudProviderDistributionItem {
  key: PublicCloudProviderDistributionKey;
  name: string;
  count: number;
  value: number;
  color: string;
}

export interface PublicCloudTagItem {
  name: string;
  count: string;
  textColor: string;
  backgroundColor: string;
}

export interface PublicCloudGeoCell {
  name: string;
  color: string;
  value: number[];
  totalResources: number;
  totalAlerts: number;
  critical: number;
  warning: number;
  information: number;
  computeCount: number;
  platformServices: number;
  otherServices: number;
}

export interface PublicCloudCoverageRow {
  label: string;
  value: string;
  iconPath?: string;
}

export interface PublicCloudCoverageCard {
  title: string;
  logo?: string;
  rows: PublicCloudCoverageRow[];
  totalResources?: string;
  chartOptions?: EChartsOption;
}

export interface PublicCloudCoverageGroup {
  key: string;
  title: string;
  totalLabel: string;
  cards: PublicCloudCoverageCard[];
  showChart: boolean;
}

export interface PublicCloudPerformanceHotspotReadWrite {
  readLabel: string;
  writeLabel: string;
}

export interface PublicCloudPerformanceHotspotDisk {
  capacityLabel: string;
  usedLabel: string;
  freeLabel: string;
  usedPercent: number;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudPerformanceHotspotRow {
  instanceName: string;
  cloud: string;
  cloudLogo: string;
  cpuLabel: string;
  memoryLabel: string;
  disk: PublicCloudPerformanceHotspotDisk | null;
  dataDiskBytes: PublicCloudPerformanceHotspotReadWrite | null;
  dataDiskRates: PublicCloudPerformanceHotspotReadWrite | null;
  networkTraffic: string;
}

export interface PublicCloudPerformanceHotspotDiskResponse {
  capacity?: string | number;
  used?: string | number;
  free?: string | number;
}

export interface PublicCloudPerformanceHotspotResponseItem {
  name?: string;
  instance_name?: string;
  instanceName?: string;
  cloud?: string;
  cloud_key?: string;
  provider?: string;
  cloud_type?: string;
  cpu_utilization_percent?: string | number;
  cpu_utilization?: string | number;
  cpu_vcpus?: string | number;
  available_memory?: string | number;
  available_memory_gb?: string | number;
  disk_utilization?: PublicCloudPerformanceHotspotDiskResponse;
  disk_size?: PublicCloudPerformanceHotspotDiskResponse;
  data_disk_read_write_bytes?: { read?: string | number; write?: string | number };
  data_disk_read_write_rates?: { read_ops?: string | number; write_ops?: string | number };
  // Current response carries the read/write metrics as flat per-second fields; the nested
  // data_disk_read_write_* objects above come from the older response shape.
  disk_read_bytes_per_second?: string | number;
  disk_write_bytes_per_second?: string | number;
  disk_read_operations_per_second?: string | number;
  disk_write_operations_per_second?: string | number;
  avg_network_traffic?: string | number;
  network_traffic?: string | number;
}

export interface PublicCloudPerformanceHotspotsResponse {
  data?: PublicCloudPerformanceHotspotResponseItem[];
  results?: PublicCloudPerformanceHotspotResponseItem[];
  items?: PublicCloudPerformanceHotspotResponseItem[];
  selected_metric?: string;
}

export interface PublicCloudDatabaseMetricItem {
  label?: string;
  name?: string;
  metric?: string;
  category?: string;
  current?: string | number;
  value?: string | number;
  score?: string | number;
  count?: string | number;
  total?: string | number;
  max?: string | number;
  target?: string | number;
  threshold?: string | number;
  percent?: string | number;
  percentage?: string | number;
  color?: string;
  tone?: PublicCloudStatusTone;
}

export interface PublicCloudDatabaseHealthPie {
  health_score?: string | number;
  healthScore?: string | number;
  score?: string | number;
  max?: string | number;
  total?: string | number;
}

export interface PublicCloudDatabaseHealthScoreResponse {
  health_pie?: PublicCloudDatabaseHealthPie;
  healthPie?: PublicCloudDatabaseHealthPie;
  score?: string | number;
  health_score?: string | number;
  healthScore?: string | number;
  value?: string | number;
  max?: string | number;
  total?: string | number;
  metrics?: PublicCloudDatabaseMetricItem[] | Record<string, PublicCloudDatabaseMetricItem>;
  results?: PublicCloudDatabaseMetricItem[];
  items?: PublicCloudDatabaseMetricItem[];
  data?: PublicCloudDatabaseMetricItem[] | PublicCloudDatabaseHealthScoreResponse;
}

export interface PublicCloudDatabaseHealthMetric {
  label: string;
  value: string;
  total: string;
  percent: number;
  color: string;
}

export interface PublicCloudDatabaseHealthScoreViewData {
  score: number;
  scoreLabel: string;
  scoreGradient: string;
  metrics: PublicCloudDatabaseHealthMetric[];
  hasData: boolean;
}

export interface PublicCloudDatabaseBarResponseItem {
  name?: string;
  label?: string;
  database?: string;
  database_name?: string;
  databaseName?: string;
  service?: string;
  cloud?: string;
  provider?: string;
  platform?: string;
  value?: string | number;
  count?: string | number;
  total?: string | number;
  transactions?: string | number;
  transactions_per_sec?: string | number;
  latency?: string | number;
  latency_ms?: string | number;
  avg_latency?: string | number;
  memory?: string | number;
  memory_gb?: string | number;
  storage?: string | number;
  used?: string | number;
  used_tb?: string | number;
  capacity?: string | number;
  total_tb?: string | number;
  percent?: string | number;
  percentage?: string | number;
  color?: string;
  tone?: PublicCloudStatusTone;
  status?: string;
  bucket?: string;
}

export interface PublicCloudDatabaseWidgetSummary {
  value?: string | number;
  total?: string | number;
  unit?: string;
}

export interface PublicCloudDatabaseKeyedNumberRecord {
  [key: string]: string | number;
}

export interface PublicCloudDatabaseWidgetResponse {
  total?: string | number;
  value?: string | number;
  unit?: string;
  summary?: PublicCloudDatabaseWidgetSummary;
  results?: PublicCloudDatabaseBarResponseItem[];
  items?: PublicCloudDatabaseBarResponseItem[];
  rows?: PublicCloudDatabaseBarResponseItem[];
  data?: PublicCloudDatabaseBarResponseItem[] | PublicCloudDatabaseKeyedNumberRecord[] | PublicCloudDatabaseWidgetResponse;
  workloads?: PublicCloudDatabaseBarResponseItem[];
  databases?: PublicCloudDatabaseBarResponseItem[];
  latency?: PublicCloudDatabaseBarResponseItem[];
  consumers?: PublicCloudDatabaseBarResponseItem[];
}

export interface PublicCloudDatabaseBarItem {
  label: string;
  value: number;
  color: string;
  displayValue?: string;
}

export interface PublicCloudActiveDatabaseWorkloadViewData {
  totalLabel: string;
  unit: string;
  rows: PublicCloudDatabaseBarItem[];
}

export interface PublicCloudLockContentionResponseItem {
  database?: string;
  database_name?: string;
  databaseName?: string;
  name?: string;
  locks?: string | number;
  lock_count?: string | number;
  lockCount?: string | number;
  type?: string;
  lock_type?: string;
  lockType?: string;
  wait?: string | number;
  wait_time?: string | number;
  waitTime?: string | number;
  cloud?: string;
  provider?: string;
  platform?: string;
}

export interface PublicCloudLockContentionResponse {
  results?: PublicCloudLockContentionResponseItem[];
  items?: PublicCloudLockContentionResponseItem[];
  rows?: PublicCloudLockContentionResponseItem[];
  data?: PublicCloudLockContentionResponseItem[] | PublicCloudLockContentionResponse;
}

export interface PublicCloudLockContentionRow {
  database: string;
  locks: string;
  type: string;
  wait: string;
  cloud: string;
  cloudClass: string;
}

export interface PublicCloudDatabaseConsumerRow {
  name: string;
  value: number;
  displayValue: string;
  totalValue?: number;
  totalLabel?: string;
  percent: number;
  color: string;
}

export interface PublicCloudStorageHealthResponseItem {
  metric?: string;
  label?: string;
  name?: string;
  value?: string | number;
  unit?: string;
}

export interface PublicCloudStorageHealthResponse {
  data?: PublicCloudStorageHealthResponseItem[];
  results?: PublicCloudStorageHealthResponseItem[];
  items?: PublicCloudStorageHealthResponseItem[];
}

export interface PublicCloudStorageKpi {
  label: string;
  value: string;
  tone?: PublicCloudStatusTone;
}

export interface PublicCloudStorageKeyedNumberResponse {
  data?: PublicCloudDatabaseKeyedNumberRecord[];
  results?: PublicCloudDatabaseKeyedNumberRecord[];
  items?: PublicCloudDatabaseKeyedNumberRecord[];
}

export interface PublicCloudStorageBarItem {
  label: string;
  value: number;
  color: string;
}

export interface PublicCloudStorageSeriesPoint {
  time?: string;
  value?: string | number;
}

export interface PublicCloudStorageTrafficResponse {
  read_ingress?: PublicCloudStorageSeriesPoint[];
  readIngress?: PublicCloudStorageSeriesPoint[];
  write_egress?: PublicCloudStorageSeriesPoint[];
  writeEgress?: PublicCloudStorageSeriesPoint[];
}

export interface PublicCloudStorageTrendResponse {
  [key: string]: PublicCloudStorageSeriesPoint[] | undefined;
}

export interface PublicCloudStorageTrendSeries {
  name: string;
  color: string;
  values: number[];
}

export interface PublicCloudStorageTrendViewData {
  labels: string[];
  series: PublicCloudStorageTrendSeries[];
}

export interface PublicCloudStorageConsumerRow {
  account: string;
  cloud: string;
  cloudClass: string;
  used: string;
  tps: string;
  latency: string;
  growth: string;
  growthClass: string;
}

export interface PublicCloudStorageServicesVisibilityResponse {
  active_accounts?: string | number;
  activeAccounts?: string | number;
  highest_latency_cloud?: {
    cloud_name?: string;
    cloudName?: string;
    value?: string | number;
    unit?: string;
  };
  highestLatencyCloud?: {
    cloud_name?: string;
    cloudName?: string;
    value?: string | number;
    unit?: string;
  };
  most_utilized?: {
    cloud_name?: string;
    cloudName?: string;
    value?: string | number;
    unit?: string;
  };
  mostUtilized?: {
    cloud_name?: string;
    cloudName?: string;
    value?: string | number;
    unit?: string;
  };
  total_capacity_tracked?: {
    value?: string | number;
    unit?: string;
  };
  totalCapacityTracked?: {
    value?: string | number;
    unit?: string;
  };
}

export interface PublicCloudStorageDistributionItem {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export interface PublicCloudOrphanedDeviceResponseItem {
  name?: string;
  device_name?: string;
  instance_name?: string;
  status?: string;
  resource_type?: string;
  resourceType?: string;
  type?: string;
  lastSeen?: string;
  last_seen?: string;
  datacenter?: string;
  datacenter_name?: string;
  cloud?: string;
  provider?: string;
  platform?: string;
  account?: string;
}

export interface PublicCloudOrphanedDevicesResponse {
  count?: string | number;
  results?: PublicCloudOrphanedDeviceResponseItem[];
  orphanedDeviceList?: PublicCloudOrphanedDeviceResponseItem[];
  data?: PublicCloudOrphanedDeviceResponseItem[];
  items?: PublicCloudOrphanedDeviceResponseItem[];
  totalOrphaned?: string | number;
}

export interface PublicCloudOrphanedDeviceRow {
  name: string;
  status: string;
  resourceType: string;
  lastSeen: string;
  datacenter: string;
}

export interface PublicCloudOrphanedCategoryResponseItem {
  category?: string;
  name?: string;
  label?: string;
  display_name?: string;
  type?: string;
  resource_type?: string;
  count?: string | number;
  value?: string | number;
  percentage?: string | number;
  percent?: string | number;
}

export interface PublicCloudOrphanedDevicesByCategoryResponse {
  results?: PublicCloudOrphanedCategoryResponseItem[];
  orphanedByCategory?: PublicCloudOrphanedCategoryResponseItem[];
  categories?: PublicCloudOrphanedCategoryResponseItem[];
  by_category?: PublicCloudOrphanedCategoryResponseItem[];
  data?: PublicCloudOrphanedCategoryResponseItem[];
  breakdown?: PublicCloudOrphanedCategoryResponseItem[] | Record<string, string | number | PublicCloudOrphanedCategoryResponseItem>;
  total?: string | number;
  totalOrphaned?: string | number;
  total_count?: string | number;
  totalCount?: string | number;
}

export type PublicCloudOrphanedDevicesByCategoryApiResponse = PublicCloudOrphanedDevicesByCategoryResponse | PublicCloudOrphanedCategoryResponseItem[];

export interface PublicCloudOrphanedCategoryItem {
  category: string;
  count: number;
  percentage: number;
  color: string;
  totalCount?: number;
}

export interface PublicCloudIdleMetricResponse {
  used?: string | number;
  free?: string | number;
  percent?: string | number;
  percentage?: string | number;
  value?: string | number;
}

export interface PublicCloudIdleDeviceResponseItem {
  id?: string | number;
  uuid?: string;
  device_id?: string | number;
  deviceId?: string | number;
  device_uuid?: string;
  deviceUuid?: string;
  resource_id?: string | number;
  resourceId?: string | number;
  device_name?: string;
  deviceName?: string;
  name?: string;
  resource_type?: string;
  resourceType?: string;
  type?: string;
  provider?: string;
  platform?: string;
  cloud?: string;
  cloud_provider?: string;
  cloudProvider?: string;
  cloud_type?: string;
  cloudType?: string;
  monitoring_type?: string;
  monitoringType?: string;
  monitoring?: {
    configured?: boolean;
    enabled?: boolean;
    observium?: boolean;
    zabbix?: boolean;
  };
  avg_cpu?: PublicCloudIdleMetricResponse;
  avgCpu?: PublicCloudIdleMetricResponse;
  avgCPU?: PublicCloudIdleMetricResponse;
  cpu?: PublicCloudIdleMetricResponse;
  cpu_usage?: PublicCloudIdleMetricResponse;
  avg_cpu_percent?: string | number;
  avgCpuPercent?: string | number;
  avg_cpu_percentage?: string | number;
  cpu_percent?: string | number;
  avg_mem?: PublicCloudIdleMetricResponse;
  avgMem?: PublicCloudIdleMetricResponse;
  avg_memory?: PublicCloudIdleMetricResponse;
  memory?: PublicCloudIdleMetricResponse;
  memory_usage?: PublicCloudIdleMetricResponse;
  avg_mem_percent?: string | number;
  avgMemPercent?: string | number;
  avg_mem_percentage?: string | number;
  memory_percent?: string | number;
  network_io?: string | number;
  networkIO?: string | number;
  network?: string | number;
  idle_duration?: string | number;
  idleDuration?: string | number;
  status?: string;
}

export interface PublicCloudIdleDevicesResponse {
  count: string | number;
  results: PublicCloudIdleDeviceResponseItem[];
}

export interface PublicCloudIdleMetric {
  used: string;
  free: string;
  percent: number;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudIdleDeviceRow {
  id: string;
  uuid: string;
  deviceId: string;
  resourceId: string;
  deviceName: string;
  resourceType: string;
  provider: string;
  cloudType: string;
  monitoringType: string;
  monitoring?: {
    configured?: boolean;
    enabled?: boolean;
    observium?: boolean;
    zabbix?: boolean;
  };
  avgCpu: PublicCloudIdleMetric;
  avgMem: PublicCloudIdleMetric;
  networkIO: string;
  idleDuration: string;
  status: string;
}

export interface PublicCloudIdleDurationResponseItem {
  duration?: string;
  idle_duration?: string;
  idleDuration?: string;
  range?: string;
  name?: string;
  label?: string;
  count?: string | number;
  value?: string | number;
  total?: string | number;
  total_count?: string | number;
  totalCount?: string | number;
  devices?: string | number;
  percent?: string | number;
  percentage?: string | number;
}

export interface PublicCloudIdleDurationResponse {
  results?: PublicCloudIdleDurationResponseItem[];
  data?: PublicCloudIdleDurationResponseItem[] | PublicCloudIdleDurationResponse;
  summary?: PublicCloudIdleDurationResponseItem[] | Record<string, string | number | PublicCloudIdleDurationResponseItem>;
  distribution?: PublicCloudIdleDurationResponseItem[];
  duration_distribution?: PublicCloudIdleDurationResponseItem[];
  durationDistribution?: PublicCloudIdleDurationResponseItem[];
  idleDurationDistribution?: PublicCloudIdleDurationResponseItem[];
  idle_duration_distribution?: PublicCloudIdleDurationResponseItem[];
  idle_devices_by_duration?: PublicCloudIdleDurationResponseItem[];
  breakdown?: PublicCloudIdleDurationResponseItem[] | Record<string, string | number | PublicCloudIdleDurationResponseItem>;
}

export type PublicCloudIdleDurationApiResponse = PublicCloudIdleDurationResponse | PublicCloudIdleDurationResponseItem[];

export interface PublicCloudIdleDurationItem {
  duration: string;
  count: number;
  percent: number;
  color: string;
}

export interface PublicCloudAlertSummaryMetric {
  label: string;
  value: string;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudRecentAlertsSummary {
  total?: number;
  critical?: number;
  critical_alerts?: number;
  criticalAlerts?: number;
  warning?: number;
  warning_alerts?: number;
  warningAlerts?: number;
  information?: number;
  info?: number;
  info_alerts?: number;
  infoAlerts?: number;
}

export interface PublicCloudRecentAlertResponseItem {
  id?: string | number;
  uuid?: string;
  alert_id?: string | number;
  alertId?: string | number;
  alert_uuid?: string;
  alertUuid?: string;
  device_name?: string;
  deviceName?: string;
  name?: string;
  severity?: string;
  status?: string;
  description?: string;
  source?: string;
  acknowledged?: string | boolean;
  duration?: string;
}

export interface PublicCloudRecentAlertsResponse {
  alertSummary?: PublicCloudRecentAlertsSummary;
  alert_summary?: PublicCloudRecentAlertsSummary;
  summary?: PublicCloudRecentAlertsSummary;
  recentAlerts?: PublicCloudRecentAlertResponseItem[];
  recent_alerts?: PublicCloudRecentAlertResponseItem[];
  alerts?: PublicCloudRecentAlertResponseItem[];
  results?: PublicCloudRecentAlertResponseItem[];
  data?: PublicCloudRecentAlertResponseItem[] | {
    alertSummary?: PublicCloudRecentAlertsSummary;
    alert_summary?: PublicCloudRecentAlertsSummary;
    summary?: PublicCloudRecentAlertsSummary;
    recentAlerts?: PublicCloudRecentAlertResponseItem[];
    recent_alerts?: PublicCloudRecentAlertResponseItem[];
    alerts?: PublicCloudRecentAlertResponseItem[];
    results?: PublicCloudRecentAlertResponseItem[];
  };
}

export type PublicCloudRecentAlertSeverity = 'critical' | 'warning' | 'info' | 'high' | 'muted';

export interface PublicCloudRecentAlert {
  id: string;
  uuid: string;
  deviceName: string;
  severity: PublicCloudRecentAlertSeverity;
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}

export type PublicCloudLatencyHeatmapResponse = Record<string, Array<{ time?: string; value?: number | string }>>;

export interface PublicCloudLatencyHeatmapCell {
  value: number;
  color: string;
  tone: string;
}

export interface PublicCloudLatencyHeatmapRow {
  account: string;
  cells: PublicCloudLatencyHeatmapCell[];
}

export type PublicCloudQueueBacklogResponse = Record<string, { messages?: number | string; percentage?: number | string }>;

export interface PublicCloudQueueBacklogRow {
  name: string;
  messages: string;
  percentage: number;
  color: string;
  tone: string;
}

/*
 * ------ Cloud Database Performance (redesigned) ------
 */
export interface PublicCloudDatabaseKpi {
  label: string;
  value: string;
  unit: string;
  tone?: PublicCloudStatusTone;
}

export interface PublicCloudSortState {
  key: string;
  direction: 'asc' | 'desc';
}

// top_database_performance_summary response (drives Database Overview KPI strip + Top 10 table).
export interface PublicCloudDatabaseOverviewRowResponse {
  uuid?: string;
  database_instance?: string;
  cloud?: string;
  cloud_key?: string;
  region?: string;
  write_throughput?: string | number;
  write_throughput_unit?: string;
  write_latency?: string | number;
  write_latency_unit?: string;
  write_iops?: string | number;
  write_iops_unit?: string;
  read_throughput?: string | number;
  read_throughput_unit?: string;
  read_latency?: string | number;
  read_latency_unit?: string;
  read_iops?: string | number;
  read_iops_unit?: string;
  queue_depth?: string | number;
  queue_depth_unit?: string | null;
}

export interface PublicCloudDatabaseOverviewResponse {
  cloud?: string;
  hours?: number;
  count?: number;
  data?: PublicCloudDatabaseOverviewRowResponse[];
}

// Top 10 Performance Summary header column; label already carries the unit read from the response.
export interface PublicCloudDatabaseOverviewColumn {
  key: string;
  label: string;
  numeric: boolean;
}

// Metrics are null when the response omits them, so a missing reading renders as NA instead of a
// fabricated 0.00 (the KPI strip likewise excludes missing readings from its averages).
export interface PublicCloudDatabaseOverviewRow {
  instance: string;
  uuid: string;
  writeThroughput: number | null;
  writeLatency: number | null;
  writeIops: number | null;
  readThroughput: number | null;
  readLatency: number | null;
  readIops: number | null;
  queueDepth: number | null;
}

// write_performance_trend / read_performance_trend response (per-resource metric series over time).
export interface PublicCloudDatabaseTrendPoint {
  clock?: number;
  value?: number | string;
}

export interface PublicCloudDatabaseTrendSeriesItem {
  label?: string;
  unit?: string;
  points?: PublicCloudDatabaseTrendPoint[];
}

export interface PublicCloudDatabaseTrendResourceItem {
  uuid?: string;
  database_instance?: string;
  series?: Record<string, PublicCloudDatabaseTrendSeriesItem>;
}

export interface PublicCloudDatabaseTrendResponse {
  cloud?: string;
  hours?: number;
  count?: number;
  data?: PublicCloudDatabaseTrendResourceItem[];
}

// space_consumption response (drives Space Consumption KPI strip + Top 10 Capacity table).
export interface PublicCloudDatabaseSpaceSummaryResponse {
  database_count?: string | number;
  max_allocated_storage?: string | number;
  total_allocated?: string | number;
  average_allocated?: string | number;
  total_free_space?: string | number;
  average_free_space?: string | number;
  average_utilization?: string | number;
  storage_unit?: string;
  utilization_unit?: string;
}

export interface PublicCloudDatabaseSpaceRowResponse {
  uuid?: string;
  database_instance?: string;
  cloud?: string;
  cloud_key?: string;
  region?: string;
  max_allocated_storage?: string | number;
  max_allocated_storage_unit?: string;
  allocated_storage?: string | number;
  allocated_storage_unit?: string;
  free_storage_space?: string | number;
  free_storage_space_unit?: string;
  utilization_percent?: string | number;
}

export interface PublicCloudDatabaseSpaceConsumptionResponse {
  cloud?: string;
  count?: number;
  summary?: PublicCloudDatabaseSpaceSummaryResponse;
  data?: PublicCloudDatabaseSpaceRowResponse[];
}

export interface PublicCloudDatabaseSpaceRow {
  instance: string;
  uuid: string;
  maxAllocatedLabel: string;
  maxAllocated: number;
  allocatedLabel: string;
  allocated: number;
  spaceFreeLabel: string;
  spaceFree: number;
  utilization: number;
}

// top_capacity_resources response (Top 10 Capacity table; server-sorted via sort_by).
export interface PublicCloudDatabaseCapacityRowResponse {
  uuid?: string;
  db_instance?: string;
  database_instance?: string;
  max_allocated?: string | number;
  max_allocated_display?: string;
  allocated?: string | number;
  allocated_display?: string;
  space_free?: string | number;
  space_free_display?: string;
  utilization?: string | number;
  utilization_display?: string;
}

export interface PublicCloudDatabaseCapacityResponse {
  cloud?: string;
  sort_by?: string;
  count?: number;
  data?: PublicCloudDatabaseCapacityRowResponse[];
}

/*
 * ------ Cloud Storage Health (redesigned) ------
 */
export interface PublicCloudStorageMetricPoint {
  clock?: number;
  time?: string;
  value?: number;
}

// Response for the five Storage Performance trend cards (E2E, Success Server, Network/Query,
// Queue Depth, Utilization). Each renders an area chart from `points`.
export interface PublicCloudStorageMetricResponse {
  metric?: string;
  title?: string;
  value?: string | number;
  unit?: string;
  display_value?: string;
  change_percent?: number;
  trend_direction?: string;
  points?: PublicCloudStorageMetricPoint[];
}

export interface PublicCloudStorageHighLatencyDevice {
  device_name?: string;
  name?: string;
  p95_latency?: number;
  p95_latency_display?: string;
  is_high_latency?: boolean;
}

// Response for the High Latency Devices bar card (one bar per device P95 latency).
export interface PublicCloudStorageHighLatencyResponse {
  threshold?: number;
  threshold_display?: string;
  value?: string | number;
  high_latency_count?: number;
  total_devices?: number;
  data?: PublicCloudStorageHighLatencyDevice[];
}

export interface PublicCloudStoragePerformanceCard {
  key: string;
  title: string;
  valueLabel: string;
  unit: string;
  deltaLabel: string;
  deltaDirection: 'up' | 'down' | '';
  deltaTone: PublicCloudStatusTone;
  subtitle: string;
  chartType: 'area' | 'bar';
  hasData: boolean;
  options: EChartsOption;
}

export interface PublicCloudStorageResourceRowResponse {
  device_name?: string;
  name?: string;
  uuid?: string;
  type?: string;
  cloud?: string;
  cloud_key?: string;
  region?: string;
  cloud_region?: string;
  capacity?: string | number;
  capacity_display?: string;
  e2e_latency?: string | number;
  e2e_latency_display?: string;
  success_server_latency?: string | number;
  success_server_latency_display?: string;
  network_queue_delay?: string | number;
  network_queue_delay_display?: string;
  latency_health_score?: string | number;
  status?: string;
  status_icon?: string;
}

export interface PublicCloudStorageResourcesResponse {
  cloud?: string;
  hours?: number;
  sort_by?: string;
  count?: number;
  data?: PublicCloudStorageResourceRowResponse[];
}

// Numeric fields are null when the response omits them, so a missing reading renders as NA rather
// than a fabricated 0 (SF returns null latency and capacity on every storage row today).
export interface PublicCloudStorageResourceRow {
  deviceName: string;
  uuid: string;
  type: string;
  cloud: string;
  cloudRegion: string;
  capacity: string;
  capacityValue: number | null;
  e2eLatency: number | null;
  successServerLatency: number | null;
  networkQueueDelay: number | null;
  latencyHealthScore: number | null;
  status: string;
}

export interface PublicCloudWritePerformanceCellResponse {
  time?: string;
  value?: number | string;
  status?: string;
}

export interface PublicCloudWritePerformanceRowResponse {
  device_name?: string;
  name?: string;
  values?: PublicCloudWritePerformanceCellResponse[];
}

export interface PublicCloudWritePerformanceResponse {
  time_buckets?: string[];
  legend?: { [key: string]: string };
  data?: PublicCloudWritePerformanceRowResponse[];
}

export interface PublicCloudWritePerformanceCell {
  value: number;
  color: string;
}

export interface PublicCloudWritePerformanceRow {
  name: string;
  cells: PublicCloudWritePerformanceCell[];
}

export interface PublicCloudWritePerformanceViewData {
  labels: string[];
  rows: PublicCloudWritePerformanceRow[];
}

export interface PublicCloudLatencyBreakdownSegmentResponse {
  name?: string;
  label?: string;
  key?: string;
  value?: number | string;
  unit?: string;
  display_value?: string;
  percent?: number | string;
  percentage?: number | string;
  color?: string;
}

export interface PublicCloudLatencyBreakdownSummaryResponse {
  total_latency?: number | string;
  total_latency_display?: string;
  breakdown?: PublicCloudLatencyBreakdownSegmentResponse[];
}

export interface PublicCloudLatencyBreakdownResponse {
  cloud?: string;
  hours?: number;
  count?: number;
  summary?: PublicCloudLatencyBreakdownSummaryResponse;
  total?: number | string;
  unit?: string;
  segments?: PublicCloudLatencyBreakdownSegmentResponse[];
}

export interface PublicCloudLatencyBreakdownSegment {
  label: string;
  valueLabel: string;
  percent: number;
  percentLabel: string;
  color: string;
}

export interface PublicCloudLatencyBreakdownViewData {
  totalLabel: string;
  unit: string;
  segments: PublicCloudLatencyBreakdownSegment[];
  hasData: boolean;
}
