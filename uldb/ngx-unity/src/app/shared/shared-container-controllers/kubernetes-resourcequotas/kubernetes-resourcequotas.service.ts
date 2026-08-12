import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_RESOURCE_QUOTAS, KUBERNETES_SYNC_RESOURCE_QUOTAS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesResourcequotaType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesResourcequotasService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getResourcequotas(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesResourcequotaType>> {
    return this.tableService.getData<PaginatedResult<KubernetesResourcequotaType>>(KUBERNETES_ACCOUNT_RESOURCE_QUOTAS(controllerId), criteria);
  }

  syncResourcequotas(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_RESOURCE_QUOTAS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesResourcequotaType[]): KubernetesResourcequotasViewdata[] {
    let viewData: KubernetesResourcequotasViewdata[] = [];
    items.map(item => {
      let a = new KubernetesResourcequotasViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.age = item.created_at ? this.utilSvc.toUnityOneDateFormat(item.created_at) : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesResourcequotasViewdata {
  uuid: string;
  name: string;
  namespace: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
