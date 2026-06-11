import { Directive, ElementRef, HostListener, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';


/**
* Allows the off-canvas sidebar to be closed via click.
*/
@Directive({
  selector: '[appSidebarClose]'
})
export class SidebarOffCanvasCloseDirective {
  constructor(
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
  ) { }

  // Check if element has class
  private hasClass(target: any, elementClassName: string) {
    return new RegExp('(\\s|^)' + elementClassName + '(\\s|$)').test(target.className);
  }

  // Toggle element class
  private toggleClass(elem: any, elementClassName: string) {
    let newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
    if (this.hasClass(elem, elementClassName)) {
      while (newClass.indexOf(' ' + elementClassName + ' ') >= 0) {
        newClass = newClass.replace(' ' + elementClassName + ' ', ' ');
      }
      elem.className = newClass.replace(/^\s+|\s+$/g, '');
    } else {
      elem.className += ' ' + elementClassName;
    }
  }

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();

    const body = this.document.body;
    if (this.hasClass(body, 'sidebar-off-canvas')) {
      body.classList.contains('sidebar-show') ?
        this.renderer.removeClass(body, 'sidebar-show') :
        this.renderer.addClass(body, 'sidebar-show');
      // this.toggleClass(document.body, 'sidebar-opened');
    }
  }
}

@Directive({
  selector: '[appBrandMinimizer]'
})
export class BrandMinimizeDirective {
  constructor(
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
  ) { }

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    const body = this.document.body;
    body.classList.contains('brand-minimized') ?
      this.renderer.removeClass(body, 'brand-minimized') :
      this.renderer.addClass(body, 'brand-minimized');
    // document.body.classList.toggle('brand-minimized');
  }
}