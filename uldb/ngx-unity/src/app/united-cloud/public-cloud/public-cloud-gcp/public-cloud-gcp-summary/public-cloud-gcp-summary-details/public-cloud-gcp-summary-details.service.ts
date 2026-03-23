import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_GCP_VMS_IMAGES, GET_GCP_VMS_MACHINE_TYPES, TOGGLE_POWER_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { environment } from 'src/environments/environment';
import { GcpAccountType, GcpResourceDetailsType } from '../public-cloud-gcp-summary.type';

@Injectable()
export class PublicCloudGcpSummaryDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private appService: AppLevelService,) { }

  //For getting table list
  getGcpResourceDetails(criteria: SearchCriteria): Observable<PaginatedResult<GcpResourceDetail>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<GcpResourceDetail>>(`/customer/managed/gcp/resources/`, { params: params });
  }

  //Left list and icons api - resources
  getServicesCountDetails(): Observable<GcpResourceDetailsType[]> {
    return this.http.get<GcpResourceDetailsType[]>(`/customer/managed/gcp/accounts/resource_count_by_type/`);
  }

  //Left list and icons api - categories
  getCategoriesCountDetails(): Observable<GcpResourceDetailsType[]> {
    return this.http.get<GcpResourceDetailsType[]>(`/customer/managed/gcp/categories/`);
  }

  //GCP Account details
  getGcpSubscriptionDetails(): Observable<GcpAccountType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<GcpAccountType[]>(`customer/managed/gcp/accounts/`, { params: params });
  }

  //get regions
  getGcpLocations(): Observable<string[]> {
    return this.http.get<string[]>(`/customer/managed/gcp/accounts/regions/`);
  }

  convertGcpAccountDetailsViewData(data: GcpAccountType[]): AccountsDetailListViewData {
    let viewData: AccountsDetailListViewData = new AccountsDetailListViewData();
    let totalResources = 0;
    let totalServices = 0;
    let totalCategories = 0;
    let totalCost = 0;
    let totalEvent = 0;
    let totalInformationAlerts = 0;
    let totalCriticalAlerts = 0;
    let totalWarningAlerts = 0;
    data.map(s => {
      totalResources = totalResources + s.resource_count;
      totalServices = totalServices + s.service_count;
      totalCategories = totalCategories + s.category_count;
      totalEvent = totalEvent + s.alert_count.event_count;
      totalInformationAlerts = totalInformationAlerts + s.alert_count.information;
      totalCriticalAlerts = totalCriticalAlerts + s.alert_count.critical;
      totalWarningAlerts = totalWarningAlerts + s.alert_count.warning;
      totalCost = totalCost + (s.current_month_cost?.amount ? s.current_month_cost.amount : 0);
    })
    viewData.totalGcpAccounts = data.length;
    viewData.totalServices = totalServices;
    viewData.totalResources = totalResources;
    viewData.totalCategories = totalCategories;
    viewData.totalCost = Math.round(totalCost);
    viewData.totalEvent = totalEvent;
    viewData.totalInformationAlerts = totalInformationAlerts;
    viewData.totalCriticalAlerts = totalCriticalAlerts;
    viewData.totalWarningAlerts = totalWarningAlerts;
    return viewData;
  }

  updateIconStatus(data: GcpResourcesViewData, instanceState: string) {
    if (instanceState === 'running') {
      data.isPowerIconEnabled = true;
      data.powerTooltipMessage = 'Power Off';
      data.powerStatusIcon = 'fa-power-off';
      data.powerStatusOn = true;
      data.isCreateTicketIconEnabled = true;
      data.createTicketTooltipMessage = 'Manage by creating support ticket';
    } else if (instanceState === 'stopped') {
      data.isPowerIconEnabled = true;
      data.powerTooltipMessage = 'Power On';
      data.powerStatusIcon = 'fa-power-off';
      data.powerStatusOn = false;
      data.isCreateTicketIconEnabled = true;
      data.createTicketTooltipMessage = 'Manage by creating support ticket';
    } else {
      data.isPowerIconEnabled = false;
      data.isCreateTicketIconEnabled = false;
      if (instanceState === 'terminated') {
        data.powerStatusIcon = 'fa-power-off';
      } else {
        data.powerStatusIcon = 'fa-spinner fa-spin';
      }
    }
    return data;
  }

  convertToViewdata(accounts: GcpResourceDetail[]): GcpResourcesViewData[] {
    let viewData: GcpResourcesViewData[] = [];
    accounts.map(account => {
      let data: GcpResourcesViewData = new GcpResourcesViewData();
      data.name = account.name;
      data.location = account.region;
      data.resourceType = account.resource_type ? account.resource_type : 'NA';
      data.accountName = account.account_name;
      data.uuid = account.uuid;
      data.account = account.account;
      data.accountUuid = account.account_uuid;
      data.service = account.service ? account.service : 'N/A';
      const state = account.status.toLocaleLowerCase();
      data.powerStatus = state === 'running' ? 'Up' : state === 'stopped' ? 'Down' : state;
      data.availabilityZone = account.availability_zone;
      data.publicIp = account.public_ip;
      data.instanceType = account.instance_type;
      data = this.updateIconStatus(data, state);
      data.monitoring = account.monitoring;
      viewData.push(data);
    });
    return viewData;
  }

  convertToResourceViewData(data: GcpResourceDetailsType[]): ResourceDetailsViewData {
    let view: ResourceDetailsViewData = new ResourceDetailsViewData();
    view.totalResourceTypeCount = data.length;
    data.map(s => {
      let resource = new ResourceCountAndNames();
      resource.name = s.name;
      resource.category = s.category;
      resource.id = s.id;
      resource.resourceCount = s.resource_count;
      resource.iconPath = s.icon_path && s.icon_path != '' ? `${environment.assetsUrl}external-brand/gcp/${s.icon_path}.svg` : null;
      resource.isOpen = false;
      resource.subcategories = [];
      if (s.subcategories && s.subcategories.length > 0) {
        s.subcategories.map(sub => {
          resource.subcategories.push({
            service: sub.service,
            value: sub.resource_count,
            iconPath: sub.icon_path && sub.icon_path != '' ? `${environment.assetsUrl}external-brand/gcp/${sub.icon_path}.svg` : null,
            id: sub.id,
            categoryId: s.id
          });
        });
      }
      view.resourceCounts.push(resource);
    })
    return view;
  }

  // For VM management
  buildInstanceForm(): FormGroup {
    return this.builder.group({
      'account_uuid': ['', [Validators.required]],
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'zone': ['', [Validators.required]],
      'image': [{ value: [], disabled: true }, [Validators.required]],
      'machine_type': [{ value: [], disabled: true }, [Validators.required]]
    });
  }

  resetInstanceFormError() {
    return {
      'account_uuid': '',
      'name': '',
      'zone': '',
      'image': '',
      'machine_type': ''
    };
  }

  instanceFormValidationMessages = {
    'account_uuid': {
      'required': 'GCP Account is required'
    },
    'name': {
      'required': 'Account Name is required'
    },
    'zone': {
      'required': 'Zone is required'
    },
    'image': {
      'required': 'Image is required'
    },
    'machine_type': {
      'required': 'Machine Type is required'
    }
  }

  getImages(architecture: string) {
    return this.http.get<Array<GCPVMImageType>>(GET_GCP_VMS_IMAGES(architecture));
  }

  getMachineTypes(zone: string) {
    return this.http.get<Array<GCPVMMachineType>>(GET_GCP_VMS_MACHINE_TYPES(zone));
  }

  createInstance(data: any) {
    return this.http.post<CeleryTask>(`/customer/gcp/instances/create_instance/`, data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

  syncVmNow(accountId: string) {    
    let params: HttpParams = new HttpParams().set('account_id', accountId);
    return this.http.get<CeleryTask>(`/customer/gcp/instances/sync_vms/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  getToggleInput(view: GcpResourcesViewData): PowerToggleInput {
    return {
      confirmTitle: 'Google Cloud Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.uuid,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.GCP_VIRTUAL_MACHINE, userName: ''
    };
  }

  togglePowerStatus(input: PowerToggleInput): Observable<CeleryTask> {
    return this.http.get<CeleryTask>(TOGGLE_POWER_BY_DEVICE_TYPE(DeviceMapping.GCP_VIRTUAL_MACHINE, input.deviceId, input.currentPowerStatus))
  }

  getInstanceDetails(view: GcpResourcesViewData) {
    return this.http.get<CeleryTask>(`/customer/managed/gcp/virtualmachine/${view.uuid}/instance_detail/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

}

export class GcpResourcesViewData {
  constructor() { }
  uuid: string;
  // subscriptionId: string;
  name: string;
  resourceType: string;
  location: string; //Region
  account: number;
  accountName: string;
  accountUuid: string;
  iconPath: string;
  service: string;
  // popOverDetails: DevicePopoverData = new DevicePopoverData();  
  instanceState: string;
  availabilityZone: string;
  instanceType: string;
  publicIp: string;
  monitoring: DeviceMonitoringType;
  status: string;

  powerStatus: string;
  powerStatusOn: boolean;
  powerTooltipMessage: string;
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin';
  isPowerIconEnabled: boolean;
  createTicketTooltipMessage: string;
  isCreateTicketIconEnabled: boolean;
}
export class AccountsDetailListViewData {
  constructor() { }
  totalGcpAccounts: number;
  totalResources: number;
  totalServices: number;
  totalCategories: number;
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
  category: string;
  id: number;
  isOpen: boolean;
  iconPath: string;
  name: string;
  resourceCount: number;
  subcategories: SubcategoriesItemViewData[]
}

export class SubcategoriesItemViewData {
  service: string;
  value: number;
  id: number;
  categoryId: number;
  iconPath: string;
}

export class GCPVMImageData {
  constructor() { }
  name: string;
  value: string;
}

export interface GcpResourceDetail {
  name: string;
  region: string;
  uuid: string;
  resource_type: string;
  account: number;
  account_name: string;
  account_uuid: string;
  icon_path: string;
  service: string;
  instance_state: string;
  availability_zone: null;
  public_ip: null;
  instance_type: null;
  monitoring: DeviceMonitoringType;
  status: string;
  // tags: { [key: string]: string };
  // resource_group: string;
  // subscription: string;
}

export interface GCPVMImageType {
  name: string;
  image_id: string;
  deprecated: string;
  architecture: string;
}

export interface GCPVMMachineType {
  name: string;
  display_name: string;
  architecture: string;
  description: string;
}
