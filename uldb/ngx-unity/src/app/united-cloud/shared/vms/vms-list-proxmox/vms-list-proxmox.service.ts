import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_VM_BY_PLATFORM_AND_ID, GET_VM_LIST_BY_PLATFORM, TOGGLE_POWER_BY_DEVICE_TYPE, VM_CLONE_BY_DEVICE_TYPE, VM_CONVERT_TO_TEMPLATE_BY_DEVICE_TYPE, VM_DELETE_BY_DEVICE_TYPE, VM_REBOOT_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';

@Injectable()
export class VmsListProxmoxService {

  constructor(private http: HttpClient,
    private user: UserInfoService,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getVms(platformType: PlatFormMapping, criteria: SearchCriteria): Observable<PaginatedResult<ProxmoxVM>> {
    return this.tableService.getData<PaginatedResult<ProxmoxVM>>(GET_VM_LIST_BY_PLATFORM(platformType), criteria);
  }

  getVmById(platformType: PlatFormMapping, uuid: string) {
    return this.http.get<ProxmoxVM>(GET_VM_BY_PLATFORM_AND_ID(platformType, uuid));
  }

  convertVMtoViewdata(vm: ProxmoxVM) {
    let a = new ProxmoxVMViewData();
    a.uuid = vm.uuid;
    a.vmId = vm.vm_id;
    a.name = vm.vm_name;
    a.cloudId = vm.cloud.uuid;
    a.cloud = vm.cloud.name;
    a.managementIp = vm.management_ip ? vm.management_ip : 'N/A';
    a.osName = vm.os ? vm.os : 'N/A';
    a.ssrOS = vm.ssr_os;
    a.powerStatus = vm.status;
    a.cpucores = vm.cpu;
    a.memory = vm.memory;
    a.storage = vm.disk;
    a.isTemplate = vm.is_template;
    a.lastRebootTime = vm.last_reboot_time ? this.utilSvc.toUnityOneDateFormat(vm.last_reboot_time) : 'N/A';
    a.type = vm.is_template ? 'Template' : 'VM';
    a.cloneInProgress = vm.actions_in_progress.clone;
    a.rebootInProgress = vm.actions_in_progress.reboot;
    a.convertInProgress = vm.actions_in_progress.convert_to_template;
    a.deleteInProgress = vm.actions_in_progress.delete;
    a.powerOnInProgress = vm.actions_in_progress.power_on;
    a.powerOffInProgress = vm.actions_in_progress.power_off;
    a.tags = vm.tags.filter(tg => tg);

    if (this.user.isManagementEnabled && !vm.is_template) {

      const isWindows: boolean = (vm.os.lastIndexOf('Microsoft', 0) == 0);
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
      a.updateIpIconEnabled = true;
      a.updateIpIconMsg = 'Update Management Ip';
    } else {
      a.isSameTabEnabled = false;
      a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      a.isNewTabEnabled = false;
      a.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      // a.powerStatusOn = false;
      // a.isPowerButtonEnabled = false;
      // a.powerTooltipMessage = 'This feature is not enabled';
    }
    if (vm.is_template) {
      a.popOverDetails.uptime = '0';
      a.popOverDetails.lastreboot = '0';
      a.statsTooltipMessage = 'Feature Not Available For Template';
      a.isSameTabEnabled = false;
      a.sameTabTootipMessage = 'Feature Not Available For Template';
      a.isNewTabEnabled = false;
      a.newTabToolipMessage = 'Feature Not Available For Template';
      // a.powerStatusOn = false;
      // a.isPowerButtonEnabled = false;
      // a.powerTooltipMessage = 'Feature Not Available For Template';
      a.updateIpIconEnabled = false;
      a.updateIpIconMsg = 'Feature Not Available For Template';
    }
    return a;
  }

  converToViewData(vms: ProxmoxVM[]): ProxmoxVMViewData[] {
    let viewData: ProxmoxVMViewData[] = [];
    vms.map(vm => {
      viewData.push(this.convertVMtoViewdata(vm));
    });
    return viewData;
  }

  getDeviceData(deviceMapping: DeviceMapping, deviceId: string): Observable<Map<string, DeviceData>> {
    return this.http.get(DEVICE_DATA_BY_DEVICE_TYPE(deviceMapping, deviceId), { headers: Handle404Header })
      .pipe(
        map((res: any) => {
          return new Map<string, DeviceData>().set(deviceId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, DeviceData>().set(deviceId, null));
        })
      );
  }

  getToggleInput(deviceMapping: DeviceMapping, view: ProxmoxVMViewData): PowerToggleInput {
    return {
      confirmTitle: deviceMapping, confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.uuid,
      currentPowerStatus: view.powerStatusOn, deviceType: deviceMapping, userName: '',
      extraParams: { 'vm_id': view.vmId, 'cloud_uuid': view.cloudId }
    };
  }

  getConsoleAccessInput(deviceMapping: DeviceMapping, view: ProxmoxVMViewData): ConsoleAccessInput {
    return { label: deviceMapping, deviceType: deviceMapping, deviceId: view.uuid, newTab: false, deviceName: view.name };
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
      'storage': '',
    };
    return formErrors;
  }

