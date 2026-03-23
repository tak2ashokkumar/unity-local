import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AzureAccount } from 'src/app/shared/SharedEntityTypes/azure.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UsiEventIngestionFields, UsiEventIngestionParams } from '../../unity-setup-integration.service';
import { PublicCloudAccount, PublicCloudParams } from '../../usi-public-clouds/usi-public-clouds.type';

@Injectable()
export class UsiPublicCloudAzureCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getEventIngestionParams(): Observable<UsiEventIngestionFields> {
    return this.http.get<UsiEventIngestionFields>(`customer/aiops/events/field_meta/`, { params: new HttpParams().set('source', 'Azure') });
  }

  getInstanceDetails(instanceId: string): Observable<AzureAccount> {
    return this.http.get<AzureAccount>(`/customer/integration/azure/accounts/${instanceId}/`);
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`/customer/azure/resources_type/providers/`);
  }

  getUnityOneUserAttributes(): Observable<Array<{ value: string, label: string }>> {
    return this.http.get<Array<{ value: string, label: string }>>(`/customer/user_fields/`);
  }

  getAzureAttributesByResource(instanceId: string, resource: string): Observable<string[]> {
    return this.http.get<string[]>(`/customer/azure_ad_attributes/?uuid=${instanceId}&resource=${resource}`);
  }
  
  buildCredentialForm(d: AzureAccount): FormGroup {
    if (d) {
      let form = this.builder.group({
        'name': [d.name ? d.name : '', [Validators.required, NoWhitespaceValidator]],
        'client_id': [d.client_id ? d.client_id : ''],
        'tenant_id': [d.tenant_id ? d.tenant_id : ''],
        'client_secret': [d.client_secret ? d.client_secret : ''],
        'subscription_id': [d.subscription_id ? d.subscription_id : ''],
        'event_inbound_webhook': [null],
        'event_inbound_api': [null],
        'discover_resources': [d?.discover_resources],
        'discover_dependency': [d?.discover_dependency],
        'is_managed': [d?.is_managed],
        'ingest_event': [d?.ingest_event],
        'cost_analysis': [d?.cost_analysis],
        'azure_ad_integ': [d?.azure_ad_integ]
      });
      if (!d.discover_resources) {
        form.get('discover_dependency').disable();
        form.get('is_managed').disable();
        form.get('cost_analysis').disable();
        // form.get('azure_ad_integ').disable();
      }
      // if (form.get('azure_ad_integ').value) {
      //   form.addControl('resource_type', new FormControl(d.resource_type));
      //   form.addControl('attributes_map', this.buildResourceMappingArray(d));
      // }
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'client_id': [''],
        'tenant_id': [''],
        'client_secret': [''],
        'subscription_id': [''],
        'event_inbound_webhook': [null],
        'event_inbound_api': [null],
        'discover_resources': [false],
        'discover_dependency': [{ value: false, disabled: true }],
        'is_managed': [{ value: false, disabled: true }],
        'ingest_event': [false],
        'cost_analysis': [{ value: false, disabled: true }],
        // 'azure_ad_integ': [{ value: false, disabled: true }]
        'azure_ad_integ': [false]
      })
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
      'client_id': '',
      'tenant_id': '',
      'client_secret': '',
      'subscription_id': '',
      // 'resource_type': '',
      // 'attributes_map': [this.getAttributeMappingErrors()],
      'event_inbound_webhook': '',
      'event_inbound_api': '',
    }
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account Name is required'
    },
    'client_id': {
      'required': 'Client ID is required',
    },
    'tenant_id': {
      'required': 'Tenant ID is required'
    },
    'client_secret': {
      'required': 'Client Secret is required'
    },
    'subscription_id': {
      'required': 'Subscription ID is required'
    },
    // 'resource_type': {
    //   'required': 'Azure resource type is required'
    // },
    // 'attributes_map': {
    //   'unity_attr': {
    //     'required': 'UnityOne attribute is required'
    //   },
    //   'azure_attr': {
    //     'required': 'Azure attribute is required'
    //   }
    // }
  }

  buildFilterForm(d: AzureAccount): FormGroup {
    if (d) {
      let form = this.builder.group({
        // 'discover_services': [d.services_to_discover.length ? 'Custom' : 'All', [Validators.required]],
        // 'onboard_device': [d.onboard_device ? d.onboard_device : false],
        // 'dependency_map': [d.dependency_map ? d.dependency_map : false],
      })
      if(d.discover_resources){
        form.addControl('discover_services', new FormControl(d.services_to_discover.length ? 'Custom' : 'All', [Validators.required]));
        if (form.get('discover_services').value == 'All') {
          form.addControl('services_to_discover', new FormControl({ value: [], disabled: true }));
        } else {
          form.addControl('services_to_discover', new FormControl(d.services_to_discover ? d.services_to_discover : [], [Validators.required]));
        }
      }
      if (d.azure_ad_integ) {
        form.addControl('resource_type', new FormControl(d.resource_type ? d.resource_type : ''));
        form.addControl('attributes_map', this.buildResourceMappingArray(d));
      }
      return form;
    } else {
      return this.builder.group({
        'discover_services': ['All', [Validators.required]],
        'services_to_discover': [{ value: [], disabled: true }],
        // 'onboard_device': [false],
        // 'dependency_map': [false],
        'resource_type': ['', [Validators.required]],
        'attributes_map': this.buildResourceMappingArray()
      })
    }
  }

  buildResourceMappingArray(d?: AzureAccount): FormArray {
    if (d?.attributes_map?.length) {
      return this.builder.array(
        d.attributes_map.map(attr => this.builder.group({
          "unity_attr": [attr.unity_attr, [Validators.required]],
          "azure_attr": [attr.azure_attr, [Validators.required]],
        }))
      )
    } else {
      return this.builder.array([
        this.builder.group({
          "unity_attr": ['', [Validators.required]],
          "azure_attr": ['', [Validators.required]],
        })
      ])
    }
  }

  resetFilterFormErrors() {
    return {
      'discover_services': '',
      'services_to_discover': '',
      'resource_type': '',
      'attributes_map': [this.getAttributeMappingErrors()],
    }
  }

  getAttributeMappingErrors() {
    return {
      'unity_attr': '',
      'azure_attr': ''
    }
  }

  filterFormValidationMessages = {
    'discover_services': {
      'required': 'Resource Services type is required'
    },
    'services_to_discover': {
      'required': 'Services are required'
    },
    'resource_type': {
      'required': 'Azure resource type is required'
    },
    'attributes_map': {
      'unity_attr': {
        'required': 'UnityOne attribute is required'
      },
      'azure_attr': {
        'required': 'Azure attribute is required'
      }
    }
  }

  saveInstance(data: AzureAccount, instanceId?: string) {
    if (instanceId) {
      return this.http.patch<AzureAccount>(`/customer/integration/azure/accounts/${instanceId}/`, data);
    } else {
      return this.http.post<AzureAccount>(`/customer/integration/azure/accounts/`, data);
    }
  }
}
