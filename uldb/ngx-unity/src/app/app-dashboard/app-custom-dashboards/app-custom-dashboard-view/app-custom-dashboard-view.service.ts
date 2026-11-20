import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CustomDashboardTableView, CustomDashboardWidgetViewData } from '../app-custom-dashboard-panel-preview/app-custom-dashboard-panel-preview.service';
import { CUSTOM_DASHBOARD_BY_ID } from '../app-custom-dashboards-endpoint.const';
import { CUSTOM_DASHBOARD_GLOBAL_FILTERS, getCustomDashboardPanelColumnClass, getCustomDashboardRefreshLabel } from '../app-custom-dashboards.const';
import {
  CustomDashboard, CustomDashboardFilterOptionGroup, CustomDashboardFilterScopeSummary, CustomDashboardGlobalFilter, CustomDashboardPanel,
  CustomDashboardViewFilter, CustomDashboardWidget
} from '../app-custom-dashboards.type';

@Injectable()
export class AppCustomDashboardViewService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDashboard(uuid: string): Observable<CustomDashboard> {
    return this.http.get<CustomDashboard>(CUSTOM_DASHBOARD_BY_ID(uuid));
  }

  // ---------- Filters ----------

  // "Whole dashboard" filters: enabled, not limited to specific panels, with options.
  getTopFilters(dashboard: CustomDashboard, groups: CustomDashboardFilterOptionGroup[]): CustomDashboardViewFilter[] {
    return this.getGlobalFilters(dashboard)
      .filter(f => f.enabled && f.scope_mode !== 'panels')
      .map(f => this.toViewFilter(f, groups, f.default_values))
      .filter(f => f);
  }

  // "Specific panels" filters of one panel: every enabled filter the panel overrides. The
  // panel's own value starts from the saved override value (the dashboard default).
  getPanelFilters(dashboard: CustomDashboard, panel: CustomDashboardPanel, groups: CustomDashboardFilterOptionGroup[]): CustomDashboardViewFilter[] {
    const overrides = panel.filter_overrides || {};
    return this.getGlobalFilters(dashboard)
      .filter(f => f.enabled && overrides[f.key] && overrides[f.key].mode === 'override')
      .map(f => this.toViewFilter(f, groups, overrides[f.key].value && overrides[f.key].value.length ? overrides[f.key].value : f.default_values))
      .filter(f => f);
  }

  // One control per filter key, holding the selected option ids.
  buildFilterForm(filters: CustomDashboardViewFilter[]): FormGroup {
    const controls: { [key: string]: string[][] } = {};
    filters.forEach(f => controls[f.key] = [[...f.defaultValues]]);
    return this.builder.group(controls);
  }

  // Values a panel loads with: the applied top filters, then the panel's own (override)
  // filters; a filter the panel ignores is dropped. Empty selections are not sent.
  getPanelFilterValues(dashboard: CustomDashboard, panel: CustomDashboardPanel, topValues: { [key: string]: string[] },
    panelValues: { [key: string]: string[] }): { [key: string]: string[] } {
    const filters: { [key: string]: string[] } = {};
    Object.keys(topValues || {}).forEach(key => filters[key] = topValues[key]);
    const overrides = panel.filter_overrides || {};
    Object.keys(overrides).filter(key => overrides[key].mode === 'ignore').forEach(key => delete filters[key]);
    Object.keys(panelValues || {}).forEach(key => filters[key] = panelValues[key]);
    Object.keys(filters).filter(key => !filters[key] || !filters[key].length).forEach(key => delete filters[key]);
    return filters;
  }

  // The Time Range filter decides the timeframe; otherwise the dashboard's own timeframe.
  getTimeframe(filters: { [key: string]: string[] }, dashboard: CustomDashboard): string {
    return filters.timerange && filters.timerange.length ? filters.timerange[0] : dashboard.timeframe;
  }

  // "Datacenter: DC-West +2" per applied top filter that has a selection.
  getScopeSummaries(filters: CustomDashboardViewFilter[], values: { [key: string]: string[] }): CustomDashboardFilterScopeSummary[] {
    return filters
      .filter(f => values[f.key] && values[f.key].length)
      .map(f => {
        const names = values[f.key].map(id => {
          const option = f.options.find(o => o.id === id);
          return option ? option.name : id;
        });
        return { primaryLabel: `${f.label}: ${names[0]}`, remainingLabels: names.slice(1) };
      });
  }

  // ---------- Panels ----------

  convertToPanelViews(dashboard: CustomDashboard, groups: CustomDashboardFilterOptionGroup[]): CustomDashboardPanelViewData[] {
    const panels = dashboard.definition && dashboard.definition.panels ? dashboard.definition.panels : [];
    return panels.map((panel, panelIndex) => {
      const view: CustomDashboardPanelViewData = new CustomDashboardPanelViewData();
      const viewMode = panel.view_mode || 'both';
      view.panel = panel;
      view.title = panel.title || `Panel ${panelIndex + 1}`;
      view.columnClass = getCustomDashboardPanelColumnClass(panel.width);
      view.viewMode = viewMode;
      view.activeView = viewMode === 'table' ? 'table' : 'chart';
      view.filters = this.getPanelFilters(dashboard, panel, groups);
      view.filterForm = this.buildFilterForm(view.filters);
      view.appliedFilters = view.filterForm.getRawValue();
      view.widgetConfigs = (panel.widgets || []).filter(w => w.chart_type);
      view.widgets = view.widgetConfigs.map((widget, widgetIndex) => {
        const widgetView: CustomDashboardWidgetViewData = new CustomDashboardWidgetViewData();
        widgetView.id = widget.id;
        widgetView.title = `Widget ${widgetIndex + 1}`;
        widgetView.loader = `customDashboardViewWidget_${panelIndex}_${widgetIndex}`;
        return widgetView;
      });
      view.tableLoader = `customDashboardViewTable_${panelIndex}`;
      return view;
    });
  }

  getRefreshLabel(dashboard: CustomDashboard): string {
    return getCustomDashboardRefreshLabel(dashboard.refresh, dashboard.refresh_interval_in_sec);
  }

  // Seconds -> "4:05".
  getCountdownLabel(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
  }

  getRefreshedText(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `Today ${hours}:${minutes}`;
  }

  // ---------- private helpers ----------

  private getGlobalFilters(dashboard: CustomDashboard): CustomDashboardGlobalFilter[] {
    return dashboard.definition && dashboard.definition.global_filters ? dashboard.definition.global_filters : [];
  }

  // A filter whose options are not available cannot be shown.
  private toViewFilter(filter: CustomDashboardGlobalFilter, groups: CustomDashboardFilterOptionGroup[], values: string[]): CustomDashboardViewFilter {
    const group = groups.find(g => g.key === filter.key);
    if (!group || !group.available) {
      return null;
    }
    const def = CUSTOM_DASHBOARD_GLOBAL_FILTERS.find(d => d.key === filter.key);
    const optionIds = (group.options || []).map(o => o.id);
    return {
      key: filter.key,
      label: def ? def.label : filter.key,
      multi: filter.multi,
      options: group.options || [],
      defaultValues: (values || []).filter(v => optionIds.includes(v)).slice(0, filter.multi ? undefined : 1)
    };
  }
}

// One panel of the dashboard view. Each widget and the table load on their own; `reload`
// cancels the panel's requests still in flight when it loads again.
export class CustomDashboardPanelViewData {
  panel: CustomDashboardPanel;
  title: string;
  columnClass: string;
  viewMode: string;
  activeView: 'chart' | 'table';
  filters: CustomDashboardViewFilter[] = [];
  filterForm: FormGroup;
  appliedFilters: { [key: string]: string[] } = {};
  widgetConfigs: CustomDashboardWidget[] = [];
  widgets: CustomDashboardWidgetViewData[] = [];
  table: CustomDashboardTableView = new CustomDashboardTableView();
  tableLoader: string;
  tableMessage: string = '';
  readonly reload = new Subject<void>();
  constructor() { }
}
