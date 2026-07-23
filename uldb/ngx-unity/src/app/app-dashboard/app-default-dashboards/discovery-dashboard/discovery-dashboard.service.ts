import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { CiDistributionByDevice, CiDistributionByDeviceData, CiDistributionByDeviceSortColumn, CiDistributionByDeviceTableRowViewData, CiDistributionByDiscovery, CiDistributionByDiscoverySortColumn, CiDistributionByDiscoveryTableRowViewData, CiDistributionSortColumn, CiDistributionTableRowViewData, CmdbSyncInsights, CmdbSyncInsightsMetric, CmdbSyncInsightsMetricViewData, CmdbSyncInsightsViewData, CmdbSyncTrend, CmdbSyncTrendSortColumn, CmdbSyncTrendTableRowViewData, DiscoveryDashboardFilterCriteria, DiscoveryDashboardFilterFormValue, DiscoveryDashboardFilterOptions, DiscoverySuccessFailureData, DiscoverySuccessFailureSortColumn, DiscoverySuccessFailureTableRowViewData, DiscoveryTrendAnalyticsData, DiscoveryTrendAnalyticsSortColumn, DiscoveryTrendAnalyticsTableRowViewData, ExecutiveKpiData, ExecutiveKpiViewData, NewlyDiscoveredDatacenterDistribution, NewlyDiscoveredDatacenterDistributionItem, NewlyDiscoveredDevice, NewlyDiscoveredDeviceItem, NewlyDiscoveredDeviceItemViewData, NewlyDiscoveredDevicesSortColumn, NewlyDiscoveredManufacturerDistributionItem, NewlyDiscoveredManufacturerModelDistribution, NewlyDiscoveredStatusByDatacenterDistribution, NewlyDiscoveredStatusByDatacenterItem, OperatingSystems, OperatingSystemsItem, OperatingSystemsItemViewData, OperatingSystemsSortColumn, OrphanedDeviceByTypeItem, OrphanedDeviceByTypeItemViewData, OrphanedDeviceByTypeResponse, OrphanedDeviceByTypeSortColumn, OrphanedDevicesBreakdownItem, OrphanedDevicesBreakdownResponse, ResourceDiscoveryData, ResourceDiscoveryViewData, TopDiscoveryFailures, TopDiscoveryFailuresItem, TopDiscoveryFailuresItemViewData, TopDiscoveryFailuresSortColumn } from './discovery-dashboard.type';
import { NEWLY_DISCOVERED_DEVICE } from './discovery-dashboard.const';


