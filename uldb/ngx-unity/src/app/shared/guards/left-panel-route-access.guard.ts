import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AppLevelService } from '../../app-level.service';
import { GET_UNITY_NAV_DATA, UnityNavData } from '../../app-main/unity-nav';
import { UserInfoService } from '../user-info.service';

@Injectable({
  providedIn: 'root'
})
export class LeftPanelRouteAccessGuard implements CanActivate, CanActivateChild {

  constructor(
    private readonly appService: AppLevelService,
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
    this.collectAllowedPaths(GET_UNITY_NAV_DATA(this.appService, this.userService), exact, prefixes);
    this.addKnownChildRouteAliases(exact, prefixes);

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

      if (children.length) {
        this.collectAllowedPaths(children, exact, prefixes);
      }
    });
  }

  private addKnownChildRouteAliases(exact: Set<string>, prefixes: Set<string>): void {
    const aliases = [
      { source: '/reports/manage/new-reports', alias: '/reports/manage' },
      { source: '/services/aiml', alias: '/services/aiml-summary' },
      { source: '/services/aiml', alias: '/services/aiml-event-mgmt' },
      { source: '/services/greeenIT/dashboard', alias: '/services/greeenIT' },
      { source: '/setup/cost-plan/resource-model', alias: '/setup/cost-plan/resource-mapping' },
      { source: '/support/documentation/userguide', alias: '/support/documentation' }
    ];

    aliases.forEach(({ source, alias }) => {
      if (exact.has(source) || prefixes.has(source)) {
        exact.add(alias);
        prefixes.add(alias);
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
