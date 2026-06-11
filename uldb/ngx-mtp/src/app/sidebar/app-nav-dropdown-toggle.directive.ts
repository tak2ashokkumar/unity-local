import { Directive, HostListener } from '@angular/core';

import { AppNavDropdownDirective } from './app-nav-dropdown.directive';
@Directive({
  selector: '[appNavDropdownToggle]'
})
export class AppNavDropdownToggleDirective {

  constructor(private dropdown: AppNavDropdownDirective) { }

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    this.dropdown.toggle();
  }
}
