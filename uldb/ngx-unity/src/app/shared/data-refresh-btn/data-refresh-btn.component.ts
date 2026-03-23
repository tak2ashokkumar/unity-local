import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FloatingTerminalService } from '../floating-terminal/floating-terminal.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataRefreshBtnService } from './data-refresh-btn.service';

@Component({
  selector: 'data-refresh-btn',
  templateUrl: './data-refresh-btn.component.html',
  styleUrls: ['./data-refresh-btn.component.scss']
})
export class DataRefreshBtnComponent implements OnDestroy {
  @Input() page?: number;
  @Output() refresh = new EventEmitter<number>();
  private ngUnsubscribe = new Subject();
  termOpened: boolean;
  inProgress: boolean = false;
  constructor(private termService: FloatingTerminalService,
    private refreshService: DataRefreshBtnService) {
    this.termService.isOpenAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => this.termOpened = res);
    this.refreshService.inProgressToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => this.inProgress = res);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.refresh.emit(this.page);
    this.refreshService.refreshData(this.page);
  }

}
