import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UnityChartConfigService } from 'src/app/shared/unity-chart-config.service';
import {
  PUBLIC_CLOUD_ACTIVE_DATABASE_WORKLOAD_ENDPOINT,
  PUBLIC_CLOUD_ACCOUNT_SUBSCRIPTION_PROJECT_METRICS_ENDPOINT,
  PUBLIC_CLOUD_ACCOUNT_SUBSCRIPTION_PROJECT_METRICS_RESPONSE,
  PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_ACCOUNT_ENDPOINT,
  PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_ACCOUNT_RESPONSE,
  PUBLIC_CLOUD_ESTIMATED_MONTHLY_COST_BY_ACCOUNT_ENDPOINT,
  PUBLIC_CLOUD_ESTIMATED_MONTHLY_COST_BY_ACCOUNT_RESPONSE,
  PUBLIC_CLOUD_VCPU_UTILIZATION_BY_ACCOUNT_ENDPOINT,
  PUBLIC_CLOUD_VCPU_UTILIZATION_BY_ACCOUNT_RESPONSE,
  PUBLIC_CLOUD_COST_EFFICIENCY_BY_ACCOUNT_ENDPOINT,
  PUBLIC_CLOUD_COST_EFFICIENCY_BY_ACCOUNT_RESPONSE,
  PUBLIC_CLOUD_ALL_SELECTED_VALUE,
  PUBLIC_CLOUD_COVERAGE_GROUP_LABELS,
  PUBLIC_CLOUD_COVERAGE_GROUP_ORDER,
  PUBLIC_CLOUD_COVERAGE_PROVIDER_LABELS,
  PUBLIC_CLOUD_COVERAGE_PROVIDER_LOGOS,
  PUBLIC_CLOUD_COVERAGE_PROVIDER_ORDER,
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
  PUBLIC_CLOUD_GEO_DISTRIBUTION_MAX_TILES,
  PUBLIC_CLOUD_GEO_PROVIDER_COLORS,
  PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS,
  PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT,
  PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG,
  PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT,
  PUBLIC_CLOUD_ALERTS_BY_SEVERITY_ENDPOINT,
  PUBLIC_CLOUD_ALERTS_BY_PROVIDER_ENDPOINT,
  PUBLIC_CLOUD_ALERTS_BY_AGE_ENDPOINT,
  PUBLIC_CLOUD_ALERT_SEVERITY_CHART_COLORS,
  PUBLIC_CLOUD_ALERT_SEVERITY_ORDER,
  PUBLIC_CLOUD_ALERT_AGE_COLORS,
  PUBLIC_CLOUD_ALERT_AGE_ORDER,
  PUBLIC_CLOUD_RECENT_ALERTS_RESPONSE,
  PUBLIC_CLOUD_ALERTS_BY_SEVERITY_RESPONSE,
  PUBLIC_CLOUD_ALERTS_BY_PROVIDER_RESPONSE,
  PUBLIC_CLOUD_ALERTS_BY_AGE_RESPONSE,
  PUBLIC_CLOUD_COST_OPTIMIZATION_ENDPOINT,
  PUBLIC_CLOUD_SPEND_VS_SAVINGS_ENDPOINT,
  PUBLIC_CLOUD_RECOMMENDED_ACTIONS_ENDPOINT,
  PUBLIC_CLOUD_POTENTIAL_SAVINGS_BY_PROVIDER_ENDPOINT,
  PUBLIC_CLOUD_COST_ACTION_COLORS,
  PUBLIC_CLOUD_COST_SPEND_COLOR,
  PUBLIC_CLOUD_COST_SAVINGS_COLOR,
  PUBLIC_CLOUD_COST_OPTIMIZATION_RESPONSE,
  PUBLIC_CLOUD_SPEND_VS_SAVINGS_RESPONSE,
  PUBLIC_CLOUD_RECOMMENDED_ACTIONS_RESPONSE,
  PUBLIC_CLOUD_POTENTIAL_SAVINGS_BY_PROVIDER_RESPONSE,
  PUBLIC_CLOUD_AUTO_REMEDIATION_SUMMARY_ENDPOINT,
  PUBLIC_CLOUD_AUTO_REMEDIATION_SUMMARY_RESPONSE,
  PUBLIC_CLOUD_AUTO_REMEDIATION_ACTION_COLORS,
  PUBLIC_CLOUD_AUTO_REMEDIATION_OUTCOME_COLORS,
  PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG,
  PUBLIC_CLOUD_COMPUTE_MONITORED_ENDPOINT,
  PUBLIC_CLOUD_CLOUD_PROVIDER_DISTRIBUTION_ENDPOINT,
  PUBLIC_CLOUD_UTILIZATION_BY_PROVIDER_ENDPOINT,
  PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_OS_TYPE_ENDPOINT,
  PUBLIC_CLOUD_ALERTS_SEVERITY_ENDPOINT,
  PUBLIC_CLOUD_PROVIDER_ORDER,
  PUBLIC_CLOUD_PROVIDER_ICON_CONFIG,
  PUBLIC_CLOUD_COMPUTE_MONITORED_COLORS,
  PUBLIC_CLOUD_UTILIZATION_SERIES_CONFIG,
  PUBLIC_CLOUD_OS_TYPE_CONFIG,
  PUBLIC_CLOUD_ALERTS_SEVERITY_CONFIG,
  PUBLIC_CLOUD_INVENTORY_SUMMARY_RESPONSE,
  PUBLIC_CLOUD_COMPUTE_MONITORED_RESPONSE,
  PUBLIC_CLOUD_CLOUD_PROVIDER_DISTRIBUTION_RESPONSE,
  PUBLIC_CLOUD_UTILIZATION_BY_PROVIDER_RESPONSE,
  PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_OS_TYPE_RESPONSE,
  PUBLIC_CLOUD_ALERTS_SEVERITY_RESPONSE,
  PUBLIC_CLOUD_CAPACITY_PERFORMANCE_TABLE_ENDPOINT,
  PUBLIC_CLOUD_CAPACITY_PERFORMANCE_CHARTS_ENDPOINT,
  PUBLIC_CLOUD_CAPACITY_STATUS_COLORS,
  PUBLIC_CLOUD_CAPACITY_PERFORMANCE_TABLE_RESPONSE,
  PUBLIC_CLOUD_CAPACITY_PERFORMANCE_CHARTS_RESPONSE,
  PUBLIC_CLOUD_STORAGE_VOLUMES_DISKS_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_PROVISIONED_BY_PROVIDER_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_TOP_VOLUMES_IOPS_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_IOPS_TIER_DISTRIBUTION_ENDPOINT,
  PUBLIC_CLOUD_STORAGE_IOPS_TIER_COLORS,
  PUBLIC_CLOUD_STORAGE_VOLUMES_DISKS_RESPONSE,
  PUBLIC_CLOUD_STORAGE_PROVISIONED_BY_PROVIDER_RESPONSE,
  PUBLIC_CLOUD_STORAGE_TOP_VOLUMES_IOPS_RESPONSE,
  PUBLIC_CLOUD_STORAGE_IOPS_TIER_DISTRIBUTION_RESPONSE,
  PUBLIC_CLOUD_INSTANCE_PROVISIONING_SUMMARY_ENDPOINT,
  PUBLIC_CLOUD_PROVISIONING_REACHABILITY_ENDPOINT,
  PUBLIC_CLOUD_PROVISIONED_BY_PROVIDER_ENDPOINT,
  PUBLIC_CLOUD_RECENTLY_PROVISIONED_ENDPOINT,
  PUBLIC_CLOUD_PROVISIONING_SUMMARY_METRICS_ENDPOINT,
  PUBLIC_CLOUD_PROVISIONING_ENVIRONMENT_CLASS,
  PUBLIC_CLOUD_PROVISIONING_SUMMARY_KPI_CONFIG,
  PUBLIC_CLOUD_INSTANCE_PROVISIONING_SUMMARY_RESPONSE,
  PUBLIC_CLOUD_PROVISIONING_REACHABILITY_RESPONSE,
  PUBLIC_CLOUD_PROVISIONED_BY_PROVIDER_RESPONSE,
  PUBLIC_CLOUD_RECENTLY_PROVISIONED_RESPONSE,
  PUBLIC_CLOUD_PROVISIONING_SUMMARY_METRICS_RESPONSE,
  PUBLIC_CLOUD_DATABASE_INVENTORY_ENDPOINT,
  PUBLIC_CLOUD_DATABASE_SUMMARY_KPI_CONFIG,
  PUBLIC_CLOUD_DATABASE_INVENTORY_RESPONSE,
  PUBLIC_CLOUD_DB_WORKLOAD_ENDPOINT,
  PUBLIC_CLOUD_DB_QUERY_PERFORMANCE_ENDPOINT,
  PUBLIC_CLOUD_DB_STATUS_COLORS,
  PUBLIC_CLOUD_DB_WORKLOAD_RESPONSE,
  PUBLIC_CLOUD_DB_QUERY_PERFORMANCE_RESPONSE,
  PUBLIC_CLOUD_TOP_LOCK_CONTENTION_ENDPOINT,
  PUBLIC_CLOUD_TOP_MEMORY_CONSUMERS_ENDPOINT,
  PUBLIC_CLOUD_TOP_STORAGE_CONSUMERS_ENDPOINT,
  PUBLIC_CLOUD_TIME_RANGE_PARAM_MAP
} from './public-cloud-compute-dashboard.const';
import {
  PublicCloudAccountOption,
  PublicCloudAccountMetricChartResponse,
  PublicCloudAccountMetricChartResponseItem,
  PublicCloudAccountSubscriptionMetricResponseItem,
  PublicCloudAccountSubscriptionMetricRow,
  PublicCloudAccountSubscriptionMetricsApiResponse,
  PublicCloudAccountSubscriptionMetricsResponse,
  PublicCloudActiveDatabaseWorkloadViewData,
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
  PublicCloudGeoDistributionSummary,
  PublicCloudGeoDistributionLegendItem,
  PublicCloudLockContentionResponse,
  PublicCloudLockContentionResponseItem,
  PublicCloudLockContentionRow,
  PublicCloudInventorySummaryResponse,
  PublicCloudComputeMonitoredResponse,
  PublicCloudComputeMonitoredCard,
  PublicCloudProviderDistributionResponse,
  PublicCloudUtilizationByProviderResponse,
  PublicCloudOsTypeResponse,
  PublicCloudOsTypeItem,
  PublicCloudAlertsSeverityResponse,
  PublicCloudAlertsSeverityItem,
  PublicCloudCapacityPerformanceRowResponse,
  PublicCloudCapacityPerformanceTableResponse,
  PublicCloudCapacityPerformanceRow,
  PublicCloudCapacityPerformanceChartsResponse,
  PublicCloudCapacityFleetStatus,
  PublicCloudCapacityCpuDistribution,
  PublicCloudCapacityTopItem,
  PublicCloudCapacityGrowthInsights,
  PublicCloudStorageVolumeRowResponse,
  PublicCloudStorageVolumesTableResponse,
  PublicCloudStorageVolumeRow,
  PublicCloudStorageProvisionedByProvider,
  PublicCloudStorageTopVolumeResponse,
  PublicCloudStorageIopsTier,
  PublicCloudStorageTierLegendItem,
  PublicCloudProvisioningRowResponse,
  PublicCloudProvisioningTableResponse,
  PublicCloudProvisioningRow,
  PublicCloudProvisioningReachability,
  PublicCloudProvisionedByProvider,
  PublicCloudRecentlyProvisioned,
  PublicCloudProvisioningSummaryMetricsResponse,
  PublicCloudProvisioningSummaryMetric,
  PublicCloudProvisioningReachabilityLegendItem,
  PublicCloudDatabaseInventoryResponse,
  PublicCloudDatabaseSummaryMetric,
  PublicCloudDatabaseMonitoredCard,
  PublicCloudDbWorkloadRowResponse,
  PublicCloudDbWorkloadRow,
  PublicCloudDbQueryPerformanceResponse,
  PublicCloudDbQueryItem,
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
  PublicCloudRecentAlertRow,
  PublicCloudRecentAlertResponseItem,
  PublicCloudRecentAlertSeverity,
  PublicCloudRecentAlertsResponse,
  PublicCloudAlertsBySeverity,
  PublicCloudAlertsByProvider,
  PublicCloudAlertsByAge,
  PublicCloudAlertSeverityLegendItem,
  PublicCloudCostRowResponse,
  PublicCloudCostOptimizationTableResponse,
  PublicCloudCostRow,
  PublicCloudSpendVsSavings,
  PublicCloudRecommendedAction,
  PublicCloudPotentialSavingsByProvider,
  PublicCloudSpendSavingsLegendItem,
  PublicCloudCostSummaryMetric,
  PublicCloudAutoRemediationAction,
  PublicCloudAutoRemediationActionResponse,
  PublicCloudAutoRemediationKpi,
  PublicCloudAutoRemediationKpiResponse,
  PublicCloudAutoRemediationOutcome,
  PublicCloudAutoRemediationOutcomeResponse,
  PublicCloudAutoRemediationSummaryResponse,
  PublicCloudAutoRemediationSummaryViewData,
  PublicCloudRegionOption,
  PublicCloudSummaryMetric,
  PublicCloudStatusTone
} from './public-cloud-compute-dashboard.type';

