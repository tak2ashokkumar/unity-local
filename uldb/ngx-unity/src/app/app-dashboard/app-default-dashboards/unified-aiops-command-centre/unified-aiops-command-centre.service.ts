import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { DataCenterTabs } from 'src/app/united-cloud/datacenter/tabs';
import {
  UNIFIED_AIOPS_ALERTS_ENDPOINT,
  UNIFIED_AIOPS_ALERT_SEGREGATION_BY_TYPE_ENDPOINT,
  UNIFIED_AIOPS_ALERT_SOURCES,
  UNIFIED_AIOPS_AI_GPU_METRIC_CONFIG,
  UNIFIED_AIOPS_ALL_SELECTED_VALUE,
  UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT,
  UNIFIED_AIOPS_APPLICATION_OVERVIEW_ENDPOINT,
  UNIFIED_AIOPS_APPLICATION_SERVICES_ALERTS_ENDPOINT,
  UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT,
  UNIFIED_AIOPS_BUSINESS_SERVICES_ENDPOINT,
  UNIFIED_AIOPS_CONTAINER_SUMMARY_ENDPOINT,
  UNIFIED_AIOPS_DATABASE_MONITORING_ENDPOINT,
  UNIFIED_AIOPS_DATACENTER_INFRA_METRIC_CONFIG,
  UNIFIED_AIOPS_DATACENTER_INFRA_ENDPOINT,
  UNIFIED_AIOPS_DATACENTER_OPTIONS,
  UNIFIED_AIOPS_DISCOVERY_VS_MONITORING_ENDPOINT,
  UNIFIED_AIOPS_EMPLOYEE_METRIC_CONFIG,
  UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT,
  UNIFIED_AIOPS_EXECUTIVE_SUMMARY_METRIC_CONFIG,
  UNIFIED_AIOPS_GEO_DISTRIBUTION_GLOBAL_OPS_ENDPOINT,
  UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT,
  UNIFIED_AIOPS_KUBERNETES_METRIC_CONFIG,
  UNIFIED_AIOPS_OBSERVABILITY_SUMMARY_ENDPOINT,
  UNIFIED_AIOPS_OS_MONITORING_ENDPOINT,
  UNIFIED_AIOPS_PRIVATE_CLOUD_FAST_ENDPOINT,
  UNIFIED_AIOPS_PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT,
  UNIFIED_AIOPS_PUBLIC_CLOUD_FAST_ENDPOINT,
  UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT,
  UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT
} from './unified-aiops-command-centre.const';
import {
  UnifiedAiopsAlertRow,
  UnifiedAiopsBusinessService,
  UnifiedAiopsCloudFilterOption,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsDashboardFilterCriteria,
  UnifiedAiopsFilterOption,
  UnifiedAiopsHeatmapGroup,
  UnifiedAiopsLegendMetric,
  UnifiedAiopsMetric,
  UnifiedAiopsRemediationMetric,
  UnifiedAiopsStackItem,
  UnifiedAiopsTableRow,
  UnifiedAiopsTicketRow,
  UnifiedAiopsTone
} from './unified-aiops-command-centre.type';

