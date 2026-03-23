import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DATA_CENTERS } from 'src/app/shared/api-endpoint.const';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { Observable } from 'rxjs';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Injectable()
export class DeviceDiscoveryDataCenterService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getDataCenters(criteria: SearchCriteria): Observable<DataCenter[]> {
    return this.tableService.getData<DataCenter[]>(DATA_CENTERS(), criteria);
  }

  convertToViewData(datacenters: DataCenter[]) {
    let viewData: DatacenterViewData[] = [];
    datacenters.map((dc: DataCenter) => {
      let data = new DatacenterViewData();
      data.dcId = dc.uuid;
      data.name = dc.name;
      data.location = dc.location;
      viewData.push(data);
    });
    return viewData;
  }
}
export class DatacenterViewData {
  dcId: string
  name: string;
  location: string;
}