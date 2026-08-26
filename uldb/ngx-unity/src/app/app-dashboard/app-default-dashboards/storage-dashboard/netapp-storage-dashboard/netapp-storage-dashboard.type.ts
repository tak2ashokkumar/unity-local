export type NetappStorageTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface NetappStorageMetric {
  label: string;
  value: string;
  tone?: NetappStorageTone;
}

export interface NetappStorageCpuUsageNode {
  name: string;
  value: string;
}

export interface NetappStorageCpuUsageBucket {
  range: string;
  count: number;
  nodes: NetappStorageCpuUsageNode[];
}


export interface ClusterOverviewType {
  summary: ClusterOverviewSummaryWidgetType;
}
export interface ClusterOverviewSummaryWidgetType {
  usedCapacity: string;
  freeCapacity: string;
  availability: number;
  activeAlerts: number;
  nodes: number;
  aggregates: number;
  svms: number;
  volumes: number;
  luns: number;
}


export interface NodeInfoAndMetricsSectionChartViewType {
  summary: NodeInfoAndMetricsSummaryType;
  charts: {
    cpuDistribution: NodeInfoAndMetricsThresholdBarChartType[];
    memDistribution: NodeInfoAndMetricsThresholdBarChartType[];
    networkThroughput: NodeInfoAndMetricsThroughputChartType[];
    iopsTopNodes: NodeInfoAndMetricsThroughputChartType[];
    devWriteThroughput: NodeInfoAndMetricsThroughputChartType[];
  };
}
export class NodeInfoAndMetricsSummaryType {
  totalNodes: number;
  upNodes: number;
  downNodes: number;
  unknownNodes: number;
  avgCpuUtilization: number;
  avgMemUtilization: number;
  avgUptime: string;
  avgNetworkUtilization:number;
}
export interface NodeInfoAndMetricsThresholdBarChartType {
  range: string;
  count: number;
  nodes: Array<{ name: string; value: string }>;
}
export interface NodeInfoAndMetricsThroughputChartType {
  name: string;
  read: number;
  write: number;
}

export interface NodeInfoAndMetricsTableViewType {
  name: string;
  cluster: string;
  model: string;
  os: string;
  cpu: string;
  mem: string;
  net: string;
  rx: string;
  tx: string;
  rxLat: string;
  txLat: string;
  uptime: string;
  status: string;
}

export interface VolumeOverviewSectionChartViewType {
  summary: VolumeOverviewSummaryViewType;
  charts: {
    stateDistribution: VolumeOverviewStateDistributionType;
    top10Largest: VolumeOverviewTop10LargestType[];
    top10MostUsed: VolumeOverviewTop10MostUsedType[];
    top10ByAvail: VolumeOverviewTop10ByAvailType[];
    volumeIopsTrend: VolumeIopsTimeSeriesType;
    rwRatio: VolumeOverviewRwRatioType;
    volumeReadWriteLatencyTrend: VolumeLatencyTimeSeriesType;
  };
}

export interface VolumeOverviewSummaryViewType {
  totalVolumes: number;
  onlineVolumes: number;
  offlineVolumes: number;
  unknownVolumes: number;
  usedCapacity: string;
  avgLatency: string | null;
  totalIops: string | null;
  snapshotReserve: string;
}

export interface VolumeOverviewTableViewType {
  cluster: string;
  name: string;
  svm: string;
  agg: string;
  state: string;
  type: string;
  total: string;
  avail: string;
}

export interface VolumeOverviewStateDistributionType {
  online: number;
  offline: number;
  other: number;
}

export interface VolumeOverviewTop10LargestType {
  name: string;
  total: number;
}
export interface VolumeOverviewTop10MostUsedType {
  name: string;
  used: number;
}
export interface VolumeOverviewTop10ByAvailType {
  name: string;
  avail: number;
}

export interface VolumeOverviewRwRatioType {
  read: number;
  write: number;
}

export interface VolumeIopsTimeSeriesType {
  labels: string[];
  rx: number[];
  tx: number[];
}

export interface VolumeLatencyTimeSeriesType {
  labels: string[];
  rxLat: number[];
  txLat: number[];
}

export interface AggregateOverviewChartViewType {
  summary: AggregateOverviewSummaryType;
  charts: {
    capacityDistribution: Array<{ range: string; count: number; }>;
    utilizationBuckets: Array<{ range: string; count: number; }>;
    nearlyFull: Array<{ name: string; cluster: string; util: string }>;
    top10Largest: Array<{ name: string; cluster: string; total: string }>;
    aggregateGrowthTrend: AggregateGrowthTrendType;
  };
}

export interface AggregateGrowthTrendType {
  labels: string[];
  data: number[];
}

