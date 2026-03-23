import { Injectable } from '@angular/core';
import { ChartData, ChartLegendLabelItem, ChartOptions, ChartTooltipItem } from 'chart.js';


@Injectable()
export class UnityAlertGraphsUtilService {

  constructor() { }

  getDefaultVerticalBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 20, right: 50, bottom: 50, left: 0 } },
      scales: {
        xAxes: [{
          gridLines: { color: 'rgba(255,255,255,0.1)' },
        }],
        yAxes: [{
          ticks: { beginAtZero: true }
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
            return `${item.yLabel} Alerts`;
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            return data.datasets[item[0].datasetIndex].label;
          },
        },
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
          font: { size: 10 },
        },
      },
      animation: {
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var data = dataset.data[index];
              if (data > 0) {
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              }
            });
          });
        }
      }
    };
  }

  getDefaultVerticalStackedBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: { top: 20, right: 50, bottom: 50, left: 0 } },
      scales: {
        xAxes: [{
          gridLines: { color: 'rgba(255,255,255,0.1)' },
        }],
        yAxes: [{
          ticks: { beginAtZero: true },
          stacked: true
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
            return `${item.yLabel} Alerts`;
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
          font: { size: 10, weight: 'bold' },
        },
      },
    };
  }

  getDefaultLineChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: true,
      layout: { padding: { top: 20, right: 50, bottom: 50, left: 0 } },
      scales: {
        yAxes: [
          {
            // scaleLabel: { display: true, labelString: 'Alerts Count' },
            ticks: { beginAtZero: true, precision: 0 },
          }],
        xAxes: [{
          // scaleLabel: { display: true, labelString: 'Hours' },
          ticks: { beginAtZero: true, precision: 0, min: 0 },
          // type: "linear",
          // position: "bottom"
        }]
      },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, padding: 10, usePointStyle: false },
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      elements: { line: { tension: 0, fill: false } },
      tooltips: { displayColors: false, },
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
          font: { size: 10, weight: 'bold' },
        },
      },
    }
  }
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

export enum COLOUR_BY_SEVERITY {
  'Critical' = '#c00',
  'Warning' = '#f80',
  'Information' = '#378ad8'
}
