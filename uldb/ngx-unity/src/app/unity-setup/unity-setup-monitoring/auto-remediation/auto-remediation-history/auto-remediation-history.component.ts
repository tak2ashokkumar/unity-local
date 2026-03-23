import { Component, OnDestroy, OnInit } from '@angular/core';
import { AutoRemediationHistoryService, AutoRemediationHistoryViewData } from './auto-remediation-history.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'auto-remediation-history',
  templateUrl: './auto-remediation-history.component.html',
  styleUrls: ['./auto-remediation-history.component.scss'],
  providers: [AutoRemediationHistoryService]
})
export class AutoRemediationHistoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  viewDataHistory: AutoRemediationHistoryViewData[] = [];
  autoRemId: string;

  constructor(private svc: AutoRemediationHistoryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.autoRemId = params.get('autoRemediationId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getAutoRemHistory();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getAutoRemHistory();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAutoRemHistory();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAutoRemHistory();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAutoRemHistory();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAutoRemHistory();
  }

  getAutoRemHistory() {
    this.svc.getAutoRemediationHistory(this.currentCriteria, this.autoRemId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewDataHistory = this.svc.convertToViewData(data.results);
      this.count = data.count;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Auto Remediation History'));
    });
  }

  disable(view: AutoRemediationHistoryViewData) {
    if (view.isStatusResolved || !view.isSourceUnity) {
      return;
    }
    this.spinner.start('main');
    this.svc.disable(view.eventUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getAutoRemHistory();
      this.notification.success(new Notification('Disabled Trigger successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Disable Trigger. Please try again.'));
    });
  }

  resolve(view: AutoRemediationHistoryViewData) {
    if (view.isStatusResolved) {
      return;
    }
    this.spinner.start('main');
    this.svc.resolve(view.eventUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getAutoRemHistory();
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve event. Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
