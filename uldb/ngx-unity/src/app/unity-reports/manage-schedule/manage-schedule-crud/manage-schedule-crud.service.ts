import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ALL_REPORTS_BY_FEATURE,
  CREATE_SCHEDULES_FOR_REPORTS,
  GET_SCHEDULE_BY_ID,
  LIST_USER,
  UPDATE_SCHEDULES_FOR_REPORTS,
} from 'src/app/shared/api-endpoint.const';
import {
  AppUtilityService,
  MultiEmailValidator,
} from 'src/app/shared/app-utility/app-utility.service';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';

/**
 * Provides API access, form construction, and data mapping helpers for Manage Schedule Crud.
 */
@Injectable()
export class ManageScheduleCrudService {

  constructor(
    private builder: FormBuilder,
    private utilService: AppUtilityService,
    private http: HttpClient) { }

  /**
   * Loads users available for schedule recipients.
   *
   * @returns Observable containing organization users.
   */
  getUsers(): Observable<UnitySetupUser[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<UnitySetupUser[]>(LIST_USER(), { params });
  }

  /**
   * Loads a schedule by identifier.
   *
   * @param uuid - Schedule identifier used to load edit data.
   * @returns Observable containing the schedule details.
   */
  getScheduleById(uuid: string): Observable<ManageReportScheduleCRUDType> {
    return this.http.get<ManageReportScheduleCRUDType>(
      GET_SCHEDULE_BY_ID(uuid)
    );
  }

  /**
   * Loads reports available for the selected feature.
   *
   * @param feature - Report feature name used to scope the request.
   * @returns Observable containing matching reports.
   */
  getReports(feature: string): Observable<ManageReportScheduleCRUDType[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<ManageReportScheduleCRUDType[]>(
      ALL_REPORTS_BY_FEATURE(feature),
      { params }
    );
  }

  /**
   * Stores validation message text used by the schedule form validation helper.
   */
  readonly scheduleFormMessages: ScheduleValidationMessages = {
    name: {
      required: 'Schedule name is required',
    },
    export_type: {
      required: 'Type of Report is Required.',
    },
    schedule_time: {
      required: 'Valid time selection is required to schedule report.',
      owlDateTimeParse: 'Enter valid time to schedule report.',
    },
    recurrence_pattern: {
      required: 'Recurrence Pattern is required for a Report.',
    },
    range_of_recurrence: {
      required: 'Valid date selection is required to schedule report.',
      owlDateTimeParse: 'Enter valid date to schedule report.',
    },
    radioOptions: {
      required: 'Select a schedule ending range.',
    },
    report_name: {
      required: 'Report name is required.',
    },
    recipient_emails: {
      required: 'Recipients should be selected.',
    },
    additional_emails: {
      invalidEmail: 'Enter valid emails seperated by comma without space.',
    },
  };

  /**
   * Creates the reactive form used by create and edit schedule workflows.
   *
   * @param uuid - Schedule identifier for edit mode.
   * @param date - Display date used to initialize create mode.
   * @returns Observable containing the initialized form.
   */
  createScheduleForm(uuid: string, date: string): Observable<FormGroup> {
    if (uuid) {
      return this.getScheduleById(uuid).pipe(
        map((data) => this.updateScheduleForm(data))
      );
    }

    return of(
      this.builder.group({
        name: ['', [Validators.required]],
        export_type: ['', [Validators.required]],
        execute_immediately: [false],
        schedule_time: ['', [Validators.required]],
        is_repeats: [false],
        repeats_hr: [{ value: '', disabled: true }, [Validators.required]],
        repeats_mn: [{ value: '', disabled: true }, [Validators.required]],
        repeats_until: [{ value: '', disabled: true }, [Validators.required]],
        recurrence_pattern: ['', [Validators.required]],
        schedule_on: [{ value: date, disabled: true }],
        range_of_recurrence: ['', [Validators.required]],
        ends: ['', [Validators.required]],
        occurs: ['', [Validators.required]],
        report_name: ['', [Validators.required]],
        recipient_emails: [null, [Validators.required]],
        additional_emails: ['', [MultiEmailValidator]],
        radioOptions: ['never', [Validators.required]],
      })
    );
  }

