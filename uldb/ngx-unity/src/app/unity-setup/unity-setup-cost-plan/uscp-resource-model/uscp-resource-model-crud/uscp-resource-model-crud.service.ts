import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CloudTypesItem, CostPlansListType, DatacentersByRegionTypeItem, PrivateCloudListType, UscpResourceModelDataType } from '../uscp-resource-model.type';
import { CostModelInstance } from '../../uscp-cost-model/uscp-cost-model.type';

@Injectable()
export class UscpResourceModelCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getResourceDetails(uuid: string): Observable<UscpResourceModelDataType> {
    return this.http.get<UscpResourceModelDataType>(`customer/resources/resource_plan/${uuid}/`);
  }

  getPrivateClouds(): Observable<PrivateCloudListType[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', 0);
    return this.http.get<PrivateCloudListType[]>(`customer/private_cloud_integrated/`, { params: params });
  }

  getCostModelListData(): Observable<CostModelInstance[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('is_active', 'True');
    params = params.set('page_size', 0);
    return this.http.get<CostModelInstance[]>(`customer/cost_plan/private_cost_plan/`, { params: params });
  }

  getDatacenters(regions: string[]): Observable<DatacentersByRegionTypeItem[]> {
    let params = new HttpParams();
    regions.forEach(name => { params = params.append('region', name); });
    return this.http.get<DatacentersByRegionTypeItem[]>(`/customer/cost_plan/private_cost_plan/get_datacenter_by_region/`, { params: params });
  }

  getAllDatacenters(data: DatacentersByRegionTypeItem[]): string[] {
    return data.flatMap(entry => entry.datacenters);
  }

  buildForm(d: UscpResourceModelDataType): FormGroup {
    if (d) {
      let form = this.builder.group({
        'resource_name': [d.resource_name, [Validators.required, NoWhitespaceValidator]],
        'cloud_types': [{ value: this.formatCloudTypes(d.cloud_type), disabled: true }, [Validators.required]],
        'regions': [{ value: d.regions, disabled: true }, [Validators.required]],
        'datacenters': [{ value: d.datacenters, disabled: true }, [Validators.required]],
        'cpu_size': [d.cpu_size, [Validators.min(1)]],
        'cpu_customization': [d.cpu_customization],
        'memory_size': [d.memory_size, [Validators.min(1)]],
        'memory_unit': [d.memory_unit, [Validators.required]],
        'memory_customization': [d.memory_customization],
        'storage_size': [d.storage_size, [Validators.min(1)]],
        'storage_unit': [d.storage_unit, [Validators.required]],
        'storage_customization': [d.storage_customization],
        'disk_type': [d.disk_type, [Validators.required]],
        'allow_multiple_disk': [d.allow_multiple_disk],
        'cost_type': [d.cost_type, [Validators.required]],
        'cost_plans_list': [d.cost_plans_list, [Validators.required]],
        'price_unit': [d.price_unit, [Validators.required]],
        'is_active': [d.is_active]
      })
      return form;
    } else {
      return this.builder.group({
        'resource_name': ['', [Validators.required, NoWhitespaceValidator]],
        'cloud_types': [[], [Validators.required]],
        'regions': [[], [Validators.required]],
        'datacenters': [{ value: [], disabled: true }, [Validators.required]], // Disabled in Create Mode
        'cpu_size': [, [Validators.min(1)]],
        'cpu_customization': [false],
        'memory_size': [, [Validators.min(1)]],
        'memory_unit': ['GB', [Validators.required]],
        'memory_customization': [false],
        'storage_size': [, [Validators.min(1)]],
        'storage_unit': ['GB', [Validators.required]],
        'storage_customization': [false],
        'disk_type': ['', [Validators.required]],
        'allow_multiple_disk': [false],
        'cost_type': ['', [Validators.required]],
        'cost_plans_list': [[], [Validators.required]],
        'price_unit': ['', [Validators.required]],
        'is_active': [true]
      })
    }
  }

  formatCloudTypes(cloud: string) {
    return [{ "cloud": cloud }];
  }

  resetformErrors() {
    return {
      'resource_name': '',
      'cloud_types': '',
      'regions': '',
      'datacenters': '',
      'cpu_size': '',
      'memory_size': '',
      'memory_unit': '',
      'storage_size': '',
      'storage_unit': '',
      'disk_type': '',
      'allow_multiple_disk': '',
      'cost_type': '',
      'cost_plans_list': '',
      'price_unit': '',
      'is_active': ''
    }
  }

  validationMessages = {
    'resource_name': {
      'required': 'Name is required'
    },
    'cloud_types': {
      'required': 'Cloud selection is required'
    },
    'regions': {
      'required': 'Region selection is required'
    },
    'datacenters': {
      'required': 'Datacenter selection is required'
    },
    'cpu_size': {
      'required': 'CPU Size is required',
      'min': 'Minimum value should be greater than or equal to 1',
    },
    'cpu_customization': {
      'required': 'CPU Customization is required'
    },
    'memory_size': {
      'required': 'Memory size is required',
      'min': 'Minimum value should be greater than or equal to 1',
    },
    'memory_unit': {
      'required': 'Memory Unit is required'
    },
    'memory_customization': {
      'required': 'Memory Customization is required'
    },
    'storage_size': {
      'required': 'Storage Size is required',
      'min': 'Minimum value should be greater than or equal to 1',
    },
    'storage_unit': {
      'required': 'Storage Unit is required'
    },
    'storage_customization': {
      'required': 'Storage Customization is required'
    },
    'disk_type': {
      'required': 'Disk Type selection is required'
    },
    // 'disk_type_customization': {
    //   'required': 'Disk Type Customization is required'
    // },
    'allow_multiple_disk': {
      'required': 'Allow Multiple Disk is required'
    },
    'cost_type': {
      'required': 'Plan Type selection is required'
    },
    'cost_plans_list': {
      'required': 'Cost Model selection is required'
    },
    'price_unit': {
      'required': 'Price Unit is required'
    },
    'is_active': {
      'required': 'Status is required'
    },
  }

  convertCloudData(clouds: PrivateCloudListType[]): CloudTypesItem[] {
    let dropdownData: CloudTypesItem[] = [];
    clouds.map(r => {
      let a: PrivateCloudListData = new PrivateCloudListData();
      a.cloud = r.platform_type;
      dropdownData.push(a);
    })
    return dropdownData;
  }



  convertList(resources: CostModelInstance[]): CostModelDropdownData[] {
    let dropdownData: CostModelDropdownData[] = [];
    resources.map(r => {
      let a: CostModelDropdownData = new CostModelDropdownData();
      a.uuid = r.uuid;
      a.planName = r.plan_name;
      a.planDescription = r.plan_description;
      a.planType = r.plan_type;
      a.region = r.regions;
      a.diskType = r.disk_type;
      a.priceUnit = r.price_unit;
      a.priceAllocation = r.price_allocation;
      a.unitCostPrice = `$${r.unit_cost_price}`;
      a.isActive = r.is_active;
      dropdownData.push(a);
    })
    return dropdownData;
  }

  fomatCostModelData(costModel: CostModelDropdownData[]): CostPlansListType[] {
    let cpList: CostPlansListType[] = [];
    costModel.map(cp => {
      let m: any = {};
      m.cost_plan = cp.uuid;
      cpList.push(m);
    })
    return cpList;
  }

  validateSelectedPlans(selectedPlans: string[]): Record<string, number> {
    const planCounts: Record<string, number> = {
      'CPU Only': 0,
      'Memory Only': 0,
      'Disk Only': 0,
      'CPU and Memory': 0,
      'All At One Price ': 0,
    };

    // Count occurrences of each plan type
    selectedPlans.forEach(plan => {
      if (plan === 'CPU and Memory') {
        planCounts['CPU Only'] += 1;
        planCounts['Memory Only'] += 1;
      }
      if (plan === 'All At One Price') {
        planCounts['CPU Only'] += 1;
        planCounts['Memory Only'] += 1;
        planCounts['Disk Only'] += 1;
      }
      if (planCounts[plan] != undefined) {
        planCounts[plan] += 1;
      }
    });

    // Return the counts of each plan
    return planCounts;
  }

  add(data: UscpResourceModelDataType) {
    return this.http.post<UscpResourceModelDataType>(`customer/resources/resource_plan/`, data);
  }

  update(data: UscpResourceModelDataType, uuid: string) {
    return this.http.patch(`customer/resources/resource_plan/${uuid}/`, data);
  }

}

class PrivateCloudListData {
  cloud: string;
  constructor() { }
}

export class CostModelDropdownData {
  uuid: string;
  planName: string;
  planDescription: string;
  planType: string;
  region: string[];
  diskType: string;
  priceUnit: string;
  priceAllocation: string;
  unitCostPrice: string;
  isActive: boolean;
  constructor() { }
}

export const StorageUnits = ['GB'] //['GB', 'MB']
export const CostPlans = ["All At One Price", "Resource Model"]
export const PlanTypes = ['CPU Only', 'Memory Only', 'Disk Only', 'CPU and Memory', 'All At One Price']
export const PriceUnits = ["Minute", "Hourly", "Daily", "Monthly", "Yearly", "2 Year", "3 Year", "4 Year", "5 Year", "10 Year"];

export enum CostTypes {
  All = 'All At One Price',
  Others = 'Resource Model',
  CPU = 'CPU Only',
  Memory = 'Memory Only',
  Disk = 'Disk Only',
  CPUandMemory = 'CPU and Memory'
}