import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AppLevelService } from 'src/app/app-level.service';
import { CELERY_TASK_FOR_AWS, CELERY_TASK_FOR_AWS_ATTACH_AUTOSCALE, CELERY_TASK_FOR_AWS_ATTACH_LB, CELERY_TASK_FOR_AWS_ATTACH_NW_INTERFACE, CELERY_TASK_FOR_AWS_CREATE_IMAGE, CELERY_TASK_FOR_AWS_CREATE_INSTANCE, CELERY_TASK_FOR_AWS_INSTANCES, CELERY_TASK_FOR_AWS_TERMINATE_INSTANCE, DEVICE_DATA_BY_DEVICE_TYPE, GET_AWS_AUTOSCALING_GROUPS_DROPDOWN, GET_AWS_IMAGES, GET_AWS_INSTANCE_DETAILS, GET_AWS_INSTANCE_TYPE_LIST, GET_AWS_KEY_PAIRS, GET_AWS_LAUNCH_DATA, GET_AWS_LOADBALANCERS_DROPDOWN, GET_AWS_NETWORK_INTERFACES_DROPDOWN, GET_AWS_SECURITY_GROUPS_BY_VPC, GET_AWS_STORAGE_TYPE_LIST, GET_AWS_SUBNETS_BY_VPC, GET_AWS_VPC_LIST, TOGGLE_AWS_POWER } from 'src/app/shared/api-endpoint.const';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTaskV2 } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { AWSInstanceType, AWSSecurityGroupByVPC, AWSSubnetByVPCDetails, AWSVPCDetails, AWSVm, AWSVmLaunchData } from '../entities/aws.type';

