import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GcpResourceType } from 'src/app/shared/SharedEntityTypes/gcp.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class UsiPublicCloudGcpResourcesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getResources(instanceId: string, criteria: SearchCriteria): Observable<PaginatedResult<GcpResourceType>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<GcpResourceType>>(`/customer/integration/gcp/accounts/${instanceId}/resources/`, { params: params });
    // return of({
    //   "count": 1,
    //   "next": null,
    //   "previous": null,
    //   "results": [
    //     {
    //       "name": "machine1",
    //       "region": "us-east4",
    //       "uuid": "be95f944-f4eb-4967-a91f-654fedf84342",
    //       "resource_type": "Machine Image",
    //       "account": 193,
    //       "account_name": "test1111",
    //       "account_uuid": "62cb8f83-bc19-4bec-b42b-3954031cef7f",
    //       "icon_path": "gcp.svg",
    //       "service": "Compute",
    //       "instance_state": "running",
    //       "availability_zone": null,
    //       "public_ip": null,
    //       "instance_type": null,
    //       "monitoring": {
    //         "configured": false,
    //         "enabled": false
    //       },
    //       "status": "running"
    //     }
    //   ]
    // })
  }

  convertToViewData(data: GcpResourceType[]): GcpAccountResourceViewData[] {
    let viewData: GcpAccountResourceViewData[] = [];
    data.map(d => {
      let a = new GcpAccountResourceViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.type = d.resource_type ? d.resource_type : 'NA';
      a.region = d.region;
      a.service = d.service;
      a.iconPath = d.icon_path && d.icon_path != '' ? `${environment.assetsUrl}external-brand/gcp/${d.icon_path}.svg` : null;
      viewData.push(a);
    })
    return viewData;
  }

}

export class GcpAccountResourceViewData {
  constructor() { }
  uuid: string;
  name: string;
  region: string;
  type: string;
  service: string;
  iconPath: string;
}