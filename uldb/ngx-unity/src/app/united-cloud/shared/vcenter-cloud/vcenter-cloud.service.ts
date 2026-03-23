import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UsageData } from '../entities/usage-data.type';
import { VcenterComponentSummary, VcenterSummaryAlerts } from './vcenter-cloud.type';
import { map } from 'rxjs/operators';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DEVICE_DATA_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { Handle404Header } from 'src/app/app-http-interceptor';

@Injectable()
export class VcenterCloudService {

  constructor(private http: HttpClient,
    private user: UserInfoService,
    private utilService: AppUtilityService) { }

  getCloudDetails(pcId: string, type: string): Observable<PrivateCloudType> {
    return this.http.get<PrivateCloudType>(`customer/managed/${type}/accounts/${pcId}/`).pipe(map(cloud => {
      cloud.status = this.utilService.getDeviceStatus(cloud.status);
      return cloud;
    }));
  }

  convertToSummaryViewData(cloud: PrivateCloudType): VcenterSummaryViewData {
    let s: VcenterSummaryViewData = new VcenterSummaryViewData();
    s.name = cloud.name;
    s.hypervisorCount = cloud.hypervisors ? cloud.hypervisors.length : 0;
    s.bmsCount = cloud.bm_server ? cloud.bm_server.length : 0;
    s.vmsCount = cloud.vms_count;
    s.otherCount = cloud.customdevice ? cloud.customdevice.length : 0;
    s.containerCount = 0;
    s.storageCount = cloud.storage_device ? cloud.storage_device.length : 0;
    s.macMiniCount = cloud.mac_device ? cloud.mac_device.length : 0;
    s.switchDedicated = 0;
    s.switchShared = 0;
    cloud.switch.map(res => {
      res.is_shared ? s.switchShared++ : s.switchDedicated++;
    });
    s.lbDedicated = 0;
    s.lbShared = 0;
    cloud.load_balancer.map(res => {
      res.is_shared ? s.lbShared++ : s.lbDedicated++;
    });
    s.firewallsDedicated = 0;
    s.firewallShared = 0;
    cloud.firewall.map(res => {
      res.is_shared ? s.firewallShared++ : s.firewallsDedicated++;
    });
    return s;
  }

  getActionIconViewData(data: PrivateCloudType): VcenterIconViewData {
    let view = new VcenterIconViewData();
    view.vmId = data.uuid;
    view.vmName = data.name;
    if (this.user.isManagementEnabled) {
      view.isSameTabEnabled = ((data.proxy?.same_tab && data.proxy?.proxy_fqdn ? true : false));
      view.sameTabWebAccessUrl = data.proxy?.proxy_fqdn;
      view.sameTabTooltipMessage = view.isSameTabEnabled ? 'Manage In Same Tab' : 'Device Not Configured';

      view.isNewTabEnabled = (data.proxy?.proxy_fqdn ? true : false);
      view.newTabWebAccessUrl = view.sameTabWebAccessUrl;
      view.newTabTooltipMessage = view.isNewTabEnabled ? 'Manage In New Tab' : 'Device Not Configured';
      view.deviceType = 'vcenter';
    } else {
      view.isSameTabEnabled = false;
      view.sameTabTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      view.isNewTabEnabled = false;
      view.newTabTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }
    view.canChangePassword = true;

    view.monitoring = data.monitoring;
    // view.monitoring = {
    //   "configured": true,
    //   "observium": false,
    //   "enabled": true,
    //   "zabbix": true
    // }
    // data.status = '1';
    if (data.status) {
      view.deviceStatus = this.utilService.getDeviceStatus(data.status);
      view.isStatsButtonEnabled = true;
      view.statsTooltipMessage = 'Statistics';
    }

    if (data.monitoring?.configured && data.monitoring?.enabled) {
      if (!view.deviceStatus) {
        view.deviceStatus = this.utilService.getDeviceStatus('-2');
      }
      view.isStatsButtonEnabled = true;
      view.statsTooltipMessage = 'Statistics';
    } else if (data.monitoring?.configured && !data.monitoring?.enabled) {
      if (!view.deviceStatus) {
        view.deviceStatus = this.utilService.getDeviceStatus('-2');
      }
      view.isStatsButtonEnabled = true;
      view.statsTooltipMessage = 'Enable monitoring';
    } else {
      if (!view.deviceStatus) {
        view.deviceStatus = 'Not Configured';
      }
      view.isStatsButtonEnabled = true;
      view.statsTooltipMessage = 'Configure Monitoring';
    }
    return view;
  }

