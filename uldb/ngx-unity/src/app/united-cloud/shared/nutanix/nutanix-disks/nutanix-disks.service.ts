import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NutanixDiskType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NutanixDisksService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getDisks(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<NutanixDiskType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<NutanixDiskType>>(`customer/nutanix/${pcId}/disks/`, { params: params });
  }

  converToViewData(data: NutanixDiskType[]): NutanixDiskViewData[] {
    let viewData: NutanixDiskViewData[] = [];
    data.map(d => {
      let a = new NutanixDiskViewData();
      a.uuid = d.uuid;
      a.diskId = d.disk_id;
      a.hostName = d.host_name ? d.host_name : 'NA';
      a.serialNumber = d.serial_number ? d.serial_number : 'NA';
      a.hypervisorIp = d.hypervisor_ip ? d.hypervisor_ip : 'NA';
      a.tier = d.tier ? d.tier : 'NA';
      a.status = d.status;
      a.diskIOPS = d.disk_iops ? d.disk_iops : 'NA';
      a.diskIOBandwidth = d.disk_io_bandwidth ? d.disk_io_bandwidth : 'NA';
      a.storageCapacity = d.storage_capacity ? d.storage_capacity : 'NA';
      a.storageUsage = d.storage_usage ? d.storage_usage : 'NA';
      a.storageUsagePct = d.storage_usage_pct ? d.storage_usage_pct : 'NA';
      a.storageFreePct = d.free_storage_pct ? d.free_storage_pct : 'NA';
      a.diskAvgIOLatency = d.disk_avg_io_latency ? d.disk_avg_io_latency : 'NA';
      viewData.push(a);
    });
    return viewData;
  }
}

export class NutanixDiskViewData {
  constructor(){}
  diskId: string;
  uuid: string;
  serialNumber: string;
  hostName: string;
  hypervisorIp: string;
  tier: string;
  status: boolean;
  storageCapacity: string;
  storageUsage: string;
  storageFreePct: string;
  storageUsagePct: string;
  diskIOBandwidth: string;
  diskAvgIOLatency: string;
  diskIOPS: string;
}
