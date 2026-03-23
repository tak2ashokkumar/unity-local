import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AIOPS_SUPPRESSION_RULE, AIOPS_SUPPRESSION_RULE_BY_ID } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AIMLSuppressionRule, AIMLSuppressionRuleCondition } from '../aiml-rules.type';

@Injectable()
export class AimlSuppressionRuleCrudService {
  conditionDropdownData: SuppressionConditionDropdown[] = suppressionConditionDropdownData;

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private getFormType(rule: AIMLSuppressionRule) {
    let conditions: AIMLSuppressionRuleCondition[] = [];
    for (let i = 0; i < rule.filter_rule_meta.length; i++) {
      if (i % 2 == 0) {
        conditions.push(rule.filter_rule_meta[i]);
      }
    }
    delete (rule.filter_rule_meta);
    return Object.assign({}, rule, { conditions: conditions });
  }

  private getConditionsFormGroup(condition: AIMLSuppressionRuleCondition) {
    let group = this.builder.group({
      'attribute': [condition.attribute, [Validators.required]],
      'operator': [condition.operator, [Validators.required]],
      'value': [condition.value, [Validators.required]],
    });
    if (condition.attribute) {
      let operators = this.conditionDropdownData.find(cd => cd.key == condition.attribute).operators;
      let valOptions = this.conditionDropdownData.find(cd => cd.key == condition.attribute).valueField.options;
      if (operators) {
        group.addControl('operatorOptions', new FormControl(operators));
      } else {
        group.addControl('operatorOptions', new FormControl([]));
      }

      if (valOptions) {
        group.addControl('valueOptions', new FormControl(valOptions));
      } else {
        group.addControl('valueOptions', new FormControl([]));
      }
      if (condition.operator) {
        let operators = this.conditionDropdownData.find(cd => cd.key == condition.attribute).operators;
        let valType = operators.find(opr => opr.operator == condition.operator).valueType;
        if (valType) {
          group.addControl('valueType', new FormControl(valType));
        }
      }
    }
    if (condition.expression) {
      group.addControl('expression', new FormControl(condition.expression, [Validators.required]));
    }
    return group;
  }

  createRuleForm(ruleId?: any, readOnly?: boolean): Observable<FormGroup> {
    if (ruleId) {
      return this.http.get<AIMLSuppressionRule>(AIOPS_SUPPRESSION_RULE_BY_ID(ruleId)).pipe(
        map(rule => {
          let formRule = this.getFormType(rule);
          let form = this.builder.group({
            'uuid': [formRule.uuid, [Validators.required, NoWhitespaceValidator]],
            'name': [{ value: formRule.name, disabled: readOnly }, [Validators.required, NoWhitespaceValidator]],
            'conditions': this.builder.array(formRule.conditions.map(rule => this.getConditionsFormGroup(rule))),
            'description': [{ value: formRule.description, disabled: readOnly }],
            // 'timeline': [{ value: rule.timeline, disabled: readOnly }],
          });
          // if (rule.timeline) {
          //   form.addControl('start_date', new FormControl([{ value: rule.start_date ? moment(rule.start_date) : '', disabled: readOnly }, [Validators.required]]));
          //   form.addControl('end_date', new FormControl([rule.end_date ? moment(rule.end_date) : '', [Validators.required]]));
          //   form.setValidators(this.utilService.dateRangeValidator('start_date', 'end_date'));
          // }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'conditions': this.builder.array([this.newCondition()]),
        'description': [{ value: '', disabled: readOnly }],
        // 'timeline': [false],
      }));
    }
  }

  newCondition(): FormGroup {
    let group = this.builder.group({
      'attribute': ['', [Validators.required]],
      'operator': ['', [Validators.required]],
      'operatorOptions': [[]],
      'value': ['', [Validators.required]],
      'valueType': ['select'],
      'valueOptions': [[]]
    });
    return group;
  }

  resetRuleFormErrors() {
    return {
      'name': '',
      'start_date': '',
      'end_date': '',
      'fromAfterTo': '',
      'conditions': [this.getConditionFormErrors()]
    };
  }

