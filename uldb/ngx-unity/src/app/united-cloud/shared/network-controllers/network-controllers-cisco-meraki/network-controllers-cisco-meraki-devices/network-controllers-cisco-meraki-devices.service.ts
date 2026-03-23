import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map } from 'rxjs/operators';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { MerakiDeviceType } from '../../../entities/cisco-meraki-device.type';

@Injectable()
export class NetworkControllersCiscoMerakiDevicesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getMerakiDevices(organizatioId: string, criteria: SearchCriteria): Observable<PaginatedResult<MerakiDeviceType>> {
    return this.tableService.getData<PaginatedResult<MerakiDeviceType>>(`/customer/meraki/devices/?organization_uuid=${organizatioId}`, criteria);
  }

  syncDevices() {
    return this.http.get(`/customer/meraki/accounts/discover_meraki_resources/`);
  }

  convertToViewData(data: MerakiDeviceType[]): MerakiDeviceViewData[] {
    let viewData: MerakiDeviceViewData[] = [];
    data.forEach(d => {
      let vd: MerakiDeviceViewData = new MerakiDeviceViewData();
      vd.deviceId = d.uuid;
      vd.name = d.name ? d.name : 'N/A';
      vd.organizationName = d.meraki_organization_name ? d.meraki_organization_name : 'N/A';
      vd.networkName = d.meraki_network_name ? d.meraki_network_name : 'N/A';
      vd.systemIp = d.device_ip ? d.device_ip : 'N/A';
      vd.serialNo = d.device_serial ? d.device_serial : 'N/A';
      vd.model = d.device_model ? d.device_model : 'N/A';
      vd.productType = d.device_product_type ? d.device_product_type : 'N/A';
      let mappedDeviceStatus = this.getMerakiDeviceStatus(d.device_status);
      vd.status = this.utilService.getDeviceStatus(mappedDeviceStatus);
      vd.monitoring = d.monitoring;
      if (d.monitoring?.configured) {
        vd.statsTooltipMessage = 'Meraki Device Statistics';
      } else {
        vd.statsTooltipMessage = '';
      }
      viewData.push(vd);
    })
    return viewData;
  }

  getDeviceData(device: MerakiDeviceViewData) {
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

    const url = ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.MERAKI_DEVICE, device.deviceId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.status) {
              device.status = this.utilService.getDeviceStatus(value.status);
            }
            device.isStatsButtonEnabled = true;
            // device.statsTooltipMessage = 'Meraki Device Statistics';
          }
          return device;
        })
      );
  }

  getMerakiDeviceStatus(status: string) {
    switch (status) {
      case 'online':
        return '1';
      case 'offline':
        return '0';
      case 'dormant':
        return '-1';
      default: return;
    }
  }

}

export class MerakiDeviceViewData {
  constructor() { }
  deviceId: string;
  name: string;
  organization: string;
  network: string;
  organizationName: string;
  networkName: string;
  systemIp: string;
  serialNo: string;
  model: string;
  productType: string;
  status: string;
  monitoring: DeviceMonitoringType;
  monitoringTooltip: string;
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;
}

export const statusList: LabelValueType[] = [
  {
    'label': 'Up',
    'value': '1'
  },
  {
    'label': 'Down',
    'value': '0'
  },
  {
    'label': 'Unknown',
    'value': '-1'
  }
]