import { Injectable } from '@angular/core';
import { UserInfoService } from './shared/user-info.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WelcomePageGuardService implements CanActivate {

  constructor(private userService: UserInfoService,
    private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (this.userService.isServiceCatalogOnlyUser()) {
      this.router.navigate(['services/service-catalog/redesign/catalog']);
      return false;
    } else {
      console.log(this.userService.goToWelcomePage)
      const goToWelcomePage = this.userService.goToWelcomePage;
      if (goToWelcomePage) {
        this.router.navigate(['welcomepage']);
      } else {
        this.router.navigate(['home']);
      }

      return !goToWelcomePage;
    }
  }
}
