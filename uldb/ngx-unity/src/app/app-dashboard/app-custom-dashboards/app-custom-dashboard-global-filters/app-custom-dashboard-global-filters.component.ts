import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CUSTOM_DASHBOARD_GLOBAL_FILTERS, CustomDashboardGlobalFilterDef } from '../app-custom-dashboards.const';
import { AppCustomDashboardDataScopeService } from '../app-custom-dashboard-data-scope/app-custom-dashboard-data-scope.service';
import { CustomDashboard, CustomDashboardFilterOptionGroup, CustomDashboardPanel } from '../app-custom-dashboards.type';
import { AppCustomDashboardGlobalFiltersService } from './app-custom-dashboard-global-filters.service';

@Component({
  selector: 'app-custom-dashboard-global-filters',
  templateUrl: './app-custom-dashboard-global-filters.component.html',
  styleUrls: ['./app-custom-dashboard-global-filters.component.scss'],
  providers: [AppCustomDashboardGlobalFiltersService, AppCustomDashboardDataScopeService]
})
export class AppCustomDashboardGlobalFiltersComponent implements OnInit, OnDestroy {
  @Input() dashboard: CustomDashboard;
  private readonly ngUnsubscribe = new Subject<void>();

  optionGroups: CustomDashboardFilterOptionGroup[] = [];
  filtersForm: FormGroup;
  submitted = false;

  panelOptions: { id: string, title: string }[] = [];
  multiSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'id',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };
  singleSettings: IMultiSelectSettings = {
    ...this.multiSettings,
    selectionLimit: 1,
    autoUnselect: true,
    showCheckAll: false
  };
  panelSettings: IMultiSelectSettings = {
    ...this.multiSettings,
    lableToDisplay: 'title'
  };
  defaultValueTexts: IMultiSelectTexts = { defaultTitle: 'No default' };
  panelTexts: IMultiSelectTexts = { defaultTitle: 'Select panels' };

  constructor(private svc: AppCustomDashboardGlobalFiltersService,
    private dataScopeSvc: AppCustomDashboardDataScopeService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService) { }

  // Filter options come from the filter-options API; Public Cloud and Account / Subscription
  // are filled from the existing Public Cloud accounts. Either call may fail on its own.
  ngOnInit(): void {
    this.panelOptions = this.getPanels().map(p => ({ id: p.id, title: p.title }));
    this.spinnerSvc.start('main');
    forkJoin([
      this.svc.getFilterOptions().pipe(catchError(() => of(null))),
      this.dataScopeSvc.getPublicCloudScopes().pipe(catchError(() => of(null)))
    ]).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe(([options, accounts]) => {
        if (!options) {
          this.notificationSvc.error(new Notification('Failed to fetch filter options.'));
        }
        this.optionGroups = this.svc.addPublicCloudOptions((options && options.results) || [], accounts ? accounts.results : null);
        this.buildFiltersForm();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get filters(): FormArray {
    return this.filtersForm.get('filters') as FormArray;
  }

  // Called by the wizard before it leaves the Global Filters step. Defaults that were never
  // saved count as a change, so Next / Save as Draft store them.
  isDirty(): boolean {
    return !!this.filtersForm && (this.filtersForm.dirty || !this.hasSavedFilters());
  }

  // The wizard subscribes; null when there is nothing to save.
  getSaveRequest(): Observable<CustomDashboard> {
    if (!this.filtersForm) {
      return null;
    }
    const value = this.filtersForm.getRawValue();
    return this.svc.saveGlobalFilters(this.dashboard, this.svc.toGlobalFilters(value), this.svc.toPanelsWithOverrides(value, this.getPanels()));
  }

  // Called by the wizard before saving; shows the inline errors when invalid.
  isValid(): boolean {
    this.submitted = true;
    return !this.filtersForm || this.filtersForm.valid;
  }

  markSaved(): void {
    this.submitted = false;
    this.filtersForm.markAsPristine();
  }

  getDef(key: string): CustomDashboardGlobalFilterDef {
    return CUSTOM_DASHBOARD_GLOBAL_FILTERS.find(f => f.key === key) || { key, label: key, description: '' };
  }

  getGroup(key: string): CustomDashboardFilterOptionGroup {
    return this.optionGroups.find(g => g.key === key) || { key, available: false, reason: 'No options available.', options: [] };
  }

  setEnabled(filter: AbstractControl, enabled: boolean): void {
    if (!this.getGroup(filter.get('key').value).available) {
      return;
    }
    filter.get('enabled').setValue(enabled);
    this.filtersForm.markAsDirty();
  }

  // Switching to single keeps only the first default value.
  setMulti(filter: AbstractControl, multi: boolean): void {
    filter.get('multi').setValue(multi);
    if (!multi) {
      filter.get('default_values').setValue((filter.get('default_values').value as string[]).slice(0, 1));
    }
    this.filtersForm.markAsDirty();
  }

  onDrop(event: CdkDragDrop<AbstractControl[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const control = this.filters.at(event.previousIndex);
    this.filters.removeAt(event.previousIndex);
    this.filters.insert(event.currentIndex, control);
    this.filtersForm.markAsDirty();
  }

  trackByIndex(index: number): number {
    return index;
  }

  private hasSavedFilters(): boolean {
    return !!(this.dashboard.definition && this.dashboard.definition.global_filters && this.dashboard.definition.global_filters.length);
  }

  private getPanels(): CustomDashboardPanel[] {
    return this.dashboard.definition && this.dashboard.definition.panels ? this.dashboard.definition.panels : [];
  }

  private buildFiltersForm(): void {
    const saved = this.hasSavedFilters() ? this.dashboard.definition.global_filters : [];
    this.filtersForm = this.svc.buildFiltersForm(saved, this.optionGroups, this.getPanels());
  }
}
