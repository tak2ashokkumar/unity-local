import { EChartsOption } from "echarts";

export interface TopHeaderDataType {
  lastRefreshed: string;
  scope: ScopeDataType;
}
export interface ScopeDataType {
  providers: string;
  regions: string;
  accounts: string;
}

export interface Filters {
  platforms: labelAndValueType[];
  datacenters: labelAndValueType[];
  accounts: labelAndValueType[];
  environments: labelAndValueType[];
}
export interface labelAndValueType {
  value: string;
  label: string;
}

export interface FiltersCriteriaType {
  platforms: string[];
  datacenters: string[];
  accounts: string[];
  environments: string[];
  // Global Time Range: startDate/endDate are only sent for the 'custom' range (start_datetime / end_datetime).
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

//------Executive Summary-------------

export interface ExecutiveSummaryWidgetType {
  kpiRow?: ExecutiveSummaryKpiRow;
  discoveryCards?: ExecutiveSummaryDiscoveryCard[];
  cloudTypeDistribution: CloudTypeDistributionItem[];
  executiveSummary?: ExecutiveSummaryItem;
  alertsSeverity: AlertsSeverityItem;
  environmentCriticality: EnvironmentCriticalityItem[];
  vmCountByOSType: VmCountByOSTypeItem[];
  powerActivityState?: PowerActivityStateItem[];
  resourceAllocation?: ResourceAllocationItem;
  allocPreview?: ExecutiveSummaryAllocPreviewItem[];
}
export interface ExecutiveSummaryKpiRow {
  poweredOn: number;
  poweredOff: number;
  idleVMs: number;
  orphanedDevices: number;
}
export interface ExecutiveSummaryDiscoveryCard {
  title: string;
  discovered: number;
  up: number;
  down: number;
  unknown: number;
}
export interface ExecutiveSummaryItem {
  totalVMs: number;
  physicalHosts: number;
  idleVMs: number;
  poweredOnVMs: number;
  poweredOffVMs: number;
  clusters: number;
  orphanedVMs: number;
}
export interface CloudTypeDistributionItem {
  count: number;
  percentage: number;
  type: string;
}
export interface PowerActivityStateItem {
  count: number;
  state: string;
}
export interface ResourceAllocationCapacityItem {
  unit: string;
  totalCapacity: number;
  used: number;
}
export interface ResourceAllocationItem {
  vcpu: ResourceAllocationCapacityItem;
  vram: ResourceAllocationCapacityItem;
  labels: string[];
  totalCapacity: number[];
  used: number[];
}
export interface ExecutiveSummaryAllocPreviewItem {
  platform: string;
  platformGroup: string;
  compute: number;
  memory: number;
  storage: number;
}
export interface VmCountByOSTypeItem {
  os: string;
  percentage: number;
  count: number;
}
export interface EnvironmentCriticalityItem {
  environment: string;
  count: number;
  percentage: number;
}
export interface AlertsSeverityItem {
  info: number;
  total: number;
  critical: number;
  warning: number;
}

export interface PrivateCloudInventoryResponse {
  vmware?: PrivateCloudInventoryProviderResources;
  nutanix?: PrivateCloudInventoryProviderResources;
  hyperv?: PrivateCloudInventoryProviderResources;
  proxmox?: PrivateCloudInventoryProviderResources;
  openstack?: PrivateCloudInventoryProviderResources;
  vcloud?: PrivateCloudInventoryProviderResources;
  custom?: PrivateCloudInventoryProviderResources;
  total_resources?: number;
}

export interface PrivateCloudInventoryProviderResources {
  [resourceKey: string]: number;
  total_resources: number;
}

export interface PrivateCloudInventoryCardViewData {
  key: string;
  title: string;
  accentClass: string;
  totalResources: number;
  resources: PrivateCloudInventoryResourceViewData[];
}

export interface PrivateCloudInventoryResourceViewData {
  key: string;
  label: string;
  count: number;
  iconClass?: string;
  iconColor?: string;
}

export interface PrivateCloudGeoDistributionResponse {
  total_private_clouds: number;
  total_datacenters: number;
  total_resources: number;
  total_alerts?: number;
  totalAlerts?: number;
  alert_segregation?: PrivateCloudGeoAlertSegregation;
  alertSegregation?: PrivateCloudGeoAlertSegregation;
  private_clouds: PrivateCloudGeoDistributionItem[];
}

export interface PrivateCloudGeoDistributionItem {
  id: number;
  uuid: string;
  name: string;
  platform_type: string;
  datacenter: PrivateCloudGeoDatacenter | string;
  datacenter_location?: string;
  location?: string;
  lat?: string;
  long?: string;
  total_alerts?: number;
  totalAlerts?: number;
  alert_segregation?: PrivateCloudGeoAlertSegregation;
  alertSegregation?: PrivateCloudGeoAlertSegregation;
  resources?: PrivateCloudGeoResources;
  vms?: number;
  hypervisors?: number;
  baremetal?: number;
  firewalls?: number;
  load_balancers?: number;
  storage?: number;
  switches?: number;
  databases?: number;
  mac_devices?: number;
  custom_devices?: number;
  clusters?: number;
  datastores?: number;
  networks?: number;
  distributed_switches?: number;
  port_groups?: number;
  total_resources?: number;
}

export interface PrivateCloudGeoDatacenter {
  id: number;
  uuid: string;
  name: string;
  location: string;
  lat: string;
  long: string;
  city: string;
  region: string;
  country: string;
}

export interface PrivateCloudGeoAlertSegregation {
  critical: number;
  warning: number;
  info: number;
}

export interface PrivateCloudGeoResources {
  summary: PrivateCloudGeoResourceSummary;
}

export interface PrivateCloudGeoResourceSummary {
  vm: number;
  network: number;
  hypervisor: number;
  baremetal_server: number;
  total: number;
}

export interface PrivateCloudGeoDistributionViewData {
  totalPrivateClouds: number;
  totalDatacenters: number;
  totalResources: number;
  totalAlerts: number;
  platforms: labelAndValueType[];
  cells: PrivateCloudGeoDistributionCell[];
}

export interface PrivateCloudGeoDistributionCell {
  name: string;
  cloudName?: string;
  datacenter: string;
  platform: string;
  platformLabel: string;
  color: string;
  value: number[];
  totalResources: number;
  totalAlerts: number;
  critical: number;
  warning: number;
  info: number;
  vm: number;
  network: number;
  hypervisor: number;
  baremetalServer: number;
  firewall: number;
  loadBalancer: number;
  storage: number;
  deviceResources: Array<{ label: string; value: number; iconClass: string; iconColor: string }>;
  dimmed?: boolean;
}

export interface Top10ClustersByVMsData {
  topClustersByVMCount: TopClustersByVMCountItem[];
}
export interface TopClustersByVMCountItem {
  clusterName: string;
  vmCount: number | null;
  hostCount: number | null;
  datastoreCount: number;
}

export interface TopClustersByVmCountResponse {
  topClustersByVMCount: TopClusterByVmCountItem[];
}

export interface TopClusterByVmCountItem {
  name: string;
  platform: string;
  hostCount: number;
  vmCount: number;
}




export interface CapacityAndGrowthDataType {
  capacityTrendAndForecast: CapacityTrendAndForecastItem[];
  provisioningStatus: ProvisioningStatus;