@Injectable()
export class UnifiedAiopsCommandCentreService {
  private widgetResponseCache = new Map<string, Observable<any>>();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private datacenterService: DatacenterService) { }

  /*
   * -----Start----- Filters Related -------------------
   */
  buildFilterForm(datacenters: UnifiedAiopsFilterOption[], clouds: UnifiedAiopsCloudFilterOption[]): FormGroup {
    return this.builder.group({
      datacenters: [datacenters || []],
      clouds: [clouds || []]
    });
  }

  getDatacenters(): Observable<UnifiedAiopsFilterOption[]> {
    return this.datacenterService.getDataCenters().pipe(
      map(datacenters => this.getDatacenterFilterOptions(datacenters))
    );
  }

  getFallbackDatacenters(): UnifiedAiopsFilterOption[] {
    return this.getDatacenterFilterOptions([]);
  }

  getClouds(): Observable<UnifiedAiopsCloudFilterOption[]> {
    return forkJoin([
      this.getPrivateClouds().pipe(catchError(() => of([]))),
      this.getPublicClouds().pipe(catchError(() => of([])))
    ]).pipe(
      map(([privateClouds, publicClouds]) => [
        ...this.getPrivateCloudFilterOptions(privateClouds),
        ...this.getPublicCloudFilterOptions(publicClouds)
      ])
    );
  }

  private getPrivateClouds(): Observable<any[]> {
    return this.http.get<any[]>(UNIFIED_AIOPS_PRIVATE_CLOUD_FAST_ENDPOINT, {
      params: new HttpParams().set('page_size', '0')
    }).pipe(map(res => this.getArrayFromPayload<any>(res)));
  }

  private getPublicClouds(): Observable<any[]> {
    return this.http.get<any[]>(UNIFIED_AIOPS_PUBLIC_CLOUD_FAST_ENDPOINT, {
      params: new HttpParams().set('page_size', '0')
    }).pipe(map(res => this.getArrayFromPayload<any>(res)));
  }

  private getDatacenterFilterOptions(datacenters: DataCenterTabs[]): UnifiedAiopsFilterOption[] {
    const options = (datacenters || [])
      .filter(datacenter => datacenter && datacenter.uuid && datacenter.name)
      .map(datacenter => ({ value: datacenter.uuid, label: datacenter.name }));

    return options.length
      ? options
      : UNIFIED_AIOPS_DATACENTER_OPTIONS.filter(option => option.value !== UNIFIED_AIOPS_ALL_SELECTED_VALUE);
  }

  private getPrivateCloudFilterOptions(clouds: any[]): UnifiedAiopsCloudFilterOption[] {
    return (clouds || []).reduce((options: UnifiedAiopsCloudFilterOption[], cloud: any) => {
      if (cloud?.uuid) {
        options.push({
          value: cloud.uuid,
          label: cloud.name || cloud.instance_name || cloud.display_name || cloud.uuid,
          category: 'private'
        });
      }
      return options;
    }, []);
  }

  private getPublicCloudFilterOptions(clouds: any[]): UnifiedAiopsCloudFilterOption[] {
    return (clouds || []).reduce((options: UnifiedAiopsCloudFilterOption[], cloud: any) => {
      if (cloud?.uuid) {
        options.push({
          value: cloud.uuid,
          label: cloud.account_name || cloud.name || cloud.instance_name || cloud.uuid,
          category: 'public'
        });
      }
      return options;
    }, []);
  }

  /*
   * ******End ****** Filters Related ********************
   */

  /*
   * -----Start----- Executive Monitoring Summary Widget Related -------------------
   */
  getSummaryMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT, criteria).pipe(map(res => this.getExecutiveSummaryMetrics(res)));
  }

  convertToMetricsViewData(data: UnifiedAiopsMetric[]): UnifiedAiopsMetric[] {
    return data || [];
  }

  private getExecutiveSummaryMetrics(response: any): UnifiedAiopsMetric[] {
    const payload = this.getMetricPayload(response, ['summary', 'metrics', 'summary_metrics', 'data']);
    const flatPayload = this.flattenPayload(payload || response);

    return UNIFIED_AIOPS_EXECUTIVE_SUMMARY_METRIC_CONFIG.map(metric => ({
      label: metric.label,
      value: this.formatNumber(this.getFirstMetricValue(flatPayload, metric.keys)),
      tone: metric.tone
    }));
  }
  /*
   * ******End ****** Executive Monitoring Summary Widget Related ********************
   */

  /*
   * -----Start----- Device Discovery vs Monitoring Enablement Widget Related -------------------
   */
  getDiscoveryItems(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsStackItem[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_DISCOVERY_VS_MONITORING_ENDPOINT, criteria).pipe(map(res => this.getDiscoveryStackItems(res)));
  }

  convertToDiscoveryOptions(data: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getDiscoveryOptions(data || []);
  }

  private getDiscoveryOptions(items: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getStackedBarOptions(
      items,
      ['Monitored', 'Not Monitored'],
      ['#16a052', '#dfe3e8'],
      300
    );
  }

  private getDiscoveryStackItems(response: any): UnifiedAiopsStackItem[] {
    const payload = this.getMetricPayload(response, ['items', 'chart', 'discovery', 'discovery_items']);
    const source = this.getArrayFromPayload<any>(payload);
    const items = source.length
      ? source.map(item => this.getDiscoveryStackItemFromPayload(item))
      : Object.keys(payload || {}).map(key => this.getDiscoveryStackItemFromPayload(payload[key], key));

    return this.getTopStackItems(items, 8);
  }

  private getDiscoveryStackItemFromPayload(payload: any, fallbackName?: string): UnifiedAiopsStackItem {
    const flatPayload = this.flattenPayload(payload || {});
    const monitored = this.getNumberFromPayload(flatPayload, ['monitored', 'monitoring_enabled', 'enabled']);
    const total = this.getNumberFromPayload(flatPayload, ['total', 'total_count', 'totalCount']);
    const directNotMonitored = this.getNumberFromPayload(flatPayload, ['not_monitored', 'notMonitored', 'not_monitoring_enabled']);
    const notMonitored = total > 0 ? Math.max(total - monitored, 0) : directNotMonitored;

    return {
      name: this.getStackItemName(payload, fallbackName),
      values: [monitored, notMonitored]
    };
  }
  /*
   * ******End ****** Device Discovery vs Monitoring Enablement Widget Related ********************
   */

  /*
   * -----Start----- Alert Segregation by Type Widget Related -------------------
   */
  getAlertSegregationLegend(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsLegendMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERT_SEGREGATION_BY_TYPE_ENDPOINT, criteria).pipe(map(res => this.getAlertSegregationLegendMetrics(res)));
  }

  convertToLegendMetricsViewData(data: UnifiedAiopsLegendMetric[]): UnifiedAiopsLegendMetric[] {
    return data || [];
  }

  getAlertSegregationItems(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsStackItem[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERT_SEGREGATION_BY_TYPE_ENDPOINT, criteria).pipe(map(res => this.getAlertSegregationStackItems(res)));
  }

  convertToAlertSegregationOptions(data: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getAlertSegregationOptions(data || []);
  }

  private getAlertSegregationOptions(items: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getStackedBarOptions(
      items,
      ['Critical', 'Warning', 'Info'],
      ['#5572c6', '#92cf75', '#ffc95d'],
      22
    );
  }

  private getAlertSegregationLegendMetrics(response: any): UnifiedAiopsLegendMetric[] {
    const summary = this.flattenPayload(this.getMetricPayload(response, ['legend', 'summary', 'metrics', 'alert_legend']));
    const items = this.getAlertSegregationStackItems(response);
    const totals = items.reduce((result, item) => {
      result.critical += item.values[0] || 0;
      result.warning += item.values[1] || 0;
      result.info += item.values[2] || 0;
      return result;
    }, { critical: 0, warning: 0, info: 0 });

    return [
      { icon: 'fa-exclamation-triangle', value: this.formatNumber(this.getNumberFromPayload(summary, ['critical', 'critical_alerts'], totals.critical)), tone: 'danger' },
      { icon: 'fa-exclamation-circle', value: this.formatNumber(this.getNumberFromPayload(summary, ['warning', 'warnings', 'warning_alerts'], totals.warning)), tone: 'warning' },
      { icon: 'fa-info-circle', value: this.formatNumber(this.getNumberFromPayload(summary, ['info', 'informative', 'information', 'info_alerts'], totals.info)), tone: 'primary' }
    ];
  }

  private getAlertSegregationStackItems(response: any): UnifiedAiopsStackItem[] {
    const payload = this.getMetricPayload(response, ['items', 'chart', 'segregation', 'alert_items', 'results']);
    const source = this.getArrayFromPayload<any>(payload);
    const items = source.length
      ? source.map(item => this.getAlertSegregationStackItemFromPayload(item))
      : Object.keys(payload || {}).map(key => this.getAlertSegregationStackItemFromPayload(payload[key], key));

    return this.getTopStackItems(items, 10);
  }

  private getAlertSegregationStackItemFromPayload(payload: any, fallbackName?: string): UnifiedAiopsStackItem {
    if (payload?.values && Array.isArray(payload.values)) {
      return {
        name: this.getStackItemName(payload, fallbackName),
        values: [
          this.getNumberValue(payload.values[0]),
          this.getNumberValue(payload.values[1]),
          this.getNumberValue(payload.values[2])
        ]
      };
    }

    const flatPayload = this.flattenPayload(payload || {});
    const critical = this.getNumberFromPayload(flatPayload, ['critical', 'critical_alerts']);
    const warning = this.getNumberFromPayload(flatPayload, ['warning', 'warnings', 'warning_alerts']);
    const info = this.getNumberFromPayload(flatPayload, ['info', 'informative', 'information', 'info_alerts']);
    const count = this.getNumberFromPayload(flatPayload, ['count', 'total']);

    return {
      name: this.getStackItemName(payload, fallbackName),
      values: critical || warning || info ? [critical, warning, info] : [0, 0, count]
    };
  }
  /*
   * ******End ****** Alert Segregation by Type Widget Related ********************
   */

  private getStackedBarOptions(items: UnifiedAiopsStackItem[], names: string[], colors: string[], max: number): EChartsOption {
    const viewItems = items || [];
    const categories = viewItems.map(item => item.name).reverse();
    const reversedItems = [...viewItems].reverse();
    const axisMax = this.getStackedBarMax(viewItems, max);

    return {
      color: colors,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 7,
        textStyle: { color: '#627283', fontSize: 10 }
      },
      grid: { left: 108, right: 22, top: 16, bottom: 32 },
      xAxis: {
        type: 'value',
        max: axisMax,
        axisLabel: { color: '#758394', fontSize: 9 },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#5e6b78', fontSize: 9 },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: names.map((name, index) => ({
        name,
        type: 'bar',
        stack: 'total',
        barWidth: 18,
        label: {
          show: true,
          position: 'inside',
          color: index === 1 && names.length === 2 ? '#56616d' : '#ffffff',
          fontSize: 8,
          formatter: (params: any) => params.value ? params.value : ''
        },
        emphasis: { focus: 'series' },
        data: reversedItems.map(item => item.values[index])
      }))
    };
  }

  private getTopStackItems(items: UnifiedAiopsStackItem[], limit: number): UnifiedAiopsStackItem[] {
    return (items || [])
      .filter(item => item?.name && item.values?.some(value => value > 0))
      .sort((a, b) => this.getStackTotal(b) - this.getStackTotal(a))
      .slice(0, limit);
  }

  private getStackTotal(item: UnifiedAiopsStackItem): number {
    return (item.values || []).reduce((total, value) => total + this.getNumberValue(value), 0);
  }

  private getStackedBarMax(items: UnifiedAiopsStackItem[], fallbackMax: number): number {
    const maxValue = Math.max(...(items || []).map(item => this.getStackTotal(item)), fallbackMax || 0);
    if (!isFinite(maxValue) || maxValue <= 0) {
      return fallbackMax || 10;
    }
    return Math.ceil(maxValue * 1.12);
  }

  private getStackItemName(payload: any, fallbackName?: string): string {
    const name = payload?.name || payload?.label || payload?.device_type || payload?.resource_type || payload?.type || fallbackName || '';
    return this.getReadableStackLabel(name);
  }

  /*
   * -----Start----- Business Services Widget Related -------------------
   */
  getBusinessServices(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsBusinessService[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_BUSINESS_SERVICES_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsBusinessService>(res, ['services', 'business_services', 'rows']))
    );
  }

  convertToBusinessServicesViewData(data: UnifiedAiopsBusinessService[]): UnifiedAiopsBusinessService[] {
    return data || [];
  }
  /*
   * ******End ****** Business Services Widget Related ********************
   */

  /*
   * -----Start----- Employee / Digital Experience Widget Related -------------------
   */
  getEmployeeMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_APPLICATION_SERVICES_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getEmployeeExperienceMetrics(res))
    );
  }

  private getEmployeeExperienceMetrics(response: any): UnifiedAiopsMetric[] {
    const payload = this.getMetricPayload(response, ['summary', 'metrics', 'application_services_alerts', 'data']);
    const flatPayload = this.flattenPayload(payload || response);
    const warning = this.getNumberFromPayload(flatPayload, ['warnings', 'warning', 'total_warning', 'totalWarning', 'warning_count', 'warningCount']);
    const critical = this.getNumberFromPayload(flatPayload, ['critical', 'total_critical', 'totalCritical', 'critical_count', 'criticalCount']);
    const totalEndpoints = this.getNumberFromPayload(flatPayload, ['total_endpoints', 'totalEndpoints', 'endpoints', 'endpoint_count', 'total_services', 'totalServices']);
    const healthy = this.getNumberFromPayload(flatPayload, ['healthy', 'total_healthy', 'totalHealthy', 'healthy_count', 'healthyCount'], Math.max(totalEndpoints - warning - critical, 0));

    return UNIFIED_AIOPS_EMPLOYEE_METRIC_CONFIG.map(metric => {
      let value = this.getFirstMetricValue(flatPayload, metric.keys);

      if (metric.label === 'Healthy') {
        value = healthy;
      }

      return {
        label: metric.label,
        value: this.formatNumber(value),
        tone: metric.tone
      };
    });
  }
  /*
   * ******End ****** Employee / Digital Experience Widget Related ********************
   */

  /*
   * -----Start----- Geo Distribution / Global Operations Widget Related -------------------
   */
  getGeoHeatmap(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsHeatmapGroup[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_GEO_DISTRIBUTION_GLOBAL_OPS_ENDPOINT, criteria).pipe(map(res => this.getGeoHeatmapGroups(res)));
  }

  convertToGeoHeatmapOptions(data: UnifiedAiopsHeatmapGroup[]): EChartsOption {
    return this.getGeoHeatmapOptions(data || []);
  }

  private getGeoHeatmapOptions(groups: UnifiedAiopsHeatmapGroup[]): EChartsOption {
    const cells = groups.reduce((items: any[], group) => {
      (group.children || []).forEach(child => {
        items.push({
          name: child.name,
          region: group.name,
          value: [child.x, child.y, child.width, child.height],
          usage: child.usage,
          color: group.color,
          total: child.value,
          information: (child as any).information,
          warning: (child as any).warning,
          critical: (child as any).critical
        });
      });
      return items;
    }, []);
    const labels = groups.map(group => ({
      name: group.name,
      value: [group.labelX, group.labelY]
    }));
    const usageLabels = cells
      .filter(item => item.usage)
      .map(item => ({
        name: item.usage,
        value: [item.value[0] + 3, item.value[1] - 1]
      }));

    return {
      animation: false,
      tooltip: {
        formatter: (info: any) => {
          const data = info.data || {};
          const region = data.region ? String(data.region).replace(/\n/g, ' ') : '';
          if (data.total !== undefined) {
            return [
              region || data.name,
              `Total: ${this.formatNumber(data.total)}`,
              `Info: ${this.formatNumber(data.information || 0)}`,
              `Warnings: ${this.formatNumber(data.warning || 0)}`,
              `Critical: ${this.formatNumber(data.critical || 0)}`
            ].join('<br/>');
          }
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
                    text: this.getGeoCellText(item.name, item.total),
                    x: start[0] + width / 2,
                    y: start[1] + height / 2,
                    fill: '#26313b',
                    font: '9px Arial',
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    overflow: 'truncate',
                    width: Math.max(width - 10, 24)
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
        },
        {
          type: 'custom',
          coordinateSystem: 'cartesian2d',
          silent: true,
          clip: false,
          renderItem: (params: any, api: any) => {
            const item = usageLabels[params.dataIndex];
            const point = api.coord(item.value);

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: {
                    x: point[0],
                    y: point[1] - 18,
                    width: 88,
                    height: 22,
                    r: 2
                  },
                  style: {
                    fill: '#e8edf5',
                    shadowBlur: 2,
                    shadowColor: 'rgba(0, 0, 0, 0.15)'
                  }
                },
                {
                  type: 'text',
                  style: {
                    text: item.name,
                    x: point[0] + 8,
                    y: point[1] - 7,
                    fill: '#53606d',
                    font: '8px Arial',
                    textAlign: 'left',
                    textVerticalAlign: 'middle'
                  }
                }
              ]
            };
          },
          data: usageLabels
        }
      ]
    };
  }

  private getGeoHeatmapGroups(response: any): UnifiedAiopsHeatmapGroup[] {
    const payload = this.getMetricPayload(response, ['groups', 'heatmap', 'geo_distribution', 'geo_heatmap', 'locations', 'results', 'items', 'rows', 'data']);
    const items = this.getGeoDistributionItems(payload || response);
    const layouts = this.getGeoHeatmapLayouts();

    return items.slice(0, layouts.length).map((item, index) => {
      const layout = layouts[index];
      return {
        name: this.getShortGeoLabel(item.name),
        color: this.getGeoDistributionColor(item, index),
        labelX: layout.labelX,
        labelY: layout.labelY,
        children: [{
          name: item.name,
          value: item.total,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          information: item.information,
          warning: item.warning,
          critical: item.critical
        } as any]
      };
    });
  }

  private getGeoDistributionItems(payload: any): Array<{ name: string; total: number; information: number; warning: number; critical: number }> {
    const source = Array.isArray(payload) ? payload : Object.keys(payload || {}).map(key => ({
      name: key,
      ...(payload[key] || {})
    }));

    return source
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const flatPayload = this.flattenPayload(item);
        const name = String(item.name || item.location || item.datacenter || item.region || item.city || 'Unknown');
        const information = this.getNumberFromPayload(flatPayload, ['information', 'info', 'informative']);
        const warning = this.getNumberFromPayload(flatPayload, ['warning', 'warnings']);
        const critical = this.getNumberFromPayload(flatPayload, ['critical', 'critical_alerts']);
        const total = this.getNumberFromPayload(flatPayload, ['total', 'count'], information + warning + critical);

        return { name, total, information, warning, critical };
      })
      .filter(item => item.name && item.total >= 0)
      .sort((first, second) => second.total - first.total);
  }

  private getGeoHeatmapLayouts(): Array<{ labelX: number; labelY: number; x: number; y: number; width: number; height: number }> {
    return [
      { labelX: 0, labelY: 0, x: 0, y: 12, width: 52, height: 44 },
      { labelX: 0, labelY: 58, x: 0, y: 68, width: 52, height: 32 },
      { labelX: 69, labelY: 0, x: 69, y: 12, width: 31, height: 60 },
      { labelX: 52, labelY: 6, x: 52, y: 12, width: 17, height: 44 },
      { labelX: 69, labelY: 74, x: 69, y: 80, width: 31, height: 20 },
      { labelX: 52, labelY: 62, x: 52, y: 68, width: 17, height: 32 }
    ];
  }

  private getGeoDistributionColor(_item: { warning: number; critical: number }, index: number): string {
    const colors = ['#5875c8', '#90cc74', '#ffca4d', '#5875c8', '#ffc64b', '#8ccd72'];
    return colors[index % colors.length];
  }

  private getShortGeoLabel(label: string): string {
    return String(label || '')
      .replace(', USA', '')
      .replace(', United States', '')
      .split(',')
      .slice(0, 2)
      .join('\n')
      .trim();
  }

  private getGeoCellText(label: string, total: number): string {
    const shortLabel = String(label || '').split(',')[0].trim();
    return `${shortLabel}\n${this.formatNumber(total || 0)}`;
  }
  /*
   * ******End ****** Geo Distribution / Global Operations Widget Related ********************
   */

  /*
   * -----Start----- Infrastructure Coverage Widgets Related -------------------
   */
  getPrivateCloudCoverage(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsCoverageCard[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT, criteria).pipe(map(res => this.getCoverageCards(res, this.getPrivateCloudCoverageLabels())));
  }

  getPublicCloudCoverage(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsCoverageCard[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT, criteria).pipe(map(res => this.getCoverageCards(res, this.getPublicCloudCoverageLabels())));
  }

  convertToCoverageCardsViewData(data: UnifiedAiopsCoverageCard[]): UnifiedAiopsCoverageCard[] {
    return data || [];
  }

  getCoverageResourceTotal(cards: UnifiedAiopsCoverageCard[]): string {
    const total = (cards || []).reduce((sum, card) => {
      const rowTotal = (card.rows || []).reduce((rowSum, row) => rowSum + this.getNumberValue(row.value), 0);
      const cardTotal = this.getNumberValue(card.totalResources, rowTotal);
      return sum + cardTotal;
    }, 0);
    return this.formatNumber(total);
  }

  private getCoverageCards(response: any, labelConfig: { [key: string]: string }): UnifiedAiopsCoverageCard[] {
    const payload = this.getMetricPayload(response, ['coverage', 'cards', 'private_cloud_coverage', 'public_cloud_coverage', 'data', 'result', 'results']);

    if (Array.isArray(payload)) {
      return payload
        .map(card => this.getCoverageCardFromPayload(card, labelConfig))
        .filter(card => card.rows.length);
    }

    return Object.keys(payload || {})
      .filter(key => !this.isCoverageTotalKey(key))
      .map(key => this.getCoverageCardFromPayload({
        platform: key,
        title: labelConfig[key] || this.getReadableCoverageLabel(key),
        ...(payload[key] || {})
      }, labelConfig))
      .filter(card => card.rows.length);
  }

  private getCoverageCardFromPayload(payload: any, labelConfig: { [key: string]: string }): UnifiedAiopsCoverageCard {
    const platformKey = String(payload?.platform || payload?.type || payload?.name || payload?.key || '').toLowerCase();
    const title = payload?.title || labelConfig[platformKey] || this.getReadableCoverageLabel(platformKey);
    const rowsPayload = payload?.resource_types || payload?.resourceTypes || payload?.resources || payload?.rows || payload;
    const rows = this.getCoverageRows(rowsPayload);
    const rowTotal = rows.reduce((total, row) => total + this.getNumberValue(row.value), 0);
    const totalResources = this.getNumberFromPayload(this.flattenPayload(payload || {}), ['total_resources', 'totalResources', 'total', 'count'], rowTotal);

    return {
      title,
      rows,
      totalResources: this.formatNumber(totalResources)
    };
  }

  private getCoverageRows(payload: any): Array<{ label: string; value: string }> {
    if (Array.isArray(payload)) {
      return payload
        .map(row => ({
          label: this.getReadableCoverageLabel(row?.label || row?.name || row?.type || row?.resource_type),
          value: this.formatNumber(row?.value ?? row?.count ?? row?.total ?? 0)
        }))
        .filter(row => this.getNumberValue(row.value) > 0);
    }

    return Object.keys(payload || {})
      .filter(key => !this.isCoverageTotalKey(key) && this.isSimpleMetricValue(payload[key]))
      .map(key => ({
        label: this.getReadableCoverageLabel(key),
        value: this.formatNumber(payload[key])
      }))
      .filter(row => this.getNumberValue(row.value) > 0);
  }

  private isCoverageTotalKey(key: string): boolean {
    return ['total_resources', 'totalResources', 'total', 'platform', 'type', 'name', 'key', 'title'].includes(key);
  }

  private getPrivateCloudCoverageLabels(): { [key: string]: string } {
    return {
      vmware: 'VMware',
      nutanix: 'Nutanix',
      hyperv: 'Hyper-V',
      proxmox: 'Proxmox',
      openstack: 'OpenStack',
      vcloud: 'VMware vCloud'
    };
  }

  private getPublicCloudCoverageLabels(): { [key: string]: string } {
    return {
      aws: 'Amazon Web Service',
      azure: 'Microsoft Azure',
      gcp: 'Google Cloud Platform',
      oci: 'Oracle Cloud'
    };
  }

  private getReadableCoverageLabel(label: string): string {
    const labelMap: { [key: string]: string } = {
      vm: 'VMs',
      hypervisor: 'Hyper-V Hosts',
      database: 'Databases',
      vpc: 'VPC',
      vcn: 'VCN',
      eip: 'EIP',
      dbclustersnapshot: 'DB Cluster Snapshot',
      dbsnapshot: 'DB Snapshot',
      dhcpoptions: 'DHCP Options'
    };
    const normalizedLabel = this.normalizeKey(label);

    if (labelMap[normalizedLabel]) {
      return labelMap[normalizedLabel];
    }

    return String(label || '')
      .replace(/_/g, ' ')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }
  /*
   * ******End ****** Infrastructure Coverage Widgets Related ********************
   */

  /*
   * -----Start----- Data Center Infrastructure Widget Related -------------------
   */
  getDatacenterInfrastructureMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_DATACENTER_INFRA_ENDPOINT, criteria).pipe(map(res => this.getStatusSummaryMetrics(res, UNIFIED_AIOPS_DATACENTER_INFRA_METRIC_CONFIG, ['metrics', 'summary', 'datacenter_infra', 'data'])));
  }
  /*
   * ******End ****** Data Center Infrastructure Widget Related ********************
   */

  /*
   * -----Start----- Kubernetes / Container Widget Related -------------------
   */
  getKubernetesMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_CONTAINER_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getStatusSummaryMetrics(res, UNIFIED_AIOPS_KUBERNETES_METRIC_CONFIG, ['metrics', 'summary', 'container_summary', 'data']))
    );
  }
  /*
   * ******End ****** Kubernetes / Container Widget Related ********************
   */

  /*
   * -----Start----- AI / GPU / LLM Widget Related -------------------
   */
  getAiGpuMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_OBSERVABILITY_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getStatusSummaryMetrics(res, UNIFIED_AIOPS_AI_GPU_METRIC_CONFIG, ['metrics', 'summary', 'observability_summary', 'data']))
    );
  }

  private getStatusSummaryMetrics(response: any,
    metricConfig: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[]; suffix?: string; threshold?: 'utilization' | 'warning' }>,
    payloadKeys: string[]): UnifiedAiopsMetric[] {
    const payload = this.getMetricPayload(response, payloadKeys);

    if (Array.isArray(payload)) {
      return payload.map(metric => this.getStatusSummaryMetric(metric?.label || metric?.name || '', metric, metric));
    }

    const usedKeys = new Set<string>();
    const configuredMetrics = (metricConfig || []).reduce((metrics: UnifiedAiopsMetric[], config) => {
      const value = this.getConfiguredMetricValue(payload, config.keys, usedKeys);
      if (value !== undefined && value !== null) {
        metrics.push(this.getStatusSummaryMetric(config.label, value, config));
      }
      return metrics;
    }, []);

    const additionalMetrics = Object.keys(payload || {})
      .filter(key => !usedKeys.has(this.normalizeKey(key)) && !this.isSummaryTotalKey(key))
      .map(key => this.getStatusSummaryMetric(this.getReadableStackLabel(key), payload[key], { label: key, keys: [key] }));

    return [...configuredMetrics, ...additionalMetrics];
  }

  private getConfiguredMetricValue(payload: any, keys: string[], usedKeys: Set<string>): any {
    const normalizedPayload = this.getNormalizedPayload(payload || {});
    for (const key of keys || []) {
      const normalizedKey = this.normalizeKey(key);
      if (normalizedPayload[normalizedKey] !== undefined && normalizedPayload[normalizedKey] !== null) {
        usedKeys.add(normalizedKey);
        return normalizedPayload[normalizedKey];
      }
    }
    return undefined;
  }

  private getStatusSummaryMetric(label: string,
    payload: any,
    config: { label?: string; keys?: string[]; tone?: UnifiedAiopsTone; suffix?: string; threshold?: 'utilization' | 'warning' }): UnifiedAiopsMetric {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const flatPayload = this.flattenPayload(payload);
      const up = this.getNumberFromPayload(flatPayload, ['up', 'online', 'healthy', 'active']);
      const down = this.getNumberFromPayload(flatPayload, ['down', 'offline', 'unhealthy', 'critical']);
      const unknown = this.getNumberFromPayload(flatPayload, ['unknown', 'unknowns', 'warning']);
      const total = this.getNumberFromPayload(flatPayload, ['total', 'count', 'value'], up + down + unknown);

      return {
        label,
        value: this.formatNumber(total),
        tone: config.tone || 'primary',
        up: this.formatNumber(up),
        down: this.formatNumber(down),
        unknown: this.formatNumber(unknown)
      };
    }

    const numericValue = this.getNumberValue(payload);
    return {
      label,
      value: this.formatSummaryValue(payload, config.suffix),
      tone: config.tone || this.getThresholdTone(numericValue, config.threshold)
    };
  }

  private formatSummaryValue(value: any, suffix?: string): string {
    const formattedValue = this.formatNumber(value);
    if (!suffix || formattedValue.endsWith(suffix)) {
      return formattedValue;
    }
    return `${formattedValue}${suffix}`;
  }

  private getThresholdTone(value: number, threshold?: 'utilization' | 'warning'): UnifiedAiopsTone {
    if (threshold === 'utilization') {
      return value >= 75 ? 'danger' : value >= 50 ? 'warning' : 'primary';
    }
    if (threshold === 'warning') {
      return value >= 90 ? 'danger' : value >= 70 ? 'warning' : 'primary';
    }
    return 'primary';
  }

  private isSummaryTotalKey(key: string): boolean {
    return ['total', 'totalcount', 'totalresources'].includes(this.normalizeKey(key));
  }
  /*
   * ******End ****** AI / GPU / LLM Widget Related ********************
   */

  /*
   * -----Start----- Application and Services Overview Widgets Related -------------------
   */
  getApplicationRows(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_APPLICATION_OVERVIEW_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsTableRow>(res, ['applications', 'rows', 'application_overview']))
    );
  }

  getServiceRows(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsTableRow>(res, ['services', 'rows', 'services_overview']))
    );
  }

  convertToTableRowsViewData(data: UnifiedAiopsTableRow[]): UnifiedAiopsTableRow[] {
    return data || [];
  }
  /*
   * ******End ****** Application and Services Overview Widgets Related ********************
   */

  /*
   * -----Start----- Database and OS Monitoring Widgets Related -------------------
   */
  getDatabaseRows(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_DATABASE_MONITORING_ENDPOINT, criteria).pipe(map(res => this.getDatabaseMonitoringRows(res)));
  }

  getOsRows(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTableRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_OS_MONITORING_ENDPOINT, criteria).pipe(
      map(res => this.getOsMonitoringRows(res))
    );
  }

  private getDatabaseMonitoringRows(response: any): UnifiedAiopsTableRow[] {
    return this.getMonitoringTableRows(response, ['databases', 'database_monitoring', 'rows', 'results', 'data'], 'database');
  }

  private getOsMonitoringRows(response: any): UnifiedAiopsTableRow[] {
    return this.getMonitoringTableRows(response, ['operating_systems', 'os_monitoring', 'os', 'rows', 'results', 'data'], 'os');
  }

  private getMonitoringTableRows(response: any, payloadKeys: string[], tableType: 'database' | 'os'): UnifiedAiopsTableRow[] {
    const payload = this.getMetricPayload(response, payloadKeys);
    const source = this.getArrayFromPayload<any>(payload);

    if (source.length) {
      return source.map(row => this.getMonitoringTableRow(row, tableType));
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload) && !this.isPaginatedEmptyPayload(payload)) {
      return Object.keys(payload)
        .filter(key => !this.isSummaryTotalKey(key) && payload[key] !== null && payload[key] !== undefined)
        .map(key => this.getMonitoringTableRow({ name: key, value: payload[key] }, tableType));
    }

    return [];
  }

  private getMonitoringTableRow(row: any, tableType: 'database' | 'os'): UnifiedAiopsTableRow {
    const valuePayload = row?.value && typeof row.value === 'object' ? row.value : row;
    const flatPayload = this.flattenPayload(valuePayload || {});
    const name = this.getFirstStringValue(flatPayload, tableType === 'database'
      ? ['database_type', 'databaseType', 'db_type', 'dbType', 'type', 'name', 'label']
      : ['os', 'os_name', 'osName', 'database_type', 'databaseType', 'type', 'name', 'label']
    );
    const count = this.getNumberFromPayload(flatPayload, ['count', 'total', 'value', 'instances'], this.getNumberValue(row?.value));
    const queries = this.getFirstStringValue(flatPayload, ['queries_a', 'queriesA', 'queries', 'query_count', 'queryCount', 'queries_per_annum', 'queriesPerAnnum']);
    const eolDate = this.getFirstStringValue(flatPayload, ['eol_date', 'eolDate', 'end_of_life', 'endOfLife', 'date']);

    return {
      name: name || row?.name || '-',
      count: this.formatNumber(count),
      status: this.getMonitoringStatusTone(flatPayload),
      queries: tableType === 'database' ? this.formatTableCell(queries) : undefined,
      eolDate: tableType === 'os' ? this.formatTableCell(eolDate) : undefined
    };
  }

  private getMonitoringStatusTone(payload: { [key: string]: any }): UnifiedAiopsTone {
    const status = String(this.getFirstStringValue(payload, ['status', 'health', 'severity', 'state']) || '').toLowerCase();
    if (['critical', 'down', 'failed', 'error', 'unhealthy'].includes(status)) {
      return 'danger';
    }
    if (['warning', 'degraded', 'idle', 'partial'].includes(status)) {
      return 'warning';
    }
    if (['ok', 'up', 'healthy', 'success', 'active', 'online'].includes(status)) {
      return 'success';
    }

    const down = this.getNumberFromPayload(payload, ['down', 'critical', 'error']);
    const warning = this.getNumberFromPayload(payload, ['warning', 'degraded']);
    if (down > 0) {
      return 'danger';
    }
    if (warning > 0) {
      return 'warning';
    }
    return 'success';
  }

  private getFirstStringValue(payload: { [key: string]: any }, keys: string[]): string {
    const normalizedPayload = this.getNormalizedPayload(payload || {});
    for (const key of keys || []) {
      const normalizedKey = this.normalizeKey(key);
      if (normalizedPayload[normalizedKey] !== undefined && normalizedPayload[normalizedKey] !== null && normalizedPayload[normalizedKey] !== '') {
        return String(normalizedPayload[normalizedKey]);
      }
    }
    return '';
  }

  private formatTableCell(value: string): string {
    return value ? this.formatNumber(value) : '-';
  }

  private isPaginatedEmptyPayload(payload: any): boolean {
    return Array.isArray(payload?.results) && !payload.results.length;
  }
  /*
   * ******End ****** Database and OS Monitoring Widgets Related ********************
   */

  /*
   * -----Start----- Infrastructure / Platform Performance Widget Related -------------------
   */
  getBandwidthBar(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['bandwidth_bar', 'bandwidthBar', 'avg_network_bandwidth_bar']))
    );
  }

  convertToBandwidthBarOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getBandwidthBarOptions(): EChartsOption {
    const names = ['prod-db-01', 'ml-gpu-04', 'k8s-node-12', 'app-srv-08', 'es-node-03'];
    const values = [94, 88, 81, 76, 71];
    return {
      grid: { left: 72, right: 18, top: 12, bottom: 24 },
      xAxis: { type: 'value', max: 100, axisLabel: { fontSize: 9, color: '#7b8794' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      yAxis: { type: 'category', data: names.reverse(), axisLabel: { fontSize: 9, color: '#5f6d7b' }, axisTick: { show: false }, axisLine: { show: false } },
      series: [{
        type: 'bar',
        data: values.reverse().map((value, index) => ({ value, itemStyle: { color: ['#2f80ed', '#2f80ed', '#2f80ed', '#e68612', '#e5232b'][index] } })),
        barWidth: 13
      }]
    };
  }

  getBandwidthLine(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['bandwidth_line', 'bandwidthLine', 'avg_network_bandwidth_line']))
    );
  }

  convertToBandwidthLineOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getBandwidthLineOptions(): EChartsOption {
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 14, bottom: 25 },
      xAxis: { type: 'category', data: ['10:00', '10:10', '10:20', '10:30', '10:40', '10:50', '11:00'], axisLabel: { fontSize: 9, color: '#758394' } },
      yAxis: { type: 'value', min: 0, max: 45, axisLabel: { fontSize: 9, color: '#758394' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      series: [{
        type: 'line',
        data: [12, 14, 17, 42, 37, 24, 16],
        smooth: true,
        symbolSize: 5,
        lineStyle: { color: '#2f7bc7', width: 3 },
        itemStyle: { color: '#2f7bc7' },
        areaStyle: { color: 'rgba(47, 123, 199, 0.12)' }
      }]
    };
  }

  getPlatformPerformance(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['platform_performance', 'platformPerformance']))
    );
  }

  convertToPlatformPerformanceOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getPlatformPerformanceOptions(): EChartsOption {
    const data = [
      { name: 'VMware 24', value: 24, itemStyle: { color: '#617887' } },
      { name: 'AWS 22', value: 22, itemStyle: { color: '#ff7f0e' } },
      { name: 'Azure 18', value: 18, itemStyle: { color: '#00a0df' } },
      { name: 'GCP 12', value: 12, itemStyle: { color: '#4285f4' } },
      { name: 'Nutanix 10', value: 10, itemStyle: { color: '#0b56ad' } },
      { name: 'Other 4', value: 4, itemStyle: { color: '#777777' } }
    ];

    return {
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'middle',
        itemWidth: 13,
        itemHeight: 13,
        textStyle: { fontSize: 12, color: '#1f2a34' }
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['34%', '52%'],
        avoidLabelOverlap: true,
        label: { show: false },
        data
      }]
    };
  }

  getPerformanceMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsMetric>(res, ['metrics', 'summary', 'performance_metrics']))
    );
  }
  /*
   * ******End ****** Infrastructure / Platform Performance Widget Related ********************
   */

  /*
   * -----Start----- Analytics & Health Charts Widget Related -------------------
   */
  getDeviceAvailability(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT, criteria).pipe(map(res => this.getDeviceAvailabilityOptions(res)));
  }

  convertToDeviceAvailabilityOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getDeviceAvailabilityOptions(response: any): EChartsOption {
    const payload = this.getMetricPayload(response, ['device_availability', 'deviceAvailability']);
    if (this.isEChartsOption(payload)) {
      return payload;
    }

    const flatPayload = this.flattenPayload(payload || {});
    const up = this.getNumberFromPayload(flatPayload, ['up', 'online', 'healthy']);
    const down = this.getNumberFromPayload(flatPayload, ['down', 'offline', 'unhealthy']);
    const unknown = this.getNumberFromPayload(flatPayload, ['unknown', 'unknowns']);
    const availability = [
      { name: `Up ${this.formatPercentage(up)}`, value: up, color: '#1f7f43' },
      { name: `Down ${this.formatPercentage(down)}`, value: down, color: '#b91515' },
      { name: `Unknown ${this.formatPercentage(unknown)}`, value: unknown, color: '#a96a12' }
    ];

    return {
      color: availability.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => params.name
      },
      legend: {
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        icon: 'rect',
        textStyle: { color: '#20272e', fontSize: 12 },
        data: availability.map(item => item.name)
      },
      series: [{
        name: 'Device Availability',
        type: 'pie',
        radius: '58%',
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: availability.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }]
    };
  }

  getAvailabilityCategory(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT, criteria).pipe(map(res => this.getAvailabilityCategoryOptions(res)));
  }

  convertToAvailabilityCategoryOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAvailabilityCategoryOptions(response: any): EChartsOption {
    const payload = this.getMetricPayload(response, ['availability_by_category', 'availabilityByCategory', 'availability_category']);
    if (this.isEChartsOption(payload)) {
      return payload;
    }

    const categories = Object.keys(payload || {});
    const categoryLabels = categories.map(category => this.getReadableAvailabilityCategoryLabel(category));
    const upData = categories.map(category => this.getNumberFromPayload(this.flattenPayload(payload[category] || {}), ['up', 'online', 'healthy']));
    const downData = categories.map(category => this.getNumberFromPayload(this.flattenPayload(payload[category] || {}), ['down', 'offline', 'unhealthy']));
    const unknownData = categories.map(category => this.getNumberFromPayload(this.flattenPayload(payload[category] || {}), ['unknown', 'unknowns']));

    return {
      color: ['#1f7f43', '#b91515', '#3f4a54'],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 2, left: 'center', itemWidth: 12, itemHeight: 7, textStyle: { fontSize: 11, color: '#20272e' } },
      grid: { left: 38, right: 14, top: 40, bottom: 32 },
      xAxis: { type: 'category', data: categoryLabels, axisLabel: { fontSize: 10, color: '#5f6d7b', interval: 0, rotate: categoryLabels.length > 6 ? 20 : 0 } },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', fontSize: 10, color: '#758394' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      series: [
        { name: 'UP', type: 'bar', stack: 'availability', data: upData, barWidth: 26 },
        { name: 'Down', type: 'bar', stack: 'availability', data: downData, barWidth: 26 },
        { name: 'Unknown', type: 'bar', stack: 'availability', data: unknownData, barWidth: 26 }
      ]
    };
  }

  getAlertTrend(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT, criteria).pipe(map(res => this.getAlertTrendOptions(res)));
  }

  convertToAlertTrendOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAlertTrendOptions(response: any): EChartsOption {
    const payload = this.getMetricPayload(response, ['alerts_trend', 'alert_trend', 'alertTrend']);
    if (this.isEChartsOption(payload)) {
      return payload;
    }

    const dates = Object.keys(payload || {}).sort();
    const criticalData = dates.map(date => this.getNumberFromPayload(this.flattenPayload(payload[date] || {}), ['critical', 'critical_alerts']));
    const highData = dates.map(date => this.getNumberFromPayload(this.flattenPayload(payload[date] || {}), ['warning', 'high', 'warnings', 'high_alerts']));
    const mediumData = dates.map(date => this.getNumberFromPayload(this.flattenPayload(payload[date] || {}), ['information', 'informative', 'medium', 'info']));
    const maxValue = Math.max(...criticalData, ...highData, ...mediumData, 0);

    return {
      color: ['#b91515', '#a9650c', '#265f99'],
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, left: 18, itemWidth: 10, itemHeight: 7, textStyle: { fontSize: 11, color: '#20272e' } },
      grid: { left: 42, right: 14, top: 18, bottom: 34 },
      xAxis: { type: 'category', data: dates.map(date => this.getShortDateLabel(date)), axisLabel: { fontSize: 10, color: '#5f6d7b' } },
      yAxis: { type: 'value', max: Math.max(10, Math.ceil(maxValue * 1.1)), axisLabel: { fontSize: 10, color: '#758394' }, splitLine: { lineStyle: { color: '#e4e9ee' } } },
      series: [
        { name: 'Critical', type: 'line', data: criticalData, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3 } },
        { name: 'High', type: 'line', data: highData, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3 } },
        { name: 'Medium', type: 'line', data: mediumData, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3 } }
      ]
    };
  }
  /*
   * ******End ****** Analytics & Health Charts Widget Related ********************
   */

  /*
   * -----Start----- Alerts Widget Related -------------------
   */
  getAlertReductionMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsMetric>(res, ['reduction_metrics', 'alert_reduction_metrics']))
    );
  }

  getAlertResponseMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsMetric>(res, ['response_metrics', 'alert_response_metrics']))
    );
  }

  getAlertSourceSankey(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['source_sankey', 'alert_source_sankey']))
    );
  }

  convertToAlertSourceSankeyOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAlertSourceSankeyOptions(): EChartsOption {
    return this.getCustomAlertChartOptions((api: any) => {
      const scale = this.getAlertChartScale(api, 720, 320);
      const x = scale.x;
      const y = scale.y;
      const elements = [];
      const sourceY = [44, 96, 148, 200, 252];
      const sourceX = 180;
      const eventsX = 276;
      const branchX = 386;
      const conditionX = 520;
      const ticketX = 632;
      const sourceSliceColors = ['#dcecff', '#fff0cc', '#ffd9de'];
      const eventsInY = [14, 31, 48, 69, 86, 103, 124, 141, 158, 179, 196, 213, 234, 251, 268];
      const logoSizes = {
        UNITYONECLOUD: { width: 20, height: 20, countX: 150 },
        LogicMonitor: { width: 108, height: 21, countX: 150 },
        OpsRamp: { width: 90, height: 20, countX: 150 },
        dynatrace: { width: 108, height: 22, countX: 150 },
        'new relic': { width: 106, height: 23, countX: 150 }
      };

      UNIFIED_AIOPS_ALERT_SOURCES.forEach((source, index) => {
        const centerY = sourceY[index];
        const logoSize = logoSizes[source.name];
        elements.push(this.getAlertImage(
          source.logoPath,
          x(4),
          y(centerY - logoSize.height / 2),
          x(logoSize.width),
          y(logoSize.height)
        ));
        if (source.name === 'UNITYONECLOUD') {
          elements.push(this.getAlertText(`UNITYONECLOUD (${source.count})`, x(36), y(centerY), {
            fontSize: 11,
            vertical: 'middle'
          }));
        } else {
          elements.push(this.getAlertText(`(${source.count})`, x(logoSize.countX), y(centerY), {
            fontSize: 12,
            vertical: 'middle'
          }));
        }
        elements.push(this.getAlertNode(x(sourceX), y(centerY - 21), x(4), y(18), '#2d86dd'));
        elements.push(this.getAlertNode(x(sourceX), y(centerY + 3), x(4), y(18), '#ff7a7a'));

        [0, 1, 2].forEach(sliceIndex => {
          const targetIndex = index * 3 + sliceIndex;
          const thickness = sliceIndex === 1 ? 6 : 5;
          elements.push(this.getAlertFlow(
            x(sourceX + 4),
            y(centerY - 20 + sliceIndex * 12),
            x(eventsX),
            y(eventsInY[targetIndex]),
            y(thickness),
            sourceSliceColors[sliceIndex],
            0.78
          ));
        });
      });

      elements.push(this.getAlertNode(x(eventsX), y(4), x(11), y(292), '#55bfc6'));
      elements.push(this.getAlertText('Events 950', x(eventsX + 22), y(156), { fontSize: 15, vertical: 'middle' }));

      elements.push(this.getAlertFlow(x(eventsX + 11), y(18), x(branchX), y(18), y(62), '#d6d1ee', 0.82));
      elements.push(this.getAlertFlow(x(eventsX + 11), y(76), x(branchX), y(88), y(112), '#ece8f7', 0.9));
      elements.push(this.getAlertFlow(x(eventsX + 11), y(176), x(branchX), y(206), y(90), '#f4dada', 0.9));

      elements.push(this.getAlertNode(x(branchX), y(8), x(11), y(68), '#6648ad'));
      elements.push(this.getAlertText('Alerts 142', x(branchX + 27), y(42), { fontSize: 15, vertical: 'middle' }));
      elements.push(this.getAlertNode(x(branchX), y(88), x(11), y(112), '#b8a9dc'));
      elements.push(this.getAlertText('Dedupe Events', x(branchX + 27), y(119), { fontSize: 15 }));
      elements.push(this.getAlertText('305', x(branchX + 70), y(153), { fontSize: 15, align: 'center' }));
      elements.push(this.getAlertNode(x(branchX), y(210), x(11), y(86), '#e6a0a5'));
      elements.push(this.getAlertText('Suppressed Events', x(branchX + 27), y(246), { fontSize: 15 }));
      elements.push(this.getAlertText('503', x(branchX + 70), y(280), { fontSize: 15, align: 'center' }));

      elements.push(this.getAlertFlow(x(branchX + 11), y(18), x(conditionX), y(30), y(54), '#fff0cc', 0.78));
      elements.push(this.getAlertFlow(x(branchX + 11), y(50), x(conditionX), y(66), y(44), '#f4ccd1', 0.78));
      elements.push(this.getAlertNode(x(conditionX), y(28), x(10), y(90), '#6f7770'));
      elements.push(this.getAlertText('Conditions 21', x(conditionX + 15), y(73), { fontSize: 15, vertical: 'middle' }));

      elements.push(this.getAlertFlow(x(conditionX + 10), y(28), x(ticketX), y(18), y(92), '#cdece1', 0.82));
      elements.push(this.getAlertFlow(x(conditionX + 10), y(84), x(ticketX), y(132), y(86), '#f0cccc', 0.82));
      elements.push(this.getAlertNode(x(ticketX), y(18), x(10), y(92), '#58c39f'));
      elements.push(this.getAlertNode(x(ticketX), y(132), x(10), y(86), '#e6a0a5'));
      elements.push(this.getAlertText('Ticket\nGenerated\n18', x(ticketX + 16), y(60), { fontSize: 14, lineHeight: 17, vertical: 'middle' }));
      elements.push(this.getAlertText('No Ticket\nGenerated\n3', x(ticketX + 16), y(174), { fontSize: 14, lineHeight: 17, vertical: 'middle' }));

      return {
        type: 'group',
        children: elements
      };
    });
  }

  getAlertLifecycleSankey(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['lifecycle_sankey', 'alert_lifecycle_sankey']))
    );
  }

  convertToAlertLifecycleSankeyOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAlertLifecycleSankeyOptions(): EChartsOption {
    return this.getCustomAlertChartOptions((api: any) => {
      const scale = this.getAlertChartScale(api, 610, 320);
      const x = scale.x;
      const y = scale.y;
      const elements = [];
      const sourceX = 18;
      const stateX = 188;
      const actionX = 300;
      const durationX = 452;
      const terminalGroups = [
        { y: 18, label: 'Acknowledged\n143' },
        { y: 126, label: 'Auto Healed\n143' },
        { y: 234, label: 'Auto\nRemediation\n143' }
      ];

      elements.push(this.getAlertFlow(x(sourceX + 12), y(18), x(stateX), y(20), y(76), '#c9eef2', 0.85));
      elements.push(this.getAlertFlow(x(sourceX + 12), y(96), x(stateX), y(86), y(214), '#c7e9ee', 0.85));
      elements.push(this.getAlertNode(x(sourceX), y(18), x(12), y(294), '#58c4cf'));
      elements.push(this.getAlertText('Condition 164', x(44), y(172), { fontSize: 15, vertical: 'middle' }));

      elements.push(this.getAlertNode(x(stateX), y(18), x(12), y(52), '#6648ad'));
      elements.push(this.getAlertText('Open\n21', x(stateX + 22), y(44), { fontSize: 15, lineHeight: 18, vertical: 'middle' }));
      elements.push(this.getAlertNode(x(stateX), y(84), x(12), y(228), '#6648ad'));
      elements.push(this.getAlertText('Resolved\n143', x(stateX + 22), y(198), { fontSize: 15, lineHeight: 18, vertical: 'middle' }));

      elements.push(this.getAlertFlow(x(stateX + 12), y(22), x(actionX), y(18), y(44), '#d9cdf0', 0.82));
      elements.push(this.getAlertFlow(x(stateX + 12), y(72), x(actionX), y(62), y(54), '#d7c9ef', 0.82));
      elements.push(this.getAlertFlow(x(stateX + 12), y(130), x(actionX), y(152), y(64), '#d7c9ef', 0.82));
      elements.push(this.getAlertFlow(x(stateX + 12), y(210), x(actionX), y(246), y(54), '#d7c9ef', 0.82));

      terminalGroups.forEach((group, index) => {
        const actionY = group.y;
        elements.push(this.getAlertNode(x(actionX), y(actionY), x(12), y(84), '#de8fc2'));
        elements.push(this.getAlertText(group.label, x(actionX + 20), y(actionY + 42), {
          fontSize: 15,
          lineHeight: 18,
          vertical: 'middle'
        }));

        elements.push(this.getAlertFlow(x(actionX + 12), y(actionY + 2), x(durationX), y(actionY), y(26), '#dff1e8', 0.78));
        elements.push(this.getAlertFlow(x(actionX + 12), y(actionY + 28), x(durationX), y(actionY + 32), y(27), '#ffe1bc', 0.82));
        elements.push(this.getAlertFlow(x(actionX + 12), y(actionY + 56), x(durationX), y(actionY + 66), y(18), '#f7c5c6', 0.82));
        elements.push(this.getAlertNode(x(durationX), y(actionY), x(12), y(26), '#55c49c'));
        elements.push(this.getAlertNode(x(durationX), y(actionY + 32), x(12), y(27), '#ff9e23'));
        elements.push(this.getAlertNode(x(durationX), y(actionY + 66), x(12), y(18), '#e00000'));
        elements.push(this.getAlertText('5 Min : 56', x(durationX + 24), y(actionY + 13), { fontSize: 15, vertical: 'middle' }));
        elements.push(this.getAlertText('30 Min : 51', x(durationX + 24), y(actionY + 45), { fontSize: 15, vertical: 'middle' }));
        elements.push(this.getAlertText('> 30 Min : 36', x(durationX + 24), y(actionY + 75), { fontSize: 15, vertical: 'middle' }));
      });

      return {
        type: 'group',
        children: elements
      };
    });
  }

  private getCustomAlertChartOptions(renderItem: (api: any) => any): EChartsOption {
    return {
      animation: false,
      tooltip: { show: false },
      series: [{
        type: 'custom',
        coordinateSystem: 'none',
        silent: true,
        renderItem: (_params: any, api: any) => renderItem(api),
        data: [0]
      }] as any
    };
  }

  private getAlertChartScale(api: any, baseWidth: number, baseHeight: number): any {
    const width = api.getWidth();
    const height = api.getHeight();

    return {
      x: (value: number) => (value / baseWidth) * width,
      y: (value: number) => (value / baseHeight) * height
    };
  }

  private getAlertNode(x: number, y: number, width: number, height: number, color: string): any {
    return {
      type: 'rect',
      z2: 20,
      shape: { x, y, width, height },
      style: {
        fill: color
      }
    };
  }

  private getAlertFlow(x0: number, y0: number, x1: number, y1: number, thickness: number, color: string, opacity: number): any {
    return {
      type: 'path',
      z2: 1,
      shape: {
        pathData: this.getAlertFlowPath(x0, y0, x1, y1, thickness)
      },
      style: {
        fill: color,
        opacity
      }
    };
  }

  private getAlertFlowPath(x0: number, y0: number, x1: number, y1: number, thickness: number): string {
    const curve = Math.max(24, (x1 - x0) * 0.52);
    const y0Bottom = y0 + thickness;
    const y1Bottom = y1 + thickness;

    return [
      `M ${x0} ${y0}`,
      `C ${x0 + curve} ${y0}, ${x1 - curve} ${y1}, ${x1} ${y1}`,
      `L ${x1} ${y1Bottom}`,
      `C ${x1 - curve} ${y1Bottom}, ${x0 + curve} ${y0Bottom}, ${x0} ${y0Bottom}`,
      'Z'
    ].join(' ');
  }

  private getAlertText(text: string, x: number, y: number, config: any = {}): any {
    return {
      type: 'text',
      silent: true,
      z2: 30,
      style: {
        text,
        x,
        y,
        fill: config.color || '#101820',
        font: `${config.fontWeight || 400} ${config.fontSize || 14}px Arial`,
        lineHeight: config.lineHeight || 18,
        textAlign: config.align || 'left',
        textVerticalAlign: config.vertical || 'top'
      }
    };
  }

  private getAlertImage(image: string, x: number, y: number, width: number, height: number): any {
    return {
      type: 'image',
      silent: true,
      z2: 30,
      style: {
        image,
        x,
        y,
        width,
        height
      }
    };
  }
  /*
   * ******End ****** Alerts Widget Related ********************
   */

  /*
   * -----Start----- Top 10 Critical Alerts Widget Related -------------------
   */
  getCriticalAlerts(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsAlertRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsAlertRow>(res, ['critical_alerts', 'top_critical_alerts', 'top_alerts']))
    );
  }

  convertToCriticalAlertsViewData(data: UnifiedAiopsAlertRow[]): UnifiedAiopsAlertRow[] {
    return data || [];
  }
  /*
   * ******End ****** Top 10 Critical Alerts Widget Related ********************
   */

  /*
   * -----Start----- ITSM Tickets Widget Related -------------------
   */
  getTicketPriority(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['ticket_priority', 'ticket_priority_chart', 'tickets_by_priority']))
    );
  }

  convertToTicketPriorityOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getTicketPriorityOptions(): EChartsOption {
    return this.getDonutOptions([
      { name: '2 - High', value: 2, color: '#ff5252' },
      { name: '4 - Low', value: 4, color: '#6695ff' },
      { name: '3 - Moderate', value: 170, color: '#aaf25f' },
      { name: '1 - Critical', value: 24, color: '#ff62c7' },
      { name: '5 - Planning', value: 15, color: '#80e5d1' }
    ], ['2 - High', '4 - Low', '3 - Moderate', '1 - Critical', '5 - Planning'], ['#ff5252', '#6695ff', '#aaf25f', '#ff62c7', '#80e5d1']);
  }

  getTicketStatus(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['ticket_status', 'ticket_status_chart', 'tickets_by_status']))
    );
  }

  convertToTicketStatusOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getTicketStatusOptions(): EChartsOption {
    return this.getDonutOptions([
      { name: 'Closed', value: 58, color: '#f85fc0' },
      { name: 'New', value: 20, color: '#d8ed4c' },
      { name: 'Assess', value: 12, color: '#81e2f2' },
      { name: 'Resolved', value: 18, color: '#84d65a' },
      { name: 'In Progress', value: 8, color: '#8678ff' }
    ], ['Closed', 'New', 'Assess', 'Resolved', 'In Progress'], ['#f85fc0', '#d8ed4c', '#81e2f2', '#84d65a', '#8678ff']);
  }

  getTickets(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsTicketRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsTicketRow>(res, ['tickets', 'itsm_tickets', 'ticket_rows']))
    );
  }

  convertToTicketsViewData(data: UnifiedAiopsTicketRow[]): UnifiedAiopsTicketRow[] {
    return data || [];
  }
  /*
   * ******End ****** ITSM Tickets Widget Related ********************
   */

  /*
   * -----Start----- Auto-Remediation Summary Widget Related -------------------
   */
  getRemediationDonut(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['donut', 'remediation_donut', 'summary_donut']))
    );
  }

  convertToRemediationDonutOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getRemediationDonutOptions(): EChartsOption {
    return this.getDonutOptions([
      { name: 'Successful 91%', value: 91, color: '#5b9f1f' },
      { name: 'Failed 9%', value: 9, color: '#e64a4a' }
    ], [], ['#5b9f1f', '#e64a4a'], false);
  }

  getRemediationActions(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getChartPayload(res, ['actions', 'remediation_actions', 'top_actions']))
    );
  }

  convertToRemediationActionsOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getRemediationActionsOptions(): EChartsOption {
    const names = ['Restart service', 'Scale out ASG', 'Revoke SG rule', 'Snapshot cleanup', 'Disk resize'];
    const values = [412, 338, 261, 204, 138];
    return {
      grid: { left: 100, right: 36, top: 8, bottom: 18 },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: names.reverse(), axisLabel: { color: '#1f2a34', fontSize: 11 }, axisTick: { show: false }, axisLine: { show: false } },
      series: [{
        type: 'bar',
        data: values.reverse().map((value, index) => ({
          value,
          label: { show: true, position: 'right', color: '#1f2a34', fontSize: 10 },
          itemStyle: { color: ['#5b9f1f', '#5b9f1f', '#f5a623', '#2f80ed', '#2f80ed'][index] }
        })),
        barWidth: 12
      }]
    };
  }

  getRemediationSummary(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsMetric>(res, ['summary', 'summary_metrics', 'remediation_summary']))
    );
  }

  getRemediationMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsRemediationMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getArrayPayload<UnifiedAiopsRemediationMetric>(res, ['metrics', 'remediation_metrics']))
    );
  }

  convertToRemediationMetricsViewData(data: UnifiedAiopsRemediationMetric[]): UnifiedAiopsRemediationMetric[] {
    return data || [];
  }
  /*
   * ******End ****** Auto-Remediation Summary Widget Related ********************
   */

  private getWidgetFilterParams(criteria?: UnifiedAiopsDashboardFilterCriteria): HttpParams {
    return this.getParams({
      dc_uuids: criteria?.datacenters,
      cloud_uuids: criteria?.clouds
    });
  }

  private getWidgetResponse(endpoint: string, criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<any> {
    const params = this.getWidgetFilterParams(criteria);
    const cacheKey = `${endpoint}?${params.toString()}`;

    if (!this.widgetResponseCache.has(cacheKey)) {
      const request$ = this.http.get<any>(endpoint, { params }).pipe(
        shareReplay(1),
        finalize(() => this.widgetResponseCache.delete(cacheKey))
      );
      this.widgetResponseCache.set(cacheKey, request$);
    }

    return this.widgetResponseCache.get(cacheKey) as Observable<any>;
  }

  private getParams(values: { [key: string]: string[] | undefined }): HttpParams {
    let params = new HttpParams();
    Object.keys(values).forEach(key => {
      params = params.set(key, this.getCsvValue(values[key]));
    });
    return params;
  }

  private getCsvValue(values?: string[]): string {
    return (values || []).filter(value => !!value).join(',');
  }

  private getMetricPayload(response: any, keys: string[]): any {
    const keyedPayload = this.getPayloadByKeys(response, keys);
    return keyedPayload || response;
  }

  private flattenPayload(payload: any, prefix = '', result: { [key: string]: any } = {}): { [key: string]: any } {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return result;
    }

    Object.keys(payload).forEach(key => {
      const value = payload[key];
      const pathKey = prefix ? `${prefix}_${key}` : key;
      result[key] = value;
      result[pathKey] = value;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.flattenPayload(value, pathKey, result);
      }
    });

    return result;
  }

  private getFirstMetricValue(payload: { [key: string]: any }, keys: string[]): any {
    const normalizedPayload = this.getNormalizedPayload(payload);
    for (const key of keys) {
      const normalizedKey = this.normalizeKey(key);
      if (normalizedPayload[normalizedKey] !== undefined && normalizedPayload[normalizedKey] !== null && this.isSimpleMetricValue(normalizedPayload[normalizedKey])) {
        return normalizedPayload[normalizedKey];
      }
    }
    return 0;
  }

  private getNumberFromPayload(payload: { [key: string]: any }, keys: string[], fallback = 0): number {
    const normalizedPayload = this.getNormalizedPayload(payload || {});
    for (const key of keys) {
      const normalizedKey = this.normalizeKey(key);
      if (normalizedPayload[normalizedKey] !== undefined && normalizedPayload[normalizedKey] !== null) {
        return this.getNumberValue(normalizedPayload[normalizedKey], fallback);
      }
    }
    return fallback;
  }

  private getNumberValue(value: any, fallback = 0): number {
    const normalizedValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
    const numericValue = Number(normalizedValue);
    return isNaN(numericValue) ? fallback : numericValue;
  }

  private getNormalizedPayload(payload: { [key: string]: any }): { [key: string]: any } {
    return Object.keys(payload || {}).reduce((result: { [key: string]: any }, key) => {
      result[this.normalizeKey(key)] = payload[key];
      return result;
    }, {});
  }

  private normalizeKey(key: string): string {
    return String(key || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  private formatNumber(value: number | string): string {
    const numericValue = Number(value);
    return isNaN(numericValue) ? String(value || '0') : numericValue.toLocaleString('en-US');
  }

  private getArrayPayload<T>(response: any, keys: string[]): T[] {
    const keyedPayload = this.getPayloadByKeys(response, keys);
    const keyedArray = this.getArrayFromPayload<T>(keyedPayload);
    if (keyedArray.length) {
      return keyedArray;
    }
    return this.getArrayFromPayload<T>(response);
  }

  private getChartPayload(response: any, keys: string[]): EChartsOption {
    const keyedPayload = this.getPayloadByKeys(response, [...keys, 'option', 'options', 'chart_option', 'chartOptions']);
    if (this.isEChartsOption(keyedPayload)) {
      return keyedPayload;
    }
    if (this.isEChartsOption(response?.data)) {
      return response.data;
    }
    if (this.isEChartsOption(response)) {
      return response;
    }
    return {};
  }

  private getPayloadByKeys(response: any, keys: string[]): any {
    const containers = [response, response?.data, response?.result, response?.results]
      .filter(container => container && !Array.isArray(container));

    for (const container of containers) {
      for (const key of keys) {
        if (container[key] !== undefined && container[key] !== null) {
          return container[key];
        }
      }
    }
    return null;
  }

  private getArrayFromPayload<T>(payload: any): T[] {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (!payload || typeof payload !== 'object') {
      return [];
    }
    const arrayKeys = ['results', 'data', 'items', 'rows', 'metrics', 'summary'];
    for (const key of arrayKeys) {
      if (Array.isArray(payload[key])) {
        return payload[key];
      }
    }
    if (this.canConvertObjectToMetrics(payload)) {
      return Object.keys(payload).map(key => ({
        label: this.getReadableLabel(key),
        value: String(payload[key])
      })) as unknown as T[];
    }
    return [];
  }

  private canConvertObjectToMetrics(payload: any): boolean {
    const keys = Object.keys(payload || {});
    return !!keys.length && keys.every(key => this.isSimpleMetricValue(payload[key]));
  }

  private isSimpleMetricValue(value: any): boolean {
    return ['string', 'number', 'boolean'].includes(typeof value);
  }

  private getReadableLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  private getReadableStackLabel(label: string): string {
    const normalizedLabel = String(label || '')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();

    return normalizedLabel.split(' ').map(word => {
      const lowerWord = word.toLowerCase();
      if (['vm', 'vms', 'os', 'url', 'urls', 'pdu', 'k8s', 'db'].includes(lowerWord)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  private getReadableAvailabilityCategoryLabel(label: string): string {
    return this.getReadableStackLabel(label)
      .replace(/\bAws\b/g, 'AWS')
      .replace(/\bGcp\b/g, 'GCP')
      .replace(/\bOci\b/g, 'OCI');
  }

  private formatPercentage(value: number): string {
    return `${Number(value.toFixed(2)).toLocaleString('en-US')}%`;
  }

  private getShortDateLabel(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    if (isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  private isEChartsOption(payload: any): payload is EChartsOption {
    return !!payload && typeof payload === 'object' && (
      payload.series !== undefined ||
      payload.xAxis !== undefined ||
      payload.yAxis !== undefined ||
      payload.graphic !== undefined
    );
  }

  private getDonutOptions(data: { name: string; value: number; color: string }[], legendData: string[], colors: string[], showLegend = true): EChartsOption {
    return {
      color: colors,
      tooltip: { trigger: 'item' },
      legend: showLegend ? {
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 8,
        textStyle: { fontSize: 11, color: '#1f2a34' },
        data: legendData
      } : { show: false },
      series: [{
        type: 'pie',
        radius: ['48%', '75%'],
        center: ['50%', showLegend ? '45%' : '50%'],
        label: { show: false },
        labelLine: { show: false },
        data: data.map(item => ({ name: item.name, value: item.value, itemStyle: { color: item.color } }))
      }]
    };
  }
}
