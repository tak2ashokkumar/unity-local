import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, Renderer2 } from '@angular/core';

import { UnityNavData } from 'src/app/app-main/unity-nav';
import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-nav-link',
  templateUrl: './app-sidebar-nav-link.component.html',
  styleUrls: ['./app-sidebar-nav-link.component.scss']
})
export class AppSidebarNavLinkComponent implements OnInit {

  @Input() link: UnityNavData;

  linkType = '';
  linkClasses: Record<string, boolean> = {};

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2,
    private el: ElementRef) { }

  ngOnInit(): void {
    Replace(this.el);
    this.linkType = this.isDisabled() ? 'disabled' : this.isExternalLink() ? 'external' : '';
    this.linkClasses = this.buildLinkClasses();
  }

  private buildLinkClasses(): Record<string, boolean> {
    const disabled = this.isDisabled();
    const classes: Record<string, boolean> = {
      'nav-link': true,
      'disabled': disabled,
      'btn-link': disabled,
    };
    if (this.hasVariant()) {
      classes[`nav-link-${this.link.variant}`] = true;
    }
    return classes;
  }

  // Template-facing accessors (values computed once in ngOnInit)
  public getClasses(): Record<string, boolean> { return this.linkClasses; }
  public getLinkType(): string { return this.linkType; }

  public hasVariant(): boolean { return !!this.link.variant; }
  public isBranched(): boolean { return this.link.variant === 'branched'; }
  public isBadge(): boolean { return !!this.link.badge; }
  public isBetaItem(): boolean { return !!(this.link.attributes as Record<string, any>)?.isBeta; }
  public isDisabled(): boolean { return !!(this.link.attributes as Record<string, any>)?.disabled; }
  public isExternalLink(): boolean { return this.link.url?.startsWith('http') ?? false; }
  public isIcon(): boolean { return !!this.link.icon; }

  public hideMobile(): void {
    if (this.document.body.classList.contains('sidebar-show')) {
      this.renderer.removeClass(this.document.body, 'sidebar-show');
    }
  }
}
