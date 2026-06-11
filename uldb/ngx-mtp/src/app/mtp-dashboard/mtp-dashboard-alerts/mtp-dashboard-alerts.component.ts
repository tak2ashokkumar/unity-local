import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MTPDashboardAlertsCountViewData, MTPDashboardAlertsSummaryViewData, MtpDashboardAlertsService } from './mtp-dashboard-alerts.service';
import { Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mtp-dashboard-alerts',
  templateUrl: './mtp-dashboard-alerts.component.html',
  styleUrls: ['./mtp-dashboard-alerts.component.scss'],
  providers: [MtpDashboardAlertsService]
})
export class MtpDashboardAlertsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  summaryView: MTPDashboardAlertsSummaryViewData = new MTPDashboardAlertsSummaryViewData();
  alertsData: MTPDashboardAlertsCountViewData = new MTPDashboardAlertsCountViewData();
  severityDonutStyle: SafeStyle = '';
  constructor(private svc: MtpDashboardAlertsService,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getAlertCounts();
    setTimeout(() => {
      this.getSummaryData();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('dashboard-alerts');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSummaryData() {
    this.spinner.start('dashboard-alerts');
    this.svc.getConditionsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryView = this.svc.convertToSummaryViewdata(res);
      if (res.total) {
        let critical = (360 / this.summaryView.conditions) * this.summaryView.critical;
        let warning = (360 / this.summaryView.conditions) * this.summaryView.warning;
        let info = (360 / this.summaryView.conditions) * this.summaryView.information;
        const gradient = `conic-gradient(#cc0000 0deg ${critical}deg, #ff8800 ${critical}deg ${warning}deg, #378ad8 ${warning}deg ${info}deg)`;
        this.severityDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${gradient}`);
      }
      this.spinner.stop('dashboard-alerts');
    }, err => {
      this.summaryView = new MTPDashboardAlertsSummaryViewData();
      this.spinner.stop('dashboard-alerts');
    });
  }

  getAlertCounts() {
    this.svc.getAlertCounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsData = this.svc.convertToAlertsCountViewdata(res);
    }, err => {
      this.alertsData = new MTPDashboardAlertsCountViewData();
    });
  }

  goTo(path?: string) {
    if (path) {
      this.router.navigate(['/aiml', path]);
    } else {
      this.router.navigate(['/aiml', 'summary']);
    }
  }
}
