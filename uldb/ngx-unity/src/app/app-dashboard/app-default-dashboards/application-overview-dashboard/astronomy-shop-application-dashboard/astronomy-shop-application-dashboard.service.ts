import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EChartsOption, SeriesOption } from 'echarts';
import * as echarts from 'echarts';
import moment from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import { PCFastData } from 'src/app/app-home/infra-as-a-service/private-cloud/pc-fast.type';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { AppUtilityService, DateRange, PlatFormMapping, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DurationDropdownType } from 'src/app/shared/SharedEntityTypes/dashboard/iot-devices-summary-dashboard.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

/**
 * Data service for the Astronomy Shop Application Dashboard.
 *
 * Merges all widget-level services (customer behavior, conversion, traffic,
 * performance, revenue, services overview, component/process/db/host overview,
 * infrastructure, and critical alerts) into a single injectable.
 *
 * Every public method falls into one of two categories:
 *  - `get*`       — HTTP call that returns a raw Observable from the backend.
 *  - `convertTo*` — Pure transform that maps the raw response to a `UnityChartDetails`
 *                   object ready for the `<unity-chart>` component.
 */
@Injectable()
export class AstronomyShopApplicationDashboardService {

  constructor(
    private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
  ) { }

  // ── Common Helpers ──────────────────────────────────────────────────────────

  /**
   * Builds `HttpParams` containing only `from` and `to` date strings formatted
   * per `DateRange.format`. Used by most customer-behavior and conversion endpoints.
   * @param selectedDateRangeFormData The currently selected date-range filter.
   */
  converteDropdownsDataToApiParamsData(selectedDateRangeFormData: DurationDropdownType): HttpParams {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    const from = selectedDateRangeFormData?.from;
    const to = selectedDateRangeFormData?.to;
    if (from) { params = params.set('from', moment(from).format(format)); }
    if (to) { params = params.set('to', moment(to).format(format)); }
    return params;
  }

  /**
   * Builds `HttpParams` for the `/apm/business_summary/data/` endpoint used by
   * Components / Process / Database overview charts.
   * Appends `app_id`, `key` (metric name), `type` (entity type), `from` and `to`.
   * @param dropdownsViewData  Selected date-range filter.
   * @param selectedApps       Numeric application ID.
   * @param key                Metric key (e.g. `'response_time'`, `'availability'`).
   * @param type               Entity type (e.g. `'component'`, `'process'`, `'database'`).
   */
  converteDropdownsDataToApiParamsDataForMetrics(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): HttpParams {
    let params: HttpParams = new HttpParams();
    if (selectedApps) { params = params.append('app_id', selectedApps.toString()); }
    params = params.set('key', key);
    params = params.set('type', type);
    const format = new DateRange().format;
    const from = dropdownsViewData?.from;
    const to = dropdownsViewData?.to;
    if (from) { params = params.set('from', moment(from).format(format)); }
    if (to) { params = params.set('to', moment(to).format(format)); }
    return params;
  }

