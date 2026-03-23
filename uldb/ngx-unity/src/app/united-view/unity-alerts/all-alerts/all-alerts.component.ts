import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from, interval, Subject } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { MappedMonitoringTool } from 'src/app/shared/SharedEntityTypes/monitoring-tool-mapping.type';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AllDeviceAlertsService, ALL_DEVICES, FailedAlertsViewData, VM_DEVICES } from '../all-alerts/all-alerts.service';
import { AlertsTabData, tabItems } from '../tabs';

@Component({
  selector: 'all-alerts',
  templateUrl: './all-alerts.component.html',
  styleUrls: ['./all-alerts.component.scss'],
  providers: [AllDeviceAlertsService]
})
export class AllAlertsComponent implements OnInit, OnDestroy {
  tabItem: AlertsTabData;
  allFailedAlerts: FailedAlertsViewData[] = [];
  filteredAllFailedAlerts: FailedAlertsViewData[] = [];
  pagedviewData: FailedAlertsViewData[] = [];
  currentCriteria: SearchCriteria;
  fieldsToFilterOn: string[] = ['deviceName', 'deviceType', 'alertDesc'];
  poll: boolean = false;
  monitoringToolMap: MappedMonitoringTool;
  ALL_DEVICES = ALL_DEVICES;
  private ngUnsubscribe = new Subject();
  constructor(
    private allDeviceAlertService: AllDeviceAlertsService,
    private appService: AppLevelService,
    private route: Router,
    private spinnerService: AppSpinnerService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.tabItem = tabItems.find(ti => ti.url === this.route.url);
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getMappedMonitoringTool());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getMappedMonitoringTool();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredAllFailedAlerts = this.clientSideSearchPipe.transform(this.allFailedAlerts, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredAllFailedAlerts, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredAllFailedAlerts, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredAllFailedAlerts, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDeviceAlerts();
  }

  getMappedMonitoringTool() {
    this.appService.getMappedMonitoringTool().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.monitoringToolMap = res;
      if (this.appService.getMonitoringToolByDeviceType(DeviceMapping.VIRTUAL_MACHINE, this.monitoringToolMap).observium) {
        this.ALL_DEVICES = this.ALL_DEVICES.concat(VM_DEVICES);
      } else {
        this.ALL_DEVICES.push(DeviceMapping.VIRTUAL_MACHINE);
      }
      this.getDeviceAlerts();
    }, err => { });
  }

  getDeviceAlerts() {
    let count = 0;
    this.allFailedAlerts = [];
    from(this.ALL_DEVICES).pipe(tap(() => count++), mergeMap(e => {
      if (this.appService.getMonitoringToolByDeviceType(e, this.monitoringToolMap).observium) {
        return this.allDeviceAlertService.getObsAllDeviceAlerts(e);
      } else {
        return this.allDeviceAlertService.getZbxAllDeviceAlerts(e);
      }
    }), takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.allFailedAlerts = this.allFailedAlerts.concat(res);
        this.filterAndPage();
        count--;
        if (count == 0) {
          this.spinnerService.stop('main');
        }
      }, err => {
        this.spinnerService.stop('main');
      });
  }
}
