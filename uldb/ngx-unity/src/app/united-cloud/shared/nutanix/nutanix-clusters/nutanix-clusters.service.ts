import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NutanixClusterType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { NUTANIX_CLUSTER } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NutanixClustersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getClusters(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<NutanixClusterType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<NutanixClusterType>>(NUTANIX_CLUSTER(pcId), { params: params });
  }

  converToViewData(data: NutanixClusterType[]): NutanixClusterViewData[] {
    let viewData: NutanixClusterViewData[] = [];
    data.map(d => {
      let a = new NutanixClusterViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.aosVersion = d.aos_version ? d.aos_version : 'NA';
      a.ipAddress = d.ip_address ? d.ip_address : 'NA';
      a.hostCount = d.host_count;
      a.vmCount = d.vm_count;
      a.totalStorage = d.total_storage;
      a.usedStorage = d.used_storage;
      a.freeStoragepct = d.free_storage_pct;
      a.cpuUsage = d.cpu_usage;
      a.memoryUsage = d.memory_usage;
      a.hypervisors = d.hypervisors;
      a.upgradeStatus = d.upgrade_status;
      a.clusterRunway = d.cluster_runway;
      a.inefficientVms = d.inefficient_vms;
      viewData.push(a);
    });
    return viewData;
  }
}

export class NutanixClusterViewData {
  constructor() { }
  uuid: string;
  name: string;
  aosVersion: string;
  hostCount: number;
  vmCount: number;
  ipAddress: string;
  cpuUsage: string;
  memoryUsage: string;
  totalStorage: string;
  usedStorage: string;
  freeStoragepct: string;
  hypervisors: string;
  upgradeStatus: string;
  clusterRunway: string;
  inefficientVms: number;
}
