import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { RoleType } from '../../mtp-administration-roles/mtp-administration-roles.type';
import { MtpAdministrationUsersCrudService } from './mtp-administration-users-crud.service';
import { CarrierType, TenantType, UserType } from './mtp-administration-users-crud.type';
import { GroupType } from '../../mtp-administration-group/mtp-administration-group.type';

@Component({
  selector: 'mtp-administration-users-crud',
  templateUrl: './mtp-administration-users-crud.component.html',
  styleUrls: ['./mtp-administration-users-crud.component.scss'],
  providers: [MtpAdministrationUsersCrudService]
})
export class MtpAdministrationUsersCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  tenantListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
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
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  selectedType: string = null;
  userId: string;
  action: 'Create' | 'Update';
  user: UserType;
  roles: Array<RoleType> = [];
  groups: Array<GroupType> = [];
  filteredGroups: Array<GroupType> = [];
  filteredRoles: Array<RoleType> = [];
  tenantList: Array<TenantType> = [];
  carrierList: Array<CarrierType> = [];

  userForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudService: MtpAdministrationUsersCrudService,
    private spinner: AppSpinnerService,
    private utilservice: AppUtilityService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe(params => this.userId = params.get('userId'));
    if (this.userId) {
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
      if (res.groups) {
        this.groups = res.groups;
      } else {
        this.groups = [];
        this.notification.error(new Notification('Failed to get groups. Try again later.'));
      }
      if (res.carriers) {
        this.carrierList = res.carriers;
      } else {
        this.carrierList = [];
        this.notification.error(new Notification('Failed to get carriers. Try again later.'));
      }
      this.addOrEditUser();
    })
  }

  getTenants() {
    this.tenantList = [];
    this.crudService.getTenants(this.userForm.get('user_type').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenantList = res;
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
    });
  }

  addOrEditUser() {
    if (this.userId) {
      this.crudService.getUserData(this.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.user = data;
        this.buildForm(data);
        this.filteredRoles = this.roles.filter(role => role.role_type == data.user_type);
        this.filteredGroups = this.groups.filter(group => group.group_type == data.user_type);
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
        this.spinner.stop('main');
      });
    } else {
      this.user = null;
      this.buildForm(this.user);
      this.spinner.stop('main');
    }
  }

  buildForm(data: UserType) {
    this.userForm = this.crudService.buildForm(data);
    this.formErrors = this.crudService.resetFormErrors();
    this.validationMessages = this.crudService.validationMessages;
    if (this.userId) {
      // this.userForm.get('email').disable();
      if (data.user_groups.length) {
        this.userForm.get('user_roles').disable();
        if (data.user_type == 'MSP') {
          this.userForm.get('tenants').disable();
        } else {
          // this.userForm.get('org').disable();
        }
      } else if (data.user_roles.length || data.tenants.length) {
        this.userForm.get('user_groups').disable();
      }
    }
    const type = this.userForm.get('user_type').value;
    this.userForm.get('user_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.filteredRoles = this.roles.filter(role => role.role_type == value);
      this.filteredGroups = this.groups.filter(group => group.group_type == value);
      if (value == 'MSP') {
        this.getTenants();
        // this.userForm.addControl('tenants', new FormControl([]));
        // this.userForm.removeControl('org');
        this.userForm.get('org').reset();
        this.userForm.get('org').removeValidators([Validators.required]);
        this.userForm.get('org').updateValueAndValidity();
        this.userForm.get('tenants').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          if (res != '' || this.userForm.get('user_roles').value != '') {
            this.userForm.get('user_groups').disable({ emitEvent: false });
          } else {
            this.userForm.get('user_groups').enable({ emitEvent: false });
          }
        });
      } else {
        this.userForm.get('org').setValidators([Validators.required]);
        this.userForm.get('org').updateValueAndValidity();
        // this.userForm.addControl('org', new FormControl(null, [Validators.required]))
        // this.userForm.removeControl('tenants');
        // DISABLE BASED ON ORG
        // this.userForm.get('org').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res =>{
        //   if (res != '' || this.userForm.get('user_roles').value != '') {
        //     this.userForm.get('user_groups').disable({ emitEvent: false });
        //   } else {
        //     this.userForm.get('user_groups').enable({ emitEvent: false });
        //   }
        // });
      }
      if (this.userId) {
        if (value == type) {
          this.userForm.get('user_roles').setValue(data.user_roles.map(role => role.name));
          this.userForm.get('user_groups').setValue(data.user_groups);
          this.userForm.get('org').setValidators([Validators.required]);
          this.userForm.get('org').updateValueAndValidity();
        } else {
          this.userForm.get('user_roles').setValue([]);
          this.userForm.get('user_groups').setValue('');
          if (this.userForm.get('user_groups').value == '') {
            this.userForm.get('user_roles').enable({ emitEvent: false });
          }
          if (!this.userForm.get('user_roles').value.length) {
            this.userForm.get('user_groups').enable({ emitEvent: false });
          }
          this.userForm.get('org').removeValidators([Validators.required]);
          this.userForm.get('org').updateValueAndValidity();
        }
      } else {
        this.userForm.get('user_roles').setValue([]);
        this.userForm.get('user_groups').setValue('');
        if (this.userForm.get('user_groups').value == '') {
          this.userForm.get('user_roles').enable({ emitEvent: false });
        }
        if (!this.userForm.get('user_roles').value.length) {
          this.userForm.get('user_groups').enable({ emitEvent: false });
        }
      }
    });
    this.userForm.get('user_groups').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res != '') {
        this.userForm.get('user_roles').disable({ emitEvent: false });
        if (this.userForm.get('user_type').value == 'MSP') {
          this.userForm.get('tenants').disable({ emitEvent: false });
        } else {
          // this.userForm.get('org').disable({ emitEvent: false });
        }
      } else {
        this.userForm.get('user_roles').enable({ emitEvent: false });
        if (this.userForm.get('user_type').value == 'MSP') {
          this.userForm.get('tenants').enable({ emitEvent: false });
        } else {
          // this.userForm.get('org').enable({ emitEvent: false });
        }
      }
    });
    this.userForm.get('user_roles').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      if (value != '' || this.userForm.get('tenants').value != '') {
        this.userForm.get('user_groups').disable({ emitEvent: false });
      } else {
        this.userForm.get('user_groups').enable({ emitEvent: false });
      }
      if (this.userForm.get('user_type').value == 'MSP') {
        if (value.includes('Super Admin')) {
          this.userForm.get('tenants').setValue(this.tenantList.map(tenant => tenant.name));
        } else {
          if (this.userId) {
            this.userForm.get('tenants').setValue(data.tenants.map(tenant => tenant.name));
          } else {
            this.userForm.get('tenants').setValue([]);
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
        if (field in this.userForm.controls) {
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
    if (this.userForm.invalid) {
      this.formErrors = this.utilservice.validateForm(this.userForm, this.validationMessages, this.formErrors);
      this.userForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilservice.validateForm(this.userForm, this.validationMessages, this.formErrors)
      });
    } else {
      let obj = Object.assign({}, this.userForm.getRawValue());
      if(obj.user_type == 'MSP'){
        delete obj.org;
      } else {
        delete obj.tenants;
      }
      if (this.userId) {
        this.spinner.start('main');
        this.crudService.updateUser(obj, this.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('User updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.spinner.start('main');
        this.crudService.createUser(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('User created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.userId) {
      this.router.navigate(['../../'], { relativeTo: this.route });

    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
