import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UnitySetupCustomAttribute } from 'src/app/shared/SharedEntityTypes/device-custom-attributes.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnityResourceType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UnitySetupCustomAttributesService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getAttributes(criteria: SearchCriteria): Observable<PaginatedResult<UnitySetupCustomAttribute>> {
    let params = this.tableSvc.getWithParam(criteria);
    return this.http.get<PaginatedResult<UnitySetupCustomAttribute>>(`/customer/custom_attributes/`, { params: params });
  }

  convertToViewData(data: UnitySetupCustomAttribute[]) {
    let viewData: UnitySetupCustomAttributeViewData[] = [];
    data.map(d => {
      let a = new UnitySetupCustomAttributeViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.resourceType = d.resource_type ? this.utilSvc.toUpperCase(d.resource_type) : 'N/A';;
      a.valueType = d.value_type;
      a.defaultValue = d.default_value;
      a.choiceValues = d.choice_values && d.choice_values.length ? d.choice_values : [];
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'N/A';
      a.createdBy = d.created_by_name;
      a.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      a.updatedBy = d.updated_by_name;
      a.attr = d;
      a.valueForm = this.buildValueForm(d);
      viewData.push(a);
    })
    return viewData;
  }

  buildValueForm(data: UnitySetupCustomAttribute): FormGroup {
    let form = this.builder.group({});
    switch (data.value_type) {
      case 'Integer':
        form.addControl('default_value', new FormControl(data.default_value, [RxwebValidators.numeric({ allowDecimal: false }), NoWhitespaceValidator]));
        break;
      case 'Char':
        form.addControl('default_value', new FormControl(data.default_value, [Validators.pattern(/^[\s\S]+$/), NoWhitespaceValidator]));
        break;
      default:
        form.addControl('default_value', new FormControl(data.default_value));
    }
    return form;
  }

  save(data: UnitySetupCustomAttribute): Observable<UnitySetupCustomAttribute> {
    return this.http.put<UnitySetupCustomAttribute>(`/customer/custom_attributes/${data.uuid}/`, data);
  }

  deleteAttribute(attrId: string) {
    return this.http.delete<any>(`/customer/custom_attributes/${attrId}/`);
  }
}

export class UnitySetupCustomAttributeViewData {
  id: string;
  name: string;
  resourceType: string;
  valueType: string;
  choiceValues: string[];
  defaultValue: any;
  valueForm: FormGroup;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  attr: UnitySetupCustomAttribute;
}

export const UnityDeviceTypeList: UnityResourceType[] = [
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
    label: 'Ontap Storage Cluster',
    value: 'ontap_storage_cluster'
  },
  {
    label: 'Ontap Storage Node',
    value: 'ontap_storage_node'
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
  // {
  //   label: 'AWS Resource',
  //   value: 'aws_resource'
  // },
  // {
  //   label: 'Azure Resource',
  //   value: 'azure_resource'
  // },
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

export const AttributeValueTypes: string[] = [
  'Char', 'Integer', 'Boolean', 'Choice'
]


