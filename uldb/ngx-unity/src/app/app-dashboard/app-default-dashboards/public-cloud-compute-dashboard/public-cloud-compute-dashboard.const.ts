import { environment } from 'src/environments/environment';
import {
  PublicCloudAccountOption,
  PublicCloudAIOpsDetailsRawEventsDetails,
  PublicCloudAIOpsGraphGroupKey,
  PublicCloudAIOpsGraphMetricKey,
  PublicCloudAlertPieKey,
  PublicCloudAlertSummaryKey,
  PublicCloudComputeBreakdownProviderKey,
  PublicCloudComputeBreakdownStatKey,
  PublicCloudDatabaseLatencyBadge,
  PublicCloudFilterOption,
  PublicCloudHeatmapGroup,
  PublicCloudHorizontalBarItem,
  PublicCloudInventorySummaryKey,
  PublicCloudProviderDistributionKey,
  PublicCloudRegionOption,
  PublicCloudStatusTone,
  PublicCloudTagItem,
  PublicCloudTicketResponseTimeKey,
  PublicCloudUtilizationRow
} from './public-cloud-compute-dashboard.type';

export const PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT = '/customer/public-cloud-widgets/inventory_summary';
export const PUBLIC_CLOUD_COMPUTE_BREAKDOWN_ENDPOINT = '/customer/public-cloud-widgets/compute_breakdown';
export const PUBLIC_CLOUD_TOP_CRITICAL_ALERTS_ENDPOINT = '/customer/public-cloud-widgets/top_critical_alerts';
export const PUBLIC_CLOUD_AIOPS_DETAILS_ENDPOINT = '/customer/public-cloud-widgets/aiops_details';
export const PUBLIC_CLOUD_TICKET_GRAPH_DATA_ENDPOINT = '/customer/public-cloud-widgets/get_ticket_graph_data';
export const PUBLIC_CLOUD_TICKETS_ENDPOINT = '/customer/public-cloud-widgets/get_tickets';
export const PUBLIC_CLOUD_ALL_SELECTED_VALUE = 'all';

