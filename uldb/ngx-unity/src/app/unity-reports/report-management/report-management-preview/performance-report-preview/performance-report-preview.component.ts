import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  PAGE_SIZES,
  SearchCriteria,
} from 'src/app/shared/table-functionality/search-criteria';
import {
  PreformanceReportResultViewData,
  ReportManagementPerformanceReportPreviewService,
} from './performance-report-preview.service';

/**
 * Coordinates the Report Management Performance Report Preview screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-performance-report-preview',
  templateUrl: './performance-report-preview.component.html',
  styleUrls: ['./performance-report-preview.component.scss'],
  providers: [ReportManagementPerformanceReportPreviewService],
})
export class ReportManagementPerformanceReportPreviewComponent
  implements OnInit, OnDestroy
{
  private ngUnsubscribe = new Subject();
  /**
   * Stores the active report identifier from the current route or row action.
   */
  reportId: string = null;
  /**
   * Stores the active table search, sort, and paging criteria.
   */
  currentCriteria: SearchCriteria;

  /**
   * Stores the total result count for the active table query.
   */
  count: number = 0;
  /**
   * Stores the table-ready rows rendered by the template.
   */
  viewData: PreformanceReportResultViewData[] = [];
  constructor(
    private svc: ReportManagementPerformanceReportPreviewService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.reportId = params.get('reportId');
    });
    this.currentCriteria = {
      pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
    };
  }

  /**
   * Initializes Report Management Performance Report Preview Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.spinner.start('main');
    // Performance preview has a dedicated result model with device/metric data.
    this.getReports();
  }

  /**
   * Releases Report Management Performance Report Preview Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Executes the page change workflow for Report Management Performance Report Preview Component.
   *
   * @param pageNo - Page No value used by this method.
   * @returns Nothing.
   */
  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getReports();
  }

  /**
   * Executes the page size change workflow for Report Management Performance Report Preview Component.
   *
   * @param pageSize - Page Size value used by this method.
   * @returns Nothing.
   */
  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getReports();
  }

  /**
   * Loads or returns reports for the current workflow.
   *
   * @returns Nothing.
   */
  getReports() {
    this.svc
      .getReportData(this.reportId, this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.count = res.count;
          this.viewData = this.svc.convertToViewData(res.results);
          this.spinner.stop('main');
        },
        () => {
          this.spinner.stop('main');
          this.notification.error(
            new Notification('Error while fetching report!! Please try again.')
          );
        }
      );
  }
}
