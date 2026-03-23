import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AWSAccountType, AWSIntegrationAccountType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { UsiEventIngestionFields, UsiEventIngestionParams } from '../../unity-setup-integration.service';

@Injectable()
export class UsiPublicCloudAwsCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

    getEventIngestionParams(): Observable<UsiEventIngestionFields> {
      return this.http.get<UsiEventIngestionFields>(`customer/aiops/events/field_meta/`, { params: new HttpParams().set('source', 'Aws') });
    }

  getInstanceDetails(instanceId: string): Observable<AWSIntegrationAccountType> {
    return this.http.get<AWSIntegrationAccountType>(`/customer/integration/aws/accounts/${instanceId}/`);
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`/customer/aws/services/`);
  }

  saveInstance(data: any, instanceId?: string) {
    if (instanceId) {
      return this.http.patch<any>(`/customer/integration/aws/accounts/${instanceId}/`, data);
    } else {
      return this.http.post<any>(`/customer/integration/aws/accounts/`, data);
    }
  }

  buildCredentialForm(d: AWSIntegrationAccountType): FormGroup {
    if (d) {
      let form = this.builder.group({
        'name': [d.name ? d.name : '', [Validators.required]],
        'secret_key': [d.secret_key ? d.secret_key : ''],
        'access_key': [d.access_key ? d.access_key : ''],
        'event_inbound_webhook': [null],
        'event_inbound_api': [null],
        'discover_resources': [d?.discover_resources],
        'is_managed': [d?.is_managed],
        'ingest_event': [d?.ingest_event],
        'cost_analysis': [d?.cost_analysis],
      });
      if (!d.discover_resources) {
        form.get('is_managed').disable();
        form.get('cost_analysis').disable();
      }
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required]],
        'access_key': [''],
        'secret_key': [''],
        'event_inbound_webhook': [null],
        'event_inbound_api': [null],
        'discover_resources': [false],
        'is_managed': [{ value: false, disabled: true }],
        'ingest_event': [false],
        'cost_analysis': [{ value: false, disabled: true }],
      })
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
      'access_key': '',
      'secret_key': '',
      'event_inbound_webhook': '',
      'event_inbound_api': '',
    }
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account name is required'
    },
    'access_key': {
      'required': 'Access key is required'
    },
    'secret_key': {
      'required': 'Secret key is required'
    },
  }

  buildFilterForm(d: AWSIntegrationAccountType): FormGroup {
    if (d) {
      let form = this.builder.group({
        'discover_services': [d.discover_services ? d.discover_services : 'All', [Validators.required]],
        'onboard_device': [d.onboard_device ? d.onboard_device : false],
        'dependency_map': [d.dependency_map ? d.dependency_map : false],
      })
      if (form.get('discover_services').value == 'All') {
        form.addControl('services', new FormControl({ value: [], disabled: true }));
      } else {
        form.addControl('services', new FormControl(d.services ? d.services : [], [Validators.required]));
      }
      return form;
    } else {
      return this.builder.group({
        'discover_services': ['All', [Validators.required]],
        'services': [{ value: [], disabled: true }],
        'onboard_device': [false],
        'dependency_map': [false],
      })
    }
  }

  resetFilterFormErrors() {
    return {
      'discover_services': '',
      'services': '',
    }
  }

  filterFormValidationMessages = {
    'discover_services': {
      'required': 'Resource Services type is required'
    },
    'services': {
      'required': 'Services are required'
    },
  }
}
