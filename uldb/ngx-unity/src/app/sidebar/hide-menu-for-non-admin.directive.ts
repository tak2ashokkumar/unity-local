import { Directive, ElementRef, OnInit, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[hideMenuForNonAdmin]'
})
export class HideMenuForNonAdminDirective implements OnInit {

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) {
  }

  hide: boolean;

  @Input() set hideMenuForNonAdmin(attribute: object) {
    if (attribute && attribute['hide']) {
      this.hide = attribute['hide'];
    }
  }

  ngOnInit() {
    if (this.hide) {
      this.renderer.setStyle(this.eleRef.nativeElement, 'display', 'none');
    }
  }

}