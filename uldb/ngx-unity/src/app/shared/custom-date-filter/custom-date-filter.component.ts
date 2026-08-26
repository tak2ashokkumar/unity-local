import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import {
  CUSTOM_DATE_FILTER_DATE_FORMAT,
  CustomDateFilterChange,
  CustomDateFilterOption,
  CustomDateFilterPeriod,
  getCustomDateFilterRange,
  isCustomDateFilterPeriod
} from './custom-date-filter.type';

@Component({
  selector: 'custom-date-filter',
  templateUrl: './custom-date-filter.component.html',
  styleUrls: ['./custom-date-filter.component.scss']
})
export class CustomDateFilterComponent implements OnInit, OnChanges {
  @Input() default?: string | CustomDateFilterOption = CustomDateFilterPeriod.THIRTY_DAYS;
  @Input() defaultPeriod?: string | CustomDateFilterPeriod;
  @Input() emitOnInit: boolean = false;
  @Input() emitOnExternalChanges: boolean = true;
  @Input() customClass?: string;
  @Input() options: Array<CustomDateFilterOption | string> = [];
  @Input() dateOnlyPicker: boolean = true;
  @Input() dateFormat: string = CUSTOM_DATE_FILTER_DATE_FORMAT;
  @Input() popupPanelClass?: string | string[];
  @Input() viewportSafePopup: boolean = false;
  @Output() rangeChange = new EventEmitter<CustomDateFilterChange>();

  readonly period = CustomDateFilterPeriod;
  dateFilterForm: FormGroup;
  visibleOptions: CustomDateFilterOption[] = [];
  startScrollStrategy: ScrollStrategy;
  endScrollStrategy: ScrollStrategy;
  private lastCustomRangeKey: string = '';

  constructor(
    private builder: FormBuilder,
    private readonly sso: ScrollStrategyOptions) {
    this.startScrollStrategy = this.sso.reposition();
    this.endScrollStrategy = this.sso.reposition();
  }

  ngOnInit(): void {
    this.visibleOptions = this.getValidOptions(this.options);
    const initialPeriod = this.getResolvedPeriod();
    this.dateFilterForm = this.builder.group({
      period: [initialPeriod],
      startDate: [{ value: null, disabled: true }],
      endDate: [{ value: null, disabled: true }]
    }, { validators: this.dateRangeValidator });

    if (initialPeriod) {
      this.applyPeriod(initialPeriod, this.emitOnInit);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.dateFilterForm || !(changes.default || changes.defaultPeriod || changes.options)) {
      return;
    }

    this.visibleOptions = this.getValidOptions(this.options);
    const resolvedPeriod = this.getResolvedPeriod();
    if (resolvedPeriod) {
      this.applyPeriod(resolvedPeriod, this.emitOnExternalChanges);
    } else {
      this.dateFilterForm.get('period').setValue(null, { emitEvent: false });
      this.setDateControlsEnabled(false);
      this.dateFilterForm.patchValue({ startDate: null, endDate: null }, { emitEvent: false });
    }
  }

  get selectedPeriod(): CustomDateFilterPeriod {
    return this.dateFilterForm?.get('period')?.value;
  }

  selectPeriod(period?: string | null, shouldEmit: boolean = true): void {
    const selectedPeriod = this.toVisiblePeriod(period);
    if (!this.dateFilterForm || !selectedPeriod) {
      return;
    }

    this.applyPeriod(selectedPeriod, shouldEmit);
  }

  onDateChange(): void {
    this.dateFilterForm?.updateValueAndValidity({ emitEvent: false });
    if (this.selectedPeriod !== CustomDateFilterPeriod.CUSTOM) {
      return;
    }

    const startDate = this.dateFilterForm.get('startDate')?.value;
    const endDate = this.dateFilterForm.get('endDate')?.value;
    if (startDate && endDate) {
      this.emitCustomRange();
    }
  }

  trackByOption(index: number, option: CustomDateFilterOption): string {
    return option?.value || String(index);
  }

