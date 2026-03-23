import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { OCIAccountType } from 'src/app/united-cloud/public-cloud/entities/oci-account.type';
import { OciAccountScheduleHistory } from './usi-public-cloud-oracle.type';

@Injectable()
export class UsiPublicCloudOracleService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getAccounts(criteria: SearchCriteria): Observable<PaginatedResult<OCIAccountType>> {
    return this.tableService.getData<PaginatedResult<OCIAccountType>>(`/customer/integration/oci/accounts/`, criteria);
  }

  convertToViewData(data: OCIAccountType[]): OCIAccountViewData[] {
    let viewData: OCIAccountViewData[] = [];
    data.map(acc => {
      let a = new OCIAccountViewData();
      a.uuid = acc.uuid;
      a.name = acc.name;
      a.userOcid = acc.user_ocid;
      a.tenancyOcid = acc.tenancy_ocid;
      a.region = acc.region;
      viewData.push(a);
    });
    return viewData;
  }

  deleteAccount(accountId: string) {
    return this.http.delete(`/customer/integration/oci/accounts/${accountId}/`);
  }

  syncNow(accountId: string) {
    return this.http.get<CeleryTask>(`/customer/integration/oci/accounts/${accountId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  getScheduleHistory(criteria: SearchCriteria, accountId: string): Observable<PaginatedResult<OciAccountScheduleHistory>> {
    return this.tableService.getData(`/customer/integration/oci/accounts/${accountId}/schedule_history/`, criteria).pipe(
      map((res: PaginatedResult<OciAccountScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  convertToHistoryViewData(history: OciAccountScheduleHistory[]): OciAccountScheduleHistoryViewData[] {
    let viewData: OciAccountScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: OciAccountScheduleHistoryViewData = new OciAccountScheduleHistoryViewData()
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

export class OCIAccountViewData {
  constructor() { }
  uuid: string;
  name: string;
  userOcid: string;
  tenancyOcid: string;
  region: string;
  syncInProgress: boolean = false;
}

export class OciAccountScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}