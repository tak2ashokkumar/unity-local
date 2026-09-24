import {
  PublicCloudAccountMetricChartResponse,
  PublicCloudAccountSubscriptionMetricResponseItem,
  PublicCloudAutoRemediationSummaryResponse,
  PublicCloudCapacityPerformanceRowResponse,
  PublicCloudCapacityPerformanceChartsResponse,
  PublicCloudStorageVolumeRowResponse,
  PublicCloudStorageProvisionedByProvider,
  PublicCloudStorageTopVolumeResponse,
  PublicCloudStorageIopsTier,
  PublicCloudProvisioningRowResponse,
  PublicCloudProvisioningReachability,
  PublicCloudProvisionedByProvider,
  PublicCloudRecentlyProvisioned,
  PublicCloudProvisioningSummaryMetricsResponse,
  PublicCloudRecentAlertsResponse,
  PublicCloudAlertsBySeverity,
  PublicCloudAlertsByProvider,
  PublicCloudAlertsByAge,
  PublicCloudCostRowResponse,
  PublicCloudSpendVsSavings,
  PublicCloudRecommendedAction,
  PublicCloudPotentialSavingsByProvider,
  PublicCloudDatabaseSummaryResponse,
  PublicCloudDatabaseInventoryResponse,
  PublicCloudDbTrendPoint,
  PublicCloudDbWorkloadResponse,
  PublicCloudDbQueryPerformanceResponse,
  PublicCloudInventorySummaryKey,
  PublicCloudProviderDistributionKey,
  PublicCloudStatusTone,
  PublicCloudInventorySummaryResponse,
  PublicCloudComputeMonitoredResponse,
  PublicCloudProviderDistributionResponse,
  PublicCloudUtilizationByProviderResponse,
  PublicCloudOsTypeResponse,
  PublicCloudAlertsSeverityResponse
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
export const PUBLIC_CLOUD_DATABASE_HEALTH_SCORE_ENDPOINT = '/customer/public-cloud-widgets/database_health_score/';
export const PUBLIC_CLOUD_ACTIVE_DATABASE_WORKLOAD_ENDPOINT = '/customer/public-cloud-widgets/active_database_workload/';
export const PUBLIC_CLOUD_DATABASE_LATENCY_OVERVIEW_ENDPOINT = '/customer/public-cloud-widgets/database_latency_overview/';
export const PUBLIC_CLOUD_TOP_LOCK_CONTENTION_ENDPOINT = '/customer/public-cloud-widgets/top_lock_contention/';
export const PUBLIC_CLOUD_TOP_MEMORY_CONSUMERS_ENDPOINT = '/customer/public-cloud-widgets/top_memory_consumers/';
export const PUBLIC_CLOUD_TOP_STORAGE_CONSUMERS_ENDPOINT = '/customer/public-cloud-widgets/top_storage_consumers/';
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

// ----- Executive Summary static responses (loaded until the backend endpoints are wired up). -----
export const PUBLIC_CLOUD_INVENTORY_SUMMARY_RESPONSE: PublicCloudInventorySummaryResponse = {
  other_services_count: 0,
  running_compute_instances: 63,
  cloud_accounts: 8,
  stopped_compute_instances: 10,
  active_regions: 71,
  compute_vm: 0,
  platform_services_count: 0
};

export const PUBLIC_CLOUD_COMPUTE_MONITORED_RESPONSE: PublicCloudComputeMonitoredResponse = [
  { monitored: 4, total_compute: 5, unknown: 0, monitored_percentage: 80.0, running: 2, stopped: 2, provider: 'AZURE' },
  { monitored: 0, total_compute: 3, unknown: 0, monitored_percentage: 0.0, running: 0, stopped: 0, provider: 'AWS' }
];

export const PUBLIC_CLOUD_CLOUD_PROVIDER_DISTRIBUTION_RESPONSE: PublicCloudProviderDistributionResponse = {
  distribution: [
    { count: 17, percentage: 0.93, provider: 'AZURE' },
    { count: 1679, percentage: 91.8, provider: 'GCP' },
    { count: 131, percentage: 7.16, provider: 'AWS' },
    { count: 2, percentage: 0.11, provider: 'OCI' }
  ],
  total_compute_instances: 1829
};

export const PUBLIC_CLOUD_UTILIZATION_BY_PROVIDER_RESPONSE: PublicCloudUtilizationByProviderResponse = {
  azure: { storage: 5.43, compute: 13.18, database: 2 },
  gcp: { storage: 0.0, compute: 84.97, database: 0 },
  aws: { storage: 0, compute: 0, database: 0 },
  oci: { storage: 63.16, compute: 5.26, database: 0 }
};

export const PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_OS_TYPE_RESPONSE: PublicCloudOsTypeResponse = {
  windows: 0,
  total: 81,
  other: 76,
  linux: 5
};

export const PUBLIC_CLOUD_ALERTS_SEVERITY_RESPONSE: PublicCloudAlertsSeverityResponse = {
  info: 1,
  critical: 0,
  warning: 1
};

// ----- Capacity and Performance widget -----
// Status -> color mapping shared by the table (CPU bar, network, status icon) and the charts
// (info = healthy/green, warning = elevated/orange, critical = high/red).
export const PUBLIC_CLOUD_CAPACITY_STATUS_COLORS: Record<string, string> = {
  info: '#3bb273',
  warning: '#f5a623',
  critical: '#e5484d'
};

// Static table dataset (paginated locally until the backend endpoint is available). Shape matches
// the paginated API row contract, so switching to the live endpoint needs no view-model changes.
export const PUBLIC_CLOUD_CAPACITY_PERFORMANCE_TABLE_RESPONSE: PublicCloudCapacityPerformanceRowResponse[] = [
  { id: 'a445e573-350e-4366-936f-1cbc85f8b5ad', name: 'vm-autoheal-test', provider: 'Azure', region: 'eastus', account: 'azure tenant1', type: 'Standard_B2s', os: '0001-com-ubuntu-server-jammy 22_04-lts-gen2', state: 'running', status: 'warning', cpuPct: 58.3, cpuStatus: 'warning', memPct: 42.1, memStatus: 'info', storPct: 26.4, storStatus: 'info', diskIOPS: 8373, diskThroughputMBs: 32.7, netThroughputMbps: 1.32, netStatus: 'warning', cpuTrend: [51.1, 56.5, 50.6, 55.8, 59.6, 58.3], cpuForecast90d: 68.4, forecastStatus: 'warning', monitored: true },
  { id: '51dc9f63-7b7f-49a4-ac69-7bc9232c97ab', name: 'unitycol01', provider: 'Azure', region: 'westus2', account: 'azure tenant1', type: 'Standard_D2s_v3', os: '0001-com-ubuntu-server-jammy 22_04-lts-gen2', state: 'stopped', status: 'critical', cpuPct: 0.0, cpuStatus: 'info', memPct: 0.0, memStatus: 'info', storPct: 0.0, storStatus: 'info', diskIOPS: 0, diskThroughputMBs: 0.0, netThroughputMbps: 0.0, netStatus: 'info', cpuTrend: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], cpuForecast90d: 0.0, forecastStatus: 'info', monitored: true },
  { id: 'i-0001', name: 'aws-useast-db-01', provider: 'AWS', region: 'us-east-1', account: 'UnityOne-Shared-AWS', type: 'm5.large', os: 'Linux', state: 'running', status: 'warning', cpuPct: 58.3, cpuStatus: 'warning', memPct: 46.2, memStatus: 'info', storPct: 71.5, storStatus: 'warning', diskIOPS: 8373, diskThroughputMBs: 32.7, netThroughputMbps: 1.65, netStatus: 'warning', cpuTrend: [51.1, 56.5, 50.6, 55.8, 59.6, 58.3], cpuForecast90d: 68.4, forecastStatus: 'warning', monitored: true },
  { id: 'i-0002', name: 'aws-uswest-app-02', provider: 'AWS', region: 'us-west-2', account: 'UnityOne-Prod-AWS', type: 'r5.large', os: 'Other/Unknown', state: 'running', status: 'warning', cpuPct: 59.5, cpuStatus: 'warning', memPct: 76.2, memStatus: 'warning', storPct: 60.9, storStatus: 'warning', diskIOPS: 15618, diskThroughputMBs: 61.0, netThroughputMbps: 3.78, netStatus: 'warning', cpuTrend: [44.0, 38.9, 42.2, 47.0, 54.8, 59.5], cpuForecast90d: 81.2, forecastStatus: 'critical', monitored: true },
  { id: 'i-0003', name: 'aws-apsout-gateway-03', provider: 'AWS', region: 'ap-south-1', account: 'UnityOne-Prod-AWS', type: 'c5.xlarge', os: 'Linux', state: 'running', status: 'info', cpuPct: 23.3, cpuStatus: 'info', memPct: 31.4, memStatus: 'info', storPct: 40.2, storStatus: 'info', diskIOPS: 9073, diskThroughputMBs: 35.4, netThroughputMbps: 4.56, netStatus: 'critical', cpuTrend: [28.1, 26.4, 25.0, 24.2, 23.8, 23.3], cpuForecast90d: 20.1, forecastStatus: 'info', monitored: true },
  { id: 'i-0004', name: 'aws-euwest-cache-04', provider: 'AWS', region: 'eu-west-1', account: 'UnityOne-Shared-AWS', type: 't3.medium', os: 'Linux', state: 'running', status: 'info', cpuPct: 23.6, cpuStatus: 'info', memPct: 34.9, memStatus: 'info', storPct: 28.7, storStatus: 'info', diskIOPS: 5804, diskThroughputMBs: 22.7, netThroughputMbps: 4.53, netStatus: 'critical', cpuTrend: [21.0, 22.4, 23.9, 24.1, 23.8, 23.6], cpuForecast90d: 24.9, forecastStatus: 'info', monitored: true },
  { id: 'i-0005', name: 'aws-useast-api-05', provider: 'AWS', region: 'us-east-1', account: 'UnityOne-Prod-AWS', type: 'r5.large', os: 'Windows', state: 'running', status: 'info', cpuPct: 39.1, cpuStatus: 'info', memPct: 52.0, memStatus: 'warning', storPct: 44.5, storStatus: 'info', diskIOPS: 13802, diskThroughputMBs: 53.9, netThroughputMbps: 6.83, netStatus: 'critical', cpuTrend: [33.2, 35.6, 37.1, 38.0, 38.7, 39.1], cpuForecast90d: 42.6, forecastStatus: 'warning', monitored: true },
  { id: 'i-0006', name: 'aws-uswest-search-06', provider: 'AWS', region: 'us-west-2', account: 'UnityOne-Shared-AWS', type: 't3.medium', os: 'Linux', state: 'running', status: 'info', cpuPct: 18.1, cpuStatus: 'info', memPct: 24.3, memStatus: 'info', storPct: 33.1, storStatus: 'info', diskIOPS: 3332, diskThroughputMBs: 13.0, netThroughputMbps: 5.48, netStatus: 'critical', cpuTrend: [22.4, 21.0, 20.1, 19.3, 18.6, 18.1], cpuForecast90d: 15.2, forecastStatus: 'info', monitored: true },
  { id: 'i-0007', name: 'aws-apsout-report-07', provider: 'AWS', region: 'ap-south-1', account: 'UnityOne-Prod-AWS', type: 'm6i.large', os: 'Linux', state: 'running', status: 'critical', cpuPct: 91.1, cpuStatus: 'critical', memPct: 84.6, memStatus: 'warning', storPct: 78.9, storStatus: 'warning', diskIOPS: 8037, diskThroughputMBs: 31.4, netThroughputMbps: 4.27, netStatus: 'critical', cpuTrend: [82.5, 85.1, 87.4, 88.9, 90.2, 91.1], cpuForecast90d: 96.4, forecastStatus: 'critical', monitored: true },
  { id: 'i-0008', name: 'aws-euwest-app-08', provider: 'AWS', region: 'eu-west-1', account: 'UnityOne-Prod-AWS', type: 't3.medium', os: 'Linux', state: 'running', status: 'warning', cpuPct: 83.1, cpuStatus: 'warning', memPct: 71.9, memStatus: 'warning', storPct: 66.0, storStatus: 'warning', diskIOPS: 10940, diskThroughputMBs: 42.7, netThroughputMbps: 4.71, netStatus: 'critical', cpuTrend: [76.2, 78.5, 80.1, 81.4, 82.6, 83.1], cpuForecast90d: 88.7, forecastStatus: 'critical', monitored: true },
  { id: 'i-0009', name: 'aws-useast-etl-09', provider: 'AWS', region: 'us-east-1', account: 'UnityOne-Prod-AWS', type: 't3.medium', os: 'Windows', state: 'running', status: 'warning', cpuPct: 77.7, cpuStatus: 'warning', memPct: 68.2, memStatus: 'warning', storPct: 59.4, storStatus: 'warning', diskIOPS: 8760, diskThroughputMBs: 34.2, netThroughputMbps: 3.78, netStatus: 'warning', cpuTrend: [71.0, 73.4, 75.1, 76.2, 77.0, 77.7], cpuForecast90d: 82.1, forecastStatus: 'warning', monitored: true },
  { id: 'i-0010', name: 'aws-uswest-proxy-10', provider: 'AWS', region: 'us-west-2', account: 'UnityOne-Shared-AWS', type: 'm5.large', os: 'Linux', state: 'running', status: 'info', cpuPct: 38.9, cpuStatus: 'info', memPct: 45.1, memStatus: 'info', storPct: 41.8, storStatus: 'info', diskIOPS: 12344, diskThroughputMBs: 48.2, netThroughputMbps: 5.52, netStatus: 'critical', cpuTrend: [42.0, 41.1, 40.3, 39.8, 39.2, 38.9], cpuForecast90d: 35.6, forecastStatus: 'info', monitored: true }
];

