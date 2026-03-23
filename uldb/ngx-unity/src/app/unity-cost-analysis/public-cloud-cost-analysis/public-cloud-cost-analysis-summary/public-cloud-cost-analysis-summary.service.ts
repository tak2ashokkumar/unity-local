import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { CLOUD_COST_AWS_SUMMARY_DATA, CLOUD_COST_AZURE_SUMMARY_DATA, CLOUD_COST_GCP_SUMMARY_DATA, CLOUD_COST_OCI_SUMMARY_DATA } from 'src/app/shared/api-endpoint.const';
import { CloudCostSummary } from './public-cloud-cost-analysis-summary.type';
import { currentMonthLabel, CloudCostColorByCloud } from '../public-cloud-cost-analysis.service';
import { Label } from 'ng2-charts';
import { ChartDataSets } from 'chart.js';

@Injectable()
export class PublicCloudCostAnalysisSummaryService {

  constructor(private http: HttpClient,
    private currencyPipe: CurrencyPipe) { }

  getAWSSummaryData(): Observable<CloudCostSummary[]> {
    return this.http.get<CloudCostSummary[]>(CLOUD_COST_AWS_SUMMARY_DATA());
  }

  getAzureSummaryData(): Observable<CloudCostSummary[]> {
    return this.http.get<CloudCostSummary[]>(CLOUD_COST_AZURE_SUMMARY_DATA());
  }

  getGCPSummaryData(): Observable<CloudCostSummary[]> {
    return this.http.get<CloudCostSummary[]>(CLOUD_COST_GCP_SUMMARY_DATA());
  }

  getOCISummaryData(): Observable<CloudCostSummary[]> {
    return this.http.get<CloudCostSummary[]>(CLOUD_COST_OCI_SUMMARY_DATA());
  }

  updateSummaryData(costData: CloudCostSummary[]): CloudCostSummaryViewData {
    if (!costData.length) { return new CloudCostSummaryViewData(); }

    let summaryData: CloudCostSummaryData[] = [];
    costData.map(sd => {
      let a: CloudCostSummaryData = new CloudCostSummaryData();
      a.amount = sd.amount;
      a.unit = sd.unit;
      a.month = sd.is_current ? currentMonthLabel : sd.month;
      a.isCurrent = sd.is_current;
      summaryData.push(a);
    })

    let summaryViewData: CloudCostSummaryViewData = new CloudCostSummaryViewData();
    summaryViewData.summaryData = summaryData;
    summaryViewData.costUnits = summaryData[0].unit;

    /*  
    * "~~" is a bitwise operator which is equal to Math.truncate().
    * It truncates decimal values from a floating point number.  
    */
    const currentCost = costData.find(asd => asd.is_current);
    summaryViewData.monthToDateCost = currentCost ? ~~currentCost.amount : 0;
    summaryViewData.monthToDateCostDisplayValue = `${this.currencyPipe.transform(summaryViewData.monthToDateCost, summaryViewData.costUnits, 'symbol', '1.0-0')}`;

    summaryViewData.averageCost = ~~(costData.filter(d => !d.is_current).reduce((sum, current) => sum + current.amount, 0) / (costData.length - 1));
    summaryViewData.averageCostDisplayValue = this.currencyPipe.transform(summaryViewData.averageCost, summaryViewData.costUnits, 'symbol', '1.0-0');

    summaryViewData.trailingTwelveMonthsCost = ~~costData.filter(d => !d.is_current).reduce((sum, current) => sum + current.amount, 0);
    summaryViewData.trailingTwelveMonthsCostDisplayValue = this.currencyPipe.transform(summaryViewData.trailingTwelveMonthsCost, summaryViewData.costUnits, 'symbol', '1.0-0');
    return summaryViewData;
  }

  getCostByMonthChartData(summaryData: CloudCostSummaryView, lables: Label[], datalables: string[]) {
    let dataSets: ChartDataSets[] = [];
    datalables.map(datalabel => {
      let dts: ChartDataSets = {};
      if (datalabel == 'AWS') {
        dts.data = this.getDataSetData(summaryData.aws.summaryData, lables);
        dts.backgroundColor = CloudCostColorByCloud.AWS;
        dts.hoverBackgroundColor = CloudCostColorByCloud.AWS;
      } else if (datalabel == 'Azure') {
        dts.data = this.getDataSetData(summaryData.azure.summaryData, lables);
        dts.backgroundColor = CloudCostColorByCloud.Azure;
        dts.hoverBackgroundColor = CloudCostColorByCloud.Azure;
      } else if (datalabel == 'GCP') {
        dts.data = this.getDataSetData(summaryData.gcp.summaryData, lables);
        dts.backgroundColor = CloudCostColorByCloud.GCP;
        dts.hoverBackgroundColor = CloudCostColorByCloud.GCP;
      } else {
        dts.data = this.getDataSetData(summaryData.oci.summaryData, lables);
        dts.backgroundColor = CloudCostColorByCloud.OCI;
        dts.hoverBackgroundColor = CloudCostColorByCloud.OCI;
      }
      dts.label = datalabel;
      dts.stack = 'a';
      dts.borderWidth = 0;
      dataSets.push(dts);
    })
    let dts: ChartDataSets = {};
    dts.data = this.getTotalCostAmount(summaryData, lables);
    dts.label = '';
    dts.backgroundColor = 'white';
    dts.borderColor = 'white';
    dts.type = 'bubble';
    dataSets.push(dts);
    return dataSets;
  }

