import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { scheduleTypeList, statusList, UsincViptelaService, ViptelaViewData } from './usinc-viptela.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { AppBreadcrumbService } from 'src/app/app-breadcrumb/app-breadcrumb.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { TICKET_SUBJECT, VIPTELA_ACCOUNT_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'usinc-viptela',
  templateUrl: './usinc-viptela.component.html',
  styleUrls: ['./usinc-viptela.component.scss'],
  providers: [UsincViptelaService]
})
export class UsincViptelaComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: ViptelaViewData[] = [];
  count: number;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  viptelaId: string;
  breadcrumbPath: string = '';

  scheduleTypesList: LabelValueType[] = scheduleTypeList;
  statusList: LabelValueType[] = statusList;

  scheduleSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  scheduleTexts: IMultiSelectTexts = {
    defaultTitle: 'Schedule',
  };

  StatusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  statusTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Status',
  };

  breadcrumbs: string[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UsincViptelaService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,
    public breadcrumbSvc: AppBreadcrumbService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'schedule': [], 'status': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.breadcrumbSvc.breadcrumbs.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.breadcrumbs = (<{ label: string, url: string }[]>param).map(p => p.label);
      this.breadcrumbPath = this.svc.formatBreadCrumb(this.breadcrumbs);
    });
    this.getViptelaAccounts();
  }


  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getViptelaAccounts();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getViptelaAccounts();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getViptelaAccounts();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getViptelaAccounts();
  }

  refreshData($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'schedule': [], 'status': [] } };
    this.getViptelaAccounts();
  }

  getViptelaAccounts() {
    this.svc.getViptelaAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  goToViptelaAdd() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToViewDetails(view: ViptelaViewData) {
    this.storageService.put('viptela', { name: view.name, deviceType: DeviceMapping.VIPTELA_ACCOUNT }, StorageType.SESSIONSTORAGE);
    this.router.navigate([`/unitycloud/devices/network-controllers/${view.uuid}/viptela-components`]);
  }

  syncNow(view: ViptelaViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  goToViptelaEdit(view: ViptelaViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route })
  }

  delete(view: ViptelaViewData) {
    this.viptelaId = view.uuid;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.svc.delete(this.viptelaId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.getViptelaAccounts();
      this.notification.success(new Notification('Viptela Account deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Viptela Account could not be deleted!!'));
    });
  }

  createTicket(view: ViptelaViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.name, view.name), metadata: VIPTELA_ACCOUNT_TICKET_METADATA(view.name, 'viptela', view.accountUrl, this.breadcrumbPath)
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