export const PUBLIC_CLOUD_PLATFORM_OPTIONS: PublicCloudFilterOption[] = [
  { value: PUBLIC_CLOUD_ALL_SELECTED_VALUE, label: 'All Selected' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
  { value: 'oracle', label: 'Oracle' }
];

export const PUBLIC_CLOUD_REGION_OPTIONS: PublicCloudRegionOption[] = [
  { value: 'us-central-texas', label: 'US Central - Texas', platforms: ['aws', 'azure', 'gcp'] },
  { value: 'us-west-california', label: 'US West - California', platforms: ['aws', 'gcp', 'oracle'] },
  { value: 'us-east-virginia', label: 'US East - Virginia', platforms: ['aws', 'azure'] },
  { value: 'new-york', label: 'New York', platforms: ['azure', 'gcp'] },
  { value: 'oregon', label: 'Oregon', platforms: ['aws', 'oracle'] },
  { value: 'east-us', label: 'East US', platforms: ['azure'] },
  { value: 'west-europe', label: 'West Europe', platforms: ['gcp', 'oracle'] }
];

export const PUBLIC_CLOUD_ACCOUNT_OPTIONS: PublicCloudAccountOption[] = [
  { value: 'aws-prod-01', label: 'AWS Prod 01', platform: 'aws', region: 'us-central-texas' },
  { value: 'aws-core-network', label: 'AWS Core Network', platform: 'aws', region: 'us-east-virginia' },
  { value: 'aws-edge-west', label: 'AWS Edge West', platform: 'aws', region: 'oregon' },
  { value: 'azure-sql-02', label: 'Azure SQL 02', platform: 'azure', region: 'east-us' },
  { value: 'azure-app-prod', label: 'Azure App Prod', platform: 'azure', region: 'new-york' },
  { value: 'azure-data-hub', label: 'Azure Data Hub', platform: 'azure', region: 'us-central-texas' },
  { value: 'gcp-commerce', label: 'GCP Commerce', platform: 'gcp', region: 'us-west-california' },
  { value: 'gcp-analytics', label: 'GCP Analytics', platform: 'gcp', region: 'new-york' },
  { value: 'gcp-platform', label: 'GCP Platform', platform: 'gcp', region: 'west-europe' },
  { value: 'oci-finance', label: 'OCI Finance', platform: 'oracle', region: 'oregon' },
  { value: 'oci-retail', label: 'OCI Retail', platform: 'oracle', region: 'us-west-california' },
  { value: 'oci-eu-shared', label: 'OCI EU Shared', platform: 'oracle', region: 'west-europe' }
];

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

export const PUBLIC_CLOUD_REGION_HEATMAP: PublicCloudHeatmapGroup[] = [
  {
    name: 'US-Central\nTexas',
    color: '#5875c8',
    labelX: 0,
    labelY: 0,
    children: [
      { name: 'DC-TX-1', value: 32, x: 0, y: 12, width: 17.33, height: 44 },
      { name: 'DC-TX-2', value: 36, x: 17.33, y: 12, width: 17.34, height: 44, usage: 'Usage: 1245 TB' },
      { name: 'DC-TX-3', value: 35, x: 34.67, y: 12, width: 17.33, height: 44 }
    ]
  },
  {
    name: 'Illinois',
    color: '#5875c8',
    labelX: 52,
    labelY: 6,
    children: [
      { name: 'DC-IL-1', value: 33, x: 52, y: 12, width: 8.5, height: 44 },
      { name: 'DC-IL-2', value: 30, x: 60.5, y: 12, width: 8.5, height: 44 }
    ]
  },
  {
    name: 'US-West\nCalifornia',
    color: '#ffca4d',
    labelX: 69,
    labelY: 0,
    children: [
      { name: 'DC-CA-1', value: 42, x: 69, y: 12, width: 15.5, height: 33 },
      { name: 'DC-CA-2', value: 38, x: 69, y: 45, width: 15.5, height: 27 },
      { name: 'DC-CA-3', value: 40, x: 84.5, y: 12, width: 15.5, height: 60 }
    ]
  },
  {
    name: 'US-East\nVirginia',
    color: '#90cc74',
    labelX: 0,
    labelY: 58,
    children: [
      { name: 'DC-VA-1', value: 34, x: 0, y: 68, width: 17.33, height: 32 },
      { name: 'DC-VA-2', value: 35, x: 17.33, y: 68, width: 17.34, height: 32 },
      { name: 'DC-VA-3', value: 31, x: 34.67, y: 68, width: 17.33, height: 32 }
    ]
  },
  {
    name: 'New York',
    color: '#8ccd72',
    labelX: 54,
    labelY: 62,
    children: [
      { name: 'DC-NY-1', value: 30, x: 52, y: 68, width: 17, height: 16 },
      { name: 'DC-NY-2', value: 29, x: 52, y: 84, width: 17, height: 16 }
    ]
  },
  {
    name: 'Oregon',
    color: '#ffc64b',
    labelX: 69,
    labelY: 74,
    children: [
      { name: 'DC-OR-1', value: 28, x: 69, y: 80, width: 15.5, height: 20 },
      { name: 'DC-OR-2', value: 25, x: 84.5, y: 80, width: 15.5, height: 20 }
    ]
  }
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

export const PUBLIC_CLOUD_UTILIZATION_ROWS: PublicCloudUtilizationRow[] = [
  {
    name: 'Cisco 1',
    cpuSeries: [20, 25, 28, 27, 34, 31, 38, 35, 41, 39, 44, 42, 48, 45, 52, 49, 55],
    cpuStatus: 24,
    cpuTone: 'success',
    memorySeries: [5, 5, 6, 5, 6, 5, 6, 5, 100, 8, 7, 6, 6, 5, 6, 6, 5],
    memoryStatus: 24,
    memoryTone: 'success',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '98k', percent: 68, tone: 'danger' },
    upTime: '26d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [16, 19, 18, 21, 24, 20, 25, 22, 24, 26, 29, 33, 31, 34, 30, 38, 96],
    cpuStatus: 51,
    cpuTone: 'warning',
    memorySeries: [10, 18, 26, 37, 45, 48, 60, 74, 82, 81, 76, 74, 70, 64, 55, 49, 38],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '84k', percent: 63, tone: 'warning' },
    upTime: '21h'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [25, 44, 31, 53, 35, 58, 42, 61, 40, 65, 49, 74, 52, 82, 60, 89, 66],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [25, 34, 37, 42, 39, 48, 46, 55, 51, 60, 58, 66, 63, 70, 67, 75, 72],
    memoryStatus: 24,
    memoryTone: 'success',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '78k', percent: 60, tone: 'warning' },
    upTime: '20h'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [18, 20, 28, 34, 45, 48, 64, 78, 82, 80, 76, 74, 69, 65, 60, 53, 46],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [18, 20, 22, 25, 21, 28, 24, 26, 20, 24, 22, 25, 27, 31, 29, 86, 35],
    memoryStatus: 51,
    memoryTone: 'warning',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '65k', percent: 56, tone: 'warning' },
    upTime: '12d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [6, 6, 7, 6, 6, 7, 6, 6, 6, 7, 6, 6, 95, 7, 6, 7, 6],
    cpuStatus: 24,
    cpuTone: 'success',
    memorySeries: [22, 45, 28, 58, 34, 54, 37, 63, 40, 66, 43, 72, 48, 79, 52, 88, 55],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '50k', percent: 48, tone: 'warning' },
    upTime: '29d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [22, 31, 35, 42, 38, 47, 44, 56, 51, 63, 60, 72, 67, 80, 74, 88, 82],
    cpuStatus: 51,
    cpuTone: 'warning',
    memorySeries: [10, 14, 20, 31, 39, 51, 54, 70, 82, 88, 84, 79, 75, 70, 61, 49, 37],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '40k', percent: 36, tone: 'success' },
    upTime: '71d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [16, 18, 19, 21, 19, 22, 23, 20, 24, 22, 23, 24, 25, 26, 27, 28, 92],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [5, 5, 6, 5, 5, 6, 5, 5, 5, 6, 5, 5, 96, 6, 5, 5, 5],
    memoryStatus: 24,
    memoryTone: 'success',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '34k', percent: 31, tone: 'success' },
    upTime: '5d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [28, 48, 35, 59, 42, 65, 48, 72, 50, 76, 56, 80, 61, 84, 66, 89, 72],
    cpuStatus: 51,
    cpuTone: 'warning',
    memorySeries: [30, 38, 42, 47, 45, 53, 51, 60, 58, 67, 65, 72, 69, 76, 73, 80, 78],
    memoryStatus: 51,
    memoryTone: 'warning',
    storage: { capacity: '256GB', used: '179GB', free: '30%', percent: 70, tone: 'warning' },
    diskIops: { label: '29k', percent: 23, tone: 'success' },
    upTime: '19d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [14, 16, 22, 28, 39, 48, 62, 76, 78, 75, 72, 68, 62, 57, 49, 43, 35],
    cpuStatus: 81,
    cpuTone: 'danger',
    memorySeries: [15, 18, 20, 22, 21, 24, 19, 22, 20, 25, 24, 28, 27, 29, 33, 82, 35],
    memoryStatus: 81,
    memoryTone: 'danger',
    storage: { capacity: '256GB', used: '128', free: '50%', percent: 50, tone: 'success' },
    diskIops: { label: '21k', percent: 18, tone: 'success' },
    upTime: '11d'
  },
  {
    name: 'Cisco 1',
    cpuSeries: [6, 6, 7, 6, 6, 7, 7, 6, 7, 6, 7, 6, 98, 6, 7, 6, 7],
    cpuStatus: 24,
    cpuTone: 'success',
    memorySeries: [26, 46, 29, 56, 33, 62, 37, 69, 41, 73, 45, 79, 50, 85, 55, 90, 58],
    memoryStatus: 51,
    memoryTone: 'warning',
    storage: { capacity: '1024GB', used: '922GB', free: '10%', percent: 90, tone: 'danger' },
    diskIops: { label: '15k', percent: 13, tone: 'success' },
    upTime: '21d'
  }
];

