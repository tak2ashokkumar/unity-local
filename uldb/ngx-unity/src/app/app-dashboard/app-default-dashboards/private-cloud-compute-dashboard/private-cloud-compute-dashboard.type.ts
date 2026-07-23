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
}

//------Executive Summary-------------

export interface ExecutiveSummaryWidgetType {
  cloudTypeDistribution: CloudTypeDistributionItem[];
  executiveSummary: ExecutiveSummaryItem;
  alertsSeverity: AlertsSeverityItem;
  environmentCriticality: EnvironmentCriticalityItem[];
  vmCountByOSType: VmCountByOSTypeItem[];
  powerActivityState: PowerActivityStateItem[];
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

export interface Top10ClustersByVMsData {
  topClustersByVMCount: TopClustersByVMCountItem[];
}
export interface TopClustersByVMCountItem {
  clusterName: string;
  vmCount: number;
  hostCount: number;
  datastoreCount: number;
}




export interface CapacityAndGrowthDataType {
  capacityTrendAndForecast: CapacityTrendAndForecastItem[];
  provisioningStatus: ProvisioningStatus;

  topHostUtilization: TopHostUtilizationItem[];
  // filters: Filters;
}
export interface TopHostUtilizationItem {
  hostName: string;
  utilizationPercentage: number;
  totalCapacity: number;
  usedCapacity: number;
  utilizationStatus: string;
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


//Infrastucture Health Status
export interface InfrahealthstatusDataType {
  powerStatus: PowerStatus;
  hostHealthStatus: HostHealthStatus;
  fanTemperatureSensors: FanTemperatureSensors;
}
export interface PowerStatus {
  psuNormal: number;
  psuDegraded: number;
  psuFailed: number;
}
export interface HostHealthStatus {
  healthy: number;
  warning: number;
  critical: number;
  maintenance: number;
}
export interface FanTemperatureSensors {
  tempNormal: number;
  tempWarning: number;
  tempCritical: number;
  fanFailed: number;
}

export interface PerformanceWorkloadDataType {
  diskThroughputTop10: DiskLatencyTop10Item[];
  cpuReadyTop10: CpuReadyWaitTop10Item[];
  swapMemoryTop10: SwapBalloonMemoryTop10Item[];
  // filters: Filters;
}
export interface DiskLatencyTop10Item {
  name: string;
  uuid: string;
  value: number;
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
  recentAlerts: RecentAlertsItem[];
  alertSummary: AlertSummary;
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





//------PERFORMANCE HOTSPOTS------------------
export interface PerformanceHotspots {
  topUtilization: TopUtilizationItem[];
}
export interface TopUtilizationItem {
  name: string;
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
  sparkline: number[];
}
export interface MemoryUtilization {
  current: number;
  sparkline: number[];
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
  status: string;
  datacenter: string;
  name: string;
  tag: string;
  monitoring: Monitoring;
  os: string | Os;
  device: string;
  vmSubType: string;
  lastSeen: string;
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
  next: string;
  previous: string;
  results: OrphanedDevice[];
  orphanedByCategory: OrphanedCategory[];
  totalOrphaned: number;
}


export interface IdleDevices {
  count: number;
  next: string;
  previous: string | null;
  results: IdleDeviceListItem[];
  idleDurationDistribution: IdleDurationDistributionItem[];
}
export interface IdleDeviceListItem {
  deviceName: string;
  resourceType: string;
  avgCpu: AvgCpu;
  uuid: string;
  deviceType: string;
  avgMem: AvgMem;
  vmSubType?: string;
  networkIO: string;
  idleDuration: string;
  status: string;
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
