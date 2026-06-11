import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppLevelService, MTPModules } from './app-level.service';
import { MtpUserPermissions, UserInfoService } from './shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class UserAccessGuard implements CanActivate, CanActivateChild {
  constructor(private appService: AppLevelService,
    private user: UserInfoService,
    private router: Router) { };

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAccess(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAccess(childRoute);;
  }

  checkAccess(route: ActivatedRouteSnapshot): boolean {
    if (route.data.module) {
      let perm = this.appService.getAccess(route.data.module);
      if (perm && perm.read) {
        return true;
      }
    } else {
      return true;
    }
    let accessableModules = Object.keys(this.user.userPermissions);
    if (accessableModules.find(m => m == MTPModules.DASHBOARD)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate([this.getUrlOfModule(accessableModules.getFirst())]);
    }
    return false;
  }

  getUrlOfModule(module: string) {
    switch (module) {
      case MTPModules.DASHBOARD: return `/dashboard`;
      case MTPModules.TENANT_MANAGEMENT: return `/tenantsmgmt`;
      case MTPModules.MONITORING_MANAGEMENT: return `/administration/monitoring`;
      case MTPModules.USER_MANAGEMENT: return `/administration/usermgmt`;
      case MTPModules.SERVICE_MANAGEMENT: return `/administration/servicemgmt/sla/group`;
      case MTPModules.INTEGRATION_MANAGEMENT: return `/administration/integration`;
      case MTPModules.EVENT_MANAGEMENT: return `/aiml/summary`;
      case MTPModules.TICKET_MANAGEMENT: return `/ticketmgmt`;
      case MTPModules.ACTIVITY_LOG: return `/activity-logs`;
      default: return `/dashboard`;
    }
  }
}
