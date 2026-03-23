import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { GET_VM_LIST_BY_PLATFORM, DEVICE_DATA_BY_DEVICE_TYPE, GET_VM_BY_PLATFORM_AND_ID, TOGGLE_POWER_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { PlatFormMapping, DeviceMapping, NoWhitespaceValidator, AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { catchError, map } from 'rxjs/operators';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { WINDOWS_CONSOLE_CLIENT, VM_CONSOLE_CLIENT, MANAGEMENT_NOT_ENABLED_MESSAGE, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

@Injectable()
export class VmsListEsxiService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private user: UserInfoService,
    private utilService: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getVms(criteria: SearchCriteria): Observable<PaginatedResult<EsxiVM>> {
    return this.tableService.getData<PaginatedResult<EsxiVM>>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.ESXI), criteria);
  }

  getVmById(vmId: string) {
    return this.http.get<EsxiVM>(GET_VM_BY_PLATFORM_AND_ID(PlatFormMapping.ESXI, vmId));
  }

  convertVMtoViewdata(vm: EsxiVM) {
    let a = new EsxiViewData();
    a.vmId = vm.uuid;
    a.name = vm.name;
    a.cloudId = vm.cloud.uuid;
    a.cloud = vm.cloud.name;
    a.instanceId = vm.instance_id;
    a.managementIp = vm.mgmt_ip_address ? vm.mgmt_ip_address : 'N/A';
    a.osName = vm.os_name ? vm.os_name : 'N/A';
    a.ssrOS = vm.ssr_os;
    a.hostName = vm.host_name ? vm.host_name : 'N/A';
    a.cpucores = vm.cpu_core;
    a.vcpus = vm.vcpus;
    a.memory = (vm.guest_memory / 1024) + ' GB';
    a.storage = (vm.disk_space) + ' GB';
    a.hypervisor = vm.host_name;
    a.isManagementEnabled = this.user.isManagementEnabled;
    a.powerStatus = vm.state;
    a.tags = vm.tags.filter(tg => tg);
    a.monitoring = vm.monitoring;

    if (this.user.isManagementEnabled) {
      const isWindows: boolean = (vm.os_name.lastIndexOf('Microsoft', 0) == 0);
      a.isSameTabEnabled = ((vm.mgmt_ip_address ? true : false) && a.powerStatusOn && !isWindows);
      if (!vm.mgmt_ip_address) {
        a.sameTabTootipMessage = 'Management IP not Configured';
      } else if (!a.powerStatusOn) {
        a.sameTabTootipMessage = 'VM is Down';
      } else if (isWindows) {
        a.sameTabTootipMessage = 'Open in Same tab option is not available for windows based machines';
      } else {
        a.sameTabTootipMessage = 'Open in same tab';
      }

      a.isNewTabEnabled = ((vm.mgmt_ip_address ? true : false) && a.powerStatusOn);
      if (!vm.mgmt_ip_address) {
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
      a.updateIpIconEnabled = true;
      a.updateIpIconMsg = 'Update Management Ip';
    } else {
      a.isSameTabEnabled = false;
      a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      a.isNewTabEnabled = false;
      a.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }
    return a;
  }

  converToViewData(vms: EsxiVM[]): EsxiViewData[] {
    let viewData: EsxiViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  getDeviceData(device: EsxiViewData) {
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
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.ESXI, device.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.ESXI, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            // device.popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            device.popOverDetails.status = value.status;
            device.statsTooltipMessage = 'ESXi VM Statistics';
          }
          return device;
        })
      );
  }

  getToggleInput(view: EsxiViewData): PowerToggleInput {
    return {
      confirmTitle: 'Esxi', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.instanceId,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.ESXI, userName: '',
      extraParams: { 'vm_id': view.instanceId, 'cloud_uuid': view.cloudId }
    };
  }

  getConsoleAccessInput(view: EsxiViewData): ConsoleAccessInput {
    return { label: DeviceMapping.ESXI, deviceType: DeviceMapping.ESXI, deviceId: view.vmId, newTab: false, deviceName: view.name };
  }

  resetAuthFormErrors(): any {
    let formErrors = {
      'username': '',
      'password': '',
      'nonFieldErr': ''
    };
    return formErrors;
  }

  authValidationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    }
  };

  buildAuthForm(uuid: string): FormGroup {
    this.resetAuthFormErrors();
    let form = this.builder.group({
      'uuid': [uuid],
      'username': ['', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]]
    });
    return form;
  }

  powerToggle(input: PowerToggleInput, data?: any): Observable<any> {
    return this.http.post(TOGGLE_POWER_BY_DEVICE_TYPE(input.deviceType, input.deviceId, input.currentPowerStatus), data);
  }

}

