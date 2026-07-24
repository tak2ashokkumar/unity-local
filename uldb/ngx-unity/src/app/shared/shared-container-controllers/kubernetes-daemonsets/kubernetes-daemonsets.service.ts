import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { GET_KUBERNETES_DAEMONSETS, KUBERNETES_ACCOUNT_DAEMONSETS, KUBERNETES_SYNC_DAEMONSETS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesDaemonsetType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class KubernetesDaemonsetsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getDaemonsets(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesDaemonsetType>> {
    let url = controllerId ? KUBERNETES_ACCOUNT_DAEMONSETS(controllerId) : GET_KUBERNETES_DAEMONSETS();
    return this.tableService.getData<PaginatedResult<KubernetesDaemonsetType>>(url, criteria);
  }

  syncDaemonsets(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_DAEMONSETS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesDaemonsetType[]): KubernetesDaemonsetsViewdata[] {
    let viewData: KubernetesDaemonsetsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesDaemonsetsViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.desired = String(item.desired != null ? item.desired : 0);
      a.current = String(item.current != null ? item.current : 0);
      a.ready = String(item.ready != null ? item.ready : 0);
      a.available = String(item.available != null ? item.available : 0);
      a.age = item.created_at ? item.created_at : 'N/A';
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesDaemonsetsViewdata {
  uuid: string;
  name: string;
  namespace: string;
  desired: string;
  current: string;
  ready: string;
  available: string;
  age: string;
}