  cloneValidationMessages = {
    'name': {
      'required': 'Name is required',
      'pattern': 'Invalid name format'
    },
    'storage': {
      'required': 'Storage is required',
      'pattern': 'Invalid format'
    }
  };

  buildCloneForm(): FormGroup {
    this.resetCloneFormErrors();
    let form = this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.pattern({ expression: { 'pattern': /[a-zA-Z0-9]*[-]*[a-zA-Z0-9]+$/ } })]],
      'storage': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.pattern({ expression: { 'pattern': /[a-zA-Z0-9]*[-]*[a-zA-Z0-9]+$/ } })]]
    });
    return form;
  }

  clone(deviceMapping: DeviceMapping, data: ProxmoxCloneType): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(VM_CLONE_BY_DEVICE_TYPE(deviceMapping, data.uuid), data);
  }

  delete(deviceMapping: DeviceMapping, data: ProxmoxAuthType): Observable<CeleryTask> {
    return this.http.request<CeleryTask>('delete', VM_DELETE_BY_DEVICE_TYPE(deviceMapping, data.uuid), { body: data });
  }

  reboot(deviceMapping: DeviceMapping, data: ProxmoxAuthType): Observable<any> {
    return this.http.post(VM_REBOOT_BY_DEVICE_TYPE(deviceMapping, data.uuid), data);
  }

  powerToggle(input: PowerToggleInput, data?: any): Observable<any> {
    return this.http.post(TOGGLE_POWER_BY_DEVICE_TYPE(input.deviceType, input.deviceId, input.currentPowerStatus), data);
  }

  convertToTemplate(deviceMapping: DeviceMapping, data: ProxmoxAuthType): Observable<any> {
    return this.http.post(VM_CONVERT_TO_TEMPLATE_BY_DEVICE_TYPE(deviceMapping, data.uuid), data);
  }
}

export class ProxmoxVMViewData {
  uuid: string;
  vmId: string;
  instanceId: string;
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
  isTemplate: boolean;
  type: string;
  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;
  lastRebootTime: string;
  tags: string[];

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
    if (this._powerStatus == 'running') {
      return 'Up';
    } else if (this._powerStatus == 'stopped') {
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

  private _convertInProgress: boolean = false;
  get convertIconMsg() {
    if (this.isTemplate) {
      return 'Feature Not Available For Template';
    } else if (this.inProgress && !this.convertInProgress) {
      return 'Other action in progress';
    } else if (this.powerStatusOn) {
      return 'VM is up';
    }
    return this._convertInProgress ? 'Conversion in progress' : 'Convert to template';
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

  get inProgress() {
    return this.cloneInProgress || this.convertInProgress || this.deleteInProgress || this.powerInProgress || this.rebootInProgress;
  }

  updateIpIconMsg: 'Update Management Ip' | 'Feature Not Available For Template';
  updateIpIconEnabled: boolean;

  statsTooltipMessage: string;
  constructor() { }
}

export interface ProxmoxVM {
  id: number;
  uuid: string;
  cloud: Cloud;
  vm_id: string;
  vm_name: string;
  host_name: string;
  os_type: string;
  os: string;
  ssr_os: string;
  cpu: number;
  memory: string;
  disk: string;
  status: 'stopped' | 'running';
  ip_address: string;
  cluster: number;
  is_template: boolean;
  actions_in_progress: ProxmoxVMActionsInProgress;
  management_ip: string;
  last_reboot_time: string;
  tags: string[];
}

interface ProxmoxVMActionsInProgress {
  clone: boolean;
  reboot: boolean;
  convert_to_template: boolean;
  delete: boolean;
  power_off: boolean;
  power_on: boolean;
}
interface Cloud {
  id: number;
  name: string;
  uuid: string;
  platform_type: string;
}

export enum PROXMOX_ACTIONS {
  CLONE = 'Clone',
  REBOOT = 'Reboot',
  CONVERT_TO_TEMPLATE = 'Convert to template',
  DELETE = 'DELETE',
  POWER_ON = 'Power on',
  POWER_OFF = 'Power off'
}

export interface ProxmoxAuthType {
  uuid: string;
  username: string;
  password: string;
}

export interface ProxmoxCloneType extends ProxmoxAuthType {
  name: string;
  storage: string;
}