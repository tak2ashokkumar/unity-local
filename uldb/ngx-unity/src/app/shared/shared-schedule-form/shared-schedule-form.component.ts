import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { takeUntil, tap } from 'rxjs/operators';
import { SharedScheduleFormService, daysOptions, monthsOptions, weekDaysOptions, weeksOptions } from './shared-schedule-form.service';
import { ScheduleType } from '../SharedEntityTypes/scheduled-maintenance.type';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { IMultiSelectSettings } from '../multiselect-dropdown/types';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'shared-schedule-form',
  templateUrl: './shared-schedule-form.component.html',
  styleUrls: ['./shared-schedule-form.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ]
})

export class SharedScheduleFormComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  scheduleForm: FormGroup;
  scheduleFormErrors: any;
  scheduleFormValidationMessages: any;
  metadata: ScheduleType;
  schduleType: string;
  smId: string = '';
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  daysSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };

  monthsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };

  weeksSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };

  weekDaysSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };

  daysOptions = daysOptions;
  monthsOptions = monthsOptions;
  weeksOptions = weeksOptions;
  weekDaysOptions = weekDaysOptions;

  constructor(private scheduleFormSvc: SharedScheduleFormService,
    private utilService: AppUtilityService,
    private builder: FormBuilder) {
    this.scheduleFormSvc.formAnnouncedSource$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      console.log('just checking');
      this.metadata = param.input;
      this.smId = param.scheduleId;
      this.buildForm();
      console.log('inside the schduleform', this.metadata, param)
    });
    this.scheduleFormSvc.formSubmitAnnouncedSource$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.scheduleFormSvc.formErrorAnnouncedSource$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.scheduleForm = this.scheduleFormSvc.buildScheduleForm(this.metadata);
    console.log(this.scheduleForm, 'this.scheduleForm')
    // this.scheduleFormSvc.updateFormValue(this.scheduleForm);
    this.scheduleFormErrors = this.scheduleFormSvc.resetScheduleFormErrors();
    this.scheduleFormValidationMessages = this.scheduleFormSvc.scheduleFormValidationMessages;
    console.log(this.scheduleFormErrors, this.scheduleFormValidationMessages);
    this.handleSchedule();
  }

  get schedule() {
    return <FormGroup>this.scheduleForm.get('schedule');
  }

  resetScheduleForm() {
    this.schedule.removeControl('hourly');
    this.schedule.removeControl('daily');
    this.schedule.removeControl('weekly');
    this.schedule.removeControl('monthly');
    this.scheduleFormErrors = this.scheduleFormSvc.resetScheduleFormErrors();
  }

  handleSchedule() {
    this.schedule.get('schedule_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.schduleType = val;
      this.handleDate();
      this.resetScheduleForm();
      switch (val) {
        case 'hourly':
          this.handleHourly();
          break;
        case 'daily':
          this.handleDaily();
          break;
        case 'weekly':
          this.handleWeekly();
          break;
        case 'monthly':
          this.handleMonthly();
          break;
        default:
          break;
      }
    })
  }

  handleDate() {
    if (this.schduleType == 'hourly' || this.schduleType == 'daily' || this.schduleType == 'weekly' || this.schduleType == 'monthly') {
      this.schedule.addControl('start_date', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.schedule.addControl('end_date', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.schedule.addControl('end_date_status', new FormControl('on', [Validators.required]));
      this.schedule.get('end_date_status').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((status: string) => {
        if (status == 'never') {
          this.schedule.get('end_date').disable();
          this.schedule.get('end_date').setValue('');
        } else {
          this.schedule.get('end_date').enable();
        }
      })
    } else {
      this.schedule.removeControl('start_date');
      this.schedule.removeControl('end_date');
      this.schedule.removeControl('end_date_status');
    }
  }

  handleHourly() {
    this.schedule.addControl('hourly', this.builder.group({}));
    let hourly = <FormGroup>this.schedule.get('hourly');
    hourly.addControl('hours_interval', new FormControl('', [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(23)]));
    hourly.addControl('minutes_interval', new FormControl('', [Validators.required, NoWhitespaceValidator, Validators.min(0), Validators.max(59)]));
  }

  handleDaily() {
    this.schedule.addControl('daily', this.builder.group({}));
    let daily = <FormGroup>this.schedule.get('daily');
    daily.addControl('days_interval', new FormControl('', [Validators.required, NoWhitespaceValidator]));
  }

  handleWeekly() {
    this.schedule.addControl('weekly', this.builder.group({}));
    let weekly = <FormGroup>this.schedule.get('weekly');
    weekly.addControl('week_days', new FormControl([], [Validators.required]));
    weekly.addControl('at', new FormControl('', [Validators.required, NoWhitespaceValidator]));
  }

  handleMonthly() {
    this.schedule.addControl('monthly', this.builder.group({}));
    let monthly = <FormGroup>this.schedule.get('monthly');
    monthly.addControl('monthly_type', new FormControl('day', [Validators.required]));
    monthly.addControl('days', new FormControl([], [Validators.required]));
    monthly.addControl('months', new FormControl([], [Validators.required]));
    monthly.addControl('weeks', new FormControl([]));
    monthly.addControl('week_days', new FormControl([]));
    monthly.addControl('every_months', new FormControl([]));
    monthly.addControl('at', new FormControl(''));
    monthly.get('weeks').disable();
    monthly.get('week_days').disable();
    monthly.get('at').disable();
    monthly.get('monthly_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
      if (val == 'day') {
        monthly.get('weeks').disable();
        monthly.get('week_days').disable();
        monthly.get('every_months').disable();
        monthly.get('at').disable();
        monthly.get('days').enable();
        monthly.get('months').enable();
        monthly.get('days').setValidators([Validators.required]);
        monthly.get('months').setValidators([Validators.required]);
        monthly.get('weeks').setValidators([]);
        monthly.get('week_days').setValidators([]);
        monthly.get('at').setValidators([]);
        monthly.get('weeks').setValue([]);
        monthly.get('week_days').setValue([]);
        monthly.get('every_months').setValue([]);
        monthly.get('at').setValue('');
        monthly.get('days').updateValueAndValidity();
        monthly.get('months').updateValueAndValidity();
        monthly.get('weeks').updateValueAndValidity();
        monthly.get('week_days').updateValueAndValidity();
        monthly.get('at').updateValueAndValidity();
        monthly.get('every_months').updateValueAndValidity();
      } else {
        monthly.get('days').disable();
        monthly.get('months').disable();
        monthly.get('weeks').enable();
        monthly.get('week_days').enable();
        monthly.get('every_months').enable();
        monthly.get('at').enable();
        monthly.get('days').setValidators([]);
        monthly.get('months').setValidators([]);
        monthly.get('days').setValue([]);
        monthly.get('months').setValue([]);
        monthly.get('weeks').setValidators([Validators.required]);
        monthly.get('every_months').setValidators([Validators.required]);
        monthly.get('week_days').setValidators([Validators.required]);
        monthly.get('at').setValidators([Validators.required, NoWhitespaceValidator]);
        monthly.get('days').updateValueAndValidity();
        monthly.get('months').updateValueAndValidity();
        monthly.get('weeks').updateValueAndValidity();
        monthly.get('week_days').updateValueAndValidity();
        monthly.get('every_months').updateValueAndValidity();
        monthly.get('at').updateValueAndValidity();
      }
    })
  }

  onCheckboxChange(weekday: string) {
    const weekdaysArray = this.schedule.get('weekly').get('week_days').value as string[];
    if (weekdaysArray.includes(weekday)) {
      weekdaysArray.splice(weekdaysArray.indexOf(weekday), 1);
    } else {
      weekdaysArray.push(weekday);
    }
    this.schedule.get('weekly').get('week_days').setValue(weekdaysArray);
  }

  handleError(err: any) {
    this.scheduleFormErrors = this.scheduleFormSvc.resetScheduleFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.scheduleForm.controls) {
          this.scheduleFormErrors[field] = err[field][0];
        }
      }
    }
  }

  submit() {
    this.scheduleFormSvc.updateFormValue(this.scheduleForm);
    if (this.scheduleForm.invalid) {
      this.scheduleFormErrors = this.utilService.validateForm(this.scheduleForm, this.scheduleFormValidationMessages, this.scheduleFormErrors);
      this.scheduleForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.scheduleFormErrors = this.utilService.validateForm(this.scheduleForm, this.scheduleFormValidationMessages, this.scheduleFormErrors); });
      return;
    } else {
      // this.scheduleFormErrors = this.scheduleFormSvc.resetScheduleFormErrors();
      const data = this.scheduleFormSvc.handleFormData(this.scheduleForm.getRawValue());
      this.scheduleFormSvc.updateFormValue(this.scheduleForm, data);
    }
  }

}