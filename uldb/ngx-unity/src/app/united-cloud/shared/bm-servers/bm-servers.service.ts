import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, WINDOWS_CONSOLE_VIA_AGENT } from 'src/app/app-constants';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { BLINK_SERVER, BMS_IPMI_DRAC_RESET_PASSWORD, DEVICE_DATA_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, DEVICE_POWER_STATUS_BY_DEVICE_TYPE, VALIDATE_POWER_TOGGLE_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { BMServer, BMServerPowerStatus } from '../entities/bm-server.type';
import { PowerToggleInput } from '../server-power-toggle/server-power-toggle.service';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Injectable()
export class BmServersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private user: UserInfoService,
    private utilService: AppUtilityService,
    private builder: FormBuilder) { }

  getBMServers(criteria: SearchCriteria): Observable<PaginatedResult<BMServer>> {
    return this.tableService.getData<PaginatedResult<BMServer>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), criteria);
  }

  getAllBMServers(criteria: SearchCriteria): Observable<BMServer[]> {
    return this.tableService.getData<BMServer[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), criteria);
  }

  getDeviceBulkEditFields(): Observable<BulkUpdateFieldType[]> {
    return this.http.get<BulkUpdateFieldType[]>(`/customer/device_editable_fields?device_type=bm_server`)
  }

  deleteMultipleBMServers(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuids', uuid));
    return this.http.get(`/customer/bm_servers/bulk_delete/`, { params: params });
  }

  updateMultipleBMServers(uuids: string[], obj: any) {
    let params: HttpParams = new HttpParams();
    uuids.forEach(uuid => params = params.append('uuids', uuid));
    return this.http.patch(`/customer/bm_servers/bulk_update/`, obj, { params });
  }

  converToViewData(servers: BMServer[]): BMServerViewData[] {
    let viewData: BMServerViewData[] = [];
    servers.map(d => {
      let a: BMServerViewData = new BMServerViewData();
      a.bmServerId = d.uuid;
      a.serverId = d.server.uuid;
      a.isSelected = false;
      a.name = d.server.name;
      a.cloud = d.server.private_cloud ? `${d.server.private_cloud.name}(${this.utilService.getCloudTypeByPlatformType(d.server.private_cloud.platform_type)})` : 'N/A';
      a.os = d.server.os ? d.server.os.full_name : 'N/A';
      a.monitoring = d.monitoring;
      a.tags = d.server.tags.filter(tg => tg);
      if (d.server.os) {
        a.hasOS = true;
        a.platformType = d.server.os.platform_type;
      }
      if (d.server.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(d.server.status);
      }
      a.managementIP = d.server.management_ip ? d.server.management_ip : 'N/A';
      a.rackType = d.bmc_type;
      a.userName = d.bm_controller ? d.bm_controller.username : null;
      a.bmcIP = d.bm_controller ? d.bm_controller.ip : null;

      a.isBlinkerEnabled = d.server.bm_enabled;
      a.blinkerTooltipMessage = 'Click here to blink the server in datacenter';

      a.statsUrl = d.bm_controller ? d.bm_controller.proxy_url : null;
      a.manufacturer = d.server.manufacturer ? d.server.manufacturer.name : 'N/A';
      a.cpuCount = d.server.num_cpus ? d.server.num_cpus : 'N/A';
      a.coreCount = d.server.num_cores ? d.server.num_cores : 'N/A';
      a.memory = d.server.memory_mb ? d.server.memory_mb.toString() : 'N/A';
      a.capacity = d.server.capacity_gb ? d.server.capacity_gb.toString() : 'N/A';
      a.redfish = d.server.redfish;
      this.setXtermAttributes(a);
      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: BMServerViewData) {
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
    const url = device.monitoring.observium ? DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, device.serverId) : ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, device.bmServerId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            device.popOverDetails.status = value.status;
            device.statsTooltipMessage = 'Bare Metal Server Statistics';
          }
          return device;
        })
      );
  }

  getPowerStatus(bmServerId: string): Observable<Map<string, BMServerPowerStatus>> {
    return this.http.get<BMServerPowerStatus>(DEVICE_POWER_STATUS_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, bmServerId), { headers: Handle404Header })
      .pipe(
        map((res: BMServerPowerStatus) => {
          if (res.power_status != null) {
            return new Map<string, BMServerPowerStatus>().set(bmServerId, res);
          }
          return new Map<string, BMServerPowerStatus>().set(bmServerId, null);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, BMServerPowerStatus>().set(bmServerId, null));
        })
      );
  }

  private setXtermAttributes(viewData: BMServerViewData) {
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

  getToggleInput(view: BMServerViewData): PowerToggleInput {
    return {
      confirmTitle: 'Bare Metal Server', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.bmServerId,
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.BARE_METAL_SERVER, userName: view.userName
    };
  }

  getConsoleAccessInput(device: BMServerViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.BARE_METAL_SERVER, deviceType: DeviceMapping.BARE_METAL_SERVER,
      deviceId: device.bmServerId, newTab: false, deviceName: device.name, managementIp: device.managementIP
    };
  }

  resetIPMIAuthenticationFormErrors(): any {
    let formErrors = {
      'username': '',
      'password': '',
    };
    return formErrors;
  }

  IPMIAuthenticationFormValidationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
  };

  buildIPMIAuthenticationForm(device: BMServerViewData): FormGroup {
    this.resetIPMIAuthenticationFormErrors();
    return this.builder.group({
      'username': new FormControl({ value: device.userName, disabled: true }, Validators.required),
      'password': ['', [Validators.required]],
    });
  }

  checkPassword(server: BMServerViewData, credentials: { 'username': string, 'password': string }) {
    return this.http.post(VALIDATE_POWER_TOGGLE_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, server.bmServerId), credentials);
  }

  blinkServer(server: BMServerViewData) {
    return this.http.post(BLINK_SERVER(server.bmServerId), {});
  }

  resetPasswordFormErrors(): any {
    let formErrors = {
      'username': '',
      'password': '',
      'confirm_password': ''
    };
    return formErrors;
  }

  resetPasswordFormValidationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'confirm_password': {
      'required': 'Confirm Password is required',
      'compare': 'Passwords must match'
    }
  };

  buildResetPasswordForm(device: BMServerViewData): FormGroup {
    this.resetIPMIAuthenticationFormErrors();
    return this.builder.group({
      'ip': [{ value: device.bmcIP, disabled: true }],
      'username': [{ value: device.userName, disabled: true }, [Validators.required]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'confirm_password': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.compare({ fieldName: 'password' })]],
      'bmc_type': [device.rackType],
      'id': [device.bmServerId]
    });
  };

  resetPassword(formData: any) {
    return this.http.post(BMS_IPMI_DRAC_RESET_PASSWORD(formData.id), formData);
  }
}
export class BMServerViewData {
  bmServerId: string;
  serverId: string;
  name: string;
  deviceStatus: string;
  os: string = 'N/A';
  cloud: string;
  hasOS: boolean = false;
  platformType: string;
  managementIP: string = 'N/A';
  rackType: string;
  userName: string;
  popOverDetails: DevicePopoverData = new DevicePopoverData();

  powerTooltipMessage: string;
  powerStatusOn: boolean;
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin' = 'fa-power-off';
  isPowerButtonEnabled: boolean;

  isBlinkerEnabled: boolean;
  blinkerTooltipMessage: string;
  isBlinking: boolean = false;

  statsUrl: string;
  bmStatsTooltipMessage: string;
  isBmStatsButtonEnabled: boolean;
  resetPasswordTooltipMessage: string;
  bmcIP: string;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabTootipMessage: string;
  newTabConsoleAccessUrl: string;
  statsTooltipMessage: string;

  manufacturer: string;
  cpuCount: number | 'N/A';
  coreCount: number | 'N/A';
  memory: string;
  capacity: string;
  monitoring: DeviceMonitoringType;
  tags: string[];
  isSelected: boolean;
  redfish: boolean;

  constructor() { }
}