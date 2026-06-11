import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AIMLCorrelationRule } from 'src/app/shared/SharedEntityTypes/aiml-rules.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { QueryBuilderClassNames, QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';

@Injectable()
export class MtpAimlCorrelationRulesCrudService {

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
          if (Array.isArray(rule.value) && rule.value.length)
            value = `(${rule.value.map(this.valueToSQL).filter(this.isDefined).join(', ')})`;
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

  createRuleForm(ruleId?: any, readOnly?: boolean): Observable<FormGroup> {
    if (ruleId) {
      return this.http.get<AIMLCorrelationRule>(`/customer/mtp/correlation_rules/${ruleId}/`).pipe(
        map(rule => {
          let form = this.builder.group({
            'uuid': [rule.uuid, [Validators.required, NoWhitespaceValidator]],
            'name': [rule.name, [Validators.required, NoWhitespaceValidator]],
            'description': [{ value: rule.description, disabled: readOnly }],
            'correlator': [rule.correlator, [Validators.required, NoWhitespaceValidator]],
            'filter_rule_meta': [rule.filter_rule_meta],
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'filter_rule_meta': [null],
        'description': [{ value: '', disabled: readOnly }],
        'correlator': ['', [Validators.required, NoWhitespaceValidator]],
      }));
    }
  }

  resetRuleFormErrors() {
    return {
      'name': '',
      'conditions': '',
      'correlator': '',
      'similarity_rate': ''
    };
  }

  ruleFormValidationMessages = {
    'name': {
      'required': 'Rule name is required'
    },
    'correlator': {
      'required': 'Correlator is required'
    },
    'similarity_rate': {
      'required': 'Similarity Rate is required'
    },
  }

  private getCrudType(rule: AIMLCorrelationRule) {
    const conditions = rule.conditions;
    delete (rule.conditions);
    return Object.assign({}, rule, { filter_rule_meta: conditions });
  }

  createRule(rule: AIMLCorrelationRule) {
    return this.http.post(`/customer/mtp/correlation_rules/`, rule);
  }

  editRule(rule: AIMLCorrelationRule) {
    return this.http.put(`/customer/mtp/correlation_rules/${rule.uuid}/`, rule);
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
