import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { NCMHistoryDeleteType, NCMHistoryType, NCMHistroyConfigType } from './nc-history.type';

@Injectable()

export class NcHistoryService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getHistory(criteria: SearchCriteria, deviceType: string, deviceId: string): Observable<PaginatedResult<NCMHistoryType>> {
    const apiDeviceType = this.getDeviceAPIMappingByURLDeviceType(deviceType);
    return this.tableService.getData<PaginatedResult<NCMHistoryType>>(`/customer/device_configuration/?device_type=${apiDeviceType}&device_uuid=${deviceId}`, criteria);
  }

  convertToViewData(data: NCMHistoryType[]): NCMHistoryViewData[] {
    let viewData: NCMHistoryViewData[] = [];
    data.forEach(d => {
      let view: NCMHistoryViewData = new NCMHistoryViewData();
      view.backupId = d.uuid;
      view.backupName = d.backup_name ? d.backup_name : 'N/A';
      view.deviceId = d.device_uuid ? d.device_uuid : null;
      view.deviceName = d.device_name ? d.device_name : 'N/A';
      view.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';

      let diff = this.utilSvc.getTimeDifferenceByFromDate(d.updated_at);
      let duration = '';
      if (diff) {
        diff.asDays ? duration = duration.concat(`${Math.floor(diff.asDays)} days`) : duration = duration;
        diff.hours ? duration = duration.concat(` ${diff.hours} hours`) : duration = duration;
        diff.minutes ? duration = duration.concat(` ${diff.minutes} minutes`) : duration = duration;
        if (!diff.days && !diff.hours) {
          diff.seconds ? duration = duration.concat(` ${diff.seconds} seconds`) : duration = duration;
        }
      }
      view.executedBy = d.executed_by ? d.executed_by : 'N/A';
      view.downloadURL = `/customer/device_configuration/${d.uuid}/configuration/`;
      view.duration = diff ? duration : 'N/A';
      view.openConfigEnabled = d.config_device_type == "cisco_ftd" || d.is_encrypted ? false : true;
      view.compareVersionsEnabled = d.config_device_type == "cisco_ftd" ? false : true;
      viewData.push(view);
    });
    return viewData;
  }

  getConfigDetails(historyId: string): Observable<NCMHistroyConfigType> {
    return this.http.get<NCMHistroyConfigType>(`/customer/device_configuration/${historyId}/configuration/`);
  }

  restoreConfig(historyId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(`customer/device_configuration/${historyId}/restore_configuration/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
  }

  getDeviceAPIMappingByURLDeviceType(deviceType: string): string {
    switch (deviceType) {
      case 'switch':
        return 'switch';
      case 'firewall':
        return 'firewall';
      case 'load-balancer':
        return 'load_balancer';
      default:
        return;
    }
  }

  downloadConfig(historyId: string): Observable<{ data: string }> {
    return this.http.get<{ data: string }>(`/customer/device_configuration/${historyId}/download/`);
  }

  getConfigFile(historyId: string, fileName: string): string {
    return `/customer/device_configuration/${historyId}/get_configuration_file/`;
  }

  deleteHistory(historyId: string): Observable<NCMHistoryDeleteType> {
    return this.http.delete<NCMHistoryDeleteType>(`/customer/device_configuration/${historyId}/delete/`);
  }
}

export class NCMHistoryViewData {
  backupId: string;
  backupName: string;
  deviceId: string;
  deviceName: string;
  updatedAt: string;
  duration: string;
  executedBy: string;
  downloadURL: string;
  restoreConfigSyncInProgress: boolean = false;
  openConfigEnabled: boolean;
  compareVersionsEnabled: boolean;
}