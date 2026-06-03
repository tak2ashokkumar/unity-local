import { environment } from 'src/environments/environment';
import {
  PublicCloudComputeBreakdownProviderKey,
  PublicCloudComputeBreakdownStatKey,
  PublicCloudInventorySummaryKey,
  PublicCloudProviderDistributionKey,
  PublicCloudTagItem
} from './public-cloud-compute-dashboard.type';

export const PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT = '/customer/public-cloud-widgets/inventory_summary/';
export const PUBLIC_CLOUD_COMPUTE_BREAKDOWN_ENDPOINT = '/customer/public-cloud-widgets/compute_breakdown/';
export const PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT = '/customer/public-cloud-widgets/orphaned_devices/';
export const PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT = '/customer/public-cloud-widgets/orphaned_devices_by_category/';
export const PUBLIC_CLOUD_IDLE_DEVICES_ENDPOINT = '/customer/public-cloud-widgets/idle_devices/';
export const PUBLIC_CLOUD_IDLE_DEVICES_BY_DURATION_ENDPOINT = '/customer/public-cloud-widgets/idle_devices_by_duration/';
export const PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT = '/customer/public-cloud-widgets/recent_alerts/';
export const PUBLIC_CLOUD_DATABASE_HEALTH_SCORE_ENDPOINT = '/customer/public-cloud-widgets/database_health_score/';
export const PUBLIC_CLOUD_ACTIVE_DATABASE_WORKLOAD_ENDPOINT = '/customer/public-cloud-widgets/active_database_workload/';
export const PUBLIC_CLOUD_DATABASE_LATENCY_OVERVIEW_ENDPOINT = '/customer/public-cloud-widgets/database_latency_overview/';
export const PUBLIC_CLOUD_TOP_LOCK_CONTENTION_ENDPOINT = '/customer/public-cloud-widgets/top_lock_contention/';
export const PUBLIC_CLOUD_TOP_MEMORY_CONSUMERS_ENDPOINT = '/customer/public-cloud-widgets/top_memory_consumers/';
export const PUBLIC_CLOUD_TOP_STORAGE_CONSUMERS_ENDPOINT = '/customer/public-cloud-widgets/top_storage_consumers/';
export const PUBLIC_CLOUD_STORAGE_HEALTH_ENDPOINT = '/customer/public-cloud-widgets/cloud_storage_health/';
export const PUBLIC_CLOUD_STORAGE_UTILIZATION_BY_CLOUD_ENDPOINT = '/customer/public-cloud-widgets/storage_utilization_by_cloud/';
export const PUBLIC_CLOUD_READ_VS_WRITE_TRAFFIC_ENDPOINT = '/customer/public-cloud-widgets/read_vs_write_traffic/';
export const PUBLIC_CLOUD_TRANSACTION_VOLUME_TREND_ENDPOINT = '/customer/public-cloud-widgets/transaction_volume_trend/';
export const PUBLIC_CLOUD_OBJECT_FILE_GROWTH_TREND_ENDPOINT = '/customer/public-cloud-widgets/object_and_file_growth_trend/';
export const PUBLIC_CLOUD_STORAGE_SERVICES_VISIBILITY_ENDPOINT = '/customer/public-cloud-widgets/storage_services_visibility/';
export const PUBLIC_CLOUD_STORAGE_DISTRIBUTION_ENDPOINT = '/customer/public-cloud-widgets/cloud_storage_distribution/';
export const PUBLIC_CLOUD_FILTERS_ENDPOINT = '/customer/public-cloud-widgets/public_cloud_filters/';
export const PUBLIC_CLOUD_ALL_SELECTED_VALUE = 'all';

export const PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG: Array<{ key: PublicCloudInventorySummaryKey, label: string }> = [
  { key: 'cloud_accounts', label: 'Cloud Accounts' },
  { key: 'active_regions', label: 'Active Region' },
  { key: 'vms', label: 'VM' },
  { key: 'services', label: 'Services' },
  { key: 'running_resources', label: 'Running Resources' },
  { key: 'stopped_resources', label: 'Stopped Resources' }
];

export const PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG: Record<PublicCloudProviderDistributionKey, { name: string, color: string }> = {
  aws: { name: 'AWS', color: '#ff8a00' },
  azure: { name: 'Azure', color: '#1683d8' },
  gcp: { name: 'GCP', color: '#5b80f5' },
  oci: { name: 'OCI', color: '#d34b35' }
};

