import { formatNumber } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Chart, ChartData, ChartDataSets, ChartLegendLabelItem, ChartOptions, ChartTooltipItem } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import * as outlabeledPieLabels from 'chartjs-plugin-piechart-outlabels';

import { Color, Label, PluginServiceGlobalRegistrationAndOptions } from 'ng2-charts';

@Injectable({
  providedIn: 'root'
})
export class ChartConfigService {

  constructor(@Inject(LOCALE_ID) public locale: string) { }

  formatValue(input: number | string) {
    if (typeof (input) == 'string') {
      const inputValueArray = input.split(" ");
      input = Number(inputValueArray.getFirst());
    }
    if (input && !Number.isInteger(input)) {
      let formattedValue = formatNumber(input, this.locale, '1.0-3');
      if (formattedValue.includes(',')) {
        return Number(formattedValue.replace(/,/g, ''));
      } else {
        return Number(formattedValue);
      }
    } else {
      return input;
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

  getDefaultLineChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        xAxes: [{
          gridLines: { color: 'rgba(255,255,255,0.1)' },
        }],
        yAxes: [{
          // stacked: true,
          ticks: {
            beginAtZero: true,
            major: {
              enabled: true
            }
          },
          gridLines: { color: 'rgba(255,255,255,0.1)' },
        }]
      },
      elements: { line: { tension: 0, fill: true }, point: { radius: 0, hoverRadius: 0 } },
      legend: {
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      tooltips: { displayColors: false, },
      plugins: {
        datalabels: {
          align: 'top',
          formatter: (value, context) => {
            if (context.dataset.type) {
              return `${value ? ~~value : ''}`;
            } else {
              return null;
            }
          },
          font: { size: 10 },
        },
      },
    }
  }

  getDefaultVerticalBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 20, right: 50, bottom: 50, left: 0 } },
      scales: {
        xAxes: [{
          gridLines: { color: 'rgba(255,255,255,0.1)' },
          ticks: {
            callback: (value, index, values) => {
              if (typeof value === 'string' && value.length > 20) {
                return value.substring(0, 12).concat('...');
              } else {
                return value;
              }
            }
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
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
      plugins: {
        datalabels: {
          align: 'top',
          formatter: (value, context) => {
            return context.dataset.type ? `${value ? ~~value : ''}` : '';
          },
          font: { size: 10 },
        },
      },
      animation: {
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx,
            yaxisScale = chartInstance.scales['y-axis-0'];
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = 'black';
          if (yaxisScale && yaxisScale._labelItems && yaxisScale._labelItems.length) {
            ctx.font = `${yaxisScale._labelItems[0].font.string}`;
          }

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var data = dataset.data[index];
              if (data > 0) {
                ctx.fillText(data, bar._model.x, bar._model.y - 2);
              }
            });
          });
        }
      }
    };
  }

  getDefaultVerticalstackedBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 20, right: 50, bottom: 50, left: 0 } },
      scales: {
        xAxes: [{ gridLines: { color: 'rgba(255,255,255,0.1)' } }],
        yAxes: [{
          ticks: {
            callback: (value, index, values) => {
              return `$${value}`;
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
            return `$${~~item.yLabel}`;
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
              return `$${value}`;
            } else {
              return null;
            }
          },
          font: { size: 10 }
        },
      },
    };
  }

  getDefaultHorizantalBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
          }
        }],
        yAxes: [{
          gridLines: { color: 'rgba(255,255,255,0.1)' },
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
      plugins: {
        datalabels: {
          align: 'top',
          formatter: (value, context) => {
            return context.dataset.type ? `${value ? ~~value : ''}` : '';
          },
          font: { size: 10 },
          color: '#fff'
        },
      },
      animation: {
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx,
            xaxisScale = chartInstance.scales['x-axis-0'];

          ctx.textAlign = 'bottom';
          ctx.textBaseline = 'bottom';
          if (xaxisScale && xaxisScale._labelItems && xaxisScale._labelItems.length) {
            ctx.font = `bold ${xaxisScale._labelItems[0].font.string}`;
          }

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var data = dataset.data[index];
              if (data > 0) {
                ctx.fillText(data, bar._model.x - 15, bar._model.y + 8);
              }
            });
          });
        }
      }
    };
  }

  getDefaultHorizantalStackedBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 20, right: 0, bottom: 10, left: 0 } },
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
          },
          // gridLines: { drawBorder: false, },
        }],
        yAxes: [{
          stacked: true,
          gridLines: { color: 'rgba(255,255,255,0.1)', display: false, },
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
      tooltips: {},
      elements: {
        point: { radius: 0, hoverRadius: 0 },
      },
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            return `${value ? ~~value : ''}`;
          },
          font: { size: 10 },
          color: '#fff'
        }
      },
    };
  }

  getDefaultRadarChartOptions(pluginType?: string): ChartOptions {
    return {
      scale: {
        ticks: {
          display: false,
          min: 0,
        }
      },
    };
  }

  getDefaultPieChartOptions(pluginType?: string): ChartOptions {
    let options: ChartOptions = {
      responsive: true,
      layout: { padding: 0 },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 20, padding: 20, usePointStyle: true },
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      tooltips: {},
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            return `${value ? ~~value : ''}`;
          },
          font: { size: 10 },
          color: '#fff'
        },
        textInside: {
          text: "GeeksforGeeks",
          color: 'green',
          fontSize: 28
        }
      }
    }

    switch (pluginType) {
      case ChartPluginTypes.outLabels:
        options.layout = { padding: { top: 30, right: 30, bottom: 30, left: 0 } };
        options.plugins = {
          datalabels: {
            formatter: (value, context) => {
              return '';
            },
          },
          outlabels: {
            display: true,
            text: '%v',
            color: '#000000',
            backgroundColor: null,
            borderWidth: 0,
            borderRadius: 0,
            stretch: 10,
            lineColor: '#000000',
            lineWidth: 1,
            font: {
              minSize: 12,
              maxSize: 14,
            },
            padding: 0,
            percentPrecision: 2,
            valuePrecision: 2,
          }
        }
        break;
      default:
        options.plugins.outlabels = {
          display: false
        }
        break;
    }

    return options;
  }

  getLegendLabels(chart: Chart, labelWidth: number): ChartLegendLabelItem[] {
    let legendLabels: ChartLegendLabelItem[] = [];
    var data = chart.data;
    if (data.labels.length && data.datasets.length) {
      return data.labels.map(function (label, i) {
        var meta = chart.getDatasetMeta(0);
        var ds = data.datasets[0];
        var arc = meta.data[i];
        // var custom = arc && arc.custom || {};
        var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
        var arcOpts = chart.options.elements.arc;
        var fill = getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
        var stroke = getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
        var bw = getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

        // We get the value of the current label
        var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];
        label = <string>label;
        return <ChartLegendLabelItem>{
          // Instead of `text: label,`
          // We add the value to the string
          text: label.length > 30 ? label.substring(0, 27).concat('...') : label,
          fillStyle: fill,
          // strokeStyle: stroke,
          // lineWidth: bw,
          // hidden: ds.data[i] || meta.data[i].hidden,
          index: i
        };
      });
    } else {
      return legendLabels;
    }
  }

  textAtCenterOfPieChartPlugin(items: Array<{ text: string, fontSize: string }>): PluginServiceGlobalRegistrationAndOptions {
    return {
      beforeDraw(chart) {
        const ctx = chart.ctx;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
        items.forEach((item, index) => {
          ctx.font = `${item.fontSize} Arial`;
          ctx.fillText(item.text, centerX, (centerY - (10 - index * 20)));
        })
      }
    }
  }
}

export class UnityChartData {
  constructor() { }
  type: string;
  lables: Label[] = [];
  options: ChartOptions;
  bardata?: ChartDataSets[] = [];
  outlabeledPiedata?: ChartDataSets[] = [];
  piedata?: number[] = [];
  linedata?: ChartDataSets[] = [];
  colors: Color[] = [];
  legend: boolean = false;
  plugins: any[] = [pluginDataLabels, outlabeledPieLabels];
  datasets?: ChartDataSets[] = [];
  numberData?: number[] = [];
  customPlugin: any;
}

export const DEFAULT_CHART_COLOR: string = '#008AD7';
export const DEFAULT_BAR_THICKNESS: number = 40;

export const VARIANTS_OF_BLUE: string[] = [
  '#004589',
  '#008AD7',
  '#006EAC',
  '#1684C2',
  '#0080FF',
  '#00588A',
  '#5CB4E5',
  '#0092F2',
  '#00466E',
  '#89C4FF',
  '#4682B4'
];

export const VARIANTS_OF_RED: string[] = [
  '#CC0000',
  '#D21F1F',
  '#D83D3D',
  '#DE5C5C',
  '#E47A7A',
  '#EB9999',
  '#F1B8B8',
  '#F7D6D6',
];

export enum ChartPluginTypes {
  outLabels = 'outLabels',
}