import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import * as moment from 'moment';
import { cloneDeep as _clone } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'custom-date-dropdown',
  templateUrl: './custom-date-dropdown.component.html',
  styleUrls: ['./custom-date-dropdown.component.scss']
})
export class CustomDateDropdownComponent implements OnInit, OnChanges, OnDestroy {
  @Input() options: DateRangeOption[];
  @Input() enableCustomDateRange: boolean = false;
  @Output() onSubmit = new EventEmitter<FormGroup>();
  @Input() default?: string | DateRangeOption = DateRangePeriod.LAST_30_DAYS;
  @Input() customClass?: string;

  private ngUnsubscribe = new Subject();
  drForm: FormGroup; // date range form
  drFormErrors: any;
  drFormValidationMsgs: any;
  selected: string;
  clickFlag: boolean = false;
  scrollStrategy: ScrollStrategy;

  constructor(
    private util: AppUtilityService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private readonly sso: ScrollStrategyOptions) {
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('changes : ', changes);
    // this.buildForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdownElement = document.querySelector('.dropdown');
    const calendarElement = document.querySelector('.owl-dt-container'); // Adjust selector based on your calendar implementation
    // Close dropdown only if the click is outside both the dropdown and the calendar
    if (
      dropdownElement &&
      !dropdownElement.contains(event.target as Node) &&
      calendarElement &&
      !calendarElement.contains(event.target as Node)
    ) {
      this.clickFlag = false;
    }
  }

  buildForm() {
    let period: string;
    let dateRange: DateRangeOption = { from: '', to: '' };
    if (this.default instanceof DateRangeOption) {
      period = this.default.value ? this.default.value : '';
      if (this.default.from && this.default.to) {
        dateRange = _clone(this.default);
      }
      this.selected = `${dateRange.from} ~ ${dateRange.to}`;
    } else {
      period = _clone(this.default);
      if (period === 'custom') {
        // Handle custom separately
        dateRange = {
          from: this.drForm.get('from').value || '', // make sure you store these from user inputs
          to: this.drForm.get('to').value || ''
        };
      } else {
        dateRange = this.getDateRangeByPeriod(<DateRangePeriod>period);
        const selectedOption = this.options.find(opt => opt.value === period);
        this.selected = _clone(selectedOption?.label || '');
      }
    }
    this.resetFormErrors();
    this.drFormErrors = this.resetFormErrors();
    this.drFormValidationMsgs = this.validationMessages;
    this.drForm = this.getForm(period, dateRange);
    this.submit();
  }

