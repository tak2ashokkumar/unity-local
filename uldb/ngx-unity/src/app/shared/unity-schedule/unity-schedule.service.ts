import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { UnityNotificationType, UnityScheduleDailyType, UnityScheduleHourlyType, UnityScheduleMonthlyType, UnityScheduleType, UnityScheduleWeeklyType } from '../SharedEntityTypes/schedule.type';
import { AppUtilityService, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { UnityScheduleDataType, unityScheduleDayOptions, unityScheduleMonthOptions, unityScheduleWeekOptions, unityScheduleWeekdayOptions } from './unity-schedule.servicedata';
import { UserGroupType } from '../SharedEntityTypes/user-mgmt.type';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GET_USER_GROUPS_LIST, LIST_ACTIVE_USER } from '../api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class UnityScheduleService {
  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  form: FormGroup;
  notificationForm: FormGroup;
  data: UnityScheduleType;

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilService: AppUtilityService,) { }

  getDayOptions() {
    let options = [].concat(unityScheduleDayOptions);
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

  getMonthOptions() {
    let options = [].concat(unityScheduleMonthOptions);
    return options;
  }

  getEveryMonthValues() {
    let options = <UnityScheduleDataType[]>[].concat(unityScheduleMonthOptions);
    return options.map(m => m.value);
  }

  addOrEdit<T extends UnityScheduleType>(obj: T, notificationObj?: UnityNotificationType) {
    this.buildForm(obj, notificationObj);
  }

  submit() {
    this.submitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  buildForm(obj?: UnityScheduleType, notificationObj?: UnityNotificationType) {
    if (obj) {
      this.form = this.builder.group({
        'schedule_type': [obj.schedule_type, [Validators.required]],
      });
      this.handleFormFieldsByScheduleType(obj);
      this.buildNotificationForm(notificationObj);
    } else {
      this.form = this.builder.group({
        'schedule_type': ['none', [Validators.required]],
      });
      this.buildNotificationForm();
    }
  }

  handleFormFieldsByScheduleType(obj: UnityScheduleType) {
    if (obj.schedule_type == 'none') {
      this.form.get('start_date') ? this.form.removeControl('start_date') : null;
      this.form.get('end_date_status') ? this.form.removeControl('end_date_status') : null;
      this.form.get('end_date') ? this.form.removeControl('end_date') : null;
    } else {
      this.form.addControl('start_date', new FormControl(obj.start_date ? obj.start_date : moment(), [Validators.required, NoWhitespaceValidator]));
      this.form.addControl('end_date_status', new FormControl(obj.end_date_status ? obj.end_date_status : 'never', [Validators.required, NoWhitespaceValidator]));
      if (obj.end_date_status == 'on') {
        this.form.addControl('end_date', new FormControl(obj.end_date ? obj.end_date : moment(), [Validators.required, NoWhitespaceValidator]));
      } else {
        this.form.addControl('end_date', new FormControl({ value: '', disabled: true }));
      }
    }
    this.handleHourlyFields(obj);
    this.handleDailyFields(obj);
    this.handleWeeklyFields(obj);
    this.handleMonthlyFields(obj);
  }

  /*
  * Handle Hourly fields of the Schedule
  * Adding and deleting of hourly fields
  */
  handleHourlyFields(obj: UnityScheduleType) {
    if (obj && obj.schedule_type == 'hourly') {
      this.addHourlyFields(obj.hourly);
    } else {
      this.removeHourlyFileds();
    }
  }

  addHourlyFields(data?: UnityScheduleHourlyType) {
    this.form.addControl('hourly', this.builder.group({}));
    let group = <FormGroup>this.form.get('hourly');
    group.addControl('hours_interval', new FormControl(data ? data.hours_interval : '0', [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]));
    group.addControl('minutes_interval', new FormControl(data ? data.minutes_interval : '30', [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]));
  }

  removeHourlyFileds() {
    this.form.get('hourly') ? this.form.removeControl('hourly') : null;
  }

  /*
  * Handle Daily fields of the Schedule
  * Adding and deleting of daily fields
  */
  handleDailyFields(obj: UnityScheduleType) {
    if (obj && obj.schedule_type == 'daily') {
      this.addDailyFields(obj.daily);
    } else {
      this.removeDailyFileds();
    }
  }

  addDailyFields(data: UnityScheduleDailyType) {
    this.form.addControl('daily', this.builder.group({}));
    let group = <FormGroup>this.form.get('daily');
    group.addControl('days_interval', new FormControl(data ? data.days_interval : '1', [Validators.required, NoWhitespaceValidator]));
    group.addControl('at', new FormControl(data?.at ? moment(data.at.split(' ')[0], 'HH:mm:ss') : '', [Validators.required, NoWhitespaceValidator]));
  }

  removeDailyFileds() {
    this.form.get('daily') ? this.form.removeControl('daily') : null;
  }

  /*
  * Handle Weekly fields of the Schedule
  * Adding and deleting of weekly fields
  */
  handleWeeklyFields(obj: UnityScheduleType) {
    if (obj && obj.schedule_type == 'weekly') {
      this.addWeeklyFields(obj.weekly);
    } else {
      this.removeWeeklyFileds();
    }
  }

  addWeeklyFields(data: UnityScheduleWeeklyType) {
    this.form.addControl('weekly', this.builder.group({}));
    let group = <FormGroup>this.form.get('weekly');
    group.addControl('week_days', new FormControl(data ? data.week_days : [], [Validators.required]));
    group.addControl('at', new FormControl(data ? moment(data.at.split(' ')[0], 'HH:mm:ss') : '', [Validators.required, NoWhitespaceValidator]));
  }

  removeWeeklyFileds() {
    this.form.get('weekly') ? this.form.removeControl('weekly') : null;
  }

  /*
  * Handle Monthly fields of the Schedule
  * Adding and deleting of monthly fields
  */
  handleMonthlyFields(obj: UnityScheduleType) {
    if (obj && obj.schedule_type == 'monthly') {
      this.addMonthlyFields(obj.monthly);
    } else {
      this.removeMonthlyFileds();
    }
  }

  addMonthlyFields(data: UnityScheduleMonthlyType) {
    this.form.addControl('monthly', this.builder.group({}));
    let group = <FormGroup>this.form.get('monthly');
    group.addControl('monthly_type', new FormControl(data ? data.monthly_type : 'by_week_days', [Validators.required]));
    if (data && data.monthly_type == 'by_days') {
      group.addControl('days', new FormControl(data ? data.days : ['1'], [Validators.required]));
      group.addControl('months', new FormControl(data ? data.months : this.getEveryMonthValues(), [Validators.required]));
      group.addControl('weeks', new FormControl({ value: [], disabled: true }));
      group.addControl('week_days', new FormControl({ value: [], disabled: true }));
      group.addControl('every_months', new FormControl({ value: [], disabled: true }));
      group.addControl('at', new FormControl({ value: '', disabled: true }));
    } else {
      group.addControl('weeks', new FormControl(data ? data.weeks : ['first'], [Validators.required]));
      group.addControl('week_days', new FormControl(data ? data.week_days : ['sun'], [Validators.required]));
      group.addControl('every_months', new FormControl(data ? data.every_months : this.getEveryMonthValues(), [Validators.required]));
      group.addControl('at', new FormControl(data ? moment(data.at.split(' ')[0], 'HH:mm:ss') : '', [Validators.required, NoWhitespaceValidator]));
      group.addControl('days', new FormControl({ value: [], disabled: true }));
      group.addControl('months', new FormControl({ value: [], disabled: true }));
    }
  }

  removeMonthlyFileds() {
    this.form.get('monthly') ? this.form.removeControl('monthly') : null;
  }

  resetFormErrors() {
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

  formValidationMessages = {
    'schedule_type': {
      'required': 'Schedule type is required',
    },
    'start_date': {
      'required': 'Start date is required',
      'owlDateTimeMax': 'Start date cannot be after end date'
    },
    'end_date': {
      'required': ' End date is required',
      'owlDateTimeMin': 'End date cannot be before start date'
    },
    'one_time': {
      'execute_now': {
        'required': 'Execute Now is required'
      }
    },
    'hourly': {
      'hours_interval': {
        'required': 'Hr(s) is required',
        'min': 'Enter valid time',
        'max': 'Enter valid time'
      },
      'minutes_interval': {
        'required': 'Min(s) is required',
        'min': 'Enter valid time',
        'max': 'Enter valid time'
      },
    },
    'daily': {
      'days_interval': {
        'required': 'Day is required',
      },
      'at': {
        'required': 'Time is required',
      },
    },
    'weekly': {
      'week_days': {
        'required': 'Week Day(s) is required',
      },
      'at': {
        'required': 'Time is required',
      },
    },
    'monthly': {
      'days': {
        'required': 'Day(s) is required',
      },
      'months': {
        'required': 'Month(s) is required',
      },
      'weeks': {
        'required': 'Week(s) is required',
      },
      'week_days': {
        'required': 'Week Day(s) is required',
      },
      'every_months': {
        'required': 'Month(s) is required'
      },
      'at': {
        'required': 'Time is required'
      }
    }
  }

  getUserGroups(): Observable<UserGroupType[]> {
    let params: HttpParams = new HttpParams().set('status', true).set('page_size', 0);
    return this.http.get<UserGroupType[]>(GET_USER_GROUPS_LIST(), { params: params });
  }

  getUserList(): Observable<string[]> {
    return this.http.get<string[]>(LIST_ACTIVE_USER());
  }

  getDropdownData(): Observable<{ userGroups: UserGroupType[], userList: string[] }> {
    return forkJoin({
      userGroups: this.getUserGroups().pipe(catchError(error => of(undefined))),
      userList: this.getUserList().pipe(catchError(error => of(undefined))),
    })
  }

  buildNotificationForm(obj?: UnityNotificationType) {
    if (obj) {
      this.notificationForm = this.builder.group({
        'sync_failure_notify': [obj.sync_failure_notify, [Validators.required]],
        'sync_success_notify': [obj.sync_success_notify, [Validators.required]],
        'email_notify_groups': [obj.email_notify_groups],
        'email_notify_users': [obj.email_notify_users],
      });
    } else {
      this.notificationForm = this.builder.group({
        'sync_failure_notify': [true, [Validators.required]],
        'sync_success_notify': [true, [Validators.required]],
        'email_notify_groups': [[]],
        'email_notify_users': [[]],
      });
    }
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  updateNotificationForm(form: FormGroup) {
    this.notificationForm = form;
  }

  convertToAPIData(runNowFlag?: boolean) {
    let obj = this.form.getRawValue();
    obj['run_now'] = runNowFlag;
    if (obj.schedule_type == 'weekly') {
      obj.weekly.at = moment.tz(obj.weekly.at, Intl.DateTimeFormat().resolvedOptions().timeZone).format('HH:mm:ss ZZ');
    } else if (obj.schedule_type == 'monthly' && obj.monthly.monthly_type == 'by_week_days') {
      obj.monthly.at = moment.tz(obj.monthly.at, Intl.DateTimeFormat().resolvedOptions().timeZone).format('HH:mm:ss ZZ');
    } else if (obj.schedule_type == 'daily'){
      obj.daily.at = moment.tz(obj.daily.at, Intl.DateTimeFormat().resolvedOptions().timeZone).format('HH:mm:ss ZZ');
    }
    if (this.notificationForm) {
      // obj.notification = this.notificationForm.getRawValue();
      return { 'schedule_meta': obj, 'notification': this.notificationForm.getRawValue() };
    } else {
      return { 'schedule_meta': obj };
    }
  }

  getFormValue(runNowFlag?: boolean) {
    return this.convertToAPIData(runNowFlag);
  }

}
