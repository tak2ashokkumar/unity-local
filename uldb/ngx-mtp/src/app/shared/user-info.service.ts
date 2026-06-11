import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as momentTz from 'moment-timezone';
import { map, take } from 'rxjs/operators';
import { StorageService, StorageType } from './app-storage/storage.service';
import { User, UserRolePermissions } from './SharedEntityTypes/loggedin-user.type';
import { PaginatedResult } from './SharedEntityTypes/paginated.type';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  constructor(private storage: StorageService, private http: HttpClient) { }

  loadUserData() {
    return this.http.get<PaginatedResult<User>>('/customer/mtp/profile/').pipe(map(res => {
      // res.results[0].user_roles.push('Dashboard user');
      if (res.results[0].permissions.length) {
        res.results[0].permissions.push({
          "id": 86,
          "permission": "Maintenance",
          "can_read": true,
          "can_write": true,
          "role": res.results[0].permissions[0].role
        })
      }

      if (res.results[0]) {
        this.storage.put('user-permissions', this.convertToPermissionObject(res.results[0].permissions), StorageType.SESSIONSTORAGE);
      }
      delete res.results[0].permissions;
      this.storage.put('user', res.results[0], StorageType.SESSIONSTORAGE);
      return res.results[0];
    }), take(1)).toPromise();
  }

  convertToPermissionObject(perms: UserRolePermissions[]) {
    let a: MtpUserPermissions = new MtpUserPermissions();
    perms.map(p => {
      let k: UserPermissionObj = new UserPermissionObj();
      k.read = p.can_read;
      k.write = p.can_write;
      a[p.permission] = k;
    })
    return a;
  }

  get userDetails() {
    return <User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE);
  }

  get logo() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org._logo;
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

  get isUserAdmin() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).is_customer_admin;
  }

  get isDashboardOnlyUser() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).user_roles[0].name == 'Dashboard user' ? true : false;
  }

  get hasTwoFactor() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).has_two_factor;
  }

  get userName() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).first_name;
  }

  get userOrg() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.name;
  }

  get userOrgId() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.id;
  }

  get userOrgUUID() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.uuid;
  }

  get goToWelcomePage() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).welcome_page;
  }

  get isImpersonated() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).is_impersonated;
  }

  get isManagementEnabled() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.is_management_enabled;
  }

  get subscribedModules() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).subscribed_modules;
  }

  get rdpUrls() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.rdp_urls;
  }

  get advancedDiscovery() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.advanced_discovery;
  }

  get isGreenITEnabled() {
    const greenITModule = (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).subscribed_modules.find(md => md == 'Sustainability');
    return greenITModule ? true : false;
  }

  get isAIMLEnabled() {
    const AIMLModule = (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).subscribed_modules.find(md => md == 'AIML Event Management');
    return AIMLModule ? true : false;
  }

  get isAutoRemediationEnabled() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.auto_remediation_enabled;
  }

  get isAutoTicketingEnabled() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).org.auto_ticketing_enabled;
  }

  get userPermissions() {
    return <MtpUserPermissions>this.storage.getByKey('user-permissions', StorageType.SESSIONSTORAGE);
  }

  get crmInstanceId() {
    return (<User>this.storage.getByKey('user', StorageType.SESSIONSTORAGE)).default_crm_instance;
  }

  removePermissions() {
    this.storage.removeByKey('user-permissions', StorageType.SESSIONSTORAGE);
  }
}

export class MtpUserPermissions {
  [key: string]: UserPermissionObj;
}

export class UserPermissionObj {
  read: boolean = false;
  write: boolean = false;
}
