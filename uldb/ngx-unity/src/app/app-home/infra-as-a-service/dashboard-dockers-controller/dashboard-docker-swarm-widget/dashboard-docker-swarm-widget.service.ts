import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GET_DASHBOARD_DOCKERS_CONTROLLER_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { Observable } from 'rxjs';
import { DashboardDockerWidget } from '../dashboard-dockers-controller.type';

@Injectable()
export class DashboardDockerSwarmWidgetService {

  constructor(private http: HttpClient) { }

  getWidgetData(controllerId: string): Observable<DashboardDockerWidget> {
    return this.http.get<DashboardDockerWidget>(GET_DASHBOARD_DOCKERS_CONTROLLER_WIDGET_DATA(controllerId))
  }

  convertToViewData(data: DashboardDockerWidget): DashboardDockerSwarmWidgetViewData {
    let a: DashboardDockerSwarmWidgetViewData = new DashboardDockerSwarmWidgetViewData();
    a.containerCount = data.containers_count;
    a.running = data.status_running;
    a.exited = data.status_exited;
    a.nodesCount = data.nodes_count;
    a.nodesUp = data.nodes_up;
    a.nodesUnknown = data.nodes_unknown;
    a.nodesDown = data.nodes_down;
    a.nodesDisconnected = data.nodes_disconnected;
    return a;
  }

  getContainerDonutData(data: DashboardDockerWidget) {
    let charData: number[] = [];
    charData.push(data.status_running ? data.status_running : 0);
    charData.push(data.status_exited ? data.status_exited : 0);
    return charData;
  }

  getNodeDonutData(data: DashboardDockerWidget) {
    let charData: number[] = [];
    charData.push(data.nodes_up ? data.nodes_up : 0);
    charData.push(data.nodes_unknown ? data.nodes_unknown : 0);
    charData.push(data.nodes_down ? data.nodes_down : 0);
    charData.push(data.nodes_disconnected ? data.nodes_disconnected : 0);
    return charData;
  }
}

export class DashboardDockerSwarmWidgetViewData {
  containerCount: number;
  running: number;
  exited: number;
  nodesCount: number;
  nodesUp: number;
  nodesUnknown: number;
  nodesDown: number;
  nodesDisconnected: number;
}
