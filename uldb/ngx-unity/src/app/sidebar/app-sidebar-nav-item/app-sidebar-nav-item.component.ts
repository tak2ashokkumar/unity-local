import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-nav-item',
  templateUrl: './app-sidebar-nav-item.component.html',
  styleUrls: ['./app-sidebar-nav-item.component.scss']
})
export class AppSidebarNavItemComponent implements OnInit {

  @Input() item: any;

  constructor(private router: Router, private el: ElementRef) { }

  public hasClass() {
    return this.item.class ? true : false;
  }

  public isDropdown() {
    return this.item.children ? true : false;
  }

  public thisUrl() {
    return this.item.url;
  }

  public isActive() {
    return this.router.isActive(this.thisUrl(), false);
  }

  ngOnInit() {
    Replace(this.el);
  }
}
