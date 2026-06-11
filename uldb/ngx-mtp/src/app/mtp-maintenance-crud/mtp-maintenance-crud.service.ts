import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserType } from '../mtp-administration/mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { CREATE_SCHEDULE, EDIT_SCHEDULE, GET_DATACENTER_FAST, GET_PRIVATE_CLOUD_FAST, GET_SCHEDULE, GET_TEANT_USER_GROUPS, GET_TENANTS, GET_USERS } from '../shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from '../shared/app-utility/app-utility.service';
import { DatacenterFast, MaintenanceInfrastructureType, MaintenanceType, PrivateCloudFast, TenantType, TenantUserGroupType } from './mtp-maintenance-crud.type';

@Injectable()
export class MtpMaintenanceCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private utilService: AppUtilityService) { }

  getTenants(): Observable<TenantType[]> {
    return this.http.get<TenantType[]>(GET_TENANTS());
  }

  getUsers(tenantUUID: string): Observable<UserType[]> {
    return this.http.get<UserType[]>(GET_USERS(), { params: new HttpParams().set('page_size', 0).set('tenant_uuid', tenantUUID) });
  }

  getGroups(tenantUUID: string): Observable<TenantUserGroupType[]> {
    return this.http.get<TenantUserGroupType[]>(GET_TEANT_USER_GROUPS(), { params: new HttpParams().set('page_size', 0).set('tenant_uuid', tenantUUID) });
  }

  getDataCenters(tenantUUID: string): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(GET_DATACENTER_FAST(), { params: new HttpParams().set('page_size', 0).set('tenant', tenantUUID) })
  }

  getPrivateClouds(tenantUUID: string): Observable<PrivateCloudFast[]> {
    return this.http.get<PrivateCloudFast[]>(GET_PRIVATE_CLOUD_FAST(), { params: new HttpParams().set('page_size', 0).set('tenant', tenantUUID) })
  }

  getDropdownData(tenantUUID: string): Observable<{ users: UserType[], groups: TenantUserGroupType[] }> {
    return forkJoin({
      users: this.getUsers(tenantUUID).pipe(catchError(error => of(undefined))),
      groups: this.getGroups(tenantUUID).pipe(catchError(error => of(undefined))),
    });
  }

  getMaintenanceData(uuid: string): Observable<MaintenanceType> {
    return this.http.get<MaintenanceType>(GET_SCHEDULE(uuid));
  }

  buildForm(data: MaintenanceType): FormGroup {
    const moment = require('moment-timezone');
    if (data) {
      let ae = '';
      if (data.additional_email.length) {
        data.additional_email.forEach((em, index) => {
          ae = index == data.additional_email.length - 1 ? ae.concat(`${em}`) : ae.concat(`${em},`);
        });
      }
      let form = this.builder.group({
        'tenant': [data.tenant, [Validators.required]],
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'description': [data.description, [Validators.required, NoWhitespaceValidator]],
        'infrastructure_type': [data.infrastructure_type, [Validators.required]],
        'has_alerts': [data.has_alerts],
        'has_notification': [data.has_notification],
        'has_auto_ticketing': [data.has_auto_ticketing],
        'correlate_all_alerts': [data.correlate_all_alerts],
        'send_notification': [data.send_notification],
        'send_before_window': [data.send_before_window],
        'send_after_window': [data.send_after_window],
        'start_date': [moment(data.start_date).format('YYYY-MM-DDTHH:mm:ss'), [Validators.required, NoWhitespaceValidator]],
        'end_date': [moment(data.end_date).format('YYYY-MM-DDTHH:mm:ss'), [Validators.required, NoWhitespaceValidator]],
        'timezone': [data.timezone, [Validators.required]],
        'schedule_type': [data.schedule_type],
        'recurrence_start_time_hr': [data.recurrence_start_time_hr],
        'recurrence_start_time_min': [data.recurrence_start_time_min],
        'recurrence_end_time_hr': [data.recurrence_end_time_hr],
        'recurrence_end_time_min': [data.recurrence_end_time_min],
        'recurrence_pattern': [data.recurrence_pattern],
        'weekday': [data.weekday],
        'daily_type': [data.daily_type],
        'every_day_count': [data.every_day_count],
        'monthly_type': [data.monthly_type],
        'every_month_count': [data.every_month_count],
        'every_custom_month_day': [data.every_custom_month_day],
        'every_custom_month_weekday': [data.every_custom_month_weekday],
        'additional_email': [ae],
        'ends_never': [data.ends_never],
        'schedule_start_time_hr': [data.schedule_start_time_hr, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]],
        'schedule_start_time_min': [data.schedule_start_time_min, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]],
        'schedule_end_time_hr': [data.schedule_end_time_hr, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]],
        'schedule_end_time_min': [data.schedule_end_time_min, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]],
        'user_and_user_group': [data.user_and_user_group, [Validators.required]],
        'infrastructure': this.buildFormArray(data.infrastructure)
      });
      return form
    } else {
      return this.builder.group({
        'tenant': ['', [Validators.required]],
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'infrastructure_type': ['', [Validators.required]],
        'has_alerts': [true],
        'has_notification': [false],
        'has_auto_ticketing': [false],
        'correlate_all_alerts': [false],
        'send_notification': [true],
        'send_before_window': [false],
        'send_after_window': [false],
        'start_date': ['', [Validators.required, NoWhitespaceValidator]],
        'end_date': ['', [Validators.required, NoWhitespaceValidator]],
        'timezone': ['', [Validators.required]],
        'schedule_type': ['One-time'],
        'recurrence_start_time_hr': [null],
        'recurrence_start_time_min': [null],
        'recurrence_end_time_hr': [null],
        'recurrence_end_time_min': [null],
        'recurrence_pattern': ['Daily'],
        'weekday': [[]],
        'daily_type': [''],
        'every_day_count': [null],
        'monthly_type': [''],
        'every_month_count': [null],
        'every_custom_month_day': [''],
        'every_custom_month_weekday': [''],
        'additional_email': [''],
        'ends_never': [null],
        'schedule_start_time_hr': [null, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]],
        'schedule_start_time_min': [null, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]],
        'schedule_end_time_hr': [null, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]],
        'schedule_end_time_min': [null, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]],
        'maintenance_status': [true], //has to be sent as true for create
        'user_and_user_group': ['', [Validators.required]],
      });
    }
  }

  private buildFormArray(data: MaintenanceInfrastructureType[]): FormArray {
    return this.builder.array(
      data.map(infrastructure => this.builder.group({
        infra_level_types: [infrastructure.infra_level_types, [Validators.required]],
        infrastructure_level: [infrastructure.infrastructure_level, [Validators.required]],
        exclude: [infrastructure.exclude]
      }))
    );
  }

  resetFormErrors() {
    return {
      'tenant': '',
      'name': '',
      'description': '',
      'infrastructure_type': '',
      'has_alerts': '',
      'has_notification': '',
      'has_auto_ticketing': '',
      'correlate_all_alerts': '',
      'send_notification': '',
      'send_before_window': '',
      'send_after_window': '',
      'start_date': '',
      'end_date': '',
      'timezone': '',
      'schedule_type': '',
      'recurrence_start_time_hr': '',
      'recurrence_start_time_min': '',
      'recurrence_end_time_hr': '',
      'recurrence_end_time_min': '',
      'recurrence_pattern': '',
      'weekday': '',
      'additional_email': '',
      'daily_type': '',
      'every_day_count': '',
      'monthly_type': '',
      'custom_month_day': '',
      'every_month_count': '',
      'every_custom_month_day': '',
      'every_custom_month_weekday': '',
      'ends_never': '',
      'schedule_start_time_hr': '',
      'schedule_start_time_min': '',
      'schedule_end_time_hr': '',
      'schedule_end_time_min': '',
      'user_and_user_group': '',
      'infrastructure': []
    }
  }

  resetInfrastructureErrors() {
    return {
      'infrastructure_level': '',
      'infra_level_types': '',
    }
  }

  validationMessages = {
    'tenant': {
      'required': 'Tenant is required'
    },
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'infrastructure_type': {
      'required': 'Infrastructure type is required'
    },
    // 'has_alerts': {
    //   'required': ' is required'
    // },
    // 'has_notification': {
    //   'required': ' is required'
    // },
    // 'has_auto_ticketing': {
    //   'required': ' is required'
    // },
    // 'send_notification': {
    //   'required': ' is required'
    // },
    // 'send_before_window': {
    //   'required': ' is required'
    // },
    // 'send_after_window': {
    //   'required': ' is required'
    // },
    'start_date': {
      'required': 'Start date is required',
      'owlDateTimeMax': 'Start date cannot be after end date'
    },
    'end_date': {
      'required': 'End date is required',
      'owlDateTimeMin': 'End date cannot be before start date'
    },
    'timezone': {
      'required': 'Timezone is required'
    },
    // 'schedule_type': {
    //   'required': ' is required'
    // },
    'recurrence_start_time_hr': {
      'required': 'Hr(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'recurrence_start_time_min': {
      'required': 'Min(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'recurrence_end_time_hr': {
      'required': 'Hr(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'recurrence_end_time_min': {
      'required': 'Min(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    // 'recurrence_pattern': {
    //   'required': ' is required'
    // },
    'additional_email': {
      'required': 'Custom mailID is required'
    },
    'daily_type': {
      'required': 'Recurrence pattern is required'
    },
    'every_day_count': {
      'required': 'Required'
    },
    'weekday': {
      'required': 'Weekday is required'
    },
    'custom_month_day': {
      'required': 'Required'
    },
    'every_month_count': {
      'required': 'Required'
    },
    'every_custom_month_day': {
      'required': 'Required'
    },
    'every_custom_month_weekday': {
      'required': 'Required'
    },
    'monthly_type': {
      'required': 'Recurrence pattern is required'
    },
    'ends_never': {
      'required': 'End date preference is required'
    },
    'schedule_start_time_hr': {
      'required': 'Hr(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'schedule_start_time_min': {
      'required': 'Min(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'schedule_end_time_hr': {
      'required': 'Hr(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'schedule_end_time_min': {
      'required': 'Min(s) is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    'user_and_user_group': {
      'required': 'User or user group is required'
    },
    'infrastructure': {
      'infrastructure_level': {
        'required': 'Infra type is required'
      },
      'infra_level_types': {
        'required': 'Selection is mandatory'
      },
    }
  }

  manageFormData(data: any) {
    let obj = Object.assign({}, data);
    obj.start_date = this.utilService.getUTCDateInUserSetTimeZone(moment(obj.start_date)).format('YYYY-MM-DD');
    if (!obj.ends_never) {
      obj.end_date = this.utilService.getUTCDateInUserSetTimeZone(moment(obj.end_date)).format('YYYY-MM-DD');
    }
    if (obj.additional_email) {
      obj.additional_email = obj.additional_email.length ? (<string>obj.additional_email).split(',') : [];
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
  { 'name': 'Custom' }
];