import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GET_DASHBOARD_KUBERNETES_CONTROLLER_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { DashboardKubernetesControllerWidget } from '../dashboard-kuberneters-controllers.type';

@Injectable()
export class DashboardKubernetesControllersWidgetService {

  constructor(private http: HttpClient) { }

  getDashboardKubernetesControllerWidgetData(controllerId: string): Observable<DashboardKubernetesControllerWidget> {
    return this.http.get<DashboardKubernetesControllerWidget>(GET_DASHBOARD_KUBERNETES_CONTROLLER_WIDGET_DATA(controllerId))
  }

  convertToKubernetesControllerWidgetData(data: DashboardKubernetesControllerWidget): DashboardKubernetesControllerWidgetViewData {
    let a: DashboardKubernetesControllerWidgetViewData = new DashboardKubernetesControllerWidgetViewData();
    a.podsCount = data.pods_count;
    a.podsSucceeded = data.status_succeeded;
    a.podsRunning = data.status_running;
    a.podsPending = data.status_pending;
    a.podsFailed = data.status_failed;
    a.podsUnknown = data.status_unknown;
    a.nodesCount = data.nodes_count;
    a.nodesUp = data.nodes_up;
    a.nodesDown = data.nodes_down;
    a.nodesUnknown = data.nodes_unknown;
    a.containerCount = data.container_count;
    return a;
  }

  getPodsDonutData(widgetData: DashboardKubernetesControllerWidget) {
    let viewData: number[] = [];
    viewData.push(widgetData.status_succeeded ? widgetData.status_succeeded : 0);
    viewData.push(widgetData.status_running ? widgetData.status_running : 0);
    viewData.push(widgetData.status_pending ? widgetData.status_pending : 0);
    viewData.push(widgetData.status_unknown ? widgetData.status_unknown : 0);
    viewData.push(widgetData.status_failed ? widgetData.status_failed : 0);
    return viewData;
  }

  getNodesDonutData(widgetData: DashboardKubernetesControllerWidget) {
    let viewData: number[] = [];
    viewData.push(widgetData.nodes_up ? widgetData.nodes_up : 0);
    viewData.push(widgetData.nodes_unknown ? widgetData.nodes_unknown : 0);
    viewData.push(widgetData.nodes_down ? widgetData.nodes_down : 0);
    return viewData;
  }
}

export class DashboardKubernetesControllerWidgetViewData {
  podsCount: number;
  podsSucceeded: number;
  podsRunning: number;
  podsPending: number;
  podsFailed: number;
  podsUnknown: number;
  nodesCount: number;
  nodesUp: number;
  nodesDown: number;
  nodesUnknown: number;
  containerCount: number;
}
