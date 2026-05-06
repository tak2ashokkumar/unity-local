import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnyMxRecord } from 'dns';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { PRIVATE_CLOUD_ALERT_TREND_STACK_GROUPS, PRIVATE_CLOUD_TICKETS_TOTAL, Top10ClustersByVMCount, VmDensityPerHostChartColors } from './private-cloud-compute-dashboard.const';
import { AlertsEventsView, AlertsSeverityItem, AlertSummary, AlertTrends, AutoRemediationDataType, CapacityAndGrowthDataType, CapacityTrendAndForecastItem, CloudTypeDistributionItem, EnvironmentCriticalityItem, ExecutionSummaryItem, ExecutiveSummaryItem, ExecutiveSummaryWidgetType, InfrahealthstatusDataType, ITSMTicketView, PerformanceHotspots, PerformanceWorkloadDataType, PowerActivityStateItem, PrivateCloudAlertSideCard, PrivateCloudAlertTrendBarGroup, PrivateCloudAlertTrendLegendItem, PrivateCloudStatusTone, PrivateCloudTicketDonutItem, PrivateCloudUtilization, PrivateCloudUtilizationRow, PrivateCloudUtilizationViewRow, ProvisioningStatus, TicketsByPriority, TicketsByStatus, TicketsItem, TopActionsItem, TopCriticalAlertsItem, TopHeaderDataType, VmCountByOSTypeItem, VmDensityPerHostItem } from './private-cloud-compute-dashboard.type';


@Injectable()
export class PrivateCloudComputeDashboardService {

  constructor(
    private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,) { }

  convertFiltersToParams(filters: any) {
    let params: HttpParams = new HttpParams();
    console.log("filters - ", filters)

    //Need to check how backend receiving this.
    if (filters?.platforms?.length) {
      console.log('platforms present')
      filters.platforms.forEach(val => {
        params.append('platform', val);
      });
    }
    if (filters?.datacenters?.length) {
      filters.platforms.forEach(val => {
        params.append('datacenter', val);
      });
    }
    if (filters?.environments?.length) {
      filters.platforms.forEach(val => {
        params.append('environment', val);
      });
    }
    if (filters?.accounts?.length) {
      filters.platforms.forEach(val => {
        params.append('account', val);
      });
    }
    console.log("params - ", params)

    return params;
  }

  getHeaderInfo(): Observable<TopHeaderDataType> {
    return this.http.get<TopHeaderDataType>(`/customer/widgets/private_cloud_dashboard_header/`);
  }

  getFilterDropdowns(): Observable<any> {
    // return this.http.get<ExecutiveSummaryWidgetType>(`/customer/widgets/executive_summary/`);
    return of({
      "filters": {
        "platforms": [
          { "value": "VMware", "label": "VMware vCenter" },
          { "value": "Custom", "label": "Custom" }
        ],
        "datacenters": [
          { "value": "DC1", "label": "DC1" },
          { "value": "DC2", "label": "DC2" }
        ],
        "accounts": [
          { "value": "uuid-123", "label": "treas" },
          { "value": "uuid-456", "label": "custom_clouds" }
        ],
        "environments": [
          { "value": "Production", "label": "Production" },
          { "value": "Development", "label": "Development" },
          { "value": "Test", "label": "Test" },
          { "value": "None", "label": "None" }
        ]
      }
    })
  }

  buildFilterForm(platforms: any[], datacenters: any[], environments: any[], accounts: any[]): FormGroup {
    return this.builder.group({
      platforms: [platforms || []],
      datacenters: [datacenters || []],
      environments: [environments || []],
      accounts: [accounts || []]
    });
  }

