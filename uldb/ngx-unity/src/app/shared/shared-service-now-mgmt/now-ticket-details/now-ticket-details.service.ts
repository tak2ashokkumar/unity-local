import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_SERVICE_NOW_ATTACHMENTS_BY_TICKET_ID, GET_SERVICE_NOW_COMMENTS_BY_TICKET_ID, GET_SERVICE_NOW_TICKET_BY_ID, PUT_SERVICE_NOW_TICKET_BY_ID } from '../../api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from '../../app-utility/app-utility.service';
import { TaskStatus } from '../../SharedEntityTypes/task-status.type';
import { ServiceNowAttachmentsType, ServiceNowComments, ServiceNowTicketType } from '../service-now-ticket-type';

@Injectable()
export class NowTicketDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getTicketData(instanceId: string, ticketId: string, type: string): Observable<ServiceNowTicketType> {
    return this.http.get<ServiceNowTicketType>(GET_SERVICE_NOW_TICKET_BY_ID(instanceId, ticketId, type));
  }

  getAttachments(instanceId: string, ticketId: string): Observable<ServiceNowAttachmentsType[]> {
    return this.http.get<ServiceNowAttachmentsType[]>(GET_SERVICE_NOW_ATTACHMENTS_BY_TICKET_ID(instanceId, ticketId));
  }

  getComments(instanceId: string, ticketId: string): Observable<ServiceNowComments[]> {
    return this.http.get<ServiceNowComments[]>(GET_SERVICE_NOW_COMMENTS_BY_TICKET_ID(instanceId, ticketId));
  }

  converToViewData(ticket: ServiceNowTicketType): ServiceNowTicketDetailsViewData {
    let a: ServiceNowTicketDetailsViewData = new ServiceNowTicketDetailsViewData();
    a.ticketId = ticket.number ? ticket.number.display_value : '';
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
    a.resolvedAt = ticket.resolved_at && ticket.resolved_at.value ? this.utilSvc.toUnityOneDateFormat(ticket.resolved_at.value) : a.state;
    a.updatedOn = ticket.sys_updated_on && ticket.sys_updated_on.value ? this.utilSvc.toUnityOneDateFormat(ticket.sys_updated_on.value) : '';
    return a;
  }

  converToAttachementViewdata(attachments: ServiceNowAttachmentsType[]): ServiceNowAttachmentViewdata[] {
    let viewData = [];
    attachments.map(attachment => {
      let a = new ServiceNowAttachmentViewdata();
      a.fileName = attachment.file_name;
      a.downloadLink = attachment.download_link;
      a.attachmentId = attachment.sys_id;
      viewData.push(a);
    });
    return viewData;
  }

  convertToCommentViewData(comments: ServiceNowComments[]): ServiceNowCommentViewdata[] {
    let viewData: ServiceNowCommentViewdata[] = [];
    comments.map(comment => {
      let data = new ServiceNowCommentViewdata();
      data.createdBy = comment.sys_created_by ? comment.sys_created_by.display_value : 'N/A';
      data.createdOn = comment.sys_created_on && comment.sys_created_on.value ? this.utilSvc.toUnityOneDateFormat(comment.sys_created_on.value) : 'N/A';
      data.value = comment.value ? comment.value.display_value.replace(/(?:\r\n|\r|\n)/g, '<br>') : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }

  resetFormErrors(): any {
    let formErrors = {
      'comments': ''
    };
    return formErrors;
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

  postComment(instanceId: string, ticketId: string, type: string, data: { comments: string }): Observable<TaskStatus> {
    return this.http.put<any>(PUT_SERVICE_NOW_TICKET_BY_ID(instanceId, type, ticketId), data);
  }
}
export class ServiceNowTicketDetailsViewData {
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
  url: string;

}
export class ServiceNowAttachmentViewdata {
  fileName: string;
  downloadLink: string;
  attachmentId: string;
}

export class ServiceNowCommentViewdata {
  value: string;
  createdOn: string;
  createdBy: string;
}