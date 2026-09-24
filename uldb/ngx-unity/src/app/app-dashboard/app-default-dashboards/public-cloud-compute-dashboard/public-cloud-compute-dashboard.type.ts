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

export type PublicCloudInventorySummaryKey = 'cloud_accounts' | 'active_regions' | 'compute_vm' | 'platform_services_count' | 'other_services_count' | 'running_compute_instances' | 'stopped_compute_instances';
export type PublicCloudProviderDistributionKey = 'aws' | 'azure' | 'gcp' | 'oci';

// inventory_summary response is a flat map of KPI key -> value.
export type PublicCloudInventorySummaryResponse = Partial<Record<PublicCloudInventorySummaryKey, number>>;

// compute_monitored response: one row per provider that has data.
export interface PublicCloudComputeMonitoredResponseItem {
  provider?: string;
  monitored?: number;
  total_compute?: number;
  unknown?: number;
  monitored_percentage?: number;
  running?: number;
  stopped?: number;
}

export type PublicCloudComputeMonitoredResponse = PublicCloudComputeMonitoredResponseItem[];

export interface PublicCloudComputeMonitoredCard {
  key: PublicCloudProviderDistributionKey | string;
  provider: string;
  iconClass: string;
  color: string;
  totalCompute: number;
  monitored: number;
  running: number;
  stopped: number;
  unknown: number;
  runningPercent: number;
  stoppedPercent: number;
  unknownPercent: number;
}

// cloud_provider_distribution response (drives the provider donut).
export interface PublicCloudProviderDistributionResponseItem {
  provider?: string;
  count?: number;
  percentage?: number;
}

export interface PublicCloudProviderDistributionResponse {
  distribution?: PublicCloudProviderDistributionResponseItem[];
  total_compute_instances?: number;
}

export interface PublicCloudProviderDistributionItem {
  key: PublicCloudProviderDistributionKey;
  name: string;
  count: number;
  value: number;
  color: string;
}

// utilization_by_provider response: { <provider>: { storage, compute, database } }.
export interface PublicCloudUtilizationProviderValue {
  storage?: number;
  compute?: number;
  database?: number;
}

export type PublicCloudUtilizationByProviderResponse = Record<string, PublicCloudUtilizationProviderValue>;

// compute_instance_by_os_type response (drives the OS type donut).
export interface PublicCloudOsTypeResponse {
  linux?: number;
  windows?: number;
  other?: number;
  total?: number;
}

export interface PublicCloudOsTypeItem {
  key: string;
  label: string;
  value: number;
  percent: number;
  color: string;
}

// alerts_severity_details response (drives the severity pills).
export interface PublicCloudAlertsSeverityResponse {
  critical?: number;
  warning?: number;
  info?: number;
}

export interface PublicCloudAlertsSeverityItem {
  key: string;
  label: string;
  value: number;
  toneClass: string;
}

// ----- Capacity and Performance widget -----
export interface PublicCloudCapacityPerformanceRowResponse {
  id?: string;
  name?: string;
  provider?: string;
  region?: string;
  account?: string;
  type?: string;
  os?: string;
  state?: string;
  status?: string;
  cpuPct?: number;
  cpuStatus?: string;
  memPct?: number;
  memStatus?: string;
  availableMemory?: string;
  availableMemoryBytes?: number;
  storPct?: number;
  storStatus?: string;
  diskIOPS?: number;
  diskThroughputMBs?: number;
  netThroughputMbps?: number;
  netStatus?: string;
  cpuTrend?: number[];
  cpuForecast90d?: number;
  forecastStatus?: string;
  monitored?: boolean;
}

export interface PublicCloudCapacityPerformanceTableResponse {
  count?: string | number;
  next?: string | null;
  previous?: string | null;
  results?: PublicCloudCapacityPerformanceRowResponse[];
  data?: PublicCloudCapacityPerformanceRowResponse[];
  items?: PublicCloudCapacityPerformanceRowResponse[];
}

