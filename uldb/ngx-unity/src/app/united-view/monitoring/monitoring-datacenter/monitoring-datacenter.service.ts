import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { MONITORING_DATACENTER, PDU_GRAPHS } from 'src/app/shared/api-endpoint.const';
import { map, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { MonitoringDatacenterPDU } from 'src/app/shared/SharedEntityTypes/pdu-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class MonitoringDatacenterService {

  constructor(private http: HttpClient) { }

  getDatacenterPDUs(): Observable<PaginatedResult<MonitoringDatacenterPDU>> {
    return this.http.get<PaginatedResult<MonitoringDatacenterPDU>>(MONITORING_DATACENTER());
  }

  convertToViewData(data: MonitoringDatacenterPDU[]): PDUMonitoringVewData[] {
    let viewData: PDUMonitoringVewData[] = [];
    data.map(d => {
      let a = new PDUMonitoringVewData();
      a.pduId = d.pdu.uuid;
      a.hostName = d.pdu.hostname;
      a.cabinetName = d.pdu.cabinet;
      a.dcUUID = d.pdu.colo_cloud_uuid;
      a.pduUrl = d.pdu.colo_cloud_uuid ? `/unitycloud/datacenter/${d.pdu.colo_cloud_uuid}/pdus/${d.pdu.uuid}/health/overview` : null;
      const gr1 = new GraphObject('Current', 'device_current');
      const gr2 = new GraphObject('Voltage', 'device_voltage');
      a.graphs = [gr1, gr2];
      viewData.push(a);
    });
    return viewData;
  }

  getPDUGraphs(pdu_uuid: string, graphName: string): Observable<Map<string, string>> {
    return this.http.get<{ graph: string }>(PDU_GRAPHS(pdu_uuid, graphName)).pipe(
      map((res) => {
        return new Map<string, string>().set(graphName, res.graph);
      }),
      catchError((error: HttpErrorResponse) => {
        return of(new Map<string, string>().set(graphName, null));
      })
    );
  }
}
export class PDUMonitoringVewData {
  constructor() { }
  pduId: string;
  hostName: string;
  graphs: GraphObject[] = [];
  cabinetName: string;
  dcUUID: string;
  pduUrl: string;
}

export class GraphObject {
  graph: string;
  displayName: string;
  graphName: string;
  constructor(displayName: string, graphName: string) {
    this.displayName = displayName;
    this.graphName = graphName;
  }
}