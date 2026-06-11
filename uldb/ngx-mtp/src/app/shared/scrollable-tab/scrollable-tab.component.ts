import { Component, OnInit, AfterViewInit, ElementRef, ChangeDetectorRef, ContentChild, Renderer2, OnDestroy, Input } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Logger } from 'src/app/shared/app-logger.service';

@Component({
  selector: 'scrollable-tab',
  templateUrl: './scrollable-tab.component.html',
  styleUrls: ['./scrollable-tab.component.scss']
})
export class ScrollableTabComponent implements OnInit, AfterViewInit, OnDestroy {
  private scrollWidth: number = 0;
  private clientWidth: number = 0;
  private arrowWidth: number = 0;
  private scrollLeftPos: number = 0;
  private exagerratedScrollDist: number = 10;
  private tabStatus: TabStatus[] = [];
  private activeIndex: number = 0;
  private subscriptions: Subscription = new Subscription();
  @Input() selector: string;
  @ContentChild('tabContent', { read: ElementRef }) public tabContent: ElementRef<any>;
  @ContentChild('scrollLeft', { read: ElementRef }) public scrollLeftArrow: ElementRef<any>;
  @ContentChild('scrollRight', { read: ElementRef }) public scrollRightArrow: ElementRef<any>;

  constructor(private cdRef: ChangeDetectorRef,
    private renderer: Renderer2, private logger: Logger) { }

  ngOnInit() {
    this.subscriptions.add(fromEvent(window, 'resize').pipe(debounceTime(100)).subscribe(evt => {
      this.ngAfterViewInit();
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    let ele = this.tabContent.nativeElement;
    if (ele.scrollWidth != this.scrollWidth) {
      this.scrollWidth = ele.scrollWidth;
      this.cdRef.detectChanges();
    }
    if (ele.offsetWidth != this.clientWidth) {
      this.clientWidth = ele.offsetWidth;
      this.cdRef.detectChanges();
    }
    this.resetOnReload();
    this.getActiveTabIndex();
    this.subscribeToTabClick();
    this.subscribeToArrowClick();
    this.updateTabStatus();
    this.scrollToActiveTab();
  }

  /**
   * This is to fix issue in "FIREFOX!!!!??" 
   */
  resetOnReload() {
    if (this.isOverFlowing()) {
      this.tabContent.nativeElement.scrollTo({ left: (0) });
    }
  }

  getActiveTabIndex() {
    Array.prototype.slice.call(this.tabContent.nativeElement.children).forEach((e: any, index: number) => {
      if ((e as HTMLElement).classList.contains(this.selector) || (e as HTMLElement).querySelector('.' + this.selector) != null) {
        this.activeIndex = index;
      }
    });
  }

  scrollToActiveTab() {
    if (this.tabStatus.length && !this.tabStatus[this.activeIndex].inRange) {
      for (let i = 0; i <= this.activeIndex; i++) {
        this.tabContent.nativeElement.scrollTo({ left: (this.tabContent.nativeElement.scrollLeft + this.tabStatus[i].width + this.exagerratedScrollDist) });
        this.updateTabStatus();
        if (this.tabStatus[i].inRange) {
          break;
        }
      }
    }
  }

  subscribeToTabClick() {
    Array.prototype.slice.call(this.tabContent.nativeElement.children).forEach((e: any, index: number) => {
      this.subscriptions.add(fromEvent((e as HTMLElement), 'click').subscribe((event: Event) => {
        if (this.activeIndex != index) {
          if (this.tabStatus[index].inRange) {
            this.activeIndex = index;
          } else {
            if (((index + 1) <= this.tabStatus.length - 1) && this.tabStatus[index + 1].inRange) {
              this.scrollLeft();
            } else if ((index - 1 >= 0) && this.tabStatus[index - 1].inRange) {
              this.scrollRight();
            }
            this.activeIndex = index;
          }
        }
      }));
    });
  }

  subscribeToArrowClick() {
    if (this.isOverFlowing()) {
      this.renderer.removeClass(this.scrollLeftArrow.nativeElement, 'overflow-arrow-hide');
      this.renderer.removeClass(this.scrollRightArrow.nativeElement, 'overflow-arrow-hide');
      this.subscriptions.add(fromEvent(this.scrollLeftArrow.nativeElement, 'click').subscribe((event) => this.scrollLeft()));
      this.subscriptions.add(fromEvent(this.scrollRightArrow.nativeElement, 'click').subscribe(event => this.scrollRight()));
    } else {
      this.renderer.addClass(this.scrollLeftArrow.nativeElement, 'overflow-arrow-hide');
      this.renderer.addClass(this.scrollRightArrow.nativeElement, 'overflow-arrow-hide');
    }
  }

  isOverFlowing(): boolean {
    return this.scrollWidth > this.clientWidth ? true : false;
  }

  getFirstToFocusWidth(): number {
    for (let i = 0; i < this.tabStatus.length; i++) {
      if (this.tabStatus[i].inRange && (i - 1) >= 0) {
        return this.tabStatus[i - 1].width;
      }
    }
    return 0;
  }

  getLastToFocusWidth(): number {
    for (let i = this.tabStatus.length - 1; i >= 0; i--) {
      if (this.tabStatus[i].inRange && (i + 1) <= this.tabStatus.length - 1) {
        return this.tabStatus[i + 1].width;
      }
    }
    return 0;
  }

  public scrollRight(): void {
    let w: number = this.getLastToFocusWidth();
    this.tabContent.nativeElement.scrollTo({ left: (this.tabContent.nativeElement.scrollLeft + w + this.exagerratedScrollDist) });
    this.updateTabStatus();
  }

  public scrollLeft(): void {
    let w: number = this.getFirstToFocusWidth();
    this.tabContent.nativeElement.scrollTo({ left: (this.tabContent.nativeElement.scrollLeft - w + this.exagerratedScrollDist) });
    this.updateTabStatus();
  }

  updateTabStatus() {
    this.tabStatus = [];
    this.clientWidth = this.tabContent.nativeElement.offsetWidth;
    this.arrowWidth = this.tabContent.nativeElement.previousElementSibling.offsetWidth;
    this.scrollLeftPos = this.tabContent.nativeElement.scrollLeft;
    let children: any[] = this.tabContent.nativeElement.childNodes;
    for (let index = 0; index < children.length; index++) {
      const element = children[index];
      /**
       * Check if it is comment type and ignore
       */
      if (element.nodeType != 8) {
        let ts: TabStatus = new TabStatus();
        ts.leftOffset = element.offsetLeft;
        ts.width = element.offsetWidth;
        ts.rightOffset = element.offsetLeft + element.offsetWidth;
        let leftPos = ts.leftOffset - this.arrowWidth - this.scrollLeftPos;
        let rightPos = ts.rightOffset - this.arrowWidth - this.scrollLeftPos;
        ts.inRange = leftPos >= 0 && rightPos <= this.clientWidth;
        this.tabStatus.push(ts);
      }
    }
  }

}
export class TabStatus {
  leftOffset: number;
  rightOffset: number;
  width: number;
  inRange: boolean;
}