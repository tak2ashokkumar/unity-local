import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { LOCATION_STATUS } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { WorldMapWidgetDatacenterLocation } from 'src/app/app-home/dashboard-map-widget/map-widget.type';
import { formatNumber } from '@angular/common';
import { CostModelInstance } from './uscp-cost-model.type';

@Injectable()
export class UscpCostModelService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient) { }

  getInstances(criteria: SearchCriteria): Observable<PaginatedResult<CostModelInstance>> {
    return this.tableService.getData<PaginatedResult<CostModelInstance>>('customer/cost_plan/private_cost_plan/', criteria);
  }

  getRegions(): Observable<WorldMapWidgetDatacenterLocation[]> {
    return this.http.get<WorldMapWidgetDatacenterLocation[]>(LOCATION_STATUS());
  }

  delete(uuid: string) {
    return this.http.delete(`customer/cost_plan/private_cost_plan/${uuid}/`);
  }

  saveSettings(uuid: string, status: string) {
    return this.http.put(`customer/cost_plan/private_cost_plan/${uuid}/`, { is_active: status });
  }

  convertToViewData(data: CostModelInstance[]): CostModelInstanceViewData[] {
    let viewData: CostModelInstanceViewData[] = [];
    data.map(a => {
      let ud: CostModelInstanceViewData = new CostModelInstanceViewData();
      ud.uuid = a.uuid;
      ud.planName = a.plan_name;
      ud.planDescription = a.plan_description;
      ud.region = a.regions.length ? a.regions[0] : '';
      ud.extraRegions = a.regions.length > 1 ? a.regions.slice(1) : [];
      ud.extraRegionsLength = ud.extraRegions.length;

      ud.datacenters = a.datacenters.length ? a.datacenters[0] : '';
      ud.extraDatacenters = a.datacenters.length > 1 ? a.datacenters.slice(1) : [];
      ud.extraDatacentersLength = ud.extraDatacenters.length;

      ud.planType = a.plan_type;
      ud.priceUnit = a.price_unit;
      ud.priceAllocation = a.price_allocation;
      ud.unitCostPrice = formatNumber(Number(a.unit_cost_price), 'en-US', '1.0-2');
      ud.isActive = a.is_active;
      ud.customer = a.customer;
      viewData.push(ud);
    });
    return viewData;
  }

  convertRegionData(data: WorldMapWidgetDatacenterLocation[]): string[] {
    let regions: string[] = [];
    data.map(a => { if (a.location) { regions.push(a.location) } });
    return regions;
  }

  multipleReportDelete(uuids: string[]) {
    let params: HttpParams = new HttpParams();
    uuids.map(uuid => params = params.append('uuid', uuid));
    return this.http.get(`customer/cost_plan/private_cost_plan/multi_delete/`, { params: params });
  }

}

export class CostModelInstanceViewData {
  datacenters: string;
  datacentersCount: number;
  extraDatacenters: string[];
  extraDatacentersLength: number;
  constructor() { }
  extraRegionsLength: number;
  uuid: string;
  regionCount: number;
  extraRegions: string[];
  planName: string;
  planDescription: string;
  region: string;
  planType: string;
  priceUnit: string;
  priceAllocation: string;
  unitCostPrice: string;
  isActive: boolean;
  customer: string;
  isSelected: boolean = false;
}

export const TableColumnSelections = [
  {
    name: 'Created On',
    key: 'created_on',
    checked: false
  },
  {
    name: 'Created By',
    key: 'created_by',
    checked: false
  },
  {
    name: 'Modified On',
    key: 'modified_on',
    checked: false
  },
  {
    name: 'Modified By',
    key: 'modified_by',
    checked: false
  }
]

