import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserViewData, UsumUsersService } from './usum-users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';

@Component({
  selector: 'usum-users',
  templateUrl: './usum-users.component.html',
  styleUrls: ['./usum-users.component.scss'],
  providers: [UsumUsersService]
})
export class UsumUsersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  viewData: UserViewData[] = [];
  count: number;
  addEditUser: string;
  currentCriteria: SearchCriteria;
  selectedUserIndex: number;
  confirmInput: { confirmTitle: string, confirmMessage: string };
  nonFieldErr: string = '';
  accounts: Array<AzureManageAccountsType> = [];
  isImportDisabled: boolean = false;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('password_reset') password_reset: ElementRef;
  confirmPasswordModalRef: BsModalRef;

  @ViewChild('delete_confirm') deleteConfirm: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private userService: UsumUsersService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getUsers();
    this.getAzureAccounts();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  onSearched(event: string) {
    this.spinnerService.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinnerService.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getUsers();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUsers();
    this.getAzureAccounts();
  }

  getUsers() {
    this.userService.getUsers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<UnitySetupUser>) => {
      this.count = data.count;
      this.viewData = this.userService.convertToViewData(data.results);
      this.spinnerService.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    }, () => {
    });
  }

  getAzureAccounts() {
    this.accounts = [];
    this.userService.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accounts = data;
      if (this.accounts.length) {
        this.isImportDisabled = this.accounts.every(account => account.azure_ad_integ == false) ? true : false;
      } else {
        this.isImportDisabled = true;
      }
      this.spinnerService.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Failed to get Azure Accounts.'));
      this.spinnerService.stop('main');
    });
  }

  confirmToggle(index: number) {
    if (!this.viewData[index].canActivate) {
      return;
    }
    this.selectedUserIndex = index;
    const msg: string = this.viewData[index].isActive ? 'Deactivate' : 'Activate';
    this.confirmInput = { confirmTitle: 'Manage User', confirmMessage: `Are you sure you want to ${msg} this user?` };
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  manageUser() {
    this.confirmModalRef.hide();
    this.spinnerService.start('main');
    // this.userService.manageUser(this.viewData[this.selectedUserIndex].uuid, !this.viewData[this.selectedUserIndex].isActive)
    this.userService.toggleUser(this.viewData[this.selectedUserIndex].uuid)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
        this.spinnerService.stop('main');
        this.viewData[this.selectedUserIndex] = this.userService.convert(user);
        this.notificationService.success(new Notification('User updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinnerService.stop('main');
        this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
      }, () => {
      });
  }

  confirmPasswordToggle(index: number) {
    if (!this.viewData[index].canReset) {
      return;
    }
    this.selectedUserIndex = index;
    this.confirmInput = { confirmTitle: 'Reset Password', confirmMessage: "This action will disable the old password. A link for setting a new password will be sent to the user's registered email address. Are you sure to continue?" };
    this.confirmPasswordModalRef = this.modalService.show(this.password_reset, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  resetPassword() {
    this.confirmPasswordModalRef.hide();
    this.spinnerService.start('main');
    this.userService.resetPassword(this.viewData[this.selectedUserIndex]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.viewData[this.selectedUserIndex].resetButtonClass = 'action-icons-disabled';
      this.viewData[this.selectedUserIndex].canReset = false;
      this.viewData[this.selectedUserIndex].resetTooltipMessage = "Password reset link sent to user's email address.";
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('Password reset link sent successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    }, () => {
    });
  }

  confirmDeleteUser(index: number) {
    if (!this.viewData[index].canDelete) {
      return;
    }
    this.selectedUserIndex = index;
    this.confirmInput = { confirmTitle: 'Delete User', confirmMessage: `Are you sure you want to delete this user?` };
    this.confirmDeleteModalRef = this.modalService.show(this.deleteConfirm, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  deleteUser() {
    this.confirmDeleteModalRef.hide();
    this.spinnerService.start('main');
    this.userService.deleteUser(this.viewData[this.selectedUserIndex].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      this.notificationService.success(new Notification('User deleted successfully'));
      this.spinnerService.stop('main');
      this.getUsers();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    }, () => {
    });
  }

  inviteUser(index: number) {
    if (!this.viewData[index].canInviteUser) {
      return;
    }
    this.spinnerService.start('main');
    this.userService.inviteUser(this.viewData[index].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      this.notificationService.success(new Notification('Invite email sent successfully.'));
      this.spinnerService.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    }, () => {
    });
  }

  goToImportUsers() {
    if (this.isImportDisabled) {
      return;
    }
    this.router.navigate(['import-users'], { relativeTo: this.route });
  }

  goToCreateUser() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditUser(index: number) {
    if (!this.viewData[index].canEdit) {
      return;
    }
    this.router.navigate([this.viewData[index].uuid, 'edit'], { relativeTo: this.route });
  }

}