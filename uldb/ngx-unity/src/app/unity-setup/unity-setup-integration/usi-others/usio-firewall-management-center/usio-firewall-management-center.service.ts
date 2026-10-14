import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrivateCloudRemoteWebAccessType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FirewallManagementCenterAccountType } from './usio-firewall-management-center.type';

@Injectable()
export class UsioFirewallManagementCenterService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getAccounts(criteria: SearchCriteria): Observable<PaginatedResult<FirewallManagementCenterAccountType>> {
    return this.tableService.getData<PaginatedResult<FirewallManagementCenterAccountType>>('/customer/fmc/accounts/', criteria);
  }

  convertToViewData(data: FirewallManagementCenterAccountType[]): FirewallManagementCenterAccountViewData[] {
    const viewData: FirewallManagementCenterAccountViewData[] = [];
    data.forEach(d => {
      const a: FirewallManagementCenterAccountViewData = new FirewallManagementCenterAccountViewData();
      a.name = d.name;
      a.accountId = d.uuid;
      a.url = d.account_url;
      a.port = d.port;
      a.portText = d.port || d.port === 0 ? d.port.toString() : 'N/A';
      a.version = d.version || 'N/A';
      a.remoteWebAccess = d.remote_web_access;
      a.showRemoteWebAccessButton = !!d.remote_web_access?.can_create_session;
      a.remoteWebTooltip = a.showRemoteWebAccessButton ? 'Manage In New Tab' : d.remote_web_access?.message || 'Remote web access unavailable';
      viewData.push(a);
    });
    return viewData;
  }

  deleteAccount(accountId: string): Observable<object> {
    return this.http.delete(`/customer/fmc/accounts/${accountId}/`);
  }

}

export class FirewallManagementCenterAccountViewData {
  constructor() { }
  name: string = '';
  accountId: string = '';
  url: string = '';
  port: number | null = null;
  portText: string = '';
  version: string = '';
  remoteWebAccess?: PrivateCloudRemoteWebAccessType;
  showRemoteWebAccessButton: boolean = false;
  remoteWebTooltip: string = '';
}
