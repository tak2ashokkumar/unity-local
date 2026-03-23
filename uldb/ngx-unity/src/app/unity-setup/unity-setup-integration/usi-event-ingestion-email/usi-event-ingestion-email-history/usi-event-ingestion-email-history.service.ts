import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsiEventIngestionEmailHistoryService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getEmailHistory(criteria: SearchCriteria): Observable<PaginatedResult<EmailHistoryType>> {
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<EmailHistoryType>>(`/customer/email_integration/history/`, { params: params });
  }

  convertToViewData(data: EmailHistoryType[]) {
    let viewData: EmailHistoryViewData[] = [];
    data.forEach(d => {
      let e: EmailHistoryViewData = new EmailHistoryViewData();
      e.senderEmail = d.sender_email;
      e.subject = d.subject;
      e.emailBody = d.email_body ? d.email_body : 'N/A';
      e.emailBodyConverted = d.email_body ? d.email_body.replace(/(?:\r\n|\r|\n)/g, '<br>') : 'N/A';
      e.receivedAt = d.received_at ? this.utilSvc.toUnityOneDateFormat(d.received_at) : 'N/A';
      viewData.push(e);
    })
    return viewData;
  }
}

export class EmailHistoryViewData {
  constructor() { }
  senderEmail: string;
  subject: string;
  emailBody: string;
  emailBodyConverted: string;
  receivedAt: string;
}

export interface EmailHistoryType {
  uuid: string;
  account: string;
  message_id: string;
  history_id: string;
  subject: string;
  sender_email: string;
  to_recipients: string[];
  cc_recipients: string[];
  bcc_recipients: string[];
  email_body: string;
  received_at: string;
  created_at: string;
}