import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnyMxRecord } from 'dns';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import moment from 'moment';
import { Observable, of } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { PRIVATE_CLOUD_ALERT_TREND_STACK_GROUPS, PRIVATE_CLOUD_TICKETS_TOTAL, VmDensityPerHostChartColors } from './private-cloud-compute-dashboard.const';
import { AlertsSeverityItem, CapacityAndGrowthDataType, CapacityTrendAndForecastItem, CloudTypeDistributionItem, ClusterCapacityUtilTrendData, EnvironmentCriticalityItem, ExecutiveSummaryItem, ExecutiveSummaryWidgetType, FiltersCriteriaType, IdleDevices, IdleDurationDistributionItem, InfrahealthstatusDataType, OrphanedCategory, OrphanedResourcesResponse, PerformanceHotspots, PerformanceWorkloadDataType, PowerActivityStateItem, PrivateCloudAlertSideCard, PrivateCloudAlertTrendBarGroup, PrivateCloudAlertTrendLegendItem, PrivateCloudStatusTone, PrivateCloudTicketDonutItem, PrivateCloudUtilization, PrivateCloudUtilizationRow, PrivateCloudUtilizationViewRow, ProvisioningStatus, RecentAlerts, RecentAlertsItem, Top10ClustersByVMsData, TopHeaderDataType, TopHostUtilizationItem, VmCountByOSTypeItem, } from './private-cloud-compute-dashboard.type';


@Injectable()
export class PrivateCloudComputeDashboardService {

  constructor(
    private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }

  private convertFiltersToParams(criteria?: FiltersCriteriaType): HttpParams {
    let params: HttpParams = new HttpParams();
    params = this.appendMultiValueParam(params, 'platform', criteria?.platforms);
    params = this.appendMultiValueParam(params, 'datacenter', criteria?.datacenters);
    params = this.appendMultiValueParam(params, 'environment', criteria?.environments);
    params = this.appendMultiValueParam(params, 'account', criteria?.accounts);
    return params;
  }

  private appendMultiValueParam(params: HttpParams, key: string, values?: string[]): HttpParams {
    (values || []).forEach(value => {
      if (value && value !== 'All') {
        params = params.append(key, value);
      }
    });
    return params;
  }

  getHeaderInfo(): Observable<TopHeaderDataType> {
    return this.http.get<TopHeaderDataType>(`/customer/widgets/private_cloud_dashboard_header/`);
  }

  getFilterDropdowns(): Observable<any> {
    return this.http.get<ExecutiveSummaryWidgetType>(`/customer/widgets/dashboard_filters/`);
  }

  buildFilterForm(
    platforms: string[] = [],
    datacenters: string[] = [],
    environments: string[] = [],
    accounts: string[] = []
  ): FormGroup {
    return this.builder.group({
      platforms: [platforms],
      datacenters: [datacenters],
      environments: [environments],
      accounts: [accounts]
    });
  }

