import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from '../../app-utility/app-utility.service';
import { JiraTicketDetailsAttachment, JiraTicketDetailsComments, JiraTicketDetailsType, JiraTicketTransition } from '../../SharedEntityTypes/jira.type';

@Injectable()
export class JiraTicketDetailsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,) { }

  getTicketDetails(instanceId: string, ticketId: string): Observable<JiraTicketDetailsType> {
    return this.http.get<JiraTicketDetailsType>(`/customer/jira/instances/${instanceId}/ticket/?ticket_id=${ticketId}`);
  }

  converToViewData(instanceId: string, ticket: JiraTicketDetailsType): JiraTicketDetailsViewData {
    let a: JiraTicketDetailsViewData = new JiraTicketDetailsViewData();
    a.ticketNumber = ticket.ticket_number;
    a.ticketType = ticket.ticket_type ? ticket.ticket_type : null;
    a.title = ticket.title ? ticket.title : 'N/A';
    a.assignedTo = ticket.assigned_to ? ticket.assigned_to.displayName : null;
    a.status = ticket.status;
    a.statusReason = ticket.status_reason;
    a.priority = ticket.priority;
    // a.description = ticket.description ? ticket.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
    a.description = ticket.description && ticket.description.content[0] && ticket.description.content[0].content[0] && ticket.description.content[0].content[0].text;
    a.reportedBy = ticket.reporter;
    a.createdBy = ticket.created_by;
    a.openedAt = ticket.created_on ? this.utilSvc.toUnityOneDateFormat(ticket.created_on) : '';
    a.updatedOn = ticket.modified_on ? this.utilSvc.toUnityOneDateFormat(ticket.modified_on) : '';

    ticket.attachment.forEach(at => {
      a.attachments.push(this.converToAttachmentViewData(instanceId, at));
    })

    ticket.comments.forEach(c => {
      a.comments.push(this.converToCommentViewData(c));
    })
    return a;
  }

  converToAttachmentViewData(instanceId: string, a: JiraTicketDetailsAttachment) {
    let ac: JiraAttachmentViewdata = new JiraAttachmentViewdata();
    ac.attachmentId = a.id;
    ac.fileName = a.filename;
    ac.downloadLink = `customer/jira/instances/${instanceId}/attachment/?attachment_id=${a.id}&file_name=${a.filename}`;
    return ac;
  }

  converToCommentViewData(c: JiraTicketDetailsComments) {
    let ac: JiraCommentViewdata = new JiraCommentViewdata();
    ac.createdBy = c.author ? c.author.displayName : null;
    ac.createdOn = c.created ? this.utilSvc.toUnityOneDateFormat(c.created) : '';
    ac.updatedOn = c.updated ? this.utilSvc.toUnityOneDateFormat(c.updated) : '';
    ac.description = c.body && c.body.content[0] && c.body.content[0].content[0] && c.body.content[0].content[0].text;
    return ac;
  }

  getTransitions(instanceId: string, ticketId: string): Observable<JiraTicketTransition[]> {
    return this.http.get<JiraTicketTransition[]>(`/customer/jira/instances/${instanceId}/transitions/?ticket_id=${ticketId}`);
  }

  changeTransition(instanceId: string, ticketId: string, transitionId: string): Observable<any> {
    return this.http.post<any>(`/customer/jira/instances/${instanceId}/change_ticket_status/?ticket_id=${ticketId}`, { "transition_id": transitionId });
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

  addComment(instanceId: string, ticketId: string, obj: any) {
    return this.http.post<any>(`/customer/jira/instances/${instanceId}/add_comments/?ticket_id=${ticketId}`, obj);
  }
}

export class JiraTicketDetailsViewData {
  ticketNumber: string;
  ticketType: string;
  title: string;
  assignedTo: string;
  status: string;
  transitionId: string = null;
  statusReason: string;
  priority: string = null;
  description: string;

  reportedBy: string;
  createdBy: string;
  openedAt: string;
  updatedOn: string;

  attachments: JiraAttachmentViewdata[] = [];
  comments: JiraCommentViewdata[] = [];
}

export class JiraAttachmentViewdata {
  fileName: string;
  downloadLink: string;
  attachmentId: string;
}

export class JiraCommentViewdata {
  createdOn: string;
  updatedOn: string;
  createdBy: string;
  description: string;
  attachment: JiraAttachmentViewdata;
}
