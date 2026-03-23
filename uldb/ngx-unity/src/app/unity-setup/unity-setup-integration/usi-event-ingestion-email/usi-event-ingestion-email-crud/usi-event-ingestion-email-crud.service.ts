import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING } from 'src/app/shared/api-endpoint.const';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UsiEventIngestionFields } from '../../unity-setup-integration.service';
import { EmailValidator, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { EmailType, GmailAuthType } from '../usi-event-ingestion-email.type';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UsiEventIngestionEmailCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
  }

  getEventIngestionParams(): Observable<UsiEventIngestionFields> {
    return this.http.get<UsiEventIngestionFields>(`customer/aiops/events/field_meta/`);
  }

  getDropdownData(): Observable<{ colletorsList: DeviceDiscoveryAgentConfigurationType[], paramsList: UsiEventIngestionFields }> {
    return forkJoin({
      colletorsList: this.getCollectors().pipe(catchError(error => of(undefined))),
      paramsList: this.getEventIngestionParams().pipe(catchError(error => of(undefined))),
    });
  }

  getEmailDetails(instanceId: string): Observable<EmailType> {
    return this.http.get<EmailType>(`/customer/email_integration/accounts/${instanceId}/`);
  }

  buildAccountDetailsForm(data: EmailType) {
    if (data) {
      let form: FormGroup = this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'account_type': [data.account_type, [Validators.required]],
        'email': [data.email, [Validators.required, EmailValidator, NoWhitespaceValidator]],
        'collector': [data.collector, [Validators.required]],
      });
      this.manageFormCtrlsByAccountType(form, data);
      return form;
    } else {
      let form: FormGroup = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'account_type': ['', [Validators.required]],
        'email': ['', [Validators.required, EmailValidator, NoWhitespaceValidator]],
        'collector': ['', [Validators.required]],
      });
      return form;
    }
  }

  manageFormCtrlsByAccountType(form: FormGroup, data: EmailType) {
    if (data.account_type == 'Gmail') {
      form.addControl('client_id', new FormControl(data.client_id, [Validators.required, NoWhitespaceValidator]));
      form.addControl('client_secret', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      form.addControl('topic_name', new FormControl(data.topic_name, [Validators.required, NoWhitespaceValidator]));
    } else {
      form.addControl('client_id', new FormControl(data.client_id, [Validators.required, NoWhitespaceValidator]));
      form.addControl('client_secret', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      form.addControl('tenant_id', new FormControl(data.tenant_id, [Validators.required, NoWhitespaceValidator]));
    }
  }

  resetAccountDetailsFormErrors() {
    let formErrors = {
      'name': '',
      'account_type': '',
      'client_id': '',
      'client_secret': '',
      'tenant_id': '',
      'topic_name': '',
      'email': '',
      'collector': '',
    };
    return formErrors;
  }

  accountDetailsValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'account_type': {
      'required': 'Account Type is required',
    },
    'client_id': {
      'required': 'Client Id is required'
    },
    'client_secret': {
      'required': 'Client Secret is required'
    },
    'tenant_id': {
      'required': 'Tenant Id is required'
    },
    'topic_name': {
      'required': 'Topic Name is required'
    },
    'email': {
      'required': 'Email Id is required',
      'invalidEmail': 'Enter a valid email address'
    },
    'collector': {
      'required': 'Collector is required'
    },
  }

  saveGmailInstance(obj: EmailType, instanceId?: string): Observable<GmailAuthType | EmailType> {
    if (instanceId) {
      return this.http.put<GmailAuthType | EmailType>(`/customer/email_integration/accounts/${instanceId}/`, obj);
    } else {
      return this.http.post<GmailAuthType>(`/customer/email_integration/accounts/`, obj);
    }
  }

  saveO365Instance(obj: EmailType, instanceId?: string): Observable<EmailType> {
    if (instanceId) {
      return this.http.put<EmailType>(`/customer/email_integration/accounts/${instanceId}/`, obj);
    } else {
      return this.http.post<EmailType>(`/customer/email_integration/accounts/`, obj);
    }
  }
}

export const AccountTypesList: LabelValueType[] = [
  {
    'label': 'Gmail',
    'value': 'Gmail'
  },
  {
    'label': 'O365',
    'value': 'O365'
  }
]