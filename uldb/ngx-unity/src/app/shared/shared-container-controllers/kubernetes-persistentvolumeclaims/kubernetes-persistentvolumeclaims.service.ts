import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { GET_KUBERNETES_PERSISTENTVOLUMECLAIMS, KUBERNETES_ACCOUNT_PVCS, KUBERNETES_SYNC_PVCS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesPersistentVolumeClaimType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class KubernetesPersistentVolumeClaimsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getPersistentVolumeClaims(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesPersistentVolumeClaimType>> {
    let url = controllerId ? KUBERNETES_ACCOUNT_PVCS(controllerId) : GET_KUBERNETES_PERSISTENTVOLUMECLAIMS();
    return this.tableService.getData<PaginatedResult<KubernetesPersistentVolumeClaimType>>(url, criteria);
  }

  syncPersistentVolumeClaims(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_PVCS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesPersistentVolumeClaimType[]): KubernetesPersistentVolumeClaimsViewdata[] {
    let viewData: KubernetesPersistentVolumeClaimsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesPersistentVolumeClaimsViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.status = item.status ? item.status : 'N/A';
      a.volume = item.volume_name ? item.volume_name : 'N/A';
      a.capacity = item.capacity ? item.capacity : 'N/A';
      a.storageClass = item.storage_class ? item.storage_class : 'N/A';
      a.age = item.created_at ? item.created_at : 'N/A';
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesPersistentVolumeClaimsViewdata {
  uuid: string;
  name: string;
  namespace: string;
  status: string;
  volume: string;
  capacity: string;
  storageClass: string;
  age: string;
}