  getForm(period: string, dateRange: DateRangeOption) {
    return this.builder.group({
      'period': [period, [Validators.required]],
      'from': [new Date(dateRange.from), [Validators.required, NoWhitespaceValidator]],
      'to': [new Date(dateRange.to), [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.sameOrAfterDateRangeValidator('from', 'to') });
  }

  resetFormErrors(): any {
    let formErrors = {
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  validationMessages = {
    'period': {
      'required': 'Graph Period is required'
    },
    'from': {
      'required': 'From date is required',
    },
    'to': {
      'required': 'To date is required'
    }
  };

  getDateRangeByPeriod(graphRange: DateRangePeriod, customFrom?: string, customTo?: string): DateRangeOption {
    const format = new DateRangeOption().format;
    switch (graphRange) {
      case DateRangePeriod.LAST_30_MINS:
        return { from: moment().subtract(30, 'm').format(), to: moment().subtract(1, 'm').format(format) };
      case DateRangePeriod.LAST_1_HOUR:
        return { from: moment().subtract(1, 'h').format(), to: moment().subtract(1, 'm').format(format) };
      case DateRangePeriod.LAST_2_HOURS:
        return { from: moment().subtract(2, 'h').format(), to: moment().subtract(1, 'm').format(format) };
      case DateRangePeriod.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case DateRangePeriod.LAST_7_DAYS:
      case DateRangePeriod.LAST_1_WEEK:
        return { from: moment().subtract(7, 'days').startOf('day').format(format), to: moment().endOf('day').format(format) };
      case DateRangePeriod.THIS_MONTH:
        return { from: moment().startOf('month').format(format), to: moment().endOf('month').format(format) };
      case DateRangePeriod.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('month').format(format), to: moment().subtract(1, 'M').endOf('month').format(format) };
      case DateRangePeriod.LAST_30_DAYS:
        return { from: moment().subtract(30, 'days').startOf('day').format(format), to: moment().endOf('day').format(format) };
      case DateRangePeriod.LAST_60_DAYS:
        return { from: moment().subtract(60, 'days').startOf('day').format(format), to: moment().endOf('day').format(format) };
      case DateRangePeriod.LAST_90_DAYS:
        return { from: moment().subtract(90, 'days').startOf('day').format(format), to: moment().endOf('day').format(format) };
      case DateRangePeriod.LAST_180_DAYS:
        return { from: moment().subtract(180, 'days').startOf('day').format(format), to: moment().endOf('day').format(format) };
      case DateRangePeriod.THIS_YEAR:
      case DateRangePeriod.LAST_1_YEAR:
        return { from: moment().startOf('year').format(format), to: moment().endOf('year').format(format) };
      case DateRangePeriod.LAST_YEAR:
        return { from: moment().subtract(1, 'year').startOf('year').format(format), to: moment().subtract(1, 'year').endOf('year').format(format) };
      case DateRangePeriod.ALLTIME:
        return { from: '', to: '' };
      case DateRangePeriod.CUSTOM:
        return {
          from: moment(customFrom).startOf('day').format(format),
          to: moment(customTo).endOf('day').format(format)
        };
      default: return null;
    }
  }

  onSelectPeriod(opt: DateRangeOption) {
    // console.log('onSelectPeriod opt : ', opt);
    this.selected = _clone(opt.label);
    this.drForm.get('period').setValue(opt.value);
    let dateRange = this.getDateRangeByPeriod(<DateRangePeriod>opt.value);
    // console.log('onSelectPeriod dateRange : ', _clone(dateRange));
    this.drForm.get('from').setValue(dateRange.from);
    this.drForm.get('to').setValue(dateRange.to);
    this.drForm.updateValueAndValidity();
    this.submit();
  }

  onSelectCustomRange() {
    const from = this.drForm.get('from').value; // Date object or string
    const to = this.drForm.get('to').value;
    if (this.drForm.valid) {
      this.selected = 'custom';
      this.drForm.get('period').setValue(DateRangePeriod.CUSTOM);
      const from = this.drForm.get('from').value;
      const to = this.drForm.get('to').value;
      const range = this.getDateRangeByPeriod(DateRangePeriod.CUSTOM, from, to);
      this.submit();
    }
  }

  resetCustomRange() {
    this.drForm.get('from').setValue('');
    this.drForm.get('to').setValue('');
  }

  toggleDrop(event: Event): void {
    this.clickFlag = !this.clickFlag;
    event.stopPropagation();
  }

  submit() {
    // console.log('form raw value : ', this.drForm.getRawValue());
    // console.log('form : ', this.drForm);
    // console.log('is Valid : ', this.drForm.valid);
    // console.log('****************************')
    if (this.drForm.invalid) {
      this.drFormErrors = this.utilSvc.validateForm(this.drForm, this.drFormValidationMsgs, this.drFormErrors);
      this.drForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.drFormErrors = this.utilSvc.validateForm(this.drForm, this.drFormValidationMsgs, this.drFormErrors);
      });
    } else {
      this.clickFlag = false;
      this.onSubmit.emit(this.drForm.getRawValue());
    }
  }
}

export class DateRangeOption {
  label?: string;
  value?: string;
  from?: string = '';
  to?: string = '';
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export enum DateRangePeriod {
  LAST_30_MINS = 'last_30_minutes',
  LAST_1_HOUR = 'last_1_hour',
  LAST_2_HOURS = 'last_2_hours',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_1_WEEK = 'last_1_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  LAST_30_DAYS = 'last_30_days',
  LAST_60_DAYS = 'last_60_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_180_DAYS = 'last_180_days',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  LAST_1_YEAR = 'last_1_year',
  ALLTIME = 'all_time',
  CUSTOM = 'custom'
}
