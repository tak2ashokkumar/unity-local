import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-nav-dropdown',
  templateUrl: './app-sidebar-nav-dropdown.component.html',
  styleUrls: ['./app-sidebar-nav-dropdown.component.scss']
})
export class AppSidebarNavDropdownComponent implements OnInit {

  @Input() link: any;

  public isBadge() {
    return this.link.badge ? true : false;
  }

  public isIcon() {
    return this.link.icon ? true : false;
  }

  isBranched(){
    return this.link.variant == 'branched' ? true : false;
  }

  constructor(private router: Router, private el: ElementRef) { }

  ngOnInit() {
    Replace(this.el);
  }

}