export const PUBLIC_CLOUD_CAPACITY_PERFORMANCE_CHARTS_RESPONSE: PublicCloudCapacityPerformanceChartsResponse = {
  fleetStatusByProvider: {
    labels: ['AWS', 'Azure', 'GCP', 'OCI'],
    series: [
      { label: 'Running', status: 'info', data: [7, 9, 22, 0] },
      { label: 'Idle', status: 'warning', data: [0, 0, 0, 0] },
      { label: 'Stopped', status: 'critical', data: [1, 2, 15, 0] }
    ]
  },
  cpuDistribution: {
    labels: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
    statuses: ['info', 'info', 'warning', 'warning', 'critical'],
    counts: [48, 0, 0, 0, 0],
    bands: [
      { label: '0-20%', min: 0, max: 20, status: 'info', count: 48 },
      { label: '20-40%', min: 20, max: 40, status: 'info', count: 0 },
      { label: '40-60%', min: 40, max: 60, status: 'warning', count: 0 },
      { label: '60-80%', min: 60, max: 80, status: 'warning', count: 0 },
      { label: '80-100%', min: 80, max: 101, status: 'critical', count: 0 }
    ]
  },
  top10Cpu: [
    { name: 'aws-apsout-report-07', provider: 'AWS', status: 'critical', value: 91.1 },
    { name: 'oci-apsydn-queue-12', provider: 'OCI', status: 'critical', value: 91.0 },
    { name: 'azure-centra-api-11', provider: 'Azure', status: 'critical', value: 87.4 },
    { name: 'aws-euwest-app-08', provider: 'AWS', status: 'warning', value: 83.1 },
    { name: 'oci-apmumb-report-11', provider: 'OCI', status: 'warning', value: 83.0 },
    { name: 'gcp-europe-worker-10', provider: 'GCP', status: 'warning', value: 82.9 },
    { name: 'azure-westeu-web-10', provider: 'Azure', status: 'warning', value: 82.8 },
    { name: 'gcp-asiaso-etl-03', provider: 'GCP', status: 'warning', value: 82.3 },
    { name: 'aws-apsout-gateway-11', provider: 'AWS', status: 'warning', value: 82.3 },
    { name: 'azure-eastus-api-09', provider: 'Azure', status: 'warning', value: 81.3 }
  ],
  top10DiskIops: [
    { name: 'aws-uswest-app-02', provider: 'AWS', status: 'warning', value: 15618 },
    { name: 'gcp-uscent-search-01', provider: 'GCP', status: 'info', value: 14697 },
    { name: 'gcp-asiaso-queue-11', provider: 'GCP', status: 'info', value: 14595 },
    { name: 'oci-apmumb-report-11', provider: 'OCI', status: 'warning', value: 14443 },
    { name: 'aws-useast-api-05', provider: 'AWS', status: 'info', value: 13802 },
    { name: 'azure-southe-ml-08', provider: 'Azure', status: 'info', value: 12437 },
    { name: 'aws-uswest-proxy-10', provider: 'AWS', status: 'info', value: 12344 },
    { name: 'oci-usashb-proxy-09', provider: 'OCI', status: 'info', value: 12230 },
    { name: 'gcp-uscent-queue-05', provider: 'GCP', status: 'info', value: 11950 },
    { name: 'aws-apsout-gateway-11', provider: 'AWS', status: 'warning', value: 11647 }
  ],
  top10NetworkThroughput: [
    { name: 'aws-useast-api-05', provider: 'AWS', status: 'critical', value: 6.83 },
    { name: 'oci-uklond-etl-10', provider: 'OCI', status: 'critical', value: 6.67 },
    { name: 'azure-eastus-queue-05', provider: 'Azure', status: 'critical', value: 6.51 },
    { name: 'azure-westeu-ml-06', provider: 'Azure', status: 'critical', value: 6.35 },
    { name: 'oci-apsydn-queue-12', provider: 'OCI', status: 'critical', value: 6.10 },
    { name: 'aws-apsout-gateway-11', provider: 'AWS', status: 'critical', value: 6.06 },
    { name: 'gcp-europe-gateway-06', provider: 'GCP', status: 'critical', value: 5.71 },
    { name: 'gcp-asiaso-etl-03', provider: 'GCP', status: 'critical', value: 5.61 },
    { name: 'aws-uswest-proxy-10', provider: 'AWS', status: 'critical', value: 5.52 },
    { name: 'aws-uswest-search-06', provider: 'AWS', status: 'critical', value: 5.48 }
  ],
  capacityAndGrowthInsights: {
    months: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    forecastMonths: ['Oct', 'Nov', 'Dec'],
    cpuHistory: [42.0, 45.0, 47.0, 49.0, 52.0, 55.0, 54.0, 58.0, 61.0, 63.0, 66.0, 68.0],
    memHistory: [38.0, 40.0, 41.0, 44.0, 46.0, 48.0, 50.0, 52.0, 54.0, 55.0, 57.0, 59.0],
    cpuForecast: [71.0, 74.0, 77.0],
    memForecast: [61.0, 63.0, 65.0]
  }
};

