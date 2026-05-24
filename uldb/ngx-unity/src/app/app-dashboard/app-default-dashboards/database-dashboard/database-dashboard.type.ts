import { EChartsOption } from 'echarts';

export type DatabaseDashboardTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface DatabaseDashboardFilterOption {
  value: string;
  label: string;
}

export interface DatabaseDashboardFilterCriteria {
  databases: string[];
}

export interface DatabaseDashboardMetric {
  label: string;
  value: string;
  tone?: DatabaseDashboardTone;
}

export interface DatabaseDashboardDonutItem {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
}

export interface DatabaseDashboardBarItem {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface DatabaseDashboardStackedBarItem {
  name: string;
  active: number;
  inactive: number;
  color?: string;
  percentage?: string;
}

export interface DatabaseDashboardTagItem {
  name: string;
  count: number;
  textColor: string;
  backgroundColor: string;
}

export interface DatabaseDashboardVersionItem {
  name: string;
  count: number;
}


export interface DatabaseDashboardStorageUtilization {
  capacity: string;
  used: string;
  free: string;
  percent: number;
  tone: DatabaseDashboardTone;
}

export interface DatabaseDashboardDiskIops {
  label: string;
  percent: number;
  tone: DatabaseDashboardTone;
}

export interface DatabaseDashboardUtilizationRow {
  name: string;
  cpuSeries: number[];
  cpuStatus: number;
  cpuTone: DatabaseDashboardTone;
  memorySeries: number[];
  memoryStatus: number;
  memoryTone: DatabaseDashboardTone;
  storage: DatabaseDashboardStorageUtilization;
  diskIops: DatabaseDashboardDiskIops;
  upTime: string;
}

export interface DatabaseDashboardUtilizationViewRow extends DatabaseDashboardUtilizationRow {
  cpuChartOptions: EChartsOption;
  memoryChartOptions: EChartsOption;
}

export interface DatabaseDashboardCapacityMetric {
  label: string;
  value: string;
  helper: string;
}

export interface DatabaseDashboardStorageRow {
  server: string;
  used: string;
  free: number;
  dbSize: number;
  logSize: number;
  logGrowth: number;
}

export interface DbDashboardHealthMetric {
  label: string;
  value: string;
  tone: DatabaseDashboardTone;
}

export interface DbDashboardHealthGroup {
  title: string;
  subtitle?: string;
  metrics: DbDashboardHealthMetric[];
}

//single API response interface
//inventory
export interface InventoryWidgetType {
  total_databases: number;
  by_category: InventoryWidgetByCategoryType[];
  by_type: InventoryWidgetByPlatformType[];
  status: InventoryWidgetSummaryStatus;
  by_environment: InventoryWidgetByEnvironment[];
  by_version: InventoryWidgetByVersion[];
  by_tags: InventoryWidgetByTags[];
}
export interface InventoryWidgetByCategoryType {
  category: string;
  count: number;
  percentage: number;
}
export interface InventoryWidgetByPlatformType {
  db_type: string;
  active: number;
  inactive: number;
  percentage: number;
}
export interface InventoryWidgetSummaryStatus {
  active: number;
  inactive: number;
}
export interface InventoryWidgetByEnvironment {
  environment: string;
  count: number;
  percentage: number;
}
export interface InventoryWidgetByTags {
  tag: string;
  count: number;
  percentage: number;
}
export interface InventoryWidgetByVersion {
  version: string;
  count: number;
  percentage: number;
}

//performance workload
export interface DatabaseDashboardTop10Utilization {
  host_id: number;
  name: string;
  cpu_usage_system_percent: number;
  cpu_usage_user_percent: number;
  memory_used_percent: number;
  stroage_used: number;
  stroage_capacity: string;
  stroage_free_percent: number;
  disk_usage_percent: number;
  disk_read_ops: number;
  disk_write_ops: number;
  system_uptime_seconds: number;
}

export class DatabaseDashboardTop10UtilizationViewData {
  constructor() { }
  hostId: number;
  name: string;
  cpuChartOptions?: EChartsOption;
  cpuUtilizationPercent: number;
  cpuTone: string;
  memoryChartOptions?: EChartsOption;
  memoryUtilizationPercent: number;
  memoryTone: string;
  storageCapacityGB: string;
  storageUsedGB: number;
  storageUsedPercent: number;
  storageFreePercent: number;
  storageTone: string;
  diskIops: number;
  diskIopsTone: string;
  uptime: string;
}

export interface DatabaseDashboardTopQueryType {
  top_response_time: DBDashboardTopResponseTimeType[];
  top_latency: DBDashboardTopLatencyType[];
  top_connections: DBDashboardTopConnectionsType[];
  top_errors_deadlocks: DBDashboardTopErrorsDeadlocksType[];
  top_throughput: DBDashboardTopThroughputType[];
  top_cache_hit_ratio: DBDashboardTopCacheHitRatioType[];
}
export interface DBDashboardTopQueryType {
  host_id: number;
  name: string;
  db_type: string;
}
export interface DBDashboardTopResponseTimeType extends DBDashboardTopQueryType {
  response_time_ms: number;
}
export interface DBDashboardTopLatencyType extends DBDashboardTopQueryType {
  response_time_ms: number;
}
export interface DBDashboardTopConnectionsType extends DBDashboardTopQueryType {
  active_connections: number;
}
export interface DBDashboardTopErrorsDeadlocksType extends DBDashboardTopQueryType {
  deadlock_count: number;
}
// export interface DBDashboardTopThroughputType extends DBDashboardTopQueryType {
//   transactions_per_sec: number;
// }
export interface DBDashboardTopThroughputType {
  host_id: number;
  name: string;
  db_type: string;
  transactions_per_sec: number;
  trend: DBDashboardTopThroughputTrendType[];
}
export interface DBDashboardTopThroughputTrendType {
  date: string;
  value: number;
}
export interface DBDashboardTopCacheHitRatioType extends DBDashboardTopQueryType {
  hit_ratio_pct: number;
}

//Capacity Insights
export interface DBDashboardCapacityGrowthType {
  summary_stats: DBDashboardSummaryStats;
  top_servers: DBDashboardTopServersType[];
  top_tablespace_filesystem_usage: DBDashboardTopTableSpaceUsageType[];
  storage_growth_trend: any[];
  log_growth_rate: DBDashboardLogGrowthRateType[];
  disk_utilization: DBDashboardDiskUtilizationType[];
  log_size_by_server: DBDashboardLogSizeByServerType[];
  db_size_by_server: DBDashboardDbSizeByServerType[];
  archive_log_growth_trend: DBDashboardArchiveLogGrowthTrendType[];
}
export interface DBDashboardSummaryStats {
  total_db_size_gb: number;
  total_free_space_gb: number;
  avg_used_percentage: number;
}
export interface DBDashboardTopServersType {
  name: string;
  used_percentage: number;
  free_gb: number;
  db_size_gb: number;
  log_size_gb: number;
  log_growth_gb_per_day: number;
}

export class DBDashboardTopServersViewData {
  constructor() { }
  server: string;
  used: number;
  free: number;
  dbSize: number;
  logSize: number;
  logGrowth: number;
}

export interface DBDashboardTopTableSpaceUsageType {
  name: string;
  disk_used_pct: number;
  disk_free_gb: number;
  disk_total_gb: number;
}

export class DBDashboardTopTableSpaceUsageViewData {
  constructor() { }
  name: string;
  diskUsedPct: number;
  diskFreeGb: number;
  diskTotalGb: number;
}

export interface DBDashboardLogGrowthRateType {
  name: string;
  log_growth_gb_per_day: number;
}
export interface DBDashboardDiskUtilizationType {
  name: string;
  disk_used_pct: number;
  disk_free_gb: number;
  disk_total_gb: number;
}
export interface DBDashboardLogSizeByServerType {
  name: string;
  log_size_gb: number;
}
export interface DBDashboardDbSizeByServerType {
  name: string;
  db_size_gb: number;
}
export interface DBDashboardArchiveLogGrowthTrendType {
  name: string;
  trend: DBDashboardTrendType[];
}
export interface DBDashboardTrendType {
  date: string;
  log_growth_gb: number;
}

//Health
export interface DbDashboardHealthGroupType {
  summary: DbDashboardSummary;
  servers: DbDashboardServers[];
  replication_sync: DbDashboardReplicationSync;
}
export interface DbDashboardSummary {
  online: number;
  degraded: number;
  unreachable: number;
  maintenance: number;
  inactive: number;
  total: number;
}
export class DbDashboardSummaryViewData {
  constructor() { }
  online: number;
  degraded: number;
  unreachable: number;
  maintenance: number;
  inactive: number;
  total: number;
}
export interface DbDashboardServers {
  name: string;
  status: string;
  cpu_pct?: number;
}
export interface DbDashboardReplicationSync {
  summary: DbDashboardReplicationSyncSummary;
  servers: DbDashboardReplicationSyncServers[];
}
export interface DbDashboardReplicationSyncSummary {
  sync_healthy: number;
  lag_over_30s: number;
  deadlocks: number;
  errors_per_second: number;
  connection_errors: number;
  no_replication: number;
}
export class DbDashboardReplicationSyncSummaryData {
  constructor() { }
  syncHealthy: number;
  lagOver30s: number;
  deadlocks: number;
  errorsPerSecond: number;
  connectionErrors: number;
  noReplication: number;
}
export interface DbDashboardReplicationSyncServers {
  name: string;
  replication_status: string;
  lag_sec?: number;
  deadlock_count?: number;
  errors_per_sec?: number;
  connection_errors?: number;
}


//Alerts
export type DatabaseDashboardAlertSummaryKey = 'critical_alerts' | 'high_alerts' | 'open_itsm_tickets' | 'automation_success_pct' | 'automation_total_runs' | 'avg_mttr';

export interface DatabaseDashboardTopCriticalAlertsResponse {
  summary: DatabaseDashboardTopCriticalAlertsSummary;
  critical_alerts: DatabaseDashboardCriticalAlert[];
  high_alerts: DatabaseDashboardHighAlerts[];
}

export interface DatabaseDashboardTopCriticalAlertsSummary {
  critical_alerts: number;
  high_alerts: number;
  open_itsm_tickets: number;
  automation_success_pct: number;
  automation_total_runs: number;
  // avg_mttr: number;
}

export interface DatabaseDashboardCriticalAlert {
  uuid: string;
  id: number;
  device_name: string;
  severity?: string;
  description: string;
  source?: string;
  event_count: number;
  acknowledged: boolean;
  age: string;
}

interface DatabaseDashboardHighAlerts {
  id: string;
  device_name: string;
  description: string;
  event_count: number;
  acknowledged: boolean;
  age: string;
}

export interface DatabaseDashboardAlertSummaryMetric {
  key?: DatabaseDashboardAlertSummaryKey;
  label: string;
  value: string;
  tone: DatabaseDashboardTone;
  suffix?: string;
}

export class DatabaseDashboardCriticalAlertViewData {
  constructor() { }
  uuid: string;
  id: number;
  deviceName: string;
  severity: string;
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
  severityClass?: string;
  severityIcon?: string;
}
