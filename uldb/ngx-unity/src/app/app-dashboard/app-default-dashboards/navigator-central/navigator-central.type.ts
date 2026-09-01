import { EChartsOption } from 'echarts';

export type UnifiedAiopsTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export interface UnifiedAiopsStatusLegendItem {
  tone: UnifiedAiopsTone;
  label: string;
}

export interface UnifiedAiopsFilterOption {
  value: string;
  label: string;
}

export interface UnifiedAiopsAlertsDateRange {
  from: string;
  to: string;
}

export interface UnifiedAiopsCloudFilterOption extends UnifiedAiopsFilterOption {
  category: 'private' | 'public';
}

export interface UnifiedAiopsDashboardFilterCriteria {
  datacenters: string[];
  clouds: string[];
  deviceTypes?: string[];
  sourceTypes?: string[];
  severityTypes?: string[];
  viewBy?: string;
  // Time Range: global filter value + Event & Alert Analytics local override. startDate/endDate
  // are only sent for the 'custom' range (as start_datetime / end_datetime).
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  deviceCategory?: string;
}

export interface UnifiedAiopsViewByOption {
  name: string;
  key: string;
}

export interface UnifiedAiopsDeviceTypeOption {
  type: string;
  key: string;
}

export interface UnifiedAiopsMetric {
  label: string;
  value: string;
  tone?: UnifiedAiopsTone;
  up?: string;
  down?: string;
  unknown?: string;
  hasData?: boolean;
  link?: string;
}

export interface UnifiedAiopsStackItem {
  // Raw API category slug (sent back as device_category to drill into sub-levels).
  key?: string;
  name: string;
  values: number[];
}

export interface UnifiedAiopsDiscoveryCoverageRow {
  // Raw API category slug (sent back as device_category to drill into sub-levels).
  key?: string;
  category: string;
  discovered: number;
  monitored: number;
  coverage: number;
  coverageLabel: string;
  color: string;
  badgeBg: string;
}

export interface UnifiedAiopsDiscoverySummary {
  discovered: string;
  monitored: string;
  coverage: string;
}

export interface UnifiedAiopsAlertSegregationSummary {
  critical: string;
  warning: string;
  info: string;
}

export interface UnifiedAiopsAlertSource {
  name: string;
  count: number;
  logoPath: string;
  logoWidth: number;
  logoHeight: number;
  color: string;
}

export interface UnifiedAiopsGeoCell {
  name: string;
  cloudType: string;
  color: string;
  value: number[];
  totalResources: number;
  totalAlerts: number;
  critical: number;
  warning: number;
  information: number;
  computeCount: number;
  platformServices: number;
  otherServices: number;
}

export interface UnifiedAiopsGeoDistributionSummary {
  totalLocations: number;
  totalResources: number;
  totalAlerts: number;
}

export interface UnifiedAiopsGeoDistributionLegendItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface UnifiedAiopsLegendMetric {
  icon: string;
  value: string;
  tone: UnifiedAiopsTone;
}

export interface UnifiedAiopsAvailabilityCategorySummary {
  up: string;
  down: string;
  unknown: string;
}

export interface UnifiedAiopsAvailabilityCategoryRow {
  // Raw API category slug (sent back as device_category to drill into sub-levels).
  key?: string;
  label: string;
  // up / down / unknown are the avg percentages the bars use; *Count are the raw device counts (tooltip).
  up: number;
  down: number;
  unknown: number;
  upCount?: number;
  downCount?: number;
  unknownCount?: number;
  upLabel: string;
  tone: UnifiedAiopsTone;
}

export interface UnifiedAiopsBusinessService {
  id?: string;
  serviceName: string;
  status: UnifiedAiopsTone;
  statusLabel?: string;
  uptime: string;
  degraded: string;
  alerts: string;
  alertTone: UnifiedAiopsTone;
}

export interface UnifiedAiopsCoverageCard {
  title: string;
  logo?: string;
  rows: UnifiedAiopsCoverageRow[];
  totalResources?: string;
  chartOptions?: EChartsOption;
}

export interface UnifiedAiopsCoverageRow {
  label: string;
  value: string;
  iconPath?: string;
  // Private cloud rows: Font Awesome glyph classes + color (public cloud uses iconPath instead).
  iconClass?: string;
  iconColor?: string;
}

export interface UnifiedAiopsResourceIcon {
  iconClass: string;
  iconColor: string;
}

export interface UnifiedAiopsCoverageGroup {
  key: string;
  title: string;
  totalLabel: string;
  cards: UnifiedAiopsCoverageCard[];
  showChart: boolean;
}

