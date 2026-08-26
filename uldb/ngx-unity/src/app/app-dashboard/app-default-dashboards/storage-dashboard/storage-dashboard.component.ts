import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatacenterService } from 'src/app/united-cloud/datacenter/datacenter.service';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import {
  STORAGE_ALL_VALUE,
  STORAGE_DEFAULT_TIME_RANGE,
  STORAGE_DEFAULT_STORAGE
} from './storage-dashboard.const';
import { StorageDashboardService } from './storage-dashboard.service';
import {
  StorageDashboardFilterOptionsViewData,
  StorageDashboardFilterCriteria,
  StorageArrayOption,
  StorageClusterOption,
  StorageDateRangeValue,
  StorageFilterOption,
  StorageFilterScopeSummary,
  StorageTimeRangeOption,
  StorageType
} from './storage-dashboard.type';

@Component({
  selector: 'storage-dashboard',
  templateUrl: './storage-dashboard.component.html',
  styleUrls: ['./storage-dashboard.component.scss'],
  providers: [StorageDashboardService, DatacenterService]
})
export class StorageDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private filterLoadCancel = new Subject<void>();
  private filterLoadId = 0;
  private initialFilterOptions: StorageDashboardFilterOptionsViewData;
  private reloadActionTimer?: number;
  private readonly reloadActionCooldownMs = 1000;
  readonly filterLoaderName = 'storageDashboardFiltersLoader';

  filterForm: FormGroup;
  filtersLoading = false;
  filterOptionsUnavailable = false;
  reloadActionDisabled = false;
  datacenterOptions: StorageFilterOption[] = [];
  clusterOptions: StorageClusterOption[] = [];
  arrayOptions: StorageArrayOption[] = [];
  timeRangeOptions: StorageTimeRangeOption[] = [];
  appliedDatacenterOptions: StorageFilterOption[] = [];
  appliedClusterOptions: StorageClusterOption[] = [];
  appliedArrayOptions: StorageArrayOption[] = [];
  appliedFilters: StorageDashboardFilterCriteria;
  refreshToken = 0;
  refreshedText = '';
  selectedStorage: StorageType = STORAGE_DEFAULT_STORAGE;
  selectedTimeRange = STORAGE_DEFAULT_TIME_RANGE;
  dateRange: StorageDateRangeValue = {
    period: STORAGE_DEFAULT_TIME_RANGE,
    from: '',
    to: ''
  };

  clusterMultiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    maxHeight: '240px'
  };
  arrayMultiselectSettings: IMultiSelectSettings = {
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

  clusterMultiselectTexts: IMultiSelectTexts = this.getClusterMultiselectTexts();
  arrayMultiselectTexts: IMultiSelectTexts = this.getArrayMultiselectTexts();

  constructor(private svc: StorageDashboardService,
    private spinnerService: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.applyFilterOptions(this.svc.getDefaultFilterOptions(this.selectedStorage), this.selectedStorage);
    setTimeout(() => this.loadFilterOptionsAndDashboard(true), 0);
  }

  ngOnDestroy(): void {
    if (this.reloadActionTimer) {
      window.clearTimeout(this.reloadActionTimer);
    }
    this.filterLoadCancel.next();
    this.spinnerService.stop(this.filterLoaderName);
    this.filterLoadCancel.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onStorageChange(selectedStorage: string): void {
    this.selectedStorage = selectedStorage === 'pure' ? 'pure' : 'netapp';
    this.loadFilterOptionsAndDashboard(true, this.selectedStorage, true);
  }

  onDatacenterChange(): void {
    if (this.selectedStorage === 'netapp') {
      this.loadClustersForSelectedDatacenter();
      return;
    }
    this.loadArraysForSelectedDatacenter();
  }

  onClustersChange(): void {
    this.svc.ensureSelectedClusters(this.filterForm, this.clusterOptions);
  }

  onArraysChange(): void {
    this.svc.ensureSelectedArrays(this.filterForm, this.arrayOptions);
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
    this.selectedTimeRange = this.dateRange.period;
    this.filterForm.get('timeRange')?.setValue(this.dateRange.period);
  }

  applyFilters(): void {
    if (!this.canRunReloadAction()) {
      return;
    }
    this.disableReloadActionsTemporarily();
    this.reloadDashboardWidgets();
  }

  refreshData(): void {
    if (!this.canRunReloadAction()) {
      return;
    }
    this.disableReloadActionsTemporarily();
    this.resetFilterControlsToInitialState();
    this.reloadDashboardWidgets();
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
      this.appliedDatacenterOptions,
      this.appliedFilters?.datacenters || [],
      'No datacenters'
    );
  }

  get storageItemScopeSummary(): StorageFilterScopeSummary {
    const storageType = this.appliedFilters?.storageType || this.selectedStorage;
    return this.getScopeSummary(
      storageType === 'netapp' ? this.appliedClusterOptions : this.appliedArrayOptions,
      storageType === 'netapp'
        ? this.appliedFilters?.clusters || []
        : this.appliedFilters?.arrays || [],
      storageType === 'netapp' ? 'No clusters' : 'No arrays'
    );
  }

  get storageItemScopeLabel(): string {
    const storageType = this.appliedFilters?.storageType || this.selectedStorage;
    return storageType === 'netapp' ? 'Cluster' : 'Arrays';
  }

  get reloadButtonsDisabled(): boolean {
    return this.filtersLoading || this.reloadActionDisabled;
  }

  private updateAppliedFilters(): void {
    this.appliedFilters = this.svc.createFilterCriteria(this.filterForm, this.dateRange, this.timeRangeOptions,
      this.selectedStorage);
    this.appliedDatacenterOptions = this.datacenterOptions.map(option => ({ ...option }));
    this.appliedClusterOptions = this.clusterOptions.map(option => ({ ...option }));
    this.appliedArrayOptions = this.arrayOptions.map(option => ({ ...option }));
  }

  private reloadDashboardWidgets(): void {
    this.updateAppliedFilters();
    this.refreshedText = this.svc.getCurrentRefreshedText();
    this.refreshToken += 1;
  }

  private canRunReloadAction(): boolean {
    return !!this.filterForm && !this.reloadButtonsDisabled;
  }

  private disableReloadActionsTemporarily(): void {
    this.reloadActionDisabled = true;
    if (this.reloadActionTimer) {
      window.clearTimeout(this.reloadActionTimer);
    }
    this.reloadActionTimer = window.setTimeout(() => {
      this.reloadActionDisabled = false;
      this.reloadActionTimer = undefined;
    }, this.reloadActionCooldownMs);
  }

  private loadFilterOptionsAndDashboard(applyAfterLoad: boolean, storageType: StorageType = this.selectedStorage,
    switchDashboardImmediately = false): void {
    this.filterLoadCancel.next();
    const loadId = ++this.filterLoadId;
    const selectedStorage = storageType;
    this.selectedStorage = selectedStorage;
    this.filterOptionsUnavailable = false;
    this.applyFilterOptions(this.svc.getDefaultFilterOptions(selectedStorage), selectedStorage);
    if (applyAfterLoad || !this.appliedFilters) {
      this.refreshedText = this.svc.getCurrentRefreshedText();
    }
    if (switchDashboardImmediately && (applyAfterLoad || !this.appliedFilters)) {
      this.reloadDashboardWidgets();
    }
    this.filtersLoading = true;
    this.spinnerService.start(this.filterLoaderName);
    this.svc.getFilterOptions(selectedStorage).pipe(
      takeUntil(this.filterLoadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopFilterLoader(loadId))
    ).subscribe(options => {
      this.filterOptionsUnavailable = false;
      this.applyFilterOptions(options, selectedStorage);
      if (applyAfterLoad || !this.appliedFilters) {
        this.updateAppliedFilters();
      }
    }, () => {
      this.filterOptionsUnavailable = true;
      this.applyFilterOptions(this.svc.getDefaultFilterOptions(selectedStorage), selectedStorage);
      if (applyAfterLoad || !this.appliedFilters) {
        this.updateAppliedFilters();
      }
    });
  }

  private loadClustersForSelectedDatacenter(): void {
    const datacenter = this.svc.getSelectedDatacenterValue(this.filterForm);
    this.filterLoadCancel.next();
    const loadId = ++this.filterLoadId;
    this.filtersLoading = true;
    this.spinnerService.start(this.filterLoaderName);
    this.svc.getFilterOptions('netapp', datacenter).pipe(
      takeUntil(this.filterLoadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopFilterLoader(loadId))
    ).subscribe(options => {
      this.clusterOptions = options.clusters || [];
      this.svc.setSelectedClusters(this.filterForm, this.clusterOptions);
    }, () => {
      this.clusterOptions = [];
      this.filterForm.get('clusters')?.setValue([]);
    });
  }

  private loadArraysForSelectedDatacenter(): void {
    const datacenter = this.svc.getSelectedDatacenterValue(this.filterForm);
    this.filterLoadCancel.next();
    const loadId = ++this.filterLoadId;
    this.filtersLoading = true;
    this.spinnerService.start(this.filterLoaderName);
    this.svc.getFilterOptions('pure', datacenter).pipe(
      takeUntil(this.filterLoadCancel),
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopFilterLoader(loadId))
    ).subscribe(options => {
      this.arrayOptions = options.arrays || [];
      this.svc.setSelectedArrays(this.filterForm, this.arrayOptions);
    }, () => {
      this.arrayOptions = this.svc.getDefaultFilterOptions('pure').arrays;
      this.svc.setSelectedArrays(this.filterForm, this.arrayOptions);
    });
  }

  private applyFilterOptions(options: StorageDashboardFilterOptionsViewData, selectedStorage: StorageType): void {
    this.selectedStorage = selectedStorage;
    this.datacenterOptions = options.datacenters || [];
    this.clusterOptions = options.clusters || [];
    this.arrayOptions = options.arrays || [];
    this.timeRangeOptions = options.timeRangeOptions || [];
    this.initialFilterOptions = this.cloneFilterOptions({
      datacenters: this.datacenterOptions,
      clusters: this.clusterOptions,
      arrays: this.arrayOptions,
      timeRangeOptions: this.timeRangeOptions
    });
    this.selectedTimeRange = this.svc.getDefaultTimeRangeValue(this.timeRangeOptions);
    this.dateRange = {
      period: this.selectedTimeRange,
      from: '',
      to: ''
    };
    this.filterForm = this.svc.buildFilterForm(
      this.datacenterOptions,
      this.clusterOptions,
      this.arrayOptions,
      this.selectedStorage,
      this.selectedStorage === 'netapp' ? this.datacenterOptions[0]?.value : undefined,
      this.selectedTimeRange
    );
  }

  private resetFilterControlsToInitialState(): void {
    const options = this.cloneFilterOptions(this.initialFilterOptions || this.svc.getDefaultFilterOptions(this.selectedStorage));
    this.datacenterOptions = options.datacenters;
    this.clusterOptions = options.clusters;
    this.arrayOptions = options.arrays;
    this.timeRangeOptions = options.timeRangeOptions;
    this.selectedTimeRange = this.svc.getDefaultTimeRangeValue(this.timeRangeOptions);
    this.dateRange = {
      period: this.selectedTimeRange,
      from: '',
      to: ''
    };
    if (!this.filterForm) {
      this.filterForm = this.svc.buildFilterForm(
        this.datacenterOptions,
        this.clusterOptions,
        this.arrayOptions,
        this.selectedStorage,
        this.selectedStorage === 'netapp' ? this.datacenterOptions[0]?.value : undefined,
        this.selectedTimeRange
      );
      return;
    }
    this.filterForm.patchValue({
      datacenter: this.datacenterOptions[0]?.value || STORAGE_ALL_VALUE,
      timeRange: this.selectedTimeRange
    }, { emitEvent: false });
    this.svc.setSelectedClusters(this.filterForm, this.clusterOptions);
    this.svc.setSelectedArrays(this.filterForm, this.arrayOptions);
  }

  private cloneFilterOptions(options: StorageDashboardFilterOptionsViewData): StorageDashboardFilterOptionsViewData {
    return {
      datacenters: (options?.datacenters || []).map(option => ({ ...option })),
      clusters: (options?.clusters || []).map(option => ({ ...option })),
      arrays: (options?.arrays || []).map(option => ({ ...option })),
      timeRangeOptions: (options?.timeRangeOptions || []).map(option => ({ ...option }))
    };
  }

  private stopFilterLoader(loadId?: number): void {
    if (!loadId || loadId === this.filterLoadId) {
      this.filtersLoading = false;
    }
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

  private getClusterMultiselectTexts(): IMultiSelectTexts {
    return this.getMultiselectTexts('Clusters');
  }

  private getArrayMultiselectTexts(): IMultiSelectTexts {
    return this.getMultiselectTexts('Arrays');
  }

  private getMultiselectTexts(resourceName: string): IMultiSelectTexts {
    const baseTexts: IMultiSelectTexts = {
      checkAll: `Select all`,
      uncheckAll: `Unselect all`,
      // checked: 'item selected',
      // checkedPlural: 'items selected',
      searchPlaceholder: 'Find',
      // defaultTitle: `All ${resourceName}`,
      // allSelected: `All ${resourceName}`
    };
    if (resourceName === 'Clusters') {
      return {
        ...baseTexts,
        checked: 'cluster selected',
        checkedPlural: 'clusters selected',
        defaultTitle: 'Select Clusters',
        allSelected: 'All Clusters'
      };
    }
    if (resourceName === 'Arrays') {
      return {
        ...baseTexts,
        checked: 'array selected',
        checkedPlural: 'arrays selected',
        defaultTitle: 'Select Arrays',
        allSelected: 'All Arrays'
      };
    }
    return baseTexts;
  }
}
