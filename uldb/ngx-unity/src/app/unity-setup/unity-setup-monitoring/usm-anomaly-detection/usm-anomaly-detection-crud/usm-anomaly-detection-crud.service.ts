import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { GET_CONFIGURED_DEVICES } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceTypesOptionsType, ZabbixAnomalyDetectionTriggerGraphItemsType, ZabbixAnomalyDetectionTriggerRuleCRUDType, ZabbixAnomalyDetectionTriggerType, devicesType } from './usm-anomaly-detection-crud.type';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class UsmAnomalyDetectionCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getTriggerDetails(device: DeviceTabData, triggerId: string) {
    let params: HttpParams = new HttpParams();
    params = params.set('uuid', device.uuid).set('device_type', device.deviceType).set('trigger_id', triggerId);
    return this.http.get<ZabbixAnomalyDetectionTriggerType>(`/customer/anomaly_trigger`, { params: params });
  }

  getGraphItems(mappedDevicesObj: { [key: string]: string[] }): Observable<ZabbixAnomalyDetectionTriggerGraphItemsType[]> {
    return this.http.post<ZabbixAnomalyDetectionTriggerGraphItemsType[]>(`/customer/fast/devices_metrics/`, mappedDevicesObj);
  }

  getDevices(deviceTypes: string[]): Observable<devicesType[]> {
    let params: HttpParams = new HttpParams();
    deviceTypes.map((deviceType) => params = params.append('device_type', deviceType));
    return this.http.get<devicesType[]>(GET_CONFIGURED_DEVICES(), { params: params });
  }

  createTriggerForm(trgr: ZabbixAnomalyDetectionTriggerType, triggerId?: string): FormGroup {
    if (triggerId) {
      let form = this.builder.group({
        'name': [trgr.name, [Validators.required, NoWhitespaceValidator]],
        'device_types': [{ value: trgr.device_types, disabled: true }, [Validators.required]],
        'devices': [trgr.devices, [Validators.required]],
        'severity': [trgr.severity, [Validators.required, NoWhitespaceValidator]],
        'mode': [trgr.mode, [Validators.required, NoWhitespaceValidator]],
        'problem_expression': [{ value: trgr.expression, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'disabled': [trgr.disabled],
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'device_types': [[], [Validators.required]],
        'devices': [[], [Validators.required]],
        'severity': ['', [Validators.required, NoWhitespaceValidator]],
        'mode': [0, [Validators.required, NoWhitespaceValidator]],
        'problem_expression': [{ value: '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
      })
      return form;
    }
  }

  resetTriggerFormErrors() {
    return {
      'name': '',
      'device_types': '',
      'devices': '',
      'severity': '',
      'mode': '',
      'problem_expression': ''
    };
  }

  triggerFormValidationMessages = {
    'name': {
      'required': 'Trigger name is required'
    },
    'device_types': {
      'required': 'Device Type is required'
    },
    'devices': {
      'required': 'Device is required'
    },
    'severity': {
      'required': 'Severity is required'
    },
    'mode': {
      'required': 'Mode is required',
    },
    'problem_expression': {
      'required': 'Problem expression is required'
    }
  };

  createTriggerRulesForm(rule?: ZabbixAnomalyDetectionTriggerRuleCRUDType): FormGroup {
    if (rule) {
      return this.builder.group({
        'item_key': [rule ? rule.item_key : '', [Validators.required, NoWhitespaceValidator]],
        'function': [rule ? rule.function : ZABBIX_TRIGGER_FUNCTIONS[0], [Validators.required, NoWhitespaceValidator]],
        'operator': [rule ? rule.operator : ZABBIX_TRIGGER_OPERATORS[0], [Validators.required, NoWhitespaceValidator]],
        'value': [rule ? rule.value : '', [Validators.required, NoWhitespaceValidator]],
        'function_value': ['', [NoWhitespaceValidator, RxwebValidators.digit()]],
        'function_unit': ['', []],
        'detect_period_value': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.digit()]],
        'detect_period_unit': ['', []],
        'season_value': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.digit()]],
        'season_unit': ['', []],
        'deviation': ['', [NoWhitespaceValidator, RxwebValidators.digit()]]
      });
    } else {
      return this.builder.group({
        'item_key': ['', [Validators.required, NoWhitespaceValidator]],
        'function': [ZABBIX_TRIGGER_FUNCTIONS[0], [Validators.required, NoWhitespaceValidator]],
        'operator': [ZABBIX_TRIGGER_OPERATORS[0], [Validators.required, NoWhitespaceValidator]],
        'value': ['', [Validators.required, NoWhitespaceValidator]],
        'function_value': ['', [NoWhitespaceValidator, RxwebValidators.digit()]],
        'function_unit': ['now/h', []],
        'detect_period_value': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.digit()]],
        'detect_period_unit': ['h', []],
        'season_value': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.digit()]],
        'season_unit': ['h', []],
        'deviation': ['', [NoWhitespaceValidator, RxwebValidators.digit()]]
      });
    }
  };

  resetTriggerRulesFormErrors() {
    return {
      'item_key': '',
      'function_in': '',
      'function_value': '',
      'operator': '',
      'value': '',
      'detect_period_value': '',
      'season_value': '',
      'deviation': ''
    };
  }

  triggerRulesFormValidationMessages = {
    'item_key': {
      'required': 'Metric is required'
    },
    'function_value': {
      'required': 'Value is required',
      'digit': 'Value should be a number',
    },
    'operator': {
      'required': 'Operator is required',
    },
    'value': {
      'required': 'Value is required'
    },
    'detect_period_value': {
      'required': 'Detection Period value is required',
      'digit': 'Detection Period value should be a number',
    },
    'season_value': {
      'required': 'Season value is required',
      'digit': 'Season value should be a number',
    },
    'deviation': {
      'required': 'Deviation Value is required',
      'digit': 'Deviation Value should be a number',
    }
  };

  createTrigger(formData: any): Observable<ZabbixAnomalyDetectionTriggerType> {
    return this.http.post<ZabbixAnomalyDetectionTriggerType>(`/customer/anomaly_trigger/`, formData);
  }

  updateTrigger(device: DeviceTabData, formData: any, triggerId: string): Observable<ZabbixAnomalyDetectionTriggerType> {
    let params: HttpParams = new HttpParams();
    params = params.set('uuid', device.uuid).set('device_type', device.deviceType).set('trigger_id', triggerId);
    return this.http.put<ZabbixAnomalyDetectionTriggerType>(`/customer/anomaly_trigger/`, formData, { params: params });
  }

}

