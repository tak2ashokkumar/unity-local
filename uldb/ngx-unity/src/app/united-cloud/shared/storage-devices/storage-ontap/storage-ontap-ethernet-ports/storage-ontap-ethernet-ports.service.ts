import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';

@Injectable()
export class StorageOntapEthernetPortsService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getPorts(criteria: SearchCriteria, clusterId: string, nodeId: string): Observable<PaginatedResult<StorageOntapEthernetPortsDataType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapEthernetPortsDataType>>(`customer/netapp_cluster/${clusterId}/ethernets/?node=${nodeId}`, { params: params });
  }

  convertToViewData(data: StorageOntapEthernetPortsDataType[]): StorageOntapEthernetPortsViewData[] {
    let viewData: StorageOntapEthernetPortsViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapEthernetPortsViewData();
      a.name = d.name ? d.name : 'NA';
      a.state = d.state ? d.state : 'NA';
      a.nodeName = d.node_name ? d.node_name : 'NA';
      a.type = d.type ? d.type : 'NA';
      a.enabled = d.enabled ? d.enabled : 'NA';
      a.reachability = d.reachability ? d.reachability : 'NA';
      viewData.push(a);
    })
    return viewData;
  }
}

export class StorageOntapEthernetPortsViewData {
  constructor() { }
  name: string;
  state: string;
  nodeName: string;
  nodeUuid: string;
  type: string;
  enabled: string;
  reachability: string;
}

export interface StorageOntapEthernetPortsDataType {
  name: string;
  uuid: string;
  state: string;
  node_name: string;
  node_uuid: string;
  type: string;
  enabled: string;
  reachability: string;
}

export const ethernetColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Name',
    'key': 'name',
    'default': true,
    'mandatory': true,
    // 'type': 'btn-link',
  },
  {
    'name': 'State',
    'key': 'state',
    'default': true,
    'mandatory': false,
    'type': 'status_field'
  },
  {
    'name': 'Node Name',
    'key': 'nodeName',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Type',
    'key': 'type',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Enabled',
    'key': 'enabled',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Reachability',
    'key': 'reachability',
    'default': true,
    'mandatory': false,
  },
];