  //Executive summary widget
  getExecutiveSummaryWidgetData(filters: FiltersCriteriaType): Observable<ExecutiveSummaryWidgetType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<ExecutiveSummaryWidgetType>(`/customer/widgets/executive_summary/`, { params });
  }

  convertExecutiveSummaryViewData(data: ExecutiveSummaryItem): ExecutiveSummaryViewData {
    let summaryData = new ExecutiveSummaryViewData();
    summaryData.totalVMs = data.totalVMs;
    summaryData.physicalHosts = data.physicalHosts;
    summaryData.clusters = data.clusters;
    summaryData.poweredOn = data.poweredOnVMs;
    summaryData.poweredOff = data.poweredOffVMs;
    summaryData.idleVMs = data.idleVMs;
    summaryData.orphanedVMs = data.orphanedVMs;

    return summaryData;
  }

  convertToCloudTypeChartData(data: CloudTypeDistributionItem[]) {
    if (!data || !data.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    const colors = [
      '#3d8be8',
      '#1fa36b',
      '#8b7cf6',
      '#f0a52b',
      '#ef4444',
      '#14b8a6',
      '#f97316',
      '#6366f1',
      '#84cc16',
      '#ec4899',
      '#06b6d4',
      '#eab308',
      '#22c55e',
      '#a855f7',
      '#f43f5e',
      '#0ea5e9',
      '#f59e0b',
      '#10b981',
      '#8b5cf6',
      '#d946ef',
      '#2dd4bf',
      '#fb7185',
      '#4f46e5',
      '#65a30d',
      '#0891b2'
    ];
    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>${params.value}% (${params.data.count})`;
        }
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'Cloud Type',
          type: 'pie',
          radius: ['45%', '78%'],
          center: ['50%', '42%'],
          label: {
            show: true,
            position: 'outside',
            color: '#6b7280',
            fontSize: 11,
            formatter: (params: any) => `${params.data.count}`
          },
          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              color: '#b7c1cc',
              width: 1
            }
          },
          data: data.map((item, index) => ({
            value: item.percentage,
            name: item.type,
            count: item.count,
            color: colors[index % colors.length],
            itemStyle: {
              color: colors[index % colors.length]
            }
          })),
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          }
        }
      ]
    };

    return view;
  }
  convertToPowerActivityChartData(data: PowerActivityStateItem[]) {
    if (!data || !data.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const formattedData = data.map(item => {
      const isOn = item.state === 'Powered On';
      return {
        ...item,
        label: isOn ? 'On' : 'Off',
        color: isOn
          ? '#6aa11f'
          : '#e44c4c'
      };
    });
    view.options = {
      ...view.options,
      grid: {
        left: 45,
        right: 15,
        top: 20,
        bottom: 40
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = formattedData[params.dataIndex];
          return `
          ${item.state}<br/>
          Count: ${item.count}
        `;
        }
      },
      legend: {
        show: false
      },
      xAxis: {
        type: 'category',
        data: formattedData.map(d => d.label),
        axisLine: {
          lineStyle: {
            color: '#9ca3af'
          }
        },
        axisTick: {
          show: true
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        splitNumber: 4,
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 52,
          data: formattedData.map(item => ({
            value: item.count,
            color: item.color,
            itemStyle: {
              color: item.color,
              borderRadius: [6, 6, 0, 0]
            }
          }))
        }
      ]
    };
    return view;
  }

  convertToVmCountByOSTypeChartData(data: VmCountByOSTypeItem[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    view.options = {
      ...view.options,

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>Count: ${params.data.count}<br/>${params.value}%`;
        }
      },

      legend: {
        bottom: 15,
        left: 'center',
        icon: 'circle',
        itemWidth: 11,
        itemHeight: 11,
        itemGap: 12,
        textStyle: {
          color: '#8a8a8a',
          fontSize: 13
        },
        formatter: (name: string) => {
          const item = data.find(d => d.os === name);
          return item ? `${name} ${item.percentage}%` : name;
        }
      },

      series: [
        {
          name: 'OS Type',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '48%'],
          bottom: 30,
          label: {
            show: true,
            position: 'outside',
            color: '#6b7280',
            fontSize: 11,
            formatter: (params: any) => `${params.data.count}`
          },
          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              color: '#b7c1cc',
              width: 1
            }
          },

          data: data.map((item, index) => ({
            value: item.percentage,
            name: item.os,
            count: item.count,
            itemStyle: {
              color: index === 0 ? '#1f66ad' : '#5b4bb7'
            }
          })),

          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          }
        }
      ]
    }
    return view;
  }

  convertToEnvironmentAndCriticalityChartData(data: EnvironmentCriticalityItem[]) {
    if (!data || !data.length) { return; }

    let view: UnityChartDetails = new UnityChartDetails();

    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const colors = ['#e54b4b', '#f5a623', '#2f80d1', '#5c8f1f'];

    view.options = {
      ...view.options,

      grid: {
        left: 100,
        right: 40,
        top: 6,
        bottom: 2,
        containLabel: false
      },

      xAxis: {
        type: 'value',
        max: 100,
        show: false
      },

      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(d => d.environment),

        axisLine: { show: false },
        axisTick: { show: false },

        axisLabel: {
          color: '#8a8a8a',
          fontSize: 11,
          margin: 12
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = data[params.dataIndex];

          return `
          ${item.environment}<br/>
          Count: ${item.count}<br/>
          ${item.percentage}%
        `;
        }
      },

      series: [
        // background gray bars
        {
          type: 'bar',
          barWidth: 7,
          barGap: '-100%',
          silent: true,
          z: 1,

          data: data.map(() => 100),

          itemStyle: {
            color: '#ececec',
            borderRadius: 20
          }
        },

        // actual colored bars
        {
          type: 'bar',
          barWidth: 7,
          z: 2,

          data: data.map((item, index) => ({
            value: item.percentage,

            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: 20
            }
          })),

          label: {
            show: true,
            position: 'right',
            distance: 10,

            color: '#555',
            fontSize: 11,

            formatter: (params: any) => {
              const item = data[params.dataIndex];

              return item.count > 0
                ? item.count.toLocaleString()
                : '';
            }
          }
        }
      ]
    };

    return view;
  }

  convertToAlertSeverityViewData(data: AlertsSeverityItem) {
    let view = new AlertSeverityData();
    view.critical = data.critical ? data.critical : 0;
    view.warning = data.warning ? data.warning : 0;
    view.info = data.info ? data.info : 0;
    return view;
  }

  //Capacity & Growth widget


  getCapacityGrowthWidgetData(filters: FiltersCriteriaType): Observable<CapacityAndGrowthDataType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<CapacityAndGrowthDataType>('/customer/widgets/capacity_growth_insights/', { params });


  }

  convertToVmDensityHostViewData(data: TopHostUtilizationItem[]): VmDensityHost {

    const view = new VmDensityHost();
    view.desnityHostRows = (data || []).map(item => {
      const row = new DesityHostRows();
      row.hostName = item.hostName || 'N/A';
      row.utilizationPct = item.utilizationPercentage ?? 0;
      row.totalStorageGB = item.totalCapacity ?? 0;
      row.usedStorageGB = item.usedCapacity ?? 0;
      row.category = item.utilizationStatus || 'N/A';
      return row;
    });

    return view;
  }


  convertToVmCapacityChartData(data: CapacityTrendAndForecastItem[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const actualData = data.filter(d => !d.isForecast);
    const forecastData = data.filter(d => d.isForecast);
    const months = actualData.map(d => d.month);
    // Merge forecast with nulls before it (to start from last actual point)
    const forecastSeries = [
      ...Array(actualData.length - 1).fill(null),
      actualData[actualData.length - 1].count, // connect point
      ...forecastData.map(d => d.count)
    ];

    view.options = {
      ...view.options,
      // title: {
      //   text: 'VM Capacity Trend & Growth Forecast',
      //   left: 'center',
      //   top: 10,
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 500,
      //     color: '#333'
      //   }
      // },

      tooltip: {
        trigger: 'axis'
      },

      xAxis: {
        type: 'category',
        data: [
          ...actualData.map(d => d.month),
          ...forecastData.map(d => d.month)
        ],
        axisLine: { lineStyle: { color: '#d1d5db' } },
        axisTick: { show: false },
        axisLabel: { color: '#8a8a8a' }
      },

      yAxis: {
        type: 'value',
        min: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8a8a8a' },
        splitLine: {
          lineStyle: { color: '#f1f2f4' }
        }
      },

      series: [
        // Actual Line
        {
          name: 'Actual',
          type: 'line',
          smooth: true,
          data: actualData.map(d => d.count),
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#3a8dde',
            width: 3
          },
          itemStyle: {
            color: '#3a8dde'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(58,141,222,0.35)' // top (strong)
              },
              {
                offset: 1,
                color: 'rgba(58,141,222,0.05)' // bottom (fade out)
              }
            ])
          }
        },

        // Forecast Line (dotted)
        {
          name: 'Forecast',
          type: 'line',
          smooth: true,
          data: forecastSeries,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#e76f51',
            width: 3,
            type: 'dashed'
          },
          itemStyle: {
            color: '#e76f51'
          }
        }
      ]
    };

    return view;
  }

  convertToVmProvisioningViewData(data: ProvisioningStatus) {
    let view = new VMProvisioningViewData();
    view.provisionedCount = data.provisioned ? data.provisioned : 0;
    view.decommissionedCount = data.decommissioned ? data.decommissioned : 0;
    return view;
  }

  //Top 10 clusters


  getTop10ClustersByVMsWidgetData(filters: FiltersCriteriaType): Observable<Top10ClustersByVMsData> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<any>('/customer/widgets/top_clusters_by_vm_count/', { params });

  }


  convertToTop10ClustersByVMCountViewData(data: Top10ClustersByVMsData): Top10ClustersByVMCountViewData {

    const view = new Top10ClustersByVMCountViewData();

    view.clusterList = (data?.topClustersByVMCount || []).map(item => ({
      host: item.clusterName || 'N/A',
      value: item.vmCount ?? 0
    }));

    return view;
  }

  convertToTop10ClustersByVMsChartData(data: any) {
    // data = Top10ClustersByVMCount;
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const maxValue = Math.max(...data.map(x => x.value));
    const barColors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
      '#ec4899',
      '#6366f1'
    ];


    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>VM Count: ${params.value}`;
        }
      },

      xAxis: {
        type: 'category',
        data: data.map(item => item.host),
        axisLine: {
          lineStyle: { color: '#d1d5db' }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#8a8a8a',
          fontSize: 11,
          interval: 0,
          rotate: 45,
          margin: 14,
          formatter: (value: string) => {
            return value.length > 8
              ? value.substring(0, 8) + '...'
              : value;
          }
        }
      },

      yAxis: {
        type: 'value',
        min: 0,
        max: Math.ceil(maxValue * 1.2),
        interval: Math.ceil((maxValue * 1.2) / 4),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#8a8a8a',
          fontSize: 12
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f1f2f4'
          }
        }
      },

      series: [
        {
          name: 'VM Count',
          type: 'bar',
          barWidth: 20,
          barCategoryGap: '30%',
          data: data.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: barColors[index % barColors.length]
            }
          }))
        }
      ]
    };
    return view;
  }

  // Cluster capacity
  getClusterCapacityUtilTrendWidgetData(filters: FiltersCriteriaType): Observable<ClusterCapacityUtilTrendData> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<ClusterCapacityUtilTrendData>('/customer/widgets/cluster_capacity_utilization_trend/', { params });
  }


  convertToClusterCapacityUtilTrendViewData(data: ClusterCapacityUtilTrendData): ClusterCapacityUtilTrendViewData[] {

    if (!data || !data.months || !data.cpuUtilizationTrend || !data.memoryUtilizationTrend) {
      return [];
    }

    return data.months.map((month, index) => ({
      month,
      actual: data.cpuUtilizationTrend[index] || 0,
      forecast: data.memoryUtilizationTrend[index] || 0
    }));
  }

  convertToClusterCapacityUtilTrendChartData(data: ClusterCapacityUtilTrendViewData[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    const months = data.map(d => d.month);
    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: {
          lineStyle: { color: '#d1d5db' }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#8a8a8a',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#8a8a8a'
        },
        splitLine: {
          lineStyle: {
            color: '#f1f2f4'
          }
        }
      },

      series: [
        {
          name: 'Actual',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: data.map(d => d.actual),
          lineStyle: {
            color: '#3a8dde',
            width: 3
          }
        },
        {
          name: 'Forecast',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: data.map(d => d.forecast),
          lineStyle: {
            color: '#e76f51',
            width: 2,
            type: 'dashed'
          }
        }
      ]
    };

    return view;
  }

  //Infrastructure health / Hardware status
  getInfrastructureHealthWidgetData(filters: FiltersCriteriaType): Observable<InfrahealthstatusDataType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<InfrahealthstatusDataType>('/customer/widgets/infrastructure_health_status/', { params });
  }

  convertInfrastructureHealthViewData(data: InfrahealthstatusDataType) {
    if (!data) { return; }
    let view = new InfrastructureHealthWidgetData();
    view.psuNormal = data?.powerStatus?.psuNormal ? data.powerStatus.psuNormal : 0;
    view.psuFailed = data?.powerStatus?.psuFailed ? data.powerStatus.psuFailed : 0;
    view.psuDegraded = data?.powerStatus?.psuDegraded ? data.powerStatus.psuDegraded : 0;

    view.healthy = data?.hostHealthStatus?.healthy ? data.hostHealthStatus.healthy : 0;
    view.warning = data?.hostHealthStatus?.warning ? data.hostHealthStatus.warning : 0;
    view.critical = data?.hostHealthStatus?.critical ? data.hostHealthStatus.critical : 0;
    view.maintenance = data?.hostHealthStatus?.maintenance ? data.hostHealthStatus.maintenance : 0;

    view.tempNormal = data?.fanTemperatureSensors?.tempNormal ? data.fanTemperatureSensors.tempNormal : 0;
    view.tempWarning = data?.fanTemperatureSensors?.tempWarning ? data.fanTemperatureSensors.tempWarning : 0;
    view.tempCritical = data?.fanTemperatureSensors?.tempCritical ? data.fanTemperatureSensors.tempCritical : 0;
    view.fanFailed = data?.fanTemperatureSensors?.fanFailed ? data.fanTemperatureSensors.fanFailed : 0;

    return view;
  }

  //Performance Hotspot widget
  /*
  * -----Start----- Performance Hotspots Widget Related -------------------
  */
  getUtilizationRows(filters?: any, ordering?: string): Observable<PerformanceHotspots> {
    let params = this.convertFiltersToParams(filters);
    if (ordering) {
      params = params.set('ordering', ordering);
      params = params.set('limit', 10);
    }
    return this.http.get<PerformanceHotspots>('/customer/widgets/performance_hotspots/', { params });

  }

  convertToUtilizationViewData(data: PerformanceHotspots): PrivateCloudUtilization {
    const view = new PrivateCloudUtilization();

    const rows = this.transformToUtilizationRows(data);

    view.utilRow = (rows || []).map(row =>
      this.convertToUtilizationViewRow(row)
    );

    return view;
  }


  transformToUtilizationRows(input: PerformanceHotspots): PrivateCloudUtilizationRow[] {
    return (input?.topUtilization || []).map(item => ({
      name: item.name,

      cpuSeries: item.cpuUtilization?.sparkline || [],
      cpuStatus: item.cpuUtilization?.current ?? 0,
      cpuTone: this.getProgressClass(item.cpuUtilization?.current ?? 0),

      memorySeries: item.memoryUtilization?.sparkline || [],
      memoryStatus: item.memoryUtilization?.current ?? 0,
      memoryTone: this.getProgressClass(item.memoryUtilization?.current ?? 0),

      storage: {
        capacity: `${item.storageUtilization?.capacity ?? 0}GB`,
        used: `${item.storageUtilization?.used ?? 0}GB`,
        free: `${item.storageUtilization?.free ?? 0}%`,
        percent: item.storageUtilization?.percentage ?? 0,
        tone: this.getProgressClass(item.storageUtilization?.percentage ?? 0)
      },

      diskIops: {
        value: item.diskIops?.value ?? 0,
        label: `${item.diskIops?.value ?? 0}k`,
        percent: item.diskIops?.percentage ?? 0,
        tone: this.getProgressClass(item.diskIops?.percentage ?? 0)
      },

      upTime: item.uptime || 'N/A',
      uuid: item.uuid,
      deviceType: item.deviceType,
      vmSubType: item.deviceType === 'Virtual Machine' ? item.vmSubType : undefined
    }));
  }

  getProgressClass(value: number): PrivateCloudStatusTone {
    return value < 65
      ? 'success'
      : value < 85
        ? 'warning'
        : 'danger';
  }

  private convertToUtilizationViewRow(row: PrivateCloudUtilizationRow): PrivateCloudUtilizationViewRow {
    return {
      ...row,
      cpuChartOptions: this.getSparklineOptions(row.cpuSeries, '#5d8df5', 'rgba(93, 141, 245, 0.28)'),
      memoryChartOptions: this.getSparklineOptions(row.memorySeries, '#6aa544', 'rgba(106, 165, 68, 0.28)')
    };
  }

  private getSparklineOptions(data: number[], lineColor: string, areaColor: string): EChartsOption {
    const values = (data || []).filter(value => typeof value === 'number' && !Number.isNaN(value));
    const minValue = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 100;
    const range = maxValue - minValue;
    const padding = range > 0 ? range * 0.2 : Math.max(Math.abs(maxValue || 1) * 0.2, 0.5);

    return {
      animation: false,
      grid: { top: 2, right: 1, bottom: 2, left: 1 },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: data.map((_, index) => index)
      },
      yAxis: {
        type: 'value',
        show: false,
        min: minValue - padding,
        max: maxValue + padding
      },
      series: [
        {
          type: 'line',
          data: data,
          symbol: 'none',
          smooth: false,
          lineStyle: {
            width: 1.5,
            color: lineColor
          },
          areaStyle: {
            color: areaColor
          }
        }
      ]
    };
  }

  //Idle Devices

  getIdleDevicesData(filters?: any, page = 1, pageSize = 10): Observable<IdleDevices> {
    let params = this.convertFiltersToParams(filters)
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));

    return this.http.get<IdleDevices>('/customer/widgets/idle_devices_analysis/', { params });

  }

  convertToDeviceIdleViewData(data: IdleDevices): IdleDevicesViewData {
    const view = new IdleDevicesViewData();
    const rows = this.transformToIdleDevicesRows(data);

    view.devicesRow = rows || [];

    // const rows;
    return view;
  }

  transformToIdleDevicesRows(input: IdleDevices): DevicesRowViewData[] {

    return (input?.results || []).map(item => ({

      deviceName: item.deviceName,
      resourceType: item.resourceType,
      networkIO: item.networkIO,
      idleDuration: item.idleDuration,
      uuid: item.uuid,
      deviceType: item.deviceType,
      vmSubType: item.deviceType === 'Virtual Machine' ? item.vmSubType : undefined,
      status: item.status,

      avgCpu: {
        used: `${item.avgCpu?.used ?? 0}GB`,
        free: `${item.avgCpu?.free ?? 0}%`,
        percent: +(100 - (item.avgCpu?.free ?? 0)).toFixed(2),
        tone: this.getProgressClass(100 - (item.avgCpu?.free ?? 0))
      },

      avgMem: {
        used: `${item.avgMem?.used ?? 0}GB`,
        free: `${item.avgMem?.free ?? 0}%`,
        percent: +(100 - (item.avgMem?.free ?? 0)).toFixed(2),
        tone: this.getProgressClass(100 - (item.avgMem?.free ?? 0))
      }

    }));
  }

  convertToIdleDevicesDistributionViewData(data: IdleDurationDistributionItem[]): IdleDevicesDistribution {
    const view = new IdleDevicesDistribution();
    view.distributionRow = (data || []).map(item => {
      const row = new DistributionRowData();
      row.duration = item.duration || 'N/A';
      row.percent = item.count || 0;
      return row;
    });

    return view;
  }

  convertToIdleDurationDistributionChartData(
    data: DistributionRowData[]
  ) {

    if (!data || !data.length) {
      return;
    }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    const colors = ['#18c06b', '#ff9800', '#d63b3b', '#f4a1a8'];

    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
          ${params.name}<br/>
          ${params.value}%
        `;
        }
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'pie',
          roseType: 'radius',
          clockwise: true,
          radius: ['42%', '64%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: true,
          padAngle: 0,

          label: {
            show: true,
            position: 'outside',
            color: '#6b7280',
            fontSize: 11,
            formatter: (params: any) => `${params.name} (${params.value})`
          },

          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              color: '#b7c1cc',
              width: 1
            }
          },

          data: data.map((item, index) => ({
            value: item.percent,
            name: item.duration,
            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: 0,
              borderWidth: 0
            }
          })),

          itemStyle: {
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 0
          }
        }
      ]
    };

    return view;
  }

  /*
   * ******End ****** Performance Hotspots Widget Related ********************
   */

  //Performance / Workload widget
  getPerformanceWorkloadWidgetData(filters: FiltersCriteriaType): Observable<PerformanceWorkloadDataType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<PerformanceWorkloadDataType>('/customer/widgets/performance_workload_insights/', { params });

  }

  createProgressBarChart(title: string, data: any[], maxValue?: number): EChartsOption {

    const max = maxValue || Math.max(...data.map(d => d.value));
    const visualMax = max > 0 ? max * 1.05 : 1;

    const gridHeight = Math.min(Math.max(data.length * 22, 28), 212);

    const longestNameLength = Math.max(...data.map(d => (d?.name || '').length), 0);

    // Keep label area small so bars get more space
    const labelWidth = Math.min(Math.max(longestNameLength * 6, 65), 90);

    const getColor = (value: number) => {
      const percent = (value / max) * 100;

      if (percent > 80) return '#e54b4b';     // red
      if (percent > 50) return '#f5a623';     // orange
      if (percent > 20) return '#2f80d1';     // blue
      return '#5c8f1f';                       // green
    };

    return {
      grid: {
        left: labelWidth,
        right: 36,
        top: 8,
        bottom: 6,
        height: gridHeight,
        containLabel: false
      },

      xAxis: {
        type: 'value',
        max: visualMax,
        show: false
      },

      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          interval: 0,
          color: '#6b7280',
          fontSize: 12,
          width: labelWidth - 8,
          align: 'right',
          overflow: 'truncate',
          margin: 8
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value}`
      },

      series: [
        {
          name: 'Background',
          type: 'bar',
          barWidth: 8,
          barGap: '-100%',
          barCategoryGap: '34%',
          silent: true,
          data: data.map(() => visualMax),
          itemStyle: {
            color: '#f3f4f6',
            borderRadius: 10
          },
          z: 1
        },
        {
          name: title,
          type: 'bar',
          barWidth: 8,
          barCategoryGap: '34%',
          data: data.map(item => ({
            value: item.value,
            itemStyle: {
              color: getColor(item.value),
              borderRadius: 10
            }
          })),
          label: {
            show: true,
            position: 'right',
            distance: 6,
            color: '#333',
            fontSize: 12,
            formatter: (params: any) => params.value
          },
          z: 2
        }
      ]
    };
  }

  convertTodiskLatencyChartData(data: any) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = this.createProgressBarChart('Top 10 - CPU Ready / Wait Time - VMs (%)', data);

    return view;
  }

  convertToCpuReadyChartData(data: any) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = this.createProgressBarChart('Top 10 Disk Latency (Ms)', data);

    return view;
  }

  convertToSwapBalloonMemoryChartData(data: any) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = this.createProgressBarChart('Top 10 - Swap / Balloon Memory (GB)', data);

    return view;
  }

  // Alert Trends
  /*
     * -----Start----- Alert & Events View Widget Related -------------------
     */
  getRecentAlerts(_criteria?: any): Observable<RecentAlerts> {
    let params = this.convertFiltersToParams(_criteria)
    return this.http.get<RecentAlerts>(` /customer/widgets/recent_alert/`, { params });
  }

  convertToAlertSummaryView(data: RecentAlerts): RecentAlertSummaryViewData {
    const view = new RecentAlertSummaryViewData();
    view.total = data?.alertSummary.total ?? 0;
    view.information = data?.alertSummary.information ?? 0;
    view.critical = data?.alertSummary.critical ?? 0;
    view.warning = data?.alertSummary.warning ?? 0;
    return view;
  }


  convertToTopCriticalAlertsViewData(data: RecentAlertsItem[]): TopCriticalAlertsViewData {
    const view = new TopCriticalAlertsViewData();

    view.alertList = (data || []).map(item => {
      const v = new TopCriticalAlertsList();

      v.id = item?.id ?? 0;
      v.deviceName = item?.deviceName || 'N/A';
      v.severity = item?.severity || 'N/A';

      v.description = item?.description
        ? item.description.replace(/(?:\r\n|\r|\n)/g, '<br>')
        : '';

      v.source = item?.source || 'N/A';
      v.acknowledged = item?.acknowledged || 'N/A';
      v.duration = item?.duration || 'N/A';
      v.uuid = item?.uuid

      return v;
    });

    return view;
  }





  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */


  //Orphaned Devcies

  getOrphanedDeviceData(filters: FiltersCriteriaType, page = 1, pageSize = 10): Observable<OrphanedResourcesResponse> {
    let params = this.convertFiltersToParams(filters);
    params = params.set('page', String(page));
    params = params.set('page_size', String(pageSize));
    params = params.set('offset', String((page - 1) * pageSize));
    return this.http.get<OrphanedResourcesResponse>('/customer/widgets/orphaned_devices_detailed/', { params });
  }

  convertToOrphanedDeviceListView(data: OrphanedResourcesResponse): OrphanedDeviceView {
    const viewData = new OrphanedDeviceView();

    viewData.orphanList = (data?.results || []).map((item: any) => {
      return {
        name: item.name,
        status: item.status,
        lastSeen: item.lastSeen,
        uuid: item.uuid,
        deviceType: item.deviceType,
        datacenter: item.datacenter
      } as OrphanedDeviceList;
    });

    return viewData;
  }


  convertToOrphanedByCategoryChartData(data: OrphanedCategory[]) {
    if (!data || !data.length) { return; }
    const view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    view.options = {
      ...view.options,

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
                    ${params.name}<br/>
                    Count: ${params.data.count}<br/>
                    ${params.data.percentage}%
                `;
        }
      },

      legend: {
        show: false,
        bottom: 5,
        left: 15,
        right: 15,
        orient: 'vertical',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 18,
        textStyle: {
          color: '#555',
          fontSize: 14
        },
        formatter: (name: string) => {
          const item = data.find(d => d.category === name);
          if (!item) {
            return name;
          }
          const left = item.category.padEnd(22, ' ');
          const right = `${item.count} (${item.percentage}%)`;

          return `${left}${right}`;
        }
      },
      series: [
        {
          name: 'Orphaned By Category',
          type: 'pie',
          roseType: 'radius',
          clockwise: false,
          radius: ['42%', '64%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: true,
          padAngle: 0,
          label: {
            show: true,
            position: 'outside',
            color: '#4b5563',
            fontSize: 14,
            formatter: (params: any) => `${params.data.count}`
          },
          labelLine: {
            show: true,
            length: 14,
            length2: 12,
            lineStyle: {
              width: 1
            }
          },
          data: data.map((item, index) => ({
            value: item.count,
            name: item.category,

            count: item.count,
            percentage: item.percentage,

            itemStyle: {
              color: chartColors[index],
              borderColor: 'transparent',
              borderWidth: 0,
              borderRadius: 0
            }
          })),

          itemStyle: {
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 0
          },

          emphasis: {
            scale: false
          }
        }
      ]
    };

    return view;
  }
}

