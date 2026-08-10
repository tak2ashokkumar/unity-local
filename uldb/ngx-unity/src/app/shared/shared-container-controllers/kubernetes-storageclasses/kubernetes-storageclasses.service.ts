import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_STORAGE_CLASSES, KUBERNETES_SYNC_STORAGE_CLASSES } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesStorageclassType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { KUBERNETES_STATS_TOOLTIP } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Injectable()
export class KubernetesStorageclassesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getStorageclasses(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesStorageclassType>> {
    return this.tableService.getData<PaginatedResult<KubernetesStorageclassType>>(KUBERNETES_ACCOUNT_STORAGE_CLASSES(controllerId), criteria);
  }

  syncStorageclasses(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_STORAGE_CLASSES(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesStorageclassType[]): KubernetesStorageclassesViewdata[] {
    let viewData: KubernetesStorageclassesViewdata[] = [];
    items.map(item => {
      let a = new KubernetesStorageclassesViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.provisioner = item.provisioner ? item.provisioner : 'N/A';
      a.reclaimPolicy = item.reclaim_policy ? item.reclaim_policy : 'N/A';
      a.volumeBindingMode = item.volume_binding_mode ? item.volume_binding_mode : 'N/A';
      a.age = item.created_at ? item.created_at : 'N/A';
      a.monitoring = item.monitoring;
      a.statsTooltipMessage = KUBERNETES_STATS_TOOLTIP(item.monitoring);
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesStorageclassesViewdata {
  uuid: string;
  name: string;
  provisioner: string;
  reclaimPolicy: string;
  volumeBindingMode: string;
  age: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
