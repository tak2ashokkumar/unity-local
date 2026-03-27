import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UnityNavData } from 'src/app/app-main/unity-nav';

import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-nav-item',
  templateUrl: './app-sidebar-nav-item.component.html',
  styleUrls: ['./app-sidebar-nav-item.component.scss']
})
export class AppSidebarNavItemComponent implements OnInit {

  @Input() item: UnityNavData;

  constructor(private router: Router, private el: ElementRef) { }

  hasClass(): boolean    { return !!this.item.class; }
  isDropdown(): boolean  { return !!this.item.children?.length; }
  isActive(): boolean    { return this.router.isActive(this.item.url, false); }

  ngOnInit(): void {
    Replace(this.el);
  }
}