@Injectable()
export class AwsVirtualMachinesService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private notification: AppNotificationService) { }

  // createTaskAndPoll(accountId?: number, regionId?: string): Observable<TaskStatus> {
  //   return this.http.get<CeleryTaskV2>((accountId && regionId) ? CELERY_TASK_FOR_AWS_INSTANCES(accountId, regionId) : CELERY_TASK_FOR_AWS())
  //     .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 100).pipe(take(1))), take(1));
  // }

  createTaskAndPoll(accountId?: number, regionId?: string) {
    return this.http.get((accountId && regionId) ? CELERY_TASK_FOR_AWS_INSTANCES(accountId, regionId) : CELERY_TASK_FOR_AWS())
  }

  updateIconStatus(data: AWSVMViewData, instanceState: string) {
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

  /**
   * DO NOT REMOVE
   * DISABLE ALL ACTION ICONS IF instance_state IS `terminated`.
   * Enable createImage, autoscale, loadbalancer, network interface IS instance_state IS `running`
   * @param vms 
   */
  convertToViewData(vms): AWSVMViewData[] {
    let viewData: AWSVMViewData[] = [];
    let results: AWSVm[] = vms.results;
    results.map(vm => {
      let data: AWSVMViewData = new AWSVMViewData();
      data.instanceId = vm.name;
      data.powerStatus = vm.instance_state === 'running' ? 'Up' : vm.instance_state === 'stopped' ? 'Down' : vm.instance_state;
      data = this.updateIconStatus(data, vm.instance_state);
      data.instanceType = vm.instance_type;
      data.publicIp = vm.public_ip ? vm.public_ip : 'N/A';
      data.availabilityZone = vm.availability_zone;
      data.accountId = vm.account_id;
      data.vmId = vm.uuid;
      data.accountName = vm.account_name ? vm.account_name : 'N/A';
      data.regionId = vm.region;
      data.uuid = vm.uuid;
      data.monitoring = vm.monitoring;

      if (data.monitoring && !data.monitoring.configured) {
        data.statsTooltipMessage = 'Configure Monitoring';
        data.isStatsEnabled = false;
      } else {
        data.statsTooltipMessage = 'VM Statistics';
        data.isStatsEnabled = true;
      }
      viewData.push(data);
    });
    return viewData;
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

  getToggleInput(view: AWSVMViewData): AWSPowerToggleInput {
    return {
      confirmTitle: 'AWS Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.instanceId, deviceId: view.instanceId,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.AWS_VIRTUAL_MACHINE, userName: '',
      accountId: view.accountId, availabilityZone: view.regionId
    };
  }

  togglePowerStatus(input: AWSPowerToggleInput, uuid: string): Observable<CeleryTaskV2> {
    return this.http.put<CeleryTaskV2>(TOGGLE_AWS_POWER(input.currentPowerStatus, uuid), null);
  }

  terminateInstance(view: AWSVMViewData): Observable<TaskStatus> {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_TERMINATE_INSTANCE(view.uuid), null)
      .pipe(switchMap(res => {
        if (res.celery_task.task_id) {
          this.notification.success(new Notification('Request for terminating submitted'));
          return this.appService.pollForTask(res.celery_task.task_id, 2, 100).pipe(take(1))
        } else {
          throw new Error('Something went wrong');
        }
      }), take(1));
  }

  getInstanceDetails(accountId: string) {
    return this.http.get<CeleryTaskV2>(GET_AWS_INSTANCE_DETAILS(accountId))
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

  createImageForm(view: AWSVMViewData): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'description': ['', [Validators.required, NoWhitespaceValidator]],
      'is_validated': [true]
    });
  }

  // submitCreateImage(view: AWSVMViewData, data: { name: string, description: string, is_validated: boolean }) {
  //   return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_CREATE_IMAGE(uuid), data)
  //     .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  // }

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

  createAutoScaleForm(view: AWSVMViewData): FormGroup {
    return this.builder.group({
      'group': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  getAutoScaleGroups(accountId: string, regionId: string, instanceId: string) {
    return this.http.get<{ data: AutoScaleGroupDropDown[] }>(GET_AWS_AUTOSCALING_GROUPS_DROPDOWN(accountId));
  }

  submitAutoScale(view: AWSVMViewData, data: { group: string }) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_ATTACH_AUTOSCALE(view.uuid, view.regionId, view.instanceId), data)
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

  createNetworkInterfaceForm(view: AWSVMViewData): FormGroup {
    return this.builder.group({
      'network_interface_id': ['', [Validators.required, NoWhitespaceValidator]],
      'device_index': ['', [Validators.required, Validators.min(0), NoWhitespaceValidator]]
    });
  }

  getNetworkInterfaceGroups(accountId: string, regionId: string, instanceId: string) {
    return this.http.get<{ data: NetworkInterfaceDropDown[] }>(GET_AWS_NETWORK_INTERFACES_DROPDOWN(accountId));
  }

  submitNwInterface(view: AWSVMViewData, data: { network_interface_id: string, device_index: number }) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_ATTACH_NW_INTERFACE(view.uuid, view.regionId, view.instanceId), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  resetLoadBalancerFormErrors() {
    return {
      'load_balancer': ''
    };
  }

  LoadBalancerValidationMessages = {
    'load_balancer': {
      'required': 'LoadBalancer is required'
    }
  }

  createLoadBalancerForm(view: AWSVMViewData): FormGroup {
    return this.builder.group({
      'load_balancer': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  getLoadBalancerGroups(accountId: number, regionId: string, instanceId: string) {
    return this.http.get<{ data: LoadBalancerDropDown[] }>(GET_AWS_LOADBALANCERS_DROPDOWN(accountId, regionId, instanceId));
  }

  submitLB(view: AWSVMViewData, data: { load_balancer: string }) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_ATTACH_LB(view.accountId, view.regionId, view.instanceId), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  getImages(accountId: string, regionId: string) {
    return this.http.get<Array<{ id: string, name: string }>>(GET_AWS_IMAGES(accountId, regionId));
  }

  getInstanceLaunchData(accountId: string, regionId: string): Observable<AWSVmLaunchData[]> {
    return this.http.get<AWSVmLaunchData[]>(GET_AWS_LAUNCH_DATA(accountId, regionId));
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

  getInstanceTypes(accountId: string, regionId: string, zone: string) {
    return this.http.get<CeleryTaskV2>(GET_AWS_INSTANCE_TYPE_LIST(accountId, regionId, zone))
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

  getVPCList(accountId: string, regionId: string) {
    return this.http.get<CeleryTaskV2>(GET_AWS_VPC_LIST(accountId, regionId))
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

  getSubnetIds(accountId: string, regionId: string, vpcId: string, zone: string) {
    return this.http.get<CeleryTaskV2>(GET_AWS_SUBNETS_BY_VPC(accountId, regionId, zone, vpcId))
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
    return this.http.get<CeleryTaskV2>(GET_AWS_SECURITY_GROUPS_BY_VPC(accountId, regionId, vpcId))
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

  getStorageTypes() {
    return this.http.get<Array<{ id: string, name: string }>>(GET_AWS_STORAGE_TYPE_LIST());
  }

  getKeyPairs(accountId: string, regionId: string) {
    let params = new HttpParams().set('region', regionId);
    return this.http.get<CeleryTaskV2>(GET_AWS_KEY_PAIRS(accountId), { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

  resetFormError() {
    return {
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
      'image_id': ['', [Validators.required]],
      'instance_type': ['', [Validators.required]],
      'max_count': ['', [Validators.required, Validators.min(1)]],
      'availability_zone': ['', [Validators.required]],
      'vpc': ['', [Validators.required]],
      'subnet_id': ['', [Validators.required]],
      'shutdown_behavior': ['', [Validators.required]],
      'keypair_behavior': ['', [Validators.required]],
      'storage_size': ['', [Validators.required, Validators.min(3)]],
      'storage_type': ['', [Validators.required]],
      'dot': [false],
      'security_group': ['', [Validators.required]],
      'tags_key': ['', NoWhitespaceValidator],
      'tags_value': ['', NoWhitespaceValidator],
      'tags_applicability': [''],
    });
  }

  createInstance(accountId: number, region: string, data: AWSInstanceDetails) {
    return this.http.post<CeleryTaskV2>(CELERY_TASK_FOR_AWS_CREATE_INSTANCE(accountId, region), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 20).pipe(take(1))), take(1));
  }

}

export class AWSVMViewData {
  vmId: string;
  regionId: string;
  accountName: string;
  instanceId: string;
  powerStatus: string;
  instanceType: string;
  accountId: number;
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  publicIp: string;
  availabilityZone: string;
  launchTime: string;
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
  uuid: string;
  monitoring: MonitoringDetailsModel;
  isStatsEnabled: boolean;

  constructor() { }
}
export interface AWSPowerToggleInput extends PowerToggleInput {
  accountId: number;
  availabilityZone: string;
}

export interface NetworkInterfaceDropDown {
  network_interface_id: string;
}

export interface LoadBalancerDropDown {
  load_balancer: string;
}

export interface AutoScaleGroupDropDown {
  auto_scaling_group: string;
}

export class AWSInstanceCreateDropdownData {
  displayName: string;
  value: string;
}

export interface AWSInstanceDetails {
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

export interface MonitoringDetailsModel {
  configured: boolean;
  enabled: boolean;
  observium: boolean;
  zabbix: boolean;
}