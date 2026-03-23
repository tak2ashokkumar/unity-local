import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { DYNAMICCRM_FEEDBACK_TICKET_BY_TICKET_ID, DYNAMICCRM_FEEDBACK_TICKET_CANCEL, DYNAMICCRM_FEEDBACK_TICKET_NOTE_ATTACHMENTS, DYNAMICCRM_FEEDBACK_TICKET_NOTES, DYNAMICCRM_FEEDBACK_TICKET_REACTIVATE, DYNAMICCRM_FEEDBACK_TICKET_RESOLVE, DYNAMICCRM_FEEDBACK_TICKET_TIMELINE, DYNAMICCRM_NOTES, DYNAMICCRM_TICKET_BY_TICKET_ID, DYNAMICCRM_TICKET_CANCEL, DYNAMICCRM_TICKET_NOTE_ATTACHMENTS, DYNAMICCRM_TICKET_REACTIVATE, DYNAMICCRM_TICKET_RESOLVE, DYNAMICCRM_TIMELINE, GET_DYNAMIC_CRM_FEEDBACK_TICKET_RESOLUTION_TYPES, GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATES, GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATUS, GET_DYNAMIC_CRM_TICKET_RESOLUTION_TYPES, GET_DYNAMIC_CRM_TICKET_STATES, GET_DYNAMIC_CRM_TICKET_STATUS } from '../../api-endpoint.const';
import { AppUtilityService } from '../../app-utility/app-utility.service';
import { DynamicCrmFeedbackTicketResolutionType, DynamicCrmFeedbackTicketStateType, DynamicCrmFeedbackTicketStatusType, DynamicCrmTicketResolutionType, DynamicCrmTicketStateType, DynamicCrmTicketStatusType } from '../../SharedEntityTypes/crm.type';
import { TaskStatus } from '../../SharedEntityTypes/task-status.type';
import { MSDynamicsTicketNotesAttachmentType, MSDynamicsTicketTimelineType, MSDynamicsTicketType } from '../ms-dynamics-ticket-type';

