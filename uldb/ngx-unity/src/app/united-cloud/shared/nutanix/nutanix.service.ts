import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { KubernetesPodType } from 'src/app/shared/SharedEntityTypes/kubernetes-pod.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { PRIVATE_CLOUD_BY_ID, VM_LIST_BY_PLATFORM, PRIVATE_CLOUD_WIDGET_DATA, PRIVATE_CLOUD_ESXI_WIDGET_DATA, PRIVATE_CLOUD_CUSTOM_DEVICES, PRIVATE_CLOUD_CONTAINERS_PODS, POLL_PRIVATE_CLOUD_UPDATE } from 'src/app/shared/api-endpoint.const';
import { PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { NutanixDataStore } from '../entities/nutanix.type';
import { UsageData } from '../entities/usage-data.type';
import { CustomVirtualMachine, VirtualMachine, VCenterDataStore } from '../entities/vm.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

@Injectable()
export class NutanixService {

  constructor(private http: HttpClient,
    private user: UserInfoService,
    private appService: AppLevelService) { }

  getPrivateCloud(pcId: string): Observable<PrivateCloudType> {
    return this.http.get<PrivateCloudType>(PRIVATE_CLOUD_BY_ID(pcId));
  }

  getCustomVM(pcId: string, platFormType: PlatFormMapping): Observable<PaginatedResult<CustomVirtualMachine>> {
    return this.http.get<PaginatedResult<CustomVirtualMachine>>(VM_LIST_BY_PLATFORM(pcId, platFormType));
  }

  getDefaultVM(pcId: string, platFormType: PlatFormMapping): Observable<PaginatedResult<VirtualMachine>> {
    return this.http.get<PaginatedResult<VirtualMachine>>(VM_LIST_BY_PLATFORM(pcId, platFormType));
  }

  getUsageData(pcId: string): Observable<UsageData> {
    return this.http.get<UsageData>(PRIVATE_CLOUD_WIDGET_DATA(pcId));
  }

  getVcenterDataStoreDetails(pcId: string): Observable<VCenterDataStore[]> {
    return this.http.get<VCenterDataStore[]>(`/customer/private_cloud/${pcId}/datastore_list/`);
  }

  //This also using the vcenter API - can reuse the same vCenterdatastore- #todo
  getNutanixDataStoreDetails(pcId: string): Observable<NutanixDataStore[]> {
    return this.http.get<NutanixDataStore[]>(`/customer/private_cloud/${pcId}/datastore_list/`);
  }

  getEsxiUsageData(pcId: string, serverId: string): Observable<Map<string, UsageData>> {
    return this.http.get<UsageData>(PRIVATE_CLOUD_ESXI_WIDGET_DATA(pcId, serverId))
      .pipe(
        map((res: any) => {
          return new Map<string, UsageData>().set(serverId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, UsageData>().set(serverId, null));
        })
      );
  }

  getCustomDevices(pcId: string): Observable<PaginatedResult<CustomDevice>> {
    return this.http.get<PaginatedResult<CustomDevice>>(PRIVATE_CLOUD_CUSTOM_DEVICES(pcId));
  }

  getContainerPods(uuid: string): Observable<PaginatedResult<KubernetesPodType>> {
    return this.http.get<PaginatedResult<KubernetesPodType>>(PRIVATE_CLOUD_CONTAINERS_PODS(uuid));
  }

  getActionIconViewData(data: PrivateCloudType, platFormType: PlatFormMapping): IconViewData {
    let view = new IconViewData();
    view.vmId = data.uuid;
    if (this.user.isManagementEnabled) {
      if (platFormType == PlatFormMapping.VMWARE) {
        view.isSameTabEnabled = ((data.proxy.same_tab && data.proxy.proxy_fqdn ? true : false));
        view.sameTabWebAccessUrl = data.proxy.proxy_fqdn;
        view.sameTabTooltipMessage = view.isSameTabEnabled ? 'Manage In Same Tab' : 'Device Not Configured';

        view.isNewTabEnabled = (data.proxy.proxy_fqdn ? true : false);
        view.newTabWebAccessUrl = view.sameTabWebAccessUrl;
        view.newTabTooltipMessage = view.isNewTabEnabled ? 'Manage In New Tab' : 'Device Not Configured';
        view.deviceType = 'vcenter';
      } else if (platFormType == PlatFormMapping.OPENSTACK) {
        view.isSameTabEnabled = ((data.proxy.same_tab && data.proxy.proxy_fqdn ? true : false));
        view.sameTabWebAccessUrl = data.proxy.proxy_fqdn;
        view.sameTabTooltipMessage = view.isSameTabEnabled ? 'Manage In Same Tab' : 'Device Not Configured';

        view.isNewTabEnabled = (data.proxy.proxy_fqdn ? true : false);
        view.newTabWebAccessUrl = view.sameTabWebAccessUrl;
        view.newTabTooltipMessage = view.isNewTabEnabled ? 'Manage In New Tab' : 'Device Not Configured';
        view.deviceType = 'openstack_proxy';
      } else if (platFormType == PlatFormMapping.VCLOUD) {
        view.isNewTabEnabled = (data.proxy.proxy_fqdn ? true : false);
        view.newTabWebAccessUrl = data.proxy.proxy_fqdn;
        view.newTabTooltipMessage = view.isNewTabEnabled ? 'Manage In New Tab' : 'Device Not Configured';
        view.deviceType = 'vclouds/instance';
      }
    } else {
      view.isSameTabEnabled = false;
      view.sameTabTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      view.isNewTabEnabled = false;
      view.newTabTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }

    if (platFormType !== PlatFormMapping.CUSTOM && platFormType !== PlatFormMapping.ESXI) {
      view.canChangePassword = true;
    } else {
      view.canChangePassword = false;
    }
    return view;
  }

  getSummaryComponentViewData(privateCloud: PrivateCloudType): SummaryViewData {
    let data: SummaryViewData = new SummaryViewData();
    data.name = privateCloud.name;
    data.hypervisorCount = privateCloud.hypervisors ? privateCloud.hypervisors.length : 0;
    data.bmsCount = privateCloud.bm_server ? privateCloud.bm_server.length : 0;
    data.vmsCount = 0;
    data.otherCount = privateCloud.customdevice ? privateCloud.customdevice.length : 0;
    data.containerCount = 0;
    data.storageCount = privateCloud.storage_device ? privateCloud.storage_device.length : 0;
    data.macMiniCount = privateCloud.mac_device ? privateCloud.mac_device.length : 0;
    data.switchDedicated = 0;
    data.switchShared = 0;
    privateCloud.switch.map(res => {
      res.is_shared ? data.switchShared++ : data.switchDedicated++;
    });
    data.lbDedicated = 0;
    data.lbShared = 0;
    privateCloud.load_balancer.map(res => {
      res.is_shared ? data.lbShared++ : data.lbDedicated++;
    });
    data.firewallsDedicated = 0;
    data.firewallShared = 0;
    privateCloud.firewall.map(res => {
      res.is_shared ? data.firewallShared++ : data.firewallsDedicated++;
    });
    data.nutanix = privateCloud.nutanix;
    if (privateCloud.nutanix) {
      data.vmsCountNtx = privateCloud.nutanix.virtual_machine;
      data.clusterCountNtx = privateCloud.nutanix.cluster;
      data.hostCountNtx = privateCloud.nutanix.host;
      data.diskCountNtx = privateCloud.nutanix.disk;
      // data.vDiskCountNtx = privateCloud.nutanix.vdisk;
      data.storageCountNtx = privateCloud.nutanix.storage_container;
      data.storagePoolNtx = privateCloud.nutanix.storage_pool;
    }
    return data;
  }

  pollForUsageDataUpdate(pcId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(POLL_PRIVATE_CLOUD_UPDATE(pcId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  convertToUsageViewData(widgetData: UsageData): SummaryUsageViewData {
    let a: SummaryUsageViewData = new SummaryUsageViewData();
    a.vCPUAllocated = widgetData.allocated_vcpu > 0 ? Number(widgetData.allocated_vcpu.toFixed(2)) : 0;
    a.vCPUConfigured = widgetData.configured_vcpu > 0 ? Number(widgetData.configured_vcpu.toFixed(2)) : 0;
    a.vCPUAvailable = widgetData.available_vcpu > 0 ? Number(widgetData.available_vcpu.toFixed(2)) : 0;
    a.vCPUUtilizationValue = widgetData.vcpu_utilization?.value > 0 ? Number(widgetData.vcpu_utilization.value.toFixed(2)) : 0;

    a.RAMAllocatedValue = widgetData.allocated_ram?.value > 0 ? Number(widgetData.allocated_ram.value.toFixed(2)) : 0;
    a.RAMAllocatedUnit = widgetData.allocated_ram?.unit ? widgetData.allocated_ram.unit : 'bytes';
    a.RAMConfiguredValue = widgetData.configured_ram?.value > 0 ? Number(widgetData.configured_ram.value.toFixed(2)) : 0;
    a.RAMConfiguredUnit = widgetData.configured_ram?.unit ? widgetData.configured_ram.unit : 'bytes';
    a.RAMAvailableValue = widgetData.available_ram?.value > 0 ? Number(widgetData.available_ram.value.toFixed(2)) : 0;
    a.RAMAvailableUnit = widgetData.available_ram?.unit ? widgetData.available_ram.unit : 'bytes';
    a.RAMUtilizationValue = widgetData.ram_utilization?.value > 0 ? Number(widgetData.ram_utilization.value.toFixed(2)) : 0;

    a.diskSpaceAllocatedValue = widgetData.allocated_storage_disk?.value > 0 ? Number(widgetData.allocated_storage_disk.value.toFixed(2)) : 0;
    a.diskSpaceAllocatedUnit = widgetData.allocated_storage_disk?.unit ? widgetData.allocated_storage_disk.unit : 'bytes';
    a.diskSpaceConfiguredValue = widgetData.configured_storage_disk?.value > 0 ? Number(widgetData.configured_storage_disk.value.toFixed(2)) : 0;
    a.diskSpaceConfiguredUnit = widgetData.configured_storage_disk?.unit ? widgetData.configured_storage_disk.unit : 'bytes';
    a.diskSpaceAvailableValue = widgetData.available_storage_disk?.value > 0 ? Number(widgetData.available_storage_disk.value.toFixed(2)) : 0;
    a.diskSpaceAvailableUnit = widgetData.available_storage_disk?.unit ? widgetData.available_storage_disk.unit : 'bytes';
    a.diskSpaceUtilizationValue = widgetData.disk_utilization?.value > 0 ? Number(widgetData.disk_utilization.value.toFixed(2)) : 0;

    a.RAMRuntimeUsage = widgetData.ram_runtime_usage > 0 ? Number(widgetData.ram_runtime_usage.toFixed(2)) : 0;
    a.vCPURuntimeUsage = widgetData.vcpu_runtime_usage > 0 ? Number(widgetData.vcpu_runtime_usage.toFixed(2)) : 0;

    // a.vmCount = widgetData.vm_count;
    a.failedAlertsCount = widgetData.alert_count;
    return a;
  }

  pollForHypervisorsSyncData(pcId: string): Observable<any> {
    return this.http.get<any>(`/customer/customer_vcenters/${pcId}/host_vm/`);
  }
}

export class IconViewData {
  vmId: string;
  isSameTabEnabled: boolean;
  sameTabTooltipMessage: string;
  sameTabWebAccessUrl: string;
  isNewTabEnabled: boolean;
  newTabTooltipMessage: string;
  newTabWebAccessUrl: string;

  canChangePassword: boolean;
  deviceType: string;
  constructor() { }
}

export class SummaryViewData {
  constructor() { }
  name: string;
  hypervisorCount: number;
  vmsCount: number;
  bmsCount: number;
  otherCount: number;
  firewallsDedicated: number;
  firewallShared: number;
  switchDedicated: number;
  switchShared: number;
  lbDedicated: number;
  lbShared: number;
  containerCount: number;
  storageCount: number;
  macMiniCount: number;

  nutanix: Nutanix;
  vmsCountNtx: countsData;
  clusterCountNtx: countsData;
  hostCountNtx: countsData;
  diskCountNtx: countsData;
  vDiskCountNtx: countsData;
  storageCountNtx: countsData;
  storagePoolNtx: countsData;

  monitoring?: DeviceMonitoringType;
}

export class Nutanix {
  constructor() { }
  virtual_machine: countsData;
  host: countsData;
  cluster: countsData;
  storage_container: countsData;
  storage_pool: countsData;
  disk: countsData;
  virtual_disks: countsData;
}

export class countsData {
  constructor() { }
  total: number = 0;
  good: number = 0;
  error: number = 0;
  warning: number = 0;
}

export class SummaryUsageViewData {
  vCPUAllocated: number = 0;
  vCPUConfigured: number = 0;
  vCPUAvailable: number = 0;
  vCPUUtilizationValue: number = 0;
  vCPURuntimeUsage: number = 0;

  RAMAllocatedValue: number = 0;
  RAMAllocatedUnit: string;
  RAMConfiguredValue: number = 0;
  RAMConfiguredUnit: string;
  RAMAvailableValue: number = 0;
  RAMAvailableUnit: string;
  RAMUtilizationValue: number = 0;
  RAMRuntimeUsage: number = 0;

  diskSpaceAllocatedValue: number = 0;
  diskSpaceAllocatedUnit: string;
  diskSpaceConfiguredValue: number = 0;
  diskSpaceConfiguredUnit: string;
  diskSpaceAvailableValue: number = 0;
  diskSpaceAvailableUnit: string;
  diskSpaceUtilizationValue: number = 0;

  failedAlertsCount: number = 0;
  vmCount: number = 0;

  constructor() { }
}

export interface EsxiHypervisorUsageData extends UsageData {
  uuid: string;
  name: string;
  usageDataExists: boolean;
}