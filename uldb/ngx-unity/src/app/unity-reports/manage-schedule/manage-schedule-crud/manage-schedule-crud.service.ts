import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { ALL_REPORTS_BY_FEATURE, CREATE_SCHEDULES_FOR_REPORTS, GET_SCHEDULE_BY_ID, LIST_USER, UPDATE_SCHEDULES_FOR_REPORTS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, MultiEmailValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class ManageScheduleCrudService {

  constructor(private builder: FormBuilder,
    private utilService: AppUtilityService,
    private http: HttpClient) { }

  getUsers(): Observable<UnitySetupUser[]> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<UnitySetupUser[]>(LIST_USER(), { params: param });
  }

  getScheduleById(uuid: string) {
    return this.http.get<ManageReportScheduleCRUDType>(GET_SCHEDULE_BY_ID(uuid));
  }

  getReports(feature: string) {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<ManageReportScheduleCRUDType[]>(ALL_REPORTS_BY_FEATURE(feature), { params: param });
  }

  createScheduleForm(uuid: string, date: string) {
    if (uuid) {
      return this.getScheduleById(uuid).pipe(map(data => {
        return this.updateScheduleForm(data, date);
      }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required]],
        'export_type': ['', [Validators.required]],
        'execute_immediately': [false],
        'schedule_time': ['', [Validators.required]],
        'is_repeats': [false], // Initialize the checkbox value as false
        'repeats_hr': [{ value: '', disabled: true }, [Validators.required]], // Disable initially
        'repeats_mn': [{ value: '', disabled: true }, [Validators.required]], // Disable initially
        'repeats_until': [{ value: '', disabled: true }, [Validators.required]], // Disable initially
        'recurrence_pattern': ['', [Validators.required]],
        'schedule_on': [date],
        'range_of_recurrence': ['', [Validators.required]],
        'ends': ['', [Validators.required]],
        'occurs': ['', [Validators.required]],
        'report_name': ['', [Validators.required]],
        'recipient_emails': [, [Validators.required]],
        'additional_emails': ['', [MultiEmailValidator]],
        'radioOptions': ['never', [Validators.required]],
      }));
    }
  }

  getScheduleTypeFromFormdata(fd: any): ManageReportScheduleCRUDType {
    let data: ManageReportScheduleCRUDType = {
      // uuid: fd.uuid ? fd.uuid : null,
      name: fd.name,
      export_type: fd.export_type,
      execute_immediately: fd.execute_immediately,
      schedule_time: this.utilService.getUTCDateInUserSetTimeZone(fd.schedule_time).format('HH:mm:ss'),
      is_repeats: fd.is_repeats,
      repeats_hr: fd.is_repeats ? fd.repeats_hr : 0,
      repeats_mn: fd.is_repeats ? fd.repeats_mn : 0,
      repeats_until: fd.is_repeats ? fd.repeats_until : 0,
      recurrence_pattern: fd.recurrence_pattern,
      range_of_recurrence: this.utilService.getUTCDateInUserSetTimeZone(fd.range_of_recurrence).format('YYYY-MM-DD'),
      ends: fd.ends == '' ? null : this.utilService.getUTCDateInUserSetTimeZone(fd.ends).format('YYYY-MM-DDTHH:mm:ss'),
      occurs: fd.occurs == '' ? -1 : fd.occurs,
      report_name: fd.report_name,
      recipient_emails: fd.recipient_emails,
      additional_emails: fd.additional_emails.length ? (<string>fd.additional_emails).split(',') : []
    }
    if (fd.uuid) {
      data.uuid = fd.uuid;
    }
    return data;
  }


  updateScheduleForm(data: ManageReportScheduleCRUDType, date: string) {
    const moment = require('moment-timezone');
    let ae = '';
    data.additional_emails.forEach((em, index) => {
      ae = index == data.additional_emails.length - 1 ? ae.concat(`${em}`) : ae.concat(`${em},`);
    });
    let form: FormGroup = this.builder.group({
      'name': [data.name, [Validators.required]],
      'export_type': [data.export_type, [Validators.required]],
      'execute_immediately': [data.execute_immediately],
      'schedule_time': [moment(data.schedule_time, 'HH:mm:ss'), [Validators.required]],
      'is_repeats': [data.is_repeats],
      'repeats_hr': [{ value: data.repeats_hr, disabled: data.is_repeats ? false : true }, [Validators.required]], // Disable initially
      'repeats_mn': [{ value: data.repeats_mn, disabled: data.is_repeats ? false : true }, [Validators.required]], // Disable initially
      'repeats_until': [{ value: data.repeats_until ? data.repeats_until : '' , disabled: data.is_repeats ? false : true }, [Validators.required]], // Disable initially
      'recurrence_pattern': [data.recurrence_pattern, [Validators.required]],
      'range_of_recurrence': [moment(data.range_of_recurrence), [Validators.required]],
      'schedule_on': [moment(data.scheduled_on)],
      'ends': [data.ends ? moment(data.ends) : null, [Validators.required]],
      'occurs': [data.occurs == -1 ? '' : data.occurs, [Validators.required]],
      'report_name': [data.report_name],
      'uuid': [data.uuid],
      'recipient_emails': [data.recipient_emails[0]],
      'additional_emails': [data.additional_emails.length ? ae : '' , [MultiEmailValidator]],
      'radioOptions': [],
    });
    return form;
  }

  resetScheduleFormErrors() {
    return {
      'name': '',
      'export_type': '',
      'schedule_time': '',
      'recurrence_pattern': '',
      'range_of_recurrence': '',
      'radioOptions': '',
      'report_name': '',
      'recipient_emails': '',
      'additional_emails': ''
    };
  }

  scheduleFormMessages = {
    'name': {
      'required': 'Schedule name is required'
    },
    'export_type': {
      'required': 'Type of Report is Required.'
    },
    'schedule_time': {
      'required': 'Valid time selection is required to schedule report.',
      'owlDateTimeParse': 'Enter valid time to schedule report.'
    },
    'recurrence_pattern': {
      'required': 'Recurrence Pattern is required for a Report.'
    },
    'range_of_recurrence': {
      'required': 'Valid date selection is required to schedule report.',
      'owlDateTimeParse': 'Enter valid date to schedule report.'
    },
    'radioOptions': {
      'required': 'Select a schedule ending range.'
    },
    'report_name': {
      'required': 'Report name is required.'
    },
    'recipient_emails': {
      'required': 'Recipients should be selected.'
    },
    'additional_emails': {
      'invalidEmail': 'Enter valid emails seperated by comma without space.'
    },
  }

  addSchedule(obj: ManageReportScheduleCRUDType) {
    return this.http.post(CREATE_SCHEDULES_FOR_REPORTS(), obj);
  }

  editSchedule(obj: ManageReportScheduleCRUDType) {
    return this.http.patch(UPDATE_SCHEDULES_FOR_REPORTS(obj.uuid), obj);
  }
}

// export interface ManageReportScheduleCRUDType {
//   recipient_emails: string[];
//   additional_emails: string[];
//   uuid: string;
//   name: string;
//   frequency: string;
//   scheduled_day: string;
//   scheduled_time: string;
//   report_meta: any;
//   created_at: string;
//   updated_at: string;
//   enable: boolean;
//   attachment: boolean;
// }

export interface ManageReportScheduleCRUDType {
  uuid?: string;
  name: string;
  export_type: string;
  execute_immediately: boolean;
  schedule_time: string;
  is_repeats: boolean;
  repeats_hr: number;
  repeats_mn: number;
  repeats_until: number;
  recurrence_pattern: string;
  range_of_recurrence: string;
  ends: string | null;
  scheduled_on?: string;
  report_name: number;
  recipient_emails: string[];
  additional_emails: string[];
  occurs: number;
}

export enum ReportScheduleIntervals {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY'
}