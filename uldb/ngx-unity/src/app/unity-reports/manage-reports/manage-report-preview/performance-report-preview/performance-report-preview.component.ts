import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PerformanceReportPreviewService, PreformanceReportResultViewData } from './performance-report-preview.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'performance-report-preview',
  templateUrl: './performance-report-preview.component.html',
  styleUrls: ['./performance-report-preview.component.scss'],
  providers: [PerformanceReportPreviewService]
})
export class PerformanceReportPreviewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  reportId: string = null;
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: PreformanceReportResultViewData[] = [];
  constructor(private svc: PerformanceReportPreviewService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.reportId = params.get('reportId');
    });
    this.currentCriteria = { pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getReports();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getReports();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getReports();
  }

  getReports() {
    this.svc.getReportData(this.reportId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
    });
  }

}
