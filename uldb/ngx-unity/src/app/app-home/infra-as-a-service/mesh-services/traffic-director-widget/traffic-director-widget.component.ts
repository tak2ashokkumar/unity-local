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
import { WIDGET_DATA_ERROR } from '../../infra-as-a-service.constants';
import { DashboardMeshServicesViewData } from '../mesh-services.service';
import { DashboardTrafficDirectorWidgetData } from '../mesh-services.type';
import { DashboardTrafficDirectorWidgetViewData, TrafficDirectorWidgetService } from './traffic-director-widget.service';


@Component({
  selector: 'traffic-director-widget',
  templateUrl: './traffic-director-widget.component.html',
  styleUrls: ['./traffic-director-widget.component.scss'],
  providers: [TrafficDirectorWidgetService]
})
export class TrafficDirectorWidgetComponent implements OnInit, OnDestroy {
  @Input() meshServiceData: DashboardMeshServicesViewData;
  private ngUnsubscribe = new Subject();
  trafficDirectorWidgetViewData: DashboardTrafficDirectorWidgetViewData = new DashboardTrafficDirectorWidgetViewData();
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

  trafficDirectorWidgetChartLabels: Label[] = ['Healthy', 'Partially Healthy', 'Unhealthy', 'No Backends'];
  trafficDirectorWidgetChartColors: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f', '#ad7fe9', '#99aca6'] }];
  trafficDirectorWidgetChartData: SingleDataSet = [1, 0, 0, 0];
  trafficDirectorWidgetChartOptions: ChartOptions = this.defaultChartOptions;

  constructor(private meshService: TrafficDirectorWidgetService,
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
    this.getTrafficDirectorData();
  }

  getTrafficDirectorData() {
    this.meshService.getTrafficDirectorWidgetData(this.meshServiceData.serviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: DashboardTrafficDirectorWidgetData) => {
      this.trafficDirectorWidgetViewData = this.meshService.convertToTrafficDirectorWidgetData(data);
      this.trafficDirectorWidgetChartData = this.meshService.getTrafficDirectorDonutData(data);
      this.dataError = null;
      this.spinnerService.stop(this.meshServiceData.loaderName);
    }, (err: HttpErrorResponse) => {
      this.dataError = WIDGET_DATA_ERROR;
      this.trafficDirectorWidgetChartData = [1, 0, 0, 0];
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
