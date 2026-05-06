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

export interface DatabaseDashboardHealthMetric {
  label: string;
  value: string;
  tone: DatabaseDashboardTone;
}

export interface DatabaseDashboardHealthGroup {
  title: string;
  subtitle?: string;
  metrics: DatabaseDashboardHealthMetric[];
}

export interface DatabaseDashboardAlertSummaryMetric {
  label: string;
  value: string;
  tone: DatabaseDashboardTone;
}

export interface DatabaseDashboardCriticalAlert {
  id: string;
  deviceName: string;
  severity: 'critical' | 'high';
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}
