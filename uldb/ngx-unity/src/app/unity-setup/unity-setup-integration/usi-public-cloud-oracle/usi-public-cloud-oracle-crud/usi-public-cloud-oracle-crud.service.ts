import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OracleAccount } from './usi-public-cloud-oracle-crud.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { GET_OCI_REGIONS } from 'src/app/shared/api-endpoint.const';
import { UsiEventIngestionFields, UsiEventIngestionParams } from '../../unity-setup-integration.service';

@Injectable()
export class UsiPublicCloudOracleCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

  getInstanceDetails(instanceId: string): Observable<OracleAccount> {
    return this.http.get<OracleAccount>(`/customer/integration/oci/accounts/${instanceId}/`);
  }

  getRegions(): Observable<{ display: string; value: string }[]> {
    return this.http.get<{ display: string; value: string }[]>(GET_OCI_REGIONS());
  }

  getServices(): Observable<any> {
    return this.http.get<any>('/customer/managed/oci/resource_types/services/');
  }

  getUnityOneUserAttributes(): Observable<Array<{ value: string, label: string }>> {
    return this.http.get<Array<{ value: string, label: string }>>(`/customer/user_fields/`);
  }
  getEventIngestionParams(): Observable<UsiEventIngestionFields> {
    return this.http.get<UsiEventIngestionFields>(`customer/aiops/events/field_meta/`, { params: new HttpParams().set('source', 'Oci') });
  }

  buildCredentialForm(d: OracleAccount): FormGroup {
    if (d) {
      let form = this.builder.group({
        'name': [d.name],
        'user_ocid': [d.user_ocid],
        'tenancy_ocid': [d.tenancy_ocid],
        'region': [[d.region]],
        'fingerprint': [''],
        'key_content': [''],
        'event_inbound_webhook': [null],
        'event_inbound_api': [null],
        'discover_resources': [d?.discover_resources],
        'discover_dependency': [d?.discover_dependency],
        'is_managed': [d?.is_managed],
        'ingest_event': [d?.ingest_event],
        'cost_analysis': [d?.cost_analysis]
      });
      if (!d.discover_resources) {
        form.get('discover_dependency').disable();
        form.get('is_managed').disable();
        form.get('cost_analysis').disable();
      }
      return form;
    } else {
      return this.builder.group({
        'name': [''],
        'user_ocid': [''],
        'tenancy_ocid': [''],
        'region': [[]],
        'fingerprint': [''],
        'key_content': [''],
        'event_inbound_webhook': [null],
        'event_inbound_api': [null],
        'discover_resources': [false],
        'discover_dependency': [{ value: false, disabled: true }],
        'is_managed': [{ value: false, disabled: true }],
        'ingest_event': [false],
        'cost_analysis': [{ value: false, disabled: true }]
      });
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
      'user_ocid': '',
      'tenancy_ocid': '',
      'region': '',
      'fingerprint': '',
      'key_content': '',
      'event_inbound_webhook': '',
      'event_inbound_api': '',
    };
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'user_ocid': {
      'required': 'User ID is required'
    },
    'tenancy_ocid': {
      'required': 'Tenancy ID is required'
    },
    'region': {
      'required': 'Region is required'
    },
    'fingerprint': {
      'required': 'Fingerprint is required'
    },
    'key_content': {
      'required': 'Private Key is required'
    }
  }

  toFormData<T>(formValue: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      if (key == 'key_content') {
        formData.append(key, value ? this.appService.convertToBinary(value) : '');
      } else if (key == 'schedule_meta' || key === 'event_inbound_webhook') {
        formData.append(key, JSON.stringify(value));
      } else if (key == 'services') {
          if(value.length){
            value.forEach(val => {
              formData.append('services[]', val);
            })
          }
      } else {
        formData.append(key, value);
      }
    }
    return formData;
  }

  buildFilterForm(d: OracleAccount): FormGroup {
    if (d) {
      let form = this.builder.group({
        'discover_services': [d.discover_services ? d.discover_services : 'All', [Validators.required]],
        'onboard_device': [d.onboard_device ? d.onboard_device : false],
        'dependency_map': [d.dependency_map ? d.dependency_map : false]
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
        'dependency_map': [false]
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

  saveInstance(data: any, instanceId?: string) {
    if (instanceId) {
      return this.http.put<any>(`/customer/integration/oci/accounts/${instanceId}/`, data);
    } else {
      return this.http.post<any>(`/customer/integration/oci/accounts/`, data);
    }
  }
}

export const Services: string[] = ['Storage', 'Virtual Cloud Network', 'Database', 'Container Instance', 'Cluster'];
