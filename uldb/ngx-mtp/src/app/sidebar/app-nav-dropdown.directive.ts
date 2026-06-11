import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNavDropdown]'
})
export class AppNavDropdownDirective {

  constructor(private el: ElementRef) { }

  toggle() {
    this.el.nativeElement.classList.toggle('open');
  }

}
