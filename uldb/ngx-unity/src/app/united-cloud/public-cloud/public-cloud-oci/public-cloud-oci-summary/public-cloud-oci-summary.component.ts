import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { ORACLE_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AccountDetailsViewData, AccountsDetailListViewData, OciAccountScheduleHistoryViewData, PublicCloudOciSummaryService, ResourceCountAndNames, ResourceDetailsViewData } from './public-cloud-oci-summary.service';
import { OciAccountType } from './public-cloud-oci-summary.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'public-cloud-oci-summary',
  templateUrl: './public-cloud-oci-summary.component.html',
  styleUrls: ['./public-cloud-oci-summary.component.scss'],
  providers: [PublicCloudOciSummaryService]
})
export class PublicCloudOciSummaryComponent implements OnInit, OnDestroy {

  imageUrl: string = `${environment.assetsUrl}external-brand/logos/Oracle-cloud 1.svg`;

  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  serviceAndResourceViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  currentCriteria: SearchCriteria;
  CustomerListViewData: AccountsDetailListViewData = new AccountsDetailListViewData();
  accountId: string;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteOciModalRef: BsModalRef;

  @ViewChild('accessKey') accessKey: ElementRef;
  accessKeyModalRef: BsModalRef;
  accessKeyFormErrors: any;
  accessKeyValidationMessages: any;
  accessKeyForm: FormGroup;
  ociAccountData: OciAccountType[];

  modalRef: BsModalRef;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: OciAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: AccountDetailsViewData;

  accountDetailsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  accountDetailsTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Subscriptions',
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private svc: PublicCloudOciSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,
    private utilService: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { uuid: [] } };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit(): void {
    this.getAccountDetails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.scheduleHistoryCurrentCriteria.searchQuery = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChange(pageNo: number) {
    this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
    this.getScheduleHistory();
  }

  pageSizeChange(pageSize: number) {
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }
  
  onFilterChange() {
    this.getServiceAndResourceDetails();
  }

  getAccountDetails() {
    this.spinner.start('main');
    this.currentCriteria.multiValueParam.uuid = [];
    this.svc.getAccountDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.ociAccountData = data;
      this.CustomerListViewData = this.svc.convertOciCustomerListDetailsViewData(data);
      data.forEach(s => {
        this.currentCriteria.multiValueParam.uuid.push(s.uuid);
      })
      this.getServiceAndResourceDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to Load Account Details"));
    });
  }

  getServiceAndResourceDetails() {
    this.spinner.start('main');
    this.svc.getServiceAndResourceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.serviceAndResourceViewData = this.svc.convertServiceAndResourceViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to Load Service and Resource Details"));
    });
  }

  gotToAIMLPage() {
    this.router.navigate(['/services/aiml-event-mgmt/alerts']);
  }

  redirectToResourceDetails(view?: ResourceCountAndNames) {
    this.storageService.put('ociAccounts', { uuid: this.currentCriteria.multiValueParam.uuid }, StorageType.SESSIONSTORAGE);
    if (view) {
      this.router.navigate(['services', view.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['services', 'allresources'], { relativeTo: this.route });
    }
  }

  goToCostPage() {
    this.router.navigate(['/cost-analysis/public-cloud/oci']);
  }

  edit(view: AccountDetailsViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route.parent });
  }


  redirectToResourceDetailsFromAccount(view: AccountDetailsViewData) {
    this.storageService.put('ociAccounts', { uuid: [view.uuid] }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['services/allresources'], { relativeTo: this.route });
  }

  showServices(view: AccountDetailsViewData) {
    this.currentCriteria.multiValueParam.uuid = [];
    this.currentCriteria.multiValueParam.uuid.push(view.uuid);
    this.getServiceAndResourceDetails();
  }

  changeAPIKeys(view: AccountDetailsViewData) {
    this.accountId = view.uuid;
    this.accessKeyFormErrors = this.svc.resetAccessKeyFormErrors();
    this.accessKeyValidationMessages = this.svc.accessKeyValidationMessages;
    this.accessKeyForm = this.svc.createAccessKeyForm(view);
    this.accessKeyModalRef = this.modalService.show(this.accessKey, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  // updateAPIKeys() {
  //   if (this.accessKeyForm.invalid) {
  //     this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors);
  //     this.accessKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
  //       .subscribe((data: any) => { this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors); });
  //   } else {
  //     this.spinner.start('main');
  //     const data = this.accessKeyForm.getRawValue();
  //     this.svc.updateAPIKeys(this.accountId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.getAccountDetails();
  //       this.accessKeyModalRef.hide();
  //       this.spinner.stop('main');
  //       this.notification.success(new Notification('API Keys updated successfully'));
  //     }, (err: HttpErrorResponse) => {
  //       this.accessKeyFormErrors.error = err.error;
  //       this.spinner.stop('main');
  //     });
  //   }
  // }

  createTicket(view: AccountDetailsViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.accountName, view.accountName), metadata: ORACLE_ACCOUNT_TICKET_METADATA(view.accountName)
    });
  }

  deleteOCIAccount(view: AccountDetailsViewData) {
    this.deleteOciModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.accountId = view.uuid;
  }

  confirmDeleteOciAccount() {
    this.deleteOciModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteOciAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.notification.success(new Notification('OCI Account deleted successfully'));
      this.getAccountDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to Delete OCI Account'));
      this.spinner.stop('main');
    });
  }

  syncNow(view: AccountDetailsViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getAccountDetails();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  getScheduleHistory(view?: AccountDetailsViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.svc.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count; 
      this.scheduleHistory = this.svc.convertToHistoryViewData(res.results);
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
