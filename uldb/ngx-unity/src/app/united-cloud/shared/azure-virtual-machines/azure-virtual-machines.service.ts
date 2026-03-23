import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AZURE_SYNC_DISCOVERED_VMS, CREATE_AZURE_VM, DELETE_AZURE_VMS, GET_AZURE_LOCATIONS, GET_AZURE_RESOURCE_VM_AVAILABILITY_SET, GET_AZURE_RESOURCE_VM_STORAGE_ACCOUNT, GET_AZURE_VMS, GET_AZURE_VMS_BY_ACCOUNT_ID_AND_RESOURCE, GET_AZURE_VM_IMAGES, GET_NICS, POWER_TOGGLE_AZURE_VMS, UPDATE_AZURE_VM_TAGS } from 'src/app/shared/api-endpoint.const';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AzurePowerToggleInput } from 'src/app/united-cloud/assets/assets-vms/assets-vms-azure/assets-vms-azure.service';
import { AzureAccountVMSType } from '../../public-cloud/public-cloud-azure/entities/azure-account-vms.type';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

@Injectable()
export class AzureVirtualMachinesService {

  constructor(
    private http: HttpClient,
    private appService: AppLevelService,
    private user: UserInfoService,
    private notification: AppNotificationService,
    private builder: FormBuilder) { }

  syncDiscoverdVms() {
    this.http.get(AZURE_SYNC_DISCOVERED_VMS()).pipe(take(1)).subscribe();
  }