export interface UnifiedAiopsTableRow {
  id?: string;
  uuid?: string;
  applicationId?: string;
  name: string;
  throughput?: string;
  availability?: string;
  responseTime?: string;
  count?: string;
  eolDate?: string;
  queries?: string;
  status?: UnifiedAiopsTone;
}

export interface UnifiedAiopsOrphanedDeviceResponseItem {
  id?: string | number;
  uuid?: string;
  device_id?: string;
  deviceId?: string;
  device_uuid?: string;
  deviceUuid?: string;
  resource_id?: string;
  resourceId?: string;
  name?: string;
  device_name?: string;
  deviceName?: string;
  instance_name?: string;
  instanceName?: string;
  resource_type?: string;
  resourceType?: string;
  type?: string;
  device_type?: string;
  status?: string;
  lastSeen?: string;
  last_seen?: string;
  last_availability_time?: string;
  datacenter?: string;
  datacenter_name?: string;
  cloud?: string;
  provider?: string;
  platform?: string;
  cloud_provider?: string;
  cloudProvider?: string;
  cloud_type?: string;
  cloudType?: string;
  monitoring_type?: string;
  monitoringType?: string;
  monitoring?: {
    configured?: boolean;
    enabled?: boolean;
    observium?: boolean;
    zabbix?: boolean;
  };
  account?: string;
}

export interface UnifiedAiopsOrphanedDevicesResponse {
  count?: string | number;
  results?: UnifiedAiopsOrphanedDeviceResponseItem[];
  orphanedDeviceList?: UnifiedAiopsOrphanedDeviceResponseItem[];
  data?: UnifiedAiopsOrphanedDeviceResponseItem[];
  items?: UnifiedAiopsOrphanedDeviceResponseItem[];
  totalOrphaned?: string | number;
}

export interface UnifiedAiopsOrphanedDeviceRow {
  id?: string;
  uuid?: string;
  deviceId?: string;
  resourceId?: string;
  resourceType?: string;
  provider?: string;
  cloudType?: string;
  monitoringType?: string;
  monitoring?: {
    configured?: boolean;
    enabled?: boolean;
    observium?: boolean;
    zabbix?: boolean;
  };
  name: string;
  status: string;
  lastSeen: string;
  datacenter: string;
}

export interface UnifiedAiopsOrphanedCategoryResponseItem {
  group?: string;
  category?: string;
  name?: string;
  label?: string;
  display_name?: string;
  type?: string;
  resource_type?: string;
  count?: string | number;
  value?: string | number;
  percentage?: string | number;
  percent?: string | number;
}

export interface UnifiedAiopsOrphanedDevicesByCategoryResponse {
  groups?: UnifiedAiopsOrphanedCategoryResponseItem[];
  results?: UnifiedAiopsOrphanedCategoryResponseItem[];
  orphanedByCategory?: UnifiedAiopsOrphanedCategoryResponseItem[];
  categories?: UnifiedAiopsOrphanedCategoryResponseItem[];
  by_category?: UnifiedAiopsOrphanedCategoryResponseItem[];
  data?: UnifiedAiopsOrphanedCategoryResponseItem[];
  breakdown?: UnifiedAiopsOrphanedCategoryResponseItem[] | Record<string, string | number | UnifiedAiopsOrphanedCategoryResponseItem>;
  total?: string | number;
  totalOrphaned?: string | number;
  total_orphaned?: string | number;
  total_count?: string | number;
  totalCount?: string | number;
}

export type UnifiedAiopsOrphanedDevicesByCategoryApiResponse = UnifiedAiopsOrphanedDevicesByCategoryResponse | UnifiedAiopsOrphanedCategoryResponseItem[];

export interface UnifiedAiopsOrphanedCategoryItem {
  category: string;
  count: number;
  percentage: number;
  color: string;
  totalCount?: number;
}

export interface UnifiedAiopsIdleMetricResponse {
  used?: string | number;
  free?: string | number;
  value?: string | number;
  percent?: string | number;
  percentage?: string | number;
}

