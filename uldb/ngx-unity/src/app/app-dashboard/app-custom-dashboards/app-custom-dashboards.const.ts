import { refreshIntervals } from '../app-dashboard.service';
import { CustomDashboardMetric } from './app-custom-dashboards.type';

// Panel width (%) -> Bootstrap column; used by the Review step and the dashboard view.
export function getCustomDashboardPanelColumnClass(width: number): string {
  switch (width) {
    case 75: return 'col-lg-9';
    case 50: return 'col-lg-6';
    case 25: return 'col-lg-3';
    default: return 'col-12';
  }
}

// Dashboard view: up to this many global filters sit in the title bar (as in the default
// dashboards); more get their own filter bar under it.
export const CUSTOM_DASHBOARD_VIEW_INLINE_FILTERS = 3;

// Auto refresh label; used by the dashboards list and the dashboard view.
export function getCustomDashboardRefreshLabel(refresh: boolean, seconds: number): string {
  if (!refresh || !seconds) {
    return 'Disabled';
  }
  const interval = refreshIntervals.find(r => r.valueInSecs === seconds);
  return interval ? interval.label : `${seconds} seconds`;
}

// Stable identity of a metric selection; used by the panel editor and the panel preview.
export function getCustomDashboardMetricKey(metric: CustomDashboardMetric): string {
  return `${metric.device_type}|${metric.device_id}|${metric.item_id}|${metric.aggregation}`;
}

export interface CustomDashboardCategoryOption {
  label: string;
  value: string;
}

export interface CustomDashboardOption {
  label: string;
  value: string;
}

export interface CustomDashboardChartTypeOption {
  label: string;
  value: string;
  icon: string;
  variants: string[];
}

export interface CustomDashboardGlobalFilterDef {
  key: string;
  label: string;
  description: string;
}

