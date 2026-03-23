import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { BMCHelixAccountHistoryType } from './usi-bmc-helix.type';

@Injectable()
export class UsiBmcHelixService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getInstances(criteria: SearchCriteria): Observable<PaginatedResult<BmcHelixAccountsType>> {
    return this.tableService.getData<PaginatedResult<BmcHelixAccountsType>>(`/customer/bmc_helix/`, criteria);
  }

  getInstancesHistory(instanceId: string, historyCurrentCriteria: SearchCriteria): Observable<PaginatedResult<BMCHelixAccountHistoryType>> {
    return this.tableService.getData<PaginatedResult<BMCHelixAccountHistoryType>>(`/customer/bmc_helix/${instanceId}/ci_history/`, historyCurrentCriteria);
  }

  convertToViewdata(accounts: BmcHelixAccountsType[]): BmcHelixAccountsViewData[] {
    let viewData: BmcHelixAccountsViewData[] = [];
    accounts.map(account => {
      let data: BmcHelixAccountsViewData = new BmcHelixAccountsViewData();
      data.id = account.id;
      data.name = account.name;
      data.uuid = account.uuid;
      data.cmdbUrl = account.cmdb_url;
      data.username = account.username;
      data.isDefault = account.is_default;
      data.isItsm = account.is_itsm;
      data.isCmdb = account.is_cmdb;
      data.isWorkFlow = account.is_workflow;
      data.workflowUrl = account.workflow_url;
      data.allowCmdbDelete = account.allow_cmdb_delete;
      viewData.push(data);
    });
    return viewData;
  }

  convertToInstanceHistoryViewdata(data: BMCHelixAccountHistoryType[]): BmcHelixAccountHistoryViewData[] {
    let viewData: BmcHelixAccountHistoryViewData[] = [];
    data.map(history => {
      let view: BmcHelixAccountHistoryViewData = new BmcHelixAccountHistoryViewData();
      view.deviceType = history.device_type ? this.utilSvc.toUpperCase(history.device_type) : 'NA';
      view.configurationData = history.ci_data ? JSON.stringify(history.ci_data) : 'NA';
      view.status = history.status == 'SUCCESS' ? 'Success' : 'Failed';
      view.executionTime = history.execution_time ? this.utilSvc.toUnityOneDateFormat(history.execution_time) : 'N/A';
      view.completionTime = history.completion_time ? this.utilSvc.toUnityOneDateFormat(history.completion_time) : 'N/A';
      viewData.push(view);
    });
    return viewData;
  }

  delete(bmcHelixId: string) {
    return this.http.delete(`/customer/bmc_helix/${bmcHelixId}`);
  }

}

export class BmcHelixAccountsViewData {
  constructor() { }
  id: number;
  name: string;
  cmdbUrl: string;
  uuid: string;
  username: string;
  isCmdb: boolean;
  isDefault: boolean;
  isItsm: boolean;
  isWorkFlow: boolean;
  workflowUrl: string;
  allowCmdbDelete: boolean;
}

export class BmcHelixAccountHistoryViewData {
  constructor() { }
  configurationData: string;
  deviceType: string
  status: string;
  executionTime: string;
  completionTime: string;
}

export interface BmcHelixAccountsType {
  id: number;
  name: string;
  uuid: string;
  instance_url: string;
  cmdb_url: string;
  itsm_url: string;
  workflow_url: string;
  is_itsm: boolean;
  is_cmdb: boolean;
  allow_cmdb_delete: boolean;
  is_workflow: boolean;
  is_default: boolean;
  username: string;
  user: number;
  customer: number;
}