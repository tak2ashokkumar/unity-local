import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { StorageOntapClusterDisk } from './storage-ontap-disks.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class StorageOntapDisksService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getDisks(brokenDisk: boolean, clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterDisk>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    if (brokenDisk) {
      return this.http.get<PaginatedResult<StorageOntapClusterDisk>>(`customer/netapp_cluster/${clusterId}/disks/?broken=true`, { params: params });
    } else {
      return this.http.get<PaginatedResult<StorageOntapClusterDisk>>(`customer/netapp_cluster/${clusterId}/disks/`, { params: params });
    }
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }

  convertToViewData(data: StorageOntapClusterDisk[]): StorageOntapClusterDiskViewData[] {
    let viewData: StorageOntapClusterDiskViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterDiskViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.serialNumber = d.serial_number ? d.serial_number : 'NA';
      a.state = d.state ? d.state : 'NA';
      a.nodeName = d.node_name ? d.node_name : 'NA';
      a.sectorCount = d.sector_count ? d.sector_count : 'NA';
      a.pool = d.pool ? d.pool : 'NA';
      a.homeNodeName = d.home_node_name ? d.home_node_name : 'NA';
      a.rpm = d.rpm ? d.rpm : 'NA';
      a.type = d.type ? d.type : 'NA';
      a.model = d.model ? d.model : 'NA';
      a.firmwareVersion = d.firmware_version ? d.firmware_version : 'NA';
      a.vendor = d.vendor ? d.vendor : 'NA';
      a.usableSize = d.usable_size ? d.usable_size : 'NA';
      a.aggregateName = d.aggregate_name ? d.aggregate_name : 'NA';
      viewData.push(a);
    })
    return viewData;
  }
}

export class StorageOntapClusterDiskViewData {
  constructor() { }
  id: string;
  name: string;
  serialNumber: string;
  state: string;
  nodeName: string;
  sectorCount: string;
  pool: string;
  homeNodeName: string;
  rpm: string;
  type: string;
  model: string;
  firmwareVersion: string;
  vendor: string;
  usableSize: string;
  aggregateName: string;
}

export const disksColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Name',
    'key': 'name',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'Serial Number',
    'key': 'serialNumber',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'State',
    'key': 'state',
    'default': true,
    'mandatory': false,
    // 'type': 'status_field'
  },
  {
    'name': 'Node Name',
    'key': 'nodeName',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Sector Count',
    'key': 'sectorCount',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Pool',
    'key': 'pool',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Home Node Name',
    'key': 'homeNodeName',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Rpm',
    'key': 'rpm',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Type',
    'key': 'type',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Model',
    'key': 'model',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Firmware Version',
    'key': 'firmwareVersion',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Vendor',
    'key': 'vendor',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Usable Size',
    'key': 'usableSize',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Aggregate Name',
    'key': 'aggregateName',
    'default': false,
    'mandatory': false
  },
];