@Injectable()
export class DiscoveryDashboardService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }


  getFilterOptions(): Observable<DiscoveryDashboardFilterOptions> {
    // return this.http.get<DiscoveryDashboardFilterOptions>(DISCOVERY_DASHBOARD_FILTER_OPTIONS)
    return this.http.get<DiscoveryDashboardFilterOptions>(`/customer/discovery-dashboard/discovery_filters/`);
  }



  buildFilterForm(defaults: DiscoveryDashboardFilterFormValue = {
    region: [],
    timeRange: 'last_30_days'
  }): FormGroup {
    return this.builder.group({
      region: [defaults.region],
      timeRange: [defaults.timeRange]
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
      ? 'discovery-insight-trend--danger'
      : 'discovery-insight-trend--success';
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

    view.cmdbSyncRate = this.buildCmdbInsightMetricViewData('CMDB sync rate', data.cmdb_sync_rate, 'discovery-insight-value--success');
    view.ciUpdateFailures = this.buildCmdbInsightMetricViewData('CI update failures', data.ci_update_failures, 'discovery-insight-value--danger');
    view.orphanedCis = this.buildCmdbInsightMetricViewData('Orphaned CIs', data.orphaned_cis, '');
    view.unmappedCis = this.buildCmdbInsightMetricViewData('Unmapped', data.unmapped_cis, 'discovery-insight-value--primary');
    view.duplicateCis = this.buildCmdbInsightMetricViewData('Duplicate CIs', data.duplicate_cis, 'discovery-insight-value--primary');
    return view;
  }

  getCiDistributionByDevice(filters?: DiscoveryDashboardFilterCriteria): Observable<CiDistributionByDeviceData> {
    // return of(CI_DISTRIBUTION_BY_DEVICE);
    return this.http.get<CiDistributionByDeviceData>(`/customer/discovery-dashboard/device_type_distribution/`, {
      params: this.buildFilterParams(filters)
    });

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

  getCiDistributionByDicovery(filters?: DiscoveryDashboardFilterCriteria): Observable<CiDistributionByDiscovery> {

    return this.http.get<CiDistributionByDiscovery>(`customer/discovery-dashboard/discovery_distribution/`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToCiDistributionByDiscoveryChartView(data: CiDistributionByDiscovery): EChartsOption {
    const rows = this.sortCiDistributionByDiscoveryRows(
      this.convertToCiDistributionByDiscoveryTableView(data),
      'resourcesDiscovered',
      'desc'
    );
    if (!rows.length) {
      return null;
    }

    const chartRows = rows.slice(0, 10);
    const values = chartRows.map(item => item.resourcesDiscovered);
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
          return `${item?.axisValueLabel || ''}: ${item?.value || 0}`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: 26,
        right: 18,
        top: 18,
        bottom: 52,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartRows.map(item => item.discoveryMethod),
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
          rotate: 28,
          margin: 10,
          formatter: (value: string) => {
            const label = String(value || '').trim();
            return label.length > 10 ? `${label.slice(0, 10)}...` : label;
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
      series: [
        {
          name: 'Discovery Distribution',
          type: 'bar',
          barWidth: 16,
          barCategoryGap: '48%',
          data: values,
          itemStyle: {
            color: '#4b74eb',
            borderRadius: [5, 5, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            color: '#333b44',
            fontSize: 11,
            formatter: (params: any) => Number(params?.value || 0).toLocaleString()
          }
        }
      ]
    };
  }

  convertToCiDistributionByDiscoveryTableView(data: CiDistributionByDiscovery): CiDistributionByDiscoveryTableRowViewData[] {
    return (data || []).map(item => {
      const row = new CiDistributionByDiscoveryTableRowViewData();
      row.discoveryMethod = item?.discovery_method || '';
      row.targetResources = item?.target_resources || '';
      row.protocol = item?.protocol || '';
      row.resourcesDiscovered = item?.resources_discovered ?? 0;
      row.up = item?.up ?? 0;
      row.down = item?.down ?? 0;
      row.unknown = item?.unknown ?? 0;
      row.lastRun = item?.last_run || '';
      return row;
    });
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
    let params: HttpParams = this.buildFilterParams(filters);
    params = params.set('search', String(searchValue));
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));

    // return this.http.get<NewlyDiscoveredDevice>(`/customer/discovery-dashboard/newly_discovered_device/`, { params });
    return of({
      "count": 249,
      "next": "http://10.192.11.73:8000/customer/discovery-dashboard/newly_discovered_device/?page=2&region=all&time_range=last_year",
      "previous": null,
      "results": [
        {
          "ci_type": "Firewall",
          "uptime": "37 days, 17:06:31.09",
          "availability_status": "Unknown",
          "model": "Dummy model",
          "manufacturer": "Adaptec",
          "datacenter": "DC1",
          "last_discovered": "1 day ago",
          "discovery_method": "SNMP",
          "ci_name": "12",
          "last_discovered_at": "2026-07-10T10:37:53.922505+00:00",
          "platform": "N/A",
          "serial_number": "619f26c4-9a4b-4cd8-a85f-908087085455",
          "os_type": "N/A"
        },
        {
          "ci_type": "Firewall",
          "uptime": "N/A",
          "availability_status": "Unknown",
          "model": "ASA 5585-X 10",
          "manufacturer": "cisco Systems Inc.",
          "datacenter": "DC1",
          "last_discovered": "05 Feb 2026 06:11",
          "discovery_method": "N/A",
          "ci_name": "UnityDemo-fw1-mgmt.sf10",
          "last_discovered_at": "2026-02-05T06:11:03.552153+00:00",
          "platform": "N/A",
          "serial_number": "1817ec5b-17c4-424f-8198-c2a6d780af7b",
          "os_type": "N/A"
        },
        {
          "ci_type": "Firewall",
          "uptime": "N/A",
          "availability_status": "Unknown",
          "model": "SRX345",
          "manufacturer": "Juniper",
          "datacenter": "DC1",
          "last_discovered": "05 Feb 2026 06:11",
          "discovery_method": "SNMP",
          "ci_name": "UnityDemo-fw1-505.sf10.unitedlayer.com",
          "last_discovered_at": "2026-02-05T06:11:03.549290+00:00",
          "platform": "Juniper JunOS 15.1X49-D70.3 (Internet Router)",
          "serial_number": "ebc7b21b-90cc-407c-9f81-466a5ba74a1c",
          "os_type": "Juniper JunOS 15.1X49-D70.3 (Internet Router)"
        },
        {
          "ci_type": "Firewall",
          "uptime": "339 days, 7:06:54.35",
          "availability_status": "Unknown",
          "model": "SRX240H",
          "manufacturer": "Juniper",
          "datacenter": "DC1",
          "last_discovered": "05 Feb 2026 06:11",
          "discovery_method": "N/A",
          "ci_name": "UnityDemo-fw1-313.sf10.unitedlayer.com",
          "last_discovered_at": "2026-02-05T06:11:03.544653+00:00",
          "platform": "Juniper JunOS 15.1X49-D160.2 (Router)",
          "serial_number": "3F9E185027CD",
          "os_type": "Juniper JunOS 15.1X49-D160.2 (Router)"
        },
        {
          "ci_type": "Firewall",
          "uptime": "N/A",
          "availability_status": "Unknown",
          "model": "FortiGate 50E",
          "manufacturer": "FortiGate",
          "datacenter": "DC1",
          "last_discovered": "05 Feb 2026 06:11",
          "discovery_method": "SNMP",
          "ci_name": "Fortinet- NCM Demo",
          "last_discovered_at": "2026-02-05T06:11:02.963107+00:00",
          "platform": "N/A",
          "serial_number": "FGVMSLTM25002732",
          "os_type": "N/A"
        },
        {
          "ci_type": "Firewall",
          "uptime": "N/A",
          "availability_status": "Unknown",
          "model": "PA-820",
          "manufacturer": "Paloalto",
          "datacenter": "DC1",
          "last_discovered": "05 Feb 2026 06:11",
          "discovery_method": "SNMP",
          "ci_name": "Palo Alto- NCM Demo",
          "last_discovered_at": "2026-02-05T06:11:02.684169+00:00",
          "platform": "N/A",
          "serial_number": "009401008455",
          "os_type": "N/A"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "10 days, 19:22:20.694322",
          "availability_status": "Up",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:05",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-vm1",
          "last_discovered_at": "2026-01-02T15:05:01.488830+00:00",
          "platform": "VMware",
          "serial_number": "420a3bc0-a875-1164-24ff-4482fb568a73",
          "os_type": "Ubuntu Linux (64-bit)"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "10 days, 19:22:20.694322",
          "availability_status": "Up",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:05",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-vm1",
          "last_discovered_at": "2026-01-02T15:05:01.488830+00:00",
          "platform": "VMware",
          "serial_number": "420a3bc0-a875-1164-24ff-4482fb568a73",
          "os_type": "Ubuntu Linux (64-bit)"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "2 days, 1:56:39.502206",
          "availability_status": "Up",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:04",
          "discovery_method": "API",
          "ci_name": "unity-lab-Win-vm3",
          "last_discovered_at": "2026-01-02T15:04:09.905478+00:00",
          "platform": "VMware",
          "serial_number": "420ac530-0c2d-b91b-446b-d5fbc2a5fd76",
          "os_type": "Microsoft Windows Server 2016 or later (64-bit)"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "2 days, 1:56:39.502206",
          "availability_status": "Up",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:04",
          "discovery_method": "API",
          "ci_name": "unity-lab-Win-vm3",
          "last_discovered_at": "2026-01-02T15:04:09.905478+00:00",
          "platform": "VMware",
          "serial_number": "420ac530-0c2d-b91b-446b-d5fbc2a5fd76",
          "os_type": "Microsoft Windows Server 2016 or later (64-bit)"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:02",
          "discovery_method": "API",
          "ci_name": "unity-lab-Win-vm10",
          "last_discovered_at": "2026-01-02T15:02:16.547888+00:00",
          "platform": "VMware",
          "serial_number": "420a0ac3-fbde-2626-6b0e-6f61d7438456",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:01",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-vm4",
          "last_discovered_at": "2026-01-02T15:01:59.441390+00:00",
          "platform": "VMware",
          "serial_number": "420a07b3-8cfb-b378-6630-3289e6ce3dda",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:01",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-vm4",
          "last_discovered_at": "2026-01-02T15:01:59.441390+00:00",
          "platform": "VMware",
          "serial_number": "420a07b3-8cfb-b378-6630-3289e6ce3dda",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:01",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-vm8",
          "last_discovered_at": "2026-01-02T15:01:56.762042+00:00",
          "platform": "VMware",
          "serial_number": "420a8b0f-5983-532f-b9ed-472faf058477",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:01",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-ubuntu-vm1",
          "last_discovered_at": "2026-01-02T15:01:33.222723+00:00",
          "platform": "VMware",
          "serial_number": "420acbec-0846-5c7c-0c60-8f242668e158",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:01",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-ubuntu-vm1",
          "last_discovered_at": "2026-01-02T15:01:33.222723+00:00",
          "platform": "VMware",
          "serial_number": "420acbec-0846-5c7c-0c60-8f242668e158",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "255 days, 1:28:25.500272",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:01",
          "discovery_method": "API",
          "ci_name": "UL-Template-RockyLinux9.5-40GB",
          "last_discovered_at": "2026-01-02T15:01:17.517272+00:00",
          "platform": "VMware",
          "serial_number": "420aa0a2-1b2d-86e0-f913-7fab3dd26af9",
          "os_type": "Red Hat Enterprise Linux 8 (64-bit)"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:00",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-vm5",
          "last_discovered_at": "2026-01-02T15:00:56.010375+00:00",
          "platform": "VMware",
          "serial_number": "420a4475-e98f-b39c-b54b-e562f32a9b31",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:00",
          "discovery_method": "API",
          "ci_name": "unity-lab-lnx-vm5",
          "last_discovered_at": "2026-01-02T15:00:56.010375+00:00",
          "platform": "VMware",
          "serial_number": "420a4475-e98f-b39c-b54b-e562f32a9b31",
          "os_type": "None"
        },
        {
          "ci_type": "VMware VM",
          "uptime": "N/A",
          "availability_status": "Down",
          "model": "N/A",
          "manufacturer": "VMware",
          "datacenter": "DC1",
          "last_discovered": "02 Jan 2026 15:00",
          "discovery_method": "API",
          "ci_name": "unity-lab-Win-vm8",
          "last_discovered_at": "2026-01-02T15:00:37.573308+00:00",
          "platform": "VMware",
          "serial_number": "420ad540-47e7-2a84-c64f-f892f5b612a2",
          "os_type": "None"
        }
      ]
    })

  }

  getNewlyDiscoveredManufacturerModelDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredManufacturerModelDistribution> {
    // return this.http.get<NewlyDiscoveredManufacturerModelDistribution>('customer/discovery-dashboard/manufacturer_model_distribution/', {
    //   params: this.buildFilterParams(filters)
    // });
    return of({
      "total": 249,
      "results": [
        {
          "models": [
            {
              "count": 231,
              "model": "Unknown"
            }
          ],
          "total": 231,
          "manufacturer": "VMware"
        },
        {
          "models": [
            {
              "count": 11,
              "model": "Unknown"
            }
          ],
          "total": 11,
          "manufacturer": "Unknown"
        },
        {
          "models": [
            {
              "count": 2,
              "model": "ASA 5585-X 10"
            }
          ],
          "total": 2,
          "manufacturer": "cisco Systems Inc."
        },
        {
          "models": [
            {
              "count": 1,
              "model": "SRX240H"
            },
            {
              "count": 1,
              "model": "SRX345"
            }
          ],
          "total": 2,
          "manufacturer": "Juniper"
        },
        {
          "models": [
            {
              "count": 1,
              "model": "Dummy model"
            }
          ],
          "total": 1,
          "manufacturer": "Adaptec"
        },
        {
          "models": [
            {
              "count": 1,
              "model": "FortiGate 50E"
            }
          ],
          "total": 1,
          "manufacturer": "FortiGate"
        },
        {
          "models": [
            {
              "count": 1,
              "model": "PA-820"
            }
          ],
          "total": 1,
          "manufacturer": "Paloalto"
        }
      ]
    })
  }

  getNewlyDiscoveredDatacenterDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredDatacenterDistribution> {
    // return this.http.get<NewlyDiscoveredDatacenterDistribution>('customer/discovery-dashboard/datacenter_asset_distribution', {
    //   params: this.buildFilterParams(filters)
    // });
    return of({
      "total": 249,
      "results": [
        {
          "count": 237,
          "datacenter": "DC1"
        },
        {
          "count": 12,
          "datacenter": "Unknown"
        }
      ]
    });
  }

  getNewlyDiscoveredStatusByDatacenterDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredStatusByDatacenterDistribution> {
    // return this.http.get<NewlyDiscoveredStatusByDatacenterDistribution>('customer/discovery-dashboard/device_status_by_datacenter', {
    //   params: this.buildFilterParams(filters)
    // });
    return of({
      "total": 249,
      "results": [
        {
          "down": 105,
          "datacenter": "DC1",
          "total": 237,
          "up": 126,
          "unknown": 6
        },
        {
          "down": 0,
          "datacenter": "Unknown",
          "total": 12,
          "up": 0,
          "unknown": 12
        }
      ]
    });
  }

  convertToNewlyDiscoveredDeviceViewData(data: NewlyDiscoveredDeviceItem[]): NewlyDiscoveredDeviceItemViewData[] {
    return (data || []).map((item: NewlyDiscoveredDeviceItem) => {
      const viewItem = new NewlyDiscoveredDeviceItemViewData();
      const normalizedStatus = this.normalizeAvailabilityStatus(item?.availability_status);
      viewItem.availabilityStatus = normalizedStatus;
      viewItem.availabilityStatusClass = this.getAvailabilityStatusClass(normalizedStatus);
      viewItem.ciName = item?.ci_name || 'N/A';
      viewItem.ciType = item?.ci_type || 'N/A';
      viewItem.datacenter = item?.datacenter || 'N/A';
      viewItem.datacenterClass = 'discovery-new-ci-datacenter-badge';
      viewItem.discoveryMethod = item?.discovery_method || 'N/A';
      viewItem.discoveryMethodClass = 'discovery-new-ci-method-pill';
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
        return 'discovery-availability-pill discovery-availability-pill--up';

      case 'Degraded':
        return 'discovery-availability-pill discovery-availability-pill--degraded';

      case 'Down':
        return 'discovery-availability-pill discovery-availability-pill--down';

      default:
        return 'discovery-availability-pill discovery-availability-pill--unknown';
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
    // return of({
    //   "count": 69,
    //   "next": "https://unity.unitedlayer.com/customer/discovery-dashboard/orphaned_devices/?page=2&region=all&time_range=last_month",
    //   "previous": null,
    //   "results": [
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": true,
    //         "observium": false,
    //         "enabled": true,
    //         "zabbix": true
    //       },
    //       "uuid": "a22df4f2-2e16-4929-b047-34b99a98b8b5",
    //       "configured": true,
    //       "device_name": "unity-lab-lnx-ubuntu-vm5",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Linux",
    //       "os": "Ubuntu Linux (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": true,
    //         "observium": false,
    //         "enabled": true,
    //         "zabbix": true
    //       },
    //       "uuid": "23807365-b737-467b-9325-02fcf99394cb",
    //       "configured": true,
    //       "device_name": "unity-lab-lnx-vm9",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Linux",
    //       "os": "Ubuntu Linux (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": true,
    //         "observium": false,
    //         "enabled": true,
    //         "zabbix": true
    //       },
    //       "uuid": "3498e937-0a0f-4fb6-b609-b1d5886eccc9",
    //       "configured": true,
    //       "device_name": "UL-Template-Centos9-40GB",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": null,
    //       "os": "CentOS 8 (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": false,
    //         "observium": false,
    //         "enabled": false,
    //         "zabbix": true
    //       },
    //       "uuid": "72bbc76c-28fb-464d-8037-c9583aea46fb",
    //       "configured": false,
    //       "device_name": "devopscentos9-template",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": null,
    //       "os": "CentOS 8 (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": false,
    //         "observium": false,
    //         "enabled": false,
    //         "zabbix": true
    //       },
    //       "uuid": "02b1685e-f35a-4304-b291-f8b35f9690d1",
    //       "configured": false,
    //       "device_name": "devopsubt24-template",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Linux",
    //       "os": "Ubuntu Linux (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": true,
    //         "observium": false,
    //         "enabled": true,
    //         "zabbix": true
    //       },
    //       "uuid": "61657101-2158-46c0-affe-b41d7fd488ed",
    //       "configured": true,
    //       "device_name": "unity-lab-lnx-suse-vm1",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Linux",
    //       "os": "SUSE Linux Enterprise 15 (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": false,
    //         "observium": false,
    //         "enabled": false,
    //         "zabbix": true
    //       },
    //       "uuid": "cfee324f-eae0-43e2-8dc4-1f786df705d3",
    //       "configured": false,
    //       "device_name": "unity-lab-lnx-vm14",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Linux",
    //       "os": "Ubuntu Linux (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": true,
    //         "observium": false,
    //         "enabled": true,
    //         "zabbix": true
    //       },
    //       "uuid": "49197e0e-4030-40bc-ac83-63817cf4e12e",
    //       "configured": true,
    //       "device_name": "unity-lab-lnx-vm7",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Linux",
    //       "os": "Ubuntu Linux (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": true,
    //         "observium": false,
    //         "enabled": true,
    //         "zabbix": true
    //       },
    //       "uuid": "053a5d92-e3e1-4bed-8c59-e00b7dda3497",
    //       "configured": true,
    //       "device_name": "unity-lab-Win-vm5",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Windows",
    //       "os": "Microsoft Windows Server 2016 or later (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     },
    //     {
    //       "status": "down",
    //       "datacenter": "DC1",
    //       "monitoring": {
    //         "configured": true,
    //         "observium": false,
    //         "enabled": true,
    //         "zabbix": true
    //       },
    //       "uuid": "ad6ff217-ee58-4d9c-a0e6-ff91712c7cc2",
    //       "configured": true,
    //       "device_name": "unity-lab-Win-vm13",
    //       "deviceType": "Virtual Machine",
    //       "device_type": "VMware VM",
    //       "device": "virtual machine",
    //       "ssr_os": "Windows",
    //       "os": "Microsoft Windows Server 2016 or later (64-bit)",
    //       "vmSubType": "VMware",
    //       "last_seen": "N/A"
    //     }
    //   ]
    // })

  }

  convertToOrphanedDeviceByTypeViewData(data: OrphanedDeviceByTypeItem[]): OrphanedDeviceByTypeItemViewData[] {
    return (data || []).map((item: OrphanedDeviceByTypeItem) => {
      const viewItem = new OrphanedDeviceByTypeItemViewData();
      const normalizedStatus = this.normalizeAvailabilityStatus(item?.status);
      viewItem.uuid = item?.uuid || '';
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

  getTopDiscoveryFailures(filters?: DiscoveryDashboardFilterCriteria): Observable<TopDiscoveryFailures> {
    // return of(TOP_DISCOVERY_FAILURES);
    return this.http.get<TopDiscoveryFailures>(`customer/discovery-dashboard/top_discovery_policy/`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToTopDiscoveryFailuresViewData(data: TopDiscoveryFailuresItem[]): TopDiscoveryFailuresItemViewData[] {
    const viewData: TopDiscoveryFailuresItemViewData[] = [];

    (data || []).forEach((item: TopDiscoveryFailuresItem) => {
      const viewItem = new TopDiscoveryFailuresItemViewData();
      viewItem.policyName = item?.policy_name;
      viewItem.failureCount = item?.failure_count;
      viewItem.lastFailure = item?.last_failure;
      viewData.push(viewItem);
    });

    return viewData;
  }

  convertToTopDiscoveryFailuresChartView(data: TopDiscoveryFailuresItem[]): EChartsOption {
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

  getCiDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<CiDistributionByDevice> {
    // return of(CI_DISTRIBUTION);
    return this.http.get<CiDistributionByDevice>(`/customer/discovery-dashboard/ci_distribution_by_device/`, {
      params: this.buildFilterParams(filters)
    });

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

  private buildFilterParams(filters?: DiscoveryDashboardFilterCriteria): HttpParams {
    let params = new HttpParams();

    (filters?.region?.length ? filters.region : ['all']).forEach(region => {
      params = params.append('region', region);
    });

    params = params.set('time_range', filters?.timeRange || 'last_30_days');
    return params;
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
  '#56b99a'
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
