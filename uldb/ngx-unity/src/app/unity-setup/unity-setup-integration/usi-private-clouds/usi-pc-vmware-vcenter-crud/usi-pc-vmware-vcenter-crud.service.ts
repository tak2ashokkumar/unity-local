import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { VMwareVCenterAccount, VMwareVcenterEventIngestion, VMwareVCenterParams } from '../usi-private-clouds.type';

@Injectable()
export class UsiPcVmwareVcenterCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ), { params: new HttpParams().set('page_size', 0) })
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: new HttpParams().set('page_size', '0') });
  }

  getDropdownData(): Observable<{ datacenters: DatacenterFast[], collectors: DeviceDiscoveryAgentConfigurationType[] }> {
    return forkJoin({
      datacenters: this.getDatacenters().pipe(catchError(error => of(undefined))),
      collectors: this.getCollectors().pipe(catchError(error => of(undefined))),
    })
  }

  getEventIngestionParams(): Observable<VMwareVcenterEventIngestion> {
    return this.http.get<VMwareVcenterEventIngestion>(`customer/aiops/events/field_meta/`);
  }

  getDetails(instanceId: string, cloudName: string): Observable<VMwareVCenterAccount> {
    return this.http.get<VMwareVCenterAccount>(`/customer/integration/${cloudName}/accounts/${instanceId}/`);
  }

  saveInstance(data: any, cloudName: string, instanceId?: string) {
    if (instanceId) {
      return this.http.put<any>(`/customer/integration/${cloudName}/accounts/${instanceId}/`, data);
    } else {
      return this.http.post<any>(`/customer/integration/${cloudName}/accounts/`, data);
    }
  }

  buildCredentialForm(data: VMwareVCenterAccount): FormGroup {
    if (data) {
      let form = this.builder.group({
        'name': [data?.name, [Validators.required, NoWhitespaceValidator]],
        'discover_resources': [data?.discover_resources],
        'discover_dependency': [data?.discover_dependency],
        'is_managed': [data?.is_managed],
        'ingest_event': [data?.ingest_event],
      });
      if (!data.discover_resources) {
        form.get('discover_dependency').disable();
        form.get('is_managed').disable();
      }
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'discover_resources': [false],
        'discover_dependency': [{ value: false, disabled: true }],
        'is_managed': [{ value: false, disabled: true }],
        'ingest_event': [false],
      });
    }
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
    }
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    }
  }

  buildResourcesForm(data: VMwareVCenterAccount): FormGroup {
    if (data) {
      let form = this.builder.group({
        'colocation_cloud': [data.colocation_cloud ? data.colocation_cloud : '', [Validators.required, NoWhitespaceValidator]],
        'hostname': [data.hostname, [Validators.required, NoWhitespaceValidator]],
        'username': [data.username, [Validators.required, NoWhitespaceValidator]],
        'password': [data.password, [Validators.required, NoWhitespaceValidator]],
        'resource_pool_name': [data.resource_pool_name, []],
        'collector': [data.collector ? data.collector : '', [Validators.required]],
      });
      return form;
    } else {
      return this.builder.group({
        'colocation_cloud': ['', [Validators.required, NoWhitespaceValidator]],
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'resource_pool_name': ['', []],
        'collector': ['', [Validators.required]],
      });
    }
  }

  resetResourcesFormErrors() {
    return {
      'colocation_cloud': '',
      'hostname': '',
      'username': '',
      'password': '',
      'resource_pool_name': '',
      'collector': '',
    }
  }

  resourcesFormValidationMessages = {
    'colocation_cloud': {
      'required': 'Datacenter is required'
    },
    'hostname': {
      'required': 'Host name is required'
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

  buildEventIngestionForm(params: VMwareVCenterParams[], data?: VMwareVCenterAccount): FormGroup {
    if (data && data.event_inbound_webhook) {
      let form = this.builder.group({
        'event_inbound_api': [null],
        'event_inbound_webhook': this.builder.group({
          'method': [{ value: 'webhook', disabled: true }],
          'webhook_url': [data?.event_inbound_webhook?.webhook_url],
          'token': [data?.event_inbound_webhook?.token],
          'attribute_map': this.builder.array([]),
          'additional_attribute': this.builder.group({
            'unity_attribute': ['', Validators.required],
            'display_name': [''],
            'expression_type': ['simple'],
            'mapped_attribute_expression': [''],
            'regular_expression': [''],
            'choice_map': this.builder.array([]),
          }),
          'additional_attribute_map': this.builder.array([])
        }),
        'ticket_subject_format':[data?.ticket_subject_format]
      });
      if (!data.event_inbound_webhook.attribute_map.length) {
        if (params && params.length) {
          params.forEach(param => {
            if (param.required) {
              const attribute = this.builder.group({
                'unity_attribute': [param.name],
                'display_name': [param.display_name],
                'mapped_attribute_expression': ['', [Validators.required, NoWhitespaceValidator]],
                'expression_type': ['simple'],
                'regular_expression': [''],
                'choice_map': this.builder.array([])
              });
              let attributes = (form.get('event_inbound_webhook') as FormGroup).get('attribute_map') as FormArray;
              attributes.push(attribute);
              if (param.choices && param.choices.length) {
                param.choices.forEach(c => {
                  const choice = this.builder.group({
                    'unity_value': [c[0]],
                    'display_value': [c[1]],
                    'mapped_value': ['', [Validators.required, NoWhitespaceValidator]]//required
                  });
                  (attributes.at(attributes.length - 1).get('choice_map') as FormArray).push(choice);
                });
              }
            }
          });
        }
      }
      return form;
    } else {
      let form = this.builder.group({
        'event_inbound_api': [null],
        'event_inbound_webhook': this.builder.group({
          'method': [{ value: 'webhook', disabled: true }],
          'webhook_url': [''],
          'token': [''],
          'attribute_map': this.builder.array([]),
          'additional_attribute': this.builder.group({
            'unity_attribute': ['', Validators.required],
            'display_name': [''],
            'expression_type': ['simple'],
            'mapped_attribute_expression': [''],
            'regular_expression': [''],
            'choice_map': this.builder.array([])
          }),
          'additional_attribute_map': this.builder.array([])
        }),
        'ticket_subject_format': ['']
      })
      if (params && params.length) {
        params.forEach(param => {
          if (param.required) {
            const attribute = this.builder.group({
              'unity_attribute': [param.name],
              'display_name': [param.display_name],
              'mapped_attribute_expression': ['', [Validators.required, NoWhitespaceValidator]],
              'expression_type': ['simple'],
              'regular_expression': [''],
              'choice_map': this.builder.array([])
            });
            let attributes = (form.get('event_inbound_webhook') as FormGroup).get('attribute_map') as FormArray;
            attributes.push(attribute);
            if (param.choices && param.choices.length) {
              param.choices.forEach(c => {
                const choice = this.builder.group({
                  'unity_value': [c[0]],
                  'display_value': [c[1]],
                  'mapped_value': ['', [Validators.required, NoWhitespaceValidator]]//required
                });
                (attributes.at(attributes.length - 1).get('choice_map') as FormArray).push(choice);
              });
            }
          }
        });
      }
      return form;
    }
  }

  resetEventIngestionFormErrors() {
    return {
      'event_inbound_webhook': {}
    }
  }

  resetAttributeErrors() {
    return {
      'mapped_attribute_expression': '',
      'choice_map': []
    };
  }

  resetAdditionalresetAttributeErrors() {
    return {
      'unity_attribute': '',
      'mapped_attribute_expression': '',
      'custom_field': '',
      'choice_map': []
    };
  }

  eventIngestionValidationMessages = {
    'event_inbound_webhook': {
      'attribute_map': {
        'mapped_attribute_expression': {
          'required': 'Mapping is required'
        },
        'choice_map': {
          'mapped_value': {
            'required': 'Mapping is required'
          }
        }
      },
      'additional_attribute': {
        'unity_attribute': {
          'required': 'Attribute is required'
        },
        'mapped_attribute_expression': {
          'required': 'Mapping is required'
        },
        'choice_map': {
          'mapped_value': {
            'required': 'Mapping is required'
          }
        },
        'custom_field': {
          'required': 'Custom Attribute value is required'
        }
      },
      'additional_attribute_map': {
        'mapped_attribute_expression': {
          'required': 'Mapping is required'
        },
        'choice_map': {
          'mapped_value': {
            'required': 'Mapping is required'
          }
        },
        'custom_field': {
          'required': 'Custom Attribute value is required'
        }
      },
    }
  }
}