export interface UnifiedAiopsIdleDeviceResponseItem {
  id?: string | number;
  uuid?: string;
  device_id?: string;
  deviceId?: string;
  device_uuid?: string;
  deviceUuid?: string;
  resource_id?: string;
  resourceId?: string;
  device_name?: string;
  deviceName?: string;
  name?: string;
  instance_name?: string;
  resource_type?: string;
  resourceType?: string;
  type?: string;
  provider?: string;
  platform?: string;
  cloud_provider?: string;
  cloudProvider?: string;
  cloud?: string;
  cloud_type?: string;
  cloudType?: string;
  monitoring_type?: string;
  monitoringType?: string;
  monitoring?: {
    configured?: boolean;
    enabled?: boolean;
    observium?: boolean;
    zabbix?: boolean;
  };
  avg_cpu?: UnifiedAiopsIdleMetricResponse;
  avgCpu?: UnifiedAiopsIdleMetricResponse;
  avgCPU?: UnifiedAiopsIdleMetricResponse;
  cpu?: UnifiedAiopsIdleMetricResponse;
  cpu_usage?: UnifiedAiopsIdleMetricResponse;
  average_cpu?: UnifiedAiopsIdleMetricResponse;
  avg_cpu_percent?: string | number;
  avgCpuPercent?: string | number;
  avg_cpu_percentage?: string | number;
  cpu_percent?: string | number;
  cpuPercentage?: string | number;
  avg_mem?: UnifiedAiopsIdleMetricResponse;
  avgMem?: UnifiedAiopsIdleMetricResponse;
  avg_memory?: UnifiedAiopsIdleMetricResponse;
  memory?: UnifiedAiopsIdleMetricResponse;
  memory_usage?: UnifiedAiopsIdleMetricResponse;
  average_memory?: UnifiedAiopsIdleMetricResponse;
  avg_mem_percent?: string | number;
  avgMemPercent?: string | number;
  avg_mem_percentage?: string | number;
  memory_percent?: string | number;
  memoryPercentage?: string | number;
  network_io?: string | number;
  networkIO?: string | number;
  network?: string | number;
  network_in_out?: string | number;
  idle_duration?: string | number;
  idleDuration?: string | number;
  duration?: string | number;
  status?: string;
}

export interface UnifiedAiopsIdleDevicesResponse {
  count: string | number;
  results: UnifiedAiopsIdleDeviceResponseItem[];
}

export interface UnifiedAiopsIdleMetric {
  used: string;
  free: string;
  percent: number;
  tone: UnifiedAiopsTone;
}

export interface UnifiedAiopsIdleDeviceRow {
  id: string;
  uuid: string;
  deviceId: string;
  resourceId: string;
  deviceName: string;
  resourceType: string;
  provider: string;
  cloudType: string;
  monitoringType: string;
  monitoring?: {
    configured?: boolean;
    enabled?: boolean;
    observium?: boolean;
    zabbix?: boolean;
  };
  avgCpu: UnifiedAiopsIdleMetric;
  avgMem: UnifiedAiopsIdleMetric;
  networkIO: string;
  idleDuration: string;
  status: string;
}

export interface UnifiedAiopsIdleDurationResponseItem {
  duration?: string;
  idle_duration?: string;
  idleDuration?: string;
  range?: string;
  name?: string;
  label?: string;
  count?: string | number;
  value?: string | number;
  total?: string | number;
  total_count?: string | number;
  totalCount?: string | number;
  devices?: string | number;
  percent?: string | number;
  percentage?: string | number;
}

export interface UnifiedAiopsIdleDurationResponse {
  results?: UnifiedAiopsIdleDurationResponseItem[];
  data?: UnifiedAiopsIdleDurationResponseItem[] | UnifiedAiopsIdleDurationResponse;
  summary?: UnifiedAiopsIdleDurationResponseItem[] | Record<string, string | number | UnifiedAiopsIdleDurationResponseItem>;
  distribution?: UnifiedAiopsIdleDurationResponseItem[];
  duration_distribution?: UnifiedAiopsIdleDurationResponseItem[];
  durationDistribution?: UnifiedAiopsIdleDurationResponseItem[];
  idleDurationDistribution?: UnifiedAiopsIdleDurationResponseItem[];
  idle_duration_distribution?: UnifiedAiopsIdleDurationResponseItem[];
  idle_devices_by_duration?: UnifiedAiopsIdleDurationResponseItem[];
  breakdown?: UnifiedAiopsIdleDurationResponseItem[] | Record<string, string | number | UnifiedAiopsIdleDurationResponseItem>;
}

export type UnifiedAiopsIdleDurationApiResponse = UnifiedAiopsIdleDurationResponse | UnifiedAiopsIdleDurationResponseItem[];

export interface UnifiedAiopsIdleDurationItem {
  duration: string;
  count: number;
  percent: number;
  color: string;
}

