import { Injectable } from '@angular/core';
import { UserInfoService } from './shared/user-info.service';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WelcomePageGuardService implements CanActivate {

  constructor(private userService: UserInfoService,
    private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const goToWelcomePage = this.userService.goToWelcomePage;
    if (goToWelcomePage) {
      this.router.navigate(['welcomepage']);
    } else {
      this.router.navigate(['home']);
    }

    return !goToWelcomePage;
  }
}