export class ExecutiveSummaryViewData {
  totalVMs: number;
  physicalHosts: number;
  clusters: number;
  poweredOn: number;
  poweredOff: number;
  orphanedVMs: number;
  idleVMs: number;

}

export class ExecutiveSummaryWidgetData {
  executiveSummaryLoader: string = 'executiveSummaryLoader';
  cloudTypeLoader: string = 'CloudTypeLoader';
  powerActivityLoader: string = 'PowerActivityLoader';
  vmCountByOSTypeLoader: string = 'VMCountByOSTypeLoader';
  environmentAndCriticalityLoader: string = 'EnvironmentAndCriticalityLoader';
  cloudTypeChartData: UnityChartDetails;
  powerActivityChartData: UnityChartDetails;
  vmCountByOSTypeChartData: UnityChartDetails;
  // environmentAndCriticalityViewData: EnvironmentAndCriticalityData;
  environmentAndCriticalityChartData: UnityChartDetails;
  alertSeverityViewData: AlertSeverityData;
}


export class AlertSeverityData {
  critical: number;
  warning: number;
  info: number;
}

export class CapacityAndGrowthInsightsWidgetData {
  vmDensityLoader: string = 'VMDensityPerHostLoader';
  vmCapacityLoader: string = 'vmCapacityTrendAndGrowthLoader';
  vmDensityChartData: UnityChartDetails;
  vmCapacityChartData: UnityChartDetails;
  vmProvisioningViewData: VMProvisioningViewData;
}

