import { Component, Input, OnInit } from '@angular/core';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ItsmReportPreviewService, ManageReportItsmReportViewData } from './itsm-report-preview.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'itsm-report-preview',
  templateUrl: './itsm-report-preview.component.html',
  styleUrls: ['./itsm-report-preview.component.scss'],
  providers: [ItsmReportPreviewService]
})
export class ItsmReportPreviewComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @Input('reportId') reportId: string = null;
  viewData: ManageReportItsmReportViewData[] = [];
  currentCriteria: SearchCriteria;
  count: number;
  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService,
    private itsmSvc: ItsmReportPreviewService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getReportPreviewById();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getReportPreviewById();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getReportPreviewById();
  }

  getReportPreviewById() {
    this.itsmSvc.getReportPreviewById(this.reportId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.itsmSvc.convertToviewData(res.results);
      this.count = res.count;
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report preview!! Please try again.'));
      this.spinner.stop('main');
    });
  }
}