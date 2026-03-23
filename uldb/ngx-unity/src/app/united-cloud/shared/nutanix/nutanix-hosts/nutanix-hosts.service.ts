import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NutanixHostDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NutanixHostsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getHosts(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<NutanixHostDetailsType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<NutanixHostDetailsType>>(`customer/nutanix/${pcId}/hosts/`, { params: params });
  }

  converToViewData(data: NutanixHostDetailsType[]): NutanixHostViewData[] {
    let viewData: NutanixHostViewData[] = [];
    data.map(d => {
      let a = new NutanixHostViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.hostIp = d.host_ip;
      a.cvmIp = d.cvm_ip;
      a.hypervisor = d.hypervisor;
      a.totalStorage = d.total_storage;
      a.usedStorage = d.used_storage;
      a.freeStoragePct = d.free_storage_pct;      
      a.cpuUsage = d.cpu_usage;
      a.cpuCapacity = d.cpu_capacity;
      a.cpuCores = d.cpu_cores;
      a.memoryCapacity = d.memory_capacity;
      a.memoryUsage = `${d.memory_usage}`;
      a.diskIoLatency = d.disk_io_latency;
      a.diskIops = d.disk_iops;
      a.diskIoBandwidth = d.disk_io_bandwidth;
      
      viewData.push(a);
    });
    return viewData;
  }
}
export class NutanixHostViewData {
  constructor() { }
  name: string;
  uuid: string;
  hostIp: string;
  cvmIp: string;
  memoryCapacity: string;
  cpuUsage: string;
  memoryUsage: string;
  cpuCores: number;
  cpuCapacity: string;
  diskIoLatency: string;
  diskIops: string;
  diskIoBandwidth: string;
  usedStorage: string;
  freeStoragePct: string;
  hypervisor: string;
  clusterUUID: string;
  totalStorage: string;
  memoryCapacityBytes: string;
  totalStorageBytes: string;
  cpuCapacityHz: string;
}