class VMProvisioningViewData {
  provisionedCount: number;
  decommissionedCount: number;
}

export class Top10ClustersByVMsWidgetData {
  loader: string = 'Top10ClustersByVMsCountLoader';
  chartData: UnityChartDetails;
}

export class ClusterCapacityUtilTrendWidgetData {
  loader: string = 'ClusterCapacityUtilTrendCountLoader';
  chartData: UnityChartDetails;
}

export class InfrastructureHealthWidgetData {
  loader: string = 'InfrastructureHealthWidgetLoader';
  psuNormal: number;
  psuDegraded: number;
  psuFailed: number;
  healthy: number;
  warning: number;
  critical: number;
  maintenance: number;
  tempNormal: number;
  tempWarning: number;
  tempCritical: number;
  fanFailed: number;
}

export class PerformanceHotspotWidgetData {
  loader: string = 'PerformanceHotspotLoader';
  tableData: any;
}

export class DiskLatencyWidgetData {
  loader: string = 'DiskLatencyLoader';
  chartData: UnityChartDetails;
}

export class CpuReadyWidgetData {
  loader: string = 'CpuReadyLoader';
  chartData: UnityChartDetails;
}

export class SwapBalloonMemoryWidgetData {
  loader: string = 'SwapBalloonMemoryLoader';
  chartData: UnityChartDetails;
}

