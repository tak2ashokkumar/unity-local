import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailType } from './usi-event-ingestion-email.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class UsiEventIngestionEmailService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService,
    private builder: FormBuilder) { }

  getEmails(criteria: SearchCriteria): Observable<PaginatedResult<EmailType>> {
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<EmailType>>(`/customer/email_integration/accounts/`, { params: params });
  }

  convertToViewData(data: EmailType[]) {
    let viewData: EmailViewData[] = [];
    data.forEach(d => {
      let e: EmailViewData = new EmailViewData();
      e.emailId = d.uuid;
      e.name = d.name;
      e.accountType = d.account_type;
      e.clientId = d.client_id;
      e.emailAddress = d.email;
      e.isEnabled = d.is_enabled;
      e.url = d.event_inbound_webhook?.webhook_url ? d.event_inbound_webhook?.webhook_url : '';
      e.token = d.event_inbound_webhook?.token ? d.event_inbound_webhook?.token : '';
      viewData.push(e);
    })
    return viewData;
  }

  toggleStatus(uuid: string) {
    return this.http.get(`customer/email_integration/accounts/${uuid}/toggle_status/`);
  }

  deleteEmail(emailId: string) {
    return this.http.delete<any>(`/customer/email_integration/accounts/${emailId}/`);
  }

  buildPayloadForm(): FormGroup {
    return this.builder.group({
      'payload': ['', [Validators.required]],
      'response': ['']
    });
  }

  resetPaylodFormErrors() {
    return {
      'payload': '',
      'response': ''
    }
  }

  payloadValidationMessages = {
    'payload': {
      'required': 'Payload is required'
    }
  }

  getPayloadResponse(data: any, instanceId: string) {
    return this.http.post(`/customer/email_integration/accounts/${instanceId}/event_inbound_webhook/test_payload/`, data
      , { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    )
  }
}

export class EmailViewData {
  constructor() { }
  name: string;
  emailId: string;
  accountType: string;
  clientId: string;
  emailAddress: string;
  isEnabled: boolean;
  token: string;
  url: string;
}

export const accountTypesList: LabelValueType[] = [
  {
    'label': 'Gmail',
    'value': 'Gmail'
  },
  {
    'label': 'O365',
    'value': 'O365'
  }
]

export const statusList: LabelValueType[] = [
  {
    'label': 'Enabled',
    'value': 'enabled'
  },
  {
    'label': 'Disabled',
    'value': 'disabled'
  }
]