import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';

@Injectable()
export class StorageOntapSnapMirrorsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getSnapMirrors(clusterId: string, criteria: SearchCriteria): Observable<PaginatedResult<StorageOntapClusterSnapMirrorsDataType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    let searchKey = params.get('search');
    if (searchKey) {
      params = params.append('query', searchKey);
      params = params.delete('search');
    }
    return this.http.get<PaginatedResult<StorageOntapClusterSnapMirrorsDataType>>(`customer/netapp_cluster/${clusterId}/snapmirrors/`, { params: params });
  }

  convertToViewData(data: StorageOntapClusterSnapMirrorsDataType[]): StorageOntapClusterSnapMirrorsViewData[] {
    let viewData: StorageOntapClusterSnapMirrorsViewData[] = [];
    data.forEach(d => {
      let a = new StorageOntapClusterSnapMirrorsViewData();
      a.state = d.state ? d.state : 'NA';
      a.sourcePath = d.source_path ? d.source_path : 'NA';
      a.sourceClusterName = d.source_cluster_name ? d.source_cluster_name : 'NA';
      a.destinationClusterName = d.destination_cluster_name ? d.destination_cluster_name : 'NA';
      a.destinationPath = d.destination_path ? d.destination_path : 'NA';
      a.policyType = d.policy_type ? d.policy_type : 'NA';
      a.policyName = d.policy_name ? d.policy_name : 'NA';
      a.healthy = d.healthy ? d.healthy : 'NA';
      a.lagTime = d.lag_time ? d.lag_time : 'NA';
      a.unhealthyReasonMessage = d.unhealthy_reason_message.length ? d.unhealthy_reason_message : ['NA'];
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

export class StorageOntapClusterSnapMirrorsViewData {
  constructor() { }
  uuid: string;
  state: string;
  sourcePath: string;
  sourceClusterName: string;
  destinationClusterName: string;
  destinationPath: string;
  policyType: string;
  policyName: string;
  healthy: string;
  lagTime: string;
  unhealthyReasonMessage: string[];
}

export interface StorageOntapClusterSnapMirrorsDataType {
  uuid: string;
  state: string;
  source_path: string;
  source_cluster_name: string;
  destination_cluster_name: string;
  destination_path: string;
  policy_type: string;
  policy_name: string;
  healthy: string;
  lag_time: string;
  unhealthy_reason_message: string[];
}

export const snapMirrorsColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'State',
    'key': 'state',
    'default': true,
    'mandatory': true,
  },
  {
    'name': 'Source Path',
    'key': 'sourcePath',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Source Cluster Name',
    'key': 'sourceClusterName',
    'default': true,
    'mandatory': false,
  },
  {
    'name': 'Destination Path',
    'key': 'destinationPath',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Destination Cluster Name',
    'key': 'destinationClusterName',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Policy Type',
    'key': 'policyType',
    'default': true,
    'mandatory': false
  },
  {
    'name': 'Policy Name',
    'key': 'policyName',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Healthy',
    'key': 'healthy',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Lag Time',
    'key': 'lagTime',
    'default': false,
    'mandatory': false
  },
  {
    'name': 'Unhealthy Reason Message',
    'key': 'unhealthyReasonMessage',
    'default': false,
    'mandatory': false
  },
];