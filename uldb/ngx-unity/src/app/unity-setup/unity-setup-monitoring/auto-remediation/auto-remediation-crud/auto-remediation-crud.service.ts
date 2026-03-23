import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { devicesType, ZabbixAnomalyDetectionTriggerGraphItemsType } from '../../usm-anomaly-detection/usm-anomaly-detection-crud/usm-anomaly-detection-crud.type';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS, GET_CONFIGURED_DEVICES, ORCHESTRATION_GET_TASK, ZABBIX_TRIGGER_SCRIPTS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceTypesOptionsType } from 'src/app/shared/SharedEntityTypes/device-interface.type';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { TriggerData } from '../auto-remediation-crud/auto-remediation-crud.type';

@Injectable()
export class AutoRemediationCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getTriggers(selectedDevices: any[]): Observable<TriggerData> {
    return this.http.post<TriggerData>(`/ssr/auto_remediation/get_triggers/`, selectedDevices);
  }

  getDevices(deviceTypes: string[]): Observable<devicesType[]> {
    let params: HttpParams = new HttpParams();
    deviceTypes.map((deviceType) => params = params.append('device_type', deviceType));
    return this.http.get<devicesType[]>(GET_CONFIGURED_DEVICES(), { params: params });
  }

  getGraphItems(mappedDevicesObj: { [key: string]: string[] }): Observable<ZabbixAnomalyDetectionTriggerGraphItemsType[]> {
    return this.http.post<ZabbixAnomalyDetectionTriggerGraphItemsType[]>(`/customer/fast/devices_metrics/`, mappedDevicesObj);
  }
  getAutoRemediationDetails(autoRemediationId: string): Observable<any> {
    return this.http.get<any>(`ssr/auto_remediation/${autoRemediationId}/`);
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  }

  getIpAddress(ipAddress: string): Observable<any> {
    let param = new HttpParams().set('page_size', 0).set('ip_address', ipAddress);
    return this.http.get<any>(`customer/advanced_search/`, { params: param });
  }

  getTaskList(): Observable<any[]> {
    return this.http.get<any[]>(`/${ORCHESTRATION_GET_TASK()}?page_size=0`);
  }

  getSingleTaskList(uuid: string): Observable<any[]> {
    return this.http.get<any[]>(`rest/orchestration/tasks/${uuid}/`);
  }

  getScripts(): Observable<any[]> {
    return this.http.get<any[]>(`${ZABBIX_TRIGGER_SCRIPTS()}?page_size=0`);
  }

  getEventAttributes(): Observable<any[]> {
    return this.http.get<any[]>(`/ssr/auto_remediation/event_attributes/`);
  }

  createRemediation(rawValues: any, autoRemidiationId?: string): Observable<any> {
    if (autoRemidiationId) {
      return this.http.patch<any>(`ssr/auto_remediation/${autoRemidiationId}/`, rawValues);
    } else {
      return this.http.post<any>(`ssr/auto_remediation/`, rawValues);
    }
  }


  createAutoRemiForm(autoRemediationDetails: any): FormGroup {
    if (autoRemediationDetails) {
      let form = this.builder.group({
        'name': [autoRemediationDetails.name, [Validators.required, NoWhitespaceValidator]],
        'ip_addresses': ['', [ipListValidator()]],
        'device_types': [autoRemediationDetails.device_types ? autoRemediationDetails.device_types : [], [Validators.required]],
        'devices': [[], [Validators.required]],
        'trigger_ids': [autoRemediationDetails.trigger_ids ? autoRemediationDetails.trigger_ids : [], [Validators.required]],
        'task_type': [autoRemediationDetails.task_type, [Validators.required]],
        'cred_type': [autoRemediationDetails.cred_type, [Validators.required]],
        'enabled': [autoRemediationDetails.enabled],
        // 'parameter_mapping': [autoRemediationDetails.parameter_mapping],
      }, {
        validators: AtLeastOneInputHasValue(['ip_addresses', 'device_types'])
      });
      if (!autoRemediationDetails.device_types.length) {
        form.get('device_types').disable();
        form.get('devices').disable();
      } else {
        form.get('ip_addresses').disable();
      }
      if (autoRemediationDetails.host_mapping.mapping_type == "Event Attribute") {
        form.addControl('host_mapping', this.builder.group({
          mapping_type: ['Event Attribute', Validators.required],
          event_attribute: [autoRemediationDetails.host_mapping.event_attribute, [Validators.required]]
        }));
      } else if (autoRemediationDetails.host_mapping.mapping_type == "Regular Expression") {
        form.addControl('host_mapping', this.builder.group({
          mapping_type: [autoRemediationDetails.host_mapping.mapping_type, Validators.required],
          event_attribute: [autoRemediationDetails.host_mapping.event_attribute, [Validators.required]],
          expression: [autoRemediationDetails.host_mapping.expression, [Validators.required]]
        }));
      } else {
        form.addControl('host_mapping', this.builder.group({
          mapping_type: [autoRemediationDetails.host_mapping.mapping_type, Validators.required],
          expression: [autoRemediationDetails.host_mapping.expression, [Validators.required]]
        }));
      }
      if (autoRemediationDetails.cred_type == "Local") {
        form.addControl('credentials', new FormControl(autoRemediationDetails.credentials, [Validators.required]));
      } else {
        form.addControl('username', new FormControl(autoRemediationDetails.username, [Validators.required]));
        form.addControl('password', new FormControl('', [Validators.required]));
      }
      if (autoRemediationDetails.task_type == "Remediation Task") {
        form.addControl('remediation_task', new FormControl([], [Validators.required]));
      } else {
        form.addControl('script', new FormControl([], [Validators.required]));
      }
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required]],
        'ip_addresses': ['', [ipListValidator()]],
        'device_types': [[], [Validators.required]],
        'devices': [[], [Validators.required]],
        'trigger_ids': [{ value: [], disabled: true }, Validators.required],
        'task_type': ['Remediation Task', [Validators.required]],
        'remediation_task': [[], [Validators.required]],
        'cred_type': ['Local', Validators.required],
        'credentials': ['', [Validators.required]],
        'enabled': [true],
      }, {
        validators: AtLeastOneInputHasValue(['ip_addresses', 'device_types'])
      });
      form.addControl('host_mapping', this.builder.group({
        mapping_type: ['', Validators.required],
      }));
      return form;
    }
  }

  createHostMapping(param?: any): FormGroup {
    if (param) {
      let group = this.builder.group({
        mapping_type: [param.mapping_type, Validators.required],
        // event_attribute: [param.event_attribute, Validators.required],
      });
      if (param.mapping_type == 'Event Attribute') {
        group.addControl('event_attribute', new FormControl(param.event_attribute, [Validators.required]))
      }
      if (param.mapping_type == 'Regular Expression') {
        group.addControl('event_attribute', new FormControl(param.event_attribute, [Validators.required]))
        group.addControl('expression', new FormControl(param.expression, [Validators.required]))
      } else {
        group.addControl('expression', new FormControl(param.string, [Validators.required]))
      }
      return group;
    } else {
      let group = this.builder.group({
        mapping_type: ['', Validators.required],
      });
      return group;
    }
  }

  resetAutoRemiFormErrors() {
    return {
      'name': '',
      'ip_addresses': '',
      'device_types': '',
      'devices': '',
      'trigger_ids': '',
      'task_type': '',
      'remediation_task': '',
      'script': '',
      'cred_type': '',
      'credentials': '',
      'username': '',
      'password': '',
      'host_mapping': {
        'mapping_type': '',
        'event_attribute': '',
        'expression': ''
      }
    };
  }


  autoRemiFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'ip_addresses': {
      'invalidIps': 'ip Addresses are invalid',
    },
    // 'device_types': {
    //   'required': 'Device Type is required'
    // },
    // 'devices': {
    //   'required': 'Device is required'
    // },
    'trigger_ids': {
      'required': 'Triggers are required',
    },
    'task_type': {
      'required': 'Task Type is required'
    },
    'remediation_task': {
      'required': 'Remediation Task is required'
    },
    'script': {
      'required': 'Script is required'
    },
    'credentials': {
      'required': 'Credentials Selection is Required'
    },
    'host_mapping': {
      'mapping_type': {
        'required': 'Mapping type is required'
      },
      'event_attribute': {
        'required': 'Event attribute is required'
      },
      'expression': {
        'required': 'Expression is required'
      }
    },
    'parameter_mapping': {
      'mapping_type': {
        'required': 'Mapping Type is required'
      },
      'event_attribute': {
        'required': 'Event Attribute is required'
      },
      'expression': {
        'required': 'expression is required'
      }
    }
  };

  getParameterErrors() {
    return {
      'mapping_type': '',
      'event_attribute': '',
      'expression': '',
    }
  }


}

