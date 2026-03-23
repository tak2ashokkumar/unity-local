import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DEVICE_DATA_BY_DEVICE_TYPE, GET_STORAGE_DATA, GET_CPU_MEMORY_STORAGE_DATA_FOR_STORAGE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { StorageDeviceStorageData } from '../../../entities/storage-device.type';
import { ServerCpuMemoryStorage } from '../../../entities/server-cpu-memory-storage.type';

@Injectable()
export class StorageOverviewService {

  constructor(private http: HttpClient) { }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES, deviceId), { headers: Handle404Header });
  }

  getStorageData(deviceId: string): Observable<StorageDeviceStorageData> {
    return this.http.get<StorageDeviceStorageData>(GET_STORAGE_DATA(deviceId), { headers: Handle404Header });
  }

  getCpuMemoryStorageData(deviceId: string): Observable<ServerCpuMemoryStorage> {
    return this.http.get<ServerCpuMemoryStorage>(GET_CPU_MEMORY_STORAGE_DATA_FOR_STORAGE(deviceId));
  }
}