export const PUBLIC_CLOUD_TAG_STYLE_CONFIG: PublicCloudTagItem[] = [
  { name: 'ERP', count: '', textColor: '#e24f5d', backgroundColor: '#fde8ea' },
  { name: 'CRM', count: '', textColor: '#b77721', backgroundColor: '#fff0d8' },
  { name: 'Analytics', count: '', textColor: '#2c76c4', backgroundColor: '#e8f2ff' },
  { name: 'DevOps', count: '', textColor: '#008f68', backgroundColor: '#dff6ed' },
  { name: 'Other', count: '', textColor: '#6f7782', backgroundColor: '#eceff2' }
];

export const PUBLIC_CLOUD_COMPUTE_BREAKDOWN_PROVIDER_CONFIG: Array<{
  key: PublicCloudComputeBreakdownProviderKey,
  name: string,
  displayName: string,
  brandClass: string,
  logoPath: string
}> = [
  {
    key: 'google_cloud',
    name: 'gcp',
    displayName: 'Google Cloud',
    brandClass: 'gcp',
    logoPath: `${environment.assetsUrl}external-brand/logos/Google_Cloud_Platform-Logo 1.svg`
  },
  {
    key: 'azure',
    name: 'azure',
    displayName: 'Azure',
    brandClass: 'azure',
    logoPath: `${environment.assetsUrl}external-brand/logos/Microsoft_Azure_Logo 1.svg`
  },
  {
    key: 'aws',
    name: 'aws',
    displayName: 'amazon web services',
    brandClass: 'aws',
    logoPath: `${environment.assetsUrl}external-brand/logos/amazon-web-services.svg`
  },
  {
    key: 'oracle',
    name: 'oracle',
    displayName: 'ORACLE Cloud Infrastructure',
    brandClass: 'oracle',
    logoPath: `${environment.assetsUrl}external-brand/logos/Oracle-cloud 1.svg`
  }
];

export const PUBLIC_CLOUD_COMPUTE_BREAKDOWN_STAT_CONFIG: Array<{ key: PublicCloudComputeBreakdownStatKey, name: string }> = [
  { key: 'virtual_machine', name: 'Virtual Machine' },
  { key: 'containers', name: 'Containers' },
  { key: 'kubernetes', name: 'Kubernetes' }
];

export const PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS = [
  '#6b7ff5',
  '#6ccf91',
  '#ffb04b',
  '#16c7d9',
  '#8b7cf6',
  '#f06a6a',
  '#46a3f3',
  '#9aa6b2'
];

export const PUBLIC_CLOUD_IDLE_DURATION_COLORS = [
  '#13bd77',
  '#ff8a00',
  '#d63b3b',
  '#ff9aa2'
];

export const PUBLIC_CLOUD_DATABASE_WIDGET_COLORS = [
  '#5fa2dd',
  '#c5a074',
  '#efab79',
  '#65cfa0',
  '#c96f72',
  '#8acfae',
  '#ff9f32',
  '#f68d93',
  '#f7dda7',
  '#43c78c'
];

export const PUBLIC_CLOUD_DATABASE_HEALTH_METRIC_COLORS: Record<string, string> = {
  latency: '#13bd77',
  locks: '#ff8900',
  memory: '#d63b3b',
  storage: '#ff8900'
};

export const PUBLIC_CLOUD_DATABASE_LATENCY_COLORS: Record<string, string> = {
  healthy: '#43c78c',
  success: '#43c78c',
  low: '#43c78c',
  '<100ms': '#43c78c',
  warning: '#ff8900',
  medium: '#ff8900',
  '100-500ms': '#ff8900',
  danger: '#d90000',
  critical: '#d90000',
  high: '#d90000',
  '>500ms': '#d90000'
};

export const PUBLIC_CLOUD_STORAGE_UTILIZATION_COLORS = [
  '#6b84d6',
  '#95cf7c',
  '#f8cb61',
  '#ec6b6b'
];

export const PUBLIC_CLOUD_STORAGE_TREND_COLORS: Record<string, string> = {
  aws: '#5a7ed8',
  azure: '#7fc36b',
  gcp: '#f6b94b',
  oci: '#ff5b61',
  oracle: '#ff5b61',
  blob: '#5a7ed8',
  file: '#7fc36b',
  object: '#f6b94b',
  table: '#ff5b61',
  read: '#2f73c4',
  write: '#f28a25'
};

export const PUBLIC_CLOUD_STORAGE_DISTRIBUTION_COLORS: Record<string, string> = {
  'object storage': '#3376bd',
  'file storage': '#28a878',
  'queue storage': '#c77f13',
  'table storage': '#5e4bd0'
};
