import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { MTPDashboardRecentAlertsViewData, MtpDashboardRecentAlertsService } from './mtp-dashboard-recent-alerts.service';

@Component({
  selector: 'mtp-dashboard-recent-alerts',
  templateUrl: './mtp-dashboard-recent-alerts.component.html',
  styleUrls: ['./mtp-dashboard-recent-alerts.component.scss'],
  providers: [MtpDashboardRecentAlertsService]
})
export class MtpDashboardRecentAlertsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  viewData: MTPDashboardRecentAlertsViewData[] = [];
  constructor(private svc: MtpDashboardRecentAlertsService,
    private notification: AppNotificationService,
    private router: Router,
    private spinner: AppSpinnerService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.getRecentAlerts();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getRecentAlerts() {
    this.spinner.start('dashboard-recent-alerts');
    this.svc.getRecentAlerts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res);
      this.spinner.stop('dashboard-recent-alerts');
    }, err => {
      this.viewData = [];
      this.spinner.stop('dashboard-recent-alerts');
    });
  }

}
