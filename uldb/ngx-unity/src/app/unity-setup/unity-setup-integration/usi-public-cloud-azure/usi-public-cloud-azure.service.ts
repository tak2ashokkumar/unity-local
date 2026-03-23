import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AzureAccount, AzureAccountCredentialsType, AzureAccountScheduleHistory } from 'src/app/shared/SharedEntityTypes/azure.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsiPublicCloudAzureService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getInstances(criteria: SearchCriteria): Observable<PaginatedResult<AzureAccount>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AzureAccount>>(`/customer/integration/azure/accounts/`, { params: params });
  }

  convertToViewData(data: AzureAccount[]): AzureAccountViewData[] {
    let viewData: AzureAccountViewData[] = [];
    data.map(d => {
      let a = new AzureAccountViewData();
      a.uuid = d.uuid;
      a.accountName = d.name;
      a.subscriptionId = d.subscription_id;
      a.manage = d.is_managed ? 'True' : 'False';
      viewData.push(a);
    })
    return viewData;
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/integration/azure/accounts/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  getScheduleHistory(criteria: SearchCriteria, accountId: string): Observable<PaginatedResult<AzureAccountScheduleHistory>> {
    return this.tableService.getData(`/customer/integration/azure/accounts/${accountId}/schedule_history/`, criteria).pipe(
      map((res: PaginatedResult<AzureAccountScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  convertToHistoryViewData(history: AzureAccountScheduleHistory[]): AzureAccountScheduleHistoryViewData[] {
    let viewData: AzureAccountScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: AzureAccountScheduleHistoryViewData = new AzureAccountScheduleHistoryViewData()
      a.duration = h.duration ? h.duration : 'N/A';
      a.updatedBy = h.executed_by ? h.executed_by : 'N/A';
      a.startedAt = h.started_at ?this.utilSvc.toUnityOneDateFormat(h.started_at) : 'N/A';
      a.lastRun = h.completed_at ? this.utilSvc.toUnityOneDateFormat(h.completed_at) : 'N/A';

      a.isInProgress = h.status == 'Initiated' || h.status == 'IN' ? true : false;
      a.status = a.isInProgress ? 'In Progress' : h.status;
      switch (h.status) {
        case 'Completed': a.statusClass = 'text-success'; break;
        case 'IN':
        case 'Initiated': a.statusClass = 'text-warning'; break;
        case 'Cancelled':
        case 'Failed': a.statusClass = 'text-danger'; break;
        default: a.statusClass = '';
      }
      viewData.push(a);
    })
    return viewData;
  }

  buildUpdateCredentialsForm(): FormGroup {
    return this.builder.group({
      'client_id': ['', [Validators.required, NoWhitespaceValidator]],
      'tenant_id': ['', [Validators.required, NoWhitespaceValidator]],
      'client_secret': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetUpdateCredentialsFormErrors() {
    return {
      'client_id': '',
      'tenant_id': '',
      'client_secret': '',
    }
  }

  updateCredentialsFormValidationMessages = {
    'client_id': {
      'required': 'Client ID is required',
    },
    'tenant_id': {
      'required': 'Tenant ID is required'
    },
    'client_secret': {
      'required': 'Client Secret is required'
    },
  }

  updateCredentials(azureAccountId: string, data: AzureAccountCredentialsType) {
    return this.http.patch<AzureAccountCredentialsType>(`/customer/integration/azure/accounts/${azureAccountId}/update_credentials/`, data);
  }

  deleteInstance(instanceId: string) {
    return this.http.delete(`/customer/integration/azure/accounts/${instanceId}/`);
  }
}

export class AzureAccountViewData {
  constructor() { }
  uuid: string;
  accountName: string;
  subscriptionId: string;
  manage: string;
  syncInProgress: boolean = false;
}

export class AzureAccountScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}