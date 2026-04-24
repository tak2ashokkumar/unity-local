import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WIDGET_DATA_ERROR } from 'src/app/app-home/app-home.constants';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DashboardMeshServicesViewData } from '../mesh-services.service';
import { DashboardAppMeshWidgetData } from '../mesh-services.type';
import { AppMeshWidgetService, DashboardAppMeshWidgetViewData } from './app-mesh-widget.service';


@Component({
  selector: 'app-mesh-widget',
  templateUrl: './app-mesh-widget.component.html',
  styleUrls: ['./app-mesh-widget.component.scss'],
  providers: [AppMeshWidgetService]
})
export class AppMeshWidgetComponent implements OnInit, OnDestroy {
  @Input() meshServiceData: DashboardMeshServicesViewData;
  private ngUnsubscribe = new Subject();
  appMeshWidgetViewData: DashboardAppMeshWidgetViewData = new DashboardAppMeshWidgetViewData();
  dataError: string = null;

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

  appMeshWidgetChartLabels: Label[] = ['Active', 'Inactive', 'Deleted Services'];
  appMeshWidgetChartColors: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f', '#99aca6'] }];
  appMeshWidgetChartData: SingleDataSet = [1, 0, 0];
  appMeshWidgetChartOptions: ChartOptions = this.defaultChartOptions;

  constructor(private meshService: AppMeshWidgetService,
    private router: Router,
    private user: UserInfoService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.spinnerService.stop(this.meshServiceData.loaderName);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.spinnerService.start(this.meshServiceData.loaderName);
    this.getAppMeshWidgetData();
  }

  getAppMeshWidgetData() {
    this.meshService.getAppMeshWidgetData(this.meshServiceData.serviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: DashboardAppMeshWidgetData) => {
      this.appMeshWidgetViewData = this.meshService.convertToAppMeshWidgetData(data);
      this.appMeshWidgetChartData = this.meshService.getAppMeshDonutData(data);
      this.dataError = null;
      this.spinnerService.stop(this.meshServiceData.loaderName);
    }, (err: HttpErrorResponse) => {
      this.dataError = WIDGET_DATA_ERROR;
      this.appMeshWidgetChartData = [1, 0, 0];
      const msg = 'Problem ocurred in fetching Data for Mesh Service ' + this.meshServiceData.name + '. Please try again later.';
      this.notification.error(new Notification(msg));
      this.spinnerService.stop(this.meshServiceData.loaderName);
    });
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }

}
