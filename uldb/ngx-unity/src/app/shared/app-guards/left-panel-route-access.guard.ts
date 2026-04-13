import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { GET_UNITY_NAV_DATA, UnityNavData } from '../../app-main/unity-nav';
import { PermissionService } from '../unity-rbac-permissions/unity-rbac-permission.service';
import { UserInfoService } from '../user-info.service';

@Injectable({
    providedIn: 'root'
})
export class LeftPanelRouteAccessGuard implements CanActivate, CanActivateChild {

    constructor(
        private readonly permissionService: PermissionService,
        private readonly router: Router,
        private readonly userService: UserInfoService) { }

    canActivate(_next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        return this.canAccess(state.url);
    }

    canActivateChild(_next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        return this.canAccess(state.url);
    }

    private canAccess(url: string): boolean | UrlTree {
        const path = this.normalizeUrl(url);
        const allowedPaths = this.getAllowedPaths();

        if (allowedPaths.exact.has(path) || allowedPaths.prefixes.some(prefix => this.isSamePathOrChild(path, prefix))) {
            return true;
        }

        return this.router.parseUrl('/no-access');
    }

    private getAllowedPaths(): { exact: Set<string>; prefixes: string[] } {
        const exact = new Set<string>();
        const prefixes = new Set<string>();
        this.collectAllowedPaths(GET_UNITY_NAV_DATA(this.permissionService, this.userService), exact, prefixes);

        return {
            exact,
            prefixes: Array.from(prefixes).sort((a, b) => b.length - a.length)
        };
    }

    private collectAllowedPaths(navItems: UnityNavData[], exact: Set<string>, prefixes: Set<string>): void {
        navItems.forEach(item => {
            const itemUrl = this.normalizeUrl(item.url);
            const children = item.children || [];

            if (itemUrl) {
                exact.add(itemUrl);
                // Parent menu groups should not unlock hidden sibling subroutes.
                if (!children.length) {
                    prefixes.add(itemUrl);
                }
            }

            this.addRouteAccessAliases(item, exact, prefixes);

            if (children.length) {
                this.collectAllowedPaths(children, exact, prefixes);
            }
        });
    }

    private addRouteAccessAliases(item: UnityNavData, exact: Set<string>, prefixes: Set<string>): void {
        (item.routeAccess?.aliases || []).forEach(alias => {
            const normalizedAlias = this.normalizeUrl(alias);
            if (normalizedAlias) {
                exact.add(normalizedAlias);
                prefixes.add(normalizedAlias);
            }
        });
    }

    private normalizeUrl(url: string): string {
        const path = (url || '').split(/[?#]/)[0];
        return path.length > 1 ? path.replace(/\/+$/, '') : path;
    }

    private isSamePathOrChild(path: string, prefix: string): boolean {
        return path === prefix || path.startsWith(`${prefix}/`);
    }
}
