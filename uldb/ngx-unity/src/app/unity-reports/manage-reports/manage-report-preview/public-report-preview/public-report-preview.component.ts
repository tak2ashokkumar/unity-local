import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { merge as _merge } from 'lodash-es';
import { ManageReportCloudInventoryReportViewData, PublicReportPreviewService } from './public-report-preview.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ManageReportDataType } from './public-report-preview.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'public-report-preview',
  templateUrl: './public-report-preview.component.html',
  styleUrls: ['./public-report-preview.component.scss'],
  providers: [PublicReportPreviewService]
})
export class PublicReportPreviewComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @Input('reportId') reportId: string = null;

  reportViewdata: ManageReportCloudInventoryReportViewData[] = [];
  FaIconMapping = FaIconMapping;
  selectedReport: ManageReportDataType;

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

  storageChartLabels: Label[] = ['Used', 'Unused'];
  storageChartColor: Color[] = [{ backgroundColor: ['#4dbd74', '#73818f'] }];
  storageChartData: SingleDataSet = [5, 5];
  storageChartOptions: ChartOptions = _merge({}, this.defaultChartOptions, this.chartOptions);;
  storageChartLoading: boolean = false;

  ec2ChartLabels: Label[] = ['Running', 'Stopped'];
  ec2ChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  ec2ChartOptions: ChartOptions = this.defaultChartOptions;
  ec2ChartLoading: boolean = false;

  azureChartLabels: Label[] = ['Running', 'Stopped'];
  azureChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  azureChartOptions: ChartOptions = this.defaultChartOptions;
  azureChartLoading: boolean = false;

  gcpChartLabels: Label[] = ['Running', 'Stopped'];
  gcpChartColor: Color[] = [{ backgroundColor: ['#ad7fe9', '#99aca6'] }];
  gcpChartOptions: ChartOptions = this.defaultChartOptions;
  gcpChartLoading: boolean = false;

  constructor(private pcSvc: PublicReportPreviewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) { }

  ngOnInit(): void {
    this.getReportById();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getReportById() {
    this.spinner.start('main');
    this.pcSvc.getReportById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedReport = res;
      this.generateReport();
      this.generateReport();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  generateReport() {
    this.spinner.start('main');
    let reportData = this.selectedReport.report_meta;
    this.pcSvc.generateReport(reportData.cloudName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.reportViewdata = this.pcSvc.convertToViewdata(res);
      this.getAwsCloudData();
      this.getAzureCloudData();
      this.getGCPCloudData();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  getAwsCloudData() {
    from(this.reportViewdata.filter(d => d.cloudType == 'public' && d.cloud == 'AWS')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.pcSvc.getAWSCloudData(e.cloudId)
    }), takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        const key = res.keys().next().value;
        const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
        if (res.get(key)) {
          const value = res.get(key);
          this.reportViewdata[index].awsSummary = this.pcSvc.convertToAWSWidgetViewData(value);
        } else {
          this.reportViewdata[index].awsSummary = null;
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
      });
  }

  getAzureCloudData() {
    from(this.reportViewdata.filter(d => d.cloudType == 'public' && d.cloud == 'AZURE')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.pcSvc.getAzureCloudData(e.cloudId)
    }), takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        const key = res.keys().next().value;
        const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
        if (res.get(key)) {
          const value = res.get(key);
          this.reportViewdata[index].azureSummary = this.pcSvc.convertToAzureWidgetViewData(value);
        } else {
          this.reportViewdata[index].azureSummary = null;
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
      });
  }

  getGCPCloudData() {
    from(this.reportViewdata.filter(d => d.cloudType == 'public' && d.cloud == 'GCP')).pipe(mergeMap(e => {
      this.spinner.start('main');
      return this.pcSvc.getGCPCloudData(e.cloudId)
    }), takeUntil(this.ngUnsubscribe)).subscribe(
      res => {
        const key = res.keys().next().value;
        const index = this.reportViewdata.map(data => data.cloudId).indexOf(key);
        if (res.get(key)) {
          const value = res.get(key);
          this.reportViewdata[index].gcpSummary = this.pcSvc.convertToGCPWidgetViewData(value);
        } else {
          this.reportViewdata[index].gcpSummary = null;
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
      });
  }

}