import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { NutanixVirtualDiskType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NutanixVirtualDisksService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getVirtualDisks(pcId: string, criteria: SearchCriteria): Observable<PaginatedResult<NutanixVirtualDiskType>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<NutanixVirtualDiskType>>(`customer/nutanix/${pcId}/virtual_disks/`, { params: params });
  }

  converToViewData(data: NutanixVirtualDiskType[]): NutanixVirtualDiskViewData[] {
    let viewData: NutanixVirtualDiskViewData[] = [];
    data.map(d => {
      let a = new NutanixVirtualDiskViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.flashMode = d.flash_mode;
      a.totalCapacity = d.total_capacity;
      a.readIOPS = d.read_iops;
      a.readLatency = d.read_latency;
      a.writeIOPS = d.write_iops;
      a.writeLatency = d.write_latency;
      a.writeBW = d.write_bw;
      viewData.push(a);
    });
    return viewData;
  }
}

export class NutanixVirtualDiskViewData {
  constructor() { }
  uuid: string;
  name: string;
  flashMode: boolean;
  totalCapacity: string;
  readIOPS: number;
  readLatency: string;
  writeIOPS: number;
  writeLatency: string;
  writeBW: string
}
