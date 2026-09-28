import {
  PublicCloudInventorySummaryKey,
  PublicCloudProviderDistributionKey,
  PublicCloudStatusTone,
  PublicCloudProvisioningSummaryMetricsResponse,
  PublicCloudDatabaseSummaryResponse
} from './public-cloud-compute-dashboard.type';
import { DateRangeOption } from 'src/app/shared/custom-date-dropdown/custom-date-dropdown.component';

// Global Time Range filter options + default. value must match a DateRangePeriod the shared
// custom-date-dropdown can resolve; the exact backend param string is mapped via
// PUBLIC_CLOUD_TIME_RANGE_PARAM_MAP (see convertFiltersToApiParams).
export const PUBLIC_CLOUD_TIME_RANGE_DEFAULT = 'last_30_days';

export const PUBLIC_CLOUD_TIME_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'Last 24 Hours', value: 'last_24_hours' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 60 Days', value: 'last_60_days' },
  { label: 'Last 90 Days', value: 'last_90_days' }
];

// Dropdown period value -> exact backend time_range param value (only where the two differ).
export const PUBLIC_CLOUD_TIME_RANGE_PARAM_MAP: { [period: string]: string } = {
  last_24_hours: 'last_24_hrs'
};

export const PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT = '/customer/public-cloud-widgets/inventory_summary/';
export const PUBLIC_CLOUD_COMPUTE_MONITORED_ENDPOINT = '/customer/public-cloud-widgets/compute_monitored/';
export const PUBLIC_CLOUD_CLOUD_PROVIDER_DISTRIBUTION_ENDPOINT = '/customer/public-cloud-widgets/cloud_provider_distribution/';
export const PUBLIC_CLOUD_UTILIZATION_BY_PROVIDER_ENDPOINT = '/customer/public-cloud-widgets/utilization_by_provider/';
export const PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_OS_TYPE_ENDPOINT = '/customer/public-cloud-widgets/compute_instance_by_os_type/';
export const PUBLIC_CLOUD_ALERTS_SEVERITY_ENDPOINT = '/customer/public-cloud-widgets/alerts_severity_details/';
// Public Cloud Infrastructure Coverage reuses the existing Navigator Central (Unified AIOPS) dashboard endpoint.
export const PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT = '/customer/aiops-dashboard/public-cloud-infra-coverage/';
export const PUBLIC_CLOUD_ACCOUNT_SUBSCRIPTION_PROJECT_METRICS_ENDPOINT = '/customer/public-cloud-widgets/account_subs_metrices/';
export const PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_ACCOUNT_ENDPOINT = '/customer/public-cloud-widgets/compute_instance_by_account/';
export const PUBLIC_CLOUD_ESTIMATED_MONTHLY_COST_BY_ACCOUNT_ENDPOINT = '/customer/public-cloud-widgets/estimated_monthly_cost_by_account/';
export const PUBLIC_CLOUD_VCPU_UTILIZATION_BY_ACCOUNT_ENDPOINT = '/customer/public-cloud-widgets/vcpu_utilization_by_account/';
export const PUBLIC_CLOUD_COST_EFFICIENCY_BY_ACCOUNT_ENDPOINT = '/customer/public-cloud-widgets/cost_efficiency_by_account/';
export const PUBLIC_CLOUD_CAPACITY_PERFORMANCE_TABLE_ENDPOINT = '/customer/public-cloud-widgets/capacity_and_performance_table/';
export const PUBLIC_CLOUD_CAPACITY_PERFORMANCE_CHARTS_ENDPOINT = '/customer/public-cloud-widgets/capacity_and_performance_charts/';
export const PUBLIC_CLOUD_STORAGE_VOLUMES_DISKS_ENDPOINT = '/customer/public-cloud-widgets/get_storage_volumes_disks/';
export const PUBLIC_CLOUD_STORAGE_PROVISIONED_BY_PROVIDER_ENDPOINT = '/customer/public-cloud-widgets/total_provisioned_storage_by_provider/';
export const PUBLIC_CLOUD_STORAGE_TOP_VOLUMES_IOPS_ENDPOINT = '/customer/public-cloud-widgets/top_10_volumes_by_disk_iops/';
export const PUBLIC_CLOUD_STORAGE_IOPS_TIER_DISTRIBUTION_ENDPOINT = '/customer/public-cloud-widgets/iops_tier_distribution/';
export const PUBLIC_CLOUD_INSTANCE_PROVISIONING_SUMMARY_ENDPOINT = '/customer/public-cloud-widgets/instance_provisioning_summary/';
export const PUBLIC_CLOUD_PROVISIONING_REACHABILITY_ENDPOINT = '/customer/public-cloud-widgets/provisioning_reachability/';
export const PUBLIC_CLOUD_PROVISIONED_BY_PROVIDER_ENDPOINT = '/customer/public-cloud-widgets/provisioned_by_provider/';
export const PUBLIC_CLOUD_RECENTLY_PROVISIONED_ENDPOINT = '/customer/public-cloud-widgets/recently_provisioned/';
export const PUBLIC_CLOUD_PROVISIONING_SUMMARY_METRICS_ENDPOINT = '/customer/public-cloud-widgets/provisioning_summary_metrics/';
export const PUBLIC_CLOUD_DATABASE_INVENTORY_ENDPOINT = '/customer/public-cloud-widgets/public_cloud_database/';
export const PUBLIC_CLOUD_DB_WORKLOAD_ENDPOINT = '/customer/persona/database-dashboard/workload-insights/';
export const PUBLIC_CLOUD_DB_QUERY_PERFORMANCE_ENDPOINT = '/customer/persona/database-dashboard/top-query-performance/';
export const PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT = '/customer/public-cloud-widgets/orphaned_devices/';
export const PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT = '/customer/public-cloud-widgets/orphaned_devices_by_category/';
export const PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT = '/customer/public-cloud-widgets/recent_alerts/';
export const PUBLIC_CLOUD_ALERTS_BY_SEVERITY_ENDPOINT = '/customer/public-cloud-widgets/alerts_by_severity/';
export const PUBLIC_CLOUD_ALERTS_BY_PROVIDER_ENDPOINT = '/customer/public-cloud-widgets/alerts_by_provider/';
export const PUBLIC_CLOUD_ALERTS_BY_AGE_ENDPOINT = '/customer/public-cloud-widgets/alerts_by_age/';
export const PUBLIC_CLOUD_COST_OPTIMIZATION_ENDPOINT = '/customer/public-cloud-widgets/cost_optimization_opportunities/';
export const PUBLIC_CLOUD_SPEND_VS_SAVINGS_ENDPOINT = '/customer/public-cloud-widgets/spend_vs_savings/';
export const PUBLIC_CLOUD_RECOMMENDED_ACTIONS_ENDPOINT = '/customer/public-cloud-widgets/recommended_actions/';
export const PUBLIC_CLOUD_POTENTIAL_SAVINGS_BY_PROVIDER_ENDPOINT = '/customer/public-cloud-widgets/potential_savings_by_provider/';
export const PUBLIC_CLOUD_AUTO_REMEDIATION_SUMMARY_ENDPOINT = '/customer/public-cloud-widgets/auto_remediation_summary/';
export const PUBLIC_CLOUD_FILTERS_ENDPOINT = '/customer/public-cloud-widgets/public_cloud_filters/';
// Geo Distribution reuses the existing Navigator Central (Unified AIOPS) dashboard endpoint.
export const PUBLIC_CLOUD_GEO_DISTRIBUTION_ENDPOINT = '/customer/aiops-dashboard/geo-distribution-global-ops/';
export const PUBLIC_CLOUD_ALL_SELECTED_VALUE = 'all';