  topHostUtilization: TopHostUtilizationItem[];
  top5HostsByVmDensity?: TopHostVmDensityItem[];
  // filters: Filters;
}
export interface TopHostUtilizationItem {
  hostName: string;
  host?: string;
  ip?: string;
  utilizationPercentage: number;
  pct?: number;
  totalCapacity: number;
  total?: string;
  usedCapacity: number;
  used?: string;
  utilizationStatus: string;
  color?: string;
}

export interface TopHostVmDensityItem {
  host: string;
  platform: string;
  cluster: string;
  vms: number;
}
export interface CapacityTrendAndForecastItem {
  month: string;
  count: number;
  isForecast: boolean;
}
export interface ProvisioningStatus {
  provisioned: number;
  decommissioned: number;
}

export interface ClusterCapacityUtilTrendData {
  cpuUtilizationTrend: number[];
  months: string[];
  memoryUtilizationTrend: number[];
}

export interface ClusterCapacityTrendResponse {
  labels: string[];
  selectedCluster: string;
  cpuUtilizationTrend: number[];
  memoryUtilizationTrend: number[];
  weightedAverage: ClusterCapacityWeightedAverage;
  clusters: ClusterCapacityTrendCluster[];
  clusterOptions: ClusterOptionItem[];
}

export interface ClusterCapacityWeightedAverage {
  cpu: number[];
  memory: number[];
}

export interface ClusterCapacityTrendCluster {
  name: string;
  platform: string;
  vmCount: number;
  cpu: number[];
  memory: number[];
}

export interface ClusterOptionItem {
  name: string;
  platform: string;
}

export interface ClusterMetricsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClusterMetricItem[];
  filterOptions?: ClusterMetricFilterOptions;
}

