import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GET_MESH_SERVICE_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { Observable } from 'rxjs';
import { MESH_SERVICE_TYPE_MAPPING } from 'src/app/united-cloud/unity-cloud-services/mesh-services/mesh-service.type';
import { DashboardTrafficDirectorWidgetData } from '../mesh-services.type';

@Injectable()
export class TrafficDirectorWidgetService {

  constructor(private http: HttpClient) { }

  getTrafficDirectorWidgetData(serviceId: string): Observable<DashboardTrafficDirectorWidgetData> {
    return this.http.get<DashboardTrafficDirectorWidgetData>(GET_MESH_SERVICE_WIDGET_DATA(serviceId, MESH_SERVICE_TYPE_MAPPING.ANTHOS));
  }

  convertToTrafficDirectorWidgetData(data: DashboardTrafficDirectorWidgetData): DashboardTrafficDirectorWidgetViewData {
    let a: DashboardTrafficDirectorWidgetViewData = new DashboardTrafficDirectorWidgetViewData();
    a.healthy = data.healthy;
    a.partiallyHealthy = data.partially_healthy;
    a.unhealthy = data.unhealthy;
    a.noBackends = data.no_backends;
    a.servicesCount = data.services_count;
    a.forwardingRulesCount = data.forwarding_rules_count;
    return a;
  }

  getTrafficDirectorDonutData(widgetData: DashboardTrafficDirectorWidgetData) {
    let viewData: number[] = [];
    viewData.push(widgetData.healthy ? widgetData.healthy : 0);
    viewData.push(widgetData.partially_healthy ? widgetData.partially_healthy : 0);
    viewData.push(widgetData.unhealthy ? widgetData.unhealthy : 0);
    viewData.push(widgetData.no_backends ? widgetData.no_backends : 0);
    return viewData;
  }
}

export class DashboardTrafficDirectorWidgetViewData {
  constructor() { }
  healthy: number = 0;
  partiallyHealthy: number = 0;
  unhealthy: number = 0;
  noBackends: number = 0;
  servicesCount: number = 0;
  forwardingRulesCount: number = 0;
}