import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class GreenItGuard implements CanActivate {
  constructor(private router: Router,
    private user: UserInfoService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route.routeConfig.path != 'subscribe') {
      if (this.user.isGreenITEnabled) {
        return true;
      } else {
        this.router.navigateByUrl('services/greeenIT/subscribe');
        return false;
      }
    } else {
      if (this.user.isGreenITEnabled) {
        this.router.navigateByUrl('services/greeenIT/dashboard');
        return false;
      } else {
        return true;
      }
    }
  }

}
