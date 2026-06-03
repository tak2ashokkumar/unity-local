import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PUBLIC_CLOUD_ACTIVE_DATABASE_WORKLOAD_ENDPOINT,
  PUBLIC_CLOUD_ALL_SELECTED_VALUE,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_ENDPOINT,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_PROVIDER_CONFIG,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_STAT_CONFIG,
  PUBLIC_CLOUD_DATABASE_HEALTH_METRIC_COLORS,
  PUBLIC_CLOUD_DATABASE_HEALTH_SCORE_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_LATENCY_COLORS,
  PUBLIC_CLOUD_DATABASE_LATENCY_OVERVIEW_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_WIDGET_COLORS,
  PUBLIC_CLOUD_FILTERS_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DEVICES_BY_DURATION_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DEVICES_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DURATION_COLORS,
  PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS,
  PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT,
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
  PublicCloudComputeBreakdownProvider,
  PublicCloudComputeBreakdownProviderKey,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDashboardFilterOptions,
  PublicCloudFilterOption,
  PublicCloudFiltersResponse,
  PublicCloudFilterAccountResponseItem,
  PublicCloudComputeBreakdownResponse,
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
  PublicCloudOrphanedCategoryItem,
  PublicCloudOrphanedCategoryResponseItem,
  PublicCloudOrphanedDeviceResponseItem,
  PublicCloudOrphanedDeviceRow,
  PublicCloudOrphanedDevicesByCategoryApiResponse,
  PublicCloudOrphanedDevicesByCategoryResponse,
  PublicCloudOrphanedDevicesResponse,
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

  convertToComputeBreakdownViewData(data: PublicCloudComputeBreakdownResponse, criteria?: PublicCloudDashboardFilterCriteria): PublicCloudComputeBreakdownProvider[] {
    const selectedProviderKeys = this.getComputeBreakdownProviderKeys(criteria);
    return PUBLIC_CLOUD_COMPUTE_BREAKDOWN_PROVIDER_CONFIG.filter(provider =>
      (!selectedProviderKeys.length || selectedProviderKeys.includes(provider.key)) &&
      this.hasComputeBreakdownProviderData(data, provider.key)
    ).map(provider => ({
      key: provider.key,
      name: provider.name,
      displayName: provider.displayName,
      brandClass: provider.brandClass,
      logoPath: provider.logoPath,
      stats: PUBLIC_CLOUD_COMPUTE_BREAKDOWN_STAT_CONFIG.map(stat => ({
        key: stat.key,
        name: stat.name,
        value: Number(data?.[provider.key]?.[stat.key] || 0)
      }))
    }));
  }

  private getComputeBreakdownProviderKeys(criteria?: PublicCloudDashboardFilterCriteria): PublicCloudComputeBreakdownProviderKey[] {
    return this.getSelectedValues(criteria?.platforms || []).map(platform => {
      const normalizedPlatform = this.normalizePlatformValue(platform);
      if (normalizedPlatform === 'gcp') {
        return 'google_cloud';
      }
      return normalizedPlatform === 'oci' ? 'oracle' : normalizedPlatform;
    }) as PublicCloudComputeBreakdownProviderKey[];
  }

  private hasComputeBreakdownProviderData(data: PublicCloudComputeBreakdownResponse, providerKey: PublicCloudComputeBreakdownProviderKey): boolean {
    return PUBLIC_CLOUD_COMPUTE_BREAKDOWN_STAT_CONFIG.some(stat => Number(data?.[providerKey]?.[stat.key] || 0) > 0);
  }
  /*
   * ******End ****** Compute Breakdown Widget Related ********************
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
          radius: ['42%', '72%'],
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
