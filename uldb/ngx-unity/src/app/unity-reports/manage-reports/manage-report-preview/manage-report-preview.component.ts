import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ManageReportPreviewService } from './manage-report-preview.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'manage-report-preview',
  templateUrl: './manage-report-preview.component.html',
  styleUrls: ['./manage-report-preview.component.scss'],
  providers: [ManageReportPreviewService]
})
export class ManageReportPreviewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  reportId: string = null;
  feature: string;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private reportPrvSvc: ManageReportPreviewService,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.reportId = params.get('reportId');
      this.feature = params.get('feature');
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  downloadFile() {
    this.spinner.start('main');
    this.reportPrvSvc.download(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', `customer/reports/get_report/?file_name=${res.data}`);
      ele.click();
      this.spinner.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
}