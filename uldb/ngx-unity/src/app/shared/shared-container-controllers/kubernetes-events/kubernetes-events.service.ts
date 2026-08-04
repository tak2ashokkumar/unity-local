import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_EVENTS, KUBERNETES_SYNC_EVENTS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesEventType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class KubernetesEventsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getEvents(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesEventType>> {
    return this.tableService.getData<PaginatedResult<KubernetesEventType>>(KUBERNETES_ACCOUNT_EVENTS(controllerId), criteria);
  }

  syncEvents(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_EVENTS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesEventType[]): KubernetesEventsViewdata[] {
    let viewData: KubernetesEventsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesEventsViewdata();
      a.uuid = item.uuid;
      a.type = item.event_type ? item.event_type : 'N/A';
      a.reason = item.reason ? item.reason : 'N/A';
      a.object = item.involved_object_name ? item.involved_object_name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.message = item.message ? item.message : 'N/A';
      a.count = String(item.count != null ? item.count : 0);
      a.lastSeen = item.last_time ? item.last_time : 'N/A';
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesEventsViewdata {
  uuid: string;
  type: string;
  reason: string;
  object: string;
  namespace: string;
  message: string;
  count: string;
  lastSeen: string;
}
