import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AzureAccountResource } from 'src/app/shared/SharedEntityTypes/azure.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AZURE_RESOUCE_TEST } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class UsiPublicCloudAzureResourcesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getResources(instanceId: string, criteria: SearchCriteria): Observable<PaginatedResult<AzureAccountResource>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    // return this.http.get<PaginatedResult<AzureAccountResource>>(AZURE_RESOUCE_TEST());
    return this.http.get<PaginatedResult<AzureAccountResource>>(`/customer/integration/azure/accounts/${instanceId}/resources/`, { params: params });
  }

  convertToViewData(data: AzureAccountResource[]): AzureAccountResourceViewData[] {
    let viewData: AzureAccountResourceViewData[] = [];
    data.map(d => {
      let a = new AzureAccountResourceViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.type = d.resource_type ? d.resource_type : 'NA';
      a.resourceGroup = d.resource_group ? d.resource_group : 'NA';
      a.tags = d.tags;
      a.accountId = d.account;
      a.region = d.region;
      a.iconPath = d.icon_path && d.icon_path != '' ? `${environment.assetsUrl}external-brand/azure/Icons/${d.icon_path}.svg` : null;
      viewData.push(a);
    })
    return viewData;
  }
}

export class AzureAccountResourceViewData {
  constructor() { }
  uuid: string;
  name: string;
  type: string;
  resourceGroup: string;
  tags: { [key: string]: string };
  ipAddress: string;
  os: string;
  make: string;
  model: string;
  accountId: number;
  region: string;
  iconPath: string;
}
