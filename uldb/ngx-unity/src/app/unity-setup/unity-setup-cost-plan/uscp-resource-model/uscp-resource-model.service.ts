import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PrivateCloudListType, ResourcePlanDataType } from './uscp-resource-model.type';
import { formatNumber } from '@angular/common';
import { CostModelInstance } from '../uscp-cost-model/uscp-cost-model.type';

@Injectable()
export class UscpResourceModelService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient,
    private utilSvc: AppUtilityService
  ) { }

  getPrivateClouds(): Observable<PrivateCloudListType[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('page_size', 0);
    return this.http.get<PrivateCloudListType[]>(`customer/private_cloud_integrated/`, { params: params });
  }

  getResourcePlans(criteria: SearchCriteria): Observable<PaginatedResult<ResourcePlanDataType>> {
    return this.tableService.getData<PaginatedResult<ResourcePlanDataType>>('customer/resources/resource_plan/', criteria);
  }

  getCostModel(): Observable<CostModelInstance[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('is_active', 'True');
    params = params.set('page_size', 0);
    return this.http.get<CostModelInstance[]>('customer/cost_plan/private_cost_plan/', { params: params });
  }

  delete(uuid: string) {
    return this.http.delete(`customer/resources/resource_plan/${uuid}/`);
  }

  toggleStatus(uuid: string, status: string) {
    return this.http.put(`customer/resources/resource_plan/${uuid}/`, { is_active: status });
  }

  multipleReportDelete(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuid', uuid));
    return this.http.get(`customer/resources/resource_plan/multi_delete/`, { params: params });
  }

  convertToViewData(data: ResourcePlanDataType[]): ResourceCostItemViewData[] {
    let viewData: ResourceCostItemViewData[] = [];
    data.map(a => {
      let ud: ResourceCostItemViewData = new ResourceCostItemViewData();
      ud.id = a.id;
      ud.uuid = a.uuid;
      ud.customer = a.customer;
      ud.name = a.resource_name;
      ud.cloudType = a.cloud_type;
      ud.cloudImgUrl = this.utilSvc.getCloudLogo(ud.cloudType);
      ud.cpuSize = a.cpu_size;
      ud.cpuCustomization = a.cpu_customization;
      ud.memorySize = a.memory_size;
      ud.memoryUnit = a.memory_unit;
      ud.memoryCustomization = a.memory_customization;
      ud.storageSize = a.storage_size;
      ud.storageUnit = a.storage_unit;
      ud.costModel = a.cost_type;
      ud.storageCustomization = a.storage_customization;
      ud.allowMultipleDisk = a.allow_multiple_disk;
      ud.resourcePlanCostsList = a.cost_plans_list.length ? a.cost_plans_list.map(plan => plan.plan_name) : [];
      ud.resourcePlanCost = ud.resourcePlanCostsList.length ? ud.resourcePlanCostsList[0] : '';
      ud.extraResourcePlanCost = ud.resourcePlanCostsList.length ? ud.resourcePlanCostsList.slice(1) : [];
      ud.costUnit = a.price_unit;
      ud.isActive = a.is_active;
      ud.lockPlan = a.lock_plan;
      ud.createdDate = a.created_date;
      ud.modifiedDate = a.modified_date;
      ud.createdUser = a.created_user;
      ud.modifiedUser = a.modified_user;
      ud.unitViceCost = formatNumber(Number(a.unit_vice_cost), 'en-US', '1.0-2');
      ud.storageTooltip = `${a.storage_size} ${a.storage_unit} ${a.storage_customization ? "(Customize)" : ""}`;
      ud.cpuTooltip = `${a.cpu_size} ${a.cpu_customization ? "(Customize)" : ""}`;
      ud.memoryTooltip = `${a.memory_size} ${a.memory_unit} ${a.memory_customization ? "(Customize)" : ""}`;
      ud.costTooltip = `${a.unit_vice_cost}/${a.price_unit}`;

      ud.regionsList = a.regions?.length ? a.regions : [];
      ud.region = ud.regionsList?.length ? ud.regionsList[0] : '';
      ud.extraRegions = ud.regionsList?.length ? ud.regionsList.slice(1) : [];
      ud.datacentersList = a.datacenters?.length ? a.datacenters : [];
      ud.datacenter = ud.datacentersList?.length ? ud.datacentersList[0] : '';
      ud.extraDatacenters = ud.datacentersList?.length ? ud.datacentersList.slice(1) : [];

      viewData.push(ud);
    });
    return viewData;
  }

  convertCloudsDropdownData(clouds: PrivateCloudListType[]): string[] {
    let dropdownData: string[] = [];
    clouds.map(r => {
      dropdownData.push(r.platform_type);
    })
    return dropdownData;
  }

}
export class ResourceCostItemViewData {
  id: number;
  uuid: string;
  customer: number;
  name: string;
  cloudType: string;
  cpuSize: number;
  cpuCustomization: boolean;
  memorySize: number;
  memoryUnit: string;
  memoryCustomization: boolean;
  storageSize: number;
  storageUnit: string;
  storageCustomization: boolean; // storage_customization
  allowMultipleDisk: boolean; // allow_multiple_disk
  costModel: string; // cost_type
  resourcePlanCostsList: any[]; // resource_plan_costs all
  resourcePlanCost: string; // resource_plan_costs first
  extraResourcePlanCost: any[]; // resource_plan_costs remaining
  unitViceCost: string; // unit_vice_cost
  costUnit: string; // price_unit
  isActive: boolean; // is_active
  lockPlan: boolean; // lock_plan
  createdDate: string; // created_date
  modifiedDate: string; // modified_date
  createdUser: string; // created_user
  modifiedUser: string; // modified_user
  isSelected: boolean = false;
  cloudImgUrl: string;
  storageTooltip: string;
  cpuTooltip: string;
  memoryTooltip: string;
  costTooltip: string;
  plan_mapping_uuid: string;
  diskType: string;
  regionsList: string[];  
  region: string;
  extraRegions: string[];
  datacentersList: string[];  
  datacenter: string;
  extraDatacenters: string[];
  isMaster: boolean;
  assignedCloudsList: AssignedCloudsListItem[];
  constructor() { }
}

class AssignedCloudsListItem {
  privateCloud: string;
  resourceMappingUuid: string;
  accountName: string;
  constructor() { }
}