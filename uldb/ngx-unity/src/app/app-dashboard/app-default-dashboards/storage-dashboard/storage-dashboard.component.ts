import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import {
  STORAGE_DEFAULT_TIME_RANGE,
  STORAGE_DEFAULT_VENDOR,
  STORAGE_TIME_RANGE_OPTIONS,
  STORAGE_VENDOR_OPTIONS
} from './storage-dashboard.const';
import { StorageDashboardService } from './storage-dashboard.service';
import {
  StorageDashboardFilterCriteria,
  StorageDateRangeValue,
  StorageFilterOption,
  StorageFilterScopeSummary,
  StorageResourceOption,
  StorageVendor,
  StorageVendorOption
} from './storage-dashboard.type';

@Component({
  selector: 'storage-dashboard',
  templateUrl: './storage-dashboard.component.html',
  styleUrls: ['./storage-dashboard.component.scss'],
  providers: [StorageDashboardService, DatacenterService]
})
export class StorageDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  readonly vendorOptions: StorageVendorOption[] = STORAGE_VENDOR_OPTIONS;
  readonly timeRangeOptions = STORAGE_TIME_RANGE_OPTIONS;
  readonly defaultTimeRange = STORAGE_DEFAULT_TIME_RANGE;
  readonly filterLoaderName = 'storageDashboardFiltersLoader';

  filterForm: FormGroup;
  datacenterOptions: StorageFilterOption[] = [];
  resourceOptions: StorageResourceOption[] = [];
  appliedFilters: StorageDashboardFilterCriteria;
  refreshToken = 0;
  refreshedText = '';
  selectedVendor: StorageVendor = STORAGE_DEFAULT_VENDOR;
  dateRange: StorageDateRangeValue = {
    period: STORAGE_DEFAULT_TIME_RANGE,
    from: '',
    to: ''
  };

  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    maxHeight: '240px'
  };

  datacenterMultiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all datacenters',
    uncheckAll: 'Unselect all datacenters',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'All Datacenters',
    allSelected: 'All Datacenters'
  };

  resourceMultiselectTexts: IMultiSelectTexts;

  constructor(private svc: StorageDashboardService,
    private spinnerService: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.spinnerService.stop(this.filterLoaderName);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onVendorChange(): void {
    this.selectedVendor = this.svc.getVendor(this.filterForm);
    this.refreshResourceOptions(true);
    this.applyFilters(true);
  }

  onDatacentersChange(): void {
    this.refreshResourceOptions(true);
    this.applyFilters(true);
  }

  onResourcesChange(): void {
    this.svc.ensureSelectedResources(this.filterForm, this.resourceOptions);
    this.applyFilters(true);
  }

  onTimeRangeChange(value: FormGroup | StorageDateRangeValue): void {
    const dateRange = value instanceof FormGroup
      ? value.getRawValue() as StorageDateRangeValue
      : value;
    this.dateRange = {
      period: dateRange.period || STORAGE_DEFAULT_TIME_RANGE,
      from: dateRange.from || '',
      to: dateRange.to || ''
    };
    this.filterForm.get('timeRange')?.setValue(this.dateRange.period);
    this.applyFilters(true);
  }

  refreshData(): void {
    this.refreshToken += 1;
    this.loadFilterOptionsAndDashboard();
  }

  goBack(): void {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  trackByOption(_: number, option: StorageFilterOption): string {
    return option.value;
  }

  trackByIndex(index: number): number {
    return index;
  }

  get datacenterScopeSummary(): StorageFilterScopeSummary {
    return this.getScopeSummary(
      this.datacenterOptions,
      this.appliedFilters?.datacenters || [],
      'No datacenters'
    );
  }

  get resourceScopeSummary(): StorageFilterScopeSummary {
    return this.getScopeSummary(
      this.resourceOptions,
      this.appliedFilters?.resourceIds || [],
      this.selectedVendor === 'netapp' ? 'No clusters' : 'No arrays'
    );
  }

  private refreshResourceOptions(resetSelection: boolean): void {
    const selectedValues = this.svc.getSelectedDatacenterValues(this.filterForm);
    const datacenters = this.datacenterOptions.filter(option => selectedValues.includes(option.value));
    this.resourceOptions = this.svc.getResourceOptions(this.selectedVendor, datacenters);
    this.resourceMultiselectTexts = this.getResourceMultiselectTexts();
    if (resetSelection) {
      this.svc.setSelectedResources(this.filterForm, this.resourceOptions);
    } else {
      this.svc.ensureSelectedResources(this.filterForm, this.resourceOptions);
    }
  }

  private applyFilters(notifyChildren = false): void {
    this.appliedFilters = this.svc.createFilterCriteria(this.filterForm, this.dateRange);
    if (notifyChildren) {
      this.refreshToken += 1;
    }
  }

  private loadFilterOptionsAndDashboard(): void {
    this.resetFilterState();
    this.refreshedText = this.svc.getCurrentRefreshedText();
    this.spinnerService.start(this.filterLoaderName);
    this.svc.getDatacenters().pipe(
      catchError(() => of(this.svc.getFallbackDatacenters())),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(datacenters => {
      this.datacenterOptions = datacenters || [];
      this.filterForm = this.svc.buildFilterForm(this.datacenterOptions, this.selectedVendor);
      this.refreshResourceOptions(true);
      this.applyFilters();
      this.stopFilterLoader();
    });
  }

  private resetFilterState(): void {
    this.filterForm = null;
    this.datacenterOptions = [];
    this.resourceOptions = [];
    this.dateRange = {
      period: STORAGE_DEFAULT_TIME_RANGE,
      from: '',
      to: ''
    };
  }

  private stopFilterLoader(): void {
    setTimeout(() => this.spinnerService.stop(this.filterLoaderName), 0);
  }

  private getScopeSummary(options: StorageFilterOption[], selectedValues: string[],
    emptyLabel: string): StorageFilterScopeSummary {
    const labels = (selectedValues || [])
      .map(value => options.find(option => option.value === value)?.label || value)
      .filter(label => !!label);
    if (!labels.length) {
      return {
        primaryLabel: emptyLabel,
        remainingLabels: []
      };
    }
    return {
      primaryLabel: labels[0],
      remainingLabels: labels.slice(1)
    };
  }

  private getResourceMultiselectTexts(): IMultiSelectTexts {
    const resourceName = this.selectedVendor === 'netapp' ? 'Clusters' : 'Arrays';
    return {
      checkAll: `Select all ${resourceName.toLowerCase()}`,
      uncheckAll: `Unselect all ${resourceName.toLowerCase()}`,
      checked: 'item selected',
      checkedPlural: 'items selected',
      searchPlaceholder: 'Find',
      defaultTitle: `All ${resourceName}`,
      allSelected: `All ${resourceName}`
    };
  }
}
