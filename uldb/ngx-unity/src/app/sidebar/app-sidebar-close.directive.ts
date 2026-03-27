import { Directive, HostListener, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Allows the off-canvas sidebar to be closed via click.
 */
@Directive({
  selector: '[appSidebarClose]'
})
export class SidebarOffCanvasCloseDirective {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2,
  ) { }

  @HostListener('click', ['$event'])
  toggleOpen($event: Event): void {
    $event.preventDefault();
    const body = this.document.body;
    if (body.classList.contains('sidebar-off-canvas')) {
      body.classList.contains('sidebar-show')
        ? this.renderer.removeClass(body, 'sidebar-show')
        : this.renderer.addClass(body, 'sidebar-show');
    }
  }
}

@Directive({
  selector: '[appBrandMinimizer]'
})
export class BrandMinimizeDirective {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2,
  ) { }

  @HostListener('click', ['$event'])
  toggleOpen($event: Event): void {
    $event.preventDefault();
    const body = this.document.body;
    body.classList.contains('brand-minimized')
      ? this.renderer.removeClass(body, 'brand-minimized')
      : this.renderer.addClass(body, 'brand-minimized');
  }
}
