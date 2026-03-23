import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { MetricsTypes, ProductEditions, RateFrequencies, SoftwareTypes, SupportTypes, TechnologyTypes, UsfSoftwareService } from './usf-software.service';
@Component({
  selector: 'usf-software',
  templateUrl: './usf-software.component.html',
  styleUrls: ['./usf-software.component.scss']
})
export class UsfSoftwareComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  private subscr: Subscription;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  nonFieldErr: string = '';

  softwareTypesList: string[] = SoftwareTypes;
  technologyTypesList: string[] = TechnologyTypes;
  productEditionsList: string[] = ProductEditions;
  metricsTypesList: string[] = MetricsTypes;
  rateFrequenyList: string[] = RateFrequencies;
  supportTypesList: string[] = SupportTypes;

  constructor(private svc: UsfSoftwareService,
    private router: Router,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.svc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });

    this.svc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  get formdata() {
    return this.svc.form;
  }

  buildForm() {
    this.form = this.formdata;
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submit() {
    this.svc.updateForm(this.form);
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.formErrors = this.svc.resetFormErrors();
      // this.svc.updateForm(this.form);
    }
  }

}