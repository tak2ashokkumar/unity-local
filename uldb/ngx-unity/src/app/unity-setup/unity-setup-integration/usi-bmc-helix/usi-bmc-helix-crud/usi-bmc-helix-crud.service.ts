import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { AWSAccountType, AwsResourceDetailsType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { AzureManageAccountsType, AzureResourceDetailsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { UnityResourceType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { GET_AGENT_CONFIGURATIONS, GET_AZURE_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { AtLeastOneInputHasValue, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { BMCHelixDataset, BMCHelixInstance, BMCHelixInstanceUnityOneDeviceType, BMCHelixResourceAttributes, BMCHelixResourceType } from '../usi-bmc-helix.type';

@Injectable()
export class UsiBmcHelixCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getInstanceDetails(instanceId: string) {
    return this.http.get<BMCHelixInstance>(`customer/bmc_helix/${instanceId}/`);
  }

  getUnityAttributesByDeviceType(unityDeviceType: BMCHelixInstanceUnityOneDeviceType, isChild?: boolean): Observable<BMCHelixInstanceUnityOneDeviceType> {
    return this.http.get(`customer/model_fields/?device_type=${unityDeviceType.value}`, { headers: Handle404Header })
      .pipe(
        map((res: BMCHelixInstanceUnityOneDeviceType) => {
          if (res) {
            // if(isChild){
            //   unityDeviceType.attrs = res.inbound.sort((a, b) => a.label.localeCompare(b.label));
            // } else {
            unityDeviceType.inbound = res.inbound.sort((a, b) => a.label.localeCompare(b.label));
            unityDeviceType.outbound = res.outbound.sort((a, b) => a.label.localeCompare(b.label));
            // }
          }
          return unityDeviceType;
        })
      );
  }

  getBMCHelixDatasets(instanceId: string): Observable<BMCHelixDataset[]> {
    const params: HttpParams = new HttpParams().set('uuid', instanceId).set('page_size', 0);
    return this.http.get<BMCHelixDataset[]>(`/customer/bmc_helix/datasets?uuid=${instanceId}`, { params: params })
      .pipe(map((response: BMCHelixDataset[]) => response.sort((a, b) => a.name.localeCompare(b.name))));
  }

  getBMCHelixResourceTypes(instanceId: string): Observable<BMCHelixResourceType[]> {
    const params: HttpParams = new HttpParams().set('uuid', instanceId).set('page_size', 0);
    return this.http.get<BMCHelixResourceType[]>(`/customer/bmc_helix/resources`, { params: params })
      .pipe(map((response: BMCHelixResourceType[]) => response.sort((a, b) => a.name.localeCompare(b.name))));
  }

  getBMCHelixDropdownData(instanceId: string): Observable<{ datasets: BMCHelixDataset[], resources: BMCHelixResourceType[] }> {
    return forkJoin({
      datasets: this.getBMCHelixDatasets(instanceId).pipe(catchError(error => of(undefined))),
      resources: this.getBMCHelixResourceTypes(instanceId).pipe(catchError(error => of(undefined))),
    })
  }

  getBMCHelixAttributesByResource(instanceId: string, resource: BMCHelixResourceType): Observable<BMCHelixResourceType> {
    const params: HttpParams = new HttpParams().set('uuid', instanceId)
      .set('name_space', resource.namespace).set('name', resource.name);
    return this.http.get(`/customer/bmc_helix/attributes`, { headers: Handle404Header, params: params })
      .pipe(
        map((response: BMCHelixResourceAttributes[]) => {
          if (response && response.length) {
            response = response.sort((a, b) => a.name.localeCompare(b.name));;
            let attrs: UnityResourceType[] = [];
            response.map(bmcAttr => {
              let a: UnityResourceType = {
                label: bmcAttr.name, value: bmcAttr.name, datatype: bmcAttr.datatype,
                defaultItems: bmcAttr.default_items ? bmcAttr.default_items : []
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

  getRelationshipTypes(instanceId: string): Observable<any[]> {
    const params: HttpParams = new HttpParams().set('uuid', instanceId).set('relationship', true);
    return this.http.get<any[]>(`customer/bmc_helix/resources`, { params: params })
  }

  buildIntegrationForm(instance?: BMCHelixInstance): FormGroup {
    if (instance) {
      let form = this.builder.group({
        name: [instance ? instance.name : '', [Validators.required, NoWhitespaceValidator]],
        is_itsm: [instance ? instance.is_itsm : false],
        is_workflow: [instance ? instance.is_workflow : false],
        is_cmdb: [instance ? instance.is_cmdb : false],
        username: [instance ? instance.username : '', [Validators.required, NoWhitespaceValidator]],
        password: ['', [Validators.required, NoWhitespaceValidator]],
        allow_cmdb_delete: [instance ? instance.allow_cmdb_delete : false],
        is_default: [instance ? instance.is_default : false]
      }, {
        validators: AtLeastOneInputHasValue(['is_itsm', 'is_workflow', 'is_cmdb'])
      })
      if (instance?.itsm_url) {
        form.addControl('itsm_url', new FormControl(instance ? instance.itsm_url : '', [Validators.required, RxwebValidators.url()]))
      }
      if (instance?.workflow_url) {
        form.addControl('workflow_url', new FormControl(instance ? instance.workflow_url : '', [Validators.required, RxwebValidators.url()]))
      }
      if (instance?.cmdb_url) {
        form.addControl('cmdb_url', new FormControl(instance ? instance.cmdb_url : '', [Validators.required, RxwebValidators.url()]))
        form.addControl('url_type', new FormControl(instance?.collector_proxy ?? false ? 'private' : 'public'))
        form.addControl('collector_proxy', new FormControl(instance?.collector_proxy ?? false))
        form.addControl('collector', this.builder.group({
          uuid: [instance.collector ? instance.collector.uuid : null]
        }));
      }
      if (instance.is_cmdb) {
        form.addControl('is_inbound', new FormControl(instance.is_inbound));
        form.addControl('is_outbound', new FormControl(instance.is_outbound));
      }
      return form;
    } else {
      return this.builder.group({
        name: ['', [Validators.required, NoWhitespaceValidator]],
        is_itsm: [false],
        is_workflow: [false],
        is_cmdb: [false],
        username: ['', [Validators.required, NoWhitespaceValidator]],
        password: ['', [Validators.required, NoWhitespaceValidator]],
        allow_cmdb_delete: [false],
        is_default: [false]
      }, {
        validators: AtLeastOneInputHasValue(['is_itsm', 'is_workflow', 'is_cmdb'])
      })
    }
  }

  resetIntegrationFormErrors(): any {
    let formErrors = {
      name: '',
      username: '',
      password: '',
      itsm_url: '',
      cmdb_url: '',
      workflow_url: '',
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
    itsm_url: {
      required: 'ITSM Instance URL is required',
      url: 'Enter valid url'
    },
    cmdb_url: {
      required: 'CMDB Instance URL is required',
      url: 'Enter valid url'
    },
    workflow_url: {
      required: 'Workflow URL is required',
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

  saveIntegrationForm(instance: BMCHelixInstance, instanceId?: string): Observable<BMCHelixInstance> {
    if (instanceId) {
      return this.http.patch<BMCHelixInstance>(`/customer/bmc_helix/${instanceId}/`, instance);
    } else {
      return this.http.post<BMCHelixInstance>(`/customer/bmc_helix/`, instance);
    }
  }

  buildConfigurationForm(instance?: BMCHelixInstance, unityDeviceTypes?: BMCHelixInstanceUnityOneDeviceType[], bmcHelixResources?: BMCHelixResourceType[], allAwsResourceTypeData?: AwsResourceDetailsType[][], allAzureResourceTypeData?: AzureResourceDetailsType[][], unityChildDeviceList?: BMCHelixInstanceUnityOneDeviceType[]): FormGroup {
    if (instance && instance.config_resources) {
      return this.builder.group({
        'dataset': [instance ? instance.config_resources.dataset : '', [Validators.required, NoWhitespaceValidator]],
        'existing_data_sync': [false],
        'resource_types': this.builder.array(
          instance.config_resources.resource_types?.map((rst, i) => {
            let unityDeviceData: string[] = rst.unity_device.split('_');
            let unityDeviceObj = unityDeviceTypes.find(udt => udt.value == rst.unity_device || (udt.value == 'aws_resource' && unityDeviceData[0] == 'aws') || (udt.value == 'azure_resource' && unityDeviceData[0] == 'azure'));
            let resourceTypefg: FormGroup = this.builder.group({
              'unity_device': [unityDeviceObj, [Validators.required]],
              'resource_type': [bmcHelixResources.find(rs => rs.name == rst.resource_type.name), [Validators.required]],
              'attribute_mapping': this.builder.array(
                rst.attribute_mapping.map(rstAttrMap => this.builder.group({
                  'unity_attr': [rstAttrMap.unity_attr, [Validators.required]],
                  'bmc_attr': [rstAttrMap.bmc_attr, [Validators.required]],
                  'default': [rstAttrMap.default],
                  'inbound': [rstAttrMap.inbound]
                }))
              ),
              'relationship_mapping': [rst.relationship_mapping],
              ...(rst.relationship_mapping && {
                'relationship_types': this.builder.array(
                  rst.relationship_types.map(rm => this.builder.group({
                    'unity_child_device': [unityChildDeviceList.find(cd => cd.value === rm.unity_child_device) ?? '', [Validators.required]],
                    'resource_type': [bmcHelixResources.find(rs => rs.name == rm.resource_type.name), [Validators.required]],
                    'relationship_type': [rm.relationship_type, [Validators.required]],
                    'relationship_name': [rm.relationship_name, [Validators.required]],
                    'attribute_mapping': this.builder.array(
                      rm.attribute_mapping.map(rmAttrMap => this.builder.group({
                        'unity_attr': [rmAttrMap.unity_attr, [Validators.required]],
                        'bmc_attr': [(bmcHelixResources.find(rs => rs.name == rm.resource_type.name)?.attrs)?.find(a => a.value == rmAttrMap.bmc_attr)
                          , [Validators.required]],
                        'default': [rmAttrMap.default],
                        // 'inbound': [rmAttrMap.inbound]
                      }))
                    )
                  }))
                )
              })

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
        'dataset': ['', [Validators.required, NoWhitespaceValidator]],
        'existing_data_sync': [false],
        'resource_types': this.builder.array([
          this.builder.group({
            'unity_device': ['', [Validators.required]],
            'resource_type': ['', [Validators.required]],
            'attribute_mapping': this.builder.array([
              this.builder.group({
                'unity_attr': ['', [Validators.required]],
                'bmc_attr': ['', [Validators.required]],
                'default': [''],
                'inbound': [false]
              })
            ]),
            'relationship_mapping': [false]
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

  buildResourceType() {
    let group = this.builder.group({
      'unity_device': ['', [Validators.required]],
      'resource_type': ['', [Validators.required]],
      'attribute_mapping': this.builder.array([
        this.builder.group({
          "unity_attr": ['', [Validators.required]],
          "bmc_attr": ['', [Validators.required]],
          "default": ['']
        })
      ]),
      'relationship_mapping': [false]
    });
    return group;
  }

  relationshipAttributeMappingFormGroup() {
    let group = this.builder.group({
      'unity_attr': ['', [Validators.required]],
      'bmc_attr': ['', [Validators.required]],
      'default': [''],
      // 'inbound': [false]
    });
    return group;
  }

  resetConfigurationFormErrors() {
    return {
      'resource_types': [this.getResourceTypeErrors()],
      'dataset': ''
    }
  }

  getResourceTypeErrors() {
    return {
      'unity_device': '',
      'cloud_resource_name': '',
      'resource_type': '',
      'attribute_mapping': [this.getAttributeMappingErrors()],
      'relationship_types': []
    }
  }

  getRelationshipTypeErrors() {
    return {
      'unity_child_device': '',
      'resource_type': '',
      'relationship_type': '',
      'relationship_name': '',
      'attribute_mapping': [this.getAttributeMappingErrors()]
    }
  }

  getAttributeMappingErrors() {
    return {
      'unity_attr': '',
      'bmc_attr': ''
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
        'required': 'BMC Helix resource type is required'
      },
      'attribute_mapping': {
        'unity_attr': {
          'required': 'UnityOne attribute is required'
        },
        'bmc_attr': {
          'required': 'BMC Helix attribute is required'
        }
      },
      'relationship_types': {
        'unity_child_device': {
          'required': 'UnityOne attribute is required'
        },
        'resource_type': {
          'required': 'BMC Helix attribute is required'
        },
        'relationship_type': {
          'required': 'Relationship type is requried'
        },
        'relationship_name': {
          'required': 'Relationship label is requried'
        },
        'attribute_mapping': {
          'unity_attr': {
            'required': 'UnityOne attribute is required'
          },
          'bmc_attr': {
            'required': 'BMC Helix attribute is required'
          }
        }
      }
    },
    'dataset': {
      'required': 'Dataset is required'
    }
  }

  saveConfigurationForm(data: any, instanceData: BMCHelixInstance, instanceId: string) {
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
      rst.resource_type = { 'name': rst.resource_type.name, 'namespace': rst.resource_type.namespace };
      rst.attribute_mapping.map(am => {
        am.bmc_attr = am.bmc_attr?.value;
      })
      if (rst?.relationship_types?.length) {
        rst.relationship_types.map(r => {
          r.unity_child_device = r.unity_child_device.value;
          r.resource_type = { 'name': r.resource_type.name, 'namespace': r.resource_type.namespace };
          r.attribute_mapping.map(a => {
            a.bmc_attr = a.bmc_attr?.value;
          })
        });
      }
    })
    if (!instanceData.config_resources) {
      return this.http.post<BMCHelixInstance>(`customer/bmc_helix/${instanceId}/config_cmdb/`, obj);
    } else {
      if (instanceData) {
        return this.http.patch<BMCHelixInstance>(`customer/bmc_helix/${instanceData.uuid}/config_cmdb/`, obj);
      } else {
        return null;
      }
    }
  }

  saveScheduleForm(scheduleMeta: { schedule_meta: UnityScheduleType }, instanceId: string): Observable<BMCHelixInstance> {
    return this.http.patch<BMCHelixInstance>(`/customer/bmc_helix/${instanceId}/`, scheduleMeta);
  }
}

export const UnityDeviceTypeList: BMCHelixInstanceUnityOneDeviceType[] = [
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

