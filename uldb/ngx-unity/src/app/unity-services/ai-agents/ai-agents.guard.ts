import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { canAccessAiAgents } from 'src/app/shared/left-panel-access.util';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class AiAgentsGuard implements CanActivate, CanActivateChild {

  constructor(
    private readonly router: Router,
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
