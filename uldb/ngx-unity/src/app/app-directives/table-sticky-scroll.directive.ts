import { AfterContentInit, AfterViewInit, Directive, ElementRef, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { from, fromEvent, interval, of, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';

@Directive({
  selector: '[tableStickyScroll]'
})
export class TableStickyScrollDirective implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  private listener: () => void;
  private resizeObserver: ResizeObserver;
  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) { }
  scrollbar: HTMLElement;
  pseudo: HTMLElement;
  ngOnInit() {
    this.scrollbar = this.renderer.createElement('div');
    this.pseudo = this.renderer.createElement('div');

    let observer = new MutationObserver((mutations, observer) => {
      observer.disconnect();
      this.doubleScroll(this.eleRef.nativeElement);
    });
    observer.observe(this.eleRef.nativeElement.getElementsByTagName('tbody').item(0), {
      childList: true
    });
    this.resizeObserver = new ResizeObserver(entries => {
      if (entries.length < (<HTMLCollection>this.eleRef.nativeElement.getElementsByTagName('th')).length) {
        from(entries).pipe(debounce(() => interval(5000))).subscribe(() => {
          this.doubleScroll(this.eleRef.nativeElement);
        });
      }
    });
    const someEl = <HTMLCollection>this.eleRef.nativeElement.getElementsByTagName('th');
    for (let index = 0; index < someEl.length; index++) {
      const element = someEl.item(index);
      this.resizeObserver.observe(element);
    }
  }

  ngOnDestroy() {
    if (this.listener) {
      this.listener();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  ngAfterContentInit(): void {

  }

  ngAfterViewInit(): void {

  }

  doubleScroll(element: HTMLElement) {
    if (this.listener) {
      this.listener();
    }
    this.renderer.setStyle(this.scrollbar, 'overflow', 'auto');
    this.renderer.setStyle(this.scrollbar, 'overflowY', 'hidden');
    this.renderer.setStyle(this.scrollbar, 'position', 'fixed');
    this.renderer.setStyle(this.scrollbar, 'bottom', '0');
    this.renderer.setStyle(this.scrollbar, 'zIndex', '2');
    this.renderer.setStyle(this.scrollbar, 'width', `${element.offsetWidth}px`);

    this.renderer.setStyle(this.pseudo, 'width', `${element.firstElementChild.scrollWidth}px`);
    this.renderer.setStyle(this.pseudo, 'visibility', 'hidden');

    this.renderer.appendChild(this.pseudo, this.renderer.createText('\xA0'));
    this.renderer.appendChild(this.scrollbar, this.pseudo);

    this.listener = this.renderer.listen(this.scrollbar, 'scroll', (e) => {
      element.scrollLeft = this.scrollbar.scrollLeft;
    });

    this.renderer.setStyle(element, 'overflow', 'hidden');
    this.renderer.setStyle(element, 'overflowY', 'auto');
    this.renderer.insertBefore(this.renderer.parentNode(element), this.scrollbar, element);
  }

  @HostListener('window:resize')
  resized() {
    if (!this.resizeObserver) {
      return;
    }
    this.listener();
    this.doubleScroll(this.eleRef.nativeElement);
  }

}
