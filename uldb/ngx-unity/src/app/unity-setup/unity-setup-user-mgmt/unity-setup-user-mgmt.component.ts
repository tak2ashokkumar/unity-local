import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { UnitySetupUserMgmtService, UserPhoneCarrier, UserViewData } from './unity-setup-user-mgmt.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, Validators } from '@angular/forms';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UnitySetupUser, UserRoleType } from 'src/app/shared/SharedEntityTypes/user.type';
import { AzureManageAccountsType } from 'src/app/shared/SharedEntityTypes/azure.type';

const tabData: TabData[] = [
  {
    name: 'Users',
    url: '/setup/users'
  }
];

@Component({
  selector: 'unity-setup-user-mgmt',
  templateUrl: './unity-setup-user-mgmt.component.html',
  styleUrls: ['./unity-setup-user-mgmt.component.scss'],
  providers: [UnitySetupUserMgmtService]
})
export class UnitySetupUserMgmtComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabData;
  viewData: UserViewData[] = [];
  userRoles: UserRoleType[] = []
  carriers: UserPhoneCarrier[] = []
  count: number;
  addEditUser: string;
  currentCriteria: SearchCriteria;
  private scrolled: boolean = false;
  private ngUnsubscribe = new Subject();
  selectedUserIndex: number;
  confirmInput: { confirmTitle: string, confirmMessage: string };
  nonFieldErr: string = '';

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('password_reset') password_reset: ElementRef;
  confirmPasswordModalRef: BsModalRef;

  @ViewChild('delete_confirm') deleteConfirm: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  @ViewChild('importUsersRef') importUsersRef: ElementRef;
  importUsersRefModalRef: BsModalRef;
  azureAccounts: AzureManageAccountsType[] = [];

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  createFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private userService: UnitySetupUserMgmtService,
    private userInfo: UserInfoService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    // this.spinnerService.start('main');
    // this.getUsers();
    // this.getAzureAccounts();
    // this.getUserRoles();
    // this.getCarriers();
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
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUsers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getUsers();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getUsers();
      this.getUserRoles();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUsers();
    this.getUserRoles();
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
    this.azureAccounts = [];
    this.userService.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureAccounts = data;
    });
  }

  getCarriers() {
    this.userService.getCarriers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.carriers = data;
    });
  }

  getUserRoles() {
    this.userRoles = [];
    this.userService.getUserRoles().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.userRoles = data;
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
    this.userService.resetPassword(this.viewData[this.selectedUserIndex])
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
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

  confirmEditUser(index: number) {
    if (!this.viewData[index].canEdit) {
      return;
    }
    this.addEditUser = "Edit User";
    this.nonFieldErr = '';
    this.selectedUserIndex = index;
    this.createFormErrors = this.userService.resetFormErrors();
    this.createValidationMessages = this.userService.validationMessages;
    this.createForm = this.userService.createForm(this.viewData[this.selectedUserIndex]);
    this.subscribeToCarrierChange();
    this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  addUser() {
    this.selectedUserIndex = undefined;
    this.createFormErrors = this.userService.resetFormErrors();
    this.addEditUser = 'Add User';
    this.nonFieldErr = '';
    this.createValidationMessages = this.userService.validationMessages;
    this.createForm = this.userService.createForm();
    this.subscribeToCarrierChange();
    this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  subscribeToCarrierChange() {
    this.createForm.get('phone_number').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: number) => {
      if (this.createForm.get('phone_number').valid) {
        if (val) {
          this.createForm.get('carrier').setValidators([Validators.required]);
        } else {
          this.createForm.get('carrier').setValidators([]);
        }
      } else {
        this.createForm.get('carrier').setValidators([]);
      }
      this.createForm.get('carrier').updateValueAndValidity();
    });
  }

  handleError(err: any) {
    this.createFormErrors = this.userService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.createForm.controls) {
          this.createFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.createModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmCreate() {
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
        });
    } else {
      this.spinnerService.start('main');
      const data = this.createForm.getRawValue();
      data.user_roles = this.userRoles.filter(ur => ur.id == data.user_roles);
      if (this.selectedUserIndex == undefined) {
        this.userService.createUser(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
          this.createModalRef.hide();
          this.notificationService.success(new Notification('User added successfully.'));
          this.spinnerService.stop('main');
          this.getUsers();
          this.onCrud(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(err.error);
        });
      } else {
        this.userService.editUser(this.viewData[this.selectedUserIndex].uuid, data)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
            this.createModalRef.hide();
            this.notificationService.success(new Notification('User updated successfully'));
            this.spinnerService.stop('main');
            this.getUsers();
            this.onCrud(CRUDActionTypes.UPDATE);
          }, (err: HttpErrorResponse) => {
            this.spinnerService.stop('main');
            this.handleError(err.error);
          });
      }
    }
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
    this.userService.deleteUser(this.viewData[this.selectedUserIndex].uuid)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
        this.notificationService.success(new Notification('User deleted successfully'));
        this.spinnerService.stop('main');
        this.onCrud(CRUDActionTypes.DELETE);
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
    this.userService.inviteUser(this.viewData[index].uuid)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
        this.notificationService.success(new Notification('Invite email sent successfully.'));
        this.spinnerService.stop('main');
        this.onCrud(CRUDActionTypes.DELETE);
      }, (err: HttpErrorResponse) => {
        this.spinnerService.stop('main');
        this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
      }, () => {
      });
  }

  goToImportUsers() {
    this.router.navigate(['import-users'], { relativeTo: this.route });
  }

  userSyncInProgress: boolean = false;
  importUsers() {
    this.importUsersRefModalRef = this.modalService.show(this.importUsersRef, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmImportUsers(formRef: any) {
    this.userSyncInProgress = true;
    this.importUsersRefModalRef.hide();
    this.notificationService.success(new Notification('Importing users from Azure to UnityOne started.'));
    this.userService.importUsersFromAzureAD(formRef.form.get('azure_account').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.userSyncInProgress = false;
      this.notificationService.success(new Notification('Successfully imported all Azure users.'));
    }, (err: HttpErrorResponse) => {
      this.userSyncInProgress = false;
      this.notificationService.error(new Notification('Failed to import users from Azure.'));
    });
  }
}
