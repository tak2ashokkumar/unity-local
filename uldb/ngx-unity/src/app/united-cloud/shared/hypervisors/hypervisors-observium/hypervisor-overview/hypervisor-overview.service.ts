import { Injectable } from '@angular/core';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { Observable, of } from 'rxjs';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_DEVICE_SENSOR_BY_DEVICETYPE, GET_DEVICE_STATUS_BY_DEVICETYPE, GET_DEVICE_GRAPH_BY_TYPE } from 'src/app/shared/api-endpoint.const';
import { HttpClient } from '@angular/common/http';
import { DeviceStatus } from '../../../entities/device-status.type';
import { APIDeviceSensor } from '../../../entities/device-sensor.type';
import { DeviceMapping, DeviceGraphTypeMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceGraphData } from '../../../entities/device-graph.type';

@Injectable()
export class HypervisorOverviewService {

  constructor(private http: HttpClient) { }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR, deviceId), { headers: Handle404Header });
  }

  getDeviceStatus(deviceId: string): Observable<DeviceStatus> {
    // return of({"Sw2, PS1 Faulty, RPS Normal":{"row_class":"disabled","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"notFunctioning"},"Sw1, PS1 Faulty, RPS Normal":{"row_class":"disabled","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"notFunctioning"},"Switch 2 stacking role":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"member"},"Stackport StackSub-St1-1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Switch#2, Fan#1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"normal"},"Switch 1 stacking state":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ready"},"Stackport StackSub-St2-1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Stackport StackSub-St2-2":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Sw1, PS1 Faulty, RPS Normal Source":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ac"},"Switch#1, Fan#1":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"normal"},"Stackport StackSub-St1-2":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"up"},"Switch 2 stacking state":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ready"},"Sw2, PS1 Faulty, RPS Normal Source":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"ac"},"Switch 1 stacking role":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"master"},"Stack is redundant":{"row_class":"up","graph":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPElEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEXcMGypFXQgpnGVe/sxKKeo/atOmdPVjTqnn0AAAAAAP71ASmEBGgnhq6XAAAAAElFTkSuQmCC","status_name":"true"}});
    return this.http.get<DeviceStatus>(GET_DEVICE_STATUS_BY_DEVICETYPE(DeviceMapping.HYPERVISOR, deviceId));
  }

  getDeviceSensors(deviceId: string): Observable<APIDeviceSensor> {
    // return of({
    //   "temperature": [
    //     {
    //       "temp2": {
    //         "sensor_unit": "&deg;C",
    //         "graph": "iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAW0lEQVRYhe3VsQ2AMBQD0YvEKmzAThmDUDLC34kBKNiFtJAKiSJC3CstF+4MkvRfKSLOJltyzuUaREQBZnv3niRJr6QN2hfWM8cE4wCsvZd8UYK99wZJkiT1UwFeASxpAr47gQAAAABJRU5ErkJggg==",
    //         "sensor_value": "29.8",
    //         "row_class": "up"
    //       }
    //     },
    //     {
    //       "temp1": {
    //         "sensor_unit": "&deg;C",
    //         "graph": "iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAQElEQVRYhe3OUQ2AMBAFsDeCjNlAJN4QgIDzMTTwdVnSKmgCbGw8yepO7GjNmatqnEnu7syOjqq3+wAAAAAAP31w6AgxDhdm9QAAAABJRU5ErkJggg==",
    //         "sensor_value": "106",
    //         "row_class": "up"
    //       }
    //     },
    //     {
    //       "temp2": {
    //         "sensor_unit": "&deg;C",
    //         "graph": "iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAPUlEQVRYhe3OQQ2AMAAAsVuCFRxgEm8I4IEX0MBrWdIqaAELG1e9sxOLeo7at+qcPVnRqHv2AQAAAAB++gCkAwRouGIoowAAAABJRU5ErkJggg==",
    //         "sensor_value": "106",
    //         "row_class": "up"
    //       }
    //     },
    //     {
    //       "temp1": {
    //         "sensor_unit": "&deg;C",
    //         "graph": "iVBORw0KGgoAAAANSUhEUgAAAFAAAAAUCAYAAAAa2LrXAAAABmJLR0QA/wD/AP+gvaeTAAAAW0lEQVRYhe3VsQ2AMBQD0YvEKmzAThmDUDLC34kBKNgFWkiFSBEh3SstF+4MkiR9lCLirLIl51zuQUQUYLb37EmS1CRtUL+w3jkmGAdg7b3kjxLsvTdIkiQ1uACsUSxp4A9ZogAAAABJRU5ErkJggg==",
    //         "sensor_value": "27.8",
    //         "row_class": "up"
    //       }
    //     }
    //   ]
    // })
    return this.http.get<APIDeviceSensor>(GET_DEVICE_SENSOR_BY_DEVICETYPE(DeviceMapping.HYPERVISOR, deviceId));
  }

  getProcessorGraph(deviceId: string): Observable<DeviceGraphData> {
    return this.http.get<DeviceGraphData>(GET_DEVICE_GRAPH_BY_TYPE(deviceId, DeviceGraphTypeMapping.PROCESSOR, DeviceMapping.HYPERVISOR));
  }

  getPortsGraph(deviceId: string): Observable<DeviceGraphData> {
    return this.http.get<DeviceGraphData>(GET_DEVICE_GRAPH_BY_TYPE(deviceId, DeviceGraphTypeMapping.PORTS, DeviceMapping.HYPERVISOR));
  }

  getMemoryGraph(deviceId: string): Observable<DeviceGraphData> {
    return this.http.get<DeviceGraphData>(GET_DEVICE_GRAPH_BY_TYPE(deviceId, DeviceGraphTypeMapping.MEMORY, DeviceMapping.HYPERVISOR));
  }
}