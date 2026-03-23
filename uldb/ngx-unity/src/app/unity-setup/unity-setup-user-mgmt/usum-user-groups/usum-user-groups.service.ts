import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { DELETE_USER_GROUP, GET_USER_GROUPS_LIST, TOGGLE_USER_GROUP_STATUS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsumUserGroupsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getUserGroups(criteria: SearchCriteria): Observable<PaginatedResult<UserGroupType>> {
    return this.tableService.getData<PaginatedResult<UserGroupType>>(GET_USER_GROUPS_LIST(), criteria);
  }

  convertToViewData(data: UserGroupType[]): UserGroupViewData[] {
    let viewData: UserGroupViewData[] = [];
    data.forEach((d) => {
      let view: UserGroupViewData = new UserGroupViewData();
      view.userGroupName = d.name;
      view.userGroupId = d.uuid;
      view.description = d.description;

      view.users = d.rbac_users.length ? d.rbac_users : [];
      view.user = d.rbac_users.length ? d.rbac_users.getFirst() : '';
      view.usersBadgeCount = d.rbac_users.length ? d.rbac_users.length - 1 : 0;
      view.usersList = view.users.length ? view.users.slice(1) : [];

      view.userRoles = d.applicable_rbac_roles.length ? d.applicable_rbac_roles.map((r) => r.name) : [];
      view.userRoleName = d.applicable_rbac_roles.length ? d.applicable_rbac_roles.getFirst().name : '';
      view.userRolesBadgeCount = d.applicable_rbac_roles.length ? d.applicable_rbac_roles.length - 1 : 0;
      view.userRolesList = view.userRoles.length ? view.userRoles.slice(1) : [];

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
      viewData.push(view);
    });
    return viewData;
  }

  toggleUserGroup(toggleUserGroupData: UserGroupViewData) {
    // let params: HttpParams = new HttpParams().set('uuid', toggleUserGroupData.userGroupId).set('status', !toggleUserGroupData.isActive);
    return this.http.get(TOGGLE_USER_GROUP_STATUS(toggleUserGroupData.userGroupId));
  }

  deleteUserGroup(userGroupId: string) {
    return this.http.delete(DELETE_USER_GROUP(userGroupId));
  }

}

export class UserGroupViewData {
  constructor() { }
  id: number;
  userGroupId: string;
  userGroupName: string;
  description: string;

  users: string[];
  user: string;
  usersBadgeCount: number;
  usersList: string[];

  userRoles: string[];
  userRoleName: string;
  userRolesBadgeCount: number;
  userRolesList: string[];

  isActive: boolean;
  toggleIcon: string;
  toggleTootipMsg: string;
  createdOn: string;
  updatedOn: string;
  createdBy: string;
}