import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { HttpClient } from '@angular/common/http';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_DEVICE_STATUS_BY_DEVICETYPE, GET_DEVICE_SENSOR_BY_DEVICETYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceStatus } from 'src/app/united-cloud/shared/entities/device-status.type';
import { APIDeviceSensor } from 'src/app/united-cloud/shared/entities/device-sensor.type';

@Injectable()
export class DatacenterPdusOverviewService {

  constructor(private http: HttpClient) { }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.PDU, deviceId), { headers: Handle404Header });
  }

  getDeviceStatus(deviceId: string): Observable<DeviceStatus> {
    return this.http.get<DeviceStatus>(GET_DEVICE_STATUS_BY_DEVICETYPE(DeviceMapping.PDU, deviceId));
  }

  getDeviceSensors(deviceId: string): Observable<APIDeviceSensor> {
    return this.http.get<APIDeviceSensor>(GET_DEVICE_SENSOR_BY_DEVICETYPE(DeviceMapping.PDU, deviceId));
  }
}
