import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { ADD_SERVICE_NOW_ACCOUNT, GET_AGENT_CONFIGURATIONS, GET_AZURE_ACCOUNTS, MANAGE_SERVICE_NOW } from 'src/app/shared/api-endpoint.const';
import { AtLeastOneInputHasValue, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AWSAccountType, AwsResourceDetailsType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { AzureManageAccountsType, AzureResourceDetailsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { PublicCloudServiceType, ServiceNowAttributeType, ServiceNowResourceType, ServicenowAccount, ServicenowAccountUnityOneDeviceType, UnityResourceType } from '../usi-servicenow.type';

@Injectable()
export class UsiServicenowCrudService {

  constructor(private builder: FormBuilder, private http: HttpClient) { }

  getInstanceDetails(instanceId: string) {
    return this.http.get<ServicenowAccount>(MANAGE_SERVICE_NOW(instanceId));
  }

  getUnityAttributesByDeviceType(unityDeviceType: ServicenowAccountUnityOneDeviceType): Observable<ServicenowAccountUnityOneDeviceType> {
    return this.http.get(`customer/model_fields/?device_type=${unityDeviceType.value}`, { headers: Handle404Header })
      .pipe(
        map((res: ServicenowAccountUnityOneDeviceType) => {
          if (res) {
            // unityDeviceType.attrs = res;
            unityDeviceType.inbound = res.inbound.sort((a, b) => a.label.localeCompare(b.label));
            unityDeviceType.outbound = res.outbound.sort((a, b) => a.label.localeCompare(b.label));
          }
          return unityDeviceType;
        })
      );
  }

  getAwsAccounts(): Observable<AWSAccountType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<AWSAccountType[]>(`/customer/managed/aws/accounts/`, { params: params });
  }

  getAwsServiceAndResourceDetails(accounts: AWSAccountType[]): Observable<AwsResourceDetailsType[]> {
    let params: HttpParams = new HttpParams();
    accounts.map(account => params = params.append('uuid', account.uuid));
    return this.http.get<AwsResourceDetailsType[]>(`/customer/managed/aws/accounts/resource_count_by_type/`, { params: params });
  }

  getAzureAccounts(): Observable<AzureManageAccountsType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<AzureManageAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: params });
  }

  getAzureServiceAndResourceDetails(accounts: AzureManageAccountsType[]): Observable<AzureResourceDetailsType[]> {
    let params: HttpParams = new HttpParams();
    accounts.map(account => params = params.append('uuid', account.uuid));
    return this.http.get<AzureResourceDetailsType[]>(`/customer/managed/azure/accounts/resource_count_by_type/`, { params: params });
  }

  getServiceNowResourceList(instanceId: string): Observable<ServiceNowResourceType[]> {
    const params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<ServiceNowResourceType[]>(`customer/cmdb-resources/?uuid=${instanceId}`, { params: params })
    .pipe(map((response: ServiceNowResourceType[]) => response.sort((a, b) => a.resource.localeCompare(b.resource))));
  }

  getServiceNowAttributesByResource(instanceId: string, resource: ServiceNowResourceType): Observable<ServiceNowResourceType> {
    const params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get(`customer/cmdb-attributes/?uuid=${instanceId}&resource=${resource.value}`, { headers: Handle404Header })
      .pipe(
        map((response: ServiceNowAttributeType[]) => {
          if (response && response.length) {
            let snAttrs = response.getFirst().attributes;
            let attrs: UnityResourceType[] = [];
            snAttrs.map(snAttr => {
              let a: UnityResourceType = { label: snAttr, value: snAttr };
              attrs.push(a);
            })
            resource.attrs = attrs;
          }
          return resource;
        })
      );
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  buildIntegrationForm(instance?: ServicenowAccount): FormGroup {
    if (instance) {
      let form = this.builder.group({
        name: [instance ? instance.name : '', [Validators.required, NoWhitespaceValidator],],
        instance_url: [instance ? instance.instance_url : '', [Validators.required, RxwebValidators.url()],],
        username: [instance ? instance.username : '', [Validators.required, NoWhitespaceValidator],],
        password: ['', [Validators.required, NoWhitespaceValidator],],
        is_cmdb: [instance ? instance.is_cmdb : false],
        is_itsm: [instance ? instance.is_itsm : false],
        is_ire: [instance ? instance.is_ire : false],
        allow_delete: [instance ? instance.allow_delete : false],
        is_default: [instance ? instance.is_default : false],
        url_type: [instance?.collector_proxy ?? false ? 'private' : 'public'],
        collector_proxy: [instance?.collector_proxy ?? false],
        collector: this.builder.group({
          uuid: [instance.collector ? instance.collector.uuid : null]
        })
      }, {
        validators: AtLeastOneInputHasValue(['is_cmdb', 'is_itsm'])
      });
      if (instance.is_cmdb) {
        form.addControl('is_inbound', new FormControl(instance.is_inbound));
        form.addControl('is_outbound', new FormControl(instance.is_outbound));
      }
      return form;
    } else {
      let form = this.builder.group({
        name: ['', [Validators.required, NoWhitespaceValidator]],
        instance_url: ['', [Validators.required, RxwebValidators.url()]],
        username: ['', [Validators.required, NoWhitespaceValidator]],
        password: ['', [Validators.required, NoWhitespaceValidator]],
        is_cmdb: [false],
        is_itsm: [false],
        is_ire: [false],
        allow_delete: [false],
        is_default: [false],
        url_type: ['public'],
        collector_proxy: [false],
        collector: this.builder.group({
          uuid: [null]
        })
      }, {
        validators: AtLeastOneInputHasValue(['is_cmdb', 'is_itsm'])
      });
      return form;
    }
  }

  resetIntegrationFormErrors(): any {
    let formErrors = {
      name: '',
      instance_url: '',
      username: '',
      password: '',
      account_for: '',
      is_default: '',
      url_type: '',
      collector: {
        uuid: ''
      },
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
    password: {
      required: 'Password is required',
    },
    collector: {
      uuid: {
        'required': 'Collector is required'
      }
    }
  };

  saveIntegrationForm(instance: ServicenowAccount, instanceId?: string): Observable<ServicenowAccount> {
    if (instanceId) {
      return this.http.patch<ServicenowAccount>(MANAGE_SERVICE_NOW(instanceId), instance);
    } else {
      return this.http.post<ServicenowAccount>(ADD_SERVICE_NOW_ACCOUNT(), instance);
    }
  }

  buildConfigurationForm(instance?: ServicenowAccount, unityDeviceTypes?: ServicenowAccountUnityOneDeviceType[], serviceNowResources?: ServiceNowResourceType[], allAwsResourceTypeData?: AwsResourceDetailsType[][], allAzureResourceTypeData?: AzureResourceDetailsType[][]): FormGroup {
    if (instance && instance.resource_types && instance.resource_types.length) {
      return this.builder.group({
        'resource_types': this.builder.array(
          instance.resource_types.map((resource, i) => {
            let unityDeviceData: string[] = resource.unity_device.split('_');
            let unityDeviceObj = unityDeviceTypes.find(udt => udt.value == resource.unity_device || (udt.value == 'aws_resource' && unityDeviceData[0] == 'aws') || (udt.value == 'azure_resource' && unityDeviceData[0] == 'azure'));
            let resourcefg: FormGroup = this.builder.group({
              'unity_device': [unityDeviceObj, [Validators.required]],
              'resource_type': [serviceNowResources.find(snrs => snrs.value == resource.resource_type), [Validators.required]],
              'attribute_mapping': this.builder.array(
                resource.attribute_mapping.map(mapping => this.builder.group({
                  'unity_attr': [mapping.unity_attr, [Validators.required]],
                  'servicenow_attr': [mapping.servicenow_attr, [Validators.required]],
                  'inbound': [mapping.inbound]
                }))
              )
            })
            if (resource.cloud_resource_name) {
              this.getCloudRresourceName(i, resourcefg, unityDeviceData, allAwsResourceTypeData, allAzureResourceTypeData);
            }
            return resourcefg;
          })
        ),
        'existing_data_sync': [false]
      });
    } else {
      return this.builder.group({
        'resource_types': this.builder.array([
          this.builder.group({
            'unity_device': ['', [Validators.required]],
            'resource_type': ['', [Validators.required]],
            'attribute_mapping': this.builder.array([
              this.builder.group({
                'unity_attr': ['', [Validators.required]],
                'servicenow_attr': ['', [Validators.required]],
                'inbound': [false]
              })
            ])
          })
        ]),
        'existing_data_sync': [false]
      })
    }
  }

  getCloudRresourceName(index: number, formGroup: FormGroup, unityDeviceData: string[], allAwsResourceTypeData: AwsResourceDetailsType[][], allAzureResourceTypeData: AzureResourceDetailsType[][]) {
    let cloudResourceNameObj;
    if (unityDeviceData[0] == 'aws') {
      cloudResourceNameObj = allAwsResourceTypeData[index].find(resource => resource.name == unityDeviceData[1]);
    } else {
      cloudResourceNameObj = allAzureResourceTypeData[index].find(resource => resource.name == unityDeviceData[1]);
    }
    formGroup.addControl('cloud_resource_name', new FormControl(cloudResourceNameObj, [Validators.required]));
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
      'cloud_resource_name': '',
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
        'required': 'Device type is required'
      },
      'resource_type': {
        'required': 'ServiceNow resource type is required'
      },
      'cloud_resource_name': {
        'required': 'Service is required'
      },
      'attribute_mapping': {
        'unity_attr': {
          'required': 'UnityOne attribute is required'
        },
        'servicenow_attr': {
          'required': 'ServiceNow attribute is required'
        }
      }
    }
  }

  saveConfigurationForm(data: any, instanceData: ServicenowAccount, instanceId: string) {
    let obj = Object.assign({}, data);
    obj.resource_types.map(rst => {
      if (rst.cloud_resource_name && rst.unity_device?.value == 'aws_resource') {
        rst.unity_device = 'aws'.concat('_').concat(rst.cloud_resource_name?.name).concat('_').concat(rst.cloud_resource_name?.service);
        rst.cloud_resource_name = rst.cloud_resource_name?.name;
      } else if (rst.cloud_resource_name && rst.unity_device?.value == 'azure_resource') {
        rst.unity_device = 'azure'.concat('_').concat(rst.cloud_resource_name?.name).concat('_').concat(rst.cloud_resource_name?.provider_name);
        rst.cloud_resource_name = rst.cloud_resource_name?.name;
      } else {
        rst.unity_device = rst.unity_device?.value;
      }
      rst.resource_type = rst.resource_type?.value;
    })
    if (!instanceData.resource_types) {
      return this.http.post<any[]>(`customer/service_now/${instanceId}/config_cmdb/`, obj);
    } else {
      if (instanceData) {
        return this.http.patch<any[]>(`customer/service_now/${instanceData.uuid}/config_cmdb/`, obj);
      } else {
        return null;
      }
    }
  }

  saveScheduleForm(scheduleMeta: { schedule_meta: UnityScheduleType }, instanceId: string): Observable<ServicenowAccount> {
    return this.http.patch<ServicenowAccount>(MANAGE_SERVICE_NOW(instanceId), scheduleMeta);
  }
}

