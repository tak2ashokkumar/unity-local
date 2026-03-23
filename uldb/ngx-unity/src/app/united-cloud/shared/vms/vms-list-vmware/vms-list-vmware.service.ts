import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AppLevelService } from 'src/app/app-level.service';
import {
  DEVICE_DATA_BY_DEVICE_TYPE,
  GET_VCENTER_VM_PROVISION_METADATA,
  GET_VM_BY_PLATFORM_AND_ID, GET_VM_LIST_BY_PLATFORM,
  INSTALL_VMWARE_TOOLS,
  PRIVATE_CLOUDS,
  TOGGLE_POWER_BY_DEVICE_TYPE,
  UN_INSTALL_VMWARE_TOOLS,
  VM_CLONE_BY_DEVICE_TYPE,
  VM_CONVERT_TO_TEMPLATE_BY_DEVICE_TYPE, VM_DELETE_BY_DEVICE_TYPE, VM_REBOOT_BY_DEVICE_TYPE, VM_SHUTDOWN_GUEST_OS_BY_DEVICE_TYPE,
  VMWARE_VCENTER_RENAME,
  ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE,
} from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';
import { VcenterVMCreationMetaData } from './vms-list-vmware-add/vms-list-vmware-add.type';
import { BulkUpdateFieldType } from '../../entities/bulk-update-field.type';

