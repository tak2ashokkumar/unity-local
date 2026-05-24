import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PUBLIC_CLOUD_ALL_SELECTED_VALUE,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_ENDPOINT,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_PROVIDER_CONFIG,
  PUBLIC_CLOUD_COMPUTE_BREAKDOWN_STAT_CONFIG,
  PUBLIC_CLOUD_FILTERS_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DEVICES_BY_DURATION_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DEVICES_ENDPOINT,
  PUBLIC_CLOUD_IDLE_DURATION_COLORS,
  PUBLIC_CLOUD_INVENTORY_SUMMARY_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_CATEGORY_COLORS,
  PUBLIC_CLOUD_ORPHANED_DEVICES_BY_CATEGORY_ENDPOINT,
  PUBLIC_CLOUD_ORPHANED_DEVICES_ENDPOINT,
  PUBLIC_CLOUD_PROVIDER_DISTRIBUTION_CONFIG,
  PUBLIC_CLOUD_RECENT_ALERTS_ENDPOINT,
  PUBLIC_CLOUD_SUMMARY_METRIC_CONFIG,
  PUBLIC_CLOUD_TAG_STYLE_CONFIG
} from './public-cloud-compute-dashboard.const';
import {
  PublicCloudAccountOption,
  PublicCloudAlertSummaryMetric,
  PublicCloudComputeBreakdownProvider,
  PublicCloudComputeBreakdownProviderKey,
  PublicCloudDashboardFilterCriteria,
  PublicCloudDashboardFilterOptions,
  PublicCloudFilterOption,
  PublicCloudFiltersResponse,
  PublicCloudFilterAccountResponseItem,
  PublicCloudComputeBreakdownResponse,
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
