import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_DEVICE_STATUS_BY_DEVICETYPE, GET_DEVICE_SENSOR_BY_DEVICETYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { DeviceStatus } from '../../../entities/device-status.type';
import { APIDeviceSensor } from '../../../entities/device-sensor.type';

@Injectable()
export class SwitchesOverviewService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  private get deviceType(): DeviceMapping {
    return this.storageService.extractByKey('device', StorageType.SESSIONSTORAGE)?.deviceType || DeviceMapping.SWITCHES;
  }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(DEVICE_DATA_BY_DEVICE_TYPE(this.deviceType, deviceId), { headers: Handle404Header });
  }

  getDeviceStatus(deviceId: string): Observable<DeviceStatus> {
    return this.http.get<DeviceStatus>(GET_DEVICE_STATUS_BY_DEVICETYPE(this.deviceType, deviceId));
  }

  getDeviceSensors(deviceId: string): Observable<APIDeviceSensor> {
    return this.http.get<APIDeviceSensor>(GET_DEVICE_SENSOR_BY_DEVICETYPE(this.deviceType, deviceId));
  }
}
