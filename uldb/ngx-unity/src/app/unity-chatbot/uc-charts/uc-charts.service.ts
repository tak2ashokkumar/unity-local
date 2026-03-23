import { Injectable } from '@angular/core';
import { UnityChatBotResponseChartData } from '../unity-chatbot.type';
import { UnityChartConfigService, UnityChartDataType, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class UcChartsService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  convertToPieChartViewData(responseData: UnityChatBotResponseChartData, type?: string): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.PIE;
    view.options = this.chartConfigSvc.getDefaultPieChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.PIE);
    let data: UnityChartDataType[] = [];
    Object.keys(responseData.values).forEach(key => {
      data.push({ name: key, value: responseData.values[key] });
    })
    view.options.series[0].data = data;
    view.options.series[0].center = ['50%', '40%'];
    if (data.length > 6) {
      view.options.series[0].radius = '55%';
      view.options.series[0].center = ['50%', '38%'];
    } else if (data.length > 9) {
      view.options.series[0].radius = '50%';
      view.options.series[0].center = ['50%', '36%'];
    }
    if (type && type == 'donut_chart') {
      view.options.series[0].radius = ['40%', '70%'];
    }
    view.options.legend = {
      data: Object.keys(responseData.values),
      orient: 'horizontal',
      icon: 'circle',
      bottom: '0',
      left: 'center',
      width: '98%',
      itemHeight: 8,
      itemWidth: 8,
      selectedMode: 'multiple',
      textStyle: {
        padding: [0, 0, 0, 0],
        overflow: "truncate",
        width: 100
      },
      tooltip: {
        show: true,
        formatter: function (params) {
          return params.name;
        },
        confine: false,
      },
      itemGap: 8,
    }
    view.options.tooltip = {
      trigger: 'item',
      renderMode: 'html',
      appendTo: (chartContainer) => document.body,
      confine: false,
    }
    view.options.series[0].label = {
      ...view.options.series[0].label,
      formatter: function (params: any) {
        return `${params.value}(${params.percent}%)`;
      }
    };
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: '{b} {c} ({d}%)',
    };
    return view;
  }

  convertToBarChartViewData(responseData: UnityChatBotResponseChartData): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultVerticalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    const categories = Object.keys(responseData.values);
    const data = Object.values(responseData.values);
    view.options.xAxis = {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 0,
        fontSize: 12
      }
    };
    view.options.series = [
      {
        name: responseData.y_axis,
        type: 'bar',
        data: data,
        // itemStyle: {
        //   color: '#378AD8'
        // }
      }
    ];
    return view;
  }
}
