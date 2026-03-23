import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Subject } from 'rxjs';
import { WidgetDatasetWithDataTypes } from '../../custom-dashboard.type';

@Component({
  selector: 'custom-dashboard-widget-dataset',
  templateUrl: './custom-dashboard-widget-dataset.component.html',
  styleUrls: ['./custom-dashboard-widget-dataset.component.scss']
})
export class CustomDashboardWidgetDatasetComponent implements OnInit, OnDestroy {
  @Input() data: WidgetDatasetWithDataTypes;
  viewAllLegend: boolean = false;
  private ngUnsubscribe = new Subject();

  xAxisIndex: number[] = [];
  lineChartlabels = [];

  lineChartDatasets =
    [{
      data: [],
      borderWidth: 1,
      fill: true,
      lineTension: 0.3,
      pointRadius: true,
      pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-400'),
      pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-400'),
      // backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-300'),
      borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-500')
    }];

  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: { display: false },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    tooltips: {
      enabled: true,
      mode: 'label',
      callbacks: {
        label: function (tooltipItems, data) {
          if (Number(tooltipItems.yLabel) % 1) {
            return `${Number(tooltipItems.yLabel).toFixed(2)}`
          } else {
            return `${tooltipItems.yLabel}`;
          }
        }
      }
    },
    scales: {
      xAxes: [{
        type: 'time',
        distribution: 'series',
        time: {
          unit: 'minute',
          displayFormats: {
            quarter: 'MMM YYYY'
          }
        },
        gridLines: {
          display: true,
          drawOnChartArea: false,
          drawTicks: false
        },
        ticks: {
          autoSkip: false,
          major: { enabled: false },
          source: 'data',
          callback: (value, index, values) => {
            if (this.xAxisIndex.includes(index)) {
              let d = new Date((<any>values[index]).value)
              return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
            }
          },
          maxRotation: 0,
          padding: 10
        }
      }],
      yAxes: [{
        ticks: {
          autoSkip: true,
          major: {
            enabled: true
          },
          callback: (value, index, values) => {
            return `${value} ${this.data.data.unit[0]}`;
          },
          padding: 10
        },
        gridLines: {
          display: true,
          drawOnChartArea: false,
          drawTicks: false,
        },
      }]
    },
    plugins: {
      datalabels: {
        display: false
      }
    },
  }

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      let ctx = (<HTMLCanvasElement>document.getElementById('chart-id-' + this.data.dataset_name)).getContext("2d");
      let gradient = ctx.createLinearGradient(0, 0, 0, 225);
      gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--primary-300'));
      // gradient.addColorStop(0, '#378ad8bb');
      gradient.addColorStop(1, 'white');

      if (this.data.data) {
        this.lineChartDatasets[0]['backgroundColor'] = gradient;
        // this.lineChartlabels = this.data.data.x_axis.length ? this.getEquallySpacedValues : [];
        // this.lineChartDatasets[0].data = this.data.data.y_axis.length ? this.getEquallySpacedValues(this.data.data.y_axis, 6) : [];
        this.xAxisIndex = this.data.data.x_axis.length ? this.getEquallySpacedValues(this.data.data.x_axis, 12) : []
        this.data.data.x_axis.forEach((element, i) => {
          this.lineChartDatasets[0].data.push({ x: element, y: this.data.data.y_axis[i] ? this.data.data.y_axis[i] : 0 })
        });
        if (Math.max(...this.data.data.y_axis) == Math.min(...this.data.data.y_axis)) {
          this.lineChartOptions.scales.yAxes[0].ticks.beginAtZero = true;
        }
      }
    }, 100);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getEquallySpacedValues(array: any, count: number) {
    let last = array.length - 1;
    let values = new Array();
    for (let i = 0; i < count - 1; i++) {
      let index = Math.floor(i * array.length / (count - 1));
      if (!values.includes(index) && index != last) {
        values.push(index);
      }
    }
    return values.concat(last);
  }
}
