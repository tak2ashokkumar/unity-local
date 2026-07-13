import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { Observable } from 'rxjs';
import { CiDistributionByDevice, CiDistributionByDiscovery, CmdbSyncInsights, CmdbSyncInsightsViewData, CmdbSyncTrend, DiscoveryDashboardFilterCriteria, DiscoveryDashboardFilterFormValue, DiscoveryDashboardFilterOptions, DiscoverySuccessFailureData, DiscoveryTrendAnalyticsData, ExecutiveKpiData, ExecutiveKpiViewData, NewlyDiscoveredDevice, NewlyDiscoveredDeviceItem, NewlyDiscoveredDeviceItemViewData, OperatingSystems, OperatingSystemsItem, OperatingSystemsItemViewData, RecentSyncConfig, RecentSyncConfigItem, RecentSyncConfigItemViewData, ResourceDiscoveryData, ResourceDiscoveryViewData, TopDiscoveryFailures, TopDiscoveryFailuresItem, TopDiscoveryFailuresItemViewData } from './discovery-dashboard.type';


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
    discoveryType: [],
    timeRange: 'last_month'
  }): FormGroup {
    return this.builder.group({
      region: [defaults.region],
      discoveryType: [defaults.discoveryType],
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
    return view;
  }

  getDiscoveryTrendAnalyticsData(filters?: DiscoveryDashboardFilterCriteria): Observable<DiscoveryTrendAnalyticsData> {
    // return of(DISCOVERY_TREND_ANALYTICS_DATA);
    return this.http.get<DiscoveryTrendAnalyticsData>(`ccustomer/discovery-dashboard/discovery_trend_analytics`, {
      params: this.buildFilterParams(filters)
    });


  }


  convertToDiscoveryTrendAnalyticsChartView(data: DiscoveryTrendAnalyticsData): EChartsOption {
    const total = data?.total || [];
    const newlyDiscovered = data?.new || [];
    const weeks = total.length ? total.map(item => item.week) : newlyDiscovered.map(item => item.week);

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
        data: ['Total', 'New']
      },
      grid: {
        left: 20,
        right: 18,
        top: 26,
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
        boundaryGap: false,
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
        max: 100,
        interval: 20,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#555d66',
          fontSize: 11,
          formatter: (value: number) => value === 0 ? '0' : `${value}`
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          name: 'Total',
          type: 'line',
          smooth: true,
          data: total.map(item => item.value),
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: true,
          lineStyle: {
            width: 2,
            color: '#2f86de'
          },
          itemStyle: {
            color: '#2f86de',
            borderColor: '#ffffff',
            borderWidth: 2
          },
          emphasis: {
            scale: true
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(47, 134, 222, 0.28)' },
              { offset: 1, color: 'rgba(47, 134, 222, 0.04)' }
            ])
          }
        },
        {
          name: 'New',
          type: 'line',
          smooth: true,
          data: newlyDiscovered.map(item => item.value),
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: true,
          lineStyle: {
            width: 2,
            color: '#56c98a'
          },
          itemStyle: {
            color: '#56c98a',
            borderColor: '#ffffff',
            borderWidth: 2
          },
          emphasis: {
            scale: true
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(86, 201, 138, 0.22)' },
              { offset: 1, color: 'rgba(86, 201, 138, 0.03)' }
            ])
          }
        }
      ]
    };
  }

  getDiscoverySuccessandFailureData(filters?: DiscoveryDashboardFilterCriteria): Observable<DiscoverySuccessFailureData> {
    // return of(DISCOVERY_SUCCESS_FAILURE_DATA);
    return this.http.get<DiscoverySuccessFailureData>(`customer/discovery-dashboard/disovery_success_failure`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToDiscoverySuccessFailureChartView(data: DiscoverySuccessFailureData): EChartsOption {
    const success = data?.total || [];
    const failure = data?.new || [];
    const weeks = success.length ? success.map(item => item.week) : failure.map(item => item.week);

    return {
      animation: false,
      legend: {
        bottom: 8,
        left: 'center',
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: '#5d6670',
          fontSize: 12
        },
        data: ['Success', 'Failure']
      },
      grid: {
        left: 14,
        right: 14,
        top: 26,
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
        max: 100,
        interval: 20,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#555d66',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          barWidth: 28,
          data: success.map(item => item.value),
          itemStyle: {
            color: '#43c58a'
          }
        },
        {
          name: 'Failure',
          type: 'bar',
          stack: 'total',
          data: failure.map(item => item.value),
          itemStyle: {
            color: '#e22d2d'
          },
          label: {
            show: true,
            position: 'top',
            color: '#525b64',
            fontSize: 12,
            formatter: (params: any) => {
              const item = success[params.dataIndex];
              return item ? String(item.value) : '';
            }
          }
        }
      ]
    };
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

    view.cmdbSyncRate = data.cmdb_sync_rate;
    view.cmdbPlatform = data.cmdb_platform;
    view.newCisAdded = data.new_cis_added;
    view.ciUpdateFailures = data.ci_update_failures;
    view.duplicateCis = data.duplicate_cis;
    return view;
  }

  getCiDistributionByDevice(filters?: DiscoveryDashboardFilterCriteria): Observable<CiDistributionByDevice> {
    // return of(CI_DISTRIBUTION_BY_DEVICE);
    return this.http.get<CiDistributionByDevice>(`/customer/discovery-dashboard/ci_distribution_by_device/`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToCiDistributionByDeviceChartView(data: CiDistributionByDevice): EChartsOption {
    const chartItems = Object.entries(data || {})
      .filter(([_, value]) => typeof value === 'number' && Number.isFinite(value))
      .map(([key, value]) => ({
        name: CI_DISTRIBUTION_LABELS[key as keyof CiDistributionByDevice] || this.formatChartKeyLabel(key),
        value: value as number
      }))
      .sort((left, right) => left.value - right.value);

    return {
      animation: false,
      color: CI_DISTRIBUTION_CHART_COLORS,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: '{b}: {c}'
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'CI Distribution By Device',
          type: 'pie',
          radius: ['30%', '58%'],
          center: ['50%', '46%'],
          roseType: 'radius',
          minAngle: 8,
          startAngle: 90,
          avoidLabelOverlap: true,
          stillShowZeroSum: false,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#555d66',
            fontSize: 12,
            formatter: '{c}'
          },
          labelLine: {
            show: true,
            length: 14,
            length2: 16,
            lineStyle: {
              width: 1
            }
          },
          data: chartItems.map(item => ({
            name: item.name,
            value: item.value
          }))
        }
      ]
    };
  }

  getCiDistributionByDicovery(filters?: DiscoveryDashboardFilterCriteria): Observable<CiDistributionByDiscovery> {
    // return of(CI_DISTRIBUTION_BY_DISCOVERY);
    return this.http.get<CiDistributionByDiscovery>(`/customer/discovery-dashboard/ci_distribution_by_discovery/`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToCiDistributionByDiscoveryChartView(data: CiDistributionByDiscovery): EChartsOption {
    const chartItems = Object.entries(data || {})
      .filter(([_, value]) => typeof value === 'number' && Number.isFinite(value))
      .map(([key, value]) => ({
        name: this.formatChartKeyLabel(key),
        value: value as number
      }))
      .sort((left, right) => left.value - right.value);

    return {
      animation: false,
      color: DISCOVERY_DISTRIBUTION_CHART_COLORS,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(33, 41, 52, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#ffffff'
        },
        formatter: '{b}: {c}'
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'CI Distribution By Discovery',
          type: 'pie',
          radius: ['38%', '66%'],
          center: ['50%', '45%'],
          roseType: 'radius',
          startAngle: 90,
          minAngle: 20,
          avoidLabelOverlap: true,
          stillShowZeroSum: false,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#333b44',
            fontSize: 12,
            formatter: '{c}'
          },
          labelLine: {
            show: true,
            length: 16,
            length2: 12,
            lineStyle: {
              width: 1
            }
          },
          data: chartItems.map(item => ({
            name: item.name,
            value: item.value
          }))
        }
      ]
    };
  }

  getNewlyDiscoveredDevices(page = 1, pageSize = 10, searchValue = '', filters?: DiscoveryDashboardFilterCriteria): Observable<NewlyDiscoveredDevice> {
    let params: HttpParams = this.buildFilterParams(filters);
    params = params.set('search', String(searchValue));
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));


    // return of(NEWLY_DISCOVERED_DEVICE);
    return this.http.get<NewlyDiscoveredDevice>(`/customer/discovery-dashboard/newly_discovered_device/`, { params });

  }

  convertToNewlyDiscoveredDeviceViewData(data: NewlyDiscoveredDeviceItem[]): NewlyDiscoveredDeviceItemViewData[] {
    const viewData: NewlyDiscoveredDeviceItemViewData[] = [];

    (data || []).forEach((item: NewlyDiscoveredDeviceItem) => {
      const viewItem = new NewlyDiscoveredDeviceItemViewData();
      viewItem.datacenter = item?.datacenter;
      viewItem.deviceName = item?.device_name;
      viewItem.lastSync = item?.last_sync;
      viewItem.manufacturer = item?.manufacturer;
      viewItem.model = item?.model;
      viewItem.osType = item?.os_type;
      viewItem.osVersion = item?.os_version;
      viewItem.statusClass = item ? this.getStatusIconClass(item.status) : '';
      viewItem.type = item?.type;
      viewData.push(viewItem);
    });

    return viewData;
  }

  getStatusIconClass(status: string): string {
    switch (status) {
      case 'Critical':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';

      case 'Warning':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';

      case 'Healthy':
        return 'fas fa-check-circle text-success font-xs-sm';

      default:
        return 'fas fa-question-circle text-muted font-xs-sm';
    }
  }

  getTopDiscoveryFailures(page = 1, pageSize = 10, filters?: DiscoveryDashboardFilterCriteria): Observable<TopDiscoveryFailures> {
    // return of(this.createPaginatedResponse(TOP_DISCOVERY_FAILURES, page, pageSize));
    let params: HttpParams = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));


    // return of(NEWLY_DISCOVERED_DEVICE);
    return this.http.get<TopDiscoveryFailures>(`customer/discovery-dashboard/top_discovery_failures/`, { params });

  }

  convertToTopDiscoveryFailuresViewData(data: TopDiscoveryFailuresItem[]): TopDiscoveryFailuresItemViewData[] {
    const viewData: TopDiscoveryFailuresItemViewData[] = [];

    (data || []).forEach((item: TopDiscoveryFailuresItem) => {
      const viewItem = new TopDiscoveryFailuresItemViewData();
      viewItem.alertId = item?.alert_id;
      viewItem.deviceName = item?.device_name;
      viewItem.failures = item?.failures;
      viewItem.itsmIncident = item?.itsm_incident;
      viewItem.lastFailure = item?.last_failure;
      viewData.push(viewItem);
    });

    return viewData;
  }

  getTOperatingSystems(page = 1, pageSize = 10, filters?: DiscoveryDashboardFilterCriteria): Observable<OperatingSystems> {
    // return of(this.createPaginatedResponse(OPERATING_SYSTEMS, page, pageSize));
    let params: HttpParams = this.buildFilterParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));


    // return of(NEWLY_DISCOVERED_DEVICE);
    return this.http.get<OperatingSystems>(`customer/discovery-dashboard/operating_systems`, { params });
  }

  convertToOperatingSystemsViewData(data: OperatingSystemsItem[]): OperatingSystemsItemViewData[] {
    const viewData: OperatingSystemsItemViewData[] = [];

    (data || []).forEach((item: OperatingSystemsItem) => {
      const viewItem = new OperatingSystemsItemViewData();
      viewItem.count = item?.count;
      viewItem.eolDate = item?.eol_date;
      viewItem.osType = item?.os_type;
      viewItem.osVersion = item?.os_version;
      viewData.push(viewItem);
    });

    return viewData;
  }

  getRecentSyncConfig(page = 1, pageSize = 10, searchValue = '', filters?: DiscoveryDashboardFilterCriteria): Observable<RecentSyncConfig> {
    // return of(RECENT_SYNC_CONFIG);
    let params: HttpParams = this.buildFilterParams(filters);
    params = params.set('search', String(searchValue));
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));


    // return of(NEWLY_DISCOVERED_DEVICE);
    return this.http.get<RecentSyncConfig>(`customer/discovery-dashboard/recent_sync_config_items`, { params });
  }

  convertToRecentSyncConfigViewData(data: RecentSyncConfigItem[]): RecentSyncConfigItemViewData[] {
    const viewData: RecentSyncConfigItemViewData[] = [];

    (data || []).forEach((item: RecentSyncConfigItem) => {
      const viewItem = new RecentSyncConfigItemViewData();
      viewItem.ciName = item?.ci_name;
      viewItem.ciType = item?.ci_type;
      viewItem.cmdbStatus = item?.cmdb_status;
      viewItem.cmdbStatusClass = this.getCmdbStatusClass(item?.cmdb_status);
      viewItem.lastUpdated = item?.last_updated;
      viewItem.platform = item?.platform;
      viewItem.source = item?.source;
      viewItem.syncStatus = item.sync_status ? this.getRecentConfigIconClass(item.sync_status) : '';
      viewData.push(viewItem);
    });

    return viewData;
  }

  getRecentConfigIconClass(status: string): string {
    switch (status) {
      case 'Failed':
        return 'fas fa-exclamation-triangle text-danger font-xs-sm';

      case 'Pending':
        return 'fas fa-exclamation-circle text-warning font-xs-sm';

      case 'Synced':
        return 'fas fa-check-circle text-success font-xs-sm';

      default:
        return 'fas fa-question-circle text-muted font-xs-sm';
    }
  }

  getCmdbStatusClass(status: string): string {
    switch (status) {
      case 'Active CI':
        return 'discovery-cmdb-status-pill discovery-cmdb-status-pill--active';

      case 'New CI':
        return 'discovery-cmdb-status-pill discovery-cmdb-status-pill--new';

      default:
        return 'discovery-cmdb-status-pill';
    }
  }

  getCmdbSyncTrend(filters?: DiscoveryDashboardFilterCriteria): Observable<CmdbSyncTrend> {
    // return of(CMDB_SYNC_TREND);
    return this.http.get<CmdbSyncTrend>(`/customer/discovery-dashboard/discovery_cmdb_sync_trend/`, {
      params: this.buildFilterParams(filters)
    });

  }

  convertToCmdbSyncTrendChartView(data: CmdbSyncTrend): EChartsOption {
    const syncedCi = data?.synced_ci || [];
    const failed = data?.failed || [];
    const pending = data?.pending || [];
    const months = syncedCi.length ? syncedCi.map(item => item.month) : failed.length ? failed.map(item => item.month) : pending.map(item => item.month);

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
        data: ['Synced CIs', 'Failed', 'Pending']
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
        boundaryGap: false,
        data: months,
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
        max: 100,
        interval: 20,
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
          name: 'Synced CIs',
          type: 'line',
          smooth: true,
          data: syncedCi.map(item => item.value),
          symbol: 'circle',
          symbolSize: 9,
          showSymbol: true,
          lineStyle: {
            width: 1.5,
            color: '#5b74ff'
          },
          itemStyle: {
            color: '#5b74ff',
            borderColor: '#d9defe',
            borderWidth: 4
          }
        },
        {
          name: 'Failed',
          type: 'line',
          smooth: true,
          data: failed.map(item => item.value),
          symbol: 'circle',
          symbolSize: 9,
          showSymbol: true,
          lineStyle: {
            width: 1.5,
            color: '#73d49b'
          },
          itemStyle: {
            color: '#73d49b',
            borderColor: '#d8f2e3',
            borderWidth: 4
          }
        },
        {
          name: 'Pending',
          type: 'line',
          smooth: true,
          data: pending.map(item => item.value),
          symbol: 'circle',
          symbolSize: 9,
          showSymbol: true,
          lineStyle: {
            width: 1.5,
            color: '#ffb052'
          },
          itemStyle: {
            color: '#ffb052',
            borderColor: '#ffe7c7',
            borderWidth: 4
          }
        }
      ]
    };
  }

  getCiDistribution(filters?: DiscoveryDashboardFilterCriteria): Observable<CiDistributionByDevice> {
    // return of(CI_DISTRIBUTION);
    return this.http.get<CiDistributionByDevice>(`/customer/discovery-dashboard/ci_distribution/`, {
      params: this.buildFilterParams(filters)
    });


  }

  convertToCiDistributionChartView(data: CiDistributionByDevice): EChartsOption {
    const chartKeys: Array<keyof CiDistributionByDevice> = [
      'private_cloud_compute',
      'public_cloud_compute',
      'network',
      'storage',
      'database',
      'containers'
    ];

    const chartItems = chartKeys
      .map((key, index) => ({
        name: CI_DISTRIBUTION_LABELS[key],
        value: data?.[key] ?? 0,
        selected: index === 0
      }))
      .filter(item => Number.isFinite(item.value));

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
        formatter: '{b}: {c}'
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'CI Distribution',
          type: 'pie',
          radius: ['42%', '62%'],
          center: ['50%', '49%'],
          startAngle: 90,
          clockwise: true,
          selectedMode: 'single',
          selectedOffset: 10,
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
            formatter: '{c}'
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

    (filters?.discoveryType?.length ? filters.discoveryType : ['all']).forEach(discoveryType => {
      params = params.append('discovery_type', discoveryType);
    });

    params = params.set('time_range', filters?.timeRange || 'last_month');
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

const CI_DISTRIBUTION_LABELS: Partial<Record<keyof CiDistributionByDevice, string>> = {
  private_cloud_compute: 'Private Cloud Compute',
  public_cloud_compute: 'Public Cloud Compute',
  storage: 'Storage',
  network: 'Network',
  containers: 'Containers',
  database: 'Database',
  pdu: 'PDU',
  firewalls: 'Firewalls',
  switches: 'Switches',
  bareMetal: 'BareMetal',
  others: 'Others'
};

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
