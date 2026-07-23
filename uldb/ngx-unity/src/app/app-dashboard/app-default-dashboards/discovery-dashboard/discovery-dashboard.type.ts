
export interface DiscoveryDashboardFilterOption {
  label: string;
  value: string;
}

export interface DiscoveryDashboardFilterOptions {
  time_range: string[];
  regions: string[];
}

export interface DiscoveryDashboardFilterCriteria {
  region: string[];
  timeRange: string;
}

export interface DiscoveryDashboardFilterFormValue {
  region: DiscoveryDashboardFilterOption[];
  timeRange: string;
}

export interface ExecutiveKpiData {
  devices_pending_monitoring: number;
  discovered_devices_total: number;
  discovery_failures: number;
  discovery_success_rate: number;
  newly_discovered_resources: number;
  orphan_devices: number;
}

export class ExecutiveKpiViewData {
  devicesPendingMonitoring;
  discoveredDevicesTotal;
  discoveryFailures;
  discoverySuccessRate;
  newlyDiscoveredResources;
  orphanDevices;
}

export interface DiscoveryTrendAnalyticsItemData {
  week: string;
  value: number;
}

export interface DiscoveryTrendAnalyticsData {
  total: DiscoveryTrendAnalyticsItemData[];
  new: DiscoveryTrendAnalyticsItemData[];
}

export class DiscoveryTrendAnalyticsItemViewData {
  week: string;
  value: number;
}

export class DiscoveryTrendAnalyticsViewData {
  total: DiscoveryTrendAnalyticsItemViewData[] = [];
  newlyDiscovered: DiscoveryTrendAnalyticsItemViewData[] = [];
}

export class DiscoveryTrendAnalyticsTableRowViewData {
  week: string;
  weekOrder: number;
  totalDevices: number;
  newDevices: number;
}

export type DiscoveryTrendAnalyticsSortColumn = 'weekOrder' | 'totalDevices' | 'newDevices';

export interface DiscoverySuccessFailureItemData {
  week: string;
  value: number;
}

export interface DiscoverySuccessFailureData {
  failure: DiscoverySuccessFailureItemData[];
  total: DiscoverySuccessFailureItemData[];
  success: DiscoverySuccessFailureItemData[];
}

export class DiscoverySuccessFailureTableRowViewData {
  week: string;
  weekOrder: number;
  success: number;
  failure: number;
  total: number;
}

export type DiscoverySuccessFailureSortColumn = 'weekOrder' | 'success' | 'failure' | 'total';

export interface CmdbSyncInsightsMetric {
  value: number;
  unit?: string;
  successful_syncs?: number;
  total_sync_attempts?: number;
  change_percent: number;
  trend: string;
  percentage?: number;
}

export interface CmdbSyncInsightsFilters {
  time_range: string;
  regions: string[];
}

export interface CmdbSyncInsightsPeriod {
  start: string;
  end: string;
  comparison_start: string;
  comparison_end: string;
}

export interface CmdbSyncInsights {
  cmdb_sync_rate: CmdbSyncInsightsMetric;
  ci_update_failures: CmdbSyncInsightsMetric;
  orphaned_cis: CmdbSyncInsightsMetric;
  unmapped_cis: CmdbSyncInsightsMetric;
  duplicate_cis: CmdbSyncInsightsMetric;
  filters?: CmdbSyncInsightsFilters;
  period?: CmdbSyncInsightsPeriod;
}

export class CmdbSyncInsightsMetricViewData {
  label: string;
  valueText: string;
  trendText: string;
  valueClass: string;
  trendClass: string;
}

export class CmdbSyncInsightsViewData {
  cmdbSyncRate: CmdbSyncInsightsMetricViewData = new CmdbSyncInsightsMetricViewData();
  ciUpdateFailures: CmdbSyncInsightsMetricViewData = new CmdbSyncInsightsMetricViewData();
  orphanedCis: CmdbSyncInsightsMetricViewData = new CmdbSyncInsightsMetricViewData();
  unmappedCis: CmdbSyncInsightsMetricViewData = new CmdbSyncInsightsMetricViewData();
  duplicateCis: CmdbSyncInsightsMetricViewData = new CmdbSyncInsightsMetricViewData();
}

export interface CiDistributionItem {
  category: string;
  category_key: string;
  count: number;
  share: number;
  redirect_url?: string;
}

export interface CiDistributionByDevice {
  total: number;
  results: CiDistributionItem[];
}

export class CiDistributionTableRowViewData {
  category: string;
  categoryKey: string;
  count: number;
  share: number;
  redirectUrl: string;
}

export type CiDistributionSortColumn = 'category' | 'count' | 'share';

export interface CiDistributionByDeviceDataItem {
  device_type?: string;
  device_type_key?: string;
  category?: string;
  category_key?: string;
  redirect_url?: string;
  segregation?: string;
  source_device_types?: string[];
  count: number;
  share: number;
}

export interface CiDistributionByDeviceData {
  total: number;
  results: CiDistributionByDeviceDataItem[];
}

export class CiDistributionByDeviceTableRowViewData {
  deviceType: string;
  deviceTypeKey: string;
  redirectUrl: string;
  segregation: string;
  sourceDeviceTypes: string[];
  count: number;
  share: number;
}

export type CiDistributionByDeviceSortColumn = 'deviceType' | 'count' | 'share';

export interface CiDistributionByDiscoveryItem {
  down: number;
  protocol: string;
  unknown: number;
  target_resources: string;
  discovery_method: string;
  resources_discovered: number;
  up: number;
  last_run: string;
}

export type CiDistributionByDiscovery = CiDistributionByDiscoveryItem[];

