import { DOCUMENT } from '@angular/common';
import { Component, HostBinding, Inject, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UnityNavData } from 'src/app/app-main/unity-nav';

type NavStateContext = {
  items: UnityNavData[];
  parentKey: string;
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() compact: boolean;
  @Input() disabled = false;
  @Input() display: string | false;
  @Input() fixed: boolean;
  @Input() minimized: boolean;
  @Input() navItems: UnityNavData[] = [];
  @Input() offCanvas: boolean;

  @HostBinding('class.sidebar') sidebarClass = true;

  private readonly ngUnSubscribe = new Subject<void>();
  private readonly appliedBodyClasses = new Set<string>();

  activeKeys = new Set<string>();
  collapsedKeys = new Set<string>();
  expandedKeys = new Set<string>();

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.applyBodyClasses();
    this.rebuildActiveState();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.ngUnSubscribe)
    )
      .subscribe((_event: NavigationEnd) => {
        this.expandedKeys.clear();
        this.collapsedKeys.clear();
        this.rebuildActiveState();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.compact || changes.display || changes.fixed || changes.minimized || changes.offCanvas) {
      this.applyBodyClasses();
    }

    if (changes.navItems && !changes.navItems.firstChange) {
      this.expandedKeys.clear();
      this.collapsedKeys.clear();
      this.rebuildActiveState();
    }
  }

  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
    this.clearBodyClasses();
  }

  isDivider(item: UnityNavData): boolean { return !!item.divider; }
  isDropdown(item: UnityNavData): boolean { return !!item.children?.length; }
  isExternalLink(item: UnityNavData): boolean { return item.url?.startsWith('http') ?? false; }
  isHidden(item: UnityNavData): boolean { return !!this.getAttributes(item).hide; }
  isTitle(item: UnityNavData): boolean { return !!item.title; }

  trackByNav(index: number, item: UnityNavData): string {
    return item.url ?? item.name ?? `${index}`;
  }

  getItemKey(parentKey: string, item: UnityNavData, index: number): string {
    return `${parentKey}/${item.url ?? item.name ?? index}`;
  }

  getItemClasses(item: UnityNavData, key: string): string[] {
    const classes = ['nav-item'];
    if (this.isDropdown(item)) {
      classes.push('nav-dropdown');
      if (this.isOpen(key)) {
        classes.push('open');
      }
    }
    if (this.activeKeys.has(key)) {
      classes.push('active-nav-item');
    }
    if (item.class) {
      classes.push(item.class);
    }
    return classes;
  }

  getLinkClasses(item: UnityNavData, key: string): Record<string, boolean> {
    const disabled = this.isDisabled(item);
    const classes: Record<string, boolean> = {
      'nav-link': true,
      'disabled': disabled,
      'btn-link': disabled,
      'active': this.isActiveLink(item),
      'active-parent': this.isDropdown(item) && this.activeKeys.has(key)
    };

    if (item.variant) {
      classes[`nav-link-${item.variant}`] = true;
    }

    return classes;
  }

  isBadge(item: UnityNavData): boolean { return !!item.badge; }
  isBetaItem(item: UnityNavData): boolean { return !!this.getAttributes(item).isBeta; }
  isDisabled(item: UnityNavData): boolean { return !!this.getAttributes(item).disabled; }
  isIcon(item: UnityNavData): boolean { return !!item.icon; }

  isOpen(key: string): boolean {
    if (this.collapsedKeys.has(key)) {
      return false;
    }
    return this.expandedKeys.has(key) || this.activeKeys.has(key);
  }

  isActiveLink(item: UnityNavData): boolean {
    return !this.isDropdown(item) && this.isRouteActive(item);
  }

  hideMobile(): void {
    if (this.document.body.classList.contains('sidebar-show')) {
      this.renderer.removeClass(this.document.body, 'sidebar-show');
    }
  }

  toggleDropdown(item: UnityNavData, key: string, $event: Event): void {
    $event.preventDefault();
    if (this.isDisabled(item)) {
      return;
    }

    if (this.isOpen(key)) {
      this.expandedKeys.delete(key);
      if (this.activeKeys.has(key)) {
        this.collapsedKeys.add(key);
      }
      return;
    }

    this.collapsedKeys.delete(key);
    this.expandedKeys.add(key);
  }

  private applyBodyClasses(): void {
    this.clearBodyClasses();

    if (this.display !== false) {
      const cssClass = this.display ? `sidebar-${this.display}-show` : 'sidebar-show';
      this.addBodyClass(cssClass);
    }

    if (this.compact) {
      this.addBodyClass('sidebar-compact');
    }

    if (this.fixed) {
      this.addBodyClass('sidebar-fixed');
    }

    if (this.minimized) {
      this.addBodyClass('sidebar-minimized');
    }

    if (this.offCanvas) {
      this.addBodyClass('sidebar-off-canvas');
    }
  }

  private addBodyClass(cssClass: string): void {
    this.renderer.addClass(this.document.body, cssClass);
    this.appliedBodyClasses.add(cssClass);
  }

  private clearBodyClasses(): void {
    this.appliedBodyClasses.forEach(cssClass => this.renderer.removeClass(this.document.body, cssClass));
    this.appliedBodyClasses.clear();
  }

  private getAttributes(item: UnityNavData): { [key: string]: any } {
    return (item.attributes as { [key: string]: any }) || {};
  }

  private rebuildActiveState(): void {
    this.activeKeys.clear();
    this.walkNavState({
      items: this.navItems || [],
      parentKey: 'root'
    });
  }

  private walkNavState(context: NavStateContext): boolean {
    let hasActiveItem = false;

    context.items.forEach((item, index) => {
      const key = this.getItemKey(context.parentKey, item, index);

      if (this.isHidden(item)) {
        return;
      }

      const isCurrentRoute = this.isRouteActive(item);
      const hasActiveChild = item.children?.length
        ? this.walkNavState({ items: item.children, parentKey: key })
        : false;

      if (isCurrentRoute || hasActiveChild) {
        this.activeKeys.add(key);
        hasActiveItem = true;
      }
    });

    return hasActiveItem;
  }

  private isRouteActive(item: UnityNavData): boolean {
    if (this.isExternalLink(item) || !item.url) {
      return false;
    }

    const routeUrls = [
      item.url,
      ...(item.routeAccess?.aliases || [])
    ].reduce((urls, url) => {
      urls.push(url);

      const normalizedUrl = this.normalizeRouteUrl(url);
      if (normalizedUrl !== url) {
        urls.push(normalizedUrl);
      }

      return urls;
    }, [] as string[]);
    return routeUrls.some(url => this.router.isActive(url, false));
  }

  private normalizeRouteUrl(url: string): string {
    return url.length > 1 ? url.replace(/\/+$/, '') : url;
  }
}
