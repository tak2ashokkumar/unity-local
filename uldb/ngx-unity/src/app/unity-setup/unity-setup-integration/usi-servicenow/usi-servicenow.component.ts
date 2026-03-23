import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { customDateRangeOptions, DOWNLOAD_URL, ServiceNowAccountHistoryViewData, ServiceNowAccountsViewData, UsiServicenowService } from './usi-servicenow.service';
import { ServicenowAccounts } from './usi-servicenow.type';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Component({
  selector: 'usi-servicenow',
  templateUrl: './usi-servicenow.component.html',
  styleUrls: ['./usi-servicenow.component.scss'],
  providers: [UsiServicenowService]
})
export class UsiServicenowComponent implements OnInit, OnDestroy {

  count: number = 0;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  form: FormGroup;
  viewData: ServiceNowAccountsViewData[] = [];
  popOverList: string[];
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;
  serviceNowId: string;
  deviceTypes: string[];
  timeframeDropdownOptions: CustomDateRangeType[] = customDateRangeOptions;
  // downloadUrl: string;

  historyCurrentCriteria: SearchCriteria;
  historyCount: number = 0;
  @ViewChild('history') history: ElementRef;
  historyModalRef: BsModalRef;
  viewHistoryData: ServiceNowAccountHistoryViewData[] = [];
  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private spinnerService: AppSpinnerService,
    private crudService: UsiServicenowService,
    private modalService: BsModalService,
    public userService: UserInfoService,
    private notification: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.historyCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ device_type: '', timeframe: '' }] };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getServiceNowInstances();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getServiceNowInstances();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getServiceNowInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getServiceNowInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getServiceNowInstances();
  }

  getServiceNowInstances() {
    this.crudService.getServiceNowInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.crudService.convertToViewdata(res.results);
      this.count = res.count;
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  showTenants(view: ServiceNowAccountsViewData) {
    this.popOverList = view.extraTenantsList;
  }

  add() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(data: ServiceNowAccountsViewData) {
    this.router.navigate([data.uuid, 'edit'], { relativeTo: this.route })
  }

  delete(data: ServiceNowAccountsViewData) {
    this.serviceNowId = data.uuid;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.crudService.delete(this.serviceNowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.notification.success(new Notification('ServiceNow disconnected successfully'));
      this.getServiceNowInstances();
    }, (err) => {
      this.notification.error(new Notification('ServiceNow could not be disconnected'));
    });
  }



  historyPageChange(pageNo: number) {
    if (this.historyCurrentCriteria.pageNo === pageNo) {
      return;
    }
    this.spinner.start('main');
    this.historyCurrentCriteria.pageNo = pageNo;
    this.getInstancesHistory();
  }

  historyPageSizeChange(pageSize: number) {
    if (this.historyCurrentCriteria.pageSize === pageSize) {
      return;
    }
    this.spinner.start('main');
    this.historyCurrentCriteria.pageSize = pageSize;
    this.historyCurrentCriteria.pageNo = 1;
    this.getInstancesHistory();
  }

  viewHistory(data: ServiceNowAccountsViewData) {
    this.spinner.start('main');
    this.viewHistoryData = [];
    this.historyCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ device_type: '', timeframe: '' }] };
    this.serviceNowId = data.uuid;
    this.getDeviceTypes();
    this.getInstancesHistory();
    // this.downloadUrl = DOWNLOAD_URL(this.serviceNowId, this.historyCurrentCriteria.params[0].device_type, this.historyCurrentCriteria.params[0].timeframe, this.historyCurrentCriteria.searchValue)
    this.historyModalRef = this.modalService.show(this.history, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  onHistorySearched(event: string){
    this.historyCurrentCriteria.searchValue = event;
    this.historyCurrentCriteria.pageNo = 1;
    this.getInstancesHistory();
  }

  get downloadUrl(): string {
    const params = this.historyCurrentCriteria?.params?.[0] || {};
    return DOWNLOAD_URL(
      this.serviceNowId,
      params.device_type || '',
      params.timeframe || '',
      this.historyCurrentCriteria?.searchValue || ''
    );
  }


  getInstancesHistory() {
    this.crudService.getInstancesHistory(this.serviceNowId, this.historyCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewHistoryData = this.crudService.convertToInstanceHistoryViewdata(res.results);
      this.historyCount = res.count;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  getDeviceTypes() {
    this.crudService.getDeviceTypes(this.serviceNowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceTypes = res;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  onFilterChange() {
    this.getInstancesHistory();
  }

  goTo(data: ServicenowAccounts) {
    this.router.navigate(['support/ticketmgmt', data.uuid]);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
