import { Component, Input, Inject, HostBinding, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export const sidebarCssClasses: Array<string> = [
  'sidebar-show',
  'sidebar-sm-show',
  'sidebar-md-show',
  'sidebar-lg-show',
  'sidebar-xl-show'
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit, OnDestroy {
  @Input() compact: boolean;
  @Input() display: any;
  @Input() fixed: boolean;
  @Input() minimized: boolean;
  @Input() offCanvas: boolean;

  @HostBinding('class.sidebar') sidebarClass = true;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    this.displayBreakpoint(this.display);
    this.isCompact(this.compact);
    this.isFixed(this.fixed);
    this.isMinimized(this.minimized);
    this.isOffCanvas(this.offCanvas);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'sidebar-fixed');
  }

  isCompact(compact: boolean = this.compact): void {
    if (compact) {
      this.renderer.addClass(this.document.body, 'sidebar-compact');
    }
  }

  isFixed(fixed: boolean = this.fixed): void {
    if (fixed) {
      this.renderer.addClass(this.document.body, 'sidebar-fixed');
    }
  }

  isMinimized(minimized: boolean = this.minimized): void {
    if (minimized) {
      this.renderer.addClass(this.document.body, 'sidebar-minimized');
    }
  }

  isOffCanvas(offCanvas: boolean = this.offCanvas): void {
    if (offCanvas) {
      this.renderer.addClass(this.document.body, 'sidebar-off-canvas');
    }
  }

  displayBreakpoint(display: any = this.display): void {
    if (display !== false) {
      const cssClass = display ? `sidebar-${display}-show` : sidebarCssClasses[0];
      this.renderer.addClass(this.document.body, cssClass);
    }
  }
}
