import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator, SERVICE_NOW_TICKET_TYPE } from '../../app-utility/app-utility.service';
import { GET_SERVICE_NOW_ATTACHMENTS_BY_TICKET_ID, GET_SERVICE_NOW_COMMENTS_BY_TICKET_ID, PUT_SERVICE_NOW_TICKET_BY_ID } from '../../api-endpoint.const';
import { AttachmentType, ServiceNowCommentType, ServicenowSopFormDataType, ServicenowSopUpdateType, ServiceNowTicketDetailsType, similarTicketType } from './now-enhanced-ticket-details.type';

@Injectable()
export class NowEnhancedTicketDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getTicketDetails(ticketId: string): Observable<ServiceNowTicketDetailsType> {
    return this.http.get<ServiceNowTicketDetailsType>(`/api/handle-ticket/${ticketId}/`);
  }

  getAttachments(instanceId: string, ticketId: string): Observable<AttachmentType[]> {
    return this.http.get<AttachmentType[]>(GET_SERVICE_NOW_ATTACHMENTS_BY_TICKET_ID(instanceId, ticketId));
  }

  getComments(instanceId: string, ticketId: string): Observable<ServiceNowCommentType[]> {
    return this.http.get<ServiceNowCommentType[]>(GET_SERVICE_NOW_COMMENTS_BY_TICKET_ID(instanceId, ticketId));
  }

  sopUpate(ticketId: string, data: ServicenowSopFormDataType): Observable<ServicenowSopUpdateType> {
    return this.http.patch<ServicenowSopUpdateType>(`/api/update-sop/${ticketId}/`, data);
  }

  convertToViewData(data: ServiceNowTicketDetailsType, instanceId: string, isAllTicketsTabActive: boolean): TicketDetailsViewData {
    let viewData: TicketDetailsViewData = new TicketDetailsViewData();
    viewData.ticketNumber = data.ticket_number ? data.ticket_number : 'N/A';
    viewData.sysId = data.sys_id;
    viewData.title = data.title ? data.title : 'N/A';
    viewData.priority = data.priority ? data.priority : 'N/A';
    viewData.status = data.status ? data.status : 'N/A';
    viewData.source = data.source ? data.source : 'N/A';
    viewData.kbArticle = data.sop?.kb_url;
    viewData.description = data.description ? data.description : 'N/A';
    viewData.ticketType = data.ticket_type;
    viewData.assignmentGroup = data.assignment_group ? data.assignment_group : 'N/A';
    viewData.defaultAssignmentGroupReason = data.reason;
    viewData.similarTickets = this.convertToSimilarTicketsViewData(data.similar_tickets, instanceId, isAllTicketsTabActive);
    viewData.sopStepsReasonBySource = data.source ? this.getSopStepsReasonBySource(data.source) : 'The SOP Steps are not found.';
    viewData.sopSteps = data.sop.steps;
    viewData.sopStepsConverted = data.sop.steps.map(step => step.replace(/(?:\r\n|\r|\n)/g, '<br>'));
    viewData.isUserVerified = data.user_verified;
    viewData.userVerfiedRelatedIcon = data.user_verified ? 'fas fa-circle text-success' : 'fas fa-circle text-secondary';
    viewData.userVerfiedRelatedMsg = data.user_verified ? 'Verified' : 'Not Verfied';
    viewData.verifiedBy = data.user_verified_by;
    return viewData;
  }

  getSopStepsReasonBySource(source: string) {
    switch (source) {
      case 'Verified SOP from current ticket':
      case 'Verified SOP from similar ticket':
      case 'Attached KB':
      case 'Similar KB':
        return 'The Below Recommended Steps Are AI-generated Based On Sourced SOP/KB. Validate If Required.';
      case 'LLM':
        return 'The Below Steps Are AI-generated. Verification From Your End Is Recommended.';
    }
  }

  convertToSimilarTicketsViewData(similarTickets: similarTicketType[], instanceId: string, isAllTicketsTabActive: boolean) {
    let viewData: similarTicketsViewData[] = [];
    similarTickets.forEach(st => {
      let view: similarTicketsViewData = new similarTicketsViewData();
      view.title = st.title;
      view.ticketNumber = st.ticket_number;
      const ticketTypeForUrl: string = isAllTicketsTabActive ? null : st.ticket_type;
      view.ticketDetailsPageUrl = this.getSimilarTicketDetailsPageUrl(instanceId, ticketTypeForUrl, view.ticketNumber);
      view.description = st.description;
      view.sysId = st.sys_id;
      viewData.push(view);
    })
    return viewData;
  }


  getSimilarTicketDetailsPageUrl(instanceId: string, ticketType: string, ticketNumber: string) {
    switch (ticketType) {
      case SERVICE_NOW_TICKET_TYPE.INCIDENT:
        return `/support/ticketmgmt/${instanceId}/nowincident/${ticketNumber}/enhanced-details`;
      case SERVICE_NOW_TICKET_TYPE.PROBLEM:
        return `/support/ticketmgmt/${instanceId}/nowproblem/${ticketNumber}/enhanced-details`;
      default:
        return `/support/ticketmgmt/${instanceId}/nowtickets/${ticketNumber}/enhanced-details`;
    }
  }

  convertToAttachemntsViewData(attachments: AttachmentType[]) {
    let viewData: AttachmentViewdata[] = [];
    attachments.forEach(attachment => {
      let a: AttachmentViewdata = new AttachmentViewdata();
      a.fileName = attachment.file_name;
      a.downloadLink = attachment.download_link;
      a.attachmentId = attachment.sys_id;
      viewData.push(a);
    });
    return viewData;
  }

  convertToCommentsViewData(comments: ServiceNowCommentType[]): CommentViewdata[] {
    let viewData: CommentViewdata[] = [];
    comments.forEach(comment => {
      let data: CommentViewdata = new CommentViewdata();
      data.createdBy = comment.sys_created_by ? comment.sys_created_by.display_value : 'N/A';
      data.createdOn = comment.sys_created_on && comment.sys_created_on.value ? this.utilSvc.toUnityOneDateFormat(comment.sys_created_on.value) : 'N/A';
      data.value = comment.value ? comment.value.display_value.replace(/(?:\r\n|\r|\n)/g, '<br>') : 'N/A';
      viewData.push(data);
    });
    return viewData;
  }

  buildSopForm(sopSteps: string[], isUserVerified: boolean) {
    let form = this.builder.group({
      'user_verified': [isUserVerified ? isUserVerified : false]
    });

    form.addControl('sop_steps', this.builder.array(
      sopSteps.map(step => new FormControl(step, [Validators.required, NoWhitespaceValidator]))
    ));
    return form;
  }

  resetSopFormFormErrors() {
    let sopFormFormErrors = {
      'sop_steps': [],
    };
    return sopFormFormErrors;
  }

  sopFormFormValidationMessages = {
    'sop_steps': []
  }

  resetCommentFormErrors(): any {
    let formErrors = {
      'comments': ''
    };
    return formErrors;
  }

  commentFormValidationMessages = {
    'comments': {
      'required': 'Comment is required'
    }
  };

  buildForm(): FormGroup {
    this.resetCommentFormErrors();
    return this.builder.group({
      'comments': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  postComment(instanceId: string, ticketId: string, type: string, data: { comments: string }) {
    return this.http.put(PUT_SERVICE_NOW_TICKET_BY_ID(instanceId, type, ticketId), data);
  }

}

export class TicketDetailsViewData {
  constructor() { }
  ticketNumber: string;
  sysId: string;
  title: string;
  priority: string;
  status: string;
  source: string;
  kbArticle: string;
  description: string;
  assignmentGroup: string;
  defaultAssignmentGroupReason: string;
  ticketType: string;
  similarTickets: similarTicketsViewData[] = [];
  sopStepsReasonBySource: string;
  sopSteps: string[] = [];
  sopStepsConverted: string[] = [];
  isUserVerified: boolean;
  userVerfiedRelatedIcon: string;
  userVerfiedRelatedMsg: string;
  verifiedBy: string;
}

export class similarTicketsViewData {
  constructor() { }
  description: string;
  ticketNumber: string;
  title: string;
  ticketType: string;
  ticketDetailsPageUrl: string;
  sysId: string;
}

export class AttachmentViewdata {
  constructor() { }
  fileName: string;
  downloadLink: string;
  attachmentId: string;
}

export class CommentViewdata {
  constructor() { }
  value: string;
  createdOn: string;
  createdBy: string;
}