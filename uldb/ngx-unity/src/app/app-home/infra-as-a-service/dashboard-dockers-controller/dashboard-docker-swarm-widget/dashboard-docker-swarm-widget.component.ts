import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DashboardDockerControllersView } from '../dashboard-dockers-controller.service';
import { DashboardDockerSwarmWidgetService, DashboardDockerSwarmWidgetViewData } from './dashboard-docker-swarm-widget.service';
import { WIDGET_DATA_ERROR } from 'src/app/app-home/app-home.constants';

@Component({
  selector: 'dashboard-docker-swarm-widget',
  templateUrl: './dashboard-docker-swarm-widget.component.html',
  styleUrls: ['./dashboard-docker-swarm-widget.component.scss'],
  providers: [DashboardDockerSwarmWidgetService]
})
export class DashboardDockerSwarmWidgetComponent implements OnInit, OnDestroy {

  @Input() controllerDetails: DashboardDockerControllersView;
  private ngUnsubscribe = new Subject();
  dataError: string = null;
  viewData: DashboardDockerSwarmWidgetViewData = new DashboardDockerSwarmWidgetViewData();

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
      display: true,
      position: 'left'
    },
    circumference: Math.PI,
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    plugins: {
      datalabels: {
        color: '#FFF',
        font: {
          size: 12,
        },
        display: (context) => {
          return context.dataset.data[context.dataIndex] > 0 ? true : false;
        }
      },
      outlabels: {
        display: false
      }
    },
  };

  containerChartLabels: Label[] = ['Running', 'Exited'];
  containerChartColors: Color[] = [{ backgroundColor: ['#ad7fe9', '#CC0000'] }];
  containerChartData: SingleDataSet = [1, 0];
  containerChartOptions: ChartOptions = this.defaultChartOptions;

  nodeChartLabels: Label[] = ['Up', 'Unknown', 'Down', 'Disconnected'];
  nodeChartColors: Color[] = [{ backgroundColor: ['#4dbd74', '#99aca6', '#CC0000', '#73818f'] }];
  nodeChartData: SingleDataSet = [1, 0, 0, 0];
  nodeChartOptions: ChartOptions = this.defaultChartOptions;

  constructor(private dockerSwarmWidgetService: DashboardDockerSwarmWidgetService,
    private router: Router,
    private user: UserInfoService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.spinnerService.start(this.controllerDetails.loaderName);
    this.getControllerData();
  }

  getControllerData() {
    this.dockerSwarmWidgetService.getWidgetData(this.controllerDetails.controllerId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.viewData = this.dockerSwarmWidgetService.convertToViewData(data);
        this.containerChartData = this.dockerSwarmWidgetService.getContainerDonutData(data);
        this.nodeChartData = this.dockerSwarmWidgetService.getNodeDonutData(data);
        this.dataError = null;
        this.spinnerService.stop(this.controllerDetails.loaderName);
      }, (err: HttpErrorResponse) => {
        this.dataError = WIDGET_DATA_ERROR;
        this.containerChartData = [1, 0];
        this.nodeChartData = [1, 0, 0, 0];
        const msg = `Problem ocurred in fetching data for docker ${this.controllerDetails.name}. Please try again later.`;
        this.notification.error(new Notification(msg));
        this.spinnerService.stop(this.controllerDetails.loaderName);
      })
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }

}
