import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { PublicCloudCostAnalysisService, ChartIntervelOptions } from '../public-cloud-cost-analysis.service';
import { PublicCloudCostAnalysisChartsService, ChartsViewData, DataViewTypes } from './public-cloud-cost-analysis-charts.service';
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
  selector: 'public-cloud-cost-analysis-charts',
  templateUrl: './public-cloud-cost-analysis-charts.component.html',
  styleUrls: ['./public-cloud-cost-analysis-charts.component.scss'],
  providers: [PublicCloudCostAnalysisService, PublicCloudCostAnalysisChartsService]

})
export class PublicCloudCostAnalysisChartsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() cloudType: string;
  @Input() target: string;
  @Input() account: string;

  private ngUnsubscribe = new Subject();
  data: ChartsViewData = new ChartsViewData();

  chartType: ChartType = 'bar';
  chartLabels: Label[] = [];
  chartData: ChartDataSets[] = [];
  chartOptions: ChartOptions = {};
  chartPlugins = [pluginDataLabels];
  chartLegend = true;

  chartIntervelOptions = ChartIntervelOptions;
  chartInterval: string = ChartIntervelOptions.MONTH;
  dataViewTypes = DataViewTypes;
  viewType: string = DataViewTypes.CHART;
  spinnerName: string = null;

  constructor(private costService: PublicCloudCostAnalysisService,
    private chartsService: PublicCloudCostAnalysisChartsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.chartOptions = this.costService.getDefaultBarChartOptions();
  }

  ngOnInit() {
    this.spinnerName = `${this.cloudType}${this.target}`;
    setTimeout(() => {
      this.spinner.start(this.spinnerName);
    }, 0);
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.account.isFirstChange()) {
      // when account changed stopping old spinner
      this.spinner.stop(this.spinnerName);

      // for new account data
      this.spinner.start(this.spinnerName);
      this.data = new ChartsViewData();
      this.chartInterval = ChartIntervelOptions.MONTH;
      this.getData();
    }
  }

  ngOnDestroy() {
    this.spinner.stop(this.spinnerName);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getData() {
    this.chartsService.getChartData(this.cloudType, this.target, this.account).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
      this.data = this.chartsService.convertToViewData(response, this.target);
      this.getChartData(this.chartInterval);
      this.spinner.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(`Failed to get cost by ${this.target} data. Tryagain later`));
      this.spinner.stop(this.spinnerName);
    })
  }

  getChartData(intervalType: string) {
    this.chartLabels = this.costService.getChartLables(intervalType);
    this.chartData = this.chartsService.getDataSets(this.data, this.chartLabels, intervalType);
  }

  changeView(view: string) {
    this.viewType = view;
  }

}
