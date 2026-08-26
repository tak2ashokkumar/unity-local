import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CiDistributionByDevice, CiDistributionByDeviceData, CiDistributionByDeviceDataItem, CiDistributionByDeviceSortColumn, CiDistributionByDeviceTableRowViewData, CiDistributionByDiscoveryItem, CiDistributionByDiscoveryResponse, CiDistributionByDiscoverySortColumn, CiDistributionByDiscoveryTableRowViewData, CiDistributionItem, CiDistributionSortColumn, CiDistributionTableRowViewData, CmdbSyncInsights, CmdbSyncInsightsMetric, CmdbSyncInsightsMetricViewData, CmdbSyncInsightsViewData, CmdbSyncTrend, CmdbSyncTrendSortColumn, CmdbSyncTrendTableRowViewData, DiscoveryDashboardFilterCriteria, DiscoveryDashboardFilterFormValue, DiscoveryDashboardFilterOptions, DiscoveryDashboardPaginatedResponse, DiscoverySuccessFailureData, DiscoverySuccessFailureSortColumn, DiscoverySuccessFailureTableRowViewData, DiscoveryTrendAnalyticsData, DiscoveryTrendAnalyticsSortColumn, DiscoveryTrendAnalyticsTableRowViewData, ExecutiveKpiData, ExecutiveKpiViewData, NewlyDiscoveredDatacenterDistribution, NewlyDiscoveredDatacenterDistributionItem, NewlyDiscoveredDevice, NewlyDiscoveredDeviceItem, NewlyDiscoveredDeviceItemViewData, NewlyDiscoveredDevicesSortColumn, NewlyDiscoveredManufacturerDistributionItem, NewlyDiscoveredManufacturerModelDistribution, NewlyDiscoveredStatusByDatacenterDistribution, NewlyDiscoveredStatusByDatacenterItem, OperatingSystems, OperatingSystemsItem, OperatingSystemsItemViewData, OperatingSystemsSortColumn, OrphanedDeviceByTypeItem, OrphanedDeviceByTypeItemViewData, OrphanedDeviceByTypeResponse, OrphanedDeviceByTypeSortColumn, OrphanedDevicesBreakdownItem, OrphanedDevicesBreakdownResponse, ResourceDiscoveryData, ResourceDiscoveryViewData, TopDiscoveryFailuresItem, TopDiscoveryFailuresItemViewData, TopDiscoveryFailuresResponse, TopDiscoveryFailuresSortColumn } from './discovery-dashboard.type';
import { DISCOVERY_DASHBOARD_TIME_RANGE_DEFAULT } from './discovery-dashboard.const';


