import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MTPUserDetailsDataType, MtpTenantsMgmtUserDetailsUpdateService, MtpUserRolesDataType, UserPhoneCarrier } from './mtp-tenants-mgmt-user-details-update.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'mtp-tenants-mgmt-user-details-update',
  templateUrl: './mtp-tenants-mgmt-user-details-update.component.html',
  styleUrls: ['./mtp-tenants-mgmt-user-details-update.component.scss'],
  providers: [MtpTenantsMgmtUserDetailsUpdateService]
})
export class MtpTenantsMgmtUserDetailsUpdateComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  tenantId: string;
  userUuid: string;
  tenantUuid: string;
  groupTenantId: string;
  userRoles: MtpUserRolesDataType[] = [];
  carriers: UserPhoneCarrier[] = [];
  userInfo: MTPUserDetailsDataType;
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';
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
  constructor(private router: Router,
    private route: ActivatedRoute,
    private MtpUserUpdateSvc: MtpTenantsMgmtUserDetailsUpdateService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.userUuid = params.get('useruuid');
      this.tenantUuid = params.get('tenantuuid');
      this.groupTenantId = params.get('groupId');

      this.editUserDetails();
    });
  }

  ngOnInit(): void {
    this.getUserRoles();
    this.getCarriers();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  editUserDetails() {
    this.spinner.start('main');
    this.MtpUserUpdateSvc.editUserDetails(this.userUuid, this.tenantUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userInfo = res;
      this.buildFilterForm();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching user Info. Please try again'));
    });
  }

  buildFilterForm() {
    this.form = this.MtpUserUpdateSvc.buildForm(this.userInfo);
    this.formErrors = this.MtpUserUpdateSvc.resetFormErrors();
    this.formValidationMessages = this.MtpUserUpdateSvc.formValidationMessages;
    this.spinner.stop('main');
  }

  getCarriers() {
    this.MtpUserUpdateSvc.getCarriers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.carriers = data;
    });
  }

  getUserRoles() {
    this.userRoles = [];
    this.MtpUserUpdateSvc.getUserRoles().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.userRoles = data;
    });
  }

  handleError(err: any) {
    this.formErrors = this.MtpUserUpdateSvc.resetFormErrors();
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
      this.goBack();
    }
    this.spinner.stop('main');
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      this.spinner.start('main');
      if (this.userUuid, this.tenantUuid) {
        let obj = this.form.getRawValue();
        this.MtpUserUpdateSvc.editUser(obj, this.userUuid, this.tenantUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notification.success(new Notification('User Updated Successfully.'));
          this.goBack();
        }, err => {
          this.handleError(err.error);
          this.spinner.stop('main');
          // this.notification.error(new Notification('Error while Updating User. Please try again'));
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['../../../../'], { relativeTo: this.route, queryParams: { tenantId: this.tenantUuid, groupId: this.groupTenantId } });
  }

}
