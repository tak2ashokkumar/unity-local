import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserInfoService } from '../shared/user-info.service';

@Injectable({
    providedIn: 'root'
})
export class MsDynamicsCrmGuard implements CanActivate {
    constructor(private userService: UserInfoService,
        private router: Router) { }

    canActivate(next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {
        return true;
    }
}