export const UnityDeviceTypeList: ServicenowAccountUnityOneDeviceType[] = [
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
    label: 'Database',
    value: 'database'
  },
  {
    label: 'Database Entity',
    value: 'database_entity'
  },
  {
    label: 'VMware Cluster',
    value: 'vmware_cluster'
  },
  {
    label: 'VMware VM',
    value: 'vmware'
  },
  {
    label: 'vCloud VM',
    value: 'vcloud'
  },
  {
    label: 'ESXi VM',
    value: 'esxi'
  },
  {
    label: 'HyperV VM',
    value: 'hyperv'
  },
  {
    label: 'OpenStack VM',
    value: 'open_stack'
  },
  {
    label: 'Custom VM',
    value: 'virtual_machine'
  },
  // {
  //   label: 'AWS VM',
  //   value: 'aws_vm'
  // },
  // {
  //   label: 'Azure VM',
  //   value: 'azure_vm'
  // },
  // {
  //   label: 'GCP VM',
  //   value: 'gcp_vm'
  // },
  // {
  //   label: 'Oracle VM',
  //   value: 'oci_vm'
  // },
  {
    label: 'AWS Resource',
    value: 'aws_resource'
  },
  {
    label: 'Azure Resource',
    value: 'azure_resource'
  },
  {
    label: 'ONTAP Storage Cluster',
    value: 'ontap_storage_cluster'
  },
  {
    label: 'ONTAP Storage Disk',
    value: 'ontap_storage_disk'
  },
  {
    label: 'ONTAP Storage Node',
    value: 'ontap_storage_node'
  }
]

export const publicCloudServiceList: PublicCloudServiceType[] = [
  {
    label: 'Firewall',
    value: 'firewall'
  },
]

