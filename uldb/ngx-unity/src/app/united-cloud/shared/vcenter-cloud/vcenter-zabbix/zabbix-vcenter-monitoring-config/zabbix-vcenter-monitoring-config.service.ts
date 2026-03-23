import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { GET_DEVICE_MONITORING_BY_DEVICE_TYPE, MONITORING_CONFIGURATION_BY_DEVICE_TYPE, TOGGLE_MONITORING_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { SNMPCrudType } from '../../../entities/snmp-crud.type';

@Injectable({
  providedIn: 'root'
})
export class ZabbixVcenterMonitoringConfigService {
  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();

  form: FormGroup;
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  getDeviceMonitoring(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<{ monitoring: DeviceMonitoringType }>(GET_DEVICE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getMonitoringConfig(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<SNMPCrudType>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  enableMonitoring(deviceId: string, deviceType: DeviceMapping, data: any): Observable<any> {
    return this.http.post<any>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  updateMonitoring(deviceId: string, deviceType: DeviceMapping, data: any): Observable<any> {
    return this.http.patch<any>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  deleteMonitoring(deviceId: string, deviceType: DeviceMapping): Observable<any> {
    return this.http.delete<any>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  toggleMonitoring(deviceId: string, deviceType: DeviceMapping, enabled: boolean) {
    return this.http.request<any>('put', TOGGLE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId, enabled));
  }

  buildForm(obj: any): FormGroup {
    if (obj) {
      this.form = this.builder.group({
        'connection_type': [obj.connection_type, [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      this.form = this.builder.group({
        'connection_type': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
    return this.form;
  }

  resetFormErrors() {
    return {
      'connection_type': '',
    };
  }

  formValidationMessages = {
    'connection_type': {
      'required': 'Connection Type is required'
    },
  }
}
