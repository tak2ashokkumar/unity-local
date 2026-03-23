import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CREATE_OCI_BUCKET, DELETE_OCI_BUCKET, GET_OCI_REGIONS, OCI_AVAILABLILITY_DOMAIN_BY_ACCOUNT_ID, OCI_COMPARTMENTS_BY_ACCOUNT_ID, OCI_IMAGE_BY_ACCOUNT_ID, OCI_REGIONS_BY_ACCOUNT_ID, OCI_SHAPE_BY_ACCOUNT_ID, OCI_SUBNET_BY_ACCOUNT_ID, OCI_VMS_ACTION_BY_VM_ID, OCI_VMS_CREATE, OCI_VMS_TERMINATE_BY_VM_ID, SYNC_ALL_OCI_VMS, SYNC_OCI_VMS_BY_ACCOUNT_ID, UPLOAD_FILE_TO_OCI_BUCKET } from 'src/app/shared/api-endpoint.const';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from 'src/app/united-cloud/shared/devices-popover/device-popover-data';
import { OCIAvailabilityDomainType, OCICompartmentType, OCIImageType, OCIRegionType, OCIShapeType, OCISubnetType } from 'src/app/united-cloud/shared/oci-virtual-machines/oci-vm-type';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { environment } from 'src/environments/environment';
import { OciAccountType, ResourceDetailsType } from '../public-cloud-oci-summary.type';
import { OciLocationType, OciResourceDetail } from './public-cloud-oci-summary-details.type';

