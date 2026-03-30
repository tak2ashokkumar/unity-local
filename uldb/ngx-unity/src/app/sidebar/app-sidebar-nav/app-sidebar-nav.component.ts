import { Component, ContentChild, HostBinding, Input, SimpleChanges, TemplateRef } from '@angular/core';
import { UnityNavData } from 'src/app/app-main/unity-nav';

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './app-sidebar-nav.component.html',
  styleUrls: ['./app-sidebar-nav.component.scss']
})
export class AppSidebarNavComponent {
  @Input() navItems: UnityNavData[] = [];

  @HostBinding('class.sidebar-nav') sidebarNavClass = true;
  @HostBinding('attr.role') role = 'navigation';

  public navItemsArray: Array<any>;

  isDivider(item: UnityNavData): boolean { return !!item.divider; }
  isTitle(item: UnityNavData): boolean   { return !!item.title; }

  trackByUrl(_index: number, item: UnityNavData): string {
    return item.url ?? item.name;
  }
}
