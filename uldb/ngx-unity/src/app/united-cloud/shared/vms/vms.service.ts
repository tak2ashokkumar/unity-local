import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { PRIVATE_CLOUD_FAST_BY_ID, CREATE_TASK_BY_CLOUD_ID_AND_PLATFORM, CREATE_TASK_BY_PLATFORM } from 'src/app/shared/api-endpoint.const';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { Observable } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Injectable({
  providedIn: 'root'
})
export class VmsService {

  platformType: string;

  constructor(private http: HttpClient, private appService: AppLevelService) { }

  getPrivateCloud(pcId: string): Observable<PrivateClouds> {
    return this.http.get<PrivateClouds>(PRIVATE_CLOUD_FAST_BY_ID(pcId));
  }

  createTaskAndPoll(cloudId: string, platformType: PlatFormMapping): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(cloudId ? CREATE_TASK_BY_CLOUD_ID_AND_PLATFORM(cloudId, platformType) : CREATE_TASK_BY_PLATFORM(platformType))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 200).pipe(take(1))), take(1));
  }
}