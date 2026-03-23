import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ExcelOnBoardingNextPrevService {
  private nextOrPrev: 'next' | 'prev' = null;
  private excelSaveCurrentAnnouncedSource = new Subject<string>();
  excelSaveCurrentAnnounced$ = this.excelSaveCurrentAnnouncedSource.asObservable();

  private excelGotoNextPrevAnnouncedSource = new Subject<string>();
  excelGotoNextPrevAnnounced$ = this.excelGotoNextPrevAnnouncedSource.asObservable();

  constructor() { }

  saveNextPrev(nextOrPrev: 'next' | 'prev') {
    this.nextOrPrev = nextOrPrev;
    this.excelSaveCurrentAnnouncedSource.next();
  }

  continueNextPrev() {
    this.excelGotoNextPrevAnnouncedSource.next(this.nextOrPrev);
  }
}