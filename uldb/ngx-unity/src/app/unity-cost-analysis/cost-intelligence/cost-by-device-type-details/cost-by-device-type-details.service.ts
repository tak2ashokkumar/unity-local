import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class CostByDeviceTypeDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
  ) { }

  getCostDetailsByDeviceType(criteria: SearchCriteria): Observable<PaginatedResult<CostDetailsByDeviceTypeData>> {
    return this.tableService.getData<PaginatedResult<CostDetailsByDeviceTypeData>>(`/customer/finops/building-blocks-devices-cost/`, criteria);
  }

  convertToCostByDeviceTypeViewData(data: CostDetailsByDeviceTypeData[]): CostDetailsByDeviceTypeViewData[] {
    let viewdata: CostDetailsByDeviceTypeViewData[] = [];
    data.map(d => {
      let view = new CostDetailsByDeviceTypeViewData();
      view.deviceName = d.device_name;
      view.deviceType = d.device_type;
      view.deviceIp = d.device_ip;
      view.label = d.label;
      view.coreCost = `$${d.core_cost}`;
      view.managementCost = `$${d.management_cost}`;
      view.storageCost = `$${d.storage_cost}`;
      view.backupCost = `$${d.backup_cost}`;
      view.networkCost = `$${d.network_cost}`;
      viewdata.push(view);
    })
    return viewdata;
  }


}


export class CostDetailsByDeviceTypeViewData {
  constructor() { }
  deviceName: string;
  deviceType: string;
  deviceIp: string;
  label: string;
  coreCost: string;
  managementCost: string;
  storageCost: string;
  backupCost: string;
  networkCost: string;
}

export interface CostDetailsByDeviceTypeData {
  device_name: string;
  device_type: string;
  device_ip: string;
  label: string;
  core_cost: string;
  management_cost: string;
  storage_cost: string;
  backup_cost: string;
  network_cost: string;
}
