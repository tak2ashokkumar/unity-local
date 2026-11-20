import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CustomDashboardChartData, CustomDashboardPanelConfiguration, CustomDashboardTableData } from '../app-custom-dashboards.type';
import { AppCustomDashboardPanelPreviewService, CustomDashboardTableView, CustomDashboardWidgetViewData } from './app-custom-dashboard-panel-preview.service';

// Spinner names must be unique per instance: the same panel can be previewed in more than one place.
let previewInstanceCount = 0;

@Component({
  selector: 'app-custom-dashboard-panel-preview',
  templateUrl: './app-custom-dashboard-panel-preview.component.html',
  styleUrls: ['./app-custom-dashboard-panel-preview.component.scss'],
  providers: [AppCustomDashboardPanelPreviewService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCustomDashboardPanelPreviewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() panel: CustomDashboardPanelConfiguration;
  @Input() timeframe: string;
  @Input() filters: { [key: string]: string[] } = {};
  @Input() heading: string = 'Live Panel Preview';
  @Input() showTitle: boolean = false;
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly reload = new Subject<void>();
  private readonly instanceId = ++previewInstanceCount;

  activeView: 'chart' | 'table' = 'chart';

  widgetViews: CustomDashboardWidgetViewData[] = [];
  tableView: CustomDashboardTableView = new CustomDashboardTableView();
  tableLoader: string;
  tableMessage: string = '';

  constructor(private svc: AppCustomDashboardPanelPreviewService,
    private spinnerSvc: AppSpinnerService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.tableLoader = `customPanelPreviewTable_${this.instanceId}`;
    this.loadPreview();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const changed = changes.panel || changes.timeframe || changes.filters;
    if (changed && !changed.firstChange) {
      this.loadPreview();
    }
  }

  ngOnDestroy(): void {
    this.widgetViews.forEach(w => this.spinnerSvc.stop(w.loader));
    this.spinnerSvc.stop(this.tableLoader);
    this.reload.next();
    this.reload.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setView(view: 'chart' | 'table'): void {
    this.activeView = view;
  }

  trackByWidget(_index: number, widget: CustomDashboardWidgetViewData): string {
    return widget.id;
  }

  trackByRow(_index: number, row: { clock: number }): number {
    return row.clock;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Each widget and the table load on their own; a new panel config cancels requests in flight.
  private loadPreview(): void {
    this.reload.next();
    if (!this.panel) {
      this.widgetViews = [];
      this.tableView = new CustomDashboardTableView();
      this.cdr.markForCheck();
      return;
    }
    const viewMode = this.panel.view_mode || 'both';
    this.activeView = viewMode === 'table' ? 'table' : (viewMode === 'chart' ? 'chart' : this.activeView);
    this.loadWidgets();
    this.loadTable();
  }

  private loadWidgets(): void {
    const labels = this.svc.getMetricLabels(this.panel);
    const widgets = (this.panel.widgets || []).filter(w => w.chart_type);
    this.widgetViews = widgets.map((widget, index) => {
      const view: CustomDashboardWidgetViewData = new CustomDashboardWidgetViewData();
      view.id = widget.id;
      view.title = `Widget ${index + 1}`;
      view.chartTypeLabel = this.svc.getChartTypeLabel(widget.chart_type);
      view.loader = `customPanelPreviewWidget_${this.instanceId}_${index}`;
      return view;
    });
    widgets.forEach((widget, index) => {
      const view = this.widgetViews[index];
      if (!widget.metrics || !widget.metrics.length) {
        view.message = 'Select at least one metric for this widget.';
        return;
      }
      this.spinnerSvc.start(view.loader);
      this.svc.getChartData(widget, this.timeframe, this.filters)
        .pipe(takeUntil(this.reload), takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader(view.loader)))
        .subscribe((data: CustomDashboardChartData) => {
          const chartView = this.svc.convertToWidgetViewData(data, labels);
          view.chartData = chartView.chartData;
          view.kpiValues = chartView.kpiValues;
          view.message = view.chartData || view.kpiValues.length ? '' : 'No data for the selected metrics.';
        }, () => {
          view.message = 'Failed to load chart data.';
        });
    });
  }

  private loadTable(): void {
    this.tableView = new CustomDashboardTableView();
    this.tableMessage = '';
    const columns = this.panel.table_columns || [];
    if (!columns.length) {
      this.tableMessage = 'Select metrics in Data Scope to see table columns.';
      return;
    }
    this.spinnerSvc.start(this.tableLoader);
    this.svc.getTableData(columns, this.timeframe, this.filters)
      .pipe(takeUntil(this.reload), takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader(this.tableLoader)))
      .subscribe((data: CustomDashboardTableData) => {
        this.tableView = this.svc.convertToTableViewData(data);
        this.tableMessage = this.tableView.rows.length ? '' : 'No data for the selected columns.';
      }, () => {
        this.tableMessage = 'Failed to load table data.';
      });
  }

  private stopLoader(loader: string): void {
    this.spinnerSvc.stop(loader);
    this.cdr.markForCheck();
  }
}
