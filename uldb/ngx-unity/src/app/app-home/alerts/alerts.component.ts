import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { AlertsService, AlertsViewData } from './alerts.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
  providers: [AlertsService]
})
export class AlertsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  public alertCounts: AlertsViewData = new AlertsViewData();
  AppDeviceMapping = DeviceMapping;

  constructor(private dashboardAlertsService: AlertsService,
    private router: Router,
    private user: UserInfoService,
    private storage: StorageService,
    private spinnerService: AppSpinnerService) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.spinnerService.start(this.alertCounts.loaderName);
    this.getAlerts();
    this.updateAlertCount();
  }

  updateAlertCount() {
    this.dashboardAlertsService.pollAlertCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.getAlerts();
    }, (err: HttpErrorResponse) => {
    })
  }

  getAlerts() {
    this.dashboardAlertsService.getAlertsCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: DashboardAlertsWidget) => {
      this.alertCounts = this.dashboardAlertsService.convertToViewData(data);
      this.spinnerService.stop(this.alertCounts.loaderName);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop(this.alertCounts.loaderName);
    })
  }

  goTo(device: DeviceMapping) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.storage.put('alert-device-type', device, StorageType.SESSIONSTORAGE);
    this.router.navigate([this.dashboardAlertsService.getPathByDeviceType(device)]);
  }
}
