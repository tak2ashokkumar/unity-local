
export interface DiscoveryDashboardFilterOption {
  label: string;
  value: string;
}

export interface DiscoveryDashboardFilterOptions {
  time_range: string | string[];
  discovery_type: string[];
  regions: string[];
}

export interface DiscoveryDashboardFilterCriteria {
  region: string[];
  discoveryType: string[];
  timeRange: string;
}

export interface DiscoveryDashboardFilterFormValue {
  region: DiscoveryDashboardFilterOption[];
  discoveryType: string[];
  timeRange: string;
}

export interface ExecutiveKpiData {
  devices_pending_monitoring: number;
  discovered_devices_total: number;
  discovery_failures: number;
  discovery_success_rate: number;
  newly_discovered_resources: number;
}

export class ExecutiveKpiViewData {
  devicesPendingMonitoring;
  discoveredDevicesTotal;
  discoveryFailures;
  discoverySuccessRate;
  newlyDiscoveredResources;
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

export interface DiscoverySuccessFailureItemData {
  week: string;
  value: number;
}

export interface DiscoverySuccessFailureData {
  total: DiscoverySuccessFailureItemData[];
  new: DiscoverySuccessFailureItemData[];
}

export interface CmdbSyncInsights {
  cmdb_sync_rate: number;
  cmdb_platform: string;
  new_cis_added: number;
  ci_update_failures: number;
  duplicate_cis: number;
}

export class CmdbSyncInsightsViewData {
  cmdbSyncRate: number;
  cmdbPlatform: string;
  newCisAdded: number;
  ciUpdateFailures: number;
  duplicateCis: number;
}

export interface CiDistributionByDevice {
  private_cloud_compute: number;
  public_cloud_compute: number;
  storage: number;
  network: number;
  containers: number;
  database: number;
  pdu: number;
  firewalls: number;
  switches: number;
  bareMetal: number;
  others: number;
}

export interface CiDistributionByDiscovery {
  api: number;
  agentless_collector: number;
}

export interface ResourceDiscoveryData {
  [key: string]: number;
}

export class ResourceDiscoveryViewData {
  name: string;
  value: number;
}

export interface NewlyDiscoveredDevice {
  count: number;
  next: string;
  previous: null;
  results: NewlyDiscoveredDeviceItem[];
}

export interface NewlyDiscoveredDeviceItem {
  datacenter: string;
  device_name: string;
  last_sync: string;
  manufacturer: string;
  model: string;
  os_type: string;
  os_version: string;
  status: string;
  type: string;
}

export class NewlyDiscoveredDeviceItemViewData {
  datacenter: string;
  deviceName: string;
  lastSync: string;
  manufacturer: string;
  model: string;
  osType: string;
  osVersion: string;
  statusClass: string;
  type: string;
}
export interface TopDiscoveryFailures {
  count: number;
  next: string;
  previous: null;
  results: TopDiscoveryFailuresItem[];
}

export interface TopDiscoveryFailuresItem {
  alert_id: string;
  device_name: string;
  failures: number;
  itsm_incident: string;
  last_failure: string;
}

export class TopDiscoveryFailuresItemViewData {
  alertId: string;
  deviceName: string;
  failures: number;
  itsmIncident: string;
  lastFailure: string;
}

export interface TopDiscoveryFailures {
  count: number;
  next: string;
  previous: null;
  results: TopDiscoveryFailuresItem[];
}

export interface OperatingSystemsItem {
  count: number;
  eol_date: string;
  os_type: string;
  os_version: string;
}

export class OperatingSystemsItemViewData {
  count: number;
  eolDate: string;
  osType: string;
  osVersion: string;
}

export interface OperatingSystems {
  count: number;
  next: string;
  previous: null;
  results: OperatingSystemsItem[];
}

export interface RecentSyncConfigItem {
  ci_name: string;
  ci_type: string;
  cmdb_status: string;
  last_updated: string;
  platform: string;
  source: string;
  sync_status: string;
}

export class RecentSyncConfigItemViewData {
  ciName: string;
  ciType: string;
  cmdbStatus: string;
  cmdbStatusClass: string;
  lastUpdated: string;
  platform: string;
  source: string;
  syncStatus: string;
}

export interface RecentSyncConfig {
  count: number;
  next: string;
  previous: null;
  results: RecentSyncConfigItem[];
}

export interface CmdbSyncTrend {
  synced_ci: SyncedCiItem[];
  failed: FailedItem[];
  pending: PendingItem[];
}
interface SyncedCiItem {
  month: string;
  value: number;
}
interface FailedItem {
  month: string;
  value: number;
}
interface PendingItem {
  month: string;
  value: number;
}
