import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NETAPP_STORAGE_AGGREGATE_CAPACITY_UTILIZATION_CHART_ENDPOINT,
  NETAPP_STORAGE_AGGREGATE_CAPACITY_UTILIZATION_TABLE_ENDPOINT,
  NETAPP_STORAGE_AUTO_REMEDIATION_ENDPOINT,
  NETAPP_STORAGE_CAPACITY_PLANNING_CHART_ENDPOINT,
  NETAPP_STORAGE_CAPACITY_PLANNING_TABLE_ENDPOINT,
  NETAPP_STORAGE_CLUSTER_PERFORMANCE_CHART_ENDPOINT,
  NETAPP_STORAGE_CLUSTER_PERFORMANCE_TABLE_ENDPOINT,
  NETAPP_STORAGE_CPU_USAGE_STATIC,
  NETAPP_STORAGE_LUN_INVENTORY_CAPACITY_CHART_ENDPOINT,
  NETAPP_STORAGE_LUN_INVENTORY_CAPACITY_TABLE_ENDPOINT,
  NETAPP_STORAGE_NETWORK_PORT_STATUS_CHART_ENDPOINT,
  NETAPP_STORAGE_NETWORK_PORT_STATUS_TABLE_ENDPOINT,
  NETAPP_STORAGE_NODE_HEALTH_PERFORMANCE_CHART_ENDPOINT,
  NETAPP_STORAGE_NODE_HEALTH_PERFORMANCE_TABLE_ENDPOINT,
  NETAPP_STORAGE_RECENT_ALERTS_CHART_ENDPOINT,
  NETAPP_STORAGE_RECENT_ALERTS_TABLE_ENDPOINT,
  NETAPP_STORAGE_SVM_OVERVIEW_CHART_ENDPOINT,
  NETAPP_STORAGE_SVM_OVERVIEW_TABLE_ENDPOINT,
  NETAPP_STORAGE_VOLUME_CAPACITY_PERFORMANCE_CHART_ENDPOINT,
  NETAPP_STORAGE_VOLUME_CAPACITY_PERFORMANCE_TABLE_ENDPOINT,
  NETAPP_STORAGE_EXECUTIVE_SUMMARY_ENDPOINT,
} from './netapp-storage-dashboard.const';
import {
  AggregateOverviewChartViewType,
  AggregateGrowthTrendType,
  AggregateOverviewSummaryType,
  AutoRemediationSummaryType,
  AutoRemediationSummaryViewType,
  CapacityPlanningChartViewType,
  CapacityPlanningSummaryType,
  CapacityPlanningTableViewType,
  ClusterOverviewSummaryWidgetType,
  ClusterOverviewType,
  DonutChartConfigType,
  GaugeChartConfigType,
  GroupedVerticalBarChartConfigType,
  HorizontalBarChartConfigType,
  LUNOverviewChartViewType,
  LUNOverviewSummaryType,
  LUNOverviewTableViewType,
  PerformanceMetricsLineChartConfigType,
  PerformanceMetricsLineChartSeriesType,
  NodeInfoAndMetricsSectionChartViewType,
  NodeInfoAndMetricsThresholdBarChartType,
  NodeInfoAndMetricsTableViewType,
  PerformanceMetricsChartViewType,
  PerformanceMetricsSummaryType,
  PerformanceMetricsTableViewType,
  PortOverviewChartViewType,
  PortOverviewSummaryType,
  PortOverviewTableViewType,
  RecentAlertsChartViewType,
  RecentAlertsSummaryType,
  RecentAlertsTableViewType,
  SVMCapacityChartType,
  SVMIOPSChartType,
  SVMLunCountChartType,
  SVMOverviewChartViewType,
  SVMOverviewSummaryType,
  SVMOverviewTableViewType,
  SVMThroughputChartType,
  SVMVolumeCountChartType,
  StackedVerticalBarChartConfigType,
  VerticalBarChartConfigType,
  VolumeIopsTimeSeriesType,
  VolumeLatencyTimeSeriesType,
  VolumeOverviewRwRatioType,
  VolumeOverviewSectionChartViewType,
  VolumeOverviewStateDistributionType,
  VolumeOverviewSummaryViewType,
  VolumeOverviewTableViewType,
  VolumeOverviewTop10LargestType,
  VolumeOverviewTop10MostUsedType,
  VolumeOverviewTop10ByAvailType,
  AggregateOverviewTableViewType,
  SVMVolumeBubbleValue,
} from './netapp-storage-dashboard.type';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { BarSeriesOption, LineSeriesOption } from 'echarts';
import { PolarComponent } from 'echarts/components';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageDashboardFilterCriteria } from '../storage-dashboard.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import moment from 'moment';


