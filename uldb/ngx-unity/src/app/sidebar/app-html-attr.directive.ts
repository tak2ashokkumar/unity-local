import { Directive, ElementRef, Inject, Input, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appHtmlAttr]'
})
export class AppHtmlAttrDirective {

  @Input() appHtmlAttr: { [key: string]: string };

  constructor(
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit() {
    const attribs = this.appHtmlAttr;
    for (const attr in attribs) {
      if (attr === 'style' && typeof (attribs[attr]) === 'object') {
        this.setStyle(attribs[attr]);
      } else if (attr === 'class') {
        this.addClass(attribs[attr]);
      } else {
        this.setAttrib(attr, attribs[attr]);
      }
    }
  }

  private setStyle(styles) {
    for (const style in styles) {
      this.renderer.setStyle(this.el.nativeElement, style, styles[style]);
    }
  }

  private addClass(classes) {
    const classArray = (Array.isArray(classes) ? classes : classes.split(' '));
    classArray.filter((element) => element.length > 0).forEach(element => {
      this.renderer.addClass(this.el.nativeElement, element);
    });
  }

  private setAttrib(key, value) {
    this.renderer.setAttribute(this.el.nativeElement, key, value);
  }

}
