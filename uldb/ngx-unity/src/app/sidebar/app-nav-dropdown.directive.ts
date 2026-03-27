import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appNavDropdown]'
})
export class AppNavDropdownDirective {

  isOpen = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.renderer.addClass(this.el.nativeElement, 'open');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'open');
    }
  }
}