@Injectable()
export class VmsListVmwareService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private user: UserInfoService,
    private utilService: AppUtilityService,
    private appService: AppLevelService,
    private tableService: TableApiServiceService) { }


  /**
   * This function syncs all vms. This is used by the VmsListVmwareComponent to sync vms related to all vCenter accounts.
   * @returns Observable<any>
   */
  syncVcenterVms(): Observable<any> {
    return this.http.get<any>(`/customer/integration/vcenter/accounts/discover_vmware_hosts/`);
  }

  getVmsSummary(cloudId: string): Observable<VMwareVMSummary> {
    let params = new HttpParams().set('cloud_uuid', cloudId);
    return this.http.get<VMwareVMSummary>(`/rest/vmware/migrate/summary/`, { params: params });
  }

  getVms(criteria: SearchCriteria): Observable<PaginatedResult<VMwareVM>> {
    return this.tableService.getData<PaginatedResult<VMwareVM>>(GET_VM_LIST_BY_PLATFORM(PlatFormMapping.VMWARE), criteria);
  }

  getVmById(vmId: string) {
    return this.http.get<VMwareVM>(GET_VM_BY_PLATFORM_AND_ID(PlatFormMapping.VMWARE, vmId));
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=vmware`)
  }

  getVMCreationMetaData(pcId: string, cloudName: string): Observable<any> {
    // return this.http.get<VcenterVMCreationMetaData[]>(GET_DUMMY_VM_RESOURCE_PARAMS());
    if (cloudName === '') {
      return this.http.get<VcenterVMCreationMetaData[]>(GET_VCENTER_VM_PROVISION_METADATA(pcId));
    } else {
      return this.http.get<VcenterVMCreationMetaData[]>(`/customer/managed/${cloudName}/accounts/${pcId}/retrieve_resource_params/`);
    }
  }

  updateMultipleVm(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/rest/vmware/migrate/bulk_update/`, obj, { params });
  }


  getPrivateClouds() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<PrivateClouds[]>(PRIVATE_CLOUDS(), { params: params });
  }

  convertToVMBackupStatusSummary(data: VMwareVMSummaryByBackupStatus) {
    let view = new VMwareVMBackupStatusSummary();
    view.success = data.success;
    view.failed = data.failed;
    view.unknown = data.unknown;
    view.warning = data.warning;
    view.successAndFailedCount = data.success + data.failed;
    view.total = data.total;
    return view;
  }

  convertVMtoViewdata(vm: VMwareVM) {
    let a = new VMwareViewData();
    a.vmId = vm.uuid;
    a.name = vm.name;
    a.cloudId = vm.cloud.uuid;
    a.isSelected = false;
    a.cloud = vm.cloud.name;
    a.instanceId = vm.instance_id;
    a.managementIp = vm.mgmt_ip_address ? vm.mgmt_ip_address : 'N/A';
    a.osName = vm.os_name ? vm.os_name : 'N/A';
    a.ssrOS = vm.ssr_os;
    a.powerStatus = vm.state;
    a.cpucores = vm.cpu_core;
    a.vcpus = vm.vcpus;
    a.memory = (vm.guest_memory / 1024) + ' GB';
    a.storage = (vm.disk_space) + ' GB';
    a.hypervisor = vm.host_name;
    a.type = vm.is_template ? 'Template' : 'VM';
    a.isTemplate = vm.is_template;
    a.cloneInProgress = vm.actions_in_progress.clone;
    a.convertInProgress = vm.actions_in_progress.convert_to_template;
    a.powerOnInProgress = vm.actions_in_progress.power_on;
    a.powerOffInProgress = vm.actions_in_progress.power_off;
    a.shutdownGuestOSInProgress = vm.actions_in_progress.guest_shutdown;
    a.tags = vm.tags.filter(tg => tg);
    a.monitoring = vm.monitoring;
    a.toolsMounted = vm.vmware_tools_mounted;
    if (vm.status) {
      a.deviceStatus = this.utilService.getDeviceStatus(vm.status);
    }

    a.lastBackupTime = vm.last_backup_time ? this.utilService.toUnityOneDateFormat(vm.last_backup_time) : 'N/A';
    a.backupStatusIcon = this.getBackupStatusIcon(vm.backup_status);
    a.backupStatusTooltip = this.getBackupStatusTooltip(vm.backup_status);
    a.backupId = vm.backup_job_uuid;
    let diff = this.utilService.getTimeDifferenceByFromDate(vm.last_backup_time);
    let rpo = '';
    if (diff) {
      diff.days ? rpo = rpo.concat(`${diff.days} days`) : rpo = rpo;
      diff.hours ? rpo = rpo.concat(` ${diff.hours} hours`) : rpo = rpo;
      diff.minutes ? rpo = rpo.concat(` ${diff.minutes} minutes`) : rpo = rpo;
      if (!diff.days && !diff.hours) {
        diff.seconds ? rpo = rpo.concat(` ${diff.seconds} seconds`) : rpo = rpo;
      }
    }
    a.rpo = diff ? rpo : 'N/A';

    if (this.user.isManagementEnabled && !vm.is_template) {
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
    if (vm.is_template) {
      a.popOverDetails.uptime = '0';
      a.popOverDetails.lastreboot = '0';
      a.statsTooltipMessage = 'Feature Not Available For Template';
      a.isSameTabEnabled = false;
      a.sameTabTootipMessage = 'Feature Not Available For Template';
      a.isNewTabEnabled = false;
      a.newTabToolipMessage = 'Feature Not Available For Template';
      a.updateIpIconEnabled = false;
      a.updateIpIconMsg = 'Feature Not Available For Template';
      a.editTooltipMessage = 'Feature Not Available For Template';
    }

    return a;
  }

  converToViewData(vms: VMwareVM[]): VMwareViewData[] {
    let viewData: VMwareViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  getDeviceData(device: VMwareViewData) {
    if (!device.monitoring.configured) {
      device.popOverDetails.uptime = '0';
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      device.isStatsButtonEnabled = true;
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }

    if (device.monitoring.configured && !device.monitoring.enabled) {
      device.popOverDetails.uptime = '0';
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilService.getDeviceStatus('-2');
      }
      device.isStatsButtonEnabled = true;
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }

    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE, device.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE, device.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            device.popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            device.popOverDetails.status = value.status;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            device.isStatsButtonEnabled = true;
            device.statsTooltipMessage = 'VM Statistics';
          }
          return device;
        })
      );
  }

  getBackupStatusIcon(status: string) {
    switch (status) {
      case `Success`:
        return `fa fa-check-circle text-success`;
      case `Failed`:
        return `fa fa-exclamation-circle text-danger`;
      case `Warning`:
      case `None`:
        return `fa fa-exclamation-circle text-warning`;
      default:
        return;
    }
  }

  getBackupStatusTooltip(status: string) {
    switch (status) {
      case `Success`:
        return `Success`;
      case `Failed`:
        return `Failed`;
      case `Warning`:
        return `Warning`;
      case `None`:
        return `None`;
      default:
        return;
    }
  }

  getToggleInput(view: VMwareViewData): PowerToggleInput {
    return {
      confirmTitle: 'VMware vCenter', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.instanceId,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE, userName: '',
      extraParams: { 'vm_id': view.instanceId, 'cloud_uuid': view.cloudId }
    };
  }

  getConsoleAccessInput(view: VMwareViewData): ConsoleAccessInput {
    return { label: DeviceMapping.VMWARE_VIRTUAL_MACHINE, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE, deviceId: view.vmId, newTab: false, deviceName: view.name };
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

  resetCloneFormErrors(): any {
    let formErrors = {
      'name': '',
      'clone_type': '',
      'storage': '',
      'count': '',
    };
    return formErrors;
  }

  cloneValidationMessages = {
    'name': {
      'required': 'Name is required',
      'pattern': 'Invalid name format'
    },
    'clone_type': {
      'required': 'Clone type is required',
    },
    'storage': {
      'required': 'Storage is required',
      'pattern': 'Invalid format'
    },
    'count': {
      'min': 'Count cannot be less that 1',
    }
  };

  buildCloneForm(): FormGroup {
    this.resetCloneFormErrors();
    let form = this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.pattern({ expression: { 'pattern': /[a-zA-Z0-9]*[-]*[a-zA-Z0-9]+$/ } })]],
      'clone_type': ['', [Validators.required]]
    });
    return form;
  }

  resetRenameFormErrors(): any {
    let formErrors = {
      'name': ''
    };
    return formErrors;
  }

  renameValidationMessages = {
    'name': {
      'required': 'Name is required',
      'pattern': 'Invalid name format'
    }
  };

  buildRenameForm(): FormGroup {
    this.resetRenameFormErrors();
    let form = this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.pattern({ expression: { 'pattern': /[a-zA-Z0-9]*[-]*[a-zA-Z0-9]+$/ } })]]
    });
    return form;
  }

  rename(data: VMwareVMRenameType): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(VMWARE_VCENTER_RENAME(data.uuid), data);
  }

  clone(data: VMwareVMCloneType): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(VM_CLONE_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE, data.uuid), data);
  }

  reboot(data: VMwareVMAuthType): Observable<any> {
    return this.http.post(VM_REBOOT_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE, data.uuid), data);
  }

  handleShutdownGuestOS(data: VMwareVMAuthType): Observable<any> {
    return this.http.post(VM_SHUTDOWN_GUEST_OS_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE, data.uuid), data);
  }

  handleInstallVMwareTool(data: VMwareVMAuthType, toolsMounted: boolean): Observable<any> {
    return this.http.post(toolsMounted ? UN_INSTALL_VMWARE_TOOLS(data.uuid) : INSTALL_VMWARE_TOOLS(data.uuid), data);
  }

  powerToggle(input: PowerToggleInput, data?: any): Observable<any> {
    return this.http.post(TOGGLE_POWER_BY_DEVICE_TYPE(input.deviceType, input.deviceId, input.currentPowerStatus), data);
  }

  delete(data: VMwareVMAuthType): Observable<CeleryTask> {
    return this.http.request<CeleryTask>('delete', VM_DELETE_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE, data.uuid), { body: data });
  }

  convertToTemplate(data: VMwareVMAuthType): Observable<any> {
    return this.http.post(VM_CONVERT_TO_TEMPLATE_BY_DEVICE_TYPE(DeviceMapping.VMWARE_VIRTUAL_MACHINE, data.uuid), data);
  }

  syncVMS(pcId: string) {
    // return this.http.get(`/customer/managed/vcenter/accounts/${pcId}/sync_vms/`);
    return this.http.get<CeleryTask>(`/customer/managed/vcenter/accounts/${pcId}/sync_vms/`)
      .pipe(catchError((e: HttpErrorResponse) => {
        return throwError(e);
      }), switchMap(res => this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1))), take(1));
  }

}

