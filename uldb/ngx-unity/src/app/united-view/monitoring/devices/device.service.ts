import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DEVICE_MONITORING_GROUP, DEVICE_MONITORING_STATUS, GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID, UPDATE_DEVICE_DATA_ON_DRAG, UPDATE_GROUP_DATA_ON_DRAG, ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppSecToDaysPipe } from 'src/app/app-filters/pipes';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { environment } from 'src/environments/environment';
import { DeviceMonitoringAlerts, DeviceMonitoringStatus, DeviceMonitoringStatusViewData } from './entities/device-monitoring-status.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable()
export class DeviceService {
  private editModeSource = new Subject<boolean>();
  editModeToggled$: Observable<boolean> = this.editModeSource.asObservable();
  constructor(private http: HttpClient,
    private utilService: AppUtilityService,
    private secToDaysPipe: AppSecToDaysPipe) { }

  toggleEditMode(editModeOn: boolean) {
    this.editModeSource.next(editModeOn);
  }

  getDeviceGroups(): Observable<DeviceGroup[]> {
    return this.http.get<DeviceGroup[]>(DEVICE_MONITORING_GROUP());
  }

  getDeviceMonitoringStatus(groupId: string, pageSize: number, pageNo: number): Observable<PaginatedResult<DeviceMonitoringStatus>> {
    const params: HttpParams = new HttpParams().set('page', pageNo + '').set('page_size', pageSize + '');
    return this.http.get<PaginatedResult<DeviceMonitoringStatus>>(DEVICE_MONITORING_STATUS(groupId), { params: params });
  }

  private getUptime(device: DeviceMonitoringStatus): string {
    switch (device.status) {
      case '0':
        if (device.device_category !== 'customdevice') {
          return this.secToDaysPipe.transform(this.utilService.getDeviceUptime(device));
        }
        return this.secToDaysPipe.transform(device.downtime);
      case '1':
        if (device.device_category !== 'customdevice') {
          return this.secToDaysPipe.transform(this.utilService.getDeviceUptime(device));
        }
        return this.secToDaysPipe.transform(device.uptime);
      default: return 'Unable to monitor this device';
    }
  }

  private getStatusBackground(device: DeviceMonitoringStatus): string {
    if (device.status == '0' || device.status == '1') {
      if (device.device_category === 'customdevice') {
        return device.status == '0' ? 'bg-danger' : 'bg-success';
      } else {
        return device.device_category === 'vmware' ? (device.status === '0' ? (device.cpu === 'N/A' ? 'bg-danger' : 'bg-success') : 'bg-success') :
          (device.status === '0' ? 'bg-danger' : 'bg-success');
      }
    } else {
      return 'bg-warning';
    }
  }

  private getStatusIcon(device: DeviceMonitoringStatus): string {
    if (device.status == '0' || device.status == '1') {
      if (device.device_category === 'customdevice') {
        return device.status == '0' ? 'fa-arrow-circle-down' : 'fa-arrow-circle-up';
      } else {
        return device.device_category === 'vmware' ?
          (device.status === '0' ? (device.cpu === 'N/A' ? 'fa-arrow-circle-down' : 'fa-arrow-circle-up') : 'fa-arrow-circle-up') :
          (device.status === '0' ? 'fa-arrow-circle-down' : 'fa-arrow-circle-up');
      }
    } else {
      return `fa-exclamation-circle`
    }
  }

  private getCPUBackground(device: DeviceMonitoringStatus): string {
    return device.cpu === 'N/A' ? 'bg-warning' : (device.status === '0' ? (device.cpu === 0 ? 'bg-secondary' : 'bg-success') : 'bg-success');
  }

  private getMemBackground(device: DeviceMonitoringStatus): string {
    return device.memory == 'N/A' ? 'bg-warning' : (device.status == '0' ? (device.memory === '0' ? 'bg-secondary' :
      ((Number.parseInt(device.memory) > 90) ? 'bg-danger' : 'bg-success')) : 'bg-success');
  }

  private getUsageBackground(device: DeviceMonitoringStatus): string {
    return device.usage_percentage == 'N/A' ? 'bg-warning' : (device.status == '0' ? (device.usage_percentage === '0' ? 'bg-secondary' : 'bg-success') : 'bg-success');
  }

