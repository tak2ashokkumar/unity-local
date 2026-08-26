import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EChartsOption, LegendComponentOption, TooltipComponentOption } from 'echarts';
import { ParallelComponent, VisualMapComponent } from 'echarts/components';
import moment from 'moment';
import { Observable, of } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { STORAGE_ALL_VALUE } from '../storage-dashboard.const';
import { StorageDashboardFilterCriteria } from '../storage-dashboard.type';
import {
  PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_API_DUMMY,
  PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_ENDPOINT,
  PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_WIDGETS,
  PURE_STORAGE_ACTIVE_CLUSTER_TABLE_API_DUMMY,
  PURE_STORAGE_ACTIVE_CLUSTER_TABLE_COLUMNS,
  PURE_STORAGE_ACTIVE_CLUSTER_TABLE_ENDPOINT,
  PURE_STORAGE_ALERTS_GRAPH_API_DUMMY,
  PURE_STORAGE_ALERTS_GRAPH_ENDPOINT,
  PURE_STORAGE_ALERTS_GRAPH_WIDGETS,
  PURE_STORAGE_ALERTS_TABLE_API_DUMMY,
  PURE_STORAGE_ALERTS_TABLE_COLUMNS,
  PURE_STORAGE_ALERTS_TABLE_ENDPOINT,
  PURE_STORAGE_ARRAYS_GRAPH_API_DUMMY,
  PURE_STORAGE_ARRAYS_GRAPH_ENDPOINT,
  PURE_STORAGE_ARRAYS_GRAPH_WIDGETS,
  PURE_STORAGE_ARRAYS_TABLE_API_DUMMY,
  PURE_STORAGE_ARRAYS_TABLE_COLUMNS,
  PURE_STORAGE_ARRAYS_TABLE_ENDPOINT,
  PURE_STORAGE_AUTO_REMEDIATION_SUMMARY_API_DUMMY,
  PURE_STORAGE_AUTO_REMEDIATION_SUMMARY_ENDPOINT,
  PURE_STORAGE_CAPACITY_PLANNING_GRAPH_API_DUMMY,
  PURE_STORAGE_CAPACITY_PLANNING_GRAPH_ENDPOINT,
  PURE_STORAGE_CAPACITY_PLANNING_GRAPH_WIDGETS,
  PURE_STORAGE_CAPACITY_PLANNING_TABLE_API_DUMMY,
  PURE_STORAGE_CAPACITY_PLANNING_TABLE_COLUMNS,
  PURE_STORAGE_CAPACITY_PLANNING_TABLE_ENDPOINT,
  PURE_STORAGE_EXECUTIVE_SUMMARY_API_DUMMY,
  PURE_STORAGE_EXECUTIVE_SUMMARY_ENDPOINT,
  PURE_STORAGE_HARDWARE_GRAPH_API_DUMMY,
  PURE_STORAGE_HARDWARE_GRAPH_ENDPOINT,
  PURE_STORAGE_HARDWARE_GRAPH_WIDGETS,
  PURE_STORAGE_HARDWARE_TABLE_API_DUMMY,
  PURE_STORAGE_HARDWARE_TABLE_COLUMNS,
  PURE_STORAGE_HARDWARE_TABLE_ENDPOINT,
  PURE_STORAGE_HOST_GROUPS_GRAPH_API_DUMMY,
  PURE_STORAGE_HOST_GROUPS_GRAPH_ENDPOINT,
  PURE_STORAGE_HOST_GROUPS_GRAPH_WIDGETS,
  PURE_STORAGE_HOST_GROUPS_TABLE_API_DUMMY,
  PURE_STORAGE_HOST_GROUPS_TABLE_COLUMNS,
  PURE_STORAGE_HOST_GROUPS_TABLE_ENDPOINT,
  PURE_STORAGE_HOSTS_GRAPH_API_DUMMY,
  PURE_STORAGE_HOSTS_GRAPH_ENDPOINT,
  PURE_STORAGE_HOSTS_GRAPH_WIDGETS,
  PURE_STORAGE_HOSTS_TABLE_API_DUMMY,
  PURE_STORAGE_HOSTS_TABLE_COLUMNS,
  PURE_STORAGE_HOSTS_TABLE_ENDPOINT,
  PURE_STORAGE_PERFORMANCE_GRAPH_API_DUMMY,
  PURE_STORAGE_PERFORMANCE_GRAPH_ENDPOINT,
  PURE_STORAGE_PERFORMANCE_GRAPH_WIDGETS,
  PURE_STORAGE_PERFORMANCE_TABLE_API_DUMMY,
  PURE_STORAGE_PERFORMANCE_TABLE_COLUMNS,
  PURE_STORAGE_PERFORMANCE_TABLE_ENDPOINT,
  PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_API_DUMMY,
  PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_ENDPOINT,
  PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_WIDGETS,
  PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_API_DUMMY,
  PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_COLUMNS,
  PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_ENDPOINT,
  PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_API_DUMMY,
  PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_ENDPOINT,
  PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_WIDGETS,
  PURE_STORAGE_PROTECTION_REPLICATION_TABLE_API_DUMMY,
  PURE_STORAGE_PROTECTION_REPLICATION_TABLE_COLUMNS,
  PURE_STORAGE_PROTECTION_REPLICATION_TABLE_ENDPOINT,
  PURE_STORAGE_VOLUME_GROUPS_GRAPH_API_DUMMY,
  PURE_STORAGE_VOLUME_GROUPS_GRAPH_ENDPOINT,
  PURE_STORAGE_VOLUME_GROUPS_GRAPH_WIDGETS,
  PURE_STORAGE_VOLUME_GROUPS_TABLE_API_DUMMY,
  PURE_STORAGE_VOLUME_GROUPS_TABLE_COLUMNS,
  PURE_STORAGE_VOLUME_GROUPS_TABLE_ENDPOINT,
  PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_API_DUMMY,
  PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_ENDPOINT,
  PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_WIDGETS,
  PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_API_DUMMY,
  PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_COLUMNS,
  PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_ENDPOINT,
  PURE_STORAGE_VOLUMES_GRAPH_API_DUMMY,
  PURE_STORAGE_VOLUMES_GRAPH_ENDPOINT,
  PURE_STORAGE_VOLUMES_GRAPH_WIDGETS,
  PURE_STORAGE_VOLUMES_TABLE_API_DUMMY,
  PURE_STORAGE_VOLUMES_TABLE_COLUMNS,
  PURE_STORAGE_VOLUMES_TABLE_ENDPOINT
} from './pure-storage-dashboard.const';
import {
  PureStorageActiveClusterGraphResponse,
  PureStorageActiveClusterTableResponse,
  PureStorageAlertTableRowApi,
  PureStorageActiveClusterSummaryApi,
  PureStorageAlertsGraphResponse,
  PureStorageAlertsSummaryApi,
  PureStorageAlertsTableResponse,
  PureStorageAnyGraphResponse,
  PureStorageAnyTableResponse,
  PureStorageAnyTableRowApi,
  PureStorageApiCapacityValue,
  PureStorageArraySummaryApi,
  PureStorageArraysGraphResponse,
  PureStorageArraysTableResponse,
  PureStorageAutoRemediationSummaryResponse,
  PureStorageAvailabilityTrendApi,
  PureStorageAvailabilityTrendViewModel,
  PureStorageCapacityPlanningGraphResponse,
  PureStorageCapacityPlanningSummaryApi,
  PureStorageCapacityPlanningTableResponse,
  PureStorageChartCardViewModel,
  PureStorageChartType,
  PureStorageColumnFormat,
  PureStorageExecutiveSummaryResponse,
  PureStorageGraphAxisApi,
  PureStorageGraphApi,
  PureStorageGraphDataApi,
  PureStorageGraphDatumApi,
  PureStorageGraphLinkApi,
  PureStorageGraphNodeApi,
  PureStorageGraphSeriesApi,
  PureStorageGraphWidgetDefinition,
  PureStorageHardwareGraphResponse,
  PureStorageHardwareSummaryApi,
  PureStorageHardwareTableResponse,
  PureStorageHostGroupsGraphResponse,
  PureStorageHostGroupsTableResponse,
  PureStorageHostsGraphResponse,
  PureStorageHostsTableResponse,
  PureStorageHostSummaryApi,
  PureStorageMetricViewModel,
  PureStorageRatioValue,
  PureStorageSectionKey,
  PureStorageSectionGraphViewModel,
  PureStorageSectionViewModel,
  PureStorageSummaryApi,
  PureStorageTableColumn,
  PureStorageTableRowViewModel,
  PureStorageTableStateViewModel,
  PureStorageTone,
  PureStoragePerformanceGraphResponse,
  PureStoragePerformanceSummaryApi,
  PureStoragePerformanceTableResponse,
  PureStorageProtectionGroupSnapshotsGraphResponse,
  PureStorageProtectionGroupSnapshotsTableResponse,
  PureStorageProtectionReplicationGraphResponse,
  PureStorageProtectionReplicationTableResponse,
  PureStorageVolumeGroupsGraphResponse,
  PureStorageVolumeGroupsTableResponse,
  PureStorageVolumeSnapshotsGraphResponse,
  PureStorageVolumeSnapshotsTableResponse,
  PureStorageVolumeSummaryApi,
  PureStorageVolumesGraphResponse,
  PureStorageVolumesTableResponse
} from './pure-storage-dashboard.type';

type PureStorageChartLegendPosition = 'top' | 'bottom' | 'right' | 'none';

interface PureStorageChartGridConfig {
  left: string | number;
  right: string | number;
  top: string | number;
  bottom: string | number;
  containLabel?: boolean;
}

interface PureStorageRenderableGraphSeries {
  name: string;
  unit?: string;
  data: Array<number | null>;
}

interface PureStoragePieChartDatum {
  name: string;
  value: number;
  actualValue: number;
  actualPercent: number;
  itemStyle: {
    color: string;
    borderColor: string;
    borderWidth: number;
  };
}

type PureStorageSunburstChartDatum = Omit<PureStorageGraphDatumApi, 'children'> & {
  actualValue?: number;
  children?: PureStorageSunburstChartDatum[];
};

interface PureStorageChartVisualConfig {
  color?: string;
  colors?: string[];
  grid?: PureStorageChartGridConfig;
  heatmapColors?: string[];
  horizontal?: boolean;
  labelFontSize?: number;
  legend?: PureStorageChartLegendPosition;
  pieCenter?: [string, string];
  pieBorderColor?: string;
  pieBorderWidth?: number;
  pieMinAngle?: number;
  pieMinValueRatio?: number;
  pieRadius?: string | [string | number, string | number];
  radarCenter?: [string, string];
  radarRadius?: string;
  scatterColor?: string;
  seriesName?: string;
  seriesColors?: string[];
  showPieLabel?: boolean;
  symbolScale?: number;
  tooltipValueLabel?: string;
  valueUnit?: string;
  xFontSize?: number;
  xAxisMax?: number;
  xAxisMin?: number;
  xAxisName?: string;
  xLabelWidth?: number;
  xNameGap?: number;
  xRotate?: number;
  yFontSize?: number;
  yAxisMax?: number;
  yAxisMax2?: number;
  yAxisMin?: number;
  yAxisMin2?: number;
  yAxisName?: string;
  yAxisName2?: string;
  yLabelWidth?: number;
  yNameGap?: number;
}

