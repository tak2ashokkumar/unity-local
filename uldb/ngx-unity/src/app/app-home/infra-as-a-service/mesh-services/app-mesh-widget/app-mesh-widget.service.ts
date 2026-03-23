import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GET_MESH_SERVICE_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { Observable } from 'rxjs';
import { MESH_SERVICE_TYPE_MAPPING } from 'src/app/united-cloud/unity-cloud-services/mesh-services/mesh-service.type';
import { DashboardAppMeshWidgetData } from '../mesh-services.type';

@Injectable()
export class AppMeshWidgetService {

  constructor(private http: HttpClient) { }
  getAppMeshWidgetData(serviceId: string): Observable<DashboardAppMeshWidgetData> {
    return this.http.get<DashboardAppMeshWidgetData>(GET_MESH_SERVICE_WIDGET_DATA(serviceId, MESH_SERVICE_TYPE_MAPPING.AWS));
  }

  convertToAppMeshWidgetData(data: DashboardAppMeshWidgetData): DashboardAppMeshWidgetViewData {
    let a: DashboardAppMeshWidgetViewData = new DashboardAppMeshWidgetViewData();
    a.active = data.status_active;
    a.inActive = data.status_inactive;
    a.deleted = data.status_deleted;
    a.meshCount = data.mesh_count;
    a.rutesCount = data.routes_count;
    return a;
  }

  getAppMeshDonutData(widgetData: DashboardAppMeshWidgetData) {
    let viewData: number[] = [];
    viewData.push(widgetData.status_active ? widgetData.status_active : 0);
    viewData.push(widgetData.status_inactive ? widgetData.status_inactive : 0);
    viewData.push(widgetData.status_deleted ? widgetData.status_deleted : 0);
    return viewData;
  }
}
export class DashboardAppMeshWidgetViewData {
  constructor() { }
  active: number = 0;
  inActive: number = 0;
  deleted: number = 0;
  meshCount: number = 0;
  rutesCount: number = 0;
}