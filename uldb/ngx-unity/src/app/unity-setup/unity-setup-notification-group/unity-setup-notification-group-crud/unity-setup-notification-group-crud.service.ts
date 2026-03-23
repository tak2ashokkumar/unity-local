import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CREATE_NOTIFICATION_GROUP, DELETE_NOTIFICATION_GROUP, GET_ALL_DEVICES_TAGS, GET_ALL_NOTIFICATION_GROUP, GET_NOTIFICATION_GROUP, LIST_USER, ORCHESTRATION_GET_TASK, TOGGLE_ALL_NOTIFICATION_GROUP, TOGGLE_NOTIFICATION_GROUP, UPDATE_NOTIFICATION_GROUP } from 'src/app/shared/api-endpoint.const';
import { EmailValidator, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { QueryBuilderClassNames, QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { CorrelationRuleFields } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.type';
import { AlertTypeListDataType, DevicesListDataType, TriggersListDataType, UnitySetupNotificationGroupType } from '../unity-setup-notification-group.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { OrchestrationTaskDataType } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-task.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { WorkflowType } from 'src/app/unity-services/orchestration/orchestration-workflows/orchestration-workflows.type';

@Injectable()
export class UnitySetupNotificationGroupCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }


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

  addUserName(users: UnitySetupUser[]): UnitySetupUser[] {
    users.map(user => {
      user['full_name'] = `${user.first_name} ${user.last_name}(${user.email})`;
    })
    return users;
  }

  getNotificationGroupDetails(uuid: string) {
    return this.http.get<UnitySetupNotificationGroupType>(GET_NOTIFICATION_GROUP(uuid));
  }

  getDevicesList(deviceTypes: string[], isLifeCycleRelatedAlertTypeSelected: boolean): Observable<DevicesListDataType[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('page_size', 0);
    deviceTypes?.map(device => params = params.append('device_type', device));
    if (isLifeCycleRelatedAlertTypeSelected) {
      params = params.append('monitoring_devices', 'False');
    }
    return this.http.get<DevicesListDataType[]>('/customer/mtp/devices_list/', { params: params });
  }

  getTriggersList(devices: DevicesListDataType[]): Observable<TriggersListDataType[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('page_size', 0);
    devices?.map(device => params = params.append('devices_uuid', device.uuid));
    return this.http.get<TriggersListDataType[]>('/customer/mtp/triggers_list/', { params: params })
  }

  getUserList(): Observable<UnitySetupUser[]> {
    return this.http.get<UnitySetupUser[]>(`${LIST_USER()}?page_size=0`)
      .pipe(map((res) => this.addUserName(res)));
  }

  getTags() {
    return this.http.get<{ tag_name: string }[]>(GET_ALL_DEVICES_TAGS())
      .pipe(map(tags => tags.filter(tag => tag.tag_name).map(tag => tag.tag_name)));
  }

  createForm(groupId?: any): Observable<FormGroup> {
    if (groupId) {
      return this.http.get<UnitySetupNotificationGroupType>(GET_NOTIFICATION_GROUP(groupId)).pipe(
        map(data => {
          let form = this.builder.group({
            'uuid': [data.uuid, [Validators.required, NoWhitespaceValidator]],
            'group_name': [data.group_name, [Validators.required, NoWhitespaceValidator]],
            'mode': [[data.mode], [Validators.required]],
            // 'alert_type': [data.alert_type, [Validators.required]],
            'filter_type': [data.filter_type, [Validators.required]],
            'is_enabled': [data.is_enabled],
            'module': [data.module, [Validators.required]]
          });
          let md = data.mode;
          // if (md.includes('email') || md.includes('sms')) {
          if (md == 'email' || md == 'sms') {
            form.addControl('users', new FormControl(data.users, [Validators.required, EmailValidator]));
          }
          // if (md.includes('ms_teams')) {
          if (md == 'ms_teams') {
            form.addControl('webhook_url', new FormControl(data.webhook_url, [Validators.required, NoWhitespaceValidator]));
          }
          // if (data.alert_type?.includes('end_of_support') || data.alert_type?.includes('end_of_life')) {
          //   form.addControl('notify', new FormControl(data.notify, [Validators.required, Validators.min(1), Validators.max(999)]));
          // }
          if (data.module === 'deprecation') {
            form.addControl('alert_type', new FormControl(data?.alert_type, [Validators.required]));
            form.addControl('notify', new FormControl(data.notify, [Validators.required, Validators.min(1), Validators.max(999)]));
            if (data.filter_type === 'custom') {
              form.addControl('custom_filter_meta', this.getCustomFormGroup('deprecation', data.custom_filter_meta));
            }
          }
          let ft = data.filter_type;
          if (ft == 'custom' && data.module === 'aiml') {
            form.addControl('custom_filter_meta', this.getCustomFormGroup('aiml', data.custom_filter_meta, true));
          }
          if (ft == 'filters') {
            form.addControl('filter_rule_meta', new FormControl(data.filter_rule_meta, [Validators.required]));
            form.addControl('description', new FormControl({ value: data.description, disabled: true }));
          }

          if (data.module === 'aiml') {
            form.addControl('alert_type', new FormControl(data?.alert_type, [Validators.required]));
          }

          if (data.module === 'devops_automation') {
            form.addControl('alert_type', new FormControl(data?.alert_type, [Validators.required]));
            if (ft === 'custom') {
              form.addControl('custom_filter_meta', this.getCustomFormGroup('devops_automation', data.custom_filter_meta));
            }
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'group_name': ['', [Validators.required, NoWhitespaceValidator]],
        'mode': [['email'], [Validators.required]],
        'users': ['', [Validators.required, EmailValidator]],
        // 'alert_type': [['information'], []],
        'filter_type': ['all', [Validators.required]],
        'is_enabled': [false],
        'module': ['', [Validators.required]]
      }));
    }
  }

  // getCustomFormGroup(data?: any) {
  //   let customFG = this.builder.group({
  //     device_types: [data?.device_types ? data?.device_types : [], [Validators.required]],
  //     device_list: [data?.device_list ? data?.device_list : [], [Validators.required]],
  //     // triggers: [data?.triggers ? data?.triggers : []]
  //   })

  //   const isTriggersFormControlRequired: boolean = data?.module === 'aiml';
  //   if (isTriggersRequired || isTriggersFormControlRequired) {
  //     customFG.addControl('triggers', new FormControl(data?.triggers ? data?.triggers : []));
  //   }

  //   return customFG;
  // }
  getCustomFormGroup(module: string, data?: any, isTriggersRequired?: boolean) {
    console.log(data, "data")
    if (module === 'devops_automation') {
      const group = this.builder.group({
        execution_type: [data?.execution_type || '', Validators.required]
      });

      if (data?.execution_type) {
        group.addControl('scope', this.builder.control(data?.scope || '', Validators.required));
      }

      if (data?.execution_type && data?.scope === 'specific') {
        if (data?.execution_type === 'task') {
          group.addControl('tasks', this.builder.control(data?.tasks || [], Validators.required));
        }
        if (data?.execution_type === 'workflow') {
          group.addControl('workflows', this.builder.control(data?.workflows || [], Validators.required));
        }
      }
      return group;
    } else {
      let customFG = this.builder.group({
        device_types: [data?.device_types ? data?.device_types : [], [Validators.required]],
        device_list: [data?.device_list ? data?.device_list : [], [Validators.required]],
        // triggers: [data?.triggers ? data?.triggers : []]
      })

      const isTriggersFormControlRequired: boolean = data?.module === 'aiml';
      if (isTriggersRequired || isTriggersFormControlRequired) {
        customFG.addControl('triggers', new FormControl(data?.triggers ? data?.triggers : []));
      }
      return customFG
    }
  }

  resetFormErrors() {
    return {
      'group_name': '',
      'mode': '',
      'alert_type': '',
      'notify': '',
      'users': '',
      'webhook_url': '',
      // 'is_enabled': '',
      // 'filter_type': '',
      'filter_rule_meta': '',
      'description': '',
      'custom_filter_meta': this.getCutomFormGroupErrors(),
      'module': '',
      'devops_type': ''
    };
  }

  getCutomFormGroupErrors() {
    return {
      'device_types': '',
      'device_list': '',
      'triggers': '',
      'execution_type': '',
      'scope': '',
      "tasks": '',
      "workflows": '',
    };
  }

  validationMessages = {
    'group_name': {
      'required': 'Group name is required'
    },
    'mode': {
      'required': 'Mode is required'
    },
    'alert_type': {
      'required': 'Alert type is required'
    },
    'notify': {
      'required': 'Notify is required',
      'min': 'Minimum value should be greater than or equal to 1',
      'max': 'Maximum value should be less than or equal to 999',
    },
    'devops_type': {
      'required': 'Devops type is required'
    },
    'users': {
      'required': 'Users is required',
      'invalidEmail': 'Enter valid user email',
      'notPresentInList': 'Select valid user'
    },
    'webhook_url': {
      'required': 'Webhook URL is required'
    },
    // 'filter_type': {
    //   'required': 'Filter type is required'
    // },
    // 'is_enabled': {
    //   'required': 'Status is required'
    // },    
    'filter_rule_meta': {
      'required': 'Filters is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'custom_filter_meta': {
      'device_types': {
        'required': 'Device Type is required'
      },
      'device_list': {
        'required': 'Devices is required'
      },
      'triggers': {
        'required': 'Triggers is required'
      },
      'execution_type': {
        'required': 'Execution Type is required'
      },
      'scope': {
        'required': 'Scope is required'
      },
      'tasks': {
        'required': 'Task is required'
      },
      'workflows': {
        'required': 'Workflow is required'
      },
    },
    'module': {
      'required': 'Module is required'
    }
  }

  createGroup(data: UnitySetupNotificationGroupType) {
    return this.http.post(CREATE_NOTIFICATION_GROUP(), data);
  }

  updateGroup(uuid: string, data: UnitySetupNotificationGroupType) {
    return this.http.put(UPDATE_NOTIFICATION_GROUP(uuid), data);
  }

  getTaskData(): Observable<OrchestrationTaskDataType> {
    const params = new HttpParams().set('page_size', '0')
    return this.http.get<OrchestrationTaskDataType>(ORCHESTRATION_GET_TASK(), { params: params });
  }

  getWorkflowData(): Observable<WorkflowType> {
    const params = new HttpParams().set('page_size', '0')
    return this.http.get<WorkflowType>(`/rest/orchestration/agentic_workflow/`, { params: params });
  }
}

export const deviceTypes = [
  { 'name': 'Switch' },
  { 'name': 'Firewall' },
  { 'name': 'Load Balancer' },
  { 'name': 'Storage' },
  { 'name': 'Hypervisor' },
  { 'name': 'Baremetal' },
  { 'name': 'Mac Device' },
  { 'name': 'Custom' },
  { 'name': 'PDU' },
  { 'name': 'VMware' },
  { 'name': 'ESXI' },
  { 'name': 'Vcloud' },
  { 'name': 'HyperV' },
  { 'name': 'Openstack' },
  { 'name': 'Custom VM' }
];

export const typesOptions: AlertTypeListDataType[] = [
  {
    label: 'Information',
    value: 'information',
    type: 'Alert',
    isDisabled: false
  },
  {
    label: 'Warning',
    value: 'warning',
    type: 'Alert',
    isDisabled: false
  },
  {
    label: 'Critical',
    value: 'critical',
    type: 'Alert',
    isDisabled: false
  },
  // {
  //   label: 'End of Support',
  //   value: 'end_of_support',
  //   type: 'Life Cycle',
  //   isDisabled: false
  // },
  // {
  //   label: 'End of Life',
  //   value: 'end_of_life',
  //   type: 'Life Cycle',
  //   isDisabled: false
  // }
]

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
