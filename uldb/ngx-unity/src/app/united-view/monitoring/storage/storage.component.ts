import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public doughnutChartData: number[] = [1, 10];
  public doughnutChartLabels: string[] = ['Utilized (TB)', 'Remaining (TB)'];
  public doughnutChartType = 'doughnut';
  public doughnutChartColor: any[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];

  public doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      fullWidth: false,
      display: true,
      labels: {
        boxWidth: 7
      },
      position: 'bottom'
    },
    cutoutPercentage: 60,
    circumference: 2 * Math.PI,
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

}
