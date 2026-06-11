import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MtpAdministrationRolesService, RoleViewData } from './mtp-administration-roles.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup, Validators } from '@angular/forms';
import { UserType } from '../mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'mtp-administration-roles',
  templateUrl: './mtp-administration-roles.component.html',
  styleUrls: ['./mtp-administration-roles.component.scss'],
  providers: [MtpAdministrationRolesService]
})
export class MtpAdministrationRolesComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  viewData: RoleViewData[] = [];
  count: number;
  selectedUsers: UserType[] = [];
  roleId: number;
  noUsers: boolean = false;
  userList: Array<UserType> = [];
  filteredUserList: Array<UserType> = [];

  @ViewChild('assign') assign: ElementRef;
  modalRef: BsModalRef;
  roleForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  constructor(private modalService: BsModalService,
    private roleService: MtpAdministrationRolesService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ role_type: '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getUsers()
    this.getRoles();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ role_type: '' }] };
    this.getRoles();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getRoles();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getRoles();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getRoles();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getRoles();
  }

  getUsers() {
    this.userList = [];
    this.roleService.getUsers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.userList = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get users.'));
      this.spinner.stop('main');
    });
  }

  getRoles() {
    this.roleService.getRoles(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.roleService.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get roles.'));
    });
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getRoles();
  }

  setUserFieldValidation() {
    if (this.selectedUsers.length) {
      this.roleForm.get('users').setValidators([]);
    } else {
      this.roleForm.get('users').setValidators([Validators.required, NoWhitespaceValidator]);
    }
    this.roleForm.get('users').updateValueAndValidity();
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.roleForm.get('users').setValue('');
    if (this.selectedUsers.filter(user => user.email == e.item.email).length) {
      return;
    }
    this.selectedUsers.push(e.item);
    this.setUserFieldValidation();
  }

  typeaheadNoResults(event: boolean): void {
    this.noUsers = event;
  }

  manageSelectedUsers(index: number) {
    this.selectedUsers.splice(index, 1);
    this.setUserFieldValidation();
  }

  assignUser(view: RoleViewData) {
    this.filteredUserList = this.userList.filter(user => user.user_type == view.userType);
    this.roleId = view.id;
    this.selectedUsers = [];
    this.nonFieldErr = '';
    this.roleForm = this.roleService.buildForm();
    this.formErrors = this.roleService.resetFormErrors();
    this.validationMessages = this.roleService.validationMessages;
    this.modalRef = this.modalService.show(this.assign, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.formErrors = this.roleService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.roleForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submitForm() {
    if (this.roleForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.roleForm, this.validationMessages, this.formErrors);
      this.roleForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.roleForm, this.validationMessages, this.formErrors); });
    } else {
      this.spinner.start('main');
      const data = this.roleForm.getRawValue();
      data.users = this.selectedUsers.map(user => user.email);
      this.roleService.assignRole(data, this.roleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
        this.modalRef.hide();
        this.notification.success(new Notification('Role assigned successfully.'));
        this.spinner.stop('main');
        this.getRoles();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      });
    }
  }

}
