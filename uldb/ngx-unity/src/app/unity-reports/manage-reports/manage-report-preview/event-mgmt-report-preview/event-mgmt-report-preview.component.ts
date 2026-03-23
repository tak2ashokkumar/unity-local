import { Component, Input, OnInit } from '@angular/core';
import { EventMgmtReportPreviewService, ManageReportAlertsViewdata, ManageReportCorelationViewdata, ManageReportEventsViewData, ManageReportSuppressionViewdata } from './event-mgmt-report-preview.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ManageReportAlertsDataType, ManageReportCorelationDataType, ManageReportEventsDataType, ManageReportSuppressionDataType } from './event-mgmt-report-preview.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'event-mgmt-report-preview',
  templateUrl: './event-mgmt-report-preview.component.html',
  styleUrls: ['./event-mgmt-report-preview.component.scss'],
  providers: [EventMgmtReportPreviewService]
})
export class EventMgmtReportPreviewComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @Input('reportId') reportId: string = null;
  eventViewData: ManageReportEventsViewData[] = [];
  alertViewData: ManageReportAlertsViewdata[] = [];
  suppressionViewData: ManageReportSuppressionViewdata[] = [];
  corelationViewData: ManageReportCorelationViewdata[] = [];
  resultType: string;
  currentCriteria: SearchCriteria;
  count: number;
  constructor(private eventSvc: EventMgmtReportPreviewService,
    private spinner: AppSpinnerService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getReportById();
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

  getReportById() {
    this.spinner.start('main');
    this.eventSvc.getReportById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resultType = res.report_meta.report_type;
      this.getReportPreviewById();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  getReportPreviewById() {
    this.eventSvc.getReportPreviewById(this.reportId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      switch (this.resultType) {
        case 'events':
          let eventResult = <ManageReportEventsDataType[]>res.results;
          this.eventViewData = this.eventSvc.convertEventDataToViewdata(eventResult);
          break;
        case 'alert':
          let alertResult = <ManageReportAlertsDataType[]>res.results;
          this.alertViewData = this.eventSvc.convertAlertDataToViewdata(alertResult);
          break;
        case 'suppression':
          let suppressionResult = <ManageReportSuppressionDataType[]>res.results;
          this.suppressionViewData = this.eventSvc.convertSuppressionDataToViewdata(suppressionResult);
          break;
        case 'correlation':
          let corealtionResult = <ManageReportCorelationDataType[]>res.results;
          this.corelationViewData = this.eventSvc.convertCorrelationDataToViewdata(corealtionResult);
          break;
      }
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report preview !! Please try again.'));
      this.spinner.stop('main');
    });
  }

}