import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import * as moment from 'moment';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AppLevelService } from 'src/app/app-level.service';
import { MtpCrmContactsType } from 'src/app/mtp-administration/mtp-administration-service-mgmt/mtp-administration-service-level-agreement/mtp-administration-sla-crud/mtp-administration-sla-crud.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { MTPTicketDetail, MTPTicketDetailNoteAttachmentType, MTPTicketDetailNotes, MTPTicketPriorityType, MTPTicketResolutionType, MTPTicketStage, MTPTicketStateType, MTPTicketStatusType, MTPTicketType } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { GET_MTP_CHANGE_TICKET_STAGES, GET_MTP_TICKET_CANCEL_STATUS, GET_MTP_TICKET_PRIORITIES, GET_MTP_TICKET_RESOLUTION_TYPES, GET_MTP_TICKET_STATES, GET_MTP_TICKET_STATUS, GET_MTP_TICKET_TYPES } from 'src/app/shared/api-endpoint.const';
import { MS_DYNAMICS_TICKET_TYPE, MTPObjectType, NoWhitespaceValidator, changeTicketStatusTypes, incidantTicketStatusTypes } from 'src/app/shared/app-utility/app-utility.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class MtpTicketDetailsService {
  ticketTypeOptions = MS_DYNAMICS_TICKET_TYPE;
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService) { }

  getTicketDetails(instanceId: string, ticketId: string) {
    return this.http.get<MTPTicketDetail>(`customer/mtp_dynamics_crm/instances/${instanceId}/tickets/${ticketId}/`, { headers: Handle404Header })
      .pipe(
        map((res: MTPTicketDetail) => {
          if (res) {
            res.ticketTypeValue = Number(res.ticket_type);
            res.priorityValue = Number(res.priority);
            res.statusReasonValue = Number(res.status_reason);
            res.stageValue = Number(res.change_stage);
          }
          return res;
        })
      );
  }

  getTicketTypes(instanceId: string): Observable<MTPTicketType[]> {
    return this.http.get<MTPTicketType[]>(GET_MTP_TICKET_TYPES(instanceId));
  }

  getTicketStatus(instanceId: string): Observable<MTPTicketStatusType[]> {
    return this.http.get<MTPTicketStatusType[]>(GET_MTP_TICKET_STATUS(instanceId));
  }

  getPriorities(instanceId: string): Observable<MTPTicketPriorityType[]> {
    return this.http.get<MTPTicketPriorityType[]>(GET_MTP_TICKET_PRIORITIES(instanceId));
  }

  getDropdownData(instanceId: string): Observable<{ types: MTPTicketType[], status: MTPTicketStatusType[], priorities: MTPTicketPriorityType[] }> {
    return forkJoin({
      types: this.getTicketTypes(instanceId).pipe(catchError(error => of(undefined))),
      status: this.getTicketStatus(instanceId).pipe(catchError(error => of(undefined))),
      priorities: this.getPriorities(instanceId).pipe(catchError(error => of(undefined))),
    });
  }

  getTicketStages(instanceId: string): Observable<MTPTicketStage[]> {
    return this.http.get<MTPTicketStage[]>(GET_MTP_CHANGE_TICKET_STAGES(instanceId));
  }

  getStates(instanceId: string): Observable<MTPTicketStateType[]> {
    return this.http.get<MTPTicketStateType[]>(GET_MTP_TICKET_STATES(instanceId));
  }

  getResolutionTypes(instanceId: string, resolvedStateVal: number): Observable<MTPTicketResolutionType[]> {
    return this.http.get<MTPTicketResolutionType[]>(GET_MTP_TICKET_RESOLUTION_TYPES(instanceId, resolvedStateVal));
  }

  getCancelStatus(instanceId: string, canceldStateVal: number): Observable<MTPTicketStatusType[]> {
    return this.http.get<MTPTicketStatusType[]>(GET_MTP_TICKET_CANCEL_STATUS(instanceId, canceldStateVal));
  }

  private getInUTC(time: string) {
    return moment.utc(time, 'YYYY-MM-DD HH:mm:ss');
  }

  converToViewData(t: MTPTicketDetail): MTPTicketDetailsViewData {
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    let a: MTPTicketDetailsViewData = new MTPTicketDetailsViewData();
    a.ticketId = t.ticket_uuid;
    a.ticketNumber = t.ticket_number ? t.ticket_number : '';
    a.title = t.title ? t.title : 'Summary';
    a.description = t.description ? t.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
    a.ticketType = t.ticketTypeValue;
    a.priority = t.priorityValue;
    a.status = t.status;
    a.statusReasonName = t.status_reason_name;
    a.statusReason = t.statusReasonValue;

    a.stageName = t.change_stage_name;
    a.stageValue = t.stageValue;
    // a.statusList = this.getStatusListByTicketType(t);
    a.createdOn = t.created_on ? datePipe.transform(t.created_on.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    a.modifiedOn = t.modified_on ? datePipe.transform(t.modified_on.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    a.resolvedOn = t.resolved_on ? datePipe.transform(t.resolved_on.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    a.ticketOwner = t.ticket_owner;
    a.contact = t.contact;
    a.customerId = t.customer_id;
    a.customerName = t.customer_name;
    a.assignee = t.assignee_name;
    a.assigneeId = t.assignee_id ? t.assignee_id.toString() : null;
    a.responseFailureTime = t.response_failure_time;
    a.responseSucceededOn = t.response_succeeded_on;
    a.resolutionFailureTime = t.resolution_failure_time;
    a.resolutionSucceededOn = t.resolution_succeeded_on;
    a.statusChangeTime = t.status_change_time;

    if (t.response_failure_time) {
      if (t.response_succeeded_on) {
        a.responseTime = this.secToTime(moment(t.response_failure_time).diff(moment(t.response_succeeded_on), 's'));
      } else {
        a.responseTime = this.secToTime(moment(t.response_failure_time).diff(moment(), 's'));
      }
    }
    if (t.resolution_failure_time) {
      if (t.resolution_succeeded_on) {
        a.resolutionTime = this.secToTime(moment(t.resolution_failure_time).diff(moment(t.resolution_succeeded_on), 's'));
      } else {
        a.resolutionTime = this.secToTime(moment(t.resolution_failure_time).diff(moment(), 's'));
      }
    }
    a.nextSLA = t.next_sla;
    a.notes = this.convertToTimelineViewData(t.notes);
    return a;
  }

  getStatusListByTicketType(ticket: MTPTicketDetail) {
    switch (ticket.ticket_type) {
      case this.ticketTypeOptions.CHANGE: return _clone(changeTicketStatusTypes);
      default:
        return _clone(incidantTicketStatusTypes);
    }
  }

  secToTime(seconds: number, separator?: string) {
    return [
      Math.floor(seconds / 60 / 60),
      Math.abs(Math.floor(seconds / 60 % 60)),
      Math.abs(Math.floor(seconds % 60))
    ].join(separator ? separator : ':').replace(/\b(\d)\b/g, "0$1").replace(/^00\:/, '')
  }

  getRemainingTime(end: string, doneAt?: string) {
    let remainingSeconds: number = 0;
    if (doneAt) {
      remainingSeconds = moment(end).diff(moment(doneAt), 'seconds');
    } else {
      remainingSeconds = moment(end).diff(moment(), 'seconds');
    }
    return remainingSeconds;
  }

  getSuccessGradient() {
    return `conic-gradient(#0cbb70 0deg 0deg`;
  }

  getFailedGradient() {
    return `conic-gradient(#c00 0deg 0deg`;
  }

  getGradientDonut(start: string, end: string, doneAt?: string) {
    let totalSeconds = moment(end).diff(moment(start), 'seconds');
    let remainingSeconds: number = this.getRemainingTime(end, doneAt);
    let tillNowSeconds = totalSeconds - remainingSeconds;
    let tillNow = 0;
    let fromNow = 0;
    let responseGradient = `conic-gradient(#c00 0deg ${tillNow}deg`;
    if (remainingSeconds > 0) {
      tillNow = (360 / totalSeconds) * tillNowSeconds;
      fromNow = (360 / totalSeconds) * remainingSeconds;
      responseGradient = `conic-gradient(#c8ced3 0deg ${tillNow}deg, #0cbb70 ${tillNow}deg ${fromNow}deg)`;
    }
    return responseGradient;
  }

  convertToTimelineViewData(notes: MTPTicketDetailNotes[]): MTPTicketNoteDetailsViewData[] {
    let viewData: MTPTicketNoteDetailsViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    notes.map(t => {
      let n: MTPTicketNoteDetailsViewData = new MTPTicketNoteDetailsViewData();
      n.uuid = t.uuid;
      n.entity = t.entity;
      n.subject = t.subject;
      n.description = t.description;
      n.isDocument = t.is_document == "True" ? true : false;
      n.fileName = t.file_name;
      n.fileType = t.file_type;

      n.createdBy = t.created_by;
      n.modifiedBy = t.modified_by;
      n.createdOn = t.created_on && t.created_on ? datePipe.transform(this.getInUTC(t.created_on).toDate(), environment.unityDateFormat) : '';
      n.modifiedOn = t.modified_on ? datePipe.transform(this.getInUTC(t.modified_on).toDate(), environment.unityDateFormat) : '';
      viewData.push(n);
    })
    return viewData;
  }

  getAttachments(instanceId: string, noteId: string): Observable<Map<string, MTPTicketDetailNoteAttachmentType>> {
    return this.http.get<MTPTicketDetailNoteAttachmentType>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notes/${noteId}/document/`)
      .pipe(
        map((res: any) => {
          return new Map<string, MTPTicketDetailNoteAttachmentType>().set(noteId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, MTPTicketDetailNoteAttachmentType>().set(noteId, null));
        })
      );
  }

  getInputControlValue(status: string, input: string | number) {
    if (status == 'Problem Solved' || status == 'Close' || status == 'Closed') {
      return { value: input, disabled: true };
    }
    return input;
  }

  buildForm(detail: MTPTicketDetail) {
    let form = this.builder.group({
      'account_id': [detail.customer_id],
      'ticket_number': [{ value: detail.ticket_number, disabled: true }, [Validators.required]],
      'customer_name': [{ value: detail.customer_name, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'ticket_type': [{ value: detail.ticketTypeValue, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'status_reason': [this.getInputControlValue(detail.status_reason_name, detail.statusReasonValue), [Validators.required, NoWhitespaceValidator]],
      'assignee': [detail.assignee_id ? this.getInputControlValue(detail.status_reason_name, detail.assignee_id.toString()) : detail.assignee_id],
      'priority': [this.getInputControlValue(detail.status_reason_name, detail.priorityValue), [Validators.required, NoWhitespaceValidator]],
      'note': ['', [Validators.required, NoWhitespaceValidator]]
    });

    if (detail.change_stage) {
      form.addControl('change_stage', new FormControl(detail.stageValue, [Validators.required, NoWhitespaceValidator]))
    }

    return form;
  }

  resetFormErrors(): any {
    let formErrors: any = {
      'status_reason': '',
      'assignee': '',
      'priority': '',
      'change_stage': '',
      'note': '',
    };
    return formErrors;
  }

  formValidationMessages = {
    'status_reason': {
      'required': 'Status is required'
    },
    'assignee': {
      'required': 'Assignee is required'
    },
    'priority': {
      'required': 'Priority is required'
    },
    'change_stage': {
      'required': 'Ticket Stage is required'
    },
    'note': {
      'required': 'Note is required'
    },
  };

  getContacts(instanceId: string, tenantId?: string) {
    let params: HttpParams = new HttpParams();
    if (tenantId) {
      params = params.append('tenant', tenantId);
    }
    // return this.http.get<{ count: number, value: any[] }>(`customer/mtp_dynamics_crm/instances/${instanceId}/tickets/get_contacts/`, { params: params });
    return this.http.get<MtpCrmContactsType[]>(`customer/mtp_dynamics_crm/instances/${instanceId}/crmcontacts/`, { params: params });
  }

  updateTicket(instanceId: string, ticketId: string, formData: any) {
    return this.http.put(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/${ticketId}/`, formData);
  }

  buildResolveForm(customerId: string): FormGroup {
    this.resetNoteFormErrors();
    return this.builder.group({
      'account_id': [customerId],
      'resolution_type': ['', [Validators.required]],
      'resolution': ['', [Validators.required]],
    });
  }

  resetResolveFormErrors(): any {
    let formErrors: any = {
      'resolution_type': '',
      'resolution': '',
    };
    return formErrors;
  }

  resolveFormValidationMessages = {
    'resolution_type': {
      'required': 'Resolution type is required'
    },
    'resolution': {
      'required': 'Resolution is required'
    },
  };

  resolve(instanceId: string, ticketId: string, formData: any): Observable<TaskStatus> {
    return this.http.post<any>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/${ticketId}/resolve/`, formData);
  }

  buildCancelForm(): FormGroup {
    this.resetNoteFormErrors();
    return this.builder.group({
      'cancel_status': ['', [Validators.required]]
    });
  }

  resetCancelFormErrors(): any {
    let formErrors: any = {
      'cancel_status': ''
    };
    return formErrors;
  }

  cancelFormValidationMessages = {
    'cancel_status': {
      'required': 'Cancel status is required'
    }
  };

  cancel(instanceId: string, ticketId: string, cancelledStateVal: number, formData: any): Observable<TaskStatus> {
    return this.http.patch<any>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/${ticketId}/cancel/?state=${cancelledStateVal}`, formData);
  }

  reactivate(instanceId: string, ticketId: string, activeStateVal: number, customerId: string): Observable<TaskStatus> {
    return this.http.patch<any>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/${ticketId}/reactivate/?state=${activeStateVal}`, { 'account_id': customerId });
  }

  buildNoteForm(ticket: MTPTicketDetailsViewData): FormGroup {
    this.resetNoteFormErrors();
    return this.builder.group({
      'ticket_uuid': [ticket.ticketId],
      'account_id': [ticket.customerId],
      'subject': [''],
      'description': ['', [Validators.required]],
      'display_type': ['', [Validators.required]],
    });
  }

  buildAttachmentForm() {
    return this.builder.group({});
  }

  toFormData<T>(formValue: T, formValue1: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }

    for (const key of Object.keys(formValue1)) {
      const value = formValue1[key];
      formData.append(key, this.appService.convertToBinary(value));
    }
    return formData;
  }

  resetNoteFormErrors(): any {
    let formErrors: any = {
      // 'subject': '',
      'description': '',
      'display_type': '',
    };
    return formErrors;
  }

  noteFormValidationMessages = {
    // 'subject': {
    //   'required': 'Note title is required'
    // },
    'description': {
      'required': 'Note description is required'
    },
    'display_type': {
      'required': 'Display type is required'
    },
  };

  addNote(instanceId: string, formData: any): Observable<TaskStatus> {
    return this.http.post<any>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notes/`, formData);
  }
}

