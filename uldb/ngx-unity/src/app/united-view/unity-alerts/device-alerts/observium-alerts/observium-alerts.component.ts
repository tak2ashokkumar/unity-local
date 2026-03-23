import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AlertsTabData, tabItems } from '../../tabs';
import { ObserviumAlertsService, ObserviumDeviceAlertData } from './observium-alerts.service';

@Component({
  selector: 'observium-alerts',
  templateUrl: './observium-alerts.component.html',
  styleUrls: ['./observium-alerts.component.scss']
})
export class ObserviumAlertsComponent implements OnInit, OnDestroy {

  tabItem: AlertsTabData;
  allAlerts: ObserviumDeviceAlertData[] = [];
  filteredDeviceAlerts: ObserviumDeviceAlertData[] = [];
  pagedviewData: ObserviumDeviceAlertData[] = [];
  currentCriteria: SearchCriteria;
  fieldsToFilterOn: string[] = ['device_name', 'device_type', 'alert_name'];
  poll: boolean = false;

  private ngUnsubscribe = new Subject();
  modalRef: BsModalRef;
  @ViewChild('alertinfo') alertinfo: ElementRef;

  constructor(
    private alertService: ObserviumAlertsService,
    private route: Router,
    private spinnerService: AppSpinnerService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.tabItem = tabItems.find(ti => ti.url === this.route.url);
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getDeviceAlerts());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getDeviceAlerts();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredDeviceAlerts = this.clientSideSearchPipe.transform(this.allAlerts, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredDeviceAlerts, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredDeviceAlerts, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredDeviceAlerts, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDeviceAlerts();
  }

  getDeviceAlerts() {
    this.alertService.getAllDeviceAlerts(this.tabItem.deviceType).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.allAlerts = this.alertService.convertToViewData(res);
        this.filterAndPage();
        this.spinnerService.stop('main');
      }, err => {
        this.spinnerService.stop('main');
      });
  }
}