export const PUBLIC_CLOUD_HIGH_LATENCY_WORKLOADS: PublicCloudHorizontalBarItem[] = [
  { name: 'svc-checkout-prod', value: 842, label: '842ms', color: '#e94a4a' },
  { name: 'api-search-prod', value: 718, label: '718ms', color: '#e94a4a' },
  { name: 'svc-payment-gw', value: 624, label: '624ms', color: '#e94a4a' },
  { name: 'rpc-inventory-u1', value: 521, label: '521ms', color: '#ff8a00' },
  { name: 'api-analytics-U1', value: 448, label: '448ms', color: '#f5a623' },
  { name: 'svc-notification', value: 381, label: '381ms', color: '#f5a623' },
  { name: 'tn-image-resize', value: 312, label: '312ms', color: '#2f8bd7' },
  { name: 'api-users-prod', value: 248, label: '248ms', color: '#2f8bd7' },
  { name: 'svc-email-U1', value: 191, label: '191ms', color: '#2f8bd7' },
  { name: 'api-reports-U1', value: 148, label: '148ms', color: '#5b9e29' }
];

export const PUBLIC_CLOUD_HIGH_ERROR_WORKLOADS: PublicCloudHorizontalBarItem[] = [
  { name: 'svc-checkout-prod', value: 8.4, label: '8.4%', color: '#e94a4a' },
  { name: 'api-search-prod', value: 6.9, label: '6.9%', color: '#e94a4a' },
  { name: 'fn-data-ingest', value: 5.8, label: '5.8%', color: '#e94a4a' },
  { name: 'svc-payment-gw', value: 4.2, label: '4.2%', color: '#ff8a00' },
  { name: 'api-analytics', value: 3.6, label: '3.6%', color: '#f5a623' },
  { name: 'svc-auth-prod', value: 2.8, label: '2.8%', color: '#f5a623' },
  { name: 'tn-image-resize', value: 2.1, label: '2.1%', color: '#2f8bd7' },
  { name: 'api-inventory', value: 1.7, label: '1.7%', color: '#2f8bd7' },
  { name: 'svc-reporting', value: 1.2, label: '1.2%', color: '#2f8bd7' },
  { name: 'api-users-prod', value: 0.8, label: '0.8%', color: '#5b9e29' }
];

