import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EChartsOption } from 'echarts';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { CUSTOM_DASHBOARD_CHART_DATA, CUSTOM_DASHBOARD_TABLE_DATA } from '../app-custom-dashboards-endpoint.const';
import { CUSTOM_DASHBOARD_CHART_TYPES, CUSTOM_DASHBOARD_PREVIEW_POINTS, getCustomDashboardMetricKey } from '../app-custom-dashboards.const';
import { CustomDashboardChartData, CustomDashboardMetric, CustomDashboardPanelConfiguration, CustomDashboardTableColumn, CustomDashboardTableData, CustomDashboardWidget } from '../app-custom-dashboards.type';

const AXIS_DATE_FORMAT = 'MMM DD, HH:mm';

@Injectable()
export class AppCustomDashboardPanelPreviewService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService) { }

  getChartData(widget: CustomDashboardWidget, timeframe: string, filters: { [key: string]: string[] }): Observable<CustomDashboardChartData> {
    let params: HttpParams = new HttpParams()
      .set('metrics', JSON.stringify(widget.metrics))
      .set('chart_type', widget.chart_type)
      .set('timeframe', timeframe)
      .set('points', CUSTOM_DASHBOARD_PREVIEW_POINTS);
    if (widget.variant) {
      params = params.set('variant', widget.variant);
    }
    if (filters && Object.keys(filters).length) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.http.get<CustomDashboardChartData>(CUSTOM_DASHBOARD_CHART_DATA(), { params });
  }

  getTableData(columns: CustomDashboardTableColumn[], timeframe: string, filters: { [key: string]: string[] }): Observable<CustomDashboardTableData> {
    let params: HttpParams = new HttpParams()
      .set('columns', JSON.stringify(columns))
      .set('timeframe', timeframe)
      .set('points', CUSTOM_DASHBOARD_PREVIEW_POINTS)
      .set('sort', 'clock')
      .set('order', 'desc');
    if (filters && Object.keys(filters).length) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.http.get<CustomDashboardTableData>(CUSTOM_DASHBOARD_TABLE_DATA(), { params });
  }

  // Legend / KPI labels come from the panel's table column headers (the builder fills them
  // with "<device> - <item>"); anything without a column falls back to the API item name.
  getMetricLabels(panel: CustomDashboardPanelConfiguration): { [key: string]: string } {
    const labels: { [key: string]: string } = {};
    (panel.table_columns || []).forEach(c => labels[getCustomDashboardMetricKey(c.metric)] = c.header);
    return labels;
  }

  getChartTypeLabel(chartType: string): string {
    const type = CUSTOM_DASHBOARD_CHART_TYPES.find(t => t.value === chartType);
    return type ? type.label : chartType;
  }

  convertToWidgetViewData(data: CustomDashboardChartData, labels: { [key: string]: string }): CustomDashboardWidgetChartView {
    const view: CustomDashboardWidgetChartView = new CustomDashboardWidgetChartView();
    if (data.chart_type === 'single') {
      view.kpiValues = (data.data || []).map(d => ({
        label: this.getLabel(labels, d, d.name),
        value: d.value === null || d.value === undefined ? 'NA' : `${d.value}`,
        unit: d.unit
      }));
      return view;
    }
    if (data.chart_type === 'pie' || data.chart_type === 'treemap') {
      const points = (data.data || []).map(d => ({ name: this.getLabel(labels, d, d.name), value: d.value }));
      view.chartData = points.length ? this.convertToValueChart(data.chart_type, points) : null;
      return view;
    }
    view.chartData = (data.series || []).length ? this.convertToSeriesChart(data, labels) : null;
    return view;
  }

  convertToTableViewData(data: CustomDashboardTableData): CustomDashboardTableView {
    const view: CustomDashboardTableView = new CustomDashboardTableView();
    const visibleIndexes: number[] = [];
    data.columns.forEach((c, i) => {
      if (!c.hidden) {
        visibleIndexes.push(i);
        view.headers.push(c.unit ? `${c.header} (${c.unit})` : c.header);
      }
    });
    view.rows = data.rows.map(row => ({
      clock: row[0],
      time: this.utilSvc.toUnityOneDateFormat(row[0] * 1000),
      values: visibleIndexes.map(i => row[i + 1] === null || row[i + 1] === undefined ? 'NA' : `${row[i + 1]}`)
    }));
    return view;
  }

  private getLabel(labels: { [key: string]: string }, metric: { device_type: string, device_id: string, item_id: number, aggregation: string }, fallback: string): string {
    const key = getCustomDashboardMetricKey(metric as CustomDashboardMetric);
    return labels[key] || fallback;
  }

  private convertToSeriesChart(data: CustomDashboardChartData, labels: { [key: string]: string }): UnityChartDetails {
    const chart: UnityChartDetails = new UnityChartDetails();
    const isBar = data.chart_type === 'bar';
    chart.type = isBar ? UnityChartTypes.BAR : UnityChartTypes.LINE;
    chart.extensions = this.chartConfigSvc.getChartExtensions(chart.type);
    const options: EChartsOption = isBar ? this.chartConfigSvc.getDefaultVerticalBarChartOptions() : this.chartConfigSvc.getDefaultLineChartOptions();
    const clocks = data.series[0].data.map(p => p.clock);
    const hasLegend = data.series.length > 1;
    options.grid = { left: '3%', right: '4%', top: '6%', bottom: hasLegend ? 40 : '3%', containLabel: true };
    options.xAxis = { type: 'category', data: clocks.map(c => this.utilSvc.toUnityOneDateFormat(c * 1000, AXIS_DATE_FORMAT)) };
    options.yAxis = { type: 'value' };
    if (hasLegend) {
      options.legend = { type: 'scroll', bottom: 0 };
    }
    // echarts series tuples are an accepted `any` boundary.
    const series: any[] = data.series.map(s => ({
      name: this.getLabel(labels, s, s.name),
      type: isBar ? 'bar' : 'line',
      smooth: !isBar,
      showSymbol: false,
      areaStyle: data.chart_type === 'area' ? {} : undefined,
      data: s.data.map(p => p.value)
    }));
    options.series = series;
    chart.options = options;
    return chart;
  }

  private convertToValueChart(chartType: string, points: { name: string, value: number }[]): UnityChartDetails {
    const chart: UnityChartDetails = new UnityChartDetails();
    if (chartType === 'treemap') {
      chart.type = UnityChartTypes.TREE_MAP;
      chart.extensions = this.chartConfigSvc.getChartExtensions(chart.type);
      chart.options = {
        tooltip: { trigger: 'item' },
        series: [{ type: 'treemap', roam: false, nodeClick: false, breadcrumb: { show: false }, data: points }]
      };
      return chart;
    }
    chart.type = UnityChartTypes.PIE;
    chart.extensions = this.chartConfigSvc.getChartExtensions(chart.type);
    const options: EChartsOption = this.chartConfigSvc.getDefaultPieChartOptions();
    options.legend = { type: 'scroll', bottom: 0 };
    options.series = [{ type: 'pie', radius: ['40%', '65%'], center: ['50%', '45%'], data: points }];
    chart.options = options;
    return chart;
  }
}

export class CustomDashboardWidgetChartView {
  chartData: UnityChartDetails = null;
  kpiValues: { label: string, value: string, unit: string }[] = [];
  constructor() { }
}

export class CustomDashboardWidgetViewData {
  id: string;
  title: string;
  chartTypeLabel: string;
  loader: string;
  chartData: UnityChartDetails = null;
  kpiValues: { label: string, value: string, unit: string }[] = [];
  message: string = '';
  constructor() { }
}

export class CustomDashboardTableView {
  headers: string[] = [];
  rows: { clock: number, time: string, values: string[] }[] = [];
  constructor() { }
}
