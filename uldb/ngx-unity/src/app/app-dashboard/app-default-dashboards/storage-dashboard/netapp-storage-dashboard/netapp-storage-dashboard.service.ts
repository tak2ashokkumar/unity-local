import { Injectable } from '@angular/core';
import { EChartsOption } from 'echarts';

@Injectable()
export class NetappStorageDashboardService {
  makeBarOption(labels: string[], values: number[], color = '#378AD8', horizontal = false): EChartsOption {
    return horizontal
      ? {
          tooltip: { trigger: 'axis' },
          grid: { left: 60, right: 16, top: 20, bottom: 20 },
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: labels },
          series: [{ type: 'bar', data: values, itemStyle: { color } }]
        }
      : {
          tooltip: { trigger: 'axis' },
          grid: { left: 36, right: 16, top: 20, bottom: 28, containLabel: true },
          xAxis: { type: 'category', data: labels },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: values, itemStyle: { color } }]
        };
  }

  makeLineOption(labels: string[], values: number[], color = '#00b050'): EChartsOption {
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 16, top: 20, bottom: 28, containLabel: true },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, data: values, symbolSize: 8, lineStyle: { color }, itemStyle: { color } }]
    };
  }

  makePieOption(labels: string[], values: number[], colors: string[] = ['#00b050', '#fd7e14', '#dc3545']): EChartsOption {
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: '65%',
          data: labels.map((name, index) => ({
            name,
            value: values[index],
            itemStyle: { color: colors[index % colors.length] }
          }))
        }
      ]
    };
  }
}
