import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, concat, interval, Observable, of, timer } from 'rxjs';
import { catchError, concatMap, delay, first, map, skip, switchMap, take, takeWhile, tap } from 'rxjs/operators';
import { MappedMonitoringTool } from './shared/SharedEntityTypes/monitoring-tool-mapping.type';
import { ExecutionStatus, StatusState, TaskError, TaskStatus } from './shared/SharedEntityTypes/task-status.type';
import { ACTIVITY_LOG, CHECK_TASK_STATUS_BY_TASK_ID, CHECK_TASK_STATUS_BY_TASK_ID_AS_PARAMS, GET_ALL_DEVICES_TAGS, GET_EXECUTION_STATUS_FOR_AGENTIC_WF_EXECUTE, GET_EXECUTION_STATUS_FOR_ON_CHAT, GET_MONITORING_CONFIG, LOGOUT, STOP_IMPERSONATING } from './shared/api-endpoint.const';
import { Logger } from './shared/app-logger.service';
import { DeviceMapping } from './shared/app-utility/app-utility.service';
import { UserInfoService } from './shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class AppLevelService {

  constructor(private http: HttpClient,
    private logger: Logger,
    public user: UserInfoService) { }

  getAccess(input: string) {
    let perm = this.user.userPermissions[input];
    return perm ? perm : null;
  }

  updateActivityLog(deviceType: string, deviceId: string) {
    this.http.post(ACTIVITY_LOG(deviceType, deviceId), null).pipe(take(1)).subscribe(res => this.logger.log('Updated activity log'));
  }

  private checkTaskStatus(taskId: string): Observable<TaskStatus> {
    return this.http.get<TaskStatus>(CHECK_TASK_STATUS_BY_TASK_ID(taskId));
  }

  private checkTaskStatusByUrl(url: string, taskId: string): Observable<TaskStatus> {
    return this.http.get<TaskStatus>(CHECK_TASK_STATUS_BY_TASK_ID_AS_PARAMS(url, taskId));
  }

  private checkExecutionStatus(taskId: string): Observable<ExecutionStatus> {
    return this.http.get<ExecutionStatus>(GET_EXECUTION_STATUS_FOR_ON_CHAT(taskId));
  }

  private checkWfExecutionStatus(taskId: string): Observable<any> {
    return this.http.get<any>(GET_EXECUTION_STATUS_FOR_AGENTIC_WF_EXECUTE(taskId));
  }

  pollForTask(taskId: string, intervalTimeInSec?: number, maxAttempts?: number): Observable<TaskStatus> {
    let attemptCount: number = 0;
    maxAttempts = maxAttempts ? maxAttempts : 50;
    let load$ = new BehaviorSubject('');
    const whenToRefresh$ = of('').pipe(
      delay(intervalTimeInSec ? intervalTimeInSec * 1000 : 1000),
      tap(_ => load$.next('')),
      skip(1),
    );
    let poll$ = concat(this.checkTaskStatus(taskId), whenToRefresh$);
    return load$.pipe(
      concatMap(_ => poll$),
      tap((status: TaskStatus) => {
        attemptCount++;
        return status;
      }),
      first(status => status.state == StatusState.SUCCESS || status.state == StatusState.FAILURE || attemptCount > maxAttempts),
      map((status) => {
        if (status.state == StatusState.SUCCESS) {
          return status;
        } else if (status.state == StatusState.FAILURE) {
          throw new Error(status.result.message);
        } else {
          const msg: string = attemptCount > maxAttempts ? `Max ${maxAttempts} attemp exeeded` : `Task returned ${status.state}`;
          throw new TaskError(msg);
        }
      })
    );
  }

  pollForTaskByUrl(url: string, taskId: string, intervalTimeInSec?: number, maxAttempts?: number): Observable<TaskStatus> {
    let attemptCount: number = 0;
    maxAttempts = maxAttempts ? maxAttempts : 50;
    let load$ = new BehaviorSubject('');
    const whenToRefresh$ = of('').pipe(
      delay(intervalTimeInSec ? intervalTimeInSec * 1000 : 1000),
      tap(_ => load$.next('')),
      skip(1),
    );
    const poll$ = concat(this.checkTaskStatusByUrl(url, taskId), whenToRefresh$);
    return load$.pipe(
      concatMap(_ => poll$),
      tap((status: TaskStatus) => {
        attemptCount++;
        return status;
      }),
      first(status => status.state == StatusState.SUCCESS || status.state == StatusState.FAILURE || attemptCount > maxAttempts),
      map((status) => {
        if (status.state == StatusState.SUCCESS) {
          return status;
        } else if (status.state == StatusState.FAILURE) {
          throw new Error(status.result.message);
        } else {
          const msg: string = attemptCount > maxAttempts ? `Max ${maxAttempts} attemp exeeded` : `Task returned ${status.state}`;
          throw new TaskError(msg);
        }
      })
    );
  }

  // pollForExecution(executionId: string,intervalTimeInSec: number = 1,maxAttempts: number = 50):Observable<ExecutionStatus> {
  //   let attemptCount = 0;
  //   const load$ = new BehaviorSubject('');

  //   const whenToRefresh$ = of('').pipe(
  //     delay(intervalTimeInSec * 1000),
  //     tap(() => load$.next('')),
  //     skip(1)
  //   );

  //   const poll$ = concat(this.checkExecutionStatus(executionId), whenToRefresh$);

  //   return load$.pipe(
  //     concatMap(() => poll$),
  //     tap((status: TaskStatus) => attemptCount++),
  //     first(
  //       (status) =>
  //         status.status === 'SUCCESS' ||
  //         status.status === 'FAILURE' ||
  //         attemptCount > maxAttempts
  //     ),
  //     map((status) => {
  //       if (status.status === 'SUCCESS') {
  //         return status;
  //       } else if (status.status === 'FAILURE') {
  //         throw new Error(status.result?.message || 'Execution failed');
  //       } else {
  //         const msg =
  //           attemptCount > maxAttempts
  //             ? `Max ${maxAttempts} attempts exceeded`
  //             : `Execution returned ${status.status}`;
  //         throw new ExecutionError(msg);
  //       }
  //     })
  //   );
  // }

  // pollForExecution(executionId: string,intervalTimeInSec?: number,maxAttempts?: number): Observable<ExecutionStatus> {
  //   let attemptCount = 0;
  //   maxAttempts = maxAttempts ?? 50;
  //   const load$ = new BehaviorSubject('');

  //   const whenToRefresh$ = of('').pipe(
  //     delay(intervalTimeInSec ? intervalTimeInSec * 1000 : 1000),
  //     tap(() => load$.next('')),
  //     skip(1)
  //   );

  //   const poll$ = concat(this.checkExecutionStatus(executionId), whenToRefresh$);

  //   return load$.pipe(
  //     concatMap(() => poll$),
  //     tap(() => attemptCount++),
  //     first(
  //       (status: ExecutionStatus) =>
  //         status.status === 'Success' ||
  //         status.status === 'Failed' ||
  //         attemptCount > (maxAttempts ?? 50)
  //     ),
  //     map((status: ExecutionStatus) => {
  //       if (status.status === 'Success') {
  //         return status;
  //       } else if (status.status === 'Failed') {
  //         throw new Error(status.output || 'Execution failed');
  //       } else {
  //         const msg =
  //           attemptCount > (maxAttempts ?? 50)
  //             ? `Max ${maxAttempts} attempts exceeded`
  //             : `Execution is still ${status.status}`;
  //         throw new Error(msg);
  //       }
  //     })
  //   );
  // }

  // pollForExecution(executionId: string, intervalTimeInSec: number = 1, maxAttempts: number = 50): Observable<ExecutionStatus> {
  //   let attemptCount = 0;
  //   const load$ = new BehaviorSubject('');

  //   const whenToRefresh$ = of('').pipe(
  //     delay(intervalTimeInSec * 1000),
  //     tap(() => load$.next('')),
  //     skip(1)
  //   );

  //   const poll$ = concat(this.checkExecutionStatus(executionId), whenToRefresh$);

  //   return load$.pipe(
  //     concatMap(() => poll$),
  //     tap(() => attemptCount++),
  //     // **no first() here** → we want to emit every intermediate status
  //     map((status: ExecutionStatus) => {
  //       // emit every result
  //       if (status.status === 'Running' || status.status === 'Success' || status.status === 'Failed') {
  //         console.log('Status inside poll:', status);
  //         return status;
  //       } else {
  //         const msg =
  //           attemptCount > maxAttempts
  //             ? `Max ${maxAttempts} attempts exceeded`
  //             : `Unknown status: ${status.status}`;
  //         throw new TaskError(msg);
  //       }
  //     })
  //   );
  // }

  // pollForExecution(
  //   executionId: string,
  //   intervalTimeInSec = 2,
  //   maxAttempts = 50
  // ): Observable<ExecutionStatus> {
  //   // let attemptCount = 0;

  //   // return timer(0, intervalTimeInSec * 1000).pipe(
  //   //   switchMap(() => this.checkExecutionStatus(executionId)),
  //   //   tap(() => attemptCount++),
  //   //   // Continue polling only while Running and maxAttempts not exceeded
  //   //   takeWhile(
  //   //     status => status.status === 'Running' && attemptCount <= maxAttempts,
  //   //     true // include the last emission (Success or Failed)
  //   //   )
  //   // );

  //   let attemptCount = 0;

  //   return interval(intervalTimeInSec * 1000).pipe(
  //     switchMap(() => this.checkExecutionStatus(executionId)),
  //     tap(() => attemptCount++),
  //     takeWhile(
  //       (status: ExecutionStatus) => status.status !== 'Success' && status.status !== 'Failed' && attemptCount < maxAttempts,
  //       true // include the last emission (Success/Failed)
  //     )
  //   );
  // }

  pollForExecution(executionId: string, intervalTimeInSec = 2): Observable<ExecutionStatus> {
    return interval(intervalTimeInSec * 1000).pipe(
      switchMap(() => this.checkExecutionStatus(executionId)),
      takeWhile(
        (status: ExecutionStatus) => status.status !== 'Success' && status.status !== 'Failed',
        true // emit the final Success/Failed before completing
      )
    );
  }

  pollForAgenticWfExecute(executionId: string, intervalTimeInSec = 2): Observable<ExecutionStatus> {
    return interval(intervalTimeInSec * 1000).pipe(
      switchMap(() => this.checkWfExecutionStatus(executionId)),
      takeWhile(
        (status: ExecutionStatus) => status.status !== 'Success' && status.status !== 'Failed',
        true // emit the final Success/Failed before completing
      )
    );
  }

  testPollForTask(taskId: string, intervalTimeInSec?: number, maxAttempts?: number): Observable<TaskStatus> {
    let attemptCount: number = 0;
    maxAttempts = maxAttempts ? maxAttempts : 50;
    let load$ = new BehaviorSubject('');
    const whenToRefresh$ = of('').pipe(
      delay(intervalTimeInSec ? intervalTimeInSec * 1000 : 1000),
      tap(_ => load$.next('')),
      skip(1),
    );
    const poll$ = concat(of(taskId), whenToRefresh$);
    return load$.pipe(
      concatMap(_ => poll$),
      tap((status: any) => {
        console.log(status);
        attemptCount++;
        return status;
      }),
      first(status => attemptCount > maxAttempts),
      map((status) => {
        return status;
      })
    );
  }

  convertToBinary(ImageURL: string): Blob {
    let block = ImageURL.split(";");
    let contentType = block[0].split(":")[1];
    let realData = block[1].split(",")[1];
    return this.b64toBlob(realData, contentType);
  }

  private b64toBlob(b64Data: string, contentType: string, sliceSize?: number) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    let blob1 = new Blob(byteArrays, { type: contentType });
    return blob1;
  }

  logout() {
    this.http.post(LOGOUT(), null).pipe(take(1)).subscribe(res => {
      window.location.href = '';
    }, err => {
      window.location.href = '';
    });
  }

  stopImpersonating() {
    // this.http.post(STOP_IMPERSONATING(), null).pipe(take(1)).subscribe(res => {
    //   window.location.href = window.location.origin;
    // }, err => {
    //   window.location.href = window.location.origin;
    // });
    let url = this.user.isMultiImpersonated ? 'customrelease' : STOP_IMPERSONATING();
    console.log(this.user.isMultiImpersonated, url)
    if (!this.user.isMultiImpersonated) {
      this.http.post(url, null).pipe(take(1)).subscribe(res => {
        console.log(this.user.isMultiImpersonated, url)
      }, err => {
      });
    } else {
      var impersonateUrl = `${window.location.protocol}//${window.location.host}/${url}/`;
      window.location.assign(impersonateUrl);
    }

  }

  getTags() {
    return this.http.get<{ tag_name: string }[]>(GET_ALL_DEVICES_TAGS())
      .pipe(map(tags => tags.filter(tag => tag.tag_name).map(tag => tag.tag_name)));
  }

  getMappedMonitoringTool(): Observable<MappedMonitoringTool> {
    return this.http.get<MappedMonitoringTool>(GET_MONITORING_CONFIG());
  }

  getMonitoringToolByDeviceType(deviceType: string, mapDict: MappedMonitoringTool) {
    switch (deviceType) {
      case DeviceMapping.SWITCHES: return mapDict['switch'];
      case DeviceMapping.FIREWALL: return mapDict['firewall'];
      case DeviceMapping.LOAD_BALANCER: return mapDict['load_balancer'];
      case DeviceMapping.STORAGE_DEVICES: return mapDict['storage'];
      case DeviceMapping.HYPERVISOR: return mapDict['hypervisor'];
      case DeviceMapping.BARE_METAL_SERVER: return mapDict['baremetal'];
      case DeviceMapping.PDU: return mapDict['pdu'];
      case DeviceMapping.MAC_MINI: return mapDict['mac_device'];
      case DeviceMapping.DB_SERVER: return mapDict['database'];
      case DeviceMapping.VIRTUAL_MACHINE: return mapDict['vm'];
      default:
        return {
          observium: true,
          zabbix: false
        }
    }
  }

  async saveFileInChunks(file: File, chunkSize: number, formData: FormData, url: string): Promise<FileChunkType> {
    let response: FileChunkType;
    for (let start = 0; start < file.size; start += chunkSize) {
      const chunkEnd = Math.min(start + chunkSize, file.size);
      const chunk: Blob = file.slice(start, chunkEnd);
      formData.set('file', chunk, file.name);
      formData.set('offset', (chunkEnd).toString());
      if (start > 0) {
        formData.set('upload_id', response.upload_id);
      }
      let headers = new HttpHeaders({
        'Content-Range': `bytes ${start}-${chunkEnd - 1}/${file.size}`
      });

      response = await this.http.post<FileChunkType>(url, formData, { headers: headers }).pipe(tap(response = null), catchError((e: HttpErrorResponse) => {
        return of(null);
      })).toPromise();

      if (!response || (response && !response.upload_id)) {
        return null;
      }
    }
    if (!response || (response && !response.upload_id)) {
      return null;
    } else {
      return response;
    }
  }
}

export interface FileChunkType {
  expires: string;
  upload_id: string;
  offset: number;
}