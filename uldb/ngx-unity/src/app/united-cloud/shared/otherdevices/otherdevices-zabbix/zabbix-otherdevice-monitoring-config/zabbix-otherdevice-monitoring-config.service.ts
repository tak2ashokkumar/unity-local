import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ZabbixOtherdeviceMonitoringConfigService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userInfo: UserInfoService) { }

  getInstanceDetails(uuid: string) {
    return this.http.get<OtherDeviceDataType>(`customer/customdevices/${uuid}`);
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  updateStatus(uuid: string, status: boolean, data: any) {
    if (status)
      return this.http.patch<any>(`customer/customdevices/${uuid}/monitoring/`, data);
    else {
      return this.http.delete<any>(`customer/customdevices/${uuid}/monitoring/`, data);
    }
  }

  changeStatus(uuid: string, status: boolean, data: any) {
    if (status) {
      return this.http.put<any>(`customer/customdevices/${uuid}/monitoring/start/`, data);
    }
    else {
      return this.http.put<any>(`customer/customdevices/${uuid}/monitoring/stop/`, data);
    }
  }

  buildForm(uuid: string): Observable<FormGroup> {
    if (uuid) {
      return this.http.get<OtherDeviceDataType>(`customer/customdevices/${uuid}`).pipe(
        map(d => {
          let form = this.builder.group({
            'type': [d.type, [Validators.required]],
            'name': [d.name, [Validators.required]],
            'tags': [d.tags.filter(tag => tag)],
            'polling_interval_min': [d.polling_interval_min, [Validators.min(0), Validators.max(59)]],
            'polling_interval_sec': [d.polling_interval_sec, [Validators.min(0), Validators.max(59)]],
            'description': [d.description],
            'is_monitoring': [d.is_monitoring],
            'collector': this.builder.group({
              'uuid': [d.collector ? d.collector.uuid : '', Validators.required]
            })
            // 'urls': this.builder.array(d.urls.map(url => this.buildUrlForm(url))),
          });
          if (d.is_monitoring) {
            form.addControl('urls', this.builder.array(d.urls.map(url => this.buildUrlForm(url))))
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'type': ['', [Validators.required]],
        'name': ['', [Validators.required]],
        'tags': [''],
        'polling_interval': [''],
        'description': [''],
        'is_monitoring': [false],
        'collector': this.builder.group({
          'uuid': ['', [Validators.required]]
        })
        // 'urls': this.builder.array([this.buildUrlForm()]),
      }))
    }
  }

  buildUrlForm(obj?: UrlsDataType) {
    if (obj) {
      let group = this.builder.group({
        'url': [obj.url, [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
        'uuid': [obj.uuid],
        'name': [obj.name, [Validators.required]],
        'url_availabilty': [obj.url_availabilty],
        'login_availability': [obj.login_availability],
        'response_availability': [obj.response_availability],
        'string_availabilty': [obj.string_availabilty],
      })
      if (obj.login_availability) {
        group.addControl('login_username', new FormControl(obj.login_username, [Validators.required, NoWhitespaceValidator]));
        group.addControl('login_password', new FormControl(obj.login_password, [Validators.required, NoWhitespaceValidator]));
      } else {
        group.removeControl('login_username');
        group.removeControl('login_password');
      }
      if (obj.response_availability) {
        group.addControl('response_status', new FormControl(obj.response_status, [Validators.required, NoWhitespaceValidator]));
      } else {
        group.removeControl('response_status');
      }
      if (obj.string_availabilty) {
        group.addControl('string_pattern', new FormControl(obj.string_pattern, [Validators.required, NoWhitespaceValidator]));
      } else {
        group.removeControl('string_pattern');
      }
      return group;
    } else {
      return this.builder.group({
        'url': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
        'name': ['', [Validators.required]],
        'url_availabilty': [true],
        'login_availability': [false],
        'response_availability': [false],
        'string_availabilty': [false],
      })
    }
  }

  resetFormErrors() {
    return {
      'type': '',
      'name': '',
      'tag': '',
      'polling_interval_min': '',
      'polling_interval_sec': '',
      'description': '',
      'collector': {
        'uuid': ''
      },
      'is_monitoring': '',
      'urls': [this.resetUrlFormErrors()],
    }
  }

  resetUrlFormErrors() {
    return {
      'url': '',
      'name': '',
      'url_availabilty': '',
      'login_availability': '',
      'response_availability': '',
      'string_availabilty': '',
      'login_username': '',
      'login_password': '',
      'response_status': '',
      'string_pattern': '',
    }
  }

  formValidationMessages = {
    'type': {
      'required': 'Category is required'
    },
    'name': {
      'required': 'Name is required'
    },
    'polling_interval_min': {
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'polling_interval_sec': {
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
    'urls': {
      'url': {
        'required': 'Url is required'
      },
      'name': {
        'required': 'Name is required'
      },
      'login_username': {
        'required': 'Login User Name is required'
      },
      'login_password': {
        'required': 'Login Password is required'
      },
      'response_status': {
        'required': 'Response Code is required'
      },
      'string_pattern': {
        'required': 'String pattern is required'
      },
    },
  }

  createDevice(d: OtherDeviceDataType) {
    return this.http.post(``, d);
  }

  updateDevice(d: OtherDeviceDataType, uuid: string) {
    return this.http.put(`/customer/customdevices/${uuid}/`, d);
  }
}

export interface OtherDeviceDataType {
  id: number;
  tags: string[];
  uuid: string;
  name: string;
  polling_interval_min: number,
  polling_interval_sec: number,
  description: string;
  type: string;
  uptime_robot_id: string;
  customers: CustomerDataType[];
  urls: UrlsDataType[];
  snmp_community: string;
  is_monitoring: boolean;
  collector: CollectorType;
}

export interface CustomerDataType {
  url: string;
  id: number;
  name: string;
  storage: string;
  uuid: string;
}

export interface UrlsDataType {
  id: number;
  uuid: string;
  name: string;
  url: string;
  url_availabilty: boolean;
  login_availability: boolean;
  response_availability: boolean;
  string_availabilty: boolean;
  login_username: string;
  login_password: string;
  response_status: string;
  string_pattern: string;
  device: number;
}

export interface CollectorType {
  name: string;
  uuid: string;
}