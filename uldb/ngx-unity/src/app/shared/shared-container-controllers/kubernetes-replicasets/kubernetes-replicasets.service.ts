import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_REPLICASETS, KUBERNETES_SYNC_REPLICASETS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesReplicasetType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Injectable()
export class KubernetesReplicasetsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getReplicasets(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesReplicasetType>> {
    return this.tableService.getData<PaginatedResult<KubernetesReplicasetType>>(KUBERNETES_ACCOUNT_REPLICASETS(controllerId), criteria);
  }

  syncReplicasets(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_REPLICASETS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesReplicasetType[]): KubernetesReplicasetsViewdata[] {
    let viewData: KubernetesReplicasetsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesReplicasetsViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.desired = String(item.desired_replicas != null ? item.desired_replicas : 0);
      a.ready = String(item.ready_replicas != null ? item.ready_replicas : 0);
      a.available = String(item.available_replicas != null ? item.available_replicas : 0);
      a.age = item.created_at ? item.created_at : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesReplicasetsViewdata {
  uuid: string;
  name: string;
  namespace: string;
  desired: string;
  ready: string;
  available: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
