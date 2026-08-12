import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_NAMESPACES, KUBERNETES_SYNC_NAMESPACES } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesNamespaceType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP, KUBERNETES_STATUS_ICON } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesNamespacesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getNamespaces(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesNamespaceType>> {
    return this.tableService.getData<PaginatedResult<KubernetesNamespaceType>>(KUBERNETES_ACCOUNT_NAMESPACES(controllerId), criteria);
  }

  syncNamespaces(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_NAMESPACES(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesNamespaceType[]): KubernetesNamespacesViewdata[] {
    let viewData: KubernetesNamespacesViewdata[] = [];
    items.map(item => {
      let a = new KubernetesNamespacesViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.status = item.status ? item.status : 'N/A';
      a.statusIcon = KUBERNETES_STATUS_ICON(item.status);
      a.cluster = item.account ? item.account.name : 'N/A';
      a.age = item.created_at ? this.utilSvc.toUnityOneDateFormat(item.created_at) : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesNamespacesViewdata {
  uuid: string;
  name: string;
  status: string;
  statusIcon: string;
  cluster: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
