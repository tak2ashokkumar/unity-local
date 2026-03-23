import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { ViptelaAccountType } from '../usinc-viptela.type';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Injectable()
export class UsincViptelaCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  saveInstance(obj: ViptelaFormDataType, viptelaId: string): Observable<any> {
    if (viptelaId) {
      return this.http.put<ViptelaAccountType>(`/customer/viptela/accounts/${viptelaId}/`, obj);
    } else {
      return this.http.post<ViptelaAccountType>(`/customer/viptela/accounts/`, obj);
    }
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
  }

  getViptelaDetails(viptelaId: string): Observable<ViptelaAccountType> {
    return this.http.get<ViptelaAccountType>(`/customer/viptela/accounts/${viptelaId}/`);
  }

  buildAccountDetailsForm(data: ViptelaAccountType) {
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

  resetAccountDetailsFormErrors() {
    let formErrors = {
      'name': '',
      'account_url': '',
      'collector': '',
      'username': '',
      'password': '',
    };
    return formErrors;
  }

  accountDetailsValidationMessages = {
    'name': {
      'required': 'Account Name is Required'
    },
    'account_url': {
      'required': 'URL is Required',
      'url': 'Enter valid url'
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

export interface ViptelaFormDataType {
  name: string;
  account_url: string;
  collector: string;
  username: string;
  password: string;
}