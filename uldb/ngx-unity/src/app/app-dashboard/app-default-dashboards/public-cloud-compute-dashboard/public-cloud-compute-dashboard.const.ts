import { environment } from 'src/environments/environment';
import {
  PublicCloudAccountOption,
  PublicCloudComputeBreakdownProviderKey,
  PublicCloudComputeBreakdownStatKey,
  PublicCloudFilterOption,
  PublicCloudInventorySummaryKey,
  PublicCloudProviderDistributionKey,
  PublicCloudRegionOption,
  PublicCloudTagItem
} from './public-cloud-compute-dashboard.type';

export const PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT = '/customer/public-cloud-widgets/inventory_summary';
export const PUBLIC_CLOUD_COMPUTE_BREAKDOWN_ENDPOINT = '/customer/public-cloud-widgets/compute_breakdown';
export const PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT = '/customer/public-cloud-widgets/orphaned_devices';
export const PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT = '/customer/public-cloud-widgets/orphaned_devices_by_category';
export const PUBLIC_CLOUD_IDLE_DEVICES_ENDPOINT = '/customer/public-cloud-widgets/idle_devices';
export const PUBLIC_CLOUD_IDLE_DEVICES_BY_DURATION_ENDPOINT = '/customer/public-cloud-widgets/idle_devices_by_duration';
export const PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT = '/customer/public-cloud-widgets/recent_alerts';
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
