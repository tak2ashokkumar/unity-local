import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnitySetupLdapCrudService } from './unity-setup-ldap-crud.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UnityScheduleService } from '../unity-schedule/unity-schedule.service';
import { LDAPConfigType } from 'src/app/unity-setup/unity-setup-ldap-config/unity-setup-ldap-config.type';

@Component({
  selector: 'unity-setup-ldap-crud',
  templateUrl: './unity-setup-ldap-crud.component.html',
  styleUrls: ['./unity-setup-ldap-crud.component.scss']
})
export class UnitySetupLdapCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  actionMessage: 'Create' | 'Edit';
  ldapConfigId: string;
  ldapConfigData: LDAPConfigType;

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;
  credentialFormData: any;

  activeForm: string = 'credentialForm';
  nonFieldErr: string = '';
  scheduleFormData: any;
  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: UnitySetupLdapCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.ldapConfigId = params.get('ldapConfigId');
      this.actionMessage = this.ldapConfigId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.ldapConfigId) {
      this.getLDAPConfigDetails();
    } else {
      this.manageActiveForm();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getLDAPConfigDetails() {
    this.crudSvc.getLDAPConfigDetails(this.ldapConfigId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ldapConfigData = res;
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.ldapConfigData = null;
      this.manageActiveForm();
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'credentialForm':
        this.activeForm = formName;
        break;
      case 'scheduleForm':
        if (this.credentialForm && this.credentialForm.valid) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          this.onSubmitCredentialForm();
        }
        break;
      default:
        this.activeForm = 'credentialForm';
        this.buildCredentialsForm();
        if (this.ldapConfigId) {
          this.buildScheduleForm();
        }
    }
    this.spinner.stop('main');
  }

  buildCredentialsForm() {
    this.credentialForm = this.crudSvc.buildCredentialForm(this.ldapConfigData);
    this.credentialFormErrors = this.crudSvc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.crudSvc.credentialFormValidationMessages;
    this.credentialFormData = this.credentialForm.getRawValue();
  }

  onSubmitCredentialForm() {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      });
    } else {
      this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm() {
    if (this.ldapConfigId) {
      this.scheduleSvc.addOrEdit(this.ldapConfigData.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.onSubmit(runNowFlag);
    }
  }

  handleError(err: any) {
    this.credentialFormErrors = this.crudSvc.resetCredentialFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.activeForm = 'credentialForm';
          this.credentialFormErrors[field] = err[field][0];
        } else {
          this.scheduleSvc.handleError(err);
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit(runNowFlag: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.credentialForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    if (this.ldapConfigId) {
      this.crudSvc.editLDAPConfig(this.ldapConfigId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('LDAP Config updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.crudSvc.createLDAPConfig(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('LDAP Config created successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  goBack() {
    if (this.router.url.includes('integration') || this.ldapConfigId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}