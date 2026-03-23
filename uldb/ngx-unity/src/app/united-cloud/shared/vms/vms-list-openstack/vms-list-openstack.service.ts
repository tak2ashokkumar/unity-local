import { Injectable } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { EMPTY, Observable, of } from 'rxjs';
import { GET_VM_LIST_BY_PLATFORM, DEVICE_DATA_BY_DEVICE_TYPE, GET_VM_BY_PLATFORM_AND_ID, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { PlatFormMapping, DeviceMapping, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';
import { VM_CONSOLE_CLIENT, MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

@Injectable()
export class VmsListOpenstackService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getVms(criteria: SearchCriteria): Observable<PaginatedResult<OpenStackVM>> {
    return this.tableService.getData<PaginatedResult<OpenStackVM>>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.OPENSTACK), criteria);
  }

  getAllVms(criteria: SearchCriteria): Observable<OpenStackVM[]> {
    return this.tableService.getData<OpenStackVM[]>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.OPENSTACK), criteria);
  }

  getVmById(vmId: string) {
    return this.http.get<OpenStackVM>(GET_VM_BY_PLATFORM_AND_ID(PlatFormMapping.OPENSTACK, vmId));
  }

  convertVMtoViewdata(vm: OpenStackVM) {
    let a = new OpenStackViewData();
    a.vmId = vm.uuid;
    a.name = vm.name;
    a.cloudId = vm.cloud.uuid;
    a.cloud = vm.cloud.name;
    a.instanceId = vm.instance_id;
    a.managementIp = vm.management_ip ? vm.management_ip : 'N/A';
    a.image = vm.operating_system ? vm.operating_system : 'N/A';
    a.powerStatus = vm.last_known_state == 'SHUTOFF' ? 'Down' : 'Up';
    a.powerStatusOn = vm.last_known_state == 'SHUTOFF' ? false : true;
    a.powerTooltipMessage = vm.last_known_state == 'SHUTOFF' ? 'Power On' : 'Power Off';
    a.ipAddress = vm.ip_address;
    a.vcpus = vm.vcpu;
    a.memory = (vm.memory / 1024) + ' GB';
    a.disk = (vm.memory) + ' GB';
    a.ssrOS = vm.ssr_os;
    a.tags = vm.tags.filter(tg => tg);
    a.monitoring = vm.monitoring;

    if (this.user.isManagementEnabled) {
      a.isPowerButtonEnabled = true;
      a.isSameTabEnabled = ((vm.management_ip ? true : false) && a.powerStatusOn);
      if (!vm.management_ip) {
        a.sameTabTootipMessage = 'Management IP not Configured';
      } else if (!a.powerStatusOn) {
        a.sameTabTootipMessage = 'VM is Down';
      } else {
        a.sameTabTootipMessage = 'Open in same tab';
      }

      a.isNewTabEnabled = ((vm.management_ip ? true : false) && a.powerStatusOn);
      if (!vm.management_ip) {
        a.newTabToolipMessage = 'Management IP not Configured';
      } else if (!a.powerStatusOn) {
        a.newTabToolipMessage = 'VM is Down';
      } else {
        a.newTabToolipMessage = 'Open In New Tab';
        a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
      }
    } else {
      a.isSameTabEnabled = false;
      a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      a.isNewTabEnabled = false;
      a.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      a.isPowerButtonEnabled = false;
      a.powerStatusOn = false;
      a.powerTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }
    return a;
  }

  converToViewData(vms: OpenStackVM[]): OpenStackViewData[] {
    let viewData: OpenStackViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  getDeviceData(device: OpenStackViewData) {
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
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, device.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            // device.popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            device.popOverDetails.status = value.status;
            device.statsTooltipMessage = 'OpenStack VM Statistics';
          }
          return device;
        })
      );
  }

  getToggleInput(view: OpenStackViewData): PowerToggleInput {
    return {
      confirmTitle: 'OpenStack Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.instanceId,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, userName: '',
      extraParams: { 'vm_id': view.instanceId, 'cloud_uuid': view.cloudId }
    };
  }

  getConsoleAccessInput(view: OpenStackViewData): ConsoleAccessInput {
    return { label: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, deviceType: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, deviceId: view.instanceId, newTab: false, deviceName: view.name };
  }
}
export class OpenStackViewData {
  vmId: string;
  instanceId: string;
  name: string;
  cloudId: string;
  managementIp: string;
  image: string;
  cloud: string;
  powerStatus: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  powerStatusOn: boolean;
  isPowerButtonEnabled: boolean;
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin' = 'fa-power-off';
  powerTooltipMessage: string;
  ipAddress: string;
  vcpus: number;
  memory: string;
  disk: string;
  tags: string[];
  ssrOS: string;
  monitoring: DeviceMonitoringType;

  statsTooltipMessage: string;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;

  constructor() { }
}

export interface OpenStackVM {
  id: number;
  cloud: Cloud;
  uuid: string;
  name: string;
  instance_id: string;
  management_ip: string;
  migration_date: string;
  migration_status: string;
  backup_date: string;
  backup_status: string;
  is_visible: boolean;
  ip_address: string;
  customer: string;
  created_at: string;
  updated_at: string;
  os_id: string;
  ssr_os: string;
  vcpu: number;
  memory: number;
  disk: number;
  operating_system: string;
  last_known_state: string;
  controller: string;
  tags: string[];
  monitoring: DeviceMonitoringType;
}
interface Cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
}
