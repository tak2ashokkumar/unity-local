import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { forkJoin, interval, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppCustomDashboardDataScopeService } from '../app-custom-dashboard-data-scope/app-custom-dashboard-data-scope.service';
import { AppCustomDashboardGlobalFiltersService } from '../app-custom-dashboard-global-filters/app-custom-dashboard-global-filters.service';
import { AppCustomDashboardPanelPreviewService, CustomDashboardTableView } from '../app-custom-dashboard-panel-preview/app-custom-dashboard-panel-preview.service';
import { CUSTOM_DASHBOARD_VIEW_INLINE_FILTERS } from '../app-custom-dashboards.const';
import {
  CustomDashboard, CustomDashboardChartData, CustomDashboardFilterScopeSummary, CustomDashboardTableData, CustomDashboardViewFilter
} from '../app-custom-dashboards.type';
import { AppCustomDashboardViewService, CustomDashboardPanelViewData } from './app-custom-dashboard-view.service';

// Dashboard view of a Custom Dashboard. Layout and behaviour follow the default dashboards
// (Navigator Central, Public Cloud Compute): top bar with the "Whole dashboard" filters that
// apply on the Apply button, then one section per panel. A panel may carry its own filters
// ("Specific panels") that override the top ones for that panel only.
@Component({
  selector: 'app-custom-dashboard-view',
  templateUrl: './app-custom-dashboard-view.component.html',
  styleUrls: ['./app-custom-dashboard-view.component.scss'],
  providers: [AppCustomDashboardViewService, AppCustomDashboardPanelPreviewService, AppCustomDashboardGlobalFiltersService,
    AppCustomDashboardDataScopeService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCustomDashboardViewComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly stopAutoRefresh = new Subject<void>();
  dashboardId: string;
  appliedFilterCriteria: { [key: string]: string[] } = {};

  dashboard: CustomDashboard;
  dashboardUnavailable = false;
  refreshedText = '';
  refreshLabel = '';
  refreshCountdown = 0;

  topFilters: CustomDashboardViewFilter[] = [];
  // Up to CUSTOM_DASHBOARD_VIEW_INLINE_FILTERS global filters sit in the title bar; more get their own bar.
  inlineFilters = true;
  filterForm: FormGroup;
  scopeSummaries: CustomDashboardFilterScopeSummary[] = [];
  multiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'id',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    maxHeight: '240px'
  };
  singleSelectSettings: IMultiSelectSettings = {
    ...this.multiselectSettings,
    selectionLimit: 1,
    autoUnselect: true,
    showCheckAll: false
  };
  multiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    // Nothing selected means the filter is not applied, i.e. everything is shown.
    defaultTitle: 'All',
    allSelected: 'All Selected'
  };

  panelViews: CustomDashboardPanelViewData[] = [];

  loaderNames = {
    filters: 'customDashboardViewFiltersLoader'
  };

  constructor(private svc: AppCustomDashboardViewService,
    private previewSvc: AppCustomDashboardPanelPreviewService,
    private filtersSvc: AppCustomDashboardGlobalFiltersService,
    private dataScopeSvc: AppCustomDashboardDataScopeService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.dashboardId = params.get('dashboardId');
      this.loadFilterOptionsAndDashboard();
    });
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop(this.loaderNames.filters);
    this.stopPanelLoaders();
    this.stopAutoRefresh.next();
    this.stopAutoRefresh.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Dashboard, filter options and Public Cloud accounts (Public Cloud / Account options) load
  // first; the panels start loading once the filter forms exist.
  loadFilterOptionsAndDashboard(): void {
    this.stopPanelLoaders();
    this.stopAutoRefresh.next();
    this.dashboardUnavailable = false;
    this.filterForm = null;
    this.panelViews = [];
    this.refreshedText = this.svc.getRefreshedText();
    this.spinnerSvc.start(this.loaderNames.filters);
    forkJoin([
      this.svc.getDashboard(this.dashboardId),
      this.filtersSvc.getFilterOptions().pipe(catchError(() => of(null))),
      this.dataScopeSvc.getPublicCloudScopes().pipe(catchError(() => of(null)))
    ]).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader(this.loaderNames.filters)))
      .subscribe(([dashboard, options, accounts]) => {
        const groups = this.filtersSvc.addPublicCloudOptions((options && options.results) || [], accounts ? accounts.results : null);
        this.dashboard = dashboard;
        this.refreshLabel = this.svc.getRefreshLabel(dashboard);
        this.topFilters = this.svc.getTopFilters(dashboard, groups);
        this.inlineFilters = this.topFilters.length <= CUSTOM_DASHBOARD_VIEW_INLINE_FILTERS;
        this.filterForm = this.svc.buildFilterForm(this.topFilters);
        this.panelViews = this.svc.convertToPanelViews(dashboard, groups);
        this.updateAppliedFilterCriteria();
        this.loadData();
        this.startAutoRefresh();
      }, () => {
        this.dashboardUnavailable = true;
        this.notificationSvc.error(new Notification('Failed to load the dashboard. Please try again!!'));
      });
  }

  // Applies the top filters to every panel (each panel keeps its own override filters).
  applyFilters(): void {
    this.updateAppliedFilterCriteria();
    this.loadData();
    this.startAutoRefresh();
  }

  // Rebuilds the filters from the saved defaults and reloads every panel.
  refreshFilters(): void {
    this.loadFilterOptionsAndDashboard();
  }

  // A panel's own filters reload only that panel.
  applyPanelFilters(view: CustomDashboardPanelViewData): void {
    view.appliedFilters = view.filterForm.getRawValue();
    this.loadPanel(view);
  }

  setPanelView(view: CustomDashboardPanelViewData, activeView: 'chart' | 'table'): void {
    view.activeView = activeView;
  }

  getMultiselectSettings(filter: CustomDashboardViewFilter): IMultiSelectSettings {
    return filter.multi ? this.multiselectSettings : this.singleSelectSettings;
  }

  getCountdownLabel(): string {
    return this.svc.getCountdownLabel(this.refreshCountdown);
  }

  goToEdit(): void {
    this.router.navigate(['../edit'], { relativeTo: this.route });
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByFilter(_index: number, filter: CustomDashboardViewFilter): string {
    return filter.key;
  }

  trackByPanel(_index: number, view: CustomDashboardPanelViewData): string {
    return view.panel.id;
  }

  trackByWidget(_index: number, widget: { id: string }): string {
    return widget.id;
  }

  trackByRow(_index: number, row: { clock: number }): number {
    return row.clock;
  }

  // ---------- private helpers ----------

  private updateAppliedFilterCriteria(): void {
    this.appliedFilterCriteria = this.filterForm ? this.filterForm.getRawValue() : {};
    this.scopeSummaries = this.svc.getScopeSummaries(this.topFilters, this.appliedFilterCriteria);
  }

  private loadData(): void {
    if (!this.dashboard || !this.filterForm) {
      return;
    }
    this.refreshedText = this.svc.getRefreshedText();
    this.panelViews.forEach(view => this.loadPanel(view));
  }

  // Every widget and the table of the panel load independently, each with its own loader.
  private loadPanel(view: CustomDashboardPanelViewData): void {
    view.reload.next();
    const filters = this.svc.getPanelFilterValues(this.dashboard, view.panel, this.appliedFilterCriteria, view.appliedFilters);
    const timeframe = this.svc.getTimeframe(filters, this.dashboard);
    let errorShown = false;
    const onError = () => {
      if (!errorShown) {
        errorShown = true;
        this.notificationSvc.error(new Notification(`Failed to load data for ${view.title}.`));
      }
    };

    if (view.viewMode !== 'table') {
      const labels = this.previewSvc.getMetricLabels(view.panel);
      view.widgetConfigs.forEach((widget, index) => {
        const widgetView = view.widgets[index];
        widgetView.chartData = null;
        widgetView.kpiValues = [];
        widgetView.chartTypeLabel = this.previewSvc.getChartTypeLabel(widget.chart_type);
        widgetView.message = '';
        if (!widget.metrics || !widget.metrics.length) {
          widgetView.message = 'No data available';
          return;
        }
        this.loadWidget(widgetView.loader, this.previewSvc.getChartData(widget, timeframe, filters), view.reload,
          (data: CustomDashboardChartData) => {
            const chartView = this.previewSvc.convertToWidgetViewData(data, labels);
            widgetView.chartData = chartView.chartData;
            widgetView.kpiValues = chartView.kpiValues;
            widgetView.message = widgetView.chartData || widgetView.kpiValues.length ? '' : 'No data available';
          }, () => {
            widgetView.message = 'No data available';
            onError();
          });
      });
    }

    if (view.viewMode !== 'chart') {
      view.table = new CustomDashboardTableView();
      view.tableMessage = '';
      const columns = view.panel.table_columns || [];
      if (!columns.length) {
        view.tableMessage = 'No data available';
        return;
      }
      this.loadWidget(view.tableLoader, this.previewSvc.getTableData(columns, timeframe, filters), view.reload,
        (data: CustomDashboardTableData) => {
          view.table = this.previewSvc.convertToTableViewData(data);
          view.tableMessage = view.table.rows.length ? '' : 'No data available';
        }, () => {
          view.tableMessage = 'No data available';
          onError();
        });
    }
  }

  private loadWidget<T>(loaderName: string, request: Observable<T>, cancel: Observable<void>, onSuccess: (res: T) => void, onError: () => void): void {
    this.spinnerSvc.start(loaderName);
    request.pipe(takeUntil(cancel), takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader(loaderName)))
      .subscribe(res => onSuccess(res), () => onError());
  }

  private stopLoader(loaderName: string): void {
    this.spinnerSvc.stop(loaderName);
    this.cdr.markForCheck();
  }

  // Auto refresh reloads every panel with the applied filters; the countdown restarts on Apply.
  private startAutoRefresh(): void {
    this.stopAutoRefresh.next();
    const seconds = this.dashboard && this.dashboard.refresh ? this.dashboard.refresh_interval_in_sec : 0;
    this.refreshCountdown = seconds || 0;
    if (!seconds) {
      return;
    }
    interval(1000).pipe(takeUntil(this.stopAutoRefresh), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshCountdown--;
      if (this.refreshCountdown <= 0) {
        this.refreshCountdown = seconds;
        this.loadData();
      }
      this.cdr.markForCheck();
    });
  }

  private stopPanelLoaders(): void {
    this.panelViews.forEach(view => {
      view.reload.next();
      view.reload.complete();
      view.widgets.forEach(w => this.spinnerSvc.stop(w.loader));
      this.spinnerSvc.stop(view.tableLoader);
    });
  }
}
