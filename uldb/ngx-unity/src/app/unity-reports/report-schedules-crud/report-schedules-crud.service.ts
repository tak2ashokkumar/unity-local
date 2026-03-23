import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LIST_USER, REPORT_SCHDULES, REPORT_SCHDULES_BY_ID } from 'src/app/shared/api-endpoint.const';
import { ReportSchedule } from '../report-schedules/report-schedule.type';
import * as moment from 'moment';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';

@Injectable()
export class ReportSchedulesCrudService {
  private addOrEditAnnouncedSource = new Subject<{ uuid: string, data: any }>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(uuid: string, data: any) {
    this.addOrEditAnnouncedSource.next({ uuid: uuid, data: data });
  }

  deleteSchedule(uuid: string) {
    this.deleteAnnouncedSource.next(uuid);
  }

  getUsers(): Observable<UnitySetupUser[]> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<UnitySetupUser[]>(LIST_USER(), { params: param });
  }

  getScheduleById(uuid: string) {
    return this.http.get<ReportSchedule>(REPORT_SCHDULES_BY_ID(uuid));
  }


  resetScheduleFormErrors() {
    return {
      'name': '',
      'frequency': '',
      'scheduled_day': '',
      'scheduled_time': ''
    };
  }

  scheduleFormMessages = {
    'name': {
      'required': 'Name is required'
    },
    'frequency': {
      'required': 'Schedule is required to send report on selected time.'
    },
    'scheduled_day': {
      'required': 'Valid day selection is required to schedule report.'
    },
    'scheduled_time': {
      'owlDateTimeParse': 'Enter valid time to schedule report.'
    }
  }

  createScheduleForm(uuid: string) {
    if (uuid) {
      return this.getScheduleById(uuid).pipe(map(data => {
        let ae = '';
        data.additional_emails.forEach((em, index) => {
          ae = index == data.additional_emails.length - 1 ? ae.concat(`${em}`) : ae.concat(`${em},`);
        });
        let form: FormGroup = this.builder.group({
          'uuid': [data.uuid],
          'name': [data.name, [Validators.required]],
          'frequency': [data.frequency],
          'recipient_emails': [data.recipient_emails],
          'attachment': [data.attachment],
          'additional_emails': [ae],
          'report_meta': [data.report_meta]
        });
        if (data.frequency) {
          if (data.frequency == ReportScheduleIntervals.WEEKLY) {
            form.addControl('scheduled_day', new FormControl(data.scheduled_day, [Validators.required]));
          }
          form.addControl('scheduled_time', new FormControl(data ? moment(data.scheduled_time.replace(/\s/g, "T")) : '', [Validators.required]));
        }
        return form;
      }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required]],
        'frequency': [''],
        'recipient_emails': [[]],
        'attachment': [false],
        'additional_emails': ['']
      }));
    }
  }

  addSchedule(obj: ReportSchedule) {
    return this.http.post(REPORT_SCHDULES(), obj);
  }

  editSchedule(uuid: string, obj: ReportSchedule) {
    return this.http.put(REPORT_SCHDULES_BY_ID(uuid), obj);
  }

  confirmDelete(uuid: string) {
    return this.http.delete(REPORT_SCHDULES_BY_ID(uuid));
  }

}

export enum ReportScheduleIntervals {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY'
}