export const PUBLIC_CLOUD_DATABASE_PERFORMANCE: PublicCloudHorizontalBarItem[] = [
  { name: 'RDS-prod-01', value: 88, label: '88%', color: '#e94a4a' },
  { name: 'CloudSQL-01', value: 74, label: '74%', color: '#f5a623' },
  { name: 'Azure SQL-02', value: 69, label: '69%', color: '#f5a623' },
  { name: 'DynamoDB-01', value: 52, label: '52%', color: '#2f8bd7' }
];

export const PUBLIC_CLOUD_DATABASE_LATENCY_BADGES: PublicCloudDatabaseLatencyBadge[] = [
  { name: 'RDS', value: '142ms', textColor: '#e94a4a', backgroundColor: '#fde5e5' },
  { name: 'CloudSQL', value: '89ms', textColor: '#b77721', backgroundColor: '#fff0d8' },
  { name: 'AzureSQL', value: '31ms', textColor: '#4f8b2c', backgroundColor: '#e8f2d8' }
];

export const PUBLIC_CLOUD_ALERT_SUMMARY_CONFIG: Array<{
  key: PublicCloudAlertSummaryKey,
  label: string,
  tone: PublicCloudStatusTone,
  suffix?: string
}> = [
  { key: 'critical_alerts', label: 'Critical Alerts', tone: 'danger' },
  { key: 'high_alerts', label: 'High Alerts', tone: 'warning' },
  { key: 'open_itsm_tickets', label: 'Open ITSM Tickets', tone: 'primary' },
  { key: 'automation_success', label: 'Automation Success', tone: 'success', suffix: '%' },
  { key: 'avg_mttr', label: 'Avg MTTR', tone: 'muted' }
];

export const PUBLIC_CLOUD_ALERT_TREND_PIE_CONFIG: Array<{
  key: PublicCloudAlertPieKey,
  name: string,
  color: string
}> = [
  { key: 'raw_events', name: 'Raw Events', color: '#ff8f8f' },
  { key: 'alerts', name: 'Alerts', color: '#ffbf69' },
  { key: 'conditions', name: 'Conditions', color: '#9ed0ff' }
];

