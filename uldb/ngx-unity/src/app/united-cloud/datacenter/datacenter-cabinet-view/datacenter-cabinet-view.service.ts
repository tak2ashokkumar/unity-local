import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BLINK_SERVER, CABINET_CARBON_FOOTPRINT, CABINET_DEVIECS_BY_CABINET_ID, DEVICE_DATA_BY_DEVICE_TYPE, DEVICE_PDU_SOCKET_MAPPING, GET_DEVICE_SENSOR_BY_DEVICETYPE, GET_GRAPH_BY_GRAPH_TYPE, UPDATE_CABINET_DEVICE_POSITION, VALIDATE_POWER_TOGGLE_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE, ZABBIX_SENSOR_DATA_BY_DEVICE_TYPE, ZABBIX_DEVICE_GRAPHS, ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DeviceGraphType, GraphData } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { environment } from 'src/environments/environment';
import { DeviceSensorData, DeviceStatusData, PDUSocketConnections, SocketData } from '../entities/cab-view-other-entities.type';
import { DatacenterCabinetUnitDevice, DatacenterCabinetViewPDUSocket } from './datacenter-cabinet-viewdata.type';
import { CabinetDetailsResponse } from '../entities/cabinet-view-device.type';

@Injectable()
export class DatacenterCabinetViewService {
  assetsUrl: string = environment.assetsUrl;
  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getCabinetDetails(cabinetId: string): Observable<CabinetDetailsResponse> {
    return this.http.get<CabinetDetailsResponse>(CABINET_DEVIECS_BY_CABINET_ID(cabinetId));
  }

