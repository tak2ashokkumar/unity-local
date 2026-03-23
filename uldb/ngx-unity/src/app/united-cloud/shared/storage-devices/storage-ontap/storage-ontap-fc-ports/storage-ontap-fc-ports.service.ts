import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';

@Injectable()
export class StorageOntapFcPortsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getFcPorts(criteria: SearchCriteria, clusterId: string, nodeId: string): Observable<PaginatedResult<StorageOntapFcPortsServiceDataType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapFcPortsServiceDataType>>(`customer/netapp_cluster/${clusterId}/fcs/?node=${nodeId}`, { params: params });
  }

  convertToViewData(data: StorageOntapFcPortsServiceDataType[]): StorageOntapFcPortsServiceViewData[] {
    let viewData: StorageOntapFcPortsServiceViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapFcPortsServiceViewData();
      a.name = d.name ? d.name : 'NA';
      a.state =  d.state == 'online' ? 'Up' : 'Down';
      a.nodeName = d.node_name ? d.node_name : 'NA';
      a.physicalProtocol = d.physical_protocol ? d.physical_protocol : 'NA';
      a.enabled = d.enabled ? d.enabled : 'NA';
      a.fabricConnected = d.fabric_connected ? d.fabric_connected : 'NA';
      viewData.push(a);
    })
    return viewData;
  }
}

export class StorageOntapFcPortsServiceViewData {
  constructor() { }
  name: string;
  state: string;
  nodeName: string;
  nodeUuid: string;
  physicalProtocol: string;
  enabled: string;
  fabricConnected: string;
}

export interface StorageOntapFcPortsServiceDataType {
  name: string;
  uuid: string;
  state: string;
  node_name: string;
  node_uuid: string;
  physical_protocol: string;
  enabled: string;
  fabric_connected: string;
}

export const fcColumnMapping: Array<TableColumnMapping> = [
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
    'name': 'Physical Protocol',
    'key': 'physicalProtocol',
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
    'name': 'Fabric Connected',
    'key': 'fabricConnected',
    'default': true,
    'mandatory': false,
  },
]