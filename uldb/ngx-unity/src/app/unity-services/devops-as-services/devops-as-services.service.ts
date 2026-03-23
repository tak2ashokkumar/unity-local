import { Injectable } from '@angular/core';
import { DeviceMapping, NoWhitespaceValidator, IPAddressValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { VM_CONSOLE_CLIENT, WINDOWS_CONSOLE_CLIENT, MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { DEVOPS_CONTROLLER, DELETE_DEVOPS_CONTROLLER, CREATE_DEVOPS_CONTROLLER } from 'src/app/shared/api-endpoint.const';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable()
export class DevopsAsServicesService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private user: UserInfoService) { }

  getControllers(criteria: SearchCriteria): Observable<PaginatedResult<DevopsController>> {
    return this.tableService.getData<PaginatedResult<DevopsController>>(DEVOPS_CONTROLLER(), criteria);
  }

  deleteController(controllerUUID: string) {
    return this.http.delete(DELETE_DEVOPS_CONTROLLER(controllerUUID));
  }

  createController(data: DevopsController) {
    return this.http.post(CREATE_DEVOPS_CONTROLLER(), data);
  }

  editController(controllerUUID: string, data: DevopsController) {
    return this.http.put(DELETE_DEVOPS_CONTROLLER(controllerUUID), data);
  }

  convertToViewData(data: DevopsController[]): DevopsControllerViewData[] {  
    let viewData: DevopsControllerViewData[] = [];
    data.map(s => {
      let a: DevopsControllerViewData = new DevopsControllerViewData();
      a.serverName = s.device_name
      a.platformType = s.platform_type
      a.managementIP = s.ip_address;
      a.os = s.os;
      a.port = s.port;
      a.deviceId = s.uuid;

      if (this.user.isManagementEnabled) {
        a.isSameTabEnabled = (s.platform_type.match('Linux')) ? true : false;
        switch (s.platform_type) {
          case 'Windows': a.sameTabTootipMessage = 'Open in same tab option is not available for windows machines';
            break;
          case 'Linux': a.sameTabTootipMessage = 'Open in same tab';
            break;
          default: a.sameTabTootipMessage = 'Open in same tab option is not available';
            break;
        }

        a.isNewTabEnabled = (s.ip_address && s.os && (s.platform_type.match('Windows') || s.platform_type.match('Linux'))) ? true : false;
        if (a.isNewTabEnabled && s.os) {
          switch (s.platform_type) {
            case 'Windows': a.newTabTootipMessage = 'Open In New Tab';
              a.newTabAccessUrl = WINDOWS_CONSOLE_CLIENT(a.managementIP);
              break;
            case 'Linux': a.newTabTootipMessage = 'Open In New Tab';
              a.newTabAccessUrl = VM_CONSOLE_CLIENT();
              break;
            default: a.newTabTootipMessage = 'Open in new tab option is not available';
              break;
          }
        } else {
          a.newTabTootipMessage = 'Open in new tab option is not available';
        }
      } else {
        a.isSameTabEnabled = false;
        a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.isNewTabEnabled = false;
        a.newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      }

      viewData.push(a);
    });
    return viewData;
  }

  getConsoleAccessInput(input: DevopsControllerViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.DEVOPS_CONTROLLER, deviceType: DeviceMapping.DEVOPS_CONTROLLER,
      deviceId: input.deviceId, port: input.port ? Number(input.port) : null, managementIp: input.managementIP, newTab: false,
      deviceName: input.serverName
    };
  }

  resetFormErrors() {
    return {
      'device_name': '',
      'platform_type': '',
      'os': '',
      'ip_address': '',
      'port': '',
    };
  }

  validationMessages = {
    'device_name': {
      'required': 'Server Name is required'
    },
    'platform_type': {
      'required': 'Platform Type is required'
    },
    'os': {
      'required': 'OS is required'
    },
    'ip_address': {
      'required': 'Management IP is required',
      'invalidIPAddress': 'Enter valid IP address'
    },
    'port': {
      'required': 'Port is required'
    }

  }

  createForm(controller?: DevopsControllerViewData): FormGroup {
    if (controller) {
      return this.builder.group({
        'device_name': [controller.serverName, [Validators.required, NoWhitespaceValidator]],
        'platform_type': [controller.platformType, [Validators.required, NoWhitespaceValidator]],
        'os': [controller.os, [Validators.required, NoWhitespaceValidator]],
        'ip_address': [controller.managementIP, [Validators.required, NoWhitespaceValidator, IPAddressValidator]],
        'port': [controller.port, [Validators.required, NoWhitespaceValidator]],
      });
    }
    else {
      return this.builder.group({
        'device_name': ['', [Validators.required, NoWhitespaceValidator]],
        'platform_type': ['Linux', [Validators.required, NoWhitespaceValidator]],
        'os': ['', [Validators.required, NoWhitespaceValidator]],
        'ip_address': ['', [Validators.required, NoWhitespaceValidator, IPAddressValidator]],
        'port': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }
}

export class DevopsControllerViewData {
  serverName: string;
  platformType: string;
  os: string;
  managementIP: string;
  port: string;
  deviceId: string;

  isSameTabEnabled: boolean;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabAccessUrl: string;
  newTabTootipMessage: string;

  constructor() { }
}