  convertToViewData(devices: DeviceMonitoringStatus[]): DeviceMonitoringStatusViewData[] {
    let viewData: DeviceMonitoringStatusViewData[] = [];
    devices.map(device => {
      let d = <DeviceMonitoringStatusViewData>device;
      d.deviceType = this.utilService.getDeviceMappingByDeviceType(d.device_category);
      d.statusTooltipMessage = this.getUptime(device);
      d.statusBackGround = this.getStatusBackground(device);
      d.statusIcon = this.getStatusIcon(device);
      d.widgetwidthClass = 'col-6';
      if (device.device_category === 'vmware' || device.device_category === 'vcloud') {
        d.widgetwidthClass = 'col-3';

        d.cpuBackGround = this.getCPUBackground(device);
        d.cpuTooltipMessage = d.cpu === 'N/A' ? 'Unable to monitor this device' : '';
        d.cpuText = d.cpu === 'N/A' ? d.cpu : `${d.cpu}%`;

        d.memoryBackGround = this.getMemBackground(device);
        d.memoryTooltipMessage = device.memory === 'N/A' ? 'Unable to monitor this device' : '';
        d.memoryText = d.memory === 'N/A' ? d.memory : `${d.memory}%`;
      } else if (device.device_category === 'customdevice') {
        d.widgetwidthClass = 'col-12';
      } else if (device.device_category === 'storage_device') {
        d.widgetwidthClass = 'col-4';
        d.usageBackGround = this.getUsageBackground(device);
        d.usageTooltipMessage = device.usage_percentage === 'N/A' ? 'Unable to monitor this device' : '';
        d.usageText = d.usage_percentage === 'N/A' ? d.usage_percentage : d.usage_percentage + '%';
      }
      if (device.device_category !== 'customdevice') {
        d.errorBackGround = device.failed_alerts == 'N/A' ? 'bg-warning' : ((Number.parseInt(device.failed_alerts) > 0) ? 'bg-danger pointer-link' : 'bg-success');
        d.errorTooltipMessage = d.failed_alerts === 'N/A' ? 'Unable to monitor this device' : '';
        d.errorText = device.failed_alerts;
      }
      d.monitoring = device.monitoring;

      viewData.push(d);
    });
    return viewData;
  }

  updateGroup(data: string[]) {
    this.http.post(UPDATE_GROUP_DATA_ON_DRAG(), data).pipe(take(1)).subscribe();
  }

  updateDeviceStaus(data: { id: string, devices: DeviceMonitoringStatus[] }[]) {
    this.http.post(UPDATE_DEVICE_DATA_ON_DRAG(), data).pipe(take(1)).subscribe();
  }

  getAlertsByDeviceTypeAndDeviceId(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get(GET_ALERTS_BY_DEVICE_TYPE_AND_DEVICEID(deviceType, deviceId)).pipe(map((res: any) => res.alerts));
  }

  getZabbixAlertsByDeviceTypeAndDeviceId(deviceType: DeviceMapping, deviceId: string): Observable<DeviceMonitoringAlerts[]> {
    return this.http.get<DeviceMonitoringAlerts[]>(ZABBIX_DEVICE_ALERTS_BY_DEVICE_TYPE_AND_DEVICE_ID(deviceType, deviceId));
  }

  convertToAlertsViewData(alerts: DeviceMonitoringAlerts[]): DeviceMonitoringAlertsViewData[] {
    let viewData: DeviceMonitoringAlertsViewData[] = [];
    alerts.map(a => {
      let av: DeviceMonitoringAlertsViewData = new DeviceMonitoringAlertsViewData();
      av.alertId = a.alert_id;
      av.alertDesc = a.description;
      av.severity = a.severity ? a.severity.toLowerCase() : '';
      av.alertTime = a.date_time ? this.utilService.toUnityOneDateFormat(a.date_time) : 'N/A';
      av.deviceName = a.device_name;
      switch (av.severity) {
        case 'critical': av.colorClass = 'bg-danger'; break;
        case 'warning': av.colorClass = 'bg-warning'; break;
        default: av.colorClass = 'bg-primary';
      }
      viewData.push(av);
    })
    return viewData;
  }
}


export class DeviceMonitoringAlertsViewData {
  alertId: number;
  alertDesc: string;
  deviceName: string;
  severity: string;
  colorClass: string;
  alertTime: string;
  constructor() { }
}
