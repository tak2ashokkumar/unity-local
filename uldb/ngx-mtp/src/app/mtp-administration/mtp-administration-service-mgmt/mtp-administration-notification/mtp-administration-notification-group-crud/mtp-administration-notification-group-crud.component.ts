import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Tenant } from 'src/app/shared/SharedEntityTypes/tenants.type';
import { MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { MTPUserGroupType } from 'src/app/shared/SharedEntityTypes/user.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { MtpAdministrationNotificationGroupCrudService, modes, severityOptions } from './mtp-administration-notification-group-crud.service';

@Component({
  selector: 'mtp-administration-notification-group-crud',
  templateUrl: './mtp-administration-notification-group-crud.component.html',
  styleUrls: ['./mtp-administration-notification-group-crud.component.scss'],
  providers: [MtpAdministrationNotificationGroupCrudService]
})
export class MtpAdministrationNotificationGroupCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  groupId: string;
  action: 'Edit' | 'Create';

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';
  crmInstance: MTPTicketInstance;
  tenants: Tenant[] = [];
  userGroups: MTPUserGroupType[] = [];
  severityOptions = severityOptions;
  modes = modes;

  tenantSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  userGroupSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  alertTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: 'value',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  modeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: 'value',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };


  constructor(private crudSvc: MtpAdministrationNotificationGroupCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.groupId = params.get('groupId');
      this.action = this.groupId ? 'Edit' : 'Create';
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
    this.tenants = [];
    this.userGroups = [];
    this.crudSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ tenants, userGroups }) => {
      if (tenants) {
        this.tenants = _clone(tenants);
      } else {
        this.tenants = [];
      }
      
      if (userGroups) {
        this.userGroups = _clone(userGroups);
      } else {
        this.userGroups = [];
      }
      this.buildForm();
      this.spinner.stop('main');
    });
  }

  buildForm() {
    this.crudSvc.createForm(this.groupId).pipe(take(1)).subscribe(res => {
      this.form = res;
      this.formErrors = this.crudSvc.resetFormErrors();
      this.formValidationMessages = this.crudSvc.validationMessages;
    });
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

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      let obj = Object.assign({}, this.form.getRawValue());
      this.spinner.start('main');
      if (this.groupId) {
        this.crudSvc.updateGroup(this.groupId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('SLA group updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createGroup(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('SLA group Created successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