@Injectable()
export class PublicCloudOciSummaryDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private user: UserInfoService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private notification: AppNotificationService,) { }

  getOciSubscriptionDetails(): Observable<OciAccountType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<OciAccountType[]>(`customer/managed/oci/account/`, { params: params });
  }

  createTaskAndPoll(accountId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>((accountId) ? SYNC_OCI_VMS_BY_ACCOUNT_ID(accountId) : SYNC_ALL_OCI_VMS())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1))), take(1));
  }

  getOciResourceDetails(criteria: SearchCriteria): Observable<PaginatedResult<OciResourceDetail>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<OciResourceDetail>>(`/customer/managed/oci/resources/`, { params: params });
  }

  getResourceDetails(): Observable<ResourceDetailsType[]> {
    return this.http.get<ResourceDetailsType[]>(`customer/managed/oci/account/resource_count_by_type/`);
  }

  getLocation(): Observable<{ display: string; value: string }[]> {
    return this.http.get<{ display: string; value: string }[]>(GET_OCI_REGIONS());
  }

  togglePowerStatus(vmUUID: string, data: { account: string, action: string, name: string }): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(OCI_VMS_ACTION_BY_VM_ID(vmUUID), data);
  }

  getAvailabiltyDomain(uuid: string, compartmentId: string) {
    return this.http.get<OCIAvailabilityDomainType[]>(OCI_AVAILABLILITY_DOMAIN_BY_ACCOUNT_ID(uuid, compartmentId));
  }

  getShape(uuid: string, compartmentId: string) {
    return this.http.get<OCIShapeType[]>(OCI_SHAPE_BY_ACCOUNT_ID(uuid, compartmentId));
  }

  getSubnet(uuid: string, compartmentId: string) {
    return this.http.get<OCISubnetType[]>(OCI_SUBNET_BY_ACCOUNT_ID(uuid, compartmentId));
  }

  getImages(uuid: string, compartmentId: string, shape: string) {
    return this.http.get<OCIImageType[]>(OCI_IMAGE_BY_ACCOUNT_ID(uuid, compartmentId, shape));
  }

  getSubscribedRegions(uuid: string) {
    return this.http.get<OCIRegionType[]>(OCI_REGIONS_BY_ACCOUNT_ID(uuid));
  }

  getCompartments(uuid: string) {
    return this.http.get<OCICompartmentType[]>(OCI_COMPARTMENTS_BY_ACCOUNT_ID(uuid));
  }

  createVM(data: OCIVMCreateFormData): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(OCI_VMS_CREATE(), data);
  }

  terminateInstance(vmUUID: string, data: { account: string, name: string }): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(OCI_VMS_TERMINATE_BY_VM_ID(vmUUID), data);
  }

  deleteBucket(accountId: string, bucketName: string) {
    let formData: BucketFormData = new BucketFormData();
    formData.bucket_name = bucketName;
    return this.http.post<any>(DELETE_OCI_BUCKET(accountId), formData);
  }

  uploadFileToBucket(accountId: string, bucketName: string, file: File) {
    const formData = new FormData();
    formData.append('bucket_name', bucketName);
    formData.append('oci_file', file);
    return this.http.post<CeleryTask>(UPLOAD_FILE_TO_OCI_BUCKET(accountId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 50).pipe(take(1))), take(1));
  }


  convertToLocationViewData(data: OciLocationType[]): OciLocationData[] {
    let view: OciLocationData[] = [];
    data.map(s => {
      let location: OciLocationData = new OciLocationData();
      location.value = s.value;
      location.key = s.key;

      view.push(location);
    });
    return view;
  }

  convertToResourceViewData(data: any[]): ResourceDetailsViewData {
    let view: ResourceDetailsViewData = new ResourceDetailsViewData();
    view.totalResourceTypeCount = data.length;
    data.map(s => {
      let resource = new ResourceCountAndNames();
      resource.name = s.name;
      resource.service = s.service;
      resource.id = s.id;
      resource.resourceCount = s.resource_count;
      resource.iconPath = s.icon_path && s.icon_path != '' ? `${environment.assetsUrl}external-brand/oracle/${s.icon_path}` : null;
      view.resourceCounts.push(resource);
    })
    return view;
  }

  convertToViewdata(accounts: OciResourceDetail[]): OciResourcesViewData[] {
    let viewData: OciResourcesViewData[] = [];
    accounts.map(account => {
      let data: OciResourcesViewData = new OciResourcesViewData();
      data.name = account.name;
      data.location = account.region;
      data.resourceType = account.resource_type ? account.resource_type : 'NA';
      data.accountName = account.account;
      // data.subscriptionId = account.subscription;
      data.uuid = account.uuid;
      // data.account = account.account;
      data.accountUuid = account.account_uuid;
      // data.service = account.service ? account.service : 'N/A';
      data.powerStatus = account.status === 'running' ? 'Up' : account.status === 'stopped' ? 'Down' : account.status;
      // data.availabilityZone = account.availability_zone;
      // data.publicIp = account.public_ip;
      // data.instanceType = account.instance_type;
      data = this.updateIconStatus(data, account.status);
      // data.monitoring = account.monitoring;

      if (data.monitoring && !data.monitoring.configured) {
        data.statsTooltipMessage = 'Monitoring not configured';
        data.isStatsEnabled = false;
      } else {
        data.statsTooltipMessage = 'VM Statistics';
        data.isStatsEnabled = true;
      }

      data.tags = account.tags;
      viewData.push(data);
    });
    return viewData;
  }

  updateIconStatus(data: OciResourcesViewData, instanceState: string) {
    if (instanceState === 'running') {
      data.isPowerIconEnabled = true;
      data.powerTooltipMessage = 'Power Off';
      data.powerStatusIcon = 'fa-power-off';
      data.powerStatusOn = true;
      data.isTerminateIconEnabled = true;
      data.terminateTooltipMessage = 'Terminate';
      data.terminateIcon = 'fa-ban';
      data.isAttachASGIconEnabled = true;
      data.attachASGTooltipMessage = 'Attach Autoscaling Group';
      data.isAttachLBIconEnabled = true;
      data.attachLBTooltipMessage = 'Attach LoadBalancer';
      data.isAttachNwInfIconEnabled = true;
      data.attachNwInfTooltipMessage = 'Attach Network Interface';
      data.isCreateImageIconEnabled = true;
      data.createImageTooltipMessage = 'Create Image';
      data.isCreateTicketIconEnabled = true;
      data.createTicketTooltipMessage = 'Manage by creating support ticket';
      data.isInfoIconEnabled = true;
      data.infoTooltipMessage = 'VM Info';
      data.isStatsIconEnabled = false;
      data.isCloudWatchIconEnabled = true;
      data.cloudWatchTooltipMessage = 'Show cloudwatch Statistics';
    } else if (instanceState === 'stopped') {
      data.isPowerIconEnabled = true;
      data.powerTooltipMessage = 'Power On';
      data.powerStatusIcon = 'fa-power-off';
      data.powerStatusOn = false;
      data.isTerminateIconEnabled = true;
      data.terminateTooltipMessage = 'Terminate';
      data.terminateIcon = 'fa-ban';
      data.isCreateImageIconEnabled = true;
      data.createImageTooltipMessage = 'Create Image';
      data.isAttachASGIconEnabled = false;
      data.attachASGTooltipMessage = '';
      data.isAttachLBIconEnabled = false;
      data.attachLBTooltipMessage = '';
      data.isAttachNwInfIconEnabled = false;
      data.attachNwInfTooltipMessage = '';
      data.isStatsIconEnabled = false;
      data.isCreateTicketIconEnabled = true;
      data.createTicketTooltipMessage = 'Manage by creating support ticket';
      data.isInfoIconEnabled = true;
      data.infoTooltipMessage = 'VM Info';
      data.isCloudWatchIconEnabled = true;
      data.cloudWatchTooltipMessage = 'Show cloudwatch Statistics';
    } else {
      data.isTerminateIconEnabled = false;
      data.isPowerIconEnabled = false;
      data.isAttachASGIconEnabled = false;
      data.isAttachLBIconEnabled = false;
      data.isAttachNwInfIconEnabled = false;
      data.isStatsIconEnabled = false;
      data.isCreateImageIconEnabled = false;
      data.isCreateTicketIconEnabled = false;
      if (instanceState === 'terminated') {
        data.powerStatusIcon = 'fa-power-off';
        data.terminateIcon = 'fa-ban';
      } else {
        data.powerStatusIcon = 'fa-spinner fa-spin';
        data.terminateIcon = 'fa-spinner fa-spin';
      }
      data.isCloudWatchIconEnabled = false;
    }
    return data;
  }

  convertOciCustomerListDetailsViewData(data: OciAccountType[]): AccountsDetailListViewData {
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
      totalCost = totalCost + (s.current_month_cost ? s.current_month_cost.amount : 0);
    })
    viewData.totalResources = totalResources;
    viewData.totalOciAccounts = data.length;
    viewData.totalEvent = totalEvent;
    viewData.totalCost = Math.round(totalCost);
    viewData.totalInformationAlerts = totalInformationAlerts;
    viewData.totalCriticalAlerts = totalCriticalAlerts;
    viewData.totalWarningAlerts = totalWarningAlerts;
    return viewData;
  }

  getToggleInput(view: OciResourcesViewData): OciPowerToggleInput {
    return {
      confirmTitle: 'OCI Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.name,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.ORACLE_VIRTUAL_MACHINE, userName: '',
      accountId: view.account, availabilityZone: view.location
    };
  }

  getBucketInput(view: OciResourcesViewData): any {
    return {
      confirmTitle: 'OCI Standard Database Service', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.name,
      // currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.ORACLE_VIRTUAL_MACHINE, userName: '',
      // accountId: view.account, availabilityZone: view.location
    };
  }

  resetVmCreateFormErrors() {
    return {
      'name': '',
      'compartment_id': '',
      'availability_domain': '',
      'shape': '',
      'subnet_id': '',
      'image_id': '',
      'region': ''
    };
  }

  vmCreateValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'region': {
      'required': 'Region is required'
    },
    'compartment_id': {
      'required': 'Compartment is required'
    },
    'availability_domain': {
      'required': 'Availability domain is required'
    },
    'shape': {
      'required': 'Shape is required'
    },
    'subnet_id': {
      'required': 'Subnet is required'
    },
    'image_id': {
      'required': 'Image is required'
    }
  }

  createVMForm(uuid: string): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'account': ['', [Validators.required]],
      'region': [{ value: '', disabled: true }, [Validators.required]],
      'compartment_id': ['', [Validators.required]],
      'availability_domain': [{ value: '', disabled: true }, [Validators.required]],
      'subnet_id': [{ value: '', disabled: true }, [Validators.required]],
      'shape': [{ value: '', disabled: true }, [Validators.required]],
      'image_id': [{ value: '', disabled: true }, [Validators.required]]
    });
  }

  resetFormErrors() {
    return {
      'account': '',
      'bucket_name': '',
    };
  }

  validationMessages = {
    'account': {
      'required': 'Account Name is required'
    },
    'bucket_name': {
      'required': 'Bucket Name is required'
    }
  }

  createForm(): FormGroup {
    return this.builder.group({
      'account': ['', [Validators.required, NoWhitespaceValidator]],
      'bucket_name': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  createBucket(accountId: string, data: BucketFormData) {
    return this.http.post<any>(CREATE_OCI_BUCKET(accountId), data);
  }

  buildTagForm(obj?: { key: string, value: string }): FormGroup {
    console.log(obj)
    return this.builder.group({
      'key': [obj ? obj.key : '', [Validators.required, NoWhitespaceValidator]],
      'value': [obj ? obj.value : '', [Validators.required, NoWhitespaceValidator]]
    })
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

  updateTags(instance: OciResourcesViewData, tags: { [key: string]: string }) {
    let obj: any = {};
    obj.account = instance.accountUuid;
    obj.name = instance.accountName;
    obj.tags = tags;
    return this.http.post(`/customer/managed/oci/resources/${instance.uuid}/associate_tag/`, obj);
  }



}


export class OciResourcesViewData {
  constructor() { }
  name: string;
  location: string;
  resourceType: string;
  accountName: string;
  subscriptionId: string;
  uuid: string;
  tags?: any;
  account: number;
  accountUuid: string;
  service: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  availabilityZone: string;
  instanceType: string;
  publicIp: string;
  monitoring: DeviceMonitoringType;

  powerStatus: string;
  powerStatusOn: boolean;
  powerTooltipMessage: string;
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin';
  isPowerIconEnabled: boolean;

  isTerminated: boolean;
  terminateTooltipMessage: string;
  isTerminateIconEnabled: boolean;
  terminateIcon: 'fa-ban' | 'fa-spinner fa-spin';

  createImageTooltipMessage: string;
  isCreateImageIconEnabled: boolean;

  attachASGTooltipMessage: string;
  isAttachASGIconEnabled: boolean;

  attachLBTooltipMessage: string;
  isAttachLBIconEnabled: boolean;

  attachNwInfTooltipMessage: string;
  isAttachNwInfIconEnabled: boolean;

  infoTooltipMessage: string;
  isInfoIconEnabled: boolean;

  statsTooltipMessage: string;
  isStatsIconEnabled: boolean;

  cloudWatchTooltipMessage: string;
  isCloudWatchIconEnabled: boolean;

  createTicketTooltipMessage: string;
  isCreateTicketIconEnabled: boolean;

  isStatsEnabled: boolean;
}

export class AccountsDetailListViewData {
  constructor() { }
  totalOciAccounts: number;
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
  service: string;
  id: number;
  iconPath: string;
  name: string;
  resourceCount: number;
}

export class OciLocationData {
  constructor() { }
  value: string;
  key: string;
}

export interface OciPowerToggleInput extends PowerToggleInput {
  accountId: number;
  availabilityZone: string;
}

export interface NetworkInterfaceDropDown {
  name: string;
}

export interface LoadBalancerDropDown {
  load_balancer: string;
}

export interface AutoScaleGroupDropDown {
  auto_scaling_group: string;
}

export enum OCI_VM_ACTIONS {
  STOP = 'Stop',
  START = 'Start',
  TERMINATE = 'Terminate'
}

export class OCIVMCreateFormData {
  constructor() { }
  account: string;
  name: string;
  region: string;
  compartment_id: string;
  availability_domain: string;
  shape: string;
  subnet_id: string;
  image_id: string;
}

export class BucketFormData {
  bucket_name: string;
  constructor() { }
}