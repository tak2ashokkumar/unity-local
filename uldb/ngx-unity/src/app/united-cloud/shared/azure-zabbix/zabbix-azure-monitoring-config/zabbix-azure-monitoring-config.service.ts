import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AzureMonitoringConfig } from '../azure-zabbix-monitoring.type';
import { Observable, Subject } from 'rxjs';
import { GET_AGENT_CONFIGURATIONS, GET_DEVICE_MONITORING_BY_DEVICE_TYPE, MONITORING_CONFIGURATION_BY_DEVICE_TYPE, TOGGLE_MONITORING_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable({
  providedIn: 'root'
})
export class ZabbixAzureMonitoringConfigService {
  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();

  form: FormGroup;

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  getMonitoringConfig(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<AzureMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getDeviceMonitoring(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<{ monitoring: DeviceMonitoringType }>(GET_DEVICE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  enableMonitoring(deviceId: string, deviceType: DeviceMapping, data: AzureMonitoringConfig): Observable<AzureMonitoringConfig> {
    return this.http.post<AzureMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  updateMonitoring(deviceId: string, deviceType: DeviceMapping, data: AzureMonitoringConfig): Observable<AzureMonitoringConfig> {
    return this.http.patch<AzureMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  deleteMonitoring(deviceId: string, deviceType: DeviceMapping): Observable<AzureMonitoringConfig> {
    return this.http.delete<AzureMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  toggleMonitoring(deviceId: string, deviceType: DeviceMapping, enabled: boolean) {
    return this.http.request<AzureMonitoringConfig>('put', TOGGLE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId, enabled));
  }

  buildForm(obj: AzureMonitoringConfig): FormGroup {
    this.form = this.builder.group({
      'client_id': [{ value: (obj && obj.client_id) ? obj.client_id : '', disabled: false }, [Validators.required, NoWhitespaceValidator]],
      'tenant_id': [{ value: (obj && obj.tenant_id) ? obj.tenant_id : '', disabled: false }, [Validators.required, NoWhitespaceValidator]],
      'client_secret': [{ value: (obj && obj.client_secret) ? obj.client_secret : '', disabled: false }, [Validators.required, NoWhitespaceValidator]],
      'collector': this.builder.group({
        'uuid': [obj?.collector ? obj.collector.uuid : '', [Validators.required]]
      }),
    });
    return this.form;
  }

  resetFormErrors() {
    return {
      'client_id': '',
      'tenant_id': '',
      'client_secret': '',
      'collector': {
        'uuid': ''
      }
    };
  }

  formValidationMessages = {
    'client_id': {
      'required': 'Client ID is required'
    },
    'tenant_id': {
      'required': 'Tenant ID is required'
    },
    'client_secret': {
      'required': 'Client Secret is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }
}
