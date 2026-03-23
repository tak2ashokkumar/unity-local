import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { SdwanDeviceDetails } from 'src/app/unity-setup/unity-setup-integration/usi-others/usio-sdwan/usio-sdwan.type';

@Injectable()
export class SdwansDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getSdWanDeviceDetails(sdwanId: string, criteria: SearchCriteria): Observable<SdwanDeviceDetails[]> {
    return this.tableService.getData<SdwanDeviceDetails[]>(`/customer/sdwan/devices/?account=${sdwanId}`, criteria);
  }

  syncDevices() {
    return this.http.get<any>(`/customer/sdwan/accounts/discover_sdwan_devices/`);
  }

  convertToViewData(data: SdwanDeviceDetails[]): SdwanDeviceDetailsViewData[] {
    let viewData: SdwanDeviceDetailsViewData[] = [];
    data.map((sd) => {
      let vd = new SdwanDeviceDetailsViewData();
      vd.uuid = sd.uuid;
      vd.hostname = sd.name ? sd.name : 'N/A';
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
      if (sd.monitoring.configured) {
        vd.monitoringTooltip = 'Switch Statistics';
      } else {
        vd.monitoringTooltip = 'Not Configured';
      }
      viewData.push(vd);
    })
    return viewData;
  }

  getDeviceData(device: SdwanDeviceDetailsViewData) {
    if (!device.monitoring.configured) {
      if (!device.status) {
        device.status = 'Not Configured';
      } else {
        device.isStatsButtonEnabled = true;
        device.statsTooltipMessage = 'Configure Monitoring';
      }
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.status) {
        device.status = this.utilService.getDeviceStatus('-2');
      }

      device.isStatsButtonEnabled = true;
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }

    const url = ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.SDWAN_DEVICES, device.uuid);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.status) {
              device.status = this.utilService.getDeviceStatus(value.status);
            }
            device.isStatsButtonEnabled = true;
            device.statsTooltipMessage = 'Switch Statistics';
          }
          return device;
        })
      );
  }
}

export class SdwanDeviceDetailsViewData {
  constructor() { };
  uuid: string;
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
  cpuLoad: ResourceUtilizationViewData = new ResourceUtilizationViewData();
  memoryUtilization: ResourceUtilizationViewData = new ResourceUtilizationViewData();
  boardSerialNumber: string;
  deviceId: string;
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
  monitoring: DeviceMonitoringTypeViewData = new DeviceMonitoringTypeViewData();
  monitoringTooltip: string;
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;
}

export class ResourceUtilizationViewData {
  available: number;
  consumed: number;
  unit: string;
  constructor() { }
}


export class DeviceMonitoringTypeViewData {
  zabbix: boolean;
  observium: boolean;
  configured: boolean;
  enabled: boolean;
  constructor() { }
}

export const statusList: any[] = [
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
