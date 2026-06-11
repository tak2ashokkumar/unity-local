import { Injectable } from '@angular/core';
import { GroupType } from './mtp-administration-group.type';
import { UserViewData } from '../mtp-administration-users/mtp-administration-users.service';
import { RoleViewData } from '../mtp-administration-roles/mtp-administration-roles.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DELETE_GROUP, GET_GROUPS, GET_ROLES, GET_TENANTS, GET_USERS, TOGGLE_GROUP } from 'src/app/shared/api-endpoint.const';
import { RoleType } from '../mtp-administration-roles/mtp-administration-roles.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TenantType, UserType } from '../mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';

@Injectable()
export class MtpAdministrationGroupService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient) { }

  getGroups(criteria: SearchCriteria): Observable<PaginatedResult<GroupType>> {
    return this.tableService.getData<PaginatedResult<GroupType>>(GET_GROUPS(), criteria);
  }

  getUsers(): Observable<UserType[]> {
    return this.http.get<UserType[]>(GET_USERS(), { params: new HttpParams().set('page_size', 0) });
  }

  getRoles(): Observable<RoleType[]> {
    return this.http.get<RoleType[]>(GET_ROLES(), { params: new HttpParams().set('page_size', 0) });
  }

  getTenants(): Observable<TenantType[]> {
    return this.http.get<TenantType[]>(GET_TENANTS());
  }

  convertToViewData(data: GroupType[]): GroupViewData[] {
    let viewData: GroupViewData[] = [];
    data.map(a => {
      let gd: GroupViewData = new GroupViewData();
      gd.uuid = a.uuid;
      gd.id = a.id;
      gd.name = a.name;
      gd.description = a.description;
      gd.users = a.users.map(user => user.email);//mandatory?
      gd.user = a.users.length ? a.users.getFirst().email : '';
      gd.usersBadgeCount = a.users.length ? a.users.length - 1 : 0;
      gd.extraUsersList = gd.users.length ? gd.users.slice(1) : [];
      gd.roles = a.roles.map(role => role.name);
      gd.role = a.roles.length ? a.roles.getFirst().name : '';
      gd.rolesBadgeCount = a.roles.length ? a.roles.length - 1 : 0;
      gd.extraRolesList = gd.roles.length ? gd.roles.slice(1) : [];
      gd.tenants = a.tenants.length ? a.tenants.map(tenant => tenant.name) : [];
      gd.tenant = a.tenants.length ? a.tenants.getFirst().name : '';
      gd.tenantsBadgeCount = a.tenants.length ? a.tenants.length - 1 : 0;
      gd.extraTenantsList = gd.tenants.length ? gd.tenants.slice(1) : [];
      gd.viewUsers = false;
      gd.isActive = a.is_active;
      gd.toggleIconMessage = 'Enable';
      if (a.is_active) {
        gd.toggleIconMessage = 'Disable';
      }
      gd.toggleIconClass = a.is_active ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
      viewData.push(gd);
    });
    return viewData;
  }

  toggle(groupId: string, isActive: boolean) {
    return this.http.put(TOGGLE_GROUP(groupId), { is_active: isActive })
  }

  delete(groupId: string) {
    return this.http.delete(DELETE_GROUP(groupId));
  }
}

export class GroupViewData {
  constructor() { }
  uuid: string;
  id: number;
  name: string;
  description: string;
  groupType: string;
  user: string;
  users: string[];
  extraUsersList: string[];
  usersBadgeCount: number;
  roles: string[];
  role: string;
  extraRolesList: string[];
  rolesBadgeCount: number;
  tenants: string[];
  tenant: string;
  extraTenantsList: string[];
  tenantsBadgeCount: number;
  isActive: boolean;
  toggleIconClass: string;
  toggleIconMessage: string;
  viewUsers: boolean;
}