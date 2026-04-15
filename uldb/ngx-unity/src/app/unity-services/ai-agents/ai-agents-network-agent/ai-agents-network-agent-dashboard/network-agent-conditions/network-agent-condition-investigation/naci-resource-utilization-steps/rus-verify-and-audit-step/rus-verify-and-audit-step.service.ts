import { Injectable } from '@angular/core';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { ResourceSummaryType } from '../../naci-chatbot/naci-chatbot.type';

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
}

export class ResourceUtilizationWidgetViewData {
  cpuChartData: UnityChartDetails;
  memoryChartData: UnityChartDetails;
}