@Injectable()
export class PureStorageDashboardService {
  private readonly chartLabelMaxLength = 10;
  private readonly blue = '#1565C0';
  private readonly green = '#2E7D32';
  private readonly orange = '#EF6C00';
  private readonly red = '#C62828';
  private readonly dark = '#0F172A';
  private readonly teal = '#00897B';
  private readonly purple = '#7E57C2';
  private readonly indigo = '#5C6BC0';
  private readonly pink = '#EC4899';
  private readonly cyan = '#26A69A';
  private readonly brown = '#8D6E63';
  private readonly amber = '#F59E0B';
  private readonly emerald = '#10B981';
  private readonly chartColors = [this.blue, this.green, this.orange, this.red, this.dark, this.teal, this.indigo,
  this.pink, this.amber, this.emerald];
  private readonly extendedChartColors = [this.blue, this.green, this.orange, this.red, this.purple, this.teal,
  this.indigo, this.orange, this.cyan, this.brown];
  private readonly blueHeatmapColors = ['#E3F2FD', this.blue, '#0D47A1'];
  private readonly greenHeatmapColors = ['#E8F5E9', this.green, '#1B5E20'];
  private readonly redHeatmapColors = ['#FFEBEE', this.red, '#7F0000'];
  private readonly chartVisualConfigByKey: { [key: string]: PureStorageChartVisualConfig } = {
    array_capacity: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      xRotate: 0,
      yAxisName: 'TB',
      seriesColors: [this.blue, this.green, this.orange]
    },
    array_iops: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      xRotate: 0,
      yAxisName: 'K',
      seriesColors: [this.blue, this.dark]
    },
    array_latency: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      xRotate: 0,
      yAxisName: 'ms',
      seriesColors: [this.green, this.red]
    },
    san_latency: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      xRotate: 0,
      yAxisName: 'ms',
      seriesColors: [this.blue, this.orange]
    },
    data_reduction_thin_provisioning: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      xRotate: 0,
      yAxisName: 'Ratio',
      yAxisName2: '%',
      yAxisMin2: 0,
      yAxisMax2: 100,
      seriesColors: [this.blue, this.red]
    },
    combined_bandwidth: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      colors: [this.green, this.blue, this.orange, this.red, this.purple, this.teal, this.indigo, this.orange, this.cyan, this.brown],
      tooltipValueLabel: 'Bandwidth',
      valueUnit: 'MB/s'
    },
    volumes_mapped_per_host: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 0
    },
    host_group_by_size: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      xRotate: 0,
      seriesColors: [this.blue, this.orange, this.green]
    },
    top_storage_consumers: {
      colors: this.extendedChartColors,
      tooltipValueLabel: 'Total',
      valueUnit: 'GB'
    },
    volume_snapshot_analysis: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      scatterColor: this.blue,
      symbolScale: 2.4,
      xAxisName: 'Volume (GB)',
      yAxisName: 'Snapshots (GB)'
    },
    host_performance_comparison: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      heatmapColors: this.blueHeatmapColors,
      xFontSize: 7,
      xRotate: 25,
      yFontSize: 7
    },
    host_metrics_heatmap: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      heatmapColors: this.greenHeatmapColors,
      xFontSize: 7,
      xRotate: 25,
      yFontSize: 7
    },
    host_storage_composition: {
      legend: 'bottom',
      radarRadius: '55%',
      radarCenter: ['50%', '43%']
    },
    host_resource_profile: { color: this.blue, labelFontSize: 8 },
    host_group_capacity: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 30
    },
    host_group_storage_utilization: {
      color: this.green,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 30
    },
    storage_composition: {
      legend: 'bottom',
      grid: { left: '2%', right: '2%', top: '2%', bottom: '15%' },
      xRotate: 30,
      yAxisName: 'GB',
      seriesColors: [this.blue, this.orange, this.green, this.red]
    },
    host_group_capacity_data_reduction: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      scatterColor: this.green,
      symbolScale: 2,
      xAxisName: 'Size (GB)',
      yAxisName: 'Data Reduction Ratio'
    },
    host_group_performance_profile: {
      legend: 'bottom',
      radarRadius: '55%',
      radarCenter: ['50%', '43%']
    },
    host_group_metrics_heatmap: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      heatmapColors: this.greenHeatmapColors,
      xFontSize: 7,
      xRotate: 25,
      yFontSize: 7
    },
    host_group_multi_metric_comparison: { pieRadius: [0, '90%'], valueUnit: 'GB' },
    volume_iops: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      seriesColors: [this.blue, this.red],
      xRotate: 0
    },
    volume_throughput: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      seriesColors: [this.blue, this.red],
      xRotate: 0
    },
    thin_provisioning_per_volume: {
      legend: 'right',
      pieCenter: ['35%', '50%'],
      pieRadius: ['32%', '64%'],
      showPieLabel: false
    },
    data_reduction_per_volume: {
      colors: this.chartColors,
      legend: 'right',
      pieCenter: ['35%', '50%'],
      pieRadius: ['10%', '62%'],
      showPieLabel: false
    },
    total_data_reduction_per_volume: {
      color: this.dark,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 0
    },
    snapshot_size: {
      color: this.green,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    snapshot_capacity_rank: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xAxisName: 'GB',
      yLabelWidth: 106
    },
    snapshot_composition: {
      horizontal: true,
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      xAxisName: 'GB',
      seriesColors: [this.blue, this.orange]
    },
    snapshot_capacity_data_reduction: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      scatterColor: this.green,
      symbolScale: 3,
      xAxisName: 'Size (GB)',
      yAxisName: 'Data Reduction Ratio'
    },
    snapshot_performance_profile: {
      legend: 'bottom',
      radarRadius: '55%',
      radarCenter: ['50%', '43%']
    },
    snapshot_metrics_heatmap: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      heatmapColors: this.greenHeatmapColors,
      xFontSize: 7,
      xRotate: 25,
      yFontSize: 7
    },
    snapshot_comparison_matrix: { pieRadius: [0, '90%'], valueUnit: 'GB' },
    volume_group_size: {
      color: this.orange,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    storage_distribution: {
      colors: this.extendedChartColors,
      pieRadius: [10, '62%'],
      showPieLabel: false
    },
    snapshot_density: {
      colors: this.extendedChartColors
    },
    capacity_flow: { color: this.orange, labelFontSize: 7 },
    protection_groups: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 0
    },
    replication_status: {
      colors: [this.green, this.amber, this.red],
      legend: 'right',
      pieCenter: ['35%', '50%'],
      pieRadius: ['46%', '66%'],
      showPieLabel: false
    },
    connected_snapshots: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    snapshot_count: {
      color: this.red,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xAxisName: 'Snapshots',
      yLabelWidth: 100
    },
    schedule_distribution: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      scatterColor: this.blue,
      symbolScale: 2.5,
      xAxisName: 'Schedule (Hours)',
      yAxisName: 'Connected Snapshots'
    },
    retention_analysis: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      seriesColors: [this.green, this.blue],
      yAxisName: 'Days',
      xRotate: 30
    },
    protection_group_profile: {
      legend: 'bottom',
      radarRadius: '55%',
      radarCenter: ['50%', '43%']
    },
    protection_coverage_heatmap: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      heatmapColors: this.redHeatmapColors,
      xFontSize: 7,
      xRotate: 25,
      yFontSize: 7
    },
    protection_dependency_flow: { color: this.blue, labelFontSize: 7 },
    pod_status_distribution: {
      colors: [this.green, this.orange, this.red, this.dark],
      showPieLabel: true
    },
    pod_health: {
      color: this.green,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xAxisName: 'Health Score',
      xAxisMax: 100,
      yLabelWidth: 98
    },
    pod_status_scatter: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      symbolScale: 3,
      xAxisName: 'Array',
      yAxisName: 'Health Score',
      xRotate: 15
    },
    pod_connectivity_overview: { color: this.blue, labelFontSize: 7 },
    pod_status_comparison: {
      legend: 'bottom',
      radarRadius: '55%',
      radarCenter: ['50%', '43%']
    },
    pod_health_heatmap: {
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      heatmapColors: ['#FFEBEE', this.green, '#1B5E20'],
      xFontSize: 7,
      xRotate: 25,
      yFontSize: 7
    },
    volume_level_iops: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 0
    },
    host_level_iops: {
      color: this.green,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 0
    },
    capacity_forecast: {
      color: this.orange,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      legend: 'none'
    },
    volume_utilization_distribution: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 0
    },
    monthly_growth: {
      color: this.orange,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 0
    },
    cpu_cores: {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    memory: {
      color: this.green,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    disk_space: {
      color: this.orange,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    ports: {
      color: this.red,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    manufacturer: { showPieLabel: true, pieRadius: ['35%', '60%'] },
    os_version: { showPieLabel: true, pieRadius: ['35%', '60%'] },
    model: { showPieLabel: true, pieRadius: ['35%', '60%'] },
    severity_distribution: {
      colors: [this.red, this.orange, this.blue],
      showPieLabel: true,
      pieRadius: ['38%', '64%']
    },
    alert_trend: {
      legend: 'top',
      grid: { left: '2%', right: '2%', top: '15%', bottom: '2%' },
      seriesColors: [this.red, this.orange, this.blue],
      xRotate: 0
    }
  };
  private readonly chartVisualConfigByKeyAndType: { [key: string]: PureStorageChartVisualConfig } = {
    'snapshot_size_per_volume:polarArea': {
      colors: this.chartColors,
      legend: 'right',
      pieCenter: ['35%', '50%'],
      pieRadius: ['10%', '62%'],
      showPieLabel: false
    },
    'snapshot_size_per_volume:horizontalBar': {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      yFontSize: 8,
      yLabelWidth: 110
    },
    'snapshot_size_per_volume:bar': {
      color: this.blue,
      grid: { left: '2%', right: '2%', top: '2%', bottom: '2%' },
      xRotate: 20
    },
    'snapshot_count:polarArea': {
      colors: this.chartColors,
      legend: 'right',
      pieCenter: ['35%', '50%'],
      pieRadius: ['10%', '62%'],
      showPieLabel: false
    }
  };

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private chartConfigSvc: UnityChartConfigService) { }

  createArraysSection(): PureStorageSectionViewModel {
    return this.createSection('arrays', 'Array Health Overview', PURE_STORAGE_ARRAYS_TABLE_COLUMNS,
      'PureStorageArraysChartLoader', 'PureStorageArraysTableLoader', PURE_STORAGE_ARRAYS_GRAPH_WIDGETS);
  }

  createHostsSection(): PureStorageSectionViewModel {
    return this.createSection('hosts', 'Host Overview', PURE_STORAGE_HOSTS_TABLE_COLUMNS,
      'PureStorageHostsChartLoader', 'PureStorageHostsTableLoader', PURE_STORAGE_HOSTS_GRAPH_WIDGETS);
  }

  createHostGroupsSection(): PureStorageSectionViewModel {
    return this.createSection('hostGroups', 'Host Groups Overview', PURE_STORAGE_HOST_GROUPS_TABLE_COLUMNS,
      'PureStorageHostGroupsChartLoader', 'PureStorageHostGroupsTableLoader',
      PURE_STORAGE_HOST_GROUPS_GRAPH_WIDGETS,
      'Selection logic: Top 10 host groups are derived by ranking all host groups by total storage capacity (GB) and selecting the highest-capacity groups.');
  }

  createVolumesSection(): PureStorageSectionViewModel {
    return this.createSection('volumes', 'Volumes Overview', PURE_STORAGE_VOLUMES_TABLE_COLUMNS,
      'PureStorageVolumesChartLoader', 'PureStorageVolumesTableLoader', PURE_STORAGE_VOLUMES_GRAPH_WIDGETS);
  }

  createVolumeSnapshotsSection(): PureStorageSectionViewModel {
    return this.createSection('volumeSnapshots', 'Volume Snapshot Overview', PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_COLUMNS,
      'PureStorageVolumeSnapshotsChartLoader', 'PureStorageVolumeSnapshotsTableLoader',
      PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_WIDGETS);
  }

  createVolumeGroupsSection(): PureStorageSectionViewModel {
    return this.createSection('volumeGroups', 'Top 10 Volume Groups', PURE_STORAGE_VOLUME_GROUPS_TABLE_COLUMNS,
      'PureStorageVolumeGroupsChartLoader', 'PureStorageVolumeGroupsTableLoader',
      PURE_STORAGE_VOLUME_GROUPS_GRAPH_WIDGETS);
  }

  createProtectionReplicationSection(): PureStorageSectionViewModel {
    return this.createSection('protectionReplication', 'Top 10 Protection & Replication',
      PURE_STORAGE_PROTECTION_REPLICATION_TABLE_COLUMNS, 'PureStorageProtectionReplicationChartLoader',
      'PureStorageProtectionReplicationTableLoader', PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_WIDGETS);
  }

  createProtectionGroupSnapshotsSection(): PureStorageSectionViewModel {
    return this.createSection('protectionGroupSnapshots', 'Top 10 Protection Groups Snapshots',
      PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_COLUMNS, 'PureStorageProtectionGroupSnapshotsChartLoader',
      'PureStorageProtectionGroupSnapshotsTableLoader', PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_WIDGETS);
  }

  createActiveClusterSection(): PureStorageSectionViewModel {
    return this.createSection('activeCluster', 'ActiveCluster/POD', PURE_STORAGE_ACTIVE_CLUSTER_TABLE_COLUMNS,
      'PureStorageActiveClusterChartLoader', 'PureStorageActiveClusterTableLoader',
      PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_WIDGETS);
  }

  createPerformanceSection(): PureStorageSectionViewModel {
    return this.createSection('performance', 'Performance Trends', PURE_STORAGE_PERFORMANCE_TABLE_COLUMNS,
      'PureStoragePerformanceChartLoader', 'PureStoragePerformanceTableLoader',
      PURE_STORAGE_PERFORMANCE_GRAPH_WIDGETS);
  }

  createCapacityPlanningSection(): PureStorageSectionViewModel {
    return this.createSection('capacityPlanning', 'Capacity Planning', PURE_STORAGE_CAPACITY_PLANNING_TABLE_COLUMNS,
      'PureStorageCapacityPlanningChartLoader', 'PureStorageCapacityPlanningTableLoader',
      PURE_STORAGE_CAPACITY_PLANNING_GRAPH_WIDGETS);
  }

  createHardwareSection(): PureStorageSectionViewModel {
    return this.createSection('hardware', 'Hardware Health', PURE_STORAGE_HARDWARE_TABLE_COLUMNS,
      'PureStorageHardwareChartLoader', 'PureStorageHardwareTableLoader', PURE_STORAGE_HARDWARE_GRAPH_WIDGETS);
  }

  createAlertsSection(): PureStorageSectionViewModel {
    return this.createSection('alerts', 'Alerts Overview', PURE_STORAGE_ALERTS_TABLE_COLUMNS,
      'PureStorageAlertsChartLoader', 'PureStorageAlertsTableLoader', PURE_STORAGE_ALERTS_GRAPH_WIDGETS);
  }

  private createSection(key: PureStorageSectionKey, title: string, columns: PureStorageTableColumn[],
    chartLoader: string, tableLoader: string, widgets: PureStorageGraphWidgetDefinition[] = [],
    tooltip?: string): PureStorageSectionViewModel {
    const tableColumns = columns.map(column => ({ ...column }));
    const defaultSortColumn = this.getDefaultTableSortColumn(key, tableColumns);

    return new PureStorageSectionViewModel({
      key,
      title,
      tooltip,
      viewMode: 'chart',
      chartLoader,
      charts: this.createChartCards(key, widgets),
      table: new PureStorageTableStateViewModel({
        columns: tableColumns,
        loader: tableLoader,
        criteria: this.createTableCriteria(defaultSortColumn)
      })
    });
  }

  getExecutiveSummary(filters: StorageDashboardFilterCriteria): Observable<PureStorageExecutiveSummaryResponse> {
    // return of(PURE_STORAGE_EXECUTIVE_SUMMARY_API_DUMMY);
    return this.http.get<PureStorageExecutiveSummaryResponse>(PURE_STORAGE_EXECUTIVE_SUMMARY_ENDPOINT, {
      params: this.getFilterParams(filters)
    });
  }

  getAutoRemediationSummary(filters: StorageDashboardFilterCriteria): Observable<PureStorageAutoRemediationSummaryResponse> {
    // return of(PURE_STORAGE_AUTO_REMEDIATION_SUMMARY_API_DUMMY);
    return this.http.get<PureStorageAutoRemediationSummaryResponse>(PURE_STORAGE_AUTO_REMEDIATION_SUMMARY_ENDPOINT, {
      params: this.getFilterParams(filters)
    });
  }

  getArraysGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageArraysGraphResponse> {
    // return of(PURE_STORAGE_ARRAYS_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageArraysGraphResponse>(PURE_STORAGE_ARRAYS_GRAPH_ENDPOINT, filters);
  }

  getArraysTable(filters: StorageDashboardFilterCriteria, criteria: SearchCriteria): Observable<PureStorageArraysTableResponse> {
    // return of(PURE_STORAGE_ARRAYS_TABLE_API_DUMMY);
    return this.getTableData<PureStorageArraysTableResponse>(PURE_STORAGE_ARRAYS_TABLE_ENDPOINT, filters, criteria);
  }

  getHostsGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageHostsGraphResponse> {
    // return of(PURE_STORAGE_HOSTS_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageHostsGraphResponse>(PURE_STORAGE_HOSTS_GRAPH_ENDPOINT, filters);
  }

  getHostsTable(filters: StorageDashboardFilterCriteria, criteria: SearchCriteria): Observable<PureStorageHostsTableResponse> {
    // return of(PURE_STORAGE_HOSTS_TABLE_API_DUMMY);
    return this.getTableData<PureStorageHostsTableResponse>(PURE_STORAGE_HOSTS_TABLE_ENDPOINT, filters, criteria);
  }

  getHostGroupsGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageHostGroupsGraphResponse> {
    // return of(PURE_STORAGE_HOST_GROUPS_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageHostGroupsGraphResponse>(PURE_STORAGE_HOST_GROUPS_GRAPH_ENDPOINT, filters);
  }

  getHostGroupsTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStorageHostGroupsTableResponse> {
    // return of(PURE_STORAGE_HOST_GROUPS_TABLE_API_DUMMY);
    return this.getTableData<PureStorageHostGroupsTableResponse>(PURE_STORAGE_HOST_GROUPS_TABLE_ENDPOINT, filters, criteria);
  }

  getVolumesGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageVolumesGraphResponse> {
    // return of(PURE_STORAGE_VOLUMES_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageVolumesGraphResponse>(PURE_STORAGE_VOLUMES_GRAPH_ENDPOINT, filters);
  }

  getVolumesTable(filters: StorageDashboardFilterCriteria, criteria: SearchCriteria): Observable<PureStorageVolumesTableResponse> {
    // return of(PURE_STORAGE_VOLUMES_TABLE_API_DUMMY);
    return this.getTableData<PureStorageVolumesTableResponse>(PURE_STORAGE_VOLUMES_TABLE_ENDPOINT, filters, criteria);
  }

  getVolumeSnapshotsGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageVolumeSnapshotsGraphResponse> {
    // return of(PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageVolumeSnapshotsGraphResponse>(PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_ENDPOINT, filters);
  }

  getVolumeSnapshotsTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStorageVolumeSnapshotsTableResponse> {
    // return of(PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_API_DUMMY);
    return this.getTableData<PureStorageVolumeSnapshotsTableResponse>(PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_ENDPOINT,
      filters, criteria);
  }

  getVolumeGroupsGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageVolumeGroupsGraphResponse> {
    // return of(PURE_STORAGE_VOLUME_GROUPS_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageVolumeGroupsGraphResponse>(PURE_STORAGE_VOLUME_GROUPS_GRAPH_ENDPOINT, filters);
  }

  getVolumeGroupsTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStorageVolumeGroupsTableResponse> {
    // return of(PURE_STORAGE_VOLUME_GROUPS_TABLE_API_DUMMY);
    return this.getTableData<PureStorageVolumeGroupsTableResponse>(PURE_STORAGE_VOLUME_GROUPS_TABLE_ENDPOINT, filters, criteria);
  }

  getProtectionReplicationGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageProtectionReplicationGraphResponse> {
    // return of(PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageProtectionReplicationGraphResponse>(PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_ENDPOINT,
      filters);
  }

  getProtectionReplicationTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStorageProtectionReplicationTableResponse> {
    // return of(PURE_STORAGE_PROTECTION_REPLICATION_TABLE_API_DUMMY);
    return this.getTableData<PureStorageProtectionReplicationTableResponse>(PURE_STORAGE_PROTECTION_REPLICATION_TABLE_ENDPOINT,
      filters, criteria);
  }

  getProtectionGroupSnapshotsGraph(filters: StorageDashboardFilterCriteria):
    Observable<PureStorageProtectionGroupSnapshotsGraphResponse> {
    // return of(PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageProtectionGroupSnapshotsGraphResponse>(
      PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_ENDPOINT, filters);
  }

  getProtectionGroupSnapshotsTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStorageProtectionGroupSnapshotsTableResponse> {
    // return of(PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_API_DUMMY);
    return this.getTableData<PureStorageProtectionGroupSnapshotsTableResponse>(
      PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_ENDPOINT, filters, criteria);
  }

  getActiveClusterGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageActiveClusterGraphResponse> {
    // return of(PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageActiveClusterGraphResponse>(PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_ENDPOINT, filters);
  }

  getActiveClusterTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStorageActiveClusterTableResponse> {
    // return of(PURE_STORAGE_ACTIVE_CLUSTER_TABLE_API_DUMMY);
    return this.getTableData<PureStorageActiveClusterTableResponse>(PURE_STORAGE_ACTIVE_CLUSTER_TABLE_ENDPOINT, filters, criteria);
  }

  getPerformanceGraph(filters: StorageDashboardFilterCriteria): Observable<PureStoragePerformanceGraphResponse> {
    // return of(PURE_STORAGE_PERFORMANCE_GRAPH_API_DUMMY);
    return this.getGraphData<PureStoragePerformanceGraphResponse>(PURE_STORAGE_PERFORMANCE_GRAPH_ENDPOINT, filters);
  }

  getPerformanceTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStoragePerformanceTableResponse> {
    // return of(PURE_STORAGE_PERFORMANCE_TABLE_API_DUMMY);
    return this.getTableData<PureStoragePerformanceTableResponse>(PURE_STORAGE_PERFORMANCE_TABLE_ENDPOINT, filters, criteria);
  }

  getCapacityPlanningGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageCapacityPlanningGraphResponse> {
    // return of(PURE_STORAGE_CAPACITY_PLANNING_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageCapacityPlanningGraphResponse>(PURE_STORAGE_CAPACITY_PLANNING_GRAPH_ENDPOINT, filters);
  }

  getCapacityPlanningTable(filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<PureStorageCapacityPlanningTableResponse> {
    // return of(PURE_STORAGE_CAPACITY_PLANNING_TABLE_API_DUMMY);
    return this.getTableData<PureStorageCapacityPlanningTableResponse>(PURE_STORAGE_CAPACITY_PLANNING_TABLE_ENDPOINT,
      filters, criteria);
  }

  getHardwareGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageHardwareGraphResponse> {
    // return of(PURE_STORAGE_HARDWARE_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageHardwareGraphResponse>(PURE_STORAGE_HARDWARE_GRAPH_ENDPOINT, filters);
  }

  getHardwareTable(filters: StorageDashboardFilterCriteria, criteria: SearchCriteria): Observable<PureStorageHardwareTableResponse> {
    // return of(PURE_STORAGE_HARDWARE_TABLE_API_DUMMY);
    return this.getTableData<PureStorageHardwareTableResponse>(PURE_STORAGE_HARDWARE_TABLE_ENDPOINT, filters, criteria);
  }

  getAlertsGraph(filters: StorageDashboardFilterCriteria): Observable<PureStorageAlertsGraphResponse> {
    // return of(PURE_STORAGE_ALERTS_GRAPH_API_DUMMY);
    return this.getGraphData<PureStorageAlertsGraphResponse>(PURE_STORAGE_ALERTS_GRAPH_ENDPOINT, filters);
  }

  getAlertsTable(filters: StorageDashboardFilterCriteria, criteria: SearchCriteria): Observable<PureStorageAlertsTableResponse> {
    // return of(PURE_STORAGE_ALERTS_TABLE_API_DUMMY);
    return this.getTableData<PureStorageAlertsTableResponse>(PURE_STORAGE_ALERTS_TABLE_ENDPOINT, filters, criteria);
  }

  convertExecutiveSummary(response: PureStorageExecutiveSummaryResponse): PureStorageMetricViewModel[] {
    const data = response?.data;
    const availabilityTrend = data?.availability_trend ? this.convertAvailabilityTrend(data.availability_trend) : undefined;
    return [
      this.metric('Total Arrays', this.formatNumber(data?.total_arrays), 'primary'),
      this.metric('Free Capacity', this.formatCapacity(data?.free_capacity), 'primary'),
      this.metric('Effective Capacity', this.formatCapacity(data?.effective_capacity), 'primary'),
      this.metric('Data Reduction Ratio', this.formatRatio(data?.data_reduction_ratio), 'primary'),
      this.metric('Total Data Reduction Ratio', this.formatRatio(data?.total_data_reduction_ratio), 'primary'),
      this.metric('Space Savings', this.formatPercent(data?.space_savings_percentage), 'primary'),
      this.metric('Availability %', this.formatPercent(data?.availability_percentage, 4), 'success', availabilityTrend),
      this.metric('Active Alerts', this.formatNumber(data?.active_alerts), data?.active_alerts ? 'danger' : 'success'),
      this.metric('Total Volumes', this.formatNumber(data?.total_volumes), 'primary'),
      this.metric('Total Hosts', this.formatNumber(data?.total_hosts), 'primary'),
      this.metric('Total Host Groups', this.formatNumber(data?.total_host_groups), 'primary'),
      this.metric('Total Protection Groups', this.formatNumber(data?.total_protection_groups), 'primary')
    ];
  }

  convertAutoRemediationSummary(response: PureStorageAutoRemediationSummaryResponse): PureStorageMetricViewModel[] {
    const summary = response?.summary;
    return [
      this.metric('Auto-Remediations', this.formatNumber(summary?.auto_remediations), 'success'),
      this.metric('Avg MTTR', this.formatMttrMinutes(summary?.average_mttr_minutes), 'success'),
      this.metric('Runbook Success', this.formatNumber(summary?.runbook_success), 'success'),
      this.metric('Runbook Failures', this.formatNumber(summary?.runbook_failures),
        summary?.runbook_failures ? 'danger' : 'success')
    ];
  }

  convertArraysGraph(response: PureStorageArraysGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertArraySummary(response?.summary), PURE_STORAGE_ARRAYS_GRAPH_WIDGETS);
  }

  convertArraysTable(response: PureStorageArraysTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_ARRAYS_TABLE_COLUMNS, response);
  }

  convertArraysTableSummary(response: PureStorageArraysTableResponse): PureStorageMetricViewModel[] {
    return this.convertArraySummary(response?.summary);
  }

  convertHostsGraph(response: PureStorageHostsGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertHostSummary(response?.summary), PURE_STORAGE_HOSTS_GRAPH_WIDGETS);
  }

  convertHostsTable(response: PureStorageHostsTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_HOSTS_TABLE_COLUMNS, response);
  }

  convertHostsTableSummary(response: PureStorageHostsTableResponse): PureStorageMetricViewModel[] {
    return this.convertHostSummary(response?.summary);
  }

  convertHostGroupsGraph(response: PureStorageHostGroupsGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, [], PURE_STORAGE_HOST_GROUPS_GRAPH_WIDGETS);
  }

  convertHostGroupsTable(response: PureStorageHostGroupsTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_HOST_GROUPS_TABLE_COLUMNS, response);
  }

  convertVolumesGraph(response: PureStorageVolumesGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertVolumeSummary(response?.summary), PURE_STORAGE_VOLUMES_GRAPH_WIDGETS);
  }

  convertVolumesTable(response: PureStorageVolumesTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_VOLUMES_TABLE_COLUMNS, response);
  }

  convertVolumesTableSummary(response: PureStorageVolumesTableResponse): PureStorageMetricViewModel[] {
    return this.convertVolumeSummary(response?.summary);
  }

  convertVolumeSnapshotsGraph(response: PureStorageVolumeSnapshotsGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, [], PURE_STORAGE_VOLUME_SNAPSHOTS_GRAPH_WIDGETS);
  }

  convertVolumeSnapshotsTable(response: PureStorageVolumeSnapshotsTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_VOLUME_SNAPSHOTS_TABLE_COLUMNS, response);
  }

  convertVolumeGroupsGraph(response: PureStorageVolumeGroupsGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, [], PURE_STORAGE_VOLUME_GROUPS_GRAPH_WIDGETS);
  }

  convertVolumeGroupsTable(response: PureStorageVolumeGroupsTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_VOLUME_GROUPS_TABLE_COLUMNS, response);
  }

  convertProtectionReplicationGraph(response: PureStorageProtectionReplicationGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, [], PURE_STORAGE_PROTECTION_REPLICATION_GRAPH_WIDGETS);
  }

  convertProtectionReplicationTable(response: PureStorageProtectionReplicationTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_PROTECTION_REPLICATION_TABLE_COLUMNS, response);
  }

  convertProtectionGroupSnapshotsGraph(response: PureStorageProtectionGroupSnapshotsGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, [], PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_GRAPH_WIDGETS);
  }

  convertProtectionGroupSnapshotsTable(response: PureStorageProtectionGroupSnapshotsTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_PROTECTION_GROUP_SNAPSHOTS_TABLE_COLUMNS, response);
  }

  convertActiveClusterGraph(response: PureStorageActiveClusterGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertActiveClusterSummary(response?.summary),
      PURE_STORAGE_ACTIVE_CLUSTER_GRAPH_WIDGETS);
  }

  convertActiveClusterTable(response: PureStorageActiveClusterTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_ACTIVE_CLUSTER_TABLE_COLUMNS, response);
  }

  convertActiveClusterTableSummary(response: PureStorageActiveClusterTableResponse): PureStorageMetricViewModel[] {
    return this.convertActiveClusterSummary(response?.summary);
  }

  convertPerformanceGraph(response: PureStoragePerformanceGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertPerformanceSummary(response?.summary),
      PURE_STORAGE_PERFORMANCE_GRAPH_WIDGETS);
  }

  convertPerformanceTable(response: PureStoragePerformanceTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_PERFORMANCE_TABLE_COLUMNS, response);
  }

  convertPerformanceTableSummary(response: PureStoragePerformanceTableResponse): PureStorageMetricViewModel[] {
    return this.convertPerformanceSummary(response?.summary);
  }

  convertCapacityPlanningGraph(response: PureStorageCapacityPlanningGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertCapacityPlanningSummary(response?.summary),
      PURE_STORAGE_CAPACITY_PLANNING_GRAPH_WIDGETS);
  }

  convertCapacityPlanningTable(response: PureStorageCapacityPlanningTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_CAPACITY_PLANNING_TABLE_COLUMNS, response);
  }

  convertCapacityPlanningTableSummary(response: PureStorageCapacityPlanningTableResponse): PureStorageMetricViewModel[] {
    return this.convertCapacityPlanningSummary(response?.summary);
  }

  convertHardwareGraph(response: PureStorageHardwareGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertHardwareSummary(response?.summary), PURE_STORAGE_HARDWARE_GRAPH_WIDGETS);
  }

  convertHardwareTable(response: PureStorageHardwareTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_HARDWARE_TABLE_COLUMNS, response);
  }

  convertHardwareTableSummary(response: PureStorageHardwareTableResponse): PureStorageMetricViewModel[] {
    return this.convertHardwareSummary(response?.summary);
  }

  convertAlertsGraph(response: PureStorageAlertsGraphResponse): PureStorageSectionGraphViewModel {
    return this.convertGraphResponse(response, this.convertAlertsSummary(response?.summary), PURE_STORAGE_ALERTS_GRAPH_WIDGETS);
  }

  convertAlertsTable(response: PureStorageAlertsTableResponse): PureStorageTableStateViewModel {
    return this.convertTableResponse(PURE_STORAGE_ALERTS_TABLE_COLUMNS, response);
  }

  convertAlertsTableSummary(response: PureStorageAlertsTableResponse): PureStorageMetricViewModel[] {
    return this.convertAlertsSummary(response?.summary);
  }

  private convertGraphResponse(response: PureStorageAnyGraphResponse,
    metrics: PureStorageMetricViewModel[] = [],
    widgets: PureStorageGraphWidgetDefinition[] = []): PureStorageSectionGraphViewModel {
    return {
      metrics,
      charts: this.convertGraphCards(response?.graphs || [], widgets)
    };
  }

  private createChartCards(sectionKey: PureStorageSectionKey,
    widgets: PureStorageGraphWidgetDefinition[] = []): PureStorageChartCardViewModel[] {
    // These initial cards are the UI shell; API graph cards supply data later and must not replace loader/layout metadata.
    return widgets.map((widget, index) => {
      const chartType = this.normalizeChartType(widget.chart_type);
      return new PureStorageChartCardViewModel({
        key: widget.key,
        title: widget.title,
        chartType,
        tooltip: widget.tooltip,
        span: widget.span || this.getChartSpan(chartType, index, widgets.length),
        hasData: false,
        loading: true,
        loader: `${sectionKey}-${widget.key}-loader`
      });
    });
  }

  private convertGraphCards(graphs: PureStorageGraphApi[],
    widgets: PureStorageGraphWidgetDefinition[] = []): PureStorageChartCardViewModel[] {
    const orderedGraphs: Array<{ graph: PureStorageGraphApi; widget?: PureStorageGraphWidgetDefinition }> = widgets.length
      ? this.getOrderedGraphCards(graphs, widgets)
      : (graphs || []).map(graph => ({ graph }));
    const graphCount = orderedGraphs.length;
    return orderedGraphs.map(({ graph, widget }, index) => {
      const graphChartType = widget?.chart_type || graph.chart_type;
      const chartType = this.normalizeChartType(graphChartType);
      const chartGraph = {
        ...graph,
        title: widget?.title || graph.title,
        chart_type: graphChartType
      };
      return new PureStorageChartCardViewModel({
        key: graph.key,
        title: widget?.title || graph.title,
        chartType,
        tooltip: widget?.tooltip,
        span: widget?.span || this.getChartSpan(chartType, index, graphCount),
        hasData: this.hasGraphData(chartGraph),
        loading: false,
        chartData: this.makeChartData(chartGraph, chartType)
      });
    });
  }

  private getOrderedGraphCards(graphs: PureStorageGraphApi[],
    widgets: PureStorageGraphWidgetDefinition[]): Array<{ graph: PureStorageGraphApi; widget: PureStorageGraphWidgetDefinition }> {
    const graphMap = new Map((graphs || []).map(graph => [graph.key, graph]));
    return widgets.map(widget => {
      const graph = graphMap.get(widget.key);
      return {
        widget,
        graph: {
          ...(graph || {}),
          key: widget.key,
          title: widget.title,
          chart_type: widget.chart_type
        }
      };
    });
  }

  private convertTableResponse(columns: PureStorageTableColumn[], response: PureStorageAnyTableResponse): PureStorageTableStateViewModel {
    const rows = (response?.results || []).map((row, index) => this.convertTableRow(columns, row, index));
    return new PureStorageTableStateViewModel({
      columns: columns.map(column => ({ ...column })),
      rows,
      count: response?.count || 0,
      currentPage: response?.current_page || 1,
      pageSize: response?.page_size || 10,
      totalPages: response?.total_pages || 0,
      hasLoaded: true,
      noData: !rows.length,
      rawResponse: response
    });
  }

  private getGraphData<TResponse>(endpoint: string, filters: StorageDashboardFilterCriteria): Observable<TResponse> {
    return this.http.get<TResponse>(endpoint, {
      params: this.getFilterParams(filters)
    });
  }

  private getTableData<TResponse>(endpoint: string, filters: StorageDashboardFilterCriteria,
    criteria: SearchCriteria): Observable<TResponse> {
    const tableCriteria = this.withFilterCriteria(criteria, filters);
    return this.tableService.getData<TResponse>(endpoint, tableCriteria);
  }

  createTableCriteria(sortColumn: string = ''): SearchCriteria {
    return {
      sortColumn,
      sortDirection: 'asc',
      searchValue: '',
      pageNo: 1,
      pageSize: 10
    };
  }

  private getDefaultTableSortColumn(key: PureStorageSectionKey, columns: PureStorageTableColumn[]): string {
    switch (key) {
      case 'alerts':
        return columns[1]?.sortKey || columns[0]?.sortKey || '';
      default:
        return columns[0]?.sortKey || '';
    }
  }

  private getFilterParams(filters: StorageDashboardFilterCriteria): HttpParams {
    let params = new HttpParams();
    if (!filters) {
      return params;
    }
    const timeRange = this.getTimeRangeParam(filters);
    if (timeRange) {
      params = params.set('time_range', timeRange);
    }
    if (filters.from) {
      params = params.set('start_datetime', this.formatDateParam(filters.from));
    }
    if (filters.to) {
      params = params.set('end_datetime', this.formatDateParam(filters.to));
    }
    const datacenter = this.getSelectedFilterValue(filters.datacenters);
    if (datacenter) {
      params = params.set('datacenter', datacenter);
    }
    (filters.arrays || []).forEach(arrayId => {
      params = params.append('arrays', arrayId);
    });
    return params;
  }

  private withFilterCriteria(criteria: SearchCriteria, filters: StorageDashboardFilterCriteria): SearchCriteria {
    const filteredCriteria: SearchCriteria = {
      ...criteria,
      params: [{
        time_range: filters ? this.getTimeRangeParam(filters) : null,
        start_datetime: filters?.from ? this.formatDateParam(filters.from) : null,
        end_datetime: filters?.to ? this.formatDateParam(filters.to) : null,
        datacenter: this.getSelectedFilterValue(filters?.datacenters)
      }],
      multiValueParam: {
        arrays: filters?.arrays || []
      }
    };
    return filteredCriteria;
  }

  private getSelectedFilterValue(values?: string[]): string | null {
    const value = (values || []).find(item => !!item);
    return value || STORAGE_ALL_VALUE;
  }

  private getTimeRangeParam(filters: StorageDashboardFilterCriteria): string {
    return filters.timeRangeApiValue || filters.period;
  }

  private convertTableRow(columns: PureStorageTableColumn[], row: PureStorageAnyTableRowApi,
    index: number): PureStorageTableRowViewModel {
    const record = row as unknown as Record<string, unknown>;
    const resourceId = this.getRowResourceId(record, index);
    return new PureStorageTableRowViewModel({
      resourceId,
      cells: columns.map(column => this.formatCell(record[column.sortKey], column.format))
    });
  }

  private getRowResourceId(record: Record<string, unknown>, index: number): string {
    const id = record.array_hostname || record.array_name || record.resource_name || record.volume_name
      || record.host_name || record.host_group_name || record.snapshot_name || record.volume_group_name
      || record.protection_group_name || record.session_group_name || record.pod_name
      || (record as Partial<PureStorageAlertTableRowApi>).alert_id;
    return id ? String(id) : `pure-row-${index}`;
  }

  private makeChartData(graph: PureStorageGraphApi, chartType: PureStorageChartType): UnityChartDetails {
    const view = new UnityChartDetails();
    const unityChartType = this.getUnityChartType(chartType);
    view.type = unityChartType;
    view.options = this.makeChartOption(graph, chartType);
    view.extensions = this.getUnityChartExtensions(chartType, unityChartType);
    return view;
  }

  private getUnityChartType(chartType: PureStorageChartType): string {
    switch (chartType) {
      case 'line':
        return UnityChartTypes.LINE;
      case 'pie':
      case 'doughnut':
      case 'polarArea':
        return UnityChartTypes.PIE;
      case 'scatter':
        return UnityChartTypes.SCATTER;
      case 'treemap':
        return UnityChartTypes.TREE_MAP;
      case 'sankey':
        return UnityChartTypes.SANKEY;
      case 'funnel':
        return UnityChartTypes.FUNNEL;
      case 'radar':
        return UnityChartTypes.RADAR;
      case 'heatmap':
        return UnityChartTypes.HEAT_MAP;
      case 'sunburst':
        return UnityChartTypes.SUN_BURST;
      case 'parallelCoordinates':
        return UnityChartTypes.PARALLEL;
      default:
        return UnityChartTypes.BAR;
    }
  }

  private getUnityChartExtensions(chartType: PureStorageChartType, unityChartType: string): any[] {
    const chartTypes = [unityChartType];
    if (chartType === 'mixedBarLine') {
      chartTypes.push(UnityChartTypes.LINE);
    }
    if (chartType === 'lollipop') {
      chartTypes.push(UnityChartTypes.SCATTER);
    }
    const extensions = chartTypes.reduce((items: any[], type) => {
      return items.concat(this.chartConfigSvc.getChartExtensions(type));
    }, []);
    if (chartType === 'heatmap') {
      extensions.unshift(VisualMapComponent);
    }
    if (chartType === 'parallelCoordinates') {
      extensions.unshift(ParallelComponent);
    }
    return extensions.filter((extension, index) => extensions.indexOf(extension) === index);
  }

  private makeChartOption(graph: PureStorageGraphApi, chartType: PureStorageChartType): EChartsOption {
    const labels = this.getGraphLabels(graph);
    const series = graph.series || [];
    const values = this.getGraphValues(graph);
    const config: PureStorageChartVisualConfig = {
      ...this.getChartVisualConfig(graph, chartType),
      seriesName: graph.title
    };
    if (chartType === 'bar' && series.length > 1) {
      return this.makeGroupedBarOption(labels, series, false, false, config);
    }
    switch (chartType) {
      case 'horizontalBar':
        return this.makeBarOption(labels, values, true, config);
      case 'lollipop':
        return this.makeLollipopOption(labels, values, config.color || this.getLollipopColor(graph.key), config);
      case 'groupedBar':
        return this.makeGroupedBarOption(labels, series, false, false, config);
      case 'stackedBar':
        return this.makeGroupedBarOption(labels, series, true, config.horizontal === true || graph.key === 'snapshot_composition',
          config);
      case 'mixedBarLine':
        return this.makeMixedBarLineOption(labels, series, config);
      case 'line':
        return this.makeLineOption(labels, series, values, config);
      case 'pie':
      case 'doughnut':
        return this.makePieOption(labels, values, chartType === 'doughnut', false, config);
      case 'polarArea':
        return this.makePieOption(labels, values, false, true, config);
      case 'scatter':
        if (graph.key === 'pod_status_scatter') {
          return this.makePodStatusScatterOption(graph, config);
        }
        return this.makeScatterOption(graph, config);
      case 'radar':
        return this.makeRadarOption(labels, series, config);
      case 'heatmap':
        return this.makeHeatmapOption(graph, labels, series, config);
      case 'sunburst':
        return this.makeSunburstOption(graph, labels, values, config);
      case 'parallelCoordinates':
        return this.makeParallelCoordinatesOption(graph, config);
      case 'treemap':
        return this.makeTreemapOption(graph, labels, values, config);
      case 'sankey':
        return this.makeSankeyOption(graph, labels, values, config);
      case 'funnel':
        return this.makeFunnelOption(labels, values, config);
      default:
        return this.makeBarOption(labels, values, false, config);
    }
  }

  private makeBarOption(labels: string[], values: number[], horizontal = false,
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const renderData = this.getRenderableSingleSeriesData(labels, values);
    const categoryAxis = {
      type: 'category' as const,
      data: renderData.labels,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        rotate: config.xRotate ?? (horizontal ? 0 : 20),
        interval: 0,
        hideOverlap: true,
        width: horizontal ? config.yLabelWidth || 96 : config.xLabelWidth || 64,
        overflow: 'truncate' as const,
        formatter: (value: string): string => this.truncateAxisLabel(value),
        color: '#64748b',
        fontSize: horizontal ? config.yFontSize || 8 : config.xFontSize || 8
      }
    };
    const valueAxisName = horizontal ? config.xAxisName : config.yAxisName;
    const valueAxis = {
      type: 'value' as const,
      name: valueAxisName,
      min: horizontal ? config.xAxisMin : config.yAxisMin,
      max: horizontal ? config.xAxisMax : config.yAxisMax,
      nameGap: valueAxisName ? (horizontal ? config.xNameGap || 8 : config.yNameGap || 8) : undefined,
      nameTextStyle: valueAxisName ? this.getAxisNameTextStyle() : undefined,
      axisLabel: { color: '#64748b', fontSize: 9 },
      splitLine: { lineStyle: { color: '#E2E8F0' } }
    };
    return {
      tooltip: this.getPositiveAxisTooltipOption(),
      grid: this.getGrid(config, horizontal
        ? { left: '20%', right: '5%', top: '15%', bottom: '15%' }
        : { left: '10%', right: '5%', top: '15%', bottom: '25%' }),
      xAxis: horizontal ? valueAxis : categoryAxis,
      yAxis: horizontal ? categoryAxis : valueAxis,
      series: [{
        name: config.seriesName,
        type: 'bar',
        data: renderData.values,
        barMaxWidth: horizontal ? 14 : 20,
        barWidth: horizontal ? undefined : '50%',
        barCategoryGap: '36%',
        itemStyle: { color: config.color || this.chartColors[0] }
      }]
    };
  }

  private makeGroupedBarOption(labels: string[], series: PureStorageGraphSeriesApi[],
    stacked: boolean, horizontal = false, config: PureStorageChartVisualConfig = {}): EChartsOption {
    const renderData = this.getRenderableSeriesData(labels, series);
    const categoryAxis = {
      type: 'category' as const,
      data: renderData.labels,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        rotate: config.xRotate ?? (horizontal ? 0 : 20),
        interval: 0,
        hideOverlap: true,
        width: horizontal ? config.yLabelWidth || 96 : config.xLabelWidth || 64,
        overflow: 'truncate' as const,
        formatter: (value: string): string => this.truncateAxisLabel(value),
        color: '#64748b',
        fontSize: horizontal ? config.yFontSize || 8 : config.xFontSize || 8
      }
    };
    const valueAxisName = horizontal ? config.xAxisName : config.yAxisName;
    const valueAxis = {
      type: 'value' as const,
      name: valueAxisName,
      min: horizontal ? config.xAxisMin : config.yAxisMin,
      max: horizontal ? config.xAxisMax : config.yAxisMax,
      nameGap: valueAxisName ? (horizontal ? config.xNameGap || 8 : config.yNameGap || 8) : undefined,
      nameTextStyle: valueAxisName ? this.getAxisNameTextStyle() : undefined,
      axisLabel: { color: '#64748b', fontSize: 9 },
      splitLine: { lineStyle: { color: '#E2E8F0' } }
    };
    const legendPosition = config.legend || 'top';
    return {
      tooltip: this.getPositiveAxisTooltipOption(),
      legend: this.getLegendOption(legendPosition, 14, 8, 9),
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: horizontal ? valueAxis : categoryAxis,
      yAxis: horizontal ? categoryAxis : valueAxis,
      series: renderData.series.map((item, index) => ({
        name: item.name,
        type: 'bar',
        stack: stacked ? 'total' : undefined,
        data: item.data,
        barMaxWidth: horizontal ? 14 : 18,
        barGap: stacked ? undefined : '12%',
        barCategoryGap: '34%',
        itemStyle: { color: this.getSeriesColor(index, config) }
      }))
    };
  }

  private makeLollipopOption(labels: string[], values: number[], color: string,
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const renderData = this.getRenderableSingleSeriesData(labels, values);
    return {
      tooltip: this.getPositiveAxisTooltipOption({ type: 'shadow' }),
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: {
        type: 'value',
        name: config.xAxisName,
        min: config.xAxisMin,
        max: config.xAxisMax,
        nameGap: config.xAxisName ? config.xNameGap || 8 : undefined,
        nameTextStyle: config.xAxisName ? this.getAxisNameTextStyle() : undefined,
        axisLabel: { color: '#64748b', fontSize: 8 },
        splitLine: { lineStyle: { color: '#E2E8F0' } }
      },
      yAxis: {
        type: 'category',
        data: renderData.labels,
        axisLabel: {
          color: '#64748b',
          fontSize: config.yFontSize || 7,
          hideOverlap: true,
          width: config.yLabelWidth || 96,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value)
        }
      },
      series: [
        {
          name: config.seriesName,
          type: 'bar',
          data: renderData.values,
          barWidth: 2,
          silent: true,
          tooltip: { show: false },
          itemStyle: { color }
        },
        {
          name: config.seriesName,
          type: 'scatter',
          data: renderData.values,
          symbolSize: 12,
          itemStyle: { color },
          label: { show: false }
        }
      ]
    };
  }

  private makeMixedBarLineOption(labels: string[], series: PureStorageGraphSeriesApi[],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const renderData = this.getRenderableSeriesData(labels, series);
    return {
      tooltip: this.getPositiveAxisTooltipOption(),
      legend: this.getLegendOption(config.legend || 'top', 14, 8, 9),
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: {
        type: 'category',
        data: renderData.labels,
        axisTick: { alignWithLabel: true },
        axisLabel: {
          rotate: config.xRotate ?? 20,
          interval: 0,
          hideOverlap: true,
          width: config.xLabelWidth || 64,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value),
          color: '#64748b',
          fontSize: config.xFontSize || 8
        }
      },
      yAxis: [
        {
          type: 'value',
          name: config.yAxisName,
          min: config.yAxisMin,
          max: config.yAxisMax,
          nameGap: config.yAxisName ? config.yNameGap || 8 : undefined,
          nameTextStyle: config.yAxisName ? this.getAxisNameTextStyle() : undefined,
          axisLabel: { color: '#64748b', fontSize: 9 },
          splitLine: { lineStyle: { color: '#E2E8F0' } }
        },
        {
          type: 'value',
          name: config.yAxisName2,
          min: config.yAxisMin2,
          max: config.yAxisMax2,
          nameGap: config.yAxisName2 ? config.yNameGap || 8 : undefined,
          nameTextStyle: config.yAxisName2 ? this.getAxisNameTextStyle() : undefined,
          axisLabel: { color: '#64748b', fontSize: 9 },
          splitLine: { show: false }
        }
      ],
      series: renderData.series.map((item, index) => ({
        name: item.name,
        type: index === 1 ? 'line' : 'bar',
        yAxisIndex: index === 1 ? 1 : 0,
        smooth: index === 1,
        data: item.data,
        barMaxWidth: index === 1 ? undefined : 18,
        itemStyle: { color: this.getSeriesColor(index, config) },
        lineStyle: { color: this.getSeriesColor(index, config), width: index === 1 ? 2 : undefined }
      }))
    };
  }

  private makeLineOption(labels: string[], series: PureStorageGraphSeriesApi[], values: number[],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const singleSeriesData = this.getRenderableSingleSeriesData(labels, values);
    const renderData = series?.length ? this.getRenderableSeriesData(labels, series) : {
      labels: singleSeriesData.labels,
      series: [{ name: config.seriesName || 'Value', data: singleSeriesData.values }]
    };
    const lineSeries = renderData.series;
    const legendPosition = config.legend || (lineSeries.length > 1 ? 'top' : 'none');
    return {
      tooltip: this.getPositiveAxisTooltipOption(),
      legend: this.getLegendOption(legendPosition, 14, 6, 9),
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: {
        type: 'category',
        data: renderData.labels,
        axisLabel: {
          color: '#64748b',
          fontSize: config.xFontSize || 8,
          hideOverlap: true,
          interval: 0,
          rotate: config.xRotate || 0,
          width: config.xLabelWidth || 64,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value)
        }
      },
      yAxis: {
        type: 'value',
        name: config.yAxisName,
        min: config.yAxisMin,
        max: config.yAxisMax,
        nameGap: config.yAxisName ? config.yNameGap || 8 : undefined,
        nameTextStyle: config.yAxisName ? this.getAxisNameTextStyle() : undefined,
        axisLabel: { color: '#64748b', fontSize: 9 },
        splitLine: { lineStyle: { color: '#E2E8F0' } }
      },
      series: lineSeries.map((item, index) => ({
        name: item.name,
        type: 'line',
        smooth: true,
        data: item.data,
        symbolSize: 7,
        lineStyle: { color: this.getSeriesColor(index, config), width: 2 },
        itemStyle: { color: this.getSeriesColor(index, config) },
        areaStyle: index === 0 && config.color ? { color: config.color, opacity: 0.08 } : undefined
      }))
    };
  }

  private makePieOption(labels: string[], values: number[], doughnut = false, rose = false,
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const renderData = this.getRenderableSingleSeriesData(labels, values);
    const legendPosition = config.legend || 'none';
    const showPieLabel = config.showPieLabel ?? legendPosition === 'none';
    const valueUnit = config.valueUnit || '';
    const pieData = this.getPieChartData(renderData.labels, renderData.values, config);
    const defaultPieRadius: string | [string | number, string | number] =
      doughnut ? ['35%', '60%'] : rose ? ['10%', '62%'] : '66%';
    const pieRadius = config.pieRadius || defaultPieRadius;
    const pieCenter: [string, string] = legendPosition === 'right'
      ? ['30%', '50%']
      : config.pieCenter || ['50%', '50%'];
    const mainSeries = {
      name: config.seriesName,
      type: 'pie' as const,
      roseType: rose ? 'area' as const : undefined,
      stillShowZeroSum: true,
      radius: pieRadius,
      center: pieCenter,
      avoidLabelOverlap: true,
      minAngle: config.pieMinAngle ?? (rose ? 2 : 1),
      label: {
        show: showPieLabel,
        color: '#64748b',
        fontSize: 8,
        formatter: (params: { name?: string }): string => this.truncateChartLabel(params.name)
      },
      labelLine: { length: 8, length2: 8 },
      data: pieData
    };
    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: unknown): string => this.formatPieTooltip(params, doughnut, valueUnit)
      },
      legend: this.getLegendOption(legendPosition, 14, 8, legendPosition === 'right' ? 8 : 9, renderData.labels),
      series: (rose ? [mainSeries, ...this.getRoseGuideRingSeries(pieCenter, pieRadius)] : [mainSeries]) as EChartsOption['series']
    };
  }

  private makeScatterOption(graph: PureStorageGraphApi, config: PureStorageChartVisualConfig = {}): EChartsOption {
    const points = this.getScatterPoints(graph);
    const dataItems = this.getGraphDataItems(graph);
    const xAxisTitle = config.xAxisName || this.getAxisTitle(graph.x_axis);
    const yAxisTitle = config.yAxisName || this.getAxisTitle(graph.y_axis);
    return {
      tooltip: {
        confine: true,
        formatter: (params: unknown): string => {
          const data = (params as { data?: [number, number, number, string] }).data || [0, 0, 0, ''];
          const dataIndex = (params as { dataIndex?: number }).dataIndex || 0;
          return this.getScatterTooltip(graph.key, data, dataItems[dataIndex], xAxisTitle, yAxisTitle);
        }
      },
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: {
        type: 'value',
        name: xAxisTitle,
        min: config.xAxisMin,
        max: config.xAxisMax,
        nameLocation: 'middle',
        nameGap: 24,
        nameTextStyle: { color: '#64748b', fontSize: 9 },
        axisLabel: { color: '#64748b', fontSize: 9 },
        splitLine: { lineStyle: { color: '#E2E8F0' } }
      },
      yAxis: {
        type: 'value',
        name: yAxisTitle,
        min: config.yAxisMin,
        max: config.yAxisMax,
        nameLocation: 'middle',
        nameGap: 32,
        nameTextStyle: { color: '#64748b', fontSize: 9 },
        axisLabel: { color: '#64748b', fontSize: 9 },
        splitLine: { lineStyle: { color: '#E2E8F0' } }
      },
      series: [{
        type: 'scatter',
        data: points,
        symbolSize: (value: unknown): number => {
          const point = value as [number, number, number, string];
          return Math.max(8, Math.min(42, Math.sqrt(Number(point[2] || point[1] || 0)) * (config.symbolScale || 2.4)));
        },
        itemStyle: { color: config.scatterColor || this.chartColors[0], opacity: 0.68, borderColor: config.scatterColor || this.chartColors[0] }
      }]
    };
  }

  private makePodStatusScatterOption(graph: PureStorageGraphApi, config: PureStorageChartVisualConfig = {}): EChartsOption {
    const data = this.getGraphDataItems(graph);
    const arrayLabels = Array.from(new Set(data.map(item => item.array_name || 'Unknown')));
    const points = data.map((item, index) => {
      const arrayName = item.array_name || 'Unknown';
      const label = item.pod_name || item.name || `POD ${index + 1}`;
      return [
        Math.max(arrayLabels.indexOf(arrayName), 0),
        Number(item.y ?? item.health_score ?? item.value),
        Number(item.size ?? item.days_in_status),
        label,
        arrayName,
        item.status || ''
      ];
    });
    return {
      tooltip: {
        confine: true,
        formatter: (params: unknown): string => {
          const dataPoint = (params as { data?: [number, number, number, string, string, string] }).data
            || [0, 0, 0, '', '', ''];
          return `${dataPoint[3]}<br/>Array: ${dataPoint[4]}<br/>Health: ${dataPoint[1]}<br/>Days: ${dataPoint[2]}`;
        }
      },
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: {
        type: 'category',
        name: config.xAxisName,
        nameLocation: config.xAxisName ? 'middle' : undefined,
        nameGap: config.xAxisName ? config.xNameGap || 24 : undefined,
        nameTextStyle: config.xAxisName ? this.getAxisNameTextStyle(8) : undefined,
        data: arrayLabels,
        axisLabel: {
          color: '#64748b',
          fontSize: 7,
          interval: 0,
          rotate: config.xRotate ?? 15,
          hideOverlap: true,
          width: config.xLabelWidth || 64,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value)
        }
      },
      yAxis: {
        type: 'value',
        name: config.yAxisName,
        min: config.yAxisMin,
        max: config.yAxisMax,
        nameLocation: config.yAxisName ? 'middle' : undefined,
        nameGap: config.yAxisName ? config.yNameGap || 32 : undefined,
        nameTextStyle: config.yAxisName ? this.getAxisNameTextStyle() : undefined,
        axisLabel: { color: '#64748b', fontSize: 8 },
        splitLine: { lineStyle: { color: '#E2E8F0' } }
      },
      series: [{
        type: 'scatter',
        data: points,
        symbolSize: (value: unknown): number => {
          const point = value as [number, number, number, string, string, string];
          return Math.max(10, Math.min(42, Math.sqrt(Number(point[2] || 0)) * (config.symbolScale || 3)));
        },
        itemStyle: {
          opacity: 0.72,
          color: (params: unknown): string => {
            const point = (params as { data?: [number, number, number, string, string, string] }).data;
            const healthScore = Number(point?.[1] || 0);
            if (healthScore >= 90) {
              return this.chartColors[1];
            }
            if (healthScore >= 50) {
              return this.chartColors[2];
            }
            return this.chartColors[3];
          }
        }
      }]
    };
  }

  private makeRadarOption(labels: string[], series: PureStorageGraphSeriesApi[],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const renderData = this.getRenderableSeriesData(labels, series);
    const radarSeries = renderData.series;
    const maxByIndex = renderData.labels.map((_, labelIndex) => {
      const maxValue = Math.max(...radarSeries.map(item => Number(item.data[labelIndex] || 0)), 1);
      return Math.ceil(maxValue * 1.15);
    });
    return {
      tooltip: {
        confine: true,
        formatter: (params: unknown): string => this.formatRadarTooltip(params, renderData.labels)
      },
      legend: this.getLegendOption(config.legend || 'bottom', 14, 8, 7),
      radar: {
        indicator: renderData.labels.map((name, index) => ({ name: this.truncateChartLabel(name), max: maxByIndex[index] })),
        center: config.radarCenter || ['50%', '43%'],
        radius: config.radarRadius || '55%',
        axisName: { color: '#64748b', fontSize: 8 }
      },
      series: [{
        type: 'radar',
        data: radarSeries.map((item, index) => ({
          name: item.name,
          value: item.data,
          lineStyle: { color: this.getSeriesColor(index, config) },
          areaStyle: { color: this.getSeriesColor(index, config), opacity: 0.08 },
          itemStyle: { color: this.getSeriesColor(index, config) }
        }))
      }]
    };
  }

  private makeHeatmapOption(graph: PureStorageGraphApi, labels: string[],
    series: PureStorageGraphSeriesApi[], config: PureStorageChartVisualConfig = {}): EChartsOption {
    const matrix = this.getGraphMatrixData(graph);
    if (graph.x_categories?.length || graph.y_categories?.length || matrix.length) {
      return this.makeMatrixHeatmapOption(graph, matrix, config);
    }
    const metricLabels = (series || []).map(item => item.name);
    const heatmapData: [number, number, number][] = [];
    let maxValue = 0;
    (series || []).forEach((item, metricIndex) => {
      (item.data || []).forEach((value, labelIndex) => {
        const normalizedValue = this.toRenderableNumber(value);
        if (normalizedValue === null) {
          return;
        }
        maxValue = Math.max(maxValue, normalizedValue);
        heatmapData.push([labelIndex, metricIndex, normalizedValue]);
      });
    });
    return {
      tooltip: {
        position: 'top',
        confine: true,
        formatter: (params: unknown): string => {
          const point = (params as { data?: [number, number, number] }).data || [0, 0, 0];
          const label = labels[point[0]] || '';
          const metric = metricLabels[point[1]] || '';
          return `${label}<br/>${metric}: ${point[2]}`;
        }
      },
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: config.xRotate ?? 25,
          interval: 0,
          hideOverlap: true,
          width: config.xLabelWidth || 64,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value),
          color: '#64748b',
          fontSize: config.xFontSize || 7
        },
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: metricLabels,
        axisLabel: {
          color: '#64748b',
          fontSize: config.yFontSize || 7,
          hideOverlap: true,
          width: config.yLabelWidth || 110,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value)
        },
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: maxValue || 1,
        show: false,
        inRange: { color: config.heatmapColors || this.greenHeatmapColors }
      },
      series: [{ type: 'heatmap', data: heatmapData, label: { show: false }, itemStyle: { borderColor: '#ffffff' } }]
    };
  }

  private makeMatrixHeatmapOption(graph: PureStorageGraphApi, matrix: number[][],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const xLabels = graph.x_categories || [];
    const yLabels = graph.y_categories || [];
    const heatmapData: [number, number, number][] = [];
    let maxValue = 0;
    matrix.forEach((row, rowIndex) => {
      (row || []).forEach((value, columnIndex) => {
        const normalizedValue = this.toRenderableNumber(value);
        if (normalizedValue === null) {
          return;
        }
        maxValue = Math.max(maxValue, normalizedValue);
        heatmapData.push([columnIndex, rowIndex, normalizedValue]);
      });
    });
    return {
      tooltip: {
        position: 'top',
        confine: true,
        formatter: (params: unknown): string => {
          const point = (params as { data?: [number, number, number] }).data || [0, 0, 0];
          const xLabel = xLabels[point[0]] || '';
          const yLabel = yLabels[point[1]] || '';
          return `${yLabel}<br/>${xLabel}: ${point[2]}`;
        }
      },
      grid: this.getGrid(config, { left: '2%', right: '2%', top: '2%', bottom: '2%' }),
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLabel: {
          rotate: config.xRotate ?? 25,
          interval: 0,
          hideOverlap: true,
          width: config.xLabelWidth || 64,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value),
          color: '#64748b',
          fontSize: config.xFontSize || 7
        },
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: yLabels,
        axisLabel: {
          color: '#64748b',
          fontSize: config.yFontSize || 7,
          width: config.yLabelWidth || 98,
          overflow: 'truncate' as const,
          formatter: (value: string): string => this.truncateAxisLabel(value)
        },
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: maxValue || 1,
        show: false,
        inRange: { color: config.heatmapColors || this.greenHeatmapColors }
      },
      series: [{ type: 'heatmap', data: heatmapData, label: { show: false }, itemStyle: { borderColor: '#ffffff' } }]
    };
  }

  private makeTreemapOption(graph: PureStorageGraphApi, labels: string[], values: number[],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const valueUnit = this.getGraphValueUnit(graph, config);
    const tooltipValueLabel = config.tooltipValueLabel || 'Value';
    const data = labels.reduce((items: Array<{ name: string; actualValue: number; value: number }>, name, index) => {
      const actualValue = this.toRenderableNumber(values[index]);
      if (actualValue === null) {
        return items;
      }
      items.push({
        name,
        actualValue,
        value: actualValue === 0 ? 0.1 : actualValue
      });
      return items;
    }, []);
    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: unknown): string => {
          const item = params as { data?: { actualValue?: unknown }; name?: string; value?: unknown };
          const value = item.data?.actualValue ?? item.value;
          return `${item.name || ''}<br/>${tooltipValueLabel}: ${value ?? ''}${valueUnit ? ` ${valueUnit}` : ''}`;
        }
      },
      series: [{
        type: 'treemap',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        top: 6,
        bottom: 6,
        left: 6,
        right: 6,
        label: {
          fontSize: 9,
          formatter: (params: unknown): string => {
            const treemapLabelParams = params as { data?: { actualValue?: unknown }; name?: string; value?: unknown };
            const value = treemapLabelParams.data?.actualValue ?? treemapLabelParams.value;
            return `${this.truncateChartLabel(treemapLabelParams.name)}\n${value ?? ''}${valueUnit ? ` ${valueUnit}` : ''}`;
          }
        },
        upperLabel: { show: false },
        itemStyle: { borderColor: '#ffffff', borderWidth: 2, gapWidth: 2 },
        color: config.colors || this.chartColors,
        colorMappingBy: 'value',
        data
      }]
    };
  }

  private makeSunburstOption(graph: PureStorageGraphApi, labels: string[], values: number[],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const renderableData = this.getRenderableSunburstData(this.getGraphDataItems(graph));
    const fallbackData = labels.reduce((items: PureStorageGraphDatumApi[], name, index) => {
      const value = this.toRenderableNumber(values[index]);
      if (value === null) {
        return items;
      }
      items.push({ name, value });
      return items;
    }, []);
    const data = this.getSunburstChartData(renderableData.length ? renderableData : fallbackData);
    const valueUnit = this.getGraphValueUnit(graph, config);
    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: unknown): string => {
          const item = params as { data?: { actualValue?: unknown }; name?: string; value?: unknown };
          const value = item.data?.actualValue ?? item.value;
          return `${item.name || ''}: ${value ?? ''}${valueUnit ? ` ${valueUnit}` : ''}`;
        }
      },
      series: [{
        type: 'sunburst',
        radius: config.pieRadius || [0, '90%'],
        center: config.pieCenter || ['50%', '50%'],
        sort: undefined,
        label: {
          fontSize: 7,
          minAngle: 8,
          formatter: (params: { name?: string }): string => this.truncateChartLabel(params.name)
        },
        itemStyle: { borderColor: '#ffffff', borderWidth: 1 },
        data
      }]
    };
  }

  private makeParallelCoordinatesOption(graph: PureStorageGraphApi,
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const dimensions = graph.dimensions || [];
    const matrix = this.getGraphMatrixData(graph)
      .filter(row => (row || []).some(value => this.isRenderableValue(value)));
    return {
      tooltip: {
        confine: true,
        formatter: (params: unknown): string => this.formatParallelCoordinatesTooltip(params, dimensions)
      },
      parallelAxis: dimensions.map((name, index) => ({
        dim: index,
        name: this.truncateChartLabel(name),
        type: 'value',
        nameGap: 12,
        axisLabel: { color: '#64748b', fontSize: 7 },
        nameTextStyle: { color: '#64748b', fontSize: 8 }
      })),
      parallel: {
        left: '8%',
        right: '10%',
        top: '12%',
        bottom: '12%',
        axisExpandable: false
      },
      series: [{
        type: 'parallel',
        lineStyle: { width: 1.5, opacity: 0.7, color: config.color || this.chartColors[0] },
        data: matrix
      }]
    };
  }

  private makeSankeyOption(graph: PureStorageGraphApi, labels: string[], values: number[],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const data = graph.nodes?.length
      ? this.getUniqueSankeyNodes(graph.nodes)
      : [{ name: 'Pure Storage' }].concat(labels.map(name => ({ name })));
    const rawLinks = graph.links?.length
      ? this.getValidSankeyLinks(data, graph.links)
      : labels.map((target, index) => ({ source: 'Pure Storage', target, value: values[index] }))
        .filter(link => this.isRenderableValue(link.value));
    const links = rawLinks.map(link => {
      const actualValue = Number(link.value || 0);
      return {
        ...link,
        actualValue,
        value: actualValue === 0 ? 0.1 : actualValue
      };
    });
    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: unknown): string => {
          const item = params as {
            data?: { actualValue?: unknown; source?: string; target?: string; value?: unknown };
            name?: string;
          };
          if (item.data?.source && item.data?.target) {
            return `${item.data.source} -> ${item.data.target}: ${item.data.actualValue ?? item.data.value ?? ''}`;
          }
          return item.name || '';
        }
      },
      series: [{
        type: 'sankey',
        emphasis: { focus: 'adjacency' },
        left: 8,
        right: '15%',
        top: 8,
        bottom: 8,
        label: {
          color: '#334155',
          fontSize: config.labelFontSize || 8,
          formatter: (params: { name?: string }): string => this.truncateChartLabel(params.name)
        },
        data,
        links,
        lineStyle: { color: 'gradient', curveness: 0.5 },
        itemStyle: { color: config.color || this.blue, borderColor: '#ffffff' }
      }]
    };
  }

  private getUniqueSankeyNodes(nodes: PureStorageGraphNodeApi[]): PureStorageGraphNodeApi[] {
    const seen = new Set<string>();
    return (nodes || []).filter(node => {
      const name = String(node.name || '').trim();
      if (!name || seen.has(name)) {
        return false;
      }
      seen.add(name);
      return true;
    });
  }

  private getValidSankeyLinks(nodes: PureStorageGraphNodeApi[],
    links: PureStorageGraphLinkApi[]): PureStorageGraphLinkApi[] {
    const nodeNames = new Set((nodes || []).map(node => node.name));
    return (links || []).filter(link => {
      const source = String(link.source || '').trim();
      const target = String(link.target || '').trim();
      return !!source && !!target && source !== target && nodeNames.has(source) && nodeNames.has(target)
        && this.isRenderableValue(link.value);
    });
  }

  private makeFunnelOption(labels: string[], values: number[],
    config: PureStorageChartVisualConfig = {}): EChartsOption {
    const funnelData = labels.reduce((items: Array<{ name: string; actualValue: number; value: number }>, name, index) => {
      const actualValue = this.toRenderableNumber(values[index]);
      if (actualValue === null) {
        return items;
      }
      items.push({
        name,
        actualValue,
        value: actualValue === 0 ? 0.1 : actualValue
      });
      return items;
    }, [])
      .sort((left, right) => right.actualValue - left.actualValue);
    const maxValue = Math.max(...funnelData.map(item => item.value), 0);
    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: unknown): string => {
          const item = params as { data?: { actualValue?: unknown }; name?: string; value?: unknown };
          return `${item.name || ''}: ${item.data?.actualValue ?? item.value ?? ''} snapshots`;
        }
      },
      series: [{
        name: config.seriesName,
        type: 'funnel',
        left: '6%',
        right: '6%',
        top: '4%',
        bottom: '4%',
        width: '88%',
        min: 0,
        max: maxValue,
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          color: '#ffffff',
          fontSize: 8,
          formatter: (params: { name?: string }): string => this.truncateChartLabel(params.name)
        },
        itemStyle: { borderColor: '#ffffff', borderWidth: 1 },
        data: funnelData.map((item, index) => ({
          name: item.name,
          value: item.value,
          actualValue: item.actualValue,
          itemStyle: { color: this.getSeriesColor(index, config) }
        }))
      }]
    };
  }

  private getChartVisualConfig(graph: PureStorageGraphApi, chartType: PureStorageChartType): PureStorageChartVisualConfig {
    return this.chartVisualConfigByKeyAndType[`${graph.key}:${chartType}`]
      || this.chartVisualConfigByKey[graph.key]
      || {};
  }

  private getGrid(config: PureStorageChartVisualConfig, fallback: PureStorageChartGridConfig): PureStorageChartGridConfig {
    return {
      ...fallback,
      ...config.grid,
      containLabel: true
    };
  }

  private getAxisTitle(axis?: PureStorageGraphAxisApi): string | undefined {
    if (!axis?.name) {
      return undefined;
    }
    return axis.unit ? `${axis.name} (${axis.unit})` : axis.name;
  }

  private getAxisNameTextStyle(fontSize = 9): { color: string; fontSize: number } {
    return { color: '#64748b', fontSize };
  }

  private getPositiveAxisTooltipOption(axisPointer?: TooltipComponentOption['axisPointer']): TooltipComponentOption {
    return {
      trigger: 'axis',
      axisPointer,
      confine: true,
      formatter: (params: unknown): string => this.formatPositiveAxisTooltip(params)
    };
  }

  private formatPositiveAxisTooltip(params: unknown): string {
    const items = Array.isArray(params) ? params as Array<Record<string, unknown>> : [params as Record<string, unknown>];
    const firstItem = items[0] || {};
    const header = String(firstItem.axisValue || firstItem.name || firstItem.axisValueLabel || '');
    const rows = items.filter(item => this.isRenderableValue(this.getTooltipParamValue(item)))
      .map(item => {
        const label = String(item.seriesName || item.name || '');
        const value = this.getTooltipParamValue(item);
        return `${item.marker || ''}${label}: ${value}`;
      });
    return [header].concat(rows).filter(item => !!item).join('<br/>');
  }

  private formatRadarTooltip(params: unknown, labels: string[]): string {
    const item = params as { name?: string; value?: unknown };
    const values = Array.isArray(item.value) ? item.value : [];
    const rows = (labels || []).map((label, index) => {
      if (values[index] === undefined || values[index] === null) {
        return '';
      }
      return `${label}: ${this.tooltipValue(values[index])}`;
    }).filter(row => !!row);
    return [item.name || ''].concat(rows).filter(row => !!row).join('<br/>');
  }

  private formatParallelCoordinatesTooltip(params: unknown, dimensions: string[]): string {
    const item = params as { value?: unknown };
    const values = Array.isArray(item.value) ? item.value : [];
    return (dimensions || []).map((dimension, index) => {
      if (values[index] === undefined || values[index] === null) {
        return '';
      }
      return `${dimension}: ${this.tooltipValue(values[index])}`;
    }).filter(row => !!row).join('<br/>');
  }

  private getTooltipParamValue(item: Record<string, unknown>): unknown {
    const value = item.value;
    if (Array.isArray(value)) {
      return value.find(entry => this.isRenderableValue(entry));
    }
    return value;
  }

  private truncateAxisLabel(value: unknown): string {
    return this.truncateText(value, this.chartLabelMaxLength);
  }

  private truncateChartLabel(value: unknown): string {
    return this.truncateText(value, this.chartLabelMaxLength);
  }

  private truncateText(value: unknown, maxLength: number): string {
    const text = value === null || value === undefined ? '' : String(value);
    if (text.length <= maxLength) {
      return text;
    }
    if (maxLength <= 3) {
      return text.slice(0, maxLength);
    }
    return `${text.slice(0, maxLength - 3)}...`;
  }

  private getPieChartData(labels: string[], values: number[],
    config: PureStorageChartVisualConfig): PureStoragePieChartDatum[] {
    const actualValues = (values || []).map(value => this.toRenderableNumber(value) || 0);
    const maxValue = Math.max(...actualValues, 0);
    const totalValue = actualValues.reduce((total, value) => total + value, 0);
    const minDisplayValue = this.getPieMinimumDisplayValue(maxValue, config);
    return (labels || []).map((name, index) => {
      const actualValue = actualValues[index] || 0;
      const displayValue = actualValue > minDisplayValue ? actualValue : minDisplayValue;
      return {
        name,
        value: displayValue,
        actualValue,
        actualPercent: totalValue ? (actualValue / totalValue) * 100 : 0,
        itemStyle: {
          color: this.getSeriesColor(index, config),
          borderColor: config.pieBorderColor || '#ffffff',
          borderWidth: config.pieBorderWidth ?? 1
        }
      };
    });
  }

  private getPieMinimumDisplayValue(maxValue: number, config: PureStorageChartVisualConfig): number {
    if (maxValue <= 0) {
      return 1;
    }
    return Math.max(maxValue * (config.pieMinValueRatio ?? 0.018), 0.1);
  }

  private formatPieTooltip(params: unknown, doughnut: boolean, valueUnit: string): string {
    const item = params as {
      seriesName?: string;
      name?: string;
      value?: unknown;
      data?: { actualValue?: unknown; actualPercent?: number };
    };
    const value = item.data?.actualValue ?? item.value;
    const unit = valueUnit ? ` ${valueUnit}` : '';
    if (doughnut) {
      const percent = this.formatTooltipNumber(item.data?.actualPercent);
      return `${item.seriesName || ''}<br/>${item.name || ''}: ${this.tooltipValue(value)}${unit} (${percent}%)`;
    }
    return `${item.name || ''}: ${this.tooltipValue(value)}${unit}`;
  }

  private getRoseGuideRingSeries(center: [string, string],
    radius: string | [string | number, string | number]): Array<Record<string, unknown>> {
    const radii = this.getRoseGuideRingRadii(radius);
    return radii.map(ringRadius => ({
      type: 'pie',
      silent: true,
      animation: false,
      z: 4,
      center,
      radius: [`${ringRadius}%`, `${ringRadius + 0.35}%`],
      label: { show: false },
      tooltip: { show: false },
      data: [{
        value: 1,
        name: '',
        itemStyle: {
          color: 'rgba(255,255,255,0)',
          borderColor: 'rgba(226,232,240,0.85)',
          borderWidth: 1
        }
      }]
    }));
  }

  private getRoseGuideRingRadii(radius: string | [string | number, string | number]): number[] {
    const innerRadius = Array.isArray(radius) ? this.getRadiusPercent(radius[0], 10) : 10;
    const outerRadius = Array.isArray(radius)
      ? this.getRadiusPercent(radius[1], 62)
      : this.getRadiusPercent(radius, 62);
    const extendedOuterRadius = outerRadius + 10;
    const step = Math.max((extendedOuterRadius - innerRadius) / 4, 6);
    return [innerRadius + step, innerRadius + (step * 2), innerRadius + (step * 3)]
      .filter(ringRadius => ringRadius < extendedOuterRadius);
  }

  private getRadiusPercent(radius: string | number, fallback: number): number {
    if (typeof radius === 'number') {
      return radius;
    }
    const value = Number(String(radius).replace('%', ''));
    return Number.isFinite(value) ? value : fallback;
  }

  private getLegendTooltipText(params: unknown): string {
    if (typeof params === 'string') {
      return params;
    }
    const legendParams = params as { name?: string };
    return legendParams?.name || '';
  }

  private getLegendOption(position: PureStorageChartLegendPosition, itemWidth: number, itemHeight: number,
    fontSize: number, labels: string[] = []): LegendComponentOption | LegendComponentOption[] | undefined {
    if (position === 'none') {
      return undefined;
    }
    const baseTextStyle = { color: '#64748b', fontSize };
    const base = {
      type: 'scroll' as const,
      selectedMode: false,
      data: labels.length ? labels : undefined,
      itemWidth,
      itemHeight,
      textStyle: baseTextStyle
    } as LegendComponentOption;
    if (position === 'right') {
      if (this.shouldWrapRightLegend(labels)) {
        return this.getWrappedRightLegendColumns(base, labels);
      }
      return {
        ...base,
        orient: 'vertical' as const,
        right: 0,
        top: 'middle',
        width: '40%',
        textStyle: { ...baseTextStyle, width: 120, overflow: 'truncate' as const },
        formatter: (name: string): string => this.truncateLegendLabel(name, 16),
        tooltip: {
          show: true,
          formatter: (params: unknown): string => this.getLegendTooltipText(params)
        }
      };
    }
    if (position === 'bottom') {
      return {
        ...base,
        bottom: 0,
        left: 'center'
      };
    }
    return {
      ...base,
      top: 0,
      left: 'center'
    };
  }

  private getWrappedRightLegendColumns(base: LegendComponentOption, labels: string[]): LegendComponentOption[] {
    const splitIndex = Math.ceil(labels.length / 2);
    return [labels.slice(0, splitIndex), labels.slice(splitIndex)].filter(columnLabels => columnLabels.length)
      .map((columnLabels, index) => ({
        ...base,
        type: 'plain' as const,
        orient: 'vertical' as const,
        data: columnLabels,
        right: index === 0 ? '20%' : 0,
        top: 'middle',
        width: '19%',
        height: 92,
        itemGap: 4,
        formatter: (name: string): string => this.truncateLegendLabel(name, 10),
        tooltip: {
          show: true,
          formatter: (params: unknown): string => this.getLegendTooltipText(params)
        }
      }));
  }

  private shouldWrapRightLegend(labels: string[]): boolean {
    const safeLabels = labels || [];
    return !!safeLabels.length && safeLabels.length <= 10 && safeLabels.every(label => String(label || '').length <= 10);
  }

  private truncateLegendLabel(value: unknown, maxLength: number): string {
    const text = value === null || value === undefined ? '' : String(value);
    return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
  }

  private getSeriesColor(index: number, config: PureStorageChartVisualConfig): string {
    if (config.color && index === 0) {
      return config.color;
    }
    const colors = config.seriesColors || config.colors || this.chartColors;
    return colors[index % colors.length];
  }

  private isRenderableValue(value: unknown): boolean {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return false;
    }
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0;
  }

  private toRenderableNumber(value: unknown): number | null {
    if (!this.isRenderableValue(value)) {
      return null;
    }
    return Number(value);
  }

  private getRenderableSingleSeriesData(labels: string[], values: number[]): { labels: string[]; values: number[] } {
    const renderLabels: string[] = [];
    const renderValues: number[] = [];
    (values || []).forEach((value, index) => {
      if (!this.isRenderableValue(value)) {
        return;
      }
      renderLabels.push(labels[index] || `Item ${index + 1}`);
      renderValues.push(value);
    });
    return { labels: renderLabels, values: renderValues };
  }

  private getRenderableSeriesData(labels: string[],
    series: PureStorageGraphSeriesApi[]): { labels: string[]; series: PureStorageRenderableGraphSeries[] } {
    const sourceSeries = series || [];
    const dataLength = Math.max(labels.length, ...sourceSeries.map(item => item.data?.length || 0), 0);
    const renderIndexes = Array.from({ length: dataLength }, (_, index) => index)
      .filter(index => sourceSeries.some(item => this.isRenderableValue(item.data?.[index])));
    const renderLabels = renderIndexes.map(index => labels[index] || `Item ${index + 1}`);
    const renderSeries = sourceSeries.map(item => ({
      ...item,
      data: renderIndexes.map(index => {
        const value = this.toRenderableNumber(item.data?.[index]);
        return value === null ? null : value;
      })
    })).filter(item => item.data.some(value => this.isRenderableValue(value)));
    return { labels: renderLabels, series: renderSeries };
  }

  private getRenderableSunburstData(data: PureStorageGraphDatumApi[]): PureStorageGraphDatumApi[] {
    return (data || []).reduce((items: PureStorageGraphDatumApi[], item) => {
      const children = this.getRenderableSunburstData(item.children || []);
      if (!this.isRenderableValue(item.value) && !children.length) {
        return items;
      }
      items.push({
        ...item,
        children: children.length ? children : undefined
      });
      return items;
    }, []);
  }

  private getSunburstChartData(data: PureStorageGraphDatumApi[]): PureStorageSunburstChartDatum[] {
    return (data || []).map(item => {
      const actualValue = this.toRenderableNumber(item.value);
      const children = this.getSunburstChartData(item.children || []);
      const chartItem: PureStorageSunburstChartDatum = {
        ...item,
        children: children.length ? children : undefined
      };
      if (actualValue !== null) {
        chartItem.actualValue = actualValue;
        chartItem.value = actualValue === 0 ? 0.1 : actualValue;
      }
      return chartItem;
    });
  }

  private hasRenderableMatrixData(graph: PureStorageGraphApi): boolean {
    return this.getGraphMatrixData(graph).some(row => (row || []).some(value => this.isRenderableValue(value)));
  }

  private getGraphValueUnit(graph: PureStorageGraphApi, config: PureStorageChartVisualConfig): string {
    if (config.valueUnit !== undefined) {
      return config.valueUnit;
    }
    const dataUnit = this.getGraphDataItems(graph).find(item => !!item.unit)?.unit;
    if (dataUnit) {
      return dataUnit;
    }
    return graph.series?.find(item => !!item.unit)?.unit || '';
  }

  private getGraphLabels(graph: PureStorageGraphApi): string[] {
    if (graph.categories?.length) {
      return [...graph.categories];
    }
    const data = this.getGraphDataItems(graph);
    if (data.length) {
      return data.map(item => item.name || item.pod_name || item.array_name || 'Unknown');
    }
    const seriesLength = Math.max(...(graph.series || []).map(item => item.data.length), 0);
    return Array.from({ length: seriesLength }, (_, index) => `Item ${index + 1}`);
  }

  private getGraphValues(graph: PureStorageGraphApi): number[] {
    const data = this.getGraphDataItems(graph);
    if (data.length) {
      return data.map(item => Number(item.value ?? item.health_score ?? item.connected_snapshots));
    }
    return (graph.series?.[0]?.data || []).map(value => Number(value));
  }

  private getScatterPoints(graph: PureStorageGraphApi): [number, number, number, string][] {
    const data = this.getGraphDataItems(graph);
    if (data.length) {
      return data.map((item, index) => {
        const label = item.name || item.pod_name || item.array_name || `Item ${index + 1}`;
        const x = Number(item.x ?? item.schedule_hours ?? item.days_in_status ?? index + 1);
        const y = Number(item.y ?? item.connected_snapshots ?? item.health_score ?? item.value ?? 0);
        const size = this.getScatterSymbolValue(graph.key, item, y);
        return [x, y, size, label];
      });
    }
    const labels = this.getGraphLabels(graph);
    const values = this.getGraphValues(graph);
    const renderData = this.getRenderableSingleSeriesData(labels, values);
    return renderData.values.map((value, index) => [index + 1, value, value, renderData.labels[index] || `Item ${index + 1}`]);
  }

  private getScatterSymbolValue(key: string, item: PureStorageGraphDatumApi, defaultValue: number): number {
    if (key === 'schedule_distribution') {
      return Number(item.retention_days ?? item.size ?? item.value ?? defaultValue);
    }
    if (key === 'snapshot_capacity_data_reduction') {
      return Number(item.retention_days ?? item.size ?? item.value ?? defaultValue);
    }
    return Number(item.size ?? item.value ?? defaultValue);
  }

  private getScatterTooltip(key: string, point: [number, number, number, string],
    item?: PureStorageGraphDatumApi, xAxisTitle?: string, yAxisTitle?: string): string {
    const label = point[3] || item?.name || item?.pod_name || item?.array_name || '';
    if (key === 'volume_snapshot_analysis') {
      return `${label}<br/>Volume: ${this.tooltipValue(point[0])} GB<br/>Snapshots: ${this.tooltipValue(point[1])} GB`
        + `<br/>Total: ${this.tooltipValue(item?.value ?? item?.size ?? point[2])} GB`;
    }
    if (key === 'host_group_capacity_data_reduction') {
      return `${label}<br/>Size: ${this.tooltipValue(point[0])} GB<br/>Data Reduction: ${this.tooltipValue(point[1])}`
        + `<br/>Total: ${this.tooltipValue(item?.value ?? item?.size ?? point[2])} GB`;
    }
    if (key === 'snapshot_capacity_data_reduction') {
      return `${label}<br/>Size: ${this.tooltipValue(point[0])} GB<br/>Data Reduction: ${this.tooltipValue(point[1])}`
        + `<br/>Retention: ${this.tooltipValue(item?.retention_days)} days`;
    }
    if (key === 'schedule_distribution') {
      return `${label}<br/>Schedule: Every ${this.tooltipValue(item?.schedule_hours ?? point[0])}h`
        + `<br/>Snapshots: ${this.tooltipValue(item?.connected_snapshots ?? point[1])}`
        + `<br/>Retention: ${this.tooltipValue(item?.retention_days)} days`;
    }
    return `${label}<br/>${xAxisTitle || 'X'}: ${this.tooltipValue(point[0])}`
      + `<br/>${yAxisTitle || 'Y'}: ${this.tooltipValue(point[1])}`;
  }

  private tooltipValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    if (typeof value === 'number') {
      return this.formatTooltipNumber(value);
    }
    return String(value);
  }

  private normalizeChartType(chartType: string): PureStorageChartType {
    const normalized = String(chartType || '').toLowerCase();
    const chartTypes: Record<string, PureStorageChartType> = {
      bar: 'bar',
      horizontal_bar: 'horizontalBar',
      grouped_bar: 'groupedBar',
      stacked_bar: 'stackedBar',
      bar_line: 'mixedBarLine',
      line: 'line',
      pie: 'pie',
      doughnut: 'doughnut',
      donut: 'doughnut',
      polar_area: 'polarArea',
      scatter: 'scatter',
      bubble: 'scatter',
      treemap: 'treemap',
      sankey: 'sankey',
      funnel: 'funnel',
      lollipop: 'lollipop',
      radar: 'radar',
      heatmap: 'heatmap',
      sunburst: 'sunburst',
      parallel_coordinates: 'parallelCoordinates',
      parallelcoordinates: 'parallelCoordinates'
    };
    return chartTypes[normalized] || 'bar';
  }

  private getLollipopColor(key: string): string {
    if (key === 'snapshot_count') {
      return this.chartColors[3];
    }
    if (key === 'pod_health') {
      return this.chartColors[1];
    }
    return this.chartColors[0];
  }

  private hasGraphData(graph: PureStorageGraphApi): boolean {
    if (this.normalizeChartType(graph.chart_type) === 'sankey' && (graph.nodes?.length || graph.links?.length)) {
      const nodes = this.getUniqueSankeyNodes(graph.nodes || []);
      return !!this.getValidSankeyLinks(nodes, graph.links || []).length;
    }
    return !!(this.getGraphDataItems(graph).length || this.hasRenderableMatrixData(graph)
      || graph.series?.some(item => item.data?.some(value => this.isRenderableValue(value))));
  }

  private getGraphDataItems(graph: PureStorageGraphApi): PureStorageGraphDatumApi[] {
    const data = graph.data;
    if (!data?.length || this.isMatrixData(data)) {
      return [];
    }
    return data.filter(item => this.hasRenderableDataItem(graph.key, item));
  }

  private hasRenderableDataItem(key: string, item: PureStorageGraphDatumApi): boolean {
    if (key === 'volume_snapshot_analysis' || key === 'host_group_capacity_data_reduction'
      || key === 'snapshot_capacity_data_reduction') {
      return this.isRenderableValue(item.x) && this.isRenderableValue(item.y);
    }
    if (key === 'schedule_distribution') {
      return this.isRenderableValue(item.connected_snapshots ?? item.y ?? item.value);
    }
    if (key === 'pod_status_scatter') {
      return this.isRenderableValue(item.health_score ?? item.y ?? item.value);
    }
    return this.isRenderableValue(item.value ?? item.health_score ?? item.connected_snapshots ?? item.y ?? item.x
      ?? item.size) || !!this.getRenderableSunburstData(item.children || []).length;
  }

  private getGraphMatrixData(graph: PureStorageGraphApi): number[][] {
    const data = graph.data;
    return this.isMatrixData(data) ? data : [];
  }

  private isMatrixData(data?: PureStorageGraphDataApi): data is number[][] {
    return !!data?.length && Array.isArray(data[0]);
  }

  private getChartSpan(chartType: PureStorageChartType, index: number, graphCount: number): number {
    if (graphCount === 2) {
      return 6;
    }
    if (graphCount === 3 || graphCount === 6) {
      return 4;
    }
    if (graphCount === 4 || graphCount === 8) {
      return 3;
    }
    if (graphCount === 7) {
      return index < 4 ? 3 : 4;
    }
    return chartType === 'treemap' || chartType === 'sankey' || chartType === 'sunburst'
      || chartType === 'parallelCoordinates' ? 6 : 4;
  }

  private convertArraySummary(summary?: PureStorageArraySummaryApi): PureStorageMetricViewModel[] {
    return [
      this.metric('Total Arrays', this.formatNumber(summary?.total_arrays), 'primary'),
      this.metric('Total Capacity', summary?.total_capacity ? this.formatCapacity(summary.total_capacity) :
        this.formatCapacityValue(summary?.total_capacity_pb, 'PB'), 'primary'),
      this.metric('Used Capacity', summary?.used_capacity ? this.formatCapacity(summary.used_capacity) :
        this.formatCapacityValue(summary?.used_capacity_pb, 'PB'), 'primary'),
      this.metric('Avg Read Latency', this.formatWithUnit(summary?.average_read_latency_ms, 'ms'), 'success'),
      this.metric('Avg Write Latency', this.formatWithUnit(summary?.average_write_latency_ms, 'ms'), 'success'),
      this.metric('Total IOPS', this.formatNumber(summary?.total_iops), 'primary')
    ];
  }

  private convertHostSummary(summary?: PureStorageHostSummaryApi): PureStorageMetricViewModel[] {
    return [
      this.metric('Total Hosts', this.formatNumber(summary?.total_hosts), 'primary'),
      this.metric('Host Groups', this.formatNumber(summary?.host_groups), 'primary'),
      this.metric('Average Latency', this.formatWithUnit(summary?.average_latency_ms, 'ms'), 'success'),
      this.metric('Total IOPS Per Host', this.formatNumber(summary?.total_iops_per_host), 'primary'),
      this.metric('Throughput Per Host', this.formatWithUnit(summary?.throughput_per_host_mbps, 'MB/s'), 'primary'),
      this.metric('Volumes Mapped Per Host', this.formatNumber(summary?.average_volumes_mapped_per_host), 'primary')
    ];
  }

  private convertVolumeSummary(summary?: PureStorageVolumeSummaryApi): PureStorageMetricViewModel[] {
    return [
      this.metric('Total Volumes', this.formatNumber(summary?.total_volumes), 'primary'),
      this.metric('Provisioned Size', this.formatCapacityValue(summary?.provisioned_size_pb, 'PB'), 'primary'),
      this.metric('Used Capacity', this.formatCapacityValue(summary?.used_capacity_tb, 'TB'), 'primary'),
      this.metric('Average Latency', this.formatWithUnit(summary?.average_latency_ms, 'ms'), 'success'),
      this.metric('SAN Latency', this.formatWithUnit(summary?.san_latency_ms, 'ms'), 'success')
    ];
  }

  private convertCapacityPlanningSummary(summary?: PureStorageCapacityPlanningSummaryApi): PureStorageMetricViewModel[] {
    const metrics = [
      this.metric('Used Capacity', this.formatCapacityValue(summary?.used_capacity_tb, 'TB'), 'primary'),
      this.metric('Free Capacity', this.formatCapacityValue(summary?.free_capacity_tb, 'TB'), 'primary'),
      this.metric('Effective Capacity', this.formatCapacityValue(summary?.effective_capacity_pb, 'PB'), 'primary')
    ];
    if (!summary || summary.monthly_growth_tb !== undefined) {
      metrics.push(this.metric('Monthly Growth', this.formatCapacityValue(summary?.monthly_growth_tb, 'TB'), 'warning'));
    }
    if (!summary || summary.data_reduction_ratio !== undefined) {
      metrics.push(this.metric('Data Reduction Ratio', this.formatRatio(summary?.data_reduction_ratio), 'success'));
    }
    if (!summary || summary.thin_provisioning_savings_pb !== undefined) {
      metrics.push(this.metric('Thin Provisioning Savings',
        this.formatCapacityValue(summary?.thin_provisioning_savings_pb, 'PB'), 'success'));
    }
    if (!summary || summary.days_until_full !== undefined) {
      metrics.push(this.metric('Days Until Full', this.formatNumber(summary?.days_until_full), 'warning'));
    }
    return metrics;
  }

  private convertHardwareSummary(summary?: PureStorageHardwareSummaryApi): PureStorageMetricViewModel[] {
    const metrics = [
      this.metric('Total Network Ports', this.formatNumber(summary?.total_network_ports), 'primary'),
      this.metric('Manufacturer', summary?.manufacturer || 'N/A', 'primary')
    ];
    if (!summary || summary.os_version) {
      metrics.push(this.metric('OS Version', summary?.os_version || 'N/A', 'primary'));
    }
    if (!summary || summary.total_disk_space_pb !== undefined) {
      metrics.push(this.metric('Total Disk Space', this.formatCapacityValue(summary?.total_disk_space_pb, 'PB'), 'primary'));
    }
    return metrics;
  }

  private convertActiveClusterSummary(summary?: PureStorageActiveClusterSummaryApi): PureStorageMetricViewModel[] {
    return [
      this.metric('Total PODs', this.formatNumber(summary?.total_pods), 'primary'),
      this.metric('Online PODs', this.formatNumber(summary?.online_pods), 'success'),
      this.metric('Synchronizing PODs', this.formatNumber(summary?.synchronizing_pods), 'warning'),
      this.metric('Alerting/Offline PODs', this.formatNumber(summary?.alerting_offline_pods),
        summary?.alerting_offline_pods ? 'danger' : 'success')
    ];
  }

  private convertPerformanceSummary(summary?: PureStoragePerformanceSummaryApi): PureStorageMetricViewModel[] {
    return [
      this.metric('Total IOPS', this.formatWithUnit(summary?.total_iops_k, 'K'), 'primary'),
      this.metric('Read IOPS', this.formatWithUnit(summary?.read_iops_k, 'K'), 'primary'),
      this.metric('Write IOPS', this.formatWithUnit(summary?.write_iops_k, 'K'), 'primary'),
      this.metric('Read Throughput', this.formatWithUnit(summary?.read_throughput_gbps, 'GB/s'), 'success'),
      this.metric('Write Throughput', this.formatWithUnit(summary?.write_throughput_gbps, 'GB/s'), 'success'),
      this.metric('Bandwidth', this.formatWithUnit(summary?.bandwidth_gbps, 'GB/s'), 'primary'),
      this.metric('Read Latency', this.formatWithUnit(summary?.read_latency_ms, 'ms'), 'success'),
      this.metric('Write Latency', this.formatWithUnit(summary?.write_latency_ms, 'ms'), 'success'),
      this.metric('Queue Depth', this.formatNumber(summary?.queue_depth), 'primary')
    ];
  }

  private convertAlertsSummary(summary?: PureStorageAlertsSummaryApi): PureStorageMetricViewModel[] {
    const metrics = [
      this.metric('Total Alerts', this.formatNumber(summary?.total_alerts), 'primary'),
      this.metric('Critical', this.formatNumber(summary?.critical), summary?.critical ? 'danger' : 'success'),
      this.metric('Warning', this.formatNumber(summary?.warning), summary?.warning ? 'warning' : 'success'),
      this.metric('Information', this.formatNumber(summary?.information), 'primary')
    ];
    if (!summary || summary.active !== undefined) {
      metrics.push(this.metric('Active', this.formatNumber(summary?.active), summary?.active ? 'danger' : 'success'));
    }
    if (!summary || summary.resolved !== undefined) {
      metrics.push(this.metric('Resolved', this.formatNumber(summary?.resolved), 'success'));
    }
    return metrics;
  }

  private formatCell(value: unknown, format: PureStorageColumnFormat = 'text'): string {
    if (format === 'ratio') {
      return this.formatRatio(value as PureStorageRatioValue | undefined | null);
    }
    if (value === null || value === undefined || value === '') {
      return '--';
    }
    switch (format) {
      case 'number':
        return typeof value === 'number' ? this.formatNumber(value) : String(value);
      case 'capacity':
        return typeof value === 'number' ? this.formatNumber(value) : String(value);
      case 'percent':
        return typeof value === 'number' ? this.formatPercent(value) : String(value);
      case 'datetime':
        return this.formatDateTime(String(value));
      case 'date':
        return this.formatDate(String(value));
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'list':
        return Array.isArray(value) ? value.join(', ') || '--' : String(value);
      default:
        return String(value);
    }
  }

  private metric(label: string, value: string, tone?: PureStorageTone,
    trend?: PureStorageAvailabilityTrendViewModel): PureStorageMetricViewModel {
    return new PureStorageMetricViewModel({ label, value, tone, trend });
  }

  private convertAvailabilityTrend(trend?: PureStorageAvailabilityTrendApi): PureStorageAvailabilityTrendViewModel {
    return {
      up: Number(trend?.up || 0),
      down: Number(trend?.down || 0),
      unknown: Number(trend?.unknown || 0)
    };
  }

  private formatCapacity(value?: PureStorageApiCapacityValue): string {
    return value ? `${this.formatNumber(value.value)} ${value.unit}` : 'N/A';
  }

  private formatCapacityValue(value: number | undefined | null, unit: string): string {
    return value === undefined || value === null ? 'N/A' : `${this.formatNumber(value)} ${unit}`;
  }

  private formatWithUnit(value: number | undefined | null, unit: string): string {
    return value === undefined || value === null ? 'N/A' : `${this.formatNumber(value)} ${unit}`;
  }

  private formatPercent(value: number | undefined | null, digits = 2): string {
    return value === undefined || value === null ? 'N/A' : `${this.formatNumber(value, digits)}%`;
  }

  private formatRatio(value: PureStorageRatioValue | undefined | null): string {
    if (value === undefined || value === null || value === '') {
      return 'N/A';
    }
    if (typeof value === 'string') {
      return value.trim() || 'N/A';
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? this.formatNumber(value, 2) : 'N/A';
    }
    return 'N/A';
  }

  private formatMttrMinutes(value: number | undefined | null): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return `${this.formatNumber(value)} min${value === 1 ? '' : 's'}`;
  }

  private formatNumber(value: number | undefined | null, maximumFractionDigits = 2): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return Number(value).toLocaleString(undefined, { maximumFractionDigits });
  }

  private formatTooltipNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  private formatDateTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  private formatDateParam(value: string | Date): string {
    const date = moment(value);
    return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
  }
}
