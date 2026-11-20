import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { CUSTOM_DASHBOARD_BY_ID, CUSTOM_DASHBOARD_FILTER_OPTIONS } from '../app-custom-dashboards-endpoint.const';
import { CUSTOM_DASHBOARD_GLOBAL_FILTERS } from '../app-custom-dashboards.const';
import {
  CustomDashboard, CustomDashboardDefinition, CustomDashboardFilterOption, CustomDashboardFilterOptionGroup,
  CustomDashboardFilterOptionsResponse, CustomDashboardGlobalFilter, CustomDashboardPanel, CustomDashboardScope
} from '../app-custom-dashboards.type';

// An enabled filter applies to the whole dashboard, to specific panels, or both; with
// "Specific panels" it must name at least one panel.
export function AppliesToValidator(group: AbstractControl): ValidationErrors | null {
  if (!group.get('enabled').value) {
    return null;
  }
  const appliesDashboard: boolean = group.get('applies_dashboard').value;
  const appliesPanels: boolean = group.get('applies_panels').value;
  const targets: string[] = group.get('targets').value || [];
  if (!appliesDashboard && !appliesPanels) {
    return { appliesToRequired: true };
  }
  return appliesPanels && !targets.length ? { targetsRequired: true } : null;
}

// "Applies to" in the builder, and how it is saved with the contract's fields:
// - Whole dashboard: global_filters[].scope_mode = 'all' (one filter at the top of the dashboard).
// - Specific panels: each chosen panel gets filter_overrides[key] = { mode: 'override', value }
//   (its own filter, starting from the dashboard default, which overrides the top one).
// - Only specific panels: scope_mode = 'panels' + targets, so there is no filter at the top.
@Injectable()
export class AppCustomDashboardGlobalFiltersService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  // No key: the server returns all 12 filter keys with their options.
  getFilterOptions(): Observable<CustomDashboardFilterOptionsResponse> {
    return this.http.get<CustomDashboardFilterOptionsResponse>(CUSTOM_DASHBOARD_FILTER_OPTIONS());
  }

  // The filter-options API reports Public Cloud and Account / Subscription as unavailable, so
  // their options come from the existing Public Cloud accounts (the same accounts the Data
  // Scope tree lists): the providers that have accounts, and every account. A server list
  // that does have options is kept. accounts null = the accounts could not be loaded.
  addPublicCloudOptions(groups: CustomDashboardFilterOptionGroup[], accounts: CustomDashboardScope[]): CustomDashboardFilterOptionGroup[] {
    if (!accounts) {
      return groups;
    }
    const providers: CustomDashboardFilterOption[] = [];
    accounts.filter(a => a.provider && !providers.some(p => p.id === a.provider.id))
      .forEach(a => providers.push({ id: a.provider.id, name: a.provider.name }));
    const accountOptions: CustomDashboardFilterOption[] = accounts.map(a => ({ id: a.id, name: a.provider ? `${a.name} (${a.provider.name})` : a.name }));
    const reason = 'No public cloud accounts found.';
    const publicCloudGroups: CustomDashboardFilterOptionGroup[] = [
      { key: 'publiccloud', available: providers.length > 0, reason: providers.length ? null : reason, options: providers },
      { key: 'account', available: accountOptions.length > 0, reason: accountOptions.length ? null : reason, options: accountOptions }
    ];
    return [
      ...groups.map(group => {
        const publicCloudGroup = publicCloudGroups.find(p => p.key === group.key);
        return publicCloudGroup && !(group.available && group.options && group.options.length) ? publicCloudGroup : group;
      }),
      ...publicCloudGroups.filter(p => !groups.some(g => g.key === p.key))
    ];
  }

  // Global filters are part of the definition and saved with PATCH. The complete definition is
  // sent, so the panels are kept; they carry the per-panel filter overrides. The dashboard's
  // timeframe (there is no Timeframe field on the Basics step) follows the Time Range filter's
  // default when one is set.
  saveGlobalFilters(dashboard: CustomDashboard, globalFilters: CustomDashboardGlobalFilter[], panels: CustomDashboardPanel[]): Observable<CustomDashboard> {
    const body: { expected_version: number, definition: CustomDashboardDefinition, timeframe?: string } = {
      expected_version: dashboard.version,
      definition: { ...(dashboard.definition || {}), panels, global_filters: globalFilters }
    };
    const timeRange = globalFilters.find(f => f.key === 'timerange');
    if (timeRange && timeRange.enabled && timeRange.default_values.length) {
      body.timeframe = timeRange.default_values[0];
    }
    return this.http.patch<CustomDashboard>(CUSTOM_DASHBOARD_BY_ID(dashboard.uuid), body);
  }

  // Saved filters keep their order and status; filters never saved follow in the default order
  // and start Off. Panels chosen under "Specific panels" are the targets plus every panel that
  // overrides the filter.
  buildFiltersForm(saved: CustomDashboardGlobalFilter[], groups: CustomDashboardFilterOptionGroup[], panels: CustomDashboardPanel[]): FormGroup {
    const savedKeys = (saved || []).map(f => f.key);
    const keys = [...savedKeys, ...CUSTOM_DASHBOARD_GLOBAL_FILTERS.map(f => f.key).filter(k => !savedKeys.includes(k))];
    return this.builder.group({
      'filters': this.builder.array(keys.map(key => {
        const filter = (saved || []).find(f => f.key === key);
        const group = groups.find(g => g.key === key);
        const available = group ? group.available : false;
        const overridden = (panels || []).filter(p => p.filter_overrides && p.filter_overrides[key] && p.filter_overrides[key].mode === 'override').map(p => p.id);
        // Targets of deleted panels are dropped.
        const targets = [...(filter && filter.targets ? filter.targets : []), ...overridden]
          .filter((id, i, all) => all.indexOf(id) === i && (panels || []).some(p => p.id === id));
        const scopeMode = filter && filter.scope_mode ? filter.scope_mode : 'all';
        return this.builder.group({
          'key': [key],
          'enabled': [available && !!filter && filter.enabled],
          'multi': [filter ? filter.multi : key !== 'timerange'],
          'applies_dashboard': [scopeMode !== 'panels'],
          'applies_panels': [scopeMode === 'panels' || overridden.length > 0],
          'targets': [targets],
          'default_values': [filter && filter.default_values ? filter.default_values : []],
        }, { validators: [AppliesToValidator] });
      }))
    });
  }

  // `any` is the reactive-form raw value boundary.
  toGlobalFilters(value: any): CustomDashboardGlobalFilter[] {
    return value.filters.map(f => {
      const onlyPanels = !f.applies_dashboard && f.applies_panels;
      const filter: CustomDashboardGlobalFilter = {
        key: f.key,
        enabled: f.enabled,
        multi: f.multi,
        scope_mode: onlyPanels ? 'panels' : 'all',
        default_values: this.getDefaultValues(f)
      };
      if (onlyPanels) {
        filter.targets = f.targets;
      }
      return filter;
    });
  }

  // Each panel chosen under "Specific panels" of an enabled filter overrides it, starting from
  // the dashboard default; every other override of these filters is cleared. Overrides of keys
  // this step does not manage are left as they are.
  // `any` is the reactive-form raw value boundary.
  toPanelsWithOverrides(value: any, panels: CustomDashboardPanel[]): CustomDashboardPanel[] {
    return (panels || []).map(panel => {
      const overrides = { ...(panel.filter_overrides || {}) };
      value.filters.forEach(f => {
        delete overrides[f.key];
        if (f.enabled && f.applies_panels && (f.targets || []).includes(panel.id)) {
          overrides[f.key] = { mode: 'override', value: this.getDefaultValues(f) };
        }
      });
      const updated: CustomDashboardPanel = { ...panel, filter_overrides: overrides };
      if (!Object.keys(overrides).length) {
        delete updated.filter_overrides;
      }
      return updated;
    });
  }

  // `any` is the reactive-form raw value boundary.
  private getDefaultValues(filter: any): string[] {
    const values: string[] = filter.default_values || [];
    return filter.multi ? values : values.slice(0, 1);
  }
}