export interface UnifiedAiopsRecentAlertsSummary {
  total?: number;
  critical?: number;
  critical_alerts?: number;
  criticalAlerts?: number;
  warning?: number;
  warning_alerts?: number;
  warningAlerts?: number;
  information?: number;
  info?: number;
  info_alerts?: number;
  infoAlerts?: number;
}

export interface UnifiedAiopsRecentAlertResponseItem {
  id?: string | number;
  uuid?: string;
  alert_id?: string | number;
  alertId?: string | number;
  alert_uuid?: string;
  alertUuid?: string;
  device_name?: string;
  deviceName?: string;
  name?: string;
  severity?: string;
  status?: string;
  description?: string;
  source?: string;
  acknowledged?: string | boolean;
  duration?: string;
}

export interface UnifiedAiopsRecentAlertsResponse {
  alertSummary?: UnifiedAiopsRecentAlertsSummary;
  alert_summary?: UnifiedAiopsRecentAlertsSummary;
  summary?: UnifiedAiopsRecentAlertsSummary;
  severity_summary?: UnifiedAiopsRecentAlertsSummary;
  severitySummary?: UnifiedAiopsRecentAlertsSummary;
  recentAlerts?: UnifiedAiopsRecentAlertResponseItem[];
  recent_alerts?: UnifiedAiopsRecentAlertResponseItem[];
  alerts?: UnifiedAiopsRecentAlertResponseItem[];
  results?: UnifiedAiopsRecentAlertResponseItem[];
  data?: UnifiedAiopsRecentAlertResponseItem[] | {
    alertSummary?: UnifiedAiopsRecentAlertsSummary;
    alert_summary?: UnifiedAiopsRecentAlertsSummary;
    summary?: UnifiedAiopsRecentAlertsSummary;
    severity_summary?: UnifiedAiopsRecentAlertsSummary;
    severitySummary?: UnifiedAiopsRecentAlertsSummary;
    recentAlerts?: UnifiedAiopsRecentAlertResponseItem[];
    recent_alerts?: UnifiedAiopsRecentAlertResponseItem[];
    alerts?: UnifiedAiopsRecentAlertResponseItem[];
    results?: UnifiedAiopsRecentAlertResponseItem[];
  };
}

export type UnifiedAiopsRecentAlertSeverity = 'critical' | 'warning' | 'info' | 'muted';

export interface UnifiedAiopsRecentAlert {
  id: string;
  uuid: string;
  deviceName: string;
  severity: UnifiedAiopsRecentAlertSeverity;
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}

export interface UnifiedAiopsRemediationMetric {
  label: string;
  value: string;
  tone?: UnifiedAiopsTone;
}

export interface UnifiedAiopsRemediationActionItem {
  name: string;
  count: number;
}

// -----Start----- Navigator Central Executive Summary (redesign) view-model + config -------------------
// A chip shown on a hero card header (e.g. Orphaned/Retired, Idle VMs).
export interface UnifiedAiopsExecChip {
  label: string;
  value: string;
}

// A status card: monitored / discovered headline + up/down/unknown + a coverage bar. Reused for the
// hero cards, their sub-cards (per vendor / provider / type), and each category card.
export interface UnifiedAiopsExecStatusCard {
  key: string;
  label: string;
  iconClass?: string;
  iconColor?: string;
  badgeText?: string;
  badgeClass?: string;
  unit: string;
  monitored: string;
  discovered: string;
  up: string;
  down: string;
  unknown: string;
  statusTotal: number;
  upPercent: number;
  downPercent: number;
  unknownPercent: number;
  link?: string;
  chips: UnifiedAiopsExecChip[];
  subCards: UnifiedAiopsExecStatusCard[];
}

// A plain scalar tile (Namespaces, GPU Utilization %, Inference Latency ms, ...).
export interface UnifiedAiopsExecTile {
  key: string;
  label: string;
  value: string;
  tone?: UnifiedAiopsTone;
  link?: string;
}

// A titled category row: status cards and/or scalar tiles.
export interface UnifiedAiopsExecGroup {
  key: string;
  title: string;
  iconClass?: string;
  iconColor?: string;
  cards: UnifiedAiopsExecStatusCard[];
  tiles: UnifiedAiopsExecTile[];
}

// The special leftmost Totals card (Total Discovered + Total Monitored stacked).
export interface UnifiedAiopsExecutiveTotals {
  discovered: string;
  monitored: string;
  monitoredOf: string;
  up: string;
  down: string;
  unknown: string;
  statusTotal: number;
  upPercent: number;
  downPercent: number;
  unknownPercent: number;
  link?: string;
}

