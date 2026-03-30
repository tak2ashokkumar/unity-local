import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import * as echarts from 'echarts';
import { MetricsType, ResourceSummaryType } from '../../naci-chatbot/naci-chatbot.type';

@Injectable()
export class RusVerifyAndAuditStepService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  convertToResourceUtilizationChartData(graphData: ResourceSummaryType): ResourceUtilizationWidgetViewData {
    if (Object.keys(graphData).length == 0) {
      return;
    }
    let viewData: ResourceUtilizationWidgetViewData = new ResourceUtilizationWidgetViewData();
    viewData.cpuChartData = graphData?.total_cpu_usage ? this.getResourceUtlizationChartData('CPU Usage', parseFloat(graphData?.total_cpu_usage)) : null;
    viewData.memoryChartData = graphData?.total_memory_usage ? this.getResourceUtlizationChartData('Memory Usage', parseFloat(graphData?.total_memory_usage)) : null;
    return viewData;
  }

  getResourceUtlizationChartData(resourceName: string, utilizedValue: number) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.GUAGE;
    view.options = this.chartConfigSvc.getDefaultGaugeChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.GUAGE);
    const tooltipText = resourceName.split(" ")[0] == 'CPU' ? 'CPU Used' : 'Memory Used';
    view.options.title = {};
    view.options.series = [
      // OUTER GAUGE ARC
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: '80%',
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 12,
            color: [
              [utilizedValue / 100, '#0cbb70'],
              [1, '#8f9ba6']
            ]
          }
        },
        axisLabel: {
          distance: -35,
          formatter: (value: number) => {
            if (value === 0) return '{start|0%}';
            if (value === 100) return '{end|100%}';
            return '';
          },
          rich: {
            start: {
              padding: [40, 0, 0, 0],
              fontSize: 17,
              color: '#2f353a'
            },
            end: {
              padding: [40, -23, 0, 0],
              fontSize: 17,
              color: '#2f353a'
            }
          }
        },
        tooltip: {
          show: true,
          formatter: (params: any) => {
            return `${tooltipText}: ${params.value}%`;
          }
        },
        pointer: {
          show: true,
          icon: 'circle',
          length: '50%',
          width: 18,
          offsetCenter: [0, -84],
          itemStyle: {
            color: '#ffffff',
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 15,
            shadowColor: 'rgba(0,0,0,0.15)'
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        detail: { show: false },
        data: [{ value: utilizedValue }]
      },

      // INNER WHITE CIRCLE
      {
        type: 'pie',
        radius: ['0%', '60%'],
        silent: true,
        itemStyle: {
          color: '#ffffff',
          shadowBlur: 25,
          shadowColor: 'rgba(0,0,0,0.15)'
        },
        label: { show: false },
        data: [1]
      }
    ]
    view.options.graphic = [
      {
        type: 'text',
        left: 'center',
        top: '41%',
        z: 100,
        style: {
          text: `${utilizedValue}%`,
          fontSize: 32,
          fontWeight: 'bold',
          align: 'center'
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '55%',
        z: 100,
        style: {
          text: `${resourceName}`,
          fontSize: 10,
          fontWeight: 'bold',
          align: 'center'
        },
      }
    ];
    return view;
  }

  convertToInterfaceChartData(data: MetricsType[]): UnityChartDetails[] {
    let viewData: UnityChartDetails[] = []
    const interfaceData = data?.find(d => d.metric_type == 'interface_data');
    interfaceData?.metrics_data?.forEach(md => {
      viewData.push(this.getInterfaceChartData(md));
    })
    return viewData;
  }

  getInterfaceChartData(data: any): UnityChartDetails {
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
      axisLine: {
        show: true
      },
      splitLine: {
        show: true,
        lineStyle: {
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
    return view;
  }
}

export class ResourceUtilizationWidgetViewData {
  cpuChartData: UnityChartDetails;
  memoryChartData: UnityChartDetails;
}

export class InterfaceWidgetViewData {
  chartData: UnityChartDetails[] = [];
}