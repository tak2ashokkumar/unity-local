import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DEVICE_DATA_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, UPDATE_DEVICE_TAGS, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { OtherDevicePopoverData } from '../devices-popover/device-popover-data';
import { OtherDevice, OtherDeviceMonitoring, OtherDeviceSummary, OtherDeviceSummaryData, OtherDeviceUrl } from '../entities/other-device.type';

@Injectable()
export class OtherdevicesService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getOtherDevices(criteria: SearchCriteria): Observable<PaginatedResult<OtherDevice>> {
    return this.tableService.getData<PaginatedResult<OtherDevice>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.OTHER_DEVICES), criteria);
  }

  getAllOtherDevices(criteria: SearchCriteria): Observable<OtherDevice[]> {
    return this.tableService.getData<OtherDevice[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.OTHER_DEVICES), criteria);
  }

  convertToViewData(data: OtherDevice[]): OtherDevicesViewData[] {
    let viewData: OtherDevicesViewData[] = [];
    data.map(s => {
      let a: OtherDevicesViewData = new OtherDevicesViewData();
      a.deviceId = s.uuid;
      a.name = s.name;
      a.type = s.type && s.type != '' ? s.type : 'NA';
      a.description = s.description ? s.description : 'NA';
      a.pollingInterval = `${s.polling_interval_min} min : ${s.polling_interval_sec} sec`;
      a.collector = s.collector ? s.collector.name : 'NA';
      a.ipAddress = s.ip_address ? s.ip_address : 'NA';
      a.isMonitoring = s.is_monitoring;
      if (s.status) {
        a.deviceStatus = this.utilSvc.getDeviceStatus(s.status);
      }
      if (!s.monitoring.configured) {
        if (!a.deviceStatus) {
          a.deviceStatus = 'Not Configured';
        }
      }
      if (s.monitoring.configured && !s.monitoring.enabled) {
        if (!a.deviceStatus) {
          a.deviceStatus = this.utilSvc.getDeviceStatus('-2');
        }
      }
      a.lastChecked = s.updated_at ? this.utilSvc.toUnityOneDateFormat(s.updated_at) : 'NA';
      a.url = s.urls.length ? s.urls[0].url : 'NA';
      a.urls = s.urls.filter(o => o);
      a.popUrlCount = s.urls.length > 1 ? s.urls.length - 1 : null;
      a.popUrlList = s.urls.length > 1 ? s.urls.slice(1) : null;
      a.tags = s.tags.filter(tg => tg);
      a.monitoring = s.monitoring;
      a.isSelected = false;
      a.isOpen = false;
      viewData.push(a);
    });
    return viewData;
  }

  getEmptyConfig(device: OtherDevicesViewData) {
    device.friendlyName = 'N/A';
    device.popOverDetails.uptime = '0';
    device.deviceStatus = 'Not Configured';
    device.popOverDetails.downtime = '0';
    device.upSince = null;
    device.downSince = null;
    device.pausedSince = null;
    device.avgResponseTime = null;
    device.customUptimeRatio = null;
    return device;
  }

  getDeviceData(device: OtherDevicesViewData) {
    if (!device.uptimeRobotId || device.uptimeRobotId == '') {
      return of(this.getEmptyConfig(device));
    }
    return this.http.get(DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.OTHER_DEVICES, device.uptimeRobotId), { headers: Handle404Header })
      .pipe(
        map((res: any) => {
          if (res) {
            device.friendlyName = res.friendly_name;
            device.deviceStatus = res.status;
            device.popOverDetails.uptime = res.up_since.toString();
            device.popOverDetails.downtime = res.down_since.toString();
            device.upSince = res.up_since.toString();
            device.downSince = res.down_since.toString();
            device.pausedSince = res.paused_since.toString();
            device.avgResponseTime = res.average_response_time.toString() + ' ms';
            device.customUptimeRatio = res.custom_uptime_ratio + ' %';
            return device;
          } else {
            return this.getEmptyConfig(device);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          return of(this.getEmptyConfig(device));
        })
      );
  }

  getURLDeviceData(device: OtherDevicesViewData) {
    if (!device.monitoring.configured) {
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilSvc.getDeviceStatus('-2');
      }
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    return this.http.get(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.OTHER_DEVICES, device.deviceId), { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilSvc.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'Statistics';
          }
          return device;
        })
      );
  }

  getCustomDevicesSummary(): Observable<OtherDeviceSummary> {
    return this.http.get<OtherDeviceSummary>(`/customer/customdevices/get_summary_data/`);
  }

  convertOtherDevicesSummaryData(data: OtherDeviceSummaryData): OtherDevicesSummaryViewData {
    let summaryData: OtherDevicesSummaryViewData = new OtherDevicesSummaryViewData();
    summaryData.total = data.total_devices;
    summaryData.up = data.total_devices_with_status_up;
    summaryData.down = data.total_devices_with_status_down;
    summaryData.enabled = data.total_devices_with_monitoring_enabled;
    summaryData.notActivated = data.total_devices_with_monitoring_not_activated;
    summaryData.alertsCount = data.total_alerts;
    summaryData.alertErrors = data.total_critical_alerts;
    summaryData.alertWarnings = data.total_warning_alerts;
    summaryData.alertInfo = data.total_information_alerts;
    return summaryData
  }

  createTagsForm(tags: string[]): FormGroup {
    return this.builder.group({
      'tags': [tags],
    });
  }

  resetTagsFormErrors() {
    return {
      'tags': ''
    };
  }

  tagsFormValidationMessages = {
    'tags': {
      'required': 'Tags are required'
    }
  }

  createBulkUpdateForm(): Observable<FormGroup> {
    return of(this.builder.group({
      'url_availability': [false],
      'polling_interval_min': [null, [Validators.min(0), Validators.max(59)]],
      'polling_interval_sec': [null, [Validators.min(0), Validators.max(59)]],
      'activate_or_deactivate': [false],
      'monitoring_status': [false],
      'uuids': [[]],
    }))
  }

  resetbulkUpdateFormErrors() {
    return {
      'polling_interval_min': '',
      'polling_interval_sec': '',
    };
  }

  bulkUpdateFormValidationMessages = {
    'polling_interval_min': {
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'polling_interval_sec': {
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
  }

  updateTags(data: { tags: string[] }, view: OtherDevicesViewData) {
    return this.http.post(UPDATE_DEVICE_TAGS(DeviceMapping.OTHER_DEVICES, view.deviceId), data);
  }

  delete(uuid: string) {
    return this.http.delete(`/customer/customdevices/${uuid}`);
  }

  deleteMultipleDevices(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuid', uuid));
    return this.http.get(`/customer/customdevices/multi_delete/`, { params: params });
  }

  update(data: OtherDevicesBulkUpdateData) {
    return this.http.put<OtherDevicesBulkUpdateData>(`/customer/customdevices/multi_update/`, data);
  }
}

export class OtherDevicesViewData {
  deviceId: string;
  name: string;
  type: string;
  description: string;
  deviceStatus: string;
  friendlyName: string;
  tags: string[] = [];
  uptimeRobotId: string;
  popOverDetails: OtherDevicePopoverData = new OtherDevicePopoverData();

  upSince: string;
  downSince: string;
  pausedSince: string;
  avgResponseTime: string;
  customUptimeRatio: string;

  lastChecked: string;
  url: string;
  urls: OtherDeviceUrl[];
  popUrlCount: number;
  popUrlList: OtherDeviceUrl[];
  isSelected: boolean;
  isOpen: boolean;

  isMonitoring: boolean;
  monitoring: OtherDeviceMonitoring;
  pollingInterval: string;
  collector: string;
  ipAddress: string;

  statsTooltipMessage: string;
  constructor() { }
}

export class OtherDevicesSummaryViewData {
  total: number = 0;
  up: number = 0;
  down: number = 0;
  enabled: number = 0;
  notActivated: number = 0;
  alertsCount: number = 0;
  alertWarnings: number = 0;
  alertErrors: number = 0;
  alertInfo: number = 0
  constructor() { }
}

export class OtherDevicesBulkUpdateData {
  monitoring_status: boolean;
  activate_or_deactivate: boolean;
  uuids: string[];
  url_availability: boolean;
  polling_interval_min: number;
  polling_interval_sec: number;
  constructor() { }
}