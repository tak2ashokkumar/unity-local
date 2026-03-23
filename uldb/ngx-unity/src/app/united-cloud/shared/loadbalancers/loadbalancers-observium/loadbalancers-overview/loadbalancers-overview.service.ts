import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_DEVICE_SENSOR_BY_DEVICETYPE, GET_DEVICE_STATUS_BY_DEVICETYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { APIDeviceSensor } from '../../../entities/device-sensor.type';
import { DeviceStatus } from '../../../entities/device-status.type';

@Injectable()
export class LoadbalancersOverviewService {

  constructor(private http: HttpClient) { }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER, deviceId), { headers: Handle404Header });
  }

  getDeviceStatus(deviceId: string): Observable<DeviceStatus> {
    return this.http.get<DeviceStatus>(GET_DEVICE_STATUS_BY_DEVICETYPE(DeviceMapping.LOAD_BALANCER, deviceId));
  }

  getDeviceSensors(deviceId: string): Observable<APIDeviceSensor> {
    return this.http.get<APIDeviceSensor>(GET_DEVICE_SENSOR_BY_DEVICETYPE(DeviceMapping.LOAD_BALANCER, deviceId));
  }
}
