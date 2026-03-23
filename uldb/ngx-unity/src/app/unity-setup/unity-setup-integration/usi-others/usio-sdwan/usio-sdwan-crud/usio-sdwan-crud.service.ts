import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { SdWanAccountDetails } from './usio-sdwan.type';

@Injectable()
export class UsioSdwanCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  saveInstance(obj: SdWanAccountDetails, sdwanId: string): Observable<any> {
    if (sdwanId) {
      return this.http.put<SdWanAccountDetails>(`/customer/sdwan/accounts/${sdwanId}/`, obj);
    } else {
      return this.http.post<SdWanAccountDetails>(`/customer/sdwan/accounts/`, obj);
    }
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
  }

  getSdWanDetails(sdwanId: string): Observable<any> {
    return this.http.get<Observable<any>>(`/customer/sdwan/accounts/${sdwanId}/`);
  }

  buildCredentialForm(data: SdWanAccountDetails) {
    if (data) {
      let form = this.builder.group({
        'name': [data.name, Validators.required],
        'account_url': [data.account_url, [Validators.required, RxwebValidators.url()]],
        'port': [data.port],
        'collector': [data.collector, Validators.required],
        'username': [data.username, Validators.required],
        'password': [data.password, Validators.required]
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', Validators.required],
        'account_url': ['', [Validators.required, RxwebValidators.url()]],
        'port': [null],
        'collector': ['', Validators.required],
        'username': ['', Validators.required],
        'password': ['', Validators.required]
      });
      return form;
    }
  }

  resetCredentialFormErrors() {
    let formErrors = {
      'name': '',
      'account_url': '',
      'collector': '',
      'username': '',
      'password': '',
    };
    return formErrors;
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account Name Selection is Required'
    },
    'account_url': {
      'required': 'Account URL Selection is Required'
    },
    'collector': {
      'required': 'Collector is Required'
    },
    'username': {
      'required': 'Username is Required'
    },
    'password': {
      'required': 'Password is Required'
    },
  }
}