  onPickerClosed(): void {
    this.dateFilterForm?.updateValueAndValidity({ emitEvent: false });
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

  private applyPeriod(period: CustomDateFilterPeriod, shouldEmit: boolean = true): void {
    const previousPeriod = this.selectedPeriod;
    this.dateFilterForm.get('period').setValue(period, { emitEvent: false });

    if (period === CustomDateFilterPeriod.ALL || period === CustomDateFilterPeriod.ALL_TIME) {
      this.setDateControlsEnabled(false);
      this.dateFilterForm.patchValue({ startDate: null, endDate: null }, { emitEvent: false });
      if (shouldEmit) {
        this.lastCustomRangeKey = '';
        this.emitRange({ period: period, from: null, to: null });
      }
      return;
    }

    if (period === CustomDateFilterPeriod.CUSTOM) {
      this.setDateControlsEnabled(true);
      this.patchCustomRange(previousPeriod === CustomDateFilterPeriod.CUSTOM);
      return;
    }

    const dateRange = getCustomDateFilterRange(period, null, null, this.dateOnlyPicker, this.dateFormat);
    if (!dateRange) {
      return;
    }

    this.setDateControlsEnabled(false);
    this.dateFilterForm.patchValue({
      startDate: dateRange.from ? moment(dateRange.from, this.dateFormat).toDate() : null,
      endDate: dateRange.to ? moment(dateRange.to, this.dateFormat).toDate() : null
    }, { emitEvent: false });

    if (shouldEmit) {
      this.lastCustomRangeKey = '';
      this.emitRange(dateRange);
    }
  }

  private emitCustomRange(): void {
    if (this.dateFilterForm.invalid) {
      return;
    }

    const dateRange = getCustomDateFilterRange(
      CustomDateFilterPeriod.CUSTOM,
      this.dateFilterForm.get('startDate').value,
      this.dateFilterForm.get('endDate').value,
      this.dateOnlyPicker,
      this.dateFormat
    );
    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    const rangeKey = `${dateRange.from}|${dateRange.to}`;
    if (rangeKey === this.lastCustomRangeKey) {
      return;
    }

    this.lastCustomRangeKey = rangeKey;
    this.emitRange(dateRange);
  }

  private emitRange(dateRange: CustomDateFilterChange): void {
    this.rangeChange.emit(dateRange);
  }

  private setDateControlsEnabled(enabled: boolean): void {
    ['startDate', 'endDate'].forEach((controlName: string) => {
      const control = this.dateFilterForm.get(controlName);
      if (!control) {
        return;
      }
      if (enabled) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    });
  }

  private patchCustomRange(preserveCurrentValues: boolean = false): void {
    const dateRange = this.getSelectedCustomRange(preserveCurrentValues);
    this.dateFilterForm.patchValue({
      startDate: dateRange.from ? moment(dateRange.from).toDate() : null,
      endDate: dateRange.to ? moment(dateRange.to).toDate() : null
    }, { emitEvent: false });
    this.dateFilterForm.updateValueAndValidity({ emitEvent: false });
  }

  private getSelectedCustomRange(preserveCurrentValues: boolean): CustomDateFilterOption {
    const currentFrom = this.dateFilterForm?.get('startDate')?.value;
    const currentTo = this.dateFilterForm?.get('endDate')?.value;
    if (preserveCurrentValues && currentFrom && currentTo && moment(currentFrom).isValid() && moment(currentTo).isValid()) {
      return {
        from: moment(currentFrom).format(this.dateFormat),
        to: moment(currentTo).format(this.dateFormat)
      };
    }

    const defaultValue = this.getDefaultValue();
    if (this.isDateFilterOption(defaultValue)
      && this.toValidPeriod(defaultValue.value || CustomDateFilterPeriod.CUSTOM) === CustomDateFilterPeriod.CUSTOM
      && defaultValue.from
      && defaultValue.to
      && moment(defaultValue.from).isValid()
      && moment(defaultValue.to).isValid()) {
      return { from: defaultValue.from, to: defaultValue.to };
    }

    return { from: '', to: '' };
  }

  private getResolvedPeriod(): CustomDateFilterPeriod | null {
    const configuredPeriod = this.toPeriodFromDefault(this.getDefaultValue());
    if (configuredPeriod && this.hasVisiblePeriod(configuredPeriod)) {
      return configuredPeriod;
    }

    const fallbackValue = this.visibleOptions[0]?.value;
    return this.toValidPeriod(fallbackValue);
  }

  private getDefaultValue(): string | CustomDateFilterOption {
    return this.defaultPeriod || this.default || CustomDateFilterPeriod.THIRTY_DAYS;
  }

  private toPeriodFromDefault(value?: string | CustomDateFilterOption | null): CustomDateFilterPeriod | null {
    if (this.isDateFilterOption(value)) {
      return this.toValidPeriod(value.value || CustomDateFilterPeriod.CUSTOM);
    }

    return this.toValidPeriod(value);
  }

  private toVisiblePeriod(period?: string | null): CustomDateFilterPeriod | null {
    const validPeriod = this.toValidPeriod(period);
    return validPeriod && this.hasVisiblePeriod(validPeriod) ? validPeriod : null;
  }

  private toValidPeriod(period?: string | null): CustomDateFilterPeriod | null {
    return isCustomDateFilterPeriod(period) ? period : null;
  }

  private hasVisiblePeriod(period: CustomDateFilterPeriod): boolean {
    return this.visibleOptions.some((option: CustomDateFilterOption) => option?.value === period);
  }

  private getValidOptions(options?: Array<CustomDateFilterOption | string>): CustomDateFilterOption[] {
    return (options || [])
      .map((option: CustomDateFilterOption | string) => this.normalizeOption(option))
      .filter((option: CustomDateFilterOption | null): option is CustomDateFilterOption => !!option);
  }

  private normalizeOption(option: CustomDateFilterOption | string): CustomDateFilterOption | null {
    if (typeof option === 'string') {
      const period = this.toValidPeriod(option);
      return period ? { label: this.getDefaultLabel(period), value: period } : null;
    }

    if (!option || !this.toValidPeriod(option.value)) {
      return null;
    }

    const label = typeof option.label === 'string' ? option.label.trim() : '';
    return label ? { label: label, value: option.value, from: option.from, to: option.to } : null;
  }

  private getDefaultLabel(period: CustomDateFilterPeriod): string {
    switch (period) {
      case CustomDateFilterPeriod.TWENTY_FOUR_HOURS:
      case CustomDateFilterPeriod.LAST_24_HR:
      case CustomDateFilterPeriod.LAST_24_HOURS:
        return '24H';
      case CustomDateFilterPeriod.ONE_DAY:
        return '1D';
      case CustomDateFilterPeriod.SEVEN_DAYS:
      case CustomDateFilterPeriod.LAST_7_DAYS:
      case CustomDateFilterPeriod.LAST_7_DAYS_UNDERSCORE:
        return '7D';
      case CustomDateFilterPeriod.THIRTY_DAYS:
      case CustomDateFilterPeriod.LAST_30_DAYS:
        return '30D';
      case CustomDateFilterPeriod.SIXTY_DAYS:
        return '60D';
      case CustomDateFilterPeriod.NINETY_DAYS:
      case CustomDateFilterPeriod.LAST_90_DAYS:
        return '90D';
      case CustomDateFilterPeriod.LAST_QUARTER:
        return 'LAST QUARTER';
      case CustomDateFilterPeriod.ALL:
      case CustomDateFilterPeriod.ALL_TIME:
        return 'ALL';
      case CustomDateFilterPeriod.CUSTOM:
        return 'CUSTOM';
      default:
        return period.replace(/_/g, ' ').toUpperCase();
    }
  }

  private isDateFilterOption(value: string | CustomDateFilterOption | undefined | null): value is CustomDateFilterOption {
    return !!value && typeof value === 'object' && (
      Object.prototype.hasOwnProperty.call(value, 'value')
      || Object.prototype.hasOwnProperty.call(value, 'from')
      || Object.prototype.hasOwnProperty.call(value, 'to')
    );
  }

  private dateRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.get('period')?.value !== CustomDateFilterPeriod.CUSTOM) {
      return null;
    }

    const startValue = control.get('startDate')?.value;
    const endValue = control.get('endDate')?.value;
    if (!startValue || !endValue) {
      return { dateRangeRequired: true };
    }

    const start = moment(startValue);
    const end = moment(endValue);
    if (!start.isValid() || !end.isValid()) {
      return { invalidDateRange: true };
    }

    return start.isAfter(end) ? { startAfterEnd: true } : null;
  }
}
