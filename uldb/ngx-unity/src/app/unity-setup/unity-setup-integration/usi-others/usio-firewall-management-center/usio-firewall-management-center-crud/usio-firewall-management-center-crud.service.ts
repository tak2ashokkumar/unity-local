import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { FirewallManagementCenterAccountType } from '../usio-firewall-management-center.type';

@Injectable()
export class UsioFirewallManagementCenterCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getAccountDetails(accountId: string): Observable<FirewallManagementCenterAccountType> {
    return this.http.get<FirewallManagementCenterAccountType>(`/customer/fmc/accounts/${accountId}/`);
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  buildCredentialForm(data: FirewallManagementCenterAccountType | null): FormGroup {
    if (data) {
      return this.builder.group({
        'uuid': [data.uuid],
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'account_url': [data.account_url, [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
        'port': [data.port, [Validators.required, Validators.min(1), Validators.max(65535)]],
        'username': [data.username, [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'collector': [data.collector, [Validators.required]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'account_url': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.url()]],
        'port': ['', [Validators.required, Validators.min(1), Validators.max(65535)]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'collector': ['', [Validators.required]],
      });
    }
  }

  resetCredentialFormErrors(): FirewallManagementCenterCredentialFormErrors {
    const credentialFormErrors: FirewallManagementCenterCredentialFormErrors = {
      'name': '',
      'account_url': '',
      'port': '',
      'username': '',
      'password': '',
      'collector': ''
    };
    return credentialFormErrors;
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'account_url': {
      'required': 'URL is required',
      'url': 'Enter valid url',
    },
    'port': {
      'required': 'Port is required',
      'min': 'Minimum value should be greater than or equal to 1',
      'max': 'Maximum value should be less than or equal to 65535'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'collector': {
      'required': 'Collector is required'
    }
  }

  createAccount(data: FirewallManagementCenterCrudFormDataType): Observable<FirewallManagementCenterAccountType> {
    return this.http.post<FirewallManagementCenterAccountType>('/customer/fmc/accounts/', data);
  }

  editAccount(accountId: string, data: FirewallManagementCenterCrudFormDataType): Observable<FirewallManagementCenterAccountType> {
    return this.http.put<FirewallManagementCenterAccountType>(`/customer/fmc/accounts/${accountId}/`, data);
  }

}

export interface FirewallManagementCenterCrudFormDataType {
  uuid?: string;
  name: string;
  account_url: string;
  port: number;
  username: string;
  password: string;
  collector: string;
  schedule_meta: UnityScheduleType;
}

export interface FirewallManagementCenterCredentialFormErrors {
  name: string;
  account_url: string;
  port: string;
  username: string;
  password: string;
  collector: string;
}
