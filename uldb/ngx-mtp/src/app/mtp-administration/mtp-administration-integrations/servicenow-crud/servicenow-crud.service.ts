import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ADD_SERVICE_NOW, EDIT_SERVICE_NOW } from 'src/app/shared/api-endpoint.const';
import { AtLeastOneInputHasValue, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class ServicenowCrudService {

  constructor(private builder: FormBuilder, private http: HttpClient) { }

  getTenants() {
    return this.http.get<TenantList[]>(`/customer/mtp/tenant/`);
  }

  getSnResourceList(id: string): Observable<any> {
    const params: HttpParams = new HttpParams().set('page_size', 0)
    return this.http.get<any>(`customer/mtp/cmdb-resources/?uuid=${id}`, { params: params })
  }

  getSnAttributeList(id: string, resource: string): Observable<any> {
    const params: HttpParams = new HttpParams().set('page_size', 0)
    return this.http.get<any>(`customer/mtp/cmdb-attributes/?uuid=${id}&resource=${resource}`, { params: params })
  }

  getUnityAttributeList(attr: string): Observable<any> {
    return this.http.get<any>(`customer/mtp/model_fields/?device_type=${attr}`)
  }

  getInstanceDetails(instanceId: string) {
    return this.http.get<ServicenowAccounts>(EDIT_SERVICE_NOW(instanceId));
  }

  buildIntegrationForm(snId: string): Observable<FormGroup> {
    if (snId) {
      return this.http.get<ServicenowAccounts>(EDIT_SERVICE_NOW(snId)).pipe(
        map((instance) => {
          return this.builder.group({
            name: [instance ? instance.name : '', [Validators.required, NoWhitespaceValidator],],
            instance_url: [instance ? instance.instance_url : '', [Validators.required, RxwebValidators.url()],],
            username: [instance ? instance.username : '', [Validators.required, NoWhitespaceValidator],],
            password: ['', [Validators.required, NoWhitespaceValidator],],
            tenants: [instance ? instance.tenants.map(tenant => tenant.id) : [], [Validators.required],],
            is_cmdb: [instance ? instance.is_cmdb : false],
            is_itsm: [instance ? instance.is_itsm : false],
            is_ire: [instance ? instance.is_ire : false],
          }, {
            validators: AtLeastOneInputHasValue(['is_cmdb', 'is_itsm'])
          })
        })
      );
    } else {
      return of(
        this.builder.group({
          name: ['', [Validators.required, NoWhitespaceValidator]],
          instance_url: ['', [Validators.required, RxwebValidators.url()]],
          username: ['', [Validators.required, NoWhitespaceValidator]],
          password: ['', [Validators.required, NoWhitespaceValidator]],
          tenants: [[], [Validators.required]],
          is_cmdb: [false],
          is_itsm: [false],
          is_ire: [false],
        }, {
          validators: AtLeastOneInputHasValue(['is_cmdb', 'is_itsm'])
        })
      );
    }
  }

  resetIntegrationFormErrors(): any {
    let formErrors = {
      name: '',
      instance_url: '',
      username: '',
      password: '',
      tenants: '',
      account_for: '',
    };
    return formErrors;
  }

  integrationFormValidationMessages = {
    name: {
      required: 'Name is required',
    },
    instance_url: {
      required: 'Instance URL is required',
      url: 'Enter valid url'
    },
    username: {
      required: 'Username is required',
    },
    tenants: {
      required: 'Tenant is required',
    },
    password: {
      required: 'Password is required',
    },
  };

  saveIntegrationForm(snId: string, sn: ServiceNowType): Observable<ServiceNowType> {
    if (snId) {
      return this.http.put<ServiceNowType>(EDIT_SERVICE_NOW(snId), sn);
    } else {
      return this.http.post<ServiceNowType>(ADD_SERVICE_NOW(), sn);
    }
  }

  buildConfigurationForm(insId: string): Observable<FormGroup> {
    if (insId) {
      return this.http.get<any>(`customer/mtp/servicenow/${insId}/`).pipe(
        map((config) => {
          if (config.resource_types) {
            return this.builder.group({
              'resource_types': this.builder.array(
                config.resource_types.map(resource => this.builder.group({
                  'unity_device': [resource.unity_device, [Validators.required]],
                  'resource_type': [resource.resource_type, [Validators.required]],
                  'attribute_mapping': this.builder.array(
                    resource.attribute_mapping.map(mapping => this.builder.group({
                      "unity_attr": [mapping.unity_attr, [Validators.required]],
                      "servicenow_attr": [mapping.servicenow_attr, [Validators.required]]
                    }))
                  )
                }))
              )
            });
          } else {
            return this.builder.group({
              'resource_types': this.builder.array([
                this.builder.group({
                  'unity_device': ['', [Validators.required]],
                  'resource_type': ['', [Validators.required]],
                  'attribute_mapping': this.builder.array([
                    this.builder.group({
                      "unity_attr": ['', [Validators.required]],
                      "servicenow_attr": ['', [Validators.required]]
                    })
                  ])
                })
              ])
            })
          }
        })
      );
    } else {
      return of(
        this.builder.group({
          'resource_types': this.builder.array([
            this.builder.group({
              'unity_device': ['', [Validators.required]],
              'resource_type': ['', [Validators.required]],
              'attribute_mapping': this.builder.array([
                this.builder.group({
                  "unity_attr": ['', [Validators.required]],
                  "servicenow_attr": ['', [Validators.required]]
                })
              ])
            })
          ])
        })
      );
    }
  }

  resetConfigurationFormErrors() {
    return {
      'resource_types': [this.getResourceTypeErrors()],
    }
  }

  getResourceTypeErrors() {
    return {
      'unity_device': '',
      'resource_type': '',
      'attribute_mapping': [this.getAttributeMappingErrors()]
    }
  }

  getAttributeMappingErrors() {
    return {
      'unity_attr': '',
      'servicenow_attr': ''
    }
  }

  configurationFormValidationMessages = {
    'resource_types': {
      'unity_device': {
        'required': 'Unity device type is required'
      },
      'resource_type': {
        'required': 'Service now resource type is required'
      },
      'attribute_mapping': {
        'unity_attr': {
          'required': 'Unity attribute is required'
        },
        'servicenow_attr': {
          'required': 'Service now attribute is required'
        }
      }
    }
  }

  postResourceType(data: any[], id: string, actionMsg: string) {
    if (actionMsg == 'add') {
      return this.http.post<any[]>(`customer/mtp/servicenow/${id}/config_cmdb/`, data);
    }
    else {
      return this.http.put<any[]>(`customer/mtp/servicenow/${id}/config_cmdb/`, data);
    }
  }
}

export interface ServiceNowType {
  name: string;
  instance_url: string;
  username: string;
  tenants: number[];
  password: string;
  is_cmdb: boolean;
  is_itsm: boolean;
  uuid?: string;
  // is_default: boolean;
}

export interface ServiceNowAttribute {
  resource_value: string;
  attributes: string[];
}

export interface Tenants {
  name: string;
  phone: string;
  address1: string;
  address2: null | string;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  domain: null | string;
  email: string;
  unity_modules: number[];
  uuid: string;
  region: number;
  _logo: string;
  mtp_group: null | number;
  id: number;
  location: null | string;
  lat: null | string;
  '\'long\''?: null | string;
  is_tenant_active: boolean;
  'long'?: string;
}

export interface TenantList {
  name: string;
  phone: string;
  address1: string;
  address2: null | string;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  domain: null | string;
  email: string;
  unity_modules: number[];
  uuid: string;
  region: number;
  _logo: string;
  mtp_group: null | number;
  id: number;
  location: null | string;
  lat: null | string;
  '\'long\''?: null | string;
  is_tenant_active: boolean;
  'long'?: string;
}

export interface ServicenowAccounts {
  id: number;
  name: string;
  uuid: string;
  instance_url: string;
  username: string;
  // is_default: boolean;
  is_cmdb: boolean;
  is_itsm: boolean;
  is_ire: boolean;
  user: number;
  tenants: Tenant[];
}

export interface Tenant {
  id: number;
  name: string;
}

export interface OnboardingTabStepType {
  icon: string;
  stepName: string;
  url: string;
  active: boolean;
  disabled?: boolean;
  className: string;
}

export interface ServiceNowResourceType {
  resource: string;
  value: string;
}

export const UnityDeviceType = [
  {
    label: 'Firewall',
    value: 'firewall'
  },
  {
    label: 'Hypervisor',
    value: 'hypervisor'
  },
  {
    label: 'Load Balancer',
    value: 'load_balancer'
  },
  {
    label: 'Mobile Device',
    value: 'mobile'
  },
  {
    label: 'Other Device',
    value: 'custom'
  },
  {
    label: 'Server',
    value: 'baremetal'
  },
  {
    label: 'Storage',
    value: 'storage'
  },
  {
    label: 'Switch',
    value: 'switch'
  },
  {
    label: 'VMware VM',
    value: 'vmware'
  },
  {
    label: 'OpenStack VM',
    value: 'open_stack'
  },
  {
    label: 'ESXi VM',
    value: 'esxi'
  },
  {
    label: 'Custom VM',
    value: 'virtual_machine'
  },
  {
    label: 'vCloud VM',
    value: 'vcloud'
  },
  {
    label: 'HyperV VM',
    value: 'hyperv'
  },
]

