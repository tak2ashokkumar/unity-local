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
import { OtherDevice } from '../../entities/other-device.type';

@Injectable()
export class OtherdevicesCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userInfo: UserInfoService) { }

  getInstanceDetails(uuid: string): Observable<OtherDevice> {
    return this.http.get<OtherDevice>(`customer/customdevices/${uuid}/`);
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  getUrlsFormGroup(url: UrlsDataType) {
    let group = this.builder.group({
      'url': [url.url, [Validators.required, NoWhitespaceValidator]],
      'name': [url.name, [Validators.required, NoWhitespaceValidator]],
      'url_availabilty': [url.url_availabilty],
      'login_availability': [url.login_availability],
      'response_availability': [url.response_availability],
      'string_availabilty': [url.string_availabilty],
    })
    if (url.login_availability) {
      group.addControl('login_username', new FormControl(url.login_username, [Validators.required, NoWhitespaceValidator]));
      group.addControl('login_password', new FormControl(url.login_password, [Validators.required, NoWhitespaceValidator]));
    } else {
      group.removeControl('login_username');
      group.removeControl('login_password');
    }
    if (url.response_availability) {
      group.addControl('response_status', new FormControl(url.response_status, [Validators.required, NoWhitespaceValidator]));
    } else {
      group.removeControl('response_status');
    }
    if (url.string_availabilty) {
      group.addControl('string_pattern', new FormControl(url.string_pattern, [Validators.required, NoWhitespaceValidator]));
    } else {
      group.removeControl('string_pattern');
    }
    return group;
  }

  buildForm(d: OtherDevice): FormGroup {
    if (d) {
      let form = this.builder.group({
        'type': [d.type, [Validators.required]],
        'name': [d.name, [Validators.required, NoWhitespaceValidator]],
        'polling_interval_min': [d.polling_interval_min, [Validators.min(0), Validators.max(59)]],
        'polling_interval_sec': [d.polling_interval_sec, [Validators.min(0), Validators.max(59)]],
        'tags': [d.tags.filter(tag => tag)],
        'description': [d.description],
        'collector': this.builder.group({
          'uuid': [d.collector ? d.collector.uuid : '', Validators.required]
        }),
        'is_monitoring': [d.is_monitoring],
        'custom_attribute_data': [d.custom_attribute_data],
        // 'urls': data.urls && data.is_monitoring ? this.builder.array(data.urls.map(url => this.getUrlsFormGroup(url))) : [],
      })
      if (d.is_monitoring) {
        form.addControl('urls', this.builder.array(d.urls.map(url => this.getUrlsFormGroup(url))))
      }
      return form;
    } else {
      return this.builder.group({
        'type': ['URL', [Validators.required]],
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'tags': [[]],
        'polling_interval_min': [null, [Validators.min(0), Validators.max(59)]],
        'polling_interval_sec': [null, [Validators.min(0), Validators.max(59)]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'is_monitoring': [false],
        'collector': this.builder.group({
          'uuid': ['', [Validators.required]]
        })
        // 'urls': this.builder.array([this.buildUrls()]),
      })
    }
  }

  buildUrls() {
    let group = this.builder.group({
      'url': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'url_availabilty': [true],
      'login_availability': [false],
      'response_availability': [false],
      'string_availabilty': [false],
    })
    return group;
  }

  resetOtherDevicesFormErrors() {
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
      'urls': [this.getUrlFormErrors()],
    }
  }

  getUrlFormErrors() {
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

  otherDevicesFormValidationMessages = {
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
    'description': {
      'required': 'Description is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
    'urls': {
      'url': {
        'required': 'Url is required',
        'url': 'Url is invalid'
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

  add(data: OtherDeviceDataType) {
    return this.http.post<OtherDeviceDataType>(`/customer/customdevices/`, data);
  }

  updateDevice(d: OtherDeviceDataType, uuid: string) {
    return this.http.put(`/customer/customdevices/${uuid}/`, d);
  }

  deleteDevice(uuid: string) {
    return this.http.delete(`/customer/customdevices/${uuid}/`);
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