export interface ClusterMetricItem {
  id: number;
  uuid: string;
  platform: string;
  cluster: string;
  name: string;
  accountName: string;
  hostCount: number;
  vmCount: number;
  totalProcessor: number;
  memoryUsage: ClusterMetricUsage;
  storageUsage: ClusterMetricUsage;
  cpuUsage: ClusterMetricUsage;
}

export interface ClusterMetricUsage {
  cap: number | null;
  used: number | null;
  pct: number | null;
  unit: string;
}

export interface ClusterMetricFilterOptions {
  platforms: string[];
  clusters: string[];
  accounts: string[];
}

export interface ClusterComponentSummaryResponse {
  total: number;
  selectedPlatform: string;
  selectedCluster: string;
  components: ClusterComponentSummaryItem[];
  filterOptions: ClusterComponentSummaryFilterOptions;
}

export interface ClusterComponentSummaryItem {
  key: string;
  label: string;
  value: number;
}

export interface ClusterComponentSummaryFilterOptions {
  platforms: string[];
  clusters: ClusterOptionItem[];
}


export interface PerformanceWorkloadDataType {
  count: number;
  results: VmWorkloadInsightItem[];
  diskThroughputTop10: DiskLatencyTop10Item[];
  cpuReadyVsSwap: CpuReadyVsSwapItem[];
  statusBreakdown: VmWorkloadStatusBreakdown;
}

export interface VmWorkloadInsightItem {
  name: string;
  uuid: string;
  osType: string;
  platform: string;
  platformGroup: string;
  accountName: string;
  diskThroughputKbps: number;
  cpuReadyPct: number;
  memorySwapMb: number;
  status: string;
}
export interface DiskLatencyTop10Item {
  name: string;
  uuid: string;
  value: number;
  platformGroup?: string;
}

export interface CpuReadyVsSwapItem {
  name: string;
  cpuReadyPct: number;
  memorySwapMb: number;
  platform: string;
  platformGroup: string;
}

export interface CpuReadyWaitTop10Item {
  name: string;
  uuid: string;
  value: number;
}
export interface SwapBalloonMemoryTop10Item {
  name: string;
  uuid: string;
  value: number;
}

export interface VmWorkloadStatusBreakdown {
  Healthy: number;
  Warning: number;
  Critical: number;
}

export interface VmBackupStatusItem {
  id: number;
  uuid?: string;
  name?: string;
  vmName?: string;
  osType: string;
  platform: string;
  accountName: string;
  backupJob?: string | null;
  jobName?: string | null;
  lastBackupStatus?: string;
  status?: string;
  lastBackupTime: string | null;
  ageBucket: string;
  restorePoints: number;
  oldestRestorePointDays?: number | null;
  oldestRestorePoint?: number | null;
  backupSizeGb: number | null;
  repository: string | null;
}

export interface VmBackupStatusResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VmBackupStatusItem[];
}

export interface VmBackupStatusChartsResponse {
  totalVms?: number;
  protectedVsUnprotected: {
    protected: number;
    unprotected: number;
    total?: number;
  };
  backupAgeDistribution: Array<{ label: string; count: number }> | { [key: string]: number };
  repositoryCapacity: VmBackupRepositoryCapacityItem[];
  jobSuccessRateTrend: Array<{ date: string; rate: number }> | { labels: string[]; successRate: number[] };
  restorePointSprawlTop10?: VmBackupRestorePointSprawlItem[];
  restorePointSprawl?: VmBackupRestorePointSprawlItem[];
}

export interface VmBackupRepositoryCapacityItem {
  name?: string;
  repository?: string;
  type?: string;
  usedGb: number | null;
  totalGb?: number | null;
  capacityGb?: number | null;
  usedPercentage?: number | null;
  usedPct?: number | null;
}

export interface VmBackupRestorePointSprawlItem {
  name?: string;
  vmName?: string;
  oldestRestorePointDays?: number;
  oldestDays?: number;
  platformGroup?: string;
}

export interface HypervisorVersionComplianceItem {
  id: number;
  uuid: string;
  host: string;
  platform: string;
  platformGroup: string;
  accountName: string;
  currentVersion: string;
  latestVersion: string;
  versionGap: string;
  compliance: string;
}

export interface HypervisorVersionComplianceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: HypervisorVersionComplianceItem[];
}

