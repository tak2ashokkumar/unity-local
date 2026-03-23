import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TICKET_SUBJECT, UL_S3_ACCOUNT_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UlS3AccountViewData, UnityS3AccountService } from './unity-s3-account.service';

@Component({
  selector: 'unity-s3-account',
  templateUrl: './unity-s3-account.component.html',
  styleUrls: ['./unity-s3-account.component.scss'],
  providers: [UnityS3AccountService]
})
export class UnityS3AccountComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  poll: boolean = false;
  inDevicesPage: boolean;
  pcId: string;
  privateclouds: Array<PrivateCLoudFast> = [];
  viewData: UlS3AccountViewData[] = [];

  accountId: number;
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('accessKey') accessKey: ElementRef;
  accessKeyModalRef: BsModalRef;
  accessKeyFormErrors: any;
  accessKeyValidationMessages: any;
  accessKeyForm: FormGroup;

  @ViewChild('addAccount') addAccount: ElementRef;
  addAccountModalRef: BsModalRef;
  addAccountFormErrors: any;
  addAccountValidationMessages: any;
  addAccountForm: FormGroup;

  @ViewChild('editAccount') editAccount: ElementRef;
  editAccountModalRef: BsModalRef;
  editAccountFormErrors: any;
  editAccountValidationMessages: any;
  editAccountForm: FormGroup;

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private utilService: AppUtilityService,
    private ticketService: SharedCreateTicketService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private accountService: UnityS3AccountService,
    private termService: FloatingTerminalService) {
    // this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
    //   switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
    //   takeUntil(this.ngUnsubscribe)).subscribe(x => this.getRegions());
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getPrivateClouds();
    this.getAccounts();
  }

  get isCrudEnabled() {
    return this.inDevicesPage;
  }
  get showDevicesColumns() {
    return this.inDevicesPage;
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  onSearched(event: string) {
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

  getPrivateClouds() {
    this.accountService.getPrivateCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds = res;
    });
  }

  getAccounts() {
    this.accountService.getS3Acccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.accountService.convertToViewData(res.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  addS3Account() {
    this.addAccountFormErrors = this.accountService.resetAddAccountFormErrors();
    this.addAccountValidationMessages = this.accountService.addAccountValidationMessages;
    this.addAccountForm = this.accountService.createAddAccountForm();
    this.addAccountModalRef = this.modalService.show(this.addAccount, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  createAccount() {
    if (this.addAccountForm.invalid) {
      this.addAccountFormErrors = this.utilService.validateForm(this.addAccountForm, this.addAccountValidationMessages, this.addAccountFormErrors);
      this.addAccountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.addAccountFormErrors = this.utilService.validateForm(this.addAccountForm, this.addAccountValidationMessages, this.addAccountFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.addAccountForm.getRawValue();
      this.accountService.addAccount(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getAccounts();
        this.addAccountModalRef.hide();
        this.spinner.stop('main');
        this.notificationService.success(new Notification('Account added successfully'));
      }, (err: HttpErrorResponse) => {
        if (err.error.data) {
          this.notificationService.error(new Notification(err.error.data));
        } else {
          this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.addAccountModalRef.hide();
        this.spinner.stop('main');
      });
    }
  }

  changeAPIKeys(view: UlS3AccountViewData) {
    this.accessKeyFormErrors = this.accountService.resetAccessKeyFormErrors();
    this.accessKeyValidationMessages = this.accountService.accessKeyValidationMessages;
    this.accessKeyForm = this.accountService.createAccessKeyForm(view);
    this.accessKeyModalRef = this.modalService.show(this.accessKey, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  updateAPIKeys() {
    if (this.accessKeyForm.invalid) {
      this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors);
      this.accessKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.accessKeyForm.getRawValue();
      this.accountService.updateAPIKeys(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getAccounts();
        this.accessKeyModalRef.hide();
        this.spinner.stop('main');
        this.notificationService.success(new Notification('API Keys updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.accessKeyFormErrors.error = err.error;
        this.spinner.stop('main');
      });
    }
  }

  editS3Account(view: UlS3AccountViewData) {
    this.editAccountFormErrors = this.accountService.resetEditAccountFormErrors();
    this.editAccountValidationMessages = this.accountService.editAccountValidationMessages;
    this.editAccountForm = this.accountService.createEditAddAccountForm(view);
    this.editAccountModalRef = this.modalService.show(this.editAccount, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  updateAccount() {
    if (this.editAccountForm.invalid) {
      this.editAccountFormErrors = this.utilService.validateForm(this.editAccountForm, this.editAccountValidationMessages, this.editAccountFormErrors);
      this.editAccountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.editAccountFormErrors = this.utilService.validateForm(this.editAccountForm, this.editAccountValidationMessages, this.editAccountFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.editAccountForm.getRawValue();
      this.accountService.updateAccount(data.id, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getAccounts();
        this.editAccountModalRef.hide();
        this.spinner.stop('main');
        this.notificationService.success(new Notification('Account updated successfully'));
      }, (err: HttpErrorResponse) => {
        if (err.status < 500) {
          this.editAccountFormErrors.error = err.error;
        } else {
          this.editAccountModalRef.hide();
          this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.spinner.stop('main');
      });
    }
  }

  createTicket(view: UlS3AccountViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.S3_BUCKET + ' Account', view.accountName),
      metadata: UL_S3_ACCOUNT_TICKET_METADATA(view.accountName, view.endpointUrl)
    });
  }

  deleteAccount(view: UlS3AccountViewData) {
    this.accountId = view.id;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.accountService.deleteAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getAccounts();
      this.confirmModalRef.hide();
      this.notificationService.success(new Notification('Account deleted successfully'));
    }, err => {
      this.confirmModalRef.hide();
      this.notificationService.error(new Notification('Account could not be deleted!!'));
    });
  }

  goToInventory(view: UlS3AccountViewData) {
    this.storageService.put('device', { name: view.accountName, deviceType: DeviceMapping.S3_BUCKET }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.id, 's3'], { relativeTo: this.route });
  }

}
