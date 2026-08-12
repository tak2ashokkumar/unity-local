import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_DEPLOYMENTS, KUBERNETES_SYNC_DEPLOYMENTS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesDeploymentType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesDeploymentsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getDeployments(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesDeploymentType>> {
    return this.tableService.getData<PaginatedResult<KubernetesDeploymentType>>(KUBERNETES_ACCOUNT_DEPLOYMENTS(controllerId), criteria);
  }

  syncDeployments(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_DEPLOYMENTS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesDeploymentType[]): KubernetesDeploymentsViewdata[] {
    let viewData: KubernetesDeploymentsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesDeploymentsViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.ready = (item.ready_replicas || 0) + '/' + (item.desired_replicas || 0);
      a.upToDate = String(item.updated_replicas != null ? item.updated_replicas : 0);
      a.available = String(item.available_replicas != null ? item.available_replicas : 0);
      a.age = item.created_at ? this.utilSvc.toUnityOneDateFormat(item.created_at) : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesDeploymentsViewdata {
  uuid: string;
  name: string;
  namespace: string;
  ready: string;
  upToDate: string;
  available: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
