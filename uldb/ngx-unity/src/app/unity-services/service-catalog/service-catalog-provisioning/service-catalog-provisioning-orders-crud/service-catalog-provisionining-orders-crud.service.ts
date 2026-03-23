import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS, SERVICE_CATALOG_ORDER_ACCOUNTS, SERVICE_CATALOG_ORDER_GET_VARIABLES, SERVICE_CATALOG_ORDER_TEMPLATES } from 'src/app/shared/api-endpoint.const';
import { environment } from 'src/environments/environment';
import { cloneDeep as _clone } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { deviceTypes } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-task-execute/orchestration-task-execute.service';
import { NewOrdersType } from '../../service-catalog-orders/service-catalog-orders.type';

@Injectable({
  providedIn: 'root'
})
export class ServiceCatalogProvisioniningOrdersCrudService {

  private ngUnsubscribe = new Subject();
  selectedAccount: string;
  selectedTemplate: any;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) { }

  getVariables(uuid: string) {
    return this.http.get(SERVICE_CATALOG_ORDER_GET_VARIABLES(uuid));
  }

  getAccountDropdownOptions(accountId: string) {
    return this.http.get<Option[]>(SERVICE_CATALOG_ORDER_ACCOUNTS(accountId));
  }

  getTemplateDropdownOptions(templateId: string, accountId?: string, filter?: string) {
    if (accountId && filter) {
      return this.http.get<Option[]>(SERVICE_CATALOG_ORDER_TEMPLATES(templateId), { params: new HttpParams().set('account_id', accountId).set('filter', filter) });
    } else if (accountId) {
      return this.http.get<Option[]>(SERVICE_CATALOG_ORDER_TEMPLATES(templateId), { params: new HttpParams().set('account_id', accountId) });
    } else {
      return this.http.get<Option[]>(SERVICE_CATALOG_ORDER_TEMPLATES(templateId));
    }
  }

  getImages(uuid: string, cloudType: string) {
    let params = new HttpParams().set('page_size', 0).append('account_id', uuid).append('cloud_type', cloudType);
    return this.http.get(`/orchestration/vmimage/`, { params: params })
  }

  getResourceModel(cloudType: string, minVcpu: number, minMemory: number) {
    let params = new HttpParams().set('page_size', 0).append('cloud_type', cloudType).append('cpu_size_min', minVcpu).append('memory_size_min', minMemory);
    return this.http.get(`/customer/resources/resource_plan/`, { params: params })
  }

  createOrder(catalogId: string, obj: any) {
    return this.http.post(`/service_catalog/catalogs/${catalogId}/new_order/`, obj)
  }

  getOrderDetails(uuid: string): Observable<NewOrdersType> {
    return this.http.get<NewOrdersType>(`/service_catalog/orders/${uuid}/`)
  }

  editOrder(uuid: string, obj: any): Observable<any> {
    return this.http.put<any>(`/service_catalog/orders/${uuid}/`, obj)
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  }

  getAllCloud(cloudType?: string): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    if (cloudType) {
      param = param.append('cloud_type', cloudType);
    }
    return this.http.get<any>(`customer/cloud_fast/`, { params: param });
  }

  getTags(): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`customer/tags/`, { params: param });
  }

  getHost(tag?: string, deviceType?: string, dc?: string, subType?: string, publicCloud?: string, privateCloud?: string): Observable<any> {
    let params = new HttpParams().set('page_size', 0);
    if (tag) {
      params = params.append('tag', tag);
    }
    if (deviceType) {
      params = params.append('device_type', deviceType);
    }
    if (dc) {
      params = params.append('dc', dc);
    }
    if (subType) {
      params = params.append('sub_type', subType);
    }
    if (publicCloud) {
      const cloudTypeLowerCase = publicCloud.toLowerCase();
      const matchedDeviceType = deviceTypes.find(deviceType => cloudTypeLowerCase.includes(deviceType.name));
      if (matchedDeviceType) {
        deviceType = matchedDeviceType.name;
        params = params.append('device_type', deviceType);
      }
      params = params.append('public_cloud', publicCloud);
    }
    if (privateCloud) {
      params = params.append('private_cloud', privateCloud);
    }
    return this.http.get<any>(`customer/advanced_search/`, { params: params });
  }

  getDc(): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`customer/colo_cloud/`, { params: param });
  }

  getIpAddress(ipAddress: string): Observable<any> {
    let param = new HttpParams().set('page_size', 0).set('ip_address', ipAddress);
    return this.http.get<any>(`customer/advanced_search/`, { params: param });
  }

  getCloudWithImg() {
    return this.http.get<any>(`orchestration/tasks/get_metadata/`);
  }

  convertToViewdata(data: CatalogOrdersModel): CatalogOrdersViewModel {
    let viewData: CatalogOrdersViewModel = new CatalogOrdersViewModel();
    viewData.account = _clone(data.account);
    viewData.cloudType = data.cloud_type;
    viewData.cloudLogo = `${environment.assetsUrl + data.cloud_logo}`;
    viewData.catalogLogo = `${environment.assetsUrl + data.logo}`;
    viewData.price = data.price;
    viewData.catalogName = data.catalog_name;
    viewData.isPrivateCloud = data.is_private_cloud;
    viewData.category = data.category;
    viewData.logo = data.logo;
    return viewData;
  }

  buildForm(templates: OrderTemplatesModel[], inputs: OrderInputsModel[], orders: CatalogOrdersViewModel, newOrders: NewOrdersType, orderId?: string): FormGroup {
    if (orderId) {
      let form = this.fb.group({
        templates: this.fb.array([]),
        inputs: this.fb.array([]),
      });
      if (orders.category === 'Operational') {
        form.addControl('ip', this.fb.control('', [ipListValidator()]));
        form.addControl('host_type', this.fb.control(newOrders?.host_meta?.host_type));
        form.addControl('host', this.fb.control([]));
        form.addControl('cred_type', this.fb.control(newOrders?.cred_type, [Validators.required]));
        form.addControl('credentials', this.fb.control(newOrders?.credentials, [Validators.required]));
      } else {
        form.addControl('account', this.fb.group({
          options: this.fb.control(newOrders?.account_id, [Validators.required]),
        }));
      }

      if (!orders.isPrivateCloud) {
        form.addControl('cred_type', this.fb.control(newOrders?.cred_type, [Validators.required]));
        form.addControl('credentials', this.fb.control(newOrders?.credentials, [Validators.required]));
      }

      this.initializeTemplatesForm(templates, form, newOrders, orderId);
      this.initializeInputsForm(inputs, form, newOrders, orderId);

      if (orders.category === 'Operational') {
        form.setValidators(AtLeastOneInputHasValue(['ip', 'host']));
      }
      return form;
    } else {
      const form = this.fb.group({
        templates: this.fb.array([]),
        inputs: this.fb.array([]),
      });

      if (orders.category === 'Operational') {
        form.addControl('ip', this.fb.control('', [ipListValidator()]));
        form.addControl('host_type', this.fb.control(''));
        form.addControl('host', this.fb.control([]));
        form.addControl('cred_type', this.fb.control('local', [Validators.required]));
        form.addControl('credentials', this.fb.control('', [Validators.required]));
      } else {
        form.addControl('account', this.fb.group({
          options: this.fb.control('', [Validators.required]),
        }));
      }

      if (!orders.isPrivateCloud) {
        form.addControl('cred_type', this.fb.control('local', [Validators.required]));
        form.addControl('credentials', this.fb.control('', [Validators.required]));
      }

      this.initializeTemplatesForm(templates, form, null, null);
      this.initializeInputsForm(inputs, form, null, null);

      if (orders.category === 'Operational') {
        form.setValidators(AtLeastOneInputHasValue(['ip', 'host']));
      }
      return form;
    }
  }


  resetFormErrors() {
    let formErrors = {
      'options': '',
      'image': '',
      'resource_model': '',
      'inputs': {},
      'templates': {},
      'ip': '',
      'host_type': '',
      'host': '',
      'datacenter': '',
      'device_category': '',
      'cloud': '',
      'account_name': '',
      'tag': '',
      'device_type': '',
      'cred_type': '',
      'credentials': '',
      'username': '',
      'password': '',
    };
    return formErrors;
  }

  formValidationMessages = {
    'options': {
      'required': 'Account Name Selection is Required'
    },
    'image': {
      'required': 'Image Selection is Required'
    },
    'resource_model': {
      'required': 'Resource model Selection is Required'
    },
    'inputs': {},
    'templates': {},
    'ip': {
      'invalidIps': 'IPs are invalid',
    },
    'credentials': {
      'required': 'Credentials Selection is Required'
    },
    'username': {
      'required': 'Username is Required'
    },
    'password': {
      'required': 'password is Required'
    },
  }

  private initializeTemplatesForm(templates: OrderTemplatesModel[], form: FormGroup, newOrders: NewOrdersType, ordersId: string): void {
    const templateArray = form.get('templates') as FormArray;
    if (ordersId) {
      newOrders?.templates.forEach(template => {
        const templateGroup = this.fb.group({
          label: this.fb.control(template.label),
          uuid: this.fb.control(template.uuid),
          options: this.fb.control([]),
          selectedOption: this.fb.control(template.default_value, Validators.required)
        });

        templateArray.push(templateGroup);
      });
    } else {

      templates.forEach(template => {
        const templateGroup = this.fb.group({
          label: this.fb.control(template.label),
          uuid: this.fb.control(template.uuid),
          options: this.fb.control([]),
          selectedOption: this.fb.control('', Validators.required)
        });

        templateArray.push(templateGroup);
      });
    }
  }

  private initializeInputsForm(inputs: OrderInputsModel[], form: FormGroup, newOrders: NewOrdersType, ordersId: string): void {
    const inputArray = form.get('inputs') as FormArray;
    if (ordersId) {
      newOrders?.inputs.forEach(input => {
        inputArray.push(this.fb.group({
          param_name: this.fb.control(input.param_name),
          default_value: this.fb.control(input.default_value),
          attribute: this.fb.control(input.attribute),
          param_type: this.fb.control(input.param_type),
          template: this.fb.control(input.template),
          template_name: this.fb.control(input.template_name)
        }));
      });
    } else {
      inputs.forEach(input => {
        inputArray.push(this.fb.group({
          param_name: this.fb.control(input.param_name),
          default_value: this.fb.control(input.default_value),
          attribute: this.fb.control(input.attribute),
          param_type: this.fb.control(input.param_type),
          template: this.fb.control(input.template),
          template_name: this.fb.control(input.template_name)
        }));
      });
    }
  }
}