export class TicketPriorityOptionsWidgetData {
  loader: string = 'TicketPriorityLoader'
  chartData: EChartsOption;
}

export class TicketStatusOptionsWidgetData {
  loader: string = 'TicketStatusLoader'
  chartData: EChartsOption;

}

export class TicketsItemViewData {
  loader: string = 'ITSMTicketListLoader';
  ticketList: TicketsList[];
}

export class TicketsList {
  ticketId: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
}


export class RiskOptimizationViewData {
  overUtilHosts: string;
  overUtilHostsPercent: string;
  underUtilHosts: string;
  underUtilHostsPercent: string;
  idleVms: string;
  idleVmsMsg: string;
  capacityAlerts: string;
  capacityAlertsMsg: string;
}

export class RiskOptimizationWidgetData {
  loader: string = 'CapacityRiskLoader';
  chartData: UnityChartDetails;
}

export class AutoRemediationExecSummaryWidgetData {
  loader: string = 'AutoRemediationExecSummaryLoader'
  chartData: UnityChartDetails;
  totalRuns: number;
  avgDuration: number;
}

export class TopAutoRemediationActionWidgetData {
  loader: string = 'TopAutoRemediationActionWidgetData'
  chartData: UnityChartDetails;
}

export class RecentAlertSummaryViewData {
  loader: string = 'publicCloudAlertSummaryLoader'
  total: number;
  information: number;
  critical: number;
  warning: number;
}

