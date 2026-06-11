import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MonitoringGraphItems, ZabbixTriggerRuleCRUDType, ZabbixTriggerType } from 'src/app/shared/SharedEntityTypes/triggers.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MonitoringTemplates } from '../monitoring-template.service';

@Injectable()
export class TriggerCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private user: UserInfoService) { }

  getGraphItems(templateId: string, componentId: string): Observable<MonitoringGraphItems[]> {
    if (componentId) {
      return this.http.get<MonitoringGraphItems[]>(`/customer/mtp/item-prototypes/?template_id=${templateId}&search=${componentId}&page_size=0`);
    } else {
      return this.http.get<MonitoringGraphItems[]>(`customer/mtp/metrics/?template_id=${templateId}&page_size=0`);
    }
  }

  getAllTemplates(): Observable<MonitoringGraphItems[]> {
    return this.http.get<MonitoringGraphItems[]>(`customer/mtp/template-manage/?page_size=0`);
  }

  // getDropdownData(templateId: string, componentId: string): Observable<{ items: MonitoringGraphItems[]}> {
  //   return forkJoin({
  //     items: this.getGraphItems(templateId, componentId).pipe(catchError(error => of(undefined))),
  //   });
  // }

  getDropdownData(templateId: string, componentId: string): Observable<{ items: MonitoringGraphItems[], templates: MonitoringTemplates[] }> {
    return forkJoin({
      items: this.getGraphItems(templateId, componentId).pipe(catchError(error => of(undefined))),
      templates: this.getAllTemplates().pipe(catchError(error => of(undefined))),
    });
  }

  convertToItemViewData(items: MonitoringGraphItems[]): ZabbixTriggerItemsViewData[] {
    let itemViewData: ZabbixTriggerItemsViewData[] = [];
    items.map(item => {
      let i: ZabbixTriggerItemsViewData = new ZabbixTriggerItemsViewData();
      i.id = item.item_id.toString();
      i.key = item.item_key;
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
            case 'str': f.validatorFunction = RxwebValidators.alpha(); break;
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
      'trigger_name': '',
      'severity': '',
      'problem_expression': '',
    };
  }

  triggerFormValidationMessages = {
    'trigger_name': {
      'required': 'Trigger name is required'
    },
    'severity': {
      'required': 'Severity is required'
    },
    'problem_expression': {
      'required': 'Problem expression is required'
    },
  };

  createTriggerForm(triggerId?: string, componentId?: string, template?: MonitoringTemplates): Observable<FormGroup> {
    if (triggerId) {
      let url = '';
      if (componentId) {
        url = `/customer/mtp/template-manage/detail_prototype_trigger/?trigger_id=${triggerId}`;
      } else {
        url = `/customer/mtp/template-manage/trigger/?trigger_id=${triggerId}`;
      }
      return this.http.get<ZabbixTriggerType>(url).pipe(
        map(trgr => {
          let form = this.builder.group({
            'template_name': [template ? template.template_name : '', [Validators.required]],
            'trigger_name': [trgr.name, [Validators.required, NoWhitespaceValidator]],
            'severity': [trgr.severity, [Validators.required, NoWhitespaceValidator]],
            'problem_expression': [{ value: trgr.expression, disabled: true }, [Validators.required, NoWhitespaceValidator]],
            'disabled': [trgr.disabled],
            'default': ['last']
          });
          return form;
        }));
    } else {
      let form = this.builder.group({
        'template_name': [template ? template.template_name : '', [Validators.required]],
        'trigger_name': ['', [Validators.required, NoWhitespaceValidator]],
        'severity': ['', [Validators.required, NoWhitespaceValidator]],
        'problem_expression': [{ value: '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'default': ['last']
      })
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
      'required': 'Value is required',
      'digit': 'Value should be a number',
      'alpha': 'Value should be a string',
      'pattern': 'Value should be a number'
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
        'function': [rule ? rule.function : '', [Validators.required, NoWhitespaceValidator]],
        'operator': [rule ? rule.operator : '', [Validators.required, NoWhitespaceValidator]],
        'value': [rule ? rule.value : '', [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({
        'item_key': ['', [Validators.required, NoWhitespaceValidator]],
        'function': ['', [Validators.required, NoWhitespaceValidator]],
        'operator': ['', [Validators.required, NoWhitespaceValidator]],
        'value': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }

  createTrigger(componentId: string, formData: any): Observable<ZabbixTriggerType> {
    if (componentId) {
      return this.http.post<ZabbixTriggerType>(`/customer/mtp/template-manage/create_prototype_trigger/`, formData);
    } else {
      return this.http.post<ZabbixTriggerType>(`/customer/mtp/template-manage/create_trigger/`, formData);
    }
  }

  updateTrigger(triggerId: string, componentId: string, formData: any) {
    if (componentId) {
      return this.http.put<ZabbixTriggerType>(`/customer/mtp/template-manage/update_prototype_trigger/?trigger_id=${triggerId}`, formData);
    } else {
      return this.http.put<ZabbixTriggerType>(`/customer/mtp/template-manage/update_trigger/?trigger_id=${triggerId}`, formData);
    }
  }

  enableTrigger(triggerId: string, componentId: string,) {
    if (componentId) {
      return this.http.put<any>(`customer/mtp/template-manage/prototype_trigger_status/?trigger_id=${triggerId}`, { 'status': 'enabled' });
    } else {
      return this.http.put<any>(`customer/mtp/template-manage/trigger_status/?trigger_id=${triggerId}`, { 'status': 'enabled' });
    }
  }

  disableTrigger(triggerId: string, componentId: string,) {
    if (componentId) {
      return this.http.put<any>(`customer/mtp/template-manage/prototype_trigger_status/?trigger_id=${triggerId}`, { 'status': 'disabled' });
    } else {
      return this.http.put<any>(`customer/mtp/template-manage/trigger_status/?trigger_id=${triggerId}`, { 'status': 'disabled' });
    }
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
