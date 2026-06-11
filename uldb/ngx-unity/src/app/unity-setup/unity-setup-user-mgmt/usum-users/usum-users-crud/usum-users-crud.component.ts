import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectedUserGroup, UsumUsersCrudService } from './usum-users-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { finalize, takeUntil } from 'rxjs/operators';
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
  private readonly ngUnsubscribe = new Subject<void>();
  private revalidateBound = false;
  userId: string;
  action: 'Create' | 'Edit';

  form: FormGroup;
  formErrors: Record<string, string>;
  formValidationMessages: any;
  nonFieldErr = '';

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
  constructor(private svc: UsumUsersCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilSvc: AppUtilityService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.userId = params.get('userId');
      this.action = this.userId ? 'Edit' : 'Create';
    });
    this.spinnerSvc.start('main');
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownData(): void {
    this.carriers = [];
    this.userGroups = [];
    this.userRoleList = [];
    this.userRoles = [];
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ carriers, userGroups, userRoles }) => {
      if (carriers) {
        this.carriers = _clone(carriers);
      } else {
        this.carriers = [];
        this.notificationSvc.error(new Notification("Error while fetching Carriers list"));
      }

      if (userGroups) {
        this.userGroups = _clone(userGroups);
      } else {
        this.userGroups = [];
        this.notificationSvc.error(new Notification("Error while fetching User Groups list"));
      }

      if (userRoles) {
        this.userRoleList = _clone(userRoles);
        this.userRoles = _clone(userRoles);
      } else {
        this.userRoleList = [];
        this.userRoles = [];
        this.notificationSvc.error(new Notification("Error while fetching User Roles"));
      }

      if (this.userId) {
        this.getUserDetails();
      } else {
        this.buildForm();
      }
    });
  }

  getUserDetails(): void {
    this.svc.getUserDetails(this.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.userDetails = res;
      this.buildForm();
    }, () => {
      this.spinnerSvc.stop('main');
      this.notificationSvc.error(new Notification('Failed to fetch User details'));
    })
  }

  buildForm(): void {
    this.form = this.svc.buildForm(this.userDetails);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    if (this.userId) {
      const userGroupsIds: string[] = this.form.get('user_groups').value;
      this.selectedUserGroups = this.userGroups.filter((group) => userGroupsIds.includes(group.uuid));
      this.userRolesByUserGroup = this.userRoleList.filter(ur => this.selectedUserGroups.find(ug => ug.applicable_rbac_roles.find(role => role.id === ur.id)));
      this.selectedUserRoles = this.userRoles.filter(ur => this.userDetails.rbac_roles.includes(ur.uuid));
      this.updateUserRolesByUserGroupSelection();
    }
    this.subscribeToFormChanges()
    this.spinnerSvc.stop('main');
  }

  updateUserRolesByUserGroupSelection(): void {
    let roles = [];
    for (let i = 0; i < this.userRoleList.length; i++) {
      const roleExists = this.userRolesByUserGroup.find(urByUg => urByUg.uuid === this.userRoleList[i].uuid);
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

  subscribeToFormChanges(): void {
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
      userGroups = userGroups.filter(ug => val.find(ugId => ugId === ug.uuid));
      userGroups.forEach(ug => ug.isForceIncluded = false);
      this.userRolesByUserGroup = this.userRoleList.filter(ur => userGroups.find(ug => ug.applicable_rbac_roles.find(role => role.id === ur.id)));
      this.selectedUserGroups = userGroups;
      this.updateUserRolesByUserGroupSelection();
    });
    this.form.get('rbac_roles').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string[]) => {
      this.selectedUserRoles = this.userRoles.filter(ur => val.includes(ur.uuid));
    });
  }

  isRequiredField(field: string): boolean {
    let abstractControl = this.form.controls[field];
    return abstractControl.hasValidator(Validators.required);
  }

  isCarrierFieldRequiredField(): boolean {
    let abstractControl = this.form.controls['phone_number'];
    if (abstractControl.value && abstractControl.valid) {
      return true;
    }
    return false;
  }

  unSelectUserGroup(index: number): void {
    this.selectedUserGroups.splice(index, 1);
    this.form.get('user_groups').setValue(this.selectedUserGroups.map((selectedGroup) => selectedGroup.uuid));
  }

  unSelectUserRole(index: number): void {
    this.selectedUserRoles.splice(index, 1);
    this.form.get('rbac_roles').setValue(this.selectedUserRoles.map(role => role.uuid));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.bindRevalidationOnChanges();
      return;
    }
    this.spinnerSvc.start('main');
    const fd = this.form.getRawValue();
    fd.rbac_roles = [...this.userRolesByUserGroup.map((r) => r.uuid), ...fd.rbac_roles];
    if (this.userId) {
      this.svc.editUser(this.userId, fd)
        .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
        .subscribe(() => {
          this.notificationSvc.success(new Notification('User updated successfully'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    } else {
      this.svc.createUser(fd)
        .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
        .subscribe(() => {
          this.notificationSvc.success(new Notification('User added successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    }
  }

  // Re-validate on every change once the user has attempted submit. Bound once
  // so repeated invalid submits do not stack valueChanges subscriptions.
  private bindRevalidationOnChanges(): void {
    if (this.revalidateBound) {
      return;
    }
    this.revalidateBound = true;
    this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
    });
  }

  handleError(err: any): void {
    this.formErrors = this.svc.resetFormErrors();
    if (!err) {
      this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
      return;
    }
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  goBack(): void {
    if (this.userId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}