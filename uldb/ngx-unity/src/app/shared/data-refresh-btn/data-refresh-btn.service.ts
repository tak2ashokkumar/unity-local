import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshBtnService {
  private refreshAnnouncedSource = new Subject<number>();
  refreshAnnounced$ = this.refreshAnnouncedSource.asObservable();
  private progressCount: number = 0;
  private inProgressSource = new Subject<boolean>();
  inProgressToggled$: Observable<boolean> = this.inProgressSource.asObservable();

  refreshData(pageNo: number) {
    this.refreshAnnouncedSource.next(pageNo);
  }

  start() {
    this.progressCount++;
    this.inProgressSource.next(true);
  }

  stop() {
    if (this.progressCount > 0) {
      this.progressCount--;
      this.inProgressSource.next(false);
    }
  }
}
