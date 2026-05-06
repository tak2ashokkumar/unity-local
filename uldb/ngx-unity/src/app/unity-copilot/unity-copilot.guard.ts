import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserInfoService } from '../shared/user-info.service';
import { canAccessAiAgents } from '../shared/left-panel-access.util';

@Injectable({
  providedIn: 'root'
})
export class UnityCopilotGuard implements CanActivate, CanActivateChild {

  constructor(private readonly router: Router,
    private readonly userService: UserInfoService) { }

  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.canAccess();
  }

  canActivateChild(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.canAccess();
  }

  private canAccess(): boolean | UrlTree {
    if (canAccessAiAgents(this.userService)) {
      return true;
    }

    return this.router.parseUrl('/no-access');
  }

}
