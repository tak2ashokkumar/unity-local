import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PermissionSetType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { DELETE_PERMISSION_SET, GET_PERMISSION_SETS_LIST, TOGGLE_PERMISSION_SET_STATUS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UsumPermissionSetsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getPermissionSets(criteria: SearchCriteria): Observable<PaginatedResult<PermissionSetType>> {
    return this.tableService.getData<PaginatedResult<PermissionSetType>>(GET_PERMISSION_SETS_LIST(), criteria);
  }

  convertToViewData(data: PermissionSetType[]) {
    let viewData: PermissionSetViewData[] = [];
    data.forEach((d) => {
      let view: PermissionSetViewData = new PermissionSetViewData();
      view.permissionName = d.name;
      view.permissionSetId = d.uuid;
      view.description = d.description;
      view.permissions = d.rbac_permissions.length ? d.rbac_permissions.map((p) => p.module_name) : [];
      view.permission = d.rbac_permissions.length ? d.rbac_permissions.getFirst().module_name : '';
      view.permissionsBadgeCount = d.rbac_permissions.length ? d.rbac_permissions.length - 1 : 0;
      view.permissionsList = view.permissions.length ? view.permissions.slice(1) : [];
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

  togglePermissionSet(PermissionSetData: PermissionSetViewData) {
    // let params: HttpParams = new HttpParams().set('uuid', PermissionSetData.permissionSetId).set('status', !PermissionSetData.isActive);
    return this.http.get(TOGGLE_PERMISSION_SET_STATUS(PermissionSetData.permissionSetId));
  }

  deletePermissionSet(permissionSetId: string) {
    return this.http.delete(DELETE_PERMISSION_SET(permissionSetId));
  }

}

export class PermissionSetViewData {
  constructor() { }
  permissionName: string;
  permissionSetId: string;
  permissions: string[];
  permission: string;
  permissionsBadgeCount: number;
  permissionsList: string[];
  description: string;
  createdOn: string;
  createdBy: string;
  isActive: boolean;
  isDefault: boolean;
  isDefaultClass: string;
  toggleIcon: string;
  toggleTootipMsg: string;
}