  /**
   * Converts schedule form data into the backend schedule payload.
   *
   * @param formData - Raw form data from the reactive form.
   * @returns Backend schedule payload.
   */
  getScheduleTypeFromFormdata(formData: ScheduleFormRawValue): ManageReportScheduleCRUDType {
    const additionalEmails = this.parseAdditionalEmails(formData.additional_emails);
    const data: ManageReportScheduleCRUDType = {
      name: formData.name,
      export_type: formData.export_type,
      execute_immediately: formData.execute_immediately,
      schedule_time: this.utilService.getUTCDateInUserSetTimeZone(formData.schedule_time).format('HH:mm:ss'),
      is_repeats: formData.is_repeats,
      repeats_hr: formData.is_repeats ? Number(formData.repeats_hr) : 0,
      repeats_mn: formData.is_repeats ? Number(formData.repeats_mn) : 0,
      repeats_until: formData.is_repeats ? Number(formData.repeats_until) : 0,
      recurrence_pattern: formData.recurrence_pattern,
      range_of_recurrence: this.utilService.getUTCDateInUserSetTimeZone(formData.range_of_recurrence).format('YYYY-MM-DD'),
      ends: formData.ends === '' ? null : this.utilService.getUTCDateInUserSetTimeZone(formData.ends).format('YYYY-MM-DDTHH:mm:ss'),
      occurs: formData.occurs === '' ? -1 : Number(formData.occurs),
      report_name: formData.report_name,
      recipient_emails: formData.recipient_emails,
      additional_emails: additionalEmails,
    };

    if (formData.uuid) {
      data.uuid = formData.uuid;
    }

    return data;
  }

  /**
   * Builds the edit-mode form from an existing schedule payload.
   *
   * @param data - Schedule details returned by the API.
   * @returns Initialized reactive form.
   */
  updateScheduleForm(data: ManageReportScheduleCRUDType): FormGroup {
    return this.builder.group({
      name: [data.name, [Validators.required]],
      export_type: [data.export_type, [Validators.required]],
      execute_immediately: [data.execute_immediately],
      schedule_time: [
        moment(data.schedule_time, 'HH:mm:ss'),
        [Validators.required],
      ],
      is_repeats: [data.is_repeats],
      repeats_hr: [
        { value: data.repeats_hr, disabled: !data.is_repeats },
        [Validators.required],
      ],
      repeats_mn: [
        { value: data.repeats_mn, disabled: !data.is_repeats },
        [Validators.required],
      ],
      repeats_until: [
        {
          value: data.repeats_until ? data.repeats_until : '',
          disabled: !data.is_repeats,
        },
        [Validators.required],
      ],
      recurrence_pattern: [data.recurrence_pattern, [Validators.required]],
      range_of_recurrence: [
        moment(data.range_of_recurrence),
        [Validators.required],
      ],
      schedule_on: [{ value: moment(data.scheduled_on), disabled: true }],
      ends: [data.ends ? moment(data.ends) : null, [Validators.required]],
      occurs: [data.occurs == -1 ? '' : data.occurs, [Validators.required]],
      report_name: [data.report_name],
      uuid: [data.uuid],
      recipient_emails: [
        data.recipient_emails && data.recipient_emails.length
          ? data.recipient_emails[0]
          : [],
      ],
      additional_emails: [
        this.formatAdditionalEmails(data.additional_emails),
        [MultiEmailValidator],
      ],
      radioOptions: [],
    });
  }

  /**
   * Resets schedule form errors to their default empty state.
   *
   * @returns Empty schedule form error map.
   */
  resetScheduleFormErrors(): ScheduleFormErrors {
    return {
      name: '',
      export_type: '',
      schedule_time: '',
      recurrence_pattern: '',
      range_of_recurrence: '',
      radioOptions: '',
      report_name: '',
      recipient_emails: '',
      additional_emails: '',
    };
  }

  /**
   * Creates a schedule.
   *
   * @param data - Schedule payload to persist.
   * @returns Observable for the create request.
   */
  addSchedule(data: ManageReportScheduleCRUDType): Observable<unknown> {
    return this.http.post(CREATE_SCHEDULES_FOR_REPORTS(), data);
  }

