import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { CUSTOM_DASHBOARDS, CUSTOM_DASHBOARD_BY_ID, CUSTOM_DASHBOARD_PUBLISH } from './app-custom-dashboards-endpoint.const';
import { CUSTOM_DASHBOARD_CATEGORIES, getCustomDashboardRefreshLabel } from './app-custom-dashboards.const';
import { CustomDashboard, CustomDashboardPublishError } from './app-custom-dashboards.type';

@Injectable()
export class AppCustomDashboardsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getDashboards(criteria: SearchCriteria): Observable<PaginatedResult<CustomDashboard>> {
    return this.tableService.getData<PaginatedResult<CustomDashboard>>(CUSTOM_DASHBOARDS(), criteria);
  }

  // The contract soft-deletes with expected_version in the body; HttpClient.delete in
  // Angular 12 does not take a body, so the generic request() is used.
  deleteDashboard(uuid: string, version: number): Observable<void> {
    return this.http.request<void>('DELETE', CUSTOM_DASHBOARD_BY_ID(uuid), { body: { expected_version: version } });
  }

  publishDashboard(uuid: string, version: number): Observable<CustomDashboard> {
    return this.http.post<CustomDashboard>(CUSTOM_DASHBOARD_PUBLISH(uuid), { expected_version: version });
  }

  // ASSUMPTION: the contract has no unpublish endpoint. Moving back to draft is sent as a
  // PATCH of `status`; confirm with the server team. The caller checks the returned status,
  // so a server that ignores the field is reported instead of shown as a success.
  moveToDraft(uuid: string, version: number): Observable<CustomDashboard> {
    return this.http.patch<CustomDashboard>(CUSTOM_DASHBOARD_BY_ID(uuid), { expected_version: version, status: 'draft' });
  }

  // Publish answers 400 with { errors: [{ field, panel_id, widget_id, message }] } when the
  // dashboard is not ready, and 503 when publishing is unavailable (the draft is kept).
  getStatusChangeErrorMessage(err: HttpErrorResponse, publish: boolean): string {
    const action = publish ? 'publish' : 'move to draft';
    if (publish && err.status === 503) {
      return 'Publishing is unavailable right now. The dashboard is kept as draft.';
    }
    const publishErrors: CustomDashboardPublishError[] = err.error && Array.isArray(err.error.errors) ? err.error.errors : [];
    if (publishErrors.length) {
      const more = publishErrors.length > 1 ? ` (+${publishErrors.length - 1} more)` : '';
      return `Unable to ${action}: ${publishErrors[0].message}${more}`;
    }
    if (err.error && err.error.detail) {
      return `Unable to ${action}: ${err.error.detail}`;
    }
    return `Failed to ${action} the dashboard. Please try again.`;
  }

  convertToViewData(data: CustomDashboard[]): CustomDashboardViewData[] {
    return data.map(d => this.convert(d));
  }

  convert(d: CustomDashboard): CustomDashboardViewData {
    const a: CustomDashboardViewData = new CustomDashboardViewData();
    a.uuid = d.uuid;
    a.name = d.name;
    a.version = d.version;
    a.categories = this.getCategoryLabels(d.categories);
    a.refreshInterval = this.getRefreshIntervalLabel(d.refresh, d.refresh_interval_in_sec);
    a.lastModified = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'NA';
    a.isPublished = d.status === 'published';
    a.status = a.isPublished ? 'Published' : 'Draft';
    return a;
  }

  private getCategoryLabels(categories: string[]): string {
    if (!categories || !categories.length) {
      return 'NA';
    }
    return categories.map(value => {
      const category = CUSTOM_DASHBOARD_CATEGORIES.find(c => c.value === value);
      return category ? category.label : value;
    }).join(', ');
  }

  private getRefreshIntervalLabel(refresh: boolean, seconds: number): string {
    return getCustomDashboardRefreshLabel(refresh, seconds);
  }
}

export class CustomDashboardViewData {
  uuid: string;
  name: string;
  version: number;
  categories: string;
  refreshInterval: string;
  lastModified: string;
  isPublished: boolean;
  status: string;
  constructor() { }
}
