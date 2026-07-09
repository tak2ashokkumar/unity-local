import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  PUBLIC_CLOUD_ACTIVE_DATABASE_WORKLOAD_ENDPOINT,
  PUBLIC_CLOUD_ALL_SELECTED_VALUE,
  PUBLIC_CLOUD_DATABASE_OVERVIEW_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_OVERVIEW_KPI_CONFIG,
  PUBLIC_CLOUD_DATABASE_WRITE_TREND_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_READ_TREND_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_CAPACITY_RESOURCES_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_SPACE_CONSUMPTION_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_SPACE_KPI_CONFIG,
  PUBLIC_CLOUD_DATABASE_TREND_READ_COLORS,
  PUBLIC_CLOUD_DATABASE_TREND_WRITE_COLORS,
  PUBLIC_CLOUD_STORAGE_RESOURCES_ENDPOINT,
  PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_ENDPOINT,
  PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS,
  PUBLIC_CLOUD_LATENCY_BREAKDOWN_ENDPOINT,
  PUBLIC_CLOUD_LATENCY_BREAKDOWN_COLORS,
  PUBLIC_CLOUD_COVERAGE_GROUP_LABELS,
  PUBLIC_CLOUD_COVERAGE_GROUP_ORDER,
  PUBLIC_CLOUD_COVERAGE_PROVIDER_LABELS,
  PUBLIC_CLOUD_COVERAGE_PROVIDER_LOGOS,
  PUBLIC_CLOUD_COVERAGE_PROVIDER_ORDER,
  PUBLIC_CLOUD_HOTSPOT_PROVIDER_LOGOS,
  PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_HEALTH_METRIC_COLORS,
  PUBLIC_CLOUD_DATABASE_HEALTH_SCORE_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_LATENCY_COLORS,
  PUBLIC_CLOUD_DATABASE_LATENCY_OVERVIEW_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_WIDGET_COLORS,
  PUBLIC_CLOUD_FILTERS_ENDPOINT,
  PUBLIC_CLOUD_GEO_ALERT_SEVERITY_COLORS,
  PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS,
  PUBLIC_CLOUD_GEO_DISTRIBUTION_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DEVICES_BY_DURATION_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DEVICES_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DURATION_COLORS,
  PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT,
  PUBLIC_CLOUD_LATENCY_HEATMAP_COLORS,
  PUBLIC_CLOUD_LATENCY_HEATMAP_ENDPOINT,
  PUBLIC_CLOUD_QUEUE_BACKLOG_COLORS,
  PUBLIC_CLOUD_QUEUE_BACKLOG_MONITOR_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS,
  PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT,
  PUBLIC_CLOUD_PERFORMANCE_HOTSPOTS_ENDPOINT,
  PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG,
  PUBLIC_CLOUD_OBJECT_FILE_GROWTH_TREND_ENDPOINT,
  PUBLIC_CLOUD_READ_VS_WRITE_TRAFFIC_ENDPOINT,
  PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_DISTRIBUTION_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_DISTRIBUTION_COLORS,
  PUBLIC_CLOUD_STORAGE_HEALTH_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_SERVICES_VISIBILITY_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_TREND_COLORS,
  PUBLIC_CLOUD_STORAGE_UTILIZATION_BY_CLOUD_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_UTILIZATION_COLORS,
  PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG,
  PUBLIC_CLOUD_TAG_STYLE_CONFIG,
  PUBLIC_CLOUD_TRANSACTION_VOLUME_TREND_ENDPOINT,
  PUBLIC_CLOUD_TOP_LOCK_CONTENTION_ENDPOINT,
  PUBLIC_CLOUD_TOP_MEMORY_CONSUMERS_ENDPOINT,
  PUBLIC_CLOUD_TOP_STORAGE_CONSUMERS_ENDPOINT
} from './public-cloud-compute-dashboard.const';
import {
  PublicCloudAccountOption,
  PublicCloudDatabaseKpi,
  PublicCloudDatabaseOverviewResponse,
  PublicCloudDatabaseOverviewRow,
  PublicCloudDatabaseCapacityResponse,
  PublicCloudDatabaseSpaceConsumptionResponse,
  PublicCloudDatabaseSpaceRow,
  PublicCloudDatabaseTrendResponse,
  PublicCloudDatabaseTrendSeriesItem,
  PublicCloudStoragePerformanceCard,
  PublicCloudStorageMetricResponse,
  PublicCloudStorageHighLatencyResponse,
  PublicCloudStorageResourceRow,
  PublicCloudStorageResourcesResponse,
  PublicCloudWritePerformanceResponse,
  PublicCloudWritePerformanceViewData,
  PublicCloudLatencyBreakdownResponse,
  PublicCloudLatencyBreakdownViewData,
  PublicCloudActiveDatabaseWorkloadViewData,
  PublicCloudAlertSummaryMetric,
  PublicCloudDatabaseBarItem,
  PublicCloudDatabaseBarResponseItem,
  PublicCloudDatabaseConsumerRow,
  PublicCloudDatabaseHealthMetric,
  PublicCloudDatabaseHealthScoreResponse,
  PublicCloudDatabaseHealthScoreViewData,
  PublicCloudDatabaseMetricItem,
  PublicCloudDatabaseWidgetResponse,
  PublicCloudCoverageCard,
  PublicCloudCoverageGroup,
  PublicCloudCoverageRow,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDashboardFilterOptions,
  PublicCloudFilterOption,
  PublicCloudFiltersResponse,
  PublicCloudFilterAccountResponseItem,
  PublicCloudGeoCell,
  PublicCloudLockContentionResponse,
  PublicCloudLockContentionResponseItem,
  PublicCloudLockContentionRow,
  PublicCloudIdleDeviceRow,
  PublicCloudIdleDevicesResponse,
  PublicCloudIdleDurationApiResponse,
  PublicCloudIdleDurationItem,
  PublicCloudIdleDurationResponse,
  PublicCloudIdleDurationResponseItem,
  PublicCloudIdleMetric,
  PublicCloudIdleMetricResponse,
  PublicCloudInventorySummaryResponse,
  PublicCloudInventoryTagResponse,
  PublicCloudInventoryTags,
  PublicCloudLatencyHeatmapResponse,
  PublicCloudLatencyHeatmapRow,
  PublicCloudQueueBacklogResponse,
  PublicCloudQueueBacklogRow,
  PublicCloudOrphanedCategoryItem,
  PublicCloudOrphanedCategoryResponseItem,
  PublicCloudOrphanedDeviceResponseItem,
  PublicCloudOrphanedDeviceRow,
  PublicCloudOrphanedDevicesByCategoryApiResponse,
  PublicCloudOrphanedDevicesByCategoryResponse,
  PublicCloudOrphanedDevicesResponse,
  PublicCloudPerformanceHotspotDisk,
  PublicCloudPerformanceHotspotReadWrite,
  PublicCloudPerformanceHotspotRow,
  PublicCloudPerformanceHotspotsResponse,
  PublicCloudProviderDistributionKey,
  PublicCloudPlatform,
  PublicCloudProviderDistributionItem,
  PublicCloudRecentAlert,
  PublicCloudRecentAlertResponseItem,
  PublicCloudRecentAlertSeverity,
  PublicCloudRecentAlertsResponse,
  PublicCloudRecentAlertsSummary,
  PublicCloudRegionOption,
  PublicCloudStorageBarItem,
  PublicCloudStorageConsumerRow,
  PublicCloudStorageDistributionItem,
  PublicCloudStorageHealthResponse,
  PublicCloudStorageKeyedNumberResponse,
  PublicCloudStorageKpi,
  PublicCloudStorageServicesVisibilityResponse,
  PublicCloudStorageSeriesPoint,
  PublicCloudStorageTrafficResponse,
  PublicCloudStorageTrendResponse,
  PublicCloudStorageTrendViewData,
  PublicCloudSummaryMetric,
  PublicCloudStatusTone,
  PublicCloudTagItem
} from './public-cloud-compute-dashboard.type';

