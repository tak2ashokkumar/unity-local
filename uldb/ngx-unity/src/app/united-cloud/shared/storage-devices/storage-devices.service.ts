import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DEVICE_DATA_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, GET_STORAGE_DATA_BRIEF, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { StorageDevice, StorageDeviceStorageDataProperties } from '../entities/storage-device.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class StorageDevicesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getStorageDevices(criteria: SearchCriteria): Observable<PaginatedResult<StorageDevice>> {
    return this.tableService.getData<PaginatedResult<StorageDevice>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES), criteria);
  }

  getAllStorageDevices(criteria: SearchCriteria): Observable<Array<StorageDevice>> {
    return this.tableService.getData<Array<StorageDevice>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES), criteria);
  }

  getStorage(criteria: SearchCriteria): Observable<StorageDevice[]> {
    return this.tableService.getData<StorageDevice[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES), criteria);
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=storagedevice`)
  }

  updateMultipleStorageDevices(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/storagedevices/bulk_update/`, obj, { params });
  }

  convertToViewData(data: StorageDevice[]): StorageDeviceViewData[] {
    let viewData: StorageDeviceViewData[] = [];
    data.map(s => {
      let a: StorageDeviceViewData = new StorageDeviceViewData();
      a.deviceId = s.uuid;
      a.name = s.name;
      a.os = s.os ? s.os.full_name : 'N/A';
      a.cloud = s.private_cloud ? s.private_cloud.name : 'N/A'
      a.managementIp = s.management_ip ? s.management_ip : 'N/A';
      a.monitoring = s.monitoring;
      a.tags = s.tags;
      a.redfish = s.redfish;

      a.editBtnTooltipMsg = 'Edit';
      a.deleteBtnTooltipMsg = 'Delete';
      if (s.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(s.status);
      }

      if (s.is_cluster) {
        a.isCluster = true;
        a.detailIconEnabled = true;
        a.detailsTooltipMessage = 'View Details';
      } else if (s.is_purity) {
        a.hasPureOs = true;
        a.detailIconEnabled = true;
        a.detailsTooltipMessage = 'View Details';
      } else {
        a.isCluster = false;
        a.detailIconEnabled = false;
        a.detailsTooltipMessage = 'Device is neither of Cluster type nor has Pure OS.';
      }

      if (this.user.isManagementEnabled) {
        a.isSameTabEnabled = ((s.proxy.same_tab && s.proxy.proxy_fqdn ? true : false) || (a.managementIp.match('N/A') ? false : true));
        a.sameTabWebAccessUrl = s.proxy.proxy_fqdn;
        a.sameTabConsoleAccessUrl = a.managementIp.match('N/A') ? null : a.managementIp;
        a.sameTabTootipMessage = a.isSameTabEnabled ? 'Manage In Same Tab' : 'Device Not Configured';

        a.isNewTabEnabled = ((a.managementIp.match('N/A') ? false : true) || (s.proxy.proxy_fqdn ? true : false));
        a.newTabWebAccessUrl = a.sameTabWebAccessUrl;
        a.newTabConsoleAccessUrl = a.managementIp.match('N/A') ? null : VM_CONSOLE_CLIENT();
        a.newTabTootipMessage = a.isNewTabEnabled ? 'Manage In New Tab' : 'Device Not Configured';
        if (a.isNewTabEnabled && !a.isSameTabEnabled && !s.proxy.same_tab) {
          a.sameTabTootipMessage = 'Non Managable In Same Tab';
        }
      } else {
        a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.isSameTabEnabled = false;
        a.isNewTabEnabled = false;
      }

      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: StorageDeviceViewData) {
    if (!device.monitoring.configured) {
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilService.getDeviceStatus('-2');
      }
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES, device.deviceId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES, device.deviceId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'Storage Statistics';
          }
          return device;
        })
      );
  }

  getStorageData(device: StorageDeviceViewData) {
    let url = '';
    if (device.isCluster || device.hasPureOs) {
      url = GET_STORAGE_DATA_BRIEF('zabbix', device.deviceId)
    } else {
      if (!device.monitoring.configured) {
        device.storage = this.getStorageUnits(null);
        return EMPTY;
      }
      if (device.monitoring.configured && !device.monitoring.enabled) {
        device.storage = this.getStorageUnits(null);
        return EMPTY;
      }
      url = device.monitoring.observium ? GET_STORAGE_DATA_BRIEF('observium', device.deviceId) : GET_STORAGE_DATA_BRIEF('zabbix', device.deviceId);
    }
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: StorageDeviceStorageDataProperties) => {
          device.storage = this.getStorageUnits(res);
          return device;
        })
      );
  }

  private getStorageUnits(storageTracks: StorageDeviceStorageDataProperties) {
    let a: StorageUnits = new StorageUnits();
    if (storageTracks) {
      a.capacity = storageTracks.capacity;
      a.used = storageTracks.used;
      a.free = storageTracks.free;
      a.usedPercentage = storageTracks.used_perc;
      a.freePercentage = 100 - storageTracks.used_perc;
      a.usedBarColor = a.usedPercentage < 65 ? 'bg-success' : a.usedPercentage >= 65 && a.usedPercentage < 85 ? 'bg-warning' : 'bg-danger';
    }
    return a;
  }

  getConsoleAccessInput(device: StorageDeviceViewData): ConsoleAccessInput {
    return { label: DeviceMapping.STORAGE_DEVICES, deviceType: DeviceMapping.STORAGE_DEVICES, deviceId: device.deviceId, newTab: false, deviceName: device.name };
  }

  deleteMulitpleStorageDevices(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/storagedevices/bulk_delete`, { params: params });
  }

}

export class StorageDeviceViewData {
  deviceId: string;
  name: string;
  deviceStatus: string;
  type: string;
  os: string;
  cloud: string;
  managementIp: string;
  tags: string[];
  redfish: boolean;

  storage: StorageUnits;
  get storageSpinner() {
    return this.storage ? false : true;
  }

  get showNA() {
    return this.storage && !this.storage.capacity ? true : false;
  }

  get showGraph() {
    return this.storage && this.storage.capacity ? true : false;
  }

  popOverDetails: DevicePopoverData = new DevicePopoverData();

  editBtnTooltipMsg: string;
  deleteBtnTooltipMsg: string;
  isShared: boolean;

  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;

  isSameTabEnabled: boolean;
  sameTabWebAccessUrl: string;
  sameTabConsoleAccessUrl: string;
  sameTabTootipMessage: string;

  isNewTabEnabled: boolean;
  newTabWebAccessUrl: string;
  newTabConsoleAccessUrl: string;
  newTabTootipMessage: string;

  monitoring: DeviceMonitoringType;

  isCluster: boolean;
  hasPureOs: boolean;
  // clusterDetailIconEnabled: boolean;
  // clusterDetailsTooltipMessage: string;

  detailIconEnabled: boolean;
  detailsTooltipMessage: string;

  isSelected: boolean;

  constructor() { }
}

export class StorageUnits {
  capacity: string;
  used: string;
  free: string;
  usedPercentage: number;
  freePercentage: number;
  usedBarColor: string;
  storageUnits: string;
  constructor() { }
}
