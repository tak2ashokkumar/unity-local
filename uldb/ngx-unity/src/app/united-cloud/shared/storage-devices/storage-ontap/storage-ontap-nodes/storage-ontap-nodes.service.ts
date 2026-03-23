import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { StorageOntapClusterNode } from '../storage-ontap.type';

@Injectable()
export class StorageOntapNodesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getNodes(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterNode>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterNode>>(`customer/netapp_cluster/${clusterId}/nodes/`, { params: params });
  }

  convertToViewData(data: StorageOntapClusterNode[]): StorageOntapClusterNodeViewData[] {
    let viewData: StorageOntapClusterNodeViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterNodeViewData();
      a.id = d.uuid;
      a.name = d.name ? d.name : 'NA';
      a.serialNumber = d.serial_number ? d.serial_number : 'NA';
      a.managementIp = d.management_ip ? d.management_ip : 'NA';
      a.haPartner = d.ha_partner ? d.ha_partner : 'NA';
      a.os = d.os ? d.os : 'NA';
      a.state = d.state;
      a.ethernetPortCount = d.ethernet_ports ? d.ethernet_ports : 0;
      a.fcPortCount = d.fc_ports ? d.fc_ports : 0;
      viewData.push(a);
    })
    return viewData;
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }
}

export class StorageOntapClusterNodeViewData {
  constructor() { }
  id: string;
  name: string;
  serialNumber: string;
  managementIp: string;
  haPartner: string;
  os: string;
  state: string;
  ethernetPortCount: number;
  fcPortCount: number;
  cluster: string;
}

export const nodesColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Name',
    'key': 'name',
    'default': true,
    'mandatory': true,
    'type': 'btn-link',
    'url': 'overview'
  },
  {
    'name': 'Serial Number',
    'key': 'serialNumber',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'IP Address',
    'key': 'managementIp',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'HA Partner',
    'key': 'haPartner',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'OS',
    'key': 'os',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'State',
    'key': 'state',
    'default': true,
    'mandatory': false,
    'type': 'status_field'
  },
  {
    'name': 'Ethernet Ports',
    'key': 'ethernetPortCount',
    'default': false,
    'mandatory': false,
    'type': 'btn-link',
    'url': 'ethernet-ports'
  },
  {
    'name': 'FC Ports',
    'key': 'fcPortCount',
    'default': false,
    'mandatory': false,
    'type': 'btn-link',
    'url': 'fc-ports'
  },
  //   {
  //     'name': 'Cluster',
  //     'key': 'cluster',
  //     'default': false,
  //     'mandatory': false
  //   }
];