// ----- Storage - Volumes / Disks widget -----
// IOPS-tier legend colors for the tier-distribution donut (blue / purple / teal), keyed by the
// lower-cased performance_tier value the API returns.
export const PUBLIC_CLOUD_STORAGE_IOPS_TIER_COLORS: Record<string, string> = {
  standard: '#1683d8',
  balanced: '#7b5bd6',
  'high performance': '#17a2b8'
};

// Static table dataset (paginated locally until the backend endpoint is available). Shape matches
// the API row contract, so switching to the live endpoint needs no view-model changes. size_gb is
// nullable and disk_iops_throughput is a single string ("<iops> IOPS / <throughput> MB/s" or "N/A").
export const PUBLIC_CLOUD_STORAGE_VOLUMES_DISKS_RESPONSE: PublicCloudStorageVolumeRowResponse[] = [
  { volume_name: 'vol-useast-db-01', attached_instance: 'aws-useast-db-01', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 50, disk_iops_throughput: '8,373 IOPS / 32.7 MB/s', iops_tier: 'Standard' },
  { volume_name: 'vol-uswest-app-02', attached_instance: 'aws-uswest-app-02', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 30, disk_iops_throughput: '15,618 IOPS / 61 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'vol-apsout-gateway-03', attached_instance: 'aws-apsout-gateway-03', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 500, disk_iops_throughput: '9,073 IOPS / 35.4 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'vol-euwest-cache-04', attached_instance: 'aws-euwest-cache-04', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 50, disk_iops_throughput: '5,804 IOPS / 22.7 MB/s', iops_tier: 'Standard' },
  { volume_name: 'vol-useast-api-05', attached_instance: 'aws-useast-api-05', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 1000, disk_iops_throughput: '13,802 IOPS / 53.9 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'vol-uswest-search-06', attached_instance: 'aws-uswest-search-06', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 500, disk_iops_throughput: '3,332 IOPS / 13 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'vol-apsout-report-07', attached_instance: 'aws-apsout-report-07', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 1000, disk_iops_throughput: '8,037 IOPS / 31.4 MB/s', iops_tier: 'Standard' },
  { volume_name: 'vol-euwest-app-08', attached_instance: 'aws-euwest-app-08', provider: 'AWS', volume_type: 'EBS gp3', size_gb: 1000, disk_iops_throughput: '10,940 IOPS / 42.7 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'analytics-ultra-disk', attached_instance: 'azure-southe-ml-08', provider: 'Azure', volume_type: 'UltraSSD_LRS', size_gb: 1024, disk_iops_throughput: '12,437 IOPS / 48.6 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'payments-premium-disk', attached_instance: 'azure-eastus-api-09', provider: 'Azure', volume_type: 'Premium_LRS', size_gb: 512, disk_iops_throughput: '9,120 IOPS / 35.6 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'azure-app-data-01', attached_instance: 'azure-westeu-web-10', provider: 'Azure', volume_type: 'Premium_LRS', size_gb: 256, disk_iops_throughput: '5,000 IOPS / 20 MB/s', iops_tier: 'Standard' },
  { volume_name: 'LumiSetupVM_OsDisk_1', attached_instance: 'LumiSetupVM', provider: 'Azure', volume_type: 'disks', size_gb: null, disk_iops_throughput: 'N/A', iops_tier: 'Standard' },
  { volume_name: 'unitycol01_DataDisk_0', attached_instance: 'unitycol01', provider: 'Azure', volume_type: 'disks', size_gb: null, disk_iops_throughput: 'N/A', iops_tier: 'Standard' },
  { volume_name: 'ztc-test-server_disk1', attached_instance: 'ztc-test-server', provider: 'Azure', volume_type: 'disks', size_gb: null, disk_iops_throughput: 'N/A', iops_tier: 'Standard' },
  { volume_name: 'gcp-db-ssd-01', attached_instance: 'gcp-uscent-search-01', provider: 'GCP', volume_type: 'pd-ssd', size_gb: 750, disk_iops_throughput: '14,697 IOPS / 57.4 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'gcp-balanced-data-01', attached_instance: 'gcp-asiaso-queue-11', provider: 'GCP', volume_type: 'pd-balanced', size_gb: 500, disk_iops_throughput: '14,595 IOPS / 57 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'gcp-standard-data-01', attached_instance: 'gcp-uscent-queue-05', provider: 'GCP', volume_type: 'pd-standard', size_gb: 1000, disk_iops_throughput: '11,950 IOPS / 46.6 MB/s', iops_tier: 'Standard' },
  { volume_name: 'app-backend-health-check', attached_instance: 'N/A', provider: 'GCP', volume_type: 'Disk', size_gb: null, disk_iops_throughput: 'N/A', iops_tier: 'Standard' },
  { volume_name: 'gpu-llm-instance', attached_instance: 'N/A', provider: 'GCP', volume_type: 'Disk', size_gb: null, disk_iops_throughput: 'N/A', iops_tier: 'Standard' },
  { volume_name: 'installationvm1', attached_instance: 'N/A', provider: 'GCP', volume_type: 'Disk', size_gb: null, disk_iops_throughput: 'N/A', iops_tier: 'Standard' },
  { volume_name: 'oracle-data-prod-01', attached_instance: 'oci-apmumb-report-11', provider: 'OCI', volume_type: 'Block Volume', size_gb: 2048, disk_iops_throughput: '14,443 IOPS / 56.4 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'oci-block-proxy-09', attached_instance: 'oci-usashb-proxy-09', provider: 'OCI', volume_type: 'Block Volume', size_gb: 1024, disk_iops_throughput: '12,230 IOPS / 47.8 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'oci-block-gateway-11', attached_instance: 'oci-apsydn-gateway-11', provider: 'OCI', volume_type: 'Block Volume', size_gb: 500, disk_iops_throughput: '6,540 IOPS / 25.5 MB/s', iops_tier: 'Standard' },
  { volume_name: 'oci-block-etl-10', attached_instance: 'oci-uklond-etl-10', provider: 'OCI', volume_type: 'Block Volume', size_gb: 750, disk_iops_throughput: '8,910 IOPS / 34.8 MB/s', iops_tier: 'Balanced' }
];

// Static chart datasets (used until the backend endpoints are available). Each mirrors its own API
// response shape so the converters map the live data unchanged.
export const PUBLIC_CLOUD_STORAGE_PROVISIONED_BY_PROVIDER_RESPONSE: PublicCloudStorageProvisionedByProvider[] = [
  { provider: 'AWS', total_provisioned_storage_gb: 5340, volume_count: 16, volumes_with_size: 16 },
  { provider: 'Azure', total_provisioned_storage_gb: 4920, volume_count: 16, volumes_with_size: 16 },
  { provider: 'GCP', total_provisioned_storage_gb: 5560, volume_count: 16, volumes_with_size: 16 },
  { provider: 'OCI', total_provisioned_storage_gb: 5820, volume_count: 16, volumes_with_size: 16 }
];

export const PUBLIC_CLOUD_STORAGE_TOP_VOLUMES_IOPS_RESPONSE: PublicCloudStorageTopVolumeResponse[] = [
  { volume_name: 'vol-uswest-app-02', attached_instance: 'aws-uswest-app-02', provider: 'AWS', volume_type: 'gp3', size_gb: 30, disk_iops: 15618, throughput_mbps: 61, disk_iops_throughput: '15618 IOPS / 61 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'gcp-db-ssd-01', attached_instance: 'gcp-uscent-search-01', provider: 'GCP', volume_type: 'pd-ssd', size_gb: 750, disk_iops: 14697, throughput_mbps: 57.4, disk_iops_throughput: '14697 IOPS / 57.4 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'gcp-balanced-data-01', attached_instance: 'gcp-asiaso-queue-11', provider: 'GCP', volume_type: 'pd-balanced', size_gb: 500, disk_iops: 14595, throughput_mbps: 57, disk_iops_throughput: '14595 IOPS / 57 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'oracle-data-prod-01', attached_instance: 'oci-apmumb-report-11', provider: 'OCI', volume_type: 'Block Volume', size_gb: 2048, disk_iops: 14443, throughput_mbps: 56.4, disk_iops_throughput: '14443 IOPS / 56.4 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'vol-useast-api-05', attached_instance: 'aws-useast-api-05', provider: 'AWS', volume_type: 'gp3', size_gb: 1000, disk_iops: 13802, throughput_mbps: 53.9, disk_iops_throughput: '13802 IOPS / 53.9 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'analytics-ultra-disk', attached_instance: 'azure-southe-ml-08', provider: 'Azure', volume_type: 'UltraSSD_LRS', size_gb: 1024, disk_iops: 12437, throughput_mbps: 48.6, disk_iops_throughput: '12437 IOPS / 48.6 MB/s', iops_tier: 'High Performance' },
  { volume_name: 'vol-uswest-proxy-10', attached_instance: 'aws-uswest-proxy-10', provider: 'AWS', volume_type: 'gp3', size_gb: 500, disk_iops: 12344, throughput_mbps: 48.2, disk_iops_throughput: '12344 IOPS / 48.2 MB/s', iops_tier: 'Standard' },
  { volume_name: 'oci-block-proxy-09', attached_instance: 'oci-usashb-proxy-09', provider: 'OCI', volume_type: 'Block Volume', size_gb: 1024, disk_iops: 12230, throughput_mbps: 47.8, disk_iops_throughput: '12230 IOPS / 47.8 MB/s', iops_tier: 'Balanced' },
  { volume_name: 'gcp-standard-data-01', attached_instance: 'gcp-uscent-queue-05', provider: 'GCP', volume_type: 'pd-standard', size_gb: 1000, disk_iops: 11950, throughput_mbps: 46.6, disk_iops_throughput: '11950 IOPS / 46.6 MB/s', iops_tier: 'Standard' },
  { volume_name: 'vol-apsout-gateway-11', attached_instance: 'aws-apsout-gateway-11', provider: 'AWS', volume_type: 'gp3', size_gb: 500, disk_iops: 11647, throughput_mbps: 45.5, disk_iops_throughput: '11647 IOPS / 45.5 MB/s', iops_tier: 'Balanced' }
];

export const PUBLIC_CLOUD_STORAGE_IOPS_TIER_DISTRIBUTION_RESPONSE: PublicCloudStorageIopsTier[] = [
  { performance_tier: 'Standard', volume_count: 16, total_disk_iops: 118420 },
  { performance_tier: 'Balanced', volume_count: 16, total_disk_iops: 176540 },
  { performance_tier: 'High Performance', volume_count: 16, total_disk_iops: 214860 }
];

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

// Static table dataset (rendered whole; sorting is applied client-side until the backend endpoint is
// available). Shape matches the API row contract so switching to the live endpoint needs no changes.
export const PUBLIC_CLOUD_INSTANCE_PROVISIONING_SUMMARY_RESPONSE: PublicCloudProvisioningRowResponse[] = [
  { instance_name: 'aws-uswest-search-06', provider: 'AWS', region: 'us-west-2', account: 'UnityOne-Shared-AWS', type: 't3.medium', environment: 'Production', status: 'running', provisioned_date: '2026-09-16', days_since_provisioned: 1 },
  { instance_name: 'aws-useast-api-05', provider: 'AWS', region: 'us-east-1', account: 'UnityOne-Shared-AWS', type: 'r5.large', environment: 'Test', status: 'running', provisioned_date: '2026-09-11', days_since_provisioned: 6 },
  { instance_name: 'oci-apsydn-auth-08', provider: 'OCI', region: 'ap-sydney-1', account: 'UnityOne-Dev-Compartment', type: 'VM.Standard.E4.Flex', environment: 'Production', status: 'running', provisioned_date: '2026-09-04', days_since_provisioned: 13 },
  { instance_name: 'gcp-uscent-queue-05', provider: 'GCP', region: 'us-central1', account: 'unityone-prod-gcp', type: 'c2-standard-8', environment: 'Production', status: 'running', provisioned_date: '2026-08-20', days_since_provisioned: 28 },
  { instance_name: 'gcp-europe-gateway-06', provider: 'GCP', region: 'europe-west1', account: 'unityone-dev-gcp', type: 'e2-medium', environment: 'Production', status: 'running', provisioned_date: '2026-08-04', days_since_provisioned: 44 },
  { instance_name: 'oci-uklond-etl-10', provider: 'OCI', region: 'uk-london-1', account: 'UnityOne-Shared-Compartment', type: 'VM.Standard3.Flex', environment: 'Staging', status: 'running', provisioned_date: '2026-08-01', days_since_provisioned: 47 },
  { instance_name: 'oci-uklond-report-02', provider: 'OCI', region: 'uk-london-1', account: 'UnityOne-Prod-Compartment', type: 'VM.Standard.E3.Flex', environment: 'Staging', status: 'idle', provisioned_date: '2026-07-27', days_since_provisioned: 52 },
  { instance_name: 'gcp-uscent-search-01', provider: 'GCP', region: 'us-central1', account: 'unityone-shared-gcp', type: 'c2-standard-8', environment: 'Production', status: 'running', provisioned_date: '2026-07-26', days_since_provisioned: 53 },
  { instance_name: 'azure-southe-ml-08', provider: 'AZURE', region: 'southeastasia', account: 'UnityOne-Prod-Sub', type: 'Standard_D2s_v3', environment: 'Production', status: 'running', provisioned_date: '2026-07-16', days_since_provisioned: 63 },
  { instance_name: 'gcp-asiaso-queue-11', provider: 'GCP', region: 'asia-south1', account: 'unityone-shared-gcp', type: 'n2-standard-2', environment: 'Development', status: 'running', provisioned_date: '2026-07-16', days_since_provisioned: 63 }
];

export const PUBLIC_CLOUD_PROVISIONING_REACHABILITY_RESPONSE: PublicCloudProvisioningReachability = {
  reachable: 10,
  unreachable: 0,
  reachable_percentage: 100.0
};

export const PUBLIC_CLOUD_PROVISIONED_BY_PROVIDER_RESPONSE: PublicCloudProvisionedByProvider[] = [
  { provider: 'AWS', count: 2 },
  { provider: 'AZURE', count: 1 },
  { provider: 'GCP', count: 4 },
  { provider: 'OCI', count: 3 }
];

export const PUBLIC_CLOUD_RECENTLY_PROVISIONED_RESPONSE: PublicCloudRecentlyProvisioned[] = [
  { instance_name: 'aws-uswest-search-06', provider: 'AWS', provisioned_date: '2026-09-17' },
  { instance_name: 'aws-useast-api-05', provider: 'AWS', provisioned_date: '2026-09-12' },
  { instance_name: 'oci-apsydn-auth-08', provider: 'OCI', provisioned_date: '2026-09-04' },
  { instance_name: 'gcp-uscent-queue-05', provider: 'GCP', provisioned_date: '2026-08-20' },
  { instance_name: 'gcp-europe-gateway-06', provider: 'GCP', provisioned_date: '2026-08-04' },
  { instance_name: 'oci-uklond-etl-10', provider: 'OCI', provisioned_date: '2026-08-01' },
  { instance_name: 'oci-uklond-report-02', provider: 'OCI', provisioned_date: '2026-07-27' },
  { instance_name: 'gcp-uscent-search-01', provider: 'GCP', provisioned_date: '2026-07-26' },
  { instance_name: 'azure-southe-ml-08', provider: 'AZURE', provisioned_date: '2026-07-16' },
  { instance_name: 'gcp-asiaso-queue-11', provider: 'GCP', provisioned_date: '2026-07-16' }
];

export const PUBLIC_CLOUD_PROVISIONING_SUMMARY_METRICS_RESPONSE: PublicCloudProvisioningSummaryMetricsResponse = {
  reachable_rate: 100.0,
  unreachable: 0,
  average_provisioning_time_minutes: 3.1,
  instances_provisioned: 10
};

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

// Static table dataset (searched / sorted / paginated client-side until the backend endpoint is
// available). Shape matches the recent_alerts response (alert_summary + alerts[]); provider is not
// in the current API item, so it is seeded here and derived from the instance name when absent.
export const PUBLIC_CLOUD_RECENT_ALERTS_RESPONSE: PublicCloudRecentAlertsResponse = {
  alert_summary: { critical_alerts: 1, warning_alerts: 12, info_alerts: 17 },
  alerts: [
    { id: '310001', device_name: 'aws-euwest-cache-04', provider: 'AWS', severity: 'warning', description: 'CPU > 80% for 30 min', duration: '1h', source: 'Unity', acknowledged: 'No' },
    { id: '310002', device_name: 'oci-apmumb-auth-07', provider: 'OCI', severity: 'warning', description: 'CPU > 80% for 30 min', duration: '63h', source: 'Oci', acknowledged: 'No' },
    { id: '310003', device_name: 'aws-euwest-cache-04', provider: 'AWS', severity: 'info', description: 'Instance patched successfully', duration: '69h', source: 'Unity', acknowledged: 'Yes' },
    { id: '310004', device_name: 'gcp-uscent-queue-05', provider: 'GCP', severity: 'info', description: 'Instance patched successfully', duration: '113h', source: 'Gcp', acknowledged: 'Yes' },
    { id: '310005', device_name: 'gcp-asiaso-ml-07', provider: 'GCP', severity: 'info', description: 'Auto-scaling event completed', duration: '119h', source: 'Gcp', acknowledged: 'Yes' },
    { id: '310006', device_name: 'gcp-austra-proxy-12', provider: 'GCP', severity: 'warning', description: 'Untagged resource detected', duration: '141h', source: 'Gcp', acknowledged: 'No' },
    { id: '310007', device_name: 'azure-centra-api-07', provider: 'AZURE', severity: 'warning', description: 'CPU > 80% for 30 min', duration: '150h', source: 'Azure', acknowledged: 'No' },
    { id: '310008', device_name: 'gcp-europe-worker-10', provider: 'GCP', severity: 'critical', description: 'Disk volume full', duration: '151h', source: 'Gcp', acknowledged: 'No' },
    { id: '310009', device_name: 'gcp-austra-db-08', provider: 'GCP', severity: 'warning', description: 'CPU > 80% for 30 min', duration: '171h', source: 'Gcp', acknowledged: 'No' },
    { id: '310010', device_name: 'gcp-europe-gateway-06', provider: 'GCP', severity: 'warning', description: 'Untagged resource detected', duration: '173h', source: 'Gcp', acknowledged: 'No' },
    { id: '310011', device_name: 'aws-useast-api-05', provider: 'AWS', severity: 'info', description: 'Instance patched successfully', duration: '190h', source: 'Unity', acknowledged: 'Yes' },
    { id: '310012', device_name: 'aws-uswest-search-06', provider: 'AWS', severity: 'info', description: 'Auto-scaling event completed', duration: '205h', source: 'Unity', acknowledged: 'Yes' },
    { id: '310013', device_name: 'azure-southe-ml-08', provider: 'AZURE', severity: 'info', description: 'Snapshot created', duration: '218h', source: 'Azure', acknowledged: 'Yes' },
    { id: '310014', device_name: 'gcp-uscent-search-01', provider: 'GCP', severity: 'info', description: 'Health check passed', duration: '233h', source: 'Gcp', acknowledged: 'Yes' },
    { id: '310015', device_name: 'oci-uklond-etl-10', provider: 'OCI', severity: 'warning', description: 'Memory > 90% for 15 min', duration: '247h', source: 'Oci', acknowledged: 'No' },
    { id: '310016', device_name: 'aws-apsout-report-07', provider: 'AWS', severity: 'info', description: 'Backup completed', duration: '260h', source: 'Unity', acknowledged: 'Yes' },
    { id: '310017', device_name: 'gcp-europe-worker-11', provider: 'GCP', severity: 'info', description: 'Instance patched successfully', duration: '274h', source: 'Gcp', acknowledged: 'Yes' },
    { id: '310018', device_name: 'azure-westeu-web-10', provider: 'AZURE', severity: 'warning', description: 'Network latency elevated', duration: '289h', source: 'Azure', acknowledged: 'No' },
    { id: '310019', device_name: 'oci-usashb-proxy-09', provider: 'OCI', severity: 'info', description: 'Auto-scaling event completed', duration: '303h', source: 'Oci', acknowledged: 'Yes' },
    { id: '310020', device_name: 'aws-euwest-app-08', provider: 'AWS', severity: 'info', description: 'Health check passed', duration: '318h', source: 'Unity', acknowledged: 'Yes' },
    { id: '310021', device_name: 'gcp-asiaso-queue-11', provider: 'GCP', severity: 'info', description: 'Snapshot created', duration: '332h', source: 'Gcp', acknowledged: 'Yes' },
    { id: '310022', device_name: 'oci-apmumb-report-11', provider: 'OCI', severity: 'warning', description: 'Untagged resource detected', duration: '347h', source: 'Oci', acknowledged: 'No' },
    { id: '310023', device_name: 'aws-useast-db-01', provider: 'AWS', severity: 'warning', description: 'Disk usage > 85%', duration: '361h', source: 'Unity', acknowledged: 'No' },
    { id: '310024', device_name: 'gcp-uscent-queue-05', provider: 'GCP', severity: 'info', description: 'Instance patched successfully', duration: '376h', source: 'Gcp', acknowledged: 'Yes' },
    { id: '310025', device_name: 'azure-eastus-api-09', provider: 'AZURE', severity: 'info', description: 'Health check passed', duration: '390h', source: 'Azure', acknowledged: 'Yes' },
    { id: '310026', device_name: 'gcp-europe-gateway-06', provider: 'GCP', severity: 'warning', description: 'Memory > 90% for 15 min', duration: '405h', source: 'Gcp', acknowledged: 'No' },
    { id: '310027', device_name: 'oci-apsydn-auth-08', provider: 'OCI', severity: 'info', description: 'Auto-scaling event completed', duration: '419h', source: 'Oci', acknowledged: 'Yes' },
    { id: '310028', device_name: 'aws-uswest-proxy-10', provider: 'AWS', severity: 'info', description: 'Snapshot created', duration: '434h', source: 'Unity', acknowledged: 'Yes' },
    { id: '310029', device_name: 'gcp-austra-proxy-12', provider: 'GCP', severity: 'warning', description: 'CPU > 80% for 30 min', duration: '448h', source: 'Gcp', acknowledged: 'No' },
    { id: '310030', device_name: 'oci-uklond-report-02', provider: 'OCI', severity: 'info', description: 'Backup completed', duration: '463h', source: 'Oci', acknowledged: 'Yes' }
  ]
};

export const PUBLIC_CLOUD_ALERTS_BY_SEVERITY_RESPONSE: PublicCloudAlertsBySeverity = {
  total: 30,
  critical: 1,
  warning: 12,
  info: 17
};

export const PUBLIC_CLOUD_ALERTS_BY_PROVIDER_RESPONSE: PublicCloudAlertsByProvider[] = [
  { provider: 'AWS', alert_count: 8 },
  { provider: 'AZURE', alert_count: 4 },
  { provider: 'GCP', alert_count: 12 },
  { provider: 'OCI', alert_count: 6 }
];

export const PUBLIC_CLOUD_ALERTS_BY_AGE_RESPONSE: PublicCloudAlertsByAge = {
  '<24h': 1,
  '1-7d': 5,
  '7-30d': 24,
  '30d+': 0
};

// ----- Cost & Optimization Opportunities widget -----
// Recommended-action / spend / savings palette (rightsize blue, idle amber).
export const PUBLIC_CLOUD_COST_ACTION_COLORS: Record<string, string> = {
  rightsize: '#2f6fed',
  idle: '#f5a623'
};

export const PUBLIC_CLOUD_COST_SPEND_COLOR = '#2f6fed';
export const PUBLIC_CLOUD_COST_SAVINGS_COLOR = '#f5a623';

// Static table dataset (searched / sorted / paginated client-side until the backend endpoint is
// available). Shape matches the cost_optimization_opportunities response.
export const PUBLIC_CLOUD_COST_OPTIMIZATION_RESPONSE: PublicCloudCostRowResponse[] = [
  { instance: 'oci-apsydn-db-04', provider: 'OCI', region: 'ap-sydney-1', type: 'VM.Standard.E3.Flex', cpu: 0, utilization: 19.6, recommended_action: 'Rightsize (reduce vCPU)', estimated_monthly_savings: 90 },
  { instance: 'aws-uswest-search-06', provider: 'AWS', region: 'us-west-2', type: 't3.medium', cpu: 0, utilization: 18.1, recommended_action: 'Rightsize (reduce vCPU)', estimated_monthly_savings: 45 },
  { instance: 'oci-uklond-etl-10', provider: 'OCI', region: 'uk-london-1', type: 'VM.Standard3.Flex', cpu: 0, utilization: 9.6, recommended_action: 'Stop / Terminate Idle', estimated_monthly_savings: 704 },
  { instance: 'azure-eastus-app-01', provider: 'Azure', region: 'eastus', type: 'Standard_B2ms', cpu: 0, utilization: 6.2, recommended_action: 'Stop / Terminate Idle', estimated_monthly_savings: 72 },
  { instance: 'oci-uklond-report-02', provider: 'OCI', region: 'uk-london-1', type: 'VM.Standard.E3.Flex', cpu: 0, utilization: 1.9, recommended_action: 'Stop / Terminate Idle', estimated_monthly_savings: 144 }
];

export const PUBLIC_CLOUD_SPEND_VS_SAVINGS_RESPONSE: PublicCloudSpendVsSavings = {
  current_monthly_spend: 15244,
  identified_savings: 1234
};

export const PUBLIC_CLOUD_RECOMMENDED_ACTIONS_RESPONSE: PublicCloudRecommendedAction[] = [
  { recommended_action: 'Rightsize Over-Provisioned', count: 3 },
  { recommended_action: 'Stop/Terminate Idle', count: 3 }
];

export const PUBLIC_CLOUD_POTENTIAL_SAVINGS_BY_PROVIDER_RESPONSE: PublicCloudPotentialSavingsByProvider[] = [
  { provider: 'AWS', estimated_monthly_savings: 45 },
  { provider: 'Azure', estimated_monthly_savings: 72 },
  { provider: 'GCP', estimated_monthly_savings: 0 },
  { provider: 'OCI', estimated_monthly_savings: 938 }
];

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

export const PUBLIC_CLOUD_DATABASE_INVENTORY_RESPONSE: PublicCloudDatabaseInventoryResponse = {
  summary: {
    databasesMonitored: 10,
    queriesPerSec: 32540.0,
    avgLatencyMs: 14.25,
    availabilityPct: 99.85,
    activeConnections: 1240
  },
  discovery: {
    AWS: { discovered: 4, monitored: 4, healthy: 4, degraded: 0, unknown: 0 },
    Azure: { discovered: 3, monitored: 3, healthy: 3, degraded: 0, unknown: 0 },
    GCP: { discovered: 2, monitored: 2, healthy: 2, degraded: 0, unknown: 0 },
    OCI: { discovered: 1, monitored: 1, healthy: 1, degraded: 0, unknown: 0 }
  }
};

// ----- Database - Performance and Utilization widget -----
// Status -> color for the DB charts and table bars (healthy/info green, warning orange, critical red).
export const PUBLIC_CLOUD_DB_STATUS_COLORS: Record<string, string> = {
  healthy: '#3bb273',
  info: '#3bb273',
  warning: '#f5a623',
  critical: '#e5484d'
};

// 30-day transactions/sec trend (shared by the throughput series; the sample response reports zeros).
const PUBLIC_CLOUD_DB_TREND_ZERO: PublicCloudDbTrendPoint[] = [
  { date: '2026-08-23', transactions_per_sec: 0.0 }, { date: '2026-08-24', transactions_per_sec: 0.0 },
  { date: '2026-08-25', transactions_per_sec: 0.0 }, { date: '2026-08-26', transactions_per_sec: 0.0 },
  { date: '2026-08-27', transactions_per_sec: 0.0 }, { date: '2026-08-28', transactions_per_sec: 0.0 },
  { date: '2026-08-29', transactions_per_sec: 0.0 }, { date: '2026-08-30', transactions_per_sec: 0.0 },
  { date: '2026-08-31', transactions_per_sec: 0.0 }, { date: '2026-09-01', transactions_per_sec: 0.0 },
  { date: '2026-09-02', transactions_per_sec: 0.0 }, { date: '2026-09-03', transactions_per_sec: 0.0 },
  { date: '2026-09-04', transactions_per_sec: 0.0 }, { date: '2026-09-05', transactions_per_sec: 0.0 },
  { date: '2026-09-06', transactions_per_sec: 0.0 }, { date: '2026-09-07', transactions_per_sec: 0.0 },
  { date: '2026-09-08', transactions_per_sec: 0.0 }, { date: '2026-09-09', transactions_per_sec: 0.0 },
  { date: '2026-09-10', transactions_per_sec: 0.0 }, { date: '2026-09-11', transactions_per_sec: 0.0 },
  { date: '2026-09-12', transactions_per_sec: 0.0 }, { date: '2026-09-13', transactions_per_sec: 0.0 },
  { date: '2026-09-14', transactions_per_sec: 0.0 }, { date: '2026-09-15', transactions_per_sec: 0.0 },
  { date: '2026-09-16', transactions_per_sec: 0.0 }, { date: '2026-09-17', transactions_per_sec: 0.0 },
  { date: '2026-09-18', transactions_per_sec: 0.0 }, { date: '2026-09-19', transactions_per_sec: 0.0 },
  { date: '2026-09-20', transactions_per_sec: 0.0 }, { date: '2026-09-21', transactions_per_sec: 0.0 },
  { date: '2026-09-22', transactions_per_sec: 0.0 }
];

export const PUBLIC_CLOUD_DB_WORKLOAD_RESPONSE: PublicCloudDbWorkloadResponse = [
  { disk_used_gb: 17.96, cpu_usage_system_percent: 0.0, name: 'sdxdcwmssql_2022_MSSQLSERVER', disk_capacity_gb: 99.69, disk_iops_max: 49.0, disk_utilization_percent: 18.07, system_uptime_seconds: 20979654.0, host_id: 15380, memory_used_percent: 63.77, db_uuid: '9b46dbf9-b00e-4141-8e3f-810173e5fbe8', host_uuid: '86e0d5ef-7d2d-4104-928e-61742f77196c' },
  { disk_used_gb: 17.45, cpu_usage_system_percent: 7.0, name: 'sdxdclmysqlappd01_MYSQLSERVER', disk_iops_max: 3.69, disk_write_ops_per_sec: 3.6914, disk_read_ops_per_sec: 0.0, disk_utilization_percent: 26.4074, system_uptime_seconds: 13648682.0, disk_iops: 3.6914, host_id: 15270, disk_capacity_gb: 66.08, db_uuid: '9ebb1436-790d-410a-84f5-071f86685c91', host_uuid: 'a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf', memory_used_percent: 57.62 },
  { disk_used_gb: 195.31, cpu_usage_system_percent: 33.0, name: 'sdxdclOracleFPPServer_oracledb', disk_iops_max: 25.49, disk_write_ops_per_sec: 21.9943, disk_read_ops_per_sec: 3.4946, disk_utilization_percent: 46.9642, system_uptime_seconds: 16677483.0, disk_iops: 25.4889, host_id: 15124, disk_capacity_gb: 415.87, db_uuid: '24fa0c07-8eeb-48e6-8989-b0eb5ace24f6', host_uuid: '47fbd374-cccb-458f-b70e-5906c4a5d340', memory_used_percent: 57.69 },
  { disk_used_gb: 15.54, cpu_usage_system_percent: 51.0, name: 'sdxdclpostgressrc_postgres', disk_iops_max: 72.93, disk_write_ops_per_sec: 72.9265, disk_read_ops_per_sec: 0.0, disk_utilization_percent: 33.812, system_uptime_seconds: 7790634.0, disk_iops: 72.9265, host_id: 15304, disk_capacity_gb: 45.96, db_uuid: '02b747a7-71d3-429f-a636-42bae9be9b50', host_uuid: '45fc9a5e-2f3b-46fa-9ac5-54a6a699d625', memory_used_percent: 44.74 }
];

export const PUBLIC_CLOUD_DB_QUERY_PERFORMANCE_RESPONSE: PublicCloudDbQueryPerformanceResponse = {
  top_cache_hit_ratio: [
    { status: 'critical', hit_ratio_pct: 0.526, name: 'sdxdclmysqlappd01_MYSQLSERVER', db_type: 'MySQL', host_id: 15270, db_uuid: '9ebb1436-790d-410a-84f5-071f86685c91', host_uuid: 'a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf' },
    { status: 'critical', hit_ratio_pct: 35.064, name: 'sdxdclpostgressrc_postgres', db_type: 'PostgreSQL', host_id: 15304, db_uuid: '02b747a7-71d3-429f-a636-42bae9be9b50', host_uuid: '45fc9a5e-2f3b-46fa-9ac5-54a6a699d625' },
    { status: 'healthy', hit_ratio_pct: 100.0, name: 'sdxdcwmssql_2022_MSSQLSERVER', db_type: 'MSSQL Server', host_id: 15380, db_uuid: '9b46dbf9-b00e-4141-8e3f-810173e5fbe8', host_uuid: '86e0d5ef-7d2d-4104-928e-61742f77196c' },
    { status: 'healthy', hit_ratio_pct: 100.0, name: 'sdxdclOracleFPPServer_oracledb', db_type: 'Oracle', host_id: 15124, db_uuid: '24fa0c07-8eeb-48e6-8989-b0eb5ace24f6', host_uuid: '47fbd374-cccb-458f-b70e-5906c4a5d340' }
  ],
  top_latency: [
    { status: 'critical', name: 'sdxdclmysqlappd01_MYSQLSERVER', db_type: 'MySQL', host_id: 15270, db_uuid: '9ebb1436-790d-410a-84f5-071f86685c91', host_uuid: 'a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf', response_time_ms: 4488.081 },
    { status: 'critical', name: 'sdxdclOracleFPPServer_oracledb', db_type: 'Oracle', host_id: 15124, db_uuid: '24fa0c07-8eeb-48e6-8989-b0eb5ace24f6', host_uuid: '47fbd374-cccb-458f-b70e-5906c4a5d340', response_time_ms: 2726.0 },
    { status: 'healthy', name: 'sdxdclpostgressrc_postgres', db_type: 'PostgreSQL', host_id: 15304, db_uuid: '02b747a7-71d3-429f-a636-42bae9be9b50', host_uuid: '45fc9a5e-2f3b-46fa-9ac5-54a6a699d625', response_time_ms: 0.0 },
    { status: 'healthy', name: 'sdxdcwmssql_2022_MSSQLSERVER', db_type: 'MSSQL Server', host_id: 15380, db_uuid: '9b46dbf9-b00e-4141-8e3f-810173e5fbe8', host_uuid: '86e0d5ef-7d2d-4104-928e-61742f77196c', response_time_ms: 0.0 }
  ],
  top_errors_deadlocks: [
    { status: 'healthy', name: 'sdxdclpostgressrc_postgres', db_type: 'PostgreSQL', deadlock_count: 0.0, host_id: 15304, db_uuid: '02b747a7-71d3-429f-a636-42bae9be9b50', host_uuid: '45fc9a5e-2f3b-46fa-9ac5-54a6a699d625' },
    { status: 'healthy', name: 'sdxdcwmssql_2022_MSSQLSERVER', db_type: 'MSSQL Server', deadlock_count: 0.0, host_id: 15380, db_uuid: '9b46dbf9-b00e-4141-8e3f-810173e5fbe8', host_uuid: '86e0d5ef-7d2d-4104-928e-61742f77196c' },
    { status: 'healthy', name: 'sdxdclOracleFPPServer_oracledb', db_type: 'Oracle', deadlock_count: 0.0, host_id: 15124, db_uuid: '24fa0c07-8eeb-48e6-8989-b0eb5ace24f6', host_uuid: '47fbd374-cccb-458f-b70e-5906c4a5d340' },
    { status: 'healthy', name: 'sdxdclmysqlappd01_MYSQLSERVER', db_type: 'MySQL', deadlock_count: 0.0, host_id: 15270, db_uuid: '9ebb1436-790d-410a-84f5-071f86685c91', host_uuid: 'a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf' }
  ],
  top_throughput: [
    { status: 'critical', name: 'sdxdclpostgressrc_postgres', db_type: 'PostgreSQL', host_id: 15304, db_uuid: '02b747a7-71d3-429f-a636-42bae9be9b50', host_uuid: '45fc9a5e-2f3b-46fa-9ac5-54a6a699d625', trend: PUBLIC_CLOUD_DB_TREND_ZERO },
    { status: 'healthy', name: 'sdxdcwmssql_2022_MSSQLSERVER', db_type: 'MSSQL Server', host_id: 15380, db_uuid: '9b46dbf9-b00e-4141-8e3f-810173e5fbe8', host_uuid: '86e0d5ef-7d2d-4104-928e-61742f77196c', trend: PUBLIC_CLOUD_DB_TREND_ZERO },
    { status: 'healthy', name: 'sdxdclOracleFPPServer_oracledb', db_type: 'Oracle', host_id: 15124, db_uuid: '24fa0c07-8eeb-48e6-8989-b0eb5ace24f6', host_uuid: '47fbd374-cccb-458f-b70e-5906c4a5d340', trend: PUBLIC_CLOUD_DB_TREND_ZERO },
    { status: 'healthy', name: 'sdxdclmysqlappd01_MYSQLSERVER', db_type: 'MySQL', host_id: 15270, db_uuid: '9ebb1436-790d-410a-84f5-071f86685c91', host_uuid: 'a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf', trend: PUBLIC_CLOUD_DB_TREND_ZERO }
  ],
  top_response_time: [
    { status: 'healthy', name: 'sdxdclOracleFPPServer_oracledb', db_type: 'Oracle', host_id: 15124, db_uuid: '24fa0c07-8eeb-48e6-8989-b0eb5ace24f6', host_uuid: '47fbd374-cccb-458f-b70e-5906c4a5d340', response_time_ms: 2.98 },
    { status: 'healthy', name: 'sdxdclpostgressrc_postgres', db_type: 'PostgreSQL', host_id: 15304, db_uuid: '02b747a7-71d3-429f-a636-42bae9be9b50', host_uuid: '45fc9a5e-2f3b-46fa-9ac5-54a6a699d625', response_time_ms: 0.0 },
    { status: 'healthy', name: 'sdxdcwmssql_2022_MSSQLSERVER', db_type: 'MSSQL Server', host_id: 15380, db_uuid: '9b46dbf9-b00e-4141-8e3f-810173e5fbe8', host_uuid: '86e0d5ef-7d2d-4104-928e-61742f77196c', response_time_ms: 0.0 }
  ],
  top_connections: [
    { status: 'healthy', name: 'sdxdclOracleFPPServer_oracledb', db_type: 'Oracle', active_connections: 67.0, host_id: 15124, db_uuid: '24fa0c07-8eeb-48e6-8989-b0eb5ace24f6', host_uuid: '47fbd374-cccb-458f-b70e-5906c4a5d340' },
    { status: 'healthy', name: 'sdxdcwmssql_2022_MSSQLSERVER', db_type: 'MSSQL Server', active_connections: 19.0, host_id: 15380, db_uuid: '9b46dbf9-b00e-4141-8e3f-810173e5fbe8', host_uuid: '86e0d5ef-7d2d-4104-928e-61742f77196c' },
    { status: 'healthy', name: 'sdxdclpostgressrc_postgres', db_type: 'PostgreSQL', active_connections: 12.0, host_id: 15304, db_uuid: '02b747a7-71d3-429f-a636-42bae9be9b50', host_uuid: '45fc9a5e-2f3b-46fa-9ac5-54a6a699d625' },
    { status: 'healthy', name: 'sdxdclmysqlappd01_MYSQLSERVER', db_type: 'MySQL', active_connections: 5.0, host_id: 15270, db_uuid: '9ebb1436-790d-410a-84f5-071f86685c91', host_uuid: 'a85b4772-6b77-4ace-a43b-1d4ea6c9ffbf' }
  ],
  duration: 'last_30_days'
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

// Temporary static response for the Account - Subscription - Project Metrics widget while the
// backend endpoint is not available. Search and paging are applied against this response locally
// until /customer/custom_widget/public-cloud-widgets/account_subscription_project_metrics/ is ready.
export const PUBLIC_CLOUD_ACCOUNT_SUBSCRIPTION_PROJECT_METRICS_RESPONSE: PublicCloudAccountSubscriptionMetricResponseItem[] = [
  { account: 'Azure2', total_vcpu: 0, region: 'eastus', instance_count: 4, estimated_monthly_cost: 0, provider: 'AZURE', used_vcpu: 0 },
  { account: 'Azure2', total_vcpu: 0, region: 'centralindia', instance_count: 5, estimated_monthly_cost: 0, provider: 'AZURE', used_vcpu: 0 },
  { account: 'Azure2', total_vcpu: 0, region: 'eastus2', instance_count: 2, estimated_monthly_cost: 0, provider: 'AZURE', used_vcpu: 0 },
  { account: 'Azure2', total_vcpu: 0, region: 'westus2', instance_count: 4, estimated_monthly_cost: 0, provider: 'AZURE', used_vcpu: 0 },
  { account: 'Azure2', total_vcpu: 0, region: 'westus', instance_count: 2, estimated_monthly_cost: 0, provider: 'AZURE', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'us-west8', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'southamerica-west1', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'northamerica-south1', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'global', instance_count: 76, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'us-central1', instance_count: 10, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'us-central1-f', instance_count: 10, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'us-central1-b', instance_count: 114, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'us-central1-a', instance_count: 845, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'us-east1-b', instance_count: 579, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'asia-south1', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'Unknown', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'europe-west1', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'europe-west2', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'GCP', total_vcpu: 0, region: 'australia-southeast1', instance_count: 1, estimated_monthly_cost: 0, provider: 'GCP', used_vcpu: 0 },
  { account: 'AWS', total_vcpu: 0, region: 'us-west-2', instance_count: 131, estimated_monthly_cost: 0, provider: 'AWS', used_vcpu: 0 },
  { account: 'OCI', total_vcpu: 0, region: 'us-sanjose-1', instance_count: 2, estimated_monthly_cost: 0, provider: 'OCI', used_vcpu: 0 }
];

export const PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_ACCOUNT_RESPONSE: PublicCloudAccountMetricChartResponse = [
  { account: 'Azure2', instance_count: 17, provider: 'AZURE' },
  { account: 'GCP', instance_count: 1679, provider: 'GCP' },
  { account: 'AWS', instance_count: 131, provider: 'AWS' },
  { account: 'OCI', instance_count: 2, provider: 'OCI' }
];

export const PUBLIC_CLOUD_ESTIMATED_MONTHLY_COST_BY_ACCOUNT_RESPONSE: PublicCloudAccountMetricChartResponse = [
  { provider: 'AWS', account: 'UnityOne-Prod-AWS', estimated_monthly_cost: 659 },
  { provider: 'AWS', account: 'UnityOne-Shared-AWS', estimated_monthly_cost: 297 },
  { provider: 'AZURE', account: 'UnityOne-Prod-Sub', estimated_monthly_cost: 780 },
  { provider: 'GCP', account: 'unityone-prod-gcp', estimated_monthly_cost: 1760 }
];

export const PUBLIC_CLOUD_VCPU_UTILIZATION_BY_ACCOUNT_RESPONSE: PublicCloudAccountMetricChartResponse = [
  { provider: 'AWS', account: 'UnityOne-Prod-AWS', vcpu_utilization: 54.2 },
  { provider: 'AWS', account: 'UnityOne-Shared-AWS', vcpu_utilization: 39.4 },
  { provider: 'AZURE', account: 'UnityOne-Prod-Sub', vcpu_utilization: 68.5 },
  { provider: 'OCI', account: 'UnityOne-Shared-Compartment', vcpu_utilization: 79.3 }
];

export const PUBLIC_CLOUD_COST_EFFICIENCY_BY_ACCOUNT_RESPONSE: PublicCloudAccountMetricChartResponse = [
  { provider: 'AWS', account: 'UnityOne-Prod-AWS', cost_per_instance: 219.67 },
  { provider: 'AWS', account: 'UnityOne-Shared-AWS', cost_per_instance: 148.50 },
  { provider: 'AZURE', account: 'UnityOne-Prod-Sub', cost_per_instance: 260 },
  { provider: 'GCP', account: 'unityone-prod-gcp', cost_per_instance: 586.67 }
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

// Temporary static response for the Auto-Remediation Summary widget while the backend endpoint is
// not available. Keep this shape aligned with /customer/custom_widget/public-cloud-widgets/auto_remediation_summary/.
export const PUBLIC_CLOUD_AUTO_REMEDIATION_SUMMARY_RESPONSE: PublicCloudAutoRemediationSummaryResponse = {
  autoRemediations: 184,
  totalRuns: 184,
  successfulRuns: 167,
  failedRuns: 17,
  runningRuns: 0,
  runbookSuccessPct: 90.8,
  runbookFailurePct: 9.2,
  avgDurationMinutes: 3.4,
  avgMttr: '3.4m',
  topAutoRemediationActions: [
    {
      name: 'Right-size Instance',
      count: 64
    },
    {
      name: 'Stop Idle Instance',
      count: 47
    },
    {
      name: 'Revoke Open Security Rule',
      count: 38
    },
    {
      name: 'Delete Orphaned Volume',
      count: 22
    },
    {
      name: 'Reboot Unresponsive Instance',
      count: 13
    }
  ],
  configuredCount: 12
};
