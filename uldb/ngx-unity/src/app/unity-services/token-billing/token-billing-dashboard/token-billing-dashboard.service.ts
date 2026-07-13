import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ECHARTCOLORS, UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import {
  ApplicationUsage,
  ApplicationUsageGraphResponse,
  CreditSummaryWidgetData,
  LangfuseDashboardResponse,
  ModelCost,
  ModelCostSeries,
  ModelCostWidgetData,
  ModelUsageWidgetData,
  TimeRangeOption,
  TokenBillingParams,
  TokenSummaryWidgetData,
  TokenTrendWidgetData,
  UsageByAppWidgetData,
  UsageTrend,
  UserConsumptionSeries,
  UserConsumptionWidgetData,
} from './token-billing-dashboard.types';

@Injectable()
export class TokenBillingDashboardService {

  constructor(
    private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,
  ) { }

  getTimeRangeOptions(): TimeRangeOption[] {
    return [
      { label: 'Last 24 Hours', value: 86400 },
      { label: 'Last 7 Days',   value: 604800 },
      { label: 'Last 30 Days',  value: 2592000 },
      { label: 'Current Month', value: this.secondsSinceMonthStart() },
    ];
  }

  getDashboardData(params: TokenBillingParams): Observable<LangfuseDashboardResponse> {
    let httpParams = new HttpParams().set('org_id', String(params.orgId));
    if (params.userId != null)  httpParams = httpParams.set('user_id', String(params.userId));
    if (params.fromDate)        httpParams = httpParams.set('from_date', params.fromDate);
    if (params.toDate)          httpParams = httpParams.set('to_date', params.toDate);
    // billing/analytics-dashboard wraps the dashboard payload under `analytics`; unwrap it
    // so the existing chart builders keep reading top-level fields, and carry `billing`
    // along (used by the Traces/credit card).
    return forkJoin({
      dashboard: this.http.get<any>('mcp/billing/analytics-dashboard/', { params: httpParams }),
      applicationGraph: this.http.get<ApplicationUsageGraphResponse>('mcp/token-usage/application-graph/', { params: httpParams }),
    }).pipe(map(({ dashboard, applicationGraph }) => {
      const a = (dashboard?.analytics ?? dashboard ?? {}) as LangfuseDashboardResponse;
      a.applications = applicationGraph?.applications ?? [];
      a.billing = dashboard?.billing ?? null;
      return a;
    }));
  }

  // Current month: from_date = 1st of this month, to_date = last day of this month
  // (YYYY-MM-DD). ≤31-day span — within the endpoint's range/cycle limits.
  currentMonthRange(): { fromDate: string; toDate: string } {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { fromDate: this.toYmd(from), toDate: this.toYmd(to) };
  }

