import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { UnityNavData } from 'src/app/app-main/unity-nav';

import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-nav-dropdown',
  templateUrl: './app-sidebar-nav-dropdown.component.html',
  styleUrls: ['./app-sidebar-nav-dropdown.component.scss']
})
export class AppSidebarNavDropdownComponent implements OnInit {

  @Input() link: UnityNavData;

  isBadge(): boolean { return !!this.link.badge; }
  isIcon(): boolean { return !!this.link.icon; }
  isBranched(): boolean { return this.link.variant === 'branched'; }

  trackByUrl(_index: number, item: UnityNavData): string {
    return item.url ?? item.name;
  }

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    Replace(this.el);
  }

}
