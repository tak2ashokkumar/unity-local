import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_AZURE_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AzureAccountsType } from './azure-details.type';

@Injectable()
export class AzureDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getAccounts(criteria: SearchCriteria): Observable<PaginatedResult<AzureAccountsType>> {
    return this.tableService.getData<PaginatedResult<AzureAccountsType>>(GET_AZURE_ACCOUNTS(), criteria);
  }

  convertToViewdata(accounts: AzureAccountsType[]): AzureAccountsViewData[] {
    let viewData: AzureAccountsViewData[] = [];
    accounts.map(account => {
      let data: AzureAccountsViewData = new AzureAccountsViewData();
      data.instanceId = account.id;
      data.uuid = account.uuid;
      data.clientId = account.client_id;
      data.tenantId = account.tenant_id;
      data.clientSecret = account.client_secret;
      viewData.push(data);
    });
    return viewData;
  }
}

export class AzureAccountsViewData {
  constructor() { }
  uuid: string;
  instanceId: number;
  clientId: string;
  clientSecret: string;
  tenantId: string;
}