export class CatalogOrdersViewModel {
  uuid: string;
  templates: OrderTemplatesModel[];
  inputs: OrderInputsModel[];
  account: OrderAccountModel;
  cloudType: string;
  cloudLogo: string;
  catalogLogo: string;
  price: number;
  catalogName: string;
  isPrivateCloud: boolean;
  category: string;
  logo: string;
  // ip: string;
  // hostType: string;
  // host: string[];
  // cred: string;
  // credentials: string;
}

export class NewOrders {
  uuid: string;
  orderId: string;
  cloudType: string;
  accountId: string;
  catalog: string;
  catalogName: string;
  orderStatus: string;
  price: string;
  vmImage: string;
  resourcePlan: string;
  templates: OrderTemplatesModel[];
  inputs: OrderInputsModel[];
  isApproved: boolean;
  orderType: string;
  vmImageName: string;
  credType: null;
  username: null;
  // host_meta: HostMeta;
  password: null;
  host: any[];
  ipAddress: any[];
  resourcePlanName: string;
  createdAt: string;
  updatedAt: string;
  editedBy: null;
  orderedBy: string;
  createdBy: number;
}

export interface CatalogOrdersModel {
  uuid: string;
  templates: OrderTemplatesModel[];
  inputs: OrderInputsModel[];
  account: OrderAccountModel;
  cloud_type: string;
  cloud_logo: string;
  logo: string;
  price: number;
  catalog_name: string;
  is_private_cloud: boolean;
  category: string;
  ip: string;
  host_type: string;
  host: string[];
  cred: string;
  credentials: string;
}

export interface OrderAccountModel {
  uuid: string,
  name: string,
  label: string;
  default_value: string;
}

export interface OrderTemplatesModel {
  label: string;
  dependency_name: string;
  uuid: string;
  name: string;
  default_value: string;
}

export interface OrderInputsModel {
  default_value: string;
  param_name: string;
  attribute: string;
  param_type: string;
  template: string;
  template_name: string;
}

export interface Option {
  value: string;
  label: string;
}

export function ipListValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    if (typeof value !== 'string') {
      return { invalidType: true };
    }
    const ips = value.split(',').map((ip: string) => ip.trim());
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const invalidIps = ips.filter(ip => !ipRegex.test(ip));
    return invalidIps.length > 0 ? { invalidIps: true } : null;
  };
}

export const AtLeastOneInputHasValue = (fields: Array<string>) => {
  return (group: FormGroup) => {
    const hasValue = fields.some(fieldName => {
      const control = group.get(fieldName);
      return control && control.value && (Array.isArray(control.value) ? control.value.length > 0 : true);
    });
    return hasValue ? null : { atLeastOneRequired: true };
  };
};