// Executive Summary KPI strip - key maps to a field on the flat inventory_summary response; tone
// drives the value color (primary=blue, success=green for running, danger=red for stopped).
export const PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG: Array<{ key: PublicCloudInventorySummaryKey, label: string, tone: PublicCloudStatusTone }> = [
  { key: 'cloud_accounts', label: 'Cloud Accounts', tone: 'primary' },
  { key: 'active_regions', label: 'Active Region', tone: 'primary' },
  { key: 'compute_vm', label: 'Compute/VM', tone: 'primary' },
  { key: 'platform_services_count', label: 'Platform Services Count', tone: 'primary' },
  { key: 'other_services_count', label: 'Other Services Count', tone: 'primary' },
  { key: 'running_compute_instances', label: 'Running Compute Instances', tone: 'success' },
  { key: 'stopped_compute_instances', label: 'Stopped Compute Instances', tone: 'danger' }
];

export const PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG: Record<PublicCloudProviderDistributionKey, { name: string, color: string }> = {
  aws: { name: 'AWS', color: '#ff8a00' },
  azure: { name: 'Azure', color: '#1683d8' },
  gcp: { name: 'GCP', color: '#5b80f5' },
  oci: { name: 'OCI', color: '#d34b35' }
};

// Canonical provider order (used by the monitored-by-cloud-type row, the provider donut and the
// utilization-by-provider bar) and the provider brand icons for the monitored cards.
export const PUBLIC_CLOUD_PROVIDER_ORDER: PublicCloudProviderDistributionKey[] = ['aws', 'azure', 'gcp', 'oci'];

