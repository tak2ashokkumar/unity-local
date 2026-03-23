import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ManageEngineInstanceHistoryType, ManageEngineInstanceType } from './usi-manage-engine.type';

@Injectable()
export class UsiManageEngineService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getInstances(criteria: SearchCriteria): Observable<PaginatedResult<ManageEngineInstanceType>> {
    return this.tableService.getData<PaginatedResult<ManageEngineInstanceType>>(`/customer/manage_engine/`, criteria);
  }

  getInstancesHistory(instanceId: string, historyCurrentCriteria: SearchCriteria): Observable<PaginatedResult<ManageEngineInstanceHistoryType>> {
    return this.tableService.getData<PaginatedResult<ManageEngineInstanceHistoryType>>(`/customer/manage_engine_cmdb/${instanceId}/ci_history/`, historyCurrentCriteria);
  }

  convertToViewdata(accounts: ManageEngineInstanceType[]): ManageEngineInstancesViewData[] {
    let viewData: ManageEngineInstancesViewData[] = [];
    accounts.map(account => {
      let data: ManageEngineInstancesViewData = new ManageEngineInstancesViewData();
      data.id = account.id;
      data.uuid = account.uuid;
      data.name = account.name;
      data.instanceUrl = account.instance_url;
      data.isCmdb = account.is_cmdb;
      data.isWorkFlow = account.is_workflow;
      data.isDefault = account.is_default;
      data.allowDelete = account.allow_delete;
      viewData.push(data);
    });
    return viewData;
  }

  convertToInstanceHistoryViewdata(data: ManageEngineInstanceHistoryType[]): ManageEngineInstanceHistoryViewData[] {
    let viewData: ManageEngineInstanceHistoryViewData[] = [];
    data.map(history => {
      let view: ManageEngineInstanceHistoryViewData = new ManageEngineInstanceHistoryViewData();
      view.deviceType = history.device_type ? this.utilSvc.toUpperCase(history.device_type) : 'NA';
      view.configurationData = history.ci_data ? JSON.stringify(history.ci_data) : 'NA';
      view.status = history.status == 'SUCCESS' ? 'Success' : 'Failed';
      view.executionTime = history.execution_time ? this.utilSvc.toUnityOneDateFormat(history.execution_time) : 'N/A';
      view.completionTime = history.completion_time ? this.utilSvc.toUnityOneDateFormat(history.completion_time) : 'N/A';
      viewData.push(view);
    });
    return viewData;
  }

  delete(manageEngineId: string) {
    return this.http.delete(`/customer/manage_engine/${manageEngineId}`);
  }
}

export class ManageEngineInstancesViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
  instanceUrl: string;
  isCmdb: boolean;
  isWorkFlow: boolean;
  allowDelete: boolean;
  isDefault: boolean;
}

export class ManageEngineInstanceHistoryViewData {
  constructor() { }
  deviceType: string;
  configurationData: string;
  status: string;
  executionTime: string;
  completionTime: string;
}
