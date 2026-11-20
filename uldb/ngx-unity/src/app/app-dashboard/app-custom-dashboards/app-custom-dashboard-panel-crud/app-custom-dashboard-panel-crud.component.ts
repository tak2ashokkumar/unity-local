import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AppCustomDashboardDataScopeComponent } from '../app-custom-dashboard-data-scope/app-custom-dashboard-data-scope.component';
import { CUSTOM_DASHBOARD_CHART_TYPES, CUSTOM_DASHBOARD_PANEL_WIDTHS, CUSTOM_DASHBOARD_VIEW_MODES } from '../app-custom-dashboards.const';
import {
  CustomDashboard, CustomDashboardDataScopeChange, CustomDashboardDataSource, CustomDashboardMetricOption, CustomDashboardPanel,
  CustomDashboardPanelConfiguration
} from '../app-custom-dashboards.type';
import { AppCustomDashboardPanelCrudService } from './app-custom-dashboard-panel-crud.service';

const PREVIEW_DEBOUNCE_MS = 600;

@Component({
  selector: 'app-custom-dashboard-panel-crud',
  templateUrl: './app-custom-dashboard-panel-crud.component.html',
  styleUrls: ['./app-custom-dashboard-panel-crud.component.scss'],
  providers: [AppCustomDashboardPanelCrudService]
})
export class AppCustomDashboardPanelCrudComponent implements OnInit, OnDestroy {
  @Input() dashboard: CustomDashboard;
  @Input() panel: CustomDashboardPanel;
  @Input() panelNumber: number = 1;
  @Output() saved = new EventEmitter<{ dashboard: CustomDashboard, panelId: string }>();
  private readonly ngUnsubscribe = new Subject<void>();
  private revalidateBound = false;
  panelId: string;

  panelForm: FormGroup;
  panelFormErrors: Record<string, string>;
  panelFormValidationMessages: any;
  submitted = false;
  // Panel-level rules that span the tabs (not single form controls).
  panelErrors: { metrics: string, columns: string, widgets: string } = { metrics: '', columns: '', widgets: '' };

  widths: number[] = CUSTOM_DASHBOARD_PANEL_WIDTHS;
  viewModes = CUSTOM_DASHBOARD_VIEW_MODES;
  previewPanel: CustomDashboardPanelConfiguration;

  activeTab: 'datascope' | 'table' | 'chart' = 'datascope';

  // Saved selection handed to the Data Scope tab once; it reports changes back.
  initialSources: CustomDashboardDataSource[] = [];
  initialMetrics: CustomDashboardMetricOption[] = [];
  dataScopeCount = 0;
  selectedMetrics: CustomDashboardMetricOption[] = [];

  chartTypes = CUSTOM_DASHBOARD_CHART_TYPES;
  metricSelectOptions: { key: string, label: string }[] = [];
  metricSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'key',
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

  @ViewChild(AppCustomDashboardDataScopeComponent) dataScope: AppCustomDashboardDataScopeComponent;

  constructor(private svc: AppCustomDashboardPanelCrudService,
    private utilSvc: AppUtilityService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService) { }

