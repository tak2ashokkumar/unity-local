import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { GET_NETWORK_CONTROLLERS, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ViptelaDeviceType } from '../../entities/viptela-device.type';
import { NetworkControllerType } from '../network-controllers.service';

@Injectable()
export class NetworkControllersViptelaComponentsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getViptelaDevices(controllerId: string, criteria: SearchCriteria): Observable<PaginatedResult<ViptelaDeviceType>> {
    return this.tableService.getData<PaginatedResult<ViptelaDeviceType>>(`/customer/viptela/devices/?account=${controllerId}`, criteria);
  }

  getViptelaDeviceTypes(accountId: string) {
    return this.http.get<string[]>(`/customer/viptela/devices/device_types/?account=${accountId}`);
  }

  syncDevices() {
    return this.http.get<any>(`/customer/viptela/accounts/discover_viptela_devices/`);
  }

  convertToViewData(data: ViptelaDeviceType[]): ViptelaDeviceViewData[] {
    let viewData: ViptelaDeviceViewData[] = [];
    data.forEach(sd => {
      let vd: ViptelaDeviceViewData = new ViptelaDeviceViewData();
      vd.deviceId = sd.uuid;
      vd.hostname = sd.name ? sd.name : 'N/A';
      vd.deviceType = sd.device_type ? sd.device_type : 'N/A';
      vd.deviceModel = sd.device_model ? sd.device_model : 'N/A';
      vd.siteId = sd.site_id ? sd.site_id : 'N/A';
      vd.systemIp = sd.system_ip ? sd.system_ip : 'N/A';
      vd.status = sd.health ? sd.health : 'N/A';
      vd.reachability = sd.reachability ? sd.reachability : 'N/A';
      vd.vsmartControl = sd.vsmart_control ? sd.vsmart_control : 'N/A';
      vd.bfd = sd.bfd ? sd.bfd : 'N/A';
      vd.upSince = sd.uptime ? this.utilService.toUnityOneDateFormat(sd.uptime) : 'N/A';
      vd.cpuLoad.consumed = sd.cpu_load?.consumed ? sd.cpu_load?.consumed : 0;
      vd.memoryUtilization.consumed = sd.memory_utilization?.consumed ? sd.memory_utilization?.consumed : 0;
      vd.monitoring = sd.monitoring;
      if (sd.health == 'Up') {
        vd.healthIcon = 'fa-circle text-success';
      } else if (sd.health == 'Down') {
        vd.healthIcon = 'fa-circle text-danger';
      } else {
        vd.healthIcon = 'fa-exclamation-circle text-warning';
      }
      if (sd.monitoring?.configured) {
        vd.statsTooltipMessage = 'Viptela Device Statistics';
      } else {
        vd.statsTooltipMessage = '';
      }
      viewData.push(vd);
    })
    return viewData;
  }

  getDeviceData(device: ViptelaDeviceViewData) {
    if (!device.monitoring.configured) {
      if (!device.status) {
        device.status = 'Not Configured';
      } else {
        device.isStatsButtonEnabled = true;
        // device.statsTooltipMessage = 'Configure Monitoring';
      }
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.status) {
        device.status = this.utilService.getDeviceStatus('-2');
      }

      device.isStatsButtonEnabled = true;
      // device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }

    const url = ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.VIPTELA_DEVICE, device.deviceId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.status) {
              device.status = this.utilService.getDeviceStatus(value.status);
            }
            device.isStatsButtonEnabled = true;
            // device.statsTooltipMessage = 'Viptela Device Statistics';
          }
          return device;
        })
      );
  }

}

export class ViptelaDeviceViewData {
  constructor() { }
  deviceId: string;
  hostname: string;
  chassisNumber: string;
  reachability: string;
  latitude: string;
  longitude: string;
  vsmartControl: string;
  health: string;
  siteId: string;
  systemIp: string;
  deviceType: string;
  localSystemIp: string;
  deviceModel: string;
  softwareVersion: string;
  cpuLoad: DeviceResourceUtilizationViewData = new DeviceResourceUtilizationViewData();
  memoryUtilization: DeviceResourceUtilizationViewData = new DeviceResourceUtilizationViewData();
  boardSerialNumber: string;
  state: string;
  stateDescription: string;
  status: string;
  totalCpuCount: number;
  uptime: string;
  validity: string;
  certificateValidity: string;
  lastUpdated: string;
  hasGeoData: boolean;
  location: string;
  account: string;
  schedule: string;
  bfd: string;
  upSince: string;
  healthIcon: string;
  monitoring: DeviceMonitoringType;
  monitoringTooltip: string;
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;
}

export class DeviceResourceUtilizationViewData {
  constructor() { }
  available: number;
  consumed: number;
  unit: string;
}

export const statusList: LabelValueType[] = [
  {
    'label': 'Up',
    'value': '1'
  },
  {
    'label': 'Down',
    'value': '-1'
  },
  {
    'label': 'Unknown',
    'value': '0'
  }
]