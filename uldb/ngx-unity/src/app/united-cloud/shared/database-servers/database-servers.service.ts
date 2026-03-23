import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { EMPTY, Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DEVICE_LIST_BY_DEVICE_TYPE, DEVICE_DATA_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map, catchError } from 'rxjs/operators';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { DatabaseServer } from '../entities/database-servers.type';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT, WINDOWS_CONSOLE_CLIENT, MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class DatabaseServersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=database_servers`)
  }

  getDBServers(criteria: SearchCriteria): Observable<PaginatedResult<DatabaseServer>> {
    // return of({ "count": 7, "next": null, "previous": null, "results": [{ "url": "http://192.168.56.112:8000/customer/database_servers/05152001-9234-4964-ac68-0e1096c5f9ba/", "id": 53, "uuid": "05152001-9234-4964-ac68-0e1096c5f9ba", "server_type": "BMS", "db_instance_name": "bmsinstance", "db_type": { "url": "http://192.168.56.112:8000/rest/database_type/2/", "id": 2, "name": "MSSQL Server" }, "port": 2122, "customer": { "url": "http://192.168.56.112:8000/rest/fast/org/22/", "id": 22, "name": "Aerys", "storage": "1", "uuid": "13a3d8bb-1ddb-4210-8ca4-d7a11634f4ca" }, "private_cloud": null, "device_object": { "management_ip": null, "cloud_type": null, "name": "bms", "device_uuid": "91296aa1-6381-4faf-87b6-f1110380d27d", "power_status": false, "os_type": "Hypervisor", "os": "ESXi", "device_id": 637 }, "monitoring": { "configured": true, "observium": false, "enabled": true, "zabbix": true } }, { "url": "http://192.168.56.112:8000/customer/database_servers/48176286-376f-4f9a-b98e-805dfe63940a/", "id": 46, "uuid": "48176286-376f-4f9a-b98e-805dfe63940a", "server_type": "VMS", "db_instance_name": "d", "db_type": { "url": "http://192.168.56.112:8000/rest/database_type/1/", "id": 1, "name": "MySQL" }, "port": 2122, "customer": { "url": "http://192.168.56.112:8000/rest/fast/org/22/", "id": 22, "name": "Aerys", "storage": "1", "uuid": "13a3d8bb-1ddb-4210-8ca4-d7a11634f4ca" }, "private_cloud": { "id": 15, "name": "Custom Cloud1", "uuid": "95141227-ec4e-498a-9e63-5ec020d01437", "platform_type": "Custom" }, "device_object": { "management_ip": "13.126.121.25", "cloud_type": "Custom", "name": "Custom Cloud Windows VM", "device_uuid": "0445b216-d686-46e1-8dcb-c5501466da80", "power_status": false, "os_type": "Windows", "os": "Windows", "device_id": 124 }, "monitoring": { "configured": false, "observium": false, "enabled": false, "zabbix": true } }, { "url": "http://192.168.56.112:8000/customer/database_servers/3941eb62-811f-49bc-b0d7-4e963d21fea7/", "id": 64, "uuid": "3941eb62-811f-49bc-b0d7-4e963d21fea7", "server_type": "VMS", "db_instance_name": "DB1 VM", "db_type": { "url": "http://192.168.56.112:8000/rest/database_type/2/", "id": 2, "name": "MSSQL Server" }, "port": 2, "customer": { "url": "http://192.168.56.112:8000/rest/fast/org/22/", "id": 22, "name": "Aerys", "storage": "1", "uuid": "13a3d8bb-1ddb-4210-8ca4-d7a11634f4ca" }, "private_cloud": { "id": 495, "name": "proxmox", "uuid": "3e9d944a-e729-4149-928d-e3ecff39f21b", "platform_type": "Proxmox" }, "device_object": { "management_ip": null, "cloud_type": "Proxmox", "name": "Ashwith-DONTdelete", "device_uuid": "4e05b4e4-d2f0-41dc-85eb-2f8d881307da", "power_status": false, "os_type": "linux", "os": "Linux 2.6 - 5.X Kernel", "device_id": 1707 }, "monitoring": { "configured": false, "observium": false, "enabled": false, "zabbix": true } }, { "url": "http://192.168.56.112:8000/customer/database_servers/68bad840-4c09-4851-b955-b5ad0adaa815/", "id": 63, "uuid": "68bad840-4c09-4851-b955-b5ad0adaa815", "server_type": "BMS", "db_instance_name": "DBTest", "db_type": { "url": "http://192.168.56.112:8000/rest/database_type/2/", "id": 2, "name": "MSSQL Server" }, "port": 1234, "customer": { "url": "http://192.168.56.112:8000/rest/fast/org/22/", "id": 22, "name": "Aerys", "storage": "1", "uuid": "13a3d8bb-1ddb-4210-8ca4-d7a11634f4ca" }, "private_cloud": null, "device_object": { "management_ip": null, "cloud_type": null, "name": "bms", "device_uuid": "91296aa1-6381-4faf-87b6-f1110380d27d", "power_status": false, "os_type": "Hypervisor", "os": "ESXi", "device_id": 637 }, "monitoring": { "configured": false, "observium": false, "enabled": false, "zabbix": true } }, { "url": "http://192.168.56.112:8000/customer/database_servers/491719dd-c80d-49b9-9f07-a7db3ada47ca/", "id": 60, "uuid": "491719dd-c80d-49b9-9f07-a7db3ada47ca", "server_type": "VMS", "db_instance_name": "delete db", "db_type": { "url": "http://192.168.56.112:8000/rest/database_type/2/", "id": 2, "name": "MSSQL Server" }, "port": 2122, "customer": { "url": "http://192.168.56.112:8000/rest/fast/org/22/", "id": 22, "name": "Aerys", "storage": "1", "uuid": "13a3d8bb-1ddb-4210-8ca4-d7a11634f4ca" }, "private_cloud": { "id": 495, "name": "proxmox", "uuid": "3e9d944a-e729-4149-928d-e3ecff39f21b", "platform_type": "Proxmox" }, "device_object": { "management_ip": null, "cloud_type": "Proxmox", "name": "Ashwith-DONTdelete", "device_uuid": "4e05b4e4-d2f0-41dc-85eb-2f8d881307da", "power_status": false, "os_type": "linux", "os": "Linux 2.6 - 5.X Kernel", "device_id": 1707 }, "monitoring": { "configured": false, "observium": false, "enabled": false, "zabbix": true } }, { "url": "http://192.168.56.112:8000/customer/database_servers/eebce731-7b85-44d8-9c77-c23a91540509/", "id": 45, "uuid": "eebce731-7b85-44d8-9c77-c23a91540509", "server_type": "BMS", "db_instance_name": "nn2", "db_type": { "url": "http://192.168.56.112:8000/rest/database_type/2/", "id": 2, "name": "MSSQL Server" }, "port": 2122, "customer": { "url": "http://192.168.56.112:8000/rest/fast/org/22/", "id": 22, "name": "Aerys", "storage": "1", "uuid": "13a3d8bb-1ddb-4210-8ca4-d7a11634f4ca" }, "private_cloud": null, "device_object": { "management_ip": null, "cloud_type": null, "name": "BMS_unity", "device_uuid": "7a31c57d-13a1-46f2-8aad-05b6f5d47252", "power_status": false, "os_type": "Hypervisor", "os": "ESXi", "device_id": 634 }, "monitoring": { "configured": false, "observium": false, "enabled": false, "zabbix": true } }, { "url": "http://192.168.56.112:8000/customer/database_servers/87e30f30-badc-4515-833f-897f171a1bee/", "id": 47, "uuid": "87e30f30-badc-4515-833f-897f171a1bee", "server_type": "BMS", "db_instance_name": "ttw", "db_type": { "url": "http://192.168.56.112:8000/rest/database_type/1/", "id": 1, "name": "MySQL" }, "port": 2122, "customer": { "url": "http://192.168.56.112:8000/rest/fast/org/22/", "id": 22, "name": "Aerys", "storage": "1", "uuid": "13a3d8bb-1ddb-4210-8ca4-d7a11634f4ca" }, "private_cloud": null, "device_object": { "management_ip": null, "cloud_type": null, "name": "bms", "device_uuid": "91296aa1-6381-4faf-87b6-f1110380d27d", "power_status": false, "os_type": "Hypervisor", "os": "ESXi", "device_id": 637 }, "monitoring": { "configured": false, "observium": false, "enabled": false, "zabbix": true } }] })
    return this.tableService.getData<PaginatedResult<DatabaseServer>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.DB_SERVER), criteria);
  }

  getAllDBServers(criteria: SearchCriteria): Observable<DatabaseServer[]> {
    return this.tableService.getData<DatabaseServer[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.DB_SERVER), criteria);
  }

  private getServerType(server: DatabaseServer): DeviceMapping {
    if (server.server_type == 'VMS') {
      if (server.device_object && server.device_object.cloud_type) {
        switch (server.device_object.cloud_type) {
          case 'vmware': return DeviceMapping.VMWARE_VIRTUAL_MACHINE;
          case 'OpenStack': return DeviceMapping.OPENSTACK_VIRTUAL_MACHINE;
          case 'vCloud Director': return DeviceMapping.VCLOUD;
          case 'Proxmox': return DeviceMapping.PROXMOX;
          case 'G3 KVM': return DeviceMapping.G3_KVM;
          case 'Custom': return DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
          default: return null;
        }
      } else {
        return null;
      }
    } else {
      return DeviceMapping.BARE_METAL_SERVER;
    }
  }

  private getBMSSHData(mgmtIp: string, osType: string): ServerSSHOptions {
    let a: ServerSSHOptions = new ServerSSHOptions();
    a.isSameTabEnabled = osType?.match('Linux') ? true : false;
    a.isNewTabEnabled = osType?.match('Linux') || osType?.match('Windows') ? true : false;
    switch (osType) {
      case 'Linux':
        a.sameTabTooltipMessage = 'Open in same tab';
        a.newTabTooltipMessage = 'Open In New Tab';
        a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
        break;
      case 'Windows':
        a.sameTabTooltipMessage = 'Open in same tab option is not available for windows machines';
        a.newTabTooltipMessage = 'Open In New Tab';
        a.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), mgmtIp) : WINDOWS_CONSOLE_CLIENT(mgmtIp);
        break;
      default:
        a.sameTabTooltipMessage = 'Open in same tab option is not available';
        a.newTabTooltipMessage = 'Open in new tab option is not available';
        break;
    }
    return a;
  }

  private getVMSSHData(mgmtIp: string, osType: string, powerStatus: boolean): ServerSSHOptions {
    let a: ServerSSHOptions = new ServerSSHOptions();
    const isWindows: boolean = osType.lastIndexOf('Microsoft', 0) == 0;
    a.isSameTabEnabled = powerStatus && !isWindows;
    a.isNewTabEnabled = powerStatus;
    if (!powerStatus) {
      a.sameTabTooltipMessage = 'VM is Down';
      a.newTabTooltipMessage = 'VM is Down';
    } else if (isWindows) {
      a.sameTabTooltipMessage = 'Open in Same tab option is not available for windows based machines';
      a.newTabTooltipMessage = 'Open In New Tab';
      a.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), mgmtIp) : WINDOWS_CONSOLE_CLIENT(mgmtIp);
    } else {
      a.sameTabTooltipMessage = 'Open in same tab';
      a.newTabTooltipMessage = 'Open In New Tab';
      a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
    }
    return a;
  }

  private getSSHData(server: DatabaseServer): ServerSSHOptions {
    let a: ServerSSHOptions = new ServerSSHOptions();
    if (this.user.isManagementEnabled) {
      const osType = server.device_object ? server.device_object.os_type : null;
      const mgmtIp: string = server.device_object ? server.device_object.management_ip : null;
      if (mgmtIp) {
        if (server.server_type == 'BMS') {
          return this.getBMSSHData(mgmtIp, osType);
        } else {
          switch (server.device_object.cloud_type) {
            case 'VMware':
            case 'OpenStack':
            case 'vCloud Director':
            case 'Proxmox':
            case 'G3 KVM':
              return this.getVMSSHData(mgmtIp, osType, server.device_object.power_status);
            case 'Custom':
              return this.getBMSSHData(mgmtIp, osType);
            default: return a;
          }
        }
      } else {
        a.sameTabTooltipMessage = 'Management IP not Configured';
        a.newTabTooltipMessage = 'Management IP not Configured';
      }
      return a;
    } else {
      return a;
    }
  }

  convertToViewData(data: DatabaseServer[]): DBServerViewData[] {
    let viewData: DBServerViewData[] = [];
    data.map(s => {
      let a: DBServerViewData = new DBServerViewData();
      a.instanceId = s.uuid;
      a.instanceName = s.db_instance_name;
      a.type = s.db_type ? s.db_type.name : 'N/A';
      a.port = s.port;

      a.cloud = s.private_cloud ? s.private_cloud.name : 'N/A';
      a.cloudType = s.device_object ? s.device_object.cloud_type : null;
      a.serverId = s.device_object ? s.device_object.device_id : null;
      a.serverUUID = s.device_object ? s.device_object.device_uuid : null;
      a.serverType = this.getServerType(s);
      a.serverName = s.device_object && s.device_object.name ? s.device_object.name : 'N/A';
      a.managementIP = s.device_object && s.device_object.management_ip ? s.device_object.management_ip : 'N/A';
      a.os = s.device_object && s.device_object.os ? s.device_object.os : 'N/A';
      a.osType = s.device_object && s.device_object.os_type ? s.device_object.os_type : 'N/A';
      a.tags = s.tags.filter(tg => tg);
      a.monitoring = s.monitoring;

      a.sshOptions = this.getSSHData(s);
      a.editBtnTooltipMsg = 'Edit';
      a.deleteBtnTooltipMsg = 'Delete';
      a.monitoring = s.monitoring;
      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: DBServerViewData) {
    if (!device.monitoring.configured) {
      device.popOverDetails.uptime = '0';
      device.deviceStatus = 'Not Configured';
      device.popOverDetails.lastreboot = '0';
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      device.popOverDetails.uptime = '0';
      device.deviceStatus = this.utilService.getDeviceStatus('-2');
      // device.popOverDetails.lastreboot = '0';
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    return this.http.get(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.DB_SERVER, device.instanceId), { headers: Handle404Header })
      .pipe(
        map((result: DeviceData) => {
          if (result && result.device_data) {
            device.popOverDetails.uptime = '0';
            device.popOverDetails.lastreboot = '0';
            device.statsTooltipMessage = 'Database Statistics';
            switch (`${result.device_data.status}`) {
              case '1':
                device.deviceStatus = 'Up';
                device.popOverDetails.status = `${result}`;
                break;
              case '0':
                device.deviceStatus = 'Down';
                device.popOverDetails.status = `${result}`;
                break;
              case '-1': // device is configured but couldn't get state
                device.deviceStatus = 'Unknown';
                device.popOverDetails.status = `${result}`;
                break;
              default: // status == null for not not reacheable device
                // device.deviceStatus = 'Not Configured';
                // device.statsTooltipMessage = 'Configure Monitoring';
                device.deviceStatus = 'Unknown';
                device.popOverDetails.status = `${result}`;
                break;
            }
          }
          return device;
        })
      );
  }

  getConsoleAccessInput(device: DBServerViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.DB_SERVER, deviceType: device.serverType,
      deviceId: device.serverUUID, newTab: false, deviceName: device.serverName, managementIp: device.managementIP
    };
  }

  deleteMultipleDbServers(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/database_servers/bulk_delete/`, { params: params });
  }

  updateMultipleDbServers(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/database_servers/bulk_update/`, obj, { params });
  }
}

export class DBServerViewData {
  instanceId: string;
  instanceName: string;
  type: string;
  port: number;
  deviceStatus: string;

  serverId: number;
  serverUUID: string;
  serverType: DeviceMapping;
  serverName: string;
  os: string;
  osType: string;
  managementIP: string;
  cloud: string;
  cloudType: string;
  tags: string[];

  editBtnTooltipMsg: string;
  deleteBtnTooltipMsg: string;
  statsTooltipMessage: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();

  sshOptions: ServerSSHOptions = null;
  monitoring: DeviceMonitoringType;
  
  isSelected: boolean;
  applicableModulePermissions: any[];
  constructor() { }
}

export class ServerSSHOptions {
  isSameTabEnabled: boolean = false;
  sameTabTooltipMessage: string = MANAGEMENT_NOT_ENABLED_MESSAGE();
  isNewTabEnabled: boolean = false;
  newTabTooltipMessage: string = MANAGEMENT_NOT_ENABLED_MESSAGE();
  newTabConsoleAccessUrl: string = null;
  constructor() { }
}