  ngOnInit(): void {
    this.panelId = this.panel ? this.panel.id : null;
    this.panelForm = this.svc.buildPanelForm(this.panel, this.panelNumber);
    this.panelFormErrors = this.svc.resetPanelFormErrors();
    this.panelFormValidationMessages = this.svc.panelFormValidationMessages;
    this.initialSources = this.panelForm.get('sources').value;
    this.selectedMetrics = this.svc.getMetricsFromPanel(this.panel).map(m => this.svc.toMetricOptionFromMetric(m));
    this.initialMetrics = [...this.selectedMetrics];
    this.dataScopeCount = this.selectedMetrics.length;
    this.updateMetricSelectOptions();
    this.refreshPreview();
    this.panelForm.valueChanges.pipe(debounceTime(PREVIEW_DEBOUNCE_MS), takeUntil(this.ngUnsubscribe)).subscribe(() => this.refreshPreview());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get tableColumns(): FormArray {
    return this.panelForm.get('table_columns') as FormArray;
  }

  get widgets(): FormArray {
    return this.panelForm.get('widgets') as FormArray;
  }

  // Only real edits block leaving the step; an untouched new panel is simply dropped.
  isDirty(): boolean {
    return this.panelForm.dirty;
  }

  isNew(): boolean {
    return !this.panelId;
  }

  hasTabError(tab: 'datascope' | 'table' | 'chart'): boolean {
    if (!this.submitted) {
      return false;
    }
    switch (tab) {
      case 'datascope': return !!this.panelErrors.metrics;
      case 'table': return !!this.panelErrors.columns || this.tableColumns.invalid;
      default: return !!this.panelErrors.widgets || this.widgets.invalid;
    }
  }

  setWidth(width: number): void {
    this.panelForm.get('width').setValue(width);
    this.panelForm.markAsDirty();
  }

  setViewMode(mode: string): void {
    this.panelForm.get('view_mode').setValue(mode);
    this.panelForm.markAsDirty();
  }

  setTab(tab: 'datascope' | 'table' | 'chart'): void {
    this.activeTab = tab;
  }

  // ---------- Data Scope ----------

  // The Data Scope tab resolved a new selection: keep the sources, the table columns and
  // the widget metrics in step with it.
  onScopeChange(event: CustomDashboardDataScopeChange): void {
    const previous = this.selectedMetrics;
    this.selectedMetrics = event.metrics;
    this.dataScopeCount = event.selectedCount;
    this.syncColumnsAndWidgets(previous);
    this.updateMetricSelectOptions();
    this.panelForm.get('sources').setValue(event.sources);
    if (event.userChange) {
      this.panelForm.markAsDirty();
    }
  }

  getMetricLabel(option: CustomDashboardMetricOption): string {
    return this.svc.getMetricLabel(option);
  }

  // ---------- Table / Chart ----------

  getColumnMetricLabel(metricKey: string): string {
    const option = this.selectedMetrics.find(m => m.key === metricKey);
    return option ? this.getMetricLabel(option) : metricKey;
  }

  toggleColumnVisibility(column: FormGroup, visible: boolean): void {
    column.get('hidden').setValue(!visible);
    this.panelForm.markAsDirty();
  }

  getVariants(chartType: string): string[] {
    const type = this.chartTypes.find(t => t.value === chartType);
    return type ? type.variants : [];
  }

  onChartTypeChange(index: number): void {
    this.widgets.at(index).get('variant').setValue('');
  }

  addWidget(): void {
    this.widgets.push(this.svc.buildWidgetForm(this.svc.generateId('w'), 'line', '', this.selectedMetrics.length ? [this.selectedMetrics[0].key] : []));
    this.panelForm.markAsDirty();
  }

  removeWidget(index: number): void {
    this.widgets.removeAt(index);
    this.panelForm.markAsDirty();
  }

  savePanel(): void {
    this.submitted = true;
    const panelRulesValid = this.validatePanelRules();
    if (this.panelForm.invalid || !panelRulesValid) {
      this.panelFormErrors = this.utilSvc.validateForm(this.panelForm, this.panelFormValidationMessages, this.panelFormErrors);
      this.bindRevalidationOnChanges();
      this.openFirstTabWithError();
      this.notificationSvc.error(new Notification('Please fix the highlighted fields before saving the panel.'));
      return;
    }
    const configuration = this.svc.toPanelConfiguration(this.panelForm.getRawValue(), this.selectedMetrics);
    const knownIds: string[] = (this.dashboard.definition && this.dashboard.definition.panels ? this.dashboard.definition.panels : []).map(p => p.id);
    const request$: Observable<CustomDashboard> = this.panelId
      ? this.svc.editPanel(this.dashboard.uuid, this.dashboard.version, this.panelId, configuration)
      : this.svc.addPanel(this.dashboard.uuid, this.dashboard.version, configuration);
    this.spinnerSvc.start('main');
    request$.pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe((res: CustomDashboard) => {
        if (!this.panelId) {
          // The add response carries every panel; the new one is the id we did not have before.
          const added = (res.definition && res.definition.panels ? res.definition.panels : []).find(p => !knownIds.includes(p.id));
          this.panelId = added ? added.id : null;
        }
        this.panelForm.markAsPristine();
        this.submitted = false;
        this.panelErrors = { metrics: '', columns: '', widgets: '' };
        this.notificationSvc.success(new Notification('Panel saved successfully.'));
        this.saved.emit({ dashboard: res, panelId: this.panelId });
      }, (err: HttpErrorResponse) => {
        const detail = err.error && (err.error.detail || (err.error.non_field_errors && err.error.non_field_errors[0]));
        this.notificationSvc.error(new Notification(detail ? `Failed to save panel: ${detail}` : 'Failed to save panel. Please try again.'));
      });
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ---------- private helpers ----------

  // Table columns follow the selected metrics (one column each). A metric whose
  // aggregation changed gets a new key; its column and widget slots move to that key.
  // Widgets also pick up a metric for newly selected devices when they already show that
  // metric for other devices. The first selection creates a default widget.
  private syncColumnsAndWidgets(previous: CustomDashboardMetricOption[]): void {
    const keys = this.selectedMetrics.map(m => m.key);
    const previousKeys = previous.map(m => m.key);
    const added = this.selectedMetrics.filter(m => !previousKeys.includes(m.key));
    const remap = (key: string): string => {
      if (keys.includes(key)) {
        return key;
      }
      const old = previous.find(m => m.key === key);
      const match = old ? added.find(m => this.svc.getMetricIdentity(m.metric) === this.svc.getMetricIdentity(old.metric)) : null;
      return match ? match.key : key;
    };

    this.tableColumns.controls.forEach(c => {
      const key: string = c.get('metric_key').value;
      if (remap(key) !== key) {
        c.get('metric_key').setValue(remap(key));
      }
    });
    for (let i = this.tableColumns.length - 1; i >= 0; i--) {
      if (!keys.includes(this.tableColumns.at(i).get('metric_key').value)) {
        this.tableColumns.removeAt(i);
      }
    }
    const columnKeys: string[] = this.tableColumns.controls.map(c => c.get('metric_key').value);
    this.selectedMetrics.filter(m => !columnKeys.includes(m.key)).forEach(m =>
      this.tableColumns.push(this.svc.buildColumnForm(this.svc.generateId('col'), `${m.deviceName} - ${m.itemName}`, true, false, m.key)));

    this.widgets.controls.forEach(w => {
      const current: string[] = w.get('metric_keys').value || [];
      const widgetKeys = current.map(k => remap(k)).filter(k => keys.includes(k));
      const groups = widgetKeys.map(k => this.selectedMetrics.find(m => m.key === k)).filter(m => m && m.groupKey).map(m => m.groupKey);
      added.filter(m => m.groupKey && groups.includes(m.groupKey) && !widgetKeys.includes(m.key)).forEach(m => widgetKeys.push(m.key));
      if (widgetKeys.join() !== current.join()) {
        w.get('metric_keys').setValue(widgetKeys);
      }
    });
    if (!this.widgets.length && this.selectedMetrics.length) {
      const first = this.selectedMetrics[0];
      const widgetKeys = first.groupKey ? this.selectedMetrics.filter(m => m.groupKey === first.groupKey).map(m => m.key) : [first.key];
      this.widgets.push(this.svc.buildWidgetForm(this.svc.generateId('w'), 'line', '', widgetKeys));
    }
  }

  private updateMetricSelectOptions(): void {
    this.metricSelectOptions = this.selectedMetrics.map(m => ({ key: m.key, label: this.getMetricLabel(m) }));
  }

  private refreshPreview(): void {
    this.previewPanel = this.svc.toPanelConfiguration(this.panelForm.getRawValue(), this.selectedMetrics);
  }

  // A panel needs data, and something to show it with for each view it uses.
  private validatePanelRules(): boolean {
    const viewMode: string = this.panelForm.get('view_mode').value;
    this.panelErrors = { metrics: '', columns: '', widgets: '' };
    this.panelErrors.metrics = this.dataScope
      ? this.dataScope.getValidationError()
      : (this.selectedMetrics.length ? '' : 'Select at least one metric for this panel.');
    if (viewMode !== 'chart' && !this.tableColumns.controls.some(c => !c.get('hidden').value)) {
      this.panelErrors.columns = 'Table View needs at least one visible column.';
    }
    if (viewMode !== 'table' && !this.widgets.length) {
      this.panelErrors.widgets = 'Chart View needs at least one widget.';
    }
    return !this.panelErrors.metrics && !this.panelErrors.columns && !this.panelErrors.widgets;
  }

  private openFirstTabWithError(): void {
    const tabs: ('datascope' | 'table' | 'chart')[] = ['datascope', 'table', 'chart'];
    const tab = tabs.find(t => this.hasTabError(t));
    if (tab) {
      this.activeTab = tab;
    }
  }

  private bindRevalidationOnChanges(): void {
    if (this.revalidateBound) {
      return;
    }
    this.revalidateBound = true;
    this.panelForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.panelFormErrors = this.utilSvc.validateForm(this.panelForm, this.panelFormValidationMessages, this.panelFormErrors);
      this.validatePanelRules();
    });
  }
}
