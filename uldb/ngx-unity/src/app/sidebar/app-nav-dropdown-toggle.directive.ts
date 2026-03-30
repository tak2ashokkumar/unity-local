import { Directive, HostBinding, HostListener } from '@angular/core';

import { AppNavDropdownDirective } from './app-nav-dropdown.directive';
@Directive({
  selector: '[appNavDropdownToggle]'
})
export class AppNavDropdownToggleDirective {

  constructor(private dropdown: AppNavDropdownDirective) { }

  @HostBinding('attr.aria-expanded')
  get ariaExpanded(): boolean {
    return this.dropdown.isOpen;
  }

  @HostListener('click', ['$event'])
  toggleOpen($event: Event): void {
    $event.preventDefault();
    this.dropdown.toggle();
  }
}
