import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { merge as _merge } from 'lodash-es';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WIDGET_DATA_ERROR } from 'src/app/app-home/app-home.constants';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { PCFastData } from '../pc-fast.type';
import { CloudWidgetViewData, PrivateCloudService } from '../private-cloud.service';



@Component({
  selector: 'private-cloud-widget',
  templateUrl: './private-cloud-widget.component.html',
  styleUrls: ['./private-cloud-widget.component.scss'],
  providers: [PrivateCloudService]
})
export class PrivateCloudWidgetComponent implements OnInit, OnDestroy {
  @Input() pcData: PCFastData;

  defaultChartType: ChartType = 'doughnut';
  defaultChartPlugins = [pluginDataLabels];
  defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: 1.0 * Math.PI,
    legend: {
      fullWidth: false,
      labels: {
        boxWidth: 7
      },
      display: false,
      position: 'top'
    },
    circumference: Math.PI,
    animation: {
      animateScale: true,
      animateRotate: true
    },
    plugins: {
      datalabels: {
        color: '#FFF',
        font: {
          size: 12,
        },
        display: (context) => {
          return context.dataset.data[context.dataIndex] ? true : false;
        }
      },
      outlabels: {
        display: false
      }
    },
    title: {
      display: true,
      text: '%Utilization'
    }
  };

  chartOptions: ChartOptions = {
    legend: {
      display: true,
    },
    title: {
      display: false,
    }
  }


  vCPUChartLabels: Label[] = ['Used', 'Unused'];
  vCPUChartColor: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];
  vCPUChartData: SingleDataSet = [5, 5];
  vCPUChartOptions: ChartOptions = this.defaultChartOptions;
  vCPUChartLoading: boolean = false;

  ramChartLabels: Label[] = ['Used', 'Unused'];
  ramChartColor: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];
  ramChartData: SingleDataSet = [5, 5];
  ramChartOptions: ChartOptions = _merge({}, this.defaultChartOptions, this.chartOptions);;
  ramChartLoading: boolean = false;

  private ngUnsubscribe = new Subject();
  view: CloudWidgetViewData = new CloudWidgetViewData();
  dataError: string = null;

  constructor(private pcService: PrivateCloudService,
    private router: Router,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.getCloudAllocations();
    this.pollForCloudsUpdate();
  }

  getCloudAllocations() {
    this.spinnerService.start(this.pcData.uuid);
    this.pcService.getCloudAllocations(this.pcData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.view = this.pcService.convertToPCWidgetViewData(this.pcData, data);
      this.spinnerService.stop(this.pcData.uuid);
      this.vCPUChartData = [this.view.vCPURuntimeUsage, Number((100 - this.view.vCPURuntimeUsage).toFixed(2))];
      this.ramChartData = [this.view.RAMRuntimeUsage, Number((100 - this.view.RAMRuntimeUsage).toFixed(2))];
    }, err => {
      this.dataError = WIDGET_DATA_ERROR;
      this.vCPUChartData = [0, 0];
      this.ramChartData = [0, 0];
      const msg = 'Problem ocurred in fetching allocations for Private Cloud ' + this.pcData.name + '. Please try again later.';
      this.notification.error(new Notification(msg));
      this.spinnerService.stop(this.pcData.uuid);
    })
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  pollForCloudsUpdate() {
    this.pcService.pollForCloudsUpdate(this.pcData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.getCloudAllocations();
    }, (err: HttpErrorResponse) => {
    });
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }
}