export class VMwareVMBackupStatusSummary {
  constructor() { }
  success: number = 0;
  failed: number = 0;
  unknown: number = 0;
  warning: number = 0;
  successAndFailedCount: number = 0;
  total: number = 0;
}

export class VMwareViewData {
  vmId: string;
  name: string;
  deviceStatus: string;
  cloudId: string;
  managementIp: string;
  instanceId: string;
  osName: string;
  ssrOS: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin' = 'fa-power-off';
  powerTooltipMessage: string;
  cpucores: number;
  tags: string[];
  vcpus: number;
  memory: string;
  cloud: string;
  storage: string;
  hypervisor: string;
  monitoring: DeviceMonitoringType;
  backupId: string;
  backupStatus: string;
  backupStatusIcon: string;
  backupStatusTooltip: string;
  lastBackupTime: string;
  rpo: string;
  isSelected: boolean;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;

  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;
  editTooltipMessage: string = 'Edit Settings';

  isTemplate: boolean = false;
  type: string;
  toolsMounted: boolean;

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
    if (this.powerInProgress) {
      if (this._powerOffInProgress) {
        return 'Stopping';
      } else {
        return 'Starting';
      }
    }
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress && !this.powerInProgress) {
      return 'Other action in progress';
    } else if (this.powerStatusOn) {
      return 'Power Off'
    } else {
      return 'Power On';
    }
  }
  get powerIcon() {
    return this.powerInProgress ? 'fa fa-spinner fa-spin' : 'fa-power-off';
  }
  get powerIconEnabled() {
    return !(this.powerInProgress || this.isTemplate || (this.inProgress && !this.powerInProgress));
  }

  private _cloneInProgress: boolean = false;
  get cloneIconMsg() {
    if (this.inProgress && !this.cloneInProgress) {
      return 'Other action in progress';
    }
    return this._cloneInProgress ? 'Clone in progress' : 'Clone VM';
  }
  get cloneIcon() {
    return this._cloneInProgress ? 'fa fa-spinner fa-spin' : 'far fa-clone';
  }
  get cloneIconEnabled() {
    return !(this.cloneInProgress || (this.inProgress && !this.cloneInProgress));
  }
  get cloneInProgress() {
    return this._cloneInProgress;
  }
  set cloneInProgress(b: boolean) {
    this._cloneInProgress = b;
  }

  private _rebootInProgress: boolean = false;
  get rebootIconMsg() {
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress && !this.rebootInProgress) {
      return 'Other action in progress';
    } else if (!this.powerStatusOn) {
      return 'VM is down';
    }
    return this._rebootInProgress ? 'Reboot in progress' : 'Reboot VM';
  }
  get rebootIcon() {
    return this._rebootInProgress ? 'fa fa-spinner fa-spin' : 'fas fa-redo-alt';
  }
  get rebootIconEnabled() {
    return !(this.rebootInProgress || this.isTemplate || !this.powerStatusOn || (this.inProgress && !this.rebootInProgress));
  }
  get rebootInProgress() {
    return this._rebootInProgress;
  }
  set rebootInProgress(b: boolean) {
    this._rebootInProgress = b;
  }

  get webConsoleIconEnabled() {
    return this.powerStatusOn && !(this.powerInProgress || this.isTemplate || (this.inProgress && !this.powerInProgress));
    // return false;
  }
  get webConsoleIconMsg() {
    return 'webconsole'
    // if (this.powerInProgress) {
    //   if (this._powerOffInProgress) {
    //     return 'VM Powering Off';
    //   } else {
    //     return 'VM Powering on';
    //   }
    // }
    // if (this.isTemplate) {
    //   return 'Feature Not Available For Template';
    // } else if (this.inProgress && !this.powerInProgress) {
    //   return 'Other action in progress';
    // } else if (this.powerStatusOn) {
    //   return 'webconsole'
    // } else {
    //   return 'VM powered off';
    // }
  }

  private _convertInProgress: boolean = false;
  get convertIconMsg() {
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress && !this.convertInProgress) {
      return 'Other action in progress';
    } else if (this.powerStatusOn) {
      return 'VM is up';
    }
    return this._convertInProgress ? 'Create in progress' : 'Create a template';
  }
  get convertIcon() {
    return this._convertInProgress ? 'fa fa-spinner fa-spin' : 'far fa-file';
  }
  get convertIconEnabled() {
    return !(this.convertInProgress || this.powerStatusOn || this.isTemplate || (this.inProgress && !this.convertInProgress));
  }
  get convertInProgress() {
    return this._convertInProgress;
  }
  set convertInProgress(b: boolean) {
    this._convertInProgress = b;
  }

  private _shutdownGuestOSInProgress: boolean = false;
  get shutdownGuestOSIconMsg() {
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress && !this.shutdownGuestOSInProgress) {
      return 'Other action in progress';
    } else if (!this.powerStatusOn) {
      return 'VM is down';
    }
    return this._shutdownGuestOSInProgress ? 'Shutdown in progress' : 'Shutdown Guest OS';
  }
  get shutdownGuestOSIcon() {
    return this._shutdownGuestOSInProgress ? 'fa fa-spinner fa-spin' : 'fas fa-stop-circle';
  }
  get shutdownGuestOSIconEnabled() {
    return !(this.shutdownGuestOSInProgress || !this.powerStatusOn || this.isTemplate || (this.inProgress && !this.shutdownGuestOSInProgress));
  }
  get shutdownGuestOSInProgress() {
    return this._shutdownGuestOSInProgress;
  }
  set shutdownGuestOSInProgress(b: boolean) {
    this._shutdownGuestOSInProgress = b;
  }

  private _installVMwareToolInProgress: boolean = false;
  get installVMwareToolIconMsg() {
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress && !this.installVMwareToolInProgress) {
      return 'Other action in progress';
    } else if (!this.powerStatusOn) {
      return 'VM is down';
    } else if (this.toolsMounted) {
      return 'Unmount VMware Tools';
    }
    return this._installVMwareToolInProgress ? 'Installation in progress' : 'Mount VMware Tools';
  }
  get installVMwareToolIcon() {
    return this._installVMwareToolInProgress ? 'fa fa-spinner fa-spin' : 'fas fa-anchor';
  }
  get installVMwareToolIconEnabled() {
    return !(this.installVMwareToolInProgress || !this.powerStatusOn || this.isTemplate || (this.inProgress && !this.installVMwareToolInProgress));
  }

  get installVMwareToolInProgress() {
    return this._installVMwareToolInProgress;
  }
  set installVMwareToolInProgress(b: boolean) {
    this._installVMwareToolInProgress = b;
  }

  private _renameVMwareInProgress: boolean = false;
  get renameVMwareIconMsg() {
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress && !this.renameVMwareInProgress) {
      return 'Other action in progress';
    }
    return this._renameVMwareInProgress ? 'Rename in progress' : 'Rename';
  }
  get renameVMwareIcon() {
    return this._renameVMwareInProgress ? 'fa fa-spinner fa-spin' : 'far fa-file-alt';
  }
  get renameVMwareIconEnabled() {
    return !(this.renameVMwareInProgress || this.isTemplate || (this.inProgress && !this.renameVMwareInProgress));
  }

  get renameVMwareInProgress() {
    return this._renameVMwareInProgress;
  }
  set renameVMwareInProgress(b: boolean) {
    this._renameVMwareInProgress = b;
  }

  private _deleteInProgress: boolean = false;
  get deleteIconMsg() {
    if (this.inProgress && !this.deleteInProgress) {
      return 'Other action in progress';
    } else if (this.powerStatusOn) {
      return 'VM is up';
    }
    return this._deleteInProgress ? 'Delete in progress' : 'Delete VM';
  }
  get deleteIcon() {
    return this._deleteInProgress ? 'fa fa-spinner fa-spin' : 'far fa-trash-alt';
  }
  get deleteIconEnabled() {
    return !(this.deleteInProgress || this.powerStatusOn || (this.inProgress && !this.deleteInProgress));
  }
  get deleteInProgress() {
    return this._deleteInProgress;
  }
  set deleteInProgress(b: boolean) {
    this._deleteInProgress = b;
  }

  get snapshotIconMsg() {
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress) {
      return 'Other action in progress';
    }
    return 'Snapshots';
  }
  get snapshotIcon() {
    return 'fas fa-image';
  }
  get snapshotIconEnabled() {
    return !(this.isTemplate || this.inProgress);
  }

  get inProgress() {
    return this.cloneInProgress
      || this.convertInProgress
      || this.deleteInProgress
      || this.powerInProgress
      || this.shutdownGuestOSInProgress
      || this.rebootInProgress;
  }

  updateIpIconMsg: 'Update Management Ip' | 'Feature Not Available For Template';
  updateIpIconEnabled: boolean;

  constructor() { }
}

