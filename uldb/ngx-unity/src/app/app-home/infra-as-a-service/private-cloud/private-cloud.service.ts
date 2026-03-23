import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_PRIVATE_CLOUD_FAST, POLL_PRIVATE_CLOUD_UPDATE, PRIVATE_CLOUD_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { PCFastData } from './pc-fast.type';
import { AppUtilityService, PlatFormMapping, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { UsageData } from 'src/app/united-cloud/shared/entities/usage-data.type';

@Injectable()
export class PrivateCloudService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private utilService: AppUtilityService) { }

  getPrivateCloudFast(): Observable<Array<PrivateCLoudFast>> {
    return this.http.get<Array<PrivateCLoudFast>>(GET_PRIVATE_CLOUD_FAST(), { params: new HttpParams().set('page_size', '0') });
  };

  convertToPCFastData(clouds: PrivateCLoudFast[]): PCFastData[] {
    let viewData: PCFastData[] = [];
    clouds.map((cloud: PrivateCLoudFast) => {
      if (cloud.platform_type != PlatFormMapping.CUSTOM &&
        cloud.platform_type != ServerSidePlatFormMapping.HYPER_V) {
        let a: PCFastData = new PCFastData();
        a.id = cloud.id;
        a.name = cloud.name;
        a.uuid = cloud.uuid;
        a.platfromType = cloud.platform_type;
        a.displayPlatformType = cloud.display_platform;
        a.vms = cloud.vms;
        a.datacenter = cloud.colocation_cloud;
        a.drillDownLink = `/unitycloud/pccloud/${cloud.uuid}/summary`;
        a.status = this.utilService.getDeviceStatus(cloud.status);
        viewData.push(a);
      }
    })
    return viewData;
  }

  getCloudAllocations(cloud: PCFastData): Observable<UsageData> {
    return this.http.get<UsageData>(PRIVATE_CLOUD_WIDGET_DATA(cloud.uuid));
  }

  convertToPCWidgetViewData(cloud: PCFastData, widgetData: UsageData): CloudWidgetViewData {
    let a: CloudWidgetViewData = new CloudWidgetViewData();
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

    a.vmCount = cloud.vms;
    a.failedAlertsCount = widgetData.alert_count;
    a.vmDrilldownLink = `/unitycloud/pccloud/${cloud.uuid}/vms`;
    a.alertsDrilldownLink = `/unitycloud/pccloud/${cloud.uuid}/alldevices`;
    return a;
  }

  pollForCloudsUpdate(pcId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(POLL_PRIVATE_CLOUD_UPDATE(pcId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }
}

export class CloudWidgetViewData {
  vCPUAllocated: number = 0;
  vCPUConfigured: number = 0;
  vCPUAvailable: number = 0;
  vCPUUtilizationValue: number = 0;
  vCPURuntimeUsage: number = 0;

  RAMAllocatedValue: number = 0;
  RAMAllocatedUnit: string = 'bytes';
  RAMConfiguredValue: number = 0;
  RAMConfiguredUnit: string = 'bytes';
  RAMAvailableValue: number = 0;
  RAMAvailableUnit: string = 'bytes';
  RAMUtilizationValue: number = 0;
  RAMRuntimeUsage: number = 0;

  diskSpaceAllocatedValue: number = 0;
  diskSpaceAllocatedUnit: string = 'bytes';
  diskSpaceConfiguredValue: number = 0;
  diskSpaceConfiguredUnit: string = 'bytes';
  diskSpaceAvailableValue: number = 0;
  diskSpaceAvailableUnit: string = 'bytes';
  diskSpaceUtilizationValue: number = 0;

  failedAlertsCount: number = 0;
  alertsDrilldownLink: string;

  vmCount: number = 0;
  vmDrilldownLink: string;

  constructor() { }
}