import { EChartsOption } from 'echarts';

export type DatabaseDashboardTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface DatabaseDashboardFilterOption {
  value: string;
  label: string;
}

export interface DatabaseDashboardFilterCriteria {
  databases: string[];
}

// Inventory Overview Widget Type Start 
export interface InventoryWidgetType {
  total_databases: number;
  by_type: ByTypeItem[];
  status: SummaryStatus;
  by_environment: ByEnvironmentItem[];
  by_version: ByVersionItem[];
  by_tags: ByTagsItem[];
}
export interface ByTypeItem {
  db_type: string;
  count: number;
  percentage: number;
}
export interface SummaryStatus {
  active: number;
  inactive: number;
}
export interface ByEnvironmentItem {
  environment: string;
  count: number;
  percentage: number;
}
export interface ByVersionItem {
  version: string;
  count: number;
  percentage: number;
}
export interface ByTagsItem {
  tag: string;
  count: number;
  percentage: number;
}
// Inventory Overview Widget Type Ends

export interface DatabaseDashboardMetric {
  label: string;
  value: string;
  tone?: DatabaseDashboardTone;
}

export interface DatabaseDashboardDonutItem {
  name: string;
  value: number;
  color: string;
}

export interface DatabaseDashboardBarItem {
  name: string;
  value: number;
  label?: string;
  color: string;
}

export interface DatabaseDashboardTagItem {
  name: string;
  count: string;
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

//HealthGroup
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
  constructor(){}
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
  cpu_pct: number;
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
  constructor(){}
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
  lag_sec: number;
  deadlock_count: number;
  errors_per_sec: number;
  connection_errors: number;
}

//Database
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
  avg_mttr: number;
}

export interface DatabaseDashboardCriticalAlert {
  id: string;
  device_name: string;
  severity: string;
  description: string;
  source: string;
  event_count: number;
  acknowledged: string;
  age: string;
}

interface DatabaseDashboardHighAlerts {
  id: string;
  device_name: string;
  description: string;
  event_count: number;
  acknowledged: string;
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
  id: string;
  deviceName: string;
  severity: string;
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
  severityClass?: string;
  severityIcon?: string;
}