export class MTPTicketDetailsViewData {
  constructor() { }
  ticketId: string;
  ticketNumber: string;
  title: string;
  ticketType: number;
  stageValue: number;
  stageName: string;
  priority: number;
  status: string;
  statusReasonName: string;
  statusReason: number;
  statusList: MTPObjectType[] = [];
  createdOn: string;
  modifiedOn: string;
  description: string;
  resolvedOn: string;
  ticketOwner: string;
  contact: string;
  customerId: string;
  customerName: string;
  assignee: string;
  assigneeId: string;
  statusChangeTime: string;

  responseTime: string;
  responseFailureTime: string;
  isResponseSLASucceeded: boolean;
  isResponseSLABreached: boolean;
  responseSucceededOn: string;
  resolutionTime: string;
  resolutionFailureTime: string;
  isResolutionSLASucceeded: boolean;
  isResolutionSLAPaused: boolean;
  isResolutionSLABreached: boolean;
  resolutionSucceededOn: string;
  nextSLA: string;

  notes: MTPTicketNoteDetailsViewData[] = [];
}

export class MTPTicketNoteDetailsViewData {
  uuid: string;
  entity: string;
  subject: string;
  description: string;
  isDocument: boolean;
  fileName: string;
  fileType: string;
  fileUrl: string = null;
  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
}

export interface timeComponents {
  secondsToDday: number;
  minutesToDday: number;
  hoursToDday: number;
  daysToDday: number;
}

export enum MtpTicketStatesName {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  CANCELLED = 'Cancelled'
}

export enum MtpTicketStatusValue {
  NEW = 100000003,
}