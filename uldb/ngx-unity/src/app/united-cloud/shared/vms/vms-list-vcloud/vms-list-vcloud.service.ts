import { Injectable } from '@angular/core';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { EMPTY, Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_VM_LIST_BY_PLATFORM, DEVICE_DATA_BY_DEVICE_TYPE, GET_VM_BY_PLATFORM_AND_ID, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { PlatFormMapping, DeviceMapping, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { catchError, map } from 'rxjs/operators';
import { VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, MANAGEMENT_NOT_ENABLED_MESSAGE, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

@Injectable()
export class VmsListVcloudService {

  constructor(private http: HttpClient,
    private user: UserInfoService,
    private utilService: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getVms(criteria: SearchCriteria): Observable<PaginatedResult<VCloudVM>> {
    return this.tableService.getData<PaginatedResult<VCloudVM>>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.VCLOUD), criteria);
  }

  getVmById(vmId: string) {
    return this.http.get<VCloudVM>(GET_VM_BY_PLATFORM_AND_ID(PlatFormMapping.VCLOUD, vmId));
  }

  convertVMtoViewdata(vm: VCloudVM) {
    let a = new VCloudVMViewData();
    a.vmId = vm.uuid;
    a.name = vm.name;
    a.cloudId = vm.cloud.uuid;
    a.cloud = vm.cloud.name;
    a.instanceId = vm.instance_id;
    a.managementIp = vm.management_ip ? vm.management_ip : 'N/A';
    a.osName = vm.guest_os ? vm.guest_os : 'N/A';
    a.ssrOS = vm.ssr_os;
    a.powerStatus = vm.power_state == 'POWERED_OFF' ? 'Down' : 'Up';
    a.powerStatusOn = vm.power_state == 'POWERED_OFF' ? false : true;
    a.powerTooltipMessage = vm.power_state == 'POWERED_OFF' ? 'Power On' : 'Power Off';
    a.vcpus = vm.vcpus;
    a.memory = (vm.guest_memory / 1024) + ' GB';
    a.tags = vm.tags.filter(tg => tg);
    a.monitoring = vm.monitoring;

    if (this.user.isManagementEnabled) {
      a.isPowerButtonEnabled = true;
      const isWindows: boolean = (vm.guest_os.lastIndexOf('Microsoft', 0) == 0);
      a.isSameTabEnabled = ((vm.management_ip ? true : false) && a.powerStatusOn && !isWindows);
      if (!vm.management_ip) {
        a.sameTabTootipMessage = 'Management IP not Configured';
      } else if (!a.powerStatusOn) {
        a.sameTabTootipMessage = 'VM is Down';
      } else if (isWindows) {
        a.sameTabTootipMessage = 'Open in Same tab option is not available for windows based machines';
      } else {
        a.sameTabTootipMessage = 'Open in same tab';
      }

      a.isNewTabEnabled = ((vm.management_ip ? true : false) && a.powerStatusOn);
      if (!vm.management_ip) {
        a.newTabToolipMessage = 'Management IP not Configured';
      } else if (!a.powerStatusOn) {
        a.newTabToolipMessage = 'VM is Down';
      } else if (isWindows) {
        a.newTabToolipMessage = 'Open In New Tab';
        a.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), a.managementIp) : WINDOWS_CONSOLE_CLIENT(a.managementIp);
      } else {
        a.newTabToolipMessage = 'Open In New Tab';
        a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
      }
    } else {
      a.isSameTabEnabled = false;
      a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      a.isNewTabEnabled = false;
      a.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      a.powerStatusOn = false;
      a.isPowerButtonEnabled = false;
      a.powerTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }
    return a;
  }

  converToViewData(vms: VCloudVM[]): VCloudVMViewData[] {
    let viewData: VCloudVMViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  getDeviceData(device: VCloudVMViewData) {
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
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.VCLOUD, device.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.VCLOUD, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            // device.popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            device.popOverDetails.status = value.status;
            device.statsTooltipMessage = 'VMware vCloud VM Statistics';
          }
          return device;
        })
      );
  }

  getToggleInput(view: VCloudVMViewData): PowerToggleInput {
    return {
      confirmTitle: 'VMware vCloud', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.instanceId,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.VCLOUD, userName: '',
      extraParams: { 'vm_id': view.instanceId, 'cloud_uuid': view.cloudId }
    };
  }

  getConsoleAccessInput(view: VCloudVMViewData): ConsoleAccessInput {
    return { label: DeviceMapping.VCLOUD, deviceType: DeviceMapping.VCLOUD, deviceId: view.vmId, newTab: false, deviceName: view.name };
  }
}

export class VCloudVMViewData {
  vmId: string;
  name: string;
  cloudId: string;
  cloud: string;
  managementIp: string;
  instanceId: string;
  osName: string;
  ssrOS: string;
  powerStatus: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin' = 'fa-power-off';
  powerStatusOn: boolean;
  isPowerButtonEnabled: boolean;
  powerTooltipMessage: string;
  vcpus: number;
  memory: string;
  tags: string[];
  monitoring: DeviceMonitoringType;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;

  statsTooltipMessage: string;
  constructor() { }
}

export interface VCloudVM {
  id: number;
  uuid: string;
  cloud: Cloud;
  created_at: string;
  updated_at: string;
  instance_id: string;
  name: string;
  vcpus: number;
  guest_os: string;
  ssr_os: string;
  guest_memory: number;
  power_state: string;
  management_ip: string;
  is_visible: boolean;
  snmp_community: string;
  tags: string[];
  monitoring: DeviceMonitoringType;
}
interface Cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
}
