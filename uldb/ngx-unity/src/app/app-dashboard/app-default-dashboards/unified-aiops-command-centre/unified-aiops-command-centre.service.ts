import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { DataCenterTabs } from 'src/app/united-cloud/datacenter/tabs';
import {
  UNIFIED_AIOPS_ALERTS_ENDPOINT,
  UNIFIED_AIOPS_ALERT_SEVERITY_COLORS,
  UNIFIED_AIOPS_ALERT_SEGREGATION_BY_TYPE_ENDPOINT,
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
  UNIFIED_AIOPS_IDLE_DEVICES_BY_DURATION_ENDPOINT,
  UNIFIED_AIOPS_IDLE_DEVICES_ENDPOINT,
  UNIFIED_AIOPS_IDLE_DURATION_COLORS,
  UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT,
  UNIFIED_AIOPS_KUBERNETES_METRIC_CONFIG,
  UNIFIED_AIOPS_OBSERVABILITY_SUMMARY_ENDPOINT,
  UNIFIED_AIOPS_OS_MONITORING_ENDPOINT,
  UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS,
  UNIFIED_AIOPS_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT,
  UNIFIED_AIOPS_ORPHANED_DEVICES_ENDPOINT,
  UNIFIED_AIOPS_PARENT_APPLICATIONS_ENDPOINT,
  UNIFIED_AIOPS_PERFORMANCE_METRIC_CONFIG,
  UNIFIED_AIOPS_PRIVATE_CLOUD_FAST_ENDPOINT,
  UNIFIED_AIOPS_PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT,
  UNIFIED_AIOPS_PUBLIC_CLOUD_FAST_ENDPOINT,
  UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT,
  UNIFIED_AIOPS_RECENT_ALERTS_ENDPOINT,
  UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT
} from './unified-aiops-command-centre.const';
import {
  UnifiedAiopsAvailabilityCategoryRow,
  UnifiedAiopsAvailabilityCategorySummary,
  UnifiedAiopsAvailabilityCategoryViewData,
  UnifiedAiopsBusinessService,
  UnifiedAiopsCloudFilterOption,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsDashboardFilterCriteria,
  UnifiedAiopsFilterOption,
  UnifiedAiopsHeatmapGroup,
  UnifiedAiopsIdleDeviceRow,
  UnifiedAiopsIdleDevicesResponse,
  UnifiedAiopsIdleDurationApiResponse,
  UnifiedAiopsIdleDurationItem,
  UnifiedAiopsIdleDurationResponse,
  UnifiedAiopsIdleDurationResponseItem,
  UnifiedAiopsIdleMetric,
  UnifiedAiopsIdleMetricResponse,
  UnifiedAiopsLegendMetric,
  UnifiedAiopsMetric,
  UnifiedAiopsOrphanedCategoryItem,
  UnifiedAiopsOrphanedCategoryResponseItem,
  UnifiedAiopsOrphanedDeviceResponseItem,
  UnifiedAiopsOrphanedDeviceRow,
  UnifiedAiopsOrphanedDevicesByCategoryApiResponse,
  UnifiedAiopsOrphanedDevicesByCategoryResponse,
  UnifiedAiopsOrphanedDevicesResponse,
  UnifiedAiopsRecentAlert,
  UnifiedAiopsRecentAlertResponseItem,
  UnifiedAiopsRecentAlertsResponse,
  UnifiedAiopsRecentAlertsSummary,
  UnifiedAiopsRecentAlertSeverity,
  UnifiedAiopsRemediationActionItem,
  UnifiedAiopsRemediationMetric,
  UnifiedAiopsStackItem,
  UnifiedAiopsTableRow,
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
    if (!this.hasUsablePayloadValue(payload)) {
      return [];
    }
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
    return (data || []).length ? this.getDiscoveryOptions(data) : {};
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
    return (data || []).length ? this.getAlertSegregationOptions(data) : {};
  }

  private getAlertSegregationOptions(items: UnifiedAiopsStackItem[]): EChartsOption {
    return this.getVerticalStackedBarOptions(
      items,
      ['Critical', 'Warning', 'Info'],
      [
        UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.critical,
        UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.warning,
        UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.info
      ],
      22
    );
  }

  private getAlertSegregationLegendMetrics(response: any): UnifiedAiopsLegendMetric[] {
    const summary = this.flattenPayload(this.getMetricPayload(response, ['legend', 'summary', 'metrics', 'alert_legend']));
    const items = this.getAlertSegregationStackItems(response);
    if (!items.length && !this.hasUsablePayloadValue(summary)) {
      return [];
    }
    const totals = items.reduce((result, item) => {
      result.critical += item.values[0] || 0;
      result.warning += item.values[1] || 0;
      result.info += item.values[2] || 0;
      return result;
    }, { critical: 0, warning: 0, info: 0 });

    return [
      { icon: 'fa-exclamation-triangle', value: this.formatNumber(this.getNumberFromPayload(summary, ['critical', 'critical_alerts'], totals.critical)), tone: 'danger' },
      { icon: 'fa-exclamation-circle', value: this.formatNumber(this.getNumberFromPayload(summary, ['warning', 'warnings', 'warning_alerts'], totals.warning)), tone: 'warning' },
      { icon: 'fa-info-circle', value: this.formatNumber(this.getNumberFromPayload(summary, ['info', 'informative', 'information', 'info_alerts'], totals.info)), tone: 'info' }
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
        bottom: 4,
        itemGap: 18,
        itemWidth: 10,
        itemHeight: 7,
        textStyle: { color: '#627283', fontSize: 10 }
      },
      grid: { left: 108, right: 22, top: 16, bottom: 56 },
      xAxis: {
        type: 'value',
        max: axisMax,
        axisLabel: { color: '#758394', fontSize: 9, margin: 12 },
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

  private getVerticalStackedBarOptions(items: UnifiedAiopsStackItem[], names: string[], colors: string[], max: number): EChartsOption {
    const viewItems = items || [];
    const categories = viewItems.map(item => item.name);
    const axisMax = this.getStackedBarMax(viewItems, max);

    return {
      color: colors,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 4,
        itemGap: 18,
        itemWidth: 10,
        itemHeight: 7,
        textStyle: { color: '#627283', fontSize: 10 }
      },
      grid: { left: 44, right: 18, top: 18, bottom: 82 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: '#5e6b78',
          fontSize: 9,
          interval: 0,
          rotate: 35
        },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#dfe5eb' } }
      },
      yAxis: {
        type: 'value',
        max: axisMax,
        axisLabel: { color: '#758394', fontSize: 9 },
        splitLine: { lineStyle: { color: '#edf0f2' } }
      },
      series: names.map((name, index) => ({
        name,
        type: 'bar',
        stack: 'total',
        barWidth: 24,
        label: {
          show: true,
          position: 'inside',
          color: '#ffffff',
          fontSize: 8,
          formatter: (params: any) => params.value ? params.value : ''
        },
        emphasis: { focus: 'series' },
        data: viewItems.map(item => item.values[index])
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
    return (data || []).map((service: any) => this.getBusinessServiceViewData(service));
  }

  private getBusinessServiceViewData(service: any): UnifiedAiopsBusinessService {
    const flatService = this.flattenPayload(service || {});
    const availabilityPercent = this.getOptionalNumberValue(
      this.getFirstDefinedValue(service?.availability_pct, service?.availabilityPct, service?.uptime_pct, service?.uptimePct)
    );
    const criticalAlerts = this.getNumberFromPayload(flatService, ['critical_alerts', 'criticalAlerts', 'critical']);
    const warningAlerts = this.getNumberFromPayload(flatService, ['warning_alerts', 'warningAlerts', 'warning']);
    const infoAlerts = this.getNumberFromPayload(flatService, ['info_alerts', 'infoAlerts', 'information', 'info']);
    const totalAlerts = this.getFirstDefinedValue(service?.alerts, service?.total_alerts, service?.totalAlerts);

    return {
      ...service,
      id: this.getIdValue(service?.id, service?.uuid, service?.business_id, service?.businessId, service?.service_id, service?.serviceId),
      serviceName: this.getBusinessServiceName(service),
      status: this.getBusinessServiceStatusTone(service?.status),
      statusLabel: this.getBusinessServiceStatusLabel(this.getFirstDefinedValue(service?.status_label, service?.statusLabel, service?.status)),
      uptime: this.getBusinessServiceAvailability(service, availabilityPercent),
      degraded: this.getBusinessServiceDegraded(service, availabilityPercent),
      alerts: totalAlerts !== undefined ? this.formatNumber(totalAlerts) : this.formatNumber(criticalAlerts + warningAlerts + infoAlerts),
      alertTone: this.getBusinessServiceAlertTone(criticalAlerts, warningAlerts, infoAlerts)
    };
  }

  private getBusinessServiceName(service: any): string {
    return String(this.getFirstDefinedValue(service?.serviceName, service?.service_name, service?.name, service?.label, '-'));
  }

  private getBusinessServiceStatusTone(status: any): UnifiedAiopsTone {
    switch (String(status || '').toLowerCase()) {
      case 'healthy':
      case 'up':
      case 'ok':
      case 'success':
        return 'success';
      case 'warning':
      case 'degraded':
      case 'partial':
      case 'partially up':
      case 'partially_up':
        return 'warning';
      case 'critical':
      case 'down':
      case 'failed':
      case 'error':
        return 'danger';
      default:
        return 'muted';
    }
  }

  private getBusinessServiceStatusLabel(status: any): string {
    const value = this.getFirstDefinedValue(status);
    return value === undefined ? 'Unknown' : this.getReadableStackLabel(String(value));
  }

  private getBusinessServiceAvailability(service: any, availabilityPercent: number | null): string {
    const availability = this.getFirstDefinedValue(service?.availability, service?.uptime);
    if (availability !== undefined) {
      return String(availability);
    }
    return availabilityPercent !== null ? this.formatPercentage(availabilityPercent) : 'NA';
  }

  private getBusinessServiceDegraded(service: any, availabilityPercent: number | null): string {
    const degraded = this.getFirstDefinedValue(service?.degraded);
    if (degraded !== undefined) {
      return String(degraded);
    }
    return this.formatPercentage(Math.max(100 - (availabilityPercent || 0), 0));
  }

  private getBusinessServiceAlertTone(criticalAlerts: number, warningAlerts: number, infoAlerts: number): UnifiedAiopsTone {
    if (criticalAlerts > 0) {
      return 'danger';
    }
    if (warningAlerts > 0) {
      return 'warning';
    }
    if (infoAlerts > 0) {
      return 'info';
    }
    return 'success';
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
    if (!this.hasUsablePayloadValue(payload)) {
      return [];
    }
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
    return (data || []).length ? this.getGeoHeatmapOptions(data) : {};
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
          textColor: this.getGeoDistributionTextColor(group.color),
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
        top: 12,
        right: 14,
        bottom: 12,
        left: 14
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
                    stroke: '#ffffff',
                    lineWidth: 2,
                    shadowBlur: 4,
                    shadowColor: 'rgba(28, 45, 65, 0.16)'
                  }
                },
                {
                  type: 'text',
                  silent: true,
                  style: {
                    text: this.getGeoCellText(item.name, item.total),
                    x: start[0] + width / 2,
                    y: start[1] + height / 2,
                    fill: item.textColor,
                    font: '600 12px Arial',
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    overflow: 'truncate',
                    lineHeight: 17,
                    width: Math.max(width - 14, 32)
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
                fill: '#4b5f73',
                font: '600 10px Arial',
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
                    font: '10px Arial',
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
    const layouts = this.getGeoHeatmapLayouts(items.length);

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
      .filter(item => item.name && item.total > 0)
      .sort((first, second) => second.total - first.total);
  }

  private getGeoHeatmapLayouts(count: number): Array<{ labelX: number; labelY: number; x: number; y: number; width: number; height: number }> {
    if (count <= 1) {
      return [
        { labelX: 0, labelY: 0, x: 0, y: 12, width: 100, height: 82 }
      ];
    }

    if (count === 2) {
      return [
        { labelX: 0, labelY: 0, x: 0, y: 12, width: 100, height: 39 },
        { labelX: 0, labelY: 56, x: 0, y: 64, width: 100, height: 36 }
      ];
    }

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

  private getGeoDistributionTextColor(color: string): string {
    const darkTextColors = ['#90cc74', '#ffca4d', '#ffc64b', '#8ccd72'];
    return darkTextColors.includes(color) ? '#1e2a35' : '#ffffff';
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
    metricConfig: Array<{ label: string; tone?: UnifiedAiopsTone; keys: string[]; aggregateKeys?: string[]; suffix?: string; threshold?: 'utilization' | 'warning' }>,
    payloadKeys: string[]): UnifiedAiopsMetric[] {
    const payload = this.getMetricPayload(response, payloadKeys);
    if (!this.hasUsablePayloadValue(payload)) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload.map(metric => this.getStatusSummaryMetric(metric?.label || metric?.name || '', metric, metric));
    }

    const usedKeys = new Set<string>();
    const configuredMetrics = (metricConfig || []).reduce((metrics: UnifiedAiopsMetric[], config) => {
      const value = this.getConfiguredMetricValue(payload, config, usedKeys);
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

  private getConfiguredMetricValue(payload: any,
    config: { keys: string[]; aggregateKeys?: string[] },
    usedKeys: Set<string>): any {
    const normalizedPayload = this.getNormalizedPayload(payload || {});
    const directKeys = config.keys || [];
    const aggregateKeys = config.aggregateKeys || [];
    for (const key of directKeys) {
      const normalizedKey = this.normalizeKey(key);
      if (normalizedPayload[normalizedKey] !== undefined && normalizedPayload[normalizedKey] !== null) {
        this.markMetricKeysUsed([...directKeys, ...aggregateKeys], usedKeys);
        return normalizedPayload[normalizedKey];
      }
    }

    const aggregatedValue = this.getAggregatedMetricValue(normalizedPayload, aggregateKeys);
    if (aggregatedValue) {
      this.markMetricKeysUsed([...directKeys, ...aggregateKeys], usedKeys);
      return aggregatedValue;
    }

    return undefined;
  }

  private getAggregatedMetricValue(normalizedPayload: { [key: string]: any }, keys: string[]): any {
    const values = (keys || [])
      .map(key => normalizedPayload[this.normalizeKey(key)])
      .filter(value => value !== undefined && value !== null);

    if (!values.length) {
      return undefined;
    }

    return values.reduce((result: { total: number; up: number; down: number; unknown: number }, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const flatPayload = this.flattenPayload(value);
        const up = this.getNumberFromPayload(flatPayload, ['up', 'online', 'healthy', 'active']);
        const down = this.getNumberFromPayload(flatPayload, ['down', 'offline', 'unhealthy', 'critical']);
        const unknown = this.getNumberFromPayload(flatPayload, ['unknown', 'unknowns', 'warning']);
        result.up += up;
        result.down += down;
        result.unknown += unknown;
        result.total += this.getNumberFromPayload(flatPayload, ['total', 'count', 'value'], up + down + unknown);
      } else {
        result.total += this.getNumberValue(value);
      }
      return result;
    }, { total: 0, up: 0, down: 0, unknown: 0 });
  }

  private markMetricKeysUsed(keys: string[], usedKeys: Set<string>) {
    (keys || []).forEach(key => usedKeys.add(this.normalizeKey(key)));
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
      map(res => this.getArrayPayload<any>(res, ['applications', 'rows', 'application_overview']).map(row => this.getApplicationOverviewRow(row)))
    );
  }

  getServiceApplicationOptions(): Observable<UnifiedAiopsFilterOption[]> {
    return this.http.get<any>(UNIFIED_AIOPS_PARENT_APPLICATIONS_ENDPOINT, {
      params: new HttpParams().set('page_size', '0')
    }).pipe(
      map(res => this.getArrayFromPayload<any>(res)
        .filter(app => app && app.id !== undefined && app.id !== null)
        .map(app => ({
          value: String(app.id),
          label: this.getApplicationDisplayName(app.name || app.application_name || app.applicationName)
        })))
    );
  }

  getServiceRows(criteria?: UnifiedAiopsDashboardFilterCriteria, applicationId?: string): Observable<UnifiedAiopsTableRow[]> {
    let params = this.getWidgetFilterParams(criteria);
    if (applicationId) {
      params = params.set('application_id', applicationId);
    }
    const cacheKey = `${UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT}?${params.toString()}`;
    if (!this.widgetResponseCache.has(cacheKey)) {
      const request$ = this.http.get<any>(UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT, { params }).pipe(
        shareReplay(1),
        finalize(() => this.widgetResponseCache.delete(cacheKey))
      );
      this.widgetResponseCache.set(cacheKey, request$);
    }
    return (this.widgetResponseCache.get(cacheKey) as Observable<any>).pipe(
      map(res => this.getArrayPayload<any>(res, ['services', 'rows', 'services_overview']).map(row => this.getServiceOverviewRow(row)))
    );
  }

  convertToTableRowsViewData(data: UnifiedAiopsTableRow[]): UnifiedAiopsTableRow[] {
    return data || [];
  }

  private getApplicationOverviewRow(row: any): UnifiedAiopsTableRow {
    return {
      id: this.getIdValue(row?.id, row?.uuid, row?.application_id, row?.applicationId, row?.app_id, row?.appId),
      uuid: this.getIdValue(row?.uuid, row?.id),
      applicationId: this.getIdValue(row?.application_id, row?.applicationId, row?.app_id, row?.appId, row?.id, row?.uuid),
      name: this.getApplicationDisplayName(this.getFirstDefinedValue(row?.name, row?.application_name, row?.applicationName)),
      throughput: this.getApplicationMetricValue(this.getFirstDefinedValue(row?.avg_throughput_rps, row?.avgThroughputRps, row?.throughput)),
      availability: this.getApplicationMetricValue(this.getFirstDefinedValue(row?.avg_availability_pct, row?.avgAvailabilityPct, row?.availability)),
      responseTime: this.getApplicationMetricValue(this.getFirstDefinedValue(row?.avg_response_time_ms, row?.avgResponseTimeMs, row?.responseTime)),
      status: this.getApplicationStatusTone(row?.status)
    };
  }

  private getApplicationDisplayName(value: any): string {
    const name = String(value || '').trim();
    if (!name) {
      return 'NA';
    }
    return name
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word, index) => {
        const lowerWord = word.toLowerCase();
        return index > 0 && ['a', 'an', 'and', 'of', 'the'].includes(lowerWord)
          ? lowerWord
          : lowerWord.replace(/^\w/, letter => letter.toUpperCase());
      })
      .join(' ');
  }

  private getApplicationMetricValue(value: any): string {
    if (value === undefined || value === null || value === '') {
      return 'NA';
    }
    return this.formatNumber(value);
  }

  private getApplicationStatusTone(status: any): UnifiedAiopsTone {
    switch (String(status || '').toLowerCase()) {
      case 'healthy':
      case 'up':
      case 'ok':
      case 'success':
      case '1':
        return 'success';
      case 'warning':
      case 'degraded':
      case 'unknown':
      case '2':
        return 'warning';
      case 'critical':
      case 'down':
      case 'error':
      case 'danger':
      case '3':
        return 'danger';
      default:
        return 'muted';
    }
  }

  private getFirstDefinedValue(...values: any[]): any {
    return values.find(value => value !== undefined && value !== null && value !== '');
  }

  private getIdValue(...values: any[]): string {
    const value = this.getFirstDefinedValue(...values);
    return value === undefined || value === null ? '' : String(value);
  }

  private getServiceOverviewRow(row: any): UnifiedAiopsTableRow {
    return {
      id: this.getIdValue(row?.id, row?.uuid, row?.service_id, row?.serviceId, row?.service_uuid, row?.serviceUuid),
      uuid: this.getIdValue(row?.uuid, row?.service_uuid, row?.serviceUuid, row?.id),
      applicationId: this.getIdValue(row?.application_id, row?.applicationId, row?.app_id, row?.appId),
      name: this.getServiceDisplayName(this.getFirstDefinedValue(row?.name, row?.service_name, row?.serviceName)),
      throughput: this.getApplicationMetricValue(this.getFirstDefinedValue(row?.throughput_rps, row?.throughputRps, row?.avg_throughput_rps, row?.throughput)),
      availability: this.getApplicationMetricValue(this.getFirstDefinedValue(row?.availability_pct, row?.availabilityPct, row?.avg_availability_pct, row?.availability)),
      responseTime: this.getApplicationMetricValue(this.getFirstDefinedValue(row?.response_time_ms, row?.responseTimeMs, row?.avg_response_time_ms, row?.responseTime)),
      status: this.getApplicationStatusTone(this.getFirstDefinedValue(row?.status, row?.status_code, row?.statusCode))
    };
  }

  private getServiceDisplayName(value: any): string {
    const name = String(value || '').trim();
    if (!name) {
      return 'NA';
    }
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(word => word.split('-')
        .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
        .join('-'))
      .join(' ');
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
      map(res => {
        const payloadKeys = [
          'top_network_bandwidth_usage',
          'topNetworkBandwidthUsage',
          'bandwidth_bar',
          'bandwidthBar',
          'avg_network_bandwidth_bar'
        ];
        const chartPayload = this.getChartPayload(res, payloadKeys);
        const payload = this.getPayloadByKeys(res, payloadKeys);
        return this.isEChartsOption(chartPayload) ? chartPayload : this.getBandwidthBarOptions(payload);
      })
    );
  }

  convertToBandwidthBarOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getBandwidthBarOptions(payload: any): EChartsOption {
    const items = this.getPerformanceChartItems(payload, true);
    if (!items.length) {
      return {};
    }

    const viewItems = items.slice(0, 8).reverse();
    const maxValue = Math.max(...viewItems.map(item => item.value), 0);
    return {
      grid: { left: 72, right: 18, top: 12, bottom: 24 },
      xAxis: { type: 'value', max: maxValue <= 100 ? 100 : Math.ceil(maxValue * 1.1), axisLabel: { fontSize: 9, color: '#7b8794' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      yAxis: { type: 'category', data: viewItems.map(item => item.name), axisLabel: { fontSize: 9, color: '#5f6d7b' }, axisTick: { show: false }, axisLine: { show: false } },
      series: [{
        type: 'bar',
        data: viewItems.map((item, index) => ({
          value: item.value,
          itemStyle: { color: ['#2f80ed', '#2f80ed', '#2f80ed', '#e68612', '#e5232b', '#617887', '#00a0df', '#4285f4'][index] }
        })),
        barWidth: 13
      }]
    };
  }

  getBandwidthLine(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT, criteria).pipe(
      map(res => {
        const payloadKeys = [
          'average_network_bandwidth_usage',
          'averageNetworkBandwidthUsage',
          'bandwidth_line',
          'bandwidthLine',
          'avg_network_bandwidth_line'
        ];
        const chartPayload = this.getChartPayload(res, payloadKeys);
        const payload = this.getPayloadByKeys(res, payloadKeys);
        return this.isEChartsOption(chartPayload) ? chartPayload : this.getBandwidthLineOptions(payload);
      })
    );
  }

  convertToBandwidthLineOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getBandwidthLineOptions(payload: any): EChartsOption {
    const points = this.getPerformanceLinePoints(payload);
    if (!points.length) {
      return {};
    }
    const maxValue = Math.max(...points.map(point => point.value), 0);
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 12, top: 14, bottom: 25 },
      xAxis: { type: 'category', data: points.map(point => point.name), axisLabel: { fontSize: 9, color: '#758394' } },
      yAxis: { type: 'value', min: 0, max: maxValue <= 100 ? 100 : Math.ceil(maxValue * 1.1), axisLabel: { fontSize: 9, color: '#758394' }, splitLine: { lineStyle: { color: '#edf0f2' } } },
      series: [{
        type: 'line',
        data: points.map(point => point.value),
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
      map(res => {
        const payloadKeys = ['platform_performance', 'platformPerformance'];
        const chartPayload = this.getChartPayload(res, payloadKeys);
        const payload = this.getPayloadByKeys(res, payloadKeys);
        return this.isEChartsOption(chartPayload) ? chartPayload : this.getPlatformPerformanceOptions(payload);
      })
    );
  }

  convertToPlatformPerformanceOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getPlatformPerformanceOptions(payload: any): EChartsOption {
    const colors = ['#617887', '#ff7f0e', '#00a0df', '#4285f4', '#0b56ad', '#8a8a85', '#6b7ff5', '#16c7d9'];
    const data = this.getPerformanceChartItems(payload).map((item, index) => ({
      name: `${item.name} ${this.formatNumber(item.value)}`,
      value: item.value,
      itemStyle: { color: colors[index % colors.length] }
    }));
    if (!data.length) {
      return {};
    }

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
      map(res => this.getPerformanceMetricStrip(res))
    );
  }

  getEmptyPerformanceMetrics(): UnifiedAiopsMetric[] {
    return this.getPerformanceMetricStrip(null);
  }

  private getPerformanceMetricStrip(response: any): UnifiedAiopsMetric[] {
    const payload = this.getPayloadByKeys(response, ['metrics', 'summary', 'performance_metrics']);
    const flatPayload = this.flattenPayload(payload || {});
    const arrayMetrics = this.getArrayFromPayload<any>(payload);

    return UNIFIED_AIOPS_PERFORMANCE_METRIC_CONFIG.map(metric => {
      const arrayMetric = this.getPerformanceArrayMetric(arrayMetrics, metric);
      const value = arrayMetric
        ? this.getPerformanceMetricValue(arrayMetric)
        : this.getFirstDefinedPayloadValue(flatPayload, metric.keys);
      const hasData = value !== undefined && value !== null && value !== '';

      return {
        label: metric.label,
        value: hasData ? this.formatSummaryValue(value, metric.suffix) : 'NA',
        tone: hasData ? (arrayMetric?.tone || metric.tone || 'primary') : 'muted',
        hasData
      };
    });
  }

  private getPerformanceArrayMetric(metrics: any[], config: { label: string; keys: string[] }): any {
    const matchingKeys = [config.label, ...(config.keys || [])].map(key => this.normalizeKey(key));
    return (metrics || []).find(metric => {
      const label = metric?.label || metric?.name || metric?.key || metric?.title;
      return label && matchingKeys.includes(this.normalizeKey(label));
    });
  }

  private getPerformanceMetricValue(metric: any): any {
    const flatPayload = this.flattenPayload(metric || {});
    return this.getFirstDefinedPayloadValue(flatPayload, ['value', 'count', 'total', 'usage', 'usage_percent', 'usagePercent', 'percentage', 'percent', 'avg', 'average']);
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
    if (!this.hasUsablePayloadValue(payload)) {
      return {};
    }

    const flatPayload = this.flattenPayload(payload || {});
    const up = this.getNumberFromPayload(flatPayload, ['up', 'online', 'healthy']);
    const down = this.getNumberFromPayload(flatPayload, ['down', 'offline', 'unhealthy']);
    const unknown = this.getNumberFromPayload(flatPayload, ['unknown', 'unknowns']);
    const availability = [
      { name: `Up ${this.formatPercentage(up)}`, value: up, color: '#1f7f43' },
      { name: `Down ${this.formatPercentage(down)}`, value: down, color: UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.critical },
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
        itemGap: 8,
        itemWidth: 10,
        itemHeight: 10,
        icon: 'rect',
        textStyle: { color: '#20272e', fontSize: 11 },
        data: availability.map(item => item.name)
      },
      series: [{
        name: 'Device Availability',
        type: 'pie',
        radius: '54%',
        center: ['50%', '44%'],
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

  getAvailabilityCategory(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsAvailabilityCategoryViewData> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT, criteria).pipe(map(res => this.getAvailabilityCategoryViewData(res)));
  }

  convertToAvailabilityCategoryOptions(data: UnifiedAiopsAvailabilityCategoryViewData | EChartsOption): EChartsOption {
    return (data as UnifiedAiopsAvailabilityCategoryViewData)?.options || (data as EChartsOption) || {};
  }

  convertToAvailabilityCategorySummary(data: UnifiedAiopsAvailabilityCategoryViewData): UnifiedAiopsAvailabilityCategorySummary {
    return data?.summary || this.getEmptyAvailabilityCategorySummary();
  }

  convertToAvailabilityCategoryRows(data: UnifiedAiopsAvailabilityCategoryViewData): UnifiedAiopsAvailabilityCategoryRow[] {
    return data?.rows || [];
  }

  private getAvailabilityCategoryViewData(response: any): UnifiedAiopsAvailabilityCategoryViewData {
    const payload = this.getMetricPayload(response, ['availability_by_category', 'availabilityByCategory', 'availability_category']);
    if (this.isEChartsOption(payload)) {
      return {
        options: payload,
        summary: this.getEmptyAvailabilityCategorySummary(),
        rows: []
      };
    }
    if (!this.hasUsablePayloadValue(payload)) {
      return this.getEmptyAvailabilityCategoryViewData();
    }

    const items = this.getAvailabilityCategoryItems(payload);
    if (!items.length) {
      return this.getEmptyAvailabilityCategoryViewData();
    }

    return {
      options: this.getAvailabilityCategoryOptions(items),
      summary: this.getAvailabilityCategorySummary(items),
      rows: this.getAvailabilityCategoryRows(items)
    };
  }

  private getAvailabilityCategoryOptions(items: Array<{ label: string; up: number; down: number; unknown: number }>): EChartsOption {
    const categoryLabels = items.map(item => item.label);

    return {
      color: ['#13bd77', UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.critical, '#5f6d7b'],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, left: 'center', itemWidth: 14, itemHeight: 7, textStyle: { fontSize: 11, color: '#20272e' } },
      grid: { left: 38, right: 12, top: 18, bottom: 44 },
      xAxis: { type: 'category', data: categoryLabels, axisLabel: { fontSize: 11, color: '#5b6570', interval: 0, rotate: categoryLabels.length > 7 ? 20 : 0 } },
      yAxis: { type: 'value', max: 100, axisLabel: { fontSize: 11, color: '#5b6570' }, splitLine: { lineStyle: { color: '#d6dce2', type: 'dashed' } } },
      series: [
        { name: 'UP', type: 'bar', stack: 'availability', data: items.map(item => item.up), barWidth: 34 },
        { name: 'Down', type: 'bar', stack: 'availability', data: items.map(item => item.down), barWidth: 34 },
        { name: 'Unknown', type: 'bar', stack: 'availability', data: items.map(item => item.unknown), barWidth: 34 }
      ]
    };
  }

  private getAvailabilityCategoryItems(payload: any): Array<{ label: string; up: number; down: number; unknown: number }> {
    const entries = Array.isArray(payload)
      ? payload.map(item => ({
        key: this.getFirstDefinedValue(item?.category, item?.name, item?.label, item?.type),
        value: item
      }))
      : Object.keys(payload || {}).map(key => ({ key, value: payload[key] }));

    return entries
      .map(entry => {
        const flatPayload = this.flattenPayload(entry.value || {});
        const label = this.getReadableAvailabilityCategoryLabel(String(entry.key || ''));
        return {
          label,
          up: this.getNumberFromPayload(flatPayload, ['up', 'online', 'healthy', 'up_percent', 'upPercent']),
          down: this.getNumberFromPayload(flatPayload, ['down', 'offline', 'unhealthy', 'down_percent', 'downPercent']),
          unknown: this.getNumberFromPayload(flatPayload, ['unknown', 'unknowns', 'unknown_percent', 'unknownPercent'])
        };
      })
      .filter(item => !!item.label && (item.up > 0 || item.down > 0 || item.unknown > 0));
  }

  private getAvailabilityCategorySummary(items: Array<{ up: number; down: number; unknown: number }>): UnifiedAiopsAvailabilityCategorySummary {
    return {
      up: this.formatPercentage(this.getAverageValue(items.map(item => item.up))),
      down: this.formatPercentage(this.getAverageValue(items.map(item => item.down))),
      unknown: this.formatPercentage(this.getAverageValue(items.map(item => item.unknown)))
    };
  }

  private getAvailabilityCategoryRows(items: Array<{ label: string; up: number }>): UnifiedAiopsAvailabilityCategoryRow[] {
    return items.map(item => ({
      label: item.label,
      upValue: item.up,
      upLabel: `${this.formatPercentage(item.up)} Up`,
      tone: this.getAvailabilityCategoryTone(item.up)
    }));
  }

  private getAvailabilityCategoryTone(upValue: number): UnifiedAiopsTone {
    if (upValue >= 95) {
      return 'success';
    }
    if (upValue >= 90) {
      return 'warning';
    }
    return 'danger';
  }

  private getAverageValue(values: number[]): number {
    const numericValues = (values || []).filter(value => value > 0 || value === 0);
    if (!numericValues.length) {
      return 0;
    }
    return numericValues.reduce((total, value) => total + value, 0) / numericValues.length;
  }

  private getEmptyAvailabilityCategorySummary(): UnifiedAiopsAvailabilityCategorySummary {
    return {
      up: 'NA',
      down: 'NA',
      unknown: 'NA'
    };
  }

  private getEmptyAvailabilityCategoryViewData(): UnifiedAiopsAvailabilityCategoryViewData {
    return {
      options: {},
      summary: this.getEmptyAvailabilityCategorySummary(),
      rows: []
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
    if (!this.hasUsablePayloadValue(payload)) {
      return {};
    }

    const dates = Object.keys(payload || {}).sort();
    const criticalData = dates.map(date => this.getNumberFromPayload(this.flattenPayload(payload[date] || {}), ['critical', 'critical_alerts']));
    const highData = dates.map(date => this.getNumberFromPayload(this.flattenPayload(payload[date] || {}), ['warning', 'high', 'warnings', 'high_alerts']));
    const mediumData = dates.map(date => this.getNumberFromPayload(this.flattenPayload(payload[date] || {}), ['information', 'informative', 'medium', 'info']));
    const maxValue = Math.max(...criticalData, ...highData, ...mediumData, 0);

    return {
      color: [
        UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.critical,
        UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.warning,
        UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.info
      ],
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, left: 18, itemWidth: 10, itemHeight: 7, textStyle: { fontSize: 11, color: '#20272e' } },
      grid: { left: 42, right: 14, top: 18, bottom: 34 },
      xAxis: { type: 'category', data: dates.map(date => this.getShortDateLabel(date)), axisLabel: { fontSize: 10, color: '#5f6d7b' } },
      yAxis: { type: 'value', max: Math.max(10, Math.ceil(maxValue * 1.1)), axisLabel: { fontSize: 10, color: '#758394' }, splitLine: { lineStyle: { color: '#e4e9ee' } } },
      series: [
        { name: 'Critical', type: 'line', data: criticalData, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3 } },
        { name: 'Warning', type: 'line', data: highData, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3 } },
        { name: 'Info', type: 'line', data: mediumData, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3 } }
      ]
    };
  }
  /*
   * ******End ****** Analytics & Health Charts Widget Related ********************
   */

  /*
   * -----Start----- Orphaned Devices Widgets Related -------------------
   */
  getOrphanedDevices(criteria?: UnifiedAiopsDashboardFilterCriteria, page = 1, pageSize = 10): Observable<UnifiedAiopsOrphanedDevicesResponse> {
    let params = this.getWidgetFilterParams(criteria);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));
    return this.http.get<UnifiedAiopsOrphanedDevicesResponse>(UNIFIED_AIOPS_ORPHANED_DEVICES_ENDPOINT, { params });
  }

  getOrphanedDevicesByCategory(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsOrphanedDevicesByCategoryApiResponse> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT, criteria);
  }

  convertToOrphanedDevicesViewData(data: UnifiedAiopsOrphanedDevicesResponse): UnifiedAiopsOrphanedDeviceRow[] {
    return this.getOrphanedDeviceResults(data).map(item => ({
      id: this.getFirstOrphanedValue(item.id, item.uuid, item.device_id, item.deviceId, item.device_uuid, item.deviceUuid),
      uuid: this.getFirstOrphanedValue(item.uuid, item.id, item.device_uuid, item.deviceUuid),
      deviceId: this.getFirstOrphanedValue(item.device_id, item.deviceId, item.device_uuid, item.deviceUuid, item.id, item.uuid),
      resourceId: this.getFirstOrphanedValue(item.resource_id, item.resourceId, item.device_id, item.deviceId, item.id, item.uuid),
      resourceType: this.getFirstOrphanedValue(item.resource_type, item.resourceType, item.type),
      provider: this.getFirstOrphanedValue(item.provider, item.platform, item.cloud_provider, item.cloudProvider, item.cloud),
      cloudType: this.getFirstOrphanedValue(item.cloud_type, item.cloudType, item.platform, item.provider, item.cloud_provider, item.cloudProvider),
      monitoringType: this.getFirstOrphanedValue(item.monitoring_type, item.monitoringType),
      monitoring: item.monitoring,
      name: this.getFirstOrphanedValue(item.name, item.device_name, item.deviceName, item.instance_name, item.instanceName),
      status: this.getFirstOrphanedValue(item.status),
      lastSeen: this.formatOrphanedDate(this.getFirstOrphanedValue(item.lastSeen, item.last_seen)),
      datacenter: this.getFirstOrphanedValue(item.datacenter, item.datacenter_name, item.cloud, item.provider, item.platform, item.account)
    }));
  }

  convertToOrphanedDevicesTotal(data: UnifiedAiopsOrphanedDevicesResponse): number {
    return Number(data?.count || data?.totalOrphaned || this.getOrphanedDeviceResults(data).length || 0);
  }

  convertToOrphanedByCategoryViewData(data: UnifiedAiopsOrphanedDevicesByCategoryApiResponse): UnifiedAiopsOrphanedCategoryItem[] {
    const categoryData = this.getOrphanedCategoryResults(data);
    const total = this.getOrphanedByCategoryTotal(data, categoryData);
    const categoryTotal = (categoryData || []).reduce((sum, item) => sum + this.getOrphanedCategoryCount(item), 0);
    return categoryData.filter(item => this.getOrphanedCategoryCount(item) > 0).map((item, index) => {
      const count = this.getOrphanedCategoryCount(item);
      return {
        category: this.formatOrphanedCategoryLabel(this.getFirstOrphanedValue(item.group, item.category, item.name, item.label, item.display_name, item.type, item.resource_type)),
        count,
        percentage: this.getOrphanedCategoryPercentage(item, count, categoryTotal),
        color: UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS[index % UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS.length],
        totalCount: total
      };
    });
  }

  convertToOrphanedByCategoryOptions(data: UnifiedAiopsOrphanedCategoryItem[]): EChartsOption {
    return {
      color: (data || []).map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}<br/>Count: ${params.data.count}<br/>${params.data.percentage}%`
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'Orphaned by Category',
          type: 'pie',
          radius: ['42%', '72%'],
          center: ['50%', '48%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: (params: any) => `${params.data.count}`,
            color: '#20272e',
            fontSize: 13
          },
          labelLine: {
            show: true,
            length: 18,
            length2: 14
          },
          data: (data || []).map(item => ({
            value: item.count,
            name: item.category,
            category: item.category,
            count: item.count,
            percentage: item.percentage,
            itemStyle: { color: item.color }
          })),
          itemStyle: {
            borderWidth: 0
          }
        }
      ]
    };
  }

  hasOrphanedByCategoryData(data: UnifiedAiopsOrphanedCategoryItem[]): boolean {
    return (data || []).some(item => Number(item.count || 0) > 0);
  }

  private getOrphanedDeviceResults(data: UnifiedAiopsOrphanedDevicesResponse): UnifiedAiopsOrphanedDeviceResponseItem[] {
    return data?.results || data?.orphanedDeviceList || data?.data || data?.items || [];
  }

  private getOrphanedCategoryResults(data: UnifiedAiopsOrphanedDevicesByCategoryApiResponse): UnifiedAiopsOrphanedCategoryResponseItem[] {
    if (Array.isArray(data)) {
      return data;
    }
    const categoryData = data?.groups || data?.breakdown || data?.results || data?.orphanedByCategory || data?.categories || data?.by_category || data?.data;
    if (Array.isArray(categoryData)) {
      return categoryData;
    }
    if (categoryData) {
      return this.convertOrphanedCategoryRecordToItems(categoryData as unknown as UnifiedAiopsOrphanedDevicesByCategoryResponse);
    }
    return this.convertOrphanedCategoryRecordToItems(data);
  }

  private convertOrphanedCategoryRecordToItems(data: UnifiedAiopsOrphanedDevicesByCategoryResponse): UnifiedAiopsOrphanedCategoryResponseItem[] {
    const record = data as unknown as Record<string, string | number | UnifiedAiopsOrphanedCategoryResponseItem>;
    return Object.keys(data || {}).filter(key => !['total', 'totalOrphaned', 'total_orphaned', 'total_count', 'totalCount', 'count', 'groups', 'breakdown'].includes(key)).map(key => {
      const value = record[key];
      if (value && typeof value === 'object') {
        return {
          ...value,
          category: value.category || key
        };
      }
      return {
        category: key,
        count: Number(value || 0)
      };
    });
  }

  private getOrphanedByCategoryTotal(data: UnifiedAiopsOrphanedDevicesByCategoryApiResponse, categoryData: UnifiedAiopsOrphanedCategoryResponseItem[]): number {
    if (!Array.isArray(data)) {
      const total = Number(data?.total || data?.totalOrphaned || data?.total_orphaned || data?.total_count || data?.totalCount || 0);
      if (total) {
        return total;
      }
    }
    return (categoryData || []).reduce((sum, item) => sum + this.getOrphanedCategoryCount(item), 0);
  }

  private getOrphanedCategoryCount(item: UnifiedAiopsOrphanedCategoryResponseItem): number {
    return Number(item?.count || item?.value || 0);
  }

  private getOrphanedCategoryPercentage(item: UnifiedAiopsOrphanedCategoryResponseItem, count: number, total: number): number {
    const apiPercentage = Number(String(item.percentage || item.percent || 0).replace('%', ''));
    if (apiPercentage) {
      return Math.round(apiPercentage);
    }
    return total ? Math.round((count / total) * 100) : 0;
  }

  private getFirstOrphanedValue(...values: Array<string | number | undefined | null>): string {
    const value = values.find(item => item !== undefined && item !== null && item !== '');
    return value === undefined || value === null ? '' : String(value);
  }

  private formatOrphanedCategoryLabel(value: string): string {
    if (!value) {
      return '';
    }
    const labels: Record<string, string> = {
      vm: 'VM Instances',
      vms: 'VM Instances',
      vm_instances: 'VM Instances',
      virtual_machine: 'VM Instances',
      virtual_machines: 'VM Instances',
      bare_metal: 'Bare Metal',
      baremetal: 'Bare Metal',
      gpu: 'GPUs',
      gpus: 'GPUs',
      storage: 'Storage Volumes',
      storage_volume: 'Storage Volumes',
      storage_volumes: 'Storage Volumes',
      network: 'Network Devices',
      network_device: 'Network Devices',
      network_devices: 'Network Devices'
    };
    const normalizedValue = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
    return labels[normalizedValue] || value.replace(/_/g, ' ').replace(/\b\w/g, match => match.toUpperCase());
  }

  private formatOrphanedDate(value: string): string {
    if (!value) {
      return '';
    }
    const date = moment(value, [
      moment.ISO_8601,
      'DD MMM YYYY HH:mm',
      'D MMM YYYY HH:mm',
      'DD MMMM YYYY HH:mm',
      'D MMMM YYYY HH:mm',
      'DD MMM YYYY hh:mm A',
      'D MMM YYYY hh:mm A',
      'DD MMMM YYYY hh:mm A',
      'D MMMM YYYY hh:mm A',
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DD HH:mm',
      'DD/MM/YYYY HH:mm',
      'MM/DD/YYYY HH:mm'
    ], true);
    return date.isValid() ? date.format('DD MMM YYYY HH:mm') : value;
  }
  /*
   * ******End ****** Orphaned Devices Widgets Related ********************
   */

  /*
   * -----Start----- Idle Devices Widgets Related -------------------
   */
  getIdleDevices(criteria?: UnifiedAiopsDashboardFilterCriteria, page = 1, pageSize = 10): Observable<UnifiedAiopsIdleDevicesResponse> {
    let params = this.getWidgetFilterParams(criteria);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));
    return this.http.get<UnifiedAiopsIdleDevicesResponse>(UNIFIED_AIOPS_IDLE_DEVICES_ENDPOINT, { params });
  }

  getIdleDevicesByDuration(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsIdleDurationApiResponse> {
    return this.getWidgetResponse(UNIFIED_AIOPS_IDLE_DEVICES_BY_DURATION_ENDPOINT, criteria);
  }

  convertToIdleDevicesViewData(data: UnifiedAiopsIdleDevicesResponse): UnifiedAiopsIdleDeviceRow[] {
    return (data?.results || []).map(item => {
      const row = item as Record<string, any>;
      return {
        id: this.getFirstIdleValue(row.id),
        uuid: this.getFirstIdleValue(row.uuid, row.id),
        deviceId: this.getFirstIdleValue(row.device_id, row.deviceId, row.device_uuid, row.deviceUuid, row.uuid, row.id),
        resourceId: this.getFirstIdleValue(row.resource_id, row.resourceId, row.uuid, row.id),
        deviceName: this.getFirstIdleValue(row.device_name, row.deviceName, row.name, row.instance_name),
        resourceType: this.getFirstIdleValue(row.resource_type, row.resourceType, row.type),
        provider: this.getFirstIdleValue(row.provider, row.platform, row.cloud_provider, row.cloudProvider, row.cloud, row.cloud_type, row.cloudType),
        cloudType: this.getFirstIdleValue(row.cloud_type, row.cloudType, row.cloud, row.provider, row.platform),
        monitoringType: this.getFirstIdleValue(row.monitoring_type, row.monitoringType),
        monitoring: row.monitoring,
        avgCpu: this.convertToIdleMetric(
          this.getFirstIdleObject(row.avg_cpu, row.avgCpu, row.avgCPU, row.cpu, row.cpu_usage, row.average_cpu),
          this.getFirstIdleScalar(row.avg_cpu_percent, row.avgCpuPercent, row.avg_cpu_percentage, row.cpu_percent, row.cpuPercentage, row.avg_cpu, row.avgCpu, row.avgCPU, row.cpu, row.cpu_usage, row.average_cpu)
        ),
        avgMem: this.convertToIdleMetric(
          this.getFirstIdleObject(row.avg_mem, row.avgMem, row.avg_memory, row.memory, row.memory_usage, row.average_memory),
          this.getFirstIdleScalar(row.avg_mem_percent, row.avgMemPercent, row.avg_mem_percentage, row.memory_percent, row.memoryPercentage, row.avg_mem, row.avgMem, row.avg_memory, row.memory, row.memory_usage, row.average_memory)
        ),
        networkIO: this.getFirstIdleValue(row.network_io, row.networkIO, row.network, row.network_in_out),
        idleDuration: this.getFirstIdleValue(row.idle_duration, row.idleDuration, row.duration),
        status: this.getFirstIdleValue(row.status)
      };
    });
  }

  convertToIdleDevicesTotal(data: UnifiedAiopsIdleDevicesResponse): number {
    return Number(data?.count || 0);
  }

  convertToIdleDurationViewData(data: UnifiedAiopsIdleDurationApiResponse): UnifiedAiopsIdleDurationItem[] {
    const durationData = this.sortIdleDurationBuckets(this.getIdleDurationResults(data));
    const maxCount = Math.max(...durationData.map(item => this.getIdleDurationCount(item)), 0);
    return durationData.filter(item => this.getIdleDurationCount(item) > 0).map((item, index) => {
      const count = this.getIdleDurationCount(item);
      const duration = this.getIdleDurationLabel(item);
      return {
        duration,
        count,
        percent: maxCount ? Math.round((count / maxCount) * 100) : 0,
        color: UNIFIED_AIOPS_IDLE_DURATION_COLORS[index % UNIFIED_AIOPS_IDLE_DURATION_COLORS.length]
      };
    });
  }

  convertToIdleDurationOptions(data: UnifiedAiopsIdleDurationItem[]): EChartsOption {
    return {
      color: (data || []).map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'Idle Duration Distribution',
          type: 'pie',
          roseType: 'radius',
          radius: ['34%', '82%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          data: (data || []).map(item => ({
            value: item.count,
            name: item.duration,
            itemStyle: { color: item.color }
          })),
          itemStyle: {
            borderWidth: 0
          }
        }
      ]
    };
  }

  hasIdleDurationData(data: UnifiedAiopsIdleDurationItem[]): boolean {
    return (data || []).some(item => Number(item.count || 0) > 0);
  }

  private convertToIdleMetric(metric?: UnifiedAiopsIdleMetricResponse, percentValue?: string | number): UnifiedAiopsIdleMetric {
    const usedValue = metric?.used ?? metric?.value;
    const freeValue = metric?.free;
    const explicitPercent = this.getNumericIdleValue(metric?.percent || metric?.percentage || percentValue);
    const freePercent = this.getNumericIdleValue(freeValue);
    const usedPercent = explicitPercent || (freePercent ? 100 - freePercent : this.getNumericIdleValue(usedValue));
    const percent = Math.max(Math.min(Number(usedPercent || 0), 100), 0);
    return {
      used: this.getFirstIdleValue(usedValue, percent),
      free: this.getFirstIdleValue(freeValue, `${Math.max(100 - percent, 0)}%`),
      percent,
      tone: this.getProgressTone(percent)
    };
  }

  private getIdleDurationResults(data: UnifiedAiopsIdleDurationApiResponse): UnifiedAiopsIdleDurationResponseItem[] {
    return this.getIdleDurationResultsFromValue(data);
  }

  private getIdleDurationResultsFromValue(value: any): UnifiedAiopsIdleDurationResponseItem[] {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.filter(item => this.isIdleDurationBucketItem(item));
    }

    const record = value as Record<string, any>;
    const containerKeys = [
      'idleDurationDistribution',
      'idle_duration_distribution',
      'durationDistribution',
      'duration_distribution',
      'idle_devices_by_duration',
      'summary',
      'distribution',
      'breakdown',
      'results'
    ];

    for (const key of containerKeys) {
      const rows = this.getIdleDurationResultsFromValue(record[key]);
      if (rows.length) {
        return rows;
      }
    }

    const nestedRows = this.getIdleDurationResultsFromValue(record.data);
    if (nestedRows.length) {
      return nestedRows;
    }

    return this.convertIdleDurationRecordToItems(value as UnifiedAiopsIdleDurationResponse);
  }

  private convertIdleDurationRecordToItems(data: UnifiedAiopsIdleDurationResponse): UnifiedAiopsIdleDurationResponseItem[] {
    const record = data as unknown as Record<string, string | number | UnifiedAiopsIdleDurationResponseItem>;
    return Object.keys(data || {}).reduce((items: UnifiedAiopsIdleDurationResponseItem[], key) => {
      if (this.isIdleDurationMetadataKey(key)) {
        return items;
      }
      const value = record[key];
      if (value && typeof value === 'object') {
        const item = {
          ...value,
          duration: value.duration || value.idle_duration || value.idleDuration || value.range || value.name || value.label || key
        };
        if (this.isIdleDurationBucketItem(item)) {
          items.push(item);
        }
        return items;
      }
      if (this.isIdleDurationBucketKey(key)) {
        items.push({
          duration: key,
          count: Number(value || 0)
        });
      }
      return items;
    }, []);
  }

  private getIdleDurationCount(item: UnifiedAiopsIdleDurationResponseItem): number {
    return Number(item?.count || item?.value || item?.total || item?.total_count || item?.totalCount || item?.devices || item?.percent || item?.percentage || 0);
  }

  private getIdleDurationLabel(item: UnifiedAiopsIdleDurationResponseItem): string {
    return this.getFirstIdleValue(item.duration, item.idle_duration, item.idleDuration, item.range, item.name, item.label);
  }

  private sortIdleDurationBuckets(items: UnifiedAiopsIdleDurationResponseItem[]): UnifiedAiopsIdleDurationResponseItem[] {
    return [...(items || [])].sort((first, second) => {
      return this.getIdleDurationSortValue(this.getIdleDurationLabel(first)) - this.getIdleDurationSortValue(this.getIdleDurationLabel(second));
    });
  }

  private getIdleDurationSortValue(label: string): number {
    const normalizedLabel = String(label || '').toLowerCase().replace(/\s+/g, '');
    if (normalizedLabel.startsWith('0-7')) {
      return 0;
    }
    if (normalizedLabel.startsWith('7-15')) {
      return 1;
    }
    if (normalizedLabel.startsWith('15-30')) {
      return 2;
    }
    if (normalizedLabel.startsWith('30+')) {
      return 3;
    }
    const firstNumber = normalizedLabel.match(/^\d+/);
    return firstNumber ? Number(firstNumber[0]) : 999;
  }

  private isIdleDurationBucketItem(item: UnifiedAiopsIdleDurationResponseItem): boolean {
    return !!item && this.getIdleDurationCount(item) > 0 && this.isIdleDurationBucketKey(this.getIdleDurationLabel(item));
  }

  private isIdleDurationMetadataKey(key: string): boolean {
    return ['total_idle_count', 'total_count', 'totalCount', 'total', 'count'].includes(key);
  }

  private isIdleDurationBucketKey(key: string): boolean {
    const normalizedKey = String(key || '').toLowerCase().replace(/_/g, ' ').trim();
    return !!normalizedKey && !this.isIdleDurationMetadataKey(key) && (
      normalizedKey.includes('day') ||
      /^\d+\s*[-+]\s*\d*/.test(normalizedKey) ||
      /^\d+\+/.test(normalizedKey)
    );
  }

  private getFirstIdleObject(...values: any[]): UnifiedAiopsIdleMetricResponse | undefined {
    return values.find(value => value && typeof value === 'object');
  }

  private getFirstIdleScalar(...values: any[]): string | number {
    const value = values.find(item => item !== undefined && item !== null && item !== '' && typeof item !== 'object');
    return value === undefined || value === null ? '' : value;
  }

  private getFirstIdleValue(...values: Array<string | number | undefined | null>): string {
    const value = values.find(item => item !== undefined && item !== null && item !== '');
    return value === undefined || value === null ? '' : String(value);
  }

  private getProgressTone(percent: number): UnifiedAiopsTone {
    return percent < 65 ? 'success' : percent < 85 ? 'warning' : 'danger';
  }

  private getNumericIdleValue(value: string | number | undefined | null): number {
    return Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
  }
  /*
   * ******End ****** Idle Devices Widgets Related ********************
   */

  /*
   * -----Start----- Alerts Widget Related -------------------
   */
  getAlertReductionMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getAlertReductionMetricsFromPayload(res))
    );
  }

  getAlertResponseMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getAlertResponseMetricsFromPayload(res))
    );
  }

  getAlertSourceSankey(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => {
        const chartPayload = this.getChartPayload(res, ['source_sankey', 'alert_source_sankey']);
        return this.isEChartsOption(chartPayload) ? chartPayload : this.getAlertSourceSankeyOptionsFromPayload(res);
      })
    );
  }

  convertToAlertSourceSankeyOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  getAlertLifecycleSankey(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<EChartsOption> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(
      map(res => {
        const chartPayload = this.getChartPayload(res, ['lifecycle_sankey', 'alert_lifecycle_sankey']);
        return this.isEChartsOption(chartPayload) ? chartPayload : this.getAlertLifecycleSankeyOptionsFromPayload(res);
      })
    );
  }

  convertToAlertLifecycleSankeyOptions(data: EChartsOption): EChartsOption {
    return data || {};
  }

  private getAlertReductionMetricsFromPayload(response: any): UnifiedAiopsMetric[] {
    const metrics = this.getArrayPayload<UnifiedAiopsMetric>(response, ['reduction_metrics', 'alert_reduction_metrics']);
    if (metrics.length) {
      return metrics;
    }

    const summary = this.flattenPayload(this.getPayloadByKeys(response, ['summary']) || {});
    const cumulativeReduction = this.getNumberFromPayload(summary, ['cumulative_reduction_pct', 'cumulativeReductionPct']);
    const noiseReduction = this.getNumberFromPayload(summary, ['noise_reduction_pct', 'noiseReductionPct']);
    const correlation = this.getNumberFromPayload(summary, ['correlation_pct', 'correlationPct']);
    if (!cumulativeReduction && !noiseReduction && !correlation) {
      return [];
    }

    return [
      { label: 'Cumulative Reduction', value: this.formatPercentage(cumulativeReduction), tone: 'primary' },
      { label: 'Noise Reduction', value: this.formatPercentage(noiseReduction), tone: 'primary' },
      { label: 'Correlation', value: this.formatPercentage(correlation), tone: 'primary' }
    ];
  }

  private getAlertResponseMetricsFromPayload(response: any): UnifiedAiopsMetric[] {
    const metrics = this.getArrayPayload<UnifiedAiopsMetric>(response, ['response_metrics', 'alert_response_metrics']);
    if (metrics.length) {
      return metrics;
    }

    const conditions = this.flattenPayload(this.getPayloadByKeys(response, ['conditions']) || {});
    const mttaMinutes = this.getOptionalNumberValue(this.getFirstDefinedPayloadValue(conditions, ['mtta_minutes', 'mttaMinutes']));
    const mttrMinutes = this.getOptionalNumberValue(this.getFirstDefinedPayloadValue(conditions, ['mttr_minutes', 'mttrMinutes']));
    if (mttaMinutes === null && mttrMinutes === null) {
      return [];
    }

    return [
      { label: 'MTTA', value: this.formatMinutesDuration(mttaMinutes || 0), tone: 'primary' },
      { label: 'MTTR', value: this.formatMinutesDuration(mttrMinutes || 0), tone: 'primary' }
    ];
  }

  private getAlertSourceSankeyOptionsFromPayload(response: any): EChartsOption {
    const links: Array<{ source: string; target: string; value: number }> = [];
    const totals = this.flattenPayload(this.getPayloadByKeys(response, ['totals']) || {});
    const conditions = this.flattenPayload(this.getPayloadByKeys(response, ['conditions']) || {});
    const sources = this.getArrayFromPayload<any>(this.getPayloadByKeys(response, ['events_per_source', 'eventsPerSource']));
    const viewBy = this.getPayloadByKeys(response, ['view_by', 'viewBy']);
    const sourceBreakdown = this.getArrayFromPayload<any>(viewBy?.breakdown);
    const sourceItems = sources.length ? sources : sourceBreakdown;

    sourceItems.forEach(item => {
      const sourceName = String(item?.source || item?.label || item?.name || '').trim();
      const count = this.getNumberFromPayload(this.flattenPayload(item || {}), ['count', 'events', 'value']);
      this.addSankeyLink(links, sourceName, 'Events', count);
    });

    this.addSankeyLink(links, 'Events', 'Alerts', this.getNumberFromPayload(totals, ['total_alerts', 'totalAlerts']));
    this.addSankeyLink(links, 'Events', 'Dedupe Events', this.getNumberFromPayload(totals, ['total_deduped_events', 'totalDedupedEvents']));
    this.addSankeyLink(links, 'Events', 'Suppressed Events', this.getNumberFromPayload(totals, ['total_suppressed_events', 'totalSuppressedEvents']));
    this.addSankeyLink(links, 'Alerts', 'Conditions', this.getNumberFromPayload(conditions, ['total']));
    this.addSankeyLink(links, 'Conditions', 'Ticket Generated', this.getNumberFromPayload(conditions, ['ticket_generated', 'ticketGenerated']));
    this.addSankeyLink(links, 'Conditions', 'No Ticket Generated', this.getNumberFromPayload(conditions, ['ticket_not_generated', 'ticketNotGenerated']));

    return this.getSankeyOptions(links);
  }

  private getAlertLifecycleSankeyOptionsFromPayload(response: any): EChartsOption {
    const links: Array<{ source: string; target: string; value: number }> = [];
    const conditions = this.getPayloadByKeys(response, ['conditions']) || {};
    const flatConditions = this.flattenPayload(conditions || {});

    this.addSankeyLink(links, 'Condition', 'Open', this.getNumberFromPayload(flatConditions, ['open_count', 'open.count']));
    this.addSankeyLink(links, 'Condition', 'Resolved', this.getNumberFromPayload(flatConditions, ['resolved_count', 'resolved.count']));
    this.addSankeyLink(links, 'Open', 'Acknowledged', this.getNumberFromPayload(flatConditions, ['open_acknowledged_count', 'open.acknowledged.count']));
    this.addSankeyLink(links, 'Resolved', 'Auto Healed', this.getNumberFromPayload(flatConditions, ['resolved_auto_healed_count', 'resolved.autoHealed.count']));
    this.addSankeyLink(links, 'Resolved', 'Auto Remediation', this.getNumberFromPayload(flatConditions, ['resolved_auto_remediation_count', 'resolved.autoRemediation.count']));

    this.addDurationSankeyLinks(links, 'Acknowledged', conditions?.open?.acknowledged?.duration);
    this.addDurationSankeyLinks(links, 'Auto Healed', conditions?.resolved?.auto_healed?.duration || conditions?.resolved?.autoHealed?.duration);
    this.addDurationSankeyLinks(links, 'Auto Remediation', conditions?.resolved?.auto_remediation?.duration || conditions?.resolved?.autoRemediation?.duration);

    return this.getSankeyOptions(links);
  }

  private addDurationSankeyLinks(links: Array<{ source: string; target: string; value: number }>, source: string, duration: any) {
    const flatDuration = this.flattenPayload(duration || {});
    this.addSankeyLink(links, source, '5 Min', this.getNumberFromPayload(flatDuration, ['lte_5min', 'lte5min', 'under_5min']));
    this.addSankeyLink(links, source, '30 Min', this.getNumberFromPayload(flatDuration, ['lte_30min', 'lte30min', 'under_30min']));
    this.addSankeyLink(links, source, '> 30 Min', this.getNumberFromPayload(flatDuration, ['gt_30min', 'gt30min', 'over_30min']));
  }

  private addSankeyLink(links: Array<{ source: string; target: string; value: number }>, source: string, target: string, value: number) {
    if (!source || !target || value <= 0) {
      return;
    }
    links.push({ source, target, value });
  }

  private getSankeyOptions(links: Array<{ source: string; target: string; value: number }>): EChartsOption {
    if (!links.length) {
      return {};
    }
    const nodes = Array.from(new Set(links.reduce((result: string[], link) => result.concat(link.source, link.target), [])))
      .map(name => ({ name }));

    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [{
        type: 'sankey',
        data: nodes,
        links,
        left: 8,
        right: 24,
        top: 12,
        bottom: 12,
        nodeWidth: 10,
        nodeGap: 14,
        draggable: false,
        emphasis: { focus: 'adjacency' },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.35
        },
        label: {
          color: '#1f2a34',
          fontSize: 12
        }
      } as any]
    };
  }

  private formatMinutesDuration(minutes: number): string {
    const totalSeconds = Math.max(0, Math.round(minutes * 60));
    const minuteValue = Math.floor(totalSeconds / 60);
    const secondValue = totalSeconds % 60;
    if (!minuteValue) {
      return `${secondValue} Sec`;
    }
    return `${minuteValue} min ${secondValue} Sec`;
  }

  /*
   * ******End ****** Alerts Widget Related ********************
   */

  /*
   * -----Start----- Recent Alerts Widget Related -------------------
   */
  getRecentAlertSummaryMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_RECENT_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.buildRecentAlertSummaryMetrics(res))
    );
  }

  getRecentAlerts(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsRecentAlert[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_RECENT_ALERTS_ENDPOINT, criteria).pipe(
      map(res => this.getRecentAlertRows(res).map(item => this.getRecentAlertViewData(item)))
    );
  }

  convertToRecentAlertsViewData(data: UnifiedAiopsRecentAlert[]): UnifiedAiopsRecentAlert[] {
    return data || [];
  }

  getEmptyRecentAlertSummaryMetrics(): UnifiedAiopsMetric[] {
    return this.getRecentAlertSummaryMetricItems(0, 0, 0, false);
  }

  private buildRecentAlertSummaryMetrics(data: UnifiedAiopsRecentAlertsResponse): UnifiedAiopsMetric[] {
    const summary = this.getRecentAlertSummary(data);
    const rows = this.getRecentAlertRows(data);
    const summaryHasData = this.hasRecentAlertSummaryPayload(summary);
    if (!summaryHasData && !rows.length) {
      return this.getEmptyRecentAlertSummaryMetrics();
    }

    const rowCounts = this.getRecentAlertSeverityCounts(rows);
    const critical = summaryHasData
      ? this.getRecentAlertSummaryValue(summary, ['critical_alerts', 'criticalAlerts', 'critical'])
      : rowCounts.critical;
    const warning = summaryHasData
      ? this.getRecentAlertSummaryValue(summary, ['warning_alerts', 'warningAlerts', 'warning'])
      : rowCounts.warning;
    const info = summaryHasData
      ? this.getRecentAlertSummaryValue(summary, ['info_alerts', 'infoAlerts', 'information', 'info'])
      : rowCounts.info;

    return this.getRecentAlertSummaryMetricItems(critical, warning, info, true);
  }

  private getRecentAlertSummary(data: UnifiedAiopsRecentAlertsResponse): UnifiedAiopsRecentAlertsSummary {
    const nestedData = data?.data && !Array.isArray(data.data) ? data.data : null;
    return data?.severity_summary || data?.severitySummary || data?.alertSummary || data?.alert_summary || data?.summary ||
      nestedData?.severity_summary || nestedData?.severitySummary || nestedData?.alertSummary || nestedData?.alert_summary || nestedData?.summary || {};
  }

  private getRecentAlertSummaryValue(summary: UnifiedAiopsRecentAlertsSummary, keys: Array<keyof UnifiedAiopsRecentAlertsSummary>): number {
    const value = keys.map(key => summary?.[key]).find(item => item !== undefined && item !== null);
    return this.getNumberValue(value);
  }

  private getRecentAlertSummaryMetricItems(critical: number, warning: number, info: number, hasData: boolean): UnifiedAiopsMetric[] {
    return [
      {
        label: 'Critical Alerts',
        value: this.formatNumber(critical),
        tone: 'danger',
        hasData
      },
      {
        label: 'Warning Alerts',
        value: this.formatNumber(warning),
        tone: 'warning',
        hasData
      },
      {
        label: 'Info Alerts',
        value: this.formatNumber(info),
        tone: 'info',
        hasData
      }
    ];
  }

  private hasRecentAlertSummaryPayload(summary: UnifiedAiopsRecentAlertsSummary): boolean {
    return [
      summary?.critical_alerts,
      summary?.criticalAlerts,
      summary?.critical,
      summary?.warning_alerts,
      summary?.warningAlerts,
      summary?.warning,
      summary?.info_alerts,
      summary?.infoAlerts,
      summary?.information,
      summary?.info
    ].some(value => value !== undefined && value !== null);
  }

  private getRecentAlertSeverityCounts(rows: UnifiedAiopsRecentAlertResponseItem[]): { critical: number; warning: number; info: number } {
    return (rows || []).reduce((counts, row) => {
      const severity = this.getRecentAlertSeverity(this.getFirstRecentAlertValue(row?.severity, row?.status));
      if (severity === 'critical') {
        counts.critical += 1;
      } else if (severity === 'warning') {
        counts.warning += 1;
      } else if (severity === 'info') {
        counts.info += 1;
      }
      return counts;
    }, { critical: 0, warning: 0, info: 0 });
  }

  private getRecentAlertRows(data: UnifiedAiopsRecentAlertsResponse): UnifiedAiopsRecentAlertResponseItem[] {
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    const nestedData = data?.data && !Array.isArray(data.data) ? data.data : null;
    return data?.recentAlerts || data?.recent_alerts || data?.alerts || data?.results ||
      nestedData?.recentAlerts || nestedData?.recent_alerts || nestedData?.alerts || nestedData?.results || [];
  }

  private getRecentAlertViewData(item: UnifiedAiopsRecentAlertResponseItem): UnifiedAiopsRecentAlert {
    return {
      id: this.getFirstRecentAlertValue(item.id, item.alert_id, item.alertId, item.uuid, item.alert_uuid, item.alertUuid),
      uuid: this.getFirstRecentAlertValue(item.uuid, item.alert_uuid, item.alertUuid, item.id, item.alert_id, item.alertId),
      deviceName: this.getFirstRecentAlertValue(item.device_name, item.deviceName, item.name),
      severity: this.getRecentAlertSeverity(this.getFirstRecentAlertValue(item.severity, item.status)),
      description: this.getFirstRecentAlertValue(item.description),
      source: this.getFirstRecentAlertValue(item.source),
      acknowledged: this.formatRecentAlertAcknowledged(item.acknowledged),
      duration: this.getFirstRecentAlertValue(item.duration)
    };
  }

  private getFirstRecentAlertValue(...values: Array<string | number | undefined | null>): string {
    const value = values.find(item => item !== undefined && item !== null && item !== '');
    return value === undefined || value === null ? '' : String(value);
  }

  private getRecentAlertSeverity(value: string): UnifiedAiopsRecentAlertSeverity {
    switch ((value || '').toLowerCase()) {
      case 'critical':
      case 'error':
        return 'critical';
      case 'warning':
      case 'warn':
      case 'high':
        return 'warning';
      case 'info':
      case 'information':
      case 'informative':
        return 'info';
      default:
        return 'muted';
    }
  }

  private formatRecentAlertAcknowledged(value: string | boolean | undefined): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    const normalizedValue = String(value || '').toLowerCase();
    if (normalizedValue === 'true') {
      return 'Yes';
    }
    if (normalizedValue === 'false') {
      return 'No';
    }
    return String(value || '');
  }
  /*
   * ******End ****** Recent Alerts Widget Related ********************
   */

  /*
   * -----Start----- Auto-Remediation Summary Widget Related -------------------
   */
  getRemediationDonut(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<{ [key: string]: any }> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getRemediationSummaryPayload(res))
    );
  }

  convertToRemediationDonutOptions(data: { [key: string]: any }): EChartsOption {
    return this.getRemediationDonutOptions(data);
  }

  private getRemediationDonutOptions(summary: { [key: string]: any }): EChartsOption {
    const successPercent = this.getNumberFromPayload(summary, ['success_percent', 'successPercent', 'runbook_success', 'runbookSuccess']);
    const failedPercent = this.getNumberFromPayload(summary, ['failed_percent', 'failedPercent', 'failure_percent', 'failurePercent']);
    if (!successPercent && !failedPercent) {
      return {};
    }
    return this.getDonutOptions([
      { name: 'Successful', value: successPercent, color: '#5b9f1f' },
      { name: 'Failed', value: failedPercent, color: '#e64a4a' }
    ], [], ['#5b9f1f', '#e64a4a'], false);
  }

  getRemediationActions(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsRemediationActionItem[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getRemediationActionItems(res))
    );
  }

  convertToRemediationActionsOptions(data: UnifiedAiopsRemediationActionItem[]): EChartsOption {
    return this.getRemediationActionsOptions(data || []);
  }

  private getRemediationActionsOptions(items: UnifiedAiopsRemediationActionItem[]): EChartsOption {
    const colors = ['#2f80dd', '#2f80dd', '#f5a623', '#5b9f1f', '#5b9f1f'];
    const topItems = (items || []).filter(item => item.count > 0).slice(0, 5);
    if (!topItems.length) {
      return {};
    }
    return {
      color: colors,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: { left: 150, right: 44, top: 8, bottom: 4 },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: topItems.map(item => item.name),
        axisLabel: {
          color: '#1f2a34',
          fontSize: 10,
          formatter: (value: string) => String(value || '').length > 28 ? `${String(value).slice(0, 27)}...` : value
        },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [{
        type: 'bar',
        data: topItems.map((item, index) => ({
          value: item.count,
          name: item.name,
          label: { show: true, position: 'right', color: '#1f2a34', fontSize: 10 },
          itemStyle: { color: colors[index] }
        })),
        barWidth: 7
      }]
    };
  }

  getRemediationSummary(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getRemediationSummaryMetrics(res))
    );
  }

  getRemediationMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsRemediationMetric[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT, criteria).pipe(
      map(res => this.getRemediationMetricCards(res))
    );
  }

  convertToRemediationMetricsViewData(data: UnifiedAiopsRemediationMetric[]): UnifiedAiopsRemediationMetric[] {
    return data || [];
  }

  private getRemediationSummaryPayload(response: any): { [key: string]: any } {
    return this.flattenPayload(this.getMetricPayload(response, ['summary', 'summary_metrics', 'remediation_summary']));
  }

  private getRemediationSummaryMetrics(response: any): UnifiedAiopsMetric[] {
    const summary = this.getRemediationSummaryPayload(response);
    const totalRuns = this.getNumberFromPayload(summary, ['total_runs', 'totalRuns']);
    const successPercent = this.getNumberFromPayload(summary, ['success_percent', 'successPercent', 'runbook_success', 'runbookSuccess']);
    const failedPercent = this.getNumberFromPayload(summary, ['failed_percent', 'failedPercent', 'failure_percent', 'failurePercent']);
    const avgDuration = this.getFirstMetricValue(summary, ['avg_duration', 'avgDuration', 'avg_mttr', 'avgMttr']);
    if (!totalRuns && !successPercent && !failedPercent && !avgDuration) {
      return [];
    }
    return [
      { label: 'Successful', value: this.formatPercentage(successPercent), tone: 'success' },
      { label: 'Failed', value: this.formatPercentage(failedPercent), tone: 'danger' },
      { label: 'Total runs', value: this.formatNumber(totalRuns) },
      { label: 'Avg duration', value: String(avgDuration || '0') }
    ];
  }

  private getRemediationMetricCards(response: any): UnifiedAiopsRemediationMetric[] {
    const summary = this.getRemediationSummaryPayload(response);
    const totalRuns = this.getNumberFromPayload(summary, ['total_runs', 'totalRuns']);
    const successPercent = this.getNumberFromPayload(summary, ['success_percent', 'successPercent', 'runbook_success', 'runbookSuccess']);
    const failedPercent = this.getNumberFromPayload(summary, ['failed_percent', 'failedPercent', 'failure_percent', 'failurePercent']);
    const avgDuration = this.getFirstMetricValue(summary, ['avg_mttr', 'avgMttr', 'avg_duration', 'avgDuration']);
    const autoRemediations = this.getNumberFromPayload(summary, ['auto_remediations', 'autoRemediations']);
    const runbookFailures = this.getNumberFromPayload(
      summary,
      ['runbook_failures', 'runbookFailures', 'failed_runs', 'failedRuns', 'failure_count', 'failureCount'],
      totalRuns && failedPercent ? Math.round(totalRuns * failedPercent / 100) : 0
    );
    if (!autoRemediations && !successPercent && !avgDuration && !runbookFailures) {
      return [];
    }
    return [
      { label: 'Auto-Remediations', value: this.formatNumber(autoRemediations), tone: 'success' },
      { label: 'Runbook Success', value: this.formatPercentage(successPercent), tone: 'success' },
      { label: 'Avg MTTR', value: String(avgDuration || '0'), tone: 'success' },
      { label: 'Runbook Failures', value: this.formatNumber(runbookFailures), tone: 'danger' }
    ];
  }

  private getRemediationActionItems(response: any): UnifiedAiopsRemediationActionItem[] {
    return this.getArrayPayload<any>(response, ['top_auto_remediations', 'topAutoRemediations', 'actions', 'remediation_actions', 'top_actions'])
      .map(item => ({
        name: this.getRemediationActionName(item),
        count: this.getNumberFromPayload(this.flattenPayload(item || {}), ['count', 'value', 'total', 'runs'])
      }))
      .filter(item => !!item.name && item.count > 0)
      .sort((firstItem, secondItem) => secondItem.count - firstItem.count);
  }

  private getRemediationActionName(item: any): string {
    return String(item?.name || item?.label || item?.action || item?.remediation_name || item?.remediationName || '').trim();
  }
  /*
   * ******End ****** Auto-Remediation Summary Widget Related ********************
   */

  private getWidgetFilterParams(criteria?: UnifiedAiopsDashboardFilterCriteria): HttpParams {
    let params = this.getParams({
      dc_uuids: criteria?.datacenters,
      cloud_uuids: criteria?.clouds
    });
    if (criteria?.availabilityMonitor) {
      params = params.set('availability_monitor', criteria.availabilityMonitor);
    }
    if (criteria?.availabilityTimeRange) {
      params = params.set('time_range', criteria.availabilityTimeRange);
    }
    return params;
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

  private getFirstDefinedPayloadValue(payload: { [key: string]: any }, keys: string[]): any {
    const normalizedPayload = this.getNormalizedPayload(payload || {});
    for (const key of keys) {
      const normalizedKey = this.normalizeKey(key);
      if (normalizedPayload[normalizedKey] !== undefined && normalizedPayload[normalizedKey] !== null && normalizedPayload[normalizedKey] !== '') {
        return normalizedPayload[normalizedKey];
      }
    }
    return undefined;
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
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    const displayNumericValue = typeof value === 'string' ? Number(value.replace(/[^0-9.-]/g, '')) : NaN;
    return isNaN(displayNumericValue) ? fallback : displayNumericValue;
  }

  private getOptionalNumberValue(value: any): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const normalizedValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
    const numericValue = Number(normalizedValue);
    return isNaN(numericValue) ? null : numericValue;
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

  private getPerformanceChartItems(payload: any, sortByValue = false): Array<{ name: string; value: number }> {
    if (this.isEChartsOption(payload)) {
      return [];
    }

    if (Array.isArray(payload)) {
      const items = payload
        .map((item, index) => this.getPerformanceChartItem(item, String(index + 1)))
        .filter(item => !!item.name && item.value > 0);
      return sortByValue ? items.sort((firstItem, secondItem) => secondItem.value - firstItem.value) : items;
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const items = Object.keys(payload)
      .map(key => this.getPerformanceChartItem(payload[key], key))
      .filter(item => !!item.name && item.value > 0);
    return sortByValue ? items.sort((firstItem, secondItem) => secondItem.value - firstItem.value) : items;
  }

  private getPerformanceChartItem(item: any, fallbackName: string): { name: string; value: number } {
    if (Array.isArray(item)) {
      return {
        name: this.getReadableStackLabel(String(item[0] || fallbackName)),
        value: this.getNumberValue(item[1])
      };
    }

    if (this.isSimpleMetricValue(item)) {
      return {
        name: this.getReadableStackLabel(fallbackName),
        value: this.getNumberValue(item)
      };
    }

    const flatPayload = this.flattenPayload(item || {});
    return {
      name: this.getReadableStackLabel(String(item?.name || item?.label || item?.resource || item?.device || item?.host || fallbackName)),
      value: this.getNumberFromPayload(flatPayload, ['value', 'usage', 'usage_percent', 'usagePercent', 'percentage', 'percent', 'bandwidth', 'avg', 'average', 'count', 'total'])
    };
  }

  private getPerformanceLinePoints(payload: any): Array<{ name: string; value: number }> {
    const source = this.getArrayFromPayload<any>(payload);
    const points = source.map((item, index) => {
      if (Array.isArray(item)) {
        return {
          name: String(item[0] || index + 1),
          value: this.getNumberValue(item[1])
        };
      }

      const flatPayload = this.flattenPayload(item || {});
      return {
        name: String(item?.time || item?.timestamp || item?.date || item?.label || item?.name || index + 1),
        value: this.getNumberFromPayload(flatPayload, ['value', 'usage', 'usage_percent', 'usagePercent', 'percentage', 'percent', 'bandwidth', 'avg', 'average', 'count', 'total'])
      };
    });

    return points.some(point => point.value > 0) ? points : [];
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

  private hasUsablePayloadValue(payload: any): boolean {
    if (payload === null || payload === undefined) {
      return false;
    }
    if (typeof payload === 'number') {
      return payload > 0;
    }
    if (typeof payload === 'string') {
      return this.getNumberValue(payload) > 0;
    }
    if (typeof payload === 'boolean') {
      return payload;
    }
    if (Array.isArray(payload)) {
      return payload.some(item => this.hasUsablePayloadValue(item));
    }
    if (typeof payload === 'object') {
      return Object.keys(payload).some(key => this.hasUsablePayloadValue(payload[key]));
    }
    return false;
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
