import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { AtLeastOneInputHasValue, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ManageEngineAttributeType, ManageEngineInstanceConfigResources, ManageEngineInstanceType, ManageEngineInstanceUnityOneDeviceType, ManageEngineResourceType } from '../usi-manage-engine.type';
import { UnityResourceType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { AWSAccountType, AwsResourceDetailsType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { AzureManageAccountsType, AzureResourceDetailsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map } from 'rxjs/operators';
import { GET_AGENT_CONFIGURATIONS, GET_AZURE_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';

@Injectable()
export class UsiManageEngineCrudService {

  constructor(private builder: FormBuilder, private http: HttpClient) { }

  getInstanceDetails(instanceId: string) {
    return this.http.get<ManageEngineInstanceType>(`/customer/manage_engine/${instanceId}/`);
  }

  getUnityAttributesByDeviceType(unityDeviceType: ManageEngineInstanceUnityOneDeviceType): Observable<ManageEngineInstanceUnityOneDeviceType> {
    return this.http.get(`/customer/model_fields/?device_type=${unityDeviceType.value}`, { headers: Handle404Header })
      .pipe(
        map((res: ManageEngineInstanceUnityOneDeviceType) => {
          if (res) {
            // unityDeviceType.attrs = res.sort((a, b) => a.label.localeCompare(b.label));
            unityDeviceType.inbound = res.inbound.sort((a, b) => a.label.localeCompare(b.label));
            unityDeviceType.outbound = res.outbound.sort((a, b) => a.label.localeCompare(b.label));
          }
          return unityDeviceType;
        })
      );
  }

  getManageEngineResourceList(instanceId: string): Observable<ManageEngineResourceType[]> {
    return this.http.get<ManageEngineResourceType[]>(`/customer/manage_engine_resources/?uuid=${instanceId}`)
      .pipe(map((response: ManageEngineResourceType[]) => response.sort((a, b) => a.name.localeCompare(b.name))));
  }

  getManageEngineAttributesByResource(instanceId: string, resource: ManageEngineResourceType): Observable<ManageEngineResourceType> {
    let params: HttpParams = new HttpParams();
    if (resource.parent_id) {
      params = params.set('parent_id', resource.parent_id);
    }
    params = params.set('id', resource.id).set('resource', resource.value);
    return this.http.get(`customer/manage_engine_attributes/?uuid=${instanceId}`, { headers: Handle404Header, params: params })
      .pipe(
        map((response: ManageEngineAttributeType[]) => {
          if (response && response.length) {
            response = response.sort((a, b) => a.name.localeCompare(b.name));
            let attrs: UnityResourceType[] = [];
            response.map(manageEngineAttr => {
              let a: UnityResourceType = {
                label: manageEngineAttr.name, value: manageEngineAttr.field_key,
                defaultValues: manageEngineAttr.default_values ? manageEngineAttr.default_values : []
              };
              attrs.push(a);
            })
            resource.attrs = attrs;
          }
          return resource;
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

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }


  buildIntegrationForm(instance?: ManageEngineInstanceType): FormGroup {
    if (instance) {
      let form = this.builder.group({
        'name': [instance ? instance.name : '', [Validators.required, NoWhitespaceValidator]],
        'instance_url': [instance ? instance.instance_url : '', [Validators.required, RxwebValidators.url()]],
        'client_id': [instance ? instance.client_id : '', [Validators.required, NoWhitespaceValidator]],
        'client_secret': [instance ? instance.client_secret : '', [Validators.required, NoWhitespaceValidator]],
        'client_code': [instance ? instance.client_code : '', [Validators.required, NoWhitespaceValidator]],
        'is_cmdb': [instance ? instance.is_cmdb : false],
        'is_workflow': [instance ? instance.is_workflow : false],
        'allow_delete': [instance ? instance.allow_delete : false],
        'is_default': [instance ? instance.is_default : false],
        'url_type': [instance?.collector_proxy ?? false ? 'private' : 'public'],
        'collector_proxy': [instance?.collector_proxy ?? false],
        'collector': this.builder.group({
          'uuid': [instance.collector ? instance.collector.uuid : null]
        })
      }, {
        validators: AtLeastOneInputHasValue(['is_workflow', 'is_cmdb'])
      })
      if (instance.is_cmdb) {
        form.addControl('is_inbound', new FormControl(instance.is_inbound));
        form.addControl('is_outbound', new FormControl(instance.is_outbound));
      }
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'instance_url': ['', [Validators.required, RxwebValidators.url()]],
        'client_id': ['', [Validators.required, NoWhitespaceValidator]],
        'client_secret': ['', [Validators.required, NoWhitespaceValidator]],
        'client_code': ['', [Validators.required, NoWhitespaceValidator]],
        'is_cmdb': [false],
        'is_workflow': [false],
        'allow_delete': [false],
        'is_default': [false],
        'url_type': ['public'],
        'collector_proxy': [false],
        'collector': this.builder.group({
          'uuid': [null]
        })
      }, {
        validators: AtLeastOneInputHasValue(['is_workflow', 'is_cmdb'])
      })
      return form;
    }
  }

  resetIntegrationFormErrors(): any {
    let formErrors = {
      'name': '',
      'instance_url': '',
      'client_code': '',
      'client_id': '',
      'client_secret': '',
      'account_for': '',
      'is_default': '',
      'url_type': '',
      'collector': {
        'uuid': ''
      },
    };
    return formErrors;
  }

  integrationFormValidationMessages = {
    'name': {
      'required': 'Name is required',
    },
    'instance_url': {
      'required': 'Instance URL is required',
      'url': 'Enter valid url'
    },
    'client_code': {
      'required': 'Client code is required',
    },
    'client_id': {
      'required': 'Client id is required',
    },
    'client_secret': {
      'required': 'Client secret is required',
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  };

  saveIntegrationForm(instance: ManageEngineInstanceType, instanceId?: string): Observable<ManageEngineInstanceType> {
    if (instanceId) {
      return this.http.patch<ManageEngineInstanceType>(`/customer/manage_engine/${instanceId}/`, instance);
    } else {
      return this.http.post<ManageEngineInstanceType>(`/customer/manage_engine/`, instance);
    }
  }

  buildConfigurationForm(instance?: ManageEngineInstanceType, unityDeviceTypes?: ManageEngineInstanceUnityOneDeviceType[], ManageEngineResources?: ManageEngineResourceType[], allAwsResourceTypeData?: AwsResourceDetailsType[][], allAzureResourceTypeData?: AzureResourceDetailsType[][]): FormGroup {
    if (instance?.config_resources?.resource_types?.length) {
      return this.builder.group({
        'existing_data_sync': [false],
        'resource_types': this.builder.array(
          instance.config_resources.resource_types?.map((rst, i) => {
            let unityDeviceData: string[] = rst.unity_device.split('_');
            let unityDeviceObj = unityDeviceTypes.find(udt => udt.value == rst.unity_device || (udt.value == 'aws_resource' && unityDeviceData[0] == 'aws') || (udt.value == 'azure_resource' && unityDeviceData[0] == 'azure'));
            let resourceTypefg: FormGroup = this.builder.group({
              'unity_device': [unityDeviceObj, [Validators.required]],
              'resource_type': [ManageEngineResources.find(rs => rs.value == rst.resource_type), [Validators.required]],
              'attribute_mapping': this.builder.array(
                rst.attribute_mapping.map(rstAttrMap => this.builder.group({
                  'unity_attr': [rstAttrMap.unity_attr, [Validators.required]],
                  'manage_attr': [rstAttrMap.manage_attr, [Validators.required]],
                  'default': [rstAttrMap.default],
                  'inbound': [rstAttrMap.inbound]
                }))
              )
            })
            if (rst.cloud_resource_name) {
              this.getCloudRresourceName(i, resourceTypefg, unityDeviceData, allAwsResourceTypeData, allAzureResourceTypeData);
            }
            return resourceTypefg;
          })
        ),
      });
    } else {
      return this.builder.group({
        'existing_data_sync': [false],
        'resource_types': this.builder.array([
          this.builder.group({
            'unity_device': ['', [Validators.required]],
            'resource_type': ['', [Validators.required]],
            'attribute_mapping': this.builder.array([
              this.builder.group({
                'unity_attr': ['', [Validators.required]],
                'manage_attr': ['', [Validators.required]],
                'default': [''],
                'inbound': [false]
              })
            ])
          })
        ]),
      })
    }
  }

  getCloudRresourceName(index: number, formGroup: FormGroup, unityDeviceData: string[], allAwsResourceTypeData: AwsResourceDetailsType[][], allAzureResourceTypeData: AzureResourceDetailsType[][]) {
    let cloudResourceNameObj;
    if (unityDeviceData[0] == 'aws') {
      cloudResourceNameObj = allAwsResourceTypeData[index]?.find(resource => resource.name == unityDeviceData[1]);
    } else {
      cloudResourceNameObj = allAzureResourceTypeData[index]?.find(resource => resource.name == unityDeviceData[1]);
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
      'cloud_resource_name': '',
      'resource_type': '',
      'attribute_mapping': [this.getAttributeMappingErrors()]
    }
  }

  getAttributeMappingErrors() {
    return {
      'unity_attr': '',
      'manage_attr': ''
    }
  }

  configurationFormValidationMessages = {
    'resource_types': {
      'unity_device': {
        'required': 'Device type is required'
      },
      'cloud_resource_name': {
        'required': 'Service is required'
      },
      'resource_type': {
        'required': 'Manage Engine resource type is required'
      },
      'attribute_mapping': {
        'unity_attr': {
          'required': 'UnityOne attribute is required'
        },
        'manage_attr': {
          'required': 'Manage Engine attribute is required'
        }
      }
    }
  }

  saveConfigurationForm(data: any, instanceData: ManageEngineInstanceType, instanceId: string) {
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
      rst.attribute_mapping.map(am => {
        am.manage_attr = am.manage_attr?.value;
      })
    })
    if (!instanceData.config_resources) {
      return this.http.post<ManageEngineInstanceConfigResources>(`/customer/manage_engine_cmdb/${instanceId}/config_cmdb/`, obj);
    } else {
      if (instanceData) {
        return this.http.patch<ManageEngineInstanceConfigResources>(`/customer/manage_engine_cmdb/${instanceData.uuid}/config_cmdb/`, obj);
      } else {
        return null;
      }
    }
  }

  saveScheduleForm(scheduleMeta: { schedule_meta: UnityScheduleType }, instanceId: string): Observable<ManageEngineInstanceType> {
    return this.http.patch<ManageEngineInstanceType>(`/customer/manage_engine/${instanceId}/`, scheduleMeta);
  }

}

export const UnityDeviceTypeList: ManageEngineInstanceUnityOneDeviceType[] = [
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
