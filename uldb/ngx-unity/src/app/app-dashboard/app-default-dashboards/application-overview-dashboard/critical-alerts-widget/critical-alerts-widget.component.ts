import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AlertViewData, CriticalAlertsWidgetService } from './critical-alerts-widget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'critical-alerts-widget',
  templateUrl: './critical-alerts-widget.component.html',
  styleUrls: ['./critical-alerts-widget.component.scss'],
  providers: [CriticalAlertsWidgetService]
})
export class CriticalAlertsWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input("appId") appId: number;
  currentCriteria: SearchCriteria;
  alertsViewData: AlertViewData[] = [];
  count: number;
  alertsLoader: string = 'alertsLoader';
  

  constructor(private svc: CriticalAlertsWidgetService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.appId?.currentValue) {
      this.appId = changes?.appId?.currentValue;
      setTimeout(() => {
        this.getCriticalAlertsData();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCriticalAlertsData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCriticalAlertsData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCriticalAlertsData();
  }

  getCriticalAlertsData() {
    this.spinner.start(this.alertsLoader);
    this.svc.getAlertsData(this.currentCriteria, this.appId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.alertsViewData = this.svc.convertToCriticalAlertsData(res.results);
      this.spinner.stop(this.alertsLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.alertsLoader);
      this.notification.error(new Notification('Failed to get Critical Alerts data. Try again later'));
    });
  }





}
