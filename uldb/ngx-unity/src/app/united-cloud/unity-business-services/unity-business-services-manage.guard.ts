import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { PermissionService } from 'src/app/shared/unity-rbac-permissions/unity-rbac-permission.service';

@Injectable({
  providedIn: 'root'
})
export class UnityBusinessServicesManageGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router) { }

  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.permissionService.hasManageAccess(UnityModules.BUSINESS_SERVICES)
      ? true
      : this.router.parseUrl('/no-access');
  }
}