export function ipListValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || value.length == 0) {
      return null;
    }
    if (typeof value !== 'string') {
      return { invalidType: true };
    }
    const ips = value.split(',').map((ip: string) => ip.trim());
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const invalidIps = ips.filter(ip => !ipRegex.test(ip));
    return invalidIps.length > 0 ? { invalidIps: true } : null;
  };
}

export const AtLeastOneInputHasValue = (fields: Array<string>) => {
  return (group: FormGroup) => {
    const hasValue = fields.some(fieldName => {
      const control = group.get(fieldName);
      return control && control.value && (Array.isArray(control.value) ? control.value.length > 0 : true);
    });
    return hasValue ? null : { atLeastOneRequired: true };
  };
};

export const deviceTypesOptions: Array<DeviceTypesOptionsType> = [
  {
    label: 'Switch',
    value: 'switch'
  },
  {
    label: 'Firewall',
    value: 'firewall'
  },
  {
    label: 'Load Balancer',
    value: 'load_balancer'
  },
  {
    label: 'Hypervisor',
    value: 'hypervisor'
  },
  {
    label: 'BM Server',
    value: 'baremetal'
  },
  {
    label: 'Mac Device',
    value: 'mac_device'
  },
  {
    label: 'Storage',
    value: 'storage'
  },
  {
    label: 'Custom VM',
    value: 'virtual_machine'
  },
  {
    label: 'VMware VM',
    value: 'vmware'
  },
  {
    label: 'ESXI VM',
    value: 'esxi'
  },
  {
    label: 'Hyper-V VM',
    value: 'hyperv'
  },
  // {
  //   label: 'PDU',
  //   value: 'pdu'
  // },
  // {
  //   label: 'Cabinet',
  //   value: 'cabinet'
  // }
]