  private toYmd(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  // ── View-data converters ───────────────────────────────────────────────────

  buildTokenSummaryWidgetData(data: LangfuseDashboardResponse): TokenSummaryWidgetData {
    const w = new TokenSummaryWidgetData();
    if (!data?.token_summary) return w;
    const s = data.token_summary;
    w.totalTokens     = s.total_tokens;
    w.inputTokens     = s.input_tokens;
    w.outputTokens    = s.output_tokens;
    w.totalCostUsd    = s.total_cost_usd;
    w.observationCount = s.observation_count;
    w.donutChart = this.buildInputOutputDonut(s.input_tokens, s.output_tokens);
    return w;
  }

  buildModelCostWidgetData(data: LangfuseDashboardResponse): ModelCostWidgetData {
    const w = new ModelCostWidgetData();
    // Per-model costs live under billing.model_costs (USD = cost_usd/billable_cost_usd);
    // fall back to analytics.model_costs if a response provides it there instead.
    const src: any[] = (data?.model_costs?.length)
      ? data.model_costs
      : (data?.billing?.model_costs || []).map(m => ({ ...m, total_cost_usd: m.cost_usd ?? m.billable_cost_usd ?? 0 }));
    w.rows = src.filter(r => r.total_tokens > 0);
    return w;
  }

  buildCreditSummaryWidgetData(data: LangfuseDashboardResponse): CreditSummaryWidgetData {
    const w = new CreditSummaryWidgetData();
    const b = data?.billing;
    if (!b) return w;
    w.usedCredit = b.billable_used_usd ?? 0;
    w.remainingCredit = b.remaining_credit_usd ?? 0;
    w.totalCredit = b.monthly_credit_usd ?? 0;
    // Same rose-donut config as Tokens, slices = Used vs Remaining (sum to Total).
    w.donutChart = this.buildTwoSliceDonut('Used', w.usedCredit, 'Remaining', w.remainingCredit, v => (v ?? 0).toFixed(2));
    return w;
  }

  buildTokenTrendWidgetData(data: LangfuseDashboardResponse): TokenTrendWidgetData {
    const w = new TokenTrendWidgetData();
    if (!data?.usage_trend?.length) return w;
    w.chartData = this.buildInputOutputTrendChart(data.usage_trend);
    return w;
  }

  buildModelUsageWidgetData(data: LangfuseDashboardResponse, selectedModels?: string[]): ModelUsageWidgetData {
    const w = new ModelUsageWidgetData();
    const mts = data?.model_time_series;
    if (!mts?.labels?.length || !mts?.cost_series?.length) return w;
    const costSeries = mts.cost_series as ModelCostSeries[];
    w.allModels = costSeries.map(s => s.model);
    // undefined/null = initial load → default to all models; an explicit array (even
    // empty) is the user's selection, so [] correctly yields no lines.
    w.selectedModels = selectedModels == null ? [...w.allModels] : selectedModels;
    w.totalCostUsd = data?.token_summary?.total_cost_usd ?? 0;
    const activeSeries = costSeries.filter(s => w.selectedModels.includes(s.model));
    const labels = mts.labels.map(l => this.utilSvc.toUnityOneDateFormat(l, 'M/D H:mm'));
    w.chartData = this.buildModelCostAreaChart(labels, activeSeries, w.allModels);
    return w;
  }

  buildUserConsumptionWidgetData(data: LangfuseDashboardResponse, selectedUsers?: string[]): UserConsumptionWidgetData {
    const w = new UserConsumptionWidgetData();
    // Per-LLM token consumption over time: model_time_series.token_series ({ model, data }
    // = tokens per bucket). Legends are the LLM/model names. (token_series is the token twin
    // of cost_series used by Model Usage.)
    const mts = data?.model_time_series;
    if (!mts?.labels?.length || !mts?.token_series?.length) return w;
    const series = (mts.token_series as ModelCostSeries[]).map(s => ({ name: s.model, data: s.values }));
    w.allUsers = series.map(s => s.name);
    // undefined/null = initial load → default to all; an explicit array (even empty) is the
    // user's selection, so [] correctly yields no lines.
    w.selectedUsers = selectedUsers == null ? [...w.allUsers] : selectedUsers;
    const activeSeries = series.filter(s => w.selectedUsers.includes(s.name));
    w.totalCostUsd = data?.token_summary?.total_cost_usd ?? 0;
    const labels = mts.labels.map(l => this.utilSvc.toUnityOneDateFormat(l, 'M/D H:mm'));
    w.chartData = this.buildUserConsumptionAreaChart(labels, activeSeries);
    return w;
  }

  buildUsageByAppWidgetData(data: LangfuseDashboardResponse): UsageByAppWidgetData {
    const w = new UsageByAppWidgetData();
    const applications = data?.applications ?? [];
    w.totalTracesTracked = data?.trace_summary
      ? data.trace_summary.total_traces_tracked
      : applications.reduce((total, app) => total + (app.observation_count ?? 0), 0);
    if (!applications.length) return w;
    w.chartData = this.buildUsageByApplicationChart(applications);
    return w;
  }

  // ── Chart builders ─────────────────────────────────────────────────────────

  private buildInputOutputDonut(inputTokens: number, outputTokens: number): UnityChartDetails {
    return this.buildTwoSliceDonut('Input', inputTokens, 'Output', outputTokens, v => this.formatTokens(v));
  }

  // Two-slice rose donut shared by Tokens (Input/Output) and Traces (Used/Remaining credit).
  // The smaller wedge's geometry value is floored so a tiny slice stays visible; labels and
  // tooltip always show the real value via `fmt`.
  private buildTwoSliceDonut(
    aName: string, aValue: number, bName: string, bValue: number, fmt: (n: number) => string,
  ): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    const realByName: { [k: string]: number } = { [aName]: aValue, [bName]: bValue };
    const total = (aValue + bValue) || 1;
    const floorVal = Math.max(aValue, bValue, 1) * 0.5;
    const aGeo = Math.max(aValue, floorVal);
    const bGeo = Math.max(bValue, floorVal);
    view.options = {
      tooltip: {
        ...this.getViewportSafeItemTooltipOptions(),
        trigger: 'item',
        formatter: (p: any) => this.formatCompactRowsTooltip('', [{
          color: p.color,
          name: p.name,
          value: `${fmt(realByName[p.name])} (${((realByName[p.name] / total) * 100).toFixed(1)}%)`,
        }]),
      },
      legend: { orient: 'vertical', right: 5, top: 'middle', icon: 'circle' },
      color: ['#5B6EF5', '#78D7A6'],
      series: [{
        type: 'pie',
        radius: '95%',
        center: ['38%', '50%'],
        startAngle: 90,
        clockwise: true,
        roseType: 'radius',
        minAngle: 30,
        itemStyle: { borderWidth: 0 },
        data: [
          { name: aName, value: aGeo },
          { name: bName, value: bGeo },
        ],
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
          formatter: (p: any) => `${p.name}\n${fmt(realByName[p.name])}`,
        },
        labelLine: { show: false },
        emphasis: { disabled: true },
      }],
    };
    return view;
  }

  private buildInputOutputTrendChart(trend: UsageTrend[]): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const xData = trend.map(t => this.utilSvc.toUnityOneDateFormat(t.timestamp, 'MM/DD HH:mm'));
    view.options = {
      tooltip: {
        ...this.getViewportSafeAxisTooltipOptions(),
        trigger: 'axis',
        formatter: (params: any) => this.formatAxisTooltip(params),
      },
      legend: { bottom: 0 },
      grid: { left: '7%', right: '8%', top: '15%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: xData, axisLabel: { rotate: 35 } },
      yAxis: [
        {
          type: 'value',
          minInterval: 1,
          name: 'Input',
          nameTextStyle: { color: UNITY_TEXT_DEFAULT_COLOR(), fontSize: 11 },
        },
        {
          type: 'value',
          minInterval: 1,
          name: 'Output',
          nameTextStyle: { color: UNITY_TEXT_DEFAULT_COLOR(), fontSize: 11 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Input Tokens',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          areaStyle: { opacity: 0.25 },
          emphasis: { focus: 'series' },
          data: trend.map(t => t.input_tokens),
          itemStyle: { color: ECHARTCOLORS[0] },
        },
        {
          name: 'Output Tokens',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          areaStyle: { opacity: 0.25 },
          emphasis: { focus: 'series' },
          data: trend.map(t => t.output_tokens),
          itemStyle: { color: ECHARTCOLORS[2] },
        },
      ],
      title: {
        text: 'Model Usage',
        left: 'left',
        textStyle: { fontFamily: UNITY_FONT_FAMILY(), fontSize: 14, fontWeight: 500, color: UNITY_TEXT_DEFAULT_COLOR() },
      },
    };
    return view;
  }

  private buildModelCostAreaChart(labels: string[], series: ModelCostSeries[], legendNames: string[] = series.map(s => s.model)): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const legendLayout = this.getResponsiveModelUsageLegendOptions(legendNames);
    const yAxisScale = this.getRoundedPaddedAxisScale(series);
    view.options = {
      baseOption: {
        tooltip: {
          ...this.getViewportSafeAxisTooltipOptions(),
          trigger: 'axis',
          formatter: (params: any) => this.formatAxisTooltip(params, (value: number) => `${Number(value).toFixed(6)}`),
        },
        legend: legendLayout.legend,
        grid: { left: '7%', right: '3%', top: '10%', bottom: legendLayout.gridBottom, containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: labels,
          axisLabel: { rotate: 0, alignMinLabel: 'left', alignMaxLabel: 'right' },
          splitLine: { show: true, lineStyle: { type: 'dashed', width: 1, color: '#e5e7eb' } },
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: yAxisScale.max,
          interval: yAxisScale.interval,
          splitNumber: 6,
          axisLabel: { formatter: (v: number) => this.formatModelUsageAxisValue(v) },
          splitLine: { lineStyle: { type: 'dashed', width: 1, color: '#e5e7eb' } },
        },
        series: series.map((s, i) => {
          const palette = ['#5B8FF9', '#5AD8A6', '#F5A623'];
          const color = palette[i] || ECHARTCOLORS[i % ECHARTCOLORS.length];
          return {
            name: s.model,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            showSymbol: true,
            lineStyle: { width: 2, color },
            // translucent wide border reads as the soft halo around each point
            itemStyle: { color, borderColor: this.hexToRgba(color, 0.25), borderWidth: 8 },
            areaStyle: {
              opacity: 1,
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: this.hexToRgba(color, 0.45) },
                  { offset: 1, color: this.hexToRgba(color, 0.05) },
                ],
              },
            },
            emphasis: { disabled: true },
            data: s.values,
          };
        }),
      },
      media: legendLayout.media,
    };
    return view;
  }

  // Stacked smooth area chart (User Consumption) — same visual language as the Model
  // Usage chart but stacked, with a plain-number y-axis.
  private buildUserConsumptionAreaChart(labels: string[], series: UserConsumptionSeries[]): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    const palette = ['#5B8FF9', '#5AD8A6', '#F5A623'];
    view.options = {
      tooltip: {
        ...this.getViewportSafeAxisTooltipOptions(),
        trigger: 'axis',
        formatter: (params: any) => this.formatAxisTooltip(params, (value: number) => this.formatTokens(value)),
      },
      legend: { bottom: 0, icon: 'circle' },
      grid: { left: '5%', right: '3%', top: '8%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLabel: { rotate: 0, alignMinLabel: 'left', alignMaxLabel: 'right' },
        splitLine: { show: true, lineStyle: { type: 'dashed', width: 1, color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        min: 0,
        // ~15% headroom above the stacked peak so the smooth area + marker halos never clip
        // against the top gridline (which would read as a doubled line)
        max: (value: any) => Math.ceil(value.max * 1.15),
        axisLabel: { formatter: (v: number) => this.formatTokens(v) },
        splitLine: { lineStyle: { type: 'dashed', width: 1, color: '#e5e7eb' } },
      },
      series: series.map((s, i) => {
        const color = palette[i] || ECHARTCOLORS[i % ECHARTCOLORS.length];
        return {
          name: s.name,
          type: 'line',
          stack: 'total',
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: true,
          lineStyle: { width: 2, color },
          itemStyle: { color, borderColor: this.hexToRgba(color, 0.25), borderWidth: 8 },
          areaStyle: {
            opacity: 1,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: this.hexToRgba(color, 0.45) },
                { offset: 1, color: this.hexToRgba(color, 0.05) },
              ],
            },
          },
          emphasis: { disabled: true },
          data: s.data,
        };
      }),
    };
    return view;
  }

  private buildUsageByApplicationChart(applications: ApplicationUsage[]): UnityChartDetails {
    const view = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const color = '#6E7CF7';
    const labels = applications.map(app => app.display_name || app.application || 'Unknown');
    const tokenValues = applications.map(app => app.total_tokens ?? 0);
    const costs = applications.map(app => app.total_cost_usd ?? 0);
    const obs = applications.map(app => app.observation_count ?? 0);
    const tokenAxisScale = this.getTokenAxisScale(Math.max(...tokenValues, 0));
    view.options = {
      tooltip: {
        ...this.getViewportSafeAxisTooltipOptions(12),
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const i = p.dataIndex;
          return this.formatCompactRowsTooltip(p.axisValue, [
            { color, name: 'Cost', value: Number(costs[i]).toFixed(6) },
            { name: 'Observations', value: obs[i] },
          ]);
        },
      },
      grid: { left: 116, right: 22, top: 28, bottom: 10, containLabel: true },
      xAxis: {
        type: 'value',
        position: 'top',
        min: 0,
        max: tokenAxisScale.max,
        interval: tokenAxisScale.interval,
        axisLabel: { color: UNITY_TEXT_DEFAULT_COLOR(), formatter: (v: number) => this.formatAxisTokens(v) },
        axisLine: { lineStyle: { color: '#7a7f8a' } },
        axisTick: { show: true, lineStyle: { color: '#7a7f8a' } },
        splitLine: { show: true, lineStyle: { type: 'dashed', width: 1, color: '#c9cdd3' } },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: labels,
        boundaryGap: true,
        axisLabel: { color: UNITY_TEXT_DEFAULT_COLOR() },
        axisLine: { lineStyle: { color: '#7a7f8a' } },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: { type: 'dashed', width: 1, color: '#c9cdd3' } },
      },
      series: [{
        name: 'Token usage',
        type: 'bar',
        barWidth: '55%',
        data: tokenValues,
        itemStyle: { color },
        emphasis: { itemStyle: { color: '#5B6EF5' } },
      }],
    };
    return view;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  formatCost(val: number): string {
    return val != null ? `${val.toFixed(6)}` : '0.000000';
  }

  formatCredit(val: number): string {
    return `${(val ?? 0).toFixed(2)}`;
  }

  formatRowCost(val: number): string {
    return val != null ? val.toFixed(2) : '0.00';
  }

  formatTokens(val: number): string {
    if (!val) return '0';
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return String(val);
  }

  private getTokenAxisScale(highestValue: number): { max: number; interval: number } {
    const paddedMax = Math.max(highestValue * 1.15, 1);
    const interval = this.getNiceAxisInterval(paddedMax / 5);
    return {
      interval,
      max: Math.ceil(paddedMax / interval) * interval,
    };
  }

  private formatAxisTokens(value: number): string {
    if (!value) return '0';
    if (Math.abs(value) >= 1000000) return `${this.roundToPrecision(value / 1000000, 1)}M`;
    if (Math.abs(value) >= 1000) return `${this.roundToPrecision(value / 1000, 1)}k`;
    return `${value}`;
  }

  private getRoundedPaddedAxisScale(series: ModelCostSeries[]): { max: number; interval: number } {
    const highestValue = series.reduce((max, item) => {
      const seriesMax = (item.values || []).reduce((innerMax, value) => {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? Math.max(innerMax, numericValue) : innerMax;
      }, 0);
      return Math.max(max, seriesMax);
    }, 0);
    const paddedMax = Math.max(highestValue * 1.15, 1);
    const interval = this.roundToPrecision(this.getNiceAxisInterval(paddedMax / 6));
    return {
      interval,
      max: this.roundToPrecision(Math.ceil(paddedMax / interval) * interval),
    };
  }

  private getNiceAxisInterval(rawInterval: number): number {
    if (!Number.isFinite(rawInterval) || rawInterval <= 0) return 0.2;
    const exponent = Math.floor(Math.log10(rawInterval));
    const magnitude = Math.pow(10, exponent);
    const fraction = rawInterval / magnitude;
    let niceFraction = 10;

    if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 3) {
      niceFraction = 3;
    } else if (fraction <= 5) {
      niceFraction = 5;
    }

    return niceFraction * magnitude;
  }

  private formatModelUsageAxisValue(value: number): string {
    if (value === 0) return '0';
    if (Math.abs(value) >= 10) return `${Math.round(value)}`;
    return `${this.roundToPrecision(value)}`;
  }

  private roundToPrecision(value: number, precision = 6): number {
    return Number(Number(value).toFixed(precision));
  }

  private hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private getViewportSafeTooltipOptions(): any {
    return {
      appendToBody: true,
      className: 'token-billing-echarts-tooltip',
      confine: true,
      enterable: true,
      hideDelay: 250,
      renderMode: 'html',
      transitionDuration: 0,
    };
  }

  private getViewportSafeAxisTooltipOptions(legendReserve = 36): any {
    return {
      ...this.getViewportSafeTooltipOptions(),
      triggerOn: 'mousemove|click',
      padding: [6, 8],
      textStyle: { fontSize: 11, lineHeight: 16 },
      extraCssText: 'box-shadow: 0 4px 14px rgba(15, 23, 42, 0.16);',
      position: (point: number[], _params: any, _dom: HTMLElement, _rect: any, size: any) =>
        this.getCompactTooltipPosition(point, size, legendReserve),
    };
  }

  private getViewportSafeItemTooltipOptions(): any {
    return {
      ...this.getViewportSafeTooltipOptions(),
      padding: [6, 8],
      textStyle: { fontSize: 11, lineHeight: 16 },
      extraCssText: 'box-shadow: 0 4px 14px rgba(15, 23, 42, 0.16);',
      position: (point: number[], _params: any, _dom: HTMLElement, _rect: any, size: any) =>
        this.getCompactTooltipPosition(point, size, 12),
    };
  }

  private getViewportSafeLegendTooltipOptions(): any {
    return {
      ...this.getViewportSafeTooltipOptions(),
      triggerOn: 'mousemove',
      padding: [5, 7],
      textStyle: { fontSize: 11, lineHeight: 15 },
      extraCssText: 'box-shadow: 0 3px 10px rgba(15, 23, 42, 0.14);',
    };
  }

  private getCompactTooltipPosition(point: number[], size: any, bottomReserve: number): number[] {
    const gap = 10;
    const contentWidth = size?.contentSize?.[0] || 0;
    const contentHeight = size?.contentSize?.[1] || 0;
    const viewWidth = size?.viewSize?.[0] || 0;
    const viewHeight = size?.viewSize?.[1] || 0;
    const maxX = Math.max(gap, viewWidth - contentWidth - gap);
    const maxY = Math.max(gap, viewHeight - contentHeight - gap - bottomReserve);
    const cursorX = point?.[0] || 0;
    const cursorY = point?.[1] || 0;
    let x = cursorX + gap;
    let y = cursorY + gap;

    if (x > maxX) x = cursorX - contentWidth - gap;
    if (y > maxY) y = cursorY - contentHeight - gap;

    return [
      Math.max(gap, Math.min(x, maxX)),
      Math.max(gap, Math.min(y, maxY)),
    ];
  }

  private formatAxisTooltip(params: any, valueFormatter?: (value: number) => string): string {
    const items = Array.isArray(params) ? params : [params];
    const header = items[0]?.axisValue || items[0]?.name || '';
    const rows = items.map(item => {
      const rawValue = this.getTooltipRawValue(item?.value);
      return {
        color: item?.color,
        name: item?.seriesName || item?.name || '',
        value: valueFormatter ? valueFormatter(Number(rawValue || 0)) : this.formatTooltipValue(rawValue),
      };
    });
    return this.formatCompactRowsTooltip(header, rows);
  }

  private getTooltipRawValue(value: any): any {
    return Array.isArray(value) ? value[value.length - 1] : value;
  }

  private formatTooltipValue(value: any): string {
    if (value == null || value === '') return '0';
    if (typeof value === 'number') return `${value}`;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? `${parsed}` : String(value);
  }

  private formatCompactRowsTooltip(header: string, rows: Array<{ color?: string; name: string; value: string | number }>): string {
    const title = header
      ? `<div class="tb-echarts-tooltip-title" title="${this.escapeHtml(header)}">${this.escapeHtml(header)}</div>`
      : '';
    const rowHtml = rows.map(row => {
      const name = row.name || '';
      const color = row.color || '#94a3b8';
      return `<div class="tb-echarts-tooltip-row">
        <span class="tb-echarts-tooltip-dot" style="background-color: ${this.escapeHtml(color)}"></span>
        <span class="tb-echarts-tooltip-name" title="${this.escapeHtml(name)}">${this.escapeHtml(this.truncateTooltipLabel(name))}</span>
        <span class="tb-echarts-tooltip-value">${this.escapeHtml(String(row.value))}</span>
      </div>`;
    }).join('');
    return `<div class="tb-echarts-tooltip-content">${title}${rowHtml}</div>`;
  }

  private truncateTooltipLabel(label: string, maxLength = 24): string {
    if (!label) return '';
    return label.length > maxLength ? `${label.slice(0, maxLength - 1)}...` : label;
  }

  private escapeHtml(value: string): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getResponsiveModelUsageLegendOptions(names: string[]): any {
    const breakpoints = [
      { maxWidth: 420, chartWidth: 360 },
      { minWidth: 421, maxWidth: 560, chartWidth: 490 },
      { minWidth: 561, maxWidth: 760, chartWidth: 660 },
      { minWidth: 761, maxWidth: 980, chartWidth: 850 },
      { minWidth: 981, chartWidth: 1040 },
    ];
    const defaultLayout = this.getModelUsageLegendLayout(names, 1040);
    return {
      legend: this.getModelUsageLegendOption(defaultLayout.textWidth),
      gridBottom: defaultLayout.gridBottom,
      media: breakpoints.map(bp => {
        const layout = this.getModelUsageLegendLayout(names, bp.chartWidth);
        const query: any = {};
        if (bp.minWidth != null) query.minWidth = bp.minWidth;
        if (bp.maxWidth != null) query.maxWidth = bp.maxWidth;
        return {
          query,
          option: {
            legend: this.getModelUsageLegendOption(layout.textWidth),
            grid: { bottom: layout.gridBottom },
          },
        };
      }),
    };
  }

  private getModelUsageLegendOption(textWidth: number): any {
    return {
      type: 'plain',
      bottom: 0,
      left: 'center',
      width: '92%',
      orient: 'horizontal',
      icon: 'circle',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 14,
      padding: [2, 0, 0, 0],
      tooltip: {
        ...this.getViewportSafeLegendTooltipOptions(),
        show: true,
        formatter: (params: any) => params.name,
      },
      textStyle: {
        width: textWidth,
        overflow: 'truncate',
        ellipsis: '...',
      },
    };
  }

  private getModelUsageLegendLayout(names: string[], chartWidth: number): { textWidth: number; gridBottom: number } {
    const textWidth = chartWidth <= 420 ? 118 : chartWidth <= 560 ? 140 : chartWidth <= 760 ? 165 : 190;
    const rowCount = this.getPackedLegendRowCount(names, Math.floor(chartWidth * 0.92), textWidth);
    return {
      textWidth,
      gridBottom: 28 + rowCount * 18,
    };
  }

  private getPackedLegendRowCount(names: string[], availableWidth: number, textWidth: number): number {
    if (!names.length) return 1;
    const markerWidth = 12;
    const markerTextGap = 8;
    const itemGap = 18;
    let rows = 1;
    let rowWidth = 0;
    names.forEach(name => {
      const itemWidth = markerWidth + markerTextGap + Math.min(this.estimateLegendTextWidth(name), textWidth) + itemGap;
      if (rowWidth > 0 && rowWidth + itemWidth > availableWidth) {
        rows++;
        rowWidth = itemWidth;
      } else {
        rowWidth += itemWidth;
      }
    });
    return rows;
  }

  private estimateLegendTextWidth(text: string): number {
    return (text || '').split('').reduce((width, char) => {
      if (/[A-Z0-9/@-]/.test(char)) return width + 7;
      if (/[il., ]/.test(char)) return width + 4;
      return width + 6;
    }, 0);
  }

  private secondsSinceMonthStart(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return Math.floor((now.getTime() - startOfMonth.getTime()) / 1000);
  }
}
