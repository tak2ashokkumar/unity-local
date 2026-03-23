import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BMCHelixDataset, BMCHelixInstance, BMCHelixInstanceUnityOneDeviceType, BMCHelixRelationshipType, BMCHelixResourceAttributes, BMCHelixResourceType, UnityOneModalFieldsByDeviceType } from '../../usi-bmc-helix.type';
import { forkJoin, Observable, of } from 'rxjs';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { catchError, map } from 'rxjs/operators';
import { LabelValueType, UnityResourceType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { AWSAccountType, AwsResourceDetailsType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { AzureManageAccountsType, AzureResourceDetailsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { GET_AZURE_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { cloneDeep as _clone } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class UsiBmcHelixConfigurationCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getUnityAttributesByDeviceType(unityDeviceType: BMCHelixInstanceUnityOneDeviceType): Observable<BMCHelixInstanceUnityOneDeviceType> {
    return this.http.get<UnityOneModalFieldsByDeviceType>(`customer/bmc_unity_attrs_by_device/?device_type=${unityDeviceType.value}`, { headers: Handle404Header })
      .pipe(
        map((res: UnityOneModalFieldsByDeviceType) => {
          if (res) {
            unityDeviceType.inbound = res.inbound.sort((a, b) => a.label.localeCompare(b.label));
            unityDeviceType.outbound = res.outbound.sort((a, b) => a.label.localeCompare(b.label));
          }
          return unityDeviceType;
        })
      );
  }
  getChildDeviceTypesByDeviceType(unityDeviceType: BMCHelixInstanceUnityOneDeviceType): Observable<BMCHelixInstanceUnityOneDeviceType> {
    return this.http.get<LabelValueType[]>(`customer/child_device_metrics/?device_type=${unityDeviceType.value}`, { headers: Handle404Header })
      .pipe(
        map((res: LabelValueType[]) => {
          if (res) {
            unityDeviceType.children = <BMCHelixInstanceUnityOneDeviceType[]>res;
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

  getBMCHelixDatasets(instanceId: string): Observable<BMCHelixDataset[]> {
    const params: HttpParams = new HttpParams().set('uuid', instanceId).set('page_size', 0);
    return this.http.get<BMCHelixDataset[]>(`/customer/bmc_helix/datasets`, { params: params })
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

  getBMCHelixRelationshipTypes(instanceId: string, source: string, target: string): Observable<BMCHelixRelationshipType[]> {
    const params: HttpParams = new HttpParams().set('uuid', instanceId).set('source_class', source).set('target_class', target);
    return this.http.get<BMCHelixRelationshipType[]>(`/customer/bmc_helix/relationships`, { params: params })
  }

  buildConfigurationForm(instance?: BMCHelixInstance, unityDeviceTypes?: BMCHelixInstanceUnityOneDeviceType[], bmcHelixResources?: BMCHelixResourceType[], awsResourceMapping?: AwsResourceDetailsType[][], azureResourceMapping?: AzureResourceDetailsType[][]): FormGroup {
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
                  'inbound': [rstAttrMap.inbound ? rstAttrMap.inbound : false]
                }))
              ),
              'relationship_mapping': [rst.relationship_mapping],
              ...(rst.relationship_mapping && {
                'relationship_types': this.builder.array(
                  rst.relationship_types.map(rstRm => this.builder.group({
                    'unity_child_device': [unityDeviceObj.children?.find(c => c.value === rstRm.unity_child_device) ?? '', [Validators.required]],
                    'resource_type': [bmcHelixResources.find(rs => rs.name == rstRm.resource_type.name), [Validators.required]],
                    'relationship_type': [rstRm.relationship_type, [Validators.required]],
                    'relationship_name': [rstRm.relationship_name, [Validators.required]],
                    'attribute_mapping': this.builder.array(
                      rstRm.attribute_mapping.map(rstRmAttrMap => this.builder.group({
                        'unity_attr': [rstRmAttrMap.unity_attr, [Validators.required]],
                        'bmc_attr': [(bmcHelixResources.find(rs => rs.name == rstRm.resource_type.name)?.attrs)?.find(a => a.value == rstRmAttrMap.bmc_attr)
                          , [Validators.required]],
                        'default': [rstRmAttrMap.default],
                        'inbound': [rstRmAttrMap.inbound ? rstRmAttrMap.inbound : false]
                      }))
                    )
                  }))
                )
              })
            })
            if (rst.cloud_resource_name) {
              this.getCloudRresourceName(i, resourceTypefg, unityDeviceData, awsResourceMapping, azureResourceMapping);
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

  getCloudRresourceName(index: number, formGroup: FormGroup, unityDeviceData: string[], awsResourceMapping: AwsResourceDetailsType[][], azureResourceMapping: AzureResourceDetailsType[][]) {
    let cloudResourceNameObj;
    if (unityDeviceData[0] == 'aws') {
      cloudResourceNameObj = awsResourceMapping[index]?.find(resource => resource.name == unityDeviceData[1]);
    } else {
      cloudResourceNameObj = azureResourceMapping[index]?.find(resource => resource.name == unityDeviceData[1]);
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
          "default": [''],
          'inbound': [false]
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
      'inbound': [false]
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
}

export const UNITY_DEVICE_TYPE_LIST: BMCHelixInstanceUnityOneDeviceType[] = [
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
    label: 'Pure Storage',
    value: 'pure_storage'
  },
  {
    label: 'Pure Storage Array',
    value: 'pure_array'
  },
  {
    label: 'Ontap Storage',
    value: 'ontap_storage'
  },
  {
    label: 'Ontap Storage Cluster',
    value: 'ontap_storage_cluster'
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
  // {
  //   label: 'ONTAP Storage Cluster',
  //   value: 'ontap_storage_cluster'
  // },
  // {
  //   label: 'ONTAP Storage Disk',
  //   value: 'ontap_storage_disk'
  // },
  // {
  //   label: 'ONTAP Storage Node',
  //   value: 'ontap_storage_node'
  // }
]

export class BMCHelixRelationshipTypeViewData {
  [key: string]: BMCHelixRelationshipTypeViewDataObj[];
}

export class BMCHelixRelationshipTypeViewDataObj {
  name: string;
  namespace: string;
}