export interface HypervisorVersionComplianceChartsResponse {
  totalHosts: number;
  complianceBreakdown: {
    Compliant: number;
    Warning: number;
    'Non-Compliant': number;
  };
  byPlatform: HypervisorVersionCompliancePlatformItem[];
}

export interface HypervisorVersionCompliancePlatformItem {
  platformGroup: string;
  total: number;
  compliant: number;
  warning: number;
  nonCompliant: number;
}



export interface RiskSummary {
  overUtilHosts: string,
  overUtilHostsPercent: string,
  underUtilHosts: string,
  underUtilHostsPercent: string,
  idleVms: string,
  idleVmsMsg: string,
  capacityAlerts: string,
  capacityAlertsMsg: string,
}

export interface CapacityRiskAlert {
  name: string;
  value: number;
  color: string;
}


//Alert and Events

//Original JSON structure
export interface RecentAlerts {
  count?: number;
  recentAlerts: RecentAlertsItem[];
  alertSummary: AlertSummary;
  severityDistribution?: AlertSummary;
  topDevicesByAlertFrequency?: RecentAlertDeviceFrequencyItem[];
}
export interface RecentAlertsItem {
  status: string;
  deviceName: string;
  severity: string;
  source: string;
  duration: string;
  acknowledged: string;
  uuid: string;
  id: number;
  description: string;
}
export interface AlertSummary {
  total: number;
  information: number;
  critical: number;
  warning: number;
}

export interface RecentAlertDeviceFrequencyItem {
  deviceName: string;
  count: number;
}

export interface AutoRemediationSummaryResponse {
  autoRemediations: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  runningRuns: number;
  runbookSuccessPct: number;
  runbookFailurePct: number;
  avgDurationMinutes: number;
  avgMttr: string;
  topAutoRemediationActions: AutoRemediationActionItem[];
  configuredCount: number;
}

export interface AutoRemediationActionItem {
  name: string;
  count: number;
}

export interface VmProvisioningSummaryResponse {
  vmsProvisioned: number;
  reachableCount: number;
  unreachableCount: number;
  reachableRatePct: number;
  unreachableRatePct: number;
  avgProvisioningTime: string;
  reachability: VmProvisioningReachability;
  provisioningTrend: VmProvisioningTrend;
  vmsByCloudAccount: VmProvisioningCloudAccountItem[];
}

export interface VmProvisioningReachability {
  reachable: number;
  unreachable: number;
  reachablePct: number;
  unreachablePct: number;
}

export interface VmProvisioningTrend {
  labels: string[];
  provisioned: number[];
  decommissioned: number[];
  totalProvisioned: number;
  totalDecommissioned: number;
}

export interface VmProvisioningCloudAccountItem {
  label: string;
  value: number;
  platformGroup: string;
}





//------PERFORMANCE HOTSPOTS------------------
export interface PerformanceHotspots {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: TopUtilizationItem[];
  topUtilization?: TopUtilizationItem[];
}

export interface PerformanceHotspotsChartsResponse {
  topCpuVsMemory?: PerformanceHotspotsCpuMemoryChartItem[];
  topStorageUtilization?: PerformanceHotspotsStorageChartItem[];
}

export interface PerformanceHotspotsCpuMemoryChartItem {
  name: string;
  uuid: string;
  cpuUtilization: number;
  memoryUtilization: number;
}

export interface PerformanceHotspotsStorageChartItem {
  name: string;
  uuid: string;
  capacity: number;
  used: number;
  percentage: number;
}

export interface TopUtilizationItem {
  name: string;
  os?: string;
  cpuUtilization: CpuUtilization;
  memoryUtilization: MemoryUtilization;
  storageUtilization: StorageUtilization;
  networkSpeed?: NetworkSpeed;
  diskIops?: NetworkSpeed;
  uptime: string;
  uuid: string;
  deviceType: string;
  vmSubType?: string;
}
export interface CpuUtilization {
  current: number;
  sparkline: Array<number | null>;
}
export interface MemoryUtilization {
  current: number;
  sparkline: Array<number | null>;
}
export interface StorageUtilization {
  capacity: number;
  used: number;
  free: number;
  percentage: number;
}
export interface NetworkSpeed {
  displayValue: string;
  percentage: number;
  value: number;

}


//--------------------------------------------



//Need to integarte original model

export class PrivateCloudUtilization {
  loader: string = 'performanceHotspotLoader';
  utilRow: PrivateCloudUtilizationRow[];
}

