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
import { WIDGET_DATA_ERROR } from '../../../../united-view/dashboard/dashboard.component';
import { DashboardKubernetesControllersViewData } from '../dashboard-kubernetes-controllers.service';
import { DashboardKubernetesControllersWidgetService, DashboardKubernetesControllerWidgetViewData } from './dashboard-kubernetes-controllers-widget.service';


@Component({
  selector: 'dashboard-kubernetes-controllers-widget',
  templateUrl: './dashboard-kubernetes-controllers-widget.component.html',
  styleUrls: ['./dashboard-kubernetes-controllers-widget.component.scss'],
  providers: [DashboardKubernetesControllersWidgetService]
})
export class DashboardKubernetesControllersWidgetComponent implements OnInit, OnDestroy {

  @Input() controllerDetails: DashboardKubernetesControllersViewData;
  private ngUnsubscribe = new Subject();
  dataError: string = null;
  widgetViewData: DashboardKubernetesControllerWidgetViewData = new DashboardKubernetesControllerWidgetViewData();

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
      animateRotate: true
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

  podsWidgetChartLabels: Label[] = ['Succeeded', 'Running', 'Pending', 'Unknown', 'Failed'];
  podsWidgetChartColors: Color[] = [{ backgroundColor: ['#4dbd74', '#ad7fe9', '#73818f', '#99aca6', '#CC0000'] }];
  podsWidgetChartData: SingleDataSet = [1, 0, 0, 0, 0];
  podsWidgetChartOptions: ChartOptions = this.defaultChartOptions;

  nodesWidgetChartLabels: Label[] = ['Up', 'Unknown', 'Down'];
  nodesWidgetChartColors: Color[] = [{ backgroundColor: ['#4dbd74', '#99aca6', '#CC0000'] }];
  nodesWidgetChartData: SingleDataSet = [1, 0, 0];
  nodesWidgetChartOptions: ChartOptions = this.defaultChartOptions;

  constructor(private controllerWidgetService: DashboardKubernetesControllersWidgetService,
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
    this.controllerWidgetService.getDashboardKubernetesControllerWidgetData(this.controllerDetails.controllerId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        if (data) {
          this.widgetViewData = this.controllerWidgetService.convertToKubernetesControllerWidgetData(data);
          this.podsWidgetChartData = this.controllerWidgetService.getPodsDonutData(data);
          this.nodesWidgetChartData = this.controllerWidgetService.getNodesDonutData(data);
          this.dataError = null;
        } else {
          this.dataError = WIDGET_DATA_ERROR;
          this.podsWidgetChartData = [1, 0, 0, 0, 0];
          this.nodesWidgetChartData = [1, 0, 0];
          const msg = 'Problem ocurred in fetching Data for Kubernetes Controller ' + this.controllerDetails.name + '. Please try again later.';
          this.notification.error(new Notification(msg));
        }
        this.spinnerService.stop(this.controllerDetails.loaderName);
      }, (err: HttpErrorResponse) => {
        this.dataError = WIDGET_DATA_ERROR;
        this.podsWidgetChartData = [1, 0, 0, 0, 0];
        this.nodesWidgetChartData = [1, 0, 0];
        const msg = 'Problem ocurred in fetching Data for Kubernetes Controller ' + this.controllerDetails.name + '. Please try again later.';
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
