import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NutanixStoragePoolType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NutanixStoragePoolsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getStoragePools(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<NutanixStoragePoolType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<NutanixStoragePoolType>>(`customer/nutanix/${pcId}/storage_pools/`, { params: params });
  }

  converToViewData(data: NutanixStoragePoolType[]): NutanixStoragePoolViewData[] {
    let viewData: NutanixStoragePoolViewData[] = [];
    data.map(d => {
      let a = new NutanixStoragePoolViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.disks = d.disks;
      a.totalstorage = d.total_storage;
      a.usedstorage = d.used_storage;
      a.freeSpace = d.free_space;
      a.freeStoragePct = d.free_storage_pct;
      a.controllerIOPS = d.controller_iops;
      a.controllerBW = d.controller_bw;
      a.controllerLatency = d.controller_latency
      viewData.push(a);
    });
    return viewData;
  }
}

export class NutanixStoragePoolViewData {
  constructor(){}
  uuid: string;
  name: string;
  disks: number;
  freeSpace: string;
  usedstorage: string;
  totalstorage: string;
  controllerIOPS: string;
  controllerBW: string;
  controllerLatency: string;
  freeStoragePct: string;
}