  getDataSetData(targetDataList: CloudCostSummaryData[], lables: Label[]): any[] {
    let dataSetData: any[] = [];
    lables.map(label => {
      let targetLabelData = targetDataList.find(td => td.month == label.toString().split('-').getFirst());
      if (targetLabelData) {
        dataSetData.push(targetLabelData.amount);
      } else {
        dataSetData.push(0);
      }
    })
    return dataSetData;
  }

  getTotalCostAmount(cloudData: CloudCostSummaryView, lables: Label[]): number[] {
    let data: number[] = [];
    lables.map(label => {
      let sum = 0;
      const targetAWSLabelData = cloudData.aws.summaryData.find(sd => sd.month == label.toString().split('-').getFirst());
      const targetAzureLabelData = cloudData.azure.summaryData.find(sd => sd.month == label.toString().split('-').getFirst());
      const targetGCPLabelData = cloudData.gcp.summaryData.find(sd => sd.month == label.toString().split('-').getFirst());
      const targetOCILabelData = cloudData.oci.summaryData.find(sd => sd.month == label.toString().split('-').getFirst());
      sum += (targetAWSLabelData ? targetAWSLabelData.amount : 0) + (targetAzureLabelData ? targetAzureLabelData.amount : 0)
        + (targetGCPLabelData ? targetGCPLabelData.amount : 0) + + (targetOCILabelData ? targetOCILabelData.amount : 0);
      /*
       * "~~" is a bitwise operator whihgch is equal to Math.truncate().
       * It truncates decimal values from a floating point number.  
       */
      data.push(~~sum);
    })
    return data;
  }

  getAverageCostByCloudChartData(data: CloudCostSummaryView) {
    let chartData: number[] = [];

    if (data.aws.summaryData.length) {
      chartData.push(data.aws.averageCost);
    }
    if (data.azure.summaryData.length) {
      chartData.push(data.azure.averageCost);
    }
    if (data.gcp.summaryData.length) {
      chartData.push(data.gcp.averageCost);
    }
    if (data.oci.summaryData.length) {
      chartData.push(data.oci.averageCost);
    }
    return chartData;
  }

  getAverageCostByCloudChartColors(data: CloudCostSummaryView) {
    let chartColors: Array<{ backgroundColor: string[] }> = [{ backgroundColor: [] }];
    let colors: string[] = [];
    if (data.aws.summaryData.length) {
      colors.push(CloudCostColorByCloud.AWS);
    }
    if (data.azure.summaryData.length) {
      colors.push(CloudCostColorByCloud.Azure);
    }
    if (data.gcp.summaryData.length) {
      colors.push(CloudCostColorByCloud.GCP);
    }
    if (data.oci.summaryData.length) {
      colors.push(CloudCostColorByCloud.OCI);
    }
    chartColors[0].backgroundColor = colors;
    return chartColors;
  }
}

export class CloudCostSummaryView {
  aws: CloudCostSummaryViewData;
  azure: CloudCostSummaryViewData;
  gcp: CloudCostSummaryViewData;
  oci: CloudCostSummaryViewData;

  get dataLoaded() {
    return this.aws && this.azure && this.gcp && this.oci ? true : false;
  }

  get dataExists() {
    return this.dataLoaded &&
      (this.aws.summaryData.length || this.azure.summaryData.length || this.gcp.summaryData.length || this.oci.summaryData.length) ? true : false;
  }

  get dataLables(): string[] {
    let k: string[] = [];
    if (this.dataExists) {
      this.aws.summaryData.length ? k.push('AWS') : null;
      this.azure.summaryData.length ? k.push('Azure') : null;
      this.gcp.summaryData.length ? k.push('GCP') : null;
      this.oci.summaryData.length ? k.push('OCI') : null;
    }
    return k;
  }
  constructor() { }
}

export class CloudCostSummaryViewData {
  summaryData: CloudCostSummaryData[] = [];
  costUnits: string = 'USD';

  monthToDateCost: number = 0;
  monthToDateCostDisplayValue: string = '$0';
  trailingTwelveMonthsCost: number = 0;
  trailingTwelveMonthsCostDisplayValue: string = `$0`;
  averageCost: number = 0;
  averageCostDisplayValue: string = '$0';

  constructor() { }
}

export class CloudCostSummaryData {
  amount: number;
  unit: string;
  month: string;
  isCurrent: boolean;
  constructor() { }
}
