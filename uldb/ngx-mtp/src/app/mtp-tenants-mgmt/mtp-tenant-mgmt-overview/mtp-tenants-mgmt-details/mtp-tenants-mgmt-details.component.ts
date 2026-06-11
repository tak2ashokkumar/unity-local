import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MtpTenantsMgmtDetailsService, TenantUserListViewData } from './mtp-tenants-mgmt-details.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { MTPSubscription } from 'src/app/shared/SharedEntityTypes/subscriptions.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'mtp-tenants-mgmt-details',
  templateUrl: './mtp-tenants-mgmt-details.component.html',
  styleUrls: ['./mtp-tenants-mgmt-details.component.scss'],
  providers: [MtpTenantsMgmtDetailsService]
})
export class MtpTenantsMgmtDetailsComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  @ViewChild('deleteConfirmUser') deleteConfirmUser: ElementRef;
  deleteUserModalRef: BsModalRef;

  @ViewChild('toggleConfirmUser') toggleConfirmUser: ElementRef;
  toggleUserModalRef: BsModalRef;

  @ViewChild('resetPasswordUser') resetPasswordUser: ElementRef;
  resetPasswordUserModalRef: BsModalRef;

  @ViewChild('deleteSubscription') deleteSubscription: ElementRef;
  deleteSubscriptionModalRef: BsModalRef;

  @ViewChild('addSubscription') addSubscription: ElementRef;
  addSubscriptionModalRef: BsModalRef;

  unityModuleSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: '',
    keyToSelect: '',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  currentCriteria: SearchCriteria;
  count: number;
  isEditMode: boolean = false;
  isCollapsed = false;
  isSubscriptionCollapsed = false;
  subscr: Subscription;
  viewData: TenantUserListViewData[] = [];
  view: MTPSubscription;
  tenantId: string;
  groupTenantId: string;
  userlistview: TenantUserListViewData;
  userView: TenantUserListViewData;
  subscription: number;
  moduleId: number;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private mtpTenantMgmtDetailsSvc: MtpTenantsMgmtDetailsService,
    private spinnerService: AppSpinnerService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.tenantId = params.get('tenantId');
      this.groupTenantId = params.get('groupId');
      this.getTenantUserList();
      this.getSubscriptions();
    });
  }

  ngOnInit(): void {
    // this.tenantList();
    // this.getTenantUserList();
    // this.getSubscriptions();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getTenantUserList();
  }

  onSearched(event: string) {
    this.spinnerService.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTenantUserList();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTenantUserList();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTenantUserList();
  }

  editSubscription() {
    this.isEditMode = !this.isEditMode;
  }

  deleteUser(view: TenantUserListViewData) {
    this.userlistview = view;
    this.deleteUserModalRef = this.modalService.show(this.deleteConfirmUser, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.deleteUserModalRef.hide();
    this.mtpTenantMgmtDetailsSvc.deleteUser(this.userlistview).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getTenantUserList();
      this.notification.success(new Notification(`User ${this.userlistview.fullName} deleted successfully`));
      this.spinner.stop('main');
    }, (err) => {
      this.notification.error(new Notification('Error while deleting User. Please try again.'));
      this.spinner.stop('main');
    })
  };

  editUserDetails(view: TenantUserListViewData) {
    this.router.navigate([this.groupTenantId, view.orgUuid, view.userUuid, 'updatedetails'], { relativeTo: this.route.parent.parent });
  }

  toggleUser(view: TenantUserListViewData) {
    this.userlistview = view;
    this.toggleUserModalRef = this.modalService.show(this.toggleConfirmUser, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.toggleUserModalRef.hide();
    this.spinner.start('main');
    this.mtpTenantMgmtDetailsSvc.confirmToggle(this.userlistview).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification(`User ${this.userlistview.toggleTootipMsg} successfully`));
      this.getTenantUserList();
      this.spinner.stop('main');
    }, (err) => {
      this.notification.error(new Notification('User enable/disable could not be '));
      this.spinner.stop('main');
    });
  }

  resetPassword(user: TenantUserListViewData) {
    this.userView = user;
    this.resetPasswordUserModalRef = this.modalService.show(this.resetPasswordUser, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmResetPassword(view: TenantUserListViewData) {
    this.resetPasswordUserModalRef.hide()
    this.spinner.start('main');
    this.mtpTenantMgmtDetailsSvc.resetPassword(this.userView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Password reset link sent successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  getTenantUserList() {
    this.mtpTenantMgmtDetailsSvc.getTenantUserList(this.tenantId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.mtpTenantMgmtDetailsSvc.convertTenantUserListToViewData(res.results);
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching User List!! Please try again.'));
      this.spinner.stop('main');
    });
  }

  getSubscriptions() {
    if (!this.tenantId) {
      return;
    }
    this.mtpTenantMgmtDetailsSvc.getSubscriptionsByTenant(this.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.length) {
        this.view = res.getFirst();
      }
    }, err => {
      this.notification.error(new Notification('Error while fetching Tenant Subscription!! Please try again.'));
    });
  }

  deleteSubscribedModule(subscription: number) {
    this.subscription = subscription;
    this.deleteSubscriptionModalRef = this.modalService.show(this.deleteSubscription, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteSubscribedModule() {
    this.spinner.start('main');
    this.deleteSubscriptionModalRef.hide();
    this.mtpTenantMgmtDetailsSvc.deleteModule(this.tenantId, this.subscription).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSubscriptions();
      this.spinner.stop('main');
      this.notification.success(new Notification('subscription delete successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while deleted Subscription!! Please try again.'));
    });
  }

  addSubscribedModule(moduleId: number) {
    this.moduleId = moduleId;
    this.addSubscriptionModalRef = this.modalService.show(this.addSubscription, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAddSubscribedModule() {
    this.spinner.start('main');
    this.addSubscriptionModalRef.hide();
    this.mtpTenantMgmtDetailsSvc.addModule(this.tenantId, this.moduleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getSubscriptions();
      this.spinner.stop('main');
      this.notification.success(new Notification('subscription added successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while adding Subscription!! Please try again.'));
    });
  }

}