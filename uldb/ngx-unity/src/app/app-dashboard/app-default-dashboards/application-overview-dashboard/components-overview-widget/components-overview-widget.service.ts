import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EChartsOption, SeriesOption } from 'echarts';
import moment from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import { PCFastData } from 'src/app/app-home/infra-as-a-service/private-cloud/pc-fast.type';
import { AppUtilityService, DateRange, PlatFormMapping, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DurationDropdownType } from 'src/app/shared/SharedEntityTypes/dashboard/iot-devices-summary-dashboard.type';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class ComponentsOverviewWidgetService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private chartConfigSvc: UnityChartConfigService,) { }

  getResponseTimeData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  converteDropdownsDataToApiParamsData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): HttpParams {
    let params: HttpParams = new HttpParams();
    // append app_ids

    if (selectedApps) {
      params = params.append('app_id', selectedApps.toString());
    }
    params = params.set('key', key);
    params = params.set('type', type);
    const format = new DateRange().format;
    const from = dropdownsViewData?.from;
    const to = dropdownsViewData?.to;
    if (from) {
      params = params.set('from', moment(from).format(format));
    }
    if (to) {
      params = params.set('to', moment(to).format(format));
    }
    return params;
  }

  convertToComponentDoughnutChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, type?: string) {
    if (!apps) {
      return null;
    }

    // const appData = apps.find((app: any) => app.data);  // Find the first app with data
    // if (!appData) {
    //   return null;
    // }

    const upCount = apps.find((item: any) => item.hasOwnProperty('up_count'))?.up_count || 0;
    const downCount = apps.find((item: any) => item.hasOwnProperty('down_count'))?.down_count || 0;
    const unknownCount = apps.find((item: any) => item.hasOwnProperty('unknown_count'))?.unknown_count || 0;

    // Calculate the total combined count
    const totalCount = upCount + downCount + unknownCount;

    // Return doughnut chart view data
    return this.convertToHalfDoughnutChartViewData(upCount, downCount, unknownCount, totalCount);
  }

  convertToHalfDoughnutChartViewData(upCount: number, downCount: number, unknownCount: number, totalCount: number) {
    let view: UnityChartDetails = new UnityChartDetails();

    const total = upCount + downCount + unknownCount;

    const hasData = total > 0;

    // For tooltip: skip dummy or empty slices
    const tooltipFormatter = (params: any) => {
      if (!params.name) return '';
      return `${params.name}: ${params.value} (${params.percent}%)`;
    };

    const dataSeries = hasData
      ? [
        { value: upCount, name: 'Up', itemStyle: { color: '#28a745' } },
        { value: downCount, name: 'Down', itemStyle: { color: '#007bff' } },
        { value: unknownCount, name: 'Unknown', itemStyle: { color: '#ffc107' } },
        { value: total, name: '', itemStyle: { color: 'transparent' } } // dummy slice
      ]
      : [
        { value: 1, name: '', itemStyle: { color: '#e0e0e0' } } // empty gray semicircle
      ];

    view.options = {
      title: [
        {
          text: 'Component Health',
          left: 'center',
          top: '5%',
          textStyle: { fontSize: 16, fontWeight: 'bold' },
        },
        {
          text: totalCount.toString(),
          subtext: 'Total Count',
          left: 'center',
          top: '60%',
          textStyle: { fontSize: 20, fontWeight: 'bold' },
          subtextStyle: { fontSize: 12 }
        }],
      tooltip: { trigger: 'item', formatter: tooltipFormatter },
      legend: {
        orient: 'vertical',
        left: 'right',
        top: 'middle',
        data: ['Up', 'Down', 'Unknown'],
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 14 }
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['50%', '70%'],
          startAngle: 180,
          avoidLabelOverlap: false,
          label: { show: false },
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
          data: dataSeries
        }
      ]
    };

    return view;
  }

  convertToComponentChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, graphName: string, type?: string) {
    if (!apps) {
      return null;
    }

    const allServices = apps.flatMap(app => app.services || []);
    if (!allServices.length) {
      return null;
    }

    // Use the first service to build X-axis (assuming ranges are consistent)
    const xAxisData: string[] = allServices[0].data.map(d => d.range);

    // Service names
    const names: string[] = allServices.map(s => s.service);

    // Color palette (rotate if more than palette size)
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);

    // Values: each service’s averages
    const values: number[][] = allServices.map(s =>
      s.data.map(d => d.average)
    );

    // Build a single chart
    if (type == 'line') {
      return this.convertToAreaChartViewData(
        xAxisData,
        yAxisLabelName,
        values,
        names,
        colors,
        true,
        graphName,
      );
    } else if (type == 'bar') {
      return this.convertToBarChartViewData(
        xAxisData,
        yAxisLabelName,
        xAxisLabelName,
        values,
        names,
        colors,
      );
    }
  }

  convertToAreaChartViewData(xAxisData: string[], yAxisLabelName: string, values: number[][], names: string[], colors: string[], smoothLines: boolean, graphName: string) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.options = this.getLineChartOptions(xAxisData);

    if (names?.length && values?.length) {
      view.options.series = names.map((name, index) => ({
        name,
        type: 'line',
        data: values[index],
        smooth: smoothLines,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: colors[index],
          shadowColor: colors[index],
          shadowBlur: 8
        },
        areaStyle: {
          color: colors[index],
          opacity: 0.35
        },
        lineStyle: {
          width: 2,
          color: colors[index]
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 12,
            shadowColor: colors[index]
          }
        }
      }));

      view.options.legend = {
        type: 'scroll',
        data: names,
        bottom: 0,
        orient: 'horizontal',
        pageIconSize: 10,
        pageTextStyle: {
          color: '#999'
        },
        textStyle: {
          fontSize: 12
        }
      };

    }

    // X-axis (same as line chart)
    view.options.xAxis = {
      type: 'category',
      data: xAxisData,
      name: 'Time',
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    };

    // Y-axis (same as line chart)
    view.options.yAxis = {
      type: 'value',
      name: yAxisLabelName,
      nameLocation: 'middle',
      nameGap: 50,
      min: 0,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    };

    // Title (same as line chart)
    view.options.title = {
      text: graphName ? graphName : (yAxisLabelName ? `${yAxisLabelName} vs Time` : ''),
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    };

    // Grid (same as line chart)
    view.options.grid = {
      left: yAxisLabelName ? 60 : 20,
      right: 20,
      bottom: names.length ? 50 : 20,
      top: 80,
      containLabel: true
    };

    return view;
  }

  convertToBarChartViewData(xAxisData: string[], yAxisLabelName: string, xAxisLabelName: string, values: number[][], names: string[], colors?: string[], max?: number) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;

    view.options = {
      title: {
        text: `${yAxisLabelName} vs Time`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: names,
        bottom: 0
      },
      grid: {
        top: 60,   // give space for title
        left: 50,
        right: 30,
        bottom: 50
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        name: xAxisLabelName,
        nameLocation: 'middle',
        nameGap: 50
      },
      yAxis: {
        type: 'value',
        name: yAxisLabelName,
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        max: max ?? null
      },
      series: names.map((name, idx) => ({
        name,
        type: 'bar',
        data: values[idx],
        itemStyle: {
          color: colors?.[idx] ?? undefined
        },
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top', // show above each bar
          color: '#000',   // optional: set label color
          formatter: (params: any) => params.value === 0 ? '' : params.value
        }
      }))
    };

    return view;
  }

  getLineChartOptions(xAxisData: string[]): EChartsOption {
    return {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          rotate: 35
        }
      },
      yAxis: {
        type: 'value',
        // max: 100,
        // min: 0,
        // axisLabel: {
        //   formatter: '{value}%'
        // }
      },
      grid: {
        left: '10%',
        right: '3%',
        top: '5%',
        bottom: 0,
        containLabel: true
      },
      series: [],
      legend: {}
    }
  }

  getAvailabilityData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  getThroughputData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  convertToApplicationChartViewData(apps: any, dropdownsViewData: DurationDropdownType, yAxisLabelName: string, xAxisLabelName: string, graphName: string) {
    if (!apps) {
      return null;
    }

    const allServices = apps.flatMap(app => app.services || []);
    if (!allServices.length) {
      return null;
    }

    // Use the first service to build X-axis (assuming ranges are consistent)
    const xAxisData: string[] = allServices[0].data.map(d => d.range);

    // Service names
    const names: string[] = allServices.map(s => s.service);

    // Color palette (rotate if more than palette size)
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);

    // Values: each service’s averages
    const values: number[][] = allServices.map(s =>
      s.data.map(d => d.average)
    );

    // Build a single chart
    return this.convertToLineChartViewData(
      graphName,
      xAxisData,
      yAxisLabelName,
      xAxisLabelName,
      values,
      names,
      colors,
    );
  }

  convertToLineChartViewData(graphName: string, xAxisData: string[], yAxisLabelName: string, xAxisLabelName: string, values?: number[][], names?: string[], colors?: string[], smooth?: string, enableGlow?: boolean) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    // view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    view.options = this.getLineChartOptions(xAxisData);
    if (names?.length && values?.length) {
      view.options.series = [];
      let chartSeries: SeriesOption[] = [];
      names.forEach((name, index) => {
        const data: SeriesOption = {
          name: name,
          color: colors[index],
          type: 'line',
          data: values[index],
          smooth: smooth == 'smooth',
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            borderWidth: 0,
          },
          emphasis: enableGlow
            ? {
              scale: true,
              itemStyle: {
                shadowBlur: 15,
                shadowColor: colors[index],
                color: colors[index]
              }
            }
            : undefined,
        }
        chartSeries.push(data);
      });
      view.options.series = chartSeries;
      view.options.legend = {
        type: 'scroll',
        data: names,
        bottom: 0,
        orient: 'horizontal',
        pageIconSize: 10,
        pageTextStyle: {
          color: '#999'
        },
        textStyle: {
          fontSize: 12
        }
      };
      
    }
    view.options = {
      ...view.options,
      title: {
        text: graphName ? graphName : (yAxisLabelName ? `${yAxisLabelName} vs Time` : ''),
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      }
    };
    view.options.xAxis = {
      ...view.options.xAxis,
      type: 'category',
      data: xAxisData,
      name: xAxisLabelName,
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    }
    view.options.yAxis = {
      ...view.options.yAxis,
      type: 'value',
      name: yAxisLabelName,
      nameLocation: 'middle',
      nameGap: 50,
      min: 0,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    };
    view.options.grid = {
      left: yAxisLabelName ? 60 : 20,
      right: 20,
      bottom: names.length ? 50 : 20,
      top: 80,
      containLabel: true
    };
    // max && (view.options.yAxis = { ...view.options.yAxis, min: 0, max: 100 });
    return view;
  }

  getLatencyData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string, type: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsData(dropdownsViewData, selectedApps, key, type);
    return this.http.get<any>(`apm/business_summary/data/`, { params: params });
  }

  getHostOverview(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string): Observable<any> {
    const params = this.converteDropdownsDataToApiParamsForHostData(dropdownsViewData, selectedApps, key);
    return this.http.get<any>(`apm/business_summary/graph/`, { params: params });
  }

  converteDropdownsDataToApiParamsForHostData(dropdownsViewData: DurationDropdownType, selectedApps: number, key: string): HttpParams {
    let params: HttpParams = new HttpParams();
    // append app_ids
    if (selectedApps) {
      params = params.append('app_id', selectedApps.toString());
    }
    params = params.set('graph_type', key);
    const format = new DateRange().format;
    const from = dropdownsViewData?.from;
    const to = dropdownsViewData?.to;
    if (from) {
      params = params.set('from', moment(from).format(format));
    }
    if (to) {
      params = params.set('to', moment(to).format(format));
    }
    return params;
  }

  convertToCpuUtilizationChartViewData(
    devicesArray: any[],
    yAxisLabelName: string,
    xAxisLabelName: string,
    graphName: string
  ) {
    if (!devicesArray || !devicesArray.length) {
      return null;
    }

    // Flatten devices (array of objects → one array of device objects)
    const allDevices = devicesArray.flatMap(deviceGroup =>
      Object.entries(deviceGroup).map(([name, details]) => {
        const deviceDetails = details as any;
        return {
          name,
          ...deviceDetails
        };
      })
    );

    if (!allDevices.length) {
      return null;
    }

    // Use first device to build X-axis (assuming consistent ranges)
    const xAxisData: string[] = allDevices[0].data.map(d => d.range);

    // Device names
    const names: string[] = allDevices.map(d => d.name);

    // Colors (rotating palette)
    const palette = ['#376DF7', '#53B997', '#F8C541', '#A66BF7', '#FF7A59'];
    const colors: string[] = names.map((_, i) => palette[i % palette.length]);

    // Values: each device’s averages
    const values: number[][] = allDevices.map(d =>
      d.data.map((point: any) => point.average)
    );

    // Build area chart
    return this.convertToAreaChartViewData(
      xAxisData,
      yAxisLabelName,
      values,
      names,
      colors,
      true,
      graphName
    );
  }

  getCloudList(appId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('app_id', appId);

    // if (appIdList && appIdList.length) {
    //   appIdList.forEach(id => {

    //   });
    // }

    return this.http.get('/apm/business_summary/cloud_list/', { params });
  }

  getCloudDetails(uuid: string): Observable<any> {
    return this.http.get(`/customer/private_cloud/${uuid}/widget_data/`);
  }

  getAllCloudDetails(uuids: string[]): Observable<any[]> {
    if (!uuids || !uuids.length) {
      return of([]);
    }
    const requests = uuids.map(uuid => this.getCloudDetails(uuid));
    return forkJoin(requests); // run in parallel, emit all results together
  }

  convertToPCFastData(clouds: PrivateCLoudFast[]): PCFastData[] {
    let viewData: PCFastData[] = [];
    clouds.map((cloud: PrivateCLoudFast) => {
      if (cloud.platform_type != PlatFormMapping.CUSTOM &&
        cloud.platform_type != ServerSidePlatFormMapping.HYPER_V) {
        let a: PCFastData = new PCFastData();
        a.id = cloud.id;
        a.name = cloud.name;
        a.uuid = cloud.uuid;
        a.platfromType = cloud.platform_type;
        a.displayPlatformType = cloud.display_platform;
        a.vms = cloud.vms;
        a.datacenter = cloud.colocation_cloud;
        a.drillDownLink = `/unitycloud/pccloud/${cloud.uuid}/summary`;
        a.status = this.utilSvc.getDeviceStatus(cloud.status);
        viewData.push(a);
      }
    })
    return viewData;
  }
}

