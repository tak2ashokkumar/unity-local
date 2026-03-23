import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICE_DATA_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, PRIVATE_CLOUD_FAST_BY_DC_ID, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { Switch } from '../entities/switch.type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PDUCRUDCabinet } from '../../datacenter/entities/pdus-crud.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { PDUCRUDModel } from 'src/app/shared/pdu-crud/pdu-crud.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class SwitchesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService, private builder: FormBuilder) { }

  getSwitches(criteria: SearchCriteria): Observable<PaginatedResult<Switch>> {
    return this.tableService.getData<PaginatedResult<Switch>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.SWITCHES), criteria);
  }

  getAllSwitches(criteria: SearchCriteria): Observable<Switch[]> {
    return this.tableService.getData<Switch[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.SWITCHES), criteria);
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=switch`)
  }

  deleteMultipleSwitches(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/switches/bulk_delete/`, { params: params });
  }

  updateMultipleSwitches(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/switches/bulk_update/`, obj, { params });
  }


  convertToViewData(data: Switch[]): SwitchViewData[] {
    let viewData: SwitchViewData[] = [];
    data.map(s => {
      let a: SwitchViewData = new SwitchViewData();
      a.deviceId = s.uuid;
      a.name = s.name;
      a.cloud = s.cloud.map(c => c.name);
      a.isSelected = false;
      a.model = s.model ? s.model : 'N/A';
      a.type = s.manufacturer ? s.manufacturer : 'N/A';
      a.managementIp = s.management_ip ? s.management_ip : 'N/A';
      a.monitoring = s.monitoring;
      a.tags = s.tags.filter(tg => tg);
      a.redfish = s.redfish;
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
          a.sameTabTootipMessage = a.isSameTabEnabled ? 'Manage In Same Tab' : 'Device Not Configured';

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

  private setShared(device: SwitchViewData) {
    device.isStatsButtonEnabled = false;
    device.statsTooltipMessage = 'Non Manageable Shared Device';
  }

  getDeviceData(device: SwitchViewData) {
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

    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.SWITCHES, device.deviceId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.SWITCHES, device.deviceId);
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
              device.statsTooltipMessage = 'Switch Statistics';
            }
          }
          return device;
        })
      );
  }

  getConsoleAccessInput(device: SwitchViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.SWITCHES, deviceType: DeviceMapping.SWITCHES, deviceId: device.deviceId,
      newTab: false, deviceName: device.name, managementIp: device.managementIp
    };
  }

  buildForm(): FormGroup {
    return this.builder.group({
      edits: this.builder.array([
        this.builder.group({
          field: ['', [Validators.required]],
          // edit_value: ['', [Validators.required]]
        })
      ]),
    });
  }

  resetFormErrors() {
    return {
      'edits': [this.getEditFormErrors()]
    };
  }

  getEditFormErrors() {
    return {
      'field': '',
      'edit_value': '',
    }
  }
  validationMessages = {
    'edits': {
      'field': {
        'required': 'Field selection is required',
        'dependency': 'This field depends on another field. Please select the required field first.'
      },
      'edit_value': {
        'required': 'Edit Value is required'
      },
    }
  }

  // downloadCSV(deviceType:string, uuids?: string[]) {
  //   let params: HttpParams = new HttpParams();
  //   uuids?.map(uuid => params = params.append('uuids', uuid));
  //   if (deviceType) {
  //     params = params.append('device_type', deviceType);
  //   }
  //   console.log("downloadCSV ss, params", params)
  //   return this.http.get<{ file_path: string }>(`/customer/onboard_excel_data/download_bulk_upload_file/`, { params: params });
  // }

  // uploadFile<T>(file: File, deviceType:string, key: string) {
  //   const formData = new FormData();
  //   formData.append(key, file, file.name);
  //   console.log("uploadFile ss, ", file, deviceType, key)
  //   return this.http.post(`/customer/onboard_excel_data/upload_bulk_update/`, formData);
  // }

}

export class SwitchViewData {
  deviceId: string;
  name: string;
  deviceStatus: string;
  model: string;
  type: string;
  cloud: string[];
  managementIp: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();

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
  redfish: boolean;

  applicableModulePermissions: any[];

  constructor() { }
}