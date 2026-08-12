import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_CONTROL_PLANE, KUBERNETES_SYNC_CONTROL_PLANE } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesControlplaneComponentType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesControlplaneComponentsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getControlplaneComponents(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesControlplaneComponentType>> {
    return this.tableService.getData<PaginatedResult<KubernetesControlplaneComponentType>>(KUBERNETES_ACCOUNT_CONTROL_PLANE(controllerId), criteria);
  }

  syncControlplaneComponents(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_CONTROL_PLANE(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesControlplaneComponentType[]): KubernetesControlplaneComponentsViewdata[] {
    let viewData: KubernetesControlplaneComponentsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesControlplaneComponentsViewdata();
      a.uuid = item.uuid;
      a.component = item.component ? item.component : 'N/A';
      a.pod = item.pod_name ? item.pod_name : 'N/A';
      a.node = item.node_name ? item.node_name : 'N/A';
      a.phase = item.phase ? item.phase : 'N/A';
      a.age = item.created_at ? this.utilSvc.toUnityOneDateFormat(item.created_at) : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesControlplaneComponentsViewdata {
  uuid: string;
  component: string;
  pod: string;
  node: string;
  phase: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
