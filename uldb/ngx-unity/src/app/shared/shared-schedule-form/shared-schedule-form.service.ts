import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DailyType, HourlyType, MonthlyType, ScheduleType, WeeklyType } from '../SharedEntityTypes/scheduled-maintenance.type';
import { Subject } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class SharedScheduleFormService {

  private formAnnouncedSource = new Subject<{ input: ScheduleType, scheduleId: string }>();
  formAnnouncedSource$ = this.formAnnouncedSource.asObservable();

  private formSubmitAnnouncedSource = new Subject<string>();
  formSubmitAnnouncedSource$ = this.formSubmitAnnouncedSource.asObservable();

  private formErrorAnnouncedSource = new Subject<any>();
  formErrorAnnouncedSource$ = this.formErrorAnnouncedSource.asObservable();

  form: FormGroup;
  formData: FormData;

  schedule: FormGroup;
  constructor(private builder: FormBuilder,
    private utilService: AppUtilityService) { }

  updateForm(input: ScheduleType, scheduleId: string) {
    this.formAnnouncedSource.next({ input: input, scheduleId: scheduleId });
  }

  submit() {
    this.formSubmitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.formErrorAnnouncedSource.next(err);
  }

  buildScheduleForm(d): FormGroup {
    if (d) {
      let scheduleForm = this.builder.group({
        'schedule': this.builder.group({
          'schedule_type': [d.schedule.schedule_type, [Validators.required]],
        })
      })
      this.schedule = <FormGroup>scheduleForm.get('schedule');
      this.handleDate(d);
      this.handleSchdule(d);
      return scheduleForm;
    } else {
      let scheduleForm = this.builder.group({
        'schedule': this.builder.group({
          'schedule_type': ['none', [Validators.required]],
        })
      })
      return scheduleForm;
    }
  }

  handleDate(data) {
    if (data.schedule.schedule_type == 'hourly' || data.schedule.schedule_type == 'daily' || data.schedule.schedule_type == 'weekly' || data.schedule.schedule_type == 'monthly') {
      this.schedule.addControl('start_date', new FormControl(data.schedule.start_date, [Validators.required, NoWhitespaceValidator]));
      if (data.schedule.end_date_status != 'never') {
        this.schedule.addControl('end_date', new FormControl(data.schedule.end_date, [Validators.required, NoWhitespaceValidator]));
      } else {
        this.schedule.addControl('end_date', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      }
      this.schedule.addControl('end_date_status', new FormControl(data.schedule.end_date_status, [Validators.required]));
      if (data.schedule.end_date_status == 'never') {
        this.schedule.get('end_date').disable();
      } else {
        this.schedule.get('end_date').enable();
      }
      this.schedule.get('end_date_status').valueChanges.subscribe((status: string) => {
        if (status == 'never') {
          this.schedule.get('end_date').disable();
          this.schedule.get('end_date').setValue('');
        } else {
          this.schedule.get('end_date').enable();
        }
      })
    }
  }

  handleSchdule(data) {
    switch (data.schedule.schedule_type) {
      case 'hourly':
        this.handleHourly(data.schedule.hourly);
        break;
      case 'daily':
        this.handleDaily(data.schedule.daily);
        break;
      case 'weekly':
        this.handleWeekly(data.schedule.weekly);
        break;
      case 'monthly':
        this.handleMonthly(data.schedule.monthly);
        break;
      default:
        break;
    }
  }

  handleDaily(dailyData: DailyType) {
    this.schedule.addControl('daily', this.builder.group({}));
    let daily = <FormGroup>this.schedule.get('daily');
    daily.addControl('days_interval', new FormControl(dailyData.days_interval, [Validators.required, NoWhitespaceValidator]));
  }

  handleHourly(hourlyData: HourlyType) {
    this.schedule.addControl('hourly', this.builder.group({}));
    let hourly = <FormGroup>this.schedule.get('hourly');
    hourly.addControl('hours_interval', new FormControl(hourlyData.hours_interval, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]));
    hourly.addControl('minutes_interval', new FormControl(hourlyData.minutes_interval, [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]));
  }

  handleWeekly(weeklyData: WeeklyType) {
    this.schedule.addControl('weekly', this.builder.group({}));
    let weekly = <FormGroup>this.schedule.get('weekly');
    weekly.addControl('week_days', new FormControl(weeklyData.week_days, [Validators.required]));
    weekly.addControl('at', new FormControl(moment(weeklyData.at, 'HH:mm:ss'), [Validators.required, NoWhitespaceValidator]));
  }

  handleMonthly(monthlyData: MonthlyType) {
    this.schedule.addControl('monthly', this.builder.group({}));
    let monthly = <FormGroup>this.schedule.get('monthly');
    monthly.addControl('monthly_type', new FormControl(monthlyData.monthly_type, [Validators.required]));
    if (monthlyData && monthlyData.monthly_type == 'every') {
      monthly.addControl('weeks', new FormControl(monthlyData.weeks, [Validators.required]));
      monthly.addControl('week_days', new FormControl(monthlyData.week_days, [Validators.required]));
      monthly.addControl('at', new FormControl(moment(monthlyData.at, 'HH:mm:ss'), [Validators.required]));
      monthly.addControl('every_months', new FormControl(monthlyData.every_months, [Validators.required]));
      monthly.addControl('days', new FormControl([]));
      monthly.addControl('months', new FormControl([]));
      monthly.get('days').disable();
      monthly.get('months').disable();
    } else {
      monthly.addControl('days', new FormControl(monthlyData.days, [Validators.required]));
      monthly.addControl('months', new FormControl(monthlyData.months, [Validators.required]));
      monthly.addControl('weeks', new FormControl([]));
      monthly.addControl('week_days', new FormControl([]));
      monthly.addControl('every_months', new FormControl([]));
      monthly.addControl('at', new FormControl(''));
      monthly.get('weeks').disable();
      monthly.get('week_days').disable();
      monthly.get('at').disable();
      monthly.get('every_months').disable();
    }
    monthly.get('monthly_type').valueChanges.subscribe((val) => {
      if (val == 'day') {
        monthly.get('weeks').disable();
        monthly.get('week_days').disable();
        monthly.get('every_months').disable();
        monthly.get('at').disable();
        monthly.get('days').enable();
        monthly.get('months').enable();
        monthly.get('days').setValidators([Validators.required]);
        monthly.get('months').setValidators([Validators.required]);
        monthly.get('weeks').setValue([]);
        monthly.get('week_days').setValue([]);
        monthly.get('every_months').setValue([]);
        monthly.get('at').setValue('');
        monthly.get('weeks').setValidators([]);
        monthly.get('week_days').setValidators([]);
        monthly.get('at').setValidators([]);
        monthly.get('days').updateValueAndValidity();
        monthly.get('months').updateValueAndValidity();
        monthly.get('weeks').updateValueAndValidity();
        monthly.get('week_days').updateValueAndValidity();
        monthly.get('every_months').updateValueAndValidity();
        monthly.get('at').updateValueAndValidity();
      } else {
        monthly.get('days').disable();
        monthly.get('months').disable();
        monthly.get('weeks').enable();
        monthly.get('week_days').enable();
        monthly.get('every_months').enable();
        monthly.get('at').enable();
        monthly.get('days').setValidators([]);
        monthly.get('months').setValidators([]);
        monthly.get('days').setValue([]);
        monthly.get('months').setValue([]);
        monthly.get('weeks').setValidators([Validators.required]);
        monthly.get('week_days').setValidators([Validators.required]);
        monthly.get('every_months').setValidators([Validators.required]);
        monthly.get('at').setValidators([Validators.required, NoWhitespaceValidator]);
        monthly.get('days').updateValueAndValidity();
        monthly.get('months').updateValueAndValidity();
        monthly.get('weeks').updateValueAndValidity();
        monthly.get('week_days').updateValueAndValidity();
        monthly.get('every_months').updateValueAndValidity();
        monthly.get('at').updateValueAndValidity();
      }
    })
  }

  resetScheduleFormErrors() {
    return {
      'schedule': {
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
      },
    }
  }

  scheduleFormValidationMessages = {
    'schedule': {
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
          'min': 'Enter a valid time',
          'max': 'Enter a valid time'
        },
        'minutes_interval': {
          'required': 'Min(s) is required',
          'min': 'Enter a valid time',
          'max': 'Enter a valid time'
        },
      },
      'daily': {
        'days_interval': {
          'required': 'Day is required',
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
  }

  handleFormData(data: any) {
    let obj = Object.assign({}, data);
    obj.schedule.start_date = this.utilService.getUTCDateInUserSetTimeZone(moment(obj.schedule.start_date)).format('YYYY-MM-DDTHH:mm'); //format start_date
    if (obj.schedule.end_date_status != 'never') {
      obj.schedule.end_date = this.utilService.getUTCDateInUserSetTimeZone(moment(obj.schedule.end_date)).format('YYYY-MM-DDTHH:mm'); //format end_data
    } else {
      obj.schedule.end_date = null;
    }
    switch (obj.schedule.schedule_type) {
      case 'weekly':
        obj.schedule.weekly.at = this.utilService.getUTCDateInUserSetTimeZone(obj.schedule.weekly.at).format('HH:mm:ss');
        break;
      case 'monthly':
        if (obj.schedule.monthly.monthly_type == 'day') {
          delete obj.schedule.monthly.weeks;
          delete obj.schedule.monthly.week_days;
          delete obj.schedule.monthly.every_months;
          delete obj.schedule.monthly.at;
        } else {
          obj.schedule.monthly.at = this.utilService.getUTCDateInUserSetTimeZone(obj.schedule.monthly.at).format('HH:mm:ss');
          delete obj.schedule.monthly.days;
          delete obj.schedule.monthly.months;
        }
        break;
      default:
        break;
    }
    return obj;
  }

  updateFormValue(form: FormGroup, data?: FormData) {
    this.form = form;
    if (data) {
      this.formData = data;
    }
  }

  isInvalid() {
    return this.form.invalid;
  }

  getFormValue() {
    return this.form.getRawValue();
  }

  getFormDataObj() {
    return this.formData;
  }
}

export const daysOptions = [
  {
    label: 1,
    value: '1'
  },
  {
    label: 2,
    value: '2'
  },
  {
    label: 3,
    value: '3'
  },
  {
    label: 4,
    value: '4'
  },
  {
    label: 5,
    value: '5'
  },
  {
    label: 6,
    value: '6'
  },
  {
    label: 7,
    value: '7'
  },
  {
    label: 8,
    value: '8'
  },
  {
    label: 9,
    value: '9'
  },
  {
    label: 10,
    value: '10'
  },
  {
    label: 11,
    value: '11'
  },
  {
    label: 12,
    value: '12'
  },
  {
    label: 13,
    value: '13'
  },
  {
    label: 14,
    value: '14'
  },
  {
    label: 15,
    value: '15'
  },
  {
    label: 16,
    value: '16'
  },
  {
    label: 17,
    value: '17'
  },
  {
    label: 18,
    value: '18'
  },
  {
    label: 19,
    value: '19'
  },
  {
    label: 20,
    value: '20'
  },
  {
    label: 21,
    value: '21'
  },
  {
    label: 22,
    value: '22'
  },
  {
    label: 23,
    value: '23'
  },
  {
    label: 24,
    value: '24'
  },
  {
    label: 25,
    value: '25'
  },
  {
    label: 26,
    value: '26'
  },
  {
    label: 27,
    value: '27'
  },
  {
    label: 28,
    value: '28'
  },
  {
    label: 29,
    value: '29'
  },
  {
    label: 30,
    value: '30'
  },
  {
    label: 31,
    value: '31'
  }
]

export const monthsOptions = [
  {
    label: 'January',
    value: 'jan'
  },
  {
    label: 'February',
    value: 'feb'
  },
  {
    label: 'March',
    value: 'mar'
  },
  {
    label: 'April',
    value: 'apr'
  },
  {
    label: 'May',
    value: 'may'
  },
  {
    label: 'June',
    value: 'jun'
  },
  {
    label: 'July',
    value: 'jul'
  },
  {
    label: 'August',
    value: 'aug'
  },
  {
    label: 'September',
    value: 'sep'
  },
  {
    label: 'October',
    value: 'oct'
  },
  {
    label: 'November',
    value: 'nov'
  },
  {
    label: 'December',
    value: 'dec'
  }
]

export const weeksOptions = [
  {
    label: 'First',
    value: 'first'
  },
  {
    label: 'Second',
    value: 'second'
  },
  {
    label: 'Third',
    value: 'third'
  },
  {
    label: 'Fourth',
    value: 'fourth'
  },
  {
    label: 'Fifth',
    value: 'fifth'
  }
]

export const weekDaysOptions = [
  {
    label: 'Sunday',
    value: 'sun'
  },
  {
    label: 'Monday',
    value: 'mon'
  },
  {
    label: 'Tuesday',
    value: 'tue'
  },
  {
    label: 'Wednesday',
    value: 'wed'
  },
  {
    label: 'Thursday',
    value: 'thu'
  },
  {
    label: 'Friday',
    value: 'fri'
  },
  {
    label: 'Saturday',
    value: 'sat'
  }
]