export class ZabbixTriggerFunction {
  name: string;
  key: string;
  dataType: string | string[];
  validatorFunction?: ValidatorFn;
  constructor() { }
}

export const ZABBIX_TRIGGER_FUNCTIONS: ZabbixTriggerFunction[] = [
  {
    'name': 'Anomaly Detection',
    'key': 'trendstl',
    'dataType': ['int', 'float']
  }
];

export class ZabbixTriggerOperator {
  name: string;
  key: string;
  constructor() { }
}

export const ZABBIX_TRIGGER_OPERATORS: ZabbixTriggerOperator[] = [
  {
    'name': 'Is equal to',
    'key': '=',
  },
  {
    'name': 'Not equal to',
    'key': '<>',
  },
  {
    'name': 'Greater than',
    'key': '>',
  },
  {
    'name': 'Less than',
    'key': '<',
  },
  {
    'name': 'Greater than or equal to',
    'key': '>=',
  },
  {
    'name': 'Less than or equal to',
    'key': '<=',
  }
]

export class ZabbixTriggerItemsViewData {
  id: string;
  name: string;
  key: string;
  valueType: string;
  auto_remediation: boolean;
  script: string;
  credential: string;
  functions: ZabbixTriggerFunction[] = [];
  constructor() { }
}

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

export const units: Array<LabelValueType> = [
  {
    label: 'Hours',
    value: 'h'
  },
  {
    label: 'Days',
    value: 'd'
  }
]