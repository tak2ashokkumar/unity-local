import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { EMPTY, Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ContainerControllerType, CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { GET_CONTAINER_CONTROLLERS, ADD_KUBERNETES_CONTROLLER, DELETE_KUBERNETES_CONTROLLER, UPDATE_KUBERNETES_CONTROLLER, CHANGE_CONTROLLER_PASSWORD, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map } from 'rxjs/operators';

@Injectable()
export class ContainerControllersService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private utilService: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getControllers(criteria: SearchCriteria): Observable<ContainerControllerType[]> {
    return this.tableService.getData<ContainerControllerType[]>(GET_CONTAINER_CONTROLLERS(), criteria);
  }

  convertToViewdata(controllers: ContainerControllerType[]): ContainerControllerViewdata[] {
    let viewData: ContainerControllerViewdata[] = [];
    controllers.map(d => {
      let a: ContainerControllerViewdata = new ContainerControllerViewdata();
      a.controllerId = d.uuid;
      a.controllerType = d.controller_type;
      a.name = d.name;
      a.hostname = d.hostname;
      a.displayType = d.display_type;
      a.statsTooltipMessage = 'Statistics';
      a.monitoring = d.monitoring;
      if (d.status) {
        a.deviceStatus = this.utilService.getDeviceStatus(d.status);
      }
      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: ContainerControllerViewdata) {
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
    const url = ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.CONTAINER_CONTROLLER, device.controllerId);
    return this.http.get(url, { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilService.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'Controller Statistics';
          }
          return device;
        })
      );
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'hostname': '',

      'password': ''
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'hostname': {
      'required': 'Hostname is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    }
  };

  buildForm(urlParam: string, accountId: string, input?: ContainerControllerViewdata): FormGroup {
    let cloud_name: string = '';
    switch (urlParam) {
      case 'aws_id': cloud_name = 'aws_account'; break;
      case 'gcp_uuid': cloud_name = 'gcp_account'; break;
      case 'azure_id': cloud_name = 'azure_account'; break;
      case 'cloud_uuid': cloud_name = 'cloud'; break;
    }

    if (input) {
      let form: FormGroup = this.builder.group({
        'name': [input.name, [Validators.required, NoWhitespaceValidator]],
        'hostname': [input.hostname, [Validators.required, NoWhitespaceValidator]],
        'username': [input.username, [Validators.required, NoWhitespaceValidator]],
      });
      form.addControl(cloud_name, new FormControl(accountId))
      return form;
    } else {
      let form: FormGroup = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
      });
      form.addControl(cloud_name, new FormControl(accountId))
      return form;
    }
  }

  createKubernetesController(data: ContainerControllerCRUDdata): Observable<ContainerControllerType> {
    return this.http.post<ContainerControllerType>(ADD_KUBERNETES_CONTROLLER(), data);
  }

  updateController(controllerId: string, data: ContainerControllerCRUDdata): Observable<ContainerControllerType> {
    return this.http.put<ContainerControllerType>(UPDATE_KUBERNETES_CONTROLLER(controllerId), data);
  }

  deleteController(controllerId: string): Observable<string> {
    return this.http.delete<string>(DELETE_KUBERNETES_CONTROLLER(controllerId));
  }

  resetPasswordChangeFormErrors(): any {
    let formErrors = {
      'password': '',
      'confirm_password': '',
    };
    return formErrors;
  }

  passwordChangeValidationMessages = {
    'password': {
      'required': 'Password is required'
    },
    'confirm_password': {
      'required': 'Confirm Password is required',
      'compare': 'Passwords must match'
    },
  };

  buildPasswordChangeForm(): FormGroup {
    return this.builder.group({
      'password': [, [Validators.required, NoWhitespaceValidator]],
      'confirm_password': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.compare({ fieldName: 'password' })]],
    });
  }

  changePassword(view: ContainerControllerViewdata, data: { password: string, confirm_password: string }) {
    return this.http.post(CHANGE_CONTROLLER_PASSWORD(view.controllerId), data);
  }
}

export class ContainerControllerViewdata {
  constructor() { }
  controllerId: string;
  name: string;
  hostname: string;
  username: string;
  controller: string;
  controllerType: CONTROLLER_TYPE_MAPPING;
  displayType: string;
  statsTooltipMessage: string;
  deviceStatus: string;
  monitoring: DeviceMonitoringType;
}

interface ContainerControllerCRUDdata {
  name: string;
  hostname: string;
  username: string;
  password?: string;
  cloud?: string;
  aws_account?: string;
  gcp_account?: string;
  azure_account?: string;
}