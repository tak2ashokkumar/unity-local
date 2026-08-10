import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_STATEFULSETS, KUBERNETES_SYNC_STATEFULSETS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesStatefulsetType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Injectable()
export class KubernetesStatefulsetsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getStatefulsets(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesStatefulsetType>> {
    return this.tableService.getData<PaginatedResult<KubernetesStatefulsetType>>(KUBERNETES_ACCOUNT_STATEFULSETS(controllerId), criteria);
  }

  syncStatefulsets(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_STATEFULSETS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesStatefulsetType[]): KubernetesStatefulsetsViewdata[] {
    let viewData: KubernetesStatefulsetsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesStatefulsetsViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.ready = (item.ready_replicas || 0) + '/' + (item.desired_replicas || 0);
      a.age = item.created_at ? item.created_at : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesStatefulsetsViewdata {
  uuid: string;
  name: string;
  namespace: string;
  ready: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