  getSocketConnectionToDevices(pdu: DatacenterCabinetUnitDevice): Observable<Map<string, DatacenterCabinetViewPDUSocket[]>> {
    return this.http.get(DEVICE_PDU_SOCKET_MAPPING(pdu.id))
      .pipe(
        map((res: PDUSocketConnections) => {
          let deviceSockets: DatacenterCabinetViewPDUSocket[] = [];
          res.data.forEach((socket: SocketData) => {
            let a: DatacenterCabinetViewPDUSocket = new DatacenterCabinetViewPDUSocket();
            a.deviceName = socket.name;
            a.deviceType = socket.device_type;
            a.deviceUUId = socket.uuid;

            a.pduName = pdu.name;
            a.pduId = pdu.id;
            a.pduUUID = pdu.uuid;
            a.pduType = pdu.pduType;
            a.pduPosition = pdu.position.toString();
            a.pduIPAddress = pdu.managementIP;
            a.pduRecycle = pdu.recycle;
            a.pduStatus = pdu.status;

            a.socketNumber = socket.socket_number;
            a.socketId = socket.id;

            deviceSockets.push(a);
          })
          return new Map<string, DatacenterCabinetViewPDUSocket[]>().set(pdu.uuid, deviceSockets);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, DatacenterCabinetViewPDUSocket[]>().set(pdu.uuid, null));
        })
      );
  }

  getCarbonFootPrint(cabinetId: string) {
    return this.http.get<string>(CABINET_CARBON_FOOTPRINT(cabinetId));
  }

  updateDevicePosition(cabinetId: string, device: DatacenterCabinetUnitDevice): Observable<string> {
    return this.http.post<string>(UPDATE_CABINET_DEVICE_POSITION(cabinetId), device);
  }

  getStatus(device: DatacenterCabinetUnitDevice): Observable<DeviceStatusData> {
    return this.http.get<DeviceStatusData>(DEVICE_DATA_BY_DEVICE_TYPE(device.displayType, device.uuid))
  }

  getStatusData(device: DatacenterCabinetUnitDevice): Observable<Map<string, DeviceStatusData>> {
    if (device.monitoring && !device.monitoring.configured) {
      return of(new Map<string, DeviceStatusData>().set(device.uuid, null));
    }

    let url: string;
    if (device.monitoring) {
      if (device.monitoring.observium) {
        url = DEVICE_DATA_BY_DEVICE_TYPE(device.displayType, device.uuid);
      } else {
        url = ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(device.displayType, device.displayType == DeviceMapping.BARE_METAL_SERVER ? device.sshID : device.uuid);
      }
    } else {
      url = DEVICE_DATA_BY_DEVICE_TYPE(device.displayType, device.uuid);
    }

    return this.http.get<DeviceStatusData>(url)
      .pipe(
        map((res: any) => {
          return new Map<string, DeviceStatusData>().set(device.uuid, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, DeviceStatusData>().set(device.uuid, null));
        })
      );
  }

  getGraphs(device: DatacenterCabinetUnitDevice, graph_type: string): Observable<GraphData> {
    const params = new HttpParams().set('graph_type', graph_type).set('legend', 'no').set('height', '150').set('width', '200');
    return this.http.get<GraphData>(GET_GRAPH_BY_GRAPH_TYPE(device.displayType, device.uuid), { params: params });
  }

  getMonitoringGraphs(device: DatacenterCabinetUnitDevice, graph_type: string): Observable<Map<string, string>> {
    const params = new HttpParams().set('graph_type', graph_type).set('legend', 'no').set('height', '150').set('width', '200');
    return this.http.get(GET_GRAPH_BY_GRAPH_TYPE(device.displayType, device.uuid), { params: params })
      .pipe(
        map((res: any) => {
          return new Map<string, string>().set(device.uuid, `data:image/png;base64,${res.graph}`);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(device.uuid, null));
        })
      );
  }

  getDeviceMonitoringHealthGraphs(device: DatacenterCabinetUnitDevice, graphConfig: DeviceGraphType): Observable<Map<string, string>> {
    const params = new HttpParams().set('graph_type', graphConfig.graphType).set('legend', 'no').set('height', '150').set('width', '200');
    return this.http.get(GET_GRAPH_BY_GRAPH_TYPE(device.displayType, device.uuid), { params: params })
      .pipe(
        map((res: any) => {
          return new Map<string, string>().set(graphConfig.label, `data:image/png;base64,${res.graph}`);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(graphConfig.label, null));
        })
      );
  }

  getZabbixDeviceGraphs(device: DatacenterCabinetUnitDevice): Observable<DeviceGraphType[]> {
    const deviceId = device.displayType == DeviceMapping.BARE_METAL_SERVER ? device.sshID : device.uuid;
    return this.http.get<CabinetViewZabbixDeviceGraphs[]>(ZABBIX_DEVICE_GRAPHS(device.displayType, deviceId))
      .pipe(
        map(graphs => {
          let viewData: DeviceGraphType[] = [];
          graphs.map(g => {
            let a: CabinetViewDeviceGraphType = new CabinetViewDeviceGraphType();
            a.deviceId = deviceId;
            a.deviceType = device.displayType;
            a.label = g.name;
            a.graphId = g.graph_id;
            a.graphType = g.graph_type;
            viewData.push(a);
          })
          return viewData;
        })
      );
  }

  getZabbixDeviceGraphImages(graph: DeviceGraphType): Observable<Map<string, string>> {
    return this.http.get<{ [key: string]: string }>(ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE(graph.deviceType, graph.deviceId, graph.graphId))
      .pipe(
        map((res) => {
          return new Map<string, string>().set(graph.label, `data:image/png;base64,${Object.values(res).pop()}`);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(graph.label, null));
        })
      );
  }

  getZabbixDeviceGraphImagesByDevice(device: DatacenterCabinetUnitDevice, graph: DeviceGraphType): Observable<Map<string, string>> {
    return this.http.get<{ [key: string]: string }>(ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE(graph.deviceType, graph.deviceId, graph.graphId))
      .pipe(
        map((res) => {
          return new Map<string, string>().set(device.uuid, `data:image/png;base64,${Object.values(res).pop()}`);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, string>().set(device.uuid, null));
        })
      );
  }

  async  getZabbixDeviceGraphData(device: DatacenterCabinetUnitDevice) {
    let graphs = await this.getZabbixDeviceGraphs(device).toPromise();
    return graphs.slice(0, 1).map(graph => this.getZabbixDeviceGraphImagesByDevice(device, graph));
  }

  getSensor(device: DatacenterCabinetUnitDevice): Observable<DeviceSensorData> {
    return this.http.get<DeviceSensorData>(GET_DEVICE_SENSOR_BY_DEVICETYPE(device.displayType, device.uuid));
  }

  getSensorData(device: DatacenterCabinetUnitDevice): Observable<Map<string, DeviceSensorData>> {
    if (device.monitoring && !device.monitoring.configured) {
      return of(new Map<string, DeviceSensorData>().set(device.uuid, null));
    }

    let url: string;
    if (device.monitoring) {
      if (device.monitoring.observium) {
        url = GET_DEVICE_SENSOR_BY_DEVICETYPE(device.displayType, device.uuid);
      } else {
        url = ZABBIX_SENSOR_DATA_BY_DEVICE_TYPE(device.displayType, device.displayType == DeviceMapping.BARE_METAL_SERVER ? device.sshID : device.uuid);
      }
    } else {
      url = GET_DEVICE_SENSOR_BY_DEVICETYPE(device.displayType, device.uuid);
    }

    return this.http.get<DeviceStatusData>(url)
      .pipe(
        map((res: any) => {
          return new Map<string, DeviceSensorData>().set(device.uuid, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, DeviceSensorData>().set(device.uuid, null));
        })
      );
  }

  checkPassword(device: DatacenterCabinetUnitDevice, credentials: any) {
    return this.http.post(VALIDATE_POWER_TOGGLE_BY_DEVICE_TYPE(device.displayType, device.sshID), credentials);
  }

  blinkServer(device: DatacenterCabinetUnitDevice) {
    return this.http.post(BLINK_SERVER(device.sshID), {});
  }

  getConsoleAccessInput(device: DatacenterCabinetUnitDevice): ConsoleAccessInput {
    return {
      label: device.name, deviceType: device.displayType, deviceId: device.sshID ? device.sshID : device.uuid, port: null,
      managementIp: device.managementIP, newTab: true, deviceName: device.name
    };
  }

  resetFormErrors(): any {
    let formErrors = {
      'username': '',
      'password': '',
    };
    return formErrors;
  }

  validationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
  };

  buildForm(device: DatacenterCabinetUnitDevice): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'username': new FormControl({ value: device.username, disabled: true }, Validators.required),
      'password': ['', [Validators.required]],
    });
  }

  buildZabbixGraphListForm(): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'graph_list': [[], [Validators.required]],
    });
  }

  resetZabbixGraphListFormErrors(): any {
    let formErrors = {
      'graph_list': '',
    };
    return formErrors;
  }

  zabbixGraphListValidationMessages = {
    'graph_list': {
      'required': 'Graph Selection is mandatory'
    },
  };

}

export interface CabinetViewZabbixDeviceGraphs {
  graph_id: number;
  name: string;
  graph_type: string;
  item_ids: number[];
  can_delete: boolean;
  can_update: boolean;
}

export class CabinetViewDeviceGraphType implements DeviceGraphType {
  constructor() { }
  deviceType: DeviceMapping;
  deviceId: string;
  label: string;
  graphType: string;

  graphId?: number;
  portId?: string;
}
