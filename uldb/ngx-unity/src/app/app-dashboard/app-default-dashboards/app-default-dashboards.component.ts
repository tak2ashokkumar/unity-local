import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppDefaultDashboardsService, DefaultViewData } from './app-default-dashboards.service';
import { Subject } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'app-default-dashboards',
  templateUrl: './app-default-dashboards.component.html',
  styleUrls: ['./app-default-dashboards.component.scss'],
  providers: [AppDefaultDashboardsService]
})
export class AppDefaultDashboardsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: DefaultViewData[] = [];
  selectedView: DefaultViewData;

  constructor(private svc: AppDefaultDashboardsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', multiValueParam: {} };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDefaults();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.getDefaults();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getDefaults();
  }

  getDefaults() {
    this.svc.getDefaults(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res);
      this.count = this.viewData?.length;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Default Dashboards. Try again later.'))
    })
  }

  goToDefaultDashboard(view: DefaultViewData) {
    this.router.navigate([view.defaultDashboardUrl], { relativeTo: this.route });
  }

}
