import { Injectable } from '@angular/core';
import { DeviceMapping, DeviceGraphTypeMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Observable } from 'rxjs';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_DEVICE_STATUS_BY_DEVICETYPE, GET_DEVICE_SENSOR_BY_DEVICETYPE, GET_DEVICE_GRAPH_BY_TYPE, GET_GRAPH_BY_GRAPH_TYPE, GRAPH_WIDTH, GRAPH_HEIGHT } from 'src/app/shared/api-endpoint.const';
import { DeviceStatus } from '../../../entities/device-status.type';
import { APIDeviceSensor } from '../../../entities/device-sensor.type';
import { DeviceGraphData } from '../../../entities/device-graph.type';

@Injectable()
export class VmsOverviewService {

  constructor(private http: HttpClient) { }

  getDeviceData(deviceId: string, deviceType: DeviceMapping): Observable<DeviceData> {
    return this.http.get<DeviceData>(DEVICE_DATA_BY_DEVICE_TYPE(deviceType, deviceId), { headers: Handle404Header });
  }

  getDeviceStatus(deviceId: string, deviceType: DeviceMapping): Observable<DeviceStatus> {
    // return of({"Sw2, PS1 Faulty, RPS Normal":{"row_class":"disabled","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"notFunctioning"},"Sw1, PS1 Faulty, RPS Normal":{"row_class":"disabled","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"notFunctioning"},"Switch 2 stacking role":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"member"},"Stackport StackSub-St1-1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Switch#2, Fan#1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"normal"},"Switch 1 stacking state":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ready"},"Stackport StackSub-St2-1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Stackport StackSub-St2-2":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Sw1, PS1 Faulty, RPS Normal Source":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ac"},"Switch#1, Fan#1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"normal"},"Stackport StackSub-St1-2":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Switch 2 stacking state":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ready"},"Sw2, PS1 Faulty, RPS Normal Source":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ac"},"Switch 1 stacking role":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"master"},"Stack is redundant":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"true"}});
    return this.http.get<DeviceStatus>(GET_DEVICE_STATUS_BY_DEVICETYPE(deviceType, deviceId));
  }

  getDeviceSensors(deviceId: string, deviceType: DeviceMapping): Observable<APIDeviceSensor> {
    return this.http.get<APIDeviceSensor>(GET_DEVICE_SENSOR_BY_DEVICETYPE(deviceType, deviceId));
  }

  getProcessorGraph(deviceId: string, deviceType: DeviceMapping): Observable<DeviceGraphData> {
    const params: HttpParams = new HttpParams().set('graph_type', DeviceGraphTypeMapping.PROCESSOR).set('height', GRAPH_HEIGHT() + '').set('legend', 'yes').set('width', GRAPH_WIDTH() + '');
    return this.http.get<DeviceGraphData>(GET_GRAPH_BY_GRAPH_TYPE(deviceType, deviceId), { params: params });
  }

  getPortsGraph(deviceId: string, deviceType: DeviceMapping): Observable<DeviceGraphData> {
    const params: HttpParams = new HttpParams().set('graph_type', DeviceGraphTypeMapping.PORTS).set('height', GRAPH_HEIGHT() + '').set('legend', 'yes').set('width', GRAPH_WIDTH() + '');
    return this.http.get<DeviceGraphData>(GET_GRAPH_BY_GRAPH_TYPE(deviceType, deviceId), { params: params });
  }

  getMemoryGraph(deviceId: string, deviceType: DeviceMapping): Observable<DeviceGraphData> {
    const params: HttpParams = new HttpParams().set('graph_type', DeviceGraphTypeMapping.MEMORY).set('height', GRAPH_HEIGHT() + '').set('legend', 'yes').set('width', GRAPH_WIDTH() + '');
    return this.http.get<DeviceGraphData>(GET_GRAPH_BY_GRAPH_TYPE(deviceType, deviceId), { params: params });
  }
}
