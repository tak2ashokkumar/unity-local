
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PaginatedResult } from "src/app/shared/SharedEntityTypes/paginated.type";
import { MANAGE_SERVICE_NOW, SERVICE_NOW_LIST } from "src/app/shared/api-endpoint.const";
import { AppUtilityService } from "src/app/shared/app-utility/app-utility.service";
import { SearchCriteria } from "src/app/shared/table-functionality/search-criteria";
import { TableApiServiceService } from "src/app/shared/table-functionality/table-api-service.service";
import { ServiceNowAccountHistoryType, ServicenowAccounts } from "./usi-servicenow.type";
import { CustomDateRangeType } from "src/app/shared/SharedEntityTypes/unity-utils.type";

@Injectable()
export class UsiServicenowService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getServiceNowInstances(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<ServicenowAccounts>>(SERVICE_NOW_LIST(), criteria);
  }

  getInstancesHistory(instanceId: string, historyCurrentCriteria: SearchCriteria): Observable<PaginatedResult<ServiceNowAccountHistoryType>> {
    return this.tableService.getData<PaginatedResult<ServiceNowAccountHistoryType>>(`/customer/service_now/${instanceId}/ci_history/`, historyCurrentCriteria);
  }

  getDeviceTypes(instanceId: string): Observable<string[]> {
    return this.http.get<string[]>(`/customer/service_now/${instanceId}/device_types/`);
  }

  convertToViewdata(accounts: ServicenowAccounts[]): ServiceNowAccountsViewData[] {
    let viewData: ServiceNowAccountsViewData[] = [];
    accounts.map(account => {
      let data: ServiceNowAccountsViewData = new ServiceNowAccountsViewData();
      data.id = account.id;
      data.name = account.name;
      data.uuid = account.uuid;
      data.instanceUrl = account.instance_url;
      data.username = account.username;
      data.isDefault = account.is_default;
      data.isItsm = account.is_itsm;
      data.isCmdb = account.is_cmdb;
      data.isIRE = account.is_ire;
      data.allowDelete = account.allow_delete;
      data.user = account.user;
      data.tenants = account.tenants.length ? account.tenants.map(tenant => tenant.name) : [];
      data.tenantName = data.tenants.getFirst();
      data.tenantsBadgeCount = data.tenants.length ? account.tenants.length - 1 : 0;
      data.extraTenantsList = data.tenants.length ? data.tenants.slice(1) : [];
      viewData.push(data);
    });
    return viewData;
  }

  convertToInstanceHistoryViewdata(data: ServiceNowAccountHistoryType[]): ServiceNowAccountHistoryViewData[] {
    let viewData: ServiceNowAccountHistoryViewData[] = [];
    data.map(history => {
      let view: ServiceNowAccountHistoryViewData = new ServiceNowAccountHistoryViewData();
      view.deviceType = history.device_type ? this.utilSvc.toUpperCase(history.device_type) : 'NA';
      view.configurationData = history.ci_data ? JSON.stringify(history.ci_data) : 'NA';
      view.status = history.status == 'SUCCESS' ? 'Success' : 'Failed';
      view.executionTime = history.execution_time ? this.utilSvc.toUnityOneDateFormat(history.execution_time) : 'N/A';
      view.completionTime = history.completion_time ? this.utilSvc.toUnityOneDateFormat(history.completion_time) : 'N/A';
      viewData.push(view);
    });
    return viewData;
  }

  delete(snId: string) {
    return this.http.delete(MANAGE_SERVICE_NOW(snId));
  }
}

export class ServiceNowAccountsViewData {
  constructor() { }
  id: number;
  name: string;
  uuid: string;
  instanceUrl: string;
  username: string;
  isDefault: boolean;
  isItsm: boolean;
  isCmdb: boolean;
  isIRE: boolean;
  allowDelete: boolean;
  user: number;
  tenants: string[];
  tenantId: number;
  tenantName: string;
  extraTenantsList: string[];
  tenantsBadgeCount: number;
}

export class ServiceNowAccountHistoryViewData {
  constructor() { }
  deviceType: string;
  status: string;
  configurationData: string;
  executionTime: string;
  completionTime: string;
}

export const customDateRangeOptions: CustomDateRangeType[] = [
  { label: 'Last Hour', value: 'last_hour', valueAsFrequency: 'hourly' },
  { label: 'Last 24 hours', value: 'last_24h', valueAsFrequency: 'daily' },
  { label: 'Last 7 days', value: 'last_7d', valueAsFrequency: 'weekly' },
  { label: 'Last 30 days', value: 'last_30d', valueAsFrequency: 'monthly' },
]

export const DOWNLOAD_URL = (id: string, device_type: string, timeframe: string,serachValue: string) => `/customer/service_now/${id}/download_ci_history/?search=${serachValue}&device_type=${device_type}&timeframe=${timeframe}`;