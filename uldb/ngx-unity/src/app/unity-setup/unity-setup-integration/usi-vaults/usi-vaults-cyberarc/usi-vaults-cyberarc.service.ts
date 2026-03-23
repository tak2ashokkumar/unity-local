import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CyberarcItem } from '../usi-vaults-cyberarc.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsiVaultsCyberarcService {

  constructor(private http: HttpClient,
    private appService: AppLevelService, private tableService: TableApiServiceService) { }

  getCyberarcVaults(criteria: SearchCriteria): Observable<PaginatedResult<CyberarcItem>> {
    return this.tableService.getData<PaginatedResult<CyberarcItem>>(`customer/cyberark/accounts/`, criteria);
  }

  convertToViewData(data: CyberarcItem[]): CyberarcViewData[] {
    let viewData: CyberarcViewData[] = [];
    data.forEach(d => {
      let v: CyberarcViewData = new CyberarcViewData();
      v.vaultId = d.uuid;
      v.name = d.name;
      v.baseUrl = d.base_url;
      v.appId = d.app_id;
      v.collector = d.collector_name;
      v.safe = d.safe;
      v.username = d.username;
      v.deviceName = d.address ? d.address : '';
      v.objectName = d.object_name;
      v.customer = d.customer;
      v.isDefault = d.default;
      viewData.push(v);
    });
    return viewData;
  }

  deleteVault(vaultId: string) {
    return this.http.delete(`customer/cyberark/accounts/${vaultId}/`);
  }
}

export class CyberarcViewData {
  constructor() { }
  vaultId: string;
  name: string;
  baseUrl: string;
  appId: string;
  collector: string;
  safe: string;
  username: string;
  deviceName: string;
  objectName: string;
  customer: number;
  isDefault: boolean;
}
