import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { AIMLCorrelationRule, CorrelationRuleFields } from '../aiml-rules.type';
import { Observable, of } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AIOPS_CORRELATION_RULES, AIOPS_CORRELATION_RULE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { map } from 'rxjs/operators';
import { QueryBuilderClassNames, QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';

@Injectable()
export class AimlCorrelationRuleCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  private valueToSQL(value) {
    switch (typeof value) {
      case 'string':
        return "'" + value + "'";
      case 'boolean':
        return value ? '1' : '0';
      case 'number':
        if (isFinite(value)) return value;
    }
  }

  private isDefined(value) {
    return value !== undefined;
  }

  basicRulesetToSQL(ruleset: RuleSet) {
    if (!ruleset) {
      return '';
    }
    return ruleset.rules.map((rule) => {
      if ((rule as RuleSet).rules) {
        return `(${this.basicRulesetToSQL(rule as RuleSet)})`;
      }
      rule = (rule as Rule);
      var column = rule.field,
        operator, value;

      switch (rule.operator) {
        case 'is null':
        case 'is not null':
          operator = rule.operator;
          value = '';
          break;
        case 'in':
        case 'not in':
          operator = rule.operator;
          if (Array.isArray(rule.value) && rule.value.length) {
            value = `(${rule.value.map(this.valueToSQL).filter(this.isDefined).join(', ')})`;
          }
          break;
        default:
          operator = rule.operator;
          value = this.valueToSQL(rule.value);
          break;
      }

      if (this.isDefined(column) && this.isDefined(operator)) {
        return `(${column} ${operator} ${value})`.trim();
      }
    }).filter(this.isDefined).join(` ${ruleset.condition} `);
  }

  calculateSpecificity(ruleset: RuleSet): number {
    if (!ruleset || ruleset.rules.length === 0) {
      return 10;
    }

    const calculateRuleWeight = (rule: Rule): number => {
      const field = rule.field;
      if (rule.operator == 'in') {
        if (rule.field == 'Device Name') {
          if (rule.value?.includes(',')) {
            const items = rule.value.split(',').map(item => item.trim()).filter(item => item !== '');
            return filterWeights[field] / items.length || 0;
          }
        } else {
          if (rule.field == 'Device Tag' && rule.value) {
            if (rule.value?.length > 0) {
              return filterWeights[field] / rule.value.length || 0;
            }
          } else {
            if (rule.value?.length > 0) {
              return filterWeights[field] / rule.value.length || 0;
            }
          }
        }
      }
      return filterWeights[field] || 0;
    };

    const calculateRulesetWeight = (ruleset: RuleSet): number => {
      const conditionWeights = ruleset.rules.map((rule) => {
        if ((rule as RuleSet).rules) {
          return calculateRulesetWeight(rule as RuleSet);
        } else {
          return calculateRuleWeight(rule as Rule);
        }
      });
      let conditionWeight = conditionWeights[0] || 1;
      for (let i = 1; i < conditionWeights.length; i++) {
        if (ruleset.condition === 'and') {
          conditionWeight *= conditionWeights[i] || 1;
        } else if (ruleset.condition === 'or') {
          conditionWeight += conditionWeights[i] || 0;
        }
      }
      return conditionWeight;
    };

    return calculateRulesetWeight(ruleset);
  }

  getRuleById(ruleId: any): Observable<AIMLCorrelationRule> {
    return this.http.get<AIMLCorrelationRule>(AIOPS_CORRELATION_RULE_BY_ID(ruleId));
  }

  createRuleForm(ruleId?: any, readOnly?: boolean): Observable<FormGroup> {
    if (ruleId) {
      return this.http.get<AIMLCorrelationRule>(AIOPS_CORRELATION_RULE_BY_ID(ruleId)).pipe(
        map(rule => {
          let form = this.builder.group({
            'uuid': [rule.uuid, [Validators.required, NoWhitespaceValidator]],
            'name': [rule.name, [Validators.required, NoWhitespaceValidator]],
            'filter_enabled': [rule.filter_enabled],
            'filter_rule_meta': [rule.filter_rule_meta],
            'description': [{ value: rule.description, disabled: readOnly }],
            'correlators': [rule.correlators, Validators.required],
            'time_window': [rule.time_window, [Validators.required, Validators.min(5), Validators.max(60)]],
            'priority': [rule.priority, [Validators.required, priorityValidator('update')]],
            'specificity': [{ value: rule.specificity, disabled: readOnly }]
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'filter_rule_meta': [null],
        'filter_enabled': [true],
        'description': [{ value: '', disabled: readOnly }],
        'correlators': [[], [Validators.required]],
        'time_window': ['', [Validators.required, Validators.min(5), Validators.max(60)]],
        'specificity': [''],
        'priority': ['', [Validators.required, priorityValidator('create')]],
      }));
    }
  }

  resetRuleFormErrors() {
    return {
      'name': '',
      'conditions': '',
      'similarity_rate': '',
      'correlators': '',
      'time_window': '',
      'priority': '',
      'filter_rule_meta': ''
    };
  }

  ruleFormValidationMessages = {
    'name': {
      'required': 'Rule name is required'
    },
    'similarity_rate': {
      'required': 'Similarity Rate is required'
    },
    'correlators': {
      'required': 'Correlator is required'
    },
    'time_window': {
      'required': 'Period is required',
      'min': 'Period must be at least 5 minutes',
      'max': 'Period cannot be more than 60 minutes'
    },
    'priority': {
      'required': 'Priority is required',
      'priorityInvalid': 'Priority must be 100 or more',
      'priorityInvalidUpdate': 'Priority must be 1 or more'
    },
  }

  convert(data: CorrelationRuleFields[]): QueryBuilderConfig {
    let fieldMeta: QueryBuilderConfig = { fields: {} }
    data.forEach(field => {
      fieldMeta.fields[field.name] = {
        name: field.display_name,
        type: field.choices.length ? 'category' : 'string',
        operators: field.choices.length ? ['is', 'in'] : ['is', 'contains'],
        defaultOperator: 'is',
        options: field.choices.length ? field.choices.map(choice => {
          return { name: choice[1], value: choice[0] }
        }) : [],
        defaultValue: field.choices.length ? field.choices[0][0] : '',
        value: field.name
      }
    });
    return fieldMeta;
  }

  private getCrudType(rule: AIMLCorrelationRule) {
    const conditions = rule.conditions;
    delete (rule.conditions);
    return Object.assign({}, rule, { filter_rule_meta: conditions });
  }

  createRule(rule: AIMLCorrelationRule) {
    return this.http.post(AIOPS_CORRELATION_RULES(), rule);
  }

  editRule(rule: AIMLCorrelationRule) {
    return this.http.put(AIOPS_CORRELATION_RULE_BY_ID(rule.uuid), rule);
  }

  getMaxPriority(): Observable<{ max_priority: number }> {
    return this.http.get<{ max_priority: number }>(`customer/aiops/correlation_rules/max-priority/`);
  }
}

export const queryBuilderConfig: QueryBuilderConfig = {
  fields: {
    'Event Source': {
      name: 'Event Source',
      type: 'category',
      operators: ['is', 'in'],
      defaultOperator: 'is',
      options: [
        { name: 'Unity', value: 'Unity' },
        { name: 'Nagios', value: 'Nagios' },
        { name: 'Azure', value: 'Azure' },
        { name: 'Zabbix', value: 'Zabbix' },
      ],
      defaultValue: 'Unity',
    },
    'Event Type': {
      name: 'Event Type',
      type: 'category',
      operators: ['is', 'in'],
      defaultOperator: 'is',
      options: [
        { name: 'Down', value: 'Down' },
        { name: 'Threshold', value: 'Threshold' },
      ],
      defaultValue: 'Down',
    },
    'Event Severity': {
      name: 'Event Severity',
      type: 'category',
      operators: ['is', 'in'],
      defaultOperator: 'is',
      options: [
        { name: 'Critical', value: 'Critical' },
        { name: 'Warning', value: 'Warning' },
        { name: 'Information', value: 'Information' },
      ],
      defaultValue: 'Critical',
    },
    'Event Category': {
      name: 'Event Category',
      type: 'category',
      operators: ['is', 'in'],
      defaultOperator: 'is',
      options: [
        { name: 'Cpu', value: 'Cpu' },
        { name: 'Fan', value: 'Fan' },
        { name: 'Interface', value: 'Interface' },
        { name: 'Memory', value: 'Memory' },
        { name: 'Node', value: 'Node' },
        { name: 'Power Supply', value: 'Power Supply' },
        { name: 'Storage', value: 'Storage' },
        { name: 'Temperature', value: 'Temperature' },
        { name: 'Voltage', value: 'Voltage' },
      ],
      defaultValue: 'Cpu',
    },
    'Event Description': {
      name: 'Event Description',
      type: 'string',
      operators: ['is', 'contains'],
      defaultOperator: 'is',
      validator: (rule) => {
        if (!rule.value) {
          rule.validationMessage = 'Event Description is required';
          return rule.validationMessage;
        }
        rule.validationMessage = '';
        return null;
      }
    },
    'Device Type': {
      name: 'Device Type',
      type: 'category',
      operators: ['is', 'in'],
      defaultOperator: 'is',
      options: [
        { name: 'Switch', value: 'Switch' },
        { name: 'Firewall', value: 'Firewall' },
        { name: 'Load Balancer', value: 'Load Balancer' },
        { name: 'Hypervisor', value: 'Hypervisor' },
        { name: 'Bare Metal', value: 'Bare Metal' },
        { name: 'Mac Device', value: 'Mac Device' },
        { name: 'VM', value: 'VM' },
        { name: 'Storage', value: 'Storage' },
        { name: 'PDU', value: 'PDU' },
        { name: 'Mobile Device', value: 'Mobile Device' },
        { name: 'Custom Device', value: 'Custom Device' },
      ],
      defaultValue: 'Switch',
    },
    'Device Name': {
      name: 'Device Name',
      type: 'string',
      operators: ['is', 'in'],
      defaultOperator: 'is',
      validator: (rule) => {
        if (!rule.value) {
          rule.validationMessage = 'Device Name is required';
          return rule.validationMessage;
        }
        rule.validationMessage = '';
        return null;
      }
    },
    'Device Tag': {
      name: 'Device Tag',
      type: 'tag',
      operators: ['in'],
      defaultOperator: 'in',
      validator: (rule) => {
        if (!rule.value) {
          rule.validationMessage = 'Device Tag is required';
          return rule.validationMessage;
        }
        rule.validationMessage = '';
        return null;
      }
    }
  }
}

const filterWeights = {
  'Event Source': 20,
  'Event Type': 30,
  'Event Severity': 15,
  'Event Category': 25,
  'Event Description': 50,
  'Device Type': 60,
  'Device Name': 80,
  'Device Tag': 40,
};

export const correlatorWeights = {
  'topology': 0.90,
  'same-host': 0.30,
  'same-dc': 0.50,
  'textual-similarity': 0.10
};

export const queryBuilderClassNames: QueryBuilderClassNames = {
  removeIcon: 'fa fa-minus',
  addIcon: 'fa fa-plus',
  arrowIcon: 'fa fa-chevron-right px-2',
  button: 'btn',
  buttonGroup: 'btn-group ml-2',
  rightAlign: '',
  switchRow: 'd-flex px-2',
  switchGroup: 'd-flex align-items-center',
  ruleSetswitchRow: 'd-flex px-0',
  row: 'row align-items-center',
  rule: 'border p-2 bg-light',
  ruleSet: 'py-2 px-0',
  invalidRuleSet: '',
  emptyWarning: 'text-danger mx-auto',
  operatorControl: 'form-control form-control-sm',
  operatorControlSize: 'col-auto pr-0',
  fieldControl: 'form-control form-control-sm',
  fieldControlSize: 'col-auto pr-0',
  entityControl: 'form-control form-control-sm',
  entityControlSize: 'col-auto pr-0',
  inputControl: 'form-control form-control-sm',
  inputControlSize: 'col-auto'
}

export const correlatorOptions = [
  {
    option: 'Topology',
    values: 'topology'
  },
  {
    option: 'Host',
    values: 'same-host'
  },
  {
    option: 'Datacenter',
    values: 'same-dc'
  },
  {
    option: 'Textual Similarity',
    values: 'textual-similarity'
  },
];


export function priorityValidator(state: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;

    if (state == 'create' && value < 100) {
      return { 'priorityInvalid': true };
    }

    if (state == 'update' && value < 1) {
      return { 'priorityInvalidUpdate': true };
    }
    return null;
  };
}