export class EsxiViewData {
  vmId: string;
  name: string;
  cloudId: string;
  managementIp: string;
  instanceId: string;
  osName: string;
  ssrOS: string;
  hostName: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  cpucores: number;
  vcpus: number;
  memory: string;
  cloud: string;
  storage: string;
  hypervisor: string;
  tags: string[];

  isManagementEnabled: boolean;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;
  statsTooltipMessage: string;

  private _powerStatus: string;
  private _powerOnInProgress: boolean = false;
  private _powerOffInProgress: boolean = false;

  set powerOnInProgress(b: boolean) {
    this._powerOnInProgress = b;
  }

  set powerOffInProgress(b: boolean) {
    this._powerOffInProgress = b;
  }

  set powerStatus(status: string) {
    this._powerStatus = status;
  }
  get powerStatus() {
    if (this._powerStatus == 'poweredOn') {
      return 'Up';
    } else if (this._powerStatus == 'poweredOff') {
      return 'Down';
    } else {
      if (this.powerInProgress) {
        if (this._powerOffInProgress) {
          return 'Stopping';
        } else {
          return 'Starting';
        }
      }
    }
  }
  get powerStatusOn() {
    return this.powerStatus == 'Up';
  }
  private get powerInProgress() {
    return this._powerOnInProgress || this._powerOffInProgress;
  }
  setPowerInProgress() {
    if (this.powerStatusOn) {
      this._powerOffInProgress = true;
      this._powerOnInProgress = false;
    } else {
      this._powerOnInProgress = true;
      this._powerOffInProgress = false;
    }
    this.powerStatus = null;
  }
  get powerIconMsg() {
    if (this.isManagementEnabled && this.powerInProgress) {
      if (this._powerOffInProgress) {
        return 'Stopping';
      } else {
        return 'Starting';
      }
    } else if (!this.isManagementEnabled) {
      return MANAGEMENT_NOT_ENABLED_MESSAGE();
    }
    if (this.powerStatusOn) {
      return 'Power Off'
    } else {
      return 'Power On';
    }
  }
  get powerIcon() {
    return this.powerInProgress ? 'fa fa-spinner fa-spin' : 'fa-power-off';
  }
  get powerIconEnabled() {
    return this.isManagementEnabled && !this.powerInProgress;
  }

  updateIpIconMsg: 'Update Management Ip';
  updateIpIconEnabled: boolean;

  monitoring: DeviceMonitoringType;

  constructor() { }
}

export interface EsxiVM {
  id: number;
  cloud: Cloud;
  uuid: string;
  name: string;
  instance_id: string;
  management_ip: string;
  mgmt_ip_address: string;
  os_name: string;
  ssr_os: string;
  host_name: string;
  cpu_core: number;
  vcpus: number;
  disk_space: number;
  state: string;
  datacenter: string;
  guest_memory: number;
  vmpath_name: string;
  migration_date: any;
  migration_status: any;
  backup_date: any;
  backup_status: any;
  is_visible: boolean;
  ip_address: any;
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

export enum ESXI_VM_ACTIONS {
  POWER_ON = 'Power on',
  POWER_OFF = 'Power off'
}

export interface EsxiVMAuthType {
  uuid: string;
  username: string;
  password: string;
}