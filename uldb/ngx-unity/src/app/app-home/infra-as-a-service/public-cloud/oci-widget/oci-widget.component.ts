import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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
import { OCIViewData, OCIWidgetViewData, PublicCloudService } from '../public-cloud.service';

@Component({
  selector: 'oci-widget',
  templateUrl: './oci-widget.component.html',
  styleUrls: ['./oci-widget.component.scss'],
  providers: [PublicCloudService]
})
export class OciWidgetComponent implements OnInit {
  @Input() ociData: OCIViewData;
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
  ociWidgetViewData: OCIWidgetViewData = new OCIWidgetViewData();
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
      this.getOCICloudData();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop(this.ociData.loaderName);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.spinnerService.start(this.ociData.loaderName);
    this.getOCICloudData();
  }

  getOCICloudData() {
    this.publicCloudService.getOCICloudData(this.ociData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.ociWidgetViewData = this.publicCloudService.convertToOCIWidgetViewData(data);
      this.vmChartData = this.publicCloudService.getOCIDonutData(data);
      this.dataError = null;
      this.spinnerService.stop(this.ociData.loaderName);
    }, (err: HttpErrorResponse) => {
      this.dataError = WIDGET_DATA_ERROR;
      this.vmChartData = [0, 0];
      const msg = 'Problem ocurred in fetching data for Oracle cloud ' + this.ociData.accountName + '. Please try again later.';
      this.notification.error(new Notification(msg));
      this.spinnerService.stop(this.ociData.loaderName);
    });
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }
}
