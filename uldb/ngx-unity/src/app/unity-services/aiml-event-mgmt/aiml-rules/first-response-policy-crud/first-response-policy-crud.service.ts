import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FirstResponsePolicy } from '../first-response-policy.type';
import { Observable, of } from 'rxjs';
import { AIOPS_SUPPRESSION_RULE, AIOPS_SUPPRESSION_RULE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { map } from 'rxjs/operators';
import { QueryBuilderClassNames, QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import moment from 'moment';
import { CorrelationRuleFields } from '../aiml-rules.type';

@Injectable()
export class FirstResponsePolicyCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private utilService: AppUtilityService) { }

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

  private getHours(value : string){
    return value.split(':')[0];
  }

  private getMintues(value : string){
    return value.split(':')[1];
  }

  createPolicyForm(policyId?: any, readOnly?: boolean): Observable<FormGroup> {
    if (policyId) {
      return this.http.get<FirstResponsePolicy>(AIOPS_SUPPRESSION_RULE_BY_ID(policyId)).pipe(
        map(policy => {
          let form = this.builder.group({
            'uuid': [policy.uuid, [Validators.required, NoWhitespaceValidator]],
            'name': [{ value: policy.name, disabled: readOnly }, [Validators.required, NoWhitespaceValidator]],
            'filter_enabled': [policy.filter_rule_meta ? true : false, [Validators.required]],
            'filter_rule_meta': [policy.filter_rule_meta],
            'suppress_time_type': [policy.suppress_time_type, [Validators.required, NoWhitespaceValidator]],
            'next_hr': [policy.suppress_hours ? this.getHours(policy.suppress_hours) : ''],
            'next_min': [policy.suppress_hours ? this.getMintues(policy.suppress_hours) : ''],            
            'suppress_hours':[policy.suppress_hours],
            'start_datetime': [policy.start_datetime ? moment(policy.start_datetime) : null],
            'end_date_status':[null],
            'end_datetime': [policy.end_datetime ? moment(policy.end_datetime) : null],
          });
          if (policy.suppress_time_type == 'next') {
            form.get('next_hr').setValidators([Validators.required, NoWhitespaceValidator]);            
            form.get('next_min').setValidators([Validators.required, NoWhitespaceValidator]);
            form.get('next_hr').updateValueAndValidity();
            form.get('next_min').updateValueAndValidity();
          }
          if (policy.suppress_time_type == 'custom') {
            form.get('start_datetime').setValidators([Validators.required, NoWhitespaceValidator]);            
            form.get('start_datetime').updateValueAndValidity();
            if(policy.start_datetime && !policy.end_datetime){
              form.get('end_date_status').setValue('never');              
              form.get('end_datetime').disable();
            }
            if(policy.end_datetime){
              form.get('end_date_status').setValue('on');
              form.get('end_datetime').enable();
              form.get('end_datetime').setValidators([Validators.required, NoWhitespaceValidator]);              
              form.get('end_datetime').updateValueAndValidity();
              form.setValidators(this.utilService.dateRangeValidator('start_datetime', 'end_datetime'));
              form.updateValueAndValidity();
            }
            form.get('end_date_status').updateValueAndValidity();
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'filter_enabled': [false, [Validators.required]],
        'filter_rule_meta': [null],
        'suppress_time_type': ['always', [Validators.required, NoWhitespaceValidator]],
        'next_hr': [null],
        'next_min': [null],
        'suppress_hours':[null],
        'start_datetime': [null],
        'end_date_status':[null],
        'end_datetime': [null],
      }));
    }
  }
    
  resetPolicyFormErrors() {
    return {
      'name': '',
      'filter_enabled':'',
      'suppress_hours':'',
      'next_hr':'',
      'next_min':'',
      'start_datetime':'',
      'end_datetime':'',
      'fromAfterTo':''
    };
  }

  formValidationMessages = {
    'name': {
      'required': 'Policy name is required'
    },
    'next_hr': {
      'required': 'hours is required'
    },
    'next_min': {
      'required': 'minutes is required'
    },
    'suppress_hours': {
      'required': 'Next hours is required'
    },
    'start_datetime': {
      'required': 'Start date is required'
    },
    'end_datetime': {
      'required': 'End date is required'
    },
    'attribute': {
      'required': 'Attribute is required'
    },
    'operator': {
      'required': 'Operator is required'
    },
    'value': {
      'required': 'Value is required'
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

  createPolicy(policy: FirstResponsePolicy) {
    return this.http.post(AIOPS_SUPPRESSION_RULE(), policy);
  }

  editPolicy(policy: FirstResponsePolicy) {
    return this.http.put(AIOPS_SUPPRESSION_RULE_BY_ID(policy.uuid), policy);
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
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Event Description is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
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
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Device Name is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
        return null;
      }
    },
    'Device Tag': {
      name: 'Device Tag',
      type: 'tag',
      operators: ['in'],
      defaultOperator: 'in',
      validator: (policy) => {
        if (!policy.value) {
          policy.validationMessage = 'Device Tag is required';
          return policy.validationMessage;
        }
        policy.validationMessage = '';
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