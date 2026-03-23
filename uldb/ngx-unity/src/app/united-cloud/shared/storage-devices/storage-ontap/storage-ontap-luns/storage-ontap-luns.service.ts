import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageOntapClusterLUN } from '../storage-ontap.type';
import { FormBuilder } from '@angular/forms';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class StorageOntapLunsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getLUNs(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterLUN>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterLUN>>(`customer/netapp_cluster/${clusterId}/luns/`, { params: params });
    return this.tableService.getData<PaginatedResult<StorageOntapClusterLUN>>(`customer/netapp_cluster/${clusterId}/luns/`, criteria);
  }

  // getLUNs(clusterId: string, criteria: SearchCriteria): Observable<StorageOntapClusterLUN[]> {
  //   return of(text_resp);
  // }

  convertToViewData(data: StorageOntapClusterLUN[]): StorageOntapClusterLUNViewData[] {
    let viewData: StorageOntapClusterLUNViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterLUNViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.svmId = d.svm_uuid;
      a.svmName = d.svm_name;
      a.volumeId = d.volume_uuid;
      a.volumeName = d.volume_name;
      a.state = d.state == 'online' ? 'Up' : 'Down';

      a.totalSpace = d.capacity;
      // a.usedSpace = ag.used;
      a.freeSpace = d.available;
      a.usedpercentage = d.used_percent;
      a.availablePercentage = d.available_percent;

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
}

export class StorageOntapClusterLUNViewData {
  constructor() { }
  id: string;
  name: string;
  volumeName: string;
  volumeId: string;
  svmName: string;
  svmId: string;
  size: number;
  totalSpace: string;
  usedSpace: string;
  freeSpace: string;
  usedpercentage: number = 0;
  availablePercentage: number = 0;
  iops: number;
  latency: number;
  throughput: number;
  state: string;
}

export const lunsColumnMapping: Array<TableColumnMapping> = [
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
    'name': 'Volume',
    'key': 'volumeName',
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
    'name': 'State',
    'key': 'state',
    'default': true,
    'mandatory': false,
    'type': 'status_field'
  },
  {
    'name': 'Utilization',
    'key': 'capacity',
    'default': false,
    'mandatory': false,
    'type': 'utilization_field'
  },
  {
    'name': 'IOPS',
    'key': 'iops',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Latency(ms)',
    'key': 'latency',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Throughput(ms)',
    'key': 'throughput',
    'default': false,
    'mandatory': false
  }
];

export const text_resp: StorageOntapClusterLUN[] = [
  {
    "name": "/vol/portaltest_vol/suwoacltest.lun",
    "uuid": "46f399b8-4d95-4e2b-90f7-69d7df2b6f8b",
    "state": "online",
    "svm_name": "dfaas_mxd_def_023",
    "svm_uuid": "2062045b-573b-11e8-816b-00a0985cb48b",
    "volume_name": "portaltest_vol",
    "volume_uuid": "5ca11b06-bdc4-4ac1-995a-a6c8ae1969f1",
    "iops": 0,
    "latency": 0,
    "throughput": 0,
    "capacity": "150.0 GB",
    "available": "150.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/portaltest_vol/suwacltest.lun",
    "uuid": "ed44fe4c-7942-40be-9cc6-747114188bf4",
    "state": "online",
    "svm_name": "dfaas_mxd_def_023",
    "svm_uuid": "2062045b-573b-11e8-816b-00a0985cb48b",
    "volume_name": "portaltest_vol",
    "volume_uuid": "5ca11b06-bdc4-4ac1-995a-a6c8ae1969f1",
    "iops": 0,
    "latency": 0,
    "throughput": 0,
    "capacity": "100.0 GB",
    "available": "100.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns/lun_with_qos_performance",
    "uuid": "2a221d21-9d32-4f1d-a424-fa11356fcc3b",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns",
    "volume_uuid": "78f357f0-b874-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "10.0 GB",
    "available": "10.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns/lun_with_aqos_extreme",
    "uuid": "6288bc02-2fa4-4878-8799-2d8a5af82a48",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns",
    "volume_uuid": "78f357f0-b874-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "10.0 GB",
    "available": "10.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns/lun_with_aqos_value",
    "uuid": "62c32b23-8385-48fd-b60b-13685f87229c",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns",
    "volume_uuid": "78f357f0-b874-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "10.0 GB",
    "available": "10.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns/1g_lun",
    "uuid": "67e6c930-5c93-4d7f-8332-a6c5bbc70fa0",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns",
    "volume_uuid": "78f357f0-b874-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "1.0 GB",
    "available": "1.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns/lun_with_qos_extreme",
    "uuid": "96124fe4-5349-40e5-a8f5-446eddc3a028",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns",
    "volume_uuid": "78f357f0-b874-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "10.0 GB",
    "available": "10.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns/lun_with_qos_value",
    "uuid": "ad603e15-0c54-4615-8666-0e9eda7640d2",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns",
    "volume_uuid": "78f357f0-b874-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "10.0 GB",
    "available": "10.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns/lun_with_aqos_performance",
    "uuid": "c5074e3f-f2b2-4bfd-b40b-96d6f043dd03",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns",
    "volume_uuid": "78f357f0-b874-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "10.0 GB",
    "available": "10.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/volume_with_luns2/lun_no_qos",
    "uuid": "13558465-85ba-4814-a140-a8f828b7e1c8",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "volume_with_luns2",
    "volume_uuid": "9be7506a-b876-11ec-a79f-00a0985c0ddb",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "1.0 GB",
    "available": "1.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  },
  {
    "name": "/vol/vol_with_luns_clone_683/1g_lun2",
    "uuid": "249753f9-5ae8-4caf-ae34-ec02fd3b7b95",
    "state": "online",
    "svm_name": "vd-svm",
    "svm_uuid": "249243d6-8a46-11e8-816b-00a0985cb48b",
    "volume_name": "vol_with_luns_clone_683",
    "volume_uuid": "6c91aa2b-478e-11ed-9c6c-00a0985cb48b",
    "iops": null,
    "latency": null,
    "throughput": null,
    "capacity": "1.0 GB",
    "available": "1.0 GB",
    "used": 0,
    "available_percent": 100,
    "used_percent": 0,
    "node_name": "",
    "node_uuid": "",
    "mapped_nodes": ""
  }
]
