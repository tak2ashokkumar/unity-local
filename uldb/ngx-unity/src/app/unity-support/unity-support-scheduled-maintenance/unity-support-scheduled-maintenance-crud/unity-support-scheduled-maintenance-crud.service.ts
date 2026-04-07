
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { DeviceDataType, TiggerDataType, UserType } from './unity-support-scheduled-maintenance-crud.type';
import { CREATE_SCHEDULE, EDIT_SCHEDULE, GET_DATACENTER_FAST, GET_PRIVATE_CLOUD_FAST, GET_SCHEDULE, GET_TEANT_USER_GROUPS, GET_USERS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DatacenterFast, MaintenanceInfrastructureType, MaintenanceType, PrivateCloudFast, TenantType, TenantUserGroupType } from './unity-support-scheduled-maintenance-crud.type';
import { QueryBuilderClassNames, QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { UnityScheduleDataType, unityScheduleDayOptions, unityScheduleMonthOptions, unityScheduleWeekdayOptions, unityScheduleWeekOptions } from 'src/app/shared/unity-schedule/unity-schedule.servicedata';
import { CorrelationRuleFields } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.type';

@Injectable()
export class UnitySupportScheduledMaintenanceCrudService {

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


  getUsers(): Observable<UserType[]> {
    return this.http.get<UserType[]>(GET_USERS(), { params: new HttpParams().set('page_size', 0) });
  }

  getGroups(): Observable<TenantUserGroupType[]> {
    return this.http.get<TenantUserGroupType[]>(GET_TEANT_USER_GROUPS());
  }

  getDataCenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(GET_DATACENTER_FAST(), { params: new HttpParams().set('page_size', 0) })
  }

  getPrivateClouds(): Observable<PrivateCloudFast[]> {
    return this.http.get<PrivateCloudFast[]>(GET_PRIVATE_CLOUD_FAST(), { params: new HttpParams().set('page_size', 0) })
  }

  getUserDropdownData(): Observable<UserType[]> {
    return this.getUsers();
  }

  getMaintenanceData(uuid: string): Observable<MaintenanceType> {
    return this.http.get<MaintenanceType>(GET_SCHEDULE(uuid));
  }

  getDevicesList(deviceTypes: string[]): Observable<DeviceDataType[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('page_size', 0);
    deviceTypes?.map(device => params = params.append('device_type', device));
    return this.http.get<DeviceDataType[]>('/customer/mtp/devices_list/', { params: params })
  }

  getTriggersList(devices: DeviceDataType[]): Observable<TiggerDataType[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('page_size', 0);
    devices?.map(device => params = params.append('devices_uuid', device.uuid));
    return this.http.get<TiggerDataType[]>('/customer/mtp/triggers_list/', { params: params })
  }

  buildForm(data: any): FormGroup {
    const moment = require('moment-timezone');
    if (data) {
      let ae = '';
      if (data.additional_emails.length) {
        data.additional_emails.forEach((em, index) => {
          ae = index == data.additional_emails.length - 1 ? ae.concat(`${em}`) : ae.concat(`${em},`);
        });
      }
      let form = this.builder.group({
        // 'tenant': [data.tenant, [Validators.required]],
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description, [Validators.required, NoWhitespaceValidator]],
        // 'infrastructure_type': [data.infrastructure_type, [Validators.required]],
        'disable_event_notification': [data.disable_event_notification],
        'has_notification': [data.has_notification],
        'single_correlation': [data.single_correlation],
        'suppress_event': [data.suppress_event],
        'filter_enabled': [data.filter_enabled],
        'filter_rule_meta': [data.filter_rule_meta],
        'correlate_all_alerts': [data.correlate_all_alerts],
        'send_notification': [data.send_notification],
        'notify_before_window': [data.notify_before_window],
        'notify_after_window': [data.notify_after_window],
        'additional_emails': [ae],
        'schedule_meta': this.builder.group({
          'window_type': ['maintenance'],
          'run_now': [false],
          'start_date': [data.schedule_meta.start_date || '', [Validators.required]],
          'end_date': [data.schedule_meta.end_date || ''],
          'end_next': [data.schedule_meta.end_next],
          'schedule_type': [data.schedule_meta.schedule_type || 'onetime'],
          'end_date_status': [data.schedule_meta.end_date_status || 'never']
        }),
        'users_and_user_groups': [data.users_and_user_groups, [Validators.required]],
        // 'infrastructure': this.buildFormArray(data.infrastructure),
        // 'filter_rule_meta': data.filter_rule_meta
      });
      return form
    } else {
      return this.builder.group({
        // 'tenant': ['', [Validators.required]],
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        // 'infrastructure_type': ['', [Validators.required]],
        'disable_event_notification': [true],
        'single_correlation': [false],
        'suppress_event': [false],
        'filter_rule_meta': [null],
        'filter_enabled': [true],
        'has_notification': [false],
        'has_auto_ticketing': [false],
        'correlate_all_alerts': [false],
        'send_notification': [true],
        'notify_before_window': [false],
        'notify_after_window': [false],
        'schedule_meta': this.builder.group({
          'window_type': ['maintenance'],
          'run_now': [false],
          'start_date': ['', [Validators.required]],
          'end_date': ['', [Validators.required]],
          'end_next': [''],
          'schedule_type': ['onetime'],
          'end_date_status': ['']
        }),
        'additional_emails': [''],
        'maintenance_status': [true], //has to be sent as true for create
        'users_and_user_groups': ['', [Validators.required]],
      });
    }
  }

  // private buildFormArray(data: MaintenanceInfrastructureType[]): FormArray {
  //   return this.builder.array(
  //     data.map(infrastructure => this.builder.group({
  //       infra_level_types: [infrastructure.infra_level_types, [Validators.required]],
  //       infrastructure_level: [infrastructure.infrastructure_level, [Validators.required]],
  //       device_list: [infrastructure.device_list],
  //       triggers: [infrastructure.triggers],
  //       exclude: [infrastructure.exclude]
  //     }))
  //   );
  // }


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


  resetFormErrors() {
    return {
      // 'tenant': '',
      'name': '',
      'description': '',
      'infrastructure_type': '',
      'has_alerts': '',
      'has_notification': '',
      'has_auto_ticketing': '',
      'correlate_all_alerts': '',
      'send_notification': '',
      'notify_before_window': '',
      'notify_after_window': '',
      'additional_emails': '',
      'users_and_user_groups': '',
      'infrastructure': [],
      'schedule_meta': this.scheduleResetFormErrors()
    }
  }


  scheduleResetFormErrors() {
    return {
      'schedule_type': '',
      'start_date': '',
      'end_date': '',
      'one_time': {
        'execute_now': ''
      },
      'hourly': {
        'hours_interval': '',
        'minutes_interval': ''
      },
      'daily': {
        'days_interval': '',
        'at': ''
      },
      'weekly': {
        'week_days': '',
        'at': ''
      },
      'monthly': {
        'days': '',
        'months': '',
        'weeks': '',
        'week_days': '',
        'every_months': '',
        'at': '',
      }
    }
  }

  resetInfrastructureErrors() {
    return {
      'infrastructure_level': '',
      'infra_level_types': '',
    }
  }

  validationMessages = {

    name: {
      required: 'Name is required'
    },

    description: {
      required: 'Description is required'
    },

    infrastructure_type: {
      required: 'Infrastructure type is required'
    },

    schedule_meta: {

      schedule_type: {
        required: 'Schedule type is required'
      },

      start_date: {
        required: 'Start date is required',
        owlDateTimeMax: 'Start date cannot be after end date'
      },

      end_date: {
        required: 'End date is required',
        owlDateTimeMin: 'End date cannot be before start date'
      },

      one_time: {
        execute_now: {
          required: 'Execute Now is required'
        }
      },

      hourly: {
        hours_interval: {
          required: 'Hr(s) is required',
          min: 'Enter valid time',
          max: 'Enter valid time'
        },
        minutes_interval: {
          required: 'Min(s) is required',
          min: 'Enter valid time',
          max: 'Enter valid time'
        }
      },

      daily: {
        days_interval: {
          required: 'Day is required'
        },
        at: {
          required: 'Time is required'
        }
      },

      weekly: {
        week_days: {
          required: 'Week Day(s) is required'
        },
        at: {
          required: 'Time is required'
        }
      },

      monthly: {
        days: {
          required: 'Day(s) is required'
        },
        months: {
          required: 'Month(s) is required'
        },
        weeks: {
          required: 'Week(s) is required'
        },
        week_days: {
          required: 'Week Day(s) is required'
        },
        every_months: {
          required: 'Month(s) is required'
        },
        at: {
          required: 'Time is required'
        }
      }
    },

    users_and_user_groups: {
      required: 'User or user group is required'
    },

    infrastructure: {
      infrastructure_level: {
        required: 'Infra type is required'
      },
      infra_level_types: {
        required: 'Selection is mandatory'
      }
    }
  };


  getEveryMonthValues() {
    let options = <UnityScheduleDataType[]>[].concat(unityScheduleMonthOptions);
    return options.map(m => m.value);
  }

  getMonthOptions() {
    let options = [].concat(unityScheduleMonthOptions);
    return options;
  }

  getWeekOptions() {
    let options = [].concat(unityScheduleWeekOptions);
    return options;
  }

  getWeekdayOptions() {
    let options = [].concat(unityScheduleWeekdayOptions);
    return options;
  }

  getDayOptions() {
    let options = [].concat(unityScheduleDayOptions);
    return options;
  }







  manageFormData(data: any) {
    let obj = Object.assign({}, data);
    obj.start_date = this.utilService.getUTCDateInUserSetTimeZone(moment(obj.start_date)).format('YYYY-MM-DD');
    if (!obj.ends_never) {
      obj.end_date = this.utilService.getUTCDateInUserSetTimeZone(moment(obj.end_date)).format('YYYY-MM-DD');
    }
    if (obj.additional_emails) {
      obj.additional_emails = obj.additional_emails.length ? (<string>obj.additional_emails).split(',') : [];
    }
    if (obj.schedule_type == 'One-time') {
      delete obj.recurrence_pattern;
      delete obj.daily_type;
      delete obj.every_day_count;
      delete obj.weekday;
      delete obj.monthly_type;
      delete obj.custom_month_day;
      delete obj.every_month_count;
      delete obj.every_custom_month_day;
      delete obj.every_custom_month_weekday;
      delete obj.recurrence_start_time_hr;
      delete obj.recurrence_start_time_min;
      delete obj.recurrence_end_time_hr;
      delete obj.recurrence_end_time_min;
      obj.ends_never = false;
    }
    if (obj.schedule_type == 'Recurring' && obj.ends_never) {
      obj.recurrence_end_time_hr = 0;
      obj.recurrence_end_time_min = 0;
      obj.end_date = null;
      obj.recurrence_end_time_hr = null;
      obj.recurrence_end_time_min = null;

    }
    if (obj.schedule_type == 'Recurring' && obj.recurrence_pattern == 'Daily') {
      delete obj.weekday;
      delete obj.monthly_type;
      delete obj.custom_month_day;
      delete obj.every_month_count;
      delete obj.every_custom_month_day;
      delete obj.every_custom_month_weekday;
    }
    if (obj.schedule_type == 'Recurring' && obj.recurrence_pattern == 'Weekly') {
      delete obj.daily_type;
      delete obj.every_day_count;
      delete obj.monthly_type;
      delete obj.custom_month_day;
      delete obj.every_month_count;
      delete obj.every_custom_month_day;
      delete obj.every_custom_month_weekday;
    }
    if (obj.schedule_type == 'Recurring' && obj.recurrence_pattern == 'Monthly') {
      delete obj.daily_type;
      delete obj.every_day_count;
      delete obj.weekday;
    }
    return obj;
  }

  createSchedule(data: any) {
    return this.http.post(CREATE_SCHEDULE(), this.manageFormData(data));
  }

  updateSchedule(data: any, uuid: string) {
    return this.http.put(EDIT_SCHEDULE(uuid), this.manageFormData(data));
  }
}

export class UserAndGroupViewData {
  constructor() { }
  name: string;
  isSelected: boolean;
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