export class CiDistributionByDiscoveryTableRowViewData {
  discoveryMethod: string;
  targetResources: string;
  protocol: string;
  resourcesDiscovered: number;
  up: number;
  down: number;
  unknown: number;
  lastRun: string;
}

export type CiDistributionByDiscoverySortColumn =
  'discoveryMethod'
  | 'targetResources'
  | 'protocol'
  | 'resourcesDiscovered'
  | 'up'
  | 'down'
  | 'unknown'
  | 'lastRun';

export interface ResourceDiscoveryData {
  [key: string]: number;
}

export class ResourceDiscoveryViewData {
  name: string;
  value: number;
}

export interface NewlyDiscoveredDevice {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewlyDiscoveredDeviceItem[];
}

export interface NewlyDiscoveredManufacturerModelItem {
  model: string;
  count: number;
}

export interface NewlyDiscoveredManufacturerDistributionItem {
  manufacturer: string;
  total: number;
  models: NewlyDiscoveredManufacturerModelItem[];
}

export interface NewlyDiscoveredManufacturerModelDistribution {
  total: number;
  results: NewlyDiscoveredManufacturerDistributionItem[];
}

export interface NewlyDiscoveredDatacenterDistributionItem {
  datacenter: string;
  count: number;
}

export interface NewlyDiscoveredDatacenterDistribution {
  total: number;
  results: NewlyDiscoveredDatacenterDistributionItem[];
}

export interface NewlyDiscoveredStatusByDatacenterItem {
  datacenter: string;
  total: number;
  up: number;
  down: number;
  unknown: number;
}

export interface NewlyDiscoveredStatusByDatacenterDistribution {
  total: number;
  results: NewlyDiscoveredStatusByDatacenterItem[];
}

export interface OrphanedDeviceByTypeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrphanedDeviceByTypeItem[];
}

export interface OrphanedDeviceByTypeItem {
  uuid: string;
  device_name?: string;
  name?: string;
  device?: string;
  status: string;
  device_type: string;
  deviceType?: string;
  vmSubType?: string;
  configured?: boolean;
  last_seen?: string;
  last_availability_time?: string;
  datacenter: string;
}

export class OrphanedDeviceByTypeItemViewData {
  uuid: string;
  deviceName: string;
  device?: string;
  deviceTypeKey?: string;
  vmSubType?: string;
  configured?: boolean;
  status: string;
  statusIconClass: string;
  deviceType: string;
  lastSeen: string;
  lastSeenTimestamp: number;
  datacenter: string;
}

export type OrphanedDeviceByTypeSortColumn =
  'deviceName'
  | 'status'
  | 'deviceType'
  | 'lastSeenTimestamp'
  | 'datacenter';

export interface OrphanedDevicesBreakdownItem {
  category: string;
  count: number;
  percentage: number;
}

export interface OrphanedDevicesBreakdownResponse {
  total_count: number;
  breakdown: OrphanedDevicesBreakdownItem[];
}

export interface NewlyDiscoveredDeviceItem {
  availability_status: string;
  ci_name: string;
  ci_type: string;
  datacenter: string;
  discovery_method: string;
  last_discovered: string;
  last_discovered_at: string;
  manufacturer: string;
  model: string;
  platform: string;
  serial_number: string;
  os_type: string;
  uptime: string;
}

export class NewlyDiscoveredDeviceItemViewData {
  availabilityStatus: string;
  availabilityStatusClass: string;
  ciName: string;
  ciType: string;
  datacenter: string;
  datacenterClass: string;
  discoveryMethod: string;
  discoveryMethodClass: string;
  lastDiscovered: string;
  lastDiscoveredTimestamp: number;
  manufacturer: string;
  model: string;
  osTypeGroup: string;
  platform: string;
  serialNumber: string;
  uptime: string;
  uptimeDays: number;
}

export type NewlyDiscoveredDevicesSortColumn =
  'ciName'
  | 'ciType'
  | 'platform'
  | 'serialNumber'
  | 'manufacturer'
  | 'model'
  | 'datacenter'
  | 'osTypeGroup'
  | 'discoveryMethod'
  | 'lastDiscoveredTimestamp'
  | 'uptimeDays'
  | 'availabilityStatus';
export interface TopDiscoveryFailuresItem {
  policy_name: string;
  failure_count: number;
  last_failure: string;
}

export class TopDiscoveryFailuresItemViewData {
  policyName: string;
  failureCount: number;
  lastFailure: string;
}

export type TopDiscoveryFailures = TopDiscoveryFailuresItem[];

export type TopDiscoveryFailuresSortColumn = 'policyName' | 'failureCount' | 'lastFailure';

export interface OperatingSystemsItem {
  count: number;
  eol_data: string | null;
  os_type: string;
  os_version: string;
}

export class OperatingSystemsItemViewData {
  count: number;
  eolData: string;
  osType: string;
  osVersion: string;
}

export type OperatingSystems = OperatingSystemsItem[];

export type OperatingSystemsSortColumn = 'osType' | 'osVersion' | 'count' | 'eolData';

export interface CmdbSyncTrendItem {
  week: string;
  failed: number;
  pending: number;
  synced_cis: number;
  discovered_cis: number;
}

export type CmdbSyncTrend = CmdbSyncTrendItem[];

export class CmdbSyncTrendTableRowViewData {
  week: string;
  weekOrder: number;
  discoveredCis: number;
  syncedCis: number;
  failed: number;
  pending: number;
}

export type CmdbSyncTrendSortColumn = 'weekOrder' | 'discoveredCis' | 'syncedCis' | 'failed' | 'pending';
