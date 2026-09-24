import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DATACENTER_DEVICE_LIST } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { BmServersService } from '../../shared/bm-servers/bm-servers.service';
import { FirewallsService } from '../../shared/firewalls/firewalls.service';
import { HypervisorsService } from '../../shared/hypervisors/hypervisors.service';
import { LoadbalancersService } from '../../shared/loadbalancers/loadbalancers.service';
import { StorageDevicesService } from '../../shared/storage-devices/storage-devices.service';
import { SwitchesService } from '../../shared/switches/switches.service';
import { DatacenterDeviceAction, DatacenterDeviceListingColumn, DatacenterDeviceListingConfig, DatacenterDeviceListingResponse } from './datacenter-devices.type';

@Injectable()
export class DatacenterDevicesService {

  private deviceConfig: { [deviceType: string]: DatacenterDeviceListingConfig } = {
    switches: {
      title: 'Switches',
      endpoint: 'switches',
      deviceMapping: DeviceMapping.SWITCHES,
      activityLogType: 'switches',
      columns: NETWORK_DEVICE_COLUMNS,
      actions: NETWORK_DEVICE_ACTIONS
    },
    firewalls: {
      title: 'Firewalls',
      endpoint: 'firewalls',
      deviceMapping: DeviceMapping.FIREWALL,
      activityLogType: 'firewalls',
      columns: NETWORK_DEVICE_COLUMNS,
      actions: NETWORK_DEVICE_ACTIONS
    },
    loadbalancers: {
      title: 'Load Balancers',
      endpoint: 'load_balancers',
      deviceMapping: DeviceMapping.LOAD_BALANCER,
      activityLogType: 'load_balancers',
      columns: NETWORK_DEVICE_COLUMNS,
      actions: NETWORK_DEVICE_ACTIONS
    },
    hypervisors: {
      title: 'Hypervisors',
      endpoint: 'hypervisors',
      deviceMapping: DeviceMapping.HYPERVISOR,
      activityLogType: 'servers',
      columns: [
        { label: 'Name', keys: ['name'], sortColumn: 'name' },
        { label: 'Status', keys: ['deviceStatus', 'status'], type: 'status' },
        { label: 'Virtualization Type', keys: ['virtualizationType', 'instance.virtualization_type', 'virtualization_type'] },
        { label: 'Operating System', keys: ['os', 'instance.os.full_name', 'os.full_name'] },
        { label: 'Cloud', keys: ['cloud', 'private_cloud.name'] },
        { label: 'Management IP', keys: ['managementIP', 'management_ip'] },
        { label: 'Tags', keys: ['tags'], type: 'tags' }
      ],
      actions: HYPERVISOR_ACTIONS
    },
    bmservers: {
      title: 'Bare Metal Servers',
      endpoint: 'bm_servers',
      deviceMapping: DeviceMapping.BARE_METAL_SERVER,
      activityLogType: 'bm_servers',
      columns: [
        { label: 'Server', keys: ['name', 'server.name'], sortColumn: 'name' },
        { label: 'Status', keys: ['deviceStatus', 'server.status', 'status'], type: 'status' },
        { label: 'Operating System', keys: ['os', 'server.os.full_name', 'os.full_name'] },
        { label: 'Cloud', keys: ['cloud', 'server.private_cloud.name', 'private_cloud.name'] },
        { label: 'Management IP', keys: ['managementIP', 'server.management_ip', 'management_ip'] },
        { label: 'Tags', keys: ['tags', 'server.tags'], type: 'tags' }
      ],
      actions: DEVICE_ACTIONS
    },
    storagedevices: {
      title: 'Storage Devices',
      endpoint: 'storage_devices',
      deviceMapping: DeviceMapping.STORAGE_DEVICES,
      activityLogType: 'storage',
      columns: [
        { label: 'Name', keys: ['name'], sortColumn: 'name' },
        { label: 'Status', keys: ['deviceStatus', 'status'], type: 'status' },
        { label: 'Cloud', keys: ['cloud', 'private_cloud.name'] },
        { label: 'OS', keys: ['os', 'os.full_name'] },
        { label: 'Management IP', keys: ['managementIp', 'management_ip'] },
        { label: 'Storage', keys: ['storageType', 'storage.type', 'manufacturer.name'] },
        { label: 'Tags', keys: ['tags'], type: 'tags' }
      ],
      actions: DEVICE_ACTIONS
    }
  };

