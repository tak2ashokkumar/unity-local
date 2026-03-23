import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONSOLE_ACCESS_DETAILS_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Observable } from 'rxjs';
import { mapTo, map } from 'rxjs/operators';

@Injectable()
export class ConsoleAccessService {

  constructor(private http: HttpClient) { }

  getDetails(deviceType: DeviceMapping, deviceId: string): Observable<string> {
    return this.http.get(CONSOLE_ACCESS_DETAILS_BY_DEVICE_TYPE(deviceType, deviceId)).pipe(map((res: { management_ip: string }) => { return res['management_ip'] }));
  }
}
