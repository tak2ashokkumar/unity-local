import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NutanixStorageContainerType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NutanixStorageContainersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getStorageContainers(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<NutanixStorageContainerType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<NutanixStorageContainerType>>(`customer/nutanix/${pcId}/storage_containers/`, { params: params });
  }

  converToViewData(data: NutanixStorageContainerType[]): NutanixStorageContainersViewData[] {
    let viewData: NutanixStorageContainersViewData[] = [];
    data.map(d => {
      let a = new NutanixStorageContainersViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.replicationFactor = d.replication_factor;
      // a.nodes = d.nodes;
      a.compression = d.compression;
      a.erasureCode = d.erasure_code;
      a.cacheDeduplication = d.cache_deduplication;
      a.freeSpacePct = d.free_storage_pct;
      a.usedSpace = d.used_space;
      a.maxCapacity = d.max_capacity;
      a.reservedCapacity = d.reserved_capacity;
      a.controllerIops = d.controller_iops;
      a.controllerIops = d.controller_bw;
      a.controllerLatency = d.controller_latency;
      // a.status = d.status == 'Enabled' ? true : false;
      // a.statusIcon = a.status ? 'fa-toggle-on' : 'fa-toggle-off';
      // a.statusTooltip = a.status ? 'Enable' : 'Disable';
      viewData.push(a);
    });
    return viewData;
  }
}

export class NutanixStorageContainersViewData {
  constructor(){}
  name: string;
  uuid: string;
  replicationFactor: number;
  nodeUUID: null;
  compression: boolean;
  erasureCode: string;
  cacheDeduplication: string;
  freeSpacePct: string;
  usedSpace: string;
  maxCapacity: string;
  reservedCapacity: string;
  controllerIops: string;
  controllerBandWidth: string;
  controllerLatency: string;
  freeSpaceBytes: string;
  usedSpaceBytes: string;
}
