import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { KUBERNETES_ACCOUNT_JOBS, KUBERNETES_SYNC_JOBS } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { KubernetesJobType } from 'src/app/shared/SharedEntityTypes/kubernetes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class KubernetesJobsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService) { }

  getJobs(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<KubernetesJobType>> {
    return this.tableService.getData<PaginatedResult<KubernetesJobType>>(KUBERNETES_ACCOUNT_JOBS(controllerId), criteria);
  }

  syncJobs(controllerId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(KUBERNETES_SYNC_JOBS(controllerId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  convertToViewdata(items: KubernetesJobType[]): KubernetesJobsViewdata[] {
    let viewData: KubernetesJobsViewdata[] = [];
    items.map(item => {
      let a = new KubernetesJobsViewdata();
      a.uuid = item.uuid;
      a.name = item.name ? item.name : 'N/A';
      a.namespace = item.namespace ? item.namespace : 'N/A';
      a.completions = (item.succeeded || 0) + '/' + (item.completions || 0);
      a.age = item.created_at ? item.created_at : 'N/A';
      viewData.push(a);
    });
    return viewData;
  }
}

export class KubernetesJobsViewdata {
  uuid: string;
  name: string;
  namespace: string;
  completions: string;
  age: string;
}
