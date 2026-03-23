import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import * as echarts from 'echarts';

@Injectable()
export class CdhVerifyAndAuditStepService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  convertToDeviceHealthSummaryViewData(data): DeviceHealthSummaryViewData {
    let viewData: DeviceHealthSummaryViewData = new DeviceHealthSummaryViewData();
    viewData.cpu = data?.cpu;
    viewData.memory = data?.memory;
    viewData.uptime = data?.uptime;
    viewData.latency = data?.latency;
    viewData.bandwidth = data?.bandwidth;
    viewData.interfaceError = data?.interface_error;
    return viewData;
  }

  convertToDeviceHealthMetricWidgetViewData(data: any): DeviceHealthMetricWidgetViewData {
    let viewData: DeviceHealthMetricWidgetViewData = new DeviceHealthMetricWidgetViewData();
    data.forEach(d => {
      d.metrics_data.forEach(md => {
        viewData.chartData.push(this.convertToMetricChartData(md, d.metric_type));
      })
    })
    return viewData;
  }

  convertToMetricChartData(data: any, metricType: string): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.title = {
      text: `${data.item_name}`,
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.tooltip = {
      trigger: 'axis',
      formatter: function (params: any) {
        const item = params[0];
        const time = echarts.time.format(item.axisValue, '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        return `${time}<br/>${item.data[1]} ${data.units}`;
      }
    }
    view.options.grid = {
      left: "3%",
      right: "4%",
      top: "15%",
      bottom: "5%",
      containLabel: true
    }
    view.options.legend = {
      show: false
    }
    view.options.xAxis = {
      type: 'time',
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 10,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR(),
        rotate: 45,
        formatter: (value: number) => {
          return echarts.time.format(value, '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        }
      },
    }
    view.options.yAxis = {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#ccc'
        }
      },
      axisLabel: {
        formatter: (value) => `${value} ${data.units}`
      }
    }
    view.options.series = [
      {
        type: 'line',
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#3B82F6'
        },
        data: data?.history?.map(d => [d.clock, d.value]),
      }
    ]
    if (metricType == 'cpu_data' || metricType == 'memory_data') {
      let series = (view.options.series[0] as echarts.LineSeriesOption);
      series.areaStyle = { opacity: 0.15 };
      series.itemStyle = { color: '#3B82F6' };
      series.symbol = 'circle';
      series.symbolSize = 6;
    }
    return view;
  }
}

export class DeviceHealthSummaryViewData {
  constructor() { }
  cpu: string;
  memory: string;
  uptime: string;
  latency: string;
  bandwidth: string;
  interfaceError: string;
}

export class DeviceHealthMetricWidgetViewData {
  constructor() { }
  chartData: UnityChartDetails[] = [];
}