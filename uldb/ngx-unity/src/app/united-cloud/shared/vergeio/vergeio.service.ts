import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRIVATE_CLOUD_WIDGET_DATA, VERGEIO_ACCOUNT_BY_ID, VERGEIO_COMPONENT_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { UsageData } from '../entities/usage-data.type';

@Injectable()
export class VergeioService {

  constructor(private http: HttpClient) { }

  getAccount(pcId: string): Observable<VergeioAccountSummary> {
    return this.http.get<VergeioAccountSummary>(VERGEIO_ACCOUNT_BY_ID(pcId));
  }

  // VergeIO exposes its own component counts (VMs/clusters/hosts/datastores/networks)
  // under its dedicated namespace, not the shared private_cloud entity.
  getComponentSummary(pcId: string): Observable<VergeioComponentSummary> {
    return this.http.get<VergeioComponentSummary>(VERGEIO_COMPONENT_SUMMARY(pcId));
  }

  getUsageData(pcId: string): Observable<UsageData> {
    return this.http.get<UsageData>(PRIVATE_CLOUD_WIDGET_DATA(pcId));
  }

  // Build the account-level monitoring-icon view model (mirrors the vCenter summary
  // getActionIconViewData); the tooltip reflects the account monitoring state.
  getActionIconViewData(data: VergeioAccountSummary): VergeioIconViewData {
    let view = new VergeioIconViewData();
    view.uuid = data.uuid;
    view.name = data.name;
    view.monitoring = data.monitoring;
    view.isStatsButtonEnabled = true;
    if (data.monitoring?.configured && data.monitoring?.enabled) {
      view.statsTooltipMessage = 'Statistics';
    } else if (data.monitoring?.configured && !data.monitoring?.enabled) {
      view.statsTooltipMessage = 'Enable monitoring';
    } else {
      view.statsTooltipMessage = 'Configure Monitoring';
    }
    return view;
  }

  convertToUsageViewData(widgetData: UsageData): VergeioUsageViewData {
    let a: VergeioUsageViewData = new VergeioUsageViewData();
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
    return a;
  }
}

export interface VergeioAccountSummary {
  uuid: string;
  name: string;
  hostname: string;
  status: string;
  enabled: boolean;
  is_managed: boolean;
  monitoring?: DeviceMonitoringType;
}

export class VergeioIconViewData {
  uuid: string;
  name: string;
  monitoring: DeviceMonitoringType;
  isStatsButtonEnabled: boolean = false;
  statsTooltipMessage: string;
}

export interface VergeioComponentSummary {
  vm: number;
  cluster: number;
  host: number;
  datastore: number;
  network: number;
  vm_details?: VergeioVmDetails;
}

export interface VergeioVmDetails {
  vm_up: number;
  vm_down: number;
  vm_unknown: number;
  vm_count: number;
}

export class VergeioUsageViewData {
  vCPUAllocated: number = 0;
  vCPUConfigured: number = 0;
  vCPUAvailable: number = 0;
  vCPUUtilizationValue: number = 0;

  RAMAllocatedValue: number = 0;
  RAMAllocatedUnit: string;
  RAMConfiguredValue: number = 0;
  RAMConfiguredUnit: string;
  RAMAvailableValue: number = 0;
  RAMAvailableUnit: string;
  RAMUtilizationValue: number = 0;

  diskSpaceAllocatedValue: number = 0;
  diskSpaceAllocatedUnit: string;
  diskSpaceConfiguredValue: number = 0;
  diskSpaceConfiguredUnit: string;
  diskSpaceAvailableValue: number = 0;
  diskSpaceAvailableUnit: string;
  diskSpaceUtilizationValue: number = 0;

  constructor() { }
}
