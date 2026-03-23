import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { OCI_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { OCIAccountType } from 'src/app/united-cloud/public-cloud/entities/oci-account.type';
import { OciAccountScheduleHistoryViewData, OCIAccountViewData, UsiPublicCloudOracleService } from './usi-public-cloud-oracle.service';
import { TabData } from 'src/app/shared/tabdata';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'usi-public-cloud-oracle',
  templateUrl: './usi-public-cloud-oracle.component.html',
  styleUrls: ['./usi-public-cloud-oracle.component.scss'],
  providers: [UsiPublicCloudOracleService]
})
export class UsiPublicCloudOracleComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'Oracle',
    url: '/setup/integration/oracle/instances'
  }];

  private ngUnsubscribe = new Subject();
  viewData: OCIAccountViewData[] = [];
  selectedView: OCIAccountViewData;
  count: number;
  currentCriteria: SearchCriteria;

  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: OciAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: OCIAccountViewData;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private accountService: UsiPublicCloudOracleService,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getAccounts();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  onSearchedScheduleHistory(event: string) {
    this.scheduleHistoryCurrentCriteria.searchValue = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChangeScheduleHistory(pageNo: number) {
    this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
    this.getScheduleHistory();
  }

  pageSizeChangeScheduleHistory(pageSize: number) {
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  getAccounts() {
    this.accountService.getAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<OCIAccountType>) => {
      this.count = data.count;
      this.viewData = this.accountService.convertToViewData(data.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  addAccount() {
    this.router.navigate(['oracle/add'], { relativeTo: this.route.parent });
  }

  editAccount(view: OCIAccountViewData) {
    this.router.navigate(['oracle', view.uuid, 'edit'], { relativeTo: this.route.parent });
  }

  deleteAccount(view: OCIAccountViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.accountService.deleteAccount(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Instance deleted successfully.'));
    }, err => {
      this.notification.error(new Notification('Failed to delete Instance!! Please try again.'));
    });
  }

  createTicket(view: OCIAccountViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.name, view.region), metadata: OCI_ACCOUNT_TICKET_METADATA(view.name)
    });
  }

  loadResources(view: OCIAccountViewData) {
    this.router.navigate(['oracle', view.uuid, 'resources'], { relativeTo: this.route.parent });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  syncNow(view: OCIAccountViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.accountService.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getAccounts();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  getScheduleHistory(view?: OCIAccountViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.accountService.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count; 
      this.scheduleHistory = this.accountService.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if(view) {
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }
}
