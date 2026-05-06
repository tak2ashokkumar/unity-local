import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import {
  PUBLIC_CLOUD_ACCOUNT_OPTIONS,
  PUBLIC_CLOUD_AIOPS_DETAILS_ENDPOINT,
  PUBLIC_CLOUD_ALERT_SIDE_CARD_CONFIG,
  PUBLIC_CLOUD_ALERT_SUMMARY_CONFIG,
  PUBLIC_CLOUD_ALERT_TREND_PIE_CONFIG,
  PUBLIC_CLOUD_ALERT_TREND_STACK_CONFIG,
  PUBLIC_CLOUD_ALL_SELECTED_VALUE,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_ENDPOINT,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_PROVIDER_CONFIG,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_STAT_CONFIG,
  PUBLIC_CLOUD_DATABASE_LATENCY_BADGES,
  PUBLIC_CLOUD_DATABASE_PERFORMANCE,
  PUBLIC_CLOUD_HIGH_ERROR_WORKLOADS,
  PUBLIC_CLOUD_HIGH_LATENCY_WORKLOADS,
  PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT,
  PUBLIC_CLOUD_PLATFORM_OPTIONS,
  PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG,
  PUBLIC_CLOUD_REGION_HEATMAP,
  PUBLIC_CLOUD_REGION_OPTIONS,
  PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG,
  PUBLIC_CLOUD_TAG_STYLE_CONFIG,
  PUBLIC_CLOUD_TICKET_CHART_COLORS,
  PUBLIC_CLOUD_TICKET_GRAPH_DATA_ENDPOINT,
  PUBLIC_CLOUD_TICKET_RESPONSE_TIME_CONFIG,
  PUBLIC_CLOUD_TICKETS_ENDPOINT,
  PUBLIC_CLOUD_TOP_CRITICAL_ALERTS_ENDPOINT,
  PUBLIC_CLOUD_UTILIZATION_ROWS
} from './public-cloud-compute-dashboard.const';
import {
  PublicCloudAccountOption,
  PublicCloudAIOpsDetailsResponse,
  PublicCloudAlertSideCard,
  PublicCloudAlertSummaryMetric,
  PublicCloudAlertTrendBarGroup,
  PublicCloudAlertTrendLegendItem,
  PublicCloudAlertTrendStackLegendItem,
  PublicCloudComputeBreakdownProvider,
  PublicCloudCriticalAlert,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDatabaseLatencyBadge,
  PublicCloudFilterOption,
  PublicCloudHeatmapGroup,
  PublicCloudHorizontalBarItem,
  PublicCloudComputeBreakdownResponse,
  PublicCloudInventorySummaryResponse,
  PublicCloudProviderDistributionKey,
  PublicCloudPlatform,
  PublicCloudProviderDistributionItem,
  PublicCloudRegionOption,
  PublicCloudSummaryMetric,
  PublicCloudTagItem,
  PublicCloudTicketDonutItem,
  PublicCloudTicketFilterCriteria,
  PublicCloudTicketGraphDataResponse,
  PublicCloudTicketsResponse,
  PublicCloudTicketRow,
  PublicCloudTopCriticalAlertsResponse,
  PublicCloudUtilizationRow,
  PublicCloudUtilizationViewRow
} from './public-cloud-compute-dashboard.type';

