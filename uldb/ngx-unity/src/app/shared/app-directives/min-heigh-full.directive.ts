import { Directive, ElementRef, HostListener, Input, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Directive({
  selector: '[minHeighFull]'
})
export class MinHeighFullDirective {
  @Input() ignore: number = 0;

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.setHeight();
    }, 0);
  }

  @HostListener('window:resize')
  setHeight() {
    let remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);

    const height = Math.floor(window.innerHeight) - Math.floor(this.eleRef.nativeElement.getBoundingClientRect().top) - (Math.floor(remInPx) * this.ignore);
    this.renderer.setStyle(this.eleRef.nativeElement, 'height', height + 'px');
  }

}
