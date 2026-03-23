import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageOntapClusterSVM } from '../storage-ontap.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { FormBuilder } from '@angular/forms';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { map } from 'rxjs/operators';

@Injectable()
export class StorageOntapSvmsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getSVMs(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterSVM>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterSVM>>(`customer/netapp_cluster/${clusterId}/svms/`, { params: params });
  }

  // getSVMs(clusterId: string, criteria: SearchCriteria): Observable<StorageOntapClusterSVM[]> {
  //   return of(apiResponse);
  // }

  convertToViewData(data: StorageOntapClusterSVM[]): StorageOntapClusterSVMViewData[] {
    let viewData: StorageOntapClusterSVMViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterSVMViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.state = d.state == 'running' ? 'Up' : 'Down';
      a.configuredProtocols = d.configured_protocols ? d.configured_protocols : 'NA';
      a.language = d.language ? d.language : 'NA';
      viewData.push(a);
    })
    return viewData;
  }

  buildColumnSelectionForm(columns: TableColumnMapping[]) {
    return this.builder.group({
      'columns': [columns],
    });
  }

  getExtraArgs(clusterId: string, d: StorageOntapClusterSVMViewData) {
    return this.http.get<any>(`customer/netapp_cluster/${clusterId}/svm/${d.id}/extra_args/`)
      .pipe(
        map((res: { lif_count: number, management_ip: string, data_ip: string, lun_count: number, volume_count: number }) => {
          if (res) {
            d.dataLIFCount = res.lif_count ? res.lif_count : 0;
            d.managementIp = res.management_ip ? res.management_ip : 'NA';
            d.dataIp = res.data_ip ? res.data_ip : 'NA';
            d.lunCount = res.lun_count ? res.lun_count : 0;
            d.volumeCount = res.volume_count ? res.volume_count : 0;
          }
          return d;
        })
      );
  }
}

export class StorageOntapClusterSVMViewData {
  constructor() { }
  id: string;
  name: string;
  state: string;
  configuredProtocols: string;
  managementIp: string = 'NA';
  dataIp: string;
  volumeCount: number = 0;
  lunCount: number = 0;
  language: string;
  dataLIFCount: number = 0;
  protocols: string;
}

export const svmColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Name',
    'key': 'name',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'State',
    'key': 'state',
    'default': true,
    'mandatory': false,
    'type': 'status_field'
  },
  {
    'name': 'Configured Protocols',
    'key': 'configuredProtocols',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Volume Count',
    'key': 'volumeCount',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Management IP',
    'key': 'managementIp',
    'default': true,
    'mandatory': false
  },
  // {
  //   'name': 'Data IP',
  //   'key': 'dataIp',
  //   'default': false,
  //   'mandatory': false
  // },
  {
    'name': 'LUN Count',
    'key': 'lunCount',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Language',
    'key': 'language',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Data LIF Count',
    'key': 'dataLIFCount',
    'default': false,
    'mandatory': false
  }
];