  //Executive summary widget
  getExecutiveSummaryWidgetData(filters: any): Observable<ExecutiveSummaryWidgetType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<ExecutiveSummaryWidgetType>(`/customer/widgets/executive_summary/`, { params });
  }

  convertExecutiveSummaryViewData(data: ExecutiveSummaryItem) {
    let summaryData = new ExecutiveSummaryViewData();
    summaryData.totalVMs = data.totalVMs;
    summaryData.physicalHosts = data.physicalHosts;
    summaryData.clusters = data.clusters;
    summaryData.poweredOn = data.poweredOnVMs;
    summaryData.poweredOff = data.poweredOffVMs;
    return summaryData;
  }

  convertToCloudTypeChartData(data: CloudTypeDistributionItem[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);

    view.options = {
      ...view.options,
      // title: {
      //   text: 'Cloud type distribution',
      //   left: 'center',
      //   top: 10,
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 500,
      //     color: '#333'
      //   }
      // },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>${params.value}% (${params.data.count})`;
        }
      },

      legend: {
        bottom: 10,
        left: 'center',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 16,
        textStyle: {
          color: '#8a8a8a',
          fontSize: 13
        },
        formatter: (name: string) => {
          const item = data.find(d => d.type === name);
          return item ? `${name} ${item.percentage}%` : name;
        }
      },

      series: [
        {
          name: 'Cloud Type',
          type: 'pie',
          radius: ['48%', '74%'],
          center: ['50%', '43%'],

          label: { show: false },
          labelLine: { show: false },

          data: data.map((item, index) => ({
            value: item.percentage,
            name: item.type,
            count: item.count,
            itemStyle: {
              color: index === 0 ? '#3a8dde' : '#f5a623'
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
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = {
      ...view.options,
      grid: {
        left: 50,
        right: 20,
        top: 20,
        bottom: 40
      },

      xAxis: {
        type: 'category',
        data: data.map(d => d.state),
        axisLine: {
          lineStyle: { color: '#9ca3af' }
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12
        }
      },

      yAxis: {
        type: 'value',
        min: 0,
        max: 3800, // to match visual scale in your image
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280'
        },
        splitLine: {
          show: false
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = data[params.dataIndex];
          return `
        ${item.state}<br/>
        Count: ${item.count}<br/>
        ${item.percentage}%
      `;
        }
      },

      series: [
        {
          type: 'bar',
          barWidth: 50,
          data: data.map((item) => {
            let color = '#ccc';

            if (item.state === 'Powered Off') color = '#5c8f1f'; // green
            else if (item.state === 'Active') color = '#3a8dde'; // blue
            else if (item.state === 'Idle') color = '#f5a623'; // orange

            return {
              value: item.count,
              itemStyle: {
                color,
                borderRadius: [6, 6, 0, 0]
              }
            };
          })
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
      // title: {
      //   text: 'VM count by OS type',
      //   left: 'center',
      //   top: 15,
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 500,
      //     color: '#333'
      //   }
      // },

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
          label: { show: false },
          labelLine: { show: false },

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

    view.options = {
      ...view.options,
      // title: {
      //   text: 'Environment & criticality',
      //   left: 'center',
      //   top: 10,
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 500,
      //     color: '#333'
      //   }
      // },

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
          fontSize: 12
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = data[params.dataIndex];
          return `${item.environment}<br/>Count: ${item.count}<br/>${item.percentage}%`;
        }
      },

      series: [
        {
          name: 'Background',
          type: 'bar',
          barWidth: 9,
          barGap: '-100%',
          silent: true,
          data: data.map(() => 100),
          itemStyle: {
            color: '#f1f2f4',
            borderRadius: 10
          },
          z: 1
        },
        {
          name: 'Environment',
          type: 'bar',
          barWidth: 9,
          data: data.map((item, index) => {
            const colors = ['#e54b4b', '#f5a623', '#2f80d1', '#5c8f1f'];

            return {
              value: item.percentage,
              count: item.count,
              itemStyle: {
                color: colors[index],
                borderRadius: 10
              }
            };
          }),
          label: {
            show: true,
            position: 'right',
            color: '#333',
            fontSize: 12,
            formatter: (params) => {
              const item = data[params.dataIndex];
              return item.count.toString();
            },
          },
          z: 2
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
  getCapacityGrowthWidgetData(filters: any): Observable<CapacityAndGrowthDataType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<CapacityAndGrowthDataType>('/customer/widgets/capacity_growth_insights/', { params });
  }

  convertToVmDensityChartDataChartData(data: VmDensityPerHostItem[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = {
      ...view.options,
      // title: {
      //   text: 'VM Density Per Host',
      //   left: 'center',
      //   top: 5,
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 500,
      //     color: '#333'
      //   }
      // },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>VM Count: ${params.value}`;
        }
      },

      xAxis: {
        type: 'category',
        data: data.map(item => item.hostName),
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
        min: 0,
        max: 40,
        interval: 10,
        axisLine: { show: false },
        axisTick: { show: false },
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
          barWidth: 52,
          data: data.map((item, index) => ({
            value: item.vmCount,
            itemStyle: {
              color: VmDensityPerHostChartColors[index % VmDensityPerHostChartColors.length],
              borderRadius: [4, 4, 0, 0]
            }
          }))
        }
      ]
    };

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
  getTop10ClustersByVMsWidgetData(filters: any): Observable<any> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<any>('/customer/widgets/', { params });
  }

  convertToTop10ClustersByVMsChartData(data: any) {
    data = Top10ClustersByVMCount;
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

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
          fontSize: 12
        }
      },

      yAxis: {
        type: 'value',
        min: 0,
        max: 40,
        interval: 10,
        axisLine: { show: false },
        axisTick: { show: false },
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
          barWidth: 52,
          data: data.map((item, index) => ({
            value: item.vmCount,
          }))
        }
      ]
    };
    return view;
  }

  // Cluster capacity
  getClusterCapacityUtilTrendWidgetData(filters: any): Observable<any> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<any>('/customer/widgets/', { params });
  }

  convertToClusterCapacityUtilTrendChartData(data: any) {
    data = [
      { month: 'Apr', actual: 4200, forecast: 4300 },
      { month: 'May', actual: 4100, forecast: 4350 },
      { month: 'Jun', actual: 4400, forecast: 4450 },
      { month: 'Jul', actual: 4500, forecast: 4550 },
      { month: 'Aug', actual: 4600, forecast: 4600 },
      { month: 'Sep', actual: 4700, forecast: 4750 }
    ];

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
  getInfrastructureHealthWidgetData(filters: any): Observable<InfrahealthstatusDataType> {
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
  getUtilizationRows(filters?: any): Observable<PerformanceHotspots> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<PerformanceHotspots>('/customer/widgets/performance_hotspots/', { params });
    // return of(Private_CLOUD_UTILIZATION_ROWS);
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
        label: `${item.diskIOPS?.value ?? 0}k`,
        percent: item.diskIOPS?.percentage ?? 0,
        tone: this.getProgressClass(item.diskIOPS?.percentage ?? 0)
      },

      upTime: item.uptime || 'N/A'
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
        min: 0,
        max: 100
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
  /*
   * ******End ****** Performance Hotspots Widget Related ********************
   */

  //Performance / Workload widget
  getPerformanceWorkloadWidgetData(filters: any): Observable<PerformanceWorkloadDataType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<PerformanceWorkloadDataType>('/customer/widgets/performance_workload_insights/', { params });
  }

  createProgressBarChart(title: string, data: any[], maxValue?: number): EChartsOption {

    const max = maxValue || Math.max(...data.map(d => d.value));

    const getColor = (value: number) => {
      const percent = (value / max) * 100;
      if (percent > 80) return '#e54b4b';     // red
      if (percent > 50) return '#f5a623';     // orange
      if (percent > 20) return '#2f80d1';     // blue
      return '#5c8f1f';                       // green
    };

    return {
      // title: {
      //   text: title,
      //   left: 'center',
      //   top: 5,
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 500,
      //     color: '#333'
      //   }
      // },
      xAxis: {
        type: 'value',
        max,
        show: false
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(d => d.vmName),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12
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
          silent: true,
          data: data.map(() => max),
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
          data: data.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: getColor(item.value),
              borderRadius: 10
            }
          })),
          label: {
            show: true,
            position: 'right',
            color: '#333',
            fontSize: 12,
            formatter: '{c}'
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
  getAlertEvents(_criteria?: any): Observable<AlertsEventsView> {
    let params = this.convertFiltersToParams(_criteria)
    return this.http.get<AlertsEventsView>(`/customer/widgets/alerts_events_view/`, { params });
    // return of(PRIVATE_CLOUD_ALERT_SUMMARY);
  }

  convertToAlertSummaryView(data: AlertSummary): AlertSummaryViewData {
    const view = new AlertSummaryViewData();

    view.criticalAlerts = data?.criticalAlerts ?? 0;
    view.highAlerts = data?.highAlerts ?? 0;
    view.openITSMTickets = data?.openITSMTickets ?? 0;

    view.automationSuccess = data?.automationSuccess || 'N/A';
    view.avgMTTR = data?.avgMTTR || 'N/A';

    return view;
  }


  convertToTopCriticalAlertsViewData(data: TopCriticalAlertsItem[]): TopCriticalAlertsViewData {
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

      return v;
    });

    return view;
  }

  // getAlertTrendLegend(filters?: any): Observable<PrivateCloudAlertTrendLegendItem[]> {
  //   let params = this.convertFiltersToParams(filters)
  //   // return this.http.get<PrivateCloudAlertTrendLegendItem>('/customer/widgets/performance_hotspots/', { params });
  //   // return of(PRIVATE_CLOUD_ALERT_TREND_LEGEND);
  // }

  convertToAlertTrendLegendViewData(data: PrivateCloudAlertTrendLegendItem[]): PrivateCloudAlertTrendLegendItem[] {
    return data || [];
  }

  convertToAlertTrendPolarOptions(data: AlertTrends): EChartsOption {
    return this.getAlertTrendPolarOptions(this.convertPolarSummaryChartView(data) || []);
  }

  convertPolarSummaryChartView(data: any): Array<{ name: string; value: number; color: string }> {
    if (!data?.summary) {
      return [];
    }

    return SUMMARY_CHART_CONFIG.map(item => ({
      name: item.name,
      value: Number(data.summary?.[item.key] ?? 0),
      color: item.color
    }));
  }

  private getAlertTrendPolarOptions(items: PrivateCloudAlertTrendLegendItem[]): EChartsOption {
    return {
      color: items.map(item => item.color),
      angleAxis: {
        type: 'category',
        data: items.map(item => item.name),
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      radiusAxis: {
        min: 0,
        max: 900,
        splitNumber: 9,
        axisLabel: {
          color: '#6f7882',
          fontSize: 9
        },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      polar: {
        radius: '78%',
        center: ['50%', '50%']
      },
      series: [
        {
          type: 'bar',
          coordinateSystem: 'polar',
          roundCap: false,
          data: items.map(item => ({
            value: item.value,
            itemStyle: {
              color: item.color,
              borderColor: item.color.replace('0.35', '1'),
              opacity: 0.75
            }
          }))
        }
      ]
    };
  }

  getAlertTrendStackGroups(_criteria?: any): Observable<PrivateCloudAlertTrendBarGroup[]> {
    return of(PRIVATE_CLOUD_ALERT_TREND_STACK_GROUPS);
  }

  convertToAlertTrendStackOptions(data: AlertTrends): EChartsOption {
    return this.getAlertTrendStackOptions(this.convertToStackChartView(data) || []);
  }

  private getAlertTrendStackOptions(groups: PrivateCloudAlertTrendBarGroup[]): EChartsOption {
    const categories = groups.map(group => group.name);
    const names = ['Critical', 'Warning', 'Informative'];
    const colors = ['#d90000', '#ff8a00', '#3f92d7'];
    return {
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { show: false },
      grid: { top: 12, right: 8, bottom: 28, left: 40 },
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: { show: false },
        axisLabel: { color: '#3c4650', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        max: 900,
        splitLine: { lineStyle: { color: '#e5e9ed' } },
        axisLabel: { color: '#6f7882', fontSize: 10 }
      },
      series: names.map((name, index) => ({
        name: name,
        type: 'bar',
        stack: 'total',
        barWidth: 54,
        itemStyle: { color: colors[index] },
        data: groups.map(group => group.values[index])
      }))
    };
  }

  getAlertTrends(filters?: any): Observable<AlertTrends> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<AlertTrends>('/customer/widgets/performance_hotspots/', { params });
    // return of(PRIVATE_CLOUD_ALERT_SIDE_CARDS);
  }

  convertToAlertSideCardsViewData(data: AlertTrends): PrivateCloudAlertSideCard[] {
    if (!data) {
      return [];
    }

    return [
      {
        title: 'Raw Events',
        value: String(data.rawEvents?.total ?? 0),
        metrics: [
          {
            label: 'Critical',
            value: String(data.rawEvents?.critical ?? 0),
            tone: 'danger'
          },
          {
            label: 'Warning',
            value: String(data.rawEvents?.warning ?? 0),
            tone: 'warning'
          },
          {
            label: 'Informative',
            value: String(data.rawEvents?.informative ?? 0),
            tone: 'primary'
          }
        ]
      },
      {
        title: 'Noise Reduction',
        value: `${data.noiseReduction?.percentage ?? 0}%`,
        metrics: [
          {
            label: 'Dedupe Events',
            value: String(data.noiseReduction?.dedupeEvents ?? 0)
          },
          {
            label: 'Suppressed Events',
            value: String(data.noiseReduction?.suppressedEvents ?? 0)
          },
          {
            label: 'Correlated',
            value: String(data.noiseReduction?.correlated ?? 0)
          }
        ]
      },
      {
        title: 'First Response',
        value: `${data.firstResponse?.percentage ?? 0}%`,
        metrics: [
          {
            label: 'Auto Clonned',
            value: String(data.firstResponse?.autoCloned ?? 0)
          },
          {
            label: 'Ticket Created',
            value: String(data.firstResponse?.ticketCreated ?? 0)
          },
          {
            label: 'Auto Closed',
            value: String(data.firstResponse?.autoClosed ?? 0)
          }
        ]
      }
    ];
  }


  convertToStackChartView(data: any): Array<{ name: string; values: number[] }> {
    if (!data) {
      return [];
    }

    return EVENT_CHART_SECTIONS.map(section => ({
      name: section.name,
      values: section.keys.map(key =>
        Number(data?.[section.sourceKey]?.[key] ?? 0)
      )
    }));
  }
  /*
   * ******End ****** Alert & Events View Widget Related ********************
   */

  /*
   * -----Start----- ITSM Tickets Widget Related -------------------
   */
  getITSMTicket(filters?: any): Observable<ITSMTicketView> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<ITSMTicketView>(`/customer/widgets/itsm_tickets/`, { params });
    // return of(PRIVATE_CLOUD_TICKET_PRIORITY);
  }

  convertToTicketPriorityOptions(data: TicketsByPriority): EChartsOption {
    return this.getTicketDonutOptions(this.transformTicketsByPriority(data) || [], 'Tickets by Priority');
  }

  transformTicketsByPriority(ticketsByPriority: TicketsByPriority): PrivateCloudTicketDonutItem[] {
    return priorityConfig.map(config => ({
      name: config.name,
      value: ticketsByPriority[config.key] || 0,
      color: config.color
    }));
  }

  convertToTicketStatusOptions(data: TicketsByStatus): EChartsOption {
    return this.getTicketDonutOptions(this.transformTicketsByStatus(data) || [], 'Tickets by Status');

  }

  convertToTicketViewData(tickets: TicketsItem[]): TicketsItemViewData {
    const view = new TicketsItemViewData();

    view.ticketList = (tickets || []).map(ticket => {
      const t = new TicketsList();

      t.ticketId = ticket.ticketId || 'N/A';

      t.shortDescription = ticket.shortDescription ? ticket.shortDescription.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      t.state = ticket.state || 'N/A';
      t.priority = ticket.priority || 'N/A';
      t.createdOn = ticket.createdOn ? this.utilSvc.toUnityOneDateFormat(ticket.createdOn) : '';
      t.updatedOn = ticket.updatedOn ? this.utilSvc.toUnityOneDateFormat(ticket.updatedOn) : '';
      t.resolution = ticket.resolution || 'N/A';
      return t;
    });

    return view;
  }

  transformTicketsByStatus(ticketsByStatus: TicketsByStatus): PrivateCloudTicketDonutItem[] {
    return statusConfig.map(config => ({
      name: config.key,
      value: ticketsByStatus[config.key] || 0,
      color: config.color
    }));
  }


  getTicketsTotal(_criteria?: AnyMxRecord): Observable<number> {
    return of(PRIVATE_CLOUD_TICKETS_TOTAL);
  }

  private getTicketDonutOptions(items: PrivateCloudTicketDonutItem[], title: string): EChartsOption {
    return {
      animation: false,
      title: {
        text: title,
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 11,
          fontWeight: 600,
          color: '#4d5966'
        }
      },
      color: items.map(item => item.color),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      legend: {
        type: 'plain',
        bottom: 0,
        left: 'center',
        itemWidth: 7,
        itemHeight: 7,
        textStyle: {
          fontSize: 8,
          color: '#566270'
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '66%'],
          center: ['50%', '46%'],
          label: {
            formatter: '{c}',
            color: '#ffffff',
            fontSize: 8
          },
          labelLine: { show: false },
          data: items.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    };
  }
  /*
   * ******End ****** ITSM Tickets Widget Related ********************
   */


  //Risk Optimization
  getRiskOptimizationWidgetData(filters: any): Observable<any> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<any>('/customer/widgets/risk_optimization', { params });
    // return of({
    //   "overUtilHosts": "18",
    //   "overUtilHostsPercent": "45.0",
    //   "underUtilHosts": "34",
    //   "underUtilHostsPercent": "85.0",
    //   "idleVms": "129",
    //   "idleVmsMsg": "Reclamation candidates",
    //   "capacityAlerts": "11",
    //   "capacityAlertsMsg": "Projected 30-day risk",
    //   "capacityRiskAlerts": [
    //     { "name": "RDS-prod-01", "utilization": 88 },
    //     { "name": "CloudSQL-01", "utilization": 74 },
    //     { "name": "Azure SQL-02", "utilization": 69 }
    //   ]
    // })
  }

  convertRiskOptimizationWidgetData(data: any) {
    // data = capacityRiskAlertsData;
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = {
      ...view.options,
      title: {
        text: 'Capacity risk alerts',
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 18,
          fontWeight: 400,
          color: '#333'
        }
      },
      legend: { show: false },
      grid: {
        left: '5%',
        right: '5%',
        top: '5%',
        bottom: '5%',
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        show: false
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(item => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6f7b86',
          fontSize: 12,
          margin: 10
        }
      },
      series: [
        {
          name: 'Background',
          type: 'bar',
          data: data.map(() => 100),
          barWidth: 8,
          barGap: '-100%',
          silent: true,
          itemStyle: {
            color: '#f0f0f0',
            borderRadius: [10, 10, 10, 10]
          }
        },
        {
          name: 'Risk',
          type: 'bar',
          data: data.map(item => ({
            value: item.value,
            itemStyle: {
              color: this.setBarColor(item.value),
              borderRadius: [10, 10, 10, 10]
            },
            label: {
              show: true,
              position: 'right',
              distance: 8,
              formatter: `{c}%`,
              color: '#000',
              fontSize: 12
            }
          })),
          barWidth: 8,
          z: 2
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none'
        },
        formatter: (params: any) => {
          const data = params.find((item: any) => item.seriesName === 'Risk');
          return `${data.name}: ${data.value}%`;
        }
      }
    };

    return view;
  }

  setBarColor(value): string {
    return value < 65 ? '#00b873' : value >= 65 && value < 85 ? '#f5a623' : '#ef4b4b';
  }

  convertRiskOptimizationSummaryData(data: any) {
    console.log(data, 'service')
    if (!data || !data.length) { return; }
    let view = new RiskOptimizationViewData();
    view.overUtilHosts = data?.overUtilHosts ? data?.overUtilHosts : '0';
    view.overUtilHostsPercent = data?.overUtilHostsPercent ? data?.overUtilHostsPercent : '0';
    view.underUtilHosts = data?.overUtilHosts ? data?.overUtilHosts : '0';
    view.underUtilHostsPercent = data?.underUtilHostsPercent ? data?.underUtilHostsPercent : '0';
    view.idleVms = data?.idleVms ? data?.idleVms : '0';
    view.idleVmsMsg = data?.idleVmsMsg ? data?.idleVmsMsg : '0';
    view.capacityAlerts = data?.capacityAlerts ? data?.capacityAlerts : '0';
    view.capacityAlertsMsg = data?.capacityAlertsMsg ? data?.capacityAlertsMsg : '0';
    return view;
  }

  // Auto Remediation Widget
  getAutoRemediationSummaryWidgetData(filters: any): Observable<AutoRemediationDataType> {
    let params = this.convertFiltersToParams(filters)
    return this.http.get<AutoRemediationDataType>('/customer/widgets/auto_remediation_summary/', { params });
  }

  convertToAutoRemediationExecSummaryChartData(data: ExecutionSummaryItem) {
    if (!data) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    view.options = {
      ...view.options,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },

      legend: {
        show: false
      },

      graphic: [
        {
          type: 'group',
          right: 20,
          top: 45,
          children: [
            {
              type: 'rect',
              shape: { width: 14, height: 14 },
              style: { fill: '#5c9f22' }
            },
            {
              type: 'text',
              left: 20,
              top: -2,
              style: {
                text: `Successful ${data.successfulPercentage}%`,
                fill: '#000',
                fontSize: 16
              }
            },
            {
              type: 'rect',
              left: 145,
              shape: { width: 14, height: 14 },
              style: { fill: '#ef4b4b' }
            },
            {
              type: 'text',
              left: 165,
              top: -2,
              style: {
                text: `Failed ${data.failedPercentage}%`,
                fill: '#000',
                fontSize: 16
              }
            },
            {
              type: 'text',
              top: 35,
              style: {
                text: `Total runs: ${data.totalRuns.toLocaleString()}  |  Avg duration: ${data.avgDuration} min`,
                fill: '#000',
                fontSize: 16
              }
            }
          ]
        }
      ],

      series: [
        {
          name: 'Execution Summary',
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['22%', '50%'],
          label: { show: false },
          labelLine: { show: false },
          data: [
            {
              value: data.successfulPercentage,
              name: 'Successful',
              itemStyle: { color: '#5c9f22' }
            },
            {
              value: data.failedPercentage,
              name: 'Failed',
              itemStyle: { color: '#ef4b4b' }
            }
          ]
        }
      ]
    };

    return view;

  }

  convertToTopAutoRemediationActionChartData(data: TopActionsItem[]) {
    if (!data || !data.length) { return; }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);

    const max = Math.max(...data.map(item => item.executionCount));

    const getColor = (value: number): string => {
      const percent = (value / max) * 100;
      if (percent > 80) return '#3a8dde';
      if (percent > 50) return '#f5a623';
      return '#5c8f1f';
    };

    view.options = {
      ...view.options,
      xAxis: {
        type: 'value',
        max,
        show: false
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(item => item.actionName),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#000',
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}: ${params.value}`;
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          data: data.map(item => ({
            value: item.executionCount,
            itemStyle: {
              color: getColor(item.executionCount),
              borderRadius: 10
            }
          })),
          label: {
            show: true,
            position: 'right',
            color: '#000',
            fontSize: 14,
            formatter: '{c}'
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
}

export class ExecutiveSummaryWidgetData {
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

// export class EnvironmentAndCriticalityData {
//   production: number;
//   developement: number;
//   test: number;
//   none: number;
// }

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

export class AlertSummaryViewData {
  loader: string = 'publicCloudAlertSummaryLoader'
  criticalAlerts: number;
  highAlerts: number;
  openITSMTickets: number;
  automationSuccess: string;
  avgMTTR: string;
}

export class TopCriticalAlertsViewData {
  loader: string = 'publicCloudCriticalAlertsLoader';
  alertList: TopCriticalAlertsList[] = [];
}

export class TopCriticalAlertsList {
  id: number;
  deviceName: string;
  severity: string;
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
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
