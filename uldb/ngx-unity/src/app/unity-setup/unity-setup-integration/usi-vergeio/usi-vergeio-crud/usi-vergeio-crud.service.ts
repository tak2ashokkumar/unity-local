import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GET_AGENT_CONFIGURATIONS, VERGEIO_ACCOUNTS, VERGEIO_ACCOUNT_BY_ID, VERGEIO_CHECK_CONNECTION, VERGEIO_CHECK_CONNECTION_NEW } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { VergeIOAccount, VergeIOConnectionCheck } from '../usi-vergeio.type';

// Default HTTPS port for the VergeIO API endpoint.
const VERGEIO_DEFAULT_PORT = 443;

@Injectable()
export class UsiVergeioCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDetails(instanceId: string): Observable<VergeIOAccount> {
    return this.http.get<VergeIOAccount>(VERGEIO_ACCOUNT_BY_ID(instanceId));
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: new HttpParams().set('page_size', '0') });
  }

  saveInstance(data: any, instanceId?: string): Observable<VergeIOAccount> {
    if (instanceId) {
      return this.http.put<VergeIOAccount>(VERGEIO_ACCOUNT_BY_ID(instanceId), data);
    } else {
      return this.http.post<VergeIOAccount>(VERGEIO_ACCOUNTS(), data);
    }
  }

  // Validate connectivity/credentials. Uses the account-scoped endpoint when
  // editing, and the collection-level endpoint (credentials in body) on Add.
  checkConnection(payload: VergeIOConnectionCheck, instanceId?: string): Observable<{ connected: boolean }> {
    const url = instanceId ? VERGEIO_CHECK_CONNECTION(instanceId) : VERGEIO_CHECK_CONNECTION_NEW();
    return this.http.post<{ connected: boolean }>(url, payload);
  }

  buildCredentialForm(data: VergeIOAccount): FormGroup {
    if (data) {
      return this.builder.group({
        'name': [data.name ? data.name : '', [Validators.required, NoWhitespaceValidator]],
        'hostname': [data.hostname ? data.hostname : '', [Validators.required, NoWhitespaceValidator]],
        'port': [data.port != null ? data.port : VERGEIO_DEFAULT_PORT, [Validators.required, Validators.min(1), Validators.max(65535)]],
        'username': [data.username ? data.username : '', [Validators.required, NoWhitespaceValidator]],
        'password': ['', []],
        'verify_ssl': [data.verify_ssl != null ? data.verify_ssl : true],
        'collector': [data.collector ? data.collector : '', [Validators.required]],
        'enabled': [data.enabled ? data.enabled : false],
        'is_managed': [data.is_managed ? data.is_managed : false],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'port': [VERGEIO_DEFAULT_PORT, [Validators.required, Validators.min(1), Validators.max(65535)]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'verify_ssl': [true],
        'collector': ['', [Validators.required]],
        'enabled': [true],
        'is_managed': [false],
      });
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
      'hostname': '',
      'port': '',
      'username': '',
      'password': '',
      'collector': '',
    };
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account name is required'
    },
    'hostname': {
      'required': 'Host name is required'
    },
    'port': {
      'required': 'Port is required',
      'min': 'Port must be between 1 and 65535',
      'max': 'Port must be between 1 and 65535'
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
  };
}
