import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EMPTY, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AppLevelService } from 'src/app/app-level.service';
import { GET_NETWORK_CONTROLLERS, MANAGE_NETWORK_CONTROLLER, UPDATE_NETWORK_CONTROLLER_TAGS, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DeviceProxy } from 'src/app/shared/SharedEntityTypes/device-common-utils.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NetworkControllersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private appService: AppLevelService) { }

  getNetworkControllers(criteria: SearchCriteria): Observable<PaginatedResult<NetworkControllerType>> {
    return this.tableService.getData<PaginatedResult<NetworkControllerType>>(GET_NETWORK_CONTROLLERS(), criteria);
  }

  convertToViewData(data: NetworkControllerType[]): NetworkControllerViewData[] {
    let viewData: NetworkControllerViewData[] = [];
    data.forEach(d => {
      let view: NetworkControllerViewData = new NetworkControllerViewData();
      view.name = d.name;
      view.controllerId = d.uuid;
      view.accountType = d.account_type;
      view.accountUrl = d.account_url;
      view.port = d.port;
      view.devicesCount = d.devices_count;
      view.tags = d.tags.filter(tg => tg);
      view.deviceStatus = this.utilSvc.getDeviceStatus(d.status);
      view.proxyUrl = d.proxy && d.proxy.backend_url ? d.proxy.backend_url : null;
      view.proxyTooltip = view.proxyUrl ? 'Manage In New Tab' : 'Not Configured';
      view.monitoring = d.monitoring;
      viewData.push(view);
    })
    return viewData;
  }

  getDeviceData(device: NetworkControllerViewData) {
    if (!device.monitoring.configured) {
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilSvc.getDeviceStatus('-2');
      }
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    let deviceType = this.getDeviceType(device.accountType);
    return this.http.get(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(deviceType, device.controllerId), { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilSvc.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'View Statistics';
          }
          return device;
        })
      );
  }

  createTagsForm(tags: string[]): FormGroup {
    return this.builder.group({
      'tags': [tags],
    });
  }

  resetTagsFormErrors() {
    return {
      'tags': ''
    };
  }

  tagsFormValidationMessages = {
    'tags': {
      'required': 'Tags are required'
    }
  }

  syncNow(controllerId: string, accountType: string) {
    return this.http.get<CeleryTask>(`/customer/${accountType}/accounts/${controllerId}/run_now/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  updateTags(data: { tags: string[] }, view: NetworkControllerViewData) {
    let mappedDeviceType = this.utilSvc.getDeviceMappingByDeviceType(view.accountType);
    return this.http.post(UPDATE_NETWORK_CONTROLLER_TAGS(mappedDeviceType, view.controllerId), data);
  }

  delete(view: NetworkControllerViewData) {
    let mappedDeviceType = this.utilSvc.getDeviceMappingByDeviceType(view.accountType);
    return this.http.delete(MANAGE_NETWORK_CONTROLLER(mappedDeviceType, view.controllerId));
  }

  getDeviceType(controllerType: string): DeviceMapping {
    switch (controllerType) {
      case ServerSideNetworkControllerTypeMapping.VIPTELA:
        return DeviceMapping.VIPTELA_ACCOUNT;
      case ServerSideNetworkControllerTypeMapping.MERAKI:
        return DeviceMapping.MERAKI_ACCOUNT;
      default: return;
    }
  }

  formatBreadCrumb(breadCrumbs: string[]) {
    let str = '';
    breadCrumbs.map((b, i) => {
      if (i != (breadCrumbs.length - 1)) {
        str = str + b + '->';
      } else if (i == (breadCrumbs.length - 1)) {
        str = str + b;
      }
    });
    return str;
  }
}

export class NetworkControllerViewData {
  constructor() { }
  name: string;
  controllerId: string;
  accountType: string;
  accountUrl: string;
  port: number;
  devicesCount: number;
  tags: string[];
  deviceStatus: string;
  proxyUrl: string;
  proxyTooltip: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
  syncInProgress: boolean = false;
}

export interface NetworkControllerType {
  uuid: string;
  name: string;
  // controller_type: string;
  account_type: string;
  account_url: string;
  port: number;
  devices_count: number;
  tags: string[];
  status: string;
  proxy: DeviceProxy;
  backend_url: string;
  monitoring: DeviceMonitoringType;
}

export const statusList: LabelValueType[] = [
  {
    'label': 'Up',
    'value': '1'
  },
  {
    'label': 'Down',
    'value': '0'
  },
  {
    'label': 'Unknown',
    'value': '-1'
  }
]

export enum ServerSideNetworkControllerTypeMapping {
  VIPTELA = 'viptela',
  MERAKI = 'meraki'
}