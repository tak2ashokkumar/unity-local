import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnitySetupUser, UserRoleType } from 'src/app/shared/SharedEntityTypes/user.type';
import { GET_AZURE_ACCOUNTS, INVITE_USER, LIST_USER, RESET_PASSWORD, TOGGLE_USER, UPDATE_USER } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable()
export class UsumUsersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private userService: UserInfoService) { }

  getUsers(criteria: SearchCriteria): Observable<PaginatedResult<UnitySetupUser>> {
    return this.tableService.getData<PaginatedResult<UnitySetupUser>>(LIST_USER(), criteria);
  }

  getAzureAccounts(): Observable<AzureManageAccountsType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<AzureManageAccountsType[]>(GET_AZURE_ACCOUNTS(), { params: params });
  }

  convert(s: UnitySetupUser): UserViewData {
    let a: UserViewData = new UserViewData();
    a.email = s.email;
    a.firstName = s.first_name;
    a.lastName = s.last_name;
    a.activeIcon = s.is_active ? 'fa-check-circle text-success' : 'fa-close text-danger';
    a.activateIcon = s.is_active ? 'fa-toggle-on' : 'fa-toggle-off';
    a.isActive = s.is_active;
    a.passwordResetLinkPending = s.password_reset_link_pending;
    a.userRoles = s.user_roles;
    a.carrier = s.carrier;
    a.phoneNumber = s.phone_number;

    if (this.userService.userEmail === s.email) {
      a.canActivate = false;
      a.activateStatusTooltip = '';
      a.activateButtonEnabled = 'action-icons-disabled';

      a.canReset = false;
      a.resetButtonClass = 'action-icons-disabled';
      a.resetTooltipMessage = '';

      a.canEdit = false;
      a.editTooltipMessage = '';
      a.editButtonEnabled = 'action-icons-disabled';

      a.canDelete = false;
      a.deleteButtonEnabled = 'action-icons-disabled';
      a.deleteTooltipMessage = '';

      a.canInviteUser = false;
      a.inviteUserButtonClass = 'action-icons-disabled';
      a.inviteUserTooltipMessage = '';
    } else {
      a.canActivate = true;
      a.activateStatusTooltip = s.is_active ? 'Deactivate' : 'Activate';
      a.activateButtonEnabled = '';

      a.canReset = !s.is_active ? false : (s.password_reset_link_pending ? false : true);
      a.resetButtonClass = a.canReset ? 'action-icons' : 'action-icons-disabled';
      a.resetTooltipMessage = !s.is_active ? 'Account Deactivated' : (!s.password_reset_link_pending ? 'Reset Password' : "Password reset link sent to user's email address.");

      a.canEdit = true;
      a.editTooltipMessage = 'Edit User';
      a.editButtonEnabled = '';

      a.canDelete = true;
      a.deleteButtonEnabled = '';
      a.deleteTooltipMessage = 'Delete User';

      a.canInviteUser = true;
      a.inviteUserButtonClass = '';
      a.inviteUserTooltipMessage = 'Invite User';
    }

    a.uuid = s.uuid;
    a.isCustomerAdmin = s.is_customer_admin;
    a.createdOn = s.date_joined ? this.utilSvc.toUnityOneDateFormat(s.date_joined) : 'NA';
    return a;
  }

  convertToViewData(data: UnitySetupUser[]): UserViewData[] {
    let viewData: UserViewData[] = [];
    data.map(s => {
      viewData.push(this.convert(s));
    });
    return viewData;
  }

  // manageUser(uuid: string, activeFlag: boolean): Observable<UnitySetupUser> {
  //   return this.http.put<UnitySetupUser>(UPDATE_USER(uuid), { is_active: activeFlag });
  // }
  
  toggleUser(uuid: string): Observable<UnitySetupUser> {
    return this.http.get<UnitySetupUser>(TOGGLE_USER(uuid));
  }

  resetPassword(user: UserViewData): Observable<string> {
    return this.http.post<string>(RESET_PASSWORD(), { uuid: user.uuid, email: user.email, first_name: user.firstName });
  }

  deleteUser(uuid: string): Observable<string> {
    return this.http.delete<string>(UPDATE_USER(uuid));
  }

  inviteUser(userId: string) {
    let params: HttpParams = new HttpParams();
    params.set('user_id', userId);
    return this.http.get<any>(INVITE_USER(userId), { params: params });
  }

}

export class UserViewData {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  carrier: UserPhoneCarrier;
  isCustomerAdmin: boolean;
  userRoles: UserRoleType[];

  isActive: boolean;
  activeIcon: string;

  canActivate: boolean;
  activateIcon: string;
  activateIconEnabled: boolean;
  activateButtonEnabled: string;
  activateStatusTooltip: string;

  canReset: boolean;
  resetButtonClass: string;
  resetTooltipMessage: string;
  passwordResetLinkPending: boolean;

  canEdit: boolean;
  editButtonEnabled: string;
  editTooltipMessage: string;

  canDelete: boolean;
  deleteButtonEnabled: string;
  deleteTooltipMessage: string;

  canInviteUser: boolean;
  inviteUserButtonClass: string;
  inviteUserTooltipMessage: string;

  createdOn: string;
  constructor() { }
}

export interface UserPhoneCarrier {
  id: string;
  carrier_name: string;
  sms_list: string[];
}