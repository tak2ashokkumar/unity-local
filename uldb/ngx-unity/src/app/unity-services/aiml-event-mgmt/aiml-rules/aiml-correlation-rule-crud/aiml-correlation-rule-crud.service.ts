import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { AIMLCorrelationRule, CorrelationRuleFields } from '../aiml-rules.type';
import { Observable, of } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AIOPS_CORRELATION_RULES, AIOPS_CORRELATION_RULE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { map } from 'rxjs/operators';
import { QueryBuilderClassNames, QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';

// Defaults below reproduce today's (legacy) correlation behavior when a rule
// is saved without the user touching these advanced controls.
export const METRIC_MATCH_MODE_DEFAULT = 'any';
export const COMPONENT_MATCH_MODE_DEFAULT = 'any';
export const TEMPORAL_POLICY_DEFAULT = 'within_window';
export const MIN_GROUP_SIZE_DEFAULT = 2;
export const REOPEN_WINDOW_DEFAULT = 0;
export const AUTO_RESOLVE_GRACE_PERIOD_DEFAULT = 0;
export const CONFLICT_STRATEGY_DEFAULT = 'existing_open_first';
export const EXPLAIN_DECISIONS_DEFAULT = false;

export const metricMatchModeOptions = [
  { value: 'any', label: 'Any Metric' },
  { value: 'same_metric', label: 'Same Metric' },
  { value: 'compatible_metric', label: 'Compatible Metric' },
];

export const componentMatchModeOptions = [
  { value: 'any', label: 'Any Component' },
  { value: 'same_affected_component', label: 'Same Affected Component' },
  { value: 'same_resource_component', label: 'Same Resource Component' },
];

export const temporalPolicyOptions = [
  { value: 'within_window', label: 'Within Window' },
  { value: 'burst', label: 'Burst' },
  { value: 'ordered', label: 'Ordered' },
];

export const conflictStrategyOptions = [
  { value: 'existing_open_first', label: 'Existing Open Condition First' },
  { value: 'strict_no_overlap', label: 'Strict No Overlap' },
  { value: 'highest_relevance', label: 'Highest Relevance' },
  { value: 'critical_safe', label: 'Critical Safe' },
];

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
            'specificity': [{ value: rule.specificity, disabled: readOnly }],
            'metric_match_mode': [{ value: rule.metric_match_mode || METRIC_MATCH_MODE_DEFAULT, disabled: readOnly }, [Validators.required]],
            'component_match_mode': [{ value: rule.component_match_mode || COMPONENT_MATCH_MODE_DEFAULT, disabled: readOnly }, [Validators.required]],
            'temporal_policy': [{ value: rule.temporal_policy || TEMPORAL_POLICY_DEFAULT, disabled: readOnly }, [Validators.required]],
            'topology_hops': [{ value: (rule.topology_hops !== null && rule.topology_hops !== undefined) ? rule.topology_hops : null, disabled: readOnly }, [Validators.min(1)]],
            'min_group_size': [{ value: (rule.min_group_size !== null && rule.min_group_size !== undefined) ? rule.min_group_size : MIN_GROUP_SIZE_DEFAULT, disabled: readOnly }, [Validators.required, Validators.min(2)]],
            'reopen_window': [{ value: (rule.reopen_window !== null && rule.reopen_window !== undefined) ? rule.reopen_window : REOPEN_WINDOW_DEFAULT, disabled: readOnly }, [Validators.min(0)]],
            'auto_resolve_grace_period': [{ value: (rule.auto_resolve_grace_period !== null && rule.auto_resolve_grace_period !== undefined) ? rule.auto_resolve_grace_period : AUTO_RESOLVE_GRACE_PERIOD_DEFAULT, disabled: readOnly }, [Validators.min(0)]],
            'conflict_strategy': [{ value: rule.conflict_strategy || CONFLICT_STRATEGY_DEFAULT, disabled: readOnly }, [Validators.required]],
            'storm_event_count_threshold': [{ value: (rule.storm_policy && rule.storm_policy.event_count_threshold !== null && rule.storm_policy.event_count_threshold !== undefined) ? rule.storm_policy.event_count_threshold : null, disabled: readOnly }, [Validators.min(0)]],
            'storm_burst_window_minutes': [{ value: (rule.storm_policy && rule.storm_policy.burst_window_minutes !== null && rule.storm_policy.burst_window_minutes !== undefined) ? rule.storm_policy.burst_window_minutes : null, disabled: readOnly }, [Validators.min(0)]],
            'explain_decisions': [{ value: rule.explain_decisions || EXPLAIN_DECISIONS_DEFAULT, disabled: readOnly }]
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
        'metric_match_mode': [METRIC_MATCH_MODE_DEFAULT, [Validators.required]],
        'component_match_mode': [COMPONENT_MATCH_MODE_DEFAULT, [Validators.required]],
        'temporal_policy': [TEMPORAL_POLICY_DEFAULT, [Validators.required]],
        'topology_hops': [null, [Validators.min(1)]],
        'min_group_size': [MIN_GROUP_SIZE_DEFAULT, [Validators.required, Validators.min(2)]],
        'reopen_window': [REOPEN_WINDOW_DEFAULT, [Validators.min(0)]],
        'auto_resolve_grace_period': [AUTO_RESOLVE_GRACE_PERIOD_DEFAULT, [Validators.min(0)]],
        'conflict_strategy': [CONFLICT_STRATEGY_DEFAULT, [Validators.required]],
        'storm_event_count_threshold': [null, [Validators.min(0)]],
        'storm_burst_window_minutes': [null, [Validators.min(0)]],
        'explain_decisions': [EXPLAIN_DECISIONS_DEFAULT],
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
      'filter_rule_meta': '',
      'metric_match_mode': '',
      'component_match_mode': '',
      'temporal_policy': '',
      'topology_hops': '',
      'min_group_size': '',
      'reopen_window': '',
      'auto_resolve_grace_period': '',
      'conflict_strategy': '',
      'storm_event_count_threshold': '',
      'storm_burst_window_minutes': ''
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
    'metric_match_mode': {
      'required': 'Metric match mode is required'
    },
    'component_match_mode': {
      'required': 'Component match mode is required'
    },
    'temporal_policy': {
      'required': 'Temporal policy is required'
    },
    'topology_hops': {
      'min': 'Topology hops must be a positive number'
    },
    'min_group_size': {
      'required': 'Minimum group size is required',
      'min': 'Minimum group size must be at least 2'
    },
    'reopen_window': {
      'min': 'Reopen window cannot be negative'
    },
    'auto_resolve_grace_period': {
      'min': 'Auto-resolve grace period cannot be negative'
    },
    'conflict_strategy': {
      'required': 'Conflict strategy is required'
    },
    'storm_event_count_threshold': {
      'min': 'Storm event count threshold cannot be negative'
    },
    'storm_burst_window_minutes': {
      'min': 'Burst window cannot be negative'
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

  // The "storm sensitivity override" and "burst window" inputs are flattened,
  // scalar form controls (storm_event_count_threshold / storm_burst_window_minutes)
  // that are not backend fields on their own; they are merged here into the
  // storm_policy JSON object expected by the API. Leaving both empty keeps
  // storm_policy null, reproducing legacy (pre-feature) behavior.
  private applyStormPolicy(rule: AIMLCorrelationRule) {
    const result: any = Object.assign({}, rule);
    const threshold = result.storm_event_count_threshold;
    const burstWindow = result.storm_burst_window_minutes;
    delete result.storm_event_count_threshold;
    delete result.storm_burst_window_minutes;

    const hasThreshold = threshold !== null && threshold !== undefined && threshold !== '';
    const hasBurstWindow = burstWindow !== null && burstWindow !== undefined && burstWindow !== '';

    if (hasThreshold || hasBurstWindow) {
      const stormPolicy: any = {};
      if (hasThreshold) {
        stormPolicy.event_count_threshold = threshold;
      }
      if (hasBurstWindow) {
        stormPolicy.burst_window_minutes = burstWindow;
      }
      result.storm_policy = stormPolicy;
    } else {
      result.storm_policy = null;
    }
    return result;
  }

  createRule(rule: AIMLCorrelationRule) {
    return this.http.post(AIOPS_CORRELATION_RULES(), this.applyStormPolicy(rule));
  }

  editRule(rule: AIMLCorrelationRule) {
    return this.http.put(AIOPS_CORRELATION_RULE_BY_ID(rule.uuid), this.applyStormPolicy(rule));
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
  'textual-similarity': 0.10,
  // Tag-based grouping is moderately specific: more specific than a coarse
  // same-host match but less specific than a same-dc grouping, so it sits
  // between same-host (0.30) and same-dc (0.50).
  'same-tag': 0.40,
  // The ML correlator's multi-factor matching is more specific than simple
  // same-dc/same-host grouping (it combines several signals) but still less
  // certain than direct topological adjacency, so it sits between same-dc
  // (0.50) and topology (0.90).
  'ml-correlator': 0.70
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
  {
    option: 'Tag',
    values: 'same-tag'
  },
  {
    option: 'ML Correlator',
    values: 'ml-correlator'
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