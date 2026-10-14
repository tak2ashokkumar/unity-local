import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { EsxiScheduleHistory, EsxiServerAccount } from './private-cloud-esxi.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable()
export class PrivateCloudEsxiService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getAccounts(criteria: SearchCriteria): Observable<PaginatedResult<EsxiServerAccount>> {
    return this.tableService.getData<PaginatedResult<EsxiServerAccount>>(`/customer/integration/esxi/accounts/`, criteria);
  }

  deleteAccount(instanceId: string) {
    return this.http.delete(`/customer/integration/esxi/accounts/${instanceId}`);
  }

  syncNow(instanceId: string) {
    return this.http.get<CeleryTask>(`customer/integration/esxi/accounts/${instanceId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
  }

  getScheduleHistory(criteria: SearchCriteria, accountId: string): Observable<PaginatedResult<EsxiScheduleHistory>> {
    return this.tableService.getData(`/customer/integration/esxi/accounts/${accountId}/schedule_history/`, criteria).pipe(
      map((res: PaginatedResult<EsxiScheduleHistory>) => {
        res.results = res.results.map(history => {
          history.completed_at = history.completed_at ? this.utilSvc.toUnityOneDateFormat(history.completed_at) : null;
          return history;
        });
        return res;
      })
    );
  }

  convertToViewData(data: EsxiServerAccount[]): EsxiViewData[] {
    return (data || []).map((item: EsxiServerAccount) => {
      const serverList = (item?.servers || []).map(server => server.name).filter(Boolean);

      return {
        uuid: item?.uuid || '',
        name: item?.name || '',
        colocationCloud: item?.colocation_cloud?.name || '',
        collector: item?.collector?.name || '',
        serverList,
        server: serverList.length ? serverList[0] : '',
        extraServers: serverList.length ? serverList.slice(1) : [],
        syncInProgress: false
      };
    });
  }


  convertToHistoryViewData(history: EsxiScheduleHistory[]): EsxiScheduleHistoryViewData[] {
    let viewData: EsxiScheduleHistoryViewData[] = [];
    history.map(h => {
      let a: EsxiScheduleHistoryViewData = new EsxiScheduleHistoryViewData();
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

export class EsxiViewData {
  uuid: string;
  name: string;
  colocationCloud: string;
  collector: string;
  serverList: string[];
  server: string;
  extraServers: string[];
  syncInProgress: boolean;
}

export class EsxiScheduleHistoryViewData {
  constructor() { }
  lastRun: string;
  duration: string;
  updatedBy: string;
  status: string;
  statusClass: string;
  isInProgress: boolean;
  startedAt: string;
}