  /**
   * Builds `HttpParams` for the `/apm/business_summary/graph/` endpoint used by Host Overview charts.
   * Appends `app_id`, `graph_type`, `from` and `to`.
   * @param dropdownsViewData  Selected date-range filter.
   * @param selectedApps       Numeric application ID.
   * @param key                Graph type key (e.g. `'cpu_utilization'`, `'mem_usage'`).
   */
  converteDropdownsDataToApiParamsForHostData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string): HttpParams {
    let params: HttpParams = new HttpParams();
    if (selectedApps) { params = params.append('app_id', selectedApps.toString()); }
    params = params.set('graph_type', key);
    const format = new DateRange().format;
    const from = dropdownsViewData?.from;
    const to = dropdownsViewData?.to;
    if (from) { params = params.set('from', moment(from).format(format)); }
    if (to) { params = params.set('to', moment(to).format(format)); }
    return params;
  }

  /**
   * Shared factory for all single-series area line charts in this dashboard.
   * Applies a consistent layout (title, grid, dataZoom slider, tooltip) and
   * generates a matching gradient area fill from the provided hex color.
   *
   * @param options      Base ECharts options from `UnityChartConfigService`.
   * @param data         X-axis category labels (date strings or ranges).
   * @param values       Y-axis data points aligned to `data`.
   * @param title        Chart title rendered above the plot area.
   * @param yAxisName    Optional Y-axis label (e.g. `'Response Time (ms)'`).
   * @param seriesName   Series name shown in tooltip and legend (e.g. `'Error Rate'`).
   * @param seriesColor  6-digit hex color for the line and gradient fill (e.g. `'#FF6B6B'`).
   */
  getCommonLineChartOptions(options: EChartsOption, data: any[], values: any[], title?: string, yAxisName?: string, seriesName?: string, seriesColor?: string): EChartsOption {
    const color = seriesColor ?? '#5B8FF9';
    const colorRgba = (opacity: number) => {
      // Convert hex to rgba for gradient — parse r,g,b from 6-digit hex
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${opacity})`;
    };
    return {
      ...options,
      title: {
        text: title,
        left: 'center',
        top: '0%',
        textStyle: {
          fontFamily: UNITY_FONT_FAMILY(),
          fontSize: 13,
          fontWeight: 500,
          color: UNITY_TEXT_DEFAULT_COLOR()
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#000' },
        trigger: 'axis',
      },
      grid: { top: '20%', left: '5%', right: '3%', bottom: '20%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data,
        axisLabel: { hideOverlap: true, formatter: (value: string) => value },
      },
      yAxis: { type: 'value', name: yAxisName },
      dataZoom: [{
        type: 'slider', xAxisIndex: [0], height: 15, width: '80%', right: '8%',
        handleSize: '100%', showDataShadow: true, filterMode: 'empty', realtime: false,
      }],
      series: [{
        name: seriesName ?? 'Value', type: 'line', symbol: 'circle', symbolSize: 6,
        smooth: true,
        itemStyle: { color },
        lineStyle: { width: 3, color },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgba(0.4) },
            { offset: 1, color: colorRgba(0.05) },
          ]),
        },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 10, shadowColor: colorRgba(0.5) } },
        data: values,
      }],
    };
  }

  // ── Customer Behavior Insights ──────────────────────────────────────────────

  /**
   * GET `/apm/app_list/{appId}/funnels/`
   * Returns a flat object mapping stage names (`sessions`, `carts`, `orders`) to counts.
   */
  getSessionToOrderFunnel(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/funnels/`, { params });
  }

  /**
   * GET `/apm/app_list/{appId}/returning_customers/`
   * Returns a map of product category names to returning-customer counts.
   */
  getReturningCustomerCategory(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/returning_customers/`, { params });
  }

  /**
   * GET `/apm/app_list/{appId}/new_customers_monthly/`
   * Returns an object with a `new_customers` array, each item containing `range` and `total`.
   */
  getNewCustomers(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: any }>(`/apm/app_list/${appId}/new_customers_monthly/`, { params });
  }

  /**
   * Converts raw funnel counts into a 3-layer ECharts funnel chart.
   *
   * Layer widths are manually normalized so every level is always visible:
   *  - Sessions → 100 (fixed, widest layer)
   *  - Orders   → 10  (fixed floor)
   *  - Carts    → 15–20, interpolated via `log10(carts/orders)` so the gap between
   *               carts and orders is visually proportional without swamping the orders bar.
   *
   * Actual counts (not normalized values) are carried on each data item via a custom
   * `actualValue` property and surfaced in labels and tooltips.
   */
  convertToSessionToOrderFunnelChartData(graphData: { [key: string]: number }): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.FUNNEL;
    view.options = this.chartConfigSvc.getDefaultFunnelChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.FUNNEL);
    // Title is anchored at the funnel body's horizontal center (left:'5%' + width:'55%'/2 ≈ 32%)
    // so it visually sits above the funnel shape rather than the label area.
    view.options.title = {
      text: 'Session to Order Funnel', left: '32%', textAlign: 'center',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.legend = { data: ['Sum of sessions', 'Sum of carts', 'Sum of orders'], bottom: 0 };

    // Manually normalize layer widths so each level is always clearly visible:
    //   Sessions  → always 100  (widest, top of funnel)
    //   Orders    → always 10   (fixed floor for the 3rd layer)
    //   Carts     → 15–20, interpolated by log10(carts/orders):
    //               small gap between carts & orders → closer to 15
    //               large gap between carts & orders → closer to 20
    // minSize is set to '0%' because we control the floor ourselves via the values above.
    const orderNormValue = 10;
    const cartToOrderRatio = (graphData.carts > 0 && graphData.orders > 0)
      ? graphData.carts / graphData.orders : 1;
    const gapFactor = Math.min(1, Math.log10(Math.max(1, cartToOrderRatio)) / 2);
    const cartNormValue = Math.round(15 + 5 * gapFactor); // 15 when gap≈0, up to 20 when gap≥100×

    view.options.tooltip = {
      trigger: 'item',
      formatter: (params: any) => `${params.name}: <strong>${(params.data.actualValue ?? 0).toLocaleString()}</strong>`
    };
    view.options.series = [{
      name: 'Funnel', type: 'funnel', left: '5%', top: 40, bottom: 30, width: '55%',
      min: 0, minSize: '0%', maxSize: '100%', sort: 'descending', gap: 4,
      label: {
        show: true, position: 'right',
        formatter: (params: any) => `${params.name}\n${(params.data.actualValue ?? 0).toLocaleString()}`,
        color: '#333333', fontSize: 12, lineHeight: 18
      },
      labelLine: { length: 12, lineStyle: { width: 1, type: 'solid', color: '#999' } },
      itemStyle: { borderColor: '#fff', borderWidth: 1 },
      data: [
        { value: 100,            actualValue: graphData.sessions, name: 'Sum of sessions', itemStyle: { color: '#03A9F4' } },
        { value: cartNormValue,  actualValue: graphData.carts,    name: 'Sum of carts',    itemStyle: { color: '#FF9800' } },
        { value: orderNormValue, actualValue: graphData.orders,   name: 'Sum of orders',   itemStyle: { color: '#3F51B5' } }
      ] as any[]
    }];
    return view;
  }

  /**
   * Converts category → count map into a horizontal bar chart ("Available Product Category Wise").
   * Bars use a purple gradient fill; Y-axis labels are truncated at 120 px with full-name tooltip.
   */
  convertToReturningCustomerCategoryChartData(graphData: { [key: string]: number }): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      text: 'Available Product Category Wise', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.grid = { top: '12%', left: '5%', right: '10%', bottom: '8%', containLabel: true };
    view.options.xAxis = { type: 'value', axisLabel: { formatter: (val: number) => val.toLocaleString() } };
    view.options.yAxis = {
      type: 'category', data: Object.keys(graphData),
      axisTick: { show: true }, axisLine: { show: true },
      axisLabel: { width: 120, overflow: 'truncate', formatter: (value: string) => value },
      tooltip: { show: true }
    };
    view.options.series = [{
      name: 'Category', type: 'bar', barMaxWidth: 35, data: Object.values(graphData),
      label: { show: true, position: 'right', color: '#333333', fontWeight: 400, formatter: (params: any) => params.value.toLocaleString() },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#5D2F77' },
          { offset: 1, color: '#9C6BA8' }
        ])
      },
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(93,47,119,0.4)' } }
    }];
    view.options.tooltip = { ...view.options.tooltip, formatter: (params: any) => `${params[0].name} : <strong>${params[0].value.toLocaleString()}</strong>` };
    view.options.legend = { show: false };
    return view;
  }

  /**
   * Converts the `new_customers` monthly array into a vertical bar chart ("New Customers").
   * Each bar represents one date-range bucket; values are locale-formatted on bar tops.
   */
  convertToNewCustomersChartData(graphData: { [key: string]: any }): UnityChartDetails {
    if (graphData?.new_customers?.length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const xxisData: string[] = [];
    const yxisData: number[] = [];
    graphData?.new_customers?.forEach(d => xxisData.push(d.range));
    graphData?.new_customers?.forEach(d => yxisData.push(d.total));
    view.options.title = {
      text: 'New Customers', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.grid = { top: '15%', bottom: '8%', containLabel: true };
    view.options.xAxis = { type: 'category', data: xxisData, axisLabel: { interval: 0 } };
    view.options.yAxis = { type: 'value', tooltip: { show: true } };
    view.options.series = [{
      type: 'bar', barMaxWidth: 35, data: yxisData,
      label: { show: true, position: 'top', color: '#333333', fontWeight: 400, formatter: (params: any) => params.value.toLocaleString() },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#03A9F4' },
          { offset: 1, color: '#0288D1' }
        ])
      },
      barCategoryGap: '40%',
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(3,169,244,0.4)' } }
    }];
    view.options.tooltip = { ...view.options.tooltip, formatter: (params: any) => `${params[0].name} : <strong>${params[0].value.toLocaleString()}</strong>` };
    view.options.legend = { show: false };
    return view;
  }

  // ── Conversion & Sales Funnel ───────────────────────────────────────────────

  /**
   * GET `/apm/app_list/{appId}/checkout_abandon_rate/`
   * Returns a map of country names to conversion counts (raw values, not percentages).
   */
  getCheckoutAbondanRate(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/checkout_abandon_rate/`, { params });
  }

  /**
   * GET `/apm/app_list/{appId}/conversion_rate_monthly/`
   * Returns a map of month labels to conversion rate values (as percentage strings).
   */
  getConversionRate(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<any>(`/apm/app_list/${appId}/conversion_rate_monthly/`, { params });
  }

  /**
   * GET `/apm/app_list/{appId}/orders_placed_by_month/`
   * Returns a map of month labels to order counts.
   */
  getOrderPlced(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<any>(`/apm/app_list/${appId}/orders_placed_by_month/`, { params });
  }

  /**
   * GET `/apm/app_list/{appId}/new_vs_returning_customers/`
   * Returns `{ new_customers: [{period, sum}], returning_customers: [{period, sum}] }`.
   */
  getNewVsReturningCustomers(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<any>(`/apm/app_list/${appId}/new_vs_returning_customers/`, { params });
  }

  /**
   * Converts country → conversion-count map into a horizontal bar chart
   * ("Conversion Count By Top Country"). Values are raw counts (not percentages).
   * Bars use a teal gradient; Y-axis labels truncated at 120 px.
   */
  convertToCheckoutAbondanRateChartData(graphData: { [key: string]: string }): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const yAxisData = Object.keys(graphData);
    const xAxisData = Object.values(graphData).map(val => parseFloat(val));
    view.options.title = {
      text: 'Conversion Count By Top Country', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.grid = { top: '15%', left: '5%', right: '10%', bottom: '15%', containLabel: true };
    view.options.xAxis = { type: 'value', min: 0, axisLabel: { formatter: (val: number) => val.toLocaleString() } };
    view.options.yAxis = {
      type: 'category', data: yAxisData, axisTick: { show: true }, axisLine: { show: true },
      axisLabel: { width: 120, overflow: 'truncate', formatter: (value: string) => value }, tooltip: { show: true }
    };
    view.options.series = [{
      name: 'Category', type: 'bar', barMaxWidth: 35, data: xAxisData,
      label: { show: true, position: 'right', color: '#333333', fontWeight: 400, formatter: (params: any) => params.value.toLocaleString() },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#0f5359' },
          { offset: 1, color: '#1a8a94' }
        ])
      },
      barCategoryGap: '40%',
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(15,83,89,0.4)' } }
    }];
    view.options.tooltip = { ...view.options.tooltip, formatter: (params: any) => `${params[0].name} : <strong>${params[0].value.toLocaleString()}</strong>` };
    view.options.legend = { show: false };
    return view;
  }

  /**
   * Converts month → rate map into a vertical bar chart ("Conversion Rate").
   * Labels show `{value}%` format; color is green (`#4CAF50`) to distinguish
   * it from the New Customers chart which uses blue.
   */
  convertToConversionRateChartData(graphData: { [key: string]: string }): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const xAxisData = Object.keys(graphData);
    const yAxisData = Object.values(graphData).map(val => parseFloat(val));
    view.options.title = {
      text: 'Conversion Rate', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.grid = { top: '15%', bottom: '15%', containLabel: true };
    view.options.xAxis = { type: 'category', data: xAxisData, axisLabel: { interval: 0 } };
    view.options.yAxis = { type: 'value', tooltip: { show: true } };
    view.options.series = [{
      type: 'bar', barMaxWidth: 35, data: yAxisData,
      label: { show: true, position: 'top', color: '#333333', fontWeight: 400, formatter: (params: any) => `${params.value}%` },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4CAF50' },
          { offset: 1, color: '#2E7D32' }
        ])
      },
      barCategoryGap: '40%',
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(76,175,80,0.4)' } }
    }];
    view.options.tooltip = { ...view.options.tooltip, formatter: (params: any) => `${params[0].name} : <strong>${params[0].value}%</strong>` };
    view.options.legend = { show: false };
    return view;
  }

  /**
   * Converts month → order-count map into a vertical bar chart ("Orders Placed").
   * Bars use a purple gradient; locale-formatted values appear on bar tops.
   */
  convertToOrderPlcedChartData(graphData: any): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      text: 'Orders Placed', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.grid = { top: '15%', bottom: '15%', containLabel: true };
    view.options.xAxis = { type: 'category', data: Object.keys(graphData), axisLabel: { interval: 0 } };
    view.options.yAxis = { type: 'value', tooltip: { show: true } };
    view.options.series = [{
      type: 'bar', barMaxWidth: 35, data: Object.values(graphData),
      label: { show: true, position: 'top', color: '#333333', fontWeight: 400, formatter: (params: any) => params.value.toLocaleString() },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#7B3FA0' },
          { offset: 1, color: '#5D2F77' }
        ])
      },
      barCategoryGap: '40%',
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(93,47,119,0.4)' } }
    }];
    view.options.tooltip = { ...view.options.tooltip, formatter: (params: any) => `${params[0].name} : <strong>${params[0].value.toLocaleString()}</strong>` };
    view.options.legend = { show: false };
    return view;
  }

  /**
   * Converts `{ new_customers }` array into a vertical bar chart ("New Customers").
   * Shows only new customer counts per period; bars use a blue gradient with
   * locale-formatted labels on top.
   */
  convertToNewVsReturningCustomersChartdata(graphData: any): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const periods = graphData?.new_customers.map((item: any) => item.period);
    const newCustomersData = graphData?.new_customers.map((item: any) => item.sum);
    view.options.title = {
      text: 'New Customers', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.grid = { top: '15%', left: '5%', right: '5%', bottom: '15%', containLabel: true };
    view.options.xAxis = { type: 'category', data: periods, axisLabel: { interval: 0 } };
    view.options.yAxis = { type: 'value', tooltip: { show: true } };
    view.options.series = [{
      name: 'New Customers', type: 'bar', barMaxWidth: 35, data: newCustomersData,
      label: { show: true, position: 'top', color: '#333333', fontWeight: 400, formatter: (params: any) => params.value.toLocaleString() },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#39bdfa' },
          { offset: 1, color: '#0288D1' }
        ])
      },
      barCategoryGap: '40%',
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(57,189,250,0.4)' } }
    }];
    view.options.tooltip = { ...view.options.tooltip, formatter: (params: any) => `${params[0].name} : <strong>${params[0].value.toLocaleString()}</strong>` };
    view.options.legend = { show: false };
    return view;
  }

  // ── Traffic & Engagement ────────────────────────────────────────────────────

  /**
   * GET `/apm/app_list/{appId}/top_categories_by_product_views/`
   * Returns a map of country names to view counts for the top-viewed product categories.
   */
  getCategoriesViewedWidgetViewData(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: number }>(`/apm/app_list/${appId}/top_categories_by_product_views/`, { params });
  }

  /**
   * GET `/apm/app_list/{appId}/traffic_source_row_percentage/`
   * Returns a map of traffic source names to percentage strings (e.g. `"35.2"`).
   */
  getTrafficSourceOverGivenPeriod(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/traffic_source_row_percentage/`, { params });
  }

  /**
   * GET `/apm/app_list/{appId}/new_customers_monthly/`
   * Re-uses the new-customers endpoint to estimate unique visitor counts over time.
   */
  getUniqueVisitors(appId: number, selectedDateRangeFormData: DurationDropdownType) {
    const params = this.converteDropdownsDataToApiParamsData(selectedDateRangeFormData);
    return this.http.get<{ [key: string]: any }>(`/apm/app_list/${appId}/new_customers_monthly/`, { params });
  }

  /**
   * Converts country → view-count map into a horizontal bar chart ("Top Countries Count").
   * Uses a dark-teal gradient fill; bar-end labels are shown (previously hidden — now enabled).
   * Y-axis labels truncated at 120 px with tooltip for full names.
   */
  convertToCategoriesViewedWidgetViewDataChartData(graphData: { [key: string]: number }): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const yAxisData = Object.keys(graphData);
    const xAxisData = Object.values(graphData);
    view.options.title = {
      text: 'Top Countries Count', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.grid = { top: '15%', left: '5%', right: '10%', bottom: '15%', containLabel: true };
    view.options.xAxis = { type: 'value', min: 0, axisLabel: { formatter: (val: number) => val.toLocaleString() } };
    view.options.yAxis = {
      type: 'category', data: yAxisData, axisTick: { show: true }, axisLine: { show: true },
      axisLabel: { width: 120, overflow: 'truncate', formatter: (value: string) => value }, tooltip: { show: true }
    };
    view.options.series = [{
      name: 'Category', type: 'bar', barMaxWidth: 35, data: xAxisData,
      label: { show: true, position: 'right', color: '#333333', fontWeight: 400, formatter: (params: any) => params.value.toLocaleString() },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#297380' },
          { offset: 1, color: '#3EA8B8' }
        ])
      },
      barCategoryGap: '40%',
      emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(41,115,128,0.4)' } }
    }];
    view.options.tooltip = { ...view.options.tooltip, formatter: (params: any) => `${params[0].name} : <strong>${params[0].value.toLocaleString()}</strong>` };
    view.options.legend = { show: false };
    return view;
  }

  /**
   * Converts traffic-source → percentage map into a donut chart ("Traffic Source Over Given Period").
   * Uses `radius: ['35%', '62%']` for the donut ring; `avoidLabelOverlap` is enabled to prevent
   * label collisions when many small slices are present.
   */
  convertToTrafficSourceOverGivenPeriodChartData(graphData: { [key: string]: string }): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    view.options.title = {
      text: 'Traffic Source Over Given Period', left: 'center', top: '0%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    view.options.tooltip = { trigger: 'item', formatter: (params: any) => `${params.name}: ${params.value}% (${params.percent}%)` };
    view.options.legend = { left: 'center', bottom: 0, type: 'scroll' };
    view.options.series = [{
      type: 'pie', radius: ['35%', '62%'], center: ['50%', '48%'],
      data: Object.entries(graphData).map(([key, value]) => ({ name: key, value: parseFloat(value) })),
      avoidLabelOverlap: true,
      label: { show: true, formatter: '{b}\n{d}%', lineHeight: 16, overflow: 'break' },
      labelLine: { length: 10, length2: 8 },
      emphasis: { focus: 'self', itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.4)' } }
    }];
    return view;
  }

  /**
   * Converts the `new_customers` monthly array into a smooth area line chart
   * ("Users - Unique Visitors (Estimated)") using the shared `getCommonLineChartOptions` builder.
   */
  convertToUniqueVisitorsChartData(graphData: { [key: string]: any }): UnityChartDetails {
    if (Object.keys(graphData).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const labels = graphData?.new_customers?.map(d => d.range);
    const values = graphData?.new_customers?.map(d => d.total);
    view.options = this.getCommonLineChartOptions(view.options, labels, values, 'Users - Unique Visitors (Estimated)', undefined, 'Unique Visitors', '#5B8FF9');
    return view;
  }

  // ── Performance & Reliability ───────────────────────────────────────────────

  /**
   * GET `/apm/app_list/{appId}/metric_timeseries/?metric=avg_response_time`
   * Returns a time-series array of `{ range, sum }` objects for application response time.
   */
  getApplicationResponseTimeChartData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'avg_response_time').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params });
  }

  /**
   * Converts response-time timeseries into a smooth blue area line chart
   * ("Application Response Time (ms)"). Series name: `'Response Time'`.
   */
  convertApplicationResponseTimeChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);
    view.options = this.getCommonLineChartOptions(view.options, labels, values, 'Application Response Time (ms)', 'Response Time (ms)', 'Response Time', '#5B8FF9');
    return view;
  }

  /**
   * GET `/apm/app_list/{appId}/metric_timeseries/?metric=error_rate`
   * Returns a time-series array of `{ range, sum }` objects for error rate (% of interactions).
   */
  getErrorRateData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'error_rate').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params });
  }

  /**
   * Converts error-rate timeseries into a smooth red (`#FF6B6B`) area line chart
   * ("Error Rate (% of Failed Interactions)"). Series name: `'Error Rate'`.
   */
  convertErrorRateChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);
    view.options = this.getCommonLineChartOptions(view.options, labels, values, 'Error Rate (% of Failed Interactions)', 'Error Rate (%)', 'Error Rate', '#FF6B6B');
    return view;
  }

  /**
   * GET `/apm/app_list/{appId}/metric_timeseries/?metric=payment_failure_rate`
   * Returns a time-series array of `{ range, sum }` objects for payment failure rate.
   */
  getPaymentFailureData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'payment_failure_rate').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params });
  }

  /**
   * Converts payment-failure timeseries into a smooth amber (`#FFA940`) area line chart
   * ("Payment Failure Rate (%)"). Series name: `'Payment Failure Rate'`.
   */
  convertPyamentFailureChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);
    view.options = this.getCommonLineChartOptions(view.options, labels, values, 'Application Failure Rate (%)', 'Failure Rate (%)', 'Application Failure Rate', '#FFA940');
    return view;
  }

  /**
   * GET `/apm/app_list/{appId}/metric_timeseries/?metric=payment_gateway_latency`
   * Returns a time-series array of `{ range, sum }` objects for payment gateway latency (ms).
   */
  getPayemntGatewayLatencyData(appId: number, from: string, to: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('metric', 'payment_gateway_latency').set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<any[]>(`/apm/app_list/${appId}/metric_timeseries/`, { params });
  }

  /**
   * Converts payment-gateway latency timeseries into a vertical bar chart
   * ("Payment Gateway Latency (ms)"). Bars use a teal gradient with value labels on top;
   * `barMaxWidth: 40` prevents bars from becoming too wide on sparse date ranges.
   */
  convertPayemntGatewayLatencyChartData(data: any[]): UnityChartDetails {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const labels = data.map(d => d.range);
    const values = data.map(d => d.sum);
    view.options = {
      ...view.options,
      title: {
        text: 'Application Latency (ms)', left: 'center', top: '0%',
        textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: '20%', left: '5%', right: '5%', bottom: '20%', containLabel: true },
      xAxis: { type: 'category', data: labels, name: 'Date', axisTick: { alignWithLabel: true } },
      yAxis: { type: 'value', name: 'Latency (ms)' },
      dataZoom: [{ type: 'slider', xAxisIndex: [0], height: 15, width: '80%', right: '10%', handleSize: '100%', showDataShadow: true, filterMode: 'empty', realtime: false }],
      series: [{
        name: 'Latency', type: 'bar', barMaxWidth: 40, data: values,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1A9BAD' },
            { offset: 1, color: '#106C77' }
          ])
        },
        label: { show: true, position: 'top', color: '#333333', fontSize: 11, formatter: (params: any) => params.value > 0 ? params.value.toLocaleString() : '' },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(16,108,119,0.4)' } }
      }]
    };
    return view;
  }

  // ── Revenue & Customer Value ────────────────────────────────────────────────

  /**
   * GET `/apm/app_list/{appId}/revenue_by_top_category/`
   * Returns a map of product category names to revenue values (as numeric strings).
   */
  getRevenueByCategoryChartData(appId: number, from: string, to: string): Observable<{ [key: string]: string }> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/revenue_by_top_category/`, { params });
  }

  /**
   * Converts category → revenue map into a donut chart ("Revenue By Category")
   * via the shared `getCommonPieChartOptions` helper.
   * Labels show locale-formatted value + percentage; tooltip is free of unit suffixes.
   */
  convertRevenueByCategoryChartData(data: { [key: string]: string }): UnityChartDetails {
    if (Object.keys(data).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let gData = Object.keys(data).map(k => ({ name: k, value: data[k] }));
    view.options = this.getCommonPieChartOptions(view.options, gData, 'Revenue By Category', 'revenue category');
    return view;
  }

  /**
   * GET `/apm/app_list/{appId}/revenue_by_traffic_source/`
   * Returns a map of traffic source names to revenue values (as numeric strings).
   */
  getRevenueByTrafficSourceChartData(appId: number, from: string, to: string): Observable<{ [key: string]: string }> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<{ [key: string]: string }>(`/apm/app_list/${appId}/revenue_by_traffic_source/`, { params });
  }

  /**
   * Converts traffic-source → revenue map into a donut chart ("Revenue By Traffic Source")
   * via the shared `getCommonPieChartOptions` helper.
   */
  convertRevenueByTrafficSourceChartData(data: { [key: string]: string }): UnityChartDetails {
    if (Object.keys(data).length == 0) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let gData = Object.keys(data).map(k => ({ name: k, value: data[k] }));
    view.options = this.getCommonPieChartOptions(view.options, gData, 'Revenue By Traffic Source', 'Revenue by traffic');
    return view;
  }

  /**
   * Shared factory for both revenue donut charts.
   * Configures a donut ring (`radius: ['35%', '65%']`), scrollable legend, locale-formatted
   * labels showing `name\nvalue (percent%)`, and `avoidLabelOverlap` to handle many slices.
   *
   * @param options    Base ECharts options from `UnityChartConfigService`.
   * @param data       Array of `{ name, value }` objects where value is a numeric string.
   * @param title      Chart title rendered above the plot.
   * @param chartName  Series name used internally by ECharts for legend/tooltip identification.
   */
  getCommonPieChartOptions(options: EChartsOption, data: any[], title?: string, chartName?: string): EChartsOption {
    options.series[0].name = chartName;
    options.series[0].data = data;
    options.series[0].radius = ['35%', '62%'];
    // Center shifted left so the donut sits clear of the right-side legend
    options.series[0].center = ['38%', '55%'];
    options.title = {
      text: title, left: '38%', textAlign: 'center', top: '2%',
      textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() }
    };
    // Legend placed at 67% from left — sits right next to the donut's right edge
    // (donut at center:38% + radius:62% of min(w,h) ≈ 60-67% of canvas width)
    options.legend = {
      ...options.legend, left: '67%', top: 'middle', type: 'scroll',
      orient: 'vertical', formatter: (name) => `${name}`
    };
    // Labels show only value + percent — name is already visible in the right legend
    options.series[0].label = {
      ...options.series[0].label,
      formatter: (params: any) => `${parseFloat(params.value).toLocaleString()}\n(${params.percent}%)`,
      overflow: 'break', lineHeight: 16
    };
    options.series[0].labelLine = { length: 10, length2: 8 };
    options.series[0].avoidLabelOverlap = true;
    options.series[0].emphasis = { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.4)' }, focus: 'self' };
    options.tooltip = { ...options.tooltip, formatter: (params: any) => `${params.name}: ${parseFloat(params.value).toLocaleString()} (${params.percent}%)` };
    return options;
  }

  /**
   * GET `/apm/app_list/{appId}/operational_anomaly_kpis/`
   * Returns `{ revenue_usd: [{period, sum}], revenue_24h_ma: [{period, sum}] }` for
   * the operational anomaly detection chart (revenue spike & drop overlay).
   * @deprecated Not currently used in the active dashboard UI.
   */
  getOperationalAnomalyDetectionKPIsChartData(appId: number, from: string, to: string): Observable<OperationalAnomalyType> {
    let params: HttpParams = new HttpParams();
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<OperationalAnomalyType>(`/apm/app_list/${appId}/operational_anomaly_kpis/`, { params });
  }

  /**
   * Converts operational anomaly KPI data into a stacked dual-line chart showing
   * raw `revenue_usd` vs the 24-hour moving average `revenue_24h_ma` over time.
   * @deprecated Not currently rendered in the active dashboard UI.
   */
  convertOperationalAnomalyDetectionChartData(data: OperationalAnomalyType): UnityChartDetails {
    if (!data?.revenue_usd?.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const periods = data.revenue_usd.map(item => item.period);
    const revenueUsdData = data.revenue_usd.map(item => item.sum);
    const revenue24hMaData = data.revenue_24h_ma.map(item => item.sum);
    view.options = {
      ...view.options,
      xAxis: { ...view.options.xAxis, type: 'category', boundaryGap: false, data: periods },
      yAxis: { type: 'value', name: 'Revenue Spike & Drop ($)' },
      dataZoom: [{ type: 'slider', xAxisIndex: [0], height: 15, width: '82%', right: '5%', handleSize: '100%', showDataShadow: true, filterMode: 'empty', realtime: false }],
      series: [
        { name: 'Revenue USD', type: 'line', stack: 'Total', data: revenueUsdData },
        { name: 'Revenue 24h MA', type: 'line', stack: 'Total', data: revenue24hMaData }
      ],
      grid: { top: '10%', left: '6%', right: '5%', bottom: '20%', containLabel: true },
      legend: { top: '0%', right: '6%', orient: 'horizontal' }
    };
    return view;
  }

  // ── Services Overview ───────────────────────────────────────────────────────

  /**
   * Paginated GET `/apm/monitoring/applist/?app_id={appId}`.
   * Returns the services table rows plus aggregate averages (`avg_throughput`,
   * `avg_latency`, `avg_availability`) shown as KPI badges above the table.
   * @param criteria  Current search, sort and pagination state.
   * @param appId     Numeric application ID to filter services by.
   */
  getServiceOverviewData(criteria: SearchCriteria, appId: number): Observable<AppResultsResponse> {
    return this.tableService.getData<AppResultsResponse>(`/apm/monitoring/applist/?app_id=${appId}`, criteria);
  }

  /**
   * Maps raw `AppResult` API records to `ServiceViewData` view-model objects.
   * Resolves `parent_app_status_code` to a Font Awesome icon class and tooltip message:
   * `'1'` → green check (Up), `'-1'`/null → yellow warning (Unknown), else → red triangle (Down).
   */
  convertToServiceViewData(data: AppResult[]): ServiceViewData[] {
    return data.map(s => {
      let a: ServiceViewData = new ServiceViewData();
      a.name = s.name;
      a.throughput = s.throughput ? s.throughput : 'N/A';
      a.parentAppAvailability = s.parent_app_availability ? s.parent_app_availability : 'N/A';
      a.parentAppStatusCode = s.parent_app_status_code;
      if (s.parent_app_status_code == '1') { a.icon = 'fa fa-check-circle text-success'; a.tooltipMessage = 'Up'; }
      else if (s.parent_app_status_code == '-1' || !s.parent_app_status_code) { a.icon = 'fa fa-exclamation-circle text-warning'; a.tooltipMessage = 'Unknown'; }
      else { a.icon = 'fa fa-triangle text-danger fa-exclamation'; a.tooltipMessage = 'Down'; }
      a.latency = s.latency ? s.latency : 'N/A';
      a.status = s.parent_app_status_code;
      return a;
    });
  }

  // ── Components / Process / DB / Host Overview ───────────────────────────────

  /**
   * GET `apm/business_summary/data/?key=response_time&type={type}`
   * Generic metric endpoint. Also used for availability and duration — key and type
   * together select the metric. Returns `{ data: [...], total_avg }`.
   */
  getResponseTimeData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsDataForMetrics(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params });
  }

  /**
   * GET `apm/business_summary/data/?key=availability&type={type}`
   * Availability variant of the generic metric endpoint. Returns `{ data: [...], total_avg }`.
   */
  getAvailabilityData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsDataForMetrics(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params });
  }

  /**
   * GET `apm/business_summary/data/?key=throughput&type={type}`
   * Throughput variant of the generic metric endpoint. Returns `{ data: [...], total_avg }`.
   */
  getThroughputData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsDataForMetrics(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params });
  }

  /**
   * GET `apm/business_summary/data/?key=total_queries&type=database`
   * Latency/query-throughput variant of the generic metric endpoint for database overview.
   */
  getLatencyData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsDataForMetrics(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params });
  }

  /**
   * GET `apm/business_summary/graph/?graph_type={key}`
   * Host-level graph endpoint. `key` selects the metric:
   * `'cpu_utilization'` | `'mem_usage'` | `'disk_read_write'` | `'sys_load'`.
   * Returns `{ devices: [...], total_avg }` where each device contains a `data` array.
   */
  getHostOverview(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsForHostData(dropdownsViewData, selectedApps, key);
    return this.http.get<any>(`apm/business_summary/graph/`, { params });
  }

  /**
   * Extracts `up_count`, `down_count` and `unknown_count` from the availability API response
   * and delegates to `convertToHalfDoughnutChartViewData` to build the Component Health chart.
   * Returns `null` when `apps` is falsy (no data guard).
   */
  convertToComponentDoughnutChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, type?: string) {
    if (!apps) { return null; }
    const upCount = apps.find((item: any) => item.hasOwnProperty('up_count'))?.up_count || 0;
    const downCount = apps.find((item: any) => item.hasOwnProperty('down_count'))?.down_count || 0;
    const unknownCount = apps.find((item: any) => item.hasOwnProperty('unknown_count'))?.unknown_count || 0;
    const totalCount = upCount + downCount + unknownCount;
    return this.convertToHalfDoughnutChartViewData(upCount, downCount, unknownCount, totalCount);
  }

  /**
   * Builds a half-donut ("speedometer") pie chart for Component Health.
   * The donut is rendered at `startAngle: 180` so only the top half is visible.
   * A transparent 4th segment equal to the total fills the bottom half to close the ring.
   * Colors: Up = `#28a745` (green), Down = `#dc3545` (red), Unknown = `#ffc107` (amber).
   * When all counts are zero an empty grey segment is shown instead of three zero-value slices.
   * The total count is displayed as a centred subtitle below the arc.
   */
  convertToHalfDoughnutChartViewData(upCount: number, downCount: number, unknownCount: number, totalCount: number) {
    let view: UnityChartDetails = new UnityChartDetails();
    const total = upCount + downCount + unknownCount;
    const hasData = total > 0;
    const tooltipFormatter = (params: any) => { if (!params.name) return ''; return `${params.name}: ${params.value} (${params.percent}%)`; };
    const dataSeries = hasData
      ? [
        { value: upCount, name: 'Up', itemStyle: { color: '#28a745' } },
        { value: downCount, name: 'Down', itemStyle: { color: '#dc3545' } },
        { value: unknownCount, name: 'Unknown', itemStyle: { color: '#ffc107' } },
        { value: total, name: '', itemStyle: { color: 'transparent' } }
      ]
      : [{ value: 1, name: '', itemStyle: { color: '#e0e0e0' } }];
    view.options = {
      title: [
        { text: 'Component Health', left: 'center', top: '5%', textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() } },
        { text: totalCount.toString(), subtext: 'Total Count', left: 'center', top: '60%', textStyle: { fontSize: 20, fontWeight: 'bold' }, subtextStyle: { fontSize: 12 } }
      ],
      tooltip: { trigger: 'item', formatter: tooltipFormatter },
      legend: { orient: 'vertical', left: 'right', top: 'middle', data: ['Up', 'Down', 'Unknown'], itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 14 } },
      series: [{
        name: 'Status', type: 'pie', radius: ['50%', '80%'], center: ['50%', '70%'], startAngle: 180,
        avoidLabelOverlap: false, label: { show: false },
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
        data: dataSeries
      }]
    };
    return view;
  }

  /**
   * Extracts per-service time-series from the component/process metric response and
   * routes to either `convertToAreaChartViewData` (`type='line'`) or
   * `convertToBarChartViewData` (`type='bar'`).
   * Each service becomes its own series; colors are drawn from a 5-color palette.
   */
  convertToComponentChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, graphName: string, type?: string) {
    if (!apps) { return null; }
    const allServices = apps.flatMap(app => app.services || []);
    if (!allServices.length) { return null; }
    const xAxisData: string[] = allServices[0].data.map(d => d.range);
    const names: string[] = allServices.map(s => s.service);
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);
    const values: number[][] = allServices.map(s => s.data.map(d => d.average));
    if (type == 'line') {
      return this.convertToAreaChartViewData(xAxisData, yAxisLabelName, values, names, colors, true, graphName);
    } else if (type == 'bar') {
      return this.convertToBarChartViewData(xAxisData, yAxisLabelName, xAxisLabelName, values, names, colors);
    }
  }

  /**
   * Builds a multi-series smooth area line chart for component/host overview panels.
   * Each series gets its own color with a semi-transparent fill (`opacity: 0.35`),
   * glow emphasis, and a scrollable bottom legend.
   * @param smoothLines  Pass `true` to enable smooth curves on all series.
   * @param graphName    Chart title; falls back to `"{yAxisLabelName} vs Time"` if empty.
   */
  convertToAreaChartViewData(xAxisData: string[], yAxisLabelName: string, values: number[][], names: string[], colors: string[], smoothLines: boolean, graphName: string) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.options = this.getLineChartOptions(xAxisData);
    if (names?.length && values?.length) {
      view.options.series = names.map((name, index) => ({
        name, type: 'line', data: values[index], smooth: smoothLines, symbol: 'circle', symbolSize: 6,
        itemStyle: { color: colors[index], shadowColor: colors[index], shadowBlur: 8 },
        areaStyle: { color: colors[index], opacity: 0.35 },
        lineStyle: { width: 2, color: colors[index] },
        emphasis: { focus: 'series', itemStyle: { shadowBlur: 12, shadowColor: colors[index] } }
      }));
      view.options.legend = { type: 'scroll', data: names, bottom: 0, orient: 'horizontal', pageIconSize: 10, pageTextStyle: { color: '#999' }, textStyle: { fontSize: 12 } };
    }
    view.options.xAxis = { type: 'category', data: xAxisData, name: 'Time', nameLocation: 'middle', nameGap: 30, splitLine: { show: true, lineStyle: { color: '#e0e0e0', type: 'dashed' } } };
    view.options.yAxis = { type: 'value', name: yAxisLabelName, nameLocation: 'middle', nameGap: 50, min: 0, splitLine: { show: true, lineStyle: { color: '#e0e0e0', type: 'dashed' } } };
    view.options.title = { text: graphName ? graphName : (yAxisLabelName ? `${yAxisLabelName} vs Time` : ''), left: 'center', top: 20, textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() } };
    view.options.grid = { left: yAxisLabelName ? 60 : 20, right: 20, bottom: names.length ? 50 : 20, top: 80, containLabel: true };
    return view;
  }

  /**
   * Builds a multi-series grouped vertical bar chart for component/process overview panels.
   * Each series is a separate bar group at each X-axis tick. Zero values are suppressed
   * from bar-top labels. An optional `max` clamps the Y-axis for comparison views.
   */
  convertToBarChartViewData(xAxisData: string[], yAxisLabelName: string, xAxisLabelName: string, values: number[][], names: string[], colors?: string[], max?: number) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = {
      title: { text: `${yAxisLabelName} vs Time`, left: 'center', top: 10, textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: names, bottom: 0 },
      grid: { top: 60, left: 50, right: 30, bottom: 50 },
      xAxis: { type: 'category', data: xAxisData, name: xAxisLabelName, nameLocation: 'middle', nameGap: 50 },
      yAxis: { type: 'value', name: yAxisLabelName, nameLocation: 'middle', nameGap: 50, min: 0, max: max ?? null },
      series: names.map((name, idx) => ({
        name, type: 'bar', data: values[idx], itemStyle: { color: colors?.[idx] ?? undefined }, barMaxWidth: 60,
        label: { show: true, position: 'top', color: '#000', formatter: (params: any) => params.value === 0 ? '' : params.value }
      }))
    };
    return view;
  }

  /**
   * Returns a minimal base `EChartsOption` object used as the starting skeleton for
   * multi-series line charts. Callers mutate it further via `convertToLineChartViewData`
   * or `convertToAreaChartViewData`.
   */
  getLineChartOptions(xAxisData: string[]): EChartsOption {
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', boundaryGap: false, data: xAxisData, axisLabel: { rotate: 35 } },
      yAxis: { type: 'value' },
      grid: { left: '10%', right: '3%', top: '5%', bottom: 0, containLabel: true },
      series: [], legend: {}
    };
  }

  /**
   * Extracts per-service time-series from a process/database metric response and builds
   * a multi-series line chart via `convertToLineChartViewData`.
   * Used by process and database overview sections (always renders as `line`, not `bar`).
   */
  convertToApplicationChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, graphName: string) {
    if (!apps) { return null; }
    const allServices = apps.flatMap(app => app.services || []);
    if (!allServices.length) { return null; }
    const xAxisData: string[] = allServices[0].data.map(d => d.range);
    const names: string[] = allServices.map(s => s.service);
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);
    const values: number[][] = allServices.map(s => s.data.map(d => d.average));
    return this.convertToLineChartViewData(graphName, xAxisData, yAxisLabelName, xAxisLabelName, values, names, colors);
  }

  /**
   * Core multi-series line chart builder used by process, database and application overview sections.
   * Builds each series from the `values`/`names`/`colors` arrays and applies dashed grid lines,
   * a centred title, and a scrollable bottom legend.
   *
   * @param graphName    Chart title; falls back to `"{yAxisLabelName} vs Time"` if empty.
   * @param smooth       Pass `'smooth'` to enable curve smoothing on all series.
   * @param enableGlow   When `true`, highlights the hovered point with a colored glow shadow.
   */
  convertToLineChartViewData(graphName: string, xAxisData: string[], yAxisLabelName: string, xAxisLabelName: string, values?: number[][], names?: string[], colors?: string[], smooth?: string, enableGlow?: boolean) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.getLineChartOptions(xAxisData);
    if (names?.length && values?.length) {
      let chartSeries: SeriesOption[] = [];
      names.forEach((name, index) => {
        chartSeries.push({
          name, color: colors[index], type: 'line', data: values[index], smooth: smooth == 'smooth',
          lineStyle: { width: 2 }, symbol: 'circle', symbolSize: 6, itemStyle: { borderWidth: 0 },
          emphasis: enableGlow ? { scale: true, itemStyle: { shadowBlur: 15, shadowColor: colors[index], color: colors[index] } } : undefined
        });
      });
      view.options.series = chartSeries;
      view.options.legend = { type: 'scroll', data: names, bottom: 0, orient: 'horizontal', pageIconSize: 10, pageTextStyle: { color: '#999' }, textStyle: { fontSize: 12 } };
    }
    view.options = {
      ...view.options,
      title: { text: graphName ? graphName : (yAxisLabelName ? `${yAxisLabelName} vs Time` : ''), left: 'center', top: 20, textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 13, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() } }
    };
    view.options.xAxis = { ...view.options.xAxis, type: 'category', data: xAxisData, name: xAxisLabelName, nameLocation: 'middle', nameGap: 30, splitLine: { show: true, lineStyle: { color: '#e0e0e0', type: 'dashed' } } };
    view.options.yAxis = { ...view.options.yAxis, type: 'value', name: yAxisLabelName, nameLocation: 'middle', nameGap: 50, min: 0, splitLine: { show: true, lineStyle: { color: '#e0e0e0', type: 'dashed' } } };
    view.options.grid = { left: yAxisLabelName ? 60 : 20, right: 20, bottom: names.length ? 50 : 20, top: 80, containLabel: true };
    return view;
  }

  /**
   * Flattens the nested device-group structure returned by the host graph endpoint
   * (`{ deviceName: { data: [{range, average}] } }`) and builds a multi-series area chart
   * via `convertToAreaChartViewData`.
   * Used for all four host metrics: CPU utilization, memory usage, disk I/O, system load.
   */
  convertToCpuUtilizationChartViewData(devicesArray: any[], yAxisLabelName: string, xAxisLabelName: string, graphName: string) {
    if (!devicesArray || !devicesArray.length) { return null; }
    const allDevices = devicesArray.flatMap(deviceGroup =>
      Object.entries(deviceGroup).map(([name, details]) => { const d = details as any; return { name, ...d }; })
    );
    if (!allDevices.length) { return null; }
    const xAxisData: string[] = allDevices[0].data.map(d => d.range);
    const names: string[] = allDevices.map(d => d.name);
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);
    const values: number[][] = allDevices.map(d => d.data.map((point: any) => point.average));
    return this.convertToAreaChartViewData(xAxisData, yAxisLabelName, values, names, colors, true, graphName);
  }

  /**
   * GET `/apm/business_summary/cloud_list/?app_id={appId}`
   * Returns the list of cloud/infrastructure environments linked to the application.
   * Each item contains a `uuid` used to fetch detailed widget data via `getCloudDetails`.
   */
  getCloudList(appId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('app_id', appId);
    return this.http.get('/apm/business_summary/cloud_list/', { params });
  }

  /**
   * GET `/customer/private_cloud/{uuid}/widget_data/`
   * Fetches detailed infrastructure widget data for a single cloud environment by UUID.
   */
  getCloudDetails(uuid: string): Observable<any> {
    return this.http.get(`/customer/private_cloud/${uuid}/widget_data/`);
  }

  /**
   * Fires parallel `getCloudDetails` calls for every UUID in the list using `forkJoin`.
   * Returns an empty Observable (`of([])`) immediately when the list is empty.
   */
  getAllCloudDetails(uuids: string[]): Observable<any[]> {
    if (!uuids || !uuids.length) { return of([]); }
    return forkJoin(uuids.map(uuid => this.getCloudDetails(uuid)));
  }

  /**
   * Maps raw cloud-list API items to `PCFastData` view-model objects used by
   * `<private-cloud-widget>` rows. Filters out `CUSTOM` and `HYPER_V` platforms
   * which are handled by a separate widget cluster component.
   */
  convertToPCFastData(clouds: PrivateCloudFast[]): PCFastData[] {
    let viewData: PCFastData[] = [];
    clouds.map((cloud: PrivateCloudFast) => {
      if (cloud.platform_type != PlatFormMapping.CUSTOM && cloud.platform_type != ServerSidePlatFormMapping.HYPER_V) {
        let a: PCFastData = new PCFastData();
        a.id = cloud.id;
        a.name = cloud.name;
        a.uuid = cloud.uuid;
        a.platfromType = cloud.platform_type;
        a.displayPlatformType = cloud.display_platform;
        a.vms = cloud.vms;
        a.datacenter = cloud.colocation_cloud;
        a.drillDownLink = `/unitycloud/pccloud/${cloud.uuid}/summary`;
        a.status = this.utilSvc.getDeviceStatus(cloud.status);
        viewData.push(a);
      }
    });
    return viewData;
  }

  // ── Critical Alerts ─────────────────────────────────────────────────────────

  /**
   * Paginated GET `apm/business_summary/top_business_events/?app_id={appId}`.
   * Returns the top critical business events for the application.
   * @param criteria  Current search and pagination state for the alerts table.
   * @param appId     Numeric application ID to scope events to.
   */
  getAlertsData(criteria: SearchCriteria, appId: number): Observable<PaginatedResult<AlertData>> {
    return this.tableService.getData<PaginatedResult<AlertData>>(`apm/business_summary/top_business_events/?app_id=${appId}`, criteria);
  }

  /**
   * Maps raw `AlertData` API records to `AlertViewData` view-model objects.
   * Resolves numeric `status` to a Font Awesome icon and tooltip:
   * `1` → green check (Up), `-1`/null → yellow warning (Unknown), else → red triangle (Down).
   * `is_ack` boolean is converted to the human-readable `'Yes'` / `'No'` string.
   */
  convertToCriticalAlertsData(data: AlertData[]): AlertViewData[] {
    return data.map(s => {
      let a: AlertViewData = new AlertViewData();
      a.id = s.id;
      a.deviceName = s.device_name;
      a.description = s.description;
      a.source = s.source;
      a.isAck = s.is_ack ? 'Yes' : 'No';
      if (s.status == 1) { a.icon = 'fa fa-check-circle text-success'; a.tooltipMessage = 'Up'; }
      else if (s.status == -1 || !s.status) { a.icon = 'fa fa-exclamation-circle text-warning'; a.tooltipMessage = 'Unknown'; }
      else { a.icon = 'fa fa-exclamation-triangle text-danger'; a.tooltipMessage = 'Down'; }
      return a;
    });
  }
}

