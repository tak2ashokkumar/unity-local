import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TenantType, UserType } from './mtp-administration-users-crud/mtp-administration-users-crud.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { GET_TENANTS, GET_USERS, TOGGLE_USER, USER_PASSWORD_RESET } from 'src/app/shared/api-endpoint.const';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DELETE_USER } from '../../../shared/api-endpoint.const';

@Injectable()
export class MtpAdministrationUsersService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient) { }

  getUsers(criteria: SearchCriteria): Observable<PaginatedResult<UserType>> {
    return this.tableService.getData<PaginatedResult<UserType>>(GET_USERS(), criteria);
  }

  getTenants(): Observable<TenantType[]> {
    return this.http.get<TenantType[]>(GET_TENANTS());
  }

  convertToViewData(data: UserType[]): UserViewData[] {
    let viewData: UserViewData[] = [];
    data.map(a => {
      let ud: UserViewData = new UserViewData();
      ud.uuid = a.uuid;
      ud.firstName = a.first_name;
      ud.lastName = a.last_name;
      ud.fullName = `${a.first_name} ${a.last_name}`;
      ud.email = a.email;
      ud.type = a.user_type;
      ud.contactNumber = a.phone_number;
      ud.roles = a.user_roles.length ? a.user_roles.map(role => role.name) : [];
      ud.role = a.user_roles.length ? a.user_roles.getFirst().name : '';
      ud.rolesBadgeCount = a.user_roles.length ? a.user_roles.length - 1 : 0;
      ud.extraRolesList = ud.roles.length ? ud.roles.slice(1) : [];
      ud.tenants = a.tenants.length ? a.tenants.map(tenant => tenant.name) : [];
      ud.tenant = a.tenants.length ? a.tenants.getFirst().name : '';
      ud.tenantsBadgeCount = a.tenants.length ? a.tenants.length - 1 : 0;
      ud.extraTenantsList = ud.tenants.length ? ud.tenants.slice(1) : [];
      ud.isActive = a.is_active;
      ud.statusIcon = 'fa-exclamation-circle text-danger';
      ud.statusIconMessage = 'Disabled';
      ud.toggleIconMessage = 'Enable';
      if (a.is_active) {
        ud.statusIcon = 'fa-check font-lg mt-1';
        ud.statusIconMessage = 'Enabled';
        ud.toggleIconMessage = 'Disable';
      }
      ud.toggleIconClass = a.is_active ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
      ud.viewTenants = false;
      ud.resetButtonClass = ud.isActive ? 'action-icons' : 'action-icons-disabled';
      ud.resetButtonMessage = ud.isActive ? 'Send Password Reset Link' : 'User disabled';
      viewData.push(ud);
    });
    return viewData;
  }

  toggle(userId: string, isActive: boolean) {
    return this.http.put(TOGGLE_USER(userId), { is_active: isActive })
  }

  resetPassword(user: UserViewData) {
    return this.http.post(USER_PASSWORD_RESET(), { uuid: user.uuid, email: user.email, first_name: user.firstName });
  }

  delete(userId: string) {
    return this.http.delete(DELETE_USER(userId));
  }

}

export class UserViewData {
  constructor() { }
  uuid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  type: string;
  tenant: string;
  contactNumber: number;
  role: string;
  roles: string[];
  isActive: boolean;
  statusIcon: string;
  statusIconMessage: string;
  toggleIconClass: string;
  toggleIconMessage: string;
  viewTenants: boolean;
  tenants: string[];
  extraTenantsList: string[];
  tenantsBadgeCount: number;
  extraRolesList: string[];
  rolesBadgeCount: number;
  resetButtonClass: string;
  resetButtonMessage: string;
}