import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_CRONJOBS, KUBERNETES_SYNC_CRONJOBS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesCronjobType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class KubernetesCronjobsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getCronjobs(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesCronjobType>> {
    return this.tableService.getData<PaginatedResult<KubernetesCronjobType>>(KUBERNETES_ACCOUNT_CRONJOBS(controllerId), criteria);
  }

  syncCronjobs(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_CRONJOBS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesCronjobType[]): KubernetesCronjobsViewdata[] {
    let viewData: KubernetesCronjobsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesCronjobsViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.schedule = item.schedule ? item.schedule : 'N/A';
      a.suspend = item.suspend != null ? String(item.suspend) : 'N/A';
      a.active = String(item.active != null ? item.active : 0);
      a.lastSchedule = item.last_schedule_time ? this.utilSvc.toUnityOneDateFormat(item.last_schedule_time) : 'N/A';
      a.age = item.created_at ? this.utilSvc.toUnityOneDateFormat(item.created_at) : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesCronjobsViewdata {
  uuid: string;
  name: string;
  namespace: string;
  schedule: string;
  suspend: string;
  active: string;
  lastSchedule: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
