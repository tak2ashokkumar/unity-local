import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { scheduleTypeList, SdwanViewData, statusList, UsioSdwanService } from './usio-sdwan.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { SDWAN_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'usio-sdwan',
  templateUrl: './usio-sdwan.component.html',
  styleUrls: ['./usio-sdwan.component.scss'],
  providers: [UsioSdwanService]
})
export class UsioSdwanComponent implements OnInit, OnDestroy {
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: SdwanViewData[] = [];
  count: number;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmSdwanDeleteModalRef: BsModalRef;
  deletionId: string;

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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UsioSdwanService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'schedule': [], 'status': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getSdWanAccounts();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getSdWanAccounts();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getSdWanAccounts();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSdWanAccounts();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getSdWanAccounts();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSdWanAccounts();
  }

  refreshData($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'schedule': [], 'status': [] } };
    this.getSdWanAccounts();
  }

  getSdWanAccounts() {
    this.svc.getSdWanAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  addSdWan() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToViewDetails(view: SdwanViewData) {
    this.router.navigate([`/unitycloud/devices/sdwans/${view.uuid}/details`]);
  }

  syncNow(view: SdwanViewData) {
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

  editSdwanDetails(view: SdwanViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route })
  }

  deleteSdwanAccount(view: SdwanViewData) {
    this.deletionId = view.uuid;
    this.confirmSdwanDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmSdwanDelete() {
    this.spinner.start('main');
    this.svc.sdwanDelete(this.deletionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmSdwanDeleteModalRef.hide();
      this.getSdWanAccounts();
      this.notification.success(new Notification('Sdwan Account deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.confirmSdwanDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Sdwan Account could not be deleted!!'));
    });
  }

  createTicket(view: SdwanViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.name, view.name), metadata: SDWAN_ACCOUNT_TICKET_METADATA(view.name)
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
