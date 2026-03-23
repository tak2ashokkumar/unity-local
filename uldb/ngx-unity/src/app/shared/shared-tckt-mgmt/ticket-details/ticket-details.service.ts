import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from '../../SharedEntityTypes/celery-task.type';
import { TaskStatus } from '../../SharedEntityTypes/task-status.type';
import { CHANGE_PRIORITY, GET_TICKET_COMMENT_DATA, GET_TICKET_DETAILS_DATA, POST_COMMENT } from '../../api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from '../../app-utility/app-utility.service';

@Injectable()
export class TicketDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getTicketData(ticketId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(GET_TICKET_DETAILS_DATA(ticketId))
      .pipe(
        switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))),
        take(1)
      );
  }

  getCommentsData(ticketId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(GET_TICKET_COMMENT_DATA(ticketId))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

  convertToDetailsViewData(details: TicketDetails): TicketDetailsViewData {
    let viewData = new TicketDetailsViewData();
    viewData.ticketId = details.id;
    viewData.subject = details.subject;
    viewData.description = details.description;
    viewData.status = details.status;
    viewData.url = ZENDESK_URL(details.id);
    viewData.priority = details.priority;
    viewData.createdDate = details.created_at ? this.utilSvc.toUnityOneDateFormat(details.created_at) : 'N/A';
    viewData.createdVia = details.via.channel === 'api' ? 'Unity Portal' : details.via.channel;
    return viewData;
  }

  getUserMap(users: UsersItem[]): UserMap {
    let map: UserMap = {};
    users.map(user => {
      map[user.id] = user;
    });
    return map;
  }

  convertToCommentViewData(comments: CommentsItem[], userMap: UserMap): TicketCommentViewData[] {
    let viewData: TicketCommentViewData[] = [];
    comments.map(comment => {
      let data = new TicketCommentViewData();
      data.description = comment.body;
      const user = userMap[comment.author_id];
      data.userName = user.agent ? user.name + ' (Collector)' : user.name;
      data.commentedAt = comment.created_at ? this.utilSvc.toUnityOneDateFormat(comment.created_at) : 'N/A';
      data.attachments = this.getAttachments(comment.attachments);
      viewData.push(data);
    });
    return viewData;
  }

  getAttachments(attachments: AttachmentsItem[]): Attachment[] {
    let arr: Attachment[] = [];
    attachments.map(attachment => {
      let data: Attachment = new Attachment();
      data.url = attachment.content_url;
      data.name = attachment.file_name;
      data.size = attachment.size;
      arr.push(data);
    });
    return arr;
  }

  resetFormErrors(): any {
    let formErrors = {
      'body': ''
    };
    return formErrors;
  }

  validationMessages = {
    'body': {
      'required': 'Comment is required'
    }
  };

  buildForm(ticketId: string): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'body': ['', [Validators.required, NoWhitespaceValidator]],
      'ticket_id': [ticketId, NoWhitespaceValidator]
    });
  }

  postComment(data: { body: string, ticket_id: string }): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(POST_COMMENT(), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

  changePriority(data: { priority: string, ticket_id: string }) {
    return this.http.post<CeleryTask>(CHANGE_PRIORITY(), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }
}
export class TicketDetailsViewData {
  constructor() { }
  ticketId: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  url: string;
  createdVia: string;
  createdDate: string;
  attachments: Attachment[] = [];
}
export class TicketCommentViewData {
  constructor() { }
  userName: string;
  commentedAt: string;
  description: string;
  attachments: Attachment[] = [];
}
export class Attachment {
  constructor() { }
  url: string;
  name: string;
  size: number;
}
export interface UserMap {
  [key: string]: UsersItem;
}
export const ZENDESK_URL = (ticketId: number) => `https://unitedlayer.zendesk.com/hc/en-us/requests/${ticketId}`;