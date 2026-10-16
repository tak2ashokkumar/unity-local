import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MTPServiceNowAttachmentsType, MTPServiceNowComments, MTPServiceNowTicketType, MTPServiceNowWorklogs } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { GET_SERVICE_NOW_TENANT_ATTACHMENTS_BY_TICKET_ID, GET_SERVICE_NOW_TENANT_COMMENTS_BY_TICKET_ID, GET_SERVICE_NOW_TENANT_TICKET_BY_ID, GET_SERVICE_NOW_TENANT_WORKLOGS_BY_TICKET_ID, PUT_SERVICE_NOW_TENANT_TICKET_COMMENT, PUT_SERVICE_NOW_TENANT_WORKLOG } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class MtpServicenowTicketDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getTicketData(tenantId: string, ticketId: string, ticketType: string): Observable<MTPServiceNowTicketType> {
    return this.http.get<MTPServiceNowTicketType>(GET_SERVICE_NOW_TENANT_TICKET_BY_ID(tenantId, ticketId, ticketType));
  }

  getAttachments(tenantId: string, ticketId: string): Observable<MTPServiceNowAttachmentsType[]> {
    return this.http.get<MTPServiceNowAttachmentsType[]>(GET_SERVICE_NOW_TENANT_ATTACHMENTS_BY_TICKET_ID(tenantId, ticketId));
  }

  getComments(tenantId: string, ticketId: string): Observable<MTPServiceNowComments[]> {
    return this.http.get<MTPServiceNowComments[]>(GET_SERVICE_NOW_TENANT_COMMENTS_BY_TICKET_ID(tenantId, ticketId));
  }

  getWorklogs(tenantId: string, ticketId: string): Observable<MTPServiceNowWorklogs[]> {
    return this.http.get<MTPServiceNowWorklogs[]>(GET_SERVICE_NOW_TENANT_WORKLOGS_BY_TICKET_ID(tenantId, ticketId));
  }

  converToViewData(ticket: MTPServiceNowTicketType): MTPServiceNowTicketDetailsViewData {
    let a: MTPServiceNowTicketDetailsViewData = new MTPServiceNowTicketDetailsViewData();
    a.ticketId = ticket.task_effective_number ? ticket.task_effective_number.display_value : '';
    a.type = ticket.sys_class_name ? ticket.sys_class_name.value : null;
    a.displayType = ticket.sys_class_name ? ticket.sys_class_name.display_value : null;
    a.shortDescription = ticket.short_description ? ticket.short_description.display_value : '';
    a.description = ticket.description ? ticket.description.display_value.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
    a.state = ticket.state ? ticket.state.display_value : '';
    a.priority = ticket.priority ? ticket.priority.display_value : '';
    a.urgency = ticket.urgency ? ticket.urgency.display_value || 'N/A' : '';
    a.severity = ticket.severity ? ticket.severity.display_value || 'N/A' : '';
    a.impact = ticket.impact ? ticket.impact.display_value || 'N/A' : '';
    a.sysId = ticket.sys_id ? ticket.sys_id.value : '';
    a.openedAt = ticket.opened_at && ticket.opened_at.value ? this.utilSvc.toUnityOneDateFormat(ticket.opened_at.value) : '';
    a.resolvedAt = ticket.resolved_at && ticket.resolved_at.value ? this.utilSvc.toUnityOneDateFormat(ticket.resolved_at.value) : '';
    a.updatedOn = ticket.sys_updated_on && ticket.sys_updated_on.value ? this.utilSvc.toUnityOneDateFormat(ticket.sys_updated_on.value) : '';
    return a;
  }

  converToAttachementViewdata(attachments: MTPServiceNowAttachmentsType[]): MTPServiceNowAttachmentViewdata[] {
    let viewData: MTPServiceNowAttachmentViewdata[] = [];
    attachments.map(attachment => {
      let a = new MTPServiceNowAttachmentViewdata();
      a.fileName = attachment.file_name;
      a.downloadLink = attachment.download_link;
      a.attachmentId = attachment.sys_id;
      viewData.push(a);
    });
    return viewData;
  }

  convertToCommentViewData(comments: MTPServiceNowComments[]): MTPServiceNowCommentViewdata[] {
    let viewData: MTPServiceNowCommentViewdata[] = [];
    comments.map(comment => {
      let data = new MTPServiceNowCommentViewdata();
      data.createdBy = comment.sys_created_by ? comment.sys_created_by.display_value : 'N/A';
      data.createdOn = comment.sys_created_on && comment.sys_created_on.value ? this.utilSvc.toUnityOneDateFormat(comment.sys_created_on.value) : 'N/A';
      data.value = comment.value ? comment.value.display_value.replace(/(?:\r\n|\r|\n)/g, '<br>') : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }

  convertToWorklogViewData(worklogs: MTPServiceNowWorklogs[]): MTPServiceNowWorklogViewdata[] {
    let viewData: MTPServiceNowWorklogViewdata[] = [];
    worklogs.map(worklog => {
      let data = new MTPServiceNowWorklogViewdata();
      data.createdBy = worklog.sys_created_by ? worklog.sys_created_by.display_value : 'N/A';
      data.createdOn = worklog.sys_created_on && worklog.sys_created_on.value ? this.utilSvc.toUnityOneDateFormat(worklog.sys_created_on.value) : 'N/A';
      data.value = worklog.value ? worklog.value.display_value.replace(/(?:\r\n|\r|\n)/g, '<br>') : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }

  resetFormErrors(): any {
    return {
      'comments': ''
    };
  }

  validationMessages = {
    'comments': {
      'required': 'Comment is required'
    }
  };

  buildForm(): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'comments': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  postComment(tenantId: string, ticketId: string, ticketType: string, data: { comments: string }): Observable<TaskStatus> {
    return this.http.put<TaskStatus>(PUT_SERVICE_NOW_TENANT_TICKET_COMMENT(tenantId, ticketType, ticketId), data);
  }

  resetWorklogFormErrors(): any {
    return {
      'work_notes': ''
    };
  }

  worklogValidationMessages = {
    'work_notes': {
      'required': 'Work note is required'
    }
  };

  buildWorklogForm(): FormGroup {
    this.resetWorklogFormErrors();
    return this.builder.group({
      'work_notes': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  postWorklog(tenantId: string, ticketId: string, ticketType: string, data: { work_notes: string }): Observable<TaskStatus> {
    return this.http.put<TaskStatus>(PUT_SERVICE_NOW_TENANT_WORKLOG(tenantId, ticketType, ticketId), data);
  }
}

export class MTPServiceNowTicketDetailsViewData {
  ticketId: string;
  type: string;
  displayType: string;
  sysId: string;
  state: string;
  priority: string;
  shortDescription: string;
  description: string;
  urgency: string;
  severity: string;
  impact: string;
  openedAt: string;
  resolvedAt: string;
  updatedOn: string;
}

export class MTPServiceNowAttachmentViewdata {
  fileName: string;
  downloadLink: string;
  attachmentId: string;
}

export class MTPServiceNowCommentViewdata {
  value: string;
  createdOn: string;
  createdBy: string;
}

export class MTPServiceNowWorklogViewdata {
  value: string;
  createdOn: string;
  createdBy: string;
}
