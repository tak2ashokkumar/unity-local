import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInfoService } from '../shared/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceNowGuard implements CanActivate {
  constructor(private userService: UserInfoService,
    private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return true;
  }
}
