import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_MESH_SERVICE_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { HttpClient } from '@angular/common/http';
import { MESH_SERVICE_TYPE_MAPPING } from 'src/app/united-cloud/unity-cloud-services/mesh-services/mesh-service.type';
import { DashboardIstioWidgetData } from '../mesh-services.type';

@Injectable()
export class IstioWidgetService {

  constructor(private http: HttpClient) { }

  getIstioWidgetData(serviceId: string): Observable<DashboardIstioWidgetData> {
    return this.http.get<DashboardIstioWidgetData>(GET_MESH_SERVICE_WIDGET_DATA(serviceId, MESH_SERVICE_TYPE_MAPPING.ISTIO));
  }

  convertToIstioWidgetData(data: DashboardIstioWidgetData): DashboardIstioWidgetViewData {
    let a: DashboardIstioWidgetViewData = new DashboardIstioWidgetViewData();
    a.succeeded = data.status_succeeded;
    a.running = data.status_running;
    a.pending = data.status_pending;
    a.failed = data.status_failed;
    a.podsCount = data.pods_count;
    a.destinationRulesCount = data.destination_rules_count;
    return a;
  }

  getIstioDonutData(widgetData: DashboardIstioWidgetData) {
    let viewData: number[] = [];
    viewData.push(widgetData.status_succeeded ? widgetData.status_succeeded : 0);
    viewData.push(widgetData.status_running ? widgetData.status_running : 0);
    viewData.push(widgetData.status_pending ? widgetData.status_pending : 0);
    viewData.push(widgetData.status_failed ? widgetData.status_failed : 0);
    return viewData;
  }
}
export class DashboardIstioWidgetViewData {
  constructor() { }
  succeeded: number = 0;
  running: number = 0;
  pending: number = 0;
  failed: number = 0;
  podsCount: number = 0;
  destinationRulesCount: number = 0;
}