export class TopCriticalAlertsViewData {
  loader: string = 'publicCloudCriticalAlertsLoader';
  alertList: TopCriticalAlertsList[] = [];
}

export class TopCriticalAlertsList {
  uuid: string;
  status: string;
  deviceName: string;
  severity: string;
  source: string;
  duration: string;
  acknowledged: string;
  id: number;
  description: string;
}

export class OrphanedDeviceView {
  loader: string = 'OrphanedDeviceListLoader';
  orphanList: OrphanedDeviceList[] = [];
}

export class OrphanedDeviceList {
  name: string;
  status: string;
  uuid: string;
  deviceType: string
  vmSubType?: string;
  lastSeen: string;
  datacenter: string;
}

export class OrphanedDeviceWidgetView {
  loader: string = 'OrphanedDeviceWidgetLoader';
  chartData: UnityChartDetails;

}


const priorityConfig = [
  { key: 'High', name: '2 - High', color: '#ff5b63' },
  { key: 'Low', name: '4 - Low', color: '#6979ff' },
  { key: 'Moderate', name: '3 - Moderate', color: '#9bf04d' },
  { key: 'Critical', name: '1 - Critical', color: '#ff66d0' },
  { key: 'Planning', name: '5 - Planning', color: '#63d6c5' }
];

