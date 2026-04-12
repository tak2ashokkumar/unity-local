import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as momentTz from 'moment-timezone';
import { map, take } from 'rxjs/operators';
import { StorageService, StorageType } from './app-storage/storage.service';
import { UnityUserApplicableModulePermission, UnityUserType, User } from './SharedEntityTypes/loggedin-user.type';
import { PaginatedResult } from './SharedEntityTypes/paginated.type';
import { UnityModules } from './permissions/unity-modules';
import { getUnityManagePermissionName, getUnityViewPermissionName } from './permissions/unity-permission-set';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  constructor(private storage: StorageService,
    private http: HttpClient) { }

  addCustomSubscriptions(user: UnityUserType): UnityUserType {
    if (user.subscribed_modules && user.subscribed_modules.length) {
      let isDevicesSubscribed = user.subscribed_modules.find(m => m == 'Devices');
      if (isDevicesSubscribed) {
        user.subscribed_modules.push('Infrastructure');
      }
      let isUserGroupsSubscribed = user.subscribed_modules.find(m => m == 'User Groups');
      if (isUserGroupsSubscribed) {
        user.subscribed_modules.push('Users');
        user.subscribed_modules.push('Roles');
        user.subscribed_modules.push('Permission Sets');
      }
      user.subscribed_modules.push('Anomaly Detection');
      user.subscribed_modules.push('Auto Remediation');
      user.subscribed_modules.push('Network Configuration');
      user.subscribed_modules.push('Connections');
    }
    return user;
  }

  loadUserData() {
    return this.http.get<PaginatedResult<UnityUserType>>('/customer/uldbusers/').pipe(map(res => {
      if (res && res.results && res.results[0]) {
        let userObj = this.addCustomSubscriptions(res.results[0]);
        this.storage.put('user-permissions', this.convertToPermissionObject(userObj.applicable_module_permissions), StorageType.SESSIONSTORAGE);
        this.storage.put('user', userObj, StorageType.SESSIONSTORAGE);
      }
      return res.results[0];
    }), take(1)).toPromise();
  }

  convertToPermissionObject(perms: UnityUserApplicableModulePermission[]) {
    let a: UnityUserPermissions = new UnityUserPermissions();
    perms.map(p => {
      // if (p.module_name != 'Private Cloud') {
      // a[p.module_name] = p.permission_names;
      // p.permission_names.splice(2, 1);
      // }
      a[p.module_name] = p.permission_names;
    })
    return a;
  }

  get userDetails() {
    return <User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE);
  }

  get logo() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org._logo;
  }

  get userName() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).first_name;
  }

  get userOrg() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.name;
  }

  get selfBrandedOrgName() {
    if (this.userOrg == 'UPC Demo' || this.userOrg == 'United Private Cloud' || this.userOrg == 'UPC') {
      return 'UPC';
    }

    if (this.userOrg.includes('UPC')) {
      return 'UPC';
    }

    if (this.userOrg.includes('Unity')) {
      return 'UPC';
    }
    return null;
  }

  get userOrgId() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.id;
  }

  get userOrgUUID() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.uuid;
  }

  get userEmail() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).email;
  }

  get userTimeZoneString() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).timezone;
  }

  get userTimeZoneAbbr() {
    return momentTz.tz(this.userTimeZoneString).format("Z");
  }

  get userTimeZone() {
    return momentTz.tz(this.userTimeZoneString).format("Z z");
  }

  get hasTwoFactor() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).has_two_factor;
  }

  get isZabbixMonitoring() {
    let monitorBy = (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.monitor_by;
    return monitorBy && monitorBy == 'zabbix';
  }

  get isHybridMonitoring() {
    let monitorBy = (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.monitor_by;
    return monitorBy && monitorBy == 'hybrid';
  }

  get isObserviumMonitoring() {
    let monitorBy = (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.monitor_by;
    return monitorBy && monitorBy == 'observium';
  }

  get linkDeviceToCollector() {
    return this.isZabbixMonitoring || this.isHybridMonitoring;
  }

  get goToWelcomePage() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).welcome_page;
  }

  get isImpersonated() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).is_impersonated;
  }

  get isMultiImpersonated() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).is_multi_impersonated;
  }

  get isManagementEnabled() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.is_management_enabled;
  }

  get rdpUrls() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.rdp_urls;
  }

  get advancedDiscovery() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.advanced_discovery;
  }

  get isUserAdmin() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).is_customer_admin;
  }

  get subscribedModules() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).subscribed_modules;
  }

  get isAutoRemediationEnabled() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.auto_remediation_enabled;
  }

  get isAutoTicketingEnabled() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.auto_ticketing_enabled;
  }

  get isTenantOrg() {
    // return false;
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.msp_tenant;
  }

  get defaultDashboard() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).default_dashboard;
  }

  set defaultDashboard(dashboardId: string) {
    let user = <User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE);
    user.default_dashboard = dashboardId;
    this.storage.put('user', user, StorageType.SESSIONSTORAGE);
  }

  get isDashboardOnlyUser() {
    let roles = (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).active_rbac_roles;
    return roles.length == 1 && roles[0] == 'Dashboard user' ? true : false;
  }

  get isReadonlyUser() {
    let roles = (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).active_rbac_roles;
    return roles.length == 1 && roles[0] == 'Global Read-Only' ? true : false;
  }

  get modulePermissionSets() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).applicable_module_permissions;
  }

  get userPermissions() {
    return <UnityUserPermissions>this.storage.getByKey('user-permissions', StorageType.SESSIONSTORAGE);
  }

  get isGreenITEnabled() {
    const permissions = this.userPermissions[UnityModules.SUSTAINABILITY];
    return permissions ? permissions.includes('View Sustainability') : false;
  }

  get isAIMLEnabled() {
    const permissions = this.userPermissions[UnityModules.AIML_EVENT_MANAGEMENT];
    return permissions ? permissions.includes('View AIML Event Management') : false;
  }

  get inventoryViewEnabled() {
    return this.userPermissions[UnityModules.DATACENTER] || this.userPermissions[UnityModules.PRIVATE_CLOUD] || this.userPermissions[UnityModules.PUBLIC_CLOUD];
  }

  get isChatbotEnabled(): boolean {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).is_chatbot_enabled;
  }

  get isInsightsEnabled(): boolean {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).is_insights_enabled;
  }

  hasTaskAccess(input: UnityModules, task: string) {
    let permissions = this.userPermissions[input];
    return permissions && permissions.length ? permissions.includes(task) : false;
  }

  getViewPermissionName(input: UnityModules) {
    return getUnityViewPermissionName(input);
  }

  hasViewAccess(input: UnityModules) {
    let permissions = this.userPermissions[input];
    if (permissions && permissions.length) {
      let permission = this.getViewPermissionName(input);
      return permissions.includes(permission);
    }
    return false;
  }

  getManagePermissionName(input: UnityModules) {
    return getUnityManagePermissionName(input);
  }

  hasManageAccess(input: UnityModules) {
    let permissions = this.userPermissions[input];
    if (permissions && permissions.length) {
      let permission = this.getManagePermissionName(input);
      return permissions.includes(permission);
    }
    return false;
  }

  hasCompleteAccess(input: UnityModules) {
    if (input == UnityModules.SUSTAINABILITY) {
      return this.hasViewAccess(input);
    } else {
      return this.hasViewAccess(input) && this.hasManageAccess(input);
    }
  }
}

export class UnityUserPermissions {
  [key: string]: string[];
}

export class UserPermissionObj {
  read: boolean = false;
  write: boolean = false;
}
