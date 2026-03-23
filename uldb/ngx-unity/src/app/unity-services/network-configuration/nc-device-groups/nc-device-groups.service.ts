import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { NCMDeviceGroupScheduleHistoryType, NCMDeviceGroupType } from './nc-device-groups.type';

@Injectable()
export class NcDeviceGroupsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService) { }

  getNCMDeviceGroups(criteria: SearchCriteria): Observable<PaginatedResult<NCMDeviceGroupType>> {
    return this.tableService.getData<PaginatedResult<NCMDeviceGroupType>>(`customer/network_devices_group/`, criteria);
  }

  convertToNCMDeviceGroupsViewData(data: NCMDeviceGroupType[]): NCMDeviceGroupsViewData[] {
    let viewData: NCMDeviceGroupsViewData[] = [];
    data.forEach(d => {
      let view: NCMDeviceGroupsViewData = new NCMDeviceGroupsViewData();
      view.name = d.name;
      view.deviceGroupId = d.uuid;
      view.description = d.description;
      view.deviceTypes = d.device_types?.length ? d.device_types.map(d => this.utilSvc.getDeviceMappingByDeviceType(d)) : [];
      view.deviceType = d.device_types?.length ? this.utilSvc.getDeviceMappingByDeviceType(d.device_types.getFirst()) : '';
      view.deviceTypesBadgeCount = d.device_types?.length ? d.device_types.length - 1 : 0;
      view.deviceTypesList = view.deviceTypes.length ? view.deviceTypes.slice(1) : [];

      view.devices = d.devices?.length ? d.devices.map(d => d.name) : [];
      view.device = d.devices?.length ? d.devices.getFirst().name : '';
      view.devicesBadgeCount = d.devices?.length ? d.devices.length - 1 : 0;
      view.devicesList = view.devices.length ? view.devices.slice(1) : [];

      view.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      view.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      viewData.push(view);
    })
    return viewData;
  }

  syncNow(deviceGroupId: string) {
    return this.http.get<CeleryTask>(`customer/network_devices_group/${deviceGroupId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
  }

  deleteDeviceGroup(deviceGroupId: string) {
    return this.http.delete(`customer/network_devices_group/${deviceGroupId}/`);
  }

  getScheduleHistory(scheduleHistoryCurrentCriteria: SearchCriteria, deviceGroupId: string): Observable<PaginatedResult<NCMDeviceGroupScheduleHistoryType>> {
    return this.tableService.getData<PaginatedResult<NCMDeviceGroupScheduleHistoryType>>(`customer/network_devices_group/${deviceGroupId}/schedule_history/`, scheduleHistoryCurrentCriteria);
  }

  convertToScheduleHistoryViewData(scheduleHistoryData: NCMDeviceGroupScheduleHistoryType[]): NCMDeviceGroupsScheduleHistoryViewData[] {
    let scheduleHistoryViewData: NCMDeviceGroupsScheduleHistoryViewData[] = [];
    scheduleHistoryData.forEach(d => {
      let view: NCMDeviceGroupsScheduleHistoryViewData = new NCMDeviceGroupsScheduleHistoryViewData();
      view.startTime = d.started_at ? this.utilSvc.toUnityOneDateFormat(d.started_at) : 'N/A';
      view.endTime = d.completed_at ? this.utilSvc.toUnityOneDateFormat(d.completed_at) : 'N/A';
      view.duration = d.duration ? d.duration : 'N/A';
      view.status = d.status ? d.status : 'N/A';
      view.executedBy = d.executed_by ? d.executed_by : 'N/A';
      scheduleHistoryViewData.push(view);
    })
    return scheduleHistoryViewData;
  }

}

export class NCMDeviceGroupsViewData {
  constructor() { }
  name: string;
  description: string;
  deviceGroupId: string;
  deviceTypes: string[];
  deviceType: string;
  deviceTypesBadgeCount: number;
  deviceTypesList: string[];
  devices: string[];
  device: string;
  devicesBadgeCount: number;
  devicesList: string[];
  createdAt: string;
  updatedAt: string;
  syncInProgress: boolean = false;
}

export class NCMDeviceGroupsScheduleHistoryViewData {
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  isInProgress: boolean;
  statusClass: string;
  executedBy: string;
}