  getConditionFormErrors() {
    return {
      'attribute': '',
      'operator': '',
      'value': '',
      'expression': '',
    }
  }

  ruleFormValidationMessages = {
    'name': {
      'required': 'Rule name is required'
    },
    'start_date': {
      'required': 'Start date is required'
    },
    'end_date': {
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
    'expression': {
      'required': 'Link expression is required'
    },
  }

  private getCrudType(rule: AIMLSuppressionRule) {
    let conditions: AIMLSuppressionRuleCondition[] = [];
    for (let i = 0; i < rule.conditions.length; i++) {
      delete (rule.conditions[i]['operatorOptions']);
      delete (rule.conditions[i]['valueType']);
      delete (rule.conditions[i]['valueOptions']);
      conditions.push(rule.conditions[i]);
      if (rule.conditions[i].expression) {
        let a: AIMLSuppressionRuleCondition = {};
        a.expression = rule.conditions[i].expression;
        conditions.push(a);
      } else {
        break;
      }
    }
    delete (rule.conditions);
    return Object.assign({}, rule, { filter_rule_meta: conditions });
  }

  createRule(rule: AIMLSuppressionRule) {
    return this.http.post(AIOPS_SUPPRESSION_RULE(), this.getCrudType(rule));
  }

  editRule(rule: AIMLSuppressionRule) {
    return this.http.put(AIOPS_SUPPRESSION_RULE_BY_ID(rule.uuid), this.getCrudType(rule));
  }
}

export class SuppressionConditionDropdown {
  attribute: string;
  key: string;
  operators: SuppressionConditionOperatorDropdown[];
  valueField: SuppressionConditionValueField;
}

export class SuppressionConditionOperatorDropdown {
  operator: string;
  valueType: string;
}

export class SuppressionConditionValueField {
  type: string;
  options?: string[];
}

export const suppressionConditionDropdownData = [
  {
    'attribute': 'Name',
    'key': 'Name',
    'operators': [
      {
        'operator': 'is',
        'valueType': 'single-text'
      },
      {
        'operator': 'contains',
        'valueType': 'multi-text'
      },
    ],
    'valueField': {
      'type': 'text',
    }
  },
  // {
  //   'attribute': 'IP',
  //   'key': 'IP',
  //   'operators': [
  //     {
  //       'operator': 'is',
  //       'valueType': 'single-text'
  //     },
  //     {
  //       'operator': 'contains',
  //       'valueType': 'multi-text'
  //     },
  //   ],
  //   'valueField': {
  //     'type': 'text',
  //   }
  // },
  {
    'attribute': 'Description',
    'key': 'Description',
    'operators': [
      {
        'operator': 'is',
        'valueType': 'single-text'
      },
      {
        'operator': 'contains',
        'valueType': 'multi-text'
      },
    ],
    'valueField': {
      'type': 'text',
    }
  },
  {
    'attribute': 'Source',
    'key': 'Source',
    'operators': [
      {
        'operator': 'is',
        'valueType': 'select'
      },
      {
        'operator': 'in',
        'valueType': 'multi-select'
      },
    ],
    'valueField': {
      'type': 'select',
      'options': [
        'Unity'
      ]
    },
  },
  {
    'attribute': 'Severity',
    'key': 'Severity',
    'operators': [
      {
        'operator': 'is',
        'valueType': 'select'
      },
      {
        'operator': 'in',
        'valueType': 'multi-select'
      },
    ],
    'valueField': {
      'type': 'select',
      'options': [
        'Critical', 'Warning', 'Information',
      ]
    },
  },
  {
    'attribute': 'Category',
    'key': 'Category',
    'operators': [
      {
        'operator': 'is',
        'valueType': 'select'
      },
      {
        'operator': 'in',
        'valueType': 'multi-select'
      },
    ],
    'valueField': {
      'type': 'select',
      'options': [
        'Cpu',
        'Fan',
        'Interface',
        'Memory',
        'Node',
        'Power Supply',
        'Storage',
        'Temperature',
        'Voltage'
      ]
    },
  },
]
