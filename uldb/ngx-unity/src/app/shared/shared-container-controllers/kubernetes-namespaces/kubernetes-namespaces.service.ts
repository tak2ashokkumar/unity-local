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

@Injectable()
export class KubernetesNamespacesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

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
      a.cluster = item.account ? item.account.name : 'N/A';
      a.age = item.created_at ? item.created_at : 'N/A';
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesNamespacesViewdata {
  uuid: string;
  name: string;
  status: string;
  cluster: string;
  age: string;
}
