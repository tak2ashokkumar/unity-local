import { TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { AppDashboardWidgetType } from '../app-dashboard.type';

@Injectable()
export class AppDashboardViewService {

  constructor(private http: HttpClient,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,
    private appSvc: AppLevelService,
    private titleCasePipe: TitleCasePipe) { }

  syncWidgetsData(dashboardId: string) {
    return this.http.get<CeleryTask>(`/customer/persona/dashboards/${dashboardId}/widgets/sync_widget_data/`)
      .pipe(switchMap(res => this.appSvc.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }

  getDashboardWidgets(dashboardId: string): Observable<AppDashboardWidgetType[]> {
    return this.http.get<AppDashboardWidgetType[]>(`/customer/persona/dashboards/${dashboardId}/widgets/?page_size=0`).pipe(
      map((res: AppDashboardWidgetType[]) => {
        return res.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      })
    );
  }

  getWidgetChartData(widget: AppDashboardWidgetType) {
    switch (widget.widget_type) {
      case 'host_availability': return of(this.updateHostAvailabilityWidget(widget));
      case 'private_cloud': return of(this.updatePrivateCloudWidget(widget));
      case 'public_cloud': return of(this.updatePublicCloudWidget(widget));
      case 'infra_summary': return of(this.updateInfraSummaryWidget(widget));
      case 'cloud_cost':
        widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
        widget.chartData = this.convertToNightingaleChartData(widget);
        return of(widget);
      case 'alerts':
        widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
        widget.chartData = this.convertToNightingaleChartData(widget);
        return of(widget);
      case 'sustainability':
        widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
        widget.chartData = this.convertToNightingaleChartData(widget);
        return of(widget);
      case 'monitoring': return of(this.updateMonitoringWidget(widget));
      case 'device_by_os': return of(this.updateDeviceByOSWidget(widget));
      default:
        return of(widget);
    }
  }

  updateHostAvailabilityWidget(widget: AppDashboardWidgetType) {
    widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
    switch (widget.group_by) {
      case 'status':
        widget.chartData = this.convertToHostAvailabilityChartData(widget);
        widget.customLegends = false;
        break;
      default:
        widget.customLegends = true;
        widget.chartData = this.convertToHostAvailabilityChartData(widget);
        break;
    }
    return widget;
  }

  convertToHostAvailabilityChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    if (widget.customLegends) {
      view.options.series[0].center = ['50%', '50%']
      view.options.legend = {
        show: false
      }
      view.options.graphic = Object.assign(view.options.graphic, {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: '43%',
            style: {
              text: 'Total',
              fontSize: 15,
              fill: '#666',
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '52%',
            style: {
              text: `${widget.totalCount}`,
              fontSize: 15,
              fill: '#666',
            }
          }
        ]
      })
    }
    return view;
  }

  updatePrivateCloudWidget(widget: AppDashboardWidgetType) {
    widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
    widget.customLegends = true;
    widget.chartData = this.convertToPrivateCloudChartData(widget);
    return widget;
  }
  convertToPrivateCloudChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    if (widget.customLegends) {
      view.options.series[0].center = ['50%', '50%']
      view.options.legend = {
        show: false
      }
      view.options.graphic = Object.assign(view.options.graphic, {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: '43%',
            style: {
              text: 'Total',
              fontSize: 15,
              fill: '#666',
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '52%',
            style: {
              text: `${widget.totalCount}`,
              fontSize: 15,
              fill: '#666',
            }
          }
        ]
      })
    }
    return view;
  }

  updatePublicCloudWidget(widget: AppDashboardWidgetType) {
    widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
    widget.customLegends = true;
    widget.chartData = this.convertToPublicCloudChartData(widget);
    console.log('colors :', widget.chartData.options.color);
    return widget;
  }
  convertToPublicCloudChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    if (widget.customLegends) {
      view.options.series[0].center = ['50%', '50%']
      view.options.legend = {
        show: false
      }
      view.options.graphic = Object.assign(view.options.graphic, {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: '43%',
            style: {
              text: 'Total',
              fontSize: 15,
              fill: '#666',
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '52%',
            style: {
              text: `${widget.totalCount}`,
              fontSize: 15,
              fill: '#666',
            }
          }
        ]
      })
    }
    return view;
  }

  updateInfraSummaryWidget(widget: AppDashboardWidgetType) {
    widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
    widget.customLegends = true;
    widget.chartData = this.convertToInfraSummaryChartData(widget);
    return widget;
  }
  convertToInfraSummaryChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    if (widget.customLegends) {
      view.options.series[0].center = ['50%', '50%']
      view.options.legend = {
        show: false
      }
      view.options.graphic = Object.assign(view.options.graphic, {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: '43%',
            style: {
              text: 'Total',
              fontSize: 15,
              fill: '#666',
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '52%',
            style: {
              text: `${widget.totalCount}`,
              fontSize: 15,
              fill: '#666',
            }
          }
        ]
      })
    }
    return view;
  }

  convertToCloudCostChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    view.options.legend = {
      show: false
    }
    return view;
  }

  convertToAlertsChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    view.options.legend = {
      show: false
    }
    return view;
  }

  convertToSustainabilityChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    view.options.legend = {
      show: false
    }
    return view;
  }

  updateMonitoringWidget(widget: AppDashboardWidgetType) {
    widget.totalCount = widget.data.length ?? 0;
    widget.customLegends = true;
    if (widget.filter_by == 'latest') {
      widget.metricesMappingData = this.convertToMetricesMappingData(widget.data);
    } else {
      widget.metricesMappingData = [];
      widget.chartData = this.convertToLineChartData(widget.data, widget.filter_by, widget.device_type);
    }
    return widget;
  }

  convertToLineChartData(graphData: any, filterType: string, deviceType: string) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    // let data: UnityChartDataType[] = [];

    const legendData: string[] = [];
    // const xAxisSet: Set<string> = new Set(); // Avoid duplicate
    const seriesData: any[] = [];
    graphData?.forEach(dataItem => {
      if (!legendData.includes(dataItem.name)) {
        legendData.push(dataItem.name);
      }

      let Arr = [];
      dataItem.series.forEach(s => {
        // xAxisSet.add(s.timestamp); // Collect unique timestamps        
        const value = Math.round(Number(s[filterType]));
        Arr.push(value);
      });

      let series = {
        name: dataItem.name,
        type: 'line',
        stack: 'Total',
        data: Arr
      }

      seriesData.push(series);
    });

    // Sort x-axis if needed
    // const xAxisdata = [...xAxisSet];
    const xAxisdata = this.trimData(this.getLabels(graphData))

    // Assign chart options
    view.options = {
      ...view.options,
      xAxis: {
        ...view.options.xAxis,
        type: 'category',
        boundaryGap: false,
        data: xAxisdata
      },
      series: seriesData,
      // legend: {
      //   ...view.options.legend,
      //   orient: 'horizontal',
      //   icon: 'circle',
      //   left: 'center',
      //   bottom: '0',
      //   width: '98%',
      //   itemHeight: 8, // Adjusts the marker height
      //   itemWidth: 8, // Adjusts the marker width
      //   selectedMode: false,
      //   textStyle: {
      //     padding: [10, 0, 0, 0],
      //     overflow: "truncate" // "break"
      //   },
      //   itemGap: 10,
      //   data: legendData
      // },
      grid: {
        left: "5%",
        right: "5%",
        bottom: "8%",
        top: "8%",
        containLabel: true
      }
    };

    return view;
  }

  getLabels(data: any[]) {
    let labelArray: any[] = [];
    let date: any = ''
    let labels: any[] = [];
    data.forEach(m => {
      labelArray = [];
      if (m.series && m.series.length) {
        labelArray = m.series.map(d => d.timestamp);
        labels.push(...labelArray);
      }
    });
    // labels = labels.map(label => Number(label)).sort((a, b) => a - b);
    for (let index = 0; index < labels.length; index++) {
      date = new Date(labels[index] * 1000);
      labels[index] = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    labels = Array.from(new Set(labels));
    return labels;
  }

  trimData(data: any[]) {
    const max = 15;
    if (data.length <= max) {
      return data;
    }
    let trimmedData = [];
    const interval = (data.length - 2) / (max - 2);
    trimmedData.push(data[0]);
    for (let i = 1; i < max - 1; i++) {
      const index = Math.round(i * interval);
      trimmedData.push(data[index]);
    }
    trimmedData.push(data[data.length - 1]);
    return trimmedData;
  }

  convertToMetricesMappingData(data: any[]): MetricesMappingViewData[] {
    let viewData: MetricesMappingViewData[] = [];
    data.forEach(device => {
      let view: MetricesMappingViewData = new MetricesMappingViewData();
      view.name = device.device_name;
      if (device.status) {
        view.status = this.utilSvc.getDeviceStatus(device.status);
      } else {
        view.status = 'Not Configured';
      }
      if (device.items.length) {
        device.items.forEach(item => {
          let metric: MetricViewData = new MetricViewData();
          metric.name = item.name;
          metric.value = item.latest_value;
          metric.unit = item.unit;
          view.metrics.push(metric);
        });
      }
      viewData.push(view);
    });
    return viewData;
  }

  convertToMonitoringChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    if (widget.customLegends) {
      view.options.series[0].center = ['50%', '50%']
      view.options.legend = {
        show: false
      }
      view.options.graphic = Object.assign(view.options.graphic, {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: '43%',
            style: {
              text: 'Total',
              fontSize: 15,
              fill: '#666',
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '52%',
            style: {
              text: `${widget.totalCount}`,
              fontSize: 15,
              fill: '#666',
            }
          }
        ]
      })
    }
    return view;
  }

  updateDeviceByOSWidget(widget: AppDashboardWidgetType) {
    widget.totalCount = widget.data?.reduce((a, b) => a + b.count, 0);
    widget.customLegends = true;
    widget.chartData = this.convertToHostAvailabilityChartData(widget);
    return widget;
  }
  convertToDeviceByOSChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = this.convertToNightingaleChartData(widget);
    view.options.legend = {
      show: false
    }
    return view;
  }

  convertToNightingaleChartData(widget: AppDashboardWidgetType) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getNightingalePieChartWithHorizontalLegendsOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    widget.data?.forEach(d => {
      if (d.count !== 0) {
        data.push({ name: d.name, value: d.count });
      }
    });
    data.sort((a, b) => Number(a.value) - Number(b.value));
    view.options.series[0].data = data.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    }));
    view.options.legend = {
      ...view.options.legend,
      orient: 'vertical',
      left: '60%',
      top: 'middle',
      align: 'left',
      width: '100%', // Or try a higher percentage or specific pixel width
      type: 'scroll', // Or 'scroll' if you expect too many items
      pageButtonItemGap: 5,
      pageButtonGap: 10,
      pageButtonPosition: 'end', // or 'start'
      itemWidth: 18, // Optionally control icon size
      formatter: function (name: string) {
        return `${name}`;
      }
    }
    view.options.series[0].center = ['30%', '50%'],
      view.options.series[0].label = {
        ...view.options.series[0].label,
        formatter: function (params: any) {
          return `${params.value}`;
        }
      };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c}',
    };
    view.options.graphic = this.chartConfigSvc.getPieChartCenterDataGraphicOptions(['Total', ` ${widget.totalCount.toFixed(0)}`], ['30%', '50%']);
    return view;
  }

}

export class MetricesMappingViewData {
  constructor() { }
  name: string;
  uuid: string;
  status: string;
  isSelected: boolean = false;
  metrics: MetricViewData[] = [];
}

export class MetricViewData {
  constructor() { }
  name: string;
  value: number;
  unit: string;
}