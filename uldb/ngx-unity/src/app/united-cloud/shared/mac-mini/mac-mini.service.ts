import { Injectable } from '@angular/core';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { EMPTY, Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DeviceMapping, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DEVICE_LIST_BY_DEVICE_TYPE, DEVICE_DATA_BY_DEVICE_TYPE, CHECK_PDU_AUTHENTICATION, RECYCLE_PDU, GET_MAC_DEVICES_REPORT, DOWNLOAD_MAC_DEVICES_REPORT, SYNC_ALL_MAC_MINIS, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { MacMini, MacMiniPDU } from '../entities/mac-mini.type';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map, catchError, switchMap, take } from 'rxjs/operators';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { PDUSocketAuthType, PDUSocketRecycleType } from '../pdu-recycle/pdu-recycle.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { AppLevelService } from 'src/app/app-level.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class MacMiniService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private utilService: AppUtilityService,
    private appService: AppLevelService,
    private user: UserInfoService) { }

  syncMacMinis() {
    return this.http.get<CeleryTask>(SYNC_ALL_MAC_MINIS())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }

  getMacMinis(criteria: SearchCriteria): Observable<PaginatedResult<MacMini>> {
    return this.tableService.getData<PaginatedResult<MacMini>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI), criteria);
  }

  getAllMacMinis(criteria: SearchCriteria): Observable<MacMini[]> {
    return this.tableService.getData<MacMini[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI), criteria);
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=macdevice`)
  }

  converToViewData(devices: MacMini[]): MacMiniViewData[] {
    let viewData: MacMiniViewData[] = [];
    devices.map((device) => {
      let a: MacMiniViewData = new MacMiniViewData();
      a.serialNumber = device.serial_number ? device.serial_number : 'N/A';
      a.id = device.uuid;
      a.name = device.name;
      a.cabinet = device.cabinet ? device.cabinet.name : 'N/A';
      a.pdu = device.pdu1;
      a.os = device.os ? device.os.full_name : 'N/A';
      a.manufacturer = device.manufacturer ? device.manufacturer.name : 'N/A';
      a.model = device.model ? device.model.name : 'N/A';
      a.cpuCount = device.num_cpus ? device.num_cpus : 'N/A';
      a.coreCount = device.num_cores ? device.num_cores : 'N/A';
      a.memory = device.memory_mb ? device.memory_mb : 'N/A';
      a.capacity = device.capacity_gb ? device.capacity_gb : 'N/A';
      a.tag = device.asset_tag ? device.asset_tag : 'N/A';
      a.cloud = device.private_cloud ? `${device.private_cloud.name}(${this.utilService.getCloudTypeByPlatformType(device.private_cloud.platform_type)})` : 'N/A';
      a.monitoring = device.monitoring;

      a.recycleTooltipMessage = device.pdu1 ? 'Recycle' : 'PDU not mapped';
      a.managementIP = device.management_ip ? device.management_ip : 'N/A';
      a.tags = device.tags.filter(tg => tg);
      if (device.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(device.status);
      }

      if (this.user.isManagementEnabled) {
        a.isSameTabEnabled = true;
        a.sameTabConsoleAccessUrl = a.managementIP.match('N/A') ? null : a.managementIP;
        a.sameTabTootipMessage = 'Manage In Same Tab';

        a.isNewTabEnabled = true;
        a.newTabWebAccessUrl = `${window.location.origin}/mac?autoconnect=1&host=${device.management_ip}&port=9000`;
        a.newTabConsoleAccessUrl = a.managementIP.match('N/A') ? null : VM_CONSOLE_CLIENT();
        a.newTabTootipMessage = 'Manage In New Tab';
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

  getDeviceData(device: MacMiniViewData) {
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
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI, device.id) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI, device.id);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'Mac Mini Statistics';
          }
          return device;
        })
      );
  }

  checkPDUAuth(pdu: MacMiniPDU, data: PDUSocketAuthType): Observable<string> {
    return this.http.post<string>(CHECK_PDU_AUTHENTICATION(pdu.id), data);
  }

  recyclePDU(pdu: MacMiniPDU, data: PDUSocketRecycleType) {
    return this.http.post<CeleryTask>(RECYCLE_PDU(pdu.id), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }

  macRecycleAuthFormErrors(): any {
    let AuthFormErrors = {
      'username': '',
      'password': ''
    }
    return AuthFormErrors;
  }

  macRecycleAuthFormValidationMessages = {
    'username': {
      'required': 'This field is required'
    },
    'password': {
      'required': 'This field is required'
    },
  }

  buildMacAuthForm(pdu: MacMiniPDU): FormGroup {
    this.macRecycleAuthFormErrors();
    return this.builder.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      'ip_address': [pdu.ip_address],
    });
  }

  getConsoleAccessInput(device: MacMiniViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.MAC_MINI, deviceType: DeviceMapping.MAC_MINI, deviceId: device.id,
      newTab: false, deviceName: device.name, managementIp: device.managementIP
    };
  }

  downloadDevicesReport() {
    return this.http.get<{ data: string }>(DOWNLOAD_MAC_DEVICES_REPORT());
  }

  getDevicesReport(fileName: string): string {
    return GET_MAC_DEVICES_REPORT(fileName);
  }

  deleteMultipleMacDevices(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/macdevices/bulk_delete`, { params: params });
  }

  updateMultipleMacDevices(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/macdevices/bulk_update/`, obj, { params });
  }

}

export class MacMiniViewData {
  id: string;
  name: string;
  serialNumber: string;
  os: string;
  manufacturer: string;
  model: string;
  cpuCount: number | 'N/A';
  coreCount: number | 'N/A';
  memory: number | 'N/A';
  capacity: number | 'N/A';
  cloud: string;
  cabinet: string;
  pdu: MacMiniPDU;
  managementIP: string;
  tag: string;
  deviceStatus: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  recycleTooltipMessage: string;
  statsTooltipMessage: string;
  monitoring: DeviceMonitoringType;

  isSameTabEnabled: boolean;
  sameTabConsoleAccessUrl: string;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabWebAccessUrl: string;
  newTabConsoleAccessUrl: string;
  newTabTootipMessage: string;
  tags: string[];

  isSelected: boolean;

  constructor() { }
}