@Injectable()
export class DiscoveryDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }


  getFilterOptions(): Observable<DiscoveryDashboardFilterOptions> {
    // return this.http.get<DiscoveryDashboardFilterOptions>(DISCOVERY_DASHBOARD_FILTER_OPTIONS)
    return this.http.get<DiscoveryDashboardFilterOptions>(`/customer/discovery-dashboard/discovery_filters/`);
  }



  buildFilterForm(defaults: DiscoveryDashboardFilterFormValue = {
    deploymentEnvironment: [],
    region: [],
    timeRange: DISCOVERY_DASHBOARD_TIME_RANGE_DEFAULT,
    startDate: '',
    endDate: ''
  }): FormGroup {
    return this.builder.group({
      deploymentEnvironment: [defaults.deploymentEnvironment],
      region: [defaults.region],
      timeRange: [defaults.timeRange],
      startDate: [defaults.startDate || ''],
      endDate: [defaults.endDate || '']
    });
  }

  getExecutiveKpisData(filters?: DiscoveryDashboardFilterCriteria): Observable<ExecutiveKpiData> {
    // return of(DISCOVERY_DASHBOARD_EXECUTIVE_KPI);
    return this.http.get<ExecutiveKpiData>(`customer/discovery-dashboard/executive_kpis`, {
      params: this.buildFilterParams(filters)
    });

  }


  convertToExecutiveKpiViewData(data: ExecutiveKpiData): ExecutiveKpiViewData {
    const view = new ExecutiveKpiViewData();
    if (!data) {
      return view;
    }

    view.devicesPendingMonitoring = data.devices_pending_monitoring ?? 0;
    view.discoveredDevicesTotal = data.discovered_devices_total ?? 0;
    view.discoveryFailures = data.discovery_failures ?? 0;
    view.discoverySuccessRate = data.discovery_success_rate ?? 0;
    view.newlyDiscoveredResources = data.newly_discovered_resources ?? 0;
    view.orphanDevices = data.orphan_devices ?? 0;
    return view;
  }

  getDiscoveryTrendAnalyticsData(filters?: DiscoveryDashboardFilterCriteria): Observable<DiscoveryTrendAnalyticsData> {

    return this.http.get<DiscoveryTrendAnalyticsData>(`ccustomer/discovery-dashboard/discovery_trend_analytics`, {
      params: this.buildFilterParams(filters)
    });


  }


  convertToDiscoveryTrendAnalyticsChartView(data: DiscoveryTrendAnalyticsData): EChartsOption {
    const rows = this.convertToDiscoveryTrendAnalyticsTableView(data);
    if (!rows.length) {
      return null;
    }

    const weeks = rows.map(item => item.week);
    const totalValues = rows.map(item => item.totalDevices);
    const newValues = rows.map(item => item.newDevices);
    const yAxisScale = this.getTrendAnalyticsAxisScale([...totalValues, ...newValues]);

    return {
      animation: false,
      legend: {
        bottom: 8,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#5d6670',
          fontSize: 12
        },
        data: ['Total Devices', 'New Devices']
      },
      grid: {
        left: 18,
        right: 18,
        top: 20,
        bottom: 44,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any[]) => {
          const tooltipItems = (params || []).filter(item => Number(item?.value) > 0);
          if (!tooltipItems.length) {
            return '';
          }

          const manufacturer = tooltipItems[0]?.axisValueLabel || tooltipItems[0]?.name || '';
          const lines = tooltipItems.map(item =>
            `${item?.marker || ''}${item?.seriesName || ''}: ${Number(item?.value || 0)}`
          );

          return [manufacturer, ...lines].join('<br/>');
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: weeks,
        axisLine: {
          lineStyle: {
            color: '#d3d9df'
          }
        },
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisScale.max,
        interval: yAxisScale.interval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11,
          formatter: (value: number) => value === 0 ? '0' : `${value}`
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: [
        {
          name: 'Total Devices',
          type: 'bar',
          data: totalValues,
          barMaxWidth: 32,
          itemStyle: {
            color: '#4b74eb',
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'New Devices',
          type: 'line',
          smooth: true,
          data: newValues,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: true,
          lineStyle: {
            width: 3,
            color: '#0bb45e'
          },
          itemStyle: {
            color: '#ffffff',
            borderColor: '#0bb45e',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(11, 180, 94, 0.18)' },
              { offset: 1, color: 'rgba(11, 180, 94, 0.04)' }
            ])
          },
          z: 3
        }
      ]
    };
  }

  convertToDiscoveryTrendAnalyticsTableView(data: DiscoveryTrendAnalyticsData): DiscoveryTrendAnalyticsTableRowViewData[] {
    const total = data?.total || [];
    const newlyDiscovered = data?.new || [];
    const sourceRows = total.length ? total : newlyDiscovered;
    const newMap = newlyDiscovered.reduce((acc: Record<string, number>, item) => {
      acc[item.week] = item.value ?? 0;
      return acc;
    }, {});
    const totalMap = total.reduce((acc: Record<string, number>, item) => {
      acc[item.week] = item.value ?? 0;
      return acc;
    }, {});

    return sourceRows.map((item, index) => {
      const row = new DiscoveryTrendAnalyticsTableRowViewData();
      row.week = item.week;
      row.weekOrder = index;
      row.totalDevices = totalMap[item.week] ?? 0;
      row.newDevices = newMap[item.week] ?? 0;
      return row;
    });
  }

  sortDiscoveryTrendAnalyticsRows(
    rows: DiscoveryTrendAnalyticsTableRowViewData[],
    sortColumn: DiscoveryTrendAnalyticsSortColumn,
    sortDirection: string
  ): DiscoveryTrendAnalyticsTableRowViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  private getTrendAnalyticsAxisScale(values: number[]): { max: number; interval: number } {
    const maxValue = Math.max(...(values || []), 0);
    if (maxValue <= 0) {
      return {
        max: 5,
        interval: 1
      };
    }

    const roughInterval = maxValue / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval || 1)));
    const normalized = roughInterval / magnitude;
    let interval = magnitude;

    if (normalized > 5) {
      interval = 10 * magnitude;
    } else if (normalized > 2) {
      interval = 5 * magnitude;
    } else if (normalized > 1) {
      interval = 2 * magnitude;
    }

    return {
      interval,
      max: Math.ceil(maxValue / interval) * interval
    };
  }

  private buildCmdbInsightMetricViewData(
    label: string,
    metric: CmdbSyncInsightsMetric,
    valueClass: string
  ): CmdbSyncInsightsMetricViewData {
    const view = new CmdbSyncInsightsMetricViewData();
    view.label = label;
    view.valueText = this.formatCmdbInsightValue(metric);
    view.trendText = this.formatCmdbInsightTrend(metric);
    view.valueClass = valueClass;
    view.trendClass = metric?.trend === 'down'
      ? 'text-danger'
      : 'text-success';
    return view;
  }

  private formatCmdbInsightValue(metric: CmdbSyncInsightsMetric): string {
    const value = metric?.value ?? 0;
    if (metric?.unit === 'percent') {
      return `${value.toFixed(1)}%`;
    }

    return Number(value).toLocaleString();
  }

  private formatCmdbInsightTrend(metric: CmdbSyncInsightsMetric): string {
    if (!metric) {
      return '';
    }

    const change = Math.abs(metric?.change_percent ?? 0);
    const trend = metric?.trend === 'down' ? 'down' : 'up';
    return `${trend === 'up' ? '▲' : '▼'} ${change.toFixed(1)}%`;
  }

  getDiscoverySuccessandFailureData(filters?: DiscoveryDashboardFilterCriteria): Observable<DiscoverySuccessFailureData> {

    return this.http.get<DiscoverySuccessFailureData>(`customer/discovery-dashboard/discovery_success_failure`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToDiscoverySuccessFailureChartView(data: DiscoverySuccessFailureData): EChartsOption {
    const rows = this.convertToDiscoverySuccessFailureTableView(data);
    if (!rows.length) {
      return null;
    }

    const weeks = rows.map(item => item.week);
    const successValues = rows.map(item => item.success);
    const failureValues = rows.map(item => item.failure);
    const totalValues = rows.map(item => item.total);
    const yAxisScale = this.getTrendAnalyticsAxisScale(totalValues);

    return {
      animation: false,
      legend: {
        bottom: 8,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#5d6670',
          fontSize: 12
        },
        data: ['Success', 'Failure', 'Total']
      },
      grid: {
        left: 18,
        right: 18,
        top: 20,
        bottom: 44,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any[]) => {
          const tooltipItems = (params || []).filter(item => Number(item?.value) > 0);
          if (!tooltipItems.length) {
            return '';
          }

          const manufacturer = tooltipItems[0]?.axisValueLabel || tooltipItems[0]?.name || '';
          const lines = tooltipItems.map(item =>
            `${item?.marker || ''}${item?.seriesName || ''}: ${Number(item?.value || 0)}`
          );

          return [manufacturer, ...lines].join('<br/>');
        }
      },
      xAxis: {
        type: 'category',
        data: weeks,
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#8e969f'
          }
        },
        axisLabel: {
          color: '#555d66',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisScale.max,
        interval: yAxisScale.interval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11,
          formatter: (value: number) => value === 0 ? '0' : `${value}`
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          barWidth: 28,
          data: successValues,
          itemStyle: {
            color: '#0cb04d'
          }
        },
        {
          name: 'Failure',
          type: 'bar',
          stack: 'total',
          data: failureValues,
          itemStyle: {
            color: '#df3344',
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Total',
          type: 'line',
          smooth: true,
          data: totalValues,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: true,
          lineStyle: {
            width: 2,
            color: '#2c3da3'
          },
          itemStyle: {
            color: '#2c3da3'
          }
        }
      ]
    };
  }

  convertToDiscoverySuccessFailureTableView(data: DiscoverySuccessFailureData): DiscoverySuccessFailureTableRowViewData[] {
    const success = data?.success || [];
    const failure = data?.failure || [];
    const total = data?.total || [];
    const sourceRows = success.length ? success : total.length ? total : failure;
    const successMap = success.reduce((acc: Record<string, number>, item) => {
      acc[item.week] = item.value ?? 0;
      return acc;
    }, {});
    const failureMap = failure.reduce((acc: Record<string, number>, item) => {
      acc[item.week] = item.value ?? 0;
      return acc;
    }, {});
    const totalMap = total.reduce((acc: Record<string, number>, item) => {
      acc[item.week] = item.value ?? 0;
      return acc;
    }, {});

    return sourceRows.map((item, index) => {
      const row = new DiscoverySuccessFailureTableRowViewData();
      row.week = item.week;
      row.weekOrder = index;
      row.success = successMap[item.week] ?? 0;
      row.failure = failureMap[item.week] ?? 0;
      row.total = totalMap[item.week] ?? 0;
      return row;
    });
  }

  sortDiscoverySuccessFailureRows(
    rows: DiscoverySuccessFailureTableRowViewData[],
    sortColumn: DiscoverySuccessFailureSortColumn,
    sortDirection: string
  ): DiscoverySuccessFailureTableRowViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getCmdbInsightsData(filters?: DiscoveryDashboardFilterCriteria): Observable<CmdbSyncInsights> {
    // return of(CMDB_SYNC_INSIGHTS_DATA);
    return this.http.get<CmdbSyncInsights>(`/customer/discovery-dashboard/cmdb_sync_insights/`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToCmdbSyncInsightsViewData(data: CmdbSyncInsights): CmdbSyncInsightsViewData {
    const view = new CmdbSyncInsightsViewData();
    if (!data) {
      return view;
    }

    view.cmdbSyncRate = this.buildCmdbInsightMetricViewData('CMDB sync rate', data.cmdb_sync_rate, 'text-success');
    view.ciUpdateFailures = this.buildCmdbInsightMetricViewData('CI update failures', data.ci_update_failures, 'text-danger');
    view.orphanedCis = this.buildCmdbInsightMetricViewData('Orphaned CIs', data.orphaned_cis, '');
    view.unmappedCis = this.buildCmdbInsightMetricViewData('Unmapped', data.unmapped_cis, 'text-primary');
    view.duplicateCis = this.buildCmdbInsightMetricViewData('Duplicate CIs', data.duplicate_cis, 'text-primary');
    return view;
  }

  getCiDistributionByDeviceTable(
    page = 1,
    pageSize = 8,
    filters?: DiscoveryDashboardFilterCriteria
  ): Observable<DiscoveryDashboardPaginatedResponse<CiDistributionByDeviceDataItem>> {
    let params = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));

    return this.http.get<CiDistributionByDeviceData>(`/customer/discovery-dashboard/device_type_distribution/`, {
      params
    }).pipe(
      map(res => this.normalizePaginatedResponse<CiDistributionByDeviceDataItem>(res, page, pageSize))
    );
  }

  convertToCiDistributionByDeviceChartView(data: CiDistributionByDeviceData): EChartsOption {
    const rows = this.sortCiDistributionByDeviceRows(
      this.convertToCiDistributionByDeviceTableView(data),
      'count',
      'desc'
    );
    if (!rows.length) {
      return null;
    }

    const counts = rows.map(item => item.count);
    const xAxisScale = this.getTrendAnalyticsAxisScale(counts);

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          const row = rows[item?.dataIndex ?? -1];
          return `${item?.axisValueLabel || ''}<br/>Count: ${Number(item?.value || 0).toLocaleString()}<br/>Share: ${Number(row?.share || 0).toFixed(1)}%`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: 160,
        right: 44,
        top: 18,
        bottom: 18,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: xAxisScale.max,
        interval: xAxisScale.interval,
        axisLine: {
          lineStyle: {
            color: '#d6dde5'
          }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#6f7782',
          fontSize: 11,
          formatter: (value: number) => value.toLocaleString()
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map(item => item.deviceType),
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#8e969f'
          }
        },
        axisLabel: {
          color: '#5f6874',
          fontSize: 11
        }
      },
      series: [
        {
          name: 'Device Type Distribution',
          type: 'bar',
          barMaxWidth: 16,
          data: rows.map(item => item.count),
          itemStyle: {
            color: (params: any) => CI_DISTRIBUTION_CHART_COLORS[params?.dataIndex % CI_DISTRIBUTION_CHART_COLORS.length],
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: '#333b44',
            fontSize: 11,
            formatter: (params: any) => Number(params?.value || 0).toLocaleString()
          }
        }
      ]
    };
  }

  convertToCiDistributionByDeviceTableView(data: CiDistributionByDeviceData): CiDistributionByDeviceTableRowViewData[] {
    return (data?.results || []).map(item => {
      const row = new CiDistributionByDeviceTableRowViewData();
      row.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      row.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      row.deviceType = item?.device_type || item?.category || '';
      row.deviceTypeKey = item?.device_type_key || item?.category_key || '';
      row.redirectUrl = item?.redirect_url || '';
      row.segregation = item?.segregation || '';
      row.sourceDeviceTypes = item?.source_device_types || [];
      row.count = item?.count ?? 0;
      row.share = item?.share ?? 0;
      return row;
    });
  }

  sortCiDistributionByDeviceRows(
    rows: CiDistributionByDeviceTableRowViewData[],
    sortColumn: CiDistributionByDeviceSortColumn,
    sortDirection: string
  ): CiDistributionByDeviceTableRowViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getCiDistributionByDicoveryTable(
    page = 1,
    pageSize = 8,
    filters?: DiscoveryDashboardFilterCriteria
  ): Observable<DiscoveryDashboardPaginatedResponse<CiDistributionByDiscoveryItem>> {
    let params = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));

    return this.http.get<CiDistributionByDiscoveryResponse>(`customer/discovery-dashboard/discovery_distribution/`, {
      params
    }).pipe(
      map(res => this.normalizePaginatedResponse<CiDistributionByDiscoveryItem>(res, page, pageSize))
    );
  }

  convertToCiDistributionByDiscoveryChartView(data: CiDistributionByDiscoveryResponse): EChartsOption {
    const rows = this.convertToCiDistributionByDiscoveryTableView(data);
    if (!rows.length) {
      return null;
    }

    const discoveryMethodMap = new Map<string, {
      discoveryMethod: string;
      total: number;
      vendorCounts: Record<string, number>;
    }>();
    rows.forEach((row: CiDistributionByDiscoveryTableRowViewData) => {
      const discoveryMethod = row.discoveryMethod || 'N/A';
      const vendorPlatform = row.vendorPlatform || 'N/A';
      const resourceCount = this.getSafeNumberValue(row.resourceCount);
      const existingMethod = discoveryMethodMap.get(discoveryMethod) || {
        discoveryMethod,
        total: 0,
        vendorCounts: {}
      };

      existingMethod.total += resourceCount;
      existingMethod.vendorCounts[vendorPlatform] = (existingMethod.vendorCounts[vendorPlatform] || 0) + resourceCount;
      discoveryMethodMap.set(discoveryMethod, existingMethod);
    });

    const chartRows = Array.from(discoveryMethodMap.values())
      .sort((left, right) => {
        if (right.total === left.total) {
          return left.discoveryMethod.localeCompare(right.discoveryMethod);
        }

        return right.total - left.total;
      })
      .slice(0, 10);

    const visibleVendorTotals = new Map<string, number>();
    chartRows.forEach(item => {
      Object.entries(item.vendorCounts).forEach(([vendorPlatform, count]) => {
        visibleVendorTotals.set(vendorPlatform, (visibleVendorTotals.get(vendorPlatform) || 0) + Number(count || 0));
      });
    });

    const vendorPlatforms = Array.from(visibleVendorTotals.entries())
      .sort((left, right) => {
        if (right[1] === left[1]) {
          return left[0].localeCompare(right[0]);
        }

        return right[1] - left[1];
      })
      .map(([vendorPlatform]) => vendorPlatform);

    const discoveryMethods = chartRows.map(item => item.discoveryMethod);
    const totals = chartRows.map(item => item.total);
    const yAxisScale = this.getTrendAnalyticsAxisScale(totals);
    const barWidth = chartRows.length <= 3 ? 44 : chartRows.length <= 5 ? 32 : 22;
    const barCategoryGap = chartRows.length <= 3 ? '18%' : chartRows.length <= 5 ? '28%' : '40%';

    return {
      animation: false,
      color: vendorPlatforms.map((_, index) =>
        DISCOVERY_DISTRIBUTION_CHART_COLORS[index % DISCOVERY_DISTRIBUTION_CHART_COLORS.length]
      ),
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(59, 105, 240, 0.08)'
          }
        },
        backgroundColor: '#ffffff',
        borderColor: '#dde6ee',
        borderWidth: 1,
        padding: [10, 12],
        extraCssText: 'box-shadow: 0 8px 20px rgba(31, 41, 55, 0.12); border-radius: 6px;',
        textStyle: {
          color: '#445063'
        },
        formatter: (params: any[]) => {
          const axisItems = Array.isArray(params) ? params : [params];
          const fallbackTitleItem = axisItems.length ? axisItems[0] : null;
          const tooltipItems = axisItems
            .filter(item => Number(item?.value || 0) > 0)
            .sort((left, right) => Number(right?.value || 0) - Number(left?.value || 0));
          const title = echarts.format.encodeHTML(
            String(tooltipItems[0]?.axisValueLabel || tooltipItems[0]?.name || fallbackTitleItem?.axisValueLabel || '')
          );

          if (!tooltipItems.length) {
            return `<div style="min-width: 140px;">
              <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">${title}</div>
              <div style="font-size: 12px;">Total <span style="float: right; font-weight: 600;">0</span></div>
            </div>`;
          }

          const lines = tooltipItems.map(item => {
            const name = echarts.format.encodeHTML(String(item?.seriesName || 'N/A'));
            const value = Number(item?.value || 0).toLocaleString();
            return `${item?.marker || ''}${name}<span style="float: right; margin-left: 18px; font-weight: 600;">${value}</span>`;
          });
          const total = tooltipItems.reduce((sum, item) => sum + Number(item?.value || 0), 0).toLocaleString();

          return `<div style="min-width: 180px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">${title}</div>
            <div style="font-size: 12px; line-height: 1.6;">${lines.join('<br/>')}</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e6edf3; font-size: 12px; font-weight: 600;">
              Total <span style="float: right;">${total}</span>
            </div>
          </div>`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: 34,
        right: 18,
        top: 20,
        bottom: 44,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: discoveryMethods,
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#8e969f'
          }
        },
        axisLabel: {
          color: '#6a7480',
          fontSize: 11,
          interval: 0,
          margin: 8,
          formatter: (value: string) => {
            const label = String(value || '').trim();
            return label.length > 12 ? `${label.slice(0, 12)}...` : label;
          }
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisScale.max,
        interval: yAxisScale.interval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6a7480',
          fontSize: 11,
          formatter: (value: number) => value.toLocaleString()
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: vendorPlatforms.map((vendorPlatform: string) => ({
        name: vendorPlatform,
        type: 'bar',
        stack: 'total',
        barWidth,
        barCategoryGap,
        itemStyle: {
          borderWidth: 0
        },
        data: chartRows.map(item => item.vendorCounts[vendorPlatform] || 0)
      }))
    };
  }

  convertToCiDistributionByDiscoveryTableView(data: CiDistributionByDiscoveryResponse): CiDistributionByDiscoveryTableRowViewData[] {
    return this.getResponseResults(data).map(item => {
      const row = new CiDistributionByDiscoveryTableRowViewData();
      const resourcesDiscovered = typeof item?.resources_discovered === 'string'
        ? item.resources_discovered
        : String(item?.resources_discovered ?? '');
      const resourceCount = this.getSafeNumberValue(
        item?.resource_count != null ? item.resource_count : item?.resources_discovered
      );

      row.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      row.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      row.protocol = item?.protocol || '';
      row.discoveryMethod = item?.discovery_method || '';
      row.infrastructureType = item?.infrastructure_type || '';
      row.vendorPlatform = item?.vendor_platform || '';
      row.resourceCount = resourceCount;
      row.down = this.getSafeNumberValue(item?.down);
      row.resourcesDiscovered = resourcesDiscovered || 'N/A';
      row.unknown = this.getSafeNumberValue(item?.unknown);
      row.up = this.getSafeNumberValue(item?.up);
      row.lastRun = item?.last_run || '';
      return row;
    });
  }

  private formatDeploymentEnvironmentLabel(value?: string): string {
    switch (value) {
      case 'public_cloud':
        return 'Public Cloud';
      case 'private_cloud':
        return 'Private Cloud';
      case 'datacenter':
        return 'Datacenter';
      default:
        return value ? value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : '';
    }
  }

  private getDeploymentEnvironmentTone(value?: string): 'public-cloud' | 'private-cloud' | 'datacenter' | 'default' {
    switch (value) {
      case 'public_cloud':
        return 'public-cloud';
      case 'private_cloud':
        return 'private-cloud';
      case 'datacenter':
        return 'datacenter';
      default:
        return 'default';
    }
  }

  sortCiDistributionByDiscoveryRows(
    rows: CiDistributionByDiscoveryTableRowViewData[],
    sortColumn: CiDistributionByDiscoverySortColumn,
    sortDirection: string
  ): CiDistributionByDiscoveryTableRowViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getNewlyDiscoveredDevices(page = 1, pageSize = 10, searchValue = '', filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredDevice> {
    let params = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));
    params = params.set('search', searchValue || '');

    return this.http.get<NewlyDiscoveredDevice>('customer/discovery-dashboard/newly_discovered_device/', {
      params
    });
  }

  getNewlyDiscoveredManufacturerModelDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredManufacturerModelDistribution> {
    return this.http.get<NewlyDiscoveredManufacturerModelDistribution>('customer/discovery-dashboard/manufacturer_model_distribution/', {
      params: this.buildFilterParams(filters)
    });
  }

  getNewlyDiscoveredDatacenterDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredDatacenterDistribution> {
    return this.http.get<NewlyDiscoveredDatacenterDistribution>('customer/discovery-dashboard/datacenter_asset_distribution', {
      params: this.buildFilterParams(filters)
    });

  }

  getNewlyDiscoveredStatusByDatacenterDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredStatusByDatacenterDistribution> {
    return this.http.get<NewlyDiscoveredStatusByDatacenterDistribution>('customer/discovery-dashboard/device_status_by_datacenter', {
      params: this.buildFilterParams(filters)
    });

  }

  convertToNewlyDiscoveredDeviceViewData(data: NewlyDiscoveredDeviceItem[]): NewlyDiscoveredDeviceItemViewData[] {
    return (data || []).map((item: NewlyDiscoveredDeviceItem) => {
      const viewItem = new NewlyDiscoveredDeviceItemViewData();
      const normalizedStatus = this.normalizeAvailabilityStatus(item?.availability_status);
      viewItem.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      viewItem.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      viewItem.availabilityStatus = normalizedStatus;
      viewItem.availabilityStatusClass = this.getAvailabilityStatusClass(normalizedStatus);
      viewItem.ciName = item?.ci_name || 'N/A';
      viewItem.ciType = item?.ci_type || 'N/A';
      viewItem.datacenter = item?.datacenter || 'N/A';
      viewItem.datacenterClass = 'badge badge-pill badge-light text-primary px-2 py-1';
      viewItem.discoveryMethod = item?.discovery_method || 'N/A';
      viewItem.discoveryMethodClass = 'badge badge-pill badge-light text-secondary px-2 py-1';
      viewItem.lastDiscovered = item?.last_discovered || 'N/A';
      viewItem.lastDiscoveredTimestamp = this.getTimestampValue(item?.last_discovered_at);
      viewItem.manufacturer = item?.manufacturer || 'N/A';
      viewItem.model = item?.model || 'N/A';
      viewItem.osTypeGroup = item?.os_type || 'N/A';
      viewItem.platform = item?.platform || 'N/A';
      viewItem.serialNumber = item?.serial_number || 'N/A';
      viewItem.uptime = item?.uptime || 'N/A';
      viewItem.uptimeDays = this.getUptimeDays(item?.uptime);
      return viewItem;
    });
  }

  sortNewlyDiscoveredDeviceRows(
    rows: NewlyDiscoveredDeviceItemViewData[],
    sortColumn: NewlyDiscoveredDevicesSortColumn,
    sortDirection: string
  ): NewlyDiscoveredDeviceItemViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  convertToNewlyDiscoveredManufacturerModelChartView(data: NewlyDiscoveredManufacturerModelDistribution): EChartsOption {
    const manufacturers = (data?.results || [])
      .filter((item: NewlyDiscoveredManufacturerDistributionItem) => Number(item?.total || 0) > 0);
    if (!manufacturers.length) {
      return null;
    }

    const manufacturerNames = manufacturers.map(item => item?.manufacturer || 'Unknown');
    const manufacturerModelCounts = manufacturers.reduce((acc: Record<string, Record<string, number>>, manufacturerItem) => {
      const manufacturer = manufacturerItem?.manufacturer || 'Unknown';
      const modelCounts = (manufacturerItem?.models || []).reduce((counts: Record<string, number>, modelItem) => {
        const model = modelItem?.model || 'Unknown';
        counts[model] = Number(modelItem?.count || 0);
        return counts;
      }, {});

      acc[manufacturer] = modelCounts;
      return acc;
    }, {});

    const models = Array.from(
      new Set(
        manufacturerNames.flatMap(manufacturer => Object.keys(manufacturerModelCounts[manufacturer] || {}))
      )
    );

    return {
      animation: false,
      title: {
        text: 'Manufacturer & Model Distribution',
        top: 4,
        left: 'center',
        textStyle: {
          color: '#445063',
          fontSize: 13,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any[]) => {
          const manufacturer = params?.[0]?.axisValueLabel || params?.[0]?.name || '';
          if (!manufacturer) {
            return '';
          }

          const modelCounts = manufacturerModelCounts[manufacturer] || {};
          const tooltipLines = Object.entries(modelCounts)
            .sort((left, right) => right[1] - left[1])
            .map(([model, count]) => {
              const seriesIndex = models.indexOf(model);
              const color = NEWLY_DISCOVERED_MODEL_CHART_COLORS[seriesIndex % NEWLY_DISCOVERED_MODEL_CHART_COLORS.length];
              return `<span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>${model}: ${count}`;
            });

          return [manufacturer, ...tooltipLines].join('<br/>');
        }
      },
      legend: {
        show: false,
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#5d6670',
          fontSize: 11
        },
        data: models
      },
      grid: {
        left: 72,
        right: 18,
        top: 34,
        bottom: 42,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: manufacturerNames,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7785',
          fontSize: 11
        }
      },
      series: models.map((model, index) => ({
        name: model,
        type: 'bar',
        stack: 'manufacturer-model',
        barWidth: 18,
        data: manufacturerNames.map(manufacturer => manufacturerModelCounts[manufacturer]?.[model] || 0),
        itemStyle: {
          color: NEWLY_DISCOVERED_MODEL_CHART_COLORS[index % NEWLY_DISCOVERED_MODEL_CHART_COLORS.length]
        }
      }))
    };
  }

  convertToNewlyDiscoveredAvailabilityTrendChartView(rows: NewlyDiscoveredDeviceItemViewData[]): EChartsOption {
    const buckets = this.buildNewlyDiscoveredWeekBuckets(rows);
    if (!buckets.length) {
      return null;
    }

    const statuses = ['Up', 'Down', 'Unknown', 'Degraded']
      .filter(status => buckets.some(bucket => (bucket.statusCounts[status] || 0) > 0));

    return {
      animation: false,
      title: {
        text: 'Availability Status Trend',
        top: 4,
        left: 'center',
        textStyle: {
          color: '#445063',
          fontSize: 13,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        }
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#5d6670',
          fontSize: 11
        },
        data: statuses
      },
      grid: {
        left: 28,
        right: 18,
        top: 34,
        bottom: 42,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: buckets.map(bucket => bucket.label),
        axisLine: {
          lineStyle: {
            color: '#d3d9df'
          }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#9aa4af',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: statuses.map(status => ({
        name: status,
        type: 'line',
        smooth: true,
        data: buckets.map(bucket => bucket.statusCounts[status] || 0),
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: true,
        lineStyle: {
          width: 2,
          color: NEWLY_DISCOVERED_STATUS_COLORS[status]
        },
        itemStyle: {
          color: NEWLY_DISCOVERED_STATUS_COLORS[status]
        }
      }))
    };
  }

  convertToNewlyDiscoveredDatacenterChartView(data: NewlyDiscoveredDatacenterDistribution): EChartsOption {
    const datacenters = (data?.results || [])
      .filter((item: NewlyDiscoveredDatacenterDistributionItem) => Number(item?.count || 0) > 0);
    if (!datacenters.length) {
      return null;
    }

    const categories = datacenters.map(item => item?.datacenter || 'Unknown');
    const values = datacenters.map(item => Number(item?.count || 0));
    const yAxisScale = this.getTrendAnalyticsAxisScale(values);

    return {
      animation: false,
      title: {
        text: 'Top Datacenters by Asset Count',
        top: 4,
        left: 'center',
        textStyle: {
          color: '#445063',
          fontSize: 13,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        }
      },
      grid: {
        left: 28,
        right: 18,
        top: 34,
        bottom: 32,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#d3d9df'
          }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#7f8a96',
          fontSize: 11,
          rotate: 20
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisScale.max,
        interval: yAxisScale.interval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: values,
          barMaxWidth: 34,
          itemStyle: {
            color: (params: any) => NEWLY_DISCOVERED_MODEL_CHART_COLORS[params?.dataIndex % NEWLY_DISCOVERED_MODEL_CHART_COLORS.length],
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            color: '#445063',
            fontSize: 11,
            formatter: '{c}'
          }
        }
      ]
    };
  }

  convertToNewlyDiscoveredStatusByDatacenterChartView(data: NewlyDiscoveredStatusByDatacenterDistribution): EChartsOption {
    const datacenters = (data?.results || [])
      .filter((item: NewlyDiscoveredStatusByDatacenterItem) => Number(item?.total || 0) > 0);
    if (!datacenters.length) {
      return null;
    }

    const categories = datacenters.map(item => item?.datacenter || 'Unknown');
    const statuses = [
      { key: 'up', label: 'Up' },
      { key: 'down', label: 'Down' },
      { key: 'unknown', label: 'Unknown' }
    ].filter(status => datacenters.some(item => Number(item?.[status.key] || 0) > 0));

    return {
      animation: false,
      title: {
        text: 'Device Status by Datacenter',
        top: 4,
        left: 'center',
        textStyle: {
          color: '#445063',
          fontSize: 13,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        }
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#5d6670',
          fontSize: 11
        },
        data: statuses.map(item => item.label)
      },
      grid: {
        left: 28,
        right: 18,
        top: 34,
        bottom: 42,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#d3d9df'
          }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#7f8a96',
          fontSize: 11,
          rotate: 20
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: statuses.map(status => ({
        name: status.label,
        type: 'bar',
        stack: 'status',
        barMaxWidth: 34,
        data: datacenters.map(item => Number(item?.[status.key] || 0)),
        itemStyle: {
          color: NEWLY_DISCOVERED_STATUS_COLORS[status.label],
          borderRadius: status.label === statuses[statuses.length - 1]?.label ? [4, 4, 0, 0] : [0, 0, 0, 0]
        }
      }))
    };
  }

  private normalizeAvailabilityStatus(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'healthy':
      case 'up':
        return 'Up';

      case 'warning':
      case 'degraded':
        return 'Degraded';

      case 'critical':
      case 'down':
        return 'Down';

      default:
        return 'Unknown';
    }
  }

  private getAvailabilityStatusClass(status: string): string {
    switch (status) {
      case 'Up':
        return 'd-inline-flex align-items-center justify-content-center discovery-availability-pill discovery-availability-pill--up';

      case 'Degraded':
        return 'd-inline-flex align-items-center justify-content-center discovery-availability-pill discovery-availability-pill--degraded';

      case 'Down':
        return 'd-inline-flex align-items-center justify-content-center discovery-availability-pill discovery-availability-pill--down';

      default:
        return 'd-inline-flex align-items-center justify-content-center discovery-availability-pill discovery-availability-pill--unknown';
    }
  }

  private getOrphanedStatusIconClass(status: string): string {
    switch (status) {
      case 'Up':
        return 'fas fa-check-circle text-success font-xs-sm';

      case 'Degraded':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';

      case 'Down':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';

      default:
        return 'fas fa-question-circle text-muted font-xs-sm';
    }
  }

  private getTimestampValue(value: string): number {
    const timestamp = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  private getSafeNumberValue(value: any): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (value == null || value === '') {
      return 0;
    }

    const normalizedValue = typeof value === 'string'
      ? value.replace(/,/g, '').trim()
      : value;
    const numericValue = Number(normalizedValue);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private getUptimeDays(value: string): number {
    if (!value || value === 'N/A') {
      return -1;
    }

    const dayMatch = String(value).match(/(\d+)\s+days?/i);
    const hourMatch = String(value).match(/(\d+):(\d+):(\d+)/);
    const days = dayMatch ? Number(dayMatch[1]) : 0;
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    return days + (hours / 24);
  }

  private getTopGroupedEntries<T>(rows: T[], getKey: (row: T) => string, limit: number): Array<[string, number]> {
    return Object.entries(
      (rows || []).reduce((acc: Record<string, number>, row) => {
        const key = getKey(row) || 'N/A';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((left, right) => right[1] - left[1])
      .slice(0, limit);
  }

  private buildNewlyDiscoveredWeekBuckets(rows: NewlyDiscoveredDeviceItemViewData[]): Array<{ label: string; statusCounts: Record<string, number> }> {
    const timestamps = rows.map(row => row.lastDiscoveredTimestamp).filter(value => value > 0);
    if (!timestamps.length) {
      return [];
    }

    const maxTimestamp = Math.max(...timestamps);
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const buckets = [
      { label: 'W1', statusCounts: {} as Record<string, number> },
      { label: 'W2', statusCounts: {} as Record<string, number> },
      { label: 'W3', statusCounts: {} as Record<string, number> },
      { label: 'W4', statusCounts: {} as Record<string, number> }
    ];

    rows.forEach(row => {
      const diff = row.lastDiscoveredTimestamp > 0 ? maxTimestamp - row.lastDiscoveredTimestamp : (4 * weekMs);
      const bucketIndex = Math.min(3, Math.max(0, Math.floor(diff / weekMs)));
      const bucket = buckets[bucketIndex];
      bucket.statusCounts[row.availabilityStatus] = (bucket.statusCounts[row.availabilityStatus] || 0) + 1;
    });

    return buckets;
  }

  getOrphanedDeviceByType(
    page = 1,
    pageSize = 10,
    filters?: DiscoveryDashboardFilterCriteria
  ): Observable<OrphanedDeviceByTypeResponse> {
    let params = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));

    return this.http.get<OrphanedDeviceByTypeResponse>('customer/discovery-dashboard/orphaned_devices/', {
      params
    });

  }

  convertToOrphanedDeviceByTypeViewData(data: OrphanedDeviceByTypeItem[]): OrphanedDeviceByTypeItemViewData[] {
    return (data || []).map((item: OrphanedDeviceByTypeItem) => {
      const viewItem = new OrphanedDeviceByTypeItemViewData();
      const normalizedStatus = this.normalizeAvailabilityStatus(item?.status);
      viewItem.uuid = item?.uuid || '';
      viewItem.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      viewItem.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      viewItem.deviceName = item?.device_name || item?.name || 'N/A';
      viewItem.device = item?.device || '';
      viewItem.deviceTypeKey = item?.deviceType || '';
      viewItem.vmSubType = item?.vmSubType || '';
      viewItem.configured = !!item?.configured;
      viewItem.status = normalizedStatus;
      viewItem.statusIconClass = this.getOrphanedStatusIconClass(normalizedStatus);
      viewItem.deviceType = item?.device_type || 'N/A';
      viewItem.lastSeen = item?.last_seen || item?.last_availability_time || 'N/A';
      viewItem.lastSeenTimestamp = this.getTimestampValue(item?.last_seen || item?.last_availability_time);
      viewItem.datacenter = item?.datacenter || 'N/A';
      return viewItem;
    });
  }

  sortOrphanedDeviceByTypeRows(
    rows: OrphanedDeviceByTypeItemViewData[],
    sortColumn: OrphanedDeviceByTypeSortColumn,
    sortDirection: string
  ): OrphanedDeviceByTypeItemViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getOrphanedDevicesBreakdown(
    filters?: DiscoveryDashboardFilterCriteria
  ): Observable<OrphanedDevicesBreakdownResponse> {
    return this.http.get<OrphanedDevicesBreakdownResponse>('customer/discovery-dashboard/orphaned_device_by_type', {
      params: this.buildFilterParams(filters)
    });

  }

  convertToOrphanedDevicesBreakdownViewData(data: OrphanedDevicesBreakdownResponse): OrphanedDevicesBreakdownItem[] {
    if (!data?.breakdown?.length) {
      return [];
    }

    return (data.breakdown || [])
      .map((item: OrphanedDevicesBreakdownItem) => ({
        category: item?.category || 'Unknown',
        count: Number(item?.count || 0),
        percentage: Number(item?.percentage || 0)
      }))
      .sort((left, right) => right.count - left.count);
  }

  convertToOrphanedDevicesBreakdownChartView(data: OrphanedDevicesBreakdownItem[]): EChartsOption {
    const rows = (data || []).filter(item => Number(item?.count) > 0);
    if (!rows.length) {
      return null;
    }

    return {
      animation: false,
      color: ORPHANED_DEVICES_CHART_COLORS,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const item = params?.data || {};
          return `${item?.name || ''}<br/>Count: ${Number(item?.value || 0).toLocaleString()}<br/>${Number(item?.percentage || 0)}%`;
        }
      },
      series: [
        {
          name: 'Orphaned by Category',
          type: 'pie',
          radius: ['56%', '77%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            color: '#445063',
            fontSize: 12,
            formatter: (params: any) => Number(params?.data?.value || 0).toLocaleString()
          },
          labelLine: {
            show: true,
            length: 12,
            length2: 8,
            lineStyle: {
              color: '#9aa6b2'
            }
          },
          data: rows.map((item, index) => ({
            name: item.category,
            value: item.count,
            percentage: item.percentage,
            itemStyle: {
              color: ORPHANED_DEVICES_CHART_COLORS[index % ORPHANED_DEVICES_CHART_COLORS.length]
            }
          }))
        }
      ]
    };
  }

  getTopDiscoveryFailuresTable(
    page = 1,
    pageSize = 8,
    filters?: DiscoveryDashboardFilterCriteria
  ): Observable<DiscoveryDashboardPaginatedResponse<TopDiscoveryFailuresItem>> {
    let params = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));

    return this.http.get<TopDiscoveryFailuresResponse>(`customer/discovery-dashboard/top_discovery_policy/`, {
      params
    }).pipe(
      map(res => this.normalizePaginatedResponse<TopDiscoveryFailuresItem>(res, page, pageSize))
    );
  }

  convertToTopDiscoveryFailuresViewData(data: TopDiscoveryFailuresResponse): TopDiscoveryFailuresItemViewData[] {
    const viewData: TopDiscoveryFailuresItemViewData[] = [];

    this.getResponseResults(data).forEach((item: TopDiscoveryFailuresItem) => {
      const viewItem = new TopDiscoveryFailuresItemViewData();
      viewItem.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      viewItem.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      viewItem.policyName = item?.policy_name;
      viewItem.failureCount = item?.failure_count;
      viewItem.lastFailure = item?.last_failure;
      viewData.push(viewItem);
    });

    return viewData;
  }

  convertToTopDiscoveryFailuresChartView(data: TopDiscoveryFailuresResponse): EChartsOption {
    const rows = this.sortTopDiscoveryFailuresRows(
      this.convertToTopDiscoveryFailuresViewData(data),
      'failureCount',
      'desc'
    );
    if (!rows.length) {
      return null;
    }

    const values = rows.map(item => item.failureCount);
    const yAxisScale = this.getTrendAnalyticsAxisScale(values);

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `${item?.axisValueLabel || ''}: ${Number(item?.value || 0).toLocaleString()}`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: 22,
        right: 12,
        top: 48,
        bottom: 56,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: rows.map(item => item.policyName),
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#8e969f'
          }
        },
        axisLabel: {
          color: '#6a7480',
          fontSize: 11,
          interval: 0,
          rotate: 28
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisScale.max,
        interval: yAxisScale.interval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6a7480',
          fontSize: 11,
          formatter: (value: number) => value.toLocaleString()
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: [
        {
          name: 'Failures by Policy',
          type: 'bar',
          barMaxWidth: 20,
          data: values,
          itemStyle: {
            color: (params: any) => TOP_DISCOVERY_FAILURES_CHART_COLORS[params?.dataIndex % TOP_DISCOVERY_FAILURES_CHART_COLORS.length],
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  }

  sortTopDiscoveryFailuresRows(
    rows: TopDiscoveryFailuresItemViewData[],
    sortColumn: TopDiscoveryFailuresSortColumn,
    sortDirection: string
  ): TopDiscoveryFailuresItemViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getTOperatingSystems(filters?: DiscoveryDashboardFilterCriteria): Observable<OperatingSystems> {

    return this.http.get<OperatingSystems>(`customer/discovery-dashboard/os_overview/`, {
      params: this.buildFilterParams(filters)
    });
  }

  convertToOperatingSystemsViewData(data: OperatingSystemsItem[]): OperatingSystemsItemViewData[] {
    const viewData: OperatingSystemsItemViewData[] = [];

    (data || []).forEach((item: OperatingSystemsItem) => {
      const viewItem = new OperatingSystemsItemViewData();
      viewItem.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      viewItem.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      viewItem.count = item?.count;
      viewItem.eolData = item?.eol_data || '-';
      viewItem.osType = item?.os_type;
      viewItem.osVersion = item?.os_version;
      viewData.push(viewItem);
    });

    return viewData;
  }

  convertToOperatingSystemsChartView(data: OperatingSystemsItem[]): EChartsOption {
    const rows = this.convertToOperatingSystemsViewData(data);
    if (!rows.length) {
      return null;
    }

    const osTypes = Array.from(new Set(rows.map(item => item.osType)));
    const versions = Array.from(new Set(rows.map(item => item.osVersion)));
    const osVersionCounts = osTypes.reduce((acc: Record<string, Record<string, number>>, osType) => {
      const versionCounts = rows
        .filter(item => item.osType === osType)
        .reduce((counts: Record<string, number>, item) => {
          const version = item.osVersion || 'N/A';
          counts[version] = (counts[version] || 0) + (item.count || 0);
          return counts;
        }, {});

      acc[osType] = versionCounts;
      return acc;
    }, {});
    const yAxisScale = this.getTrendAnalyticsAxisScale(rows.map(item => item.count));

    return {
      animation: false,
      legend: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any[]) => {
          const osType = params?.[0]?.axisValueLabel || params?.[0]?.name || '';
          if (!osType) {
            return '';
          }

          const versionCounts = osVersionCounts[osType] || {};
          const tooltipLines = Object.entries(versionCounts)
            .filter(([, count]) => Number(count) > 0)
            .sort((left, right) => right[1] - left[1])
            .map(([version, count]) => {
              const seriesIndex = versions.indexOf(version);
              const color = OS_OVERVIEW_CHART_COLORS[seriesIndex % OS_OVERVIEW_CHART_COLORS.length];
              return `<span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>${version}: ${Number(count).toLocaleString()}`;
            });

          return [osType, ...tooltipLines].join('<br/>');
        }
      },
      grid: {
        left: 18,
        right: 18,
        top: 20,
        bottom: 32,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: osTypes,
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#8e969f'
          }
        },
        axisLabel: {
          color: '#555d66',
          fontSize: 11,
          rotate: 20,
          margin: 10,
          formatter: (value: string) => {
            const label = String(value || '').trim();
            return label.length > 12 ? `${label.slice(0, 12)}...` : label;
          }
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisScale.max,
        interval: yAxisScale.interval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#98a2ad',
          fontSize: 11,
          formatter: (value: number) => value.toLocaleString()
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#edf1f5'
          }
        }
      },
      series: versions.map((version, index) => ({
        name: version,
        type: 'bar',
        stack: 'os',
        barWidth: 30,
        data: osTypes.map(osType => {
          const row = rows.find(item => item.osType === osType && item.osVersion === version);
          return row ? row.count : 0;
        }),
        itemStyle: {
          color: OS_OVERVIEW_CHART_COLORS[index % OS_OVERVIEW_CHART_COLORS.length]
        }
      }))
    };
  }

  sortOperatingSystemsRows(
    rows: OperatingSystemsItemViewData[],
    sortColumn: OperatingSystemsSortColumn,
    sortDirection: string
  ): OperatingSystemsItemViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getCmdbSyncTrend(filters?: DiscoveryDashboardFilterCriteria): Observable<CmdbSyncTrend> {
    // return of(CMDB_SYNC_TREND);
    return this.http.get<CmdbSyncTrend>(`/customer/discovery-dashboard/discoveryvscmdb/`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToCmdbSyncTrendChartView(data: CmdbSyncTrend): EChartsOption {
    const rows = this.convertToCmdbSyncTrendTableView(data);
    if (!rows.length) {
      return null;
    }

    const weeks = rows.map(item => item.week);
    const discoveredCis = rows.map(item => item.discoveredCis);
    const syncedCis = rows.map(item => item.syncedCis);
    const failed = rows.map(item => item.failed);
    const pending = rows.map(item => item.pending);
    const yAxisScale = this.getTrendAnalyticsAxisScale([
      ...discoveredCis,
      ...syncedCis,
      ...failed,
      ...pending
    ]);

    return {
      animation: false,
      legend: {
        bottom: 8,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#5d6670',
          fontSize: 12
        },
        data: ['Discovered CIs', 'Synced CIs', 'Failed', 'Pending']
      },
      grid: {
        left: 20,
        right: 18,
        top: 16,
        bottom: 44,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: weeks,
        axisLine: {
          lineStyle: {
            color: '#8e969f'
          }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#555d66',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisScale.max,
        interval: yAxisScale.interval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#555d66',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#d7dee5',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Discovered CIs',
          type: 'line',
          smooth: true,
          data: discoveredCis,
          symbol: 'circle',
          symbolSize: 7,
          showSymbol: true,
          lineStyle: {
            width: 3,
            color: '#8458ff'
          },
          itemStyle: {
            color: '#8458ff'
          },
          z: 4
        },
        {
          name: 'Synced CIs',
          type: 'bar',
          data: syncedCis,
          barMaxWidth: 36,
          itemStyle: {
            color: '#4f73e8',
            borderRadius: [4, 4, 0, 0]
          },
          z: 2
        },
        {
          name: 'Failed',
          type: 'bar',
          data: failed,
          barMaxWidth: 36,
          itemStyle: {
            color: '#10b14f',
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Pending',
          type: 'line',
          smooth: true,
          data: pending,
          symbol: 'circle',
          symbolSize: 7,
          showSymbol: true,
          lineStyle: {
            width: 2,
            color: '#ff7a00'
          },
          itemStyle: {
            color: '#ff7a00'
          },
          z: 4
        }
      ]
    };
  }

  convertToCmdbSyncTrendTableView(data: CmdbSyncTrend): CmdbSyncTrendTableRowViewData[] {
    return (data || []).map((item, index) => {
      const row = new CmdbSyncTrendTableRowViewData();
      row.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      row.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      row.week = item?.week;
      row.weekOrder = index;
      row.discoveredCis = item?.discovered_cis ?? 0;
      row.syncedCis = item?.synced_cis ?? 0;
      row.failed = item?.failed ?? 0;
      row.pending = item?.pending ?? 0;
      return row;
    });
  }

  sortCmdbSyncTrendRows(
    rows: CmdbSyncTrendTableRowViewData[],
    sortColumn: CmdbSyncTrendSortColumn,
    sortDirection: string
  ): CmdbSyncTrendTableRowViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getCiDistribution(
    page = 1,
    pageSize = 8,
    filters?: DiscoveryDashboardFilterCriteria
  ): Observable<CiDistributionByDevice> {
    let params = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));

    return this.http.get<CiDistributionByDevice>(`/customer/discovery-dashboard/ci_distribution_by_device/`, {
      params
    }).pipe(
      map(res => this.normalizePaginatedResponse<CiDistributionItem>(res, page, pageSize))
    );

  }

  convertToCiDistributionChartView(data: CiDistributionByDevice): EChartsOption {
    const rows = this.convertToCiDistributionTableView(data);
    if (!rows.length) {
      return null;
    }

    const chartItems = rows.map((row, index) => ({
      name: row.category,
      value: row.count,
      share: row.share,
      redirectUrl: row.redirectUrl,
      itemStyle: {
        color: CI_DISTRIBUTION_WIDGET_COLORS[index % CI_DISTRIBUTION_WIDGET_COLORS.length]
      }
    }));

    return {
      animation: false,
      color: CI_DISTRIBUTION_WIDGET_COLORS,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => `${params?.name || ''}: ${Number(params?.data?.share ?? 0).toFixed(1)}%`
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'New CI Distribution',
          type: 'pie',
          radius: ['42%', '62%'],
          center: ['50%', '49%'],
          startAngle: 90,
          clockwise: true,
          selectedMode: false,
          avoidLabelOverlap: true,
          stillShowZeroSum: false,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#2f3b46',
            fontSize: 12,
            formatter: (params: any) => `${Number(params?.data?.share ?? 0).toFixed(0)}%`
          },
          labelLine: {
            show: true,
            length: 18,
            length2: 20,
            lineStyle: {
              width: 1.4
            }
          },
          data: chartItems
        }
      ]
    };
  }

  convertToCiDistributionTableView(data: CiDistributionByDevice): CiDistributionTableRowViewData[] {
    return (data?.results || []).map(item => {
      const row = new CiDistributionTableRowViewData();
      row.deploymentEnvironment = this.formatDeploymentEnvironmentLabel(item?.deployment_environment);
      row.deploymentEnvironmentTone = this.getDeploymentEnvironmentTone(item?.deployment_environment);
      row.category = item?.category || '';
      row.categoryKey = item?.category_key || '';
      row.count = item?.count ?? 0;
      row.share = item?.share ?? 0;
      row.redirectUrl = item?.redirect_url || '';
      return row;
    });
  }

  sortCiDistributionRows(
    rows: CiDistributionTableRowViewData[],
    sortColumn: CiDistributionSortColumn,
    sortDirection: string
  ): CiDistributionTableRowViewData[] {
    if (!rows?.length || !sortColumn || !sortDirection) {
      return rows ? [...rows] : [];
    }

    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortColumn];
      const rightValue = right[sortColumn];

      if (leftValue === rightValue) {
        return 0;
      }

      if (leftValue == null) {
        return -1 * directionMultiplier;
      }

      if (rightValue == null) {
        return 1 * directionMultiplier;
      }

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return (Number(leftValue) - Number(rightValue)) * directionMultiplier;
    });
  }

  getResourceDiscovery(filters?: DiscoveryDashboardFilterCriteria): Observable<ResourceDiscoveryData> {
    // return of(RESOURCE_DISTRIBUTION);
    return this.http.get<ResourceDiscoveryData>(`customer/discovery-dashboard/resource_discovery_distribution`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToResourceDiscoveryViewData(data: ResourceDiscoveryData): ResourceDiscoveryViewData[] {
    return Object.entries(data || {})
      .filter(([_, value]) => typeof value === 'number' && Number.isFinite(value))
      .map(([key, value]) => {
        const viewItem = new ResourceDiscoveryViewData();
        viewItem.name = this.formatChartKeyLabel(key);
        viewItem.value = value;
        return viewItem;
      });
  }


  private formatChartKeyLabel(key: string): string {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  private getResponseResults<T>(data: DiscoveryDashboardPaginatedResponse<T> | T[]): T[] {
    if (Array.isArray(data)) {
      return data;
    }

    return data?.results || data?.data || [];
  }

  private getResponseCount<T>(data: DiscoveryDashboardPaginatedResponse<T> | T[]): number {
    if (Array.isArray(data)) {
      return data.length;
    }

    const total = Number(data?.count ?? data?.total ?? 0);
    return total > 0 ? total : (data?.results || data?.data || []).length;
  }

  private normalizePaginatedResponse<T>(
    data: DiscoveryDashboardPaginatedResponse<T> | T[],
    page = 1,
    pageSize = 8
  ): DiscoveryDashboardPaginatedResponse<T> {
    const results = this.getResponseResults(data);
    const count = this.getResponseCount(data);
    const paginatedData = Array.isArray(data) ? null : data;
    const isApiPaginated = !!paginatedData && (
      !!paginatedData.next ||
      !!paginatedData.previous ||
      (Number(paginatedData.count || 0) > results.length) ||
      (Number(paginatedData.total || 0) > results.length)
    );

    if (isApiPaginated) {
      return {
        count,
        total: count,
        next: paginatedData.next ?? null,
        previous: paginatedData.previous ?? null,
        results
      };
    }

    const start = Math.max(0, (page - 1) * pageSize);
    return {
      count,
      total: count,
      next: null,
      previous: null,
      results: results.slice(start, start + pageSize)
    };
  }

  private buildFilterParams(filters?: DiscoveryDashboardFilterCriteria): HttpParams {
    let params = new HttpParams();

    (filters?.deploymentEnvironment?.length ? filters.deploymentEnvironment : ['all']).forEach(environment => {
      params = params.append('deployment_environment', environment);
    });

    (filters?.region?.length ? filters.region : ['all']).forEach(region => {
      params = params.append('region', region);
    });

    params = params.set('time_range', this.mapTimeRangeToApiValue(filters?.timeRange || DISCOVERY_DASHBOARD_TIME_RANGE_DEFAULT));
    if (filters?.startDate) {
      params = params.set('start_datetime', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('end_datetime', filters.endDate);
    }
    return params;
  }

  private mapTimeRangeToApiValue(value: string): string {
    switch (value) {
      case 'last_7_days':
        return 'last_week';
      case 'last_30_days':
        return 'last_month';
      default:
        return value;
    }
  }


  // private convertToFilterOptions(data: any): any {
  //   return {
  //     platforms: this.convertPlatformValuesToOptions(data?.platform),
  //     regions: this.convertRegionValuesToOptions(data?.region),
  //     accounts: this.convertAccountValuesToOptions(data?.account)
  //   };
  // }
}

const CI_DISTRIBUTION_CHART_COLORS = [
  '#3b82f6',
  '#6fd598',
  '#80b8ff',
  '#6f7cf5',
  '#ffa445',
  '#39c7e7',
  '#9d8cf1',
  '#f48e8e',
  '#7b4a9b',
  '#5cc6ec',
  '#8ad4f0'
];

const DISCOVERY_DISTRIBUTION_CHART_COLORS = [
  '#3b69f0',
  '#16b364',
  '#f79009',
  '#9e77ed',
  '#39c7e7',
  '#f04483',
  '#f6c34e',
  '#2c3da3',
  '#ef4e5e',
  '#0cb04d',
  '#a855f7',
  '#20a4f3',
  '#f97316'
];

const CI_DISTRIBUTION_WIDGET_COLORS = [
  '#5fa0e7',
  '#4fbc97',
  '#f5c13d',
  '#274d91',
  '#6b56be',
  '#3d6ae8'
];

const TOP_DISCOVERY_FAILURES_CHART_COLORS = [
  '#4f76ea',
  '#0cb04d',
  '#ff7a1a',
  '#7c57e8',
  '#27b6c7',
  '#df3344'
];

const OS_OVERVIEW_CHART_COLORS = [
  '#4f76ea',
  '#0cb04d',
  '#ff7a1a',
  '#7c57e8',
  '#27b6c7',
  '#df5b8d',
  '#ffc20f',
  '#394493'
];

const NEWLY_DISCOVERED_MODEL_CHART_COLORS = [
  '#4f76ea',
  '#0cb04d',
  '#ff9c45',
  '#7c57e8',
  '#27b6c7',
  '#ef6f8f',
  '#f5c13d',
  '#7c8a9d'
];

const NEWLY_DISCOVERED_STATUS_COLORS: Record<string, string> = {
  Up: '#17b26a',
  Down: '#e5484d',
  Unknown: '#7c8a9d',
  Degraded: '#f79009'
};

const ORPHANED_DEVICES_CHART_COLORS = [
  '#3949ab',
  '#1ab34f',
  '#ff8b1f',
  '#28b8cf',
  '#7c57e8',
  '#ef6f8f'
];
