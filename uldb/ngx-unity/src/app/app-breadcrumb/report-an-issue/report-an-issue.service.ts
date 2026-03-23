import { Injectable, EventEmitter, Output } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as moment from 'moment-timezone';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppLevelService } from 'src/app/app-level.service';
import { CREATE_REPORT_AN_ISSUE, GET_DYNAMIC_CRM_FEEDBACK_TICKET_PRIORITIES, GET_DYNAMIC_CRM_FEEDBACK_TICKET_TYPES } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator} from 'src/app/shared/app-utility/app-utility.service';
import { DynamicCrmFeedbackTicketPriorityType, DynamicCrmFeedbackTicketType } from 'src/app/shared/SharedEntityTypes/crm.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class ReportAnIssueService {
  @Output() ticketCreated$ = new EventEmitter<string>();

  private reportIssueSource = new Subject<string>();
  reportIssueToggled$: Observable<string> = this.reportIssueSource.asObservable();
  constructor(private builder: FormBuilder,
    private userSvc: UserInfoService,
    private http: HttpClient,
    private appService: AppLevelService) { }

  getTicketTypes(): Observable<DynamicCrmFeedbackTicketType[]> {
    return this.http.get<DynamicCrmFeedbackTicketType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_TYPES());
  }

  getPriorities(): Observable<DynamicCrmFeedbackTicketPriorityType[]> {
    return this.http.get<DynamicCrmFeedbackTicketPriorityType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_PRIORITIES());
  }

  reportIssue() {
    this.reportIssueSource.next();
  }

  buildAttachmentForm() {
    return this.builder.group({});
  }

  formatBreadCrumb(breadCrumbs: string[]) {
    let str = this.userSvc.selfBrandedOrgName ? '[UPC] Issue with ' : '[Unity] Issue with ';
    breadCrumbs.map((b, i) => {
      if (i != (breadCrumbs.length - 1)) {
        str = str + b + '->';
      } else if (i == (breadCrumbs.length - 1)) {
        str = str + b;
      }
    });
    return str;
  }

  buildReportIssueForm(breadCrumbs: string[], metadata: string) {
    return this.builder.group({
      'subject': [this.formatBreadCrumb(breadCrumbs), [Validators.required, NoWhitespaceValidator]],
      'collaborators': ['', NoWhitespaceValidator],
      'description': ['', [Validators.required, NoWhitespaceValidator]],
      'type': ['', NoWhitespaceValidator],
      'priority': ['', [Validators.required]],
      'metadata': [metadata, NoWhitespaceValidator]
    });
  }

  resetFormErrors() {
    return {
      'subject': '',
      'collaborators': '',
      'priority': '',
      'description': ''
    };
  }

  validationMessages = {
    'subject': {
      'required': 'Subject is required'
    },
    'collaborators': {
    },
    'priority': {
      'required': 'Priority is required'
    },
    'description': {
      'required': 'Description is required'
    }
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

  submitIssue(data: FormData) {
    const desc = data.get('description').toString().concat('\n\n').concat('Metadata:').concat('\n').concat(data.get('metadata').toString());
    data.set('description', desc);
    data.delete('metadata');
    return this.http.post<string>(CREATE_REPORT_AN_ISSUE(), data);
  }

  ticketCreated(data: FormData) {
    this.ticketCreated$.emit(data.get('type').toString());
  }
}

export const REPORT_AN_ISSUE_METADATA =
  (email: string, dateZone: string) => {
    const dateTime = moment.tz(new Date(), dateZone).format('YYYY-MM-DD HH:mm:ss');
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    return `  ${email}\n  ${url}\n  ${userAgent}\n  ${dateTime}`;
  };