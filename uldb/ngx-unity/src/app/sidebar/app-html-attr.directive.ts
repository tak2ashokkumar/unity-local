import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHtmlAttr]'
})
export class AppHtmlAttrDirective implements OnInit {

  @Input() appHtmlAttr: { [key: string]: any };

  constructor(private renderer: Renderer2,
    private el: ElementRef) { }

  ngOnInit(): void {
    const attribs = this.appHtmlAttr;
    if (!attribs) { return; }
    Object.keys(attribs).forEach(attr => {
      if (attr === 'style' && typeof attribs[attr] === 'object') {
        this.setStyle(attribs[attr]);
      } else if (attr === 'class') {
        this.addClass(attribs[attr]);
      } else {
        this.setAttrib(attr, attribs[attr]);
      }
    });
  }

  private setStyle(styles: { [key: string]: string }): void {
    Object.keys(styles).forEach(style => {
      this.renderer.setStyle(this.el.nativeElement, style, styles[style]);
    });
  }

  private addClass(classes: string | string[]): void {
    const classArray = Array.isArray(classes) ? classes : classes.split(' ');
    classArray.filter(c => c.length > 0).forEach(c => {
      this.renderer.addClass(this.el.nativeElement, c);
    });
  }

  private setAttrib(key: string, value: string): void {
    this.renderer.setAttribute(this.el.nativeElement, key, value);
  }

}
