import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmailHistoryViewData, UsiEventIngestionEmailHistoryService } from './usi-event-ingestion-email-history.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';

@Component({
  selector: 'usi-event-ingestion-email-history',
  templateUrl: './usi-event-ingestion-email-history.component.html',
  styleUrls: ['./usi-event-ingestion-email-history.component.scss'],
  providers: [UsiEventIngestionEmailHistoryService]
})
export class UsiEventIngestionEmailHistoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  instanceId: string;
  count: number = 0;
  viewData: EmailHistoryViewData[] = [];
  tooltipEmailBodyConvertedData: string;

  constructor(private svc: UsiEventIngestionEmailHistoryService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
    })
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'account_uuid': this.instanceId }], multiValueParam: { 'account_type': [], 'status': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getEmailHistory();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEmailHistory();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getEmailHistory();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEmailHistory();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.multiValueParam.account_type = [];
    this.currentCriteria.multiValueParam.status = [];
    this.getEmailHistory();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getEmailHistory();
  }

  getEmailHistory() {
    this.svc.getEmailHistory(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Email History. Try again later.'))
    })
  }

  onHover(tdRef: HTMLElement, tooltipDirRef: TooltipDirective, view: EmailHistoryViewData) {
    const isTooltipHidden = tdRef.classList.contains('custom-tooltip-hide');
    tooltipDirRef.isDisabled = isTooltipHidden;
    if (!isTooltipHidden) {
      tooltipDirRef.show();
    }
    this.tooltipEmailBodyConvertedData = view.emailBodyConverted;
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
