import { Injectable } from '@angular/core';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import * as echarts from 'echarts';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';

@Injectable()
export class MonitoringVerifyAndAuditStepService {

  constructor(private chartConfigSvc: UnityChartConfigService) { }

  convertToVerifyAndAuditViewData(data: any) {
    let viewData: MonitoringMetricWidgetViewData = new MonitoringMetricWidgetViewData();
    const metrics = data?.data?.metrics || [];
    metrics.forEach(metric => {
      metric.metrics_data.forEach(item => {
        const chart = this.convertHistoryToChart(item);
        viewData.chartData.push(chart);
      });
    });
    return viewData;
  }

  convertHistoryToChart(metricItem: any): UnityChartDetails {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);
    view.options.title = {
      text: `${metricItem.item_name}`,
      left: 'center',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 14,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR()
      }
    };
    view.options.grid = {
      left: '3%',
      right: '4%',
      bottom: '8%',
      containLabel: true
    };
    view.options.tooltip = {
      trigger: 'axis',
      formatter: function (params: any) {
        const item = params[0];
        const time = echarts.time.format(item.axisValue, '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        return `${time}<br/>${item.data[1]} ${metricItem.units}`;
      }
    };
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
    };
    view.options.yAxis = {
      type: 'value',
      nameLocation: 'middle',
      nameGap: 45,
      axisLine: {
        lineStyle: {
          color: '#0c0c0cff'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: (value) => `${value} ${metricItem.units}`
      }
    };
    view.options.series = [
      {
        name: metricItem.item_name,
        type: 'line',
        data: metricItem?.history?.map(d => [d.clock, d.value]),
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#3B82F6'
        },
        itemStyle: {
          color: '#3B82F6'
        },
        areaStyle: {
          opacity: 0.15
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ];

    return view;
  }

  isSameDay(history: any[]) {
    if (!history.length) return true;
    const first = new Date(history[0].clock).toDateString();
    return history.every(
      h => new Date(h.clock).toDateString() === first
    );
  }

}

export class MonitoringMetricWidgetViewData {
  constructor() { }
  chartData: UnityChartDetails[] = [];
}