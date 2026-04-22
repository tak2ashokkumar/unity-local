import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AlertsTabData, tabItems } from '../tabs';
import { VMAlertsService, VMAlertsViewData } from './vms-alerts.service';

@Component({
  selector: 'vms-alerts',
  templateUrl: './vms-alerts.component.html',
  styleUrls: ['./vms-alerts.component.scss'],
  providers: [VMAlertsService],
})
export class VmsAlertsComponent implements OnInit, OnDestroy {
  tabItem: AlertsTabData;
  VMAlerts: VMAlertsViewData[] = [];
  filteredVMAlerts: VMAlertsViewData[] = [];
  pagedviewData: VMAlertsViewData[] = [];
  currentCriteria: SearchCriteria;
  vm: VMAlertsViewData = new VMAlertsViewData();
  fieldsToFilterOn: string[] = ['deviceName', 'cloudName'];
  private ngUnsubscribe = new Subject();
  poll: boolean = false;
  modalRef: BsModalRef;
  @ViewChild('alertinfo') alertinfo: ElementRef;


  constructor(
    private vmalertService: VMAlertsService,
    private route: Router,
    private modalService: BsModalService,
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
    this.filteredVMAlerts = this.clientSideSearchPipe.transform(this.VMAlerts, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredVMAlerts, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredVMAlerts, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredVMAlerts, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDeviceAlerts();
  }

  getDeviceAlerts() {
    this.vmalertService.getVMAlerts(this.tabItem.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.VMAlerts = this.vmalertService.convertToViewData(res);
      this.filterAndPage();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  showInfo(view: VMAlertsViewData) {
    this.vm = view;
    this.modalRef = this.modalService.show(this.alertinfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }


}
