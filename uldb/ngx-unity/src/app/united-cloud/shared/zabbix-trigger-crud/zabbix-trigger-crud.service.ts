import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DISABLE_TRIGGER, ENABLE_TRIGGER, GET_CREDENTIALS, GET_SCRIPT, TRIGGERS_BY_DEVICE_TYPE, ZABBIX_DEVICE_GRAPH_ITEMS, ZABBIX_TRIGGER_SCRIPTS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { SwitchZabbixMonitoringGraphItems } from '../switches/switches-zabbix/switch-zabbix-monitoring.type';
import { ZabbixTriggerType } from '../zabbix-triggers/zabbix-triggers.type';
import { ZabbixTriggerRuleCRUDType } from './zabbix-trigger-crud.type';
import { ZabbixTriggerScriptViewdata } from '../zabbix-trigger-scripts/zabbix-trigger-scripts.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable()
export class ZabbixTriggerCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private user: UserInfoService) { }

  getGraphItems(device: DeviceTabData): Observable<SwitchZabbixMonitoringGraphItems[]> {
    return this.http.get<SwitchZabbixMonitoringGraphItems[]>(ZABBIX_DEVICE_GRAPH_ITEMS(device.deviceType, device.uuid));
  }

  getScripts(device: DeviceTabData): Observable<ZabbixTriggerScriptViewdata[]> {
    let params: HttpParams = new HttpParams().set('page_size', '0');
    switch (device.deviceType) {
      case DeviceMapping.BARE_METAL_SERVER:
        params = params.append('device', 'Bare Metal Servers').append('ssr_os', device.ssr_os);
        break;
      case DeviceMapping.HYPERVISOR:
        params = params.append('device', 'Hypervisors').append('ssr_os', device.ssr_os);
        break;
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
      case DeviceMapping.VCLOUD:
      case DeviceMapping.HYPER_V:
      case DeviceMapping.CUSTOM_VIRTUAL_MACHINE:
      case DeviceMapping.G3_KVM:
        params = params.append('device', 'Virtual Machines').append('ssr_os', device.ssr_os);
        break;
    }
    return this.http.get<ZabbixTriggerScriptViewdata[]>(ZABBIX_TRIGGER_SCRIPTS(), { params: params });
  }

  getCredentails(device: DeviceTabData): Observable<DeviceDiscoveryCredentials[]> {
    return this.http.get<DeviceDiscoveryCredentials[]>(GET_CREDENTIALS(), { params: new HttpParams().set('page_size', '0') });
  }

  getDropdownData(device: DeviceTabData) {
    return forkJoin({
      graphItems: this.getGraphItems(device),
      scripts: this.getScripts(device),
      credentials: this.getCredentails(device)
    })
  }

  convertToItemViewData(items: SwitchZabbixMonitoringGraphItems[]): ZabbixTriggerItemsViewData[] {
    let itemViewData: ZabbixTriggerItemsViewData[] = [];
    items.map(item => {
      let i: ZabbixTriggerItemsViewData = new ZabbixTriggerItemsViewData();
      i.id = item.item_id.toString();
      i.key = item.key;
      i.name = item.name;
      i.valueType = item.value_type;

      let functions: ZabbixTriggerFunction[] = [];
      ZABBIX_TRIGGER_FUNCTIONS.map(func => {
        let f: ZabbixTriggerFunction = new ZabbixTriggerFunction();
        if (!item.value_type || func.dataType == 'all' || func.dataType == item.value_type || func.dataType.includes(item.value_type)) {
          f.key = func.key;
          f.name = func.name;
          f.dataType = item.value_type;
          switch (item.value_type) {
            case 'int': f.validatorFunction = RxwebValidators.digit(); break;
            case 'float': f.validatorFunction = Validators.pattern(/^[.\d]+$/); break;
            case 'str': f.validatorFunction = RxwebValidators.alpha();; break;
            case 'default': f.validatorFunction = RxwebValidators.alphaNumeric();
          }
          functions.push(f);
        }
      })
      i.functions = functions;
      itemViewData.push(i);
    })
    return itemViewData;
  }

  resetTriggerFormErrors() {
    return {
      'name': '',
      'severity': '',
      'mode': '',
      'problem_expression': '',
      'auto_remediation': '',
      'script': '',
      'credential': '',
    };
  }

  triggerFormValidationMessages = {
    'name': {
      'required': 'Trigger name is required'
    },
    'severity': {
      'required': 'Severity is required'
    },
    'mode': {
      'required': 'Mode is required',
    },
    'problem_expression': {
      'required': 'Problem expression is required'
    },
    'script': {
      'required': 'Script is required'
    },
    'credential': {
      'required': 'Credential is required'
    }
  };

  createTriggerForm(device: DeviceTabData, triggerId?: string): Observable<FormGroup> {
    if (triggerId) {
      return this.http.get<ZabbixTriggerType>(TRIGGERS_BY_DEVICE_TYPE(device.deviceType, device.uuid, triggerId)).pipe(
        map(trgr => {
          let form = this.builder.group({
            'name': [trgr.name, [Validators.required, NoWhitespaceValidator]],
            'severity': [trgr.severity, [Validators.required, NoWhitespaceValidator]],
            'mode': [trgr.mode, [Validators.required, NoWhitespaceValidator]],
            'problem_expression': [{ value: trgr.expression, disabled: true }, [Validators.required, NoWhitespaceValidator]],
            'disabled': [trgr.disabled],
          });
          if (this.user.isAIMLEnabled) {
            if (trgr.auto_remediation) {
              if (this.user.isAutoRemediationEnabled) {
                form.addControl('auto_remediation', new FormControl(trgr.auto_remediation));
                form.addControl('script', new FormControl(trgr.script ? trgr.script : { value: '', disabled: true }));
                form.addControl('credential', new FormControl(trgr.credential ? trgr.credential : { value: '', disabled: true }));
              } else {
                form.addControl('auto_remediation', new FormControl({ value: trgr.auto_remediation, disabled: true }));
                form.addControl('script', new FormControl({ value: trgr.script, disabled: true }));
                form.addControl('credential', new FormControl({ value: trgr.credential, disabled: true }));
              }
            } else {
              if (this.user.isAutoRemediationEnabled) {
                form.addControl('auto_remediation', new FormControl(false));
                form.addControl('script', new FormControl({ value: '', disabled: true }));
                form.addControl('credential', new FormControl({ value: '', disabled: true }));
              }
            }
          }
          return form;
        }));
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'severity': ['', [Validators.required, NoWhitespaceValidator]],
        'mode': [0, [Validators.required, NoWhitespaceValidator]],
        'problem_expression': [{ value: '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
      })
      if (this.user.isAIMLEnabled && this.user.isAutoRemediationEnabled) {
        form.addControl('auto_remediation', new FormControl(false));
        form.addControl('script', new FormControl({ value: '', disabled: true }));
        form.addControl('credential', new FormControl({ value: '', disabled: true }));
      }
      return of(form);
    }
  }

  resetTriggerRulesFormErrors() {
    return {
      'item_key': '',
      'function': '',
      'function_in': '',
      'min_value': '',
      'max_value': '',
      'pattern': '',
      'function_value': '',
      'operator': '',
      'value': '',
      'detect_period': '',
      'season': '',
      'deviation': '',
    };
  }

  triggerRulesFormValidationMessages = {
    'item_key': {
      'required': 'Item is required'
    },
    'function': {
      'required': 'Function is required'
    },
    'function_in': {
      'required': 'Value is required',
      'digit': 'Value should be a number',
    },
    'pattern': {
      'required': 'Pattern is required',
      'digit': 'Value should be a number',
      'alpha': 'Value should be a string',
      'pattern': 'Value should be a number'
    },
    'min_value': {
      'required': 'Minimun value is required',
      'pattern': 'Value should be a number'
    },
    'max_value': {
      'required': 'Maximum value is required',
      'pattern': 'Value should be a number'
    },
    'function_value': {
      'required': 'Value is required',
      'digit': 'Value should be a number',
      'alpha': 'Value should be a string',
      'pattern': 'Value should be a number'
    },
    'operator': {
      'required': 'Operator is required',
    },
    'value': {
      'required': 'Value is required'
    },
    'detect_period': {
      'required': 'Detection Period is required'
    },
    'season': {
      'required': 'Value is required'
    },
    'deviation': {
      'required': 'Value is required'
    }
  };

  createTriggerRulesForm(rule?: ZabbixTriggerRuleCRUDType): FormGroup {
    if (rule) {
      return this.builder.group({
        'item_key': [rule ? rule.item_key : '', [Validators.required, NoWhitespaceValidator]],
        'function': [rule ? rule.function : ZABBIX_TRIGGER_FUNCTIONS[0], [Validators.required, NoWhitespaceValidator]],
        'operator': [rule ? rule.operator : ZABBIX_TRIGGER_OPERATORS[0], [Validators.required, NoWhitespaceValidator]],
        'value': [rule ? rule.value : '', [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({
        'item_key': ['', [Validators.required, NoWhitespaceValidator]],
        'function': [ZABBIX_TRIGGER_FUNCTIONS[0], [Validators.required, NoWhitespaceValidator]],
        'operator': [ZABBIX_TRIGGER_OPERATORS[0], [Validators.required, NoWhitespaceValidator]],
        'value': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }

  createTrigger(device: DeviceTabData, formData: any): Observable<ZabbixTriggerType> {
    return this.http.post<ZabbixTriggerType>(TRIGGERS_BY_DEVICE_TYPE(device.deviceType, device.uuid), formData);
  }

  updateTrigger(device: DeviceTabData, formData: any, triggerId: string) {
    return this.http.patch<ZabbixTriggerType>(TRIGGERS_BY_DEVICE_TYPE(device.deviceType, device.uuid, triggerId), formData);
  }

  enableTrigger(device: DeviceTabData, triggerId: string) {
    return this.http.post<ZabbixTriggerType>(ENABLE_TRIGGER(device.deviceType, device.uuid, triggerId), {});
  }

  disableTrigger(device: DeviceTabData, triggerId: string) {
    return this.http.post<ZabbixTriggerType>(DISABLE_TRIGGER(device.deviceType, device.uuid, triggerId), {});
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
    'name': 'Last Value',
    'key': 'last',
    'dataType': 'all'
  },
  {
    'name': 'String Length',
    'key': 'length',
    'dataType': 'str'
  },
  {
    'name': 'Average Value',
    'key': 'avg',
    'dataType': ['int', 'float']
  },
  {
    'name': 'Maximum Value',
    'key': 'max',
    'dataType': ['int', 'float']
  },
  {
    'name': 'Minimum Value',
    'key': 'min',
    'dataType': ['int', 'float']
  },
  {
    'name': 'Sum',
    'key': 'sum',
    'dataType': ['int', 'float']
  },
  {
    'name': 'No Data',
    'key': 'nodata',
    'dataType': 'all'
  },
  {
    'name': 'Absolute Changes',
    'key': 'abs',
    'dataType': 'all'
  },
  {
    'name': 'Change',
    'key': 'change',
    'dataType': 'all'
  },
  {
    'name': 'Anomaly Detection',
    'key': 'trendstl',
    'dataType': ['int', 'float']
  },
  {
    'name': 'In',
    'key': 'in',
    'dataType': 'all'
  },
  {
    'name': 'Between',
    'key': 'between',
    'dataType': ['int', 'float']
  },
  {
    'name': 'Find',
    'key': 'find',
    'dataType': 'all'
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
