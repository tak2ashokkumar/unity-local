import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PublicCloudCostAnalysisService, currentMonthLabel } from '../public-cloud-cost-analysis.service';
import { RandColorGeneratorService } from 'src/app/shared/rand-color-generator.service';
import { Observable } from 'rxjs';
import { GET_CLOUD_COST_CHARTS_DATA } from 'src/app/shared/api-endpoint.const';
import { CloudCostByTarget } from './public-cloud-cost-analysis-charts.type';
import { Label } from 'ng2-charts';
import { ChartDataSets } from 'chart.js';

@Injectable()
export class PublicCloudCostAnalysisChartsService {

  constructor(private http: HttpClient,
    private costService: PublicCloudCostAnalysisService,
    private colorSvc: RandColorGeneratorService) { }

  getChartData(cloudType: string, target: string, accountId: string): Observable<CloudCostByTarget[]> {
    return this.http.get<CloudCostByTarget[]>(GET_CLOUD_COST_CHARTS_DATA(cloudType, accountId, target))
  }

  getDatasetLables(targetDataList: CloudCostByTargetViewData[]): string[] {
    let targets: string[] = [];
    targetDataList.map(td => {
      td.monthData.map(d => {
        if (!targets.includes(d.target)) {
          targets.push(d.target);
        }
      })
    })
    return targets;
  }

  convertToViewData(costData: CloudCostByTarget[], target: string) {
    let chartData: ChartsViewData = new ChartsViewData();

    let viewData: CloudCostByTargetViewData[] = [];
    costData.map(cd => {
      let a: CloudCostByTargetViewData = new CloudCostByTargetViewData();
      a.isCurrent = cd.is_current;
      a.month = cd.is_current ? currentMonthLabel : cd.month;

      let d: any = [];
      cd.data.map(cdd => {
        let p: CloudCostByTargetData = new CloudCostByTargetData();
        p.amount = cdd.amount;
        p.unit = cdd.unit;
        if (target == 'service') {
          p.target = cdd.service;
        } else {
          p.target = cdd.region ? cdd.region : 'US/Global';
        }
        d.push(p);
      })

      a.monthData = d;
      viewData.push(a);
    })
    chartData.viewData = viewData;

    chartData.dataLables = this.getDatasetLables(viewData);
    return chartData;
  }

  getDataSets(chartsViewData: ChartsViewData, chartLables: Label[], viewType: string): ChartDataSets[] {
    let dataSet: ChartDataSets[] = [];
    let colors = this.colorSvc.getRandomColorSet(chartsViewData.dataLables.length);
    // if (this.barColors.colors.length) {
    //   colors = this.barColors.colors;
    // }
    chartsViewData.dataLables.map((datalabel, index) => {
      let dts: ChartDataSets = {};
      dts.data = this.getDataSetData(chartLables, chartsViewData.viewData, datalabel, viewType);
      dts.label = datalabel;
      dts.stack = 'a';
      dts.borderWidth = 0;
      dts.maxBarThickness = 40;
      /*
       * "~~" is a bitwise operator which is equal to Math.truncate(). 
       * It truncates decimal values from a floating point number.  
       * costByServiceChartColors[~~(Math.random() * (costByServiceChartColors.length - 0 + 1)) + 0];
       */
      const color: string = colors[index];
      dts.backgroundColor = color;
      dts.hoverBackgroundColor = color;
      dataSet.push(dts);
    });

    let dts: ChartDataSets = {};
    dts.data = this.getTotalCostAmount(chartLables, chartsViewData.viewData, viewType);
    dts.label = '';
    dts.backgroundColor = 'white';
    dts.borderColor = 'white';
    dts.type = 'bubble';

    dataSet.push(dts);
    return dataSet;
  }

  getDataSetData(chartLables: Label[], targetDataList: CloudCostByTargetViewData[], datalabel: string, viewType: string): any[] {
    let dataSetData: any[] = [];
    if (viewType == 'By Month') {
      chartLables.map(monthLabel => {
        let chartLabelData = targetDataList.find(td => td.month == monthLabel.toString().split('-').getFirst());
        if (chartLabelData) {
          let targetLabelData = chartLabelData.monthData.find(tdd => tdd.target == datalabel);
          if (targetLabelData) {
            dataSetData.push(targetLabelData.amount);
          } else {
            dataSetData.push(0);
          }
        } else {
          dataSetData.push(0);
        }
      })
    } else {
      chartLables.map(quarterLabel => {
        let months = this.costService.getMonthsByQuarter(quarterLabel.toString());
        let costByQuarter: number = 0;
        months.map(month => {
          let chartLabelData = targetDataList.find(td => td.month == month);
          if (chartLabelData) {
            let targetLabelData = chartLabelData.monthData.find(tdd => tdd.target == datalabel);
            if (targetLabelData) {
              costByQuarter += targetLabelData.amount;
            }
          }
        })
        dataSetData.push(costByQuarter);
      })
    }
    return dataSetData;
  }

  getTotalCostAmount(chartLables: Label[], targetDataList: CloudCostByTargetViewData[], viewType: string): any[] {
    let k: any = [];
    if (viewType == 'By Month') {
      chartLables.map(monthLabel => {
        let chartLabelData = targetDataList.find(td => td.month == monthLabel.toString().split('-').getFirst());
        if (chartLabelData) {
          /*
           * "~~" is a bitwise  operator which is equal to Math.truncate().
           * It truncates decimal values from a floating point number.  
           */
          k.push(~~chartLabelData.monthData.reduce((sum, current) => sum + current.amount, 0));
        } else {
          k.push(0);
        }
      })
    } else {
      chartLables.map(quarterLabel => {
        let months = this.costService.getMonthsByQuarter(quarterLabel.toString());
        let monthSum = 0;
        months.map(month => {
          let chartLabelData = targetDataList.find(td => td.month == month);
          if (chartLabelData) {
            monthSum += chartLabelData.monthData.reduce((sum, current) => sum + current.amount, 0);
          }
        })
        /*
        * "~~" is a bitwise operator which is equal to Math.truncate(). 
        * It truncates decimal values from a floating point number.  
        */
        k.push(~~monthSum)
      })

    }
    return k;
  }
}

export class ChartsViewData {
  viewData: CloudCostByTargetViewData[];
  dataLables: string[] = [];
  constructor() { }
}

export class CloudCostByTargetViewData {
  month: string;
  isCurrent: boolean;
  monthData: CloudCostByTargetData[];
  constructor() { }
}

export class CloudCostByTargetData {
  amount: number;
  unit: string;
  target: string;
  constructor() { }
}

export enum DataViewTypes {
  CHART = 'chart',
  LIST = 'list'
}
