import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, take } from 'rxjs/operators';
import { CeleryTaskV2 } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { AppLevelService } from 'src/app/app-level.service';
import { CELERY_TASK_FOR_AWS_CLOUD_WATCH } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class PublicCloudAwsCloudwatchService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  getGraphs(params: {accountId: string}) {
    return this.http.get<CeleryTaskV2>(CELERY_TASK_FOR_AWS_CLOUD_WATCH(params.accountId))
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }
}
