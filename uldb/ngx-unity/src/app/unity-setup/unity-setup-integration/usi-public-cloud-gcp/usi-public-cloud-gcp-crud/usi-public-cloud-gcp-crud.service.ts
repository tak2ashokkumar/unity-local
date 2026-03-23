import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { EmailValidator, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GcpAccountIntegrationType } from 'src/app/app-home/infra-as-a-service/public-cloud/gcp.type';
import { UsiEventIngestionFields, UsiEventIngestionParams } from '../../unity-setup-integration.service';

@Injectable()
export class UsiPublicCloudGcpCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getInstanceDetails(instanceId: string): Observable<GcpAccountIntegrationType> {
    return this.http.get<GcpAccountIntegrationType>(`/customer/integration/gcp/accounts/${instanceId}/`);
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`/customer/integration/gcp/accounts/get_all_services/`);
  }

  getEventIngestionParams(): Observable<UsiEventIngestionFields> {
    return this.http.get<UsiEventIngestionFields>(`customer/aiops/events/field_meta/`, { params: new HttpParams().set('source', 'Gcp') });
  }

  saveInstance(data: any, instanceId?: string) {
    if (instanceId) {
      return this.http.patch<any>(`/customer/integration/gcp/accounts/${instanceId}/`, data);
    } else {
      return this.http.post<any>(`/customer/integration/gcp/accounts/`, data);
    }
  }


  buildFilterForm(d: GcpAccountIntegrationType): FormGroup {
    if (d) {
      let form = this.builder.group({
        'discover_services': [d.discover_services ? d.discover_services : 'All', [Validators.required]],
        // 'onboard_device': [d.onboard_device ? d.onboard_device : false],
        // 'dependency_map': [d.dependency_map ? d.dependency_map : false],
        // 'is_managed': [d.is_managed ? d.is_managed : false],
      })
      if (d.discover_services && d.discover_services == 'All') {
        form.addControl('services', new FormControl({ value: [], disabled: true }));
      } else {
        form.addControl('services', new FormControl(d.services ? d.services : [], [Validators.required]));
      }
      return form;
    } else {
      return this.builder.group({
        'discover_services': ['All', [Validators.required]],
        'services': [{ value: [], disabled: true }],
        // 'onboard_device': [false],
        // 'dependency_map': [false],
        // 'is_managed': [false],
      })
    }
  }

  buildCredentialForm(d: GcpAccountIntegrationType): FormGroup {
    if (d) {
      return this.builder.group({
        'name': [d.name ? d.name : '', [Validators.required, NoWhitespaceValidator]],
        'email': [d.email ? d.email : ''],
        'project_id': [d.project_id ? d.project_id : ''],
        'service_account_info': [d.service_account_info ? d.service_account_info : ''],
        'discover_resources': [d.discover_resources],
        'discover_dependency': [{ value: d?.discover_dependency ?? false, disabled: !d.discover_resources }],
        'is_managed': [{ value: d?.is_managed ?? false, disabled: !d.discover_resources }],
        'cost_analysis': [{ value: d?.cost_analysis ?? false, disabled: !d.discover_resources }],
        'sustainability': [{ value: d?.sustainability ?? false, disabled: !d.discover_resources }],        
        'ingest_event': [d?.ingest_event ?? false]
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'email': [''],
        'project_id': [''],
        'service_account_info': [''],
        'event_inbound_webhook': [null],
        'event_inbound_api': [null],
        'discover_resources': [false],
        'discover_dependency': [{ value: false, disabled: true }],
        'is_managed': [{ value: false, disabled: true }],
        'cost_analysis': [{ value: false, disabled: true }],
        'sustainability': [{ value: false, disabled: true }],
        'ingest_event': [false]
      });
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
      'email': '',
      'project_id': '',
      'service_account_info': ''
    }
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'project_id': {
      'required': 'Project Id is required'
    },
    'email': {
      'required': 'Email is required',
      'invalidEmail': 'Enter a valid email address'
    },
    'service_account_info': {
      'required': 'Service Account Info is required',
      'json': 'Invalid json'
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
