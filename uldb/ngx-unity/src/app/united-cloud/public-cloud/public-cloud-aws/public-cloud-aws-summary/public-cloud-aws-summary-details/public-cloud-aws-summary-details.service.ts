import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { AppLevelService } from 'src/app/app-level.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AwsAccountsType, AwsLocationType, AwsResourceDetail, ResourceDetailsType } from './public-cloud-aws-summary-details.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { environment } from 'src/environments/environment';
import { CELERY_TASK_FOR_AWS, CELERY_TASK_FOR_AWS_ATTACH_AUTOSCALE, CELERY_TASK_FOR_AWS_ATTACH_NW_INTERFACE, CELERY_TASK_FOR_AWS_CREATE_IMAGE, CELERY_TASK_FOR_AWS_CREATE_INSTANCE, CELERY_TASK_FOR_AWS_INSTANCES, CELERY_TASK_FOR_AWS_TERMINATE_INSTANCE, CREATE_AWS_S3_bUCKET, DELETE_AWS_S3_bUCKET, DEVICE_DATA_BY_DEVICE_TYPE, GET_AWS_AUTOSCALING_GROUPS_DROPDOWN, GET_AWS_IMAGES, GET_AWS_INSTANCE_DETAILS, GET_AWS_INSTANCE_TYPE_LIST, GET_AWS_KEY_PAIRS, GET_AWS_LAUNCH_DATA, GET_AWS_NETWORK_INTERFACES_DROPDOWN, GET_AWS_S3_UPLOADED_FILES, GET_AWS_SECURITY_GROUPS_BY_VPC, GET_AWS_SUBNETS_BY_VPC, GET_AWS_VPC_LIST, GET_AZURE_LOCATIONS, TOGGLE_AWS_POWER, UPLOAD_FILE_TO_S3BUCKET } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { CeleryTaskV2 } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { DevicePopoverData } from 'src/app/united-cloud/shared/devices-popover/device-popover-data';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AWSInstanceType, AWSSecurityGroupByVPC, AWSSubnetByVPCDetails, AWSVPCDetails, AWSVmLaunchData } from 'src/app/united-cloud/shared/entities/aws.type';
import { regions } from '../../../region.const';

