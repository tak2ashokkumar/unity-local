import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AlertsTabData, tabItems } from '../../tabs';
import { ZabbixAlertsService, ZabbixMonitoringAlertsViewdata } from './zabbix-alerts.service';

@Component({
  selector: 'zabbix-alerts',
  templateUrl: './zabbix-alerts.component.html',
  styleUrls: ['./zabbix-alerts.component.scss']
})
export class ZabbixAlertsComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  tabItem: AlertsTabData;
  viewData: ZabbixMonitoringAlertsViewdata[] = [];
  filteredViewData: ZabbixMonitoringAlertsViewdata[] = [];
  pagedviewData: ZabbixMonitoringAlertsViewdata[] = [];
  fieldsToFilterOn: string[] = ['deviceName', 'alertDesc', 'severity'];
  currentCriteria: SearchCriteria;

  constructor(private alertService: ZabbixAlertsService,
    private spinner: AppSpinnerService,
    private route: Router,
    private clientSidePage: ClientSidePage,
    private notification: AppNotificationService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.tabItem = tabItems.find(ti => ti.url === this.route.url);
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getAlerts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAlerts();
  }

  getAlerts() {
    this.alertService.getAlerts(this.tabItem.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.alertService.convertToViewData(res);
      this.filterAndPage();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch alerts. Please try again later.'));
    });
  }

}
