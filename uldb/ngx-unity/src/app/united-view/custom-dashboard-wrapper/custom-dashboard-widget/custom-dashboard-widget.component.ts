import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CustomDashboardWidgetCrudService } from '../custom-dashboard-widget-crud/custom-dashboard-widget.service';
import { CustomDashboardWidgetType } from '../custom-dashboard.type';
import { CustomDashboardWidgetService, WidgetUsageDetails, WidgetUsageDetailsViewdata } from './custom-dashboard-widget.service';

@Component({
  selector: 'custom-dashboard-widget',
  templateUrl: './custom-dashboard-widget.component.html',
  styleUrls: ['./custom-dashboard-widget.component.scss'],
  providers: [CustomDashboardWidgetService]
})
export class CustomDashboardWidgetComponent implements OnInit, OnDestroy {
  @Input('data') data: CustomDashboardWidgetType;
  alertLoaderName: string;
  statusLoaderName: string;
  utilizationLoaderName: string;

  isCollapsed = false;
  viewAllDataSet = false;

  private ngUnsubscribe = new Subject();
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
  vCPUChartColor: Color[] = [{ backgroundColor: ['red', 'blue'] }];
  vCPUChartData: SingleDataSet = [5, 5];
  vCPUChartOptions: ChartOptions = Object.assign({}, this.defaultChartOptions, this.chartOptions);

  ramChartLabels: Label[] = ['Used', 'Unused'];
  ramChartColor: Color[] = [{ backgroundColor: [] }];
  ramChartData: SingleDataSet = [5, 5];
  ramChartOptions: ChartOptions = Object.assign({}, this.defaultChartOptions, this.chartOptions);

  storageChartLabels: Label[] = ['Used', 'Unused'];
  storageChartColor: Color[] = [{ backgroundColor: [] }];
  storageChartData: SingleDataSet = [5, 5];
  storageChartOptions: ChartOptions = Object.assign({}, this.defaultChartOptions);

  alertCount: { Critical: number; Information: number; Warning: number; } = { Critical: 0, Information: 0, Warning: 0 }
  deviceStatusCounts: { down: number, unknown: number, non_configured: number, up: number } = { down: 0, unknown: 0, non_configured: 0, up: 0 }
  widgetDetails: WidgetUsageDetailsViewdata;

  constructor(private widgetSvc: CustomDashboardWidgetService,
    private spinner: AppSpinnerService,
    private crudSvc: CustomDashboardWidgetCrudService,
    private notification: AppNotificationService) {
  }

  ngOnInit(): void {
    let a = `${this.data.id}-${this.data.name}`
    this.alertLoaderName = `alert-${a}`;
    this.statusLoaderName = `status-${a}`;
    this.utilizationLoaderName = `util-${a}`;
    setTimeout(() => {
      this.getAlerts();
      this.getDeviceStatus();
      this.getWidgetDetails();
    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAlerts() {
    this.spinner.start(this.alertLoaderName);
    this.widgetSvc.getAlertsCount(this.data.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertCount = res;
      this.spinner.stop(this.alertLoaderName);
    }, err => {
      this.spinner.stop(this.alertLoaderName);
      this.notification.error(new Notification('Error while fetching alert count!! Please try again.'))
    });
  }

  getDeviceStatus() {
    this.spinner.start(this.statusLoaderName);
    this.widgetSvc.getDeviceStatus(this.data.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceStatusCounts = res;
      this.spinner.stop(this.statusLoaderName);
    }, err => {
      this.spinner.stop(this.statusLoaderName);
      this.notification.error(new Notification('Error while fetching alert count!! Please try again.'))
    });
  }

  getWidgetDetails() {
    this.spinner.start(this.utilizationLoaderName);
    this.widgetSvc.getWidgetDetails(this.data.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.widgetDetails = this.widgetSvc.convertToViewdata(res);

      this.vCPUChartData = [this.widgetDetails.cpuUsed, this.widgetDetails.cpuUnused];
      this.vCPUChartColor = [{ backgroundColor: [this.widgetDetails.cpuUsedColor, this.widgetDetails.unusedColor] }];

      this.ramChartData = [this.widgetDetails.memoryUsed, this.widgetDetails.memoryUnused];
      this.ramChartColor = [{ backgroundColor: [this.widgetDetails.memoryUsedColor, this.widgetDetails.unusedColor] }];

      this.storageChartData = [this.widgetDetails.storageUsed, this.widgetDetails.storageUnused];
      this.storageChartColor = [{ backgroundColor: [this.widgetDetails.storageUsedColor, this.widgetDetails.unusedColor] }];
      this.spinner.stop(this.utilizationLoaderName);

    }, err => {
      // this.spinner.stop
      this.vCPUChartData = [0, 0];
      this.ramChartData = [0, 0];
      this.storageChartData = [0, 0];
      this.spinner.stop(this.utilizationLoaderName);
      this.notification.error(new Notification('Error while fetching alert count!! Please try again.'))
    });
  }

  editWidget() {
    this.crudSvc.addOrEdit(this.data.id);
  }

  deleteWidget() {
    this.crudSvc.deleteWidget(this.data.id);
  }
}
