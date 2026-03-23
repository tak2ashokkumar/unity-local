import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';

@Injectable()
export class StorageOntapShelvesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getShelves(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterShelves>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterShelves>>(`customer/netapp_cluster/${clusterId}/shelves/`, { params: params });
  }

  convertToViewData(data: StorageOntapClusterShelves[]): StorageOntapClusterShelvesViewData[] {
    let viewData: StorageOntapClusterShelvesViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterShelvesViewData();
      a.drawersDiskCount = d.drawers_disk_count ? d.drawers_disk_count : 'NA';
      a.drawersState = d.drawers_state ? d.drawers_state : 'NA';
      a.frusState = d.frus_state ? d.frus_state : 'NA';
      a.diskCount = d.disk_count ? d.disk_count : 'NA';
      a.fansState = d.fans_state ? d.fans_state : 'NA';
      a.moduleType = d.module_type ? d.module_type : 'NA';
      a.serialNumber = d.serial_number ? d.serial_number : 'NA';
      a.state = d.state ? d.state : 'NA';
      viewData.push(a);
    })
    return viewData;
  }

}

export class StorageOntapClusterShelvesViewData {
  drawersDiskCount: string;
  drawersState: string;
  frusState: string;
  diskCount: string;
  fansState: string;
  moduleType: string;
  serialNumber: string;
  state: string;
}

export interface StorageOntapClusterShelves {
  drawers_disk_count: string;
  drawers_state: string;
  frus_state: string;
  disk_count: string;
  fans_state: string;
  module_type: string;
  serial_number: string;
  uuid: string;
  state: string;
}

export const shelvesColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Serial Number',
    'key': 'serialNumber',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Drawers Disk Count',
    'key': 'drawersDiskCount',
    'default': true,
    'mandatory': true,
    // 'type': 'btn-link'
  },
  {
    'name': 'Drawers State',
    'key': 'drawersState',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Frus State',
    'key': 'frusState',
    'default': true,
    'mandatory': false,
    // 'type': 'status_field'
  },
  {
    'name': 'Disk Count',
    'key': 'diskCount',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Fans State',
    'key': 'fansState',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Module Type',
    'key': 'moduleType',
    'default': true,
    'mandatory': false
  },
];