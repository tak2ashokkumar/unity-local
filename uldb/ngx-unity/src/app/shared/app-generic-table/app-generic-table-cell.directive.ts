import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ctCellFor]'
})
export class CtCellTemplateDirective {
  @Input('ctCellFor') columnKey!: string;
  constructor(public templateRef: TemplateRef<any>) { }
}