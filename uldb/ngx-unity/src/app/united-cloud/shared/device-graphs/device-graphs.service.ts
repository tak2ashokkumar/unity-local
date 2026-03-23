import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GraphSetType } from './device-graph-config';
import { Observable } from 'rxjs';
import { GET_GRAPH_BY_DEVICE_TYPE, GET_GRAPH_SET_BY_DEVICE_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';

@Injectable()
export class DeviceGraphsService {

  constructor(private http: HttpClient) { }

  getGraph(data: DeviceGraphType): Observable<GraphSetType> {
    let params = new HttpParams().set('graph_type', data.graphType);
    let url: string;
    if (data.portId) {
      url = GET_GRAPH_SET_BY_DEVICE_ID(data.deviceType, data.deviceId)
      params = params.set('port_id', data.portId);
    } else {
      url = GET_GRAPH_BY_DEVICE_TYPE(data.deviceType, data.deviceId)
    }
    return this.http.get<GraphSetType>(url, { params: params });
  }
}
