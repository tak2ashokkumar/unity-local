import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardActivityLogViewData, MtpDashboardActivityService } from './mtp-dashboard-activity.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mtp-dashboard-activity',
  templateUrl: './mtp-dashboard-activity.component.html',
  styleUrls: ['./mtp-dashboard-activity.component.scss'],
  providers: [MtpDashboardActivityService]
})
export class MtpDashboardActivityComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: DashboardActivityLogViewData[] = [];
  constructor(private svc: MtpDashboardActivityService,
    private notification: AppNotificationService,
    private router: Router,
    private spinner: AppSpinnerService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.getActivityLogs();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('dashboard-logs');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getActivityLogs();
  }

  getActivityLogs() {
    this.spinner.start('dashboard-logs');
    this.svc.getActivityLogs().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewdata(res.results);
      this.spinner.stop('dashboard-logs');
    }, err => {
      this.spinner.stop('dashboard-logs');
    });
  }

  goToActivityLogs() {
    this.router.navigate(['activity-logs']);
  }

}
