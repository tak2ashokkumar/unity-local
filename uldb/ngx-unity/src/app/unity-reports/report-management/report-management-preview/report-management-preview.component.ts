import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ReportManagementPreviewService } from './report-management-preview.service';

/**
 * Coordinates the Report Management Preview screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-preview',
  templateUrl: './report-management-preview.component.html',
  styleUrls: ['./report-management-preview.component.scss'],
  providers: [ReportManagementPreviewService],
})
export class ReportManagementPreviewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  reportId: string = null;
  feature: string;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private reportPrvSvc: ReportManagementPreviewService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.reportId = params.get('reportId');
      this.feature = params.get('feature');
    });
  }

  /**
   * Initializes Report Management Preview Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void { }

  /**
   * Releases Report Management Preview Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Executes the download file workflow for Report Management Preview Component.
   *
   * @returns Nothing.
   */
  downloadFile() {
    this.spinner.start('main');
    this.reportPrvSvc.download(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      // Backend returns only a file name; the hidden downloader link performs the actual browser download.
      const ele = document.getElementById('file-downloader');
      if (!ele) {
        this.spinner.stop('main');
        this.notification.error(
          new Notification('Failed to download report. Try again later.')
        );
        return;
      }
      ele.setAttribute('href', `customer/reports/get_report/?file_name=${res.data}`);
      ele.click();
      this.spinner.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.')
      );
    }, () => {
      this.spinner.stop('main');
      this.notification.error(
        new Notification('Failed to download report. Try again later.')
      );
    }
    );
  }

  /**
   * Executes the go back workflow for Report Management Preview Component.
   *
   * @returns Nothing.
   */
  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
}