export interface PrivateCloudUtilizationRow {
  name: string;
  cpuSeries: number[];
  cpuStatus: number;
  cpuTone: PrivateCloudStatusTone;
  memorySeries: number[];
  memoryStatus: number;
  memoryTone: PrivateCloudStatusTone;
  storage: PrivateCloudStorageUtilization;
  networkSpeed: PrivateCloudNetworkSpeed;
  upTime: string;
  uuid: string;
  deviceType: string;
  vmSubType?: string;
}

export interface PrivateCloudUtilizationViewRow extends PrivateCloudUtilizationRow {
  // loader: string = 'top10Utilization';
  cpuChartOptions: EChartsOption;
  memoryChartOptions: EChartsOption;
}

export type PrivateCloudStatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface PrivateCloudStorageUtilization {
  capacity: string;
  used: string;
  free: string;
  percent: number;
  tone: PrivateCloudStatusTone;
}
export interface PrivateCloudNetworkSpeed {
  value: string;
  label: string;
  percent: number;
  tone: PrivateCloudStatusTone;

}

export interface PrivateCloudFilterOption {
  value: string;
  label: string;
}

export interface PrivateCloudSummaryMetric {
  label: string;
  value: string;
  tone?: PrivateCloudStatusTone;
}

export interface PrivateCloudAlertSummaryMetric {
  label: string;
  value: string;
  tone: PrivateCloudStatusTone;
}

export interface PrivateCloudCriticalAlert {
  id: string;
  deviceName: string;
  severity: 'critical' | 'high';
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}

export interface PrivateCloudAlertTrendLegendItem {
  name: string;
  value: number;
  color: string;
}

export interface PrivateCloudAlertTrendBarGroup {
  name: string;
  values: number[];
}

export interface PrivateCloudAlertSideMetric {
  label: string;
  value: string;
  tone?: PrivateCloudStatusTone;
}

export interface PrivateCloudAlertSideCard {
  title: string;
  value: string;
  metrics: PrivateCloudAlertSideMetric[];
}

export interface PrivateCloudTicketDonutItem {
  name: string;
  value: number;
  color: string;
}

export interface PrivateCloudTicketRow {
  id: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
}



export interface OrphanedDevice {
  id?: number;
  status: string;
  datacenter: string;
  name: string;
  tag?: string;
  monitoring?: Monitoring;
  os?: string | Os;
  osType?: string;
  device?: string;
  vmSubType?: string;
  platform?: string;
  accountName?: string;
  lifecycleStage?: string;
  lifecycleStatus?: string;
  lastSeen: string;
  daysSinceStageChange?: number;
  stillMonitored?: boolean;
  uuid: string;
}

interface Monitoring {
  configured: boolean;
  observium: boolean;
  enabled: boolean;
  zabbix: boolean;
}
interface Os {
  url: string;
  id: number;
  name: string;
  version: string;
  full_name: string;
  platform_type: string;
}


export interface OrphanedCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface OrphanedResourcesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrphanedDevice[];
  orphanedByCategory?: OrphanedCategory[];
  totalOrphaned?: number;
  chartData?: OrphanedLifecycleChartData;
}

export interface OrphanedLifecycleChartData {
  byLifecycleStage: { [stage: string]: number };
  byOsType: { [osType: string]: number };
  byDaysSinceStageChange: Array<{ label: string; count: number }>;
  byDatacenter: Array<{ label: string; count: number }>;
}

export interface HypervisorHealthEnvironmentResponse {
  count: number;
  page?: number;
  pageSize?: number;
  previous?: string | null;
  next?: string | null;
  temperatureThresholds?: { warning?: number | null; critical?: number | null; unit?: string };
  powerSupplyStatusDistribution?: { data?: HypervisorPowerSupplyDistributionItem[] };
  results: HypervisorHealthEnvironmentItem[];
}

export interface HypervisorPowerSupplyDistributionItem {
  name?: string;
  label?: string;
  normal?: number | null;
  warning?: number | null;
  unknown?: number | null;
  up?: number | null;
  warn?: number | null;
  off?: number | null;
}

