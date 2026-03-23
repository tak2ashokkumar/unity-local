import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageOntapClusterAggragate } from '../storage-ontap.type';
import { Observable } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { map } from 'rxjs/operators';

@Injectable()
export class StorageOntapAggregatesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getAggregates(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterAggragate>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterAggragate>>(`customer/netapp_cluster/${clusterId}/aggregates/`, { params: params });
    return this.tableService.getData<PaginatedResult<StorageOntapClusterAggragate>>(`customer/netapp_cluster/${clusterId}/aggregates/`, criteria);
  }

  convertToViewData(data: StorageOntapClusterAggragate[]): StorageOntapClusterAggragateViewData[] {
    let viewData: StorageOntapClusterAggragateViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterAggragateViewData();
      a.id = d.uuid;
      a.name = d.name ? d.name : 'NA';
      a.nodeId = d.node_uuid;
      a.nodeName = d.node_name ? d.node_name : 'NA';
      a.type = d.type ? d.type : 'NA';
      a.totalSpace = d.capacity ? d.capacity : 'NA';
      a.usedSpace = d.used ? d.used : 'NA';
      a.availableSpace = d.available ? d.available : 'NA';

      a.logicalSpaceUsed = d.logical_used ? d.logical_used : 'NA';;
      a.usedDataPercentage = d.used_percent;
      a.availableDataPercentage = d.available_percent;
      a.raidType = d.raid_type ? d.raid_type : 'NA';
      // a.state = d.state == 'online' ? 'Up' : 'Down';
      viewData.push(a);
    })
    return viewData;
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }

  getExtraArgs(clusterId: string, d: StorageOntapClusterAggragateViewData) {
    return this.http.get<any>(`customer/netapp_cluster/${clusterId}/aggregate/${d.id}/extra_args/`)
      .pipe(
        map((res: { cluster: string }) => {
          if (res) {
            d.cluster = res.cluster;
          }
          return d;
        })
      );
  }
}

export class StorageOntapClusterAggragateViewData {
  constructor() { }
  id: string;
  name: string;
  nodeId: string;
  nodeName: string;
  type: string;
  totalSpace: string;
  usedSpace: string;
  availableSpace: string;

  cluster: string;
  logicalSpaceUsed: string;
  usedDataPercentage: number = 0;
  availableDataPercentage: number = 0;
  raidType: string;
  state: string;
}

export const aggregatesColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Name',
    'key': 'name',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'Node',
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
    'name': 'Total',
    'key': 'totalSpace',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Used',
    'key': 'usedSpace',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Available',
    'key': 'availableSpace',
    'default': true,
    'mandatory': false
  },
  //   {
  //     'name': 'Cluster',
  //     'key': 'cluster',
  //     'default': false,
  //     'mandatory': false
  //   },
  {
    'name': 'Logical Space Used',
    'key': 'logicalSpaceUsed',
    'default': false,
    'mandatory': false
  },
  // {
  //   'name': 'Used Data %',
  //   'key': 'usedDataPercentage',
  //   'default': false,
  //   'mandatory': false
  // },
  // {
  //   'name': 'Available Data %',
  //   'key': 'availableDataPercentage',
  //   'default': false,
  //   'mandatory': false
  // },
  {
    'name': 'Utilization',
    'key': 'capacity',
    'default': false,
    'mandatory': false,
    'type': 'utilization_field'
  },
  {
    'name': 'Raid Type',
    'key': 'raidType',
    'default': false,
    'mandatory': false
  },
];
