import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_VM_LIST_BY_PLATFORM, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';

@Injectable()
export class VmsListHypervService {

  constructor(private http: HttpClient,
    private user: UserInfoService,
    private builder: FormBuilder,
    private utilService: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getVms(platformType: PlatFormMapping, criteria: SearchCriteria): Observable<PaginatedResult<HypervVMType>> {
    return this.tableService.getData<PaginatedResult<HypervVMType>>(GET_VM_LIST_BY_PLATFORM(platformType), criteria);
  }

  convertVMtoViewdata(vm: HypervVMType) {
    let a = new HypervVMViewData();
    a.uuid = vm.uuid;
    a.vmId = vm.vm_id;
    a.name = vm.vm_name;
    a.cloudId = vm.cloud.uuid;
    a.cloud = vm.cloud.name;
    a.managementIp = vm.management_ip ? vm.management_ip : 'N/A';
    a.osName = vm.os ? vm.os : 'N/A';
    a.ssrOS = vm.ssr_os;
    a.powerStatus = vm.status == 'Running' ? 'Up' : 'Down';
    a.cpucores = vm.cpu;
    a.memory = vm.memory;
    a.storage = vm.storage;
    a.tags = vm.tags.filter(tg => tg);
    a.monitoring = vm.monitoring;
    return a;
  }

  converToViewData(vms: HypervVMType[]): HypervVMViewData[] {
    let viewData: HypervVMViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  getDeviceData(device: HypervVMViewData) {
    if (!device.monitoring.configured) {
      device.popOverDetails.uptime = '0';
      // device.popOverDetails.lastreboot = '0';
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      device.popOverDetails.uptime = '0';
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPER_V, device.uuid) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPER_V, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            // device.popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            device.popOverDetails.status = value.status;
            device.statsTooltipMessage = 'Hyperv VM Statistics';
          }
          return device;
        })
      );
  }
}

export class HypervVMViewData {
  constructor() { }
  uuid: string;
  vmId: string;
  name: string;
  cloudId: string;
  cloud: string;
  managementIp: string;
  osName: string;
  ssrOS: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  cpucores: number;
  memory: string;
  storage: string;
  type: string;
  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;
  statsTooltipMessage: string;
  tags: string[];
  powerStatus: string;
  monitoring: DeviceMonitoringType;
}


export interface HypervVMType {
  id: number;
  uuid: string;
  cloud: Cloud;
  vm_id: string;
  vm_name: string;
  name: string;
  node_name: string;
  os_type: string;
  os: string;
  ssr_os: string;
  cpu: number;
  memory: null;
  storage: null;
  status: 'Off' | 'Running';
  cluster: number;
  management_ip: null;
  actions_in_progress: ActionsInProgress;
  tags: string[];
  monitoring: DeviceMonitoringType;
}
interface Cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
}
interface ActionsInProgress {
  power_on: boolean;
  clone: boolean;
  power_off: boolean;
  reboot: boolean;
  convert_to_template: boolean;
  delete: boolean;
}
