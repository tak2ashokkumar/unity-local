import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Injectable()
export class AppDefaultDashboardsService {

  constructor(private http: HttpClient) { }

  getDefaults(criteria: SearchCriteria): Observable<DefaultType[]> {
    let params = new HttpParams();
    if (criteria.searchValue?.trim()) {
      params = params.set('search', criteria.searchValue);
    }
    return this.http.get<DefaultType[]>(`/customer/dashboards/?type=preset&page_size=0`, { params: params });
  }

  convertToViewData(data: DefaultType[]) {
    if (!data || !data.length) return [];
    let viewData: DefaultViewData[] = [];
    data.forEach(d => {
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
    switch ((name || '').trim().toLowerCase()) {
      case 'infrastructure overview':
        return 'infrastructure';
      case 'network overview':
        return 'network-devices';
      case 'iot device overview':
        return 'iot-devices';
      case 'cloud cost overview':
        return 'cloud-cost';
      case 'task and workflow overview':
        return 'orchestration';
      case 'application dashboard':
        return 'application';
      case 'private cloud compute dashboard':
        return 'private-cloud-compute';
      case 'public cloud compute dashboard':
        return 'public-cloud-compute';
      case 'database dashboard':
        return 'database';
      case 'unified aiops command center':
      case 'unified aiops command center dashboard':
      case 'unified aiops command centre':
      case 'unified aiops command centre dashboard':
        return 'unified-aiops-command-centre';
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