@Injectable()
export class PublicCloudComputeDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService) { }

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
    if (criteria?.timeRange) {
      // Map the dropdown period to the exact backend value where they differ (e.g. last_24_hours -> last_24_hrs).
      params = params.set('time_range', PUBLIC_CLOUD_TIME_RANGE_PARAM_MAP[criteria.timeRange] || criteria.timeRange);
    }
    if (criteria?.startDate) {
      params = params.set('start_datetime', criteria.startDate);
    }
    if (criteria?.endDate) {
      params = params.set('end_datetime', criteria.endDate);
    }
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

  getComputeMonitored(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudComputeMonitoredResponse> {
    return this.http.get<PublicCloudComputeMonitoredResponse>(PUBLIC_CLOUD_COMPUTE_MONITORED_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getCloudProviderDistribution(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudProviderDistributionResponse> {
    return this.http.get<PublicCloudProviderDistributionResponse>(PUBLIC_CLOUD_CLOUD_PROVIDER_DISTRIBUTION_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getUtilizationByProvider(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudUtilizationByProviderResponse> {
    return this.http.get<PublicCloudUtilizationByProviderResponse>(PUBLIC_CLOUD_UTILIZATION_BY_PROVIDER_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getComputeInstanceByOsType(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudOsTypeResponse> {
    return this.http.get<PublicCloudOsTypeResponse>(PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_OS_TYPE_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getAlertsSeverity(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertsSeverityResponse> {
    return this.http.get<PublicCloudAlertsSeverityResponse>(PUBLIC_CLOUD_ALERTS_SEVERITY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getInventorySummaryStaticResponse(): PublicCloudInventorySummaryResponse {
    return PUBLIC_CLOUD_INVENTORY_SUMMARY_RESPONSE;
  }

  getComputeMonitoredStaticResponse(): PublicCloudComputeMonitoredResponse {
    return PUBLIC_CLOUD_COMPUTE_MONITORED_RESPONSE;
  }

  getCloudProviderDistributionStaticResponse(): PublicCloudProviderDistributionResponse {
    return PUBLIC_CLOUD_CLOUD_PROVIDER_DISTRIBUTION_RESPONSE;
  }

  getUtilizationByProviderStaticResponse(): PublicCloudUtilizationByProviderResponse {
    return PUBLIC_CLOUD_UTILIZATION_BY_PROVIDER_RESPONSE;
  }

  getComputeInstanceByOsTypeStaticResponse(): PublicCloudOsTypeResponse {
    return PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_OS_TYPE_RESPONSE;
  }

  getAlertsSeverityStaticResponse(): PublicCloudAlertsSeverityResponse {
    return PUBLIC_CLOUD_ALERTS_SEVERITY_RESPONSE;
  }

  convertToSummaryMetricsViewData(data: PublicCloudInventorySummaryResponse): PublicCloudSummaryMetric[] {
    const summary = (data || {}) as Record<string, number>;
    return PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG.map(item => ({
      key: item.key,
      label: item.label,
      tone: item.tone,
      value: this.formatNumber(summary[item.key])
    }));
  }

  convertToComputeMonitoredViewData(data: PublicCloudComputeMonitoredResponse): PublicCloudComputeMonitoredCard[] {
    const rows = Array.isArray(data) ? data : [];
    return rows.map(row => {
      const key = this.normalizePlatformValue(row?.provider) as PublicCloudProviderDistributionKey;
      const config = PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG[key];
      const totalCompute = this.getNumberValue(row?.total_compute);
      const running = this.getNumberValue(row?.running);
      const stopped = this.getNumberValue(row?.stopped);
      const unknown = this.getNumberValue(row?.unknown);
      const toPercent = (value: number) => totalCompute > 0 ? (value / totalCompute) * 100 : 0;
      return {
        key,
        provider: config ? config.name : String(row?.provider || '').toUpperCase(),
        iconClass: PUBLIC_CLOUD_PROVIDER_ICON_CONFIG[key] || 'fas fa-cloud',
        color: config ? config.color : '#5a7ed8',
        totalCompute,
        monitored: this.getNumberValue(row?.monitored),
        running,
        stopped,
        unknown,
        runningPercent: toPercent(running),
        stoppedPercent: toPercent(stopped),
        unknownPercent: toPercent(unknown)
      };
    }).sort((first, second) => this.getProviderOrderIndex(first.key) - this.getProviderOrderIndex(second.key));
  }

  convertToProviderDistributionViewData(data: PublicCloudProviderDistributionResponse): PublicCloudProviderDistributionItem[] {
    return (data?.distribution || []).map(item => {
      const key = this.normalizePlatformValue(item?.provider) as PublicCloudProviderDistributionKey;
      const config = PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG[key];
      return {
        key,
        name: config ? config.name : String(item?.provider || '').toUpperCase(),
        count: this.getNumberValue(item?.count),
        value: this.getNumberValue(item?.percentage),
        color: config ? config.color : '#5a7ed8'
      };
    }).sort((first, second) => this.getProviderOrderIndex(first.key) - this.getProviderOrderIndex(second.key));
  }

  getProviderDistributionTotalLabel(data: PublicCloudProviderDistributionResponse): string {
    return this.formatNumber(this.getNumberValue(data?.total_compute_instances));
  }

  convertToProviderDistributionOptions(data: PublicCloudProviderDistributionItem[], totalLabel = ''): EChartsOption {
    const points = (data || []).map(item => ({
      name: item.name,
      key: item.key,
      value: item.count,
      color: item.color,
      tooltipLabel: `${item.name}: ${this.formatNumber(item.count)} (${item.value}%)`
    }));
    return this.getDonutOptions(points, totalLabel);
  }

  convertToOsTypeViewData(data: PublicCloudOsTypeResponse): PublicCloudOsTypeItem[] {
    const values = PUBLIC_CLOUD_OS_TYPE_CONFIG.map(config => ({ config, value: this.getNumberValue(data?.[config.key]) }));
    const total = this.getNumberValue(data?.total) || values.reduce((sum, item) => sum + item.value, 0);
    return values.map(item => ({
      key: item.config.key,
      label: item.config.label,
      value: item.value,
      percent: total ? Math.round((item.value / total) * 100) : 0,
      color: item.config.color
    }));
  }

  getOsTypeTotalLabel(data: PublicCloudOsTypeResponse): string {
    const total = this.getNumberValue(data?.total) ||
      PUBLIC_CLOUD_OS_TYPE_CONFIG.reduce((sum, config) => sum + this.getNumberValue(data?.[config.key]), 0);
    return this.formatNumber(total);
  }

  convertToOsTypeOptions(data: PublicCloudOsTypeItem[], totalLabel = ''): EChartsOption {
    const points = (data || []).map(item => ({
      name: item.label,
      key: item.key,
      value: item.value,
      color: item.color,
      tooltipLabel: `${item.label}: ${this.formatNumber(item.value)} (${item.percent}%)`
    }));
    return this.getDonutOptions(points, totalLabel);
  }

  hasOsTypeData(data: PublicCloudOsTypeItem[]): boolean {
    return (data || []).some(item => item.value > 0);
  }

  convertToUtilizationByProviderOptions(data: PublicCloudUtilizationByProviderResponse): EChartsOption {
    const providerKeys = PUBLIC_CLOUD_PROVIDER_ORDER;
    const labels = providerKeys.map(key => PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG[key].name);
    const series: any[] = PUBLIC_CLOUD_UTILIZATION_SERIES_CONFIG.map(config => ({
      name: config.label,
      type: 'bar',
      barMaxWidth: 14,
      itemStyle: { color: config.color, borderRadius: [3, 3, 0, 0] },
      data: providerKeys.map(key => this.getNumberValue(data?.[key]?.[config.key]))
    }));
    return {
      color: PUBLIC_CLOUD_UTILIZATION_SERIES_CONFIG.map(config => config.color),
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { show: false },
      grid: { left: 34, right: 12, top: 16, bottom: 24 },
      xAxis: {
        type: 'category',
        data: labels,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#dce2e7' } },
        axisLabel: { color: '#5c6c82', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitLine: { lineStyle: { color: '#eef1f4' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#5c6c82', fontSize: 11 }
      },
      series
    };
  }

  hasUtilizationByProviderData(data: PublicCloudUtilizationByProviderResponse): boolean {
    return PUBLIC_CLOUD_PROVIDER_ORDER.some(key =>
      PUBLIC_CLOUD_UTILIZATION_SERIES_CONFIG.some(config => this.getNumberValue(data?.[key]?.[config.key]) > 0));
  }

  convertToAlertsSeverityViewData(data: PublicCloudAlertsSeverityResponse): PublicCloudAlertsSeverityItem[] {
    return PUBLIC_CLOUD_ALERTS_SEVERITY_CONFIG.map(config => ({
      key: config.key,
      label: config.label,
      value: this.getNumberValue(data?.[config.key]),
      toneClass: config.toneClass
    }));
  }

  private getProviderOrderIndex(key: string): number {
    const index = PUBLIC_CLOUD_PROVIDER_ORDER.indexOf(key as PublicCloudProviderDistributionKey);
    return index === -1 ? PUBLIC_CLOUD_PROVIDER_ORDER.length : index;
  }

  private getDonutOptions(points: Array<{ name: string; key?: string; value: number; color: string; tooltipLabel: string }>, totalLabel: string): EChartsOption {
    return {
      color: points.map(point => point.color),
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => params?.data?.tooltipLabel || ''
      },
      title: {
        text: totalLabel,
        subtext: 'Instances',
        left: 'center',
        top: 'center',
        itemGap: 2,
        textStyle: { fontSize: 20, fontWeight: 700, color: '#2b3642' },
        subtextStyle: { fontSize: 12, color: '#6b7682' }
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '76%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: points.map(point => ({
            name: point.name,
            key: point.key,
            value: point.value,
            tooltipLabel: point.tooltipLabel,
            itemStyle: { color: point.color }
          }))
        }
      ]
    };
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
    const cells = this.getGeoHeatmapLayoutCells(data || []);
    return cells.length ? this.getGeoHeatmapOptions(cells) : {};
  }

  convertToGeoDistributionSummary(cells: PublicCloudGeoCell[]): PublicCloudGeoDistributionSummary {
    const viewCells = cells || [];
    return {
      totalLocations: viewCells.length,
      totalResources: viewCells.reduce((sum, cell) => sum + cell.totalResources, 0),
      totalAlerts: viewCells.reduce((sum, cell) => sum + cell.totalAlerts, 0)
    };
  }

  convertToGeoDistributionCloudOptions(cells: PublicCloudGeoCell[]): PublicCloudFilterOption[] {
    const options = (cells || []).reduce((result: { [key: string]: PublicCloudFilterOption }, cell) => {
      const label = cell.cloudType || 'Unknown';
      const key = this.normalizeKey(label) || 'unknown';
      if (!result[key]) {
        result[key] = { value: key, label };
      }
      return result;
    }, {});
    return [
      { value: PUBLIC_CLOUD_ALL_SELECTED_VALUE, label: 'Select All' },
      ...Object.keys(options).map(key => options[key]).sort((first, second) => first.label.localeCompare(second.label))
    ];
  }

  // The legend describes the rendered tiles, so it reads the same capped set the chart does.
  convertToGeoDistributionLegends(cells: PublicCloudGeoCell[]): PublicCloudGeoDistributionLegendItem[] {
    const legends = this.getGeoDistributionTileCells(cells).reduce((result: { [key: string]: PublicCloudGeoDistributionLegendItem }, cell) => {
      const label = cell.cloudType || 'Unknown';
      const key = this.normalizeKey(label) || 'unknown';
      if (!result[key]) {
        result[key] = { key, label, count: 0, color: cell.color || '#4a63d6' };
      }
      result[key].count += 1;
      return result;
    }, {});
    return Object.keys(legends).map(key => legends[key]);
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
    const textRow = (icon: string, iconColor: string, label: string, value: string, valueColor: string) => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:18px;height:23px;">
        <span style="display:flex;align-items:center;gap:8px;color:#5b6671;">
          <i class="fa ${icon}" style="width:14px;text-align:center;font-size:12px;color:${iconColor};"></i>${label}
        </span>
        <span style="font-weight:600;color:${valueColor};">${value}</span>
      </div>`;
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
      ${cell.cloudType ? textRow('fa-cloud', neutralIconColor, 'Cloud Type', cell.cloudType, neutralValueColor) : ''}
      ${cell.cloudType ? '<div style="border-top:1px solid #e8edf1;margin:6px 0;"></div>' : ''}
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
    const items = this.getGeoDistributionItems(payload);
    if (!items.length) {
      return [];
    }

    const colorMap = this.getGeoDistributionCloudColorMap(items.map(item => item.cloudType || 'Unknown'));
    return items.map((item, index) => ({
      name: item.name,
      cloudType: item.cloudType,
      color: colorMap[this.normalizeKey(item.cloudType || 'Unknown')] || PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS[index % PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS.length],
      value: [],
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

  private getGeoDistributionItems(payload: any): Array<{ name: string; cloudType: string; totalResources: number; totalAlerts: number; critical: number; warning: number; information: number; computeCount: number; platformServices: number; otherServices: number }> {
    const source = Array.isArray(payload) ? payload : Object.keys(payload || {}).map(key => ({
      name: key,
      ...(payload[key] || {})
    }));

    return source
      .filter(item => item && typeof item === 'object')
      .map(item => {
        const name = String(item.name || item.location || item.datacenter || item.region || item.city || 'Unknown');
        const cloudType = this.getFirstStringValue(item, ['cloud_type', 'cloudType', 'provider', 'cloud_provider', 'cloudProvider', 'platform', 'vendor']);
        const critical = this.getNumberFromPayload(item, ['critical_alerts', 'criticalAlerts', 'critical']);
        const warning = this.getNumberFromPayload(item, ['warning_alerts', 'warningAlerts', 'warning', 'warnings']);
        const information = this.getNumberFromPayload(item, ['information_alerts', 'informationAlerts', 'information', 'info', 'informative']);
        const totalAlerts = this.getNumberFromPayload(item, ['total_alerts', 'totalAlerts'], critical + warning + information);
        const computeCount = this.getNumberFromPayload(item, ['compute_count', 'computeCount', 'compute']);
        const platformServices = this.getNumberFromPayload(item, ['platform_services', 'platformServices', 'platform']);
        const otherServices = this.getNumberFromPayload(item, ['other_services', 'otherServices', 'other']);
        const totalResources = this.getNumberFromPayload(item, ['total_resources', 'totalResources', 'total', 'count'], computeCount + platformServices + otherServices);

        return { name, cloudType, totalResources, totalAlerts, critical, warning, information, computeCount, platformServices, otherServices };
      })
      .filter(item => item.name && item.totalResources > 0)
      .sort((first, second) => second.totalResources - first.totalResources);
  }

  // The cells the treemap actually paints: locations with resources, capped to the readable tile count.
  // Cells arrive sorted largest-first, so this keeps the biggest locations.
  private getGeoDistributionTileCells(cells: PublicCloudGeoCell[]): PublicCloudGeoCell[] {
    return (cells || [])
      .filter(cell => cell && cell.totalResources > 0)
      .slice(0, PUBLIC_CLOUD_GEO_DISTRIBUTION_MAX_TILES);
  }

  private getGeoHeatmapLayoutCells(cells: PublicCloudGeoCell[]): PublicCloudGeoCell[] {
    const viewCells = this.getGeoDistributionTileCells(cells);
    const layout = this.getTreemapCells(this.getReadableTreemapWeights(viewCells.map(cell => cell.totalResources)), { x: 0, y: 0, width: 100, height: 100 });
    return viewCells.map((cell, index) => ({
      ...cell,
      value: [layout[index].x, layout[index].y, layout[index].width, layout[index].height]
    }));
  }

  private getGeoDistributionCloudColorMap(cloudTypes: string[]): { [cloudType: string]: string } {
    const usedColors = new Set<string>();
    return (cloudTypes || []).reduce((result: { [cloudType: string]: string }, cloudType, index) => {
      const key = this.normalizeKey(cloudType || 'Unknown') || 'unknown';
      if (!result[key]) {
        result[key] = this.getGeoDistributionCloudColor(cloudType || 'Unknown', index, usedColors);
        usedColors.add(result[key]);
      }
      return result;
    }, {});
  }

  private getGeoDistributionCloudColor(cloudType: string, index: number, usedColors: Set<string>): string {
    const providerKeys = this.getGeoDistributionProviderKeys(cloudType);
    if (providerKeys.length === 1) {
      const color = PUBLIC_CLOUD_GEO_PROVIDER_COLORS[providerKeys[0]];
      if (color) {
        return color;
      }
    }

    const palette = PUBLIC_CLOUD_GEO_DISTRIBUTION_COLORS;
    const paletteIndex = Math.abs(this.getGeoDistributionHash(this.normalizeKey(cloudType) || String(index))) % palette.length;
    for (let offset = 0; offset < palette.length; offset++) {
      const color = palette[(paletteIndex + offset) % palette.length];
      if (!usedColors.has(color)) {
        return color;
      }
    }
    return palette[index % palette.length];
  }

  private getGeoDistributionProviderKeys(cloudType: string): string[] {
    const normalizedValue = this.normalizeKey(cloudType || '');
    const providerKeys = Object.keys(PUBLIC_CLOUD_GEO_PROVIDER_COLORS).filter(key => normalizedValue.indexOf(key) > -1);
    return providerKeys.reduce((result: string[], key) => {
      const providerKey = this.getGeoDistributionPrimaryProviderKey(key);
      if (result.indexOf(providerKey) === -1) {
        result.push(providerKey);
      }
      return result;
    }, []);
  }

  private getGeoDistributionPrimaryProviderKey(providerKey: string): string {
    const normalizedKey = this.normalizeKey(providerKey);
    if (normalizedKey.indexOf('amazon') > -1 || normalizedKey === 'aws') {
      return 'aws';
    }
    if (normalizedKey.indexOf('azure') > -1) {
      return 'azure';
    }
    if (normalizedKey.indexOf('google') > -1 || normalizedKey === 'gcp') {
      return 'gcp';
    }
    if (normalizedKey.indexOf('oracle') > -1 || normalizedKey === 'oci') {
      return 'oci';
    }
    return normalizedKey;
  }

  private getGeoDistributionHash(value: string): number {
    return String(value || '').split('').reduce((result, char) => ((result << 5) - result) + char.charCodeAt(0), 0);
  }

  private getReadableTreemapWeights(weights: number[]): number[] {
    const values = (weights || []).map(weight => Math.max(Number(weight) || 0, 0));
    const maxWeight = values.reduce((max, weight) => Math.max(max, weight), 0);
    if (values.length <= 1 || maxWeight <= 0) {
      return values;
    }

    const minimumWeight = maxWeight * 0.06;
    return values.map(weight => weight > 0 ? Math.max(weight, minimumWeight) : weight);
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
   * -----Start----- Account - Subscription - Project Metrics Widget Related -------------------
   */
  getAccountSubscriptionProjectMetrics(criteria?: PublicCloudDashboardFilterCriteria, search = '', page = 1, pageSize = 10): Observable<PublicCloudAccountSubscriptionMetricsApiResponse> {
    let params = this.convertFiltersToApiParams(criteria);
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    return this.http.get<PublicCloudAccountSubscriptionMetricsApiResponse>(PUBLIC_CLOUD_ACCOUNT_SUBSCRIPTION_PROJECT_METRICS_ENDPOINT, { params });
  }

  getAccountSubscriptionProjectMetricsStaticResponse(search = '', page = 1, pageSize = 10): PublicCloudAccountSubscriptionMetricsResponse {
    const rows = PUBLIC_CLOUD_ACCOUNT_SUBSCRIPTION_PROJECT_METRICS_RESPONSE || [];
    const normalizedSearch = String(search || '').toLowerCase().trim();
    const filteredRows = normalizedSearch
      ? rows.filter(row => [row.provider, row.accountName, row.account_name, row.account, row.subscription, row.project, row.compartment, row.region]
        .some(value => String(value || '').toLowerCase().indexOf(normalizedSearch) > -1))
      : rows;
    const startIndex = (page - 1) * pageSize;
    return {
      count: filteredRows.length,
      results: filteredRows.slice(startIndex, startIndex + pageSize)
    };
  }

  getComputeInstanceByAccount(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAccountMetricChartResponse> {
    return this.http.get<PublicCloudAccountMetricChartResponse>(PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_ACCOUNT_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getEstimatedMonthlyCostByAccount(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAccountMetricChartResponse> {
    return this.http.get<PublicCloudAccountMetricChartResponse>(PUBLIC_CLOUD_ESTIMATED_MONTHLY_COST_BY_ACCOUNT_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getVcpuUtilizationByAccount(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAccountMetricChartResponse> {
    return this.http.get<PublicCloudAccountMetricChartResponse>(PUBLIC_CLOUD_VCPU_UTILIZATION_BY_ACCOUNT_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getCostEfficiencyByAccount(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAccountMetricChartResponse> {
    return this.http.get<PublicCloudAccountMetricChartResponse>(PUBLIC_CLOUD_COST_EFFICIENCY_BY_ACCOUNT_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getComputeInstanceByAccountStaticResponse(): PublicCloudAccountMetricChartResponse {
    return PUBLIC_CLOUD_COMPUTE_INSTANCE_BY_ACCOUNT_RESPONSE;
  }

  getEstimatedMonthlyCostByAccountStaticResponse(): PublicCloudAccountMetricChartResponse {
    return PUBLIC_CLOUD_ESTIMATED_MONTHLY_COST_BY_ACCOUNT_RESPONSE;
  }

  getVcpuUtilizationByAccountStaticResponse(): PublicCloudAccountMetricChartResponse {
    return PUBLIC_CLOUD_VCPU_UTILIZATION_BY_ACCOUNT_RESPONSE;
  }

  getCostEfficiencyByAccountStaticResponse(): PublicCloudAccountMetricChartResponse {
    return PUBLIC_CLOUD_COST_EFFICIENCY_BY_ACCOUNT_RESPONSE;
  }

  convertToAccountSubscriptionMetricRows(data: PublicCloudAccountSubscriptionMetricsApiResponse): PublicCloudAccountSubscriptionMetricRow[] {
    return this.getAccountSubscriptionMetricResults(data).map(item => {
      const usedVcpu = this.getFirstNumericValue(item.usedVcpu, item.used_vcpu) || 0;
      const totalVcpu = this.getFirstNumericValue(item.totalVcpu, item.total_vcpu) || 0;
      const vcpuPercent = totalVcpu ? Math.min(Math.round((usedVcpu / totalVcpu) * 1000) / 10, 100) : 0;
      const monthlyCost = this.getFirstNumericValue(item.estimatedMonthlyCost, item.estimated_monthly_cost, item.monthlyCost, item.monthly_cost) || 0;
      const vcpuTone: PublicCloudStatusTone = vcpuPercent > 70 ? 'warning' : 'success';
      return {
        provider: this.getFirstValue(item.provider),
        account: this.getFirstValue(item.accountName, item.account_name, item.account, item.subscription, item.project, item.compartment),
        region: this.getFirstValue(item.region),
        instanceCount: this.getFirstNumericValue(item.instanceCount, item.instance_count) || 0,
        usedVcpu,
        totalVcpu,
        vcpuPercent,
        vcpuTone,
        estimatedMonthlyCost: monthlyCost,
        estimatedMonthlyCostLabel: `$${this.formatNumber(monthlyCost)}`
      };
    }).filter(row => !!row.provider && !!row.account);
  }

  getAccountSubscriptionProjectMetricsTotal(data: PublicCloudAccountSubscriptionMetricsApiResponse): number {
    if (Array.isArray(data)) {
      return data.length;
    }
    return Number(data?.count || data?.total || 0) || this.getAccountSubscriptionMetricResults(data).length;
  }

  convertToAccountSubscriptionInstanceChartOptions(data: PublicCloudAccountMetricChartResponse): EChartsOption {
    return this.getAccountMetricChartOptions(data, 'Compute Instance by Account', item => this.getFirstNumericValue(item.instance_count) || 0);
  }

  convertToAccountSubscriptionCostChartOptions(data: PublicCloudAccountMetricChartResponse): EChartsOption {
    return this.getAccountMetricChartOptions(data, 'Est. Monthly Cost by Account', item => this.getFirstNumericValue(item.estimated_monthly_cost) || 0);
  }

  convertToAccountSubscriptionVcpuChartOptions(data: PublicCloudAccountMetricChartResponse): EChartsOption {
    return this.getAccountMetricChartOptions(data, 'vCPU Utilization by Account', item => this.getFirstNumericValue(item.vcpu_utilization) || 0, 'vCPU %');
  }

  convertToAccountSubscriptionEfficiencyChartOptions(data: PublicCloudAccountMetricChartResponse): EChartsOption {
    return this.getAccountMetricChartOptions(data, 'Cost Efficiency ($/Compute Instance) by Account', item => this.getFirstNumericValue(item.cost_per_instance) || 0);
  }

  private getAccountSubscriptionMetricResults(data: PublicCloudAccountSubscriptionMetricsApiResponse): PublicCloudAccountSubscriptionMetricResponseItem[] {
    if (Array.isArray(data)) {
      return data;
    }
    return data?.results || data?.data || data?.items || [];
  }

  private getAccountMetricChartOptions(rows: PublicCloudAccountMetricChartResponse, title: string, valueGetter: (row: PublicCloudAccountMetricChartResponseItem) => number, legendName = ''): EChartsOption {
    if (!(rows || []).length) {
      return {};
    }
    const chartRows = (rows || []).slice(0, 12);
    const labels = chartRows.map(row => row.account);
    return {
      color: chartRows.map(row => this.getAccountSubscriptionProviderColor(row.provider)),
      title: {
        text: title,
        left: 'center',
        top: 8,
        textStyle: {
          color: '#2e4055',
          fontSize: 13,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: legendName ? {
        bottom: 6,
        left: 'center',
        data: [legendName],
        icon: 'roundRect',
        itemWidth: 14,
        itemHeight: 14,
        textStyle: { color: '#2e4055', fontSize: 13 }
      } : undefined,
      grid: {
        left: 8,
        right: 20,
        top: 46,
        bottom: legendName ? 30 : 8,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#dce2e7' } },
        axisLabel: {
          color: '#5c6c82',
          fontSize: 11,
          interval: 0,
          rotate: 35
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitLine: { lineStyle: { color: '#e7ecf0' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#5c6c82', fontSize: 11 }
      },
      series: [
        {
          name: legendName || title,
          type: 'bar',
          barMaxWidth: 36,
          data: chartRows.map(row => ({
            value: valueGetter(row),
            itemStyle: {
              color: this.getAccountSubscriptionProviderColor(row.provider),
              borderRadius: [3, 3, 0, 0]
            }
          }))
        }
      ]
    };
  }

  private getAccountSubscriptionProviderColor(provider: string): string {
    switch (this.normalizePlatformValue(provider)) {
      case 'aws':
        return '#ff9900';
      case 'azure':
        return '#087ccc';
      case 'gcp':
        return '#34a853';
      case 'oci':
      case 'oracle':
        return '#c94736';
      default:
        return '#5a7ed8';
    }
  }
  /*
   * ******End ****** Account - Subscription - Project Metrics Widget Related ********************
   */

  /*
   * -----Start----- Capacity and Performance Widget Related -------------------
   */
  getCapacityPerformanceTable(criteria?: PublicCloudDashboardFilterCriteria, search = '', page = 1, pageSize = 10): Observable<PublicCloudCapacityPerformanceTableResponse> {
    let params = this.convertFiltersToApiParams(criteria);
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    return this.http.get<PublicCloudCapacityPerformanceTableResponse>(PUBLIC_CLOUD_CAPACITY_PERFORMANCE_TABLE_ENDPOINT, { params });
  }

  getCapacityPerformanceCharts(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudCapacityPerformanceChartsResponse> {
    return this.http.get<PublicCloudCapacityPerformanceChartsResponse>(PUBLIC_CLOUD_CAPACITY_PERFORMANCE_CHARTS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getCapacityPerformanceTableStaticResponse(search = '', page = 1, pageSize = 10): PublicCloudCapacityPerformanceTableResponse {
    const rows = PUBLIC_CLOUD_CAPACITY_PERFORMANCE_TABLE_RESPONSE || [];
    const normalizedSearch = String(search || '').toLowerCase().trim();
    const filteredRows = normalizedSearch
      ? rows.filter(row => [row.name, row.provider, row.region, row.account, row.type, row.os]
        .some(value => String(value || '').toLowerCase().indexOf(normalizedSearch) > -1))
      : rows;
    const startIndex = (page - 1) * pageSize;
    return {
      count: filteredRows.length,
      results: filteredRows.slice(startIndex, startIndex + pageSize)
    };
  }

  getCapacityPerformanceChartsStaticResponse(): PublicCloudCapacityPerformanceChartsResponse {
    return PUBLIC_CLOUD_CAPACITY_PERFORMANCE_CHARTS_RESPONSE;
  }

  convertToCapacityPerformanceRows(data: PublicCloudCapacityPerformanceTableResponse): PublicCloudCapacityPerformanceRow[] {
    return this.getCapacityPerformanceResults(data).map(row => {
      const cpuPct = this.getNumberValue(row?.cpuPct);
      const memPct = this.getNumberValue(row?.memPct);
      const forecast = this.getNumberValue(row?.cpuForecast90d);
      const trend = Array.isArray(row?.cpuTrend) ? row.cpuTrend.map(value => this.getNumberValue(value)) : [];
      const forecastDirection: 'up' | 'down' | '' = forecast > cpuPct ? 'up' : (forecast < cpuPct ? 'down' : '');
      return {
        id: this.getFirstValue(row?.id),
        name: this.getFirstValue(row?.name),
        providerKey: this.normalizePlatformValue(row?.provider),
        provider: this.getFirstValue(row?.provider),
        region: this.getFirstValue(row?.region),
        type: this.getFirstValue(row?.type),
        os: this.getFirstValue(row?.os),
        statusLabel: this.getCapacityStateLabel(row?.state),
        statusIconClass: this.getCapacityStateIconClass(row?.state),
        cpuPct,
        cpuLabel: `${this.formatCapacityDecimal(cpuPct)}% CPU`,
        cpuTone: this.getCapacityStatusTone(row?.cpuStatus),
        memoryPct: memPct,
        memoryLabel: `${this.formatCapacityDecimal(memPct)}% Mem`,
        memoryTone: this.getCapacityStatusTone(row?.memStatus),
        availableMemory: this.getFirstValue(row?.availableMemory) || 'N/A',
        diskIops: `${this.formatNumber(this.getNumberValue(row?.diskIOPS))} IOPS`,
        diskThroughput: `${this.formatCapacityDecimal(this.getNumberValue(row?.diskThroughputMBs))} MB/s`,
        networkThroughput: `${this.formatCapacityDecimal(this.getNumberValue(row?.netThroughputMbps))} Mbps`,
        networkColor: this.getCapacityStatusColor(row?.netStatus),
        cpuTrendPoints: this.getCapacitySparklinePoints(trend),
        cpuTrendColor: this.getCapacityTrendColor(trend),
        hasCpuTrend: trend.length > 1,
        forecastLabel: `${this.formatCapacityDecimal(forecast)}%`,
        forecastDirection,
        forecastColor: forecastDirection === 'up' ? PUBLIC_CLOUD_CAPACITY_STATUS_COLORS.critical : (forecastDirection === 'down' ? PUBLIC_CLOUD_CAPACITY_STATUS_COLORS.info : '#6b7682')
      };
    }).filter(row => !!row.name);
  }

  getCapacityPerformanceTotal(data: PublicCloudCapacityPerformanceTableResponse): number {
    return Number(data?.count || 0) || this.getCapacityPerformanceResults(data).length;
  }

  convertToCapacityFleetStatusOptions(data: PublicCloudCapacityFleetStatus): EChartsOption {
    if (!(data?.labels || []).length || !(data?.series || []).length) {
      return {};
    }
    const series: any[] = (data?.series || []).map(item => ({
      name: item.label,
      type: 'bar',
      barMaxWidth: 16,
      itemStyle: { color: this.getCapacityStatusColor(item.status), borderRadius: [3, 3, 0, 0] },
      data: item.data || []
    }));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { show: false },
      grid: { left: 34, right: 12, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: data?.labels || [], axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      series
    };
  }

  convertToCapacityCpuDistributionOptions(data: PublicCloudCapacityCpuDistribution): EChartsOption {
    const bands = (data?.bands && data.bands.length) ? data.bands : (data?.labels || []).map((label, index) => ({
      label,
      status: (data?.statuses || [])[index],
      count: (data?.counts || [])[index]
    }));
    const points: any[] = bands.map(band => ({
      value: this.getNumberValue(band.count),
      itemStyle: { color: this.getCapacityStatusColor(band.status), borderRadius: [3, 3, 0, 0] }
    }));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 34, right: 12, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: bands.map(band => band.label), axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      series: [{ type: 'bar', barMaxWidth: 34, data: points }]
    };
  }

  convertToCapacityTopOptions(data: PublicCloudCapacityTopItem[], valueSuffix = ''): EChartsOption {
    // Data is highest-first; ECharts category axis renders bottom-up, so reverse for top-down display.
    const items = (data || []).slice().reverse();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)}${valueSuffix ? ' ' + valueSuffix : ''}` : '';
        }
      },
      grid: { left: 130, right: 44, top: 6, bottom: 6 },
      xAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 10 } },
      yAxis: { type: 'category', data: items.map(item => item.name), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: '#4a5b6b', fontSize: 10 } },
      series: [{
        type: 'bar',
        barMaxWidth: 13,
        label: { show: true, position: 'right', color: '#4a5b6b', fontSize: 10, formatter: (params: any) => this.formatNumber(params.value) },
        data: items.map(item => ({ value: this.getNumberValue(item.value), itemStyle: { color: this.getAccountSubscriptionProviderColor(item.provider), borderRadius: [0, 3, 3, 0] } }))
      }]
    };
  }

  convertToCapacityGrowthOptions(data: PublicCloudCapacityGrowthInsights): EChartsOption {
    const months = data?.months || [];
    const forecastMonths = data?.forecastMonths || [];
    const history = (data?.cpuHistory || []).map(value => this.getNumberValue(value));
    const forecast = (data?.cpuForecast || []).map(value => this.getNumberValue(value));
    const labels = [...months, ...forecastMonths];
    const historyData: Array<number | null> = labels.map((label, index) => index < history.length ? history[index] : null);
    const forecastData: Array<number | null> = labels.map(() => null);
    if (history.length > 0) {
      forecastData[history.length - 1] = history[history.length - 1];
      forecast.forEach((value, index) => { forecastData[history.length + index] = value; });
    }
    return {
      color: ['#2f6fed'],
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      grid: { left: 36, right: 16, top: 12, bottom: 24 },
      xAxis: { type: 'category', boundaryGap: false, data: labels, axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 10 } },
      yAxis: { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 10 } },
      series: [
        { name: 'CPU %', type: 'line', smooth: true, showSymbol: true, symbolSize: 6, lineStyle: { color: '#2f6fed', width: 2 }, itemStyle: { color: '#2f6fed' }, data: historyData },
        { name: 'CPU % Forecast', type: 'line', smooth: true, showSymbol: true, symbolSize: 6, lineStyle: { color: '#2f6fed', width: 2, type: 'dashed' }, itemStyle: { color: '#2f6fed' }, data: forecastData }
      ]
    };
  }

  private getCapacityPerformanceResults(data: PublicCloudCapacityPerformanceTableResponse): PublicCloudCapacityPerformanceRowResponse[] {
    if (Array.isArray(data)) {
      return data;
    }
    return data?.results || data?.data || data?.items || [];
  }

  private getCapacityStateLabel(state?: string): string {
    switch (String(state || '').toLowerCase()) {
      case 'running':
        return 'Running';
      case 'idle':
        return 'Idle';
      case 'stopped':
        return 'Stopped';
      default:
        return this.getFirstValue(state) || 'Unknown';
    }
  }

  private getCapacityStateIconClass(state?: string): string {
    switch (String(state || '').toLowerCase()) {
      case 'running':
        return 'fas fa-play-circle text-success';
      case 'idle':
        return 'fas fa-pause-circle text-warning';
      case 'stopped':
        return 'fas fa-stop-circle text-danger';
      default:
        return 'fas fa-circle text-muted';
    }
  }

  private getCapacityStatusColor(status?: string): string {
    return PUBLIC_CLOUD_CAPACITY_STATUS_COLORS[String(status || '').toLowerCase()] || '#c9cdd3';
  }

  private getCapacityStatusTone(status?: string): PublicCloudStatusTone {
    switch (String(status || '').toLowerCase()) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'success';
      default:
        return 'muted';
    }
  }

  private getCapacitySparklinePoints(trend: number[]): string {
    const values = trend || [];
    if (values.length < 2) {
      return '';
    }
    const width = 80;
    const height = 24;
    const maxScale = 100;
    return values.map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (Math.max(0, Math.min(value, maxScale)) / maxScale) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  private getCapacityTrendColor(trend: number[]): string {
    const values = trend || [];
    if (values.length < 2) {
      return '#9aa6b2';
    }
    const delta = values[values.length - 1] - values[0];
    if (delta > 0) {
      return PUBLIC_CLOUD_CAPACITY_STATUS_COLORS.critical;
    }
    if (delta < 0) {
      return PUBLIC_CLOUD_CAPACITY_STATUS_COLORS.info;
    }
    return '#9aa6b2';
  }

  private formatCapacityDecimal(value: number): string {
    const numericValue = Number(value || 0);
    return isNaN(numericValue) ? '0' : numericValue.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  /*
   * ******End ****** Capacity and Performance Widget Related ********************
   */

  /*
   * -----Start----- Storage - Volumes / Disks Widget Related -------------------
   */
  getStorageVolumesTable(criteria?: PublicCloudDashboardFilterCriteria, search = '', page = 1, pageSize = 10): Observable<PublicCloudStorageVolumesTableResponse> {
    let params = this.convertFiltersToApiParams(criteria);
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    return this.http.get<PublicCloudStorageVolumesTableResponse>(PUBLIC_CLOUD_STORAGE_VOLUMES_DISKS_ENDPOINT, { params });
  }

  getStorageProvisionedByProvider(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageProvisionedByProvider[]> {
    return this.http.get<PublicCloudStorageProvisionedByProvider[]>(PUBLIC_CLOUD_STORAGE_PROVISIONED_BY_PROVIDER_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getStorageTopVolumesByDiskIops(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageTopVolumeResponse[]> {
    return this.http.get<PublicCloudStorageTopVolumeResponse[]>(PUBLIC_CLOUD_STORAGE_TOP_VOLUMES_IOPS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getStorageIopsTierDistribution(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudStorageIopsTier[]> {
    return this.http.get<PublicCloudStorageIopsTier[]>(PUBLIC_CLOUD_STORAGE_IOPS_TIER_DISTRIBUTION_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getStorageVolumesTableStaticResponse(search = '', page = 1, pageSize = 10): PublicCloudStorageVolumesTableResponse {
    const rows = PUBLIC_CLOUD_STORAGE_VOLUMES_DISKS_RESPONSE || [];
    const normalizedSearch = String(search || '').toLowerCase().trim();
    const filteredRows = normalizedSearch
      ? rows.filter(row => [row.volume_name, row.attached_instance, row.provider, row.volume_type, row.iops_tier]
        .some(value => String(value || '').toLowerCase().indexOf(normalizedSearch) > -1))
      : rows;
    const startIndex = (page - 1) * pageSize;
    return {
      count: filteredRows.length,
      results: filteredRows.slice(startIndex, startIndex + pageSize)
    };
  }

  getStorageProvisionedByProviderStaticResponse(): PublicCloudStorageProvisionedByProvider[] {
    return PUBLIC_CLOUD_STORAGE_PROVISIONED_BY_PROVIDER_RESPONSE;
  }

  getStorageTopVolumesStaticResponse(): PublicCloudStorageTopVolumeResponse[] {
    return PUBLIC_CLOUD_STORAGE_TOP_VOLUMES_IOPS_RESPONSE;
  }

  getStorageIopsTierDistributionStaticResponse(): PublicCloudStorageIopsTier[] {
    return PUBLIC_CLOUD_STORAGE_IOPS_TIER_DISTRIBUTION_RESPONSE;
  }

  convertToStorageVolumeRows(data: PublicCloudStorageVolumesTableResponse): PublicCloudStorageVolumeRow[] {
    return this.getStorageVolumeResults(data).map(row => {
      const iopsThroughput = this.splitStorageIopsThroughput(row?.disk_iops_throughput);
      const size = this.getNumberValue(row?.size_gb);
      return {
        volumeName: this.getFirstValue(row?.volume_name),
        attachedInstance: this.getFirstValue(row?.attached_instance) || 'N/A',
        providerKey: this.normalizePlatformValue(row?.provider),
        provider: this.getFirstValue(row?.provider),
        volumeType: this.getFirstValue(row?.volume_type) || 'N/A',
        sizeLabel: (row?.size_gb === null || row?.size_gb === undefined) ? 'N/A' : `${this.formatNumber(size)} GB`,
        diskIops: iopsThroughput.iops,
        diskThroughput: iopsThroughput.throughput,
        iopsTier: this.getFirstValue(row?.iops_tier) || 'N/A'
      };
    }).filter(row => !!row.volumeName);
  }

  getStorageVolumesTotal(data: PublicCloudStorageVolumesTableResponse): number {
    return Number(data?.count || 0) || this.getStorageVolumeResults(data).length;
  }

  convertToStorageProvisionedByProviderOptions(data: PublicCloudStorageProvisionedByProvider[]): EChartsOption {
    const items = (data || []).filter(item => !!this.getFirstValue(item?.provider));
    const total = items.reduce((sum, item) => sum + this.getNumberValue(item.total_provisioned_storage_gb), 0);
    if (!items.length || total <= 0) {
      return {};
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)} GB` : '';
        }
      },
      grid: { left: 52, right: 16, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: items.map(item => this.getFirstValue(item.provider)), axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      series: [{
        type: 'bar',
        barMaxWidth: 40,
        data: items.map(item => ({
          value: this.getNumberValue(item.total_provisioned_storage_gb),
          itemStyle: { color: this.getAccountSubscriptionProviderColor(item.provider), borderRadius: [3, 3, 0, 0] }
        }))
      }]
    };
  }

  convertToStorageTopVolumesOptions(data: PublicCloudStorageTopVolumeResponse[]): EChartsOption {
    // Data is highest-first; ECharts category axis renders bottom-up, so reverse for top-down display.
    const items = (data || []).slice().reverse();
    const total = items.reduce((sum, item) => sum + this.getNumberValue(item.disk_iops), 0);
    if (!items.length || total <= 0) {
      return {};
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)} IOPS` : '';
        }
      },
      grid: { left: 130, right: 44, top: 6, bottom: 6 },
      xAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 10 } },
      yAxis: { type: 'category', data: items.map(item => this.getStorageTopVolumeLabel(item)), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: '#4a5b6b', fontSize: 10 } },
      series: [{
        type: 'bar',
        barMaxWidth: 13,
        label: { show: true, position: 'right', color: '#4a5b6b', fontSize: 10, formatter: (params: any) => this.formatNumber(params.value) },
        data: items.map(item => ({ value: this.getNumberValue(item.disk_iops), itemStyle: { color: this.getAccountSubscriptionProviderColor(item.provider), borderRadius: [0, 3, 3, 0] } }))
      }]
    };
  }

  convertToStorageIopsTierOptions(data: PublicCloudStorageIopsTier[]): EChartsOption {
    const tiers = (data || []).filter(tier => this.getNumberValue(tier?.volume_count) > 0);
    if (!tiers.length) {
      return {};
    }
    const total = tiers.reduce((sum, tier) => sum + this.getNumberValue(tier.volume_count), 0);
    return {
      color: tiers.map(tier => this.getStorageTierColor(tier.performance_tier)),
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params?.name}: ${this.formatNumber(params?.value)} volumes`
      },
      title: {
        text: this.formatNumber(total),
        subtext: 'Volumes',
        left: 'center',
        top: 'center',
        itemGap: 2,
        textStyle: { fontSize: 20, fontWeight: 700, color: '#2b3642' },
        subtextStyle: { fontSize: 12, color: '#6b7682' }
      },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: tiers.map(tier => ({
          name: this.getFirstValue(tier.performance_tier),
          value: this.getNumberValue(tier.volume_count),
          itemStyle: { color: this.getStorageTierColor(tier.performance_tier) }
        }))
      }]
    };
  }

  convertToStorageTierLegend(data: PublicCloudStorageIopsTier[]): PublicCloudStorageTierLegendItem[] {
    return (data || []).filter(tier => this.getNumberValue(tier?.volume_count) > 0).map(tier => ({
      label: this.getFirstValue(tier.performance_tier),
      count: this.getNumberValue(tier.volume_count),
      color: this.getStorageTierColor(tier.performance_tier)
    }));
  }

  private getStorageVolumeResults(data: PublicCloudStorageVolumesTableResponse): PublicCloudStorageVolumeRowResponse[] {
    if (Array.isArray(data)) {
      return data;
    }
    return data?.results || data?.data || data?.items || [];
  }

  private getStorageTopVolumeLabel(item: PublicCloudStorageTopVolumeResponse): string {
    const attached = this.getFirstValue(item?.attached_instance);
    return (attached && attached.toUpperCase() !== 'N/A') ? attached : this.getFirstValue(item?.volume_name);
  }

  // disk_iops_throughput arrives as a single string ("<iops> IOPS / <throughput> MB/s" or "N/A");
  // split it into the two display lines the table shows (IOPS on top, throughput below).
  private splitStorageIopsThroughput(value?: string): { iops: string; throughput: string } {
    const raw = this.getFirstValue(value);
    if (!raw || raw.toUpperCase() === 'N/A') {
      return { iops: 'N/A', throughput: '' };
    }
    const parts = raw.split('/');
    return { iops: (parts[0] || '').trim(), throughput: (parts[1] || '').trim() };
  }

  private getStorageTierColor(tier?: string): string {
    return PUBLIC_CLOUD_STORAGE_IOPS_TIER_COLORS[String(tier || '').toLowerCase()] || '#c9cdd3';
  }
  /*
   * ******End ****** Storage - Volumes / Disks Widget Related ********************
   */

  /*
   * -----Start----- Instance Provisioning Summary Widget Related -------------------
   */
  getInstanceProvisioningTable(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudProvisioningTableResponse> {
    return this.http.get<PublicCloudProvisioningTableResponse>(PUBLIC_CLOUD_INSTANCE_PROVISIONING_SUMMARY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getProvisioningReachability(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudProvisioningReachability> {
    return this.http.get<PublicCloudProvisioningReachability>(PUBLIC_CLOUD_PROVISIONING_REACHABILITY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getProvisionedByProvider(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudProvisionedByProvider[]> {
    return this.http.get<PublicCloudProvisionedByProvider[]>(PUBLIC_CLOUD_PROVISIONED_BY_PROVIDER_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getRecentlyProvisioned(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudRecentlyProvisioned[]> {
    return this.http.get<PublicCloudRecentlyProvisioned[]>(PUBLIC_CLOUD_RECENTLY_PROVISIONED_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getProvisioningSummaryMetrics(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudProvisioningSummaryMetricsResponse> {
    return this.http.get<PublicCloudProvisioningSummaryMetricsResponse>(PUBLIC_CLOUD_PROVISIONING_SUMMARY_METRICS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getInstanceProvisioningTableStaticResponse(): PublicCloudProvisioningRowResponse[] {
    return PUBLIC_CLOUD_INSTANCE_PROVISIONING_SUMMARY_RESPONSE;
  }

  getProvisioningReachabilityStaticResponse(): PublicCloudProvisioningReachability {
    return PUBLIC_CLOUD_PROVISIONING_REACHABILITY_RESPONSE;
  }

  getProvisionedByProviderStaticResponse(): PublicCloudProvisionedByProvider[] {
    return PUBLIC_CLOUD_PROVISIONED_BY_PROVIDER_RESPONSE;
  }

  getRecentlyProvisionedStaticResponse(): PublicCloudRecentlyProvisioned[] {
    return PUBLIC_CLOUD_RECENTLY_PROVISIONED_RESPONSE;
  }

  getProvisioningSummaryMetricsStaticResponse(): PublicCloudProvisioningSummaryMetricsResponse {
    return PUBLIC_CLOUD_PROVISIONING_SUMMARY_METRICS_RESPONSE;
  }

  convertToProvisioningRows(data: PublicCloudProvisioningTableResponse | PublicCloudProvisioningRowResponse[]): PublicCloudProvisioningRow[] {
    return this.getProvisioningResults(data).map(row => {
      const environment = this.getFirstValue(row?.environment);
      return {
        instanceName: this.getFirstValue(row?.instance_name),
        providerKey: this.normalizePlatformValue(row?.provider),
        provider: this.getFirstValue(row?.provider),
        region: this.getFirstValue(row?.region) || 'N/A',
        account: this.getFirstValue(row?.account) || 'N/A',
        type: this.getFirstValue(row?.type) || 'N/A',
        environment: environment || 'N/A',
        environmentClass: this.getProvisioningEnvironmentClass(environment),
        statusLabel: this.getCapacityStateLabel(row?.status),
        statusIconClass: this.getCapacityStateIconClass(row?.status),
        provisionedDate: this.getProvisionedDateLabel(row?.provisioned_date),
        daysSinceProvisioned: this.getNumberValue(row?.days_since_provisioned)
      };
    }).filter(row => !!row.instanceName);
  }

  convertToProvisioningSummaryMetrics(data: PublicCloudProvisioningSummaryMetricsResponse): PublicCloudProvisioningSummaryMetric[] {
    return PUBLIC_CLOUD_PROVISIONING_SUMMARY_KPI_CONFIG.map(config => ({
      label: config.label,
      value: this.formatProvisioningMetricValue(this.getNumberValue(data?.[config.key]), config.format),
      tone: config.tone
    }));
  }

  convertToProvisioningReachabilityOptions(data: PublicCloudProvisioningReachability): EChartsOption {
    const reachable = this.getNumberValue(data?.reachable);
    const unreachable = this.getNumberValue(data?.unreachable);
    if (reachable + unreachable <= 0) {
      return {};
    }
    return {
      color: ['#3bb273', '#e5484d'],
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params?.name}: ${this.formatNumber(params?.value)}`
      },
      series: [{
        type: 'pie',
        radius: ['58%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { name: 'Reachable', value: reachable, itemStyle: { color: '#3bb273' } },
          { name: 'Unreachable', value: unreachable, itemStyle: { color: '#e5484d' } }
        ]
      }]
    };
  }

  convertToProvisioningReachabilityLegend(data: PublicCloudProvisioningReachability): PublicCloudProvisioningReachabilityLegendItem[] {
    const reachablePct = this.getNumberValue(data?.reachable_percentage);
    return [
      { label: 'Reachable', percent: `${this.formatCapacityDecimal(reachablePct)}%`, color: '#3bb273' },
      { label: 'Unreachable', percent: `${this.formatCapacityDecimal(Math.max(100 - reachablePct, 0))}%`, color: '#e5484d' }
    ];
  }

  convertToProvisioningByProviderOptions(data: PublicCloudProvisionedByProvider[]): EChartsOption {
    const items = (data || []).filter(item => !!this.getFirstValue(item?.provider));
    if (!items.length) {
      return {};
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)}` : '';
        }
      },
      grid: { left: 30, right: 16, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: items.map(item => this.getProvisioningProviderLabel(item.provider)), axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      yAxis: { type: 'value', min: 0, minInterval: 1, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      series: [{
        type: 'bar',
        barMaxWidth: 40,
        data: items.map(item => ({
          value: this.getNumberValue(item.count),
          itemStyle: { color: this.getAccountSubscriptionProviderColor(item.provider), borderRadius: [3, 3, 0, 0] }
        }))
      }]
    };
  }

  convertToRecentlyProvisionedOptions(data: PublicCloudRecentlyProvisioned[]): EChartsOption {
    const items = (data || []).filter(item => !!this.getFirstValue(item?.provisioned_date));
    if (!items.length) {
      return {};
    }
    // Oldest-first so the y-rank climbs with the date - the diagonal timeline the design shows.
    const sorted = items.slice().sort((first, second) => String(first.provisioned_date).localeCompare(String(second.provisioned_date)));
    const total = sorted.length;
    const points: any[] = sorted.map((item, index) => ({
      name: this.getFirstValue(item.instance_name),
      value: [this.getFirstValue(item.provisioned_date), index + 1],
      itemStyle: { color: this.getAccountSubscriptionProviderColor(item.provider) },
      // Later points sit to the right, so their labels read to the left (and vice versa) to stay in frame.
      label: {
        show: true,
        position: index >= total / 2 ? 'left' : 'right',
        formatter: this.getFirstValue(item.instance_name),
        color: '#4a5b6b',
        fontSize: 11
      }
    }));
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params?.data?.name}: ${params?.value?.[0] || ''}`
      },
      grid: { left: 90, right: 110, top: 16, bottom: 28 },
      xAxis: {
        type: 'time',
        splitNumber: 5,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#dce2e7' } },
        splitLine: { lineStyle: { color: '#eef1f4' } },
        axisLabel: {
          color: '#5c6c82',
          fontSize: 10,
          hideOverlap: true,
          formatter: (value: number) => {
            const date = new Date(value);
            return `${monthLabels[date.getMonth()]} ${date.getDate()}`;
          }
        }
      },
      yAxis: { type: 'value', min: 0, max: total + 1, show: false },
      series: [{ type: 'scatter', symbolSize: 10, data: points }]
    };
  }

  private getProvisioningResults(data: PublicCloudProvisioningTableResponse | PublicCloudProvisioningRowResponse[]): PublicCloudProvisioningRowResponse[] {
    if (Array.isArray(data)) {
      return data;
    }
    return data?.results || data?.data || data?.items || [];
  }

  private getProvisioningEnvironmentClass(environment?: string): string {
    return PUBLIC_CLOUD_PROVISIONING_ENVIRONMENT_CLASS[String(environment || '').toLowerCase()] || 'provisioning-env-default';
  }

  private getProvisioningProviderLabel(provider?: string): string {
    const value = this.getFirstValue(provider);
    return value ? value.toUpperCase() : '';
  }

  // Provisioned date arrives as "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS"; the table shows the date only.
  private getProvisionedDateLabel(value?: string): string {
    const raw = this.getFirstValue(value);
    return raw ? raw.split(' ')[0] : 'N/A';
  }

  private formatProvisioningMetricValue(value: number, format: 'int' | 'pct' | 'min'): string {
    if (format === 'pct') {
      return `${this.formatCapacityDecimal(value)}%`;
    }
    if (format === 'min') {
      return `${this.formatCapacityDecimal(value)}m`;
    }
    return this.formatNumber(value);
  }
  /*
   * ******End ****** Instance Provisioning Summary Widget Related ********************
   */

  /*
   * -----Start----- Public Cloud Database Widget Related -------------------
   */
  getPublicCloudDatabase(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDatabaseInventoryResponse> {
    return this.http.get<PublicCloudDatabaseInventoryResponse>(PUBLIC_CLOUD_DATABASE_INVENTORY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getPublicCloudDatabaseStaticResponse(): PublicCloudDatabaseInventoryResponse {
    return PUBLIC_CLOUD_DATABASE_INVENTORY_RESPONSE;
  }

  convertToDatabaseSummaryMetrics(data: PublicCloudDatabaseInventoryResponse): PublicCloudDatabaseSummaryMetric[] {
    const summary = (data?.summary || {}) as Record<string, number>;
    return PUBLIC_CLOUD_DATABASE_SUMMARY_KPI_CONFIG.map(config => ({
      label: config.label,
      tone: config.tone,
      info: config.info,
      value: this.formatDatabaseKpiValue(this.getNumberValue(summary[config.key]), config.format)
    }));
  }

  convertToDatabaseMonitoredCards(data: PublicCloudDatabaseInventoryResponse): PublicCloudDatabaseMonitoredCard[] {
    const discovery = data?.discovery || {};
    return Object.keys(discovery).map(providerName => {
      const item = discovery[providerName] || {};
      const key = this.normalizePlatformValue(providerName) as PublicCloudProviderDistributionKey;
      const config = PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG[key];
      const discovered = this.getNumberValue(item.discovered);
      const healthy = this.getNumberValue(item.healthy);
      const degraded = this.getNumberValue(item.degraded);
      const unknown = this.getNumberValue(item.unknown);
      const toPercent = (value: number) => discovered > 0 ? (value / discovered) * 100 : 0;
      return {
        key,
        provider: config ? config.name : String(providerName || '').toUpperCase(),
        iconClass: PUBLIC_CLOUD_PROVIDER_ICON_CONFIG[key] || 'fas fa-cloud',
        color: config ? config.color : '#5a7ed8',
        discovered,
        monitored: this.getNumberValue(item.monitored),
        healthy,
        degraded,
        unknown,
        healthyPercent: toPercent(healthy),
        degradedPercent: toPercent(degraded),
        unknownPercent: toPercent(unknown)
      };
    }).sort((first, second) => this.getProviderOrderIndex(first.key) - this.getProviderOrderIndex(second.key));
  }

  private formatDatabaseKpiValue(value: number, format: 'int' | 'pct' | 'ms'): string {
    switch (format) {
      case 'pct':
        return `${value.toLocaleString('en-US', { maximumFractionDigits: 3 })}%`;
      case 'ms':
        return `${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ms`;
      default:
        return this.formatNumber(value);
    }
  }
  /*
   * ******End ****** Public Cloud Database Widget Related ********************
   */

  /*
   * -----Start----- Database - Performance and Utilization Widget Related -------------------
   */
  getDbWorkload(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDbWorkloadRowResponse[]> {
    return this.http.get<PublicCloudDbWorkloadRowResponse[]>(PUBLIC_CLOUD_DB_WORKLOAD_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getDbQueryPerformance(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudDbQueryPerformanceResponse> {
    return this.http.get<PublicCloudDbQueryPerformanceResponse>(PUBLIC_CLOUD_DB_QUERY_PERFORMANCE_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getDbWorkloadStaticPage(search = '', page = 1, pageSize = 10): { count: number; results: PublicCloudDbWorkloadRowResponse[] } {
    const rows = PUBLIC_CLOUD_DB_WORKLOAD_RESPONSE || [];
    const normalizedSearch = String(search || '').toLowerCase().trim();
    const filteredRows = normalizedSearch
      ? rows.filter(row => String(row?.name || '').toLowerCase().indexOf(normalizedSearch) > -1)
      : rows;
    const startIndex = (page - 1) * pageSize;
    return {
      count: filteredRows.length,
      results: filteredRows.slice(startIndex, startIndex + pageSize)
    };
  }

  getDbQueryPerformanceStaticResponse(): PublicCloudDbQueryPerformanceResponse {
    return PUBLIC_CLOUD_DB_QUERY_PERFORMANCE_RESPONSE;
  }

  convertToDbWorkloadRows(rows: PublicCloudDbWorkloadRowResponse[], queryPerf: PublicCloudDbQueryPerformanceResponse): PublicCloudDbWorkloadRow[] {
    const engineMap = this.getDbEngineMap(queryPerf);
    return (rows || []).map(row => {
      const cpu = this.getNumberValue(row?.cpu_usage_system_percent);
      const memory = this.getNumberValue(row?.memory_used_percent);
      const usedGb = this.getNumberValue(row?.disk_used_gb);
      const capacityGb = this.getNumberValue(row?.disk_capacity_gb);
      const storagePct = capacityGb > 0 ? (usedGb / capacityGb) * 100 : this.getNumberValue(row?.disk_utilization_percent);
      const diskUtil = this.getNumberValue(row?.disk_utilization_percent);
      const iops = this.getFirstNumericValue(row?.disk_iops, row?.disk_iops_max) || 0;
      return {
        name: this.getFirstValue(row?.name),
        engine: engineMap[this.getFirstValue(row?.db_uuid)] || '',
        cpuPct: cpu,
        cpuLabel: `${this.formatCapacityDecimal(cpu)}% CPU`,
        cpuTone: this.getDbUsageTone(cpu),
        memoryPct: memory,
        memoryLabel: `${this.formatCapacityDecimal(memory)}% Mem`,
        memoryTone: this.getDbUsageTone(memory),
        storagePct,
        storageTone: this.getDbUsageTone(storagePct),
        storageTotalLabel: `Total: ${this.formatCapacityDecimal(capacityGb)} GB`,
        storageUsedLabel: `Used: ${this.formatCapacityDecimal(usedGb)} GB`,
        diskUtilizationPct: diskUtil,
        diskUtilizationLabel: `${this.formatCapacityDecimal(diskUtil)}%`,
        diskUtilizationTone: this.getDbUsageTone(diskUtil),
        diskIops: this.formatCapacityDecimal(iops),
        uptimeLabel: this.formatDbUptime(this.getNumberValue(row?.system_uptime_seconds))
      };
    }).filter(row => !!row.name);
  }

  convertToDbCacheHitOptions(data: PublicCloudDbQueryItem[]): EChartsOption {
    return this.getDbTopBarOptions((data || []).map(item => ({
      name: this.getFirstValue(item?.name),
      value: this.getNumberValue(item?.hit_ratio_pct),
      status: item?.status
    })), '%');
  }

  convertToDbLatencyOptions(data: PublicCloudDbQueryItem[]): EChartsOption {
    return this.getDbTopBarOptions((data || []).map(item => ({
      name: this.getFirstValue(item?.name),
      value: this.getNumberValue(item?.response_time_ms),
      status: item?.status
    })), 'ms');
  }

  convertToDbResponseTimeOptions(data: PublicCloudDbQueryItem[]): EChartsOption {
    return this.getDbTopBarOptions((data || []).map(item => ({
      name: this.getFirstValue(item?.name),
      value: this.getNumberValue(item?.response_time_ms),
      status: item?.status
    })), 'ms');
  }

  convertToDbConnectionsOptions(data: PublicCloudDbQueryItem[]): EChartsOption {
    return this.getDbTopBarOptions((data || []).map(item => ({
      name: this.getFirstValue(item?.name),
      value: this.getNumberValue(item?.active_connections),
      status: item?.status
    })), '');
  }

  convertToDbDeadlocksOptions(data: PublicCloudDbQueryItem[]): EChartsOption {
    return this.getDbTopBarOptions((data || []).map(item => ({
      name: this.getFirstValue(item?.name),
      value: this.getNumberValue(item?.deadlock_count),
      status: item?.status
    })), '');
  }

  convertToDbThroughputTrendOptions(data: PublicCloudDbQueryItem[]): EChartsOption {
    const series = data || [];
    const withTrend = series.find(item => (item?.trend || []).length);
    const dates = (withTrend?.trend || []).map(point => point?.date);
    const totals = dates.map((_, index) =>
      series.reduce((sum, item) => sum + this.getNumberValue((item?.trend || [])[index]?.transactions_per_sec), 0));
    return {
      color: ['#2f6fed'],
      tooltip: { trigger: 'axis' },
      grid: { left: 44, right: 16, top: 12, bottom: 26 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.map(date => String(date || '').slice(5)),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#dce2e7' } },
        axisLabel: { color: '#5c6c82', fontSize: 9 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitLine: { lineStyle: { color: '#eef1f4' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#5c6c82', fontSize: 10 }
      },
      series: [{
        name: 'Transactions/sec',
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: { opacity: 0.12 },
        lineStyle: { color: '#2f6fed', width: 2 },
        itemStyle: { color: '#2f6fed' },
        data: totals
      }]
    };
  }

  private getDbEngineMap(data: PublicCloudDbQueryPerformanceResponse): { [uuid: string]: string } {
    const sections = [data?.top_cache_hit_ratio, data?.top_latency, data?.top_errors_deadlocks, data?.top_throughput, data?.top_response_time, data?.top_connections];
    return sections.reduce((map: { [uuid: string]: string }, list) => {
      (list || []).forEach(item => {
        const uuid = String(item?.db_uuid || '');
        if (uuid && item?.db_type && !map[uuid]) {
          map[uuid] = String(item.db_type);
        }
      });
      return map;
    }, {});
  }

  private getDbTopBarOptions(points: Array<{ name: string; value: number; status?: string }>, suffix: string): EChartsOption {
    if (!(points || []).length) {
      return {};
    }
    // Data is highest-first; ECharts category axis renders bottom-up, so reverse for top-down display.
    const items = (points || []).slice().reverse();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)}${suffix ? ' ' + suffix : ''}` : '';
        }
      },
      grid: { left: 190, right: 46, top: 6, bottom: 6 },
      xAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 10 } },
      yAxis: {
        type: 'category',
        data: items.map(item => item.name),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#4a5b6b', fontSize: 10, width: 180, overflow: 'truncate' }
      },
      series: [{
        type: 'bar',
        barMaxWidth: 14,
        label: { show: true, position: 'right', color: '#4a5b6b', fontSize: 10, formatter: (params: any) => this.formatNumber(params.value) },
        data: items.map(item => ({ value: item.value, itemStyle: { color: this.getDbStatusColor(item.status), borderRadius: [0, 3, 3, 0] } }))
      }]
    };
  }

  private getDbStatusColor(status?: string): string {
    return PUBLIC_CLOUD_DB_STATUS_COLORS[String(status || '').toLowerCase()] || '#5a7ed8';
  }

  private getDbUsageTone(pct: number): PublicCloudStatusTone {
    if (pct > 85) {
      return 'danger';
    }
    if (pct >= 50) {
      return 'warning';
    }
    return 'success';
  }

  private formatDbUptime(seconds: number): string {
    const days = Math.floor(this.getNumberValue(seconds) / 86400);
    return `${days.toLocaleString('en-US')}d`;
  }
  /*
   * ******End ****** Database - Performance and Utilization Widget Related ********************
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
      resourceType: this.getFirstValue(item.resource_type, item.resourceType, item.type),
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
      // Total orphaned count sits in the donut hole.
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'middle',
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
          radius: ['42%', '72%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            color: '#20272e',
            fontSize: 13,
            formatter: '{c}'
          },
          labelLine: {
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

  private getNumericValue(value: string | number | undefined | null): number {
    return Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
  }
  /*
   * -----Start----- Alert & Events View Widget Related -------------------
   */
  getRecentAlerts(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudRecentAlertsResponse> {
    return this.http.get<PublicCloudRecentAlertsResponse>(PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getAlertsBySeverity(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertsBySeverity> {
    return this.http.get<PublicCloudAlertsBySeverity>(PUBLIC_CLOUD_ALERTS_BY_SEVERITY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getAlertsByProvider(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertsByProvider[]> {
    return this.http.get<PublicCloudAlertsByProvider[]>(PUBLIC_CLOUD_ALERTS_BY_PROVIDER_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getAlertsByAge(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAlertsByAge> {
    return this.http.get<PublicCloudAlertsByAge>(PUBLIC_CLOUD_ALERTS_BY_AGE_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getRecentAlertsStaticResponse(): PublicCloudRecentAlertsResponse {
    return PUBLIC_CLOUD_RECENT_ALERTS_RESPONSE;
  }

  getAlertsBySeverityStaticResponse(): PublicCloudAlertsBySeverity {
    return PUBLIC_CLOUD_ALERTS_BY_SEVERITY_RESPONSE;
  }

  getAlertsByProviderStaticResponse(): PublicCloudAlertsByProvider[] {
    return PUBLIC_CLOUD_ALERTS_BY_PROVIDER_RESPONSE;
  }

  getAlertsByAgeStaticResponse(): PublicCloudAlertsByAge {
    return PUBLIC_CLOUD_ALERTS_BY_AGE_RESPONSE;
  }

  convertToRecentAlertRows(data: PublicCloudRecentAlertsResponse): PublicCloudRecentAlertRow[] {
    return this.getRecentAlertRows(data).map(item => {
      const severity = this.getRecentAlertSeverity(this.getFirstValue(item.severity, item.status));
      const providerKey = this.getAlertProviderKey(item);
      const raised = this.getFirstValue(item.duration);
      return {
        id: this.getFirstValue(item.id, item.alert_id, item.alertId, item.uuid, item.alert_uuid, item.alertUuid),
        uuid: this.getFirstValue(item.uuid, item.alert_uuid, item.alertUuid, item.id, item.alert_id, item.alertId),
        instanceName: this.getFirstValue(item.device_name, item.deviceName, item.name),
        severity,
        severityLabel: this.getAlertSeverityLabel(severity),
        severityClass: `alert-severity-${severity}`,
        providerKey,
        provider: providerKey ? providerKey.toUpperCase() : 'N/A',
        alert: this.getFirstValue(item.description) || 'N/A',
        raised: raised ? `${raised} ago` : 'N/A',
        raisedHours: this.parseAlertRaisedHours(raised)
      };
    }).filter(row => !!row.instanceName || row.alert !== 'N/A');
  }

  convertToAlertsBySeverityOptions(data: PublicCloudAlertsBySeverity): EChartsOption {
    const points = PUBLIC_CLOUD_ALERT_SEVERITY_ORDER
      .map(key => ({ key, value: this.getNumberValue((data as any)?.[key]) }))
      .filter(point => point.value > 0);
    if (!points.length) {
      return {};
    }
    const total = this.getNumberValue(data?.total) || points.reduce((sum, point) => sum + point.value, 0);
    return {
      color: points.map(point => this.getAlertSeverityChartColor(point.key)),
      tooltip: { trigger: 'item', formatter: (params: any) => `${params?.name}: ${this.formatNumber(params?.value)}` },
      title: {
        text: this.formatNumber(total),
        subtext: 'Alerts',
        left: 'center',
        top: 'center',
        itemGap: 2,
        textStyle: { fontSize: 20, fontWeight: 700, color: '#2b3642' },
        subtextStyle: { fontSize: 12, color: '#6b7682' }
      },
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: points.map(point => ({ name: this.getAlertSeverityLabel(point.key), value: point.value, itemStyle: { color: this.getAlertSeverityChartColor(point.key) } }))
      }]
    };
  }

  convertToAlertsBySeverityLegend(data: PublicCloudAlertsBySeverity): PublicCloudAlertSeverityLegendItem[] {
    return PUBLIC_CLOUD_ALERT_SEVERITY_ORDER.map(key => ({
      label: this.getAlertSeverityLabel(key),
      count: this.getNumberValue((data as any)?.[key]),
      color: this.getAlertSeverityChartColor(key)
    }));
  }

  convertToAlertsByProviderOptions(data: PublicCloudAlertsByProvider[]): EChartsOption {
    const items = (data || []).filter(item => !!this.getFirstValue(item?.provider));
    if (!items.length) {
      return {};
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)}` : '';
        }
      },
      grid: { left: 30, right: 16, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: items.map(item => (this.getFirstValue(item.provider) || '').toUpperCase()), axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      yAxis: { type: 'value', min: 0, minInterval: 1, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      series: [{
        type: 'bar',
        barMaxWidth: 40,
        data: items.map(item => ({ value: this.getNumberValue(item.alert_count), itemStyle: { color: this.getAccountSubscriptionProviderColor(item.provider), borderRadius: [3, 3, 0, 0] } }))
      }]
    };
  }

  convertToAlertsByAgeOptions(data: PublicCloudAlertsByAge): EChartsOption {
    const buckets = PUBLIC_CLOUD_ALERT_AGE_ORDER.map(key => ({ key, value: this.getNumberValue((data as any)?.[key]) }));
    if (!buckets.some(bucket => bucket.value > 0)) {
      return {};
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)}` : '';
        }
      },
      grid: { left: 30, right: 16, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: buckets.map(bucket => bucket.key), axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      yAxis: { type: 'value', min: 0, minInterval: 1, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      series: [{
        type: 'bar',
        barMaxWidth: 40,
        data: buckets.map(bucket => ({ value: bucket.value, itemStyle: { color: this.getAlertAgeColor(bucket.key), borderRadius: [3, 3, 0, 0] } }))
      }]
    };
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

  private getAlertSeverityLabel(severity: string): string {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return this.getFirstValue(severity) || 'Unknown';
    }
  }

  private getAlertSeverityChartColor(key: string): string {
    return PUBLIC_CLOUD_ALERT_SEVERITY_CHART_COLORS[String(key || '').toLowerCase()] || '#c9cdd3';
  }

  private getAlertAgeColor(key: string): string {
    return PUBLIC_CLOUD_ALERT_AGE_COLORS[key] || '#9aa4b2';
  }

  // provider is not part of the current recent_alerts item, so it is read when present and otherwise
  // derived from the instance-name prefix (aws-/azure-/gcp-/oci-).
  private getAlertProviderKey(item: PublicCloudRecentAlertResponseItem): string {
    const explicit = this.normalizePlatformValue(item?.provider);
    if (explicit) {
      return explicit;
    }
    const name = String(item?.device_name || item?.deviceName || item?.name || '').toLowerCase();
    if (name.indexOf('aws') === 0) {
      return 'aws';
    }
    if (name.indexOf('azure') === 0) {
      return 'azure';
    }
    if (name.indexOf('gcp') === 0) {
      return 'gcp';
    }
    if (name.indexOf('oci') === 0) {
      return 'oci';
    }
    return '';
  }

  // duration arrives like "958d 15h" / "63h" / "1h 30m"; convert to total hours for the Raised sort.
  private parseAlertRaisedHours(value: string): number {
    const raw = String(value || '');
    let hours = 0;
    const days = raw.match(/(\d+)\s*d/);
    if (days) {
      hours += Number(days[1]) * 24;
    }
    const hrs = raw.match(/(\d+)\s*h/);
    if (hrs) {
      hours += Number(hrs[1]);
    }
    const mins = raw.match(/(\d+)\s*m/);
    if (mins) {
      hours += Number(mins[1]) / 60;
    }
    return hours;
  }
  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */

  /*
   * -----Start----- Cost & Optimization Opportunities Widget Related -------------------
   */
  getCostOptimization(criteria?: PublicCloudDashboardFilterCriteria, search = '', page = 1, pageSize = 10): Observable<PublicCloudCostOptimizationTableResponse> {
    let params = this.convertFiltersToApiParams(criteria);
    if (search) {
      params = params.set('search', search);
    }
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    return this.http.get<PublicCloudCostOptimizationTableResponse>(PUBLIC_CLOUD_COST_OPTIMIZATION_ENDPOINT, { params });
  }

  getSpendVsSavings(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudSpendVsSavings> {
    return this.http.get<PublicCloudSpendVsSavings>(PUBLIC_CLOUD_SPEND_VS_SAVINGS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getRecommendedActions(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudRecommendedAction[]> {
    return this.http.get<PublicCloudRecommendedAction[]>(PUBLIC_CLOUD_RECOMMENDED_ACTIONS_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getPotentialSavingsByProvider(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudPotentialSavingsByProvider[]> {
    return this.http.get<PublicCloudPotentialSavingsByProvider[]>(PUBLIC_CLOUD_POTENTIAL_SAVINGS_BY_PROVIDER_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getCostOptimizationStaticResponse(): PublicCloudCostRowResponse[] {
    return PUBLIC_CLOUD_COST_OPTIMIZATION_RESPONSE;
  }

  getSpendVsSavingsStaticResponse(): PublicCloudSpendVsSavings {
    return PUBLIC_CLOUD_SPEND_VS_SAVINGS_RESPONSE;
  }

  getRecommendedActionsStaticResponse(): PublicCloudRecommendedAction[] {
    return PUBLIC_CLOUD_RECOMMENDED_ACTIONS_RESPONSE;
  }

  getPotentialSavingsByProviderStaticResponse(): PublicCloudPotentialSavingsByProvider[] {
    return PUBLIC_CLOUD_POTENTIAL_SAVINGS_BY_PROVIDER_RESPONSE;
  }

  convertToCostRows(data: PublicCloudCostOptimizationTableResponse | PublicCloudCostRowResponse[]): PublicCloudCostRow[] {
    return this.getCostOptimizationResults(data).map(item => {
      const cpuPct = this.getNumberValue(item?.utilization);
      const savings = this.getNumberValue(item?.estimated_monthly_savings);
      const action = this.getFirstValue(item?.recommended_action) || 'N/A';
      return {
        instance: this.getFirstValue(item?.instance),
        providerKey: this.normalizePlatformValue(item?.provider),
        provider: this.getFirstValue(item?.provider),
        region: this.getFirstValue(item?.region) || 'N/A',
        type: this.getFirstValue(item?.type) || 'N/A',
        cpuPct,
        cpuLabel: `${this.formatCapacityDecimal(cpuPct)}% CPU`,
        cpuTone: this.getCostCpuTone(cpuPct),
        action,
        actionClass: this.getCostActionClass(action),
        savings,
        savingsLabel: this.formatCostCurrency(savings)
      };
    }).filter(row => !!row.instance);
  }

  getCostOptimizationTotal(data: PublicCloudCostOptimizationTableResponse | PublicCloudCostRowResponse[]): number {
    if (Array.isArray(data)) {
      return data.length;
    }
    return Number(data?.count || 0) || this.getCostOptimizationResults(data).length;
  }

  private getCostOptimizationResults(data: PublicCloudCostOptimizationTableResponse | PublicCloudCostRowResponse[]): PublicCloudCostRowResponse[] {
    if (Array.isArray(data)) {
      return data;
    }
    return data?.results || data?.data || data?.items || [];
  }

  convertToSpendVsSavingsOptions(data: PublicCloudSpendVsSavings): EChartsOption {
    const spend = this.getNumberValue(data?.current_monthly_spend);
    const savings = this.getNumberValue(data?.identified_savings);
    if (spend + savings <= 0) {
      return {};
    }
    return {
      color: [PUBLIC_CLOUD_COST_SPEND_COLOR, PUBLIC_CLOUD_COST_SAVINGS_COLOR],
      tooltip: { trigger: 'item', formatter: (params: any) => `${params?.name}: ${this.formatCostCurrency(params?.value)}` },
      title: {
        text: this.formatCostCurrency(spend),
        left: 'center',
        top: 'center',
        textStyle: { fontSize: 18, fontWeight: 700, color: '#2b3642' }
      },
      series: [{
        type: 'pie',
        radius: ['62%', '82%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { name: 'Current monthly spend', value: spend, itemStyle: { color: PUBLIC_CLOUD_COST_SPEND_COLOR } },
          { name: 'Identified savings', value: savings, itemStyle: { color: PUBLIC_CLOUD_COST_SAVINGS_COLOR } }
        ]
      }]
    };
  }

  convertToSpendVsSavingsLegend(data: PublicCloudSpendVsSavings): PublicCloudSpendSavingsLegendItem[] {
    return [
      { text: `Current monthly spend: ${this.formatCostCurrency(this.getNumberValue(data?.current_monthly_spend))}`, color: PUBLIC_CLOUD_COST_SPEND_COLOR },
      { text: `Identified savings: ${this.formatCostCurrency(this.getNumberValue(data?.identified_savings))}/mo`, color: PUBLIC_CLOUD_COST_SAVINGS_COLOR }
    ];
  }

  convertToRecommendedActionsOptions(data: PublicCloudRecommendedAction[]): EChartsOption {
    const items = (data || []).filter(item => !!this.getFirstValue(item?.recommended_action));
    if (!items.length) {
      return {};
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatNumber(row.value)}` : '';
        }
      },
      grid: { left: 160, right: 40, top: 8, bottom: 8 },
      xAxis: { type: 'value', min: 0, show: false },
      yAxis: { type: 'category', inverse: true, data: items.map(item => this.getFirstValue(item.recommended_action)), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: '#4a5b6b', fontSize: 11 } },
      series: [{
        type: 'bar',
        barMaxWidth: 18,
        label: { show: true, position: 'right', color: '#4a5b6b', fontSize: 11, formatter: (params: any) => this.formatNumber(params.value) },
        data: items.map(item => ({ value: this.getNumberValue(item.count), itemStyle: { color: this.getCostActionColor(item.recommended_action), borderRadius: [0, 3, 3, 0] } }))
      }]
    };
  }

  convertToPotentialSavingsByProviderOptions(data: PublicCloudPotentialSavingsByProvider[]): EChartsOption {
    const order = ['aws', 'azure', 'gcp', 'oci'];
    const items = (data || []).filter(item => !!this.getFirstValue(item?.provider)).slice()
      .sort((first, second) => order.indexOf(this.normalizePlatformValue(first.provider)) - order.indexOf(this.normalizePlatformValue(second.provider)));
    if (!items.some(item => this.getNumberValue(item.estimated_monthly_savings) > 0)) {
      return {};
    }
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = params && params[0];
          return row ? `${row.axisValue}: ${this.formatCostCurrency(row.value)}` : '';
        }
      },
      grid: { left: 48, right: 16, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: items.map(item => (this.getFirstValue(item.provider) || '').toUpperCase()), axisTick: { show: false }, axisLine: { lineStyle: { color: '#dce2e7' } }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: '#eef1f4' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#5c6c82', fontSize: 11 } },
      series: [{
        type: 'bar',
        barMaxWidth: 46,
        data: items.map(item => ({ value: this.getNumberValue(item.estimated_monthly_savings), itemStyle: { color: this.getAccountSubscriptionProviderColor(item.provider), borderRadius: [3, 3, 0, 0] } }))
      }]
    };
  }

  convertToCostSummaryMetrics(spend: PublicCloudSpendVsSavings, actions: PublicCloudRecommendedAction[]): PublicCloudCostSummaryMetric[] {
    return [
      { label: 'Monthly Spend', value: this.formatCostCurrency(this.getNumberValue(spend?.current_monthly_spend)), tone: 'primary' },
      { label: 'Potential Savings', value: this.formatCostCurrency(this.getNumberValue(spend?.identified_savings)), tone: 'warning' },
      { label: 'Rightsizing Candidates', value: String(this.getCostActionCount(actions, 'rightsize')), tone: 'primary' },
      { label: 'Idle Instances', value: String(this.getCostActionCount(actions, 'idle')), tone: 'danger' }
    ];
  }

  private getCostCpuTone(cpuPct: number): PublicCloudStatusTone {
    if (cpuPct >= 85) {
      return 'danger';
    }
    return cpuPct >= 50 ? 'warning' : 'success';
  }

  private getCostActionKind(action?: string): string {
    const value = String(action || '').toLowerCase();
    if (value.indexOf('rightsize') > -1 || value.indexOf('right size') > -1) {
      return 'rightsize';
    }
    if (value.indexOf('stop') > -1 || value.indexOf('idle') > -1 || value.indexOf('terminate') > -1) {
      return 'idle';
    }
    return '';
  }

  private getCostActionClass(action?: string): string {
    const kind = this.getCostActionKind(action);
    return kind ? `cost-action-${kind}` : 'cost-action-default';
  }

  private getCostActionColor(action?: string): string {
    return PUBLIC_CLOUD_COST_ACTION_COLORS[this.getCostActionKind(action)] || '#9aa4b2';
  }

  private getCostActionCount(actions: PublicCloudRecommendedAction[], kind: string): number {
    return (actions || []).filter(item => this.getCostActionKind(item?.recommended_action) === kind)
      .reduce((sum, item) => sum + this.getNumberValue(item?.count), 0);
  }

  private formatCostCurrency(value: number | string | undefined): string {
    return `$${Math.round(this.getNumberValue(value)).toLocaleString('en-US')}`;
  }
  /*
   * ******End ****** Cost & Optimization Opportunities Widget Related ********************
   */

  /*
   * -----Start----- Auto-Remediation Summary Widget Related -------------------
   */
  getAutoRemediationSummary(criteria?: PublicCloudDashboardFilterCriteria): Observable<PublicCloudAutoRemediationSummaryResponse> {
    return this.http.get<PublicCloudAutoRemediationSummaryResponse>(PUBLIC_CLOUD_AUTO_REMEDIATION_SUMMARY_ENDPOINT, {
      params: this.convertFiltersToApiParams(criteria)
    });
  }

  getAutoRemediationSummaryStaticResponse(): PublicCloudAutoRemediationSummaryResponse {
    return PUBLIC_CLOUD_AUTO_REMEDIATION_SUMMARY_RESPONSE;
  }

  convertToAutoRemediationSummaryViewData(data: PublicCloudAutoRemediationSummaryResponse): PublicCloudAutoRemediationSummaryViewData {
    const source = this.getObjectResponseData(data) as PublicCloudAutoRemediationSummaryResponse;
    const totalRuns = this.getFirstNumericValue(source?.autoRemediations, source?.totalRuns, source?.total_runs, source?.total) || 0;
    const successfulRuns = this.getFirstNumericValue(source?.successfulRuns) || 0;
    const failedRuns = this.getFirstNumericValue(source?.failedRuns) || 0;
    const successPct = this.getAutoRemediationPercent(source?.runbookSuccessPct, successfulRuns, totalRuns);
    const failurePct = this.getAutoRemediationPercent(source?.runbookFailurePct, failedRuns, totalRuns);
    const actions = this.convertToAutoRemediationActions(source);
    const avgMttr = this.getFirstValue(source?.avgMttr) ||
      (this.getFirstNumericValue(source?.avgDurationMinutes, source?.avg_duration, source?.avgDuration, source?.average_duration, source?.averageDuration) !== null
        ? `${this.formatNumber(this.getFirstNumericValue(source?.avgDurationMinutes, source?.avg_duration, source?.avgDuration, source?.average_duration, source?.averageDuration) || 0)}m`
        : '');

    const outcomes: PublicCloudAutoRemediationOutcome[] = [
      {
        label: 'Successful',
        count: successfulRuns,
        percent: successPct,
        color: PUBLIC_CLOUD_AUTO_REMEDIATION_OUTCOME_COLORS.successful
      },
      {
        label: 'Failed',
        count: failedRuns,
        percent: failurePct,
        color: PUBLIC_CLOUD_AUTO_REMEDIATION_OUTCOME_COLORS.failed
      }
    ];

    const kpis: PublicCloudAutoRemediationKpi[] = [
      {
        label: 'Auto-Remediations',
        value: this.formatNumber(totalRuns),
        tone: 'primary'
      },
      {
        label: 'Runbook Success',
        value: `${this.formatNumber(successPct)}%`,
        tone: 'success'
      },
      {
        label: 'Avg MTTR',
        value: avgMttr,
        tone: 'primary'
      },
      {
        label: 'Runbook Failures',
        value: this.formatNumber(failedRuns),
        tone: 'danger'
      }
    ];

    return {
      outcomes,
      actions,
      kpis,
      totalRunsLabel: this.formatNumber(totalRuns),
      avgDurationLabel: avgMttr,
      donutGradient: `conic-gradient(${PUBLIC_CLOUD_AUTO_REMEDIATION_OUTCOME_COLORS.successful} 0 ${successPct}%, ${PUBLIC_CLOUD_AUTO_REMEDIATION_OUTCOME_COLORS.failed} ${successPct}% 100%)`,
      hasData: totalRuns > 0 || actions.length > 0 || kpis.some(item => !!item.value)
    };
  }

  private convertToAutoRemediationActions(source: PublicCloudAutoRemediationSummaryResponse): PublicCloudAutoRemediationAction[] {
    const actionRows = source?.topAutoRemediationActions || source?.mostFrequentActions ||
      source?.most_frequent_actions || source?.frequentActions || source?.frequent_actions || source?.actions || [];
    const maxCount = Math.max(...(actionRows || []).map(item => this.getFirstNumericValue(item?.count, item?.value) || 0), 0);
    return (actionRows || []).map((item, index) => {
      const count = this.getFirstNumericValue(item?.count, item?.value) || 0;
      return {
        label: this.getFirstValue(item?.name, item?.label, item?.action),
        count,
        percent: maxCount ? Math.round((count / maxCount) * 100) : 0,
        color: PUBLIC_CLOUD_AUTO_REMEDIATION_ACTION_COLORS[index % PUBLIC_CLOUD_AUTO_REMEDIATION_ACTION_COLORS.length]
      };
    }).filter(item => !!item.label);
  }

  private getAutoRemediationPercent(value: string | number | undefined, count: number, total: number): number {
    const percent = this.getFirstNumericValue(value);
    if (percent !== null) {
      return percent;
    }
    return total ? Math.round((count / total) * 1000) / 10 : 0;
  }
  /*
   * ******End ****** Auto-Remediation Summary Widget Related ********************
   */

}
