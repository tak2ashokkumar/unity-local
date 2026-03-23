import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { PublicCloudCostAnalysisService } from '../public-cloud-cost-analysis.service';
import { Observable } from 'rxjs';
import { GET_OCI_ACOUNTS, OCI_TOTAL_COST, GET_OCI_CLOUD_DATA } from 'src/app/shared/api-endpoint.const';
import { CloudTotalCostData, CloudTotalCost } from '../public-cloud-cost-analysis.type';
import { DashboardOCICloud, OCIWidget } from 'src/app/app-home/infra-as-a-service/public-cloud/oci.type';

@Injectable()
export class OciCostAnalysisService {

  constructor(private http: HttpClient,
    private currencyPipe: CurrencyPipe,
    private costAnalysisService: PublicCloudCostAnalysisService) { }

  getAcccounts(): Observable<DashboardOCICloud[]> {
    return this.http.get<DashboardOCICloud[]>(GET_OCI_ACOUNTS(), { params: new HttpParams().set('page_size', '0').set('cost_analysis', true) });
  }

  convertToAccountViewData(accounts: DashboardOCICloud[]): CloudCostAccountData[] {
    let gcpAccounts: CloudCostAccountData[] = [];
    accounts.map(ac => {
      let a: CloudCostAccountData = new CloudCostAccountData();
      a.uuid = ac.uuid;
      a.accountId = ac.id;
      a.user = ac.name;
      gcpAccounts.push(a);
    })
    return gcpAccounts;
  }

  getCloudData(accountId: number): Observable<OCIWidget> {
    return this.http.get<OCIWidget>(GET_OCI_CLOUD_DATA(accountId));
  }

  updateAccountWithCloudAssets(cloud: OCIWidget): OCICloudAssetsViewData {
    let a: OCICloudAssetsViewData = new OCICloudAssetsViewData();
    a.vmInstances = cloud.instances_count;
    a.bucketsCount = cloud.buckets_count;
    a.httpMonitors = cloud.http_monitor_count;
    a.managedDatabases = cloud.database_count;
    return a;
  }

  getTotalCost(accountId: string): Observable<CloudTotalCost> {
    return this.http.get<CloudTotalCost>(OCI_TOTAL_COST(accountId))
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
  cloudAssets: OCICloudAssetsViewData;
  totalCostData: CloudTotalCostViewData;
  constructor() { }
}

export class OCICloudAssetsViewData {
  vmInstances: number = 0;
  bucketsCount: number = 0;
  httpMonitors: number = 0;
  managedDatabases: number = 0;
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
