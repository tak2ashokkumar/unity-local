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

export type PublicCloudComputeBreakdownProviderKey = 'google_cloud' | 'azure' | 'aws' | 'oracle';
export type PublicCloudComputeBreakdownStatKey = 'virtual_machine' | 'containers' | 'kubernetes';
export type PublicCloudComputeBreakdownResponse = Partial<Record<PublicCloudComputeBreakdownProviderKey, Partial<Record<PublicCloudComputeBreakdownStatKey, number>>>>;

export interface PublicCloudComputeBreakdownProvider {
  key: PublicCloudComputeBreakdownProviderKey;
  name: string;
  displayName: string;
  brandClass: string;
  logoPath: string;
  stats: PublicCloudComputeBreakdownStat[];
}

export interface PublicCloudComputeBreakdownStat {
  key: PublicCloudComputeBreakdownStatKey;
  name: string;
  value: number;
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
