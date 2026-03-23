import { Component, OnInit, OnDestroy } from '@angular/core';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';
import { PublicCloudCostAnalysisSummaryService, CloudCostSummaryView } from './public-cloud-cost-analysis-summary.service';
import { Subject } from 'rxjs';

import { ChartType, ChartDataSets, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';


@Component({
  selector: 'public-cloud-cost-analysis-summary',
  templateUrl: './public-cloud-cost-analysis-summary.component.html',
  styleUrls: ['./public-cloud-cost-analysis-summary.component.scss'],
  providers: [PublicCloudCostAnalysisService, PublicCloudCostAnalysisSummaryService]
})
export class PublicCloudCostAnalysisSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  costByMonthChartType: ChartType = 'bar';
  costByMonthChartLabels: Label[] = [];
  costByMonthChartData: ChartDataSets[] = [];
  costByMonthChartOptions: ChartOptions = {};
  costByMonthChartPlugins = [pluginDataLabels];
  costByMonthChartLegend = true;

  averageCostByCloudChartType: ChartType = 'pie';
  averageCostByCloudChartLabels: Label[] = [];
  averageCostByCloudChartData: number[] = [];
  averageCostByCloudChartOptions: ChartOptions = {};
  averageCostByCloudChartPlugins = [pluginDataLabels];
  averageCostByCloudChartLegend = true;
  averageCostByCloudChartColors = [{ backgroundColor: [] }];

  summaryData: CloudCostSummaryView = new CloudCostSummaryView();
  constructor(private costService: PublicCloudCostAnalysisService,
    private summaryService: PublicCloudCostAnalysisSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.costByMonthChartOptions = this.costService.getDefaultBarChartOptions();
    this.averageCostByCloudChartOptions = this.costService.getDefaultPieChartOptions();
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getAWSSummaryData();
    this.getAzureSummaryData();
    this.getGCPSummaryData();
    this.getOCISummaryData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAWSSummaryData() {
    this.summaryService.getAWSSummaryData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryData.aws = this.summaryService.updateSummaryData(data);
      this.setChartData();
    }, (err: HttpErrorResponse) => {
      this.summaryData.aws = this.summaryService.updateSummaryData([]);
      this.setChartData();
      this.notification.error(new Notification('Failed to get AWS data. Tryagain later.'));
    })
  }

  getAzureSummaryData() {
    this.summaryService.getAzureSummaryData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryData.azure = this.summaryService.updateSummaryData(data);
      this.setChartData();
    }, (err: HttpErrorResponse) => {
      this.summaryData.azure = this.summaryService.updateSummaryData([]);
      this.setChartData();
      this.notification.error(new Notification('Failed to get Azure data. Tryagain later.'));
    })
  }

  getGCPSummaryData() {
    this.summaryService.getGCPSummaryData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryData.gcp = this.summaryService.updateSummaryData(data);
      this.setChartData();
    }, (err: HttpErrorResponse) => {
      this.summaryData.gcp = this.summaryService.updateSummaryData([]);
      this.setChartData();
      this.notification.error(new Notification('Failed to get GCP data. Tryagain later.'));
    })
  }

  getOCISummaryData() {
    this.summaryService.getOCISummaryData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryData.oci = this.summaryService.updateSummaryData(data);
      this.setChartData();
    }, (err: HttpErrorResponse) => {
      this.summaryData.oci = this.summaryService.updateSummaryData([]);
      this.setChartData();
      this.notification.error(new Notification('Failed to get OCI data. Tryagain later.'));
    })
  }

  setChartData() {
    if (this.summaryData.dataLoaded) {
      this.costByMonthChartLabels = this.costService.getLastNMonths(13);
      this.costByMonthChartData = this.summaryService.getCostByMonthChartData(this.summaryData, this.costByMonthChartLabels, this.summaryData.dataLables);

      this.averageCostByCloudChartLabels = this.summaryData.dataLables;
      this.averageCostByCloudChartData = this.summaryService.getAverageCostByCloudChartData(this.summaryData);
      this.averageCostByCloudChartColors = this.summaryService.getAverageCostByCloudChartColors(this.summaryData);
      this.spinner.stop('main');
    }
  }

}
