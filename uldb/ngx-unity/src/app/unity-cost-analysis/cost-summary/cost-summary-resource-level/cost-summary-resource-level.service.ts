import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CloudFilter, ResourceLevelCostSummary, ResourceCostItem, AccountFilterItem } from '../cost-summary.type';
import { AppLevelService } from 'src/app/app-level.service';
import { UnityChartConfigService } from 'src/app/shared/unity-chart-config.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class CostSummaryResourceLevelService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private chartConfigSvc: UnityChartConfigService,
    private appService: AppLevelService,) { }

  getCloudFilter(): Observable<CloudFilter> {
    return this.http.get<CloudFilter>('/customer/cloud_cost_summary/list_clouds/')
  }

  getSummaryData(criteria: SearchCriteria): Observable<ResourceLevelCostSummary> {
    return this.tableService.getData<ResourceLevelCostSummary>('/customer/cloud_cost_summary/resource_cost_overview/', criteria)
  }
  getResourcesTableData(criteria: SearchCriteria): Observable<PaginatedResult<ResourceCostItem>> {
    return this.tableService.getData<PaginatedResult<ResourceCostItem>>('/customer/cloud_cost_summary/get_resources_costs', criteria)

  }

  getAccountFilter(criteria: SearchCriteria): Observable<AccountFilterItem[]> {
    return this.tableService.getData<AccountFilterItem[]>('/customer/cloud_fast/?is_managed=True', criteria)
  }
  getServicesFilter(criteria: SearchCriteria): Observable<string[]> {
    return this.tableService.getData<string[]>('/customer/cloud_cost_summary/clouds_service_list', criteria)
  }

  convertToResourceTableViewData(data: ResourceCostItem[]): ResourceCostItemViewData[] {
    const viewData: ResourceCostItemViewData[] = [];

    data.forEach(item => {
      item.cost_data.forEach(costItem => {
        const viewItem = new ResourceCostItemViewData();
        viewItem.amount = costItem.amount;
        viewItem.resourceName = costItem.resource_name;
        viewItem.resourceType = costItem.resource_type;
        viewItem.accountName = item.account_name;
        viewItem.service = costItem.service;

        viewData.push(viewItem);
      });
    });

    return viewData;
  }




  convertToSummaryViewData(data: ResourceLevelCostSummary): ResourceLevelCostSummaryViewData {
    const viewData = new ResourceLevelCostSummaryViewData();

    viewData.totalMonthCost = Math.ceil(data.summary.total_month_cost);
    viewData.totalEstimateCost = data.summary.total_estimate_cost
    viewData.totalAccounts = data.summary.total_accounts
    viewData.totalPreviousMonthCost = data.summary.total_previous_month_cost
    viewData.totalResources = data.summary.total_resources
    viewData.overallChangeType = data.summary.overall_change_type
    viewData.changeClass = data.summary.overall_change_type == 'increased' ? 'text-danger' : 'text-success'
    viewData.arrowClass = data.summary.overall_change_type == 'increased' ? 'fa-caret-up' : 'fa-caret-down'
    viewData.totalServices = data.summary.total_services
    viewData.totalPercentageChange = data.summary.total_percentage_change
    viewData.colSpace = data.cloud_summary.length > 3 ? 'col-4' : 'col-3';

    viewData.cloudSummary = data.cloud_summary.map(item => {
      const cs = new CloudSummaryItemViewData();
      cs.totalCost = item.total_cost;
      cs.name = item.name;
      cs.cloudImage = item.cloud_image && item.cloud_image != '' ? `${environment.assetsUrl}${item.cloud_image}` : null;
      return cs;
    });
    return viewData;
  }

  // convertToResourceTableViewData(data:ResourceCostItemViewData):

}

export class ResourceLevelCostSummaryViewData {
  constructor() { }

  totalMonthCost: number;
  totalEstimateCost: number;
  totalAccounts: number;
  totalPreviousMonthCost: number;
  totalResources: number;
  totalPercentageChange: number;
  changeClass: string;
  arrowClass: string;
  overallChangeType: string;
  totalServices: number;
  colSpace: string;
  cloudSummary: CloudSummaryItemViewData[]

}

export class CloudSummaryItemViewData {
  constructor() { }
  totalCost: number;
  name: string;
  cloudImage: string;
}

// export class ResourceCostItemViewData {
//   constructor() { }
//   cloudType: string;
//   totalCost: number;
//   accountUuid: string;
//   costData: CostDataItemViewdata[];
//   accountName: string;
//   unit: string;
// }

export class ResourceCostItemViewData {
  constructor() { }
  amount: number;
  resourceName: string;
  resourceType: string;
  accountName: string;
  service: string;
}
// export class CostDataItemViewdata {
//   constructor() { }
//   amount: number;
//   resourceName: string;
//   service: string;
// }



