import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Currencies, UsfBasicService } from './usf-basic.service';
import { Subject, Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CurrencyObjType, NgSelectDropdownType } from '../unity-setup-finops.type';
@Component({
  selector: 'usf-basic',
  templateUrl: './usf-basic.component.html',
  styleUrls: ['./usf-basic.component.scss']
})
export class UsfBasicComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  nonFieldErr: string = '';

  // licenseCostCentersList: string[] = LicenseCostCenters;
  // environmentList: string[] = Environments;
  // workloadTypesList: string[] = WorkloadTypes;
  // hostDeploymentTypesList: string[] = HostDeploymentTypes;
  // virtualizationTypesList: string[] = VirtualizationTypes;
  // applicationsList: string[] = Applications;
  // licenseModelsList: string[] = LicenseModels;
  currencyList: CurrencyObjType[] = Currencies;
  // budgetPeriodList: string[] = BudgetPeriods;
  // allocationTypesList: string[] = AllocationTypes;
  // allocationStrategiesList: string[] = AllocationStrategies;

  @Input('dropdownData') dropdownData: NgSelectDropdownType;
  customNgSelectValues: NgSelectDropdownType = {};

  constructor(private svc: UsfBasicService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,) {
    this.svc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
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

  addTag(field: string) {
    return (name: string) => {
      this.customNgSelectValues[field] = [];
      this.customNgSelectValues[field].push(name);
      return name;
    };
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
    this.svc.updateCustomDropdownValues(this.customNgSelectValues);
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.subscribe(() => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.formErrors = this.svc.resetFormErrors();
    }
  }

}
