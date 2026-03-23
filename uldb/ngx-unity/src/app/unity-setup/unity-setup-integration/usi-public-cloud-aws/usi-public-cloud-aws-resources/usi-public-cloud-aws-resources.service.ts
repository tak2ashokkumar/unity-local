import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AwsResourceType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class UsiPublicCloudAwsResourcesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getResources(instanceId: string, criteria: SearchCriteria): Observable<PaginatedResult<AwsResourceType>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AwsResourceType>>(`/customer/integration/aws/accounts/${instanceId}/resources/`, { params: params });
  }

  convertToViewData(data: AwsResourceType[]): AwsAccountResourceViewData[] {
    let viewData: AwsAccountResourceViewData[] = [];
    data.map(d => {
      let a = new AwsAccountResourceViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.type = d.resource_type ? d.resource_type : 'NA';
      a.region = d.region;
      a.service = d.service;
      a.iconPath = d.icon_path && d.icon_path != '' ? `${environment.assetsUrl}external-brand/aws/${d.icon_path}.svg` : null;
      viewData.push(a);
    })
    return viewData;
  }

}

export class AwsAccountResourceViewData {
  constructor() { }
  uuid: string;
  name: string;
  region: string;
  type: string;
  service: string;
  iconPath: string;
}