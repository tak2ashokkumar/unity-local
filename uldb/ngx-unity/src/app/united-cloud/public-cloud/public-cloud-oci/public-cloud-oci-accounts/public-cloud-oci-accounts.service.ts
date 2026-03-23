import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_OCI_ACOUNTS, GET_OCI_REGIONS } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { OCIAccountType } from '../../entities/oci-account.type';

@Injectable()
export class PublicCloudOciAccountsService {

  constructor(private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private http: HttpClient,
    private appService: AppLevelService) { }

  getAccounts(criteria: SearchCriteria): Observable<PaginatedResult<OCIAccountType>> {
    return this.tableService.getData<PaginatedResult<OCIAccountType>>(GET_OCI_ACOUNTS(), criteria);
  }

  


  convertToViewData(data: OCIAccountType[]): OCIAccountViewData[] {
    let viewData: OCIAccountViewData[] = [];
    data.map(acc => {
      let a = new OCIAccountViewData();
      a.uuid = acc.uuid;
      a.name = acc.name;
      a.userOcid = acc.user_ocid;
      a.tenancyOcid = acc.tenancy_ocid;
      a.region = acc.region;
      viewData.push(a);
    });
    return viewData;
  }

}

export class OCIAccountViewData {
  constructor() { }
  uuid: string;
  name: string;
  userOcid: string;
  tenancyOcid: string;
  region: string;
}