// PLACEHOLDER: the server contract has no lookup for categories yet. Values follow the
// contract example ("infrastructure", "monitoring") and the My Dashboards design categories.
// Replace with the server list once it is available.
export const CUSTOM_DASHBOARD_CATEGORIES: CustomDashboardCategoryOption[] = [
  { label: 'Infrastructure', value: 'infrastructure' },
  { label: 'Monitoring', value: 'monitoring' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Cost', value: 'cost' },
  { label: 'Alerts', value: 'alerts' },
  { label: 'Sustainability', value: 'sustainability' },
];

export const CUSTOM_DASHBOARD_STEPS: string[] = ['Dashboard Basics', 'Smart Panel', 'Global Filters', 'Review & Publish'];

export const CUSTOM_DASHBOARD_PANEL_WIDTHS: number[] = [100, 75, 50, 25];

export const CUSTOM_DASHBOARD_VIEW_MODES: CustomDashboardOption[] = [
  { label: 'Table View', value: 'table' },
  { label: 'Chart View', value: 'chart' },
  { label: 'Both', value: 'both' },
];

// Data Scope sources. Data Center / Private Cloud come from the analytics metadata API
// (kind=datacenter|private_cloud); Public Cloud comes from the existing Public Cloud APIs.
export const CUSTOM_DASHBOARD_SOURCE_KINDS: CustomDashboardOption[] = [
  { label: 'Data Center', value: 'datacenter' },
  { label: 'Private Cloud', value: 'private_cloud' },
  { label: 'Public Cloud', value: 'public_cloud' },
];

export const CUSTOM_DASHBOARD_DEVICE_STATUS: CustomDashboardOption[] = [
  { label: 'All Status', value: 'all' },
  { label: 'Monitored', value: 'monitored' },
  { label: 'Not Monitored', value: 'not' },
];

// Public Cloud providers, in the order the Data Source tree shows them. `id` is the
// provider segment of the /customer/managed/<id>/ APIs.
export const CUSTOM_DASHBOARD_PUBLIC_CLOUD_PROVIDERS: CustomDashboardOption[] = [
  { label: 'AWS', value: 'aws' },
  { label: 'Azure', value: 'azure' },
  { label: 'GCP', value: 'gcp' },
  { label: 'Oracle Cloud', value: 'oci' },
];

// Public Cloud monitoring items (Zabbix) carry no aggregation list; numeric items
// (value_type 0 float / 3 unsigned) get these, other items cannot be charted.
export const CUSTOM_DASHBOARD_PUBLIC_CLOUD_AGGREGATIONS: string[] = ['latest', 'avg', 'min', 'max'];
export const CUSTOM_DASHBOARD_NUMERIC_VALUE_TYPES: number[] = [0, 3];

// Public Cloud device types are "<provider>:<resource type id>" (e.g. "aws:818" = EC2 Instance),
// so one value identifies the provider API and the resource type filter.
export function getCustomDashboardPublicCloudDeviceType(provider: string, resourceTypeId: number | string): string {
  return `${provider}:${resourceTypeId}`;
}

export function parseCustomDashboardPublicCloudDeviceType(deviceType: string): { provider: string, resourceTypeId: string } {
  const parts = (deviceType || '').split(':');
  return parts.length === 2 && parts[0] && parts[1] ? { provider: parts[0], resourceTypeId: parts[1] } : null;
}

// Devices table "selection" filter (client side, over the loaded devices).
export const CUSTOM_DASHBOARD_DEVICE_SELECTION: CustomDashboardOption[] = [
  { label: 'All Devices', value: 'all' },
  { label: 'Selected', value: 'selected' },
  { label: 'Unselected', value: 'unselected' },
];

// Zabbix item value_type -> label shown in the metric details.
export const CUSTOM_DASHBOARD_ITEM_VALUE_TYPES: { [valueType: number]: string } = {
  0: 'Numeric (float)',
  1: 'Character',
  2: 'Log',
  3: 'Numeric (unsigned)',
  4: 'Text',
};

// chart-data accepts chart_type line|area|bar|pie|treemap|single. Variants are optional;
// only the ones named in the contract are offered.
export const CUSTOM_DASHBOARD_CHART_TYPES: CustomDashboardChartTypeOption[] = [
  { label: 'Line Chart', value: 'line', icon: 'fas fa-chart-line', variants: ['Basic Line'] },
  { label: 'Area Chart', value: 'area', icon: 'fas fa-chart-area', variants: [] },
  { label: 'Bar Chart', value: 'bar', icon: 'fas fa-chart-bar', variants: [] },
  { label: 'Pie Chart', value: 'pie', icon: 'fas fa-chart-pie', variants: [] },
  { label: 'Treemap', value: 'treemap', icon: 'fas fa-th-large', variants: [] },
  { label: 'KPI / Single Value', value: 'single', icon: 'fas fa-square', variants: ['KPI Card'] },
];

// Limits from the contract: grouped devices take <= 2 sources, items take <= 20 devices,
// chart-data / table-data take 1-20 metrics / columns.
export const CUSTOM_DASHBOARD_MAX_SOURCES = 2;
export const CUSTOM_DASHBOARD_MAX_DEVICES = 20;
export const CUSTOM_DASHBOARD_MAX_METRICS = 20;
export const CUSTOM_DASHBOARD_PREVIEW_POINTS = 120;
export const CUSTOM_DASHBOARD_METADATA_PAGE_SIZE = 100;
// Device and item lists are read page by page (100 per page) up to this many pages.
export const CUSTOM_DASHBOARD_METADATA_MAX_PAGES = 20;

export const CUSTOM_DASHBOARD_GLOBAL_FILTERS: CustomDashboardGlobalFilterDef[] = [
  { key: 'timerange', label: 'Time Range', description: 'The default reporting window for every widget with a time axis.' },
  { key: 'datacenter', label: 'Datacenter', description: 'Filters devices and metrics by physical datacenter location.' },
  { key: 'environment', label: 'Environment', description: 'Prod / Stage / Dev tagging, where available.' },
  { key: 'cloudtype', label: 'Cloud Type', description: 'Public, private, or hybrid cloud classification.' },
  { key: 'privatecloud', label: 'Private Cloud', description: 'Filters by on-prem hypervisor platform (VMware, Nutanix, etc.).' },
  { key: 'publiccloud', label: 'Public Cloud', description: 'Filters by public cloud provider (AWS, Azure, GCP, Oracle).' },
  { key: 'region', label: 'Region', description: 'Broad geographic grouping across datacenters and cloud regions.' },
  { key: 'account', label: 'Account / Subscription', description: 'The billing/account boundary for the selected cloud provider.' },
  { key: 'businessunit', label: 'Business Unit', description: 'Groups resources and spend by internal business unit.' },
  { key: 'costcenter', label: 'Cost Center', description: 'Groups resources and spend by finance cost center code.' },
  { key: 'application', label: 'Application', description: 'Filters by the owning application or service group.' },
  { key: 'service', label: 'Service', description: 'Filters by individual microservice or service name.' },
];
