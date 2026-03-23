import { Directive, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[widgetLazyLoader]'
})
export class WidgetLazyLoaderDirective implements OnInit {

  @Input('widgetLazyLoader') input?: { ttw: number, option: IntersectionObserverInit };

  @Output() lazyLoad = new EventEmitter<string>();
  constructor(private el: ElementRef) { }

  ngOnInit() {
    let option = null;
    let ttw = null;
    if (this.input) {
      if (this.input.ttw) {
        ttw = this.input.ttw;
      }
      if (this.input.option) {
        option = this.input.option;;
      }
    } else {
      ttw = 1;
      option = { rootMargin: '-55px 0px 100px 0px' }
    }
    let observer = new IntersectionObserver((e: IntersectionObserverEntry[]) => {
      if (e[0].isIntersecting) {
        this.lazyLoad.emit(null);
        observer.disconnect();
      }
    }, option);
    setTimeout(() => {
      observer.observe(this.el.nativeElement);
    }, ttw);
  }

}
