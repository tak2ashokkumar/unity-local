import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
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
  @Output() onSubmit = new EventEmitter<DateRangeSubmitPayload>();
  @Input() default?: string | DateRangeOption = DateRangePeriod.LAST_30_DAYS;
  @Input() customClass?: string;
  @Input() emitOnInit: boolean = true;
  @Input() emitOnExternalChanges: boolean = true;
  @Input() popupPanelClass?: string | string[];
  @Input() viewportSafePopup: boolean = false;
  @Input() dateOnlyPicker: boolean = false;

  private ngUnsubscribe = new Subject<void>();
  private formRebuildUnsubscribe = new Subject<void>();
  drForm: FormGroup; // date range form
  drFormErrors: any;
  drFormValidationMsgs: any;
  selected: string;
  clickFlag: boolean = false;
  fromScrollStrategy: ScrollStrategy;
  toScrollStrategy: ScrollStrategy;

  constructor(
    private util: AppUtilityService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private elementRef: ElementRef,
    private readonly sso: ScrollStrategyOptions) {
    this.fromScrollStrategy = this.sso.reposition();
    this.toScrollStrategy = this.sso.reposition();
  }

  ngOnInit(): void {
    this.buildForm(this.emitOnInit);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.drForm) {
      return;
    }
    if (changes.default || changes.options) {
      this.buildForm(this.emitOnExternalChanges);
    }
  }

  ngOnDestroy(): void {
    this.formRebuildUnsubscribe.next();
    this.formRebuildUnsubscribe.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.clickFlag) {
      return;
    }
    const target = event.target as Node;
    // Close when the click is outside THIS dropdown instance and outside any open calendar overlay
    // (the calendar renders in a CDK overlay appended to the body, so it is not inside this element).
    const clickedInsideDropdown = this.elementRef.nativeElement.contains(target);
    const calendarElement = document.querySelector('.owl-dt-container');
    const clickedInsideCalendar = !!calendarElement && calendarElement.contains(target);
    if (!clickedInsideDropdown && !clickedInsideCalendar) {
      this.clickFlag = false;
    }
  }

  buildForm(shouldEmit: boolean = this.emitOnInit) {
    let period: string = DateRangePeriod.LAST_30_DAYS;
    let dateRange: DateRangeOption = { from: '', to: '' };
    const defaultValue = this.default as DateRangeOption;

    if (this.isDateRangeOption(this.default)) {
      period = defaultValue.value || DateRangePeriod.CUSTOM;
      if (defaultValue.from && defaultValue.to) {
        dateRange = _clone(defaultValue);
      } else if (period === DateRangePeriod.CUSTOM) {
        dateRange = this.getDefaultCustomRange();
      } else {
        dateRange = this.getDateRangeByPeriod(period as DateRangePeriod) || this.getDefaultCustomRange();
      }
      this.selected = defaultValue.label || this.getOptionLabel(period);
    } else {
      period = String(_clone(this.default) || DateRangePeriod.LAST_30_DAYS);
      if (period === 'custom') {
        dateRange = this.getExistingOrDefaultCustomRange();
        this.selected = this.getOptionLabel(period, 'Custom');
      } else {
        dateRange = this.getDateRangeByPeriod(period as DateRangePeriod) || this.getDefaultCustomRange();
        this.selected = this.getOptionLabel(period);
      }
    }

    this.resetFormErrors();
    this.drFormErrors = this.resetFormErrors();
    this.drFormValidationMsgs = this.validationMessages;
    this.formRebuildUnsubscribe.next();
    this.drForm = this.getForm(period, dateRange);
    this.drForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.formRebuildUnsubscribe))
      .subscribe(() => {
        this.drFormErrors = this.utilSvc.validateForm(this.drForm, this.drFormValidationMsgs, this.drFormErrors);
      });
    if (shouldEmit) {
      this.submit();
    }
  }

  getForm(period: string, dateRange: DateRangeOption) {
    return this.builder.group({
      'period': [period, [Validators.required]],
      'from': [dateRange.from ? new Date(dateRange.from) : null, [Validators.required, NoWhitespaceValidator]],
      'to': [dateRange.to ? new Date(dateRange.to) : null, [Validators.required, NoWhitespaceValidator]],
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
      case DateRangePeriod.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('day').format(format), to: moment().subtract(1, 'd').endOf('day').format(format) };
      case DateRangePeriod.LAST_7_DAYS:
      case DateRangePeriod.LAST_1_WEEK:
      case DateRangePeriod.LAST_WEEK:
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
      case DateRangePeriod.LAST_QUARTER:
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
    this.selected = _clone(opt?.label || this.getOptionLabel(opt?.value));
    this.drForm.get('period').setValue(opt.value);

    if (this.isAllTimePeriod(opt?.value)) {
      this.drForm.patchValue({ from: null, to: null }, { emitEvent: false });
      this.drForm.updateValueAndValidity({ emitEvent: false });
      this.submit();
      return;
    }

    if (opt?.value === DateRangePeriod.CUSTOM) {
      const customRange = this.getExistingOrDefaultCustomRange();
      this.drForm.get('from').setValue(new Date(customRange.from));
      this.drForm.get('to').setValue(new Date(customRange.to));
      this.drForm.updateValueAndValidity({ emitEvent: false });
      this.clickFlag = true;
      return;
    }

    const dateRange = this.getDateRangeByPeriod(opt.value as DateRangePeriod);
    if (!dateRange) {
      return;
    }
    this.drForm.get('from').setValue(dateRange.from);
    this.drForm.get('to').setValue(dateRange.to);
    this.drForm.updateValueAndValidity();
    this.submit();
  }

  onSelectCustomRange() {
    if (this.drForm.valid) {
      this.selected = this.getOptionLabel(DateRangePeriod.CUSTOM, 'Custom');
      this.drForm.get('period').setValue(DateRangePeriod.CUSTOM);
      if (this.dateOnlyPicker) {
        this.drForm.patchValue({
          from: moment(this.drForm.get('from')?.value).startOf('day').toDate(),
          to: moment(this.drForm.get('to')?.value).endOf('day').toDate()
        }, { emitEvent: false });
        this.drForm.updateValueAndValidity({ emitEvent: false });
      }
      this.submit();
    }
  }

  resetCustomRange() {
    this.drForm.get('from').setValue(null);
    this.drForm.get('to').setValue(null);
    this.drForm.updateValueAndValidity({ emitEvent: false });
  }

  toggleDrop(event: Event): void {
    this.clickFlag = !this.clickFlag;
    event.stopPropagation();
  }

  onPickerOpened(_controlName: 'from' | 'to', _picker?: any): void {
    this.clickFlag = true;
  }

  onPickerClosed(_controlName: 'from' | 'to'): void {
    this.drForm?.updateValueAndValidity({ emitEvent: false });
  }

  onDateChange(_controlName: 'from' | 'to'): void {
    this.clickFlag = true;
    this.drForm?.updateValueAndValidity({ emitEvent: false });
  }

  submit() {
    // console.log('form raw value : ', this.drForm.getRawValue());
    // console.log('form : ', this.drForm);
    // console.log('is Valid : ', this.drForm.valid);
    // console.log('****************************')
    const formValue = this.drForm.getRawValue();
    if (this.isAllTimePeriod(formValue?.period)) {
      this.clickFlag = false;
      this.onSubmit.emit({
        period: formValue.period,
        from: null,
        to: null
      });
      return;
    }

    if (this.drForm.invalid) {
      this.drFormErrors = this.utilSvc.validateForm(this.drForm, this.drFormValidationMsgs, this.drFormErrors);
    } else {
      this.clickFlag = false;
      this.onSubmit.emit(formValue);
    }
  }

  get resolvedPopupPanelClass(): string | string[] {
    const classes = Array.isArray(this.popupPanelClass)
      ? [...this.popupPanelClass]
      : this.popupPanelClass ? [this.popupPanelClass] : [];

    if (this.viewportSafePopup) {
      classes.push('custom-date-dropdown-panel--safe');
    }

    return classes.length <= 1 ? (classes[0] || '') : classes;
  }

  private isDateRangeOption(value: string | DateRangeOption | undefined): value is DateRangeOption {
    return !!value && typeof value === 'object' && (
      Object.prototype.hasOwnProperty.call(value, 'value')
      || Object.prototype.hasOwnProperty.call(value, 'from')
      || Object.prototype.hasOwnProperty.call(value, 'to')
    );
  }

  private getExistingOrDefaultCustomRange(): DateRangeOption {
    const currentFrom = this.drForm?.get('from')?.value;
    const currentTo = this.drForm?.get('to')?.value;

    if (currentFrom && currentTo) {
      return {
        from: moment(currentFrom).format(),
        to: moment(currentTo).format()
      };
    }

    return this.getDefaultCustomRange();
  }

  private getDefaultCustomRange(): DateRangeOption {
    return {
      from: moment().subtract(30, 'days').startOf('day').format(),
      to: moment().endOf('day').format()
    };
  }

  private getOptionLabel(value?: string, fallback: string = ''): string {
    const selectedOption = (this.options || []).find(opt => opt?.value === value);
    return _clone(selectedOption?.label || fallback);
  }

  private isAllTimePeriod(period?: string): boolean {
    return period === DateRangePeriod.ALLTIME;
  }
}

export class DateRangeOption {
  label?: string;
  value?: string;
  from?: string = '';
  to?: string = '';
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export interface DateRangeSubmitPayload {
  period?: string;
  from?: Date | string | null;
  to?: Date | string | null;
}

export enum DateRangePeriod {
  LAST_30_MINS = 'last_30_minutes',
  LAST_1_HOUR = 'last_1_hour',
  LAST_2_HOURS = 'last_2_hours',
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_1_WEEK = 'last_1_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  LAST_QUARTER = 'last_quarter',
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
