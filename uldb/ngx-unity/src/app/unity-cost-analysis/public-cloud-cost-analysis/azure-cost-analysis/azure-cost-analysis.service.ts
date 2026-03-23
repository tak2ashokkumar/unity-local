import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { GET_AZURE_ACCOUNTS, GET_AZURE_CLOUD_DATA, AZURE_TOTAL_COST } from 'src/app/shared/api-endpoint.const';
import { CloudTotalCostData, CloudTotalCost } from '../public-cloud-cost-analysis.type';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';
import { AzureAccountsType } from 'src/app/united-cloud/public-cloud/public-cloud-azure/entities/azure-accounts.type';

@Injectable()
export class AzureCostAnalysisService {

  constructor(private http: HttpClient,
    private currencyPipe: CurrencyPipe,
    private costAnalysisService: PublicCloudCostAnalysisService) { }

  getAcccounts(): Observable<AzureAccountsType[]> {
    return this.http.get<AzureAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: { page_size: 0, cost_analysis: true } });
  }

  convertToAccountViewData(accounts: AzureAccountsType[]): CloudCostAccountData[] {
    let gcpAccounts: CloudCostAccountData[] = [];
    accounts.map(ac => {
      let a: CloudCostAccountData = new CloudCostAccountData();
      a.uuid = ac.uuid;
      a.accountId = ac.id;
      a.accountName = ac.name;
      a.user = ac.user;
      a.userName = ac.user_name;
      a.userEmail = ac.user_email;
      a.subscriptionId = ac.subscription_id;
      gcpAccounts.push(a);
    })
    return gcpAccounts;
  }

  getCloudData(accountId: number): Observable<AzureWidget> {
    return this.http.get<AzureWidget>(GET_AZURE_CLOUD_DATA(accountId));
  }

  updateAccountWithCloudAssets(cloud: AzureWidget): AzureCloudAssetsViewData {
    let a: AzureCloudAssetsViewData = new AzureCloudAssetsViewData();
    a.vmInstances = cloud ? cloud.vm_instance : 0;
    a.loadBalancers = cloud ? cloud.load_balancer : 0;
    a.nic = cloud ? cloud.nic : 0;
    a.publicIps = cloud ? cloud.public_ips : 0;
    a.storageAccounts = cloud ? cloud.storage_account : 0;
    return a;
  }

  getTotalCost(accountId: number): Observable<CloudTotalCost> {
    return this.http.get<CloudTotalCost>(AZURE_TOTAL_COST(accountId))
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
  accountName: string;
  user: number;
  userName: string;
  userEmail: string;
  subscriptionId: string;
  cloudAssets: AzureCloudAssetsViewData;
  totalCostData: CloudTotalCostViewData;
  constructor() { }
}

export class AzureCloudAssetsViewData {
  vmInstances: number = 0;
  loadBalancers: number = 0;
  nic: number = 0;
  publicIps: number = 0;
  storageAccounts: number = 0;
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
