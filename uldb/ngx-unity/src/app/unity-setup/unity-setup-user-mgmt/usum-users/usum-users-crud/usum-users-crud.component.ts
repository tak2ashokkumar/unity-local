import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectedUserGroup, UsumUsersCrudService } from './usum-users-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { UserPhoneCarrier } from '../usum-users.service';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { cloneDeep as _clone } from 'lodash-es';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { RoleType, UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';

@Component({
  selector: 'usum-users-crud',
  templateUrl: './usum-users-crud.component.html',
  styleUrls: ['./usum-users-crud.component.scss'],
  providers: [UsumUsersCrudService]
})
export class UsumUsersCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  userId: string;
  action: 'Create' | 'Edit';

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';

  userDetails: UnitySetupUser;
  carriers: UserPhoneCarrier[] = [];

  userGroups: UserGroupType[] = [];
  selectedUserGroups: SelectedUserGroup[] = [];

  userRoleList: RoleType[] = []; // fixed list from backend
  userRoles: RoleType[] = []; // Change based on group selection
  selectedUserRoles: RoleType[] = [];
  userRolesByUserGroup: RoleType[] = [];

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
  constructor(private crudSvc: UsumUsersCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.userId = params.get('userId');
      this.action = this.userId ? 'Edit' : 'Create';
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

  getDropdownData() {
    this.carriers = [];
    this.userGroups = [];
    this.userRoleList = [];
    this.userRoles = [];
    this.crudSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ carriers, userGroups, userRoles }) => {
      if (carriers) {
        this.carriers = _clone(carriers);
      } else {
        this.carriers = [];
        this.notification.error(new Notification("Error while fetching Carriers list"));
      }

      if (userGroups) {
        this.userGroups = _clone(userGroups);
      } else {
        this.userGroups = [];
        this.notification.error(new Notification("Error while fetching User Groups list"));
      }

      if (userRoles) {
        this.userRoleList = _clone(userRoles);
        this.userRoles = _clone(userRoles);
      } else {
        this.userRoleList = [];
        this.userRoles = [];
        this.notification.error(new Notification("Error while fetching User Roles"));
      }

      if (this.userId) {
        this.getUserDetails();
      } else {
        this.buildForm();
      }
    });
  }

  getUserDetails() {
    this.crudSvc.getUserDetails(this.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.userDetails = res;
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch User details'));
    })
  }

  buildForm() {
    this.form = this.crudSvc.buildForm(this.userDetails);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.formValidationMessages = this.crudSvc.formValidationMessages;
    if (this.userId) {
      const userGroupsIds: string[] = this.form.get('user_groups').value;
      this.selectedUserGroups = this.userGroups.filter((group) => userGroupsIds.includes(group.uuid));
      this.userRolesByUserGroup = this.userRoleList.filter(ur => this.selectedUserGroups.find(ug => ug.applicable_rbac_roles.find(role => role.id == ur.id)));
      this.selectedUserRoles = this.userRoles.filter(ur => this.userDetails.rbac_roles.includes(ur.uuid));
      this.updateUserRolesByUserGroupSelection();
    }
    this.subscribeToFormChanges()
    this.spinner.stop('main');
  }

  updateUserRolesByUserGroupSelection() {
    let roles = [];
    for (let i = 0; i < this.userRoleList.length; i++) {
      let roleExists = this.userRolesByUserGroup.find(urByUg => urByUg.uuid == this.userRoleList[i].uuid);
      if (!roleExists) {
        roles.push(this.userRoleList[i]);
      }
    }
    this.userRoles = roles;
    const removedRolesPresentInUserRoleByUserGroup = [];
    const userRoleIdsByuserGroups = this.userRolesByUserGroup.map(urBYug => urBYug.uuid);
    for (let i = 0; i < this.selectedUserRoles.length; i++) {
      if (!userRoleIdsByuserGroups.includes(this.selectedUserRoles[i].uuid)) {
        removedRolesPresentInUserRoleByUserGroup.push(this.selectedUserRoles[i]);
      }
    }
    this.selectedUserRoles = removedRolesPresentInUserRoleByUserGroup;
    this.form.get('rbac_roles').setValue(this.selectedUserRoles.map(role => role.uuid), { emitEvent: false });
  }

  subscribeToFormChanges() {
    this.form.get('phone_number').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: number) => {
      if (val && this.form.get('phone_number').valid) {
        this.form.get('carrier').setValidators([Validators.required]);
      } else {
        this.form.get('carrier').setValidators([]);
      }
      this.form.get('carrier').updateValueAndValidity();
    });
    this.form.get('user_groups').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string[]) => {
      let userGroups: SelectedUserGroup[] = _clone(this.userGroups);
      userGroups = userGroups.filter(ug => val.find(ugId => ugId == ug.uuid));
      userGroups.forEach(ug => ug.isForceIncluded = false);
      this.userRolesByUserGroup = this.userRoleList.filter(ur => userGroups.find(ug => ug.applicable_rbac_roles.find(role => role.id == ur.id)));
      this.selectedUserGroups = userGroups;
      this.updateUserRolesByUserGroupSelection();
    });
    this.form.get('rbac_roles').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string[]) => {
      this.selectedUserRoles = this.userRoles.filter(ur => val.includes(ur.uuid));
    });
  }

  isRequiredField(field: string) {
    let abstractControl = this.form.controls[field];
    return abstractControl.hasValidator(Validators.required);
  }

  isCarrierFieldRequiredField() {
    let abstractControl = this.form.controls['phone_number'];
    if (abstractControl.value && abstractControl.valid) {
      return true;
    }
    return false;
  }

  unSelectUserGroup(index: number) {
    this.selectedUserGroups.splice(index, 1);
    this.form.get('user_groups').setValue(this.selectedUserGroups.map((selectedGroup) => selectedGroup.uuid));
  }

  unSelectUserRole(index: number) {
    this.selectedUserRoles.splice(index, 1);
    this.form.get('rbac_roles').setValue(this.selectedUserRoles.map(role => role.uuid));
  }

  onSubmit() {
    // const rolesIds = [...this.userRolesByUserGroup.map((r) => r.uuid), ...this.form.getRawValue().rbac_roles];
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      const fd = this.form.getRawValue();
      fd.rbac_roles = [...this.userRolesByUserGroup.map((r) => r.uuid), ...fd.rbac_roles];
      if (this.userId) {
        this.crudSvc.editUser(this.userId, fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
          this.notification.success(new Notification('User updated successfully'));
          this.spinner.stop('main');
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createUser(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
          this.notification.success(new Notification('User added successfully.'));
          this.spinner.stop('main');
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
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

  goBack() {
    if (this.userId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}