@Injectable()
export class PublicCloudComputeDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

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

  getFilterOptions(): Observable<PublicCloudDashboardFilterOptions> {
    return this.http.get<PublicCloudFiltersResponse>(PUBLIC_CLOUD_FILTERS_ENDPOINT)
      .pipe(map(res => this.convertToFilterOptions(res)));
  }

  filterAccountsForSelection(accounts: PublicCloudAccountOption[], platforms?: string[], regions?: string[]): PublicCloudAccountOption[] {
    const selectedPlatforms = platforms ? this.getSelectedPlatforms(platforms) : [];
    const selectedRegions = regions ? this.getSelectedValues(regions) : [];
    if ((platforms && !selectedPlatforms.length) || (regions && !selectedRegions.length)) {
      return [];
    }
    return (accounts || []).filter(account => {
      const matchesPlatform = !selectedPlatforms.length || selectedPlatforms.includes(this.normalizePlatformValue(account.platform) as PublicCloudPlatform);
      const matchesRegion = !selectedRegions.length || !account.region || selectedRegions.includes(account.region);
      return matchesPlatform && matchesRegion;
    });
  }

  private convertToFilterOptions(data: PublicCloudFiltersResponse): PublicCloudDashboardFilterOptions {
    return {
      platforms: this.convertPlatformValuesToOptions(data?.platform),
      regions: this.convertRegionValuesToOptions(data?.region),
      accounts: this.convertAccountValuesToOptions(data?.account)
    };
  }

  private convertPlatformValuesToOptions(values?: string[]): PublicCloudFilterOption[] {
    return (values || [])
      .map(value => this.normalizePlatformValue(value))
      .filter((value, index, list) => !!value && list.indexOf(value) === index)
      .map(value => ({
        value,
        label: this.formatPlatformLabel(value)
      }));
  }

  private convertRegionValuesToOptions(values?: string[]): PublicCloudRegionOption[] {
    return (values || [])
      .filter((value, index, list) => !!value && list.indexOf(value) === index)
      .map(value => ({
        value,
        label: this.formatRegionLabel(value)
      }));
  }

  private convertAccountValuesToOptions(values?: PublicCloudFilterAccountResponseItem[]): PublicCloudAccountOption[] {
    return (values || []).reduce((options: PublicCloudAccountOption[], item) => {
      const uuid = item?.uuid;
      const platform = this.normalizePlatformValue(item?.cloud_type);
      if (uuid && platform) {
        options.push({
          value: uuid,
          label: item.name || uuid,
          platform: platform as PublicCloudPlatform
        });
      }
      return options;
    }, []);
  }

  private normalizePlatformValue(value?: string): string {
    const normalizedValue = String(value || '').toLowerCase().trim();
    return normalizedValue === 'oracle' ? 'oci' : normalizedValue;
  }

  private formatPlatformLabel(value: string): string {
    const labels: Record<string, string> = {
      aws: 'AWS',
      azure: 'Azure',
      gcp: 'GCP',
      oci: 'OCI',
      oracle: 'OCI'
    };
    return labels[this.normalizePlatformValue(value)] || this.formatRegionLabel(value);
  }

  private formatRegionLabel(value: string): string {
    return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, match => match.toUpperCase());
  }

  private getSelectedValues(values: string[]): string[] {
    return (values || []).filter(value => value && value !== PUBLIC_CLOUD_ALL_SELECTED_VALUE);
  }

  private getSelectedPlatforms(values: string[]): PublicCloudPlatform[] {
    return this.getSelectedValues(values).map(value => this.normalizePlatformValue(value)) as PublicCloudPlatform[];
  }

  private convertFiltersToApiParams(criteria?: PublicCloudDashboardFilterCriteria): HttpParams {
    let params: HttpParams = new HttpParams();
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
      key: item.key,
      label: item.label,
      value: this.formatNumber(summary[item.key])
    }));
  }

  convertToProviderDistributionViewData(data: PublicCloudInventorySummaryResponse): PublicCloudProviderDistributionItem[] {
    return (Object.keys(PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG) as PublicCloudProviderDistributionKey[]).map(key => {
      const config = PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG[key];
      return {
        key,
        name: config.name,
        count: this.getProviderDistributionCount(data, key),
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
        formatter: (params: any) => `${params.name}: ${params.data.count || 0} (${params.data.percentage || 0}%)`
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
            name: item.name,
            key: item.key,
            value: item.value,
            count: item.count,
            percentage: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }

  private getProviderDistributionCount(data: PublicCloudInventorySummaryResponse, key: PublicCloudProviderDistributionKey): number {
    const count = Number(data?.distribution?.[key] || 0);
    return isNaN(count) ? 0 : count;
  }

  convertToTagsViewData(data: PublicCloudInventorySummaryResponse): PublicCloudTagItem[] {
    return this.getInventoryTagEntries(data?.tags).map((tag, index) => {
      const style = this.getTagStyle(tag.label, index);
      return {
        name: tag.label,
        count: this.formatNumber(tag.count),
        textColor: style.textColor,
        backgroundColor: style.backgroundColor
      };
    });
  }

  // Inventory tags arrive as a keyed map ({ tagName: count }) from the current response, or as an
  // array ([{ label, count }]) from older responses; normalize both into label/count entries.
  private getInventoryTagEntries(tags?: PublicCloudInventoryTags): PublicCloudInventoryTagResponse[] {
    const entries: PublicCloudInventoryTagResponse[] = Array.isArray(tags)
      ? (tags || []).map(tag => ({ label: this.getFirstValue(tag?.label), count: this.getNumericValue(tag?.count) }))
      : Object.keys(tags || {}).map(key => ({ label: key, count: this.getNumericValue((tags as Record<string, string | number>)[key]) }));
    return entries.filter(entry => !!entry.label);
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

  /*
   * ******End ****** Executive Summary / Cloud Inventory Widget Related ********************
   */

  /*
   * -----Start----- Geo Distribution Widget Related -------------------
   */
  getGeoDistribution(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudGeoCell[]> {
    return this.http.get(PUBLIC_CLOUD_GEO_DISTRIBUTION_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    }).pipe(map(res => this.getGeoDistributionCells(res)));
  }

  convertToGeoHeatmapOptions(data: PublicCloudGeoCell[]): EChartsOption {
    return (data || []).length ? this.getGeoHeatmapOptions(data) : {};
  }

  private getGeoHeatmapOptions(cells: PublicCloudGeoCell[]): EChartsOption {
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
  private getGeoDistributionTooltip(cell: PublicCloudGeoCell): string {
    if (!cell) {
      return '';
    }
    const severityColors = PUBLIC_CLOUD_GEO_ALERT_SEVERITY_COLORS;
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

  private getGeoDistributionCells(response: any): PublicCloudGeoCell[] {
    const payload = this.getGeoDistributionPayload(response);
    const items = this.getGeoDistributionItems(payload).slice(0, 12);
    if (!items.length) {
      return [];
    }

    const layout = this.getTreemapCells(items.map(item => item.totalResources), { x: 0, y: 0, width: 100, height: 100 });
    return items.map((item, index) => ({
      name: item.name,
      color: PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS[index % PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS.length],
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

  private getGeoDistributionPayload(response: any): any {
    const containerKeys = ['groups', 'heatmap', 'geo_distribution', 'geo_heatmap', 'locations', 'results', 'items', 'rows', 'data'];
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const matchedKey = containerKeys.find(key => response[key] !== undefined && response[key] !== null);
      if (matchedKey) {
        return response[matchedKey];
      }
    }
    return response;
  }

  private getGeoDistributionItems(payload: any): Array<{ name: string; totalResources: number; totalAlerts: number; critical: number; warning: number; information: number; computeCount: number; platformServices: number; otherServices: number }> {
    const source = Array.isArray(payload) ? payload : Object.keys(payload || {}).map(key => ({
      name: key,
      ...(payload[key] || {})
    }));

    return source
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const name = String(item.name || item.location || item.datacenter || item.region || item.city || 'Unknown');
        const critical = this.getNumberFromPayload(item, ['critical_alerts', 'criticalAlerts', 'critical']);
        const warning = this.getNumberFromPayload(item, ['warning_alerts', 'warningAlerts', 'warning', 'warnings']);
        const information = this.getNumberFromPayload(item, ['information_alerts', 'informationAlerts', 'information', 'info', 'informative']);
        const totalAlerts = this.getNumberFromPayload(item, ['total_alerts', 'totalAlerts'], critical + warning + information);
        const computeCount = this.getNumberFromPayload(item, ['compute_count', 'computeCount', 'compute']);
        const platformServices = this.getNumberFromPayload(item, ['platform_services', 'platformServices', 'platform']);
        const otherServices = this.getNumberFromPayload(item, ['other_services', 'otherServices', 'other']);
        const totalResources = this.getNumberFromPayload(item, ['total_resources', 'totalResources', 'total', 'count'], computeCount + platformServices + otherServices);

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
   * ******End ****** Geo Distribution Widget Related ********************
   */

  /*
   * -----Start----- Public Cloud Infrastructure Coverage Widget Related -------------------
   */
  getPublicCloudCoverage(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudCoverageGroup[]> {
    return this.http.get(PUBLIC_CLOUD_INFRA_COVERAGE_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    }).pipe(map(res => this.getCoverageGroups(res)));
  }

  convertToCoverageGroupsViewData(data: PublicCloudCoverageGroup[]): PublicCloudCoverageGroup[] {
    return data || [];
  }

  getCoverageGroupsResourceTotal(groups: PublicCloudCoverageGroup[]): string {
    const total = (groups || []).reduce((sum, group) => sum + this.getNumberValue(group.totalLabel), 0);
    return this.formatNumber(total);
  }

  private getCoverageGroups(response: any): PublicCloudCoverageGroup[] {
    const containers = [response, response?.data, response?.result, response?.results]
      .filter(container => container && typeof container === 'object' && !Array.isArray(container));
    const container = containers.find(item => {
      const normalized = this.getNormalizedPayload(item);
      return PUBLIC_CLOUD_COVERAGE_GROUP_ORDER.some(key => normalized[this.normalizeKey(key)] !== undefined);
    }) || response;
    if (!container || typeof container !== 'object') {
      return [];
    }
    // Group keys arrive title-cased/spaced ("Platform Services"); match them via normalized keys.
    const normalizedContainer = this.getNormalizedPayload(container);
    return PUBLIC_CLOUD_COVERAGE_GROUP_ORDER
      .map(groupKey => this.getCoverageGroupFromPayload(groupKey, normalizedContainer[this.normalizeKey(groupKey)]))
      .filter((group): group is PublicCloudCoverageGroup => !!group && group.cards.length > 0);
  }

  private getCoverageGroupFromPayload(groupKey: string, groupPayload: any): PublicCloudCoverageGroup | null {
    if (!groupPayload || typeof groupPayload !== 'object' || Array.isArray(groupPayload)) {
      return null;
    }
    // Providers ("AWS", "Azure", ...) sit directly on the group; match them via normalized keys.
    const providersPayload = groupPayload.providers || groupPayload.clouds || groupPayload;
    const normalizedProviders = this.getNormalizedPayload(providersPayload);
    const cards = PUBLIC_CLOUD_COVERAGE_PROVIDER_ORDER
      .map(providerKey => this.getCoverageProviderCard(providerKey, normalizedProviders[this.normalizeKey(providerKey)]))
      .filter((card): card is PublicCloudCoverageCard => !!card);
    if (!cards.length) {
      return null;
    }

    const cardTotal = cards.reduce((sum, card) => sum + this.getNumberValue(card.totalResources), 0);
    const total = this.getNumberFromPayload(groupPayload, ['total_resources', 'totalResources', 'total', 'count'], cardTotal);
    return {
      key: groupKey,
      title: PUBLIC_CLOUD_COVERAGE_GROUP_LABELS[groupKey] || groupPayload.name || this.getReadableCoverageLabel(groupKey),
      totalLabel: this.formatNumber(total),
      cards,
      showChart: cards.length === 1
    };
  }

  private getCoverageProviderCard(providerKey: string, providerPayload: any): PublicCloudCoverageCard | null {
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
      title: PUBLIC_CLOUD_COVERAGE_PROVIDER_LABELS[providerKey] || this.getReadableCoverageLabel(providerKey),
      logo: this.getCoverageProviderLogo(providerKey),
      rows,
      totalResources: this.formatNumber(total),
      chartOptions: this.getCoverageChartOptions(rows)
    };
  }

  // Each provider exposes a `resources` array; every entry is a resource type carrying its own count
  // and icon_path. Entries are grouped by display name (the API repeats a name across
  // resource_type_ids), summing counts and keeping the first available icon.
  private getCoverageServiceRows(providerKey: string, resources: any): PublicCloudCoverageRow[] {
    if (!Array.isArray(resources)) {
      return [];
    }
    const grouped = resources.reduce((groups: Record<string, { label: string; count: number; iconPath: string }>, entry) => {
      if (!entry || typeof entry !== 'object') {
        return groups;
      }
      const label = this.getReadableCoverageLabel(this.getFirstValue(entry.name, entry.service));
      const count = this.getNumberFromPayload(entry, ['count', 'value', 'resource_count', 'resourceCount', 'total']);
      if (!label || count <= 0) {
        return groups;
      }
      const iconPath = this.getCoverageServiceIconPath(providerKey, this.getFirstStringValue(entry, ['icon_path', 'iconPath']));
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
        const row: PublicCloudCoverageRow = { label: group.label, value: this.formatNumber(group.count) };
        if (group.iconPath) {
          row.iconPath = group.iconPath;
        }
        return row;
      });
  }

  // Mirrors how the public cloud summary pages build service icons from the API icon_path.
  private getCoverageServiceIconPath(providerKey: string, iconPath: string): string {
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

  private getCoverageProviderLogo(providerKey: string): string {
    const logo = PUBLIC_CLOUD_COVERAGE_PROVIDER_LOGOS[providerKey];
    return logo ? `${environment.assetsUrl}external-brand/${logo}` : '';
  }

  private getCoverageChartOptions(rows: Array<{ label: string; value: string }>): EChartsOption {
    const data = (rows || [])
      .map((row, index) => ({
        name: row.label,
        value: this.getNumberValue(row.value),
        itemStyle: { color: PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS[index % PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS.length] }
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

  private getNumberValue(value: any, fallback = 0): number {
    const normalizedValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
    const numericValue = Number(normalizedValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }
    const displayNumericValue = typeof value === 'string' ? Number(value.replace(/[^0-9.-]/g, '')) : NaN;
    return isNaN(displayNumericValue) ? fallback : displayNumericValue;
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
  /*
   * ******End ****** Public Cloud Infrastructure Coverage Widget Related ********************
   */

  /*
   * -----Start----- Performance Hotspots Widget Related -------------------
   */
  getPerformanceHotspots(criteria: PublicCloudDashboardFilterCriteria | undefined, sort: string): Observable<PublicCloudPerformanceHotspotRow[]> {
    const params = this.convertFiltersToApiParams(criteria).set('sort', sort);
    return this.http.get<PublicCloudPerformanceHotspotsResponse>(PUBLIC_CLOUD_PERFORMANCE_HOTSPOTS_ENDPOINT, { params })
      .pipe(map(res => this.convertToPerformanceHotspotRows(res)));
  }

  convertToPerformanceHotspotRows(data: PublicCloudPerformanceHotspotsResponse): PublicCloudPerformanceHotspotRow[] {
    const rows = data?.data || data?.results || data?.items || [];
    return (rows || []).map(item => {
      const cloud = this.getFirstValue(item.cloud, item.provider, item.cloud_type);
      const cpu = this.getFirstNumericValue(item.cpu_utilization_percent, item.cpu_utilization, item.cpu_vcpus);
      const memory = this.getFirstNumericValue(item.available_memory, item.available_memory_gb);
      return {
        instanceName: this.getFirstValue(item.name, item.instance_name, item.instanceName),
        cloud,
        cloudLogo: this.getHotspotCloudLogo(this.getFirstValue(item.cloud_key, cloud)),
        cpuLabel: cpu === null ? 'NA' : `${this.formatNumber(cpu)}%`,
        memoryLabel: memory === null ? 'NA' : `${this.formatNumber(memory)} GB`,
        disk: this.convertToHotspotDisk(item.disk_utilization || item.disk_size),
        dataDiskBytes: this.getHotspotReadWrite(item.data_disk_read_write_bytes?.read, item.data_disk_read_write_bytes?.write, 'Read: ', 'Write: ', ''),
        dataDiskRates: this.getHotspotReadWrite(item.data_disk_read_write_rates?.read_ops, item.data_disk_read_write_rates?.write_ops, 'Read Ops: ', 'Write Ops: ', ' /s'),
        networkTraffic: this.getFirstValue(item.avg_network_traffic, item.network_traffic)
      };
    }).filter(row => !!row.instanceName);
  }

  private convertToHotspotDisk(disk?: { capacity?: string | number; used?: string | number; free?: string | number }): PublicCloudPerformanceHotspotDisk | null {
    if (!disk || typeof disk !== 'object') {
      return null;
    }
    const capacity = this.getFirstValue(disk.capacity);
    const used = this.getFirstValue(disk.used);
    const freeValue = this.getFirstNumericValue(disk.free);
    if (!capacity && !used && freeValue === null) {
      return null;
    }
    const free = freeValue === null ? 0 : Math.max(Math.min(freeValue, 100), 0);
    const usedPercent = Math.max(Math.min(100 - free, 100), 0);
    return {
      capacityLabel: capacity,
      usedLabel: used,
      freeLabel: `${this.formatNumber(free)}%`,
      usedPercent,
      tone: this.getHotspotDiskTone(usedPercent)
    };
  }

  private getHotspotReadWrite(read: string | number | undefined, write: string | number | undefined, readPrefix: string, writePrefix: string, suffix: string): PublicCloudPerformanceHotspotReadWrite | null {
    const readValue = this.getFirstValue(read);
    const writeValue = this.getFirstValue(write);
    if (!readValue && !writeValue) {
      return null;
    }
    return {
      readLabel: readValue ? `${readPrefix}${this.formatHotspotMetric(readValue)}${suffix}` : '',
      writeLabel: writeValue ? `${writePrefix}${this.formatHotspotMetric(writeValue)}${suffix}` : ''
    };
  }

  // Thousands-separate bare numbers (e.g. ops counts); leave values that already carry units as-is.
  private formatHotspotMetric(value: string | number): string {
    const numericValue = this.getFirstNumericValue(value);
    return numericValue !== null && !/[a-z%/]/i.test(String(value)) ? this.formatNumber(numericValue) : this.getFirstValue(value);
  }

  private getHotspotCloudLogo(cloud: string): string {
    const logo = PUBLIC_CLOUD_HOTSPOT_PROVIDER_LOGOS[this.normalizePlatformValue(cloud)];
    return logo ? `${environment.assetsUrl}external-brand/${logo}` : '';
  }

  private getHotspotDiskTone(usedPercent: number): PublicCloudStatusTone {
    if (usedPercent <= 50) {
      return 'success';
    }
    return usedPercent <= 80 ? 'warning' : 'danger';
  }
  /*
   * ******End ****** Performance Hotspots Widget Related ********************
   */

  /*
   * -----Start----- Cloud Database Performance Widget Related -------------------
   */
  getDatabaseHealthScore(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseHealthScoreResponse> {
    return this.http.get<PublicCloudDatabaseHealthScoreResponse>(PUBLIC_CLOUD_DATABASE_HEALTH_SCORE_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getActiveDatabaseWorkload(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseWidgetResponse> {
    return this.http.get<PublicCloudDatabaseWidgetResponse>(PUBLIC_CLOUD_ACTIVE_DATABASE_WORKLOAD_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getDatabaseLatencyOverview(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseWidgetResponse> {
    return this.http.get<PublicCloudDatabaseWidgetResponse>(PUBLIC_CLOUD_DATABASE_LATENCY_OVERVIEW_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getTopLockContention(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudLockContentionResponse> {
    return this.http.get<PublicCloudLockContentionResponse>(PUBLIC_CLOUD_TOP_LOCK_CONTENTION_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getTopMemoryConsumers(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseWidgetResponse> {
    return this.http.get<PublicCloudDatabaseWidgetResponse>(PUBLIC_CLOUD_TOP_MEMORY_CONSUMERS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getTopStorageConsumers(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseWidgetResponse> {
    return this.http.get<PublicCloudDatabaseWidgetResponse>(PUBLIC_CLOUD_TOP_STORAGE_CONSUMERS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToDatabaseHealthScoreViewData(data: PublicCloudDatabaseHealthScoreResponse): PublicCloudDatabaseHealthScoreViewData {
    const source = this.getObjectResponseData(data) as PublicCloudDatabaseHealthScoreResponse;
    const healthPie = source?.health_pie || source?.healthPie;
    const scoreValue = this.getFirstNumericValue(healthPie?.health_score, healthPie?.healthScore, healthPie?.score,
      source?.score, source?.health_score, source?.healthScore, source?.value);
    const maxValue = this.getFirstNumericValue(healthPie?.max, healthPie?.total, source?.max, source?.total) || 100;
    const metrics = this.getDatabaseHealthMetricRows(data).map(item => this.convertToDatabaseHealthMetric(item));
    const hasScore = scoreValue !== null;
    const score = hasScore ? Math.max(Math.min(scoreValue, maxValue), 0) : 0;
    const scorePercent = maxValue ? Math.max(Math.min((score / maxValue) * 100, 100), 0) : 0;
    return {
      score,
      scoreLabel: hasScore ? `${this.formatNumber(score)}/${this.formatNumber(maxValue)}` : '',
      scoreGradient: `conic-gradient(#14bd75 0 ${scorePercent}%, #cfeedd ${scorePercent}% 100%)`,
      metrics,
      hasData: hasScore || !!metrics.length
    };
  }

  convertToActiveDatabaseWorkloadViewData(data: PublicCloudDatabaseWidgetResponse): PublicCloudActiveDatabaseWorkloadViewData {
    const source = this.getObjectResponseData(data) as PublicCloudDatabaseWidgetResponse;
    const rows = this.getDatabaseBarRows(data, ['workloads', 'databases', 'results', 'items', 'rows']).map((item, index) => {
      const value = this.getDatabaseItemValue(item, ['transactions_per_sec', 'transactions', 'value', 'count', 'total']);
      const rowValue = value === null ? -1 : value;
      return {
        label: this.getDatabaseItemLabel(item),
        value: rowValue,
        color: this.getDatabaseItemColor(item, index),
        displayValue: this.formatNumber(rowValue)
      };
    }).filter(item => item.label && item.value >= 0);

    const totalRawValue = this.getFirstValue(source?.summary?.value, source?.summary?.total, source?.total, source?.value);
    const total = this.getFirstNumericValue(source?.summary?.value, source?.summary?.total, source?.total, source?.value);
    return {
      totalLabel: totalRawValue && /[a-z]/i.test(totalRawValue) ? totalRawValue : total !== null ? this.formatCompactNumber(total) : '',
      unit: source?.summary?.unit || source?.unit || 'transactions/sec',
      rows
    };
  }

  convertToActiveDatabaseWorkloadOptions(rows: PublicCloudDatabaseBarItem[]): EChartsOption {
    return this.getDatabaseHorizontalBarOptions(rows, 100, false);
  }

  convertToDatabaseLatencyRows(data: PublicCloudDatabaseWidgetResponse): PublicCloudDatabaseBarItem[] {
    return this.getDatabaseBarRows(data, ['latency', 'databases', 'results', 'items', 'rows']).map((item, index) => {
      const value = this.getDatabaseItemValue(item, ['latency_ms', 'avg_latency', 'latency', 'value', 'percent', 'percentage']);
      const rowValue = value === null ? -1 : value;
      return {
        label: this.getDatabaseItemLabel(item),
        value: rowValue,
        color: this.getLatencyColor(item, index)
      };
    }).filter(item => item.label && item.value >= 0);
  }

  convertToDatabaseLatencyOptions(rows: PublicCloudDatabaseBarItem[]): EChartsOption {
    return this.getDatabaseHorizontalBarOptions(rows, 100, true);
  }

  convertToTopLockContentionRows(data: PublicCloudLockContentionResponse): PublicCloudLockContentionRow[] {
    return this.getLockContentionRows(data).map(item => {
      const cloud = this.getFirstValue(item.cloud, item.provider, item.platform);
      return {
        database: this.getFirstValue(item.database, item.database_name, item.databaseName, item.name),
        locks: this.formatNumber(this.getFirstNumericValue(item.locks, item.lock_count, item.lockCount) || 0),
        type: this.getFirstValue(item.type, item.lock_type, item.lockType),
        wait: this.formatDatabaseWaitValue(this.getFirstValue(item.wait, item.wait_time, item.waitTime)),
        cloud,
        cloudClass: `database-cloud-${this.normalizeCssClass(cloud)}`
      };
    }).filter(row => !!row.database);
  }

  convertToTopMemoryConsumersRows(data: PublicCloudDatabaseWidgetResponse): PublicCloudDatabaseConsumerRow[] {
    return this.getDatabaseMemoryConsumerRows(data).map((item, index) => {
      const value = this.getDatabaseItemValue(item, ['memory_gb', 'memory', 'used', 'value', 'count', 'total']);
      const rowValue = value === null ? -1 : value;
      return {
        name: this.getDatabaseItemLabel(item),
        value: rowValue,
        displayValue: `${this.formatNumber(rowValue)} GB`,
        percent: 0,
        color: this.getDatabaseItemColor(item, index)
      };
    }).filter(item => item.name && item.value >= 0).slice(0, 10);
  }

  convertToTopStorageConsumersRows(data: PublicCloudDatabaseWidgetResponse): PublicCloudDatabaseConsumerRow[] {
    return this.getDatabaseBarRows(data, ['consumers', 'databases', 'results', 'items', 'rows']).map((item, index) => {
      const value = this.getDatabaseItemValue(item, ['used_tb', 'used', 'storage', 'value', 'count']);
      const rowValue = value === null ? -1 : value;
      const total = this.getFirstNumericValue(item.total_tb, item.capacity, item.total);
      const percent = this.getDatabaseItemPercent(item, rowValue, total || 0);
      return {
        name: this.getDatabaseItemLabel(item),
        value: rowValue,
        displayValue: `${this.formatDecimalNumber(rowValue)} TB`,
        totalValue: total || undefined,
        totalLabel: total ? `${this.formatDecimalNumber(total)}T` : '',
        percent,
        color: this.getStorageConsumerColor(item, index)
      };
    }).filter(item => item.name && item.value >= 0).slice(0, 10);
  }

  private convertToDatabaseHealthMetric(item: PublicCloudDatabaseMetricItem): PublicCloudDatabaseHealthMetric {
    const label = this.formatDatabaseLabel(this.getFirstValue(item.label, item.name, item.metric, item.category));
    const value = this.getFirstNumericValue(item.current, item.value, item.score, item.count) || 0;
    const total = this.getFirstNumericValue(item.total, item.max, item.target, item.threshold) || 100;
    const percent = this.getDatabaseItemPercent(item, value, total);
    return {
      label,
      value: this.formatNumber(value),
      total: this.formatNumber(total),
      percent,
      color: item.color || this.getHealthMetricColor(label)
    };
  }

  private getDatabaseHealthMetricRows(data: PublicCloudDatabaseHealthScoreResponse): PublicCloudDatabaseMetricItem[] {
    const source = this.getObjectResponseData(data) as PublicCloudDatabaseHealthScoreResponse;
    const metricSource = source?.metrics || source?.results || source?.items || source?.data;
    const keyedMetricRows = this.convertDatabaseMetricRecordToItems(metricSource);
    if (keyedMetricRows.length) {
      return keyedMetricRows;
    }
    const rows = this.getDatabaseRowsFromValue(metricSource, []);
    if (rows.length) {
      return rows as PublicCloudDatabaseMetricItem[];
    }
    return this.convertDatabaseMetricRecordToItems(source);
  }

  private convertDatabaseMetricRecordToItems(data: any): PublicCloudDatabaseMetricItem[] {
    const record = data as unknown as Record<string, string | number | PublicCloudDatabaseMetricItem>;
    return ['latency', 'locks', 'memory', 'storage'].reduce((items: PublicCloudDatabaseMetricItem[], key) => {
      const recordKey = Object.keys(record || {}).find(item => item.toLowerCase() === key);
      const value = recordKey ? record?.[recordKey] : undefined;
      if (value !== undefined && value !== null && value !== '') {
        const itemValue: PublicCloudDatabaseMetricItem = typeof value === 'object' ? value as PublicCloudDatabaseMetricItem : { value };
        items.push({
          ...itemValue,
          label: itemValue.label || itemValue.name || itemValue.metric || itemValue.category || recordKey || key
        });
      }
      return items;
    }, []);
  }

  private getDatabaseBarRows(data: PublicCloudDatabaseWidgetResponse, keys: string[]): PublicCloudDatabaseBarResponseItem[] {
    const source = this.getObjectResponseData(data);
    const rows = this.getDatabaseRowsFromValue(source, keys) as PublicCloudDatabaseBarResponseItem[];
    return rows.length ? rows : this.convertDatabaseRecordToBarItems(source);
  }

  private getLockContentionRows(data: PublicCloudLockContentionResponse): PublicCloudLockContentionResponseItem[] {
    const source = this.getObjectResponseData(data);
    return this.getDatabaseRowsFromValue(source, ['results', 'items', 'rows']) as PublicCloudLockContentionResponseItem[];
  }

  private getDatabaseMemoryConsumerRows(data: PublicCloudDatabaseWidgetResponse): PublicCloudDatabaseBarResponseItem[] {
    const rows = this.getDatabaseBarRows(data, ['consumers', 'databases', 'results', 'items', 'rows']);
    if (rows.length === 1 && !this.getDatabaseItemLabel(rows[0]) &&
      this.getDatabaseItemValue(rows[0], ['memory_gb', 'memory', 'used', 'value', 'count', 'total']) === null) {
      return this.convertDatabaseRecordToBarItems(rows[0]);
    }
    return rows;
  }

  private getObjectResponseData(data: any): any {
    if (data?.data && !Array.isArray(data.data) && typeof data.data === 'object') {
      return data.data;
    }
    return data;
  }

  private getDatabaseRowsFromValue(value: any, keys: string[]): any[] {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    const record = value as Record<string, any>;
    const containerKeys = [...keys, 'data', 'results', 'items', 'rows'];
    for (const key of containerKeys) {
      const rows = this.getDatabaseRowsFromValue(record[key], []);
      if (rows.length) {
        return rows;
      }
    }
    return [];
  }

  private convertDatabaseRecordToBarItems(data: any): PublicCloudDatabaseBarResponseItem[] {
    const record = data as Record<string, any>;
    return Object.keys(record || {}).reduce((items: PublicCloudDatabaseBarResponseItem[], key) => {
      if (['total', 'value', 'unit', 'data', 'results', 'items', 'rows'].includes(key)) {
        return items;
      }
      const value = record[key];
      if (value !== undefined && value !== null && value !== '' && typeof value !== 'object') {
        items.push({
          name: key,
          value
        });
      }
      return items;
    }, []);
  }

  private getDatabaseItemLabel(item: PublicCloudDatabaseBarResponseItem): string {
    return this.getFirstValue(item.name, item.label, item.database, item.database_name, item.databaseName, item.service, item.cloud, item.provider);
  }

  private getDatabaseItemValue(item: PublicCloudDatabaseBarResponseItem, keys: string[]): number | null {
    const record = item as unknown as Record<string, string | number>;
    const value = keys.map(key => record[key]).find(itemValue => itemValue !== undefined && itemValue !== null && itemValue !== '');
    return value === undefined || value === null || value === '' ? null : this.getFirstNumericValue(value);
  }

  private getDatabaseItemPercent(item: PublicCloudDatabaseMetricItem | PublicCloudDatabaseBarResponseItem, value: number, total: number): number {
    const percent = this.getFirstNumericValue(item.percent, item.percentage);
    if (percent !== null) {
      return Math.max(Math.min(percent, 100), 0);
    }
    return total ? Math.max(Math.min(Math.round((value / total) * 100), 100), 0) : Math.max(Math.min(value, 100), 0);
  }

  private getDatabaseItemColor(item: PublicCloudDatabaseBarResponseItem, index: number): string {
    return item.color || PUBLIC_CLOUD_DATABASE_WIDGET_COLORS[index % PUBLIC_CLOUD_DATABASE_WIDGET_COLORS.length];
  }

  private getLatencyColor(item: PublicCloudDatabaseBarResponseItem, index: number): string {
    const key = this.getFirstValue(item.tone, item.status, item.bucket).toLowerCase();
    const designColors = ['#5fa2dd', '#e99a5c', '#43c78c', '#c65355', '#bd8752'];
    return PUBLIC_CLOUD_DATABASE_LATENCY_COLORS[key] || item.color || designColors[index % designColors.length];
  }

  private getStorageConsumerColor(item: PublicCloudDatabaseBarResponseItem, index: number): string {
    const designColors = ['#87d3aa', '#ff9f32', '#f68d93', '#f7dda7', '#43c78c', '#f68d93', '#f7dda7', '#ff9f32', '#ff9f32', '#43c78c'];
    return item.color || designColors[index % designColors.length];
  }

  private formatDatabaseWaitValue(value: string): string {
    if (!value) {
      return '';
    }
    return /[a-z]/i.test(value) ? value : `${value}s`;
  }

  private getHealthMetricColor(label: string): string {
    const key = String(label || '').toLowerCase();
    const metricKey = Object.keys(PUBLIC_CLOUD_DATABASE_HEALTH_METRIC_COLORS).find(item => key.includes(item));
    return metricKey ? PUBLIC_CLOUD_DATABASE_HEALTH_METRIC_COLORS[metricKey] : '#13bd77';
  }

  private getDatabaseHorizontalBarOptions(rows: PublicCloudDatabaseBarItem[], maxValue: number, showTopAxis: boolean): EChartsOption {
    return {
      grid: {
        left: showTopAxis ? 110 : 116,
        right: showTopAxis ? 18 : 12,
        top: showTopAxis ? 28 : 8,
        bottom: 4
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value}`
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: maxValue,
        position: 'top',
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: showTopAxis,
          color: '#555555',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: (rows || []).map(item => item.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#555555',
          fontSize: 12
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: showTopAxis ? 40 : 34,
          barCategoryGap: showTopAxis ? '28%' : '24%',
          data: (rows || []).map(item => ({
            value: item.value,
            name: item.label,
            itemStyle: { color: item.color }
          })),
          label: {
            show: !showTopAxis,
            position: 'insideRight',
            color: '#1f2933',
            fontSize: 13,
            formatter: '{c}'
          }
        }
      ]
    };
  }

  private getFirstNumericValue(...values: Array<string | number | undefined | null>): number | null {
    const value = values.find(item => item !== undefined && item !== null && item !== '');
    if (value === undefined || value === null || value === '') {
      return null;
    }
    if (!/[0-9]/.test(String(value))) {
      return null;
    }
    const numericValue = this.getNumericValue(value);
    return isNaN(numericValue) ? null : numericValue;
  }

  private formatCompactNumber(value: number): string {
    if (value >= 1000) {
      return `${Number((value / 1000).toFixed(1))}k`;
    }
    return this.formatNumber(value);
  }

  private formatDecimalNumber(value: number): string {
    return Number(value || 0).toLocaleString('en-US', {
      maximumFractionDigits: 2
    });
  }

  private formatDatabaseLabel(value: string): string {
    return this.formatRegionLabel(value || '');
  }

  private normalizeCssClass(value: string): string {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  /*
   * ******End ****** Cloud Database Performance Widget Related ********************
   */

  /*
   * -----Start----- Cloud Storage Health Widget Related -------------------
   */
  getCloudStorageHealth(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageHealthResponse> {
    return this.http.get<PublicCloudStorageHealthResponse>(PUBLIC_CLOUD_STORAGE_HEALTH_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getStorageUtilizationByCloud(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageKeyedNumberResponse> {
    return this.http.get<PublicCloudStorageKeyedNumberResponse>(PUBLIC_CLOUD_STORAGE_UTILIZATION_BY_CLOUD_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getReadVsWriteTraffic(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageTrafficResponse> {
    return this.http.get<PublicCloudStorageTrafficResponse>(PUBLIC_CLOUD_READ_VS_WRITE_TRAFFIC_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getCloudStorageTopConsumers(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseWidgetResponse> {
    return this.http.get<PublicCloudDatabaseWidgetResponse>(PUBLIC_CLOUD_TOP_STORAGE_CONSUMERS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getTransactionVolumeTrend(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageTrendResponse> {
    return this.http.get<PublicCloudStorageTrendResponse>(PUBLIC_CLOUD_TRANSACTION_VOLUME_TREND_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getObjectFileGrowthTrend(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageTrendResponse> {
    return this.http.get<PublicCloudStorageTrendResponse>(PUBLIC_CLOUD_OBJECT_FILE_GROWTH_TREND_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getStorageServicesVisibility(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageServicesVisibilityResponse> {
    return this.http.get<PublicCloudStorageServicesVisibilityResponse>(PUBLIC_CLOUD_STORAGE_SERVICES_VISIBILITY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getCloudStorageDistribution(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageKeyedNumberResponse> {
    return this.http.get<PublicCloudStorageKeyedNumberResponse>(PUBLIC_CLOUD_STORAGE_DISTRIBUTION_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getLatencyHeatmap(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudLatencyHeatmapResponse> {
    return this.http.get<PublicCloudLatencyHeatmapResponse>(PUBLIC_CLOUD_LATENCY_HEATMAP_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToLatencyHeatmapRows(data: PublicCloudLatencyHeatmapResponse): PublicCloudLatencyHeatmapRow[] {
    const source = this.getObjectResponseData(data) as PublicCloudLatencyHeatmapResponse;
    return Object.keys(source || {}).reduce((rows: PublicCloudLatencyHeatmapRow[], account) => {
      const entries = Array.isArray(source[account]) ? source[account] : [];
      const cells = entries.map(entry => {
        const value = this.getNumericValue(entry?.value);
        return {
          value,
          tone: this.getLatencyHeatmapTone(value),
          color: this.getLatencyHeatmapColor(value)
        };
      });
      if (cells.length) {
        rows.push({ account, cells });
      }
      return rows;
    }, []);
  }

  private getLatencyHeatmapTone(value: number): string {
    if (value < 20) {
      return 'low';
    }
    return value > 80 ? 'high' : 'medium';
  }

  private getLatencyHeatmapColor(value: number): string {
    return PUBLIC_CLOUD_LATENCY_HEATMAP_COLORS[this.getLatencyHeatmapTone(value)];
  }

  getQueueBacklogMonitor(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudQueueBacklogResponse> {
    return this.http.get<PublicCloudQueueBacklogResponse>(PUBLIC_CLOUD_QUEUE_BACKLOG_MONITOR_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToQueueBacklogRows(data: PublicCloudQueueBacklogResponse): PublicCloudQueueBacklogRow[] {
    const source = this.getObjectResponseData(data) as PublicCloudQueueBacklogResponse;
    return Object.keys(source || {}).reduce((rows: PublicCloudQueueBacklogRow[], name) => {
      const entry = source[name] || {};
      const percentage = this.getNumericValue(entry.percentage);
      rows.push({
        name,
        messages: this.formatNumber(this.getNumericValue(entry.messages)),
        percentage,
        tone: this.getQueueBacklogTone(percentage),
        color: this.getQueueBacklogColor(percentage)
      });
      return rows;
    }, []);
  }

  private getQueueBacklogTone(percentage: number): string {
    if (percentage >= 90) {
      return 'high';
    }
    return percentage >= 60 ? 'medium' : 'low';
  }

  private getQueueBacklogColor(percentage: number): string {
    return PUBLIC_CLOUD_QUEUE_BACKLOG_COLORS[this.getQueueBacklogTone(percentage)];
  }

  convertToCloudStorageHealthMetrics(data: PublicCloudStorageHealthResponse): PublicCloudStorageKpi[] {
    const rows = this.getDatabaseRowsFromValue(this.getObjectResponseData(data), ['results', 'items', 'rows']) as any[];
    return (rows || []).map((item): PublicCloudStorageKpi => {
      const label = this.getFirstValue(item.metric, item.label, item.name);
      const value = this.getFirstNumericValue(item.value);
      const unit = this.getFirstValue(item.unit);
      return {
        label,
        value: value !== null ? this.formatStorageValue(value, unit) : '',
        tone: label.toLowerCase().includes('availability') ? 'success' : undefined
      };
    }).filter(item => item.label && item.value);
  }

  convertToStorageUtilizationRows(data: PublicCloudStorageKeyedNumberResponse): PublicCloudStorageBarItem[] {
    return this.convertStorageKeyedNumberRows(data, PUBLIC_CLOUD_STORAGE_UTILIZATION_COLORS)
      .sort((first, second) => first.value - second.value);
  }

  convertToStorageUtilizationOptions(rows: PublicCloudStorageBarItem[]): EChartsOption {
    return this.getStorageHorizontalBarOptions(rows);
  }

  convertToReadVsWriteTrend(data: PublicCloudStorageTrafficResponse): PublicCloudStorageTrendViewData {
    const readRows = data?.read_ingress || data?.readIngress || [];
    const writeRows = data?.write_egress || data?.writeEgress || [];
    const labels = this.getStorageTrendLabels([readRows, writeRows]);
    return {
      labels,
      series: [
        {
          name: 'Read (ingress)',
          color: PUBLIC_CLOUD_STORAGE_TREND_COLORS.read,
          values: this.getStorageTrendValues(readRows)
        },
        {
          name: 'Write (egress)',
          color: PUBLIC_CLOUD_STORAGE_TREND_COLORS.write,
          values: this.getStorageTrendValues(writeRows)
        }
      ].filter(item => item.values.length)
    };
  }

  convertToReadVsWriteOptions(data: PublicCloudStorageTrendViewData): EChartsOption {
    return this.getReadVsWriteLineOptions(data);
  }

  convertToCloudStorageTopConsumersRows(data: PublicCloudDatabaseWidgetResponse): PublicCloudStorageConsumerRow[] {
    return this.getDatabaseBarRows(data, ['consumers', 'databases', 'results', 'items', 'rows']).map(item => {
      const used = this.getDatabaseItemValue(item, ['used_tb', 'used', 'storage', 'value', 'count']);
      const cloud = this.getFirstValue(item.cloud, item.provider, item.platform);
      const latency = this.getFirstValue(item.latency, item.latency_ms, item.avg_latency);
      const growth = this.getFirstValue((item as any).growth, (item as any).growth_percent, (item as any).growthPercentage);
      return {
        account: this.getDatabaseItemLabel(item),
        cloud,
        cloudClass: `database-cloud-${this.normalizeCssClass(cloud)}`,
        used: used !== null ? `${this.formatDecimalNumber(used)} TB` : '',
        tps: this.getFirstValue((item as any).tps, (item as any).transactions, (item as any).transactions_per_sec),
        latency: latency ? this.formatStorageValue(latency, /[a-z%]/i.test(latency) ? '' : 'ms') : '',
        growth,
        growthClass: this.getStorageGrowthClass(growth)
      };
    }).filter(item => !!item.account).slice(0, 10);
  }

  convertToTransactionVolumeTrend(data: PublicCloudStorageTrendResponse): PublicCloudStorageTrendViewData {
    return this.convertToStorageTrendViewData(data, ['AWS', 'Azure', 'GCP', 'OCI']);
  }

  convertToObjectFileGrowthTrend(data: PublicCloudStorageTrendResponse): PublicCloudStorageTrendViewData {
    return this.convertToStorageTrendViewData(data, ['Blob', 'File', 'Object', 'Table']);
  }

  convertToStorageTrendOptions(data: PublicCloudStorageTrendViewData): EChartsOption {
    return this.getStorageMultiLineOptions(data);
  }

  convertToStorageServicesVisibilityMetrics(data: PublicCloudStorageServicesVisibilityResponse): PublicCloudStorageKpi[] {
    const latency = data?.highest_latency_cloud || data?.highestLatencyCloud;
    const mostUtilized = data?.most_utilized || data?.mostUtilized;
    const totalCapacity = data?.total_capacity_tracked || data?.totalCapacityTracked;
    const metrics: PublicCloudStorageKpi[] = [
      {
        label: 'Active Accounts',
        value: this.formatNumber(this.getFirstNumericValue(data?.active_accounts, data?.activeAccounts) || 0)
      },
      {
        label: 'Highest Latency Cloud',
        value: this.formatStorageCloudMetric(latency?.cloud_name || latency?.cloudName, latency?.value, latency?.unit),
        tone: 'danger'
      },
      {
        label: 'Most Utilized',
        value: this.formatStorageCloudMetric(mostUtilized?.cloud_name || mostUtilized?.cloudName, mostUtilized?.value, mostUtilized?.unit),
        tone: 'warning'
      },
      {
        label: 'Total Capacity Tracked',
        value: this.formatStorageValue(totalCapacity?.value, totalCapacity?.unit)
      }
    ];
    return metrics.filter(item => !!item.value);
  }

  convertToCloudStorageDistributionRows(data: PublicCloudStorageKeyedNumberResponse): PublicCloudStorageDistributionItem[] {
    const rows = this.convertStorageKeyedNumberRows(data, []);
    const total = rows.reduce((sum, item) => sum + item.value, 0);
    return rows.map(item => ({
      label: item.label,
      value: item.value,
      percent: total ? Math.round((item.value / total) * 100) : 0,
      color: this.getStorageDistributionColor(item.label)
    })).filter(item => item.value > 0).sort((first, second) => {
      return this.getStorageDistributionOrder(first.label) - this.getStorageDistributionOrder(second.label);
    });
  }

  convertToCloudStorageDistributionOptions(rows: PublicCloudStorageDistributionItem[]): EChartsOption {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value}%`
      },
      series: [
        {
          type: 'pie',
          roseType: 'area',
          radius: ['30%', '78%'],
          center: ['50%', '48%'],
          avoidLabelOverlap: true,
          minAngle: 8,
          data: (rows || []).map(item => ({
            name: item.label,
            value: item.percent,
            itemStyle: { color: item.color }
          })),
          label: {
            formatter: '{c}%',
            color: '#566170',
            fontSize: 10
          },
          labelLine: {
            length: 18,
            length2: 14
          }
        }
      ]
    };
  }

  private convertStorageKeyedNumberRows(data: PublicCloudStorageKeyedNumberResponse, colors: string[]): PublicCloudStorageBarItem[] {
    const source = this.getObjectResponseData(data);
    const rows = this.getDatabaseRowsFromValue(source, ['results', 'items', 'rows']) as any[];
    const record = rows.length ? rows[0] : source;
    return Object.keys(record || {}).reduce((items: PublicCloudStorageBarItem[], key, index) => {
      const value = this.getFirstNumericValue(record[key]);
      if (value !== null) {
        items.push({
          label: this.formatStorageLabel(key),
          value,
          color: colors.length ? colors[index % colors.length] : this.getStorageDistributionColor(key)
        });
      }
      return items;
    }, []);
  }

  private getStorageHorizontalBarOptions(rows: PublicCloudStorageBarItem[]): EChartsOption {
    return {
      grid: {
        left: 78,
        right: 18,
        top: 6,
        bottom: 20
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value}`
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: '#e9eef3' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#7b8490',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: (rows || []).map(item => item.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6f7782',
          fontSize: 10
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 28,
          data: (rows || []).map(item => ({
            value: item.value,
            name: item.label,
            itemStyle: { color: item.color, borderRadius: [4, 4, 4, 4] }
          }))
        }
      ]
    };
  }

  private convertToStorageTrendViewData(data: PublicCloudStorageTrendResponse, order: string[]): PublicCloudStorageTrendViewData {
    const seriesRows = order
      .filter(key => Array.isArray(data?.[key]))
      .map(key => {
        const rows = data[key] || [];
        return {
          name: this.formatStorageSeriesLabel(key),
          color: this.getStorageTrendColor(key),
          values: this.getStorageTrendValues(rows)
        };
      }).filter(item => item.values.length);
    return {
      labels: this.getStorageTrendLabels(order.map(key => data?.[key]).filter(rows => Array.isArray(rows)) as any[]),
      series: seriesRows
    };
  }

  private getReadVsWriteLineOptions(data: PublicCloudStorageTrendViewData): EChartsOption {
    const readValues = data.series?.[0]?.values || [];
    const writeValues = data.series?.[1]?.values || [];
    return {
      legend: {
        top: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#555555', fontSize: 12 }
      },
      grid: {
        left: 44,
        right: 42,
        top: 32,
        bottom: 28
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.labels,
        axisLine: { lineStyle: { color: '#9aa6b2' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#6f7782',
          fontSize: 11,
          interval: this.getStorageAxisLabelInterval(data.labels)
        }
      },
      yAxis: [
        this.getStorageTrafficAxis('Read', 0, readValues),
        this.getStorageTrafficAxis('Write', 1, writeValues)
      ],
      series: (data.series || []).map((item, index) => ({
        name: item.name,
        type: 'line',
        yAxisIndex: index === 1 ? 1 : 0,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: item.color, type: index === 1 ? 'dashed' : 'solid' },
        itemStyle: { color: item.color },
        areaStyle: index === 0 ? { color: 'rgba(47, 115, 196, 0.08)' } : undefined,
        data: item.values
      }))
    };
  }

  private getStorageMultiLineOptions(data: PublicCloudStorageTrendViewData): EChartsOption {
    return {
      legend: {
        top: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#555555', fontSize: 12 }
      },
      grid: {
        left: 38,
        right: 14,
        top: 38,
        bottom: 26
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.labels,
        axisLine: { lineStyle: { color: '#9aa6b2' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#6f7782',
          fontSize: 11,
          interval: this.getStorageAxisLabelInterval(data.labels)
        }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#e4e9ef' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#6f7782', fontSize: 11 }
      },
      series: (data.series || []).map(item => ({
        name: item.name,
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2, color: item.color },
        itemStyle: { color: item.color },
        data: item.values
      }))
    };
  }

  private getStorageTrafficAxis(name: string, index: number, values: number[]): any {
    const bounds = this.getStorageAxisBounds(values);
    return {
      type: 'value',
      name,
      nameLocation: 'middle',
      nameGap: 32,
      min: bounds.min,
      max: bounds.max,
      interval: bounds.interval,
      position: index === 1 ? 'right' : 'left',
      splitLine: index === 0 ? { lineStyle: { color: '#e4e9ef' } } : { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#6f7782',
        fontSize: 11,
        formatter: (value: number) => `${value}G`
      },
      nameTextStyle: {
        color: index === 1 ? PUBLIC_CLOUD_STORAGE_TREND_COLORS.write : PUBLIC_CLOUD_STORAGE_TREND_COLORS.read,
        fontWeight: 600
      }
    };
  }

  private getStorageAxisLabelInterval(labels: string[]): number {
    return (labels || []).length > 8 ? 1 : 0;
  }

  private getStorageAxisBounds(values: number[]): { min: number; max: number; interval: number } {
    if (!values.length) {
      return { min: 0, max: 100, interval: 20 };
    }
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const min = minValue >= 40 ? Math.floor(minValue / 10) * 10 : 0;
    const max = Math.ceil((maxValue + 5) / 10) * 10;
    return {
      min,
      max: max <= min ? min + 10 : max,
      interval: max - min <= 70 ? 10 : 20
    };
  }

  private getStorageTrendLabels(seriesRows: PublicCloudStorageSeriesPoint[][]): string[] {
    const longest = (seriesRows || []).reduce((result, rows) => rows.length > result.length ? rows : result, [] as PublicCloudStorageSeriesPoint[]);
    const hasApiLabels = longest.some(item => !!item?.time);
    return longest.map((item, index) => hasApiLabels && item?.time ? item.time : `T-${longest.length - index}`);
  }

  private getStorageTrendValues(rows: PublicCloudStorageSeriesPoint[]): number[] {
    return (rows || []).map(item => this.getFirstNumericValue(item?.value)).filter((item): item is number => item !== null);
  }

  private formatStorageValue(value: string | number | undefined | null, unit?: string): string {
    const numericValue = this.getFirstNumericValue(value);
    const formattedValue = numericValue !== null ? this.formatDecimalNumber(numericValue) : this.getFirstValue(value);
    const separator = ['PB', 'TB', 'GB', 'MB'].includes(unit || '') ? ' ' : '';
    return unit ? `${formattedValue}${separator}${unit}` : formattedValue;
  }

  private formatStorageCloudMetric(name: string | undefined, value: string | number | undefined, unit?: string): string {
    const cloudName = this.formatStorageSeriesLabel(name);
    const metricValue = this.formatStorageValue(value, unit);
    return cloudName && metricValue ? `${cloudName} - ${metricValue}` : cloudName || metricValue;
  }

  private formatStorageLabel(value: string | undefined): string {
    return String(value || '').replace(/_/g, ' ');
  }

  private formatStorageSeriesLabel(value: string | undefined): string {
    const label = this.formatStorageLabel(value);
    return label.toLowerCase() === 'oci' ? 'Oracle' : label;
  }

  private getStorageTrendColor(value: string): string {
    return PUBLIC_CLOUD_STORAGE_TREND_COLORS[String(value || '').toLowerCase()] || '#5a7ed8';
  }

  private getStorageDistributionColor(label: string): string {
    return PUBLIC_CLOUD_STORAGE_DISTRIBUTION_COLORS[String(label || '').toLowerCase()] || '#3376bd';
  }

  private getStorageDistributionOrder(label: string): number {
    const order = ['object storage', 'file storage', 'queue storage', 'table storage'];
    const index = order.indexOf(String(label || '').toLowerCase());
    return index >= 0 ? index : order.length;
  }

  private getStorageGrowthClass(value: string): string {
    if (!value) {
      return '';
    }
    return value.trim().startsWith('-') ? 'storage-growth-danger' : 'storage-growth-success';
  }
  /*
   * ******End ****** Cloud Storage Health Widget Related ********************
   */

  /*
   * -----Start----- Cloud Database Performance (redesigned) Widget Related -------------------
   */
  getDatabaseOverview(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseOverviewResponse> {
    return this.http.get<PublicCloudDatabaseOverviewResponse>(PUBLIC_CLOUD_DATABASE_OVERVIEW_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToDatabaseOverviewKpis(data: PublicCloudDatabaseOverviewResponse): PublicCloudDatabaseKpi[] {
    const rows = data?.data || [];
    return PUBLIC_CLOUD_DATABASE_OVERVIEW_KPI_CONFIG.map(item => {
      const values = rows
        .map(row => this.getFirstNumericValue((row as unknown as Record<string, string | number>)[item.field]))
        .filter((value): value is number => value !== null);
      const aggregate = !values.length ? null :
        item.agg === 'max' ? Math.max(...values) : values.reduce((sum, value) => sum + value, 0) / values.length;
      const unit = this.getFirstValue((rows[0] as unknown as Record<string, string>)?.[item.unitField]);
      return this.convertToDatabaseKpi(item.label, aggregate === null ? '' : aggregate, unit);
    });
  }

  convertToDatabaseOverviewRows(data: PublicCloudDatabaseOverviewResponse): PublicCloudDatabaseOverviewRow[] {
    return (data?.data || []).map(item => ({
      instance: this.getFirstValue(item.database_instance),
      uuid: this.getFirstValue(item.uuid),
      writeThroughput: this.getNumericValue(item.write_throughput),
      writeLatency: this.getNumericValue(item.write_latency),
      writeIops: this.getNumericValue(item.write_iops),
      readThroughput: this.getNumericValue(item.read_throughput),
      readLatency: this.getNumericValue(item.read_latency),
      readIops: this.getNumericValue(item.read_iops),
      queueDepth: this.getNumericValue(item.queue_depth)
    })).filter(row => !!row.instance);
  }

  getDatabaseWriteTrend(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseTrendResponse> {
    return this.http.get<PublicCloudDatabaseTrendResponse>(PUBLIC_CLOUD_DATABASE_WRITE_TREND_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getDatabaseReadTrend(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseTrendResponse> {
    return this.http.get<PublicCloudDatabaseTrendResponse>(PUBLIC_CLOUD_DATABASE_READ_TREND_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToDatabaseWritePerformanceOptions(data: PublicCloudDatabaseTrendResponse): EChartsOption {
    return this.buildDatabaseTrendOptions(data, [
      { key: 'write_throughput', color: PUBLIC_CLOUD_DATABASE_TREND_WRITE_COLORS.throughput, axis: 0 },
      { key: 'write_iops', color: PUBLIC_CLOUD_DATABASE_TREND_WRITE_COLORS.iops, axis: 0 },
      { key: 'write_latency', color: PUBLIC_CLOUD_DATABASE_TREND_WRITE_COLORS.latency, axis: 1 }
    ]);
  }

  convertToDatabaseReadPerformanceOptions(data: PublicCloudDatabaseTrendResponse): EChartsOption {
    return this.buildDatabaseTrendOptions(data, [
      { key: 'read_throughput', color: PUBLIC_CLOUD_DATABASE_TREND_READ_COLORS.throughput, axis: 0 },
      { key: 'read_iops', color: PUBLIC_CLOUD_DATABASE_TREND_READ_COLORS.iops, axis: 0 },
      { key: 'read_latency', color: PUBLIC_CLOUD_DATABASE_TREND_READ_COLORS.latency, axis: 1 },
      { key: 'queue_depth', color: PUBLIC_CLOUD_DATABASE_TREND_READ_COLORS.queue_depth, axis: 1 }
    ]);
  }

  hasDatabaseTrendSeries(data: PublicCloudDatabaseTrendResponse): boolean {
    const series = this.getDatabaseTrendSeries(data);
    return Object.keys(series).some(key => !!(series[key]?.points || []).length);
  }

  private getDatabaseTrendSeries(data: PublicCloudDatabaseTrendResponse): Record<string, PublicCloudDatabaseTrendSeriesItem> {
    return ((data?.data || [])[0]?.series || {}) as Record<string, PublicCloudDatabaseTrendSeriesItem>;
  }

  private buildDatabaseTrendOptions(data: PublicCloudDatabaseTrendResponse, configs: Array<{ key: string, color: string, axis: number }>): EChartsOption {
    const series = this.getDatabaseTrendSeries(data);
    const activeConfigs = configs.filter(config => !!(series[config.key]?.points || []).length);
    const labels = this.getDatabaseTrendLabels(activeConfigs.length ? series[activeConfigs[0].key].points : []);
    const chartSeries = activeConfigs.map(config => ({
      name: this.getFirstValue(series[config.key].label) || config.key,
      color: config.color,
      values: (series[config.key].points || []).map(point => this.getNumericValue(point?.value)),
      axis: config.axis
    }));
    const throughputUnit = this.getFirstValue(series[configs[0].key]?.unit) || 'Bps';
    const iopsUnit = this.getFirstValue(series[configs.find(config => config.key.endsWith('iops'))?.key || '']?.unit) || 'RPS';
    const latencyUnit = this.getFirstValue(series[configs.find(config => config.key.endsWith('latency'))?.key || '']?.unit) || 'ms';
    const leftName = `Throughput (${throughputUnit}) / IOPS (${iopsUnit})`;
    const rightName = configs.some(config => config.key === 'queue_depth') ? `Latency (${latencyUnit}) / Queue Depth` : `Latency (${latencyUnit})`;
    return this.getDatabaseTrendOptions(labels, chartSeries, leftName, rightName);
  }

  private getDatabaseTrendLabels(points?: Array<{ clock?: number; value?: number | string }>): string[] {
    return (points || []).map(point => {
      const clock = this.getNumericValue(point?.clock);
      return clock ? moment.unix(clock).format('HH:mm') : '';
    });
  }

  getDatabaseSpaceConsumption(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseSpaceConsumptionResponse> {
    return this.http.get<PublicCloudDatabaseSpaceConsumptionResponse>(PUBLIC_CLOUD_DATABASE_SPACE_CONSUMPTION_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToDatabaseSpaceKpis(data: PublicCloudDatabaseSpaceConsumptionResponse): PublicCloudDatabaseKpi[] {
    const summary = (data?.summary || {}) as unknown as Record<string, string | number>;
    return PUBLIC_CLOUD_DATABASE_SPACE_KPI_CONFIG.map(item =>
      this.convertToDatabaseKpi(item.label, summary[item.key], this.getFirstValue(summary[item.unitKey])));
  }

  getDatabaseCapacityResources(criteria: PublicCloudDashboardFilterCriteria | undefined, sortBy: string): Observable<PublicCloudDatabaseCapacityResponse> {
    const params = this.convertFiltersToApiParams(criteria).set('sort_by', sortBy);
    return this.http.get<PublicCloudDatabaseCapacityResponse>(PUBLIC_CLOUD_DATABASE_CAPACITY_RESOURCES_ENDPOINT, { params });
  }

  convertToDatabaseCapacityRows(data: PublicCloudDatabaseCapacityResponse): PublicCloudDatabaseSpaceRow[] {
    return (data?.data || []).map(item => ({
      instance: this.getFirstValue(item.database_instance, item.db_instance),
      uuid: this.getFirstValue(item.uuid),
      maxAllocatedLabel: this.getFirstValue(item.max_allocated_display) || this.formatDatabaseStorage(item.max_allocated),
      maxAllocated: this.getNumericValue(item.max_allocated),
      allocatedLabel: this.getFirstValue(item.allocated_display) || this.formatDatabaseStorage(item.allocated),
      allocated: this.getNumericValue(item.allocated),
      spaceFreeLabel: this.getFirstValue(item.space_free_display) || this.formatDatabaseStorage(item.space_free),
      spaceFree: this.getNumericValue(item.space_free),
      utilization: this.getNumericValue(item.utilization)
    })).filter(row => !!row.instance);
  }

  private convertToDatabaseKpi(label: string, value?: string | number, unit?: string): PublicCloudDatabaseKpi {
    const numericValue = this.getFirstNumericValue(value);
    return {
      label,
      value: numericValue !== null ? this.formatMeasureValue(numericValue) : this.getFirstValue(value),
      unit: this.getFirstValue(unit)
    };
  }

  private formatDatabaseStorage(value?: string | number, unit?: string): string {
    const numericValue = this.getFirstNumericValue(value);
    const formatted = numericValue !== null ? this.formatDecimalNumber(numericValue) : this.getFirstValue(value);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  private formatMeasureValue(value: number): string {
    return (Math.round(value * 100) / 100).toFixed(2);
  }

  private getDatabaseTrendOptions(labels: string[], series: Array<{ name: string, color: string, values: number[], axis: number }>, leftName: string, rightName: string): EChartsOption {
    const activeSeries = series.filter(item => !!(item.values || []).length);
    return {
      color: activeSeries.map(item => item.color),
      legend: {
        top: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#555555', fontSize: 11 }
      },
      grid: {
        left: 52,
        right: 52,
        top: 34,
        bottom: 26
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLine: { lineStyle: { color: '#c7ced6' } },
        axisTick: { show: false },
        axisLabel: { color: '#6f7782', fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          name: leftName,
          nameLocation: 'middle',
          nameGap: 38,
          nameTextStyle: { color: '#8a94a2', fontSize: 10 },
          splitLine: { lineStyle: { color: '#eef1f5' } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#6f7782', fontSize: 11 }
        },
        {
          type: 'value',
          name: rightName,
          nameLocation: 'middle',
          nameGap: 40,
          nameTextStyle: { color: '#8a94a2', fontSize: 10 },
          position: 'right',
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#6f7782', fontSize: 11 }
        }
      ],
      series: activeSeries.map(item => ({
        name: item.name,
        type: 'line',
        yAxisIndex: item.axis,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: item.color },
        itemStyle: { color: item.color },
        data: item.values
      }))
    };
  }
  /*
   * ******End ****** Cloud Database Performance (redesigned) Widget Related ********************
   */

  /*
   * -----Start----- Cloud Storage Health (redesigned) Widget Related -------------------
   */
  // Each Storage Performance card has its own endpoint. The trend and high-latency responses have
  // different shapes; the two converters below each read only their own fields, so one getter serves both.
  getStoragePerformanceMetric(endpoint: string, criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageMetricResponse & PublicCloudStorageHighLatencyResponse> {
    return this.http.get<PublicCloudStorageMetricResponse & PublicCloudStorageHighLatencyResponse>(endpoint, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToStorageTrendCard(data: PublicCloudStorageMetricResponse, color: string): PublicCloudStoragePerformanceCard {
    const points = data?.points || [];
    const labels = points.map(point => this.getFirstValue(point?.time));
    const values = points.map(point => this.getNumericValue(point?.value));
    const unit = this.getFirstValue(data?.unit);
    const changeValue = this.getFirstValue(data?.change_percent);
    const direction = this.normalizeDeltaDirection(data?.trend_direction);
    return {
      key: this.getFirstValue(data?.metric),
      title: this.getFirstValue(data?.title),
      valueLabel: this.getFirstValue(data?.value),
      unit,
      deltaLabel: changeValue ? `${changeValue}%` : '',
      deltaDirection: direction,
      deltaTone: this.getStorageTrendDeltaTone(direction),
      subtitle: '',
      chartType: 'area',
      options: this.getStorageCardAreaOptions(values, labels, color, unit)
    };
  }

  convertToStorageHighLatencyCard(data: PublicCloudStorageHighLatencyResponse, color: string): PublicCloudStoragePerformanceCard {
    const values = (data?.data || []).map(device => this.getNumericValue(device?.p95_latency));
    return {
      key: 'high_latency_devices',
      title: 'High Latency Devices',
      valueLabel: this.getFirstValue(data?.value),
      unit: '',
      deltaLabel: '',
      deltaDirection: '',
      deltaTone: 'muted',
      subtitle: this.getFirstValue(data?.threshold_display),
      chartType: 'bar',
      options: this.getStorageCardBarOptions(values, color)
    };
  }

  getStorageResources(criteria: PublicCloudDashboardFilterCriteria | undefined, sortBy: string): Observable<PublicCloudStorageResourcesResponse> {
    const params = this.convertFiltersToApiParams(criteria).set('sort_by', sortBy);
    return this.http.get<PublicCloudStorageResourcesResponse>(PUBLIC_CLOUD_STORAGE_RESOURCES_ENDPOINT, { params });
  }

  convertToStorageResourceRows(data: PublicCloudStorageResourcesResponse): PublicCloudStorageResourceRow[] {
    return (data?.data || []).map(item => {
      const cloud = this.getFirstValue(item.cloud);
      const region = this.getFirstValue(item.region);
      return {
        deviceName: this.getFirstValue(item.device_name, item.name),
        uuid: this.getFirstValue(item.uuid),
        type: this.getFirstValue(item.type),
        cloud,
        cloudRegion: this.getFirstValue(item.cloud_region) || [cloud, region].filter(value => !!value).join('/'),
        capacity: this.getFirstValue(item.capacity_display, item.capacity),
        capacityValue: this.getNumericValue(item.capacity),
        e2eLatency: this.getNumericValue(item.e2e_latency),
        successServerLatency: this.getNumericValue(item.success_server_latency),
        networkQueueDelay: this.getNumericValue(item.network_queue_delay),
        latencyHealthScore: this.getNumericValue(item.latency_health_score),
        status: this.getFirstValue(item.status)
      };
    }).filter(row => !!row.deviceName);
  }

  private normalizeDeltaDirection(value?: string): 'up' | 'down' | '' {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'up' || normalized === 'down') {
      return normalized;
    }
    return '';
  }

  // The trend endpoints expose only a direction (no tone), so tone is derived: rising -> warning, falling -> improving.
  private getStorageTrendDeltaTone(direction: 'up' | 'down' | ''): PublicCloudStatusTone {
    if (direction === 'up') {
      return 'warning';
    }
    if (direction === 'down') {
      return 'success';
    }
    return 'muted';
  }

  private getStorageCardAreaOptions(values: number[], labels: string[], color: string, unit: string): EChartsOption {
    return {
      grid: { left: 40, right: 10, top: 8, bottom: 20 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e4e9ef' } },
        axisLabel: {
          color: '#9aa6b2',
          fontSize: 10,
          interval: this.getStoragePerformanceLabelInterval(labels)
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#eef1f5' } },
        axisLabel: {
          color: '#9aa6b2',
          fontSize: 10,
          formatter: (value: number) => `${value}${unit}`
        }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color },
          itemStyle: { color },
          areaStyle: { color: this.getStorageCardAreaColor(color) },
          data: values
        }
      ]
    };
  }

  private getStorageCardBarOptions(values: number[], color: string): EChartsOption {
    return {
      grid: { left: 6, right: 6, top: 10, bottom: 6 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        show: false,
        data: values.map((entry, index) => String(index))
      },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'bar',
          barWidth: '55%',
          itemStyle: { color, borderRadius: [2, 2, 0, 0] },
          data: values
        }
      ]
    };
  }

  private getStoragePerformanceLabelInterval(labels: string[]): number {
    const length = (labels || []).length;
    return length > 6 ? Math.ceil(length / 5) - 1 : 0;
  }

  private getStorageCardAreaColor(color: string): string {
    const normalized = String(color || '').replace('#', '');
    if (normalized.length !== 6) {
      return 'rgba(63, 140, 255, 0.15)';
    }
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  }

  getWritePerformanceTrend(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudWritePerformanceResponse> {
    return this.http.get<PublicCloudWritePerformanceResponse>(PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToWritePerformanceViewData(data: PublicCloudWritePerformanceResponse): PublicCloudWritePerformanceViewData {
    const source = this.getObjectResponseData(data) as PublicCloudWritePerformanceResponse;
    const labels = (source?.time_buckets || []).map(bucket => this.getFirstValue(bucket));
    const rows = (source?.data || []).map(item => ({
      name: this.getFirstValue(item.device_name, item.name),
      cells: (item.values || []).map(entry => {
        const value = this.getNumericValue(entry?.value);
        return { value, color: this.getWritePerformanceColor(value, this.getFirstValue(entry?.status)) };
      })
    })).filter(row => !!row.name && row.cells.length);
    return { labels, rows };
  }

  // Cell colour is driven by the per-cell status; falls back to write-latency thresholds
  // (<=10 healthy, <=20 warning, >20 critical) when a status is not supplied.
  private getWritePerformanceColor(value: number, status?: string): string {
    switch (String(status || '').toLowerCase()) {
      case 'healthy':
        return PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS.low;
      case 'warning':
        return PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS.medium;
      case 'critical':
        return PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS.high;
      case 'unknown':
        return PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS.unknown;
      default:
        break;
    }
    if (value <= 10) {
      return PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS.low;
    }
    return value <= 20 ? PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS.medium : PUBLIC_CLOUD_WRITE_PERFORMANCE_HEATMAP_COLORS.high;
  }

  getLatencyBreakdown(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudLatencyBreakdownResponse> {
    return this.http.get<PublicCloudLatencyBreakdownResponse>(PUBLIC_CLOUD_LATENCY_BREAKDOWN_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToLatencyBreakdownViewData(data: PublicCloudLatencyBreakdownResponse): PublicCloudLatencyBreakdownViewData {
    const source = this.getObjectResponseData(data) as PublicCloudLatencyBreakdownResponse;
    const summary = source?.summary;
    const breakdown = summary?.breakdown || source?.segments || [];
    const total = this.getFirstNumericValue(summary?.total_latency, source?.total);
    const unit = this.getFirstValue(breakdown[0]?.unit, source?.unit) || 'ms';
    const segments = breakdown.map((segment, index) => {
      const value = this.getFirstNumericValue(segment?.value);
      const percent = this.getFirstNumericValue(segment?.percentage, segment?.percent);
      return {
        label: this.getFirstValue(segment?.name, segment?.label),
        valueLabel: this.getFirstValue(segment?.display_value) || (value !== null ? `${this.formatDecimalNumber(value)} ${unit}` : ''),
        percent: percent !== null ? percent : 0,
        percentLabel: percent !== null ? `(${this.formatNumber(percent)}%)` : '',
        color: segment?.color || PUBLIC_CLOUD_LATENCY_BREAKDOWN_COLORS[index % PUBLIC_CLOUD_LATENCY_BREAKDOWN_COLORS.length]
      };
    }).filter(segment => !!segment.label);
    return {
      totalLabel: total !== null ? this.formatDecimalNumber(total) : this.getFirstValue(summary?.total_latency_display),
      unit,
      segments,
      hasData: segments.length > 0
    };
  }

  convertToLatencyBreakdownOptions(data: PublicCloudLatencyBreakdownViewData): EChartsOption {
    const segments = data?.segments || [];
    return {
      color: segments.map(segment => segment.color),
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.data.valueLabel} ${params.data.percentLabel}`
      },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['62%', '86%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: segments.map(segment => ({
            name: segment.label,
            value: segment.percent,
            valueLabel: segment.valueLabel,
            percentLabel: segment.percentLabel,
            itemStyle: { color: segment.color }
          }))
        }
      ]
    };
  }
  /*
   * ******End ****** Cloud Storage Health (redesigned) Widget Related ********************
   */

  /*
   * -----Start----- Orphaned Devices Widgets Related -------------------
   */
  getOrphanedDevices(criteria?: PublicCloudDashboardFilterCriteria, page = 1, pageSize = 10): Observable<PublicCloudOrphanedDevicesResponse> {
    let params = this.convertFiltersToApiParams(criteria);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));
    return this.http.get<PublicCloudOrphanedDevicesResponse>(PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT, { params });
  }

  getOrphanedDevicesByCategory(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudOrphanedDevicesByCategoryApiResponse> {
    return this.http.get<PublicCloudOrphanedDevicesByCategoryApiResponse>(PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToOrphanedDevicesViewData(data: PublicCloudOrphanedDevicesResponse): PublicCloudOrphanedDeviceRow[] {
    return this.getOrphanedDeviceResults(data).map(item => ({
      name: this.getFirstValue(item.name, item.device_name, item.instance_name),
      status: this.getFirstValue(item.status),
      lastSeen: this.formatOrphanedDate(this.getFirstValue(item.lastSeen, item.last_seen)),
      datacenter: this.getFirstValue(item.datacenter, item.datacenter_name, item.cloud, item.provider, item.platform, item.account)
    }));
  }

  convertToOrphanedDevicesTotal(data: PublicCloudOrphanedDevicesResponse): number {
    return Number(data?.count || data?.totalOrphaned || this.getOrphanedDeviceResults(data).length || 0);
  }

  convertToOrphanedByCategoryViewData(data: PublicCloudOrphanedDevicesByCategoryApiResponse): PublicCloudOrphanedCategoryItem[] {
    const categoryData = this.getOrphanedCategoryResults(data);
    const total = this.getOrphanedByCategoryTotal(data, categoryData);
    const categoryTotal = (categoryData || []).reduce((sum, item) => sum + this.getOrphanedCategoryCount(item), 0);
    return categoryData.filter(item => this.getOrphanedCategoryCount(item) > 0).map((item, index) => {
      const count = this.getOrphanedCategoryCount(item);
      return {
        category: this.formatOrphanedCategoryLabel(this.getFirstValue(item.category, item.name, item.label, item.display_name, item.type, item.resource_type)),
        count,
        percentage: this.getOrphanedCategoryPercentage(item, count, categoryTotal),
        color: PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS[index % PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS.length],
        totalCount: total
      };
    });
  }

  convertToOrphanedByCategoryOptions(data: PublicCloudOrphanedCategoryItem[]): EChartsOption {
    const total = Number(data?.[0]?.totalCount || 0) || (data || []).reduce((sum, item) => sum + Number(item.count || 0), 0);
    return {
      color: (data || []).map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}<br/>Count: ${params.data.count}<br/>${params.data.percentage}%`
      },
      legend: {
        show: false
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: this.formatNumber(total),
            fill: '#222222',
            fontSize: 28,
            fontWeight: 700
          }
        }
      ],
      series: [
        {
          name: 'Orphaned by Category',
          type: 'pie',
          roseType: 'radius',
          radius: ['34%', '82%'],
          center: ['50%', '48%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
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

  hasOrphanedByCategoryData(data: PublicCloudOrphanedCategoryItem[]): boolean {
    return (data || []).some(item => Number(item.count || 0) > 0);
  }

  private getOrphanedDeviceResults(data: PublicCloudOrphanedDevicesResponse): PublicCloudOrphanedDeviceResponseItem[] {
    return data?.results || data?.orphanedDeviceList || data?.data || data?.items || [];
  }

  private getOrphanedCategoryResults(data: PublicCloudOrphanedDevicesByCategoryApiResponse): PublicCloudOrphanedCategoryResponseItem[] {
    if (Array.isArray(data)) {
      return data;
    }
    const categoryData = data?.breakdown || data?.results || data?.orphanedByCategory || data?.categories || data?.by_category || data?.data;
    if (Array.isArray(categoryData)) {
      return categoryData;
    }
    if (categoryData) {
      return this.convertOrphanedCategoryRecordToItems(categoryData as unknown as PublicCloudOrphanedDevicesByCategoryResponse);
    }
    return this.convertOrphanedCategoryRecordToItems(data);
  }

  private convertOrphanedCategoryRecordToItems(data: PublicCloudOrphanedDevicesByCategoryResponse): PublicCloudOrphanedCategoryResponseItem[] {
    const record = data as unknown as Record<string, string | number | PublicCloudOrphanedCategoryResponseItem>;
    return Object.keys(data || {}).filter(key => !['total', 'totalOrphaned', 'total_count', 'totalCount', 'count', 'breakdown'].includes(key)).map(key => {
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

  private getOrphanedByCategoryTotal(data: PublicCloudOrphanedDevicesByCategoryApiResponse, categoryData: PublicCloudOrphanedCategoryResponseItem[]): number {
    if (!Array.isArray(data)) {
      const total = Number(data?.total || data?.totalOrphaned || data?.total_count || data?.totalCount || 0);
      if (total) {
        return total;
      }
    }
    return (categoryData || []).reduce((sum, item) => sum + this.getOrphanedCategoryCount(item), 0);
  }

  private getOrphanedCategoryCount(item: PublicCloudOrphanedCategoryResponseItem): number {
    return Number(item?.count || item?.value || 0);
  }

  private getOrphanedCategoryPercentage(item: PublicCloudOrphanedCategoryResponseItem, count: number, total: number): number {
    const apiPercentage = Number(String(item.percentage || item.percent || 0).replace('%', ''));
    if (apiPercentage) {
      return Math.round(apiPercentage);
    }
    return total ? Math.round((count / total) * 100) : 0;
  }

  private getFirstValue(...values: Array<string | number | undefined | null>): string {
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
  getIdleDevices(criteria?: PublicCloudDashboardFilterCriteria, page = 1, pageSize = 10): Observable<PublicCloudIdleDevicesResponse> {
    let params = this.convertFiltersToApiParams(criteria);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));
    return this.http.get<PublicCloudIdleDevicesResponse>(PUBLIC_CLOUD_IDLE_DEVICES_ENDPOINT, { params });
  }

  getIdleDevicesByDuration(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudIdleDurationApiResponse> {
    return this.http.get<PublicCloudIdleDurationApiResponse>(PUBLIC_CLOUD_IDLE_DEVICES_BY_DURATION_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToIdleDevicesViewData(data: PublicCloudIdleDevicesResponse): PublicCloudIdleDeviceRow[] {
    return (data?.results || []).map(item => {
      const row = item as Record<string, any>;
      return {
        id: this.getFirstValue(row.id),
        uuid: this.getFirstValue(row.uuid, row.id),
        deviceId: this.getFirstValue(row.device_id, row.deviceId, row.device_uuid, row.deviceUuid, row.uuid, row.id),
        resourceId: this.getFirstValue(row.resource_id, row.resourceId, row.uuid, row.id),
        deviceName: this.getFirstValue(row.device_name, row.deviceName, row.name, row.instance_name),
        resourceType: this.getFirstValue(row.resource_type, row.resourceType, row.type),
        provider: this.getFirstValue(row.provider, row.platform, row.cloud_provider, row.cloudProvider, row.cloud, row.cloud_type, row.cloudType),
        cloudType: this.getFirstValue(row.cloud_type, row.cloudType, row.cloud, row.provider, row.platform),
        monitoringType: this.getFirstValue(row.monitoring_type, row.monitoringType),
        monitoring: row.monitoring,
        avgCpu: this.convertToIdleMetric(
          this.getFirstObject(row.avg_cpu, row.avgCpu, row.avgCPU, row.cpu, row.cpu_usage, row.average_cpu),
          this.getFirstScalar(row.avg_cpu_percent, row.avgCpuPercent, row.avg_cpu_percentage, row.cpu_percent, row.cpuPercentage, row.avg_cpu, row.avgCpu, row.avgCPU, row.cpu, row.cpu_usage, row.average_cpu)
        ),
        avgMem: this.convertToIdleMetric(
          this.getFirstObject(row.avg_mem, row.avgMem, row.avg_memory, row.memory, row.memory_usage, row.average_memory),
          this.getFirstScalar(row.avg_mem_percent, row.avgMemPercent, row.avg_mem_percentage, row.memory_percent, row.memoryPercentage, row.avg_mem, row.avgMem, row.avg_memory, row.memory, row.memory_usage, row.average_memory)
        ),
        networkIO: this.getFirstValue(row.network_io, row.networkIO, row.network, row.network_in_out),
        idleDuration: this.getFirstValue(row.idle_duration, row.idleDuration, row.duration),
        status: this.getFirstValue(row.status)
      };
    });
  }

  convertToIdleDevicesTotal(data: PublicCloudIdleDevicesResponse): number {
    return Number(data?.count || 0);
  }

  convertToIdleDurationViewData(data: PublicCloudIdleDurationApiResponse): PublicCloudIdleDurationItem[] {
    const durationData = this.sortIdleDurationBuckets(this.getIdleDurationResults(data));
    const maxCount = Math.max(...durationData.map(item => this.getIdleDurationCount(item)), 0);
    return durationData.filter(item => this.getIdleDurationCount(item) > 0).map((item, index) => {
      const count = this.getIdleDurationCount(item);
      const duration = this.getIdleDurationLabel(item);
      return {
        duration,
        count,
        percent: maxCount ? Math.round((count / maxCount) * 100) : 0,
        color: PUBLIC_CLOUD_IDLE_DURATION_COLORS[index % PUBLIC_CLOUD_IDLE_DURATION_COLORS.length]
      };
    });
  }

  convertToIdleDurationOptions(data: PublicCloudIdleDurationItem[]): EChartsOption {
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

  hasIdleDurationData(data: PublicCloudIdleDurationItem[]): boolean {
    return (data || []).some(item => Number(item.count || 0) > 0);
  }

  private convertToIdleMetric(metric?: PublicCloudIdleMetricResponse, percentValue?: string | number): PublicCloudIdleMetric {
    const usedValue = metric?.used ?? metric?.value;
    const freeValue = metric?.free;
    const explicitPercent = this.getNumericValue(metric?.percent || metric?.percentage || percentValue);
    const freePercent = this.getNumericValue(freeValue);
    const usedPercent = explicitPercent || (freePercent ? 100 - freePercent : this.getNumericValue(usedValue));
    const percent = Math.max(Math.min(Number(usedPercent || 0), 100), 0);
    return {
      used: this.getFirstValue(usedValue, percent),
      free: this.getFirstValue(freeValue, `${Math.max(100 - percent, 0)}%`),
      percent,
      tone: this.getProgressTone(percent)
    };
  }

  private getIdleDurationResults(data: PublicCloudIdleDurationApiResponse): PublicCloudIdleDurationResponseItem[] {
    return this.getIdleDurationResultsFromValue(data);
  }

  private getIdleDurationResultsFromValue(value: any): PublicCloudIdleDurationResponseItem[] {
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

    return this.convertIdleDurationRecordToItems(value as PublicCloudIdleDurationResponse);
  }

  private convertIdleDurationRecordToItems(data: PublicCloudIdleDurationResponse): PublicCloudIdleDurationResponseItem[] {
    const record = data as unknown as Record<string, string | number | PublicCloudIdleDurationResponseItem>;
    return Object.keys(data || {}).reduce((items: PublicCloudIdleDurationResponseItem[], key) => {
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

  private getIdleDurationCount(item: PublicCloudIdleDurationResponseItem): number {
    return Number(item?.count || item?.value || item?.total || item?.total_count || item?.totalCount || item?.devices || item?.percent || item?.percentage || 0);
  }

  private getIdleDurationLabel(item: PublicCloudIdleDurationResponseItem): string {
    return this.getFirstValue(item.duration, item.idle_duration, item.idleDuration, item.range, item.name, item.label);
  }

  private sortIdleDurationBuckets(items: PublicCloudIdleDurationResponseItem[]): PublicCloudIdleDurationResponseItem[] {
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

  private isIdleDurationBucketItem(item: PublicCloudIdleDurationResponseItem): boolean {
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

  private getFirstObject(...values: any[]): PublicCloudIdleMetricResponse | undefined {
    return values.find(value => value && typeof value === 'object');
  }

  private getFirstScalar(...values: any[]): string | number {
    const value = values.find(item => item !== undefined && item !== null && item !== '' && typeof item !== 'object');
    return value === undefined || value === null ? '' : value;
  }

  private getProgressTone(percent: number): PublicCloudStatusTone {
    return percent < 65 ? 'success' : percent < 85 ? 'warning' : 'danger';
  }

  private getNumericValue(value: string | number | undefined | null): number {
    return Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
  }
  /*
   * ******End ****** Idle Devices Widgets Related ********************
   */

  /*
   * -----Start----- Alert & Events View Widget Related -------------------
   */
  getRecentAlerts(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudRecentAlertsResponse> {
    return this.http.get<PublicCloudRecentAlertsResponse>(PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  convertToRecentAlertSummaryMetricsViewData(data: PublicCloudRecentAlertsResponse): PublicCloudAlertSummaryMetric[] {
    const summary = this.getRecentAlertSummary(data);
    return [
      {
        label: 'Critical Alerts',
        value: String(this.getRecentAlertSummaryValue(summary, ['critical_alerts', 'criticalAlerts', 'critical'])),
        tone: 'danger'
      },
      {
        label: 'Warning Alerts',
        value: String(this.getRecentAlertSummaryValue(summary, ['warning_alerts', 'warningAlerts', 'warning'])),
        tone: 'warning'
      },
      {
        label: 'Info Alerts',
        value: String(this.getRecentAlertSummaryValue(summary, ['info_alerts', 'infoAlerts', 'information', 'info'])),
        tone: 'primary'
      }
    ];
  }

  convertToRecentAlertsViewData(data: PublicCloudRecentAlertsResponse): PublicCloudRecentAlert[] {
    return this.getRecentAlertRows(data).map(item => ({
      id: this.getFirstValue(item.id, item.alert_id, item.alertId, item.uuid, item.alert_uuid, item.alertUuid),
      uuid: this.getFirstValue(item.uuid, item.alert_uuid, item.alertUuid, item.id, item.alert_id, item.alertId),
      deviceName: this.getFirstValue(item.device_name, item.deviceName, item.name),
      severity: this.getRecentAlertSeverity(this.getFirstValue(item.severity, item.status)),
      description: this.getFirstValue(item.description),
      source: this.getFirstValue(item.source),
      acknowledged: this.formatRecentAlertAcknowledged(item.acknowledged),
      duration: this.getFirstValue(item.duration)
    }));
  }

  private getRecentAlertSummary(data: PublicCloudRecentAlertsResponse): PublicCloudRecentAlertsSummary {
    const nestedData = !Array.isArray(data?.data) ? data?.data : null;
    return data?.alertSummary || data?.alert_summary || data?.summary ||
      nestedData?.alertSummary || nestedData?.alert_summary || nestedData?.summary || {};
  }

  private getRecentAlertSummaryValue(summary: PublicCloudRecentAlertsSummary, keys: Array<keyof PublicCloudRecentAlertsSummary>): number {
    const value = keys.map(key => summary?.[key]).find(item => item !== undefined && item !== null);
    return Number(value || 0);
  }

  private getRecentAlertRows(data: PublicCloudRecentAlertsResponse): PublicCloudRecentAlertResponseItem[] {
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    const nestedData = !Array.isArray(data?.data) ? data?.data : null;
    return data?.recentAlerts || data?.recent_alerts || data?.alerts || data?.results ||
      nestedData?.recentAlerts || nestedData?.recent_alerts || nestedData?.alerts || nestedData?.results || [];
  }

  private getRecentAlertSeverity(value: string): PublicCloudRecentAlertSeverity {
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
   * ******End ****** Alert & Events View Widget Related ********************
   */

}