// The whole Executive Summary widget view-model.
export interface UnifiedAiopsExecutiveView {
  totals: UnifiedAiopsExecutiveTotals;
  heroCards: UnifiedAiopsExecStatusCard[];
  groups: UnifiedAiopsExecGroup[];
}

// Config (data-only) consumed by the const config + service builder.
export interface UnifiedAiopsExecItemConfig {
  key: string;
  label: string;
  matchKeys?: string[];
  badgeText?: string;
  badgeClass?: string;
  link?: string;
}

export interface UnifiedAiopsExecChipConfig {
  label: string;
  keys: string[];
}

export interface UnifiedAiopsExecCardConfig {
  key: string;
  label: string;
  iconClass?: string;
  iconColor?: string;
  unit?: string;
  payloadKeys: string[];
  link?: string;
  chipConfigs?: UnifiedAiopsExecChipConfig[];
  subArrayKeys?: string[];
  subItems?: UnifiedAiopsExecItemConfig[];
  dynamicSubCards?: boolean;
}

export interface UnifiedAiopsExecTileConfig {
  key: string;
  label: string;
  keys: string[];
  suffix?: string;
  threshold?: 'utilization' | 'warning';
  link?: string;
}

export interface UnifiedAiopsExecGroupConfig {
  key: string;
  title: string;
  iconClass?: string;
  iconColor?: string;
  containerKeys: string[];
  unit?: string;
  cards?: UnifiedAiopsExecCardConfig[];
  cardArrayContainerKeys?: string[];
  cardArrayKeys?: string[];
  cardItems?: UnifiedAiopsExecItemConfig[];
  tiles?: UnifiedAiopsExecTileConfig[];
}
// -----End----- Navigator Central Executive Summary (redesign) view-model + config -------------------

// -----Start----- Navigator Central Private Cloud Geo Distribution -------------------
export interface UnifiedAiopsPrivateCloudGeoResourceRow {
  key: string;
  label: string;
  count: number;
  iconClass: string;
  iconColor: string;
}

export interface UnifiedAiopsPrivateCloudGeoLegendItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface UnifiedAiopsPrivateCloudGeoSite {
  key: string;
  cloudName: string;
  platformType: string;
  platformKey: string;
  datacenterUuid: string;
  datacenterName: string;
  location: string;
  lat: number;
  long: number;
  totalResources: number;
  totalAlerts: number;
  critical: number;
  warning: number;
  info: number;
  vmCount: number;
  clustersCount: number;
  storageCount: number;
  networkCount: number;
  hypervisorCount: number;
  baremetalCount: number;
  resourceRows: UnifiedAiopsPrivateCloudGeoResourceRow[];
}

export interface UnifiedAiopsPrivateCloudGeoSummary {
  totalPrivateClouds: number;
  totalResources: number;
  totalAlerts: number;
}

export interface UnifiedAiopsPrivateCloudGeoView {
  totalPrivateClouds: number;
  totalDatacenters: number;
  totalResources: number;
  totalAlerts: number;
  vmwareCount: number;
  nutanixCount: number;
  maxResources: number;
  sites: UnifiedAiopsPrivateCloudGeoSite[];
}
// -----End----- Navigator Central Private Cloud Geo Distribution -------------------

// -----Start----- Navigator Central Newly Provisioned VMs -------------------
export interface UnifiedAiopsNewVmRow {
  id: string;
  uuid: string;
  name: string;
  vmState: string;
  vmStateTone: UnifiedAiopsTone;
  osName: string;
  cloudType: string;
  cloudAccountName: string;
  provisionedDate: string;
  lastDiscoveredDate: string;
  lifecycleStage: string;
  lifecycleStageStatus: string;
  lifecycleStageStatusTone: UnifiedAiopsTone;
}

export interface UnifiedAiopsNewVmsView {
  rows: UnifiedAiopsNewVmRow[];
  total: number;
  filters: UnifiedAiopsNewVmsFilterOptions;
}

export interface UnifiedAiopsNewVmsFilterOptions {
  cloudType: UnifiedAiopsFilterOption[];
  vmState: UnifiedAiopsFilterOption[];
  lifecycleStage: UnifiedAiopsFilterOption[];
  lifecycleStageStatus: UnifiedAiopsFilterOption[];
}

// The Newly Provisioned VMs widget-local filters (in addition to the global top filters).
export interface UnifiedAiopsNewVmsFilter {
  search?: string;
  cloudPlatform?: string;
  vmState?: string;
  lifecycleStage?: string;
  lifecycleStageStatus?: string;
  ordering?: string;
}
// -----End----- Navigator Central Newly Provisioned VMs -------------------