export interface AggregateOverviewSummaryType {
  totalAggregates: number;
  onlineAggregates: number;
  offlineAggregates: number;
  unknownAggregates: number;
  usedCapacity: string;
  freeCapacity: string;
  utilizationPercent: number;
}

export interface AggregateOverviewTableViewType {
  name: string;
  cluster: string;
  total: string;
  used: string;
  free: string;
  util: string;
  nodes: string;
  raid: string;
  state: string;
  snapUsed: string;
  nearlyFull: string;
  status: string;
}

export interface SVMOverviewChartViewType {
  summary: SVMOverviewSummaryType;
  charts: {
    capacityBySvm: SVMCapacityChartType[];
    volumeCountBySvm: SVMVolumeCountChartType[];
    lunCountBySvm: SVMLunCountChartType[];
    throughputBySvm: SVMThroughputChartType[];
    top10CapacityConsumers: SVMCapacityChartType[];
    top10ByIops: SVMIOPSChartType[];
  };
}

export type SVMVolumeBubbleValue = [number, number, string, number];

export interface SVMOverviewSummaryType {
  totalSVMs: number;
  runningSVMs: number;
  stoppedSVMs: number;
  unknownSVMs: number;
  avgCapacityUsed: string;
  avgIops: string | null;
  avgIopsRead: string | null;
  avgIopsWrite: string | null;
  avgLatency: string | null;
  avgLatencyRead: string | null;
  avgLatencyWrite: string | null;
  avgThroughput: string | null;
}

export interface SVMOverviewTableViewType {
  name: string;
  cluster: string;
  state: string;
  vols: number;
  luns: number;
  cap: string;
  rx: string | null;
  tx: string | null;
  rxLat: string | null;
  txLat: string | null;
  throughput: string | null;
  status: string;
}

export interface SVMCapacityChartType {
  name: string;
  cap: number;
}

export interface SVMVolumeCountChartType {
  name: string;
  vols: number;
  luns: number;
  cap: number;
}

export interface SVMLunCountChartType {
  name: string;
  luns: number;
}

export interface SVMThroughputChartType {
  name: string;
  throughput: number;
}

export interface SVMIOPSChartType {
  name: string;
  rxIops: number;
  txIops: number;
}

export interface LUNOverviewChartViewType {
  summary: LUNOverviewSummaryType;
  charts: {
    healthDistribution: Array<{ status: string; count: number; }>;
    top10ByUsage: Array<{ name: string; util: number; }>;
    growthTrend: AggregateGrowthTrendType;
    availability: number;
  };
}

export interface LUNOverviewSummaryType {
  totalLUNs: number;
  onlineLUNs: number;
  offlineLUNs: number;
  unknownLUNs: number;
  avgLatency: string | null;
  totalIops: string | null;
}

export interface LUNOverviewTableViewType {
  cluster: string;
  name: string;
  path: string;
  state: string;
  size: string;
  util: string;
  iops: string;
  latency: string;
  throughput: string;
  status: string;
  usedSpace:string;
}

export interface PerformanceMetricsChartViewType {
  summary: PerformanceMetricsSummaryType;
  charts: {
    iopsTimeSeries: {
      labels: string[];
      rx: number[];
      tx: number[];
    };
    throughputTimeSeries: {
      labels: string[];
      data: number[];
    };
    latencyTimeSeries: {
      labels: string[];
      rxLat: number[];
      txLat: number[];
    };
    iopsBreakdown: {
      categories: string[];
      read: number[];
      write: number[];
    };
  };
}

export interface PerformanceMetricsSummaryType {
  totalIops: string;
  readIops: string;
  writeIops: string;
  throughput: string;
  readLatency: string;
  writeLatency: string;
}

export interface PerformanceMetricsTableViewType {
  time: string;
  rx: string;
  tx: string;
  rxLat: string;
  txLat: string;
  throughput: string;
}

export interface PerformanceMetricsLineChartSeriesType {
  name: string;
  data: number[];
  color: string;
  areaColor?: string;
}

export interface PerformanceMetricsLineChartConfigType {
  labels: string[];
  yAxisName: string;
  series: PerformanceMetricsLineChartSeriesType[];
  showLegend?: boolean;
  smooth?: boolean;
  showSymbol?: boolean;
  symbol?: string;
  symbolSize?: number;
  gridBottom?: string | number;
}

export interface CapacityPlanningChartViewType {
  summary: CapacityPlanningSummaryType;
  charts: {
    capacityForecast: {
      labels: string[];
      actual: Array<number | null>;
      forecast1: Array<number | null>;
      forecast2: Array<number | null>;
      forecast3: Array<number | null>;
    };
    volUtilDistribution: Array<{ range: string; count: number; }>;
    aggUtilDistribution: Array<{ range: string; count: number; }>;
    top5Consumers: Array<{ name: string; capacity: number; }>;
    capacityBySvm: Array<{ name: string; cap: number; }>;
    monthlyGrowth: {
      labels: string[];
      data: number[];
    };
  };
}

