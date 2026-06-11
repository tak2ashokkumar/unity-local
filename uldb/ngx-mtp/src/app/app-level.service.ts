import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concat, of } from 'rxjs';
import { catchError, concatMap, delay, first, map, skip, take, tap } from 'rxjs/operators';
import { MappedMonitoringTool } from './shared/SharedEntityTypes/monitoring-tool-mapping.type';
import { StatusState, TaskError, TaskStatus } from './shared/SharedEntityTypes/task-status.type';
import { ACTIVITY_LOG, CHECK_TASK_STATUS_BY_TASK_ID, GET_ALL_DEVICES_TAGS, GET_MONITORING_CONFIG, LOGOUT, STOP_IMPERSONATING } from './shared/api-endpoint.const';
import { Logger } from './shared/app-logger.service';
import { DeviceMapping } from './shared/app-utility/app-utility.service';
import { UserInfoService } from './shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class AppLevelService {

  constructor(private http: HttpClient,
    private logger: Logger,
    private userInfo: UserInfoService) {
  }

  getAccess(input: string) {
    let perm = this.userInfo.userPermissions[input];
    return perm ? perm : null;
  }

  updateActivityLog(deviceType: string, deviceId: string) {
    this.http.post(ACTIVITY_LOG(deviceType, deviceId), null).pipe(take(1)).subscribe(res => this.logger.log('Updated activity log'));
  }

  private checkTaskStatus(taskId: string): Observable<TaskStatus> {
    return this.http.get<TaskStatus>(CHECK_TASK_STATUS_BY_TASK_ID(taskId));
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
    const poll$ = concat(this.checkTaskStatus(taskId), whenToRefresh$);
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
    this.http.post(STOP_IMPERSONATING(), null).pipe(take(1)).subscribe(res => {
      window.location.href = window.location.origin;
    }, err => {
      window.location.href = window.location.origin;
    });
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
      case DeviceMapping.BARE_METAL_SERVER: return mapDict['bms'];
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

export enum MTPModules {
  DASHBOARD = 'Dashboard',
  TENANT_MANAGEMENT = 'Tenant Management',
  MONITORING_MANAGEMENT = 'Monitoring Management',
  USER_MANAGEMENT = 'User Management',
  SERVICE_MANAGEMENT = 'Service Management',
  INTEGRATION_MANAGEMENT = 'Integration Management',
  EVENT_MANAGEMENT = 'Event Management',
  TICKET_MANAGEMENT = 'Ticket Management',
  IMPERSONATION = 'Impersonation',
  ACTIVITY_LOG = 'Activity Log',
  SUBSCRIPTION_MANAGEMENT = 'Subscription Management',
  MAINTENANCE = 'Maintenance',
}