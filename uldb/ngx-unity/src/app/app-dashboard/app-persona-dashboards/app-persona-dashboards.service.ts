import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PersonaDashboard } from './app-persona-dashboards.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class AppPersonaDashboardsService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getDashboardList(criteria: SearchCriteria): Observable<PaginatedResult<PersonaDashboard>> {
    return this.tableService.getData<PaginatedResult<PersonaDashboard>>('/customer/persona/dashboards/', criteria);
  }

  convertToViewData(data: PersonaDashboard[]): PersonaDashboardListViewData[] {
    let viewData: PersonaDashboardListViewData[] = [];
    data.forEach(d => {
      let view: PersonaDashboardListViewData = new PersonaDashboardListViewData();
      view.dashboardId = d.uuid;
      view.name = d.name;
      view.type = d.type ? d.type : 'NA';
      // view.owner = d.owner;
      // view.group = d.group;
      // view.extraGroups = element.extra_groups;
      view.refreshInterval = d.refresh_interval_in_sec;
      view.refreshIntervalDisplay = this.formatRefreshInterval(d.refresh_interval_in_sec);
      view.status = d.status;
      view.lastModified = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'NA';
      viewData.push(view);
    })
    return viewData;
  }

  saveStatus(id: string, data: any,) {
    return this.http.put(`/customer/persona/dashboards/${id}/`, data);
  }

  delete(id: string) {
    return this.http.delete(`/customer/persona/dashboards/${id}/`);
  }

  private formatRefreshInterval(value: number | null): string {
    if (!value) {
      return 'NA';
    }

    if (value < 60) {
      return `${value} sec${value === 1 ? '' : 's'}`;
    }

    if (value < 3600) {
      const minutes = value / 60;
      return `${this.formatIntervalValue(minutes)} min${minutes === 1 ? '' : 's'}`;
    }

    const hours = value / 3600;
    return `${this.formatIntervalValue(hours)} hour${hours === 1 ? '' : 's'}`;
  }

  private formatIntervalValue(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }
}

export class PersonaDashboardListViewData {
  dashboardId: string;
  name: string;
  type: string;
  owner: string;
  lastModified: string;
  group: string;
  extraGroups: string[];
  status: string;
  refreshInterval: number;
  refreshIntervalDisplay: string;
}
