import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppPersonaDashboardService } from './app-persona-dashboard.service';
import { Subject } from 'rxjs';
import { AppDashboardListType } from './app-persona-dashboard.type';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-persona-dashboard',
  templateUrl: './app-persona-dashboard.component.html',
  styleUrls: ['./app-persona-dashboard.component.scss'],
  providers: [AppPersonaDashboardService]
})
export class AppPersonaDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  dashboardList: AppDashboardListType[] = [];
  defaultDashboard: AppDashboardListType;
  selectedDashboard: AppDashboardListType;
  constructor(private svc: AppPersonaDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    public userSvc: UserInfoService,
    private notification: AppNotificationService,) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDashboardList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getDashboardList();
  }

  getDashboardList() {
    this.svc.getDashboardList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        let index = res.findIndex(d => d.uuid === this.userSvc.defaultDashboard);
        if (index > -1) {
          res[index].is_default = true;
          this.defaultDashboard = res[index];
          this.selectedDashboard = res[index];
        } else {
          this.defaultDashboard = null;
          this.selectedDashboard = res[0];
        }
      }
      this.dashboardList = res;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.dashboardList = [];
      this.notification.error(new Notification('Failed to fetch Dashboard List.'));
      this.spinner.stop('main');
    });
  }

  onDashboardChange(dashboard: AppDashboardListType) {
    // console.log('dashboard : ', dashboard);
    // this.selectedDashboard = dashboard;
  }

  addDashboard() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToList() {
    this.router.navigate(['list'], { relativeTo: this.route });
  }

}
