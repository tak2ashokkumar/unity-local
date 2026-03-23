import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsumRolesCrudService } from './usum-roles-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { cloneDeep as _clone } from 'lodash-es';
import { PermissionSetType, RoleType, UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';

@Component({
  selector: 'usum-roles-crud',
  templateUrl: './usum-roles-crud.component.html',
  styleUrls: ['./usum-roles-crud.component.scss'],
  providers: [UsumRolesCrudService]
})
export class UsumRolesCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  action: 'Create' | 'Edit';
  nonFieldErr: string = '';
  roleId: string;
  roleDetails: RoleType;
  permissionSet: PermissionSetType[] = [];
  userList: string[] = [];
  selectedUserList: string[] = [];
  userGroups: UserGroupType[] = [];
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  userGroupsSettings: IMultiSelectSettings = {
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

  permissionSetSettings: IMultiSelectSettings = {
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

  constructor(private crudSvc: UsumRolesCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.roleId = params.get('roleId');
      this.action = this.roleId ? 'Edit' : 'Create';
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

  getRoleDetails() {
    this.crudSvc.getRoleDetails(this.roleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.roleDetails = res;
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Role details'));
    })
  }

  getDropdownData() {
    this.userGroups = [];
    this.userList = [];
    this.permissionSet = [];
    this.crudSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ permissionSet, userGroups, userList }) => {
      if (permissionSet) {
        this.permissionSet = _clone(permissionSet);
      } else {
        this.permissionSet = [];
        this.notification.error(new Notification("Error while fetching Permission Set"));
      }

      if (userGroups) {
        this.userGroups = _clone(userGroups);
      } else {
        this.userGroups = [];
        this.notification.error(new Notification("Error while fetching User Groups list"));
      }

      if (userList) {
        this.userList = _clone(userList);
      } else {
        this.userList = [];
        this.notification.error(new Notification("Error while fetching User List list"));
      }


      if (this.roleId) {
        this.getRoleDetails();
      } else {
        this.buildForm();
      }
    });
  }

  buildForm() {
    this.form = this.crudSvc.buildForm(this.roleDetails);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.formValidationMessages = this.crudSvc.formValidationMessages;
    this.form.get('users').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.selectedUserList = this.form.get('users').value;
    });
    if (this.roleId) {
      this.selectedUserList = this.form.get('users').value;
    };
    this.spinner.stop('main');
  }

  unSelectUser(index: number) {
    this.selectedUserList.splice(index, 1);
    this.form.get('users').setValue(this.selectedUserList);
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
      if (this.roleId) {
        this.crudSvc.update(fd, this.roleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Role updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.add(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Role created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.roleId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}