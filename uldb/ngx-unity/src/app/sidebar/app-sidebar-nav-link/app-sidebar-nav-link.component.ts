import { Component, OnInit, Input, ElementRef, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-nav-link',
  templateUrl: './app-sidebar-nav-link.component.html',
  styleUrls: ['./app-sidebar-nav-link.component.scss']
})
export class AppSidebarNavLinkComponent implements OnInit {

  @Input() link: any;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
    private router: Router,
    private el: ElementRef
  ) { }

  public getClasses() {
    const disabled = this.isDisabled();
    const classes = {
      'nav-link': true,
      'disabled': disabled,
      'btn-link': disabled
    };
    if (this.hasVariant()) {
      const variant = `nav-link-${this.link.variant}`;
      classes[variant] = true;
    }
    return classes;
  }

  public getLinkType() {
    return this.isDisabled() ? 'disabled' : this.isExternalLink() ? 'external' : '';
  }

  public hasVariant() {
    return this.link.variant ? true : false;
  }

  public isBranched() {
    return this.link.variant == 'branched' ? true : false;
  }

  public isBadge() {
    return this.link.badge ? true : false;
  }

  public isBetaItem() {
    return this.link.attributes && this.link.attributes.isBeta;
  }

  public isDisabled() {
    if (this.link.name == "Sustainability") {
      return false;
    } else {
      return this.link.attributes && this.link.attributes.disabled ? true : false;
    }
  }

  public isExternalLink() {
    return this.link.url.substring(0, 4) === 'http' ? true : false;
  }

  public isIcon() {
    return this.link.icon ? true : false;
  }

  public hideMobile() {
    if (this.document.body.classList.contains('sidebar-show')) {
      this.renderer.removeClass(this.document.body, 'sidebar-show');
    }
  }


  ngOnInit() {
    Replace(this.el);
  }

}
