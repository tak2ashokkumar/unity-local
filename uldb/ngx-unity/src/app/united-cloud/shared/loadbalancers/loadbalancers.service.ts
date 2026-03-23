import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DEVICE_DATA_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { LoadBalancer } from '../entities/loadbalancer.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class LoadbalancersService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getLoadBalancers(criteria: SearchCriteria): Observable<PaginatedResult<LoadBalancer>> {
    return this.tableService.getData<PaginatedResult<LoadBalancer>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER), criteria);
  }

  getAllLoadBalancers(criteria: SearchCriteria): Observable<LoadBalancer[]> {
    return this.tableService.getData<LoadBalancer[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER), criteria);
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=load_balancer`)
  }

  convertToViewData(data: LoadBalancer[]): LoadbalancerViewData[] {
    let viewData: LoadbalancerViewData[] = [];
    data.map(s => {
      let a: LoadbalancerViewData = new LoadbalancerViewData();
      a.deviceId = s.uuid;
      a.name = s.name;
      a.cloud = s.cloud.map(c => c.name);
      a.model = s.model ? s.model : 'N/A';
      a.type = s.manufacturer ? s.manufacturer : 'N/A';
      a.managementIp = s.management_ip ? s.management_ip : 'N/A';
      a.monitoring = s.monitoring;
      a.tags = s.tags.filter(tg => tg);
      a.applicableModulePermissions = s.applicable_module_permissions ? s.applicable_module_permissions : [];
      if (s.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(s.status);
      }

      if (s.is_shared) {
        a.isShared = true;
        a.editBtnTooltipMsg = 'Non Manageable Shared Device';
        a.deleteBtnTooltipMsg = 'Non Manageable Shared Device';
      } else {
        a.isShared = false;
        a.editBtnTooltipMsg = 'Edit';
        a.deleteBtnTooltipMsg = 'Delete';
      }

      if (this.user.isManagementEnabled) {
        if (s.is_shared) {
          a.sameTabTootipMessage = 'Non Manageable Shared Device';
          a.newTabTootipMessage = 'Non Manageable Shared Device';
          a.isSameTabEnabled = false;
          a.isNewTabEnabled = false;
        } else {
          a.isSameTabEnabled = ((s.proxy.same_tab && s.proxy.proxy_fqdn ? true : false) || (a.managementIp.match('N/A') ? false : true));
          a.sameTabWebAccessUrl = s.proxy.proxy_fqdn;
          a.sameTabConsoleAccessUrl = a.managementIp.match('N/A') ? null : a.managementIp;
          a.sameTabTootipMessage = a.isSameTabEnabled ? 'Manage In Same tab' : 'Device Not Configured';

          a.isNewTabEnabled = true;
          a.newTabWebAccessUrl = s.proxy.proxy_fqdn ? s.proxy.proxy_fqdn : null;
          a.newTabConsoleAccessUrl = a.managementIp.match('N/A') ? null : VM_CONSOLE_CLIENT();
          a.newTabTootipMessage = 'Manage In New Tab';
        }
      } else {
        a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.isSameTabEnabled = false;
        a.isNewTabEnabled = false;
      }

      viewData.push(a);
    });
    return viewData;
  }

  private setShared(device: LoadbalancerViewData) {
    device.isStatsButtonEnabled = false;
    device.statsTooltipMessage = 'Non Manageable Shared Device';
  }

  getDeviceData(device: LoadbalancerViewData) {
    if (!device.monitoring.configured) {
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      if (device.isShared) {
        this.setShared(device);
      } else {
        device.isStatsButtonEnabled = true;
        device.statsTooltipMessage = 'Configure Monitoring';
      }
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilService.getDeviceStatus('-2');
      }
      if (device.isShared) {
        this.setShared(device);
      } else {
        device.isStatsButtonEnabled = true;
        device.statsTooltipMessage = 'Enable monitoring';
      }
      return EMPTY;
    }

    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER, device.deviceId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER, device.deviceId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            if (device.isShared) {
              this.setShared(device);
            } else {
              device.isStatsButtonEnabled = true;
              device.statsTooltipMessage = 'Loadbalancer Statistics';
            }
          }
          return device;
        })
      );
  }

  getConsoleAccessInput(device: LoadbalancerViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.LOAD_BALANCER, deviceType: DeviceMapping.LOAD_BALANCER, deviceId: device.deviceId,
      newTab: false, deviceName: device.name, managementIp: device.managementIp
    };
  }

  deleteMultipleDevices(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/load_balancers/bulk_delete`, { params: params });
  }

  updateMultipleLoadBalancers(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/load_balancers/bulk_update/`, obj, { params });
  }
}

export class LoadbalancerViewData {
  deviceId: string;
  name: string;
  deviceStatus: string;
  model: string;
  type: string;
  cloud: string[];
  managementIp: string;

  editBtnTooltipMsg: string;
  deleteBtnTooltipMsg: string;
  isShared: boolean;

  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;

  isSameTabEnabled: boolean;
  sameTabWebAccessUrl: string;
  sameTabConsoleAccessUrl: string;
  sameTabTootipMessage: string;

  isNewTabEnabled: boolean;
  newTabWebAccessUrl: string;
  newTabConsoleAccessUrl: string;
  newTabTootipMessage: string;
  monitoring: DeviceMonitoringType;
  tags: string[];

  isSelected: boolean;
  applicableModulePermissions: any[];

  constructor() { }
}