const statusConfig = [
  { key: 'Closed with ST Self heal', color: '#696cff' },
  { key: 'New', color: '#7bd88f' },
  { key: 'Closed', color: '#ff5fb8' },
  { key: 'Open', color: '#5bb9ff' },
  { key: 'Root Cause Analysis', color: '#ffd166' },
  { key: 'Schedule', color: '#b36bff' },
  { key: 'Authorize', color: '#7ee2a8' },
  { key: 'Implement', color: '#ff9f43' },
  { key: 'Resolved', color: '#8bd450' },
  { key: 'In Progress', color: '#4b7bec' },
  { key: 'On Hold', color: '#9aa6b2' }
];

export const EVENT_CHART_SECTIONS = [
  {
    name: 'Raw Events',
    sourceKey: 'rawEvents',
    keys: ['critical', 'warning', 'informative']
  },
  {
    name: 'Noise Reduction',
    sourceKey: 'noiseReduction',
    keys: ['dedupeEvents', 'suppressedEvents', 'correlated']
  },
  {
    name: 'First Response',
    sourceKey: 'firstResponse',
    keys: ['autoCloned', 'ticketCreated', 'autoClosed']
  }
];

export const SUMMARY_CHART_CONFIG = [
  {
    name: 'Raw Events',
    key: 'rawEvents',
    color: '#ff8f8f'
  },
  {
    name: 'Alerts',
    key: 'alerts',
    color: '#ffbf69'
  },
  {
    name: 'Conditions',
    key: 'conditions',
    color: '#9ed0ff'
  }
];

