import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Handle404Header } from '../app-http-interceptor';
import { ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from './api-endpoint.const';
import { DeviceMapping } from './app-utility/app-utility.service';

@Injectable({
  providedIn: 'root'
})
export class SharedMonitoringService {

  constructor(private http: HttpClient) { }

  getZabbixDeviceData(deviceType: DeviceMapping, deviceId: string) {
    return this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(deviceType, deviceId), { headers: Handle404Header });
  }
}
