import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { ChartData, ChartLegendLabelItem, ChartOptions, ChartTooltipItem } from 'chart.js';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { formatNumber } from '@angular/common';

@Injectable()
export class GreenITService {

  constructor(@Inject(LOCALE_ID) public locale: string) { }

  getDeviceTypeDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'storage': return 'Storage';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      default: return 'N/A';
    }
  }

  getMappingForDeviceType(deviceTYpe: string): DeviceMapping {
    switch (deviceTYpe) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'Firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'Load Balancer': return DeviceMapping.LOAD_BALANCER;
      case 'storage': return DeviceMapping.STORAGE_DEVICES;
      case 'Storage': return DeviceMapping.STORAGE_DEVICES;
      case 'server': return DeviceMapping.BARE_METAL_SERVER;
      case 'Hypervisor': return DeviceMapping.HYPERVISOR;
      case 'Bare Metal': return DeviceMapping.BARE_METAL_SERVER;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'Mac Device': return DeviceMapping.MAC_MINI;
      case 'custom': return DeviceMapping.OTHER_DEVICES;
      case 'Custom': return DeviceMapping.OTHER_DEVICES;
      default: return DeviceMapping.SWITCHES;
    }
  }

  getFormattedNumber(input: number) {
    if (Number.isInteger(input)) {
      return input;
    } else {
      return Number(formatNumber(input, this.locale, '1.0-3'));
    }
  }

  getChartPercentage(input: number, total: number): number {
    if (total) {
      let cal = input / total * 100;
      if (Number.isInteger(cal)) {
        return cal;
      } else {
        return Number(formatNumber(cal, this.locale, '1.0-2'));
      }
    } else {
      return 0;
    }
  }

  getDefaultVerticalBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 20, right: 50, bottom: 50, left: 0 } },
      scales: {
        xAxes: [{
          gridLines: { color: 'rgba(255,255,255,0.1)' },
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: (value, index, values) => {
              if (typeof value === 'string' && value.length > 20) {
                return value.substring(0, 12).concat('...');
              } else {
                return value;
              }
            }
          }
        }]
      },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, padding: 10, usePointStyle: false },
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      elements: {
        point: { radius: 0, hoverRadius: 0 },
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (item: ChartTooltipItem, data: ChartData) => {
            /*
            * "~~" is a bitwise operator which is equal to Math.truncate().
            * It truncates decimal values from a floating point number.  
            */
            return `${item.yLabel} ton`;
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            return data.datasets[item[0].datasetIndex].label;
          },
        }
      },
      plugins: {
        datalabels: {
          align: 'top',
          formatter: (value, context) => {
            if (context.dataset.type) {
              return `${value ? Math.round(value) : ''}`;
            } else {
              return null;
            }
          },
          font: { size: 10 },
        },
      },
      animation: {
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx,
            yaxisScale = chartInstance.scales['y-axis-0'];

          ctx.textBaseline = 'bottom';
          ctx.textAlign = 'center';
          if (yaxisScale && yaxisScale._labelItems && yaxisScale._labelItems.length) {
            ctx.font = `bold ${yaxisScale._labelItems[0].font.string}`;
          }

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var data = dataset.data[index];
              if (data > 0) {
                ctx.fillStyle = '#000000';
                ctx.fillText(data, bar._model.x, bar._model.y + 0);
              }
            });
          });
        }
      }
    };
  }

  getDefaultHorizantalBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 20, right: 50, bottom: 50, left: 0 } },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
          }
        }],
        yAxes: [{
          gridLines: { color: 'rgba(255,255,255,0.1)' },
          ticks: {
            callback: (value, index, values) => {
              if (typeof value === 'string' && value.length > 20) {
                return value.substring(0, 20).concat('...');
              } else {
                return value;
              }
            }
          }
        }]
      },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, padding: 10, usePointStyle: false },
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      elements: {
        point: { radius: 0, hoverRadius: 0 },
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (item: ChartTooltipItem, data: ChartData) => {
            /*
            * "~~" is a bitwise operator which is equal to Math.truncate().
            * It truncates decimal values from a floating point number.  
            */
            return `${item.xLabel} ton`;
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            return data.datasets[item[0].datasetIndex].label;
          },
        }
      },
      plugins: {
        datalabels: {
          align: 'top',
          formatter: (value, context) => {
            if (context.dataset.type) {
              return `${value}`;
            } else {
              return null;
            }
          },
          font: { size: 10 }
        },
      },
      animation: {
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx,
            xaxisScale = chartInstance.scales['x-axis-0'];

          ctx.textBaseline = 'bottom';
          ctx.textAlign = 'center';
          if (xaxisScale && xaxisScale._labelItems && xaxisScale._labelItems.length) {
            ctx.font = `bold ${xaxisScale._labelItems[0].font.string}`;
          }

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var data = dataset.data[index];
              if (data > 0) {
                ctx.fillStyle = '#000000';
                ctx.fillText(data, bar._model.x + 19, bar._model.y + 8);
              }
            });
          });
        }
      }
    };
  }

  getDefaultPieChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: 0 },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 20, padding: 20, usePointStyle: true },
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (item: ChartTooltipItem, data: ChartData) => {
            return `${~~data.datasets[0].data[item.index]}%`
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            return data.labels[item[0].index].toString()
          },
        }
      },
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            return `${~~value}`;
          },
          font: { size: 10 },
          color: '#fff'
        },
        outlabels: {
          display: false
        }
      },
    }
  }
}

export const currentMonthLabel: string = 'Current';

export enum ChartIntervelOptions {
  MONTH = 'By Month',
  QUARTER = 'By Quarter'
}