@Injectable()
export class PublicCloudComputeDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  /*
   * -----Start----- Filters Related -------------------
   */
  buildFilterForm(platforms: PublicCloudFilterOption[], regions: PublicCloudRegionOption[], accounts: PublicCloudAccountOption[]): FormGroup {
    return this.builder.group({
      platforms: [platforms || []],
      regions: [regions || []],
      accounts: [accounts || []]
    });
  }

  getPlatformOptions(): PublicCloudFilterOption[] {
    return PUBLIC_CLOUD_PLATFORM_OPTIONS.filter(option => option.value !== PUBLIC_CLOUD_ALL_SELECTED_VALUE);
  }

  getPlatforms(): Observable<PublicCloudFilterOption[]> {
    return of(this.getPlatformOptions());
  }

  getRegions(platforms: string[]): Observable<PublicCloudRegionOption[]> {
    return of(this.getRegionsForPlatforms(platforms));
  }

  getAccounts(platforms: string[], regions: string[]): Observable<PublicCloudAccountOption[]> {
    return of(this.getAccountsForSelection(platforms, regions));
  }

  getRegionsForPlatforms(platforms?: string[]): PublicCloudRegionOption[] {
    if (!platforms) {
      return PUBLIC_CLOUD_REGION_OPTIONS;
    }
    const selectedPlatforms = this.getSelectedPlatforms(platforms);
    if (!selectedPlatforms.length) {
      return [];
    }
    return PUBLIC_CLOUD_REGION_OPTIONS.filter(region =>
      region.platforms.some(platform => selectedPlatforms.includes(platform))
    );
  }

  getAccountsForSelection(platforms?: string[], regions?: string[]): PublicCloudAccountOption[] {
    const selectedPlatforms = platforms ? this.getSelectedPlatforms(platforms) : [];
    const selectedRegions = regions ? this.getSelectedValues(regions) : [];
    if ((platforms && !selectedPlatforms.length) || (regions && !selectedRegions.length)) {
      return [];
    }
    return PUBLIC_CLOUD_ACCOUNT_OPTIONS.filter(account => {
      const matchesPlatform = !selectedPlatforms.length || selectedPlatforms.includes(account.platform);
      const matchesRegion = !selectedRegions.length || selectedRegions.includes(account.region);
      return matchesPlatform && matchesRegion;
    });
  }

  private getSelectedValues(values: string[]): string[] {
    return (values || []).filter(value => value && value !== PUBLIC_CLOUD_ALL_SELECTED_VALUE);
  }

  private getSelectedPlatforms(values: string[]): PublicCloudPlatform[] {
    return this.getSelectedValues(values) as PublicCloudPlatform[];
  }

  private convertFiltersToApiParams(criteria?: PublicCloudDashboardFilterCriteria): HttpParams {
    let params: HttpParams = new HttpParams();
    params = this.appendMultiValueParam(params, 'platform', this.getApiPlatformValues(criteria?.platforms));
    params = this.appendMultiValueParam(params, 'region', criteria?.regions);
    params = this.appendMultiValueParam(params, 'account', criteria?.accounts);
    return params;
  }

  private appendMultiValueParam(params: HttpParams, key: string, values?: string[]): HttpParams {
    (values || []).forEach(value => {
      if (value) {
        params = params.append(key, value);
      }
    });
    return params;
  }

  private getApiPlatformValues(values?: string[]): string[] {
    return this.getSelectedValues(values || []).map(value => value === 'oracle' ? 'oci' : value);
  }
  /*
   * ******End ****** Filters Related ********************
   */

  /*
   * -----Start----- Executive Summary / Cloud Inventory Widget Related -------------------
   */
  getInventorySummary(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudInventorySummaryResponse> {
    return this.http.get<PublicCloudInventorySummaryResponse>(PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToSummaryMetricsViewData(data: PublicCloudInventorySummaryResponse): PublicCloudSummaryMetric[] {
    const summary = (data?.summary || {}) as Record<string, number>;
    return PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG.map(item => ({
      label: item.label,
      value: this.formatNumber(summary[item.key])
    }));
  }

  convertToProviderDistributionViewData(data: PublicCloudInventorySummaryResponse): PublicCloudProviderDistributionItem[] {
    return (Object.keys(PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG) as PublicCloudProviderDistributionKey[]).map(key => {
      const config = PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG[key];
      return {
        name: config.name,
        value: this.getProviderDistributionPercentage(data, key),
        color: config.color
      };
    });
  }

  convertToProviderDistributionOptions(data: PublicCloudProviderDistributionItem[]): EChartsOption {
    return this.getProviderDistributionOptions(data || []);
  }

  private getProviderDistributionOptions(items: PublicCloudProviderDistributionItem[]): EChartsOption {
    return {
      color: items.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {d}%'
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '76%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: items.map(item => ({
            name: `${item.name} ${item.value}%`,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }

  convertToTagsViewData(data: PublicCloudInventorySummaryResponse): PublicCloudTagItem[] {
    return (data?.tags || []).map((tag, index) => {
      const style = this.getTagStyle(tag.label, index);
      return {
        name: tag.label,
        count: this.formatNumber(tag.count),
        textColor: style.textColor,
        backgroundColor: style.backgroundColor
      };
    });
  }

  private getProviderDistributionPercentage(data: PublicCloudInventorySummaryResponse, key: PublicCloudProviderDistributionKey): number {
    const percentage = Number(data?.distribution_percentages?.[key]);
    if (!isNaN(percentage)) {
      return percentage;
    }

    const providerKeys = Object.keys(data?.distribution || {}) as PublicCloudProviderDistributionKey[];
    const total = providerKeys.reduce((count, providerKey) => {
      return count + Number(data.distribution[providerKey] || 0);
    }, 0);
    return total ? Math.round((Number(data?.distribution?.[key] || 0) / total) * 100) : 0;
  }

  private getTagStyle(label: string, index: number): PublicCloudTagItem {
    return PUBLIC_CLOUD_TAG_STYLE_CONFIG.find(item => item.name.toLowerCase() === (label || '').toLowerCase()) ||
      PUBLIC_CLOUD_TAG_STYLE_CONFIG[index % PUBLIC_CLOUD_TAG_STYLE_CONFIG.length];
  }

  private formatNumber(value: number | string): string {
    const numericValue = Number(value || 0);
    return isNaN(numericValue) ? '0' : numericValue.toLocaleString('en-US');
  }

  getRegionHeatmap(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHeatmapGroup[]> {
    return of(PUBLIC_CLOUD_REGION_HEATMAP);
  }

  convertToRegionHeatmapOptions(data: PublicCloudHeatmapGroup[]): EChartsOption {
    return this.getRegionHeatmapOptions(data || []);
  }

  private getRegionHeatmapOptions(groups: PublicCloudHeatmapGroup[]): EChartsOption {
    const cells = groups.reduce((items: any[], group) => {
      group.children.forEach(child => {
        items.push({
          name: child.name,
          region: group.name,
          value: [child.x, child.y, child.width, child.height],
          usage: child.usage,
          color: group.color
        });
      });
      return items;
    }, []);
    const labels = groups.map(group => ({
      name: group.name,
      value: [group.labelX, group.labelY]
    }));

    return {
      animation: false,
      tooltip: {
        formatter: (info: any) => {
          const data = info.data || {};
          const region = data.region ? String(data.region).replace(/\n/g, ' ') : '';
          return data.usage ? `${region}<br/>${data.name}<br/>${data.usage}` : `${region}<br/>${data.name}`;
        }
      },
      grid: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        show: false
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        inverse: true,
        show: false
      },
      series: [
        {
          type: 'custom',
          coordinateSystem: 'cartesian2d',
          clip: false,
          renderItem: (params: any, api: any) => {
            const item = cells[params.dataIndex];
            const start = api.coord([item.value[0], item.value[1]]);
            const end = api.coord([item.value[0] + item.value[2], item.value[1] + item.value[3]]);
            const width = end[0] - start[0];
            const height = end[1] - start[1];

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: {
                    x: start[0],
                    y: start[1],
                    width,
                    height
                  },
                  style: {
                    fill: item.color,
                    stroke: 'rgba(255, 255, 255, 0.35)',
                    lineWidth: 1
                  }
                },
                {
                  type: 'text',
                  silent: true,
                  style: {
                    text: item.name,
                    x: start[0] + width / 2,
                    y: start[1] + height / 2,
                    fill: '#26313b',
                    font: '8px Arial',
                    textAlign: 'center',
                    textVerticalAlign: 'middle'
                  }
                }
              ]
            };
          },
          data: cells
        },
        {
          type: 'custom',
          coordinateSystem: 'cartesian2d',
          silent: true,
          clip: false,
          renderItem: (params: any, api: any) => {
            const item = labels[params.dataIndex];
            const point = api.coord(item.value);

            return {
              type: 'text',
              style: {
                text: item.name,
                x: point[0],
                y: point[1],
                fill: '#26313b',
                font: '8px Arial',
                textAlign: 'left',
                textVerticalAlign: 'top'
              }
            };
          },
          data: labels
        }
      ]
    };
  }
  /*
   * ******End ****** Executive Summary / Cloud Inventory Widget Related ********************
   */

  /*
   * -----Start----- Compute Breakdown Widget Related -------------------
   */
  getComputeBreakdown(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudComputeBreakdownResponse> {
    return this.http.get<PublicCloudComputeBreakdownResponse>(PUBLIC_CLOUD_COMPUTE_BREAKDOWN_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToComputeBreakdownViewData(data: PublicCloudComputeBreakdownResponse): PublicCloudComputeBreakdownProvider[] {
    return PUBLIC_CLOUD_COMPUTE_BREAKDOWN_PROVIDER_CONFIG.map(provider => ({
      name: provider.name,
      displayName: provider.displayName,
      brandClass: provider.brandClass,
      logoPath: provider.logoPath,
      stats: PUBLIC_CLOUD_COMPUTE_BREAKDOWN_STAT_CONFIG.map(stat => ({
        name: stat.name,
        value: Number(data?.[provider.key]?.[stat.key] || 0)
      }))
    }));
  }
  /*
   * ******End ****** Compute Breakdown Widget Related ********************
   */

  /*
   * -----Start----- Performance Hotspots Widget Related -------------------
   */
  getUtilizationRows(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudUtilizationRow[]> {
    return of(PUBLIC_CLOUD_UTILIZATION_ROWS);
  }

  convertToUtilizationRowsViewData(data: PublicCloudUtilizationRow[]): PublicCloudUtilizationViewRow[] {
    return (data || []).map(row => this.convertToUtilizationViewRow(row));
  }

  private convertToUtilizationViewRow(row: PublicCloudUtilizationRow): PublicCloudUtilizationViewRow {
    return {
      ...row,
      cpuChartOptions: this.getSparklineOptions(row.cpuSeries, '#5d8df5', 'rgba(93, 141, 245, 0.28)'),
      memoryChartOptions: this.getSparklineOptions(row.memorySeries, '#6aa544', 'rgba(106, 165, 68, 0.28)')
    };
  }

  private getSparklineOptions(data: number[], lineColor: string, areaColor: string): EChartsOption {
    return {
      animation: false,
      grid: { top: 2, right: 1, bottom: 2, left: 1 },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: data.map((_, index) => index)
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: 100
      },
      series: [
        {
          type: 'line',
          data: data,
          symbol: 'none',
          smooth: false,
          lineStyle: {
            width: 1.5,
            color: lineColor
          },
          areaStyle: {
            color: areaColor
          }
        }
      ]
    };
  }
  /*
   * ******End ****** Performance Hotspots Widget Related ********************
   */

  /*
   * -----Start----- Performance / Workload Insights Widget Related -------------------
   */
  getLatencyWorkloads(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHorizontalBarItem[]> {
    return of(PUBLIC_CLOUD_HIGH_LATENCY_WORKLOADS);
  }

  convertToLatencyWorkloadOptions(data: PublicCloudHorizontalBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 900);
  }

  getErrorRateWorkloads(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHorizontalBarItem[]> {
    return of(PUBLIC_CLOUD_HIGH_ERROR_WORKLOADS);
  }

  convertToErrorRateWorkloadOptions(data: PublicCloudHorizontalBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 9);
  }

  getDatabasePerformance(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudHorizontalBarItem[]> {
    return of(PUBLIC_CLOUD_DATABASE_PERFORMANCE);
  }

  convertToDatabasePerformanceOptions(data: PublicCloudHorizontalBarItem[]): EChartsOption {
    return this.getHorizontalBarOptions(data || [], 100);
  }

  getDatabaseLatencyBadges(_criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseLatencyBadge[]> {
    return of(PUBLIC_CLOUD_DATABASE_LATENCY_BADGES);
  }

  convertToDatabaseLatencyBadgesViewData(data: PublicCloudDatabaseLatencyBadge[]): PublicCloudDatabaseLatencyBadge[] {
    return data || [];
  }

  private getHorizontalBarOptions(items: PublicCloudHorizontalBarItem[], max: number): EChartsOption {
    return {
      animation: false,
      grid: { top: 4, right: 36, bottom: 0, left: 104 },
      xAxis: {
        type: 'value',
        show: false,
        max: max
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#55616d',
          fontSize: 10
        },
        data: items.map(item => item.name)
      },
      series: [
        {
          type: 'bar',
          barWidth: 8,
          barGap: '-100%',
          silent: true,
          itemStyle: {
            color: '#eef1f3',
            borderRadius: 4
          },
          data: items.map(() => max)
        },
        {
          type: 'bar',
          barWidth: 8,
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => items[params.dataIndex].label,
            color: '#2e3338',
            fontSize: 10
          },
          itemStyle: {
            borderRadius: 4,
            color: (params: any) => items[params.dataIndex].color
          },
          data: items.map(item => item.value)
        }
      ]
    };
  }
  /*
   * ******End ****** Performance / Workload Insights Widget Related ********************
   */

  /*
   * -----Start----- Alert & Events View Widget Related -------------------
   */
  getTopCriticalAlerts(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudTopCriticalAlertsResponse> {
    return this.http.get<PublicCloudTopCriticalAlertsResponse>(PUBLIC_CLOUD_TOP_CRITICAL_ALERTS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToAlertSummaryMetricsViewData(data: PublicCloudTopCriticalAlertsResponse): PublicCloudAlertSummaryMetric[] {
    const summary = (data?.summary || {}) as Record<string, number | string>;
    return PUBLIC_CLOUD_ALERT_SUMMARY_CONFIG.map(item => ({
      label: item.label,
      value: this.formatAlertSummaryValue(summary[item.key], item.suffix),
      tone: item.tone
    }));
  }

  convertToCriticalAlertsViewData(data: PublicCloudTopCriticalAlertsResponse): PublicCloudCriticalAlert[] {
    return (data?.top_alerts || []).map(alert => ({
      id: alert.id,
      deviceName: alert.device_name,
      severity: alert.severity === 'high' ? 'high' : 'critical',
      description: alert.description,
      source: alert.source,
      acknowledged: alert.acknowledged,
      duration: alert.duration
    }));
  }

  private formatAlertSummaryValue(value: number | string, suffix?: string): string {
    const formattedValue = typeof value === 'number' ? this.formatNumber(value) : String(value || '0');
    return suffix && !formattedValue.endsWith(suffix) ? `${formattedValue}${suffix}` : formattedValue;
  }
  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */

  /*
   * -----Start----- Alert Trend Widget Related -------------------
   */
  getAIOpsDetails(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAIOpsDetailsResponse> {
    return this.http.get<PublicCloudAIOpsDetailsResponse>(PUBLIC_CLOUD_AIOPS_DETAILS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToAlertTrendLegendViewData(data: PublicCloudAIOpsDetailsResponse): PublicCloudAlertTrendLegendItem[] {
    const alertsPie = (data?.alerts_pie || {}) as Record<string, number>;
    return PUBLIC_CLOUD_ALERT_TREND_PIE_CONFIG.map(item => ({
      name: item.name,
      value: Number(alertsPie[item.key] || 0),
      color: item.color
    }));
  }

  convertToAlertTrendPolarOptions(data: PublicCloudAlertTrendLegendItem[]): EChartsOption {
    return this.getAlertTrendPolarOptions(data || []);
  }

  private getAlertTrendPolarOptions(items: PublicCloudAlertTrendLegendItem[]): EChartsOption {
    return {
      color: items.map(item => item.color),
      angleAxis: {
        type: 'category',
        data: items.map(item => item.name),
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      radiusAxis: {
        min: 0,
        max: 900,
        splitNumber: 9,
        axisLabel: {
          color: '#6f7882',
          fontSize: 9
        },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      polar: {
        radius: '78%',
        center: ['50%', '50%']
      },
      series: [
        {
          type: 'bar',
          coordinateSystem: 'polar',
          roundCap: false,
          data: items.map(item => ({
            value: item.value,
            itemStyle: {
              color: item.color,
              borderColor: item.color.replace('0.35', '1'),
              opacity: 0.75
            }
          }))
        }
      ]
    };
  }

  convertToAlertTrendStackGroupsViewData(data: PublicCloudAIOpsDetailsResponse): PublicCloudAlertTrendBarGroup[] {
    const aiopsGraph = (data?.aiops_graph || {}) as Record<string, Record<string, number>>;
    return PUBLIC_CLOUD_ALERT_TREND_STACK_CONFIG.map(group => ({
      name: group.name,
      items: group.items.map(item => ({
        label: item.label,
        value: Number(aiopsGraph[group.key]?.[item.key] || 0),
        color: item.color
      }))
    }));
  }

  convertToAlertTrendStackLegendViewData(data: PublicCloudAlertTrendBarGroup[]): PublicCloudAlertTrendStackLegendItem[] {
    return (data || []).reduce((legend: PublicCloudAlertTrendStackLegendItem[], group) => {
      return legend.concat(group.items || []);
    }, []);
  }

  convertToAlertTrendStackOptions(data: PublicCloudAlertTrendBarGroup[]): EChartsOption {
    return this.getAlertTrendStackOptions(data || []);
  }

  private getAlertTrendStackOptions(groups: PublicCloudAlertTrendBarGroup[]): EChartsOption {
    const categories = groups.map(group => group.name);
    const maxSeriesLength = Math.max(...groups.map(group => group.items.length), 0);
    const maxStackValue = groups.reduce((maxValue, group) => {
      const groupTotal = group.items.reduce((total, item) => total + item.value, 0);
      return Math.max(maxValue, groupTotal);
    }, 0);
    const yAxisMax = Math.max(900, Math.ceil(maxStackValue / 100) * 100);
    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const group = groups[items[0]?.dataIndex];
          return (group?.items || []).map(item => `${item.label}: ${item.value}`).join('<br/>');
        }
      },
      legend: { show: false },
      grid: { top: 12, right: 8, bottom: 28, left: 46 },
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: { show: false },
        axisLabel: { color: '#3c4650', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        max: yAxisMax,
        splitLine: { lineStyle: { color: '#e5e9ed' } },
        axisLabel: { color: '#6f7882', fontSize: 10 }
      },
      series: Array.from({ length: maxSeriesLength }).map((_, index) => ({
        name: `segment-${index}`,
        type: 'bar',
        stack: 'total',
        barWidth: 54,
        data: groups.map(group => {
          const item = group.items[index];
          return {
            value: item?.value || 0,
            itemStyle: { color: item?.color || 'transparent' }
          };
        })
      }))
    };
  }

  convertToAlertSideCardsViewData(data: PublicCloudAIOpsDetailsResponse): PublicCloudAlertSideCard[] {
    const details = (data?.raw_events_details || {}) as Record<string, number | string>;
    return PUBLIC_CLOUD_ALERT_SIDE_CARD_CONFIG.map(card => ({
      title: card.title,
      value: this.formatAlertSummaryValue(details[card.valueKey], card.suffix),
      metrics: card.metrics.map(metric => ({
        label: metric.label,
        value: this.formatAlertSummaryValue(details[metric.key]),
        tone: metric.tone
      }))
    }));
  }
  /*
   * ******End ****** Alert Trend Widget Related ********************
   */

  /*
   * -----Start----- ITSM Tickets Widget Related -------------------
   */
  buildTicketFilterForm(): FormGroup {
    const dateRange = this.getDefaultTicketDateRange();
    return this.builder.group({
      state: [''],
      ticket_type: [''],
      search: [''],
      priority: [''],
      dateRange: [[dateRange.startDate, dateRange.endDate]],
      start_date: [this.getTicketFilterDateValue(dateRange.startDate)],
      end_date: [this.getTicketFilterDateValue(dateRange.endDate)]
    });
  }

  getTicketGraphData(criteria?: PublicCloudDashboardFilterCriteria, ticketFilters?: PublicCloudTicketFilterCriteria): Observable<PublicCloudTicketGraphDataResponse> {
    return this.http.get<PublicCloudTicketGraphDataResponse>(PUBLIC_CLOUD_TICKET_GRAPH_DATA_ENDPOINT, {
      params: this.convertTicketFiltersToApiParams(criteria, ticketFilters)
    });
  }

  getTickets(criteria?: PublicCloudDashboardFilterCriteria, ticketFilters?: PublicCloudTicketFilterCriteria): Observable<PublicCloudTicketsResponse> {
    return this.http.get<PublicCloudTicketsResponse>(PUBLIC_CLOUD_TICKETS_ENDPOINT, {
      params: this.convertTicketFiltersToApiParams(criteria, ticketFilters, true)
    });
  }

  convertToTicketPriorityViewData(data: PublicCloudTicketGraphDataResponse): PublicCloudTicketDonutItem[] {
    return this.convertRecordToTicketDonutItems(data?.by_priority || {});
  }

  convertToTicketStatusViewData(data: PublicCloudTicketGraphDataResponse): PublicCloudTicketDonutItem[] {
    return this.convertRecordToTicketDonutItems(data?.by_state || {});
  }

  convertToTicketResponseTimeViewData(data: PublicCloudTicketGraphDataResponse): PublicCloudTicketDonutItem[] {
    const responseTime = (data?.closed_tickets_count_by_response_time || {}) as Record<string, number>;
    return PUBLIC_CLOUD_TICKET_RESPONSE_TIME_CONFIG.map(item => ({
      name: item.name,
      value: Number(responseTime[item.key] || 0),
      color: item.color
    }));
  }

  convertToTicketPriorityOptions(data: PublicCloudTicketDonutItem[]): EChartsOption {
    return this.getTicketDonutOptions(data || [], 'Tickets by Priority');
  }

  convertToTicketStatusOptions(data: PublicCloudTicketDonutItem[]): EChartsOption {
    return this.getTicketDonutOptions(data || [], 'Tickets by Status');
  }

  convertToTicketResponseTimeOptions(data: PublicCloudTicketDonutItem[]): EChartsOption {
    return this.getTicketDonutOptions(data || [], 'Solved by Response Time');
  }

  hasTicketDonutData(data: PublicCloudTicketDonutItem[]): boolean {
    return (data || []).some(item => Number(item.value || 0) > 0);
  }

  convertToTicketsViewData(data: PublicCloudTicketsResponse): PublicCloudTicketRow[] {
    return (data?.results || []).map(ticket => ({
      id: this.getTicketFieldValue(ticket.number || ticket.task_effective_number),
      shortDescription: this.getTicketFieldValue(ticket.short_description),
      state: this.getTicketFieldValue(ticket.state),
      priority: this.getTicketFieldValue(ticket.priority),
      createdOn: this.formatTicketDate(this.getTicketRawValue(ticket.opened_at)),
      updatedOn: this.formatTicketDate(this.getTicketRawValue(ticket.sys_updated_on)),
      resolution: ticket.resolved_at ? this.formatTicketDate(this.getTicketRawValue(ticket.resolved_at)) : this.getTicketFieldValue(ticket.state)
    }));
  }

  convertToTicketsTotal(data: PublicCloudTicketsResponse): number {
    return Number(data?.count || 0);
  }

  private convertTicketFiltersToApiParams(criteria?: PublicCloudDashboardFilterCriteria, ticketFilters?: PublicCloudTicketFilterCriteria, includePagination = false): HttpParams {
    let params = this.convertFiltersToApiParams(criteria);
    if (includePagination) {
      params = params.set('page', String(ticketFilters?.page || 1));
      params = params.set('page_size', String(ticketFilters?.page_size || 10));
      params = params.set('offset', String(((ticketFilters?.page || 1) - 1) * (ticketFilters?.page_size || 10)));
    }
    const filterKeys: Array<keyof PublicCloudTicketFilterCriteria> = [
      'state',
      'ticket_type',
      'search',
      'priority',
      'dateRange',
      'start_date',
      'end_date'
    ];
    filterKeys.forEach(key => {
      const value = ticketFilters?.[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  private convertRecordToTicketDonutItems(data: Record<string, number>): PublicCloudTicketDonutItem[] {
    return Object.keys(data || {}).map((key, index) => ({
      name: key,
      value: Number(data[key] || 0),
      color: PUBLIC_CLOUD_TICKET_CHART_COLORS[index % PUBLIC_CLOUD_TICKET_CHART_COLORS.length]
    }));
  }

  getTicketFilterDateValue(value: any): string {
    if (!value) {
      return '';
    }
    if (value.format) {
      return value.format('YYYY-MM-DD');
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : this.formatDateForInput(date);
  }

  private getDefaultTicketDateRange(): { startDate: moment.Moment, endDate: moment.Moment } {
    const endDate = moment().subtract(1, 'day');
    const startDate = endDate.clone().subtract(14, 'days');
    return {
      startDate,
      endDate
    };
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getTicketFieldValue(field: { display_value?: string, value?: string }): string {
    return field?.display_value || field?.value || '';
  }

  private getTicketRawValue(field: { display_value?: string, value?: string }): string {
    return field?.value || field?.display_value || '';
  }

  private formatTicketDate(value: string): string {
    return value ? this.utilSvc.toUnityOneDateFormat(value) : '';
  }

  private getTicketDonutOptions(items: PublicCloudTicketDonutItem[], title: string): EChartsOption {
    return {
      animation: false,
      title: {
        text: title,
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 11,
          fontWeight: 600,
          color: '#4d5966'
        }
      },
      color: items.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      legend: {
        type: 'plain',
        bottom: 0,
        left: 'center',
        itemWidth: 7,
        itemHeight: 7,
        textStyle: {
          fontSize: 8,
          color: '#566270'
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['43%', '67%'],
          center: ['50%', '46%'],
          label: {
            show: false
          },
          labelLine: { show: false },
          emphasis: {
            scale: false
          },
          data: items.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color,
              borderColor: '#ffffff',
              borderWidth: 2
            }
          }))
        }
      ]
    };
  }
  /*
   * ******End ****** ITSM Tickets Widget Related ********************
   */
}
