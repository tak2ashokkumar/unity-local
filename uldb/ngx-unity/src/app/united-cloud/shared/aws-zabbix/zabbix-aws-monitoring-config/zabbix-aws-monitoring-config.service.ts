import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { AwsZabbixMonitoringConfig } from '../aws-zabbix-monitoring.type';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GET_AGENT_CONFIGURATIONS, GET_DEVICE_MONITORING_BY_DEVICE_TYPE, MONITORING_CONFIGURATION_BY_DEVICE_TYPE, TOGGLE_MONITORING_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable({
  providedIn: 'root'
})
export class ZabbixAwsMonitoringConfigService {
  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();

  form: FormGroup;

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  getMonitoringConfig(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<AwsZabbixMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getDeviceMonitoring(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<{ monitoring: DeviceMonitoringType }>(GET_DEVICE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  enableMonitoring(deviceId: string, deviceType: DeviceMapping, data: AwsZabbixMonitoringConfig): Observable<AwsZabbixMonitoringConfig> {
    return this.http.post<AwsZabbixMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  updateMonitoring(deviceId: string, deviceType: DeviceMapping, data: AwsZabbixMonitoringConfig): Observable<AwsZabbixMonitoringConfig> {
    return this.http.put<AwsZabbixMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  deleteMonitoring(deviceId: string, deviceType: DeviceMapping): Observable<AwsZabbixMonitoringConfig> {
    return this.http.delete<AwsZabbixMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  toggleMonitoring(deviceId: string, deviceType: DeviceMapping, enabled: boolean) {
    return this.http.request<AwsZabbixMonitoringConfig>('put', TOGGLE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId, enabled));
  }

  buildForm(obj: AwsZabbixMonitoringConfig): FormGroup {
    this.form = this.builder.group({
      'access_key': [{ value: (obj && obj.access_key) ? obj.access_key : '', disabled: false }, [Validators.required, NoWhitespaceValidator]],
      'secret_key': [{ value: (obj && obj.secret_key) ? obj.secret_key : '', disabled: false }, [Validators.required, NoWhitespaceValidator]],
      'collector': this.builder.group({
        'uuid': [obj?.collector ? obj.collector.uuid : '', [Validators.required]]
      }),
    });
    return this.form;
  }

  resetFormErrors() {
    return {
      'access_key': '',
      'secret_key': '',
      'collector': {
        'uuid': ''
      }
    };
  }

  formValidationMessages = {
    'access_key': {
      'required': 'Access Key is required'
    },
    'secret_key': {
      'required': 'Secret Key is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }

}
