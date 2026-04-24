import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
import { GCPViewData, GCPWidgetViewData, PublicCloudService } from '../public-cloud.service';


@Component({
  selector: 'gcp-widget',
  templateUrl: './gcp-widget.component.html',
  styleUrls: ['./gcp-widget.component.scss'],
  providers: [PublicCloudService]
})
export class GcpWidgetComponent implements OnInit, OnDestroy {

  @Input() gcpData: GCPViewData;
  @Input() state: string;

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
          return context.dataset.data[context.dataIndex] > 0 ? true : false;
        }
      },
      outlabels: {
        display: false
      }
    },
  };

  vmChartLabels: Label[] = ['Running', 'Stopped'];
  vmChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  vmChartData: SingleDataSet = [1, 2];
  vmChartOptions: ChartOptions = this.defaultChartOptions;
  vmChartLoading: boolean = false;

  private ngUnsubscribe = new Subject();
  gcpWidgetViewData: GCPWidgetViewData = new GCPWidgetViewData();
  dataError: string = null;

  constructor(private publicCloudService: PublicCloudService,
    private router: Router,
    private user: UserInfoService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit() {
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.state.currentValue == 'updated') {
      this.getGCPCloudData();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop(this.gcpData.loaderName);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.spinnerService.start(this.gcpData.loaderName);
    this.getGCPCloudData();
  }

  getGCPCloudData() {
    this.publicCloudService.getGCPCloudData(this.gcpData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.gcpWidgetViewData = this.publicCloudService.convertToGCPWidgetViewData(data);
      this.vmChartData = this.publicCloudService.getGCPDonutData(data);
      this.dataError = null;
      this.spinnerService.stop(this.gcpData.loaderName);
    }, (err: HttpErrorResponse) => {
      this.dataError = WIDGET_DATA_ERROR;
      this.vmChartData = [0, 0];
      const msg = 'Problem ocurred in fetching data for GCP cloud ' + this.gcpData.accountName + '. Please try again later.';
      this.notification.error(new Notification(msg));
      this.spinnerService.stop(this.gcpData.loaderName);
    });
  }
  
  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }
}
