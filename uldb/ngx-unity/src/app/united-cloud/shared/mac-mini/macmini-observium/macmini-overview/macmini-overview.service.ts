import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_DEVICE_STATUS_BY_DEVICETYPE, GET_DEVICE_SENSOR_BY_DEVICETYPE, GET_DEVICE_GRAPH_BY_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceStatus } from '../../../entities/device-status.type';
import { APIDeviceSensor } from '../../../entities/device-sensor.type';

@Injectable()
export class MacminiOverviewService {

  constructor(private http: HttpClient) { }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI, deviceId), { headers: Handle404Header });
  }

  getDeviceStatus(deviceId: string): Observable<DeviceStatus> {
    return this.http.get<DeviceStatus>(GET_DEVICE_STATUS_BY_DEVICETYPE(DeviceMapping.MAC_MINI, deviceId));
  }

  getDeviceSensors(deviceId: string): Observable<APIDeviceSensor> {
    return this.http.get<APIDeviceSensor>(GET_DEVICE_SENSOR_BY_DEVICETYPE(DeviceMapping.MAC_MINI, deviceId));
  }

}
