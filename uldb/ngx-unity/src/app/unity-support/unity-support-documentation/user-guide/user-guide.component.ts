import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppMainService } from 'src/app/app-main/app-main.service';

@Component({
  selector: 'user-guide',
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss']
})
export class UserGuideComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  chatbotWidth: number = 0;
  minWidth: string = '';
  mainElement: HTMLElement | null = null;

  constructor(private appMainSvc: AppMainService,
    @Inject(DOCUMENT) private readonly doc: Document,
    private renderer: Renderer2) {
    this.appMainSvc.sidebarAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(chatbotWidth => {
      this.chatbotWidth = chatbotWidth;
      this.minWidth = `calc(100vw - ${this.chatbotWidth == 0 ? 250 : 495}px)`;
      this.mainElement = this.doc.querySelector('main.main');
      if (this.mainElement) {
        this.renderer.addClass(this.mainElement, 'no-main-content-scroll');
      }
    });
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'no-scroll');
    if (this.mainElement) {
      this.renderer.removeClass(this.mainElement, 'no-main-content-scroll');
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
