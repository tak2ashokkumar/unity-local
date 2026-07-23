import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { KUBERNETES_ACCOUNTS, KUBERNETES_ACCOUNT_BY_ID, PRIVATE_CLOUDS } from 'src/app/shared/api-endpoint.const';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { ContainerCloudOption, KubernetesIntegrationAccountType } from '../usi-containers.type';

@Injectable()
export class UsiContainersKubernetesCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
  }

  getClouds(): Observable<ContainerCloudOption[]> {
    return this.http.get<ContainerCloudOption[]>(PRIVATE_CLOUDS());
  }

  getKubernetesDetails(controllerId: string): Observable<KubernetesIntegrationAccountType> {
    return this.http.get<KubernetesIntegrationAccountType>(KUBERNETES_ACCOUNT_BY_ID(controllerId));
  }

  saveInstance(obj: any, controllerId: string): Observable<any> {
    if (controllerId) {
      return this.http.put(KUBERNETES_ACCOUNT_BY_ID(controllerId), obj);
    } else {
      return this.http.post(KUBERNETES_ACCOUNTS(), obj);
    }
  }

  buildAccountDetailsForm(data: KubernetesIntegrationAccountType): FormGroup {
    if (data) {
      return this.builder.group({
        'name': [data.name, Validators.required],
        'hostname': [data.hostname, Validators.required],
        'port': [data.port, Validators.required],
        'api_token': [data.api_token, Validators.required],
        'collector': [data.collector, Validators.required],
        'cloud': [data.cloud]
      });
    } else {
      return this.builder.group({
        'name': ['', Validators.required],
        'hostname': ['', Validators.required],
        'port': [6443, Validators.required],
        'api_token': ['', Validators.required],
        'collector': ['', Validators.required],
        'cloud': ['']
      });
    }
  }

  resetAccountDetailsFormErrors() {
    return {
      'name': '',
      'hostname': '',
      'port': '',
      'api_token': '',
      'collector': '',
      'cloud': ''
    };
  }

  accountDetailsValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'hostname': {
      'required': 'Host IP is required'
    },
    'port': {
      'required': 'Port is required'
    },
    'api_token': {
      'required': 'Token is required'
    },
    'collector': {
      'required': 'Collector is required'
    }
  };
}