  getDeviceData(d: VcenterIconViewData) {
    const url = d.monitoring?.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.VMWARE_ACCOUNT, d.vmId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.VMWARE_ACCOUNT, d.vmId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            d.deviceStatus = this.utilService.getDeviceStatus(value.status);
            d.isStatsButtonEnabled = true;
            d.statsTooltipMessage = 'Statistics';
          }
          return d;
        })
      );
  }

  getComponentSummary(pcId: string, type: string): Observable<VcenterComponentSummary> {
    return this.http.get<VcenterComponentSummary>(`/customer/managed/${type}/accounts/${pcId}/component_summary/`);
  }

  getAlertSummary(pcId: string, type: string): Observable<VcenterSummaryAlerts> {
    return this.http.get<VcenterSummaryAlerts>(`/customer/managed/${type}/accounts/${pcId}/alerts/`);
  }

  getUsageData(pcId: string, type: string): Observable<UsageData> {
    return this.http.get<UsageData>(`customer/managed/${type}/accounts/${pcId}/widget_data/`);
  }

  convertToUsageViewData(widgetData: UsageData): VcenterSummaryUsageViewData {
    let a: VcenterSummaryUsageViewData = new VcenterSummaryUsageViewData();
    a.vCPUAllocated = widgetData.allocated_vcpu > 0 ? Number(widgetData.allocated_vcpu.toFixed(2)) : 0;
    a.vCPUConfigured = widgetData.configured_vcpu > 0 ? Number(widgetData.configured_vcpu.toFixed(2)) : 0;
    a.vCPUAvailable = widgetData.available_vcpu > 0 ? Number(widgetData.available_vcpu.toFixed(2)) : 0;
    a.vCPUUtilizationValue = widgetData.vcpu_utilization?.value > 0 ? Number(widgetData.vcpu_utilization?.value.toFixed(2)) : 0;

    a.RAMAllocatedValue = widgetData.allocated_ram?.value > 0 ? Number(widgetData.allocated_ram.value.toFixed(2)) : 0;
    a.RAMAllocatedUnit = widgetData.allocated_ram?.unit ? widgetData.allocated_ram.unit : 'bytes';
    a.RAMConfiguredValue = widgetData.configured_ram?.value > 0 ? Number(widgetData.configured_ram.value.toFixed(2)) : 0;
    a.RAMConfiguredUnit = widgetData.configured_ram?.unit ? widgetData.configured_ram.unit : 'bytes';
    a.RAMAvailableValue = widgetData.available_ram?.value > 0 ? Number(widgetData.available_ram.value.toFixed(2)) : 0;
    a.RAMAvailableUnit = widgetData.available_ram?.unit ? widgetData.available_ram.unit : 'bytes';
    a.RAMUtilizationValue = widgetData.ram_utilization?.value > 0 ? Number(widgetData.ram_utilization?.value.toFixed(2)) : 0;

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
}

export class VcenterSummaryViewData {
  constructor() { }
  name: string;
  hypervisorCount: number = 0;
  vmsCount: number = 0;
  bmsCount: number = 0;
  otherCount: number = 0;
  firewallsDedicated: number = 0;
  firewallShared: number = 0;
  switchDedicated: number = 0;
  switchShared: number = 0;
  lbDedicated: number = 0;
  lbShared: number = 0;
  containerCount: number = 0;
  storageCount: number = 0;
  macMiniCount: number = 0;
  monitoring?: DeviceMonitoringType;
}

export class VcenterIconViewData {
  vmId: string;
  vmName: string;
  deviceStatus: string;
  isSameTabEnabled: boolean;
  sameTabTooltipMessage: string;
  sameTabWebAccessUrl: string;
  isNewTabEnabled: boolean;
  newTabTooltipMessage: string;
  newTabWebAccessUrl: string;
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean = false;
  monitoring?: DeviceMonitoringType;

  canChangePassword: boolean;
  deviceType: string;
  constructor() { }
}

export class VcenterSummaryUsageViewData {
  constructor() { }
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
}
