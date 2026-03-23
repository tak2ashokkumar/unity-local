import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsumUserGroupsCrudService } from './usum-user-groups-crud.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { cloneDeep as _clone } from 'lodash-es';
import { RoleType, UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';

@Component({
  selector: 'usum-user-groups-crud',
  templateUrl: './usum-user-groups-crud.component.html',
  styleUrls: ['./usum-user-groups-crud.component.scss'],
  providers: [UsumUserGroupsCrudService]
})
export class UsumUserGroupsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  action: 'Create' | 'Edit';
  nonFieldErr: string = '';
  userGroupId: string;
  userGroupDetails: UserGroupType;
  rolesList: RoleType[] = [];
  userList: string[] = [];
  selectedUserList: string[] = [];
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  rolesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  userListSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private crudSvc: UsumUserGroupsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.userGroupId = params.get('userGroupId');
      this.action = this.userGroupId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUserGroupDetails() {
    this.crudSvc.getUserGroupDetails(this.userGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.userGroupDetails = res;
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch User Group details'));
    })
  }

  getDropdownData() {
    this.rolesList = [];
    this.userList = [];
    this.crudSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ rolesList, userList }) => {
      if (rolesList) {
        this.rolesList = _clone(rolesList);
      } else {
        this.rolesList = [];
        this.notification.error(new Notification("Error while fetching Roles list"));
      }

      if (userList) {
        this.userList = _clone(userList);
      } else {
        this.userList = [];
        this.notification.error(new Notification("Error while fetching User list"));
      }

      if (this.userGroupId) {
        this.getUserGroupDetails();
      } else {
        this.buildForm();
      }
    });
  }

  buildForm() {
    this.form = this.crudSvc.buildForm(this.userGroupDetails);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.formValidationMessages = this.crudSvc.formValidationMessages;
    this.form.get('rbac_users').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.selectedUserList = this.form.get('rbac_users').value;
    })
    if (this.userGroupId) {
      this.selectedUserList = this.form.get('rbac_users').value;
    }
    this.spinner.stop('main');
  }

  unSelectUser(index: number) {
    this.selectedUserList.splice(index, 1);
    this.form.get('rbac_users').setValue(this.selectedUserList);
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
        });
    } else {
      this.spinner.start('main');
      const fd = Object.assign({}, this.form.getRawValue());
      if (this.userGroupId) {
        this.crudSvc.update(fd, this.userGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('User Group updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.add(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('User Group created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.userGroupId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}