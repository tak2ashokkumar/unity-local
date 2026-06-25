import {
  PublicCloudInventorySummaryKey,
  PublicCloudProviderDistributionKey,
  PublicCloudTagItem
} from './public-cloud-compute-dashboard.type';

export const PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT = '/customer/public-cloud-widgets/inventory_summary/';
// Public Cloud Infrastructure Coverage reuses the existing Navigator Central (Unified AIOPS) dashboard endpoint.
export const PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/aiops-dashboard/public-cloud-infra-coverage/';
export const PUBLIC_CLOUD_PERFORMANCE_HOTSPOTS_ENDPOINT = '/customer/public-cloud-widgets/performance_hotspots/';
// Sortable columns send their key as the `sort` query param; CPU Utilization is the default.
export const PUBLIC_CLOUD_PERFORMANCE_HOTSPOTS_DEFAULT_SORT = 'cpu_utilization';
export const PUBLIC_CLOUD_PERFORMANCE_HOTSPOTS_SORT_COLUMNS: Array<{ key: string, label: string }> = [
  { key: 'cpu_utilization', label: 'CPU Utilization' },
  { key: 'available_memory', label: 'Available Memory' },
  { key: 'disk_size', label: 'Disk Size' },
  { key: 'network_traffic', label: 'Network Traffic' }
];
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
export const PUBLIC_CLOUD_LATENCY_HEATMAP_ENDPOINT = '/customer/public-cloud-widgets/latency_heatmap/';
export const PUBLIC_CLOUD_QUEUE_BACKLOG_MONITOR_ENDPOINT = '/customer/public-cloud-widgets/queue_backlog_monitor/';
export const PUBLIC_CLOUD_FILTERS_ENDPOINT = '/customer/public-cloud-widgets/public_cloud_filters/';
// Geo Distribution reuses the existing Navigator Central (Unified AIOPS) dashboard endpoint.
export const PUBLIC_CLOUD_GEO_DISTRIBUTION_ENDPOINT = '/customer/aiops-dashboard/geo-distribution-global-ops/';
export const PUBLIC_CLOUD_ALL_SELECTED_VALUE = 'all';

export const PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG: Array<{ key: PublicCloudInventorySummaryKey, label: string }> = [
  { key: 'cloud_accounts', label: 'Cloud Accounts' },
  { key: 'active_regions', label: 'Active Region' },
  { key: 'vms', label: 'VM' },
  { key: 'services', label: 'Services' },
  { key: 'running_resources', label: 'Running Resources' },
  { key: 'stopped_resources', label: 'Stopped Resources' },
  { key: 'orphaned_vms', label: 'Orphaned VMs' },
  { key: 'idle_vms', label: 'Idle VMs' }
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

// Public Cloud Infrastructure Coverage is rendered as three groups (Compute, Platform Services,
// Other Services); each group shows one card per public cloud provider that has data.
export const PUBLIC_CLOUD_COVERAGE_GROUP_ORDER = ['compute', 'platform_services', 'other_services'];

export const PUBLIC_CLOUD_COVERAGE_GROUP_LABELS: { [key: string]: string } = {
  compute: 'Compute',
  platform_services: 'Platform Services - (Database, Storage & Network)',
  other_services: 'Other Services'
};

export const PUBLIC_CLOUD_COVERAGE_PROVIDER_ORDER = ['aws', 'azure', 'gcp', 'oci'];

// Coverage cards use the compact brand marks (paired with the provider name text in the header).
export const PUBLIC_CLOUD_COVERAGE_PROVIDER_LOGOS: { [key: string]: string } = {
  aws: 'logos/AWS.svg',
  azure: 'logos/Azure-short.svg',
  gcp: 'logos/GCP.svg',
  oci: 'logos/Oracle.svg'
};

// Performance Hotspots Cloud column uses the full provider logos (mark + wordmark).
export const PUBLIC_CLOUD_HOTSPOT_PROVIDER_LOGOS: { [key: string]: string } = {
  aws: 'aws.svg',
  azure: 'azure.svg',
  gcp: 'gcp.svg',
  oci: 'oracle.svg'
};

export const PUBLIC_CLOUD_COVERAGE_PROVIDER_LABELS: { [key: string]: string } = {
  aws: 'Amazon Web Service',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud',
  oci: 'Oracle'
};

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

// Geo Distribution tile palette (cycled by region index) and tooltip alert-severity colors.
export const PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS = [
  '#4a63d6',
  '#7d5fc4',
  '#f2a32a',
  '#33a06a',
  '#e8554e',
  '#23a8a0',
  '#3a9fe0',
  '#d76aa6'
];

export const PUBLIC_CLOUD_GEO_ALERT_SEVERITY_COLORS = {
  critical: '#cc0000',
  warning: '#ff8800',
  info: '#378ad8'
};

// Latency Heatmap cell colors by threshold: <20ms low, 20-80ms medium, >80ms high.
export const PUBLIC_CLOUD_LATENCY_HEATMAP_COLORS = {
  low: '#5ba83f',
  medium: '#b5742a',
  high: '#cf4b3f'
};

// Queue Backlog Monitor bar colors by backlog %: <60 low, 60-89 medium, >=90 high.
export const PUBLIC_CLOUD_QUEUE_BACKLOG_COLORS = {
  low: '#43c78c',
  medium: '#e0a51e',
  high: '#ec6b6b'
};
