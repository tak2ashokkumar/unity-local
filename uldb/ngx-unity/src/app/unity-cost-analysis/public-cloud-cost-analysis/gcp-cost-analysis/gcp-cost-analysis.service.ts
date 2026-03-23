import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { CloudTotalCostData, CloudTotalCost } from '../public-cloud-cost-analysis.type';
import { Observable } from 'rxjs';
import { GET_GCP_ACCOUNTS, GET_GCP_CLOUD_DATA, GCP_TOTAL_COST } from 'src/app/shared/api-endpoint.const';
import { DashboardGCPCloudDataItem } from 'src/app/app-home/infra-as-a-service/public-cloud/gcp.type';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';

@Injectable()
export class GcpCostAnalysisService {

  constructor(private http: HttpClient,
    private currencyPipe: CurrencyPipe,
    private costAnalysisService: PublicCloudCostAnalysisService) { }

  getAcccounts(): Observable<GCPAccount[]> {
    return this.http.get<GCPAccount[]>(GET_GCP_ACCOUNTS(), { params: new HttpParams().set('page_size', '0').set('cost_analysis', true) });
  }

  convertToAccountViewData(accounts: GCPAccount[]): CloudCostAccountData[] {
    let gcpAccounts: CloudCostAccountData[] = [];
    accounts.map(ac => {
      let a: CloudCostAccountData = new CloudCostAccountData();
      a.uuid = ac.uuid;
      a.accountId = ac.id;
      a.email = ac.email;
      a.billingEnabled = ac.billing_enabled;
      a.dataset = ac.dataset;
      a.billingAccount = ac.billing_account;
      a.user = ac.name;
      gcpAccounts.push(a);
    })
    return gcpAccounts;
  }

  getCloudData(accountId: number): Observable<DashboardGCPCloudDataItem> {
    return this.http.get<DashboardGCPCloudDataItem>(GET_GCP_CLOUD_DATA(accountId));
  }

  updateAccountWithCloudAssets(cloud: DashboardGCPCloudDataItem): GCPCloudAssetsViewData {
    let a: GCPCloudAssetsViewData = new GCPCloudAssetsViewData();
    a.vmInstances = cloud.instances_count;
    a.sizeInGB = cloud.size_in_gb;
    a.bucketsCount = cloud.buckets_count;
    a.healthCheckCount = cloud.health_check_count;
    return a;
  }

  getTotalCost(accountId: string): Observable<CloudTotalCost> {
    return this.http.get<CloudTotalCost>(GCP_TOTAL_COST(accountId))
  }

  updateAccountWithTotalCost(totalCost: CloudTotalCost): CloudTotalCostViewData {
    let a: CloudTotalCostViewData = new CloudTotalCostViewData();
    a.pastTwelveMonthsData = totalCost.history;
    /**
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
  accountId: number;
  user: string;
  email: string;
  billingEnabled: boolean;
  dataset: string;
  billingAccount: string;
  cloudAssets: GCPCloudAssetsViewData;
  totalCostData: CloudTotalCostViewData;
  constructor() { }
}

export class GCPCloudAssetsViewData {
  bucketsCount: number = 0;
  sizeInGB: number = 0;
  healthCheckCount: number = 0;
  vmInstances: number = 0;
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
