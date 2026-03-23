import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeComponent } from '@busacca/ng-pick-datetime';
import { Moment } from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { BudgetInstance, CloudAccountsType, UnitySetupBudgetCrudService, cloudImgDropdownType, months, quarters, scopeConst } from './unity-setup-budget-crud.service';
import moment from 'moment';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}

@Component({
  selector: 'unity-setup-budget-crud',
  templateUrl: './unity-setup-budget-crud.component.html',
  styleUrls: ['./unity-setup-budget-crud.component.scss'],
  providers: [UnitySetupBudgetCrudService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})

export class UnitySetupBudgetCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  budgetId: string = '';
  nonFieldErr: string = '';

  @ViewChild('confirmEdit') confirmEdit: ElementRef;
  budgetEditModalRef: BsModalRef;
  startYearDate = moment().startOf('year');
  currentDate = moment()
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  actionMessage: 'Create' | 'Update';
  minEndYear: Moment;
  maxEndYear: Moment;
  minCustomEndDate: Moment;
  maxCustomEndDate: Moment;
  dateError: string = '';
  scopeTypes: Array<{ label: string, value: string }> = scopeConst;
  cloudTypes: Array<string> = []; //cloudTypeConst
  cloudAccountsAll: Array<CloudAccountsType> = [];
  cloudAccountsFiltered: Array<CloudAccountsType> = [];

  // scopeTypesSettings: IMultiSelectSettings = {
  //   isSimpleArray: true,
  //   checkedStyle: 'fontawesome',
  //   buttonClasses: 'btn btn-block btn-default d-flex align-items-center justify-content-between',
  //   dynamicTitleMaxItems: 1,
  //   selectionLimit: 1,
  //   closeOnSelect: true,
  //   autoUnselect: true
  // };

  // cloudTypesSettings: IMultiSelectSettings = {
  //   isSimpleArray: true,
  //   checkedStyle: 'fontawesome',
  //   buttonClasses: 'btn btn-block btn-default d-flex align-items-center justify-content-between',
  //   dynamicTitleMaxItems: 1,
  //   selectionLimit: 1,
  //   closeOnSelect: true,
  //   autoUnselect: true
  // };

  // cloudAccountsSettings: IMultiSelectSettings = {
  //   isSimpleArray: false,
  //   lableToDisplay: 'account_name',
  //   checkedStyle: 'fontawesome',
  //   buttonClasses: 'btn btn-block btn-default d-flex align-items-center justify-content-between',
  //   dynamicTitleMaxItems: 1,
  //   selectionLimit: 1,
  //   closeOnSelect: true,
  //   autoUnselect: true,
  //   // displayAllSelectedText: true,
  //   // showCheckAll: true,
  //   // showUncheckAll: true,
  //   // selectAsObject: false,
  //   keyToSelect: 'uuid'
  // };

  budgetObj: any;
  quartersList = quarters;
  monthList = months;

  // cloudTypesList: cloudImgDropdownType[] = [];
  // selectedCloud: cloudImgDropdownType;

  constructor(
    private svc: UnitySetupBudgetCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilityService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => this.budgetId = params.get('budgetId'));
  }

  ngOnInit(): void {
    this.getCloudData();
    if (this.budgetId) {
      this.actionMessage = 'Update';
      this.getBudgetData();
    } else {
      this.actionMessage = 'Create';
      this.buildForm(null);
    }

  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCloudData() {
    this.svc.getCloudData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cloudAccountsAll = res;
      this.cloudAccountsAll.forEach(item => {
        if (!this.cloudTypes.includes(item.cloud_type)) {
          this.cloudTypes.push(item.cloud_type);
        }
        // let cloud = this.cloudTypesList.filter(cloud => cloud.text == item.cloud_type);
        // if (!cloud.length) {
        //   let cloudImgUrl = this.utilityService.getCloudLogo(item.cloud_type);
        //   this.cloudTypesList.push({ image: cloudImgUrl, text: item.cloud_type });
        // }
      });
      this.cloudAccountsFiltered = this.cloudAccountsAll;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cloud Types.'))
    })
  }

  getBudgetData() {
    this.spinner.start('main');
    this.svc.getBudgetData(this.budgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.buildForm(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Budget.'))
    })
  }

  handlePeriodChange(): void {
    this.form.get('period')?.valueChanges.subscribe((periodValue) => {
      if (periodValue) {
        this.form.removeControl('invoice');
        this.form.removeControl('budget_amount');
        this.form.get('period_selection_start').setValue('');
        this.form.get('period_selection_end').setValue('');
        this.form.get('period_selection_end').disable();
        this.form.get('same_for_all').setValue(false);
        this.form.get('same_for_all_amount').setValue('');
        this.form.get('same_for_all_amount').disable();
      }
    });

    this.form.get('period_selection_start')?.valueChanges.subscribe((start) => {
      if (start) {
        this.form.get('period_selection_end').enable();
        if (this.form.get('period_selection_end')?.value) {
          this.form.get('same_for_all').setValue(false);
          this.form.get('same_for_all_amount').setValue('');
          this.form.get('same_for_all_amount').disable();
          this.createBudgetFormGroup();
        }
      }
    });

    this.form.get('period_selection_end')?.valueChanges.subscribe((end) => {
      if (end) {
        if (!this.form.get('invoice')) {
          this.form.addControl('invoice', new FormControl('', Validators.required));
          const period = this.form.get('period').value;
          switch (period) {
            case 'Year':
            case 'Quarter':
            case 'Month':
              this.form.get('invoice').setValue(period);
              break;
            case 'Custom':
              this.form.get('invoice').setValue('Year');
              break;
            default: return;
          }
        }
        this.form.get('same_for_all').setValue(false);
        this.form.get('same_for_all_amount').setValue('');
        this.form.get('same_for_all_amount').disable();
        this.createBudgetFormGroup();
        this.form.get('invoice')?.valueChanges.subscribe((invoice) => {
          if (invoice) {
            this.form.get('same_for_all').setValue(false);
            this.form.get('same_for_all_amount').setValue('');
            this.form.get('same_for_all_amount').disable();
            this.createBudgetFormGroup();
          }
        });
      }
    });

    this.form.get('same_for_all')?.valueChanges.subscribe((checked) => {
      this.form.get('same_for_all_amount').setValue('');
      this.setBudgetForAll(checked);
      if (checked) {
        this.form.get('same_for_all_amount').enable();
        this.form.get('same_for_all_amount').setValidators([Validators.required, NoWhitespaceValidator])
      }
      else {
        this.form.get('same_for_all_amount').disable();
      }
    });

    this.form.get('scope')?.valueChanges.subscribe((scope) => {
      if (scope) {
        this.form.addControl('cloud_type', new FormControl('', [Validators.required]));

        if (scope == 'Cloud') {
          this.form.removeControl('cloud_uuid');
        }
        else if (scope == 'Cloud Account') {
          this.form.addControl('cloud_uuid', new FormControl('', [Validators.required]));
          this.form.get('cloud_uuid')?.valueChanges.subscribe((uuid) => {
            let x = this.cloudAccountsAll.filter(cloud => cloud.uuid == uuid);
            this.form.get('cloud_type').setValue(x[0]?.cloud_type);
          });
        }
      }
      else {
        this.form.removeControl('cloud_type');
        this.form.removeControl('cloud_uuid');
      }
    });

    this.form.get('invoice')?.valueChanges.subscribe((invoice) => {
      if (invoice) {
        this.form.get('same_for_all').setValue(false);
        this.form.get('same_for_all_amount').setValue('');
        this.form.get('same_for_all_amount').disable();
        this.createBudgetFormGroup();
      }
    });

  }

  // getDropdownValue(event: any) {
  //   this.form.get('cloud_type').setValue(event.text);
  // }

  buildForm(data: BudgetInstance) {
    this.form = this.svc.buildForm(data);
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.formValidationMessages;
    if (this.budgetId) {
      this.validationMessages.budget_amount = this.svc.budgetValidationMessages;
      this.formErrors.budget_amount = this.svc.budgetErrors;
      // let cloudType = this.form.get('cloud_type')?.value;
      // if (cloudType && this.cloudTypesList.length > 0) {
      //   this.selectedCloud = this.cloudTypesList.find(cloud => cloud.text == cloudType);
      // }
    }

    // //For multi-select implementaion
    // if(this.budgetId && this.form.get('scope')?.value == 'Cloud'){
    //   let cloud = this.form.get('cloud_type')?.value;
    //   this.form.get('cloud_type').setValue(this.cloudAccountsAll.filter(c => c.cloud_type == cloud));
    //   // this.form.get('cloud_type').setValue(this.cloudAccountsAll.filter(c => clouds.includes(c.cloud_type)));
    //   let uuid = this.form.get('cloud_uuid')?.value;
    //   this.form.get('cloud_uuid').setValue(this.cloudAccountsAll.filter(c => c.uuid == uuid));
    //   // this.form.get('cloud_type').setValue(this.cloudAccountsAll.filter(c => clouds.includes(c.uuid)));
    // }

    this.handlePeriodChange();
  }

  onCloudAccountChange(selectedUuid: string): void {
    let x = this.cloudAccountsAll.filter(cloud => cloud.uuid == selectedUuid);
    this.form.get('cloud_type').setValue(x[0]?.cloud_type);
  }

  createObj(list) {
    let obj = {};
    list.forEach(item => obj[item.value] = '');
    return obj;
  };

  fillYearlyBudget(startYear, endYear, invoiceType) {
    for (let i = startYear; i <= endYear; i++) {
      this.budgetObj[i] = invoiceType == 'Year' ? '' : this.createObj(invoiceType == 'Quarter' ? this.quartersList : this.monthList);
    }
  };

  fillQuarterlyBudget(startQuarter, endQuarter, invoiceType, year) {
    let obj = {};
    if (invoiceType == 'Quarter') {
      for (let i = startQuarter; i <= endQuarter; i++) {
        let key = this.quartersList.find(q => q.order == i).value;
        obj[key] = '';
      }
    } else if (invoiceType == 'Month') {
      let startMonth = this.quartersList.find(q => q.order == startQuarter).startMonth;
      let endMonth = this.quartersList.find(q => q.order == endQuarter).endMonth;
      this.monthList.forEach(mon => {
        if (startMonth <= mon.order && mon.order <= endMonth) {
          obj[mon.value] = '';
        }
      });
    }
    this.budgetObj[year] = obj;
  };

  fillMonthlyBudget(startMonth, endMonth, year) {
    let obj = {};
    this.monthList.forEach(mon => {
      if (startMonth <= mon.order && mon.order <= endMonth) {
        obj[mon.value] = '';
      }
    });
    this.budgetObj[year] = obj;
  };

  fillCustomBudget(startYear, endYear, invoiceType, startQuarter, endQuarter, startMonth, endMonth) {
    for (let year = startYear; year <= endYear; year++) {
      let obj = {};
      if (invoiceType == 'Year') {
        this.budgetObj[year] = '';
      }
      else if (invoiceType == 'Quarter') {
        if (startYear == endYear) {
          for (let i = startQuarter; i <= endQuarter; i++) {
            let key = this.quartersList.find(q => q.order == i).value;
            obj[key] = '';
          }
        }
        else {
          const start = year == startYear ? startQuarter : year == endYear ? 1 : 1;
          const end = year == startYear ? 4 : year == endYear ? endQuarter : 4;
          for (let i = start; i <= end; i++) {
            let key = this.quartersList.find(q => q.order == i).value;
            obj[key] = '';
          }
        }
        this.budgetObj[year] = obj;
      }
      else if (invoiceType == 'Month') {
        if (startYear == endYear) {
          for (let i = startMonth; i <= endMonth; i++) {
            let key = this.monthList.find(mon => mon.order == i).value;
            obj[key] = '';
          }
        }
        else {
          const start = year == startYear ? startMonth : year == endYear ? 1 : 1;
          const end = year == startYear ? 12 : year == endYear ? endMonth : 12;
          for (let i = start; i <= end; i++) {
            let key = this.monthList.find(mon => mon.order == i).value;
            obj[key] = '';
          }
        }
        this.budgetObj[year] = obj;
      }
    }
  };

  createBudgetFormGroup() {
    let period = this.form.get('period')?.value;
    let invoice = this.form.get('invoice')?.value;
    let periodStartField = this.form.get('period_selection_start');
    let periodStart = periodStartField?.value;
    let periodEndField = this.form.get('period_selection_end');
    let periodEnd = periodEndField?.value;
    this.budgetObj = {};
    this.form.removeControl('budget_amount');
    if (period && periodStart && periodEnd && invoice && !periodStartField.errors && !periodEndField.errors && !this.formErrors.period_selection_end) {
      let currentYear = moment().year();
      if (period == 'Year') {
        this.fillYearlyBudget(moment(periodStart).year(), moment(periodEnd).year(), invoice);
      } else if (period == 'Quarter') {
        this.fillQuarterlyBudget(
          this.quartersList.find(q => q.value == periodStart).order,
          this.quartersList.find(q => q.value == periodEnd).order,
          invoice,
          currentYear
        );
      } else if (period == 'Month') {
        this.fillMonthlyBudget(
          this.monthList.find(q => q.value == periodStart).order,
          this.monthList.find(q => q.value == periodEnd).order,
          currentYear
        );
      } else if (period == 'Custom') {
        this.fillCustomBudget(
          moment(periodStart).year(),
          moment(periodEnd).year(),
          invoice,
          moment(periodStart).quarter(),
          moment(periodEnd).quarter(),
          moment(periodStart).month() + 1,
          moment(periodEnd).month() + 1
        );
      }
      let budgetForm = this.svc.setBudgetFields(this.budgetObj);
      this.validationMessages.budget_amount = this.svc.budgetValidationMessages;
      this.formErrors.budget_amount = this.svc.budgetErrors;
      this.form.addControl('budget_amount', budgetForm);
    }
  }

  getBudgets() {
    return Object.keys(this.form.get('budget_amount')?.value);
  }

  isNestedBudgetObj(key: string) {
    let x = this.budgetId ? this.form.get('budget_amount').value : this.budgetObj;
    return (x[key] && typeof (x[key]) == 'object');
  }

  getNestedBudgetObj(key: string) {
    let x = this.budgetId ? this.form.get('budget_amount').value : this.budgetObj;
    return (x[key] && typeof (x[key]) == 'object') ? Object.keys(x[key]) : x[key];
  }

  isOptionEnabled(opt: string) {
    let period = this.form.get('period')?.value;
    switch (opt) {
      case 'Year': return period == 'Year' || period == 'Custom';
      case 'Quarter': return period == 'Year' || period == 'Quarter' || period == 'Custom';
      case 'Month': return period == 'Year' || period == 'Quarter' || period == 'Month' || period == 'Custom';
      default: false
    }
  }

  startYearHandler(normalizedYear: Moment, datepicker: OwlDateTimeComponent<Moment>) {
    this.minEndYear = normalizedYear.clone(); //.add(1, 'year');
    this.maxEndYear = normalizedYear.clone().add(4, 'years').endOf('year');
    this.form.get('period_selection_start').setValue(normalizedYear.startOf('year'));
    datepicker.close();
  }

  endYearHandler(normalizedYear: Moment, datepicker: OwlDateTimeComponent<Moment>) {
    this.form.get('period_selection_end').setValue(normalizedYear.endOf('year'));
    this.checkDateValidity(this.form.get('period_selection_start').value, this.form.get('period_selection_end').value);
    datepicker.close();
  }

  checkDateValidity(startDate: Moment, endDate: Moment) {
    const currentYearStart = moment().startOf('year');

    // Condition 1: Start date should not be before 1st Jan of the current year
    if (startDate.isBefore(currentYearStart)) {
      this.dateError = 'Start date needs to be of the current year.';
      this.form.get('period_selection_start').reset();
      this.form.get('period_selection_end').reset();
      return;
    }

    // Condition 2: The gap between start and end date should be at most 5 years
    else if (endDate.diff(startDate, 'years', true) > 5) {
      this.dateError = 'The gap between start date and end date must be at most 5 years.';
      this.form.get('period_selection_start').reset();
      this.form.get('period_selection_end').reset();
      return;
    }
    else {
      this.dateError = ''
      return;
    }

  }

  customDateChanged() {
    let start = this.form.get('period_selection_start')?.value;
    if (start) {
      this.minCustomEndDate = start.clone(); //.add(1, 'day');
      this.maxCustomEndDate = start.clone().add(4, 'years');
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.msg) {
      this.nonFieldErr = err.msg;
    } else if (err) {
      for (const field in err) {
        if (field in this.form) {
          this.form[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  setBudgetForAll(checked: boolean) {
    const budgetAmountControl = this.form.get('budget_amount');
    if (budgetAmountControl) {
      const amount = this.form.get('same_for_all_amount').value;
      const budgetObj = budgetAmountControl as FormGroup;
      Object.entries(budgetObj.controls).forEach(([key, control]) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(subControl => {
            subControl.setValue(amount);
            subControl.setValidators([Validators.required, NoWhitespaceValidator]);
            checked ? subControl.disable() : subControl.enable();
          });
        } else {
          control.setValue(amount);
          control.setValidators([Validators.required, NoWhitespaceValidator]);
          checked ? control.disable() : control.enable();
        }
      });
    }
  }

  onUpdate() {
    this.budgetEditModalRef.hide();
    const formattedValue = this.svc.formatFormData(this.form.getRawValue());
    this.spinner.start('main');
    this.svc.updateBudget(formattedValue, this.budgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Budget  was updated successfuly.'));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  checkPeriodErrors() {
    let periodEnd = this.form.get('period_selection_end');
    if (this.form.get('period')?.value == 'Year') {
      if (periodEnd.errors?.owlDateTimeMin) {
        this.formErrors.period_selection_end = 'End year should be greater than start year'
      }
      else if (periodEnd.errors?.owlDateTimeMax) {
        this.formErrors.period_selection_end = 'End year exceeds the maximum allowed range'
      }
      if (!periodEnd.invalid) {
        this.formErrors.period_selection_end = ''
      }
    }
    if (this.form.errors) {
      //setting up the error msgs for quarter and month validation
      if (this.form.errors.quarterInvalid) {
        this.formErrors.period_selection_end = 'End quarter should be greater than the start quarter';
      }
      else if (this.form.errors.monthInvalid) {
        this.formErrors.period_selection_end = 'End month should be greater than the start month';
      }
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      // Handle form errors
      this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.checkPeriodErrors();
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
        this.checkPeriodErrors();
      });
    } else {
      const formattedValue = this.svc.formatFormData(this.form.getRawValue());
      if (this.budgetId) {
        this.budgetEditModalRef = this.modalService.show(this.confirmEdit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
      } else {
        this.spinner.start('main');
        this.svc.createBudget(formattedValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Budget  was created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }

    }
  }

  goBack() {
    if (this.budgetId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}