@Injectable()
export class MsDynamicsTcktDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,) { }

  getTicketData(instanceId: string, ticketId: string): Observable<MSDynamicsTicketType> {
    if (instanceId) {
      return this.http.get<MSDynamicsTicketType>(DYNAMICCRM_TICKET_BY_TICKET_ID(instanceId, ticketId));
    } else {
      return this.http.get<MSDynamicsTicketType>(DYNAMICCRM_FEEDBACK_TICKET_BY_TICKET_ID(ticketId));
    }
  }

  getStates(instanceId: string): Observable<DynamicCrmTicketStateType[] | DynamicCrmFeedbackTicketStateType[]> {
    if (instanceId) {
      return this.http.get<DynamicCrmTicketStateType[]>(GET_DYNAMIC_CRM_TICKET_STATES(instanceId));
    } else {
      return this.http.get<DynamicCrmFeedbackTicketStateType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATES());
    }
  }

  getResolutionTypes(instanceId: string, resolvedStateVal: number): Observable<DynamicCrmTicketResolutionType[] | DynamicCrmFeedbackTicketResolutionType[]> {
    if (instanceId) {
      return this.http.get<DynamicCrmTicketResolutionType[]>(GET_DYNAMIC_CRM_TICKET_RESOLUTION_TYPES(instanceId, resolvedStateVal));
    } else {
      return this.http.get<DynamicCrmFeedbackTicketResolutionType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_RESOLUTION_TYPES(resolvedStateVal));
    }
  }

  getStatus(instanceId: string, canceldStateVal: number): Observable<DynamicCrmTicketStatusType[] | DynamicCrmFeedbackTicketStatusType[]> {
    if (instanceId) {
      return this.http.get<DynamicCrmTicketStatusType[]>(GET_DYNAMIC_CRM_TICKET_STATUS(instanceId, canceldStateVal));
    } else {
      return this.http.get<DynamicCrmFeedbackTicketStatusType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATUS(canceldStateVal));
    }
  }

  converToViewData(ticket: MSDynamicsTicketType): MSDynamicsTicketDetailsViewData {
    let a: MSDynamicsTicketDetailsViewData = new MSDynamicsTicketDetailsViewData();
    a.ticketId = ticket.ticket_uuid;
    a.ticketNumber = ticket.ticket_number ? ticket.ticket_number : '';
    a.ticketType = ticket.ticket_type;
    a.ticketOwner = ticket.ticket_owner;
    a.title = ticket.title ? ticket.title : 'N/A';
    a.description = ticket.description ? ticket.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
    a.status = ticket.status ? ticket.status : 'N/A';;
    a.statusReason = ticket.status_reason ? ticket.status_reason : 'N/A';
    a.priority = ticket.priority;
    a.openedAt = ticket.created_on ? this.utilSvc.toUnityOneDateFormat(ticket.created_on) : '';
    a.updatedOn = ticket.modified_on ? this.utilSvc.toUnityOneDateFormat(ticket.modified_on) : '';
    return a;
  }

  getTicketTimeline(instanceId: string, ticketId: string): Observable<MSDynamicsTicketTimelineType[]> {
    if (instanceId) {
      return this.http.get<MSDynamicsTicketTimelineType[]>(DYNAMICCRM_TIMELINE(instanceId, ticketId));
    } else {
      return this.http.get<MSDynamicsTicketTimelineType[]>(DYNAMICCRM_FEEDBACK_TICKET_TIMELINE(ticketId));
    }
  }

  convertToTimelineViewData(timeline: MSDynamicsTicketTimelineType[]): MSDynamicsTicketTimelineViewData[] {
    let viewData: MSDynamicsTicketTimelineViewData[] = [];
    timeline.map(t => {
      let n: MSDynamicsTicketTimelineViewData = new MSDynamicsTicketTimelineViewData();
      n.uuid = t.uuid;
      n.entity = t.entity;
      n.type = t.activity_type ? t.activity_type : t.entity.toLowerCase();

      n.subject = t.subject;
      n.description = t.description;
      n.state = t.state;
      n.status = t.status;
      n.senderMail = t.sender_mail;
      n.text = t.text;
      n.isDocument = t.is_document == "True" ? true : false;
      n.fileName = t.file_name;
      n.fileType = t.file_type;

      n.createdBy = t.created_by;
      n.modifiedBy = t.modified_by;
      n.createdOn = t.created_on ? this.utilSvc.toUnityOneDateFormat(t.created_on) : '';
      n.modifiedOn = t.modified_on ? this.utilSvc.toUnityOneDateFormat(t.modified_on) : '';
      viewData.push(n);
    })
    return viewData;
  }

  getAttachments(instanceId: string, noteId: string): Observable<Map<string, MSDynamicsTicketNotesAttachmentType>> {
    let url: string;
    if (instanceId) {
      url = DYNAMICCRM_TICKET_NOTE_ATTACHMENTS(instanceId, noteId);
    } else {
      url = DYNAMICCRM_FEEDBACK_TICKET_NOTE_ATTACHMENTS(noteId);
    }
    return this.http.get<MSDynamicsTicketNotesAttachmentType>(url)
      .pipe(
        map((res: any) => {
          return new Map<string, MSDynamicsTicketNotesAttachmentType>().set(noteId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, MSDynamicsTicketNotesAttachmentType>().set(noteId, null));
        })
      );
  }

  buildAttachmentForm() {
    return this.builder.group({});
  }

  resetNoteFormErrors(): any {
    let formErrors: any = {
      'subject': '',
      'description': '',
    };
    return formErrors;
  }

  noteFormValidationMessages = {
    'subject': {
      'required': 'Note title is required'
    },
    'description': {
      'required': 'Note description is required'
    },
  };

  buildNoteForm(ticketId: string): FormGroup {
    this.resetNoteFormErrors();
    return this.builder.group({
      'ticket_uuid': [ticketId],
      'subject': ['', [Validators.required]],
      'description': ['', [Validators.required]],
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

  buildResolveForm(): FormGroup {
    this.resetNoteFormErrors();
    return this.builder.group({
      'resolution_type': ['', [Validators.required]],
      'resolution': ['', [Validators.required]],
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

  buildCancelForm(): FormGroup {
    this.resetNoteFormErrors();
    return this.builder.group({
      'cancel_status': ['', [Validators.required]]
    });
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

  addNote(instanceId: string, formData: any): Observable<TaskStatus> {
    if (instanceId) {
      return this.http.post<any>(DYNAMICCRM_NOTES(instanceId), formData);
    } else {
      return this.http.post<any>(DYNAMICCRM_FEEDBACK_TICKET_NOTES(), formData);
    }
  }

  resolve(instanceId: string, ticketId: string, formData: any): Observable<TaskStatus> {
    if (instanceId) {
      return this.http.post<any>(DYNAMICCRM_TICKET_RESOLVE(instanceId, ticketId), formData);
    } else {
      return this.http.post<any>(DYNAMICCRM_FEEDBACK_TICKET_RESOLVE(ticketId), formData);
    }
  }

  cancel(instanceId: string, ticketId: string, cancelledStateVal: number, formData: any): Observable<TaskStatus> {
    if (instanceId) {
      return this.http.patch<any>(DYNAMICCRM_TICKET_CANCEL(instanceId, ticketId, cancelledStateVal), formData);
    } else {
      return this.http.patch<any>(DYNAMICCRM_FEEDBACK_TICKET_CANCEL(ticketId, cancelledStateVal), formData);
    }
  }

  reactivate(instanceId: string, ticketId: string, activeStateVal: number): Observable<TaskStatus> {
    if (instanceId) {
      return this.http.patch<any>(DYNAMICCRM_TICKET_REACTIVATE(instanceId, ticketId, activeStateVal), null);
    } else {
      return this.http.patch<any>(DYNAMICCRM_FEEDBACK_TICKET_REACTIVATE(ticketId, activeStateVal), null);
    }
  }

  changePriority(instanceId: string, ticketId: string, data: { priority: string }) {
    if (instanceId) {
      return this.http.put<any>(DYNAMICCRM_TICKET_BY_TICKET_ID(instanceId, ticketId), data);
    } else {
      return this.http.put<any>(DYNAMICCRM_FEEDBACK_TICKET_BY_TICKET_ID(ticketId), data);
    }
  }
}

export class MSDynamicsTicketDetailsViewData {
  constructor() { }
  ticketId: string;
  ticketType: string;
  ticketNumber: string;
  ticketOwner: string;
  title: string;
  status: string;
  statusReason: string;
  priority: string = null;
  description: string;

  openedAt: string;
  updatedOn: string;
  url: string;
}

export class MSDynamicsTicketTimelineViewData {
  constructor() { }
  uuid: string;
  entity: string;
  type: string;

  subject?: string; //for entity types note and ACTIVITY
  description?: string;

  state?: string; //only for entity type ACTIVITY
  status?: string;
  senderMail?: string;

  isDocument: boolean; //only for entity type Note
  fileName: string;
  fileType: string;
  fileUrl: string = null;

  text?: string; //only for entity type POST

  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
}

export class MSDynamicsTicketAttachmentViewdata {
  fileName: string;
  downloadLink: string;
  attachmentId: string;
}

export class MSDynamicsTicketCommentsViewdata {
  value: string;
  createdOn: string;
  createdBy: string;
}

export enum MSDynamicsTicketTimelineTypes {
  EMAIL = 'Email',
  TASK = 'Task',
  NOTE = 'note',
  POST = 'post',
  CASE = 'Case Resolution'
}

export enum MSDynamicsTicketStatesName {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  CANCELLED = 'Cancelled'
}