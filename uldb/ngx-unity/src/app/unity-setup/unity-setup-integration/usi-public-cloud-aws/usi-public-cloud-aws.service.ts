import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AwsAccountScheduleHistory, AWSIntegrationAccountType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsiPublicCloudAwsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getInstances(criteria: SearchCriteria): Observable<PaginatedResult<AWSIntegrationAccountType>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AWSIntegrationAccountType>>(`/customer/integration/aws/accounts/`, { params: params });
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/integration/aws/accounts/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  convertToViewData(accounts: AWSIntegrationAccountType[]): AWSAccountViewData[] {
    let viewData: AWSAccountViewData[] = [];
    accounts.map(account => {
      let data = new AWSAccountViewData();
      data.uuid = account.uuid;
      data.userName = account.name;
      data.accountName = account.name;
      data.discoveryService = account.discover_services;
      data.accessKey = account.access_key;
      data.manage = account.is_managed ? 'True' : 'False';
      viewData.push(data);
    });
    return viewData;
  }

  resetAccessKeyFormErrors() {
    return {
      'access_key': '',
      'secret_key': ''
    };
  }

  accessKeyValidationMessages = {
    'access_key': {
      'required': 'Access Key is required'
    },
    'secret_key': {
      'required': 'Secret Key is required'
    }
  }

  createAccessKeyForm(view: AWSAccountViewData): FormGroup {
    return this.builder.group({
      'access_key': [view.accessKey, [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required]]
    });
  }

  updateAPIKeys(uuid: string, data: { access_key: string, secret_key: string }) {
    return this.http.post(`/customer/integration/aws/accounts/${uuid}/change_password/`, data);
  }

  deleteInstance(instanceId: string) {
    return this.http.delete(`/customer/integration/aws/accounts/${instanceId}/`);
  }

  getScheduleHistory(criteria: SearchCriteria, accountId: string): Observable<PaginatedResult<AwsAccountScheduleHistory>> {
    return this.tableService.getData(`/customer/integration/aws/accounts/${accountId}/schedule_history/`, criteria).pipe(
      map((res: PaginatedResult<AwsAccountScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  convertToHistoryViewData(history: AwsAccountScheduleHistory[]): AwsAccountScheduleHistoryViewData[] {
    let viewData: AwsAccountScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: AwsAccountScheduleHistoryViewData = new AwsAccountScheduleHistoryViewData()
      a.duration = h.duration ? h.duration : 'N/A';
      a.updatedBy = h.executed_by ? h.executed_by : 'N/A';
      a.startedAt = h.started_at ? this.utilSvc.toUnityOneDateFormat(h.started_at) : 'N/A';
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
}

export class AWSAccountViewData {
  constructor() { }
  userName: string;
  accountName: string;
  uuid: string;
  accessKey: string;
  discoveryService: string;
  manage: string;
  syncInProgress: boolean = false;
}

export class AwsAccountScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}