export interface HypervisorHealthEnvironmentItem {
  id?: number;
  name: string;
  status: string;
  vendor: string;
  mfr: string;
  hv: string;
  model: string;
  os: string;
  cpus?: number;
  cores?: number;
  mem?: string;
  storage?: string;
  cpuU: HypervisorUsageMetric;
  memU: HypervisorUsageMetric;
  storU: HypervisorUsageMetric;
  fan: string;
  fanTotal?: number | null;
  fanUp?: number | null;
  fanWarn?: number | null;
  fanOff?: number | null;
  fanHasSensor?: boolean;
  psu: string;
  temp: number | null;
  hw: string;
  cpuStatus?: string;
  memStatus?: string;
  storStatus?: string;
}

export interface HypervisorUsageMetric {
  cap: string | null;
  used: string | null;
  avail: string | null;
  pct: number | null;
}

export interface StorageDatastoresResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StorageDatastoreItem[];
  topByUsage?: StorageDatastoreItem[];
  topDatastoresByUsed?: StorageDatastoreItem[];
  statusBreakdown: StorageDatastoreStatusBreakdown;
}

export interface StorageDatastoreItem {
  id?: number;
  name?: string;
  datastore?: string;
  platform: string;
  accountName: string;
  type: string;
  datacenter: string;
  capacityGb: number;
  usedGb: number;
  percentUsed?: number;
  usedPct?: number;
  status: string;
  vmCount: number | null;
  hostCount: number | null;
}

export interface StorageDatastoreStatusBreakdown {
  Critical: number;
  Warning: number;
  Healthy: number;
}

export interface NetworkInterfacesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NetworkInterfaceItem[];
  topByVmCount?: NetworkInterfaceItem[];
  vmCountPerPortGroup?: NetworkInterfaceItem[];
  statusBreakdown?: NetworkInterfaceStatusBreakdown;
  typeBreakdown?: { [type: string]: number };
  totalVmsAttached?: number;
}

export interface NetworkInterfaceItem {
  id?: number;
  name?: string;
  portGroup?: string;
  platform: string;
  accountName: string;
  cluster?: string;
  datacenter: string;
  type?: string;
  port?: string;
  vlanId?: number | null;
  vlan?: string | number | null;
  portCount?: number | null;
  vmCount: number | null;
  hostCount?: number | null;
  status?: string;
  rawStatus?: string;
  nicTeamStatus?: string;
}

export interface NetworkInterfaceStatusBreakdown {
  Healthy: number;
  Warning: number;
  Critical: number;
}

export interface NewlyProvisionedVmsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewlyProvisionedVmItem[];
  filters?: NewlyProvisionedVmFilters;
}

export interface NewlyProvisionedVmItem {
  id: number;
  uuid: string;
  name: string;
  status: string;
  vm_state?: string;
  state?: string;
  os_name?: string;
  os?: string;
  cloud_type?: string;
  platform?: string;
  cloud_account_name?: string;
  cloudAcct?: string;
  provisioned_date?: string;
  provisioned?: string;
  last_discovered_date?: string;
  lastDiscovered?: string;
  life_cycle_stage?: string;
  stage?: string;
  life_cycle_stage_status?: string;
}

export interface NewlyProvisionedVmFilters {
  cloud_type: string[];
  status: string[];
  vm_state: string[];
  life_cycle_stage: string[];
  life_cycle_stage_status: string[];
}

export interface NewlyProvisionedVmsChartResponse {
  count: number;
  vmStateBreakdown: {
    up: number;
    down: number;
  };
  cloudAccountDistribution: NewlyProvisionedCloudAccountItem[];
  timeline: NewlyProvisionedTimelineItem[];
}

export interface NewlyProvisionedCloudAccountItem {
  label: string;
  value: number;
  platformGroup: string;
}

export interface NewlyProvisionedTimelineItem {
  label: string;
  date: string;
  state: string;
}


export interface IdleDevices {
  count: number;
  next: string | null;
  previous: string | null;
  results: IdleDeviceListItem[];
  idleDurationDistribution: IdleDurationDistributionItem[];
}
export interface IdleDeviceListItem {
  deviceName: string;
  resourceType?: string;
  device?: string;
  avgCpu: AvgCpu;
  uuid: string;
  deviceType: string;
  avgMem: AvgMem;
  vmSubType?: string;
  networkIO: string;
  idleDuration: string;
  status: string;
  configured?: boolean;
  monitoring?: {
    configured?: boolean;
    observium?: boolean;
    enabled?: boolean;
    zabbix?: boolean;
  };
  os?: string;
  ssr_os?: string;
}
export interface AvgCpu {
  used: number;
  free: number;
}
export interface AvgMem {
  used: number;
  free: number;
}
export interface IdleDurationDistributionItem {
  duration: string;
  count: number;
}
