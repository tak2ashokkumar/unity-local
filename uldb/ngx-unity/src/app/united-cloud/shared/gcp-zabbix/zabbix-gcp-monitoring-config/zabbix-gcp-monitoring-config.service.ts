import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { GET_AGENT_CONFIGURATIONS, GET_DEVICE_MONITORING_BY_DEVICE_TYPE, MONITORING_CONFIGURATION_BY_DEVICE_TYPE, TOGGLE_MONITORING_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { GcpMonitoringConfig } from '../gcp-zabbix-monitoring.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable({
  providedIn: 'root'
})
export class ZabbixGcpMonitoringConfigService {

  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();

  form: FormGroup;

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  getMonitoringConfig(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<GcpMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getDeviceMonitoring(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<{ monitoring: DeviceMonitoringType }>(GET_DEVICE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  enableMonitoring(deviceId: string, deviceType: DeviceMapping, data: GcpMonitoringConfig): Observable<GcpMonitoringConfig> {
    return this.http.post<GcpMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  updateMonitoring(deviceId: string, deviceType: DeviceMapping, data: GcpMonitoringConfig): Observable<GcpMonitoringConfig> {
    return this.http.patch<GcpMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  deleteMonitoring(deviceId: string, deviceType: DeviceMapping): Observable<GcpMonitoringConfig> {
    return this.http.delete<GcpMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  toggleMonitoring(deviceId: string, deviceType: DeviceMapping, enabled: boolean) {
    return this.http.request<GcpMonitoringConfig>('put', TOGGLE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId, enabled));
  }

  buildForm(obj: GcpMonitoringConfig): FormGroup {
    this.form = this.builder.group({
      'project_id': [{ value: (obj && obj.project_id) ? obj.project_id : '', disabled: false }, [Validators.required, NoWhitespaceValidator]],
      'service_account_info': [{ value: (obj && obj.service_account_info) ? obj.service_account_info : '', disabled: false }, [Validators.required, NoWhitespaceValidator, RxwebValidators.json()]],
      // 'client_secret': [{ value: (obj && obj.client_secret) ? obj.client_secret : '', disabled: false }, [Validators.required, NoWhitespaceValidator]]
      'collector': this.builder.group({
        'uuid': [obj?.collector ? obj.collector.uuid : '', [Validators.required]]
      }),
    });
    return this.form;
  }

  resetFormErrors() {
    return {
      'project_id': '',
      'service_account_info': '',
      'collector': {
        'uuid': ''
      }
      // 'client_secret': ''
    };
  }

  formValidationMessages = {
    'project_id': {
      'required': 'Project ID is required'
    },
    'service_account_info': {
      'required': 'Service Account Info  is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
    // 'client_secret': {
    //   'required': 'Client Secret is required'
    // }
  }
}
