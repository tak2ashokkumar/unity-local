import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CeleryTaskV2 } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { GET_AWS_INSTANCE_DETAILS } from 'src/app/shared/api-endpoint.const';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class AwsCloudWatchDetailsService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  getInstanceDetails(accountId: string) {
    return this.http.get<CeleryTaskV2>(GET_AWS_INSTANCE_DETAILS(accountId))
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }
}