  getVmbyAccountIdAndResourceGroup(accountId: string, groupName: string) {
    // .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

  getVms(accountId: string, groupName: string, update: boolean) {
    let params = new HttpParams();
    if (update) {
      params = new HttpParams().set('update', update);
    }
    // if (accountId && groupName) {
    //   return this.http.get<{ data: AzureAccountVMSType[] }>(GET_AZURE_VMS_BY_ACCOUNT_ID_AND_RESOURCE(accountId, groupName),
    //     { params: params })
    //     .pipe(map(res => res.data))
    // }
    return this.http.get<AzureAccountVMSType[]>(GET_AZURE_VMS(), { params: params });
  }

  convertToViewData(vms): AzureVMSViewData[] {
    let viewData: AzureVMSViewData[] = [];
    let results : AzureAccountVMSType[] = vms.results;
    results.map(vm => {
      let data = new AzureVMSViewData();
      data.vmId = vm.id;
      data.name = vm.name;
      data.accountId = vm.account_id;
      data.monitoring = vm.monitoring;
      data.instanceType = vm.type;
      data.accountName = vm.account_name;
      data.resourceGroup = vm.resource_group;
      data.availabilitySet = vm.availability_set;
      data.provisionState = vm.provisioning_state;
      data.region = vm.region;
      data.tags = vm.tags;
      data.managementIp = vm.management_ip ? vm.management_ip : 'N/A';
      data.osType = vm.os_type ? vm.os_type : 'N/A';
      data.ipType = vm.ip_type;
      data.osName = vm.os_name;
      data.account_uuid = vm.account_uuid;
      data.uuid = vm.uuid;
      if (vm.power_state === 'VM starting') {
        data.powerStatus = 'Starting'
        data.powerStatusOn = false;
        data.isPowerIconEnabled = false;
        data.powerTooltipMessage = 'Starting';
        data.powerStatusIcon = 'fa-power-off';
      } else if (vm.power_state === 'VM running') {
        data.powerStatus = 'Up';
        data.powerStatusOn = true;
        data.isPowerIconEnabled = true;
        data.powerTooltipMessage = 'Power Off';
        data.powerStatusIcon = 'fa-power-off';
      } else if (vm.power_state === 'VM deallocating') {
        data.powerStatus = 'Stopping';
        data.powerStatusOn = false;
        data.isPowerIconEnabled = false;
        data.powerTooltipMessage = 'Stopping';
        data.powerStatusIcon = 'fa-power-off';
      } else {
        data.powerStatus = 'Down';
        data.powerStatusOn = false;
        data.isPowerIconEnabled = true;
        data.powerTooltipMessage = 'Power On';
        data.powerStatusIcon = 'fa-power-off';
      }

      if (this.user.isManagementEnabled) {
        const isWindows: boolean = (data.osType.includes('Microsoft') || data.osType.includes('Windows'));
        data.isSameTabEnabled = ((vm.management_ip ? true : false) && data.powerStatusOn && !isWindows);
        if (!vm.management_ip) {
          data.sameTabTootipMessage = 'Management IP not Configured';
        } else if (!data.powerStatusOn) {
          data.sameTabTootipMessage = 'VM is Down';
        } else if (isWindows) {
          data.sameTabTootipMessage = 'Open in Same tab option is not available for windows based machines';
        } else {
          data.sameTabTootipMessage = 'Open in same tab';
        }

        data.isNewTabEnabled = ((vm.management_ip ? true : false) && data.powerStatusOn);
        if (!vm.management_ip) {
          data.newTabToolipMessage = 'Management IP not Configured';
        } else if (!data.powerStatusOn) {
          data.newTabToolipMessage = 'VM is Down';
        } else if (isWindows) {
          data.newTabToolipMessage = 'Open In New Tab';
          data.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), data.managementIp) : WINDOWS_CONSOLE_CLIENT(data.managementIp);
        } else {
          data.newTabToolipMessage = 'Open In New Tab';
          data.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
        }
      } else {
        data.isSameTabEnabled = false;
        data.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        data.isNewTabEnabled = false;
        data.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      }

      if (data.monitoring && !data.monitoring.configured) {
        data.statsTooltipMessage = 'Monitoring not configured';
        data.isStatsEnabled = false;
      } else {
        data.statsTooltipMessage = 'VM Statistics';
        data.isStatsEnabled = true;
      }

      viewData.push(data);
    });
    return viewData;
  }

  getToggleInput(view: AzureVMSViewData, accountId: string, resourceGroup: string, account_uuid: string): AzurePowerToggleInput {
    return {
      confirmTitle: 'Azure Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: accountId + '',
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.AZURE_VIRTUAL_MACHINE, userName: '',
      power_state: view.powerStatusOn ? 'powerOff' : 'start', resource_group: resourceGroup, vm_name: view.name,
      account_uuid: account_uuid
    };
  }

  togglePower(input: AzurePowerToggleInput): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(POWER_TOGGLE_AZURE_VMS(), { power_state: input.power_state, resource_group: input.resource_group, vm_name: input.vm_name, account_uuid: input.account_uuid })
      .pipe(switchMap(res => {
        if (res.task_id) {
          const msg = input.currentPowerStatus ? 'power off ' : 'power on ';
          this.notification.success(new Notification('Request to ' + msg + ' submitted'));
          return this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))
        } else {
          throw new Error('Something went wrong');
        }
      }), take(1));
  }

  deleteVM(vmName: string, resourceGroup: string, account_uuid: string) {
    // let params = new HttpParams().set('vm_name', vmName).set('resource_group', resourceGroup).set;
    return this.http.post<CeleryTask>(DELETE_AZURE_VMS(), {vm_name: vmName, resource_group: resourceGroup, account_uuid: account_uuid})
      .pipe(switchMap(res => {
        if (res.task_id) {
          this.notification.success(new Notification('Delete request for Virtual machine submitted'));
          return this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))
        } else {
          throw new Error('Something went wrong');
        }
      }), take(1));
  }

  getAzureLocations(): Observable<PaginatedResult<AzureLocationData>> {
    return this.http.get<PaginatedResult<AzureLocationData>>(GET_AZURE_LOCATIONS());
  }

  getAzureVMImages(location: string): Observable<AzureVMOS[]> {
    return this.http.get<AzureVMOS[]>(GET_AZURE_VM_IMAGES(location));
  }

  getAvailablitySets(accountId: number, resourceGroup: string): Observable<AzureResourceGroupAvailabilitySets[]> {
    return this.http.get<AzureResourceGroupAvailabilitySets[]>(GET_AZURE_RESOURCE_VM_AVAILABILITY_SET(accountId.toString(), resourceGroup));
  }

  getNICs(accountId: number, resourceGroup: string): Observable<AzureResourceGroupNIC[]> {
    return this.http.get<AzureResourceGroupNIC[]>(GET_NICS(accountId, resourceGroup));
  }

  getStorageAccounts(accountId: number, resourceGroup: string): Observable<AzureResourceGroupStorageAccounts[]> {
    return this.http.get<AzureResourceGroupStorageAccounts[]>(GET_AZURE_RESOURCE_VM_STORAGE_ACCOUNT(accountId.toString(), resourceGroup));
  }

  resetVMCreateFormErrors() {
    return {
      'name': '',
      'os_type': '',
      'username': '',
      'password': '',
      'location': '',
      'availability_set': '',
      'nic': '',
      'storage_account': '',
    }
  }

  createVMValidationMessages = {
    'name': {
      'required': 'VM Name is required'
    },
    'os_type': {
      'required': 'OS Type is required'
    },
    'username': {
      'required': 'Login username is required'
    },
    'password': {
      'required': 'Password  is required'
    },
    'location': {
      'required': 'Location is required'
    },
    'availability_set': {
      'required': ' Availability Set is required',
    },
    'nic': {
      'required': 'NIC is required'
    },
    'storage_account': {
      'required': 'Storage Account is required'
    },
  }

  buildVMCreateForm(accountId: number, resourceGroupName: string): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'os_type': ['', [Validators.required]],
      'username': ['', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'location': ['', [Validators.required]],
      'availability_set': ['', [Validators.minLength]],
      'nic': ['', [Validators.required]],
      'storage_account': ['', [Validators.required]],
      'resource_group': [resourceGroupName],
      'resource_name': [resourceGroupName],
      'account': [accountId],
      'os_disk': ['vm_create_disk']
    });
  }

  createVM(formData: any, tags: { [key: string]: string }) {
    let obj = Object.assign({}, formData, { 'tags': tags });
    obj.os_type = obj.os_type.id;
    obj.location = obj.location.name;

    return this.http.post<CeleryTask>(CREATE_AZURE_VM(obj.account), obj)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  resetTagFormErrors() {
    return {
      'key': '',
      'value': ''
    }
  }

  tagValidationMessages = {
    'key': {
      'required': 'Key is required'
    },
    'value': {
      'required': 'Value is required'
    },
  }

  buildTagForm(obj?: { key: string, value: string }): FormGroup {
    return this.builder.group({
      'key': [obj ? obj.key : '', [Validators.required, NoWhitespaceValidator]],
      'value': [obj ? obj.value : '', [Validators.required, NoWhitespaceValidator]]
    })
  }

  updateTags(resourceGroup: string, view: AzureVMSViewData, tags: { [key: string]: string }, account_uuid: string) {
    let obj: any = {};
    obj.vm_name = view.name;
    obj.resource_group = resourceGroup ? resourceGroup : view.resourceGroup;
    obj.location = view.region;
    obj.tags = tags;
    obj.account_uuid = account_uuid;
    return this.http.post<CeleryTask>(UPDATE_AZURE_VM_TAGS(), obj)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  getConsoleAccessInput(view: AzureVMSViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.AZURE_VIRTUAL_MACHINE,
      deviceType: DeviceMapping.AZURE_VIRTUAL_MACHINE,
      deviceId: `${view.uuid}`,
      newTab: false,
      deviceName: view.name,
      osType: view.osType,
      ipType: view.ipType
    };
  }
}

export class AzureVMSViewData {
  constructor() { }
  vmId: number;
  name: string;
  accountId: number;
  accountName: string;
  resourceGroup: string;
  availabilitySet: string;
  tags: any;
  provisionState: string;
  region: string;
  instanceType: string;
  osType: string;
  ipType: string;
  osName: string;
  managementIp: string;
  monitoring: DeviceMonitoringType;
  powerStatus: string;
  isPowerIconEnabled: boolean;
  powerTooltipMessage: string;
  powerStatusIcon: string;
  powerStatusOn: boolean;
  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;
  statsTooltipMessage: string;
  isStatsEnabled: boolean;
  account_uuid: string;
  uuid: string;
}

export class AzureShortLongUtil {
  short: string;
  long: string;
}

export class CreateVMFormData {
  name: string;
  os_type: string;
  os_disk: string;
  username: string;
  password: string;
  location: string;
  availability_set: string;
  nic: string;
  storage_account: string;
  account: string;
  resource_group: string;
  resource_name: string;
  tags: { [key: string]: string };
}

export const AzureOSTypes: AzureShortLongUtil[] = [
  {
    short: "linux",
    long: "UbuntuServer 16.04.0-LTS"
  },
]

