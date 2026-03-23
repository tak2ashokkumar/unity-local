import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { BuildingBlockListType, BuildingBlockViewData } from './unity-setup-finops.type';

@Injectable()
export class UnitySetupFinopsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
  ) { }

  getBuildingBlocks(criteria: SearchCriteria): Observable<PaginatedResult<BuildingBlockListType>> {
    return this.tableService.getData<PaginatedResult<BuildingBlockListType>>(`/customer/finops/building_blocks/`, criteria);
  }

  convertToViewData(data: BuildingBlockListType[]): BuildingBlockViewData[] {
    let viewData: BuildingBlockViewData[] = [];
    data.forEach(d => {
      let view: BuildingBlockViewData = new BuildingBlockViewData();

      view.id = d.id;
      view.uuid = d.uuid;
      view.customer = d.customer;
      view.businessUnit = d.business_unit?.name ? d.business_unit.name : 'NA';
      view.allocationStrategy = d.allocation_strategy ? d.allocation_strategy : 'NA';
      view.buildingBlockCode = d.building_block_code ? d.building_block_code : 'NA';
      view.hostDeploymentType = d.host_deployment_type ? d.host_deployment_type : 'NA';
      view.budgetPeriod = d.finops_cost?.budget_period ? d.finops_cost.budget_period : 'NA';
      view.virtualizationType = d.virtualization_type ? d.virtualization_type : 'NA';
      view.tags = d.business_unit?.tags ? d.business_unit.tags : 'NA';
      view.description = d.description ? d.description : 'NA';
      view.billingCurrency = d.finops_cost?.billing_currency ? d.finops_cost?.billing_currency : 'NA';
      view.purchaseCostPerServer = d.purchase_cost_per_server ? Number(d.purchase_cost_per_server).toFixed() : 'NA';
      view.environment = d.environment ? d.environment : 'NA';
      view.applications = d.service?.name ? d.service?.name : 'NA';
      view.businessUnit = d.business_unit?.name ? d.business_unit?.name : 'NA';
      view.workloadType = d.workload_type ? d.workload_type : 'NA';
      view.allocationType = d.allocation_type ? d.allocation_type : 'NA';
      view.licenseModel = d.license_model ? d.license_model : 'NA';
      view.licenseCostPerCoreVm = d.license_cost_per_core_vm ? Number(d.license_cost_per_core_vm).toFixed() : 'NA';
      view.maintenanceCostPerHost = d.maintenance_cost_per_host ? Number(d.maintenance_cost_per_host).toFixed() : 'NA';
      view.licenseCostCenter = d.license_cost_center ? d.license_cost_center : 'NA';
      view.budgetAmount = d.finops_cost?.budget_amount ? `${Number(d.finops_cost?.budget_amount).toFixed()} $` : 'NA';

      viewData.push(view);
    });
    return viewData;
  }

  delete(uuid: string) {
    return this.http.delete(`/customer/finops/building_blocks/${uuid}/`);
  }

}
