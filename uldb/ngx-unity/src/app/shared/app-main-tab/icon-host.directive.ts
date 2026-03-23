import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[icon-host]',
})
export class IconDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}