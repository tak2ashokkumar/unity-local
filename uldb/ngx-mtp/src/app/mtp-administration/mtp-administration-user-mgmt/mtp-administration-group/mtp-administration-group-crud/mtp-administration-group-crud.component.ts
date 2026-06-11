import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MtpAdministrationGroupCrudService } from './mtp-administration-group-crud.service';
import { GroupType } from '../mtp-administration-group.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { RoleType } from '../../mtp-administration-roles/mtp-administration-roles.type';
import { TenantType, UserType } from '../../mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'mtp-administration-group-crud',
  templateUrl: './mtp-administration-group-crud.component.html',
  styleUrls: ['./mtp-administration-group-crud.component.scss'],
  providers: [MtpAdministrationGroupCrudService]
})
export class MtpAdministrationGroupCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  userListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "email",
    keyToSelect: "email",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  roleListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  tenantListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  groupId: string;
  action: 'Create' | 'Update';
  group: GroupType;
  roles: Array<RoleType> = [];
  filteredRoles: Array<RoleType> = [];
  users: Array<UserType> = [];
  filteredUsers: Array<UserType> = [];
  tenantList: Array<TenantType> = [];

  groupForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudService: MtpAdministrationGroupCrudService,
    private spinner: AppSpinnerService,
    private utilservice: AppUtilityService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe(params => this.groupId = params.get('groupId'));
    if (this.groupId) {
      this.action = 'Update';
    } else {
      this.action = 'Create';
    }
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
    this.crudService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.tenants) {
        this.tenantList = res.tenants;
      } else {
        this.tenantList = [];
        this.notification.error(new Notification('Failed to get tenants. Try again later.'));
      }
      if (res.roles) {
        this.roles = res.roles;
      } else {
        this.roles = [];
        this.notification.error(new Notification('Failed to get roles. Try again later.'));
      }
      if (res.users) {
        this.users = res.users;
      } else {
        this.users = [];
        this.notification.error(new Notification('Failed to get users. Try again later.'));
      }
      this.addOrEditGroup();
    })
  }

  getTenants() {
    this.tenantList = [];
    this.crudService.getTenants(this.groupForm.get('group_type').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenantList = res;
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
    });
  }

  addOrEditGroup() {
    if (this.groupId) {
      this.crudService.getGroupData(this.groupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.group = data;
        this.buildForm(data);
        this.filteredUsers = this.users.filter(user => user.user_type == data.group_type);
        this.filteredRoles = this.roles.filter(role => role.role_type == data.group_type);
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
        this.spinner.stop('main');
      });
    } else {
      this.group = null;
      this.buildForm(this.group);
      this.spinner.stop('main');
    }
  }

  buildForm(data: GroupType) {
    this.groupForm = this.crudService.buildForm(data);
    this.formErrors = this.crudService.resetFormErrors();
    this.validationMessages = this.crudService.validationMessages;
    const type = this.groupForm.get('group_type').value;
    this.groupForm.get('group_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.filteredUsers = this.users.filter(user => user.user_type == value);
      this.filteredRoles = this.roles.filter(role => role.role_type == value);
      if (value == 'Tenant'){
        // this.groupForm.get('tenants').setValidators([Validators.required]);
        // this.groupForm.get('tenants').updateValueAndValidity();
      } else {
        this.getTenants();
        // this.groupForm.get('tenants').removeValidators([Validators.required]);
        // this.groupForm.get('tenants').updateValueAndValidity();
      }
      if (this.groupId) {
        if (value == type) {
          this.groupForm.get('users').setValue(data.users.map(user => user.email));
          this.groupForm.get('roles').setValue(data.roles.map(role => role.name));
        } else {
          this.groupForm.get('users').setValue([]);
          this.groupForm.get('roles').setValue([]);
        }
      } else {
        this.groupForm.get('users').setValue([]);
        this.groupForm.get('roles').setValue([]);
      }
    });
    this.groupForm.get('roles').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      if (this.groupForm.get('group_type').value == 'MSP') {
        if (value.includes('Super Admin')) {
          this.groupForm.get('tenants').setValue(this.tenantList.map(tenant => tenant.name));
        } else {
          if (this.groupId) {
            this.groupForm.get('tenants').setValue(data.tenants.map(tenant => tenant.name));
          } else {
            this.groupForm.get('tenants').setValue([]);
          }
        }
      }
    });
  }

  handleError(err: any) {
    this.formErrors = this.crudService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.groupForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.groupForm.invalid) {
      this.formErrors = this.utilservice.validateForm(this.groupForm, this.validationMessages, this.formErrors);
      this.groupForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilservice.validateForm(this.groupForm, this.validationMessages, this.formErrors)
      });
    } else {
      if (this.groupId) {
        this.spinner.start('main');
        this.crudService.updateGroup(this.groupForm.getRawValue(), this.groupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Group updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.spinner.start('main');
        this.crudService.createGroup(this.groupForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Group created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.groupId) {
      this.router.navigate(['../../'], { relativeTo: this.route });

    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
