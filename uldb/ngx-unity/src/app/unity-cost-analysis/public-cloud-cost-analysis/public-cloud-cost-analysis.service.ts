import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Label } from 'ng2-charts';
import { ChartOptions, ChartTooltipItem, ChartData, ChartLegendLabelItem } from 'chart.js';

@Injectable()
export class PublicCloudCostAnalysisService {

  constructor() { }

  getLastNMonths(numberOfMonths: number): any[] {
    var months = [];
    for (var i = 0; i < numberOfMonths; i++) {
      let month = moment().subtract(i, "month").startOf("month").format('MMM-YY');
      months.push(month == moment().format('MMM-YY') ? currentMonthLabel : month);
    }
    return months.reverse();
  }

  getLastNQuarters(numberOfQuarters: number) {
    var quarters = [];
    for (var i = 0; i < numberOfQuarters; i++) {
      var obj = moment().subtract(i, 'quarter');
      quarters.push(obj.quarter() == moment().quarter() ? currentMonthLabel : `Q${obj.quarter()}-${obj.year()}`);
    }
    return quarters.reverse();
  }

  getMonthsByQuarter(quarter: string) {
    let quarterNumber: number = quarter == currentMonthLabel ? moment().quarter() : Number(quarter.split('-').getFirst().slice(1));
    let months = [];
    let quarterStart = moment().quarter(quarterNumber).startOf('quarter').get('M');
    let quarterEnd = moment().quarter(quarterNumber).endOf('quarter').get('M');
    for (let k = quarterStart; k <= quarterEnd; k++) {
      if (k == moment().month()) {
        months.push(currentMonthLabel);
        break;
      } else {
        months.push(moment.monthsShort(k));
      }
    }
    return months;
  }

  getPreviousMonth() {
    return moment().subtract(1, "month").format('MMM');
  }

  getChartLables(viewType: string): Label[] {
    if (viewType == ChartIntervelOptions.MONTH) {
      return this.getLastNMonths(13);
    } else {
      return this.getLastNQuarters(4);
    }
  }

  getDefaultBarChartOptions(): ChartOptions {
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
            return `$${data.datasets[0].data[item.index]}`
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            return data.labels[item[0].index].toString()
          },
        }
      },
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            return `$${value}`;
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

export enum CloudCostColorByCloud {
  AWS = '#FF9900',
  Azure = '#008AD7',
  GCP = '#34A853',
  OCI = '#C74634'
}

export const currentMonthLabel: string = 'Current';

export enum ChartIntervelOptions {
  MONTH = 'By Month',
  QUARTER = 'By Quarter'
}

export const costByServiceChartColors: string[] = [
  '#ff9f1c',
  '#2ec4b6',
  '#e71d36',
  '#90e0ef',
  '#03045e',
  '#0077b6',
  '#00b4d8',
  '#ffbd00',
  '#9e0059',
  '#ff0054',
  '#ff5400',
  '#023e7d',
  '#0466c8',
  '#0353a4',
  '#177e89',
  '#084c61',
  '#461220',
  '#8c2f39',
  '#fcb9b2',
  '#2b9348',
  '#55a630',
  '#80b918',
  '#6c757d',
  '#ced4da',
  '#FF4500',
  // '#14946b',
  // '#58585a',
  // '#93cfa3',
  // '#056839'
];
