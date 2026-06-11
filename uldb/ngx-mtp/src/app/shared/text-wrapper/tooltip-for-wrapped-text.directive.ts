import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tooltipForWrappedText]'
})
export class TooltipForWrappedTextDirective implements OnInit {

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) { }

  ngOnInit() {
    // console.log((<HTMLElement>this.eleRef.nativeElement).attributes)
    let ele = <HTMLElement>this.renderer.createElement(`${(<HTMLElement>this.eleRef.nativeElement).tagName.toLowerCase()}`);
    let attributes = (<HTMLElement>this.eleRef.nativeElement).attributes;
    for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].name != 'tooltipforwrappedtext') {
        ele.setAttribute(attributes[i].name, attributes[i].nodeValue);
      }
    }
    ele.innerHTML = (<HTMLElement>this.eleRef.nativeElement).innerHTML;
    ele.setAttribute('tooltip', (<HTMLElement>this.eleRef.nativeElement).innerHTML);
    // let ele = (<HTMLElement>this.eleRef.nativeElement).attributes;
    // ele.setAttribute('id', 'some_id')
    // this.renderer.setStyle(ele, 'overflow', 'auto');
    // this.renderer.setStyle(ele, 'visibility', 'hidden');
    this.renderer.appendChild(this.eleRef.nativeElement.parentNode, ele);
    // this.renderer.setStyle(this.eleRef.nativeElement, 'display', 'none');
  }
  // var $element = $('#element-to-test');
  // var $c = $element
  //            .clone()
  //            .css({display: 'inline', width: 'auto', visibility: 'hidden'})
  //            .appendTo('body');

  // if( $c.width() > $element.width() ) {
  //     // text was truncated. 
  //     // do what you need to do
  // }

  // $c.remove();
}
