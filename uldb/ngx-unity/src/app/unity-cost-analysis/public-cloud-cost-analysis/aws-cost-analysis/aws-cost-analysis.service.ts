import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GET_AWS_ACCOUNTS, GET_AWS_CLOUD_DATA, AWS_TOTAL_COST } from 'src/app/shared/api-endpoint.const';
import { CurrencyPipe } from '@angular/common';
import { CloudTotalCostData, CloudTotalCost } from '../public-cloud-cost-analysis.type';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';

@Injectable()
export class AwsCostAnalysisService {

  constructor(private http: HttpClient,
    private currencyPipe: CurrencyPipe,
    private costAnalysisService: PublicCloudCostAnalysisService) { }

  getAccounts(): Observable<AWSAccount[]> {
    return this.http.get<AWSAccount[]>(GET_AWS_ACCOUNTS(), { params: { page_size: 0, cost_analysis: true } });
  }

  convertToAccountViewData(accounts: AWSAccount[]): CloudCostAccountData[] {
    let awsAccounts: CloudCostAccountData[] = [];
    accounts.map(ac => {
      let a: CloudCostAccountData = new CloudCostAccountData();
      a.uuid = ac.uuid;
      a.accountId = ac.id.toString();
      a.accountName = ac.name;
      awsAccounts.push(a);
    })
    return awsAccounts;
  }

  getAssets(accountId: string): Observable<AWSWidget> {
    return this.http.get<AWSWidget>(GET_AWS_CLOUD_DATA(Number(accountId)));
  }

  updateAWSAccountWithCloudAssets(cloud: AWSWidget): CloudAssetsViewData {
    let a: CloudAssetsViewData = new CloudAssetsViewData();
    a.ec2Instances = cloud.ec2_instance;
    a.s3Buckets = cloud.s3_bucket;
    a.elasticIps = cloud.elastic_ips;
    a.rdsInstances = cloud.RDS_instance;
    a.loadBalancers = cloud.load_balancer;
    return a;
  }

  getTotalCost(accountId: string): Observable<CloudTotalCost> {
    return this.http.get<CloudTotalCost>(AWS_TOTAL_COST(Number(accountId)));
  }

  updateAWSAccountWithTotalCost(totalCost: CloudTotalCost): CloudTotalCostViewData {
    let a: CloudTotalCostViewData = new CloudTotalCostViewData();
    a.pastTwelveMonthsData = totalCost.history;

    /*  
    * "~~" is a bitwise operator which is equal to Math.truncate().
    * It truncates decimal values from a floating point number.  
    */
    a.pastTwelveMonthsCost = this.currencyPipe.transform(~~totalCost.history.reduce((sum, current) => sum + current.amount, 0), totalCost.history[0].unit, 'symbol', '1.0-0');

    a.currentMonthCost = `${this.currencyPipe.transform(~~totalCost.current.amount, totalCost.current.unit, 'symbol', '1.0-0')}`;
    a.currentMonthEstimatedCost = this.currencyPipe.transform(~~totalCost.current.estimate, totalCost.current.unit, 'symbol', '1.0-0');
    a.averageCost = this.currencyPipe.transform(~~totalCost.average.amount, totalCost.average.unit, 'symbol', '1.0-0');

    let previuosMonthData = totalCost.history.find(md => md.month == this.costAnalysisService.getPreviousMonth());
    if (previuosMonthData) {
      a.previousMonthCost = this.currencyPipe.transform(~~previuosMonthData.amount, previuosMonthData.unit, 'symbol', '1.0-0');
    }
    return a;
  }
}

export class CloudCostAccountData {
  uuid: string;
  accountId: string;
  accountName: string;
  cloudAssets: CloudAssetsViewData;
  totalCostData: CloudTotalCostViewData;
  constructor() { }
}

export class CloudAssetsViewData {
  ec2Instances: number;
  s3Buckets: number;
  elasticIps: number;
  rdsInstances: number;
  loadBalancers: number;
  constructor() { }
}

export class CloudTotalCostViewData {
  pastTwelveMonthsData: CloudTotalCostData[];
  pastTwelveMonthsCost: string;
  currentMonthCost: string;
  currentMonthEstimatedCost: string;
  previousMonthCost: string;
  averageCost: string;
  constructor() { }
}
