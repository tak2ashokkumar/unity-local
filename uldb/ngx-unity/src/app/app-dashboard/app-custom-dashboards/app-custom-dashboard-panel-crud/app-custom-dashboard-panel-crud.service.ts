import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CUSTOM_DASHBOARD_PANELS } from '../app-custom-dashboards-endpoint.const';
import { getCustomDashboardMetricKey } from '../app-custom-dashboards.const';
import {
  CustomDashboard, CustomDashboardDataSource, CustomDashboardMetric, CustomDashboardMetricOption, CustomDashboardPanel,
  CustomDashboardPanelConfiguration, CustomDashboardPanelOperation
} from '../app-custom-dashboards.type';

@Injectable()
export class AppCustomDashboardPanelCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  // ---------- Panel save (add / edit) ----------

  addPanel(uuid: string, version: number, configuration: CustomDashboardPanelConfiguration): Observable<CustomDashboard> {
    const body: CustomDashboardPanelOperation = { expected_version: version, operation: 'add', configuration };
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARD_PANELS(uuid), body);
  }

  editPanel(uuid: string, version: number, panelId: string, configuration: CustomDashboardPanelConfiguration): Observable<CustomDashboard> {
    const body: CustomDashboardPanelOperation = { expected_version: version, operation: 'edit', panel_id: panelId, configuration };
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARD_PANELS(uuid), body);
  }

  // ---------- Form ----------

  // `sources` holds the Data Scope tab's resolved sources; the tab itself owns the pickers.
  buildPanelForm(panel: CustomDashboardPanel, panelNumber: number): FormGroup {
    const sources: CustomDashboardDataSource[] = panel && panel.data_scope && panel.data_scope.sources ? panel.data_scope.sources : [];
    return this.builder.group({
      'title': [panel ? panel.title : `New Panel ${panelNumber}`, [Validators.required, NoWhitespaceValidator]],
      'width': [panel && panel.width ? panel.width : 100],
      'view_mode': [panel && panel.view_mode ? panel.view_mode : 'both'],
      'sources': [sources],
      'table_columns': this.builder.array((panel && panel.table_columns ? panel.table_columns : []).map(c =>
        this.buildColumnForm(c.id, c.header, c.sortable, !!c.hidden, getCustomDashboardMetricKey(c.metric)))),
      'widgets': this.builder.array((panel && panel.widgets ? panel.widgets : []).map(w =>
        this.buildWidgetForm(w.id, w.chart_type, w.variant, (w.metrics || []).map(m => getCustomDashboardMetricKey(m))))),
    });
  }

  buildColumnForm(id: string, header: string, sortable: boolean, hidden: boolean, metricKey: string): FormGroup {
    return this.builder.group({
      'id': [id],
      'header': [header, [Validators.required, NoWhitespaceValidator]],
      'sortable': [sortable],
      'hidden': [hidden],
      'metric_key': [metricKey],
    });
  }

  buildWidgetForm(id: string, chartType: string, variant: string, metricKeys: string[]): FormGroup {
    return this.builder.group({
      'id': [id],
      'chart_type': [chartType || 'line', [Validators.required]],
      'variant': [variant || ''],
      'metric_keys': [metricKeys || [], [Validators.required]],
    });
  }

  resetPanelFormErrors(): Record<string, string> {
    return {
      'title': '',
    };
  }

  panelFormValidationMessages = {
    'title': {
      'required': 'Panel Heading is required'
    }
  };

  // ---------- Conversions ----------

  // Saved panels only carry the metric ids; the Data Scope tab fills in the labels once
  // its lists load.
  toMetricOptionFromMetric(metric: CustomDashboardMetric): CustomDashboardMetricOption {
    return {
      key: getCustomDashboardMetricKey(metric),
      metric,
      deviceName: metric.device_id,
      itemName: `Item ${metric.item_id}`,
      unit: '',
      aggregations: [metric.aggregation]
    };
  }

  getMetricLabel(option: CustomDashboardMetricOption): string {
    return `${option.deviceName} - ${option.itemName} (${option.metric.aggregation})`;
  }

  // Same metric (device + item), any aggregation.
  getMetricIdentity(metric: CustomDashboardMetric): string {
    return `${metric.device_type}|${metric.device_id}|${metric.item_id}`;
  }

  getMetricsFromPanel(panel: CustomDashboardPanel): CustomDashboardMetric[] {
    const metrics: { [key: string]: CustomDashboardMetric } = {};
    (panel && panel.widgets ? panel.widgets : []).forEach(w => (w.metrics || []).forEach(m => metrics[getCustomDashboardMetricKey(m)] = m));
    (panel && panel.table_columns ? panel.table_columns : []).forEach(c => metrics[getCustomDashboardMetricKey(c.metric)] = c.metric);
    return Object.keys(metrics).map(k => metrics[k]);
  }

  // form.getRawValue() of the panel form -> the contract's panel configuration.
  // `any` here is the reactive-form raw value boundary.
  toPanelConfiguration(value: any, selectedMetrics: CustomDashboardMetricOption[]): CustomDashboardPanelConfiguration {
    const byKey: { [key: string]: CustomDashboardMetric } = {};
    selectedMetrics.forEach(m => byKey[m.key] = m.metric);
    const sources: CustomDashboardDataSource[] = value.sources || [];
    return {
      title: (value.title || '').trim(),
      width: value.width,
      view_mode: value.view_mode,
      data_scope: {
        sources: sources
          .filter(s => s.device_type && s.scope_ids && s.scope_ids.length)
          .map(s => ({ kind: s.kind, device_type: s.device_type, scope_ids: s.scope_ids, device_ids: s.device_ids, status: s.status }))
      },
      widgets: value.widgets.map(w => ({
        id: w.id,
        chart_type: w.chart_type,
        variant: w.variant || undefined,
        metrics: (w.metric_keys || []).filter(k => byKey[k]).map(k => byKey[k])
      })),
      table_columns: value.table_columns
        .filter(c => byKey[c.metric_key])
        .map(c => ({ id: c.id, header: (c.header || '').trim(), sortable: c.sortable, hidden: c.hidden, metric: byKey[c.metric_key] }))
    };
  }

  generateId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
}
