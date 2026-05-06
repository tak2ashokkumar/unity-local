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


export interface ExecutiveSummaryWidgetType {
  executiveSummary: ExecutiveSummaryItem;
  cloudTypeDistribution: CloudTypeDistributionItem[];
  powerActivityState: PowerActivityStateItem[];
  vmCountByOSType: VmCountByOSTypeItem[];
  environmentCriticality: EnvironmentCriticalityItem[];
  alertsSeverity: AlertsSeverityItem;
  filters: Filters;
}
export interface ExecutiveSummaryItem {
  totalVMs: number;
  physicalHosts: number;
  clusters: number;
  poweredOnVMs: number;
  poweredOffVMs: number;
}
export interface CloudTypeDistributionItem {
  type: string;
  percentage: number;
  count: number;
}
export interface PowerActivityStateItem {
  state: string;
  count: number;
  percentage: number;
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
  critical: number;
  warning: number;
  info: number;
  total: number;
}



export interface CapacityAndGrowthDataType {
  vmDensityPerHost: VmDensityPerHostItem[];
  capacityTrendAndForecast: CapacityTrendAndForecastItem[];
  provisioningStatus: ProvisioningStatus;
  // filters: Filters;
}
export interface VmDensityPerHostItem {
  hostName: string;
  vmCount: number;
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


//

//


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
  diskLatencyTop10: DiskLatencyTop10Item[];
  cpuReadyWaitTop10: CpuReadyWaitTop10Item[];
  swapBalloonMemoryTop10: SwapBalloonMemoryTop10Item[];
  // filters: Filters;
}
export interface DiskLatencyTop10Item {
  vmName: string;
  value: number;
}
export interface CpuReadyWaitTop10Item {
  vmName: string;
  value: number;
}
export interface SwapBalloonMemoryTop10Item {
  vmName: string;
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

//Auto remediation
export interface AutoRemediationDataType {
  executionSummary: ExecutionSummaryItem;
  topActions: TopActionsItem[];
}
export interface ExecutionSummaryItem {
  successfulPercentage: number;
  failedPercentage: number;
  totalRuns: number;
  avgDuration: number;
}
export interface TopActionsItem {
  actionName: string;
  executionCount: number;
}

//Alert and Events

//Original JSON structure

export interface AlertsEventsView {
  alertSummary: AlertSummary;
  topCriticalAlerts: TopCriticalAlertsItem[];
  filters: Filters;
}

export interface AlertSummary {
  criticalAlerts: number;
  highAlerts: number;
  openITSMTickets: number;
  automationSuccess: string;
  avgMTTR: string;
}
export interface TopCriticalAlertsItem {
  id: number;
  deviceName: string;
  severity: string;
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}


//-------ORIGINAL ITSM TICKETS-----------------
export interface ITSMTicketView {
  ticketsByPriority: TicketsByPriority;
  ticketsByStatus: TicketsByStatus;
  tickets: TicketsItem[];
  // filters: Filters;
}
export interface TicketsByPriority {
  High: number;
  Moderate: number;
  Low: number;
  Critical: number;
  Planning: number;
}
export interface TicketsByStatus {
  Resolved: number;
  Open: number;
  Closed: number;
  'In Progress': number;
}
export interface TicketsItem {
  ticketId: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
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
  diskIOPS: DiskIOPS;
  uptime: string;
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
export interface DiskIOPS {
  value: number;
  percentage: number;
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
  diskIops: PrivateCloudDiskIops;
  upTime: string;
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

export interface PrivateCloudDiskIops {
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


export interface AlertTrends {
  summary: Summary;
  rawEvents: RawEvents;
  noiseReduction: NoiseReduction;
  firstResponse: FirstResponse;
}
export interface Summary {
  rawEvents: number;
  alerts: number;
  conditions: number;
}
export interface RawEvents {
  total: number;
  critical: number;
  warning: number;
  informative: number;
}
export interface NoiseReduction {
  percentage: number;
  dedupeEvents: number;
  suppressedEvents: number;
  correlated: number;
}
export interface FirstResponse {
  percentage: number;
  autoCloned: number;
  ticketCreated: number;
  autoClosed: number;
}