@Injectable()
export class NetappStorageDashboardService {
  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private tableSvc: TableApiServiceService) { }

  //Start of API call related common functions

  private getChartViewParams(filters?: StorageDashboardFilterCriteria, extraParams?: { [key: string]: any }): HttpParams {
    let params = new HttpParams();
    const datacenter = this.getSelectedFilterValue(filters?.datacenters);
    params = this.appendParam(params, 'datacenter', datacenter);
    params = this.appendMultiValueParam(params, 'cluster', filters?.clusters);
    params = this.appendParam(params, 'time_range', this.getTimeRangeParam(filters));
    params = this.appendDateParam(params, 'start_datetime', filters?.from);
    params = this.appendDateParam(params, 'end_datetime', filters?.to);
    Object.keys(extraParams || {}).forEach(key => {
      params = this.appendParam(params, key, extraParams?.[key]);
    });
    return params;
  }

  private getTableViewParams(criteria?: SearchCriteria, filters?: StorageDashboardFilterCriteria,
    extraParams?: { [key: string]: any }): HttpParams {
    const copiedCriteria: SearchCriteria = {
      ...(criteria || {}),
      sortColumn: '',
      sortDirection: '',
      params: [
        {
          datacenter: this.getSelectedFilterValue(filters?.datacenters),
          time_range: this.getTimeRangeParam(filters),
          start_datetime: this.formatApiDate(filters?.from),
          end_datetime: this.formatApiDate(filters?.to),
          sort_by: this.getSortByParam(criteria?.sortColumn, criteria?.sortDirection),
          ...(extraParams || {})
        }
      ],
      multiValueParam: {
        cluster: filters?.clusters || []
      }
    };
    return this.tableSvc.getWithParam(copiedCriteria) || new HttpParams();
  }

  private appendMultiValueParam(params: HttpParams, key: string, values?: string[]): HttpParams {
    (values || []).forEach(value => {
      if (value) {
        params = params.append(key, value);
      }
    });
    return params;
  }

  private appendParam(params: HttpParams, key: string, value?: string | number | null): HttpParams {
    if (value == null || value === '') {
      return params;
    }
    return params.append(key, String(value));
  }

  private appendDateParam(params: HttpParams, key: string, value?: Date | string): HttpParams {
    const formattedDate = this.formatApiDate(value);
    if (!formattedDate) {
      return params;
    }
    return params.append(key, formattedDate);
  }

  private formatApiDate(value?: Date | string): string | undefined {
    const date = moment(value);
    return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : undefined;
  }

  private getSelectedFilterValue(values?: string[]): string | undefined {
    return (values || []).find(item => !!item);
  }

  private getTimeRangeParam(filters: StorageDashboardFilterCriteria): string | undefined {
    return filters?.timeRangeApiValue || filters?.period;
  }

  private getSortByParam(sortColumn?: string | '', sortDirection?: string): string | undefined {
    if (!sortColumn || !sortDirection) {
      return undefined;
    }
    return sortDirection === 'asc' ? sortColumn : `-${sortColumn}`;
  }

  //End of API call related common functions


  // Start of Table related common functions

  private parseNodeUtilization(value: string): number {
    const utilization = Number.parseFloat(value || '0');
    return Number.isFinite(utilization) ? Math.min(Math.max(utilization, 0), 100) : 0;
  }

  private getNodeUtilizationClass(utilization: number): string {
    if (utilization > 90) {
      return 'bg-danger';
    }
    if (utilization > 80) {
      return 'bg-warning';
    }
    return 'bg-success';
  }

  private getNodeStatusIcon(status: string): string {
    const normalizedStatus = status.trim().toLowerCase();
    if (['healthy'].includes(normalizedStatus)) {
      return 'fa-check-circle';
    }
    if (['warning'].includes(normalizedStatus)) {
      return 'fa-exclamation-triangle';
    }
    if (['critical'].includes(normalizedStatus)) {
      return 'fa-times-circle';
    }
    return 'fa-question-circle';
  }

  private getNodeStatusClass(status: string): string {
    const normalizedStatus = status.trim().toLowerCase();
    if (['healthy'].includes(normalizedStatus)) {
      return 'text-success';
    }
    if (['warning'].includes(normalizedStatus)) {
      return 'text-warning';
    }
    if (['critical'].includes(normalizedStatus)) {
      return 'text-danger';
    }
    return 'text-muted';
  }

  private parsePercentage(value: string): number {
    const parsedValue = Number.parseFloat(value || '0');
    return Number.isFinite(parsedValue) ? Math.min(Math.max(parsedValue, 0), 100) : 0;
  }

  private parseParenthesizedPercentage(value: string): number {
    const percentage = (value || '').match(/\((\d+(?:\.\d+)?)%\)/);
    return this.parsePercentage(percentage ? percentage[1] : value);
  }

  private getUtilizationClass(utilization: number): string {
    if (utilization > 90) {
      return 'bg-danger';
    }
    if (utilization > 80) {
      return 'bg-warning';
    }
    return 'bg-success';
  }

  private getStateBadgeClass(state: string): string {
    const normalizedState = (state || '').trim().toLowerCase();
    if (['online', 'up'].includes(normalizedState)) {
      return 'badge-success';
    }
    if (['down'].includes(normalizedState)) {
      return 'badge-danger';
    }
    return 'badge-warning text-dark';
  }

  private getStatusBadgeClass(status: string): string {
    const normalizedStatus = (status || '').trim().toLowerCase();
    if (normalizedStatus === 'healthy') {
      return 'badge-success';
    }
    if (normalizedStatus === 'critical') {
      return 'badge-danger';
    }
    return 'badge-warning text-dark';
  }

  private getNearlyFullBadgeClass(nearlyFull: string, utilization: number): string {
    if ((nearlyFull || '').trim().toLowerCase() !== 'yes') {
      return 'badge-light text-muted';
    }
    return utilization > 90 ? 'badge-danger' : 'badge-warning text-dark';
  }

  private getAlertSeverityIcon(severity: string): string {
    const normalizedSeverity = (severity || '').trim().toLowerCase();
    if (normalizedSeverity === 'critical') {
      return 'fa-times-circle';
    }
    if (['warning'].includes(normalizedSeverity)) {
      return 'fa-exclamation-circle';
    }
    return 'fa-info-circle';
  }

  private getAlertSeverityClass(severity: string): string {
    const normalizedSeverity = (severity || '').trim().toLowerCase();
    if (normalizedSeverity === 'critical') {
      return 'text-danger';
    }
    if (['warning'].includes(normalizedSeverity)) {
      return 'text-warning';
    }
    return 'text-info';
  }

  // End of Table related common functions



  /** start of common Charts functionality handled for reusing chartData via passing required graphdata and configrations */


  convertToVerticalBarChartData(graphData: any[], config: VerticalBarChartConfigType = {}): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const {
      yAxisName = '',
      valueKey = 'value',
      labelKey = 'name',
      color = '#378AD8',
      tooltipLabel = 'Value',
      sortDesc = true,
      showLegend = false,
      rotateLabel = 30,
      barWidth,
      gridLeft = 18,
      gridRight = 18,
      gridTop = 14,
      gridBottom = 32
    } = config;

    const chartData = [...(graphData || [])];
    if (sortDesc) {
      chartData.sort((a, b) => this.parseChartValue(b?.[valueKey]) - this.parseChartValue(a?.[valueKey]));
    }

    const categories = chartData.map(item => item?.[labelKey] || '');
    const values = chartData.map(item => this.parseChartValue(item?.[valueKey]));

    view.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: showLegend
        ? {
          bottom: 0,
          left: 'center',
          itemWidth: 10,
          itemHeight: 10,
          icon: 'roundRect',
          textStyle: { fontSize: 8 },
          data: [tooltipLabel],
        }
        : { show: false },
      grid: { left: gridLeft, right: gridRight, top: gridTop, bottom: gridBottom, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: this.getCategoryAxisLabel(64, rotateLabel)
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameLocation: 'end',
        nameGap: 18,
        nameTextStyle: { fontSize: 8, color: '#475569' },
        axisLabel: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      series: [
        {
          name: tooltipLabel,
          type: 'bar',
          barWidth,
          data: values,
          itemStyle: { color }
        }
      ]
    };

    return view;
  }

  private readonly chartLabelMaxLength = 10;

  private getCategoryAxisLabel(width: number, rotate = 0) {
    return {
      fontSize: 8,
      color: '#475569',
      rotate,
      interval: 0,
      hideOverlap: true,
      width,
      overflow: 'truncate' as const,
      formatter: (value: string): string => this.truncateAxisLabel(value)
    };
  }

  private truncateAxisLabel(value: unknown): string {
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

  private hasDefinedValue(values: unknown[]): boolean {
    return values.some(value => value !== null && value !== undefined);
  }

  convertToHorizontalBarChartData(graphData: any[], config: HorizontalBarChartConfigType = {}): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const {
      xAxisName = '',
      valueKey = 'value',
      labelKey = 'name',
      color = '#378AD8',
      tooltipLabel = 'Value',
      sortDesc = true,
      showLegend = false,
      gridLeft = 20,
      gridRight = 18,
      gridTop = 14,
      gridBottom = 18
    } = config;

    const chartData = [...(graphData || [])];
    if (sortDesc) {
      chartData.sort((a, b) => {
        const valueA = this.parseChartValue(a?.[valueKey]);
        const valueB = this.parseChartValue(b?.[valueKey]);
        return valueB - valueA;
      });
    }

    const categories = chartData.map(item => item?.[labelKey] || '');
    const values = chartData.map(item => this.parseChartValue(item?.[valueKey]));

    view.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: showLegend
        ? {
          bottom: 0,
          left: 'center',
          itemWidth: 10,
          itemHeight: 10,
          icon: 'roundRect',
          textStyle: { fontSize: 8 },
          data: [tooltipLabel]
        }
        : { show: false },
      grid: { left: gridLeft, right: gridRight, top: gridTop, bottom: gridBottom, containLabel: true },
      xAxis: {
        type: 'value',
        name: xAxisName,
        nameLocation: 'end',
        nameGap: 18,
        nameTextStyle: { fontSize: 8, color: '#475569' },
        axisLabel: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        inverse: true,
        axisLabel: this.getCategoryAxisLabel(96),
        axisLine: { lineStyle: { color: '#d9dee5' } }
      },
      series: [
        {
          name: tooltipLabel,
          type: 'bar',
          data: values,
          itemStyle: { color }
        }
      ]
    };

    return view;
  }

  convertToThresholdBarChartChartData(
    graphData: NodeInfoAndMetricsThresholdBarChartType[] | undefined
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const xAxisData: string[] = graphData.map(data => data.range);
    const healthyData: Array<number | null> = [];
    const warningData: Array<number | null> = [];
    const criticalData: Array<number | null> = [];

    graphData.forEach(data => {
      const rangeLabel = String(data.range || '');
      const normalized = rangeLabel.match(/\d+/g);
      const upperBound = normalized?.length ? Number(normalized[normalized.length - 1]) : 0;
      if (upperBound <= 30) {
        healthyData.push(data.count);
        warningData.push(null);
        criticalData.push(null);
      } else if (upperBound <= 70) {
        healthyData.push(null);
        warningData.push(data.count);
        criticalData.push(null);
      } else {
        healthyData.push(null);
        warningData.push(null);
        criticalData.push(data.count);
      }
    });
    view.options = {
      tooltip: {
        trigger: 'item',
        axisPointer: { type: 'none' },
        formatter: (params: any) => {
          const index = params?.dataIndex ?? 0;
          const bucket = graphData[index];
          if (!bucket) {
            return '';
          }
          let tooltip = `<b>Range ${bucket.range} (${bucket.count} Node(s))</b><br/>`;
          (bucket.nodes || []).forEach((node: any) => {
            tooltip += `${node.name}: <b>${node.value}</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        show: true,
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'roundRect',
        textStyle: { fontSize: 8 },
        data: ['Healthy (<30%)', 'Warning (30-70%)', 'Critical (>70%)']
      },
      grid: { left: 18, right: 18, top: 18, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: this.getCategoryAxisLabel(64, 30)
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 8 }
      },
      series: [
        {
          name: 'Healthy (<30%)',
          type: 'bar',
          tooltip: { borderColor: '#00b050' },
          data: healthyData,
          itemStyle: {
            color: '#00b050'
          }
        },
        {
          name: 'Warning (30-70%)',
          type: 'bar',
          tooltip: { borderColor: '#fd7e14' },
          data: warningData,
          itemStyle: {
            color: '#fd7e14'
          }
        },
        {
          name: 'Critical (>70%)',
          type: 'bar',
          tooltip: { borderColor: '#dc3545' },
          data: criticalData,
          itemStyle: {
            color: '#dc3545'
          }
        }
      ]
    };

    return view;
  }

  convertToHorizontalStackBarChartData(
    graphData: Array<{ name: string; read: number; write: number }> | undefined,
    xAxisName = 'Gbps'
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const sortedData = [...graphData].sort((a, b) => {
      const totalA = (a?.read || 0) + (a?.write || 0);
      const totalB = (b?.read || 0) + (b?.write || 0);
      return totalB - totalA;
    });
    const categories = sortedData.map(item => item.name || '');
    const readData = sortedData.map(item => item.read || 0);
    const writeData = sortedData.map(item => item.write || 0);

    view.options = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 8 },
        data: ['Read', 'Write']
      },
      grid: { left: 20, right: 38, top: 18, bottom: 25, containLabel: true },
      xAxis: {
        type: 'value',
        name: xAxisName,
        nameLocation: 'end',
        nameGap: 18,
        nameTextStyle: { fontSize: 8, color: '#475569' },
        axisLabel: { fontSize: 8 },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        inverse: true,
        axisLabel: this.getCategoryAxisLabel(96),
        axisLine: { lineStyle: { color: '#d9dee5' } }
      },
      series: [
        {
          name: 'Read',
          type: 'bar',
          stack: 'total',
          data: readData,
          itemStyle: { color: '#378AD8' }
        },
        {
          name: 'Write',
          type: 'bar',
          stack: 'total',
          data: writeData,
          itemStyle: { color: '#00b050' }
        }
      ]
    };

    return view;
  }

  convertToGroupedVerticalBarChartData(
    graphData: Array<{ name: string; read: number; write: number }> | undefined,
    yAxisName = 'MB/s',
    config: GroupedVerticalBarChartConfigType = {}
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const categories = (graphData || []).map(item => item.name || '');
    const readData = (graphData || []).map(item => item.read ?? 0);
    const writeData = (graphData || []).map(item => item.write ?? 0);
    const { gridBottom = '25%' } = config;

    view.options = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'roundRect',
        textStyle: { fontSize: 8 },
        data: ['Read', 'Write']
      },
      grid: { left: '3%', right: '5%', top: '10%', bottom: gridBottom, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: this.getCategoryAxisLabel(64)
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameLocation: 'end',
        nameGap: 18,
        nameTextStyle: { fontSize: 8, color: '#475569' },
        axisLabel: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      series: [
        {
          name: 'Read',
          type: 'bar',
          data: readData,
          itemStyle: { color: '#378AD8' }
        },
        {
          name: 'Write',
          type: 'bar',
          data: writeData,
          itemStyle: { color: '#00b050' }
        }
      ]
    };

    return view;
  }

  convertToStackedVerticalBarChartData(config: StackedVerticalBarChartConfigType): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const {
      labels = [],
      series = [],
      yAxisName = '',
      stackName = 'total',
      barWidth,
      legendItemWidth = 8,
      legendItemHeight = 8,
      legendFontSize = 8,
      gridLeft = '3%',
      gridRight = '5%',
      gridTop = '8%',
      gridBottom = '22%'
    } = config;

    const chartSeries: BarSeriesOption[] = series.map(item => ({
      name: item.name,
      type: 'bar',
      stack: stackName,
      barWidth,
      data: item.data || [],
      itemStyle: { color: item.color }
    }));

    view.options = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: legendItemWidth,
        itemHeight: legendItemHeight,
        textStyle: { fontSize: legendFontSize },
        data: series.map(item => item.name)
      },
      grid: {
        left: gridLeft,
        right: gridRight,
        top: gridTop,
        bottom: gridBottom,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: this.getCategoryAxisLabel(64)
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameLocation: 'end',
        nameTextStyle: { fontSize: 8, color: '#475569' },
        axisLabel: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      series: chartSeries
    };

    return view;
  }

  convertToLineChartData(config: PerformanceMetricsLineChartConfigType): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const labels = config?.labels || [];
    const series = config?.series || [];
    const {
      showLegend = true,
      smooth = false,
      showSymbol = true,
      symbol = 'emptyCircle',
      symbolSize = 5,
      gridBottom = '20%'
    } = config;

    view.options = {
      tooltip: {
        trigger: 'axis'
      },
      legend: showLegend ? {
        bottom: 0,
        textStyle: { fontSize: 8 }
      } : { show: false },
      grid: { left: '3%', right: '5%', top: '10%', bottom: gridBottom, containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 8, color: '#475569' }
      },
      yAxis: {
        type: 'value',
        name: config?.yAxisName || '',
        nameLocation: 'end',
        nameGap: 18,
        nameTextStyle: { fontSize: 8, color: '#475569' },
        axisLabel: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      series: series.map((item: PerformanceMetricsLineChartSeriesType) => {
        const seriesOption: LineSeriesOption = {
          name: item.name,
          type: 'line',
          data: item.data || [],
          smooth,
          showSymbol,
          symbol,
          symbolSize,
          itemStyle: { color: item.color },
          lineStyle: { color: item.color }
        };

        if (item.areaColor) {
          seriesOption.areaStyle = { color: item.areaColor };
        }

        return seriesOption;
      })
    };

    return view;
  }

  convertToDonutChartData(graphData: Array<{ name: string; value: number }>, config: DonutChartConfigType = {}): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const {
      centerTitle = '',
      centerValue = '',
      showCenterTitle = true,
      showCenterValue = true,
      seriesName = 'Distribution',
      innerRadius = '45%',
      outerRadius = '65%',
      colors = ['#00b050', '#dc3545', '#fd7e14'],
      showLegend = true,
      showLabels = true,
      showLabelLines = true,
      labelFormatter = '{b}\n{d}%',
      legendFontSize = 8,
      labelLineLength = 10,
      labelLineLength2 = 8,
      tooltipFormatter,
      center = ['50%', '45%'],
      startAngle = 90
    } = config;

    const chartData = (graphData || []).map((item, index) => ({
      name: item?.name || '',
      value: item?.value ?? 0,
      itemStyle: { color: colors[index % colors.length] },
      labelLine: {
        lineStyle: {
          color: colors[index % colors.length]
        }
      }
    }));

    view.options = {
      tooltip: {
        trigger: 'item',
        formatter: tooltipFormatter || ((params: any) => `${params?.name || ''}: <b>${params?.value ?? 0}</b> (${params?.percent ?? 0}%)`)
      },
      legend: showLegend ? {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { fontSize: legendFontSize },
        data: chartData.map(item => item.name)
      } : { show: false },
      graphic: (showCenterTitle && centerTitle) || (showCenterValue && centerValue) ? [
        {
          type: 'text',
          left: 'center',
          top: '42%',
          style: {
            text: showCenterTitle ? centerTitle : '',
            align: 'center',
            verticalAlign: 'middle',
            fill: '#475569',
            fontSize: 9,
            fontFamily: UNITY_FONT_FAMILY(),
            fontWeight: 600
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '50%',
          style: {
            text: showCenterValue ? centerValue : '',
            align: 'center',
            verticalAlign: 'middle',
            fill: '#0f172a',
            fontSize: 16,
            fontFamily: UNITY_FONT_FAMILY(),
            fontWeight: 700
          }
        }
      ] : [],
      series: [
        {
          name: seriesName,
          type: 'pie',
          radius: [innerRadius, outerRadius],
          center,
          startAngle,
          avoidLabelOverlap: true,
          label: {
            show: showLabels,
            position: 'outside',
            formatter: labelFormatter,
            fontSize: 8,
            color: '#475569',
            fontFamily: UNITY_FONT_FAMILY()
          },
          labelLine: {
            show: showLabelLines,
            length: labelLineLength,
            length2: labelLineLength2,
            lineStyle: {
              color: '#cbd5e1'
            }
          },
          data: chartData
        }
      ]
    };

    return view;
  }

  convertToHalfDonutChartData(graphData: Array<{ name: string; value: number }>, config: DonutChartConfigType = {}): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    const {
      seriesName = 'Distribution',
      innerRadius = '45%',
      outerRadius = '65%',
      colors = ['#00b050', '#dc3545', '#fd7e14'],
      showLegend = true,
      showLabels = true,
      showLabelLines = true,
      labelFormatter = '{b}\n{d}%',
      legendFontSize = 8,
      tooltipFormatter
    } = config;

    const chartData = (graphData || []).map((item, index) => ({
      name: item?.name || '',
      value: item?.value ?? 0,
      itemStyle: { color: colors[index % colors.length] }
    }));

    view.options = this.chartConfigSvc.getDefaultHalfDonutChartOptions();
    view.options.tooltip = {
      trigger: 'item',
      formatter: tooltipFormatter || '{b}: <b>{c}</b> ({d}%)'
    };
    view.options.legend = showLegend ? {
      ...(view.options.legend as any),
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemWidth: 32,
      itemHeight: 16,
      itemGap: 12,
      icon: 'roundRect',
      selectedMode: true,
      textStyle: { fontSize: legendFontSize },
      data: chartData.map(item => item.name)
    } : { show: false };
    view.options.series = [
      {
        ...(view.options.series?.[0] as any),
        name: seriesName,
        radius: [innerRadius, outerRadius],
        center: ['50%', '68%'],
        startAngle: 180,
        endAngle: 360,
        data: chartData,
        label: {
          ...(view.options.series?.[0] as any)?.label,
          show: showLabels,
          formatter: labelFormatter
        },
        labelLine: {
          ...(view.options.series?.[0] as any)?.labelLine,
          show: showLabelLines
        }
      }
    ];

    return view;
  }

  convertToGaugeChartData(config: GaugeChartConfigType = {}): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.GUAGE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.GUAGE);

    const {
      value = 0,
      max = 100,
      title = 'Uptime',
      unit = '%'
    } = config;

    const safeValue = Math.max(0, Math.min(max, value));

    view.options = {
      tooltip: {
        formatter: () => `${title}: ${safeValue}${unit}`
      },
      series: [
        {
          type: 'gauge',
          name: 'Availability',
          min: 90,
          max,
          splitNumber: 5,
          radius: '85%',
          axisLine: {
            lineStyle: {
              width: 5,
              color: [[0.5, '#dc3545'], [0.8, '#ffc107'], [1, '#00b050']]
            }
          },
          pointer: { width: 2, length: '60%' },
          axisTick: { show: false },
          splitLine: { length: 5, lineStyle: { color: '#fff', width: 2 } },
          axisLabel: { color: '#666', fontSize: 6, distance: 5 },
          detail: {
            valueAnimation: true,
            formatter: `{value}${unit}`,
            color: '#333',
            fontSize: 10,
            offsetCenter: [0, '60%']
          },
          title: {
            show: true,
            offsetCenter: [0, '22%'],
            color: '#333',
            fontSize: 16,
            fontWeight: 600
          },
          data: [{ value: safeValue, name: title }]
        }
      ]
    };

    return view;
  }

  private parseChartValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(String(value ?? '').replace(/[^0-9.]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }


  /** end of common Charts functionality handled for reusing chartData via passing required graphdata and configrations */



  // START of Cluster Overview

  getClusterOverviewData(filters: StorageDashboardFilterCriteria): Observable<ClusterOverviewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<ClusterOverviewType>(NETAPP_STORAGE_EXECUTIVE_SUMMARY_ENDPOINT, { params });
  }

  convertToClusterOverviewViewData(data: ClusterOverviewSummaryWidgetType): ClusterOverviewWidgetSummaryViewData {
    const viewData: ClusterOverviewWidgetSummaryViewData = new ClusterOverviewWidgetSummaryViewData();
    viewData.usedCapacity = data?.usedCapacity;
    viewData.freeCapacity = data?.freeCapacity;
    viewData.availability = data?.availability;
    viewData.activeAlerts = data?.activeAlerts;
    viewData.nodes = data?.nodes;
    viewData.aggregates = data?.aggregates;
    viewData.svms = data?.svms;
    viewData.volumes = data?.volumes;
    viewData.luns = data?.luns;
    return viewData;
  }

  // END of Cluster Overview



  // START of Node Info & Metrics

  getNodeInfoAndMetricsTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<NodeInfoAndMetricsTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<NodeInfoAndMetricsTableViewType>>(NETAPP_STORAGE_NODE_HEALTH_PERFORMANCE_TABLE_ENDPOINT, { params });
  }

  convertToNodeInfoAndMetricsTableViewData(data: NodeInfoAndMetricsTableViewType[]): NodeInfoAndMetricsTableViewData[] {
    return (data || []).map(row => {
      const viewData = new NodeInfoAndMetricsTableViewData();
      viewData.name = row?.name;
      viewData.cluster = row?.cluster;
      viewData.model = row?.model;
      viewData.os = row?.os;
      viewData.cpu = row?.cpu;
      viewData.cpuPercent = this.parseNodeUtilization(row?.cpu);
      viewData.cpuProgressClass = this.getNodeUtilizationClass(viewData.cpuPercent);
      viewData.mem = row?.mem;
      viewData.memPercent = this.parseNodeUtilization(row?.mem);
      viewData.memProgressClass = this.getNodeUtilizationClass(viewData.memPercent);
      viewData.net = row?.net;
      viewData.readWriteIops = `${row?.rx} / ${row?.tx}`;
      viewData.readWriteLatency = `${row?.rxLat} / ${row?.txLat}`;
      viewData.uptime = row?.uptime;
      viewData.status = row?.status;
      viewData.statusIcon = this.getNodeStatusIcon(viewData.status);
      viewData.statusClass = this.getNodeStatusClass(viewData.status);
      return viewData;
    });
  }

  getNodeInfoAndMetricsChartViewData(filters: StorageDashboardFilterCriteria): Observable<NodeInfoAndMetricsSectionChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<NodeInfoAndMetricsSectionChartViewType>(NETAPP_STORAGE_NODE_HEALTH_PERFORMANCE_CHART_ENDPOINT, { params });
  }

  convertToNodeInfoAndMetricsSummaryViewData(data: NodeInfoAndMetricsSummaryViewData): NodeInfoAndMetricsSummaryViewData {
    const viewData = new NodeInfoAndMetricsSummaryViewData();
    viewData.totalNodes = data?.totalNodes;
    viewData.upNodes = data?.upNodes;
    viewData.downNodes = data?.downNodes;
    viewData.unknownNodes = data?.unknownNodes;
    viewData.avgCpuUtilization = data?.avgCpuUtilization;
    viewData.avgMemUtilization = data?.avgMemUtilization;
    viewData.avgNetworkUtilization = data?.avgNetworkUtilization;
    viewData.avgUptime = data?.avgUptime;
    return viewData;
  }

  convertToNodeInfoAndMetricsChartViewData(
    charts: NodeInfoAndMetricsSectionChartViewType['charts']
  ): NodeInfoAndMetricsChartViewData {
    const viewData = new NodeInfoAndMetricsChartViewData();
    viewData.cpuUsageNodeDistributionChartData = this.convertToThresholdBarChartChartData(charts?.cpuDistribution);
    viewData.memUsageNodeDistributionChartData = this.convertToThresholdBarChartChartData(charts?.memDistribution);
    viewData.networkThroughputChartData = this.convertToHorizontalStackBarChartData(charts?.networkThroughput);
    viewData.iopsTopNodesChartData = this.convertToHorizontalStackBarChartData(charts?.iopsTopNodes, 'IOPS (K)');
    viewData.devWriteThroughputChartData = this.convertToGroupedVerticalBarChartData(charts?.devWriteThroughput, 'MB/s');
    viewData.hasData = !!(
      viewData.cpuUsageNodeDistributionChartData ||
      viewData.memUsageNodeDistributionChartData ||
      viewData.networkThroughputChartData ||
      viewData.iopsTopNodesChartData ||
      viewData.devWriteThroughputChartData
    );
    return viewData;
  }

  // END of Node Info & Metrics



  // START of Aggregate Ovierview

  getAggregateOverviewTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<AggregateOverviewTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<AggregateOverviewTableViewType>>(NETAPP_STORAGE_AGGREGATE_CAPACITY_UTILIZATION_TABLE_ENDPOINT, { params });
  }

  convertToAggregateOverviewTableViewData(data: AggregateOverviewTableViewType[]): AggregateOverviewTableViewData[] {
    return (data || []).map(row => {
      const viewData = new AggregateOverviewTableViewData();
      viewData.name = row?.name;
      viewData.cluster = row?.cluster;
      viewData.total = row?.total;
      viewData.used = row?.used;
      viewData.free = row?.free;
      viewData.util = row?.util;
      viewData.utilPercent = this.parsePercentage(row?.util);
      viewData.utilProgressClass = this.getUtilizationClass(viewData.utilPercent);
      viewData.nodes = row?.nodes;
      viewData.raid = row?.raid;
      viewData.state = row?.state;
      viewData.stateBadgeClass = this.getStateBadgeClass(row?.state);
      viewData.snapUsed = row?.snapUsed;
      viewData.snapshotPercent = this.parseParenthesizedPercentage(row?.snapUsed);
      viewData.snapshotProgressClass = this.getUtilizationClass(viewData.snapshotPercent);
      viewData.nearlyFull = row?.nearlyFull;
      viewData.nearlyFullBadgeClass = this.getNearlyFullBadgeClass(row?.nearlyFull, viewData.utilPercent);
      viewData.status = row?.status;
      viewData.statusIcon = this.getNodeStatusIcon(viewData.status);
      viewData.statusClass = this.getNodeStatusClass(viewData.status);
      return viewData;
    });
  }

  getAggregateOverviewChartData(filters: StorageDashboardFilterCriteria): Observable<AggregateOverviewChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<AggregateOverviewChartViewType>(NETAPP_STORAGE_AGGREGATE_CAPACITY_UTILIZATION_CHART_ENDPOINT, { params });
  }

  convertToAggregateOverviewViewData(data: AggregateOverviewSummaryType): AggregateOverviewSummaryViewData {
    const viewData: AggregateOverviewSummaryViewData = new AggregateOverviewSummaryViewData();
    viewData.totalAggregates = data?.totalAggregates;
    viewData.onlineAggregates = data?.onlineAggregates;
    viewData.offlineAggregates = data?.offlineAggregates;
    viewData.unknownAggregates = data?.unknownAggregates;
    viewData.usedCapacity = data?.usedCapacity;
    viewData.freeCapacity = data?.freeCapacity;
    viewData.utilizationPercent = data?.utilizationPercent;
    return viewData;
  }

  convertToAggregateOverviewChartViewData(charts: AggregateOverviewChartViewType['charts']): AggregateOverviewChartViewData {
    const viewData = new AggregateOverviewChartViewData();
    viewData.capacityDistributionChartData = this.convertToAggregateCapacityDistributionChartData(charts?.capacityDistribution);
    viewData.utilizationChartData = this.convertToAggregateUtilizationChartData(charts?.utilizationBuckets);
    viewData.nearlyFullChartData = this.convertToNearlyFullAggregatesViewData(charts?.nearlyFull);
    viewData.top10LargestChartData = this.convertToTop10LargestAggregatesChartData(charts?.top10Largest);
    viewData.aggregateGrowthTrendChartData = this.convertToAggregateGrowthTrendChartData(charts?.aggregateGrowthTrend);
    viewData.hasData = !!(
      viewData.capacityDistributionChartData ||
      viewData.utilizationChartData ||
      viewData.nearlyFullChartData?.length ||
      viewData.top10LargestChartData ||
      viewData.aggregateGrowthTrendChartData
    );
    return viewData;
  }

  convertToNearlyFullAggregatesViewData(graphData: any[]): Array<{ name: string; cluster: string; util: string; severity: 'warning' | 'critical' }> {
    if (!graphData?.length) { return; }
    return (graphData || [])
      .filter(item => {
        const util = Number(String(item?.util || '').replace('%', ''));
        return util > 85;
      })
      .sort((a, b) => Number(String(b?.util || '').replace('%', '')) - Number(String(a?.util || '').replace('%', '')))
      .map(item => {
        const util = Number(String(item?.util || '').replace('%', ''));
        return {
          name: item?.name || '',
          cluster: item?.cluster || '',
          util: item?.util || '-',
          severity: util > 90 ? 'critical' : 'warning'
        };
      });
  }

  convertToAggregateCapacityDistributionChartData(
    graphData: Array<{ range: string; count: number; }>
  ): UnityChartDetails | undefined {
    if (!graphData?.length) { return; }
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const categories = graphData.map(item => item.range || '');
    const values = graphData.map(item => item.count ?? 0);
    const colors = graphData.map(item => {
      const range = String(item.range || '');
      if (range.includes('<50')) {
        return '#00b050';
      }
      if (range.includes('50-75')) {
        return '#ffc107';
      }
      if (range.includes('75-90')) {
        return '#fd7e14';
      }
      return '#dc3545';
    });

    view.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const point = params?.[0];
          const bucket = graphData[point?.dataIndex ?? 0];
          if (!bucket) {
            return '';
          }
          return `${bucket.range}: ${bucket.count} Aggregates`;
        }
      },
      grid: { left: 18, right: 18, top: 18, bottom: 18, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: this.getCategoryAxisLabel(96),
        axisLine: { lineStyle: { color: '#d9dee5' } }
      },
      series: [
        {
          name: 'Aggregate Count',
          type: 'bar',
          // barWidth: 14,
          data: values.map((value, index) => ({
            value,
            itemStyle: {
              color: colors[index]
            }
          }))
        }
      ]
    };

    return view;
  }

  convertToAggregateUtilizationChartData(
    graphData: Array<{ range: string; count: number; }>
  ): UnityChartDetails | undefined {
    if (!graphData?.length) { return; }
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const categories = graphData.map(item => item.range || '');
    const values = graphData.map(item => item.count ?? 0);
    const colors = graphData.map(item => {
      const range = String(item.range || '').toLowerCase();
      if (range.includes('low')) {
        return '#00b050';
      }
      if (range.includes('medium')) {
        return '#ffc107';
      }
      if (range.includes('optimal')) {
        return '#fd7e14';
      }
      return '#dc3545';
    });

    view.options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const point = params?.[0];
          const bucket = graphData[point?.dataIndex ?? 0];
          if (!bucket) {
            return '';
          }
          return `${bucket.range}: ${bucket.count} Aggregates`;
        }
      },
      grid: { left: 18, right: 18, top: 14, bottom: 18, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: this.getCategoryAxisLabel(96),
        axisLine: { lineStyle: { color: '#d9dee5' } }
      },
      series: [
        {
          name: 'Aggregate Utilization',
          type: 'bar',
          // barWidth: 14,
          data: values.map((value, index) => ({
            value,
            itemStyle: {
              color: colors[index]
            }
          }))
        }
      ]
    };

    return view;
  }

  convertToTop10LargestAggregatesChartData(
    graphData: Array<{ name: string; cluster: string; total: string }>
  ): UnityChartDetails | undefined {
    if (!graphData?.length) { return; }
    const config = {
      xAxisName: 'TB',
      valueKey: 'total',
      labelKey: 'name',
      color: '#378AD8',
      tooltipLabel: 'Total',
      sortDesc: true,
      showLegend: false
    }
    return this.convertToHorizontalBarChartData(graphData || [], config);
  }

  convertToAggregateGrowthTrendChartData(graphData: AggregateGrowthTrendType): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config: PerformanceMetricsLineChartConfigType = {
      labels: graphData?.labels || [],
      yAxisName: 'PB',
      showLegend: false,
      smooth: true,
      showSymbol: true,
      symbol: 'emptyCircle',
      symbolSize: 4,
      gridBottom: '15%',
      series: [
        {
          name: 'Growth Trend',
          data: graphData?.data || [],
          color: '#00b050',
          areaColor: 'rgba(0, 176, 80, 0.15)'
        }
      ]
    };
    return this.convertToLineChartData(config);
  }

  // END of Aggregate Ovierview



  // START of Storage Virtual Machine (SVM)

  getSvmOverviewTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<SVMOverviewTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<SVMOverviewTableViewType>>(NETAPP_STORAGE_SVM_OVERVIEW_TABLE_ENDPOINT, { params });
  }

  convertToSvmOverviewTableViewData(data: SVMOverviewTableViewType[]): SVMOverviewTableViewData[] {
    return (data || []).map(row => {
      const viewData = new SVMOverviewTableViewData();
      viewData.name = row?.name;
      viewData.cluster = row?.cluster;
      viewData.state = row?.state;
      viewData.stateBadgeClass = this.getStateBadgeClass(row?.state);
      viewData.vols = row?.vols;
      viewData.luns = row?.luns;
      viewData.cap = row?.cap;
      viewData.readWriteIops = `${row?.rx} / ${row?.tx}`;
      viewData.readWriteLatency = `${row?.rxLat} / ${row?.txLat}`;
      viewData.throughput = row?.throughput;
      viewData.status = row?.status;
      viewData.statusIcon = this.getNodeStatusIcon(viewData.status);
      viewData.statusClass = this.getNodeStatusClass(viewData.status);
      return viewData;
    });
  }

  getSvmOverviewChartData(filters: StorageDashboardFilterCriteria): Observable<SVMOverviewChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<SVMOverviewChartViewType>(NETAPP_STORAGE_SVM_OVERVIEW_CHART_ENDPOINT, { params });
  }

  convertToSvmOverviewSummaryViewData(data: SVMOverviewSummaryType): SVMOverviewSummaryViewData {
    const viewData: SVMOverviewSummaryViewData = new SVMOverviewSummaryViewData();
    viewData.totalSVMs = data?.totalSVMs;
    viewData.runningSVMs = data?.runningSVMs;
    viewData.stoppedSVMs = data?.stoppedSVMs;
    viewData.unknownSVMs = data?.unknownSVMs;
    viewData.avgCapacityUsed = data?.avgCapacityUsed;
    viewData.avgIops = data?.avgIops;
    viewData.avgIopsRead = data?.avgIopsRead;
    viewData.avgIopsWrite = data?.avgIopsWrite;
    viewData.avgLatency = data?.avgLatency;
    viewData.avgLatencyRead = data?.avgLatencyRead;
    viewData.avgLatencyWrite = data?.avgLatencyWrite;
    viewData.avgThroughput = data?.avgThroughput;
    return viewData;
  }

  convertToSvmOverviewChartViewData(charts: SVMOverviewChartViewType['charts']): SVMOverviewChartViewData {
    const viewData = new SVMOverviewChartViewData();
    viewData.capacityBySvmChartData = this.convertToSvmCapacityTreemapChartData(charts?.capacityBySvm);
    viewData.volumeCountBySvmChartData = this.convertToVolumeCountBySvmChartData(charts?.volumeCountBySvm);
    viewData.lunCountBySvmChartData = this.convertToLunCountBySvmChartData(charts?.lunCountBySvm);
    viewData.throughputBySvmChartData = this.convertToThroughputBySvmChartData(charts?.throughputBySvm);
    viewData.top10CapacityConsumersChartData = this.convertToTop10SvmCapacityConsumersChartData(charts?.top10CapacityConsumers);
    viewData.topPerformingSvmsChartData = this.convertToTopPerformingSvmsChartData(charts?.top10ByIops);
    viewData.hasData = !!(
      viewData.capacityBySvmChartData ||
      viewData.volumeCountBySvmChartData ||
      viewData.lunCountBySvmChartData ||
      viewData.throughputBySvmChartData ||
      viewData.top10CapacityConsumersChartData ||
      viewData.topPerformingSvmsChartData
    );
    return viewData;
  }

  convertToSvmCapacityTreemapChartData(graphData: SVMCapacityChartType[]): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.TREE_MAP;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.TREE_MAP);

    const colors = [
      '#378AD8', '#00b050', '#ffc107', '#fd7e14', '#8892a2',
      '#007bff', '#00b050', '#ffc107', '#fd7e14', '#8892a2'
    ];
    const chartData = [...(graphData || [])]
      .sort((a, b) => (b?.cap ?? 0) - (a?.cap ?? 0))
      .map((item, index) => ({
        name: item?.name || '',
        value: item?.cap ?? 0,
        itemStyle: { color: colors[index % colors.length] }
      }));

    view.options = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} TB' },
      series: [
        {
          type: 'treemap',
          breadcrumb: { show: false },
          data: chartData
        }
      ]
    };

    return view;
  }

  convertToVolumeCountBySvmChartData(graphData: SVMVolumeCountChartType[]): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.SCATTER;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.SCATTER);
    view.options = this.chartConfigSvc.getScatterChartOptions();

    const chartData = (graphData || []).map(item => {
      const value: SVMVolumeBubbleValue = [
        item?.vols ?? 0,
        item?.luns ?? 0,
        item?.name || '',
        item?.cap ?? 0
      ];
      const color = value[0] > 35 ? '#dc3545' : value[0] > 20 ? '#fd7e14' : '#00b050';
      return { value, itemStyle: { color } };
    });

    view.options.grid = { left: '8%', right: '15%', bottom: '5%', top: '20%', containLabel: true };
    view.options.legend = { show: false };
    view.options.xAxis = {
      name: 'Vols',
      type: 'value',
      splitLine: { show: false },
      axisLabel: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 8, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.yAxis = {
      name: 'LUNs',
      type: 'value',
      splitLine: { show: false },
      axisLabel: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 8, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.tooltip = {
      trigger: 'item',
      formatter: (params: unknown): string => {
        const value = (params as { value?: SVMVolumeBubbleValue })?.value;
        if (!value) {
          return '';
        }
        return `<b>${value[2]}</b><br/>Volumes: ${value[0]}<br/>LUNs: ${value[1]}<br/>Capacity: ${value[3]} TB`;
      }
    };
    view.options.series = [
      {
        name: 'SVMs',
        type: 'scatter',
        data: chartData,
        symbolSize: (value: unknown): number => {
          const bubbleValue = value as SVMVolumeBubbleValue;
          return Math.sqrt(bubbleValue?.[3] ?? 0) * 2.2;
        },
        emphasis: { focus: 'series' }
      }
    ];

    return view;
  }

  convertToLunCountBySvmChartData(graphData: SVMLunCountChartType[]): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.RADAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.RADAR);
    const chartData = [...(graphData || [])]
      .sort((a, b) => (b?.luns ?? 0) - (a?.luns ?? 0))
    const maxValue = Math.max(...chartData.map(item => item.luns));
    view.options = {
      tooltip: { trigger: 'item' },
      radar: {
        indicator: chartData.map(item => ({ name: item?.name || '', max: maxValue })),
        radius: '60%',
        center: ['50%', '50%'],
        axisName: { fontSize: 8, color: '#475569' },
        splitLine: { lineStyle: { color: '#d9dee5' } }
      },
      series: [
        {
          name: 'LUN Count',
          type: 'radar',
          data: [
            {
              value: chartData.map(item => item?.luns ?? 0),
              name: 'LUN Count',
              lineStyle: { color: '#378AD8' },
              itemStyle: { color: '#378AD8' },
              areaStyle: { color: 'rgba(55, 138, 216, 0.2)' }
            }
          ]
        }
      ]
    };

    return view;
  }

  convertToThroughputBySvmChartData(graphData: SVMThroughputChartType[]): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const topThroughputData = [...(graphData || [])]
      .sort((a, b) => (b?.throughput ?? 0) - (a?.throughput ?? 0))
    const config: HorizontalBarChartConfigType = {
      xAxisName: 'GB/s',
      valueKey: 'throughput',
      labelKey: 'name',
      color: '#378AD8',
      tooltipLabel: 'Throughput',
      sortDesc: false,
      showLegend: false,
      gridLeft: '3%',
      gridRight: '8%',
      gridTop: '10%',
      gridBottom: '10%'
    };
    return this.convertToHorizontalBarChartData(topThroughputData, config);
  }

  convertToTop10SvmCapacityConsumersChartData(graphData: SVMCapacityChartType[]): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const topCapacityData = [...(graphData || [])]
      .sort((a, b) => (b?.cap ?? 0) - (a?.cap ?? 0));
    const config: VerticalBarChartConfigType = {
      yAxisName: 'TB',
      valueKey: 'cap',
      labelKey: 'name',
      color: '#378AD8',
      tooltipLabel: 'Capacity Used',
      sortDesc: false,
      showLegend: false,
      rotateLabel: 30,
      gridLeft: '3%',
      gridRight: '5%',
      gridTop: '10%',
      gridBottom: '10%'
    };
    return this.convertToVerticalBarChartData(topCapacityData, config);
  }

  convertToTopPerformingSvmsChartData(graphData: SVMIOPSChartType[]): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = [
      ...this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR),
      PolarComponent
    ];

    const chartData = [...(graphData || [])]
      .sort((a, b) => (b?.rxIops ?? 0) - (a?.rxIops ?? 0))

    view.options = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: {
        show: true,
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 8,
        icon: 'roundRect',
        textStyle: { fontSize: 7 },
        data: ['Read IOPS (K)', 'Write IOPS (K)']
      },
      angleAxis: {
        type: 'category',
        data: chartData.map(item => item?.name || ''),
        axisLabel: { fontSize: 6, color: '#475569' }
      },
      radiusAxis: { axisLabel: { fontSize: 7, color: '#475569' } },
      polar: { radius: '50%', center: ['50%', '42%'] },
      series: [
        {
          name: 'Read IOPS (K)',
          type: 'bar',
          coordinateSystem: 'polar',
          data: chartData.map(item => item?.rxIops ?? 0),
          itemStyle: { color: '#378AD8' }
        },
        {
          name: 'Write IOPS (K)',
          type: 'bar',
          coordinateSystem: 'polar',
          data: chartData.map(item => item?.txIops ?? 0),
          itemStyle: { color: '#00b050' }
        }
      ]
    };

    return view;
  }

  // END of Storage Virtual Machine (SVM)



  // START of Volume Overview

  getVolumeOverviewTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<VolumeOverviewTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<VolumeOverviewTableViewType>>(NETAPP_STORAGE_VOLUME_CAPACITY_PERFORMANCE_TABLE_ENDPOINT, { params });
  }

  convertToVolumeOverviewTableViewData(data: VolumeOverviewTableViewType[]): VolumeOverviewTableViewData[] {
    return (data || []).map(row => {
      const viewData = new VolumeOverviewTableViewData();
      viewData.cluster = row?.cluster;
      viewData.name = row?.name;
      viewData.svm = row?.svm;
      viewData.agg = row?.agg;
      viewData.state = row?.state;
      viewData.stateBadgeClass = this.getStateBadgeClass(row?.state);
      viewData.type = row?.type;
      viewData.total = row?.total;
      viewData.avail = row?.avail;
      return viewData;
    });
  }

  getVolumeOverviewChartData(filters: StorageDashboardFilterCriteria): Observable<VolumeOverviewSectionChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<VolumeOverviewSectionChartViewType>(NETAPP_STORAGE_VOLUME_CAPACITY_PERFORMANCE_CHART_ENDPOINT, { params });
  }

  convertToVolumeOverviewSummaryViewData(data: VolumeOverviewSummaryViewType): NetappStorageVolumeSummaryViewData {
    const viewData = new NetappStorageVolumeSummaryViewData();
    viewData.totalVolumes = data?.totalVolumes;
    viewData.onlineVolumes = data?.onlineVolumes;
    viewData.offlineVolumes = data?.offlineVolumes;
    viewData.unknownVolumes = data?.unknownVolumes;
    viewData.usedCapacity = data?.usedCapacity;
    viewData.avgLatency = data?.avgLatency;
    viewData.totalIops = data?.totalIops;
    viewData.snapshotReserve = data?.snapshotReserve;
    return viewData;
  }

  convertToVolumeOverviewChartViewData(
    charts: VolumeOverviewSectionChartViewType['charts']
  ): VolumeOverviewChartViewData {
    const viewData = new VolumeOverviewChartViewData();
    viewData.stateDistributionChartData = this.convertToVolumeStateDistributionChartData(charts?.stateDistribution);
    viewData.top10LargestChartData = this.convertToTop10LargestVolumesChartData(charts?.top10Largest);
    viewData.top10MostUsedChartData = this.convertToTop10UsedVolumesChartData(charts?.top10MostUsed);
    viewData.iopsTimeSeriesChartData = this.convertToVolumeIopsTrendChartData(charts?.volumeIopsTrend);
    viewData.rwRatioChartData = this.convertToVolumeReadWriteRatioChartData(charts?.rwRatio);
    viewData.latencyTimeSeriesChartData = this.convertToVolumeReadWriteLatencyChartData(charts?.volumeReadWriteLatencyTrend);
    viewData.top10ByAvailChartData = this.convertToSnapshotUsageChartData(charts?.top10ByAvail);
    viewData.hasData = !!(
      viewData.stateDistributionChartData ||
      viewData.top10LargestChartData ||
      viewData.top10MostUsedChartData ||
      viewData.iopsTimeSeriesChartData ||
      viewData.rwRatioChartData ||
      viewData.latencyTimeSeriesChartData ||
      viewData.top10ByAvailChartData
    );
    return viewData;
  }

  convertToVolumeStateDistributionChartData(
    graphData: VolumeOverviewStateDistributionType
  ): UnityChartDetails | undefined {
    if (!graphData || !this.hasDefinedValue([graphData.online, graphData.offline, graphData.other])) { return; }
    const graphConvertedData = [
      { name: 'Online', value: graphData?.online || 0 },
      { name: 'Offline', value: graphData?.offline || 0 },
      { name: 'Other', value: graphData?.other || 0 }
    ]
    const config = {
      seriesName: 'Volumes',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '45%',
      outerRadius: '65%',
      colors: ['#00b050', '#dc3545', '#fd7e14'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%'
    }
    return this.convertToDonutChartData(graphConvertedData, config);
  }

  convertToTop10LargestVolumesChartData(
    graphData: VolumeOverviewTop10LargestType[]
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const config = {
      xAxisName: 'TB',
      valueKey: 'total',
      labelKey: 'name',
      color: '#378AD8',
      tooltipLabel: 'Total',
      sortDesc: true,
      showLegend: false
    }
    return this.convertToHorizontalBarChartData(graphData || [], config);
  }

  convertToTop10UsedVolumesChartData(
    graphData: VolumeOverviewTop10MostUsedType[]
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const config = {
      xAxisName: '%',
      valueKey: 'used',
      labelKey: 'name',
      color: '#dc3545',
      tooltipLabel: 'Used',
      sortDesc: true,
      showLegend: false
    }
    return this.convertToHorizontalBarChartData(graphData || [], config);
  }

  convertToVolumeIopsTrendChartData(graphData: VolumeIopsTimeSeriesType): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config: PerformanceMetricsLineChartConfigType = {
      labels: graphData?.labels || [],
      yAxisName: 'IOPS',
      showLegend: true,
      smooth: false,
      showSymbol: true,
      symbol: 'emptyCircle',
      symbolSize: 4,
      gridBottom: '20%',
      series: [
        {
          name: 'Read IOPS',
          data: graphData?.rx || [],
          color: '#378AD8'
        },
        {
          name: 'Write IOPS',
          data: graphData?.tx || [],
          color: '#00b050'
        }
      ]
    };
    return this.convertToLineChartData(config);
  }

  convertToVolumeReadWriteRatioChartData(graphData?: VolumeOverviewRwRatioType): UnityChartDetails | undefined {
    if (!graphData || !this.hasDefinedValue([graphData.read, graphData.write])) { return; }
    const chartData = [
      { name: 'Read', value: graphData?.read ?? 0 },
      { name: 'Write', value: graphData?.write ?? 0 }
    ];
    const config: DonutChartConfigType = {
      seriesName: 'Read/Write Ratio',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '60%',
      outerRadius: '85%',
      colors: ['#378AD8', '#00b050'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%',
      legendFontSize: 8,
      labelLineLength: 5,
      labelLineLength2: 5,
      tooltipFormatter: '{b}: {c}%',
      center: ['50%', '70%'],
      startAngle: 180
    };
    return this.convertToHalfDonutChartData(chartData, config);
  }

  convertToVolumeReadWriteLatencyChartData(graphData: VolumeLatencyTimeSeriesType): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config: PerformanceMetricsLineChartConfigType = {
      labels: graphData?.labels || [],
      yAxisName: 'ms',
      showLegend: true,
      smooth: false,
      showSymbol: true,
      symbol: 'emptyCircle',
      symbolSize: 4,
      gridBottom: '20%',
      series: [
        {
          name: 'Read Latency',
          data: graphData?.rxLat || [],
          color: '#378AD8'
        },
        {
          name: 'Write Latency',
          data: graphData?.txLat || [],
          color: '#dc3545'
        }
      ]
    };
    return this.convertToLineChartData(config);
  }

  convertToSnapshotUsageChartData(
    graphData: VolumeOverviewTop10ByAvailType[]
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const snapshotData = [...(graphData || [])]
      .sort((a, b) => (b?.avail ?? 0) - (a?.avail ?? 0));
    const config: HorizontalBarChartConfigType = {
      xAxisName: 'TB',
      valueKey: 'avail',
      labelKey: 'name',
      color: '#fd7e14',
      tooltipLabel: 'Available Space',
      sortDesc: false,
      showLegend: false,
      gridLeft: '3%',
      gridRight: '8%',
      gridTop: '10%',
      gridBottom: '15%'
    };
    return this.convertToHorizontalBarChartData(snapshotData, config);
  }

  // END of Volume Overview



  // START of LUN Overview

  getLunOverviewTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<LUNOverviewTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<LUNOverviewTableViewType>>(NETAPP_STORAGE_LUN_INVENTORY_CAPACITY_TABLE_ENDPOINT, { params });
  }

  convertToLunOverviewTableViewData(data: LUNOverviewTableViewType[]): LUNOverviewTableViewData[] {
    return (data || []).map(row => {
      const viewData = new LUNOverviewTableViewData();
      viewData.cluster = row?.cluster;
      viewData.name = row?.name;
      viewData.path = row?.path;
      viewData.state = row?.state;
      viewData.stateBadgeClass = this.getStateBadgeClass(row?.state);
      viewData.size = row?.size;
      viewData.util = row?.util;
      viewData.utilPercent = this.parsePercentage(row?.util);
      viewData.usedSpace = row?.usedSpace;
      viewData.utilProgressClass = this.getUtilizationClass(viewData.utilPercent);
      viewData.iops = row?.iops;
      viewData.latency = row?.latency;
      viewData.throughput = row?.throughput;
      viewData.status = row?.status;
      return viewData;
    });
  }

  getLunOverviewChartData(filters: StorageDashboardFilterCriteria): Observable<LUNOverviewChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<LUNOverviewChartViewType>(NETAPP_STORAGE_LUN_INVENTORY_CAPACITY_CHART_ENDPOINT, { params });
  }

  convertToLunOverviewViewData(data: LUNOverviewSummaryType): LUNOverviewSummaryViewData {
    const viewData = new LUNOverviewSummaryViewData();
    viewData.totalLUNs = data?.totalLUNs;
    viewData.onlineLUNs = data?.onlineLUNs;
    viewData.offlineLUNs = data?.offlineLUNs;
    viewData.unknownLUNs = data?.unknownLUNs;
    viewData.avgLatency = data?.avgLatency;
    viewData.totalIops = data?.totalIops;
    return viewData;
  }

  convertToLunOverviewChartViewData(charts: LUNOverviewChartViewType['charts']): LUNOverviewChartViewData {
    const viewData = new LUNOverviewChartViewData();
    viewData.healthDistributionChartData = this.convertToLunHealthDistributionChartData(charts?.healthDistribution);
    viewData.top10ByUsageChartData = this.convertToTop10LunsByUsageChartData(charts?.top10ByUsage);
    viewData.growthTrendChartData = this.convertToLunGrowthTrendChartData(charts?.growthTrend);
    viewData.availabilityChartData = this.convertToAvailabilityChartData(charts?.availability);
    viewData.hasData = !!(
      viewData.healthDistributionChartData ||
      viewData.top10ByUsageChartData ||
      viewData.growthTrendChartData ||
      viewData.availabilityChartData
    );
    return viewData;
  }

  convertToLunHealthDistributionChartData(
    graphData: Array<{ status: string; count: number }>
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const chartData = (graphData || []).map(item => ({
      name: item?.status || '',
      value: item?.count ?? 0
    }));
    const config = {
      seriesName: 'LUNs',
      centerTitle: 'Total LUNs',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '45%',
      outerRadius: '65%',
      colors: ['#00b050', '#ffc107', '#dc3545'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%'
    }
    return this.convertToDonutChartData(chartData, config);
  }

  convertToTop10LunsByUsageChartData(graphData: any[]): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    return this.convertToVerticalBarChartData(graphData || [], {
      yAxisName: '%',
      valueKey: 'util',
      labelKey: 'name',
      color: '#378AD8',
      tooltipLabel: 'Util',
      sortDesc: true,
      showLegend: false,
      rotateLabel: 30
    });
  }

  convertToLunGrowthTrendChartData(graphData: AggregateGrowthTrendType): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config: PerformanceMetricsLineChartConfigType = {
      labels: graphData?.labels || [],
      yAxisName: 'TB',
      showLegend: false,
      smooth: false,
      showSymbol: true,
      symbol: 'emptyCircle',
      symbolSize: 4,
      gridBottom: '15%',
      series: [
        {
          name: 'Growth',
          data: graphData?.data || [],
          color: '#378AD8',
          areaColor: 'rgba(55, 138, 216, 0.10)'
        }
      ]
    };

    return this.convertToLineChartData(config);
  }

  convertToAvailabilityChartData(graphData?: number): UnityChartDetails | undefined {
    if (graphData === null || graphData === undefined) {
      return;
    }
    const config = {
      value: graphData ?? 0,
      title: 'Uptime',
      unit: '%',
      color: '#00b050'
    }
    return this.convertToGaugeChartData(config);
  }

  // END of LUN Overview



  convertTotop10ByUsageChartData(graphData: any[]): UnityChartDetails {
    if (!graphData?.length) {
      return;
    }
    const config = {
      yAxisName: '%',
      valueKey: 'util',
      labelKey: 'name',
      color: '#378AD8',
      tooltipLabel: 'Utilization %',
      sortDesc: true,
      showLegend: false,
      rotateLabel: 30
    }
    return this.convertToVerticalBarChartData(graphData || [], config);
  }


  // START of Performance Metrics

  getPerformanceMetricsTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<PerformanceMetricsTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<PerformanceMetricsTableViewType>>(NETAPP_STORAGE_CLUSTER_PERFORMANCE_TABLE_ENDPOINT, { params });
  }

  convertToPerformanceMetricsTableViewData(data: PerformanceMetricsTableViewType[]): PerformanceMetricsTableViewData[] {
    return (data || []).map(row => {
      const viewData = new PerformanceMetricsTableViewData();
      viewData.time = row?.time;
      viewData.readWriteIops = `${row?.rx} / ${row?.tx}`;
      viewData.readWriteLatency = `${row?.rxLat} / ${row?.txLat}`;
      viewData.throughput = row?.throughput;
      return viewData;
    });
  }

  getPerformanceMetricsChartData(filters: StorageDashboardFilterCriteria): Observable<PerformanceMetricsChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<PerformanceMetricsChartViewType>(NETAPP_STORAGE_CLUSTER_PERFORMANCE_CHART_ENDPOINT, { params });
  }

  convertToPerformanceMetricsSummaryViewData(data: PerformanceMetricsSummaryType): PerformanceMetricsSummaryViewData {
    const viewData: PerformanceMetricsSummaryViewData = new PerformanceMetricsSummaryViewData();
    viewData.totalIops = data?.totalIops;
    viewData.readIops = data?.readIops;
    viewData.writeIops = data?.writeIops;
    viewData.throughput = data?.throughput;
    viewData.readLatency = data?.readLatency;
    viewData.writeLatency = data?.writeLatency;
    return viewData;
  }

  convertToPerformanceMetricsChartViewData(
    charts: PerformanceMetricsChartViewType['charts']
  ): PerformanceMetricsChartViewData {
    const viewData = new PerformanceMetricsChartViewData();
    viewData.iopsRealTimeTrendChartData = this.convertToIopsRealTimeTrendChartData(charts?.iopsTimeSeries);
    viewData.throughputRealTimeTrendChartData = this.convertToThroughputRealTimeTrendChartData(charts?.throughputTimeSeries);
    viewData.latencyTrendChartData = this.convertToLatencyTrendChartData(charts?.latencyTimeSeries);
    viewData.iopsActivityBreakdownChartData = this.convertToIopsBreakdownChartData(charts?.iopsBreakdown);
    viewData.hasData = !!(
      viewData.iopsRealTimeTrendChartData ||
      viewData.throughputRealTimeTrendChartData ||
      viewData.latencyTrendChartData ||
      viewData.iopsActivityBreakdownChartData
    );
    return viewData;
  }

  convertToIopsRealTimeTrendChartData(
    graphData: PerformanceMetricsChartViewType['charts']['iopsTimeSeries']
  ): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config = {
      labels: graphData?.labels || [],
      yAxisName: 'IOPS (K)',
      series: [
        {
          name: 'Read IOPS',
          data: graphData?.rx || [],
          color: '#378AD8'
        },
        {
          name: 'Write IOPS',
          data: graphData?.tx || [],
          color: '#00b050'
        }
      ]
    }
    return this.convertToLineChartData(config);
  }

  convertToThroughputRealTimeTrendChartData(
    graphData?: PerformanceMetricsChartViewType['charts']['throughputTimeSeries']
  ): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config = {
      labels: graphData?.labels || [],
      yAxisName: 'GB/s',
      series: [
        {
          name: 'Throughput',
          data: graphData?.data || [],
          color: '#00b050',
          areaColor: 'rgba(0, 176, 80, 0.1)'
        }
      ]
    }
    return this.convertToLineChartData(config);
  }

  convertToLatencyTrendChartData(
    graphData: PerformanceMetricsChartViewType['charts']['latencyTimeSeries']
  ): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config = {
      labels: graphData?.labels || [],
      yAxisName: 'ms',
      series: [
        {
          name: 'Read Latency',
          data: graphData?.rxLat || [],
          color: '#378AD8'
        },
        {
          name: 'Write Latency',
          data: graphData?.txLat || [],
          color: '#dc3545'
        }
      ]
    }
    return this.convertToLineChartData(config);
  }

  convertToIopsBreakdownChartData(
    graphData: PerformanceMetricsChartViewType['charts']['iopsBreakdown']
  ): UnityChartDetails | undefined {
    if (!graphData?.categories?.length) { return; }
    const chartData = (graphData?.categories || []).map((category: string, index: number) => ({
      name: category,
      read: graphData?.read?.[index] ?? 0,
      write: graphData?.write?.[index] ?? 0
    }));

    return this.convertToGroupedVerticalBarChartData(chartData, 'IOPS (K)', { gridBottom: '20%' });
  }

  // END of Performance Metrics


  // START of Capacity Planning

  getCapacityPlanningTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<CapacityPlanningTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<CapacityPlanningTableViewType>>(NETAPP_STORAGE_CAPACITY_PLANNING_TABLE_ENDPOINT, { params });
  }

  convertToCapacityPlanningTableViewData(data: CapacityPlanningTableViewType[]): CapacityPlanningTableViewData[] {
    return (data || []).map(row => {
      const viewData = new CapacityPlanningTableViewData();
      viewData.cluster = row?.cluster;
      viewData.total = row?.total;
      viewData.used = row?.used;
      viewData.free = row?.free;
      viewData.util = row?.util;
      viewData.utilPercent = this.parsePercentage(row?.util);
      viewData.utilProgressClass = this.getUtilizationClass(viewData.utilPercent);
      viewData.growth = row?.growth;
      viewData.days = row?.days;
      viewData.ratio = row?.ratio;
      viewData.status = row?.status;
      viewData.statusBadgeClass = this.getStatusBadgeClass(viewData.status);
      return viewData;
    });
  }

  getCapacityPlanningChartData(filters: StorageDashboardFilterCriteria): Observable<CapacityPlanningChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<CapacityPlanningChartViewType>(NETAPP_STORAGE_CAPACITY_PLANNING_CHART_ENDPOINT, { params });
  }

  convertToCapacityPlanningSummaryViewData(data: CapacityPlanningSummaryType): CapacityPlanningSummaryViewData {
    const viewData: CapacityPlanningSummaryViewData = new CapacityPlanningSummaryViewData();
    viewData.usedCapacity = data?.usedCapacity;
    viewData.freeCapacity = data?.freeCapacity;
    viewData.usableCapacity = data?.usableCapacity;
    viewData.growthRate = data?.growthRate;
    viewData.daysUntilFull = data?.daysUntilFull;
    viewData.thinProvisioningPct = data?.thinProvisioningPct;
    return viewData;
  }

  convertToCapacityPlanningChartViewData(
    charts: CapacityPlanningChartViewType['charts']
  ): CapacityPlanningChartViewData {
    const viewData = new CapacityPlanningChartViewData();
    viewData.capacityForecastChartData = this.convertToCapacityGrowthForecastChartData(charts?.capacityForecast);
    viewData.volUtilDistributionChartData = this.convertToVolumeUtilizationChartData(charts?.volUtilDistribution);
    viewData.aggUtilDistributionChartData = this.convertToCapacityAggregateUtilizationChartData(charts?.aggUtilDistribution);
    viewData.top5ConsumersChartData = this.convertToTop5CapacityConsumersChartData(charts?.top5Consumers);
    viewData.capacityBySvmChartData = this.convertToCapacityBySvmChartData(charts?.capacityBySvm);
    viewData.monthlyGrowthChartData = this.convertToMonthlyGrowthChartData(charts?.monthlyGrowth);
    viewData.hasData = !!(
      viewData.capacityForecastChartData ||
      viewData.volUtilDistributionChartData ||
      viewData.aggUtilDistributionChartData ||
      viewData.top5ConsumersChartData ||
      viewData.capacityBySvmChartData ||
      viewData.monthlyGrowthChartData
    );
    return viewData;
  }

  convertToCapacityGrowthForecastChartData(
    graphData: CapacityPlanningChartViewType['charts']['capacityForecast']
  ): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const chartSeries: LineSeriesOption[] = [
      {
        name: 'Used Capacity',
        type: 'line',
        data: graphData?.actual || [],
        itemStyle: { color: '#378AD8' }
      },
      {
        name: '1-Month Forecast',
        type: 'line',
        data: graphData?.forecast1 || [],
        lineStyle: { type: 'dashed' },
        itemStyle: { color: '#00b050' }
      },
      {
        name: '2-Months Forecast',
        type: 'line',
        data: graphData?.forecast2 || [],
        lineStyle: { type: 'dashed' },
        itemStyle: { color: '#fd7e14' }
      },
      {
        name: '3-Months Forecast',
        type: 'line',
        data: graphData?.forecast3 || [],
        lineStyle: { type: 'dashed' },
        itemStyle: { color: '#dc3545' }
      }
    ];

    view.options = {
      tooltip: { trigger: 'axis' },
      legend: {
        bottom: 0,
        left: 'center',
        textStyle: { fontSize: 8 }
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '25%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: graphData?.labels || [],
        axisLabel: { fontSize: 8 }
      },
      yAxis: {
        type: 'value',
        name: 'PB',
        axisLabel: { fontSize: 8 }
      },
      series: chartSeries
    };

    return view;
  }

  convertToVolumeUtilizationChartData(
    graphData: CapacityPlanningChartViewType['charts']['volUtilDistribution']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const chartData = (graphData || []).map(item => ({
      name: item?.range || '',
      value: item?.count ?? 0
    }));
    const config = {
      seriesName: 'Volume Utilization',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '45%',
      outerRadius: '65%',
      colors: ['#dc3545', '#fd7e14', '#00b050'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%',
      legendFontSize: 8
    }

    return this.convertToDonutChartData(chartData, config);
  }

  convertToCapacityAggregateUtilizationChartData(
    graphData: CapacityPlanningChartViewType['charts']['aggUtilDistribution']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const chartData = (graphData || []).map(item => ({
      name: item?.range || '',
      value: item?.count ?? 0
    }));
    const config = {
      seriesName: 'Aggregate Utilization',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '45%',
      outerRadius: '65%',
      colors: ['#dc3545', '#fd7e14', '#00b050'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%',
      legendFontSize: 8
    }
    return this.convertToDonutChartData(chartData, config);
  }

  convertToTop5CapacityConsumersChartData(
    graphData: CapacityPlanningChartViewType['charts']['top5Consumers']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const config = {
      xAxisName: 'TB',
      valueKey: 'capacity',
      labelKey: 'name',
      color: '#fd7e14',
      tooltipLabel: 'Capacity',
      sortDesc: true,
      showLegend: false,
      gridLeft: '3%',
      gridRight: '8%',
      gridTop: '10%',
      gridBottom: '15%'
    }
    return this.convertToHorizontalBarChartData(graphData || [], config);
  }

  convertToCapacityBySvmChartData(
    graphData: CapacityPlanningChartViewType['charts']['capacityBySvm']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const chartData = (graphData || []).map(item => ({
      name: item?.name || '',
      value: item?.cap ?? 0
    }));

    const config = {
      seriesName: 'Capacity',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '40%',
      outerRadius: '60%',
      colors: ['#378AD8', '#00b050', '#ffc107', '#fd7e14', '#8892a2'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%',
      legendFontSize: 7
    }

    return this.convertToDonutChartData(chartData, config);
  }

  convertToMonthlyGrowthChartData(
    graphData: CapacityPlanningChartViewType['charts']['monthlyGrowth']
  ): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const chartData = (graphData?.labels || []).map((name, index) => ({
      name: name,
      value: graphData?.data?.[index] ?? 0
    }));
    const config = {
      yAxisName: 'TB',
      valueKey: 'value',
      labelKey: 'name',
      color: '#00b050',
      tooltipLabel: 'Growth',
      sortDesc: false,
      showLegend: false,
      rotateLabel: 0,
      barWidth: '40%',
      gridLeft: '3%',
      gridRight: '5%',
      gridTop: '10%',
      gridBottom: '15%'
    }
    return this.convertToVerticalBarChartData(chartData, config);
  }

  // END of Capacity Planning


  // START of Port Overview

  getPortOverviewTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<PortOverviewTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<PortOverviewTableViewType>>(NETAPP_STORAGE_NETWORK_PORT_STATUS_TABLE_ENDPOINT, { params });
  }

  convertToPortOverviewTableViewData(data: PortOverviewTableViewType[]): PortOverviewTableViewData[] {
    return (data || []).map(row => {
      const viewData = new PortOverviewTableViewData();
      viewData.cluster = row?.cluster;
      viewData.node = row?.node;
      viewData.name = row?.name;
      viewData.type = row?.type;
      viewData.proto = row?.proto;
      viewData.admin = row?.admin;
      viewData.adminBadgeClass = this.getStateBadgeClass(row?.admin);
      viewData.link = row?.link;
      viewData.linkBadgeClass = this.getStateBadgeClass(row?.link);
      viewData.dev = row?.dev;
      viewData.devPort = row?.devPort;
      return viewData;
    });
  }

  getPortOverviewChartData(filters: StorageDashboardFilterCriteria): Observable<PortOverviewChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<PortOverviewChartViewType>(NETAPP_STORAGE_NETWORK_PORT_STATUS_CHART_ENDPOINT, { params });
  }

  convertToPortOverviewSummaryViewData(data: PortOverviewSummaryType): PortOverviewSummaryViewData {
    const viewData: PortOverviewSummaryViewData = new PortOverviewSummaryViewData();
    viewData.totalPorts = data?.totalPorts;
    viewData.totalEthernetPorts = data?.totalEthernetPorts;
    viewData.totalFcPorts = data?.totalFcPorts;
    viewData.portsUp = data?.portsUp;
    viewData.portsDown = data?.portsDown;
    viewData.portsUnknown = data?.portsUnknown;
    return viewData;
  }

  convertToPortOverviewChartViewData(charts?: PortOverviewChartViewType['charts']): PortOverviewChartViewData {
    const viewData = new PortOverviewChartViewData();
    viewData.linkStatusDistributionChartData = this.convertToLinkStatusDistributionChartData(charts?.linkStatusDistribution);
    viewData.portTypeAndProtocolChartData = this.convertToPortTypeAndProtocolChartData(charts?.portTypeDistribution);
    viewData.cabledByNodeChartData = this.convertToCabledByNodeChartData(charts?.portsByNode);
    viewData.hasData = !!(
      viewData.linkStatusDistributionChartData ||
      viewData.portTypeAndProtocolChartData ||
      viewData.cabledByNodeChartData
    );
    return viewData;
  }

  convertToLinkStatusDistributionChartData(
    graphData: PortOverviewChartViewType['charts']['linkStatusDistribution']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const chartData = (graphData || []).map(item => ({
      name: item?.status || '',
      value: item?.count ?? 0
    }));
    const config: DonutChartConfigType = {
      seriesName: 'Link Status',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '45%',
      outerRadius: '65%',
      colors: ['#00b050', '#dc3545'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%',
      legendFontSize: 8,
      labelLineLength: 5,
      labelLineLength2: 5
    };
    return this.convertToDonutChartData(chartData, config);
  }

  convertToPortTypeAndProtocolChartData(
    graphData: PortOverviewChartViewType['charts']['portTypeDistribution']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const chartData = (graphData || []).map(item => ({
      name: item?.type || '',
      value: item?.count ?? 0
    }));
    const config: DonutChartConfigType = {
      seriesName: 'Port Type',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '45%',
      outerRadius: '65%',
      colors: ['#378AD8', '#fd7e14'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%',
      legendFontSize: 8,
      labelLineLength: 5,
      labelLineLength2: 5
    };
    return this.convertToDonutChartData(chartData, config);
  }

  convertToCabledByNodeChartData(
    graphData: PortOverviewChartViewType['charts']['portsByNode']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const config: HorizontalBarChartConfigType = {
      xAxisName: 'Ports',
      valueKey: 'count',
      labelKey: 'node',
      color: '#378AD8',
      tooltipLabel: 'Ports Count',
      sortDesc: true,
      showLegend: false,
      gridLeft: '3%',
      gridRight: '12%',
      gridTop: '10%',
      gridBottom: '15%'
    };
    return this.convertToHorizontalBarChartData(graphData || [], config);
  }

  // END of Port Overview


  // START of Recent Alerts

  getRecentAlertsTableData(criteria: SearchCriteria,
    filters: StorageDashboardFilterCriteria): Observable<PaginatedResult<RecentAlertsTableViewType>> {
    const params = this.getTableViewParams(criteria, filters);
    return this.http.get<PaginatedResult<RecentAlertsTableViewType>>(NETAPP_STORAGE_RECENT_ALERTS_TABLE_ENDPOINT, { params });
  }

  convertToRecentAlertsTableViewData(data: RecentAlertsTableViewType[]): RecentAlertsTableViewData[] {
    return (data || []).map(row => {
      const viewData = new RecentAlertsTableViewData();
      viewData.id = row?.id;
      viewData.device = row?.device;
      viewData.count = row?.count;
      viewData.event = row?.event;
      viewData.time = row?.time;
      viewData.severity = row?.severity;
      viewData.severityIcon = this.getAlertSeverityIcon(viewData.severity);
      viewData.severityClass = this.getAlertSeverityClass(viewData.severity);
      viewData.description = row?.description;
      viewData.status = row?.status;
      viewData.statusClass = row?.status?.toLowerCase() === 'open' ? 'text-danger' : 'text-success';
      viewData.source = row?.source;
      return viewData;
    });
  }

  getRecentAlertsChartData(filters: StorageDashboardFilterCriteria): Observable<RecentAlertsChartViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<RecentAlertsChartViewType>(NETAPP_STORAGE_RECENT_ALERTS_CHART_ENDPOINT, { params });
  }

  convertToRecentAlertsSummaryViewData(data: RecentAlertsSummaryType): RecentAlertsSummaryViewData {
    const viewData: RecentAlertsSummaryViewData = new RecentAlertsSummaryViewData();
    viewData.totalAlerts = data?.totalAlerts;
    viewData.critical = data?.critical;
    viewData.warning = data?.warning;
    viewData.information = data?.information;
    return viewData;
  }

  convertToRecentAlertsChartViewData(
    charts: RecentAlertsChartViewType['charts']
  ): RecentAlertsChartViewData {
    const viewData = new RecentAlertsChartViewData();
    viewData.severityDistributionChartData = this.convertToAlertSeverityDistributionChartData(charts?.severityDistribution);
    viewData.alertTimelineChartData = this.convertToAlertTimelineChartData(charts?.alertTimeline);
    viewData.hasData = !!(
      viewData.severityDistributionChartData ||
      viewData.alertTimelineChartData
    );
    return viewData;
  }

  convertToAlertSeverityDistributionChartData(
    graphData: RecentAlertsChartViewType['charts']['severityDistribution']
  ): UnityChartDetails | undefined {
    if (!graphData?.length) {
      return;
    }
    const chartData = (graphData || []).map(item => ({
      name: item?.severity || '',
      value: item?.count ?? 0
    }));
    const config: DonutChartConfigType = {
      seriesName: 'Alert Severity',
      showCenterTitle: false,
      showCenterValue: false,
      innerRadius: '45%',
      outerRadius: '65%',
      colors: ['#dc2626', '#f97316', '#2563eb'],
      showLegend: true,
      showLabels: true,
      showLabelLines: true,
      labelFormatter: '{b}\n{d}%',
      legendFontSize: 8,
      labelLineLength: 5,
      labelLineLength2: 5,
      tooltipFormatter: '{b}: {c} ({d}%)'
    };
    return this.convertToDonutChartData(chartData, config);
  }

  convertToAlertTimelineChartData(
    graphData: RecentAlertsChartViewType['charts']['alertTimeline']
  ): UnityChartDetails | undefined {
    if (!graphData?.labels?.length) { return; }
    const config: StackedVerticalBarChartConfigType = {
      labels: graphData?.labels || [],
      yAxisName: 'Alerts',
      stackName: 'a',
      legendItemWidth: 8,
      legendItemHeight: 8,
      legendFontSize: 8,
      gridLeft: '3%',
      gridRight: '5%',
      gridTop: '8%',
      gridBottom: '22%',
      series: [
        { name: 'Critical', data: graphData?.critical || [], color: '#dc2626' },
        { name: 'Warning', data: graphData?.warning || [], color: '#f97316' },
        { name: 'Info', data: graphData?.info || [], color: '#2563eb' }
      ]
    };
    return this.convertToStackedVerticalBarChartData(config);
  }

  // END of Recent Alerts

  // START of Auto-Remediation Summary

  getAutoRemediationSummaryData(filters: StorageDashboardFilterCriteria): Observable<AutoRemediationSummaryViewType> {
    const params = this.getChartViewParams(filters);
    return this.http.get<AutoRemediationSummaryViewType>(NETAPP_STORAGE_AUTO_REMEDIATION_ENDPOINT, { params });
  }

  convertToAutoRemediationSummaryViewData(data: AutoRemediationSummaryType): AutoRemediationSummaryViewData {
    const viewData: AutoRemediationSummaryViewData = new AutoRemediationSummaryViewData();
    viewData.autoRemediations = data?.autoRemediations;
    viewData.avgMttr = data?.avgMttr;
    viewData.runbookSuccess = data?.runbookSuccess;
    viewData.runbookFailures = data?.runbookFailures;
    return viewData;
  }

  // END of Auto-Remediation Summary

}

export class NetappStorageSectionViewData {
  hidden: boolean = false;
  chartLoaded: boolean = false;
  hasSummaryData: boolean = false;
  hasChartData: boolean = false;
}

export class ClusterOverviewWidgetViewData {
  hidden: boolean = false;
  hasSummaryData: boolean = false;
  summaryViewData: ClusterOverviewWidgetSummaryViewData;
}

export class ClusterOverviewWidgetSummaryViewData {
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

export class NetappStorageVolumeSummaryViewData {
  totalVolumes: number | null = null;
  onlineVolumes: number | null = null;
  offlineVolumes: number | null = null;
  unknownVolumes: number | null = null;
  usedCapacity: string | null = null;
  avgLatency: string | null = null;
  totalIops: string | null = null;
  snapshotReserve: string | null = null;
}

export class NetappStorageLunSummaryViewData {
  totalLUNs: number | null = null;
  onlineLUNs: number | null = null;
  offlineLUNs: number | null = null;
  unknownLUNs: number | null = null;
  avgLatency: string | null = null;
  totalIops: string | null = null;
}

export class NodeInfoAndMetricsViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: NodeInfoAndMetricsTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: NodeInfoAndMetricsSummaryViewData;
  chartViewData: NodeInfoAndMetricsChartViewData;
}
export class NodeInfoAndMetricsTableViewData {
  name: string;
  cluster: string;
  model: string;
  os: string;
  cpu: string;
  cpuPercent: number;
  cpuProgressClass: string;
  mem: string;
  memPercent: number;
  memProgressClass: string;
  net: string;
  readWriteIops: string;
  readWriteLatency: string;
  uptime: string;
  status: string;
  statusIcon: string;
  statusClass: string;
}
export class NodeInfoAndMetricsChartViewData {
  hasData = false;
  cpuUsageNodeDistributionChartData: UnityChartDetails;
  memUsageNodeDistributionChartData: UnityChartDetails;
  networkThroughputChartData: UnityChartDetails;
  iopsTopNodesChartData: UnityChartDetails;
  devWriteThroughputChartData: UnityChartDetails;
}
export class NodeInfoAndMetricsSummaryViewData {
  totalNodes: number;
  upNodes: number;
  downNodes: number;
  unknownNodes: number;
  avgCpuUtilization: number;
  avgMemUtilization: number;
  avgNetworkUtilization: number;
  avgUptime: string;
}


export class VolumeOverviewViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: VolumeOverviewTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: VolumeOverviewSummaryViewData;
  chartViewData: VolumeOverviewChartViewData;
}
export class VolumeOverviewTableViewData {
  cluster: string;
  name: string;
  svm: string;
  agg: string;
  state: string;
  stateBadgeClass: string;
  type: string;
  total: string;
  avail: string;
}
export interface VolumeOverviewSummaryViewData {
  totalVolumes: number;
  onlineVolumes: number;
  offlineVolumes: number;
  unknownVolumes: number;
  usedCapacity: string;
  avgLatency: string | null;
  totalIops: string | null;
  snapshotReserve: string;
}
export class VolumeOverviewChartViewData {
  hasData = false;
  stateDistributionChartData: UnityChartDetails;
  top10LargestChartData: UnityChartDetails;
  iopsTimeSeriesChartData: UnityChartDetails;
  networkThroughputChartData: UnityChartDetails;
  top10ByAvailChartData: UnityChartDetails;
  top10MostUsedChartData: UnityChartDetails;
  rwRatioChartData: UnityChartDetails;
  latencyTimeSeriesChartData: UnityChartDetails;
}

export class AggregateOverviewViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: AggregateOverviewTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: AggregateOverviewSummaryViewData;
  chartViewData: AggregateOverviewChartViewData;
}
export class AggregateOverviewTableViewData {
  name: string;
  cluster: string;
  total: string;
  used: string;
  free: string;
  util: string;
  utilPercent: number;
  utilProgressClass: string;
  nodes: string;
  raid: string;
  state: string;
  stateBadgeClass: string;
  snapUsed: string;
  snapshotPercent: number;
  snapshotProgressClass: string;
  nearlyFull: string;
  nearlyFullBadgeClass: string;
  status: string;
  statusIcon: string;
  statusClass: string;
}
export class AggregateOverviewSummaryViewData {
  totalAggregates: number;
  onlineAggregates: number;
  offlineAggregates: number;
  unknownAggregates: number;
  usedCapacity: string;
  freeCapacity: string;
  utilizationPercent: number;
}
export class AggregateOverviewChartViewData {
  hasData = false;
  capacityDistributionChartData: UnityChartDetails;
  utilizationChartData: UnityChartDetails;
  nearlyFullChartData: Array<{ name: string; cluster: string; util: string; severity: 'warning' | 'critical' }> = [];
  top10LargestChartData: UnityChartDetails;
  aggregateGrowthTrendChartData: UnityChartDetails;
}

export class SVMOverviewViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: SVMOverviewTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: SVMOverviewSummaryViewData;
  chartViewData: SVMOverviewChartViewData;
}

export class SVMOverviewTableViewData {
  name: string;
  cluster: string;
  state: string;
  stateBadgeClass: string;
  vols: number;
  luns: number;
  cap: string;
  readWriteIops: string;
  readWriteLatency: string;
  throughput: string;
  status: string;
  statusIcon: string;
  statusClass: string;
}

export class SVMOverviewSummaryViewData {
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

export class SVMOverviewChartViewData {
  hasData = false;
  capacityBySvmChartData: UnityChartDetails;
  volumeCountBySvmChartData: UnityChartDetails;
  lunCountBySvmChartData: UnityChartDetails;
  throughputBySvmChartData: UnityChartDetails;
  top10CapacityConsumersChartData: UnityChartDetails;
  topPerformingSvmsChartData: UnityChartDetails;
}


export class LUNOverviewViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: LUNOverviewTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: LUNOverviewSummaryViewData;
  chartViewData: LUNOverviewChartViewData;
}
export class LUNOverviewTableViewData {
  cluster: string;
  name: string;
  path: string;
  state: string;
  stateBadgeClass: string;
  size: string;
  util: string;
  utilPercent: number;
  usedSpace: string;
  utilProgressClass: string;
  iops: string;
  latency: string;
  throughput: string;
  status: string;
}
export class LUNOverviewSummaryViewData {
  totalLUNs: number;
  onlineLUNs: number;
  offlineLUNs: number;
  unknownLUNs: number;
  avgLatency: string | null;
  totalIops: string | null;
}
export class LUNOverviewChartViewData {
  hasData = false;
  healthDistributionChartData: UnityChartDetails;
  top10ByUsageChartData: UnityChartDetails;
  growthTrendChartData: UnityChartDetails;
  availabilityChartData: UnityChartDetails;
}


export class PerformanceMetricsViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: PerformanceMetricsTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: PerformanceMetricsSummaryViewData;
  chartViewData: PerformanceMetricsChartViewData;
}

export class PerformanceMetricsTableViewData {
  time: string;
  readWriteIops: string;
  readWriteLatency: string;
  throughput: string;
}

export class PerformanceMetricsSummaryViewData {
  totalIops: string;
  readIops: string;
  writeIops: string;
  throughput: string;
  readLatency: string;
  writeLatency: string;
}

export class PerformanceMetricsChartViewData {
  hasData = false;
  iopsRealTimeTrendChartData: UnityChartDetails;
  throughputRealTimeTrendChartData: UnityChartDetails;
  latencyTrendChartData: UnityChartDetails;
  iopsActivityBreakdownChartData: UnityChartDetails;
}

export class CapacityPlanningViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: CapacityPlanningTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: CapacityPlanningSummaryViewData;
  chartViewData: CapacityPlanningChartViewData;
}

export class CapacityPlanningTableViewData {
  cluster: string;
  total: string;
  used: string;
  free: string;
  util: string;
  utilPercent: number;
  utilProgressClass: string;
  growth: string;
  days: string;
  ratio: string;
  status: string;
  statusBadgeClass: string;
}

export class CapacityPlanningSummaryViewData {
  usedCapacity: string;
  freeCapacity: string;
  usableCapacity: string;
  growthRate: string;
  daysUntilFull: string;
  thinProvisioningPct: string;
}

export class CapacityPlanningChartViewData {
  hasData = false;
  capacityForecastChartData: UnityChartDetails;
  volUtilDistributionChartData: UnityChartDetails;
  aggUtilDistributionChartData: UnityChartDetails;
  top5ConsumersChartData: UnityChartDetails;
  capacityBySvmChartData: UnityChartDetails;
  monthlyGrowthChartData: UnityChartDetails;
}

export class PortOverviewViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: PortOverviewTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: PortOverviewSummaryViewData;
  chartViewData: PortOverviewChartViewData;
}

export class PortOverviewTableViewData {
  cluster: string;
  node: string;
  name: string;
  type: string;
  proto: string;
  admin: string;
  adminBadgeClass: string;
  link: string;
  linkBadgeClass: string;
  dev: string;
  devPort: string;
}

export class PortOverviewSummaryViewData {
  totalPorts: number;
  totalEthernetPorts: number;
  totalFcPorts: number;
  portsUp: number;
  portsDown: number;
  portsUnknown: number;
}

export class PortOverviewChartViewData {
  hasData = false;
  linkStatusDistributionChartData: UnityChartDetails;
  portTypeAndProtocolChartData: UnityChartDetails;
  cabledByNodeChartData: UnityChartDetails;
}

export class RecentAlertsViewData extends NetappStorageSectionViewData {
  viewType: 'table' | 'chart' = 'chart';
  tableViewData: RecentAlertsTableViewData[] = [];
  tableCount: number = 0;
  summaryViewData: RecentAlertsSummaryViewData;
  chartViewData: RecentAlertsChartViewData;
}

export class RecentAlertsTableViewData {
  id: number;
  device: string;
  count: number;
  event: string;
  time: string;
  severity: string;
  severityIcon: string;
  severityClass: string;
  description: string;
  status: string;
  statusClass: string;
  source: string;
}

export class RecentAlertsSummaryViewData {
  totalAlerts: number;
  critical: number;
  warning: number;
  information: number;
}

export class RecentAlertsChartViewData {
  hasData = false;
  severityDistributionChartData: UnityChartDetails;
  alertTimelineChartData: UnityChartDetails;
}

export class AutoRemediationViewData {
  hidden: boolean = false;
  hasSummaryData: boolean = false;
  summaryViewData: AutoRemediationSummaryViewData;
}

export class AutoRemediationSummaryViewData {
  autoRemediations: number;
  avgMttr: string;
  runbookSuccess: string;
  runbookFailures: number;
}
