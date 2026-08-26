import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UserViewData, UsumUsersService } from './usum-users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { finalize, takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again!!';

@Component({
  selector: 'usum-users',
  templateUrl: './usum-users.component.html',
  styleUrls: ['./usum-users.component.scss'],
  providers: [UsumUsersService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsumUsersComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  viewData: UserViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  selectedUserIndex: number;
  confirmInput: { confirmTitle: string, confirmMessage: string };
  accounts: Array<AzureManageAccountsType> = [];
  isImportDisabled = false;

  @ViewChild('confirm') confirm: TemplateRef<void>;
  confirmModalRef: BsModalRef;

  @ViewChild('passwordReset') passwordReset: TemplateRef<void>;
  confirmPasswordModalRef: BsModalRef;

  @ViewChild('deleteConfirm') deleteConfirm: TemplateRef<void>;
  confirmDeleteModalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UsumUsersService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService,
    private cdr: ChangeDetectorRef) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinnerSvc.start('main');
    this.getUsers();
    this.getAzureAccounts();
  }

  ngOnDestroy(): void {
    this.confirmDeleteModalRef?.hide();
    this.confirmModalRef?.hide();
    this.confirmPasswordModalRef?.hide();
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria): void {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  onSearched(event: string): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  pageChange(pageNo: number): void {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinnerSvc.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getUsers();
    }
  }

  pageSizeChange(pageSize: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  refreshData(pageNo: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUsers();
    this.getAzureAccounts();
  }

  getUsers(): void {
    this.svc.getUsers(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe((data: PaginatedResult<UnitySetupUser>) => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewData(data.results);
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  getAzureAccounts(): void {
    this.accounts = [];
    this.svc.getAzureAccounts()
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.cdr.markForCheck()))
      .subscribe(data => {
        this.accounts = data;
        this.isImportDisabled = this.accounts.every(account => !account.azure_ad_integ);
      }, () => {
        this.notificationSvc.error(new Notification('Failed to get Azure Accounts.'));
      });
  }

  confirmToggle(index: number): void {
    if (!this.viewData[index].canActivate) {
      return;
    }
    this.selectedUserIndex = index;
    const msg: string = this.viewData[index].isActive ? 'Deactivate' : 'Activate';
    this.confirmInput = { confirmTitle: 'Manage User', confirmMessage: `Are you sure you want to ${msg} this user?` };
    this.confirmModalRef = this.modalSvc.show(this.confirm, CONFIRM_MODAL_CONFIG);
  }

  manageUser(): void {
    this.confirmModalRef.hide();
    this.spinnerSvc.start('main');
    this.svc.toggleUser(this.viewData[this.selectedUserIndex].uuid)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(user => {
        this.viewData[this.selectedUserIndex] = this.svc.convert(user);
        this.notificationSvc.success(new Notification('User updated successfully'));
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  confirmPasswordToggle(index: number): void {
    if (!this.viewData[index].canReset) {
      return;
    }
    this.selectedUserIndex = index;
    this.confirmInput = { confirmTitle: 'Reset Password', confirmMessage: "This action will disable the old password. A link for setting a new password will be sent to the user's registered email address. Are you sure to continue?" };
    this.confirmPasswordModalRef = this.modalSvc.show(this.passwordReset, CONFIRM_MODAL_CONFIG);
  }

  resetPassword(): void {
    this.confirmPasswordModalRef.hide();
    this.spinnerSvc.start('main');
    this.svc.resetPassword(this.viewData[this.selectedUserIndex])
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.viewData[this.selectedUserIndex].resetButtonClass = 'action-icons-disabled';
        this.viewData[this.selectedUserIndex].canReset = false;
        this.viewData[this.selectedUserIndex].resetTooltipMessage = "Password reset link sent to user's email address.";
        this.notificationSvc.success(new Notification('Password reset link sent successfully'));
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  confirmDeleteUser(index: number): void {
    if (!this.viewData[index].canDelete) {
      return;
    }
    this.selectedUserIndex = index;
    this.confirmInput = { confirmTitle: 'Delete User', confirmMessage: `Are you sure you want to delete this user?` };
    this.confirmDeleteModalRef = this.modalSvc.show(this.deleteConfirm, CONFIRM_MODAL_CONFIG);
  }

  deleteUser(): void {
    this.confirmDeleteModalRef.hide();
    this.spinnerSvc.start('main');
    this.svc.deleteUser(this.viewData[this.selectedUserIndex].uuid)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('User deleted successfully'));
        this.getUsers();
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  inviteUser(index: number): void {
    if (!this.viewData[index].canInviteUser) {
      return;
    }
    this.spinnerSvc.start('main');
    this.svc.inviteUser(this.viewData[index].uuid)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Invite email sent successfully.'));
      }, () => {
        this.notificationSvc.error(new Notification(GENERIC_ERROR_MESSAGE));
      });
  }

  goToImportUsers(): void {
    if (this.isImportDisabled) {
      return;
    }
    this.router.navigate(['import-users'], { relativeTo: this.route });
  }

  goToCreateUser(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditUser(index: number): void {
    if (!this.viewData[index].canEdit) {
      return;
    }
    this.router.navigate([this.viewData[index].uuid, 'edit'], { relativeTo: this.route });
  }

  trackByUser(_index: number, user: UserViewData): string {
    return user.uuid;
  }

  private stopSpinnerAndMarkForCheck(): void {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
