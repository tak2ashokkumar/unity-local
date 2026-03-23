import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DEVICE_DATA_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { Hypervisor, HypervisorUsageType } from '../entities/hypervisor.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class HypervisorsService {

  constructor(private http: HttpClient,
    private utilService: AppUtilityService,
    private tableService: TableApiServiceService,
    private user: UserInfoService) { }

  /**
   * @description
   * This function syncs all hypervisors. This is used by the HypervisorsComponent to sync hypervisors related to all vCenter accounts.
   * @returns Observable<any>
   */
  syncVcenterHypervisors(): Observable<any> {
    return this.http.get<any>(`/customer/integration/vcenter/accounts/discover_vmware_hosts/`);
  }

  /**
   * @description
   * This function returns a paginated list of hypervisors, which will be used by the HypervisorsComponent.
   * The criteria parameter can be used to filter out the hypervisors based on the search criteria.
   * @param criteria SearchCriteria
   * @returns Observable<PaginatedResult<Hypervisor>>
   */
  getHypervisors(criteria: SearchCriteria): Observable<PaginatedResult<Hypervisor>> {
    return this.tableService.getData<PaginatedResult<Hypervisor>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR), criteria);
  }

  /**
   * @description
   * This function returns the list of all hypervisors, which will be used by the AllDevicesHypervisorsComponent.
   * The criteria parameter can be used to filter out the hypervisors based on the search criteria.
   * @param criteria SearchCriteria
   * @returns Observable<Hypervisor[]>
   */
  getAllHypervisors(criteria: SearchCriteria): Observable<Hypervisor[]> {
    return this.tableService.getData<Hypervisor[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR), criteria);
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=hypervisor`)
  }

  convertToViewData(hyperVisors: Hypervisor[], clusterId?: string): HypervisorViewData[] {
    let viewData: HypervisorViewData[] = [];
    hyperVisors.map((d) => {
      let a: HypervisorViewData = new HypervisorViewData();
      a.deviceId = d.uuid;
      a.cloud = d.private_cloud ? `${d.private_cloud.name}(${this.utilService.getCloudTypeByPlatformType(d.private_cloud.platform_type)})` : 'N/A';
      a.managementIP = d.management_ip ? d.management_ip : 'N/A';
      a.os = d.instance.os ? d.instance.os.full_name : 'N/A';
      a.virtualizationType = d.instance.virtualization_type ? d.instance.virtualization_type : 'N/A';
      a.name = d.name;
      a.monitoring = d.monitoring;
      a.tags = d.tags.filter(tg => tg);
      if (d.instance.os) {
        a.hasOS = true;
        a.platformType = d.instance.os.platform_type ? d.instance.os.platform_type : 'N/A';
      }

      if (d.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(d.status);
      }

      if (this.user.isManagementEnabled) {
        if (a.hasOS && a.platformType.match('Windows')) {
          a.isSameTabEnabled = false;
          a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();

          a.isNewTabEnabled = ((a.managementIP.match('N/A') ? false : true) || (d.proxy.proxy_fqdn ? true : false));
          a.newTabWebAccessUrl = a.managementIP.match('N/A') ? null : this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), a.managementIP) : WINDOWS_CONSOLE_CLIENT(a.managementIP);
          a.newTabConsoleAccessUrl = a.managementIP.match('N/A') ? null : VM_CONSOLE_CLIENT();
          a.newTabTootipMessage = a.isNewTabEnabled ? 'Manage In New Tab' : 'Device Not Configured';
          if (a.isNewTabEnabled && !a.isSameTabEnabled && !d.proxy.same_tab) {
            a.sameTabTootipMessage = 'Non Managable In Same Tab';
          }
        } else {
          a.isSameTabEnabled = ((d.proxy.same_tab && d.proxy.proxy_fqdn ? true : false) || (a.managementIP.match('N/A') ? false : true));
          a.sameTabWebAccessUrl = this.user.rdpUrls.length ? this.user.rdpUrls.getLast() : d.proxy.proxy_fqdn;
          a.sameTabConsoleAccessUrl = a.managementIP.match('N/A') ? null : a.managementIP;
          a.sameTabTootipMessage = a.isSameTabEnabled ? 'Manage In Same Tab' : 'Device Not Configured';

          a.isNewTabEnabled = ((a.managementIP.match('N/A') ? false : true) || (d.proxy.proxy_fqdn ? true : false));
          a.newTabWebAccessUrl = a.sameTabWebAccessUrl;
          a.newTabConsoleAccessUrl = a.managementIP.match('N/A') ? null : VM_CONSOLE_CLIENT();
          a.newTabTootipMessage = a.isNewTabEnabled ? 'Manage In New Tab' : 'Device Not Configured';
          if (a.isNewTabEnabled && !a.isSameTabEnabled && !d.proxy.same_tab) {
            a.sameTabTootipMessage = 'Non Managable In Same Tab';
          }
        }
      } else {
        a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.isSameTabEnabled = false;
        a.isNewTabEnabled = false;
      }

      //Rest of the fields to add.
      if (d.private_cloud) {
        a.isESXIHypervisor = d.private_cloud.platform_type == PlatFormMapping.ESXI;
      } else {
        a.isESXIHypervisor = d.instance.virtualization_type == PlatFormMapping.ESXI;
      }

      if (clusterId) {
        a.resetPasswordTooltip = a.isESXIHypervisor ? 'Reset Password' : 'Reset password is available only for ESXI Hosts';
      } else {
        a.resetPasswordTooltip = a.isESXIHypervisor ? 'Reset Password' : 'Reset password is available only for ESXI Hypervisors';
      }

      if (d.cpu_usage) {
        a.cpuUsage = this.getUsageData(d.cpu_usage);
      }
      if (d.memory_usage) {
        a.memoryUsage = this.getUsageData(d.memory_usage);
      }
      if (d.storage_usage) {
        a.storageUsage = this.getUsageData(d.storage_usage);
      }
      viewData.push(a);
    });
    return viewData;
  }

  private getUsageData(d: HypervisorUsageType) {
    let a = new HypervisorUsageViewData();
    a.capacityValue = d.total?.value > 0 ? Number(d.total.value.toFixed(2)) : 0;
    a.capacityUnit = d.total?.unit ? d.total.unit : 'bytes';
    a.usedValue = d.used?.value > 0 ? Number(d.used.value.toFixed(2)) : 0;
    a.usedUnit = d.used?.unit ? d.used.unit : 'bytes';
    a.usedPercentageValue = d.consumed_percentage?.value > 0 ? Number(d.consumed_percentage.value.toFixed(2)) : 0;
    a.availableValue = d.available?.value > 0 ? Number(d.available.value.toFixed(2)) : 0;
    a.availableUnit = d.available?.unit ? d.available.unit : 'bytes';
    a.availablePercentageValue = d.available_percentage?.value > 0 ? Number(d.available_percentage.value.toFixed(2)) : 0;
    a.usedBarColor = a.usedPercentageValue < 65 ? 'bg-success' : a.usedPercentageValue >= 65 && a.usedPercentageValue < 85 ? 'bg-warning' : 'bg-danger';
    return a;
  }

  getDeviceData(device: HypervisorViewData) {
    if (!device.monitoring.configured) {
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilService.getDeviceStatus('-2');
      }
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR, device.deviceId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR, device.deviceId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'Statistics';
          }
          return device;
        })
      );
  }

  private setXtermAttributes(viewData: HypervisorViewData) {
    viewData.isSameTabEnabled = (!viewData.managementIP.match('N/A') && viewData.hasOS && viewData.platformType.match('Linux')) ? true : false;
    if (viewData.hasOS) {
      switch (viewData.platformType) {
        case 'Windows': viewData.sameTabTootipMessage = 'Open in same tab option is not available for windows machines';
          break;
        case 'Linux': viewData.sameTabTootipMessage = 'Open in same tab';
          break;
        default: viewData.sameTabTootipMessage = 'Open in same tab option is not available';
          break;
      }
    } else {
      viewData.sameTabTootipMessage = 'Open in same tab option is not available';
    }

    viewData.isNewTabEnabled = (!viewData.managementIP.match('N/A') && viewData.hasOS && (viewData.platformType.match('Windows') || viewData.platformType.match('Linux'))) ? true : false;
    if (viewData.isNewTabEnabled && viewData.hasOS) {
      switch (viewData.platformType) {
        case 'Windows': viewData.newTabTootipMessage = 'Open In New Tab';
          viewData.newTabConsoleAccessUrl = this.user.rdpUrls.length ? WINDOWS_CONSOLE_VIA_AGENT(this.user.rdpUrls.getLast(), viewData.managementIP) : WINDOWS_CONSOLE_CLIENT(viewData.managementIP);
          break;
        case 'Linux': viewData.newTabTootipMessage = 'Open In New Tab';
          viewData.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
          break;
        default: viewData.newTabTootipMessage = 'Open in new tab option is not available';
          break;
      }
    } else {
      viewData.newTabTootipMessage = 'Open in new tab option is not available';
    }
  }

  getConsoleAccessInput(device: HypervisorViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.HYPERVISOR, deviceType: DeviceMapping.HYPERVISOR, deviceId: device.deviceId,
      newTab: false, deviceName: device.name, managementIp: device.managementIP
    };
  }

  deleteMulitpleHypervisors(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/servers/bulk_delete`, { params: params });
  }

  updateMultipleSwitches(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/servers/bulk_update/`, obj, { params });
  }

}


export class HypervisorViewData {
  deviceId: string;
  name: string;
  deviceStatus: string;
  virtualizationType: string = 'N/A';
  os: string = 'N/A';
  cloud: string = 'N/A';
  hasOS: boolean = false;
  platformType: string;
  managementIP: string = 'N/A';
  popOverDetails: DevicePopoverData = new DevicePopoverData();
  isSameTabEnabled: boolean;
  sameTabWebAccessUrl: string;
  sameTabConsoleAccessUrl: string;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabWebAccessUrl: string;
  newTabConsoleAccessUrl: string;
  newTabTootipMessage: string;
  statsTooltipMessage: string;

  isESXIHypervisor: boolean;
  resetPasswordTooltip: string;
  monitoring: DeviceMonitoringType;
  tags: string[];

  cpuUsage: HypervisorUsageViewData;
  memoryUsage: HypervisorUsageViewData;
  storageUsage: HypervisorUsageViewData;

  isSelected: boolean;

  constructor() { };
}

export class HypervisorUsageViewData {
  capacityValue: number;
  capacityUnit: string;
  usedValue: number;
  usedUnit: string;
  availableValue: number;
  availableUnit: string;
  usedPercentageValue: number;
  availablePercentageValue: number;
  usedBarColor: string;
  constructor() { }
}