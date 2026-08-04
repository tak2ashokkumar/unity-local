import { NetappStorageMetric, NetappStorageTone } from './netapp-storage-dashboard.type';

export const NETAPP_STORAGE_TONE_CLASS: Record<NetappStorageTone, string> = {
  primary: 'text-blue',
  success: 'text-green',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted'
};

export const NETAPP_STORAGE_CLUSTER_METRICS: NetappStorageMetric[] = [
  { label: 'Used Capacity', value: '1.21 PB', tone: 'primary' },
  { label: 'Free Capacity', value: '0.61 PB', tone: 'primary' },
  { label: 'Availability', value: '99.97%', tone: 'success' },
  { label: 'Active Alerts', value: '12', tone: 'danger' },
  { label: 'Nodes', value: '5' },
  { label: 'Aggregates', value: '18' },
  { label: 'SVMs', value: '12' },
  { label: 'Volumes', value: '128' },
  { label: 'LUNs', value: '324' }
];

export const NETAPP_STORAGE_SECTIONS = [
  { key: 'node', title: 'Node Info & Metrics' },
  { key: 'agg', title: 'Aggregate Overview' },
  { key: 'svm', title: 'Storage Virtual Machine (SVM)' },
  { key: 'vol', title: 'Volume Overview' },
  { key: 'lun', title: 'LUN Overview' },
  { key: 'perf', title: 'Performance Metrics' },
  { key: 'capacity', title: 'Capacity Planning' },
  { key: 'ports', title: 'Port Overview' },
  { key: 'alerts', title: 'Recent Alerts' }
] as const;
