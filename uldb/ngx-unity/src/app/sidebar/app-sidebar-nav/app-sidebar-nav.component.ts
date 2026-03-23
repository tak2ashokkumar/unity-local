import { Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './app-sidebar-nav.component.html',
  styleUrls: ['./app-sidebar-nav.component.scss']
})
export class AppSidebarNavComponent implements OnInit, OnChanges {
  @Input() navItems: Array<any>;
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor() { }

  ngOnInit() {}

  @HostBinding('class.sidebar-nav') sidebarNavClass = true;
  @HostBinding('attr.role') @Input() role = 'nav';

  public navItemsArray: Array<any>;

  public isDivider(item) {
    return item.divider ? true : false;
  }

  public isTitle(item) {
    return item.title ? true : false;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.navItemsArray = JSON.parse(JSON.stringify(this.navItems || []));
  }
}
