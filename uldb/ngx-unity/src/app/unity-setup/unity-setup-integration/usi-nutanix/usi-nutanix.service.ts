import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DEVICES_FAST_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiNutanixService {

  constructor(private http: HttpClient,) { }

  getInstances(): Observable<PrivateClouds[]> {
    return this.http.get<PrivateClouds[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.PC_VIZ));
  }

}