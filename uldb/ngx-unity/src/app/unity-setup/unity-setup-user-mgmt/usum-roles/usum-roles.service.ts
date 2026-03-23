import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { RoleType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { DELETE_ROLE, GET_ROLES_LIST, TOGGLE_ROLE_STATUS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsumRolesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getRoles(criteria: SearchCriteria): Observable<PaginatedResult<RoleType>> {
    return this.tableService.getData<PaginatedResult<RoleType>>(GET_ROLES_LIST(), criteria);
  }

  convertToViewData(data: RoleType[]): RoleViewData[] {
    let viewData: RoleViewData[] = [];
    data.forEach((d) => {
      let view: RoleViewData = new RoleViewData();
      view.roleName = d.name;
      view.roleId = d.uuid;
      view.description = d.description;
      view.permissions = d.applicable_permissions.length ? d.applicable_permissions.map((ap) => ap.name) : [];
      view.permission = d.applicable_permissions.length ? d.applicable_permissions.getFirst().name : '';
      view.permissionBadgeCount = d.applicable_permissions.length ? d.applicable_permissions.length - 1 : 0;
      view.permissionsList = view.permissions.length ? view.permissions.slice(1) : [];

      // view.userGroups = d.user_groups.length ? d.user_groups : [];
      // view.userGroupName = d.user_groups.length ? d.user_groups.getFirst() : '';
      // view.userGroupsBadgeCount = d.user_groups.length ? d.user_groups.length - 1 : 0;
      // view.userGroupsNameList = view.userGroups.length ? view.userGroups.slice(1) : [];

      view.users = d.users.length ? d.users : [];
      view.user = d.users.length ? d.users.getFirst() : '';
      view.usersBadgeCount = d.users.length ? d.users.length - 1 : 0;
      view.usersList = view.users.length ? view.users.slice(1) : [];

      view.createdOn = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'NA';
      view.createdBy = d.created_by_name;
      view.isActive = d.is_active;
      if (d.is_active) {
        view.toggleIcon = 'fa-toggle-on';
        view.toggleTootipMsg = 'Disable';
      } else {
        view.toggleIcon = 'fa-toggle-off';
        view.toggleTootipMsg = 'Enable';
      }
      view.isDefault = d.is_default;
      d.is_default ? view.isDefaultClass = 'action-icons-disabled' : view.isDefaultClass = '';
      viewData.push(view);
    });
    return viewData;
  }

  toggleRole(toggleRoleData: RoleViewData) {
    // let params: HttpParams = new HttpParams().set('uuid', toggleRoleData.roleId).set('status', !toggleRoleData.isActive);
    return this.http.get(TOGGLE_ROLE_STATUS(toggleRoleData.roleId));
  }

  deleteRole(roleId: string) {
    return this.http.delete(DELETE_ROLE(roleId));
  }

}

export class RoleViewData {
  constructor() { }
  id: number;
  roleId: string;
  roleName: string;
  description: string;

  permissions: string[];
  permission: string;
  permissionBadgeCount: number;
  permissionsList: string[];

  // userGroups: string[];
  // userGroupName: string;
  // userGroupsBadgeCount: number;
  // userGroupsNameList: string[];

  users: string[];
  user: string;
  usersBadgeCount: number;
  usersList: string[];

  isActive: boolean;
  toggleIcon: string;
  toggleTootipMsg: string;
  isDefault: boolean;
  isDefaultClass: string;
  createdOn: string;
  updatedOn: string;
  createdBy: string;
}