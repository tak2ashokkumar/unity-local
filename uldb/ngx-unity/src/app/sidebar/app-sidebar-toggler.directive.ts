import { Directive, ElementRef, HostListener, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';


import { ClassToggler } from 'src/app/sidebar/toggle-classes';

export const sidebarCssClasses: Array<string> = [
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
  public bp: string;
  constructor(private classToggler: ClassToggler) { }
  ngOnInit(): void {
    this.bp = this.breakpoint;
  }
  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
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
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
  ) { }

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    const body = this.document.body;
    body.classList.contains('sidebar-minimized') ?
      this.renderer.removeClass(body, 'sidebar-minimized') :
      this.renderer.addClass(body, 'sidebar-minimized');
    // document.body.classList.toggle('sidebar-minimized');
  }
}

@Directive({
  selector: '[appMobileSidebarToggler]'
})
export class MobileSidebarToggleDirective {
  constructor(
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
  ) { }

  // Check if element has class
  private hasClass(target: any, elementClassName: string) {
    return new RegExp('(\\s|^)' + elementClassName + '(\\s|$)').test(target.className);
  }

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    const body = this.document.body;
    body.classList.contains('sidebar-show') ?
      this.renderer.removeClass(body, 'sidebar-show') :
      this.renderer.addClass(body, 'sidebar-show');
    // document.body.classList.toggle('sidebar-show');
  }
}
