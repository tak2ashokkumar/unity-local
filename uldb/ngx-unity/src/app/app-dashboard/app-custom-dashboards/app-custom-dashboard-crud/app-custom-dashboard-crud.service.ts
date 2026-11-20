import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GET_ROLES_LIST, LIST_USER } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { RoleType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { CUSTOM_DASHBOARDS, CUSTOM_DASHBOARD_BY_ID, CUSTOM_DASHBOARD_PUBLISH, CUSTOM_DASHBOARD_REVIEW } from '../app-custom-dashboards-endpoint.const';
import { getCustomDashboardPanelColumnClass } from '../app-custom-dashboards.const';
import { CustomDashboard, CustomDashboardBasics, CustomDashboardBasicsUpdate, CustomDashboardPublishError, CustomDashboardReview } from '../app-custom-dashboards.type';

const DEFAULT_TIMEFRAME = 'last_24_hours';
const DEFAULT_REFRESH_INTERVAL_IN_SEC = 600;

@Injectable()
export class AppCustomDashboardCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDashboard(uuid: string): Observable<CustomDashboard> {
    return this.http.get<CustomDashboard>(CUSTOM_DASHBOARD_BY_ID(uuid));
  }

  getRoles(): Observable<RoleType[]> {
    const params: HttpParams = new HttpParams().set('status', true).set('page_size', 0);
    return this.http.get<RoleType[]>(GET_ROLES_LIST(), { params });
  }

  getUsers(): Observable<UnitySetupUser[]> {
    const params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<UnitySetupUser[]>(LIST_USER(), { params });
  }

  getDropdownData(): Observable<{ roles: RoleType[], users: UnitySetupUser[] }> {
    return forkJoin({
      roles: this.getRoles().pipe(catchError(() => of(undefined))),
      users: this.getUsers().pipe(catchError(() => of(undefined))),
    });
  }

  // ---------- Step 1: Dashboard Basics ----------

  // refresh_interval_in_sec is disabled while auto refresh is off, so it is skipped by
  // validation and left out of form.value (the request body).
  buildBasicsForm(data?: CustomDashboard): FormGroup {
    const refresh: boolean = data ? data.refresh : true;
    const refreshInterval: number = data ? data.refresh_interval_in_sec : DEFAULT_REFRESH_INTERVAL_IN_SEC;
    return this.builder.group({
      'name': [data ? data.name : '', [Validators.required, NoWhitespaceValidator]],
      'description': [data && data.description ? data.description : ''],
      'categories': [data && data.categories ? data.categories : []],
      'roles': [data && data.roles ? data.roles : []],
      'specific_users': [data && data.specific_users ? data.specific_users : []],
      'refresh': [refresh],
      'refresh_interval_in_sec': [{ value: refresh ? refreshInterval : null, disabled: !refresh }, [Validators.required]],
    });
  }

  resetBasicsFormErrors(): Record<string, string> {
    return {
      'name': '',
      'description': '',
      'categories': '',
      'roles': '',
      'specific_users': '',
      'refresh_interval_in_sec': '',
    };
  }

  basicsFormValidationMessages = {
    'name': {
      'required': 'Dashboard name is required'
    },
    'refresh_interval_in_sec': {
      'required': 'Refresh Interval is required'
    }
  };

  // Timeframe is not on the Basics step (the design has no such field). A new dashboard starts
  // with the default; the Global Filters step keeps it in step with the Time Range default.
  createDashboard(data: CustomDashboardBasics): Observable<CustomDashboard> {
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARDS(), { timeframe: DEFAULT_TIMEFRAME, ...data });
  }

  updateDashboard(uuid: string, data: CustomDashboardBasicsUpdate): Observable<CustomDashboard> {
    return this.http.patch<CustomDashboard>(CUSTOM_DASHBOARD_BY_ID(uuid), data);
  }

  // ---------- Step 4: Review & Publish ----------

  getReview(uuid: string): Observable<CustomDashboardReview> {
    return this.http.get<CustomDashboardReview>(CUSTOM_DASHBOARD_REVIEW(uuid));
  }

  publishDashboard(uuid: string, version: number): Observable<CustomDashboard> {
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARD_PUBLISH(uuid), { expected_version: version });
  }

  // 400: { errors: [{ field, panel_id, widget_id, message }] }; 503: publishing unavailable.
  getPublishErrors(err: HttpErrorResponse): CustomDashboardPublishError[] {
    return err && err.error && Array.isArray(err.error.errors) ? err.error.errors : [];
  }

  // Default values of the enabled global filters that apply to this panel, used to preview it
  // the way the dashboard will first open. The panel's own override wins over the dashboard
  // value; "ignore" drops the filter for the panel.
  getPanelFilters(dashboard: CustomDashboard, panelId: string): { [key: string]: string[] } {
    const filters: { [key: string]: string[] } = {};
    const globalFilters = dashboard.definition && dashboard.definition.global_filters ? dashboard.definition.global_filters : [];
    globalFilters
      .filter(f => f.enabled && f.default_values && f.default_values.length)
      .filter(f => f.scope_mode !== 'panels' || (f.targets || []).includes(panelId))
      .forEach(f => filters[f.key] = f.default_values);
    const panel = (dashboard.definition && dashboard.definition.panels ? dashboard.definition.panels : []).find(p => p.id === panelId);
    const overrides = panel && panel.filter_overrides ? panel.filter_overrides : {};
    Object.keys(overrides).filter(key => globalFilters.some(f => f.key === key && f.enabled)).forEach(key => {
      const override = overrides[key];
      if (override.mode === 'ignore') {
        delete filters[key];
      } else if (override.mode === 'override' && override.value && override.value.length) {
        filters[key] = override.value;
      }
    });
    return filters;
  }

  getPanelColumnClass(width: number): string {
    return getCustomDashboardPanelColumnClass(width);
  }
}
