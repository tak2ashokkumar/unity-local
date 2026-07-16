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
  UNIFIED_AIOPS_ALL_SELECTED_VALUE,
  UNIFIED_AIOPS_ANALYTICS_HEALTH_CHARTS_ENDPOINT,
  UNIFIED_AIOPS_AVAILABILITY_BY_CATEGORY_ENDPOINT,
  UNIFIED_AIOPS_APPLICATION_OVERVIEW_ENDPOINT,
  UNIFIED_AIOPS_AUTO_REMEDIATION_SUMMARY_ENDPOINT,
  UNIFIED_AIOPS_BUSINESS_SERVICES_ENDPOINT,
  UNIFIED_AIOPS_DATABASE_MONITORING_ENDPOINT,
  UNIFIED_AIOPS_DATACENTER_OPTIONS,
  UNIFIED_AIOPS_CATEGORY_ACRONYMS,
  UNIFIED_AIOPS_DISCOVERY_COLORS,
  UNIFIED_AIOPS_DISCOVERY_VS_MONITORING_ENDPOINT,
  UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT,
  UNIFIED_AIOPS_EXECUTIVE_SUMMARY_SECTIONS,
  UNIFIED_AIOPS_GEO_DISTRIBUTION_COLORS,
  UNIFIED_AIOPS_GEO_DISTRIBUTION_GLOBAL_OPS_ENDPOINT,
  UNIFIED_AIOPS_IDLE_DEVICES_BY_DURATION_ENDPOINT,
  UNIFIED_AIOPS_IDLE_DEVICES_ENDPOINT,
  UNIFIED_AIOPS_IDLE_DURATION_COLORS,
  UNIFIED_AIOPS_INFRA_PLATFORM_PERFORMANCE_ENDPOINT,
  UNIFIED_AIOPS_OS_MONITORING_ENDPOINT,
  UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS,
  UNIFIED_AIOPS_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT,
  UNIFIED_AIOPS_ORPHANED_DEVICES_ENDPOINT,
  UNIFIED_AIOPS_PARENT_APPLICATIONS_ENDPOINT,
  UNIFIED_AIOPS_PERFORMANCE_METRIC_CONFIG,
  UNIFIED_AIOPS_PRIVATE_CLOUD_FAST_ENDPOINT,
  UNIFIED_AIOPS_PRIVATE_CLOUD_INFRA_COVERAGE_ENDPOINT,
  UNIFIED_AIOPS_PRIVATE_RESOURCE_ICONS,
  UNIFIED_AIOPS_PRIVATE_RESOURCE_ICON_FALLBACK,
  UNIFIED_AIOPS_PUBLIC_CLOUD_FAST_ENDPOINT,
  UNIFIED_AIOPS_PUBLIC_CLOUD_GROUP_LABELS,
  UNIFIED_AIOPS_PUBLIC_CLOUD_GROUP_ORDER,
  UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT,
  UNIFIED_AIOPS_PUBLIC_CLOUD_PROVIDER_LOGOS,
  UNIFIED_AIOPS_PUBLIC_CLOUD_PROVIDER_ORDER,
  UNIFIED_AIOPS_RECENT_ALERTS_ENDPOINT,
  UNIFIED_AIOPS_SANKEY_NODE_COLORS,
  UNIFIED_AIOPS_SERVICES_OVERVIEW_ENDPOINT
} from './unified-aiops-command-centre.const';
import { environment } from 'src/environments/environment';
import {
  UnifiedAiopsAvailabilityCategoryRow,
  UnifiedAiopsAvailabilityCategorySummary,
  UnifiedAiopsBusinessService,
  UnifiedAiopsCloudFilterOption,
  UnifiedAiopsCoverageCard,
  UnifiedAiopsCoverageGroup,
  UnifiedAiopsCoverageRow,
  UnifiedAiopsDashboardFilterCriteria,
  UnifiedAiopsDiscoveryCoverageRow,
  UnifiedAiopsDiscoverySummary,
  UnifiedAiopsExecutiveMetricConfig,
  UnifiedAiopsExecutiveSection,
  UnifiedAiopsFilterOption,
  UnifiedAiopsGeoCell,
  UnifiedAiopsIdleDeviceRow,
  UnifiedAiopsIdleDevicesResponse,
  UnifiedAiopsIdleDurationApiResponse,
  UnifiedAiopsIdleDurationItem,
  UnifiedAiopsIdleDurationResponse,
  UnifiedAiopsIdleDurationResponseItem,
  UnifiedAiopsIdleMetric,
  UnifiedAiopsIdleMetricResponse,
  UnifiedAiopsAlertSegregationSummary,
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

  /** Builds the Alerts widget's local filter form, seeded from the page-level datacenter/cloud selection. */
  buildAlertsFilterForm(datacenters: UnifiedAiopsFilterOption[], clouds: UnifiedAiopsFilterOption[], deviceTypes: string[], viewBy: string): FormGroup {
    return this.builder.group({
      datacenters: [datacenters || []],
      clouds: [clouds || []],
      deviceTypes: [deviceTypes || []],
      viewBy: [viewBy],
      sourceTypes: [[]],
      severityTypes: [[]]
    });
  }

  /** Event-source names for the Alerts "Source Type" multiselect, derived from the alerts response. */
  getAlertSourceOptions(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsFilterOption[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_ALERTS_ENDPOINT, criteria).pipe(map(res => this.getAlertSourceFilterOptions(res)));
  }

  private getAlertSourceFilterOptions(response: any): UnifiedAiopsFilterOption[] {
    const sources = this.getArrayFromPayload<any>(this.getPayloadByKeys(response, ['events_per_source', 'eventsPerSource']));
    const viewBy = this.getPayloadByKeys(response, ['view_by', 'viewBy']);
    const breakdown = this.getArrayFromPayload<any>(viewBy?.breakdown);
    const items = sources.length ? sources : breakdown;
    const seen = new Set<string>();
    return (items || []).reduce((options: UnifiedAiopsFilterOption[], item: any) => {
      const name = String(item?.source || item?.label || item?.name || '').trim();
      const key = name.toLowerCase();
      if (name && !seen.has(key)) {
        seen.add(key);
        options.push({ value: name, label: name });
      }
      return options;
    }, []);
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
  getSummaryMetrics(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsExecutiveSection[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_EXECUTIVE_MONITORING_SUMMARY_ENDPOINT, criteria).pipe(map(res => this.getExecutiveSummarySections(res)));
  }

  convertToExecutiveSummaryViewData(data: UnifiedAiopsExecutiveSection[]): UnifiedAiopsExecutiveSection[] {
    return data || [];
  }

  convertToMetricsViewData(data: UnifiedAiopsMetric[]): UnifiedAiopsMetric[] {
    return data || [];
  }

  private getExecutiveSummarySections(response: any): UnifiedAiopsExecutiveSection[] {
    if (!this.hasUsablePayloadValue(response)) {
      return [];
    }
    return UNIFIED_AIOPS_EXECUTIVE_SUMMARY_SECTIONS
      .map(section => {
        const payload = this.getPayloadByKeys(response, section.payloadKeys) || {};
        const metrics = section.dynamic
          ? this.getExecutiveDynamicMetrics(payload, section.labels, section.link)
          : (section.metrics || [])
            .map(metric => this.getExecutiveMetric(metric, payload))
            .filter((metric): metric is UnifiedAiopsMetric => !!metric);
        return { title: section.title, column: section.column, metrics };
      })
      .filter(section => section.metrics.length > 0);
  }

  private getExecutiveMetric(config: UnifiedAiopsExecutiveMetricConfig, payload: any): UnifiedAiopsMetric | null {
    const raw = this.getFirstDefinedPayloadValue(payload, config.keys);
    if (raw === undefined || raw === null) {
      return null;
    }
    const metric = this.getStatusSummaryMetric(config.label, raw, config);
    if (config.plain) {
      // Idle Devices / URL Monitored render as a single dark count with no up/down/unknown trend.
      metric.tone = undefined;
      metric.up = undefined;
      metric.down = undefined;
      metric.unknown = undefined;
    }
    metric.link = config.link;
    return metric;
  }

  private getExecutiveDynamicMetrics(payload: any, labels?: { [key: string]: string }, link?: string): UnifiedAiopsMetric[] {
    return Object.keys(payload || {})
      .filter(key => payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key]))
      .map(key => {
        const metric = this.getStatusSummaryMetric(labels?.[key] || this.getReadableExecutiveLabel(key), payload[key], { tone: 'primary' });
        metric.link = link;
        return metric;
      });
  }

  private getReadableExecutiveLabel(key: string): string {
    return this.getReadableStackLabel(String(key || '').replace(/_(resources|storage|servers)$/i, ''));
  }
  /*
   * ******End ****** Executive Monitoring Summary Widget Related ********************
   */

  /*
   * -----Start----- Device Discovery vs Monitoring Enablement Widget Related -------------------
   */
  getDiscoveryRows(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsDiscoveryCoverageRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_DISCOVERY_VS_MONITORING_ENDPOINT, criteria).pipe(map(res => this.getDiscoveryCoverageRows(res)));
  }

  // Vertical 100%-stacked bar: per category, Monitored % (coverage) + Not Monitored % filling to 100.
  convertToDiscoveryOptions(rows: UnifiedAiopsDiscoveryCoverageRow[]): EChartsOption {
    const viewRows = rows || [];
    if (!viewRows.length) {
      return {};
    }
    const categories = viewRows.map(row => row.category);

    return {
      color: [UNIFIED_AIOPS_DISCOVERY_COLORS.monitored, UNIFIED_AIOPS_DISCOVERY_COLORS.notMonitored],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params];
          const name = list[0]?.axisValueLabel || list[0]?.name || '';
          // Show raw Monitored / Not Monitored counts (not the bar's percentage), plus a coverage % line.
          const lines = list.map((item: any) => `${item.marker}${item.seriesName}: ${this.formatNumber(this.getNumberValue(item.data?.count))}`);
          const coverageLabel = list[0]?.data?.coverageLabel || '';
          if (coverageLabel) {
            // Reuse the Monitored series marker so the coverage line shows the same colored dot.
            const monitoredMarker = (list.find((item: any) => item.seriesName === 'Monitored') || list[0])?.marker || '';
            lines.push(`${monitoredMarker}Monitoring Coverage: ${coverageLabel}`);
          }
          return [name, ...lines].join('<br/>');
        }
      },
      legend: { bottom: 0, left: 'center', itemWidth: 14, itemHeight: 7, textStyle: { fontSize: 11, color: '#20272e' }, data: ['Monitored', 'Not Monitored'] },
      grid: { left: 8, right: 12, top: 18, bottom: 52, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { fontSize: 9, color: '#5b6570', interval: 0, width: 84, overflow: 'break', lineHeight: 11 }
      },
      yAxis: { type: 'value', max: 100, axisLabel: { fontSize: 11, color: '#5b6570', formatter: '{value}' }, splitLine: { lineStyle: { color: '#d6dce2', type: 'dashed' } } },
      series: [
        { name: 'Monitored', type: 'bar', stack: 'discovery', barMaxWidth: 38, data: viewRows.map(row => ({ value: row.coverage, category: row.category, count: row.monitored, coverageLabel: row.coverageLabel })) },
        { name: 'Not Monitored', type: 'bar', stack: 'discovery', barMaxWidth: 38, data: viewRows.map(row => ({ value: this.getNotMonitoredPercent(row.coverage), category: row.category, count: Math.max(row.discovered - row.monitored, 0), coverageLabel: row.coverageLabel })) }
      ]
    };
  }

  convertToDiscoverySummary(rows: UnifiedAiopsDiscoveryCoverageRow[]): UnifiedAiopsDiscoverySummary {
    const viewRows = rows || [];
    const discovered = viewRows.reduce((total, row) => total + row.discovered, 0);
    const monitored = viewRows.reduce((total, row) => total + row.monitored, 0);
    const coverage = discovered > 0 ? (monitored / discovered) * 100 : 0;
    return {
      discovered: this.formatNumber(discovered),
      monitored: this.formatNumber(monitored),
      coverage: this.formatPercentage(coverage)
    };
  }

  private getDiscoveryCoverageRows(response: any): UnifiedAiopsDiscoveryCoverageRow[] {
    const payload = this.getMetricPayload(response, ['items', 'categories', 'discovery', 'discovery_items']);
    const source = this.getArrayFromPayload<any>(payload);
    const entries = source.length
      ? source.map(item => ({ key: this.getFirstDefinedValue(item?.category, item?.name, item?.label, item?.resource, item?.type), value: item }))
      : Object.keys(payload || {}).map(key => ({ key, value: payload[key] }));

    // Render every entry the API returns as-is - high-level categories by default, sub-levels when a category
    // is selected. No fixed taxonomy: the raw slug is carried on `key` (sent back as device_category) and the
    // raw name is shown Title-cased.
    const rows: UnifiedAiopsDiscoveryCoverageRow[] = [];
    entries.forEach(entry => {
      const flatPayload = this.flattenPayload(entry.value || {});
      const discovered = this.getNumberFromPayload(flatPayload, ['discovered', 'total', 'total_count', 'totalCount', 'count']);
      if (discovered <= 0) {
        return;
      }
      const monitored = this.getNumberFromPayload(flatPayload, ['monitored', 'monitoring_enabled', 'enabled']);
      const coverageValue = this.getFirstDefinedPayloadValue(flatPayload, ['coverage', 'coverage_percent', 'coveragePercent', 'monitoring_coverage', 'monitoringCoverage']);
      const coverage = coverageValue !== undefined
        ? this.getNumberValue(coverageValue)
        : (monitored / discovered) * 100;
      const color = UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS[rows.length % UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS.length];
      rows.push({
        key: this.normalizeDiscoveryKey(this.getFirstDefinedValue(entry.value?.category, entry.key)),
        category: this.formatCategoryName(this.getFirstDefinedValue(entry.value?.resource_type, entry.value?.resourceType, entry.value?.label, entry.value?.name, entry.key)),
        discovered,
        monitored,
        coverage: Math.round(coverage * 10) / 10,
        coverageLabel: this.formatPercentage(coverage),
        color,
        badgeBg: this.hexToRgba(color, 0.16)
      });
    });
    return rows;
  }

  // Converts a raw category key/name to a slug used as the device_category param value.
  private normalizeDiscoveryKey(key: any): string {
    return String(key || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  }

  // Title-cases a raw category name (snake_case / camelCase) for display, keeping known acronyms upper.
  // Leaves already-clean names (including hyphenated ones like "SD-WAN") intact.
  private formatCategoryName(value: any): string {
    const normalized = String(value == null ? '' : value)
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    if (!normalized) {
      return '';
    }
    return normalized.split(' ').map(word => {
      if (UNIFIED_AIOPS_CATEGORY_ACRONYMS.indexOf(word.toLowerCase()) > -1) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  private getNotMonitoredPercent(coverage: number): number {
    return Math.round(Math.max(100 - coverage, 0) * 10) / 10;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const normalized = String(hex || '').replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map(char => char + char).join('')
      : normalized;
    const red = parseInt(value.substring(0, 2), 16) || 0;
    const green = parseInt(value.substring(2, 4), 16) || 0;
    const blue = parseInt(value.substring(4, 6), 16) || 0;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  /*
   * ******End ****** Device Discovery vs Monitoring Enablement Widget Related ********************
   */

  /*
   * -----Start----- Alert Segregation by Type Widget Related -------------------
   */
  convertToAlertSegregationSummary(items: UnifiedAiopsStackItem[]): UnifiedAiopsAlertSegregationSummary {
    const totals = (items || []).reduce((result, item) => {
      result.critical += item.values[0] || 0;
      result.warning += item.values[1] || 0;
      result.info += item.values[2] || 0;
      return result;
    }, { critical: 0, warning: 0, info: 0 });
    return {
      critical: this.formatNumber(totals.critical),
      warning: this.formatNumber(totals.warning),
      info: this.formatNumber(totals.info)
    };
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

  private getAlertSegregationStackItems(response: any): UnifiedAiopsStackItem[] {
    const payload = this.getMetricPayload(response, ['items', 'chart', 'segregation', 'alert_items', 'results']);
    const source = this.getArrayFromPayload<any>(payload);
    const items = source.length
      ? source.map(item => this.getAlertSegregationStackItemFromPayload(item))
      : Object.keys(payload || {}).map(key => this.getAlertSegregationStackItemFromPayload(payload[key], key));

    // Render whatever the API returns (categories by default, sub-levels when a category is selected);
    // keep only entries that actually carry data. Names are Title-cased and the raw slug is on `key`.
    return items.filter(item => item.values.some(value => value > 0));
  }

  private getAlertSegregationStackItemFromPayload(payload: any, fallbackName?: string): UnifiedAiopsStackItem {
    const rawName = this.getFirstDefinedValue(payload?.name, payload?.label, payload?.device_type, payload?.resource_type, payload?.type, fallbackName);
    const key = this.normalizeDiscoveryKey(this.getFirstDefinedValue(payload?.category, payload?.device_type, rawName));
    const name = this.formatCategoryName(rawName);
    if (payload?.values && Array.isArray(payload.values)) {
      return {
        key,
        name,
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
      key,
      name,
      values: critical || warning || info ? [critical, warning, info] : [0, 0, count]
    };
  }
  /*
   * ******End ****** Alert Segregation by Type Widget Related ********************
   */

  private getVerticalStackedBarOptions(items: UnifiedAiopsStackItem[], names: string[], colors: string[], max: number): EChartsOption {
    const viewItems = items || [];
    const categories = viewItems.map(item => item.name);
    const axisMax = this.getStackedBarMax(viewItems, max);
    // Reverse so the last name (Info) renders at the bottom of the stack and Critical on top;
    // colors are bound per series so the reversal does not shift the palette, and legend.data
    // keeps the original Critical/Warning/Info order. Typed any[] (echarts series boundary).
    const series: any[] = names.map((name, index) => ({
      name,
      type: 'bar',
      stack: 'total',
      barWidth: 24,
      itemStyle: { color: colors[index] },
      label: { show: false },
      emphasis: { focus: 'series' },
      data: viewItems.map(item => item.values[index])
    })).reverse();

    return {
      color: colors,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        bottom: 4,
        itemGap: 18,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        data: names,
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
          width: 76,
          overflow: 'break',
          lineHeight: 11
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
      series
    };
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
    return availabilityPercent !== null ? this.formatPercentage(Math.max(100 - availabilityPercent, 0)) : 'NA';
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
   * -----Start----- Geo Distribution / Global Operations Widget Related -------------------
   */
  getGeoHeatmap(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsGeoCell[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_GEO_DISTRIBUTION_GLOBAL_OPS_ENDPOINT, criteria).pipe(map(res => this.getGeoHeatmapGroups(res)));
  }

  convertToGeoHeatmapOptions(data: UnifiedAiopsGeoCell[]): EChartsOption {
    return (data || []).length ? this.getGeoHeatmapOptions(data) : {};
  }

  private getGeoHeatmapOptions(cells: UnifiedAiopsGeoCell[]): EChartsOption {
    return {
      animation: false,
      tooltip: {
        trigger: 'item',
        confine: true,
        backgroundColor: '#ffffff',
        borderColor: '#e2e7ec',
        borderWidth: 1,
        padding: 0,
        textStyle: { color: '#55606b' },
        extraCssText: 'box-shadow: 0 6px 18px rgba(28, 45, 65, 0.18); border-radius: 8px;',
        formatter: (info: any) => this.getGeoDistributionTooltip(info.data)
      },
      grid: {
        top: 6,
        right: 8,
        bottom: 6,
        left: 8
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
      series: [{
        type: 'custom',
        coordinateSystem: 'cartesian2d',
        clip: false,
        renderItem: (params: any, api: any) => {
          const cell = cells[params.dataIndex];
          const start = api.coord([cell.value[0], cell.value[1]]);
          const end = api.coord([cell.value[0] + cell.value[2], cell.value[1] + cell.value[3]]);
          const width = end[0] - start[0];
          const height = end[1] - start[1];
          const centerX = start[0] + width / 2;
          const centerY = start[1] + height / 2;
          const numberFontSize = Math.max(13, Math.min(24, Math.round(height * 0.3)));
          const children: any[] = [{
            type: 'rect',
            shape: { x: start[0], y: start[1], width, height },
            style: {
              fill: cell.color,
              stroke: '#ffffff',
              lineWidth: 2,
              shadowBlur: 4,
              shadowColor: 'rgba(28, 45, 65, 0.16)'
            }
          }];

          // Region name in the top-left corner (only when the tile is large enough to fit it).
          if (width > 50 && height > 30) {
            children.push({
              type: 'text',
              silent: true,
              style: {
                text: cell.name,
                x: start[0] + 10,
                y: start[1] + 9,
                fill: '#ffffff',
                font: '600 11px Arial',
                textAlign: 'left',
                textVerticalAlign: 'top',
                opacity: 0.95,
                overflow: 'truncate',
                width: Math.max(width - 18, 24),
                textShadowColor: 'rgba(0, 0, 0, 0.18)',
                textShadowBlur: 2
              }
            });
          }

          // Total Resources value centered as the headline number.
          children.push({
            type: 'text',
            silent: true,
            style: {
              text: this.formatNumber(cell.totalResources),
              x: centerX,
              y: height > 44 ? centerY - 4 : centerY,
              fill: '#ffffff',
              font: `700 ${numberFontSize}px Arial`,
              textAlign: 'center',
              textVerticalAlign: 'middle',
              textShadowColor: 'rgba(0, 0, 0, 0.18)',
              textShadowBlur: 2
            }
          });

          if (height > 44) {
            children.push({
              type: 'text',
              silent: true,
              style: {
                text: 'Total Resources',
                x: centerX,
                y: centerY + 15,
                fill: '#ffffff',
                font: '400 11px Arial',
                textAlign: 'center',
                textVerticalAlign: 'middle',
                opacity: 0.9
              }
            });
          }

          return { type: 'group', children };
        },
        data: cells
      }]
    };
  }

  // Rich hover popup: resources + alert severities (colored) + service breakdown for a region.
  private getGeoDistributionTooltip(cell: UnifiedAiopsGeoCell): string {
    if (!cell) {
      return '';
    }
    const severityColors = UNIFIED_AIOPS_ALERT_SEVERITY_COLORS;
    const neutralIconColor = '#7a8794';
    const neutralValueColor = '#1f2a34';
    const row = (icon: string, iconColor: string, label: string, value: number, valueColor: string) => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:18px;height:23px;">
        <span style="display:flex;align-items:center;gap:8px;color:#5b6671;">
          <i class="fa ${icon}" style="width:14px;text-align:center;font-size:12px;color:${iconColor};"></i>${label}
        </span>
        <span style="font-weight:600;color:${valueColor};">${this.formatNumber(value)}</span>
      </div>`;

    return `<div style="min-width:216px;padding:11px 13px;font:12px/1.4 Arial;color:#5b6671;">
      <div style="display:flex;align-items:center;gap:7px;font-weight:700;font-size:13px;color:#23303c;margin-bottom:8px;">
        <span style="width:9px;height:9px;border-radius:50%;background:${cell.color};display:inline-block;"></span>${cell.name}
      </div>
      ${row('fa-th-large', '#3aa76d', 'Total Resources', cell.totalResources, neutralValueColor)}
      ${row('fa-bell', '#378ad8', 'Total Alerts', cell.totalAlerts, neutralValueColor)}
      ${row('fa-times-circle', severityColors.critical, 'Critical Alerts', cell.critical, severityColors.critical)}
      ${row('fa-exclamation-triangle', severityColors.warning, 'Warning Alerts', cell.warning, severityColors.warning)}
      ${row('fa-info-circle', severityColors.info, 'Information Alerts', cell.information, severityColors.info)}
      <div style="border-top:1px solid #e8edf1;margin:6px 0;"></div>
      ${row('fa-desktop', neutralIconColor, 'Compute Count', cell.computeCount, neutralValueColor)}
      ${row('fa-cubes', neutralIconColor, 'Platform Services', cell.platformServices, neutralValueColor)}
      ${row('fa-clone', neutralIconColor, 'Other Services', cell.otherServices, neutralValueColor)}
    </div>`;
  }

  private getGeoHeatmapGroups(response: any): UnifiedAiopsGeoCell[] {
    const payload = this.getMetricPayload(response, ['groups', 'heatmap', 'geo_distribution', 'geo_heatmap', 'locations', 'results', 'items', 'rows', 'data']);
    const items = this.getGeoDistributionItems(payload || response).slice(0, 12);
    if (!items.length) {
      return [];
    }

    const layout = this.getTreemapCells(items.map(item => item.totalResources), { x: 0, y: 0, width: 100, height: 100 });
    return items.map((item, index) => ({
      name: item.name,
      color: UNIFIED_AIOPS_GEO_DISTRIBUTION_COLORS[index % UNIFIED_AIOPS_GEO_DISTRIBUTION_COLORS.length],
      value: [layout[index].x, layout[index].y, layout[index].width, layout[index].height],
      totalResources: item.totalResources,
      totalAlerts: item.totalAlerts,
      critical: item.critical,
      warning: item.warning,
      information: item.information,
      computeCount: item.computeCount,
      platformServices: item.platformServices,
      otherServices: item.otherServices
    }));
  }

  private getGeoDistributionItems(payload: any): Array<{ name: string; totalResources: number; totalAlerts: number; critical: number; warning: number; information: number; computeCount: number; platformServices: number; otherServices: number }> {
    const source = Array.isArray(payload) ? payload : Object.keys(payload || {}).map(key => ({
      name: key,
      ...(payload[key] || {})
    }));

    return source
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const flatPayload = this.flattenPayload(item);
        const name = String(item.name || item.location || item.datacenter || item.region || item.city || 'Unknown');
        const critical = this.getNumberFromPayload(flatPayload, ['critical_alerts', 'criticalAlerts', 'critical']);
        const warning = this.getNumberFromPayload(flatPayload, ['warning_alerts', 'warningAlerts', 'warning', 'warnings']);
        const information = this.getNumberFromPayload(flatPayload, ['information_alerts', 'informationAlerts', 'information', 'info', 'informative']);
        const totalAlerts = this.getNumberFromPayload(flatPayload, ['total_alerts', 'totalAlerts'], critical + warning + information);
        const computeCount = this.getNumberFromPayload(flatPayload, ['compute_count', 'computeCount', 'compute']);
        const platformServices = this.getNumberFromPayload(flatPayload, ['platform_services', 'platformServices', 'platform']);
        const otherServices = this.getNumberFromPayload(flatPayload, ['other_services', 'otherServices', 'other']);
        const totalResources = this.getNumberFromPayload(flatPayload, ['total_resources', 'totalResources', 'total', 'count'], computeCount + platformServices + otherServices);

        return { name, totalResources, totalAlerts, critical, warning, information, computeCount, platformServices, otherServices };
      })
      .filter(item => item.name && item.totalResources > 0)
      .sort((first, second) => second.totalResources - first.totalResources);
  }

  // Squarified treemap: lays cells (sized by weight) into the bounds, keeping aspect ratios close to square.
  private getTreemapCells(weights: number[], bounds: { x: number; y: number; width: number; height: number }): Array<{ x: number; y: number; width: number; height: number }> {
    const cells: Array<{ x: number; y: number; width: number; height: number }> = new Array(weights.length);
    let remainingWeight = (weights || []).reduce((sum, weight) => sum + weight, 0);
    let free = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    let index = 0;

    const worstRatio = (areas: number[], side: number): number => {
      const sum = areas.reduce((total, area) => total + area, 0);
      if (sum <= 0 || side <= 0) {
        return Infinity;
      }
      const max = Math.max(...areas);
      const min = Math.min(...areas);
      return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
    };

    while (index < weights.length && remainingWeight > 0) {
      const freeArea = free.width * free.height;
      if (freeArea <= 0) {
        break;
      }
      const side = Math.min(free.width, free.height);
      const rowAreas: number[] = [];
      const rowIndices: number[] = [];
      let cursor = index;

      while (cursor < weights.length) {
        const area = (weights[cursor] / remainingWeight) * freeArea;
        if (rowAreas.length && worstRatio([...rowAreas, area], side) > worstRatio(rowAreas, side)) {
          break;
        }
        rowAreas.push(area);
        rowIndices.push(cursor);
        cursor++;
      }

      const rowArea = rowAreas.reduce((total, area) => total + area, 0);
      if (free.width >= free.height) {
        const stripWidth = rowArea / free.height;
        let offsetY = free.y;
        rowIndices.forEach((itemIndex, position) => {
          const cellHeight = (rowAreas[position] / rowArea) * free.height;
          cells[itemIndex] = { x: free.x, y: offsetY, width: stripWidth, height: cellHeight };
          offsetY += cellHeight;
        });
        free = { x: free.x + stripWidth, y: free.y, width: free.width - stripWidth, height: free.height };
      } else {
        const stripHeight = rowArea / free.width;
        let offsetX = free.x;
        rowIndices.forEach((itemIndex, position) => {
          const cellWidth = (rowAreas[position] / rowArea) * free.width;
          cells[itemIndex] = { x: offsetX, y: free.y, width: cellWidth, height: stripHeight };
          offsetX += cellWidth;
        });
        free = { x: free.x, y: free.y + stripHeight, width: free.width, height: free.height - stripHeight };
      }

      rowIndices.forEach(itemIndex => { remainingWeight -= weights[itemIndex]; });
      index = cursor;
    }

    for (let i = 0; i < weights.length; i++) {
      if (!cells[i]) {
        cells[i] = { x: free.x, y: free.y, width: 0, height: 0 };
      }
    }
    return cells;
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

  // Public Cloud coverage is grouped (Compute / Platform Services / Other Services); each group holds
  // one card per provider that has data, mirroring the Private Cloud single-card chart adaptation.
  getPublicCloudCoverage(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsCoverageGroup[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT, criteria).pipe(map(res => this.getCoverageGroups(res)));
  }

  convertToCoverageCardsViewData(data: UnifiedAiopsCoverageCard[]): UnifiedAiopsCoverageCard[] {
    return data || [];
  }

  convertToCoverageGroupsViewData(data: UnifiedAiopsCoverageGroup[]): UnifiedAiopsCoverageGroup[] {
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

  getCoverageGroupsResourceTotal(groups: UnifiedAiopsCoverageGroup[]): string {
    const total = (groups || []).reduce((sum, group) => sum + this.getNumberValue(group.totalLabel), 0);
    return this.formatNumber(total);
  }

  private getCoverageGroups(response: any): UnifiedAiopsCoverageGroup[] {
    const containers = [response, response?.data, response?.result, response?.results]
      .filter(container => container && typeof container === 'object' && !Array.isArray(container));
    const container = containers.find(item => {
      const normalized = this.getNormalizedPayload(item);
      return UNIFIED_AIOPS_PUBLIC_CLOUD_GROUP_ORDER.some(key => normalized[this.normalizeKey(key)] !== undefined);
    }) || response;
    if (!container || typeof container !== 'object') {
      return [];
    }

    // Group keys arrive title-cased/spaced ("Platform Services"); match them via normalized keys.
    const labels = this.getPublicCloudCoverageLabels();
    const normalizedContainer = this.getNormalizedPayload(container);
    return UNIFIED_AIOPS_PUBLIC_CLOUD_GROUP_ORDER
      .map(groupKey => this.getCoverageGroupFromPayload(groupKey, normalizedContainer[this.normalizeKey(groupKey)], labels))
      .filter((group): group is UnifiedAiopsCoverageGroup => !!group && group.cards.length > 0);
  }

  private getCoverageGroupFromPayload(groupKey: string, groupPayload: any, labels: { [key: string]: string }): UnifiedAiopsCoverageGroup | null {
    if (!groupPayload || typeof groupPayload !== 'object' || Array.isArray(groupPayload)) {
      return null;
    }
    // Providers ("AWS", "Azure", ...) sit directly on the group; match them via normalized keys.
    const providersPayload = groupPayload.providers || groupPayload.clouds || groupPayload;
    const normalizedProviders = this.getNormalizedPayload(providersPayload);
    const cards = UNIFIED_AIOPS_PUBLIC_CLOUD_PROVIDER_ORDER
      .map(providerKey => this.getCoverageProviderCard(providerKey, normalizedProviders[this.normalizeKey(providerKey)], labels))
      .filter((card): card is UnifiedAiopsCoverageCard => !!card);
    if (!cards.length) {
      return null;
    }

    const cardTotal = cards.reduce((sum, card) => sum + this.getNumberValue(card.totalResources), 0);
    const total = this.getNumberFromPayload(groupPayload, ['total_resources', 'totalResources', 'total', 'count'], cardTotal);
    return {
      key: groupKey,
      title: UNIFIED_AIOPS_PUBLIC_CLOUD_GROUP_LABELS[groupKey] || groupPayload.name || this.getReadableCoverageLabel(groupKey),
      totalLabel: this.formatNumber(total),
      cards,
      showChart: cards.length === 1
    };
  }

  private getCoverageProviderCard(providerKey: string, providerPayload: any, labels: { [key: string]: string }): UnifiedAiopsCoverageCard | null {
    if (!providerPayload || typeof providerPayload !== 'object' || Array.isArray(providerPayload)) {
      return null;
    }
    const rows = this.getCoverageServiceRows(providerKey, providerPayload.resources);
    const rowTotal = rows.reduce((sum, row) => sum + this.getNumberValue(row.value), 0);
    const total = this.getNumberFromPayload(providerPayload, ['total_resources', 'totalResources', 'total', 'count'], rowTotal);
    // Drop providers with no data so a customer with fewer clouds (e.g. no OCI) shows fewer cards.
    if (!rows.length && total <= 0) {
      return null;
    }
    return {
      title: labels[providerKey] || this.getReadableCoverageLabel(providerKey),
      logo: this.getProviderLogo(providerKey),
      rows,
      totalResources: this.formatNumber(total),
      chartOptions: this.getCoverageChartOptions(rows)
    };
  }

  // Each provider exposes a `resources` array; every entry is a resource type carrying its own count
  // and icon_path. Entries are grouped by display name (the API repeats a name across
  // resource_type_ids), summing counts and keeping the first available icon.
  private getCoverageServiceRows(providerKey: string, resources: any): UnifiedAiopsCoverageRow[] {
    if (!Array.isArray(resources)) {
      return [];
    }
    const grouped = resources.reduce((groups: Record<string, { label: string; count: number; iconPath: string }>, entry) => {
      if (!entry || typeof entry !== 'object') {
        return groups;
      }
      const label = this.getReadableCoverageLabel(this.getFirstStringValue(entry, ['name', 'service']));
      const count = this.getNumberFromPayload(entry, ['count', 'value', 'resource_count', 'resourceCount', 'total']);
      if (!label || count <= 0) {
        return groups;
      }
      const iconPath = this.getServiceIconPath(providerKey, this.getFirstStringValue(entry, ['icon_path', 'iconPath']));
      const group = groups[label] || (groups[label] = { label, count: 0, iconPath: '' });
      group.count += count;
      if (!group.iconPath && iconPath) {
        group.iconPath = iconPath;
      }
      return groups;
    }, {});

    return Object.keys(grouped)
      .map(key => grouped[key])
      .sort((first, second) => second.count - first.count)
      .map(group => {
        const row: UnifiedAiopsCoverageRow = { label: group.label, value: this.formatNumber(group.count) };
        if (group.iconPath) {
          row.iconPath = group.iconPath;
        }
        return row;
      });
  }

  // Mirrors how the public cloud summary pages build service icons from the API icon_path.
  private getServiceIconPath(providerKey: string, iconPath: string): string {
    const normalizedIconPath = String(iconPath || '').trim();
    if (!normalizedIconPath) {
      return '';
    }
    const base = `${environment.assetsUrl}external-brand`;
    switch (providerKey) {
      case 'aws':
        return `${base}/aws/${normalizedIconPath}.svg`;
      case 'azure':
        return `${base}/azure/Icons/${normalizedIconPath}.svg`;
      case 'gcp':
        return `${base}/gcp/${normalizedIconPath}.svg`;
      case 'oci':
        // Oracle icon_path values already include the file extension.
        return `${base}/oracle/${normalizedIconPath}`;
      default:
        return '';
    }
  }

  private getProviderLogo(providerKey: string): string {
    const logo = UNIFIED_AIOPS_PUBLIC_CLOUD_PROVIDER_LOGOS[providerKey];
    return logo ? `${environment.assetsUrl}external-brand/${logo}` : '';
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
      totalResources: this.formatNumber(totalResources),
      chartOptions: this.getCoverageChartOptions(rows)
    };
  }

  // Vertical bar chart of a coverage card's resource rows; rendered only for a single private cloud type.
  private getCoverageChartOptions(rows: Array<{ label: string; value: string }>): EChartsOption {
    const data = (rows || [])
      .map((row, index) => ({
        name: row.label,
        value: this.getNumberValue(row.value),
        itemStyle: { color: UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS[index % UNIFIED_AIOPS_ORPHANED_CATEGORY_COLORS.length] }
      }))
      .filter(item => item.value > 0);

    if (!data.length) {
      return {};
    }

    const categoryLabels = data.map(item => item.name);
    // Keep bars readable: when there are many resource types, show a window with a scroll/zoom slider.
    const visibleBarCount = 12;
    const enableZoom = data.length > visibleBarCount;
    const zoomEndPercent = Math.min(100, (visibleBarCount / data.length) * 100);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: {c}'
      },
      grid: { left: 8, right: 16, top: 18, bottom: enableZoom ? 30 : 8, containLabel: true },
      dataZoom: enableZoom ? [
        { type: 'inside', start: 0, end: zoomEndPercent },
        { type: 'slider', start: 0, end: zoomEndPercent, height: 14, bottom: 4, brushSelect: false }
      ] : undefined,
      xAxis: {
        type: 'category',
        data: categoryLabels,
        axisLabel: {
          fontSize: 11,
          color: '#5b6570',
          interval: 0,
          rotate: categoryLabels.length > 4 ? 30 : 0
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#5b6570' },
        splitLine: { lineStyle: { color: '#d6dce2', type: 'dashed' } }
      },
      series: [
        {
          name: 'Resource Distribution',
          type: 'bar',
          barMaxWidth: 34,
          data,
          itemStyle: { borderRadius: [3, 3, 0, 0] }
        }
      ]
    };
  }

  private getCoverageRows(payload: any): UnifiedAiopsCoverageRow[] {
    if (Array.isArray(payload)) {
      return payload
        .map(row => ({
          label: this.getReadableCoverageLabel(row?.label || row?.name || row?.type || row?.resource_type),
          value: this.formatNumber(row?.value ?? row?.count ?? row?.total ?? 0),
          ...this.getPrivateResourceIcon(row?.type || row?.resource_type || row?.name || row?.label)
        }))
        .filter(row => this.getNumberValue(row.value) > 0);
    }

    return Object.keys(payload || {})
      .filter(key => !this.isCoverageTotalKey(key) && this.isSimpleMetricValue(payload[key]))
      .map(key => ({
        label: this.getReadableCoverageLabel(key),
        value: this.formatNumber(payload[key]),
        ...this.getPrivateResourceIcon(key)
      }))
      .filter(row => this.getNumberValue(row.value) > 0);
  }

  // Resolves the Font Awesome glyph + color for a private-cloud resource-type slug (the private coverage
  // API sends no icon), mirroring the private-cloud summary page's Component Summary icons.
  private getPrivateResourceIcon(slug: any) {
    return UNIFIED_AIOPS_PRIVATE_RESOURCE_ICONS[this.normalizeKey(String(slug || ''))]
      || UNIFIED_AIOPS_PRIVATE_RESOURCE_ICON_FALLBACK;
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
      gcp: 'Google Cloud',
      oci: 'Oracle'
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
   * -----Start----- Shared Status / Metric Helpers -------------------
   */
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
   * ******End ****** Shared Status / Metric Helpers ********************
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

  getAvailabilityCategory(criteria?: UnifiedAiopsDashboardFilterCriteria): Observable<UnifiedAiopsAvailabilityCategoryRow[]> {
    return this.getWidgetResponse(UNIFIED_AIOPS_AVAILABILITY_BY_CATEGORY_ENDPOINT, criteria).pipe(map(res => this.getAvailabilityCategoryRows(res)));
  }

  // 100%-stacked bar per category: UP / Down / Unknown percentages. Built from the (client-side filtered) rows.
  convertToAvailabilityCategoryOptions(rows: UnifiedAiopsAvailabilityCategoryRow[]): EChartsOption {
    const viewRows = rows || [];
    if (!viewRows.length) {
      return {};
    }
    const categoryLabels = viewRows.map(row => row.label);
    // Shrink the axis label font as the category count grows and rotate the labels so they never overlap.
    const labelCount = categoryLabels.length;
    const axisFontSize = labelCount > 12 ? 9 : (labelCount > 8 ? 10 : 11);

    return {
      color: ['#13bd77', UNIFIED_AIOPS_ALERT_SEVERITY_COLORS.critical, '#5f6d7b'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params];
          const name = list[0]?.axisValueLabel || list[0]?.name || '';
          // Show the raw UP / Down / Unknown device counts, then the availability coverage %.
          const lines = list.map((item: any) => `${item.marker}${item.seriesName}: ${this.formatNumber(this.getNumberValue(item.data?.count))}`);
          const coverageLabel = list[0]?.data?.coverageLabel || '';
          if (coverageLabel) {
            const upMarker = (list.find((item: any) => item.seriesName === 'UP') || list[0])?.marker || '';
            lines.push(`${upMarker}Availability Coverage: ${coverageLabel}`);
          }
          return [name, ...lines].join('<br/>');
        }
      },
      legend: { bottom: 0, left: 'center', itemWidth: 14, itemHeight: 7, textStyle: { fontSize: 11, color: '#20272e' } },
      grid: { left: 4, right: 8, top: 12, bottom: 34, containLabel: true },
      xAxis: { type: 'category', data: categoryLabels, axisLabel: { fontSize: axisFontSize, color: '#5b6570', interval: 0, rotate: 40 } },
      yAxis: { type: 'value', max: 100, axisLabel: { fontSize: 11, color: '#5b6570' }, splitLine: { lineStyle: { color: '#d6dce2', type: 'dashed' } } },
      series: [
        { name: 'UP', type: 'bar', stack: 'availability', barMaxWidth: 20, data: viewRows.map(row => ({ value: row.up, count: row.upCount, coverageLabel: row.upLabel })) },
        { name: 'Down', type: 'bar', stack: 'availability', barMaxWidth: 20, data: viewRows.map(row => ({ value: row.down, count: row.downCount, coverageLabel: row.upLabel })) },
        { name: 'Unknown', type: 'bar', stack: 'availability', barMaxWidth: 20, data: viewRows.map(row => ({ value: row.unknown, count: row.unknownCount, coverageLabel: row.upLabel })) }
      ]
    };
  }

  // Averages UP / Down / Unknown across the (client-side filtered) rows for the KPI strip.
  convertToAvailabilityCategorySummary(rows: UnifiedAiopsAvailabilityCategoryRow[]): UnifiedAiopsAvailabilityCategorySummary {
    const viewRows = rows || [];
    if (!viewRows.length) {
      return this.getEmptyAvailabilityCategorySummary();
    }
    return {
      up: this.formatPercentage(this.getAverageValue(viewRows.map(row => row.up))),
      down: this.formatPercentage(this.getAverageValue(viewRows.map(row => row.down))),
      unknown: this.formatPercentage(this.getAverageValue(viewRows.map(row => row.unknown)))
    };
  }

  private getAvailabilityCategoryRows(response: any): UnifiedAiopsAvailabilityCategoryRow[] {
    const payload = this.getMetricPayload(response, ['items', 'availability_by_category', 'availabilityByCategory', 'availability_category']);
    if (!this.hasUsablePayloadValue(payload)) {
      return [];
    }
    const entries = Array.isArray(payload)
      ? payload.map(item => ({ key: this.getFirstDefinedValue(item?.category, item?.resource, item?.name, item?.label, item?.type), value: item }))
      : Object.keys(payload || {}).map(key => ({ key, value: payload[key] }));

    // Render every entry the API returns (categories by default, sub-levels when a category is selected);
    // keep only entries that carry data. Labels are Title-cased and the raw slug is on `key`.
    const rows: UnifiedAiopsAvailabilityCategoryRow[] = [];
    entries.forEach(entry => {
      const flatPayload = this.flattenPayload(entry.value || {});
      const up = this.getNumberFromPayload(flatPayload, ['avg_up', 'avgUp', 'up_percent', 'upPercent', 'up', 'online', 'healthy']);
      const down = this.getNumberFromPayload(flatPayload, ['avg_down', 'avgDown', 'down_percent', 'downPercent', 'down', 'offline', 'unhealthy']);
      const unknown = this.getNumberFromPayload(flatPayload, ['avg_unknown', 'avgUnknown', 'unknown_percent', 'unknownPercent', 'unknown', 'unknowns']);
      if (up <= 0 && down <= 0 && unknown <= 0) {
        return;
      }
      // Raw device counts for the tooltip - up/down/unknown above are the avg percentages the bars use.
      const upCount = this.getNumberFromPayload(flatPayload, ['up_count', 'upCount', 'up_devices', 'upDevices', 'up', 'online', 'healthy']);
      const downCount = this.getNumberFromPayload(flatPayload, ['down_count', 'downCount', 'down_devices', 'downDevices', 'down', 'offline', 'unhealthy']);
      const unknownCount = this.getNumberFromPayload(flatPayload, ['unknown_count', 'unknownCount', 'unknown_devices', 'unknownDevices', 'unknown', 'unknowns']);
      rows.push({
        key: this.normalizeDiscoveryKey(this.getFirstDefinedValue(entry.value?.category, entry.key)),
        label: this.formatCategoryName(this.getFirstDefinedValue(entry.value?.resource, entry.value?.resource_type, entry.value?.label, entry.value?.name, entry.key)),
        up,
        down,
        unknown,
        upCount,
        downCount,
        unknownCount,
        upLabel: this.formatPercentage(up),
        tone: this.getAvailabilityCategoryTone(up)
      });
    });
    return rows;
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
      resourceType: this.getFirstOrphanedValue(item.device_type, item.resource_type, item.resourceType, item.type),
      provider: this.getFirstOrphanedValue(item.provider, item.platform, item.cloud_provider, item.cloudProvider, item.cloud),
      cloudType: this.getFirstOrphanedValue(item.cloud_type, item.cloudType, item.platform, item.provider, item.cloud_provider, item.cloudProvider),
      monitoringType: this.getFirstOrphanedValue(item.monitoring_type, item.monitoringType),
      monitoring: item.monitoring,
      name: this.getFirstOrphanedValue(item.name, item.device_name, item.deviceName, item.instance_name, item.instanceName),
      status: this.getFirstOrphanedValue(item.status),
      lastSeen: this.formatOrphanedDate(this.getFirstOrphanedValue(item.last_availability_time, item.lastSeen, item.last_seen)),
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
        resourceType: this.getFirstIdleValue(row.device_type, row.resource_type, row.resourceType, row.type),
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
    type SankeyLink = { source: string; target: string; value: number; lineStyle?: { color: string; opacity: number } };
    const links: SankeyLink[] = [];
    const nodeTotals: { [name: string]: number } = {};
    // Seed downstream node colors from the curated palette; severity tiles add their own colors below.
    const nodeColors: { [name: string]: string } = { ...UNIFIED_AIOPS_SANKEY_NODE_COLORS };
    // Severity tiles render the source name only on the topmost existing tile; others stay blank
    const nodeLabels: { [name: string]: string } = {};

    const totals = this.flattenPayload(this.getPayloadByKeys(response, ['totals']) || {});
    const conditions = this.flattenPayload(this.getPayloadByKeys(response, ['conditions']) || {});
    const sources = this.getArrayFromPayload<any>(this.getPayloadByKeys(response, ['events_per_source', 'eventsPerSource']));
    const viewBy = this.getPayloadByKeys(response, ['view_by', 'viewBy']);
    const sourceBreakdown = this.getArrayFromPayload<any>(viewBy?.breakdown);
    const sourceItems = sources.length ? sources : sourceBreakdown;

    const totalAlerts = this.getNumberFromPayload(totals, ['total_alerts', 'totalAlerts']);
    const totalDeduped = this.getNumberFromPayload(totals, ['total_deduped_events', 'totalDedupedEvents']);
    const totalSuppressed = this.getNumberFromPayload(totals, ['total_suppressed_events', 'totalSuppressedEvents']);
    const mainFlow = Math.max(totalAlerts + totalDeduped + totalSuppressed, 1);

    // Source node heights bounded to 10px min and 25px max out of 226px usable chart height
    const maxGroupValue = (25 / 226) * mainFlow;
    const minGroupValue = (10 / 226) * mainFlow;

    const SEVERITY_COLORS: { [key: string]: string } = {
      Critical: '#cc0000',
      Warning: '#ff8800',
      Info: '#378ad8'
    };

    sourceItems.forEach((item: any) => {
      const sourceName = String(item?.source || item?.label || item?.name || '').trim();
      if (!sourceName) { return; }

      const flat = this.flattenPayload(item || {});
      const totalSourceEvents = this.getNumberFromPayload(flat, ['count', 'events', 'value']);

      // Try severity fields  support multiple naming conventions from API
      const criticalCount = this.getNumberFromPayload(flat, ['critical', 'critical_events', 'criticalEvents', 'severity_critical']);
      const warningCount = this.getNumberFromPayload(flat, ['warning', 'warning_events', 'warningEvents', 'severity_warning']);
      const infoCount = this.getNumberFromPayload(flat, [
        'info', 'information', 'info_events', 'infoEvents', 'information_events', 'informationEvents', 'severity_info'
      ]);
      const hasSeverity = criticalCount > 0 || warningCount > 0 || infoCount > 0;

      if (hasSeverity) {
        // Scenario A: severity data present  3 tiles per source (Critical, Warning, Info)
        const severityTotal = Math.max(criticalCount + warningCount + infoCount, 1);
        const clampedGroup = Math.min(Math.max(severityTotal, minGroupValue), maxGroupValue);

        const severities = [
          { suffix: 'Critical', count: criticalCount },
          { suffix: 'Warning',  count: warningCount },
          { suffix: 'Info',     count: infoCount }
        ];

        let sourceLabelAssigned = false;
        severities.forEach(({ suffix, count }) => {
          if (count <= 0) { return; }
          const nodeName = `${sourceName} :: ${suffix}`;
          const color = SEVERITY_COLORS[suffix];
          const tileValue = (count / severityTotal) * clampedGroup;
          nodeColors[nodeName] = color;
          nodeTotals[nodeName] = count;
          // Show the source name on the topmost existing tile only; remaining tiles stay blank
          nodeLabels[nodeName] = sourceLabelAssigned ? '' : sourceName;
          sourceLabelAssigned = true;
          links.push({ source: nodeName, target: 'Events', value: tileValue, lineStyle: { color, opacity: 0.35 } });
        });
      } else {
        // Scenario B: no severity data  single node per source, gradient flow
        const clampedValue = Math.min(Math.max(totalSourceEvents, minGroupValue), maxGroupValue);
        nodeTotals[sourceName] = totalSourceEvents;
        links.push({ source: sourceName, target: 'Events', value: clampedValue });
      }
    });

    nodeTotals['Events'] = this.getNumberFromPayload(totals, ['total_events', 'totalEvents']);
    nodeTotals['Alerts'] = totalAlerts;
    nodeTotals['Conditions'] = this.getNumberFromPayload(conditions, ['total']);

    // Events wall splits into Alerts, Dedupe Events, Suppressed Events
    this.addSankeyLink(links, 'Events', 'Alerts', totalAlerts);
    this.addSankeyLink(links, 'Events', 'Dedupe Events', totalDeduped);
    this.addSankeyLink(links, 'Events', 'Suppressed Events', totalSuppressed);
    // All Alerts flow into Conditions; Conditions split into Ticket Generated / No Ticket Generated
    this.addSankeyLink(links, 'Alerts', 'Conditions', this.getNumberFromPayload(conditions, ['total']));
    this.addSankeyLink(links, 'Conditions', 'Ticket Generated', this.getNumberFromPayload(conditions, ['ticket_generated', 'ticketGenerated']));
    this.addSankeyLink(links, 'Conditions', 'No Ticket Generated', this.getNumberFromPayload(conditions, ['ticket_not_generated', 'ticketNotGenerated']));

    return this.getSankeyOptions(links, nodeTotals, nodeColors, nodeLabels);
  }

  private getAlertLifecycleSankeyOptionsFromPayload(response: any): EChartsOption {
    const links: Array<{ source: string; target: string; value: number; lineStyle?: { color: string; opacity: number } }> = [];
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

    const nodeTotals = {
      Condition: this.getNumberFromPayload(flatConditions, ['total']),
      Open: this.getNumberFromPayload(flatConditions, ['open_count', 'open.count']),
      Resolved: this.getNumberFromPayload(flatConditions, ['resolved_count', 'resolved.count']),
      Acknowledged: this.getNumberFromPayload(flatConditions, ['open_acknowledged_count', 'open.acknowledged.count']),
      'Auto Healed': this.getNumberFromPayload(flatConditions, ['resolved_auto_healed_count', 'resolved.autoHealed.count']),
      'Auto Remediation': this.getNumberFromPayload(flatConditions, ['resolved_auto_remediation_count', 'resolved.autoRemediation.count'])
    };

    // Keep layoutIterations at 0 (the default) so the input order is preserved - Open stays above
    // Resolved, matching the design - rather than ECharts re-ordering the columns.
    return this.getSankeyOptions(links, nodeTotals, { ...UNIFIED_AIOPS_SANKEY_NODE_COLORS });
  }

  private addDurationSankeyLinks(links: Array<{ source: string; target: string; value: number; lineStyle?: { color: string; opacity: number } }>, source: string, duration: any) {
    const flatDuration = this.flattenPayload(duration || {});
    this.addSankeyLink(links, source, '5 Min', this.getNumberFromPayload(flatDuration, ['lte_5min', 'lte5min', 'under_5min']));
    this.addSankeyLink(links, source, '30 Min', this.getNumberFromPayload(flatDuration, ['lte_30min', 'lte30min', 'under_30min']));
    this.addSankeyLink(links, source, '> 30 Min', this.getNumberFromPayload(flatDuration, ['gt_30min', 'gt30min', 'over_30min']));
  }

  private addSankeyLink(
    links: Array<{ source: string; target: string; value: number; lineStyle?: { color: string; opacity: number } }>,
    source: string, target: string, value: number
  ) {
    if (!source || !target || value <= 0) {
      return;
    }
    links.push({ source, target, value });
  }

  private getSankeyOptions(
    links: Array<{ source: string; target: string; value: number; lineStyle?: { color: string; opacity: number } }>,
    nodeTotals: { [name: string]: number } = {},
    nodeColors: { [name: string]: string } = {},
    nodeLabels: { [name: string]: string } = {}
  ): EChartsOption {
    if (!links.length) {
      return {};
    }

    const allNames = Array.from(new Set(links.reduce((result: string[], link) => result.concat(link.source, link.target), [])));

    const nodes = allNames.map(name => {
      const incoming = links.filter(link => link.target === name).reduce((total, link) => total + link.value, 0);
      const outgoing = links.filter(link => link.source === name).reduce((total, link) => total + link.value, 0);
      const explicitTotal = nodeTotals[name];
      const count = explicitTotal && explicitTotal > 0 ? explicitTotal : Math.max(incoming, outgoing);
      const node: any = { name, count };
      if (nodeColors[name]) {
        node.itemStyle = { color: nodeColors[name] };
      }
      // Source nodes (no incoming links) label to the left; terminal nodes label to the right
      const isSource = !links.some(link => link.target === name);
      const isTerminal = !links.some(link => link.source === name);
      if (isSource) {
        node.label = { position: 'left' };
      } else if (isTerminal) {
        node.label = { position: 'right' };
      }
      return node;
    });

    // Compress node heights so a few huge flows (e.g. Events) do not dwarf the small downstream
    // nodes: take the square root of each flow (gently compresses the range while keeping order),
    // then floor it to ~20% of the tallest so small nodes stay readable and their labels do not
    // overlap. The node labels above keep the REAL counts; only the layout link values are scaled.
    const maxFlow = Math.max(1, ...allNames.map(name => {
      const incoming = links.filter(link => link.target === name).reduce((total, link) => total + link.value, 0);
      const outgoing = links.filter(link => link.source === name).reduce((total, link) => total + link.value, 0);
      return Math.max(incoming, outgoing);
    }));
    const compress = (value: number) => Math.sqrt(Math.max(value, 0));
    const minLayoutValue = compress(maxFlow) * 0.2;
    const layoutLinks = links.map(link => ({ ...link, value: Math.max(compress(link.value), minLayoutValue) }));

    // Fixed label box width keeps wall spacing consistent and wraps long names instead of
    // letting them spill past the left/right chart edges.
    const labelWidth = 86;
    const sideMargin = labelWidth + 10;

    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [{
        type: 'sankey',
        data: nodes,
        links: layoutLinks,
        left: sideMargin,
        right: sideMargin,
        top: 12,
        bottom: 12,
        nodeWidth: 10,
        nodeGap: 30,
        nodeAlign: 'left',
        layoutIterations: 0,
        draggable: false,
        emphasis: { focus: 'adjacency' },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.35
        },
        label: {
          color: '#1f2a34',
          fontSize: 12,
          width: labelWidth,
          overflow: 'break',
          lineHeight: 14,
          formatter: (params: any) => {
            const name: string = params?.name || '';
            const count = params?.data?.count;
            // Scenario A severity tile: source name shows only on the designated topmost tile
            if (name.includes(' :: ')) {
              return nodeLabels[name] || '';
            }
            return count ? `${name}\n(${this.formatNumber(count)})` : name;
          }
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
    if (criteria?.deviceTypes?.length) {
      params = params.set('device_types', this.getCsvValue(criteria.deviceTypes));
    }
    if (criteria?.sourceTypes?.length) {
      params = params.set('source_types', this.getCsvValue(criteria.sourceTypes));
    }
    if (criteria?.severityTypes?.length) {
      params = params.set('severity_types', this.getCsvValue(criteria.severityTypes));
    }
    if (criteria?.deviceCategory) {
      params = params.set('device_category', criteria.deviceCategory);
    }
    if (criteria?.viewBy) {
      params = params.set('view_by', criteria.viewBy);
    }
    if (criteria?.duration) {
      params = params.set('duration', criteria.duration);
    }
    if (criteria?.startDate) {
      params = params.set('start_date', criteria.startDate);
    }
    if (criteria?.endDate) {
      params = params.set('end_date', criteria.endDate);
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
