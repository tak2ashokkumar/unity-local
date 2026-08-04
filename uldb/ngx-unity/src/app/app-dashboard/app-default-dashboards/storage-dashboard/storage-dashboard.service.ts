import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { DataCenterTabs } from 'src/app/united-cloud/datacenter/tabs';
import {
  STORAGE_DATACENTER_OPTIONS,
  STORAGE_DEFAULT_TIME_RANGE,
  STORAGE_DEFAULT_VENDOR,
  STORAGE_NETAPP_CLUSTER_OPTIONS,
  STORAGE_PURE_ARRAY_OPTIONS
} from './storage-dashboard.const';
import {
  StorageDashboardFilterCriteria,
  StorageDateRangeValue,
  StorageFilterOption,
  StorageResourceOption,
  StorageVendor
} from './storage-dashboard.type';

@Injectable()
export class StorageDashboardService {

  constructor(private builder: FormBuilder,
    private datacenterService: DatacenterService) { }

  buildFilterForm(datacenters: StorageFilterOption[], vendor: StorageVendor = STORAGE_DEFAULT_VENDOR): FormGroup {
    const resources = this.getResourceOptions(
      vendor,
      datacenters
    );
    return this.builder.group({
      vendor: [vendor],
      datacenters: [datacenters],
      resources: [resources],
      timeRange: [STORAGE_DEFAULT_TIME_RANGE]
    });
  }

  getDatacenters(): Observable<StorageFilterOption[]> {
    return this.datacenterService.getDataCenters().pipe(
      map(datacenters => this.convertToDatacenterOptions(datacenters))
    );
  }

  getFallbackDatacenters(): StorageFilterOption[] {
    return STORAGE_DATACENTER_OPTIONS.map(option => ({ ...option }));
  }

  getResourceOptions(vendor: StorageVendor, datacenters: StorageFilterOption[]): StorageResourceOption[] {
    const options = vendor === 'netapp'
      ? STORAGE_NETAPP_CLUSTER_OPTIONS
      : STORAGE_PURE_ARRAY_OPTIONS;
    const selectedDatacenters = new Set<string>();
    (datacenters || []).forEach(datacenter => {
      selectedDatacenters.add(datacenter.value);
      selectedDatacenters.add(this.normalizeDatacenterKey(datacenter.label));
    });

    const scopedOptions = options
      .filter(option => selectedDatacenters.has(option.datacenter))
      .map(option => ({ ...option }));

    // API datacenter names may not exist in the static demo resource mapping yet.
    return scopedOptions.length || !datacenters.length
      ? scopedOptions
      : options.map(option => ({ ...option }));
  }

  getVendor(form: FormGroup): StorageVendor {
    return form.get('vendor')?.value === 'pure' ? 'pure' : 'netapp';
  }

  getSelectedDatacenterValues(form: FormGroup): string[] {
    return this.getSelectedOptionValues(form, 'datacenters');
  }

  setSelectedResources(form: FormGroup, resources: StorageResourceOption[]): void {
    form.get('resources')?.setValue(resources);
  }

  ensureSelectedResources(form: FormGroup, resources: StorageResourceOption[]): void {
    const selectedValues = this.getSelectedResourceValues(form);
    const availableValues = resources.map(resource => resource.value);
    const validSelection = selectedValues.filter(value => availableValues.includes(value));
    if (!validSelection.length) {
      this.setSelectedResources(form, resources);
    }
  }

  createFilterCriteria(form: FormGroup, dateRange: StorageDateRangeValue): StorageDashboardFilterCriteria {
    return {
      vendor: this.getVendor(form),
      datacenters: this.getSelectedDatacenterValues(form),
      resourceIds: this.getSelectedResourceValues(form),
      period: dateRange.period || STORAGE_DEFAULT_TIME_RANGE,
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

  //need to remove while pushing
  private getSelectedResourceValues(form: FormGroup): string[] {
    return this.getSelectedOptionValues(form, 'resources');
  }

  private convertToDatacenterOptions(datacenters: DataCenterTabs[]): StorageFilterOption[] {
    const options = (datacenters || [])
      .filter(datacenter => !!datacenter?.uuid && !!datacenter?.name)
      .map(datacenter => ({
        value: datacenter.uuid,
        label: datacenter.name
      }));
    return options;
  }

  private normalizeDatacenterKey(label: string): string {
    return String(label || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
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
}
