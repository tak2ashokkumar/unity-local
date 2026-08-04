import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_PVS, KUBERNETES_SYNC_PVS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesPersistentVolumeType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class KubernetesPersistentVolumesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getPersistentVolumes(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesPersistentVolumeType>> {
    return this.tableService.getData<PaginatedResult<KubernetesPersistentVolumeType>>(KUBERNETES_ACCOUNT_PVS(controllerId), criteria);
  }

  syncPersistentVolumes(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_PVS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesPersistentVolumeType[]): KubernetesPersistentVolumesViewdata[] {
    let viewData: KubernetesPersistentVolumesViewdata[] = [];
    items.map(item => {
      let a = new KubernetesPersistentVolumesViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.capacity = item.capacity ? item.capacity : 'N/A';
      a.accessModes = item.access_modes ? item.access_modes : 'N/A';
      a.reclaimPolicy = item.reclaim_policy ? item.reclaim_policy : 'N/A';
      a.status = item.status ? item.status : 'N/A';
      a.claim = (item.claim_namespace && item.claim_name) ? item.claim_namespace + '/' + item.claim_name : 'N/A';
      a.storageClass = item.storage_class ? item.storage_class : 'N/A';
      a.age = item.created_at ? item.created_at : 'N/A';
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesPersistentVolumesViewdata {
  uuid: string;
  name: string;
  capacity: string;
  accessModes: string;
  reclaimPolicy: string;
  status: string;
  claim: string;
  storageClass: string;
  age: string;
}
