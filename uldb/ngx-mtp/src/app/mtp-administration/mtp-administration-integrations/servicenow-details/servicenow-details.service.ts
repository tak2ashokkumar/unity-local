import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ADD_SERVICE_NOW, EDIT_SERVICE_NOW } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class ServicenowDetailsService {

  constructor(private tableService: TableApiServiceService, private http: HttpClient) { }

  getServiceNowInstances(criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<ServicenowAccounts>>(ADD_SERVICE_NOW(), criteria);
  }

  convertToViewdata(accounts: ServicenowAccounts[]): ServiceNowAccountsViewData[] {
    let viewData: ServiceNowAccountsViewData[] = [];
    accounts.map(account => {
      let data: ServiceNowAccountsViewData = new ServiceNowAccountsViewData();
      data.id = account.id;
      data.name = account.name;
      data.uuid = account.uuid;
      data.instanceUrl = account.instance_url;
      data.username = account.username;
      data.isDefault = account.is_default;
      data.isItsm = account.is_itsm;
      data.isCmdb = account.is_cmdb;
      data.user = account.user;
      data.tenants = account.tenants.length ? account.tenants.map(tenant => tenant.name) : [];
      data.tenantName = data.tenants.getFirst();
      data.tenantsBadgeCount = data.tenants.length ? account.tenants.length - 1 : 0;
      data.extraTenantsList = data.tenants.length ? data.tenants.slice(1) : [];
      viewData.push(data);
    });
    return viewData;
  }

  delete(snId: string) {
    return this.http.delete(EDIT_SERVICE_NOW(snId));
  }
}


export interface ServicenowAccounts {
  id: number;
  name: string;
  uuid: string;
  instance_url: string;
  username: string;
  is_default: boolean;
  is_itsm: boolean;
  is_cmdb: boolean;
  user: number;
  tenants: Tenant[];
}

export interface Tenant {
  id: number;
  name: string;
}

export class ServiceNowAccountsViewData {
  id: number;
  name: string;
  uuid: string;
  instanceUrl: string;
  username: string;
  isDefault: boolean;
  isItsm: boolean;
  isCmdb: boolean;
  user: number;
  tenants: string[];
  tenantId: number;
  tenantName: string;
  extraTenantsList: string[];
  tenantsBadgeCount: number;
  constructor() { }
}