export interface VMwareVM {
  id: number;
  cloud: Cloud;
  uuid: string;
  name: string;
  instance_id: string;
  management_ip: string;
  mgmt_ip_address: string;
  console_url: string;
  os_name: string;
  ssr_os: string;
  host_name: string;
  cpu_core: number;
  vcpus: number;
  disk_space: number;
  state: string;
  status: string;
  datacenter: string;
  guest_memory: number;
  vmpath_name: string;
  migration_date: any;
  migration_status: any;
  backup_date: any;
  backup_status: any;
  backup_job_uuid: string;
  last_backup_time: string;
  is_visible: boolean;
  ip_address: any;
  snmp_community: string;
  actions_in_progress: VMwareVMActionsInProgress;
  is_template: boolean;
  tags: string[];
  monitoring: DeviceMonitoringType;
  vmware_tools_mounted: boolean;
}
interface Cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
}
interface VMwareVMActionsInProgress {
  clone: boolean;
  reboot: boolean;
  convert_to_template: boolean;
  delete: boolean;
  power_off: boolean;
  power_on: boolean;
  guest_shutdown: boolean;
}

export enum VMWARE_VM_ACTIONS {
  CLONE = 'Clone',
  REBOOT = 'Reboot',
  CONVERT_TO_TEMPLATE = 'Convert to template',
  DELETE = 'DELETE',
  POWER_ON = 'Power on',
  POWER_OFF = 'Power off',
  SHUTDOWN_GUEST_OS = 'Shutdown Guest OS',
  INSTALL_VMWARE_TOOL = 'Mount VMware Tools',
  UN_INSTALL_VMWARE_TOOL = 'Unmount VMware Tools',
  RENAME = 'Rename'
}

export interface VMwareVMAuthType {
  uuid: string;
  username: string;
  password: string;
}

export interface VMwareVMCloneType extends VMwareVMAuthType {
  name: string;
  storage?: string;
  count?: number;
  clone_type: string;
}

export interface VMwareVMRenameType extends VMwareVMAuthType {
  name: string;
}


export interface VMwareVMSummary {
  status: VMwareVMSummaryByStatus;
  operating_system: VMwareVMSummaryByOS;
  backup_status: VMwareVMSummaryByBackupStatus;
}
export interface VMwareVMSummaryByStatus {
  total: number;
  up: number;
  down: number;
  unknown: number;
}
export interface VMwareVMSummaryByOS {
  [key: string]: number;
}
export interface VMwareVMSummaryByBackupStatus {
  failed: number;
  success: number;
  unknown: number;
  warning: number;
  total: number;
}
