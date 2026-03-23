import { Component, OnInit, Input } from '@angular/core';
import { AwsCloudWatchGraphType } from '../aws-cloud-watch.type';
import { ChartDataSets, ChartOptions } from 'chart.js';
import * as moment from 'moment';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';


@Component({
  selector: 'aws-cloud-watch-graph',
  templateUrl: './aws-cloud-watch-graph.component.html',
  styleUrls: ['./aws-cloud-watch-graph.component.scss']
})
export class AwsCloudWatchGraphComponent implements OnInit {
  @Input() data: AwsCloudWatchGraphType;
  lineChartData: ChartDataSets[] = [];
  chartOptions: ChartOptions;
  lineChartType = 'line';
  lineChartLabels: Label[] = [];


  constructor() { }

  ngOnInit() {
    this.configureGraphData();
  }

  private getRandColor() {
    return "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
  }

  configureGraphData() {
    const color = this.getRandColor();
    this.lineChartData = [
      { data: this.data.Values, fill: false, backgroundColor: color, borderColor: color, pointBackgroundColor: color, pointBorderColor: color },
    ];
    this.lineChartLabels = this.data.Timestamps;
    this.chartOptions = {
      responsive: true,
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: true,
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            callback: (dataLabel, index) => {
              if (index == 0 || index == this.data.Values.length - 1) {
                return moment(dataLabel).format('MM-DD-YYYY');
              } else {
                return moment(dataLabel).format('hh:mm A');
              }
            }
          }
        }],
        yAxes: [{
          display: true,
          ticks: {
            beginAtZero: false
          }
        }]
      },
      plugins: {
        datalabels: {
          display: false
        }
      }
    }
  }



}
