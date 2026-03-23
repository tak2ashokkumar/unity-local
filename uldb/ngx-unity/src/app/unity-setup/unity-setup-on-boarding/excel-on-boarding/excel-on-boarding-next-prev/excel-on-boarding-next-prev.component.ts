import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExcelOnBoardingService } from '../excel-on-boarding.service';
import { ExcelOnBoardingNextPrevService } from './excel-on-boarding-next-prev.service';

@Component({
  selector: 'excel-on-boarding-next-prev',
  templateUrl: './excel-on-boarding-next-prev.component.html',
  styleUrls: ['./excel-on-boarding-next-prev.component.scss']
})
export class ExcelOnBoardingNextPrevComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  next: string;
  prev: string;

  @Input('hide') hidden: boolean;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private onbSvc: ExcelOnBoardingService,
    private nxtPrvSvc: ExcelOnBoardingNextPrevService) {
    this.onbSvc.excelSetNextPrevAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.next = data.nextUrl;
      this.prev = data.prevUrl;
    });
    this.nxtPrvSvc.excelGotoNextPrevAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data == 'next') {
        this.goNext();
      } else {
        this.goPrev();
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  isNextDisabled() {
    return this.next == null || this.hidden;
  }

  isPrevDisabled() {
    return this.prev == null || this.hidden;
  }

  saveAndGoNext() {
    this.nxtPrvSvc.saveNextPrev('next');
  }

  saveAndGoPrev() {
    this.nxtPrvSvc.saveNextPrev('prev');
  }

  goNext() {
    if (this.next) {
      this.router.navigate(['..', this.next], { relativeTo: this.route });
    }
  }

  goPrev() {
    if (this.prev) {
      this.router.navigate(['..', this.prev], { relativeTo: this.route });
    }
  }
}