export interface CapacityPlanningSummaryType {
  usedCapacity: string;
  freeCapacity: string;
  usableCapacity: string;
  growthRate: string;
  daysUntilFull: string;
  thinProvisioningPct: string;
}

export interface CapacityPlanningTableViewType {
  cluster: string;
  total: string;
  used: string;
  free: string;
  util: string;
  growth: string;
  days: string;
  ratio: string;
  status: string;
}

export interface PortOverviewChartViewType {
  summary: PortOverviewSummaryType;
  charts: {
    linkStatusDistribution: PortLinkStatusDistributionType[];
    portTypeDistribution: PortTypeDistributionType[];
    portsByNode: PortsByNodeType[];
  };
}

export interface PortOverviewSummaryType {
  totalPorts: number;
  totalEthernetPorts: number;
  totalFcPorts: number;
  portsUp: number;
  portsDown: number;
  portsUnknown: number;
}

export interface PortOverviewTableViewType {
  cluster: string;
  node: string;
  name: string;
  type: string;
  proto: string;
  admin: string;
  link: string;
  dev: string;
  devPort: string;
}

export interface PortLinkStatusDistributionType {
  status: string;
  count: number;
}

export interface PortTypeDistributionType {
  type: string;
  count: number;
}

export interface PortsByNodeType {
  node: string;
  count: number;
}

export interface RecentAlertsChartViewType {
  summary: RecentAlertsSummaryType;
  charts: {
    severityDistribution: AlertSeverityDistributionType[];
    alertTimeline: AlertTimelineType;
  };
}

export interface RecentAlertsSummaryType {
  totalAlerts: number;
  critical: number;
  warning: number;
  information: number;
}

export interface RecentAlertsTableViewType {
  id: number;
  device: string;
  count: number;
  event: string;
  time: string;
  severity: string;
  description: string;
  status: string;
  source: string;
}

export interface AlertSeverityDistributionType {
  severity: string;
  count: number;
}

export interface AlertTimelineType {
  labels: string[];
  critical: number[];
  warning: number[];
  info: number[];
}

export interface AutoRemediationSummaryViewType {
  summary: AutoRemediationSummaryType;
}

export interface AutoRemediationSummaryType {
  autoRemediations: number;
  avgMttr: string;
  runbookSuccess: string;
  runbookFailures: number;
}


// for UI purpose
export interface HorizontalBarChartConfigType {
  xAxisName?: string;
  valueKey?: string;
  labelKey?: string;
  color?: string;
  tooltipLabel?: string;
  sortDesc?: boolean;
  showLegend?: boolean;
  gridLeft?: string | number;
  gridRight?: string | number;
  gridTop?: string | number;
  gridBottom?: string | number;
}

export interface VerticalBarChartConfigType {
  yAxisName?: string;
  valueKey?: string;
  labelKey?: string;
  color?: string;
  tooltipLabel?: string;
  sortDesc?: boolean;
  showLegend?: boolean;
  rotateLabel?: number;
  barWidth?: string | number;
  gridLeft?: string | number;
  gridRight?: string | number;
  gridTop?: string | number;
  gridBottom?: string | number;
}

export interface GroupedVerticalBarChartConfigType {
  yAxisName?: string;
  gridBottom?: string;
}

export interface StackedVerticalBarSeriesType {
  name: string;
  data: number[];
  color: string;
}

export interface StackedVerticalBarChartConfigType {
  labels: string[];
  series: StackedVerticalBarSeriesType[];
  yAxisName?: string;
  stackName?: string;
  barWidth?: string | number;
  legendItemWidth?: number;
  legendItemHeight?: number;
  legendFontSize?: number;
  gridLeft?: string | number;
  gridRight?: string | number;
  gridTop?: string | number;
  gridBottom?: string | number;
}

export interface GaugeChartConfigType {
  value?: number;
  max?: number;
  title?: string;
  unit?: string;
  color?: string;
}

export interface DonutChartConfigType {
  centerTitle?: string;
  centerValue?: string;
  showCenterTitle?: boolean;
  showCenterValue?: boolean;
  seriesName?: string;
  innerRadius?: string;
  outerRadius?: string;
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  showLabelLines?: boolean;
  labelFormatter?: string;
  legendFontSize?: number;
  labelLineLength?: number;
  labelLineLength2?: number;
  tooltipFormatter?: string;
  center?: [string, string];
  startAngle?: number;
}
