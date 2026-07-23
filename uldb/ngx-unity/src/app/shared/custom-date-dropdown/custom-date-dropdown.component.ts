import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import * as moment from 'moment';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';

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
  @Input() emitOnInit: boolean = true;
  @Input() customSelectedLabel: string = 'custom';
  @Input() popupPanelClass?: string | string[];
  @Input() viewportSafePopup: boolean = false;
  @Input() dateOnlyPicker: boolean = false;

  private ngUnsubscribe = new Subject();
  private formValueChangesSub?: Subscription;
  drForm: FormGroup; // date range form
  drFormErrors: any;
  drFormValidationMsgs: any;
  selected: string;
  clickFlag: boolean = false;
  activePicker: 'from' | 'to' | null = null;
  isAnyPickerOpen: boolean = false;
  fromScrollStrategy: ScrollStrategy;
  toScrollStrategy: ScrollStrategy;
  private shouldShowValidationErrors: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private util: AppUtilityService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private readonly sso: ScrollStrategyOptions) {
    this.fromScrollStrategy = this.sso.noop();
    this.toScrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    this.updateScrollStrategy();
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.viewportSafePopup && !changes.viewportSafePopup.firstChange) {
      this.updateScrollStrategy();
    }
  }

  ngOnDestroy(): void {
    this.formValueChangesSub?.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    const isInsideDropdown = this.elementRef?.nativeElement?.contains(target);
    const isInsideCalendar = this.isDatePickerInteraction(event);
    if (!isInsideDropdown && !isInsideCalendar) {
      this.clickFlag = false;
    }
  }


  buildForm() {
    let period: string;
    let dateRange: DateRangeOption = { from: '', to: '' };
    if (this.isDateRangeOptionValue(this.default)) {
      period = this.default.value ? this.default.value : '';
      if (this.default.from && this.default.to) {
        dateRange = _clone(this.default);
      }
      this.selected = this.default.label || this.getSelectedText(period, dateRange);
    } else {
      period = _clone(this.default);
      if (period === 'custom') {
        dateRange = {
          from: this.drForm?.get('from')?.value || '',
          to: this.drForm?.get('to')?.value || ''
        };
        this.selected = this.customSelectedLabel;
      } else {
        dateRange = this.getDateRangeByPeriod(<DateRangePeriod>period);
        const selectedOption = this.options?.find(opt => opt.value === period);
        this.selected = _clone(selectedOption?.label || '');
      }
    }
    this.resetFormErrors();
    this.drFormErrors = this.resetFormErrors();
    this.drFormValidationMsgs = this.validationMessages;
    this.drForm = this.getForm(period, dateRange);
    this.shouldShowValidationErrors = false;
    this.formValueChangesSub?.unsubscribe();
    this.formValueChangesSub = this.drForm.valueChanges.subscribe(() => {
      if (!this.shouldShowValidationErrors) {
        return;
      }
      this.drFormErrors = this.utilSvc.validateForm(this.drForm, this.drFormValidationMsgs, this.resetFormErrors());
    });
    if (this.emitOnInit) {
      this.submit();
    }
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
      case DateRangePeriod.LAST_HOUR:
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
      case DateRangePeriod.LAST_QUARTER:
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
    if (opt?.value === DateRangePeriod.CUSTOM) {
      this.selected = this.customSelectedLabel;
      this.drForm.get('period').setValue(DateRangePeriod.CUSTOM);
      return;
    }
    this.selected = _clone(opt.label);
    this.drForm.get('period').setValue(opt.value);
    let dateRange = this.getDateRangeByPeriod(<DateRangePeriod>opt.value);
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
      this.selected = this.customSelectedLabel;
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
    this.drForm.get('from').setValue('');
    this.drForm.get('to').setValue('');
  }

  toggleDrop(event: Event): void {
    this.clickFlag = !this.clickFlag;
    event.stopPropagation();
  }

  onDateChange(controlName: 'from' | 'to') {
    const control = this.drForm?.get(controlName);
    control?.markAsTouched();
    control?.updateValueAndValidity({ emitEvent: false });
    this.drForm?.updateValueAndValidity({ emitEvent: false });
    if (this.shouldShowValidationErrors) {
      this.drFormErrors = this.utilSvc.validateForm(this.drForm, this.drFormValidationMsgs, this.resetFormErrors());
    }
  }

  onPickerOpened(controlName: 'from' | 'to', picker: any) {
    this.activePicker = controlName;
    this.isAnyPickerOpen = true;
    if (!this.viewportSafePopup) {
      return;
    }
    setTimeout(() => {
      const popupRef = picker?.popupRef;
      const positionStrategy = popupRef?.getConfig?.()?.positionStrategy;
      if (positionStrategy?.withPush) {
        positionStrategy.withPush(true);
      }
      if (positionStrategy?.withFlexibleDimensions) {
        positionStrategy.withFlexibleDimensions(true);
      }
      popupRef?.updatePosition?.();
    });
  }

  onPickerClosed(controlName: 'from' | 'to') {
    if (this.activePicker === controlName) {
      this.activePicker = null;
    }
    this.isAnyPickerOpen = false;
  }

  submit() {
    // console.log('form raw value : ', this.drForm.getRawValue());
    // console.log('form : ', this.drForm);
    // console.log('is Valid : ', this.drForm.valid);
    // console.log('****************************')
    if (this.drForm.invalid) {
      this.shouldShowValidationErrors = true;
      this.drFormErrors = this.utilSvc.validateForm(this.drForm, this.drFormValidationMsgs, this.resetFormErrors());
    } else {
      this.shouldShowValidationErrors = false;
      this.clickFlag = false;
      this.onSubmit.emit(this.drForm.getRawValue());
    }
  }

  private isDateRangeOptionValue(value: string | DateRangeOption | undefined): value is DateRangeOption {
    return !!value && typeof value === 'object';
  }

  private getSelectedText(period: string, dateRange: DateRangeOption): string {
    if (period === DateRangePeriod.CUSTOM) {
      return this.customSelectedLabel;
    }
    const selectedOption = this.options?.find(opt => opt.value === period);
    if (selectedOption?.label) {
      return selectedOption.label;
    }
    if (dateRange?.from && dateRange?.to) {
      return `${dateRange.from} ~ ${dateRange.to}`;
    }
    return '';
  }

  private updateScrollStrategy() {
    this.fromScrollStrategy = this.viewportSafePopup ? this.sso.reposition() : this.sso.noop();
    this.toScrollStrategy = this.viewportSafePopup ? this.sso.reposition() : this.sso.noop();
  }

  private isDatePickerInteraction(event: MouseEvent): boolean {
    const eventPath = typeof event.composedPath === 'function' ? event.composedPath() : [];
    const pathHasDatePicker = eventPath.some(node => this.isOwlDateTimeNode(node));
    if (pathHasDatePicker) {
      return true;
    }
    const target = event.target as HTMLElement | null;
    return !!target?.closest?.('.owl-dt-container, .owl-dt-popup, .owl-dt-dialog');
  }

  private isOwlDateTimeNode(node: EventTarget | null): boolean {
    if (!(node instanceof HTMLElement)) {
      return false;
    }
    return Array.from(node.classList || []).some(className => className.startsWith('owl-dt-'));
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
  LAST_HOUR = 'last_hour',
  LAST_1_HOUR = 'last_1_hour',
  LAST_2_HOURS = 'last_2_hours',
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_1_WEEK = 'last_1_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  LAST_30_DAYS = 'last_30_days',
  LAST_60_DAYS = 'last_60_days',
  LAST_QUARTER = 'last_quarter',
  LAST_90_DAYS = 'last_90_days',
  LAST_180_DAYS = 'last_180_days',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  LAST_1_YEAR = 'last_1_year',
  ALLTIME = 'all_time',
  CUSTOM = 'custom'
}
