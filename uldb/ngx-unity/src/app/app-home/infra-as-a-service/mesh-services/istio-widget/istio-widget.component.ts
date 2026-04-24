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
import { DashboardIstioWidgetData } from '../mesh-services.type';
import { DashboardIstioWidgetViewData, IstioWidgetService } from './istio-widget.service';


@Component({
  selector: 'istio-widget',
  templateUrl: './istio-widget.component.html',
  styleUrls: ['./istio-widget.component.scss'],
  providers: [IstioWidgetService]
})
export class IstioWidgetComponent implements OnInit, OnDestroy {
  @Input() meshServiceData: DashboardMeshServicesViewData;
  private ngUnsubscribe = new Subject();
  istioWidgetViewData: DashboardIstioWidgetViewData = new DashboardIstioWidgetViewData();
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

  istioWidgetChartLabels: Label[] = ['Succeeded', 'Running', 'Pending', 'Failed Services'];
  istioWidgetChartColors: Color[] = [{ backgroundColor: ['#4dbd74', '#ad7fe9', '#99aca6', '#CC0000'] }];
  istioWidgetChartData: SingleDataSet = [1, 0, 0, 0];
  istioWidgetChartOptions: ChartOptions = this.defaultChartOptions;

  constructor(private widgetService: IstioWidgetService,
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
    this.getIstioWidgetData();
  }

  getIstioWidgetData() {
    this.widgetService.getIstioWidgetData(this.meshServiceData.serviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: DashboardIstioWidgetData) => {
      if (data) {
        this.istioWidgetViewData = this.widgetService.convertToIstioWidgetData(data);
        this.istioWidgetChartData = this.widgetService.getIstioDonutData(data);
        this.dataError = null;
      } else {
        this.dataError = WIDGET_DATA_ERROR;
        this.istioWidgetChartData = [1, 0, 0, 0];
        // const msg = 'Problem ocurred in fetching Data for Traffic Director ' + this.meshServiceData.name + '. Please try again later.';
        // this.notification.error(new Notification(msg));
      }
      this.spinnerService.stop(this.meshServiceData.loaderName);
    }, (err: HttpErrorResponse) => {
      this.dataError = WIDGET_DATA_ERROR;
      this.istioWidgetChartData = [1, 0, 0, 0];
      const msg = 'Problem ocurred in fetching Data for Traffic Director ' + this.meshServiceData.name + '. Please try again later.';
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