export const PUBLIC_CLOUD_PROVIDER_ICON_CONFIG: Record<PublicCloudProviderDistributionKey, string> = {
  aws: 'fab fa-aws',
  azure: 'fab fa-microsoft',
  gcp: 'fab fa-google',
  oci: 'fas fa-cloud'
};

// Monitored-by-cloud-type stacked bar segment colors (running / stopped / unknown).
export const PUBLIC_CLOUD_COMPUTE_MONITORED_COLORS = {
  running: '#3bb273',
  stopped: '#e5484d',
  unknown: '#c9cdd3'
};

// Combined - Utilization by Provider grouped bar series (compute % / database count / storage %).
export const PUBLIC_CLOUD_UTILIZATION_SERIES_CONFIG: Array<{ key: 'compute' | 'database' | 'storage', label: string, color: string }> = [
  { key: 'compute', label: 'Compute', color: '#2f6fed' },
  { key: 'database', label: 'Database Count', color: '#7d5cf5' },
  { key: 'storage', label: 'Storage', color: '#17a2b8' }
];

// Compute Instance Count by Os Type donut segments.
export const PUBLIC_CLOUD_OS_TYPE_CONFIG: Array<{ key: 'linux' | 'windows' | 'other', label: string, color: string }> = [
  { key: 'linux', label: 'Linux', color: '#2f6fed' },
  { key: 'windows', label: 'Windows', color: '#6c5ce7' },
  { key: 'other', label: 'Other/Unknown', color: '#c9cdd3' }
];

// Alerts Severity pills.
export const PUBLIC_CLOUD_ALERTS_SEVERITY_CONFIG: Array<{ key: 'critical' | 'warning' | 'info', label: string, toneClass: string }> = [
  { key: 'critical', label: 'Critical', toneClass: 'sev-critical' },
  { key: 'warning', label: 'Warning', toneClass: 'sev-warning' },
  { key: 'info', label: 'Info', toneClass: 'sev-info' }
];

// ----- Capacity and Performance widget -----
// Status -> color mapping shared by the table (CPU bar, network, status icon) and the charts
// (info = healthy/green, warning = elevated/orange, critical = high/red).
export const PUBLIC_CLOUD_CAPACITY_STATUS_COLORS: Record<string, string> = {
  info: '#3bb273',
  warning: '#f5a623',
  critical: '#e5484d'
};

// ----- Storage - Volumes / Disks widget -----
// IOPS-tier legend colors for the tier-distribution donut (blue / purple / teal), keyed by the
// lower-cased performance_tier value the API returns.
export const PUBLIC_CLOUD_STORAGE_IOPS_TIER_COLORS: Record<string, string> = {
  standard: '#1683d8',
  balanced: '#7b5bd6',
  'high performance': '#17a2b8'
};

// ----- Instance Provisioning Summary widget -----
// Environment badge classes keyed by the lower-cased environment value. environment is not part of
// the current instance_provisioning_summary response; it is seeded in the static rows below and read
// defensively so the column works once the backend adds the field.
export const PUBLIC_CLOUD_PROVISIONING_ENVIRONMENT_CLASS: Record<string, string> = {
  production: 'provisioning-env-production',
  test: 'provisioning-env-test',
  staging: 'provisioning-env-staging',
  development: 'provisioning-env-development'
};

// Summary KPI strip (shown below both table and chart views); key maps to a field on the metrics
// response, format drives the display and tone drives the value color.
export const PUBLIC_CLOUD_PROVISIONING_SUMMARY_KPI_CONFIG: Array<{ key: keyof PublicCloudProvisioningSummaryMetricsResponse, label: string, tone: PublicCloudStatusTone, format: 'int' | 'pct' | 'min' }> = [
  { key: 'instances_provisioned', label: 'Instances Provisioned', tone: 'primary', format: 'int' },
  { key: 'reachable_rate', label: 'Reachable Rate', tone: 'success', format: 'pct' },
  { key: 'average_provisioning_time_minutes', label: 'Avg Provisioning Time', tone: 'primary', format: 'min' },
  { key: 'unreachable', label: 'Unreachable', tone: 'danger', format: 'int' }
];

// ----- Recent Alerts - Critical / Warning / Info widget -----
// Severity chart palette (critical red / warning amber / info blue) keyed by the lower-cased severity.
export const PUBLIC_CLOUD_ALERT_SEVERITY_CHART_COLORS: Record<string, string> = {
  critical: '#e5484d',
  warning: '#f5a623',
  info: '#2f6fed'
};

export const PUBLIC_CLOUD_ALERT_SEVERITY_ORDER = ['critical', 'warning', 'info'];