@Injectable()
export class PublicCloudAwsSummaryDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private user: UserInfoService,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private notification: AppNotificationService,) { }

  getAwsResourceDetails(criteria: SearchCriteria): Observable<PaginatedResult<AwsResourceDetail>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AwsResourceDetail>>(`/customer/managed/aws/resources/`, { params: params });
  }

  getResourceDetails(): Observable<ResourceDetailsType[]> {
    return this.http.get<ResourceDetailsType[]>(`customer/managed/aws/accounts/resource_count_by_type/`);
  }

  getAwsSubscriptionDetails(): Observable<AwsAccountsType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<AwsAccountsType[]>(`customer/managed/aws/accounts/`, { params: params });
  }

  getAwsLocations(): Observable<AwsLocationType[]> {
    return this.http.get<AwsLocationType[]>(`/customer/managed/aws/accounts/regions/`);
  }

  syncAws() {
    return this.http.get(`customer/managed/aws/accounts/activate_aws_resource/`);
  }

  updateIconStatus(data: AwsResourcesViewData, instanceState: string) {
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

  convertToLocationViewData(data: AwsLocationType[]): AwsLocationData[] {
    let view: AwsLocationData[] = [];
    data.map(s => {
      let location: AwsLocationData = new AwsLocationData();
      location.value = s.value;
      location.key = s.key;

      view.push(location);
    });
    return view;
  }

  convertToViewdata(accounts: AwsResourceDetail[]): AwsResourcesViewData[] {
    let viewData: AwsResourcesViewData[] = [];
    accounts.map(account => {
      let data: AwsResourcesViewData = new AwsResourcesViewData();
      data.name = account.name;
      data.location = account.region;
      data.resourceType = account.resource_type ? account.resource_type : 'NA';
      data.accountName = account.account_name;
      data.subscriptionId = account.subscription;
      data.uuid = account.uuid;
      data.account = account.account;
      data.accountUuid = account.account_uuid;
      data.service = account.service ? account.service : 'N/A';
      data.powerStatus = account.instance_state === 'running' ? 'Up' : account.instance_state === 'stopped' ? 'Down' : account.instance_state;
      data.availabilityZone = account.availability_zone;
      data.publicIp = account.public_ip;
      data.instanceType = account.instance_type;
      data = this.updateIconStatus(data, account.instance_state);
      data.monitoring = account.monitoring;

      if (data.monitoring && !data.monitoring.configured) {
        data.statsTooltipMessage = 'Monitoring not configured';
        data.isStatsEnabled = false;
      } else {
        data.statsTooltipMessage = `${data.resourceType} Statistics`;
        data.isStatsEnabled = true;
      }
      viewData.push(data);
    });
    return viewData;
  }

  convertAwsCustomerListDetailsViewData(data: AwsAccountsType[]): AccountsDetailListViewData {
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
    viewData.totalAwsAccounts = data.length;
    viewData.totalEvent = totalEvent;
    viewData.totalCost = Math.round(totalCost);
    viewData.totalInformationAlerts = totalInformationAlerts;
    viewData.totalCriticalAlerts = totalCriticalAlerts;
    viewData.totalWarningAlerts = totalWarningAlerts;
    return viewData;
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
      resource.iconPath = s.icon_path && s.icon_path != '' ? `${environment.assetsUrl}external-brand/aws/${s.icon_path}.svg` : null;
      view.resourceCounts.push(resource);
    })
    return view;
  }

  getImages(accountId: string, regionId: string) {
    let params: HttpParams = new HttpParams().set('region', regionId);
    return this.http.get<Array<{ id: string, name: string }>>(`/customer/managed/aws/accounts/${accountId}/images/`, { params: params });
  }

  getInstanceLaunchData(accountId: string, regionId: string): Observable<AWSVmLaunchData[]> {
    let params: HttpParams = new HttpParams().set('region', regionId);
    return this.http.get<AWSVmLaunchData[]>(`/customer/managed/aws/accounts/${accountId}/launc_data/`, { params: params });
  }

  convertAvailableZoneList(availableZones: AWSVmLaunchData[]): AWSInstanceCreateDropdownData[] {
    let zones: AWSInstanceCreateDropdownData[] = [];
    availableZones.map(availablezone => {
      let a: AWSInstanceCreateDropdownData = new AWSInstanceCreateDropdownData();
      a.value = availablezone.Name;
      a.displayName = availablezone.Name;
      zones.push(a);
    })
    return zones;
  }

  getVPCList(accountId: string, regionId: string) {
    let params: HttpParams = new HttpParams().set('region', regionId);
    return this.http.get<CeleryTaskV2>(`/customer/managed/aws/accounts/${accountId}/vpc_list/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  convertVPCList(vpcList: AWSVPCDetails[]): AWSInstanceCreateDropdownData[] {
    let vpclist: AWSInstanceCreateDropdownData[] = [];
    vpcList.map(vpc => {
      let a: AWSInstanceCreateDropdownData = new AWSInstanceCreateDropdownData();
      a.value = vpc.VpcId;
      a.displayName = `${vpc.VpcId} -- ${vpc.CidrBlock}`;
      vpclist.push(a);
    })
    return vpclist;
  }

  getKeyPairs(accountId: string, regionId: string) {
    let params = new HttpParams().set('region', regionId);
    return this.http.get<CeleryTaskV2>(`/customer/managed/aws/accounts/${accountId}/keypair_detail/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  getSubnetIds(accountId: string, regionId: string, vpcId: string, zone: string) {
    let params = new HttpParams().set('region', regionId).set('vpc', vpcId).set('zone', zone);
    return this.http.get<CeleryTaskV2>(`/customer/managed/aws/accounts/${accountId}/subnets_list/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  convertSubnetList(subnetList: AWSSubnetByVPCDetails[]): AWSInstanceCreateDropdownData[] {
    let subnetIdList: AWSInstanceCreateDropdownData[] = [];
    subnetList.map(subnet => {
      let a: AWSInstanceCreateDropdownData = new AWSInstanceCreateDropdownData();
      a.value = subnet.SubnetId;
      a.displayName = `${subnet.VpcId} -- ${subnet.CidrBlock}`;
      subnetIdList.push(a);
    })
    return subnetIdList;
  }

  getSecurityGroups(accountId: string, regionId: string, vpcId: string) {
    let params = new HttpParams().set('region', regionId).set('vpc', vpcId);
    return this.http.get<CeleryTaskV2>(`/customer/managed/aws/accounts/${accountId}/vpc_security_group_list/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  convertSecurityGroups(securityGroups: AWSSecurityGroupByVPC[]): AWSInstanceCreateDropdownData[] {
    let groups: AWSInstanceCreateDropdownData[] = [];
    securityGroups.map(securityGroup => {
      let a: AWSInstanceCreateDropdownData = new AWSInstanceCreateDropdownData();
      a.value = securityGroup.GroupId;
      a.displayName = `${securityGroup.GroupId} -- ${securityGroup.GroupName}`;
      groups.push(a);
    })
    return groups;
  }

  getInstanceTypes(accountId: string, regionId: string, zone: string) {
    let params = new HttpParams().set('region', regionId).set('zone', zone);
    return this.http.get<CeleryTaskV2>(`/customer/managed/aws/accounts/${accountId}/instance_type_list/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  convertInstanceTypeList(subnetList: AWSInstanceType[]): AWSInstanceCreateDropdownData[] {
    let instanceTypes: AWSInstanceCreateDropdownData[] = [];
    subnetList.map(subnet => {
      let a: AWSInstanceCreateDropdownData = new AWSInstanceCreateDropdownData();
      a.value = subnet.InstanceType;
      a.displayName = subnet.InstanceType;
      instanceTypes.push(a);
    })
    return instanceTypes;
  }

  resetFormError() {
    return {
      'account_uuid': '',
      'region': '',
      'image_id': '',
      'instance_type': '',
      'max_count': '',
      'availability_zone': '',
      'vpc': '',
      'subnet_id': '',
      'shutdown_behavior': '',
      'keypair_behavior': '',
      'keypairname': '',
      'storage_size': '',
      'storage_type': '',
      'security_group': '',
      'tags_key': '',
      'tags_value': ''
    };
  }

  validationMessages = {
    'account_uuid': {
      'required': 'Account Name is required'
    },
    'region': {
      'required': 'Region is required'
    },
    'image_id': {
      'required': 'Image ID is required'
    },
    'instance_type': {
      'required': 'Instance type is required'
    },
    'max_count': {
      'required': 'Instance Count is required',
      'min': 'Value should be more than 0'
    },
    'availability_zone': {
      'required': 'Availability Zone is required'
    },
    'vpc': {
      'required': 'VPC is required'
    },
    'subnet_id': {
      'required': 'Subnet Id is required'
    },
    'shutdown_behavior': {
      'required': 'Shutdown Behavior is required'
    },
    'keypair_behavior': {
      'required': 'Key Pair behaviour is required'
    },
    'keypairname': {
      'required': 'Key Pair name is required'
    },
    'storage_size': {
      'required': 'Storage size is required',
      'min': 'Value should be more than 3 GiB'
    },
    'storage_type': {
      'required': 'Storage type is required'
    },
    'security_group': {
      'required': 'Security group is required'
    }
  }

  buildForm() {
    return this.builder.group({
      'account_uuid': ['', [Validators.required]],
      'region': ['', [Validators.required]],
      'image_id': [{ value: '', disabled: true }, [Validators.required]],
      'instance_type': [{ value: '', disabled: true }, [Validators.required]],
      'max_count': ['', [Validators.required, Validators.min(1)]],
      'availability_zone': [{ value: '', disabled: true }, [Validators.required]],
      'vpc': [{ value: '', disabled: true }, [Validators.required]],
      'subnet_id': [{ value: '', disabled: true }, [Validators.required]],
      'shutdown_behavior': ['', [Validators.required]],
      'keypair_behavior': ['', [Validators.required]],
      'storage_size': ['', [Validators.required, Validators.min(3)]],
      'storage_type': ['', [Validators.required]],
      'dot': [false],
      'security_group': [{ value: '', disabled: true }, [Validators.required]],
      'tags_key': ['', NoWhitespaceValidator],
      'tags_value': ['', NoWhitespaceValidator],
      'tags_applicability': [''],
    });
  }

  buildS3BucketForm() {
    return this.builder.group({
      'bucketName': ['', [Validators.required, NoWhitespaceValidator]],
      'region': ['', [Validators.required, NoWhitespaceValidator]],
      'account_uuid': ['', [Validators.required]],
    });
  }

  resetS3FormErrors() {
    return {
      'bucketName': '',
      'region': '',
      'account_uuid': ''
    };
  }

  validationMessagesS3 = {
    'bucketName': {
      'required': 'Bucket Name is required'
    },
    'region': {
      'required': 'Region is required'
    },
    'account_uuid': {
      'required': 'Account Name is required'
    }
  }

  createInstance(accountId: number, region: string, data: AWSInstanceDetails) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_CREATE_INSTANCE(accountId, region), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  getDeviceData(deviceId: string): Observable<Map<string, DeviceData>> {
    return this.http.get(DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.AWS_VIRTUAL_MACHINE, deviceId), { headers: Handle404Header })
      .pipe(
        map((res: any) => {
          return new Map<string, DeviceData>().set(deviceId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, DeviceData>().set(deviceId, null));
        })
      );
  }

  getToggleInput(view: AwsResourcesViewData): AWSPowerToggleInput {
    return {
      confirmTitle: 'AWS Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.name,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.AWS_VIRTUAL_MACHINE, userName: '',
      accountId: view.account, availabilityZone: view.location
    };
  }

  togglePowerStatus(input: AWSPowerToggleInput, uuid: string): Observable<CeleryTaskV2> {
    return this.http.put<CeleryTaskV2>(TOGGLE_AWS_POWER(input.currentPowerStatus, uuid), null);
  }

  terminateInstance(view: AwsResourcesViewData): Observable<TaskStatus> {
    return this.http.patch<CeleryTaskV2>(CELERY_TASK_FOR_AWS_TERMINATE_INSTANCE(view.uuid), null)
      .pipe(switchMap(res => {
        if (res.celery_task.task_id) {
          this.notification.success(new Notification('Request for terminating submitted'));
          return this.appService.pollForTask(res.celery_task.task_id, 2, 100).pipe(take(1))
        } else {
          throw new Error('Something went wrong');
        }
      }), take(1));
  }

  getInstanceDetails(view: AwsResourcesViewData) {
    return this.http.get<CeleryTaskV2>(`/customer/managed/aws/virtualmachine/${view.uuid}/instance_detail/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  resetCreateImageFormErrors() {
    return {
      'name': '',
      'description': '',
      'is_validated': ''
    };
  }

  createImageValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    }
  }

  createImageForm(view: AwsResourcesViewData): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'description': ['', [Validators.required, NoWhitespaceValidator]],
      'is_validated': [true]
    });
  }

  submitCreateImage(uuid: string, data: { name: string, description: string, is_validated: boolean }) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_CREATE_IMAGE(uuid), data)
  }

  resetAutoScaleFormErrors() {
    return {
      'group': ''
    };
  }

  autoScaleValidationMessages = {
    'group': {
      'required': 'AutoScale group is required'
    }
  }

  createAutoScaleForm(view: AwsResourcesViewData): FormGroup {
    return this.builder.group({
      'group': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  getAutoScaleGroups(accountId: string, regionId: string, instanceId: string) {
    return this.http.get<{ data: AutoScaleGroupDropDown[] }>(GET_AWS_AUTOSCALING_GROUPS_DROPDOWN(accountId));
  }

  submitAutoScale(view: AwsResourcesViewData, data: { group: string }) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_ATTACH_AUTOSCALE(view.uuid, view.location, view.name), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  resetNetworkInterfaceFormErrors() {
    return {
      'network_interface_id': '',
      'device_index': ''
    };
  }

  networkInterfaceValidationMessages = {
    'network_interface_id': {
      'required': 'Network interface is required'
    },
    'device_index': {
      'required': 'Device index is required',
      'min': 'Minimum value should be greater than or equal to 0'
    }
  }

  createNetworkInterfaceForm(view: AwsResourcesViewData): FormGroup {
    return this.builder.group({
      'network_interface_id': ['', [Validators.required, NoWhitespaceValidator]],
      'device_index': ['', [Validators.required, Validators.min(0), NoWhitespaceValidator]]
    });
  }

  getNetworkInterfaceGroups(accountId: string, regionId: string, instanceId: string) {
    return this.http.get<NetworkInterfaceDropDown[]>(GET_AWS_NETWORK_INTERFACES_DROPDOWN(accountId));
  }

  submitNwInterface(view: AwsResourcesViewData, data: { network_interface_id: string, device_index: number }) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_ATTACH_NW_INTERFACE(view.uuid, view.location, view.name), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  createTaskAndPoll(accountId?: number, regionId?: string) {
    return this.http.get((accountId && regionId) ? CELERY_TASK_FOR_AWS_INSTANCES(accountId, regionId) : CELERY_TASK_FOR_AWS())
  }

  getRegions(): Observable<Region[]> {
    return of(regions);
  }

  createBucket(reqBody) {
    return this.http.post<CeleryTaskV2>(CREATE_AWS_S3_bUCKET(), reqBody)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  deleteBucket(bucketUUID: string) {
    return this.http.delete<CeleryTaskV2>(DELETE_AWS_S3_bUCKET(bucketUUID))
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  uploadFileToS3(bucketName: string, bucketUUID: string, file: File) {
    const formData = new FormData();
    formData.append('s3_file', file);
    formData.append('bucket_uuid', bucketUUID);
    formData.append('bucket_name', bucketName);
    return this.http.post<CeleryTaskV2>(UPLOAD_FILE_TO_S3BUCKET(), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  getFileUploadHistory(bucketUUID: string): Observable<PaginatedResult<AWSS3UploadedFile>> {
    const params: HttpParams = new HttpParams().set('bucket_uuid', bucketUUID);
    return this.http.get<PaginatedResult<AWSS3UploadedFile>>(GET_AWS_S3_UPLOADED_FILES(), { params: params });
  }

  convertFileHistoryViewData(files: AWSS3UploadedFile[]): AWSS3FileUploadsViewData[] {
    let viewData: AWSS3FileUploadsViewData[] = [];
    files.map(file => {
      let a: AWSS3FileUploadsViewData = new AWSS3FileUploadsViewData();
      a.bucketName = file.bucket_name;
      a.fileName = file.file_name;
      a.uploadStatus = file.upload_status;

      viewData.push(a);
    })

    return viewData;
  }
}

export class AwsResourcesViewData {
  constructor() { }
  name: string;
  location: string;
  resourceType: string;
  accountName: string;
  subscriptionId: string;
  uuid: string;
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
  totalAwsAccounts: number;
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

export class AwsLocationData {
  constructor() { }
  value: string;
  key: string;
}

export interface AWSInstanceDetails {
  account_uuid: string;
  region: string;
  image_id: string;
  instance_type: string;
  max_count: number;
  availability_zone: string;
  subnet_id: string;
  shutdown_behavior: string;
  keypair_behavior: string;
  storage_size: number;
  storage_type: string;
  dot: boolean;
  security_group: string;
  tags_key: string;
  tags_value: string;
  tags_applicability: string;
  keypairname: string;
}

export class AWSInstanceCreateDropdownData {
  displayName: string;
  value: string;
}

export interface AWSPowerToggleInput extends PowerToggleInput {
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

export class AWSS3ViewData {
  bucketName: string;
  bucketSize: number;
  creationDate: string;
  region: string;
  uuid: string;
}

export class AWSS3FileUploadsViewData {
  bucketName: string;
  fileName: string;
  uploadStatus: string;
}

interface AWSS3UploadedFile {
  bucket_name: string;
  upload_status: string;
  file_name: string;
  bucket: number;
}