export const PUBLIC_CLOUD_ALERT_TREND_STACK_CONFIG: Array<{
  key: PublicCloudAIOpsGraphGroupKey,
  name: string,
  items: Array<{
    key: PublicCloudAIOpsGraphMetricKey,
    label: string,
    color: string
  }>
}> = [
  {
    key: 'raw_events',
    name: 'Raw Events',
    items: [
      { key: 'critical', label: 'Critical', color: '#d90000' },
      { key: 'warning', label: 'Warning', color: '#ff8a00' },
      { key: 'informative', label: 'Informative', color: '#62bfd8' }
    ]
  },
  {
    key: 'noise_reduction',
    name: 'Noise Reduction',
    items: [
      { key: 'dedupe', label: 'Dedupe', color: '#c8ced4' },
      { key: 'suppressed', label: 'Suppressed', color: '#9aa6b2' },
      { key: 'correlated', label: 'Correlated', color: '#ff8f8f' }
    ]
  },
  {
    key: 'first_response',
    name: 'First Response',
    items: [
      { key: 'auto_cloned', label: 'Auto Cloned', color: '#85dba6' },
      { key: 'ticket_created', label: 'Ticket Created', color: '#84bff0' },
      { key: 'auto_closed', label: 'Auto Closed', color: '#009b88' }
    ]
  }
];

export const PUBLIC_CLOUD_ALERT_SIDE_CARD_CONFIG: Array<{
  title: string,
  valueKey: keyof PublicCloudAIOpsDetailsRawEventsDetails,
  suffix?: string,
  metrics: Array<{
    label: string,
    key: keyof PublicCloudAIOpsDetailsRawEventsDetails,
    tone?: PublicCloudStatusTone
  }>
}> = [
  {
    title: 'Raw Events',
    valueKey: 'raw_events',
    metrics: [
      { label: 'Critical', key: 'critical', tone: 'danger' },
      { label: 'Warning', key: 'warning', tone: 'warning' },
      { label: 'Informative', key: 'informative', tone: 'primary' }
    ]
  },
  {
    title: 'Noise Reduction',
    valueKey: 'noise_reduction',
    suffix: '%',
    metrics: [
      { label: 'Dedupe Events', key: 'dedupe_events' },
      { label: 'Suppressed Events', key: 'suppressed_events' },
      { label: 'Correlated', key: 'correlated' }
    ]
  },
  {
    title: 'First Response',
    valueKey: 'first_response',
    suffix: '%',
    metrics: [
      { label: 'Auto Clonned', key: 'auto_cloned' },
      { label: 'Ticket Created', key: 'ticket_created' },
      { label: 'Auto Closed', key: 'auto_closed' }
    ]
  }
];

export const PUBLIC_CLOUD_TICKET_CHART_COLORS = [
  '#4caf8f',
  '#3a7bd5',
  '#8492a6',
  '#f2a33a',
  '#d95d5d',
  '#6b5dd3',
  '#2fa7a0',
  '#9aa6b2'
];

export const PUBLIC_CLOUD_TICKET_RESPONSE_TIME_CONFIG: Array<{
  key: PublicCloudTicketResponseTimeKey,
  name: string,
  color: string
}> = [
  { key: 'one_day', name: '1 Day', color: '#4caf8f' },
  { key: 'one_week', name: '1 Week', color: '#3a7bd5' },
  { key: 'one_month', name: '1 Month', color: '#f2a33a' },
  { key: 'greaterthan_month', name: '>1 Month', color: '#d95d5d' }
];

export const PUBLIC_CLOUD_TICKET_STATE_OPTIONS: PublicCloudFilterOption[] = [
  { value: '', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' }
];

export const PUBLIC_CLOUD_TICKET_PRIORITY_OPTIONS: PublicCloudFilterOption[] = [
  { value: '', label: 'All' },
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Moderate' },
  { value: '4', label: '4 - Low' }
];

export const PUBLIC_CLOUD_TICKET_TYPE_OPTIONS: PublicCloudFilterOption[] = [
  { value: '', label: 'All' },
  { value: 'change_request', label: 'Change Request' },
  { value: 'incident', label: 'Incident' },
  { value: 'problem', label: 'Problem' }
];
