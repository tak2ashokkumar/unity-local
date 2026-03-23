import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AimlSuppressionRuleCrudService, SuppressionConditionDropdown, suppressionConditionDropdownData } from './aiml-suppression-rule-crud.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AIMLSuppressionRule } from '../aiml-rules.type';

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
  selector: 'aiml-suppression-rule-crud',
  templateUrl: './aiml-suppression-rule-crud.component.html',
  styleUrls: ['./aiml-suppression-rule-crud.component.scss'],
  providers: [{ provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE], },
  { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    AimlSuppressionRuleCrudService]
})
export class AimlSuppressionRuleCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  ruleId: string;
  isView: boolean = false;

  formErrors: any;
  validationMessages: any;
  form: FormGroup;
  nonFieldErr: string = '';

  conditionDropdownData: SuppressionConditionDropdown[] = suppressionConditionDropdownData;
  valueFieldSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  
  constructor(private crudSvc: AimlSuppressionRuleCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService) { 
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.ruleId = params.get('ruleId');
      });
    }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  reset() {
    this.formErrors = null;
    this.validationMessages = null;
    this.form = null;
    this.buildForm();
  }

  goBack() {
    this.router.navigate(['firstresponsepolicies'], { relativeTo: this.route.parent });
  }

  buildForm() {
    this.formErrors = this.crudSvc.resetRuleFormErrors();
    this.validationMessages = this.crudSvc.ruleFormValidationMessages;
    this.spinner.start('main');
    this.crudSvc.createRuleForm(this.ruleId, this.isView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.get('conditions') && res.get('conditions').value && res.get('conditions').value.length > 1) {
        for (var i = 1; i < res.get('conditions').value.length; i++) {
          this.formErrors.conditions.push(this.crudSvc.getConditionFormErrors());
        }
      }
      this.form = res;
      this.formConditionSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  formConditionSubscriptions() {
    for (let i = 0; i < this.conditions.length; i++) {
      let formGroup = <FormGroup>this.conditions.at(i);
      this.handleSubscriptions(formGroup);
    }
    // this.form.get('timeline').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
    //   if (val) {
    //     this.form.addControl('start_date', new FormControl('', [Validators.required]));
    //     this.form.addControl('end_date', new FormControl('', [Validators.required]));
    //     this.form.addValidators(this.utilService.dateRangeValidator('start_date', 'end_date'));
    //   } else {
    //     this.form.removeControl('start_date');
    //     this.form.removeControl('end_date');
    //     this.form.setValidators([]);
    //     this.form.updateValueAndValidity();
    //   }
    // });
    this.form.get('conditions').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      let desc = ``;
      for (let i = 0; i < this.conditions.length; i++) {
        let formGroup = <FormGroup>this.conditions.at(i);
        if (formGroup.get('attribute').value) {
          formGroup.get('operator').enable({ emitEvent: false });
          formGroup.get('value').enable({ emitEvent: false });
          desc = `${desc}${formGroup.get('attribute').value} ${formGroup.get('operator').value} ${formGroup.get('value').value}\n`;
        } else {
          formGroup.get('operator').disable({ emitEvent: false });
          formGroup.get('value').disable({ emitEvent: false });
        }
      }
      this.form.get('description').setValue(desc);
    });
  }

  handleSubscriptions(formGroup: FormGroup) {
    formGroup.get('attribute').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((attrValue: string) => {
      let operators = this.conditionDropdownData.find(cd => cd.key == attrValue).operators;
      if (operators) {
        formGroup.get('operatorOptions').setValue(operators);
      }
      let valOptions = this.conditionDropdownData.find(cd => cd.key == attrValue).valueField.options;
      if (valOptions) {
        formGroup.get('valueOptions').setValue(valOptions);
      }
      let valType = this.conditionDropdownData.find(cd => cd.key == attrValue).valueField.type;
      if (valType) {
        formGroup.get('valueType').setValue(valType);
        if (valType == 'multi-select') {
          formGroup.get('value').setValue([]);
        } else {
          formGroup.get('value').setValue('');
        }
      }
    })

    formGroup.get('operator').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((oprValue: string) => {
      let attrValue = formGroup.get('attribute').value;
      let operators = this.conditionDropdownData.find(cd => cd.key == attrValue).operators;
      let valType = operators.find(opr => opr.operator == oprValue).valueType;
      if (valType) {
        if (valType == 'multi-select') {
          formGroup.get('value').setValue([]);
        } else {
          formGroup.get('value').setValue('');
        }
        formGroup.get('valueType').setValue(valType);
      }
    })
  }

  getPlaceholder(index: number) {
    let cdnArray = this.form.get('conditions') as FormArray;
    let conditionAtIndex = cdnArray.at(index);
    let operator = conditionAtIndex.get('operator').value;

    switch (operator) {
      case 'contains': return 'Enter keywords (comma separated)';
      case 'is': return 'Enter keyword to exact match';
      default: return 'Enter keyword';
    }
  }

  get conditions(): FormArray {
    return this.form.get("conditions") as FormArray;
  }

  addConditions(index: number) {
    let formGroup = <FormGroup>this.conditions.at(index);
    if (formGroup.invalid) {
      this.formErrors.conditions[index] = this.utilService.validateForm(formGroup, this.validationMessages, this.formErrors.conditions[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors.conditions[index] = this.utilService.validateForm(formGroup, this.validationMessages, this.formErrors.conditions[index]);
        });
    }
    else {
      formGroup.addControl('expression', new FormControl('AND'));
      let fg = this.crudSvc.newCondition();
      this.formErrors.conditions.push(this.crudSvc.getConditionFormErrors());
      this.handleSubscriptions(fg);
      this.conditions.push(fg);
    }
  }

  removeCondition(index: number) {
    let previousFormGroup = <FormGroup>this.conditions.at(index - 1);
    if (previousFormGroup) {
      previousFormGroup.removeControl('expression');
    }
    this.conditions.removeAt(index);
    this.formErrors.conditions.splice(index, 1);
  }

  private setDaterangeError() {
    if (this.form.errors) {
      this.formErrors.fromAfterTo = this.form.errors.fromAfterTo ? 'Start date cannot be after end date' : '';
    }
  }

  handleError(err: any) {
    // this.formErrors.conditions = Array(this.conditions.length).forEach(v => v = this.crudSvc.getConditionFormErrors());
    // this.formErrors = this.crudSvc.resetRuleFormErrors();
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

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.setDaterangeError();
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
          this.setDaterangeError();
        });
    } else {
      let obj = <AIMLSuppressionRule>Object.assign({}, this.form.getRawValue());
      this.spinner.start('main');
      if (this.ruleId) {
        this.crudSvc.editRule(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Rule updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createRule(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Rule Created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

}