export interface PublicCloudCapacityPerformanceRow {
  id: string;
  name: string;
  providerKey: string;
  provider: string;
  region: string;
  type: string;
  os: string;
  statusLabel: string;
  statusIconClass: string;
  cpuPct: number;
  cpuLabel: string;
  cpuTone: PublicCloudStatusTone;
  memoryPct: number;
  memoryLabel: string;
  memoryTone: PublicCloudStatusTone;
  availableMemory: string;
  diskIops: string;
  diskThroughput: string;
  networkThroughput: string;
  networkColor: string;
  cpuTrendPoints: string;
  cpuTrendColor: string;
  hasCpuTrend: boolean;
  forecastLabel: string;
  forecastDirection: 'up' | 'down' | '';
  forecastColor: string;
}

export interface PublicCloudCapacityChartSeries {
  label?: string;
  status?: string;
  data?: number[];
}

export interface PublicCloudCapacityFleetStatus {
  labels?: string[];
  series?: PublicCloudCapacityChartSeries[];
}

export interface PublicCloudCapacityCpuBand {
  label?: string;
  min?: number;
  max?: number;
  status?: string;
  count?: number;
}

export interface PublicCloudCapacityCpuDistribution {
  labels?: string[];
  statuses?: string[];
  counts?: number[];
  bands?: PublicCloudCapacityCpuBand[];
}

export interface PublicCloudCapacityTopItem {
  name?: string;
  provider?: string;
  status?: string;
  value?: number;
}

export interface PublicCloudCapacityGrowthInsights {
  months?: string[];
  forecastMonths?: string[];
  cpuHistory?: number[];
  memHistory?: number[];
  cpuForecast?: number[];
  memForecast?: number[];
}

export interface PublicCloudCapacityPerformanceChartsResponse {
  fleetStatusByProvider?: PublicCloudCapacityFleetStatus;
  cpuDistribution?: PublicCloudCapacityCpuDistribution;
  top10Cpu?: PublicCloudCapacityTopItem[];
  top10DiskIops?: PublicCloudCapacityTopItem[];
  top10NetworkThroughput?: PublicCloudCapacityTopItem[];
  capacityAndGrowthInsights?: PublicCloudCapacityGrowthInsights;
}

// ----- Storage - Volumes / Disks widget -----
export interface PublicCloudStorageVolumeRowResponse {
  volume_name?: string;
  attached_instance?: string;
  provider?: string;
  volume_type?: string;
  size_gb?: number | null;
  disk_iops_throughput?: string;
  iops_tier?: string;
}

export interface PublicCloudStorageVolumesTableResponse {
  count?: string | number;
  next?: string | null;
  previous?: string | null;
  results?: PublicCloudStorageVolumeRowResponse[];
  data?: PublicCloudStorageVolumeRowResponse[];
  items?: PublicCloudStorageVolumeRowResponse[];
}

export interface PublicCloudStorageVolumeRow {
  volumeName: string;
  attachedInstance: string;
  providerKey: string;
  provider: string;
  volumeType: string;
  sizeLabel: string;
  diskIops: string;
  diskThroughput: string;
  iopsTier: string;
}

export interface PublicCloudStorageProvisionedByProvider {
  provider?: string;
  total_provisioned_storage_gb?: number;
  volume_count?: number;
  volumes_with_size?: number;
}

export interface PublicCloudStorageTopVolumeResponse {
  volume_name?: string;
  attached_instance?: string;
  provider?: string;
  volume_type?: string;
  size_gb?: number | null;
  disk_iops?: number;
  throughput_mbps?: number;
  disk_iops_throughput?: string;
  iops_tier?: string;
}

export interface PublicCloudStorageIopsTier {
  performance_tier?: string;
  volume_count?: number;
  total_disk_iops?: number;
}

export interface PublicCloudStorageTierLegendItem {
  label: string;
  count: number;
  color: string;
}

// ----- Instance Provisioning Summary widget -----
export interface PublicCloudProvisioningRowResponse {
  instance_name?: string;
  provider?: string;
  region?: string;
  account?: string;
  type?: string;
  environment?: string;
  status?: string;
  provisioned_date?: string;
  days_since_provisioned?: number;
}

export interface PublicCloudProvisioningTableResponse {
  count?: string | number;
  next?: string | null;
  previous?: string | null;
  results?: PublicCloudProvisioningRowResponse[];
  data?: PublicCloudProvisioningRowResponse[];
  items?: PublicCloudProvisioningRowResponse[];
}

export interface PublicCloudProvisioningRow {
  instanceName: string;
  providerKey: string;
  provider: string;
  region: string;
  account: string;
  type: string;
  environment: string;
  environmentClass: string;
  statusLabel: string;
  statusIconClass: string;
  provisionedDate: string;
  daysSinceProvisioned: number;
}

export interface PublicCloudProvisioningReachability {
  reachable?: number;
  unreachable?: number;
  reachable_percentage?: number;
}

export interface PublicCloudProvisionedByProvider {
  provider?: string;
  count?: number;
}

export interface PublicCloudRecentlyProvisioned {
  instance_name?: string;
  provider?: string;
  provisioned_date?: string;
}

export interface PublicCloudProvisioningSummaryMetricsResponse {
  reachable_rate?: number;
  unreachable?: number;
  average_provisioning_time_minutes?: number;
  instances_provisioned?: number;
}

export interface PublicCloudProvisioningSummaryMetric {
  label: string;
  value: string;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudProvisioningReachabilityLegendItem {
  label: string;
  percent: string;
  color: string;
}

// ----- Public Cloud Database widget -----
export interface PublicCloudDatabaseSummaryResponse {
  databasesMonitored?: number;
  queriesPerSec?: number;
  avgLatencyMs?: number;
  availabilityPct?: number;
  activeConnections?: number;
}

export interface PublicCloudDatabaseDiscoveryItem {
  discovered?: number;
  monitored?: number;
  healthy?: number;
  degraded?: number;
  unknown?: number;
}

export interface PublicCloudDatabaseInventoryResponse {
  summary?: PublicCloudDatabaseSummaryResponse;
  discovery?: Record<string, PublicCloudDatabaseDiscoveryItem>;
}

export interface PublicCloudDatabaseSummaryMetric {
  label: string;
  value: string;
  tone?: PublicCloudStatusTone;
  info: string;
}

export interface PublicCloudDatabaseMonitoredCard {
  key: PublicCloudProviderDistributionKey | string;
  provider: string;
  iconClass: string;
  color: string;
  discovered: number;
  monitored: number;
  healthy: number;
  degraded: number;
  unknown: number;
  healthyPercent: number;
  degradedPercent: number;
  unknownPercent: number;
}

// ----- Database - Performance and Utilization widget -----
export interface PublicCloudDbWorkloadRowResponse {
  name?: string;
  db_uuid?: string;
  host_uuid?: string;
  host_id?: number;
  cpu_usage_system_percent?: number;
  memory_used_percent?: number;
  disk_used_gb?: number;
  disk_capacity_gb?: number;
  disk_utilization_percent?: number;
  disk_iops?: number;
  disk_iops_max?: number;
  disk_read_ops_per_sec?: number;
  disk_write_ops_per_sec?: number;
  system_uptime_seconds?: number;
}

export type PublicCloudDbWorkloadResponse = PublicCloudDbWorkloadRowResponse[];

export interface PublicCloudDbWorkloadRow {
  name: string;
  engine: string;
  cpuPct: number;
  cpuLabel: string;
  cpuTone: PublicCloudStatusTone;
  memoryPct: number;
  memoryLabel: string;
  memoryTone: PublicCloudStatusTone;
  storagePct: number;
  storageTone: PublicCloudStatusTone;
  storageTotalLabel: string;
  storageUsedLabel: string;
  diskUtilizationPct: number;
  diskUtilizationLabel: string;
  diskUtilizationTone: PublicCloudStatusTone;
  diskIops: string;
  uptimeLabel: string;
}

export interface PublicCloudDbTrendPoint {
  date?: string;
  transactions_per_sec?: number;
}

export interface PublicCloudDbQueryItem {
  status?: string;
  name?: string;
  db_type?: string;
  host_id?: number;
  db_uuid?: string;
  host_uuid?: string;
  hit_ratio_pct?: number;
  response_time_ms?: number;
  deadlock_count?: number;
  active_connections?: number;
  transactions_per_sec?: number;
  trend?: PublicCloudDbTrendPoint[];
}

export interface PublicCloudDbQueryPerformanceResponse {
  top_cache_hit_ratio?: PublicCloudDbQueryItem[];
  top_latency?: PublicCloudDbQueryItem[];
  top_errors_deadlocks?: PublicCloudDbQueryItem[];
  top_throughput?: PublicCloudDbQueryItem[];
  top_response_time?: PublicCloudDbQueryItem[];
  top_connections?: PublicCloudDbQueryItem[];
  duration?: string;
}

export interface PublicCloudGeoCell {
  name: string;
  cloudType: string;
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

export interface PublicCloudGeoDistributionSummary {
  totalLocations: number;
  totalResources: number;
  totalAlerts: number;
}

export interface PublicCloudGeoDistributionLegendItem {
  key: string;
  label: string;
  count: number;
  color: string;
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
  provider?: string;
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

export interface PublicCloudRecentAlertRow {
  id: string;
  uuid: string;
  instanceName: string;
  severity: PublicCloudRecentAlertSeverity;
  severityLabel: string;
  severityClass: string;
  providerKey: string;
  provider: string;
  alert: string;
  raised: string;
  raisedHours: number;
}

export interface PublicCloudAlertsBySeverity {
  total?: number;
  critical?: number;
  warning?: number;
  info?: number;
}

export interface PublicCloudAlertsByProvider {
  provider?: string;
  alert_count?: number;
}

export interface PublicCloudAlertsByAge {
  '<24h'?: number;
  '1-7d'?: number;
  '7-30d'?: number;
  '30d+'?: number;
}

export interface PublicCloudAlertSeverityLegendItem {
  label: string;
  count: number;
  color: string;
}

// ----- Cost & Optimization Opportunities widget -----
export interface PublicCloudCostRowResponse {
  instance?: string;
  provider?: string;
  region?: string;
  type?: string;
  cpu?: number;
  utilization?: number | null;
  recommended_action?: string;
  estimated_monthly_savings?: number;
}

export interface PublicCloudCostOptimizationTableResponse {
  count?: string | number;
  next?: string | null;
  previous?: string | null;
  results?: PublicCloudCostRowResponse[];
  data?: PublicCloudCostRowResponse[];
  items?: PublicCloudCostRowResponse[];
}

export interface PublicCloudCostRow {
  instance: string;
  providerKey: string;
  provider: string;
  region: string;
  type: string;
  cpuPct: number;
  cpuLabel: string;
  cpuTone: PublicCloudStatusTone;
  action: string;
  actionClass: string;
  savings: number;
  savingsLabel: string;
}

export interface PublicCloudSpendVsSavings {
  current_monthly_spend?: number;
  identified_savings?: number;
}

export interface PublicCloudRecommendedAction {
  recommended_action?: string;
  count?: number;
}

export interface PublicCloudPotentialSavingsByProvider {
  provider?: string;
  estimated_monthly_savings?: number;
}

export interface PublicCloudSpendSavingsLegendItem {
  text: string;
  color: string;
}

export interface PublicCloudCostSummaryMetric {
  label: string;
  value: string;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudAutoRemediationOutcomeResponse {
  label?: string;
  name?: string;
  key?: string;
  count?: string | number;
  value?: string | number;
  percentage?: string | number;
  percent?: string | number;
}

export interface PublicCloudAutoRemediationActionResponse {
  label?: string;
  name?: string;
  action?: string;
  count?: string | number;
  value?: string | number;
  percentage?: string | number;
  percent?: string | number;
}

export interface PublicCloudAutoRemediationKpiResponse {
  label?: string;
  name?: string;
  key?: string;
  value?: string | number;
  tone?: PublicCloudStatusTone;
}

export interface PublicCloudAutoRemediationSummaryResponse {
  autoRemediations?: string | number;
  total_runs?: string | number;
  totalRuns?: string | number;
  total?: string | number;
  successfulRuns?: string | number;
  failedRuns?: string | number;
  runningRuns?: string | number;
  runbookSuccessPct?: string | number;
  runbookFailurePct?: string | number;
  avgDurationMinutes?: string | number;
  avgMttr?: string;
  configuredCount?: string | number;
  avg_duration?: string | number;
  avgDuration?: string | number;
  average_duration?: string | number;
  averageDuration?: string | number;
  duration_unit?: string;
  durationUnit?: string;
  outcomes?: PublicCloudAutoRemediationOutcomeResponse[] | Record<string, string | number | PublicCloudAutoRemediationOutcomeResponse>;
  run_outcomes?: PublicCloudAutoRemediationOutcomeResponse[] | Record<string, string | number | PublicCloudAutoRemediationOutcomeResponse>;
  runOutcomes?: PublicCloudAutoRemediationOutcomeResponse[] | Record<string, string | number | PublicCloudAutoRemediationOutcomeResponse>;
  actions?: PublicCloudAutoRemediationActionResponse[];
  frequent_actions?: PublicCloudAutoRemediationActionResponse[];
  frequentActions?: PublicCloudAutoRemediationActionResponse[];
  most_frequent_actions?: PublicCloudAutoRemediationActionResponse[];
  mostFrequentActions?: PublicCloudAutoRemediationActionResponse[];
  topAutoRemediationActions?: PublicCloudAutoRemediationActionResponse[];
  kpis?: PublicCloudAutoRemediationKpiResponse[];
  metrics?: PublicCloudAutoRemediationKpiResponse[];
  data?: PublicCloudAutoRemediationSummaryResponse;
}

export interface PublicCloudAutoRemediationOutcome {
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface PublicCloudAutoRemediationAction {
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface PublicCloudAutoRemediationKpi {
  label: string;
  value: string;
  tone: PublicCloudStatusTone;
}

export interface PublicCloudAutoRemediationSummaryViewData {
  outcomes: PublicCloudAutoRemediationOutcome[];
  actions: PublicCloudAutoRemediationAction[];
  kpis: PublicCloudAutoRemediationKpi[];
  totalRunsLabel: string;
  avgDurationLabel: string;
  donutGradient: string;
  hasData: boolean;
}

export interface PublicCloudAccountSubscriptionMetricResponseItem {
  provider?: string;
  account?: string;
  accountName?: string;
  account_name?: string;
  subscription?: string;
  project?: string;
  compartment?: string;
  region?: string;
  instanceCount?: string | number;
  instance_count?: string | number;
  usedVcpu?: string | number;
  used_vcpu?: string | number;
  totalVcpu?: string | number;
  total_vcpu?: string | number;
  estimatedMonthlyCost?: string | number;
  estimated_monthly_cost?: string | number;
  monthlyCost?: string | number;
  monthly_cost?: string | number;
}

export interface PublicCloudAccountSubscriptionMetricsResponse {
  count?: string | number;
  total?: string | number;
  results?: PublicCloudAccountSubscriptionMetricResponseItem[];
  data?: PublicCloudAccountSubscriptionMetricResponseItem[];
  items?: PublicCloudAccountSubscriptionMetricResponseItem[];
}

export type PublicCloudAccountSubscriptionMetricsApiResponse = PublicCloudAccountSubscriptionMetricsResponse | PublicCloudAccountSubscriptionMetricResponseItem[];

export interface PublicCloudAccountMetricChartResponseItem {
  provider?: string;
  account?: string;
  instance_count?: string | number;
  estimated_monthly_cost?: string | number;
  vcpu_utilization?: string | number;
  cost_per_instance?: string | number;
}

export type PublicCloudAccountMetricChartResponse = PublicCloudAccountMetricChartResponseItem[];

export interface PublicCloudAccountSubscriptionMetricRow {
  provider: string;
  account: string;
  region: string;
  instanceCount: number;
  usedVcpu: number;
  totalVcpu: number;
  vcpuPercent: number;
  vcpuTone: PublicCloudStatusTone;
  estimatedMonthlyCost: number;
  estimatedMonthlyCostLabel: string;
}

export interface PublicCloudSortState {
  key: string;
  direction: 'asc' | 'desc';
}