export class ComponentsOverviewViewData {
  constructor() { }
  healthLoader: string = 'componentsOverviewThroughputLoader';
  durationLoader: string = 'componentsOverviewDurationLoader';
  responseTimeLoader: string = 'componentsOverviewResponseTimeLoader';
  healthAvg: string;
  durationAvg: string;
  responseTimeAvg: string;
  healthChartData: UnityChartDetails;
  durationChartData: UnityChartDetails;
  responseTimeChartData: UnityChartDetails;
}

export class DropDownsViewData {
  constructor() { }
  selectedDateRangeFormData: DurationDropdownType;
}

export class ProcessOverviewViewData {
  constructor() { }
  throughputLoader: string = 'processOverviewThroughputLoader';
  availabilityLoader: string = 'processOverviewAvailabilityLoader';
  responseTimeLoader: string = 'processOverviewResponseTimeLoader';
  throughputAvg: string;
  availabilityAvg: string;
  responseTimeAvg: string;
  throughputChartData: UnityChartDetails;
  availabilityChartData: UnityChartDetails;
  responseTimeChartData: UnityChartDetails;
}

export class DatabaseOverviewViewData {
  constructor() { }
  latencyLoader: string = 'databaseOverviewLatencyLoader';
  latencyAvg: string;
  latencyChartData: UnityChartDetails;
  responseTimeLoader: string = 'databaseOverviewResponseTimeLoader';
  responseTimeAvg: string;
  responseTimeChartData: UnityChartDetails;
  availabilityLoader: string = 'databaseOverviewAvailabilityLoader';
  availabilityAvg: string;
  availabilityChartData: UnityChartDetails;
}

export class HostOverviewViewData {
  constructor() { }
  cpuUtilizationLoader: string = 'databaseOverviewcpuUtilizationLoader';
  memoryUsageLoader: string = 'databaseOverviewmemoryUsageLoader';
  diskInputOutputTimeLoader: string = 'databaseOverviewdiskInputOutputTimeLoader';
  systemLoadTimeLoader: string = 'databaseOverviewsystemLoadTimeLoader';
  cpuUtilizationAvg: string;
  memoryUsageAvg: string;
  diskInputOutputTimeAvg: string;
  systemLoadTimeAvg: string;
  cpuUtilizationChartData: UnityChartDetails;
  memoryUsageChartData: UnityChartDetails;
  diskInputOutputTimeChartData: UnityChartDetails;
  systemLoadTimeChartData: UnityChartDetails;
}
