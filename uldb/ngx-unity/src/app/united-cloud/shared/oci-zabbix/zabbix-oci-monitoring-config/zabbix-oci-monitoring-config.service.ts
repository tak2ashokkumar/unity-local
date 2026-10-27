import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  GET_AGENT_CONFIGURATIONS,
  GET_DEVICE_MONITORING_BY_DEVICE_TYPE,
  GET_OCI_REGIONS,
  MONITORING_CONFIGURATION_BY_DEVICE_TYPE,
  TOGGLE_MONITORING_BY_DEVICE_TYPE
} from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import {
  OciZabbixMonitoringConfig,
  OciZabbixMonitoringFormValue
} from './zabbix-oci-monitoring-config.type';

@Injectable({
  providedIn: 'root'
})
export class ZabbixOciMonitoringConfigService {
  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();

  form: FormGroup;

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  getMonitoringConfig(deviceId: string, deviceType: DeviceMapping): Observable<OciZabbixMonitoringConfig> {
    return this.http.get<OciZabbixMonitoringConfig>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getDeviceMonitoring(deviceId: string, deviceType: DeviceMapping): Observable<{ monitoring: DeviceMonitoringType }> {
    return this.http.get<{ monitoring: DeviceMonitoringType }>(GET_DEVICE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  getRegions(): Observable<{ display: string; value: string }[]> {
    return this.http.get<{ display: string; value: string }[]>(GET_OCI_REGIONS());
  }

  enableMonitoring(deviceId: string, deviceType: DeviceMapping, data: OciZabbixMonitoringFormValue) {
    return this.http.post(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), this.toFormData(data));
  }

  updateMonitoring(deviceId: string, deviceType: DeviceMapping, data: OciZabbixMonitoringFormValue) {
    return this.http.put(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), this.toFormData(data));
  }

  deleteMonitoring(deviceId: string, deviceType: DeviceMapping) {
    return this.http.delete(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  toggleMonitoring(deviceId: string, deviceType: DeviceMapping, enabled: boolean) {
    return this.http.request('put', TOGGLE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId, enabled));
  }

  buildForm(obj: OciZabbixMonitoringConfig): FormGroup {
    const region = obj && obj.region ? [obj.region] : [];
    const textValidators = [Validators.required, NoWhitespaceValidator];

    this.form = this.builder.group({
      'user_ocid': [obj?.user_ocid || '', textValidators],
      'tenancy_ocid': [obj?.tenancy_ocid || '', textValidators],
      'region': [region, [Validators.required]],
      'fingerprint': ['', textValidators],
      'key_content': ['', []],
      'collector': this.builder.group({
        'uuid': [obj?.collector ? obj.collector.uuid : '', [Validators.required]]
      })
    });

    return this.form;
  }

  resetFormErrors() {
    return {
      'user_ocid': '',
      'tenancy_ocid': '',
      'region': '',
      'fingerprint': '',
      'key_content': '',
      'collector': {
        'uuid': ''
      }
    };
  }

  formValidationMessages = {
    'user_ocid': {
      'required': 'User ID is required'
    },
    'tenancy_ocid': {
      'required': 'Tenancy ID is required'
    },
    'region': {
      'required': 'Region is required'
    },
    'fingerprint': {
      'required': 'Fingerprint is required'
    },
    'key_content': {
      'required': 'Private Key is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  };

  private toFormData(data: OciZabbixMonitoringFormValue): FormData {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (key === 'key_content') {
        formData.append(key, value ? this.appService.convertToBinary(value) : '');
      } else if (key === 'region') {
        const region = Array.isArray(value) ? value[0] : value;
        formData.append(key, region || '');
      } else if (key === 'collector') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value || '');
      }
    }
    return formData;
  }
}
