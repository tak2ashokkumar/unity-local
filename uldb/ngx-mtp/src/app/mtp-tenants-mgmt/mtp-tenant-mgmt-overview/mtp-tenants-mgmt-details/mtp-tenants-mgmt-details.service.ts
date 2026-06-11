import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DELETE_USER_BY_UUID, GET_TENANT_SUBSCRIPTION, GET_UNITY_MODULES, MTP_ADD_SUBCRIPTION, MTP_IMPERSONATE_USER, MTP_TENANT_USER_PASSWORD_RESET, MTP_TENANT_USER_TOGGLE, TENANT_USER_LIST } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { TenantUserListDataType } from './mtp-tenants-mgmt-details.type';
import { MTPSubscription } from 'src/app/shared/SharedEntityTypes/subscriptions.type';
import { Observable } from 'rxjs';
import { UnityModulesDataType } from '../../mtp-tenants-mgmt-crud/mtp-tenants-mgmt-crud.type';

@Injectable()
export class MtpTenantsMgmtDetailsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getTenantUserList(uuid: string, criteria: SearchCriteria) {
    return this.tableService.getData<PaginatedResult<TenantUserListDataType>>(TENANT_USER_LIST(uuid), criteria);
  }

  convertTenantUserListToViewData(tenantData: TenantUserListDataType[]): TenantUserListViewData[] {
    let lv: TenantUserListViewData[] = [];
    tenantData.map(data => {
      let view: TenantUserListViewData = new TenantUserListViewData();
      view.fullName = data.full_name;
      view.emailId = data.email;
      view.orgUuid = data.org.uuid;
      view.userUuid = data.uuid;
      view.firstName = data.first_name;
      view.id = data.id;
      let accessTypeViews: TenantAccessTypeViewData[] = [];
      data.access_types.map(at => {
        let atView: TenantAccessTypeViewData = new TenantAccessTypeViewData();
        atView.name = at.name;
        accessTypeViews.push(atView);
      });
      view.accessType = accessTypeViews;
      let userTypeViews: TenantUserTypeViewData[] = [];
      data.user_roles.map(at => {
        let urView: TenantUserTypeViewData = new TenantUserTypeViewData();
        urView.name = at.name;
        userTypeViews.push(urView);
      });
      view.userType = userTypeViews;
      view.active = data.is_active;
      if (data.is_active) {
        view.status = 'Active';
        view.statusClass = 'text-success';
      } else {
        view.status = 'Inactive';
        view.statusClass = 'text-warning'
      }
      if (data.is_active) {
        view.isActive = 'Yes';
        view.toggleIcon = 'fa-toggle-on';
        view.toggleTootipMsg = 'Disable';
      } else {
        view.isActive = 'No';
        view.toggleIcon = 'fa-toggle-off';
        view.toggleTootipMsg = 'Enable';
      }
      lv.push(view);
    })
    return lv;
  }

  getSubscriptionsByTenant(tenantId: string) {
    return this.http.get<MTPSubscription[]>(GET_TENANT_SUBSCRIPTION(tenantId));
  }

  deleteUser(userInfo: TenantUserListViewData) {
    let params: HttpParams = new HttpParams().set('tenant_uuid', userInfo.orgUuid);
    return this.http.delete(DELETE_USER_BY_UUID(userInfo.userUuid), { params: params });
  }

  confirmToggle(user: TenantUserListViewData) {
    let params: HttpParams = new HttpParams().set('tenant_uuid', user.orgUuid)
      .set('is_active', user.isActive == 'Yes' ? "False" : "True");
    return this.http.put(MTP_TENANT_USER_TOGGLE(user.userUuid), {}, { params: params });
  }

  resetPassword(user: TenantUserListViewData) {
    let params: HttpParams = new HttpParams().set('tenant_uuid', user.orgUuid)
      .set('email', user.emailId)
      .set('first_name', user.firstName);
    return this.http.post(MTP_TENANT_USER_PASSWORD_RESET(user.userUuid), {}, { params: params });
  }

  getUnityModules(): Observable<UnityModulesDataType[]> {
    return this.http.get<UnityModulesDataType[]>(GET_UNITY_MODULES())
  }

  deleteModule(tenantId: string, moduleId: number) {
    let params: HttpParams = new HttpParams().set('module_id', moduleId);
    return this.http.delete(`customer/mtp/subscriptions/${tenantId}/delete_module/`, { params: params });
  }

  addModule(tenantId: string, moduleId: number) {
    let params: HttpParams = new HttpParams().set('module_id', moduleId);
    return this.http.post(MTP_ADD_SUBCRIPTION(tenantId), {}, { params: params });
  }

  impersonate(userId: number) {
    return this.http.request('post', MTP_IMPERSONATE_USER(userId));
  }

}

export class TenantUserListViewData {
  constructor() { }
  fullName: string;
  firstName: string;
  lastName: string;
  emailId: string;
  userType: TenantUserTypeViewData[];
  accessType: TenantAccessTypeViewData[];
  status: string;
  active: boolean;
  statusClass: string;
  userUuid: string;
  orgUuid: string;
  isActive: string;
  id: number;

  toggleIcon: 'fa-toggle-on' | 'fa-toggle-off';
  toggleTootipMsg: 'Enable' | 'Disable';
}

export class TenantUserTypeViewData {
  constructor() { }
  name: string;
}

export class TenantAccessTypeViewData {
  constructor() { }
  name: string;
}