// ── View Data Classes ─────────────────────────────────────────────────────────
// Each class bundles a named spinner key with its corresponding chart data.
// The `loader` string is passed to AppSpinnerService.start/stop around each API call.

/** Holds the Session-to-Order funnel chart data and its spinner key. */
export class SessionToOrderFunnelWidgetViewData {
  loader: string = 'sessionToOrderFunnelWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the Available Product Category Wise bar chart data and its spinner key. */
export class ReturningCustomerCategoryWidgetViewData {
  loader: string = 'returningCustomerCategoryWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the New Customers bar chart data and its spinner key. */
export class NewCustomersWidgetViewData {
  loader: string = 'newCustomersWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the Conversion Count By Top Country bar chart data and its spinner key. */
export class CheckoutAbondanRateWidgetViewData {
  loader: string = 'checkoutAbondanRateWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the Conversion Rate bar chart data and its spinner key. */
export class ConversionRateWidgetViewData {
  loader: string = 'conversionRateWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the Orders Placed bar chart data and its spinner key. */
export class OrderPlcedWidgetViewData {
  loader: string = 'orderPlcedWidgetLoader';
  chartData: UnityChartDetails;
}
export class NewVsReturningCustomersWidgetViewData {
  loader: string = 'newVsReturningCustomersWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the Top Countries Count bar chart data and its spinner key. */
export class CategoriesViewedWidgetViewData {
  loader: string = 'categoriesViewedWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the Traffic Source donut chart data and its spinner key. */
export class TrafficSourceOverGivenPeriodWidgetViewData {
  loader: string = 'trafficSourceOverGivenPeriodWidgetLoader';
  chartData: UnityChartDetails;
}
/** Holds the Unique Visitors line chart data and its spinner key. */
export class UniqueVisitorsWidgetViewData {
  loader: string = 'uniqueVisitorsWidgetLoader';
  chartData: UnityChartDetails;
}

/**
 * Bundles the three Components Overview chart slots (health doughnut, duration line,
 * response-time line) together with their individual spinner keys and average KPI values.
 */
export class ComponentsOverviewViewData {
  healthLoader: string = 'componentsOverviewThroughputLoader';
  durationLoader: string = 'componentsOverviewDurationLoader';
  responseTimeLoader: string = 'componentsOverviewResponseTimeLoader';
  healthAvg: string;
  durationAvg: string;
  responseTimeAvg: string;
  healthChartData: UnityChartDetails;
  durationChartData: UnityChartDetails;
  responseTimeChartData: UnityChartDetails;
}

/**
 * Bundles the three Process Overview chart slots (throughput, availability, response time)
 * together with their individual spinner keys and average KPI values.
 */
export class ProcessOverviewViewData {
  throughputLoader: string = 'processOverviewThroughputLoader';
  availabilityLoader: string = 'processOverviewAvailabilityLoader';
  responseTimeLoader: string = 'processOverviewResponseTimeLoader';
  throughputAvg: string;
  availabilityAvg: string;
  responseTimeAvg: string;
  throughputChartData: UnityChartDetails;
  availabilityChartData: UnityChartDetails;
  responseTimeChartData: UnityChartDetails;
}

/**
 * Bundles the three Database/Messaging Overview chart slots (query throughput,
 * response time, availability) together with their spinner keys and average KPI values.
 */
export class DatabaseOverviewViewData {
  latencyLoader: string = 'databaseOverviewLatencyLoader';
  latencyAvg: string;
  latencyChartData: UnityChartDetails;
  responseTimeLoader: string = 'databaseOverviewResponseTimeLoader';
  responseTimeAvg: string;
  responseTimeChartData: UnityChartDetails;
  availabilityLoader: string = 'databaseOverviewAvailabilityLoader';
  availabilityAvg: string;
  availabilityChartData: UnityChartDetails;
}

/**
 * Bundles the four Host Overview chart slots (CPU, memory, disk I/O, system load)
 * together with their individual spinner keys and average KPI values.
 */
export class HostOverviewViewData {
  cpuUtilizationLoader: string = 'databaseOverviewcpuUtilizationLoader';
  memoryUsageLoader: string = 'databaseOverviewmemoryUsageLoader';
  diskInputOutputTimeLoader: string = 'databaseOverviewdiskInputOutputTimeLoader';
  systemLoadTimeLoader: string = 'databaseOverviewsystemLoadTimeLoader';
  cpuUtilizationAvg: string;
  memoryUsageAvg: string;
  diskInputOutputTimeAvg: string;
  systemLoadTimeAvg: string;
  cpuUtilizationChartData: UnityChartDetails;
  memoryUsageChartData: UnityChartDetails;
  diskInputOutputTimeChartData: UnityChartDetails;
  systemLoadTimeChartData: UnityChartDetails;
}

/** View-model for a single row in the Services Overview table. */
export class ServiceViewData {
  constructor() { }
  id: number;
  name: string;
  uuid: string;
  hostname: string;
  latency: string;
  throughput: string;
  deviceId: number;
  contentType: number;
  parentApp: number;
  customer: number;
  typeOfApp: string;
  parentAppAvailability: string | null;
  parentAppStatusCode: string;
  /** Font Awesome icon class derived from `parent_app_status_code`. */
  icon: string;
  tooltipMessage: string;
  status: string;
}
/** View-model for a single row in the Critical Alerts table. */
export class AlertViewData {
  constructor() { }
  eventType: string;
  affectedComponent: string | null;
  isAck: string;
  deviceType: string;
  ackBy: string | null;
  sourceAccountName: string;
  recoveredDatetime: string | null;
  supressRule: any[];
  id: number;
  eventDatetime: string;
  category: string;
  ackTime: string | null;
  uuid: string;
  source: number;
  eventId: string;
  affectedComponentType: string | null;
  executedAt: string | null;
  environment: string | null;
  application: number;
  ackComment: string | null;
  deviceId: number;
  anomaly: boolean;
  status: number;
  description: string;
  eventMetric: any | null;
  triggerId: string | null;
  operationalData: any | null;
  supress: boolean;
  contentType: number;
  ipAddress: string;
  severity: number;
  customer: number;
  affectedComponentName: string | null;
  deviceName: string;
  categoryMeta: any | null;
  customData: any | null;
  applicationName: string;
  icon: string;
  tooltipMessage: string;
}

/** Response shape for the operational anomaly KPI endpoint. */
export interface OperationalAnomalyType {
  grouping: string;
  revenue_usd: RevenueItem[];
  revenue_24h_ma: RevenueItem[];
}
interface RevenueItem { sum: number; period: string; }

/** Raw API record returned by `/apm/monitoring/applist/`. */
interface AppResult {
  id: number; name: string; uuid: string; hostname: string; latency: string; throughput: string;
  device_id: number; content_type: number; parent_app: number; customer: number; type_of_app: string;
  parent_app_availability: string | null; parent_app_status_code: string;
}
/** Paginated wrapper around `AppResult` records, including aggregate KPI averages. */
interface AppResultsResponse {
  count: number; next: string; previous: string; results: AppResult[];
  avg_throughput: string; avg_latency: string; avg_availability: string;
}
/** Raw API record returned by `apm/business_summary/top_business_events/`. */
interface AlertData {
  event_type: string; affected_component: string | null; is_ack: boolean; device_type: string;
  ack_by: string | null; source_account_name: string; recovered_datetime: string | null;
  supressRule: any[]; id: number; event_datetime: string; category: string; ack_time: string | null;
  uuid: string; source: number; event_id: string; affected_component_type: string | null;
  executed_at: string | null; environment: string | null; application: number; ack_comment: string | null;
  device_id: number; anomaly: boolean; status: number; description: string; event_metric: any | null;
  trigger_id: string | null; operational_data: any | null; supress: boolean; content_type: number;
  ip_address: string; severity: number; customer: number; affected_component_name: string | null;
  device_name: string; category_meta: any | null; custom_data: any | null; application_name: string;
}
/** Raw API record returned by `/apm/business_summary/cloud_list/`. */
interface PrivateCloudFast {
  id: number; name: string; uuid: string; platform_type: string; display_platform: string;
  vms: number; colocation_cloud: any; status: number;
}
