import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  STORAGE_ALL_ARRAY_OPTION,
  STORAGE_ALL_DATACENTER_OPTION,
  STORAGE_ALL_VALUE,
  STORAGE_DEFAULT_TIME_RANGE,
  STORAGE_DEFAULT_STORAGE,
  STORAGE_NETAPP_FILTERS_ENDPOINT,
  STORAGE_PURE_FILTERS_ENDPOINT,
  STORAGE_TIME_RANGE_OPTIONS,
  STORAGE_TIME_RANGE_UI_VALUE_MAP
} from './storage-dashboard.const';
import {
  StorageDashboardFilterOptionsViewData,
  StorageDashboardFilterCriteria,
  StorageDateRangeValue,
  StorageArrayOption,
  StorageClusterOption,
  StorageFilterOption,
  StorageNetappDatacenterApi,
  StorageNetappClusterApi,
  StoragePureDashboardFiltersResponse,
  StorageType,
  StorageTimeRangeOption,
  StorageTimeRangeOptionApi,
  StorageNetappDashboardFiltersResponse
} from './storage-dashboard.type';

@Injectable()
export class StorageDashboardService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  buildFilterForm(datacenters: StorageFilterOption[], clusters: StorageClusterOption[], arrays: StorageArrayOption[],
    selectedStorage: StorageType = STORAGE_DEFAULT_STORAGE, datacenter = STORAGE_ALL_VALUE,
    timeRange = STORAGE_DEFAULT_TIME_RANGE): FormGroup {
    return this.builder.group({
      datacenter: [this.getDefaultDatacenterValue(datacenters, datacenter)],
      clusters: [selectedStorage === 'netapp'
        ? this.getDefaultClusterSelection(clusters)
        : this.getDefaultOptionSelection(clusters)],
      arrays: [this.getDefaultOptionSelection(arrays)],
      timeRange: [timeRange]
    });
  }

  getFilterOptions(selectedStorage: StorageType, datacenter?: string): Observable<StorageDashboardFilterOptionsViewData> {
    return selectedStorage === 'pure'
      ? this.getPureFilterOptions(datacenter)
      : this.getNetappFilterOptions(datacenter);
  }

  getDefaultFilterOptions(selectedStorage: StorageType): StorageDashboardFilterOptionsViewData {
    return {
      datacenters: [{ ...STORAGE_ALL_DATACENTER_OPTION }],
      clusters: [],
      arrays: selectedStorage === 'pure' ? [{ ...STORAGE_ALL_ARRAY_OPTION }] : [],
      timeRangeOptions: [this.getDefaultTimeRangeOption()]
    };
  }

  getDefaultTimeRangeValue(options: StorageTimeRangeOption[]): string {
    const values = (options || []).map(option => this.getUiTimeRangeValue(option.value));
    return values.includes(STORAGE_DEFAULT_TIME_RANGE)
      ? STORAGE_DEFAULT_TIME_RANGE
      : values[0] || STORAGE_DEFAULT_TIME_RANGE;
  }

  getSelectedDatacenterValue(form: FormGroup): string {
    return form.get('datacenter')?.value || STORAGE_ALL_VALUE;
  }

  setSelectedClusters(form: FormGroup, clusters: StorageClusterOption[]): void {
    form.get('clusters')?.setValue(this.getDefaultClusterSelection(clusters));
  }

  setSelectedArrays(form: FormGroup, arrays: StorageArrayOption[]): void {
    form.get('arrays')?.setValue(this.getDefaultOptionSelection(arrays));
  }

  ensureSelectedClusters(form: FormGroup, clusters: StorageClusterOption[]): void {
    this.ensureSelectedOptions(form, 'clusters', clusters);
  }

  ensureSelectedArrays(form: FormGroup, arrays: StorageArrayOption[]): void {
    this.ensureSelectedOptions(form, 'arrays', arrays);
  }

  private ensureSelectedOptions(form: FormGroup, controlName: 'clusters' | 'arrays',
    options: Array<StorageClusterOption | StorageArrayOption>): void {
    const selectedValues = this.getSelectedOptionValues(form, controlName);
    const availableValues = options.map(option => option.value);
    const validSelection = selectedValues.filter(value => availableValues.includes(value));
    if (!validSelection.length) {
      form.get(controlName)?.setValue(controlName === 'clusters'
        ? this.getDefaultClusterSelection(options as StorageClusterOption[])
        : this.getDefaultOptionSelection(options as StorageArrayOption[]));
      return;
    }
    if (validSelection.includes(STORAGE_ALL_VALUE) && selectedValues.length > 1) {
      form.get(controlName)?.setValue(options.filter(option => option.value === STORAGE_ALL_VALUE));
    }
  }

  createFilterCriteria(form: FormGroup, dateRange: StorageDateRangeValue,
    timeRangeOptions: StorageTimeRangeOption[],
    storageType: StorageType = STORAGE_DEFAULT_STORAGE): StorageDashboardFilterCriteria {
    const datacenter = this.getSelectedDatacenterValue(form);
    const period = dateRange.period || STORAGE_DEFAULT_TIME_RANGE;
    const selectedStorage = storageType === 'pure' ? 'pure' : 'netapp';
    return {
      storageType: selectedStorage,
      datacenters: datacenter ? [datacenter] : [],
      clusters: selectedStorage === 'netapp' ? this.getSelectedClusterValues(form) : [],
      arrays: selectedStorage === 'pure' ? this.getSelectedArrayValues(form) : [],
      period,
      timeRangeApiValue: this.getTimeRangeApiValue(timeRangeOptions, period),
      from: dateRange.from || '',
      to: dateRange.to || ''
    };
  }

  getCurrentRefreshedText(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeZoneLabel = this.getBrowserTimeZoneLabel(now);
    return `Today ${hours}:${minutes}${timeZoneLabel ? ` ${timeZoneLabel}` : ''}`;
  }

  private getNetappFilterOptions(datacenter?: string): Observable<StorageDashboardFilterOptionsViewData> {
    return this.http.get<StorageNetappDashboardFiltersResponse>(STORAGE_NETAPP_FILTERS_ENDPOINT, {
      params: this.getFilterOptionParams('netapp', datacenter)
    }).pipe(map(response => this.convertNetappFilterOptions(response)));
  }

  private getPureFilterOptions(datacenter?: string): Observable<StorageDashboardFilterOptionsViewData> {
    return this.http.get<StoragePureDashboardFiltersResponse>(STORAGE_PURE_FILTERS_ENDPOINT, {
      params: this.getFilterOptionParams('pure', datacenter)
    }).pipe(map(response => this.convertPureFilterOptions(response)));
  }

  private getFilterOptionParams(selectedStorage: StorageType, datacenter?: string): HttpParams {
    let params = new HttpParams();
    if (datacenter && (selectedStorage === 'pure' || datacenter !== STORAGE_ALL_VALUE)) {
      params = params.set('datacenter', datacenter);
    }
    return params;
  }

  private convertNetappFilterOptions(response?: StorageNetappDashboardFiltersResponse): StorageDashboardFilterOptionsViewData {
    const clusters = this.getNetappClusterOptions(response);
    return {
      datacenters: this.prependAllOption(this.normalizeNetappDatacenterOptions(response?.datacenters),
        STORAGE_ALL_DATACENTER_OPTION),
      clusters: clusters.map(cluster => ({
        value: cluster.name,
        label: cluster.name,
        name: cluster.name,
        uuid: cluster.uuid
      })),
      arrays: [],
      timeRangeOptions: this.normalizeTimeRangeOptions(response?.timeRangeOptions)
    };
  }

  private convertPureFilterOptions(response: StoragePureDashboardFiltersResponse): StorageDashboardFilterOptionsViewData {
    return {
      datacenters: this.prependAllOption((response?.datacenters || []).map(datacenter => ({
        value: datacenter.uuid,
        label: datacenter.name
      })), STORAGE_ALL_DATACENTER_OPTION),
      clusters: [],
      arrays: this.prependAllOption((response?.arrays || []).map(array => ({
        value: array.uuid,
        label: array.name
      })), STORAGE_ALL_ARRAY_OPTION),
      timeRangeOptions: this.normalizeTimeRangeOptions(response?.time_range)
    };
  }

  private normalizeTimeRangeOptions(options?: StorageTimeRangeOptionApi[]): StorageTimeRangeOption[] {
    const timeRangeOptions: StorageTimeRangeOption[] = [];
    (options || []).forEach(option => {
      if (!option?.value || !option?.label) {
        return;
      }
      const value = this.getUiTimeRangeValue(option.value);
      if (value === 'custom') {
        return;
      }
      if (timeRangeOptions.some(item => item.value === value)) {
        return;
      }
      const defaultOption = STORAGE_TIME_RANGE_OPTIONS.find(item => item.value === value);
      timeRangeOptions.push({
        value,
        label: defaultOption?.label || option.label,
        apiValue: option.value === value ? undefined : option.value
      });
    });
    return timeRangeOptions.length ? timeRangeOptions : [this.getDefaultTimeRangeOption()];
  }

  private prependAllOption<T extends StorageFilterOption>(options: T[], allOption: T): T[] {
    const filteredOptions = (options || []).filter(option => !!option?.value && option.value !== STORAGE_ALL_VALUE);
    return [{ ...allOption }, ...filteredOptions.map(option => ({ ...option }))];
  }

  private normalizeNetappDatacenterOptions(datacenters?: StorageNetappDatacenterApi[]): StorageFilterOption[] {
    return (datacenters || [])
      .map(datacenter => {
        return {
          value: datacenter?.value || '',
          label: datacenter?.label || datacenter?.value || ''
        };
      })
      .filter(option => !!option.value && !!option.label);
  }

  private getNetappClusterOptions(response?: StorageNetappDashboardFiltersResponse): StorageNetappClusterApi[] {
    const clusters = response?.clusters || [];
    return clusters;
  }

  private getDefaultDatacenterValue(datacenters: StorageFilterOption[], selectedDatacenter: string): string {
    const values = (datacenters || []).map(option => option.value);
    return values.includes(selectedDatacenter) ? selectedDatacenter : STORAGE_ALL_VALUE;
  }

  private getDefaultOptionSelection<T extends StorageFilterOption>(options: T[]): T[] {
    const filterOptions = options || [];
    const allOption = filterOptions.find(option => option.value === STORAGE_ALL_VALUE);
    return allOption ? [allOption] : [...filterOptions];
  }

  private getDefaultClusterSelection(options: StorageClusterOption[]): string[] {
    return (options || [])
      .map(option => option?.value || option?.name || '')
      .filter(value => !!value);
  }

  private getSelectedClusterValues(form: FormGroup): string[] {
    const selected = (form.get('clusters')?.value || []) as Array<StorageClusterOption | string>;
    return selected
      .map(item => {
        if (typeof item === 'string') {
          return item;
        }
        return item.name || item.value;
      })
      .filter(value => !!value);
  }

  private getSelectedArrayValues(form: FormGroup): string[] {
    return this.normalizeAllSelection(this.getSelectedOptionValues(form, 'arrays'));
  }

  private normalizeAllSelection(values: string[]): string[] {
    return values.includes(STORAGE_ALL_VALUE) ? [STORAGE_ALL_VALUE] : values;
  }

  private getSelectedOptionValues(form: FormGroup, controlName: string): string[] {
    const selected = (form.get(controlName)?.value || []) as Array<StorageFilterOption | string>;
    return selected
      .map(item => typeof item === 'string' ? item : item.value)
      .filter(value => !!value);
  }

  private getBrowserTimeZoneLabel(date: Date): string {
    try {
      const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(date);
      return parts.find(part => part.type === 'timeZoneName')?.value || '';
    } catch {
      return '';
    }
  }

  private getUiTimeRangeValue(value: string): string {
    return STORAGE_TIME_RANGE_UI_VALUE_MAP[value] || value;
  }

  private getTimeRangeApiValue(options: StorageTimeRangeOption[], period: string): string {
    const selectedOption = (options || []).find(option => option.value === period);
    return selectedOption?.apiValue || selectedOption?.value || period;
  }

  private getDefaultTimeRangeOption(): StorageTimeRangeOption {
    const defaultOption = STORAGE_TIME_RANGE_OPTIONS.find(option => option.value === STORAGE_DEFAULT_TIME_RANGE);
    return defaultOption ? { ...defaultOption } : { value: STORAGE_DEFAULT_TIME_RANGE, label: 'Last 30 Days' };
  }
}
