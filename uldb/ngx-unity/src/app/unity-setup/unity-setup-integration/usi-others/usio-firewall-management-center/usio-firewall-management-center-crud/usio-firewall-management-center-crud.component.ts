import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { FirewallManagementCenterAccountType } from '../usio-firewall-management-center.type';
import { FirewallManagementCenterCredentialFormErrors, UsioFirewallManagementCenterCrudService } from './usio-firewall-management-center-crud.service';

@Component({
  selector: 'usio-firewall-management-center-crud',
  templateUrl: './usio-firewall-management-center-crud.component.html',
  styleUrls: ['./usio-firewall-management-center-crud.component.scss'],
  providers: [UsioFirewallManagementCenterCrudService]
})
export class UsioFirewallManagementCenterCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private credentialFormChangesSubscribed: boolean = false;

  actionMessage: 'Create' | 'Edit' = 'Create';
  accountId: string = '';
  accountData: FirewallManagementCenterAccountType | null = null;

  credentialForm!: FormGroup;
  credentialFormErrors: FirewallManagementCenterCredentialFormErrors = {
    name: '',
    account_url: '',
    port: '',
    username: '',
    password: '',
    collector: ''
  };
  credentialFormValidationMessages: any = null;
  credentialFormData: any = null;

  activeForm: string = 'credentialForm';
  nonFieldErr: string = '';

  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleSvc: UnityScheduleService,
    private crudSvc: UsioFirewallManagementCenterCrudService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId') || '';
      this.actionMessage = this.accountId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCollectors();
    if (this.accountId) {
      this.getAccountDetails();
    } else {
      this.manageActiveForm();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAccountDetails(): void {
    this.crudSvc.getAccountDetails(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.accountData = res;
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.accountData = null;
      this.notification.error(new Notification('Failed to get Firewall Management Center account details. Please try again.'));
      this.manageActiveForm();
    });
  }

  getCollectors(): void {
    this.crudSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    }, (err: HttpErrorResponse) => {
      this.collectors = [];
      this.notification.error(new Notification('Failed to get collectors. Please try again.'));
    });
  }

  manageActiveForm(formName?: string): void {
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
        if (this.accountId) {
          this.buildScheduleForm();
        }
    }
    this.spinner.stop('main');
  }

  buildCredentialsForm(): void {
    this.credentialForm = this.crudSvc.buildCredentialForm(this.accountData);
    this.credentialFormErrors = this.crudSvc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.crudSvc.credentialFormValidationMessages;
    this.credentialFormData = this.credentialForm.getRawValue();
  }

  onSubmitCredentialForm(): void {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      if (!this.credentialFormChangesSubscribed) {
        this.credentialFormChangesSubscribed = true;
        this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
        });
      }
    } else {
      this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm(): void {
    if (this.accountId && this.accountData) {
      this.scheduleSvc.addOrEdit(this.accountData.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean): void {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.onSubmit(runNowFlag);
    }
  }

  handleError(err: any): void {
    this.credentialFormErrors = this.crudSvc.resetCredentialFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.activeForm = 'credentialForm';
          (this.credentialFormErrors as any)[field] = err[field][0];
        } else {
          this.scheduleSvc.handleError(err);
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit(runNowFlag: boolean): void {
    this.spinner.start('main');
    const obj = Object.assign({}, this.credentialForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    if (this.accountId) {
      this.crudSvc.editAccount(this.accountId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Firewall Management Center updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.crudSvc.createAccount(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Firewall Management Center created successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  goBack(): void {
    if (this.accountId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
