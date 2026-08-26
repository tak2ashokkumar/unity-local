import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceCatalogAccessGuard implements CanActivate {
  constructor(
    private userInfoSvc: UserInfoService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.userInfoSvc.isServiceCatalogOnlyUser()) {
      return this.router.parseUrl('/services/service-catalog/redesign/catalog');
    }
    return true;
  }
}
