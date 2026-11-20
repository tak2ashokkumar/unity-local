import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CUSTOM_DASHBOARD_PANELS } from '../app-custom-dashboards-endpoint.const';
import { CustomDashboard, CustomDashboardPanel, CustomDashboardPanelOperation } from '../app-custom-dashboards.type';

@Injectable()
export class AppCustomDashboardPanelsService {

  constructor(private http: HttpClient) { }

  duplicatePanel(uuid: string, version: number, panelId: string): Observable<CustomDashboard> {
    const body: CustomDashboardPanelOperation = { expected_version: version, operation: 'duplicate', configuration: {}, panel_id: panelId };
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARD_PANELS(uuid), body);
  }

  deletePanel(uuid: string, version: number, panelId: string): Observable<CustomDashboard> {
    const body: CustomDashboardPanelOperation = { expected_version: version, operation: 'delete', configuration: {}, panel_id: panelId };
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARD_PANELS(uuid), body);
  }

  reorderPanels(uuid: string, version: number, panelIds: string[]): Observable<CustomDashboard> {
    const body: CustomDashboardPanelOperation = { expected_version: version, operation: 'reorder', configuration: { panel_ids: panelIds } };
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARD_PANELS(uuid), body);
  }

  getPanels(dashboard: CustomDashboard): CustomDashboardPanel[] {
    return dashboard && dashboard.definition && dashboard.definition.panels ? dashboard.definition.panels : [];
  }

  getPanelSummary(panel: CustomDashboardPanel): { sources: number, columns: number, widgets: number } {
    return {
      sources: panel && panel.data_scope && panel.data_scope.sources ? panel.data_scope.sources.length : 0,
      columns: panel && panel.table_columns ? panel.table_columns.length : 0,
      widgets: panel && panel.widgets ? panel.widgets.length : 0
    };
  }

  generateKey(): string {
    return `draft-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
}

// One card on the Smart Panel step. `key` stays the same after a draft is saved, so the
// editor inside the card is not re-created when the panel gets its server id.
export class CustomDashboardPanelCard {
  key: string;
  panelId: string;
  panel: CustomDashboardPanel;
  number: number;
  expanded: boolean;
  constructor() { }
}
