import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CREATE_NIC_FOR_RESOURCE_GROUP, GET_AZURE_ACCOUNTS, GET_AZURE_LOCATIONS, GET_AZURE_VM_IMAGES } from 'src/app/shared/api-endpoint.const';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AzurePowerToggleInputVM } from 'src/app/united-cloud/assets/assets-vms/assets-vms-azure/assets-vms-azure.service';
import { environment } from 'src/environments/environment';
import { AzureAccountsType, AzureVirtalNetwork, AzureVirtalNetworkSubnet } from '../../entities/azure-accounts.type';
import { ResourceDetailsType } from '../public-cloud-azure-summary.type';
import { AzureResourceDetail } from './public-cloud-azure-summary-details.type';

@Injectable()
export class PublicCloudAzureSummaryDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private notification: AppNotificationService,
    private user: UserInfoService) { }

  syncDiscoverdVms() {
    this.http.get(`customer/managed/azure/accounts/discover_azure_resource_vms/`).pipe(take(1)).subscribe();
  }

  getAzureResourceDetails(criteria: SearchCriteria): Observable<PaginatedResult<AzureResourceDetail>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AzureResourceDetail>>(`/customer/managed/azure/resources/`, { params: params });
  }

  getResourceGroups(uuid?: string) {
    if (uuid) {
      let params: HttpParams = new HttpParams().set('uuid', uuid);
      return this.http.get<string[]>(`customer/managed/azure/resources/resource_groups/`, { params: params })
        .pipe(map(res => res.sort((a, b) => a.localeCompare(b))));
    } else {
      return this.http.get<string[]>(`customer/managed/azure/resources/resource_groups/`)
        .pipe(map(res => res.sort((a, b) => a.localeCompare(b))));
    }
  }

  getLocation() {
    return this.http.get<any>(`/customer/managed/azure/locations`);
  }

  getResourceDetails(): Observable<ResourceDetailsType[]> {
    return this.http.get<ResourceDetailsType[]>(`/customer/managed/azure/accounts/resource_count_by_type/`)
      .pipe(map(res => res.sort((a, b) => a.display_name.localeCompare(b.display_name))));
  }

  getAzureSubscriptionDetails(): Observable<AzureAccountsType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<AzureAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: params });
  }

  convertToViewdata(accounts: AzureResourceDetail[]): AzureResourcesViewData[] {
    let viewData: AzureResourcesViewData[] = [];
    accounts.map(account => {
      let data: AzureResourcesViewData = new AzureResourcesViewData();
      data.name = account.name;
      data.location = account.region;
      data.resourceType = account.resource_type ? account.resource_type : 'NA';
      data.tags = account.tags;
      data.resourceGroup = account.resource_group ? account.resource_group : 'NA';
      data.accountName = account.account_name;
      data.subscriptionId = account.subscription;
      data.uuid = account.uuid;
      data.account = account.account;
      data.accountUuid = account.account_uuid;
      data.monitoring = account.monitoring;

      data.managementIp = account.management_ip ? account.management_ip : 'N/A';
      data.osType = account.os_type ? account.os_type : 'N/A';
      data.ipType = account.ip_type ? account.ip_type : 'N/A';

      data.vmId = account.id;
      if (account.power_state === 'VM starting') {
        data.powerStatus = 'Starting'
        data.powerStatusOn = false;
        data.isPowerIconEnabled = false;
        data.powerTooltipMessage = 'Starting';
        data.powerStatusIcon = 'fa-power-off';
      } else if (account.power_state === 'VM running') {
        data.powerStatus = 'Up';
        data.powerStatusOn = true;
        data.isPowerIconEnabled = true;
        data.powerTooltipMessage = 'Power Off';
        data.powerStatusIcon = 'fa-power-off';
      } else if (account.power_state === 'VM deallocating') {
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
        data.isSameTabEnabled = ((account.management_ip ? true : false) && data.powerStatusOn && !isWindows);
        if (!account.management_ip) {
          data.sameTabTootipMessage = 'Management IP not Configured';
        } else if (!data.powerStatusOn) {
          data.sameTabTootipMessage = 'VM is Down';
        } else if (isWindows) {
          data.sameTabTootipMessage = 'Open in Same tab option is not available for windows based machines';
        } else {
          data.sameTabTootipMessage = 'Open in same tab';
        }
        data.isNewTabEnabled = ((account.management_ip ? true : false) && data.powerStatusOn);
        if (!account.management_ip) {
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

      if (account.resource_type === 'Virtual Machines') {
        if (data.monitoring && !data.monitoring.configured) {
          data.statsTooltipMessage = 'Configure Monitoring';
          data.isStatsEnabled = false;
        } else if (data.monitoring && data.monitoring.configured && data.monitoring.enabled) {
          data.statsTooltipMessage = 'VM Statistics';
          data.isStatsEnabled = true;
        } else if (data.monitoring && data.monitoring.configured && !data.monitoring.enabled) {
          data.statsTooltipMessage = 'Enable Monitoring';
          data.isStatsEnabled = false;
        }
      } else {
        if (data.monitoring && !data.monitoring.configured) {
          data.statsTooltipMessage = 'Monitoring not configured';
          data.isStatsEnabled = false;
        } else {
          data.statsTooltipMessage = `${data.resourceType} Statistics`
          data.isStatsEnabled = true;
        }
      }
      viewData.push(data);
    });
    return viewData;
  }

  convertAzureCustomerListDetailsViewData(data: AzureAccountsType[]): AccountsDetailListViewData {
    let viewData: AccountsDetailListViewData = new AccountsDetailListViewData();
    let totalResources = 0;
    let totalCost = 0;
    let totalEvent = 0;
    let totalInformationAlerts = 0;
    let totalCriticalAlerts = 0;
    let totalWarningAlerts = 0;
    data.map(s => {
      totalResources = totalResources + s.resource_count;
      totalInformationAlerts = totalInformationAlerts + s.alert_count.information;
      totalCriticalAlerts = totalCriticalAlerts + s.alert_count.critical;
      totalWarningAlerts = totalWarningAlerts + s.alert_count.warning;
      totalEvent = totalEvent + s.alert_count.event_count;
      totalCost = totalCost + (s.current_month_cost ? ~~s.current_month_cost.amount : 0);
    })
    viewData.totalResources = totalResources;
    viewData.totalAzureAccounts = data.length;
    viewData.totalEvent = totalEvent;
    viewData.totalCost = totalCost;
    viewData.totalInformationAlerts = totalInformationAlerts;
    viewData.totalCriticalAlerts = totalCriticalAlerts;
    viewData.totalWarningAlerts = totalWarningAlerts;
    return viewData;
  }

  convertToResourceViewData(data: ResourceDetailsType[]): ResourceDetailsViewData {
    let view: ResourceDetailsViewData = new ResourceDetailsViewData();
    view.totalResourceTypeCount = data.length;
    data.map(s => {
      let resource = new ResourceCountAndNames();
      resource.name = s.name;
      resource.displayName = s.display_name;
      resource.id = s.id;
      resource.resourceCount = s.resource_count;
      resource.iconPath = s.icon_path && s.icon_path != '' ? `${environment.assetsUrl}external-brand/azure/Icons/${s.icon_path}.svg` : null;
      view.resourceCounts.push(resource);
    })
    return view;
  }

  getToggleInput(view: AzureResourcesViewData, accountId: string, resourceGroup: string): AzurePowerToggleInputVM {
    return {
      confirmTitle: 'Azure Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: accountId + '',
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.AZURE_VIRTUAL_MACHINE, userName: '',
      power_state: view.powerStatusOn ? 'powerOff' : 'start', resource_group: resourceGroup, vm_name: view.name,
      account_uuid: accountId, username: '', password: ''
    };
  }

  getAzureLocations(): Observable<PaginatedResult<AzureLocationData>> {
    return this.http.get<PaginatedResult<AzureLocationData>>(GET_AZURE_LOCATIONS());
  }

  getAzureVMImages(location: string): Observable<AzureVMOS[]> {
    return this.http.get<AzureVMOS[]>(GET_AZURE_VM_IMAGES(location));
  }

  getAvailablitySets(accountId: string, resourceGroup: string): Observable<AzureResourceGroupAvailabilitySets[]> {
    let params: HttpParams = new HttpParams().set('resource_group', resourceGroup).set('account_uuid', accountId);
    return this.http.post<AzureResourceGroupAvailabilitySets[]>(`customer/managed/azure/resources/virtual_machines/availability_sets/`, params);
  }

  getNICs(accountId: string, resourceGroup: string): Observable<AzureResourceGroupNIC[]> {
    let params: HttpParams = new HttpParams().set('resource_group', resourceGroup).set('account_uuid', accountId);
    return this.http.post<AzureResourceGroupNIC[]>(`customer/managed/azure/resources/virtual_machines/nics/`, params);
  }

  getStorageAccounts(accountId: string, resourceGroup: string): Observable<AzureResourceGroupStorageAccounts[]> {
    let params: HttpParams = new HttpParams().set('resource_group', resourceGroup).set('account_uuid', accountId);
    return this.http.post<AzureResourceGroupStorageAccounts[]>(`customer/managed/azure/resources/virtual_machines/storage_accounts/`, params);
  }

  resetVMCreateFormErrors() {
    return {
      'account_uuid': '',
      'resource_group': '',
      'name': '',
      'username': '',
      'password': '',
      'location': '',
      'os_type': '',
      'nic': '',
      'storage_account': '',
      'availability_set': '',
    }
  }

  createVMValidationMessages = {
    'account_uuid': {
      'required': 'Account name is required'
    },
    'resource_group': {
      'required': 'Resource group is required'
    },
    'name': {
      'required': 'VM Name is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password  is required'
    },
    'location': {
      'required': 'Location is required'
    },
    'os_type': {
      'required': 'OS Type is required'
    },
    'nic': {
      'required': 'NIC is required'
    },
    'storage_account': {
      'required': 'Storage Account is required'
    },
    'availability_set': {
      'required': ' Availability Set is required',
    },
  }

  buildVMCreateForm(): FormGroup {
    return this.builder.group({
      'account_uuid': ['', [Validators.required]],
      'resource_group': [{ value: '', disabled: true }, [Validators.required]],
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'username': ['', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'location': ['', [Validators.required]],
      'os_type': [{ value: '', disabled: true }, [Validators.required]],
      'nic': [{ value: '', disabled: true }, [Validators.required]],
      'storage_account': [{ value: '', disabled: true }, [Validators.required]],
      'availability_set': [{ value: '', disabled: true }, [Validators.minLength]],
      'resource_name': [''],
      'os_disk': ['vm_create_disk']
    });
  }

  createVM(formData: any, tags: { [key: string]: string }) {
    let obj = Object.assign({}, formData, { 'tags': tags });
    obj.os_type = obj.os_type.id;
    obj.location = obj.location.name;

    return this.http.post<CeleryTask>('customer/managed/azure/resources/virtual_machines/create_azure_vm/', obj)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  buildVMActionForm(): FormGroup {
    return this.builder.group({
      'username': ['', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetVMActionFormErrors() {
    return {
      'username': '',
      'password': '',
    }
  }

  vmActionFormValidationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password  is required'
    },
  }

  togglePower(input: AzurePowerToggleInputVM): Observable<TaskStatus> {
    let obj = { power_state: input.power_state, resource_group: input.resource_group, vm_name: input.vm_name, account_uuid: input.account_uuid, username: input.username, password: input.password }
    return this.http.post<CeleryTask>('customer/managed/azure/resources/virtual_machines/toggle_power_state/', obj)
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

  deleteVM(vmName: string, resourceGroup: string, accountId: string, username: string, password: string) {
    let params = new HttpParams().set('vm_name', vmName).set('resource_group', resourceGroup).set('account_uuid', accountId)
      .set('username', username).set('password', password);
    return this.http.post<CeleryTask>('customer/managed/azure/resources/virtual_machines/delete_azure_vm/', params)
      .pipe(switchMap(res => {
        if (res.task_id) {
          this.notification.success(new Notification('Delete request for Virtual machine submitted'));
          return this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))
        } else {
          throw new Error('Something went wrong');
        }
      }), take(1));
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

  updateTags(accountId: string, resourceGroup: string, view: AzureResourcesViewData, tags: { [key: string]: string }, username: string, password: string) {
    let obj: any = {};
    obj.vm_name = view.name;
    obj.resource_group = resourceGroup ? resourceGroup : view.resourceGroup;
    obj.location = view.location;
    obj.tags = tags;
    obj.account_uuid = accountId;
    obj.username = username;
    obj.password = password;
    return this.http.post<CeleryTask>('customer/managed/azure/resources/virtual_machines/tag_azure_vm/', obj)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 100).pipe(take(1))), take(1));
  }

  getConsoleAccessInput(view: AzureResourcesViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.AZURE_VIRTUAL_MACHINE,
      deviceType: DeviceMapping.AZURE_VIRTUAL_MACHINE,
      deviceId: `${view.uuid}`,
      newTab: false,
      deviceName: view.name,
      managementIp: view.managementIp,
      osType: view.osType,
      ipType: view.ipType
    };
  }

  getVirtualnetworks(accountId: string, resourceGroup: string): Observable<AzureVirtalNetwork[]> {
    let params: HttpParams = new HttpParams().set('resource_group', resourceGroup).set('account_uuid', accountId);
    return this.http.post<AzureVirtalNetwork[]>(`customer/managed/azure/resources/get_virtual_nets/`, params)
  }

  getSubnetsForVirtualNetworks(accountId: string, resourceGroup: string, vnet: string): Observable<AzureVirtalNetworkSubnet[]> {
    let params: HttpParams = new HttpParams().set('resource_group', resourceGroup).set('account_uuid', accountId).set('virtual_network', vnet);
    return this.http.post<AzureVirtalNetworkSubnet[]>(`customer/managed/azure/resources/get_network_subnets/`, params)
  }

  resetNICFormErrors() {
    return {
      'account_uuid': '',
      'resource_group': '',
      'name': '',
      'vnet': '',
      'subnet': '',
      'username': '',
      'password': '',
    }
  }

  createNICFormValidationMessages = {
    'account_uuid': {
      'required': 'Account name is required'
    },
    'resource_group': {
      'required': 'Resource group is required'
    },
    'name': {
      'required': 'NIC name is required'
    },
    'vnet': {
      'required': 'Virtual Network is required'
    },
    'subnet': {
      'required': 'Subnet is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password  is required'
    },
  }

  createAzureResourceGroupNIC(): FormGroup {
    return this.builder.group({
      'account_uuid': ['', [Validators.required]],
      'resource_group': [{ value: '', disabled: true }, [Validators.required]],
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'vnet': [{ value: '', disabled: true }, [Validators.required]],
      'subnet': [{ value: '', disabled: true }, [Validators.required]],
      'username': ['', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'resource_grp_name': ['']
    });
  }

  convertVirtualNetworksData(vnet: AzureVirtalNetwork): AzureDataCommonNotationUtilClass {
    let a: AzureDataCommonNotationUtilClass = new AzureDataCommonNotationUtilClass();
    a.long = vnet.name;
    a.short = vnet.name;
    a.location = vnet.location;
    return a;
  }

  convertVirtualNetworksSubnetData(subnet: AzureVirtalNetworkSubnet): AzureDataCommonNotationUtilClass {
    let a: AzureDataCommonNotationUtilClass = new AzureDataCommonNotationUtilClass();
    a.long = subnet.id;
    a.short = subnet.name;
    return a;
  }

  createNICForResourceGroup(accountId: string, formData: CreateNICFormData) {
    let a: CreateNICFormAPIData = new CreateNICFormAPIData();
    a.account_uuid = formData.account_uuid;
    a.name = formData.name;
    a.resource_group = formData.resource_group;
    a.vnet = this.convertVirtualNetworksData(formData.vnet);
    a.subnet = this.convertVirtualNetworksSubnetData(formData.subnet);
    a.username = formData.username;
    a.password = formData.password;

    return this.http.post<CeleryTask>(CREATE_NIC_FOR_RESOURCE_GROUP(accountId), a)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

}

export class AzureResourcesViewData {
  constructor() { }
  name: string;
  location: string;
  resourceType: string;
  tags: { [key: string]: string };
  resourceGroup: string;
  accountName: string;
  subscriptionId: string;
  uuid: string;
  account: number;
  accountUuid: string;

  vmId: number;
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

  ipType: string;
  managementIp: string;
  osName: string;
  osType: string;
}

export class AzureDetailsViewData {
  accountName: string;
  id: number;
}

export class AccountsDetailListViewData {
  constructor() { }
  totalAzureAccounts: number;
  totalResources: number;
  totalCost: number;
  totalEvent: number;
  totalInformationAlerts: number;
  totalCriticalAlerts: number;
  totalWarningAlerts: number;
}

export class ResourceDetailsViewData {
  totalResourceTypeCount: number;
  resourceCounts: ResourceCountAndNames[] = [];
  constructor() { }
}

export class ResourceCountAndNames {
  constructor() { }
  displayName: string;
  id: number;
  iconPath: string;
  name: string;
  resourceCount: number;
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
  account_name: string;
}

export class AzureDataCommonNotationUtilClass {
  short: string;
  long: string;
  location?: string;
}

export class CreateNICFormData {
  name: string;
  vnet: AzureVirtalNetwork;
  subnet: AzureVirtalNetworkSubnet;
  resource_group: string;
  account_uuid: string;
  username: string;
  password: string;
}

export class CreateNICFormAPIData {
  name: string;
  vnet: AzureDataCommonNotationUtilClass;
  subnet: AzureDataCommonNotationUtilClass;
  resource_group: string;
  account_uuid: string;
  username: string;
  password: string;
}