export const exampleJson = [
  {
    "type": "CharField",
    "required": false,
    "display_name": "device name",
    "name": "device_name",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "device type",
    "name": "device_type",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "ip address",
    "name": "ip_address",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "affected component",
    "name": "affected_component",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "affected component type",
    "name": "affected_component_type",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "affected component name",
    "name": "affected_component_name",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "environment",
    "name": "environment",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "application name",
    "name": "application_name",
    "choices": []
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "event metric",
    "name": "event_metric",
    "choices": []
  },
  {
    "type": "CharField",
    "required": true,
    "display_name": "event id",
    "name": "event_id",
    "choices": []
  },
  {
    "type": "PositiveIntegerField",
    "required": true,
    "display_name": "severity",
    "name": "severity",
    "choices": [
      [1, "Information"],
      [2, "Warning"],
      [3, "Critical"]
    ]
  },
  {
    "type": "PositiveIntegerField",
    "required": true,
    "display_name": "status",
    "name": "status",
    "choices": [
      [0, "Open"],
      [1, "Resolved"]
    ]
  },
  {
    "type": "CharField",
    "required": false,
    "display_name": "operational data",
    "name": "operational_data",
    "choices": []
  },
  {
    "type": "TextField",
    "required": false,
    "display_name": "description",
    "name": "description",
    "choices": []
  },
  {
    "type": "DateTimeField",
    "required": true,
    "display_name": "event datetime",
    "name": "event_datetime",
    "choices": []
  },
  {
    "type": "DateTimeField",
    "required": false,
    "display_name": "recovered datetime",
    "name": "recovered_datetime",
    "choices": []
  }
]
