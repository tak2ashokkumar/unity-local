import { Directive, HostListener, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { ClassToggler } from 'src/app/sidebar/toggle-classes';

export const sidebarCssClasses: string[] = [
  'sidebar-show',
  'sidebar-sm-show',
  'sidebar-md-show',
  'sidebar-lg-show',
  'sidebar-xl-show'
];

/**
 * Allows the sidebar to be toggled via click.
 */
@Directive({
  selector: '[appSidebarToggler]',
  providers: [ClassToggler]
})
export class SidebarToggleDirective implements OnInit {
  @Input('appSidebarToggler') breakpoint: string;
  private bp: string;

  constructor(private classToggler: ClassToggler) { }

  ngOnInit(): void {
    this.bp = this.breakpoint;
  }

  @HostListener('click', ['$event'])
  toggleOpen($event: Event): void {
    $event.preventDefault();
    const cssClass = this.bp ? `sidebar-${this.bp}-show` : sidebarCssClasses[0];
    this.classToggler.toggleClasses(cssClass, sidebarCssClasses);
  }
}

@Directive({
  selector: '[appSidebarMinimizer]'
})
export class SidebarMinimizeDirective {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2,
  ) { }

  @HostListener('click', ['$event'])
  toggleOpen($event: Event): void {
    $event.preventDefault();
    const body = this.document.body;
    body.classList.contains('sidebar-minimized')
      ? this.renderer.removeClass(body, 'sidebar-minimized')
      : this.renderer.addClass(body, 'sidebar-minimized');
  }
}

@Directive({
  selector: '[appMobileSidebarToggler]'
})
export class MobileSidebarToggleDirective {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2,
  ) { }

  @HostListener('click', ['$event'])
  toggleOpen($event: Event): void {
    $event.preventDefault();
    const body = this.document.body;
    body.classList.contains('sidebar-show')
      ? this.renderer.removeClass(body, 'sidebar-show')
      : this.renderer.addClass(body, 'sidebar-show');
  }
}
