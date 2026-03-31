import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { Router } from '@angular/router';
import { Replace } from 'src/app/shared/replace';
import { UnityThemeService } from '../shared/unity-theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input() fixed = false;;

  @Input() navbarBrand: NavbarBrandConfig;
  @Input() navbarBrandFull: NavbarBrandConfig;
  @Input() navbarBrandMinimized: NavbarBrandConfig;
  @Input() navbarBrandText: { icon: string; text: string } = { icon: 'UL', text: 'UNITY' };
  @Input() navbarBrandHref = 'app-dashboard';

  @Input() sidebarToggler: any;
  @Input() mobileSidebarToggler: any;

  @Input() asideMenuToggler: any;
  @Input() mobileAsideMenuToggler: any;

  private readonly fixedClass = 'header-fixed';
  navbarBrandImg: boolean;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2,
    private router: Router,
    private el: ElementRef,
    public themeSvc: UnityThemeService) { }

  ngOnInit(): void {
    Replace(this.el);
    this.isFixed(this.fixed);
    this.navbarBrandImg = Boolean(this.navbarBrand || this.navbarBrandFull || this.navbarBrandMinimized);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, this.fixedClass);
  }

  goTo(): void {
    this.router.navigate([this.navbarBrandHref]);
  }

  isFixed(fixed: boolean = this.fixed): void {
    if (fixed) {
      this.renderer.addClass(this.document.body, this.fixedClass);
    }
  }
}

export interface NavbarBrandConfig {
  src?: string;
  alt?: string;
  [attr: string]: any;
}