// Age-bucket palette and fixed ordering for the Alerts by Age chart.
export const PUBLIC_CLOUD_ALERT_AGE_COLORS: Record<string, string> = {
  '<24h': '#e5484d',
  '1-7d': '#f5a623',
  '7-30d': '#2f6fed',
  '30d+': '#9aa4b2'
};

export const PUBLIC_CLOUD_ALERT_AGE_ORDER = ['<24h', '1-7d', '7-30d', '30d+'];

// ----- Cost & Optimization Opportunities widget -----
// Recommended-action / spend / savings palette (rightsize blue, idle amber).
export const PUBLIC_CLOUD_COST_ACTION_COLORS: Record<string, string> = {
  rightsize: '#2f6fed',
  idle: '#f5a623'
};

export const PUBLIC_CLOUD_COST_SPEND_COLOR = '#2f6fed';
export const PUBLIC_CLOUD_COST_SAVINGS_COLOR = '#f5a623';

// ----- Public Cloud Database widget -----
// Executive KPI strip - key maps to a field on the summary response; format drives the display
// (int with thousands, pct with %, ms with unit); tone drives the value color.
export const PUBLIC_CLOUD_DATABASE_SUMMARY_KPI_CONFIG: Array<{ key: keyof PublicCloudDatabaseSummaryResponse, label: string, tone: PublicCloudStatusTone, format: 'int' | 'pct' | 'ms', info: string }> = [
  { key: 'databasesMonitored', label: 'Databases Monitored', tone: 'primary', format: 'int', info: '' },
  { key: 'queriesPerSec', label: 'Queries/Sec', tone: 'primary', format: 'int', info: 'Combined read+write queries per second across all monitored databases.' },
  { key: 'availabilityPct', label: 'Availability', tone: 'success', format: 'pct', info: 'Average measured uptime across all databases over the selected period.' },
  { key: 'activeConnections', label: 'Active Connections', tone: 'primary', format: 'int', info: 'Total active client connections across all databases right now. Natively reported by all four providers (AWS/Azure/GCP call it Connections, OCI calls it Sessions).' },
  { key: 'avgLatencyMs', label: 'Replication Lag (Avg)', tone: 'primary', format: 'ms', info: 'Native on AWS RDS, Azure, and GCP managed databases. Not exposed for OCI Autonomous Database in its standard monitoring metrics.' }
];

// ----- Database - Performance and Utilization widget -----
// Status -> color for the DB charts and table bars (healthy/info green, warning orange, critical red).
export const PUBLIC_CLOUD_DB_STATUS_COLORS: Record<string, string> = {
  healthy: '#3bb273',
  info: '#3bb273',
  warning: '#f5a623',
  critical: '#e5484d'
};

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

// Geo Distribution tile fallback palette (used when a cloud type does not map to a known
// provider brand color) and tooltip alert-severity colors.
export const PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS = [
  '#2563eb',
  '#0f766e',
  '#4f46e5',
  '#0891b2',
  '#16a34a',
  '#7c3aed',
  '#0d9488',
  '#64748b',
  '#a16207',
  '#0369a1',
  '#15803d',
  '#6d28d9'
];

export const PUBLIC_CLOUD_GEO_ALERT_SEVERITY_COLORS = {
  critical: '#cc0000',
  warning: '#ff8800',
  info: '#378ad8'
};

// A treemap only stays readable up to a limited number of tiles, so the Geo Distribution chart
// renders the largest N locations only (cells arrive sorted largest-first). This caps the CHART
// and its legend only - the KPI strip and the Cloud Type dropdown always use the full set.
export const PUBLIC_CLOUD_GEO_DISTRIBUTION_MAX_TILES = 12;

// Geo Distribution tiles are colored by cloud type: a type that maps to a single known provider
// uses that provider's brand color; everything else falls back to the palette above.
export const PUBLIC_CLOUD_GEO_PROVIDER_COLORS: { [providerKey: string]: string } = {
  aws: '#ff9900',
  amazon: '#ff9900',
  amazonwebservices: '#ff9900',
  azure: '#0078d4',
  microsoftazure: '#0078d4',
  gcp: '#4285f4',
  google: '#4285f4',
  googlecloud: '#4285f4',
  googlecloudplatform: '#4285f4',
  oci: '#312d2a',
  oracle: '#312d2a',
  oraclecloud: '#312d2a',
  oraclecloudinfrastructure: '#312d2a'
};

export const PUBLIC_CLOUD_AUTO_REMEDIATION_OUTCOME_COLORS = {
  successful: '#3bb47a',
  failed: '#ef4b50'
};

export const PUBLIC_CLOUD_AUTO_REMEDIATION_ACTION_COLORS = ['#3474ea', '#3474ea', '#ffb22f', '#3bb47a', '#3bb47a'];