  /**
   * Updates an existing schedule.
   *
   * @param data - Schedule payload to persist.
   * @returns Observable for the update request.
   */
  editSchedule(data: ManageReportScheduleCRUDType): Observable<unknown> {
    return this.http.patch(UPDATE_SCHEDULES_FOR_REPORTS(data.uuid), data);
  }

  private formatAdditionalEmails(emails: string[] = []): string {
    return emails.join(',');
  }

  private parseAdditionalEmails(value: string): string[] {
    return value ? value.split(',') : [];
  }
}

/**
 * Describes the validation error map used by the schedule form template.
 */
export interface ScheduleFormErrors {
  /**
   * Schedule name validation message.
   */
  name: string;

  /**
   * Export type validation message.
   */
  export_type: string;

  /**
   * Schedule time validation message.
   */
  schedule_time: string;

  /**
   * Recurrence pattern validation message.
   */
  recurrence_pattern: string;

  /**
   * Range start date validation message.
   */
  range_of_recurrence: string;

  /**
   * End-condition validation message.
   */
  radioOptions: string;

  /**
   * Report selection validation message.
   */
  report_name: string;

  /**
   * Recipient selection validation message.
   */
  recipient_emails: string;

  /**
   * Additional email validation message.
   */
  additional_emails: string;
}

/**
 * Describes validation messages keyed by form control and validator name.
 */
export type ScheduleValidationMessages = {
  [key in keyof ScheduleFormErrors]: { [validatorName: string]: string };
};

/**
 * Describes the raw value emitted by the schedule form before payload normalization.
 */
export interface ScheduleFormRawValue {
  /**
   * Schedule identifier present in edit mode.
   */
  uuid?: string;

  /**
   * Schedule name.
   */
  name: string;

  /**
   * Export type.
   */
  export_type: string;

  /**
   * Whether the schedule should execute immediately.
   */
  execute_immediately: boolean;

  /**
   * Time picker value for the schedule.
   */
  schedule_time: moment.Moment;

  /**
   * Whether repeat interval controls are enabled.
   */
  is_repeats: boolean;

  /**
   * Repeat interval hours.
   */
  repeats_hr: number | string;

  /**
   * Repeat interval minutes.
   */
  repeats_mn: number | string;

  /**
   * Repeat-until count.
   */
  repeats_until: number | string;

  /**
   * Recurrence pattern.
   */
  recurrence_pattern: string;

  /**
   * Range start date.
   */
  range_of_recurrence: moment.Moment;

  /**
   * End-by date or empty value.
   */
  ends: moment.Moment | '';

  /**
   * Occurrence count or empty value.
   */
  occurs: number | string;

  /**
   * Selected report identifier.
   */
  report_name: number | string;

  /**
   * Selected recipient emails.
   */
  recipient_emails: string[];

  /**
   * Comma-separated additional emails.
   */
  additional_emails: string;
}

/**
 * Describes the schedule CRUD API payload.
 */
export interface ManageReportScheduleCRUDType {
  /**
   * Schedule identifier.
   */
  uuid?: string;

  /**
   * Schedule name.
   */
  name: string;

  /**
   * Export type.
   */
  export_type: string;

  /**
   * Whether the schedule should execute immediately.
   */
  execute_immediately: boolean;

  /**
   * Schedule time in backend format.
   */
  schedule_time: string;

  /**
   * Whether repeat interval values are enabled.
   */
  is_repeats: boolean;

  /**
   * Repeat interval hours.
   */
  repeats_hr: number;

  /**
   * Repeat interval minutes.
   */
  repeats_mn: number;

  /**
   * Repeat-until count.
   */
  repeats_until: number;

  /**
   * Recurrence pattern.
   */
  recurrence_pattern: string;

  /**
   * Range start date in backend format.
   */
  range_of_recurrence: string;

  /**
   * End-by datetime in backend format.
   */
  ends: string | null;

  /**
   * Schedule-on date returned by edit APIs.
   */
  scheduled_on?: string;

  /**
   * Selected report identifier.
   */
  report_name: number | string;

  /**
   * Selected recipient emails.
   */
  recipient_emails: string[];

  /**
   * Additional recipient emails.
   */
  additional_emails: string[];

  /**
   * Occurrence count or -1 for no occurrence limit.
   */
  occurs: number;
}
