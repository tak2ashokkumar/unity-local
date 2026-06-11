import { Component, OnDestroy, OnInit } from '@angular/core';
import { MtpAdministrationSlaGroupCrudService } from './mtp-administration-sla-group-crud.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { MtpAdministrationSlaCRMInstance, MtpAdministrationSlaCRMTenants, MtpAdministrationSlaGroupCrudType } from './mtp-administration-sla-group-crud.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'mtp-administration-sla-group-crud',
  templateUrl: './mtp-administration-sla-group-crud.component.html',
  styleUrls: ['./mtp-administration-sla-group-crud.component.scss'],
  providers: [MtpAdministrationSlaGroupCrudService]
})
export class MtpAdministrationSlaGroupCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  groupId: string;
  action: 'Edit' | 'Create';
  tenants: MtpAdministrationSlaCRMTenants[] = [];

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';

  tenantSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "account_uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudSvc: MtpAdministrationSlaGroupCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.groupId = params.get('groupId');
      this.action = this.groupId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.getTenants();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTenants() {
    this.spinner.start('main');
    this.crudSvc.getTenants(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenants = res;
      this.buildForm();
    }, err => {
      this.tenants = [];
      this.buildForm();
      this.notification.error(new Notification('Error while fetching CRM tenants'));
    });
  }

  buildForm() {
    let obj = this.groupId ? { groupId: this.groupId, instanceId: this.user.crmInstanceId } : null;
    this.crudSvc.createForm(obj).pipe(take(1)).subscribe(res => {
      this.form = res;
      this.formErrors = this.crudSvc.resetFormErrors();
      this.formValidationMessages = this.crudSvc.validationMessages;
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while creating form'));
      this.spinner.stop('main');
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
      let obj = <MtpAdministrationSlaGroupCrudType>Object.assign({}, this.form.getRawValue());
      this.spinner.start('main');
      if (this.groupId) {
        this.crudSvc.updateGroup(this.user.crmInstanceId, this.groupId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('SLA group updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createGroup(this.user.crmInstanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
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