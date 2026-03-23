import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AppDefaultDashboardsService {

  constructor(private http: HttpClient,
    private tableSvc: TableApiServiceService) { }

  getDefaults(criteria: SearchCriteria): Observable<DefaultType[]> {
    let params = new HttpParams();
    if (criteria.searchValue?.trim()) {
      params = params.set('search', criteria.searchValue);
    }
    return this.http.get<DefaultType[]>(`/customer/dashboards/?type=preset&page_size=0`, { params: params });
  }

  convertToViewData(data: DefaultType[]) {
    let viewData: DefaultViewData[] = [];
    const defaultDashboard = ['Infrastructure Overview', 'Network Overview', 'Cloud Cost Overview', 'Task and Workflow Overview', 'IoT Device Overview', 'Application Dashboard']
    const filterdData = data.filter(d => defaultDashboard.includes(d.name));
    filterdData.forEach(d => {
      let view: DefaultViewData = new DefaultViewData();
      view.defaultId = d.uuid;
      view.name = d.name;
      view.type = d.type;
      view.status = d.status;
      view.description = d.description;
      view.createdBy = d.created_by;
      view.defaultDashboardUrl = this.getDefaultDashboardRouteSegment(d.name);
      viewData.push(view);
    })
    return viewData;
  }

  getDefaultDashboardRouteSegment(name: string) {
    switch (name) {
      case 'Infrastructure Overview':
        return 'infrastructure';
      case 'Network Overview':
        return 'network-devices';
      case 'IoT Device Overview':
        return 'iot-devices';
      case 'Cloud Cost Overview':
        return 'cloud-cost';
      case 'Task and Workflow Overview':
        return 'orchestration';
      case 'Application Dashboard':
        return 'application';
    }
  }
}

export class DefaultViewData {
  constructor() { }
  defaultId: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string
  defaultDashboardUrl: string;
}

export interface DefaultType {
  uuid: string;
  name: string;
  description: string;
  type: string;
  status: string;
  refresh_interval_in_sec: null;
  refresh: boolean;
  timeframe: null;
  created_at: string;
  updated_at: string;
  created_by: string;
  applicable_module_permissions: any[];
}