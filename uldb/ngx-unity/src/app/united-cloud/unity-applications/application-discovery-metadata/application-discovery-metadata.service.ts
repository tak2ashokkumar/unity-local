import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ApplicationDiscoveryMetadataService {

  constructor(private http: HttpClient) { }

  getDeviceStatus(deviceId: string): Observable<any>{
    return this.http.get<any>(`/apm/monitoring/server_data/?uuid=${deviceId}`);
  }
}
