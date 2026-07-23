import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_VM_LIST_BY_PLATFORM, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';

@Injectable()
export class VmsListCustomService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getVms(criteria: SearchCriteria): Observable<PaginatedResult<CustomVM>> {
    return this.tableService.getData<PaginatedResult<CustomVM>>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.CUSTOM), criteria);
  }

  getAllVms(criteria: SearchCriteria): Observable<CustomVM[]> {
    return this.tableService.getData<CustomVM[]>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.CUSTOM), criteria);
  }

  converToViewData(vms: CustomVM[]): CustomVmViewData[] {
    let viewData: CustomVmViewData[] = [];
    vms.map(vm => {
      let a = new CustomVmViewData();
      a.vmId = vm.uuid;
      a.name = vm.name;
      a.managementIp = vm.management_ip ? vm.management_ip : 'N/A';
      a.os = vm.os ? vm.os.full_name : 'N/A';
      a.platformType = vm.os ? vm.os.platform_type : 'N/A';
      a.tags = vm.tags.filter(tg => tg);
      a.monitoring = vm.monitoring;
      if (this.user.isManagementEnabled) {
        const isWindows: boolean = vm.os ? (vm.os.platform_type == 'Windows' ? true : false) : false;
        a.isSameTabEnabled = ((vm.management_ip ? true : false) && !isWindows);
        if (!vm.management_ip) {
          a.sameTabTootipMessage = 'Management IP not Configured';
        } else if (isWindows) {
          a.sameTabTootipMessage = 'Open in Same tab option is not available for windows based machines';
        } else {
          a.sameTabTootipMessage = 'Open in same tab';
        }

        a.isNewTabEnabled = vm.management_ip ? true : false;
        if (!vm.management_ip) {
          a.newTabToolipMessage = 'Management IP not Configured';
        } else if (isWindows) {
          a.newTabToolipMessage = 'Open In New Tab';
          a.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), a.managementIp) : WINDOWS_CONSOLE_CLIENT(a.managementIp);
        } else {
          a.newTabToolipMessage = 'Open In New Tab';
          a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
        }
      } else {
        a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.isSameTabEnabled = false;
        a.isNewTabEnabled = false;
      }

      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: CustomVmViewData) {
    if (!device.monitoring.configured) {
      device.popOverDetails.uptime = '0';
      // device.popOverDetails.lastreboot = '0';
      device.powerStatus = `Not Configured`;
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      device.popOverDetails.uptime = '0';
      device.powerStatus = this.utilService.getDeviceStatus('-2');
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.CUSTOM_VIRTUAL_MACHINE, device.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.CUSTOM_VIRTUAL_MACHINE, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: any) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            // device.popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            device.popOverDetails.status = value.status;
            device.powerStatus = this.utilService.getDeviceStatus(value.status);
            device.statsTooltipMessage = 'VM Statistics';
          }
        })
      );
  }

  getConsoleAccessInput(view: CustomVmViewData): ConsoleAccessInput {
    return { label: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, deviceType: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, deviceId: view.vmId, newTab: false, deviceName: view.name };
  }
}

export class CustomVmViewData {
  vmId: string;
  name: string;
  managementIp: string;
  os: string;
  platformType: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  powerStatus?: string;
  statsTooltipMessage: string;
  tags: string[];
  monitoring: DeviceMonitoringType;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;
  constructor() { }
}

export interface CustomVM {
  url: string;
  id: number;
  name: string;
  uuid: string;
  nics: number;
  server: Server;
  management_ip: string;
  os: Os;
  vm_type: any;
  last_known_state: any;
  tags: string[];
  monitoring: DeviceMonitoringType;
  collector: CollectorType;
  custom_attribute_data?: { [key: string]: any };
}
interface Server {
  url: string;
  id: number;
  proxy: Proxy;
  uuid: string;
  name: string;
  asset_tag: string;
  manufacturer: string;
  serial_number: string;
  instance: Instance;
  bm_server: Bm_server;
  last_known_state: string;
  last_checked: string;
  cabinet: Cabinet;
  description: any;
  salesforce_id: string;
  private_cloud: Private_cloud;
  esxi: EsxiItem[];
  num_cores: any;
  num_cpus: number;
  memory_mb: any;
  capacity_gb: any;
  observium_status: number;
  position: number;
  size: number;
}

interface Instance {
  url: string;
  id: number;
  uuid: string;
  name: string;
  os: Os;
  instance_type: string;
  virtualization_type: string;
  object_class: string;
  functional_hostname: string;
  modified_user: string;
  ordered_date: string;
}
interface Bm_server {
  url: string;
  id: number;
  os: Os;
  uuid: string;
  created_at: string;
  updated_at: string;
  management_ip: string;
  bmc_type: string;
  server: string;
}
interface Os {
  url: string;
  id: number;
  name: string;
  version: string;
  full_name: string;
  platform_type?: string;
}
interface Private_cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
}
interface Cabinet {
  url: string;
  id: number;
  name: string;
}
interface EsxiItem {
  uuid: string;
  name: string;
  proxy_url: string;
  proxy_fqdn: string;
  server: number;
}

export interface CollectorType {
  name: string;
  uuid: string;
}
