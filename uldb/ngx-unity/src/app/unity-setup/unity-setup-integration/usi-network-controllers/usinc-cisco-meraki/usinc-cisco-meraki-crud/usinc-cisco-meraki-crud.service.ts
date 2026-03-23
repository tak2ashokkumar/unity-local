import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { ViptelaAccountType } from '../../usinc-viptela/usinc-viptela.type';
import { MerakiAccountType } from '../usinc-cisco-meraki.type';

@Injectable()
export class UsincCiscoMerakiCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  saveInstance(obj: any, merakiId: string): Observable<any> {
    if (merakiId) {
      return this.http.put<ViptelaAccountType>(`/customer/meraki/accounts/${merakiId}/`, obj);
    } else {
      return this.http.post<ViptelaAccountType>(`/customer/meraki/accounts/`, obj);
    }
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
  }

  getMerakiDetails(merakiId: string): Observable<MerakiAccountType> {
    return this.http.get<MerakiAccountType>(`/customer/meraki/accounts/${merakiId}/`);
  }

  buildAccountDetailsForm(data: MerakiAccountType) {
    if (data) {
      let form = this.builder.group({
        'name': [data.name, Validators.required],
        'account_url': [data.account_url, [Validators.required, RxwebValidators.url()]],
        'api_token': ['', [Validators.required]],
        'port': [data.port],
        'collector': [data.collector, Validators.required],
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', Validators.required],
        'account_url': ['', [Validators.required, RxwebValidators.url()]],
        'api_token': ['', [Validators.required]],
        'port': [null],
        'collector': ['', Validators.required],
      });
      return form;
    }
  }

  resetAccountDetailsFormErrors() {
    let formErrors = {
      'name': '',
      'account_url': '',
      'api_token': '',
      'collector': '',
    };
    return formErrors;
  }

  accountDetailsValidationMessages = {
    'name': {
      'required': 'Account Name is Required'
    },
    'account_url': {
      'required': 'API URL is Required',
      'url': 'Enter valid url'
    },
    'api_token': {
      'required': 'API Token is Required'
    },
    'collector': {
      'required': 'Collector is Required'
    }
  }
}
