import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageOntapClusterVolume } from '../storage-ontap.type';
import { FormBuilder } from '@angular/forms';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { map } from 'rxjs/operators';

@Injectable()
export class StorageOntapVolumesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getVolumes(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterVolume>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterVolume>>(`customer/netapp_cluster/${clusterId}/volumes/`, { params: params });
    return this.tableService.getData<PaginatedResult<StorageOntapClusterVolume>>(`customer/netapp_cluster/${clusterId}/volumes/`, criteria);
  }

  convertToViewData(data: StorageOntapClusterVolume[]): StorageOntapClusterVolumeViewData[] {
    let viewData: StorageOntapClusterVolumeViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterVolumeViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.svmId = d.svm_uuid;
      a.svmName = d.svm_name;
      a.state = d.state == 'online' ? 'Up' : 'Down';
      a.type = d.type;
      a.aggregateId = d.aggregate_uuid;
      a.aggregateName = d.aggregate_name;

      a.totalSpace = d.capacity;
      a.usedSpace = d.used;
      a.freeSpace = d.available;

      a.autoGrow = d.autogrow ? d.autogrow : 'NA';
      a.snapshotReserve = `${d.snapshot_reserve ? d.snapshot_reserve : 0} %`
      a.spaceGuarantee = d.guarantee ? d.guarantee : false;
      a.usedPercentage = d.used_percent;
      a.availablePercentage = d.available_percent;
      a.securityStyle = d.security_style ? d.security_style : 'NA';
      a.isSVMRoot = d.is_svm_root ? d.is_svm_root : false;

      a.iops = d.iops;
      a.latency = d.latency;
      a.throughput = d.throughput;
      viewData.push(a);
    })
    return viewData;
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }

  getExtraArgs(clusterId: string, d: StorageOntapClusterVolumeViewData) {
    return this.http.get<any>(`customer/netapp_cluster/${clusterId}/volume/${d.id}/extra_args/`)
      .pipe(
        map((res: { snapshot_count: number }) => {
          if (res) {
            d.snapshotCount = res.snapshot_count;
          }
          return d;
        })
      );
  }
}

export class StorageOntapClusterVolumeViewData {
  constructor() { }
  id: string;
  name: string;
  svmId: string;
  svmName: string;
  state: string;
  type: string;
  aggregateId: string;
  aggregateName: string;
  totalSpace: string;
  usedSpace: string;
  freeSpace: string;
  snapshotCount: number = 0;

  autoGrow: string;
  snapshotReserve: string;
  spaceGuarantee: boolean;
  usedPercentage: number = 0;
  availablePercentage: number = 0;
  securityStyle: string;
  isSVMRoot: boolean;

  iops: number = 0;
  latency: number = 0;
  throughput: number = 0;
}

export const volumesColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Name',
    'key': 'name',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'SVM',
    'key': 'svmName',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Aggregate',
    'key': 'aggregateName',
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
    'name': 'Type',
    'key': 'type',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Total Space',
    'key': 'totalSpace',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Available Space',
    'key': 'freeSpace',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Autogrow',
    'key': 'autoGrow',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Snapshot Reserve',
    'key': 'snapshotReserve',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Space Gurantee',
    'key': 'spaceGuarantee',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Snapshot Count',
    'key': 'snapshotCount',
    'default': false,
    'mandatory': false
  },
  // {
  //   'name': 'Available Data %',
  //   'key': 'availablePercentage',
  //   'default': false,
  //   'mandatory': false
  // },
  // {
  //   'name': 'Used Data %',
  //   'key': 'usedPercentage',
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
    'name': 'Security style',
    'key': 'securityStyle',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'IS SVM Root',
    'key': 'isSVMRoot',
    'default': false,
    'mandatory': false
  }
];
