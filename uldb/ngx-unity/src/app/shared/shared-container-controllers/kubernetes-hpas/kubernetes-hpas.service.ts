import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_HPAS, KUBERNETES_SYNC_HPAS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesHpaType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesHpasService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getHpas(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesHpaType>> {
    return this.tableService.getData<PaginatedResult<KubernetesHpaType>>(KUBERNETES_ACCOUNT_HPAS(controllerId), criteria);
  }

  syncHpas(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_HPAS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesHpaType[]): KubernetesHpasViewdata[] {
    let viewData: KubernetesHpasViewdata[] = [];
    items.map(item => {
      let a = new KubernetesHpasViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.reference = (item.scale_target_kind || '') + '/' + (item.scale_target_name || '');
      a.targets = String(item.current_cpu_utilization != null ? item.current_cpu_utilization : 0) + '%/' + String(item.target_cpu_utilization != null ? item.target_cpu_utilization : 0) + '%';
      a.minPods = String(item.min_replicas != null ? item.min_replicas : 0);
      a.maxPods = String(item.max_replicas != null ? item.max_replicas : 0);
      a.replicas = String(item.current_replicas != null ? item.current_replicas : 0);
      a.age = item.created_at ? this.utilSvc.toUnityOneDateFormat(item.created_at) : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesHpasViewdata {
  uuid: string;
  name: string;
  namespace: string;
  reference: string;
  targets: string;
  minPods: string;
  maxPods: string;
  replicas: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
