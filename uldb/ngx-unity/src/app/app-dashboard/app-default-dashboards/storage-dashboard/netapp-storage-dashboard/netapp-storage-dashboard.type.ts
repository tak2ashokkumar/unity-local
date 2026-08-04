import { EChartsOption } from 'echarts';

export type NetappStorageTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';
export type NetappStorageViewMode = 'table' | 'chart';

export interface NetappStorageMetric {
  label: string;
  value: string;
  tone?: NetappStorageTone;
}

export interface NetappStorageChartCard {
  title: string;
  option: EChartsOption;
  span?: number;
}

export interface NetappStorageSection {
  key: string;
  title: string;
  metrics: NetappStorageMetric[];
  columns: string[];
  rows: string[][];
  charts: NetappStorageChartCard[];
}

export interface NetappStorageDashboardViewData {
  clusterOverview: {
    title: string;
    metrics: NetappStorageMetric[];
  };
}
