import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardDockerWidget } from '../dashboard-dockers-controller.type';
import { Observable } from 'rxjs';
import { GET_DASHBOARD_DOCKERS_CONTROLLER_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class DashboardNativeDockerWidgetService {

  constructor(private http: HttpClient) { }

  getWidgetData(controllerId: string): Observable<DashboardDockerWidget> {
    return this.http.get<DashboardDockerWidget>(GET_DASHBOARD_DOCKERS_CONTROLLER_WIDGET_DATA(controllerId))
  }

  convertToViewData(data: DashboardDockerWidget): DashboardNativeDockerWidgetViewData {
    let a: DashboardNativeDockerWidgetViewData = new DashboardNativeDockerWidgetViewData();
    a.containerCount = data.containers_count;
    a.running = data.status_running;
    a.exited = data.status_exited;
    return a;
  }

  getContainerDonutData(widgetData: DashboardDockerWidget) {
    let charData: number[] = [];
    charData.push(widgetData.status_running ? widgetData.status_running : 0);
    charData.push(widgetData.status_exited ? widgetData.status_exited : 0);
    return charData;
  }
}

export class DashboardNativeDockerWidgetViewData {
  containerCount: number;
  running: number;
  exited: number;
}