export interface PublicCloudTicketFilterCriteria {
  state: string;
  ticket_type: string;
  search: string;
  priority: string;
  dateRange: string;
  start_date: string;
  end_date: string;
  page: number;
  page_size: number;
}

export class Top10ClustersByVMCountViewData {
  loader: string = 'top10ClustersByVMCountLoader';
  clusterList: Top10ClustersByVMCountItemViewData[] = [];
}

export class Top10ClustersByVMCountItemViewData {
  host: string;
  value: number;
}

export class ClusterCapacityUtilTrendViewData {
  month: string;
  actual: number;
  forecast: number;
}

export const chartColors = [
  '#6677ee',
  '#6fc98c',
  '#f5aa4b',
  '#1fc7ea',
  '#9b87f5'
];

export class IdleDevicesViewData {
  loader: string = 'IdleDevicesLoader';
  devicesRow: DevicesRowViewData[];
}

export class DevicesRowViewData {
  deviceName: string;
  resourceType: string;
  avgCpu: AvgCpu;
  uuid: string;
  deviceType: string;
  vmSubType?: string;
  avgMem: AvgMem;
  networkIO: string;
  idleDuration: string;
  status: string;
}

export class AvgCpu {
  used: string;
  free: string;
  percent: number;
  tone: PrivateCloudStatusTone;
}
export class AvgMem {
  used: string;
  free: string;
  percent: number;
  tone: PrivateCloudStatusTone;
}

export class IdleDevicesDistribution {
  loader: string = 'IdleDevicesDistributionLoader';
  distributionRow: DistributionRowData[];
  chartData: UnityChartDetails;

}

export class DistributionRowData {
  duration: string;
  percent: number;
}

export class VmDensityHost {
  loader: string = 'VmDensityHostLoader';
  desnityHostRows: DesityHostRows[];
}

export class DesityHostRows {
  hostName: string;
  utilizationPct: number;
  totalStorageGB: number;
  usedStorageGB: number;
  category: string;
}
