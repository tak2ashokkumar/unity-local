import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AimlMgmtService, DashboardAIMLSummaryAlertsCountViewData, DashboardAIMLSummaryViewData } from './aiml-mgmt.service';
import { PermissionService } from 'src/app/shared/unity-rbac-permissions/unity-rbac-permission.service';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';

@Component({
  selector: 'aiml-mgmt',
  templateUrl: './aiml-mgmt.component.html',
  styleUrls: ['./aiml-mgmt.component.scss'],
  providers: [AimlMgmtService]
})
export class AimlMgmtComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  summaryData: DashboardAIMLSummaryViewData;
  alertsData: DashboardAIMLSummaryAlertsCountViewData;
  constructor(private svc: AimlMgmtService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinner.stop('dashboard-aiml');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.getConditionsSummary();
    this.getAlertsCountByDeviceType();
  }

  getConditionsSummary() {
    this.spinner.start('dashboard-aiml');
    this.svc.getConditionsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = this.svc.convertToSummaryViewdata(res);
      this.spinner.stop('dashboard-aiml');
    }, err => {
      this.spinner.stop('dashboard-aiml');
      this.notification.error(new Notification('Error while fetching AIML condition summary!!'));
    });
  }

  getAlertsCountByDeviceType() {
    this.spinner.start('dashboard-aiml');
    this.svc.getAlertsCountByDeviceType().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertsData = this.svc.convertToAlertsCountViewdata(res);
      this.spinner.stop('dashboard-aiml');
    }, err => {
      this.spinner.stop('dashboard-aiml');
      this.notification.error(new Notification('Error while fetching AIML alerts count by device type!!'));
    });
  }

  hasAIMLAccess() {
    return this.permissionService.hasViewAccess(UnityModules.AIML_EVENT_MANAGEMENT);
  }

  goTo(path?: string) {
    if (!this.hasAIMLAccess()) {
      return;
    }
    if (path) {
      this.router.navigate(['/services', 'aiml-event-mgmt', path]);
    } else {
      this.router.navigate(['/services', 'aiml', 'summary']);
    }
  }

}