  constructor(private tableService: TableApiServiceService,
    private switchesService: SwitchesService,
    private firewallsService: FirewallsService,
    private loadbalancersService: LoadbalancersService,
    private hypervisorsService: HypervisorsService,
    private bmServersService: BmServersService,
    private storageDevicesService: StorageDevicesService) { }

  getConfig(deviceType: string): DatacenterDeviceListingConfig {
    return this.deviceConfig[deviceType];
  }

  getDevices(dcId: string, deviceType: string, criteria: SearchCriteria): Observable<DatacenterDeviceListingResponse | any[]> {
    const config = this.getConfig(deviceType);
    return this.tableService.getData<DatacenterDeviceListingResponse | any[]>(DATACENTER_DEVICE_LIST(dcId, config.endpoint), criteria);
  }

  convertToViewData(deviceType: string, rows: any[]): any[] {
    switch (deviceType) {
      case 'switches':
        return this.switchesService.convertToViewData(rows);
      case 'firewalls':
        return this.firewallsService.convertToViewData(rows);
      case 'loadbalancers':
        return this.loadbalancersService.convertToViewData(rows);
      case 'hypervisors':
        return this.hypervisorsService.convertToViewData(rows);
      case 'bmservers':
        return this.bmServersService.converToViewData(rows);
      case 'storagedevices':
        return this.storageDevicesService.convertToViewData(rows);
      default:
        return rows;
    }
  }

  getDeviceData(deviceType: string, row: any): Observable<any> {
    switch (deviceType) {
      case 'switches':
        return this.switchesService.getDeviceData(row);
      case 'firewalls':
        return this.firewallsService.getDeviceData(row);
      case 'loadbalancers':
        return this.loadbalancersService.getDeviceData(row);
      case 'hypervisors':
        return this.hypervisorsService.getDeviceData(row);
      case 'bmservers':
        return this.bmServersService.getDeviceData(row);
      case 'storagedevices':
        return this.storageDevicesService.getDeviceData(row);
      default:
        return of(null);
    }
  }
}

const NETWORK_DEVICE_COLUMNS: DatacenterDeviceListingColumn[] = [
  { label: 'Name', keys: ['name'], sortColumn: 'name' },
  { label: 'Status', keys: ['deviceStatus', 'status'], type: 'status' },
  { label: 'Model', keys: ['model', 'model.name'] },
  { label: 'Cloud', keys: ['cloud', 'private_cloud.name'] },
  { label: 'Type', keys: ['type', 'manufacturer.name', 'manufacturer'] },
  { label: 'Management IP', keys: ['managementIp', 'management_ip'] },
  { label: 'Tags', keys: ['tags'], type: 'tags' }
];

const DEVICE_ACTIONS: DatacenterDeviceAction[] = [
  { type: 'consoleSameTab', icon: 'fas fa-external-link-square-alt', tooltip: 'Console Access', moduleName: 'Datacenter', accessType: 'Remote Management' },
  { type: 'consoleNewTab', icon: 'fas fa-external-link-alt', tooltip: 'Console Access In New Tab', moduleName: 'Datacenter', accessType: 'Remote Management' },
  { type: 'stats', icon: 'fas fa-chart-line', tooltip: 'Stats', moduleName: 'Monitoring', accessType: 'View Monitoring' },
  { type: 'ticket', icon: 'fas fa-ticket-alt', tooltip: 'Manage by creating support ticket' },
  { type: 'notify', icon: 'fas fa-bell', tooltip: 'Alert Notification', moduleName: 'Notifications', accessType: 'Manage Notifications' },
  { type: 'edit', icon: 'fas fa-pencil-alt', tooltip: 'Edit', moduleName: 'Datacenter', accessType: 'Manage Datacenter' },
  { type: 'delete', icon: 'far fa-trash-alt', tooltip: 'Delete', moduleName: 'Datacenter', accessType: 'Manage Datacenter' }
];

const NETWORK_DEVICE_ACTIONS: DatacenterDeviceAction[] = DEVICE_ACTIONS;

const HYPERVISOR_ACTIONS: DatacenterDeviceAction[] = [
  ...DEVICE_ACTIONS,
  { type: 'resetPassword', icon: 'fas fa-lock', tooltip: 'Reset Password', moduleName: 'Datacenter', accessType: 'Manage Datacenter' }
];
