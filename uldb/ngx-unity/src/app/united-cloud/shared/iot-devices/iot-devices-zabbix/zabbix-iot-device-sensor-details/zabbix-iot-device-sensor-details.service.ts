import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, DEVICE_BY_ID, DEVICES_FAST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ZabbixIotDeviceSensorDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDropdownData() {
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([datacenters]);
  }

  getDeviceDetails(deviceId: string): Observable<SensorType> {
    return this.http.get<SensorType>(DEVICE_BY_ID(DeviceMapping.SENSOR, deviceId));
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  buildDetailForm(d: SensorType): FormGroup {
    return this.builder.group({
      'name': [d.name],
      'ip_address': [d.ip_address],
      'sensor_type': [d.sensor_type],
      'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
      'temperature': [d.temperature],
      'humidity': [d.humidity],
      'airflow': [d.airflow],
      'manufacturer': [d.manufacturer],
      'model': [d.model],
      'collector': this.builder.group({
        'uuid': [d.collector ? d.collector.uuid : '', [Validators.required]]
      }),
      'description': [d.description, [NoWhitespaceValidator]],
    })
  }

  resetDetailFormErrors() {
    return {
      'asset_tag': '',
      'collector': {
        'uuid': ''
      },
      'description': '',
    }
  }

  detailFormValidationMessages = {
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }

  buildLocationForm(d: SensorType): FormGroup {
    return this.builder.group({
      'datacenter': this.builder.group({
        'uuid': [d.datacenter ? d.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'cabinet': this.builder.group({
        'id': [d.cabinet ? d.cabinet.id : '', [NoWhitespaceValidator]]
      }),
    })
  }

  resetLocationFormErrors() {
    return {
      'datacenter': {
        'uuid': ''
      },
    }
  }

  locationFormValidationMessages = {
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    }
  }

  updateDevice(uuid: string, data: SensorFormDataType) {
    return this.http.put(DEVICE_BY_ID(DeviceMapping.SENSOR, uuid), data);
  }

}

export interface SensorType {
  id: number;
  uuid: string;
  name: string;
  sensor_type: string;
  asset_tag: string;
  description: string;
  temperature: number;
  humidity: number;
  airflow: number;
  sensor_object_oid: string;
  cabinet: CabinetType;
  collector: CollectorType;
  datacenter: DatacenterType;
  manufacturer: string;
  model: string;
  monitoring: DeviceMonitoringType;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  ip_address: string;
  snmp_version: string;
}

export interface CabinetType {
  id: number;
  name: string;
  uuid: string;
}

export interface CollectorType {
  uuid: string;
  name: string;
  id: number;
}

export interface DatacenterType {
  url: string;
  id: number;
  uuid: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  name: string;
  location: string;
  lat: string;
  'long': string;
  status: StatusType[];
  customer: string;
  cabinets: string[];
}

export interface StatusType {
  status: string;
  category: string;
}

export interface SensorFormDataType {
  name: string;
  ip_address: string;
  sensor_type: string;
  asset_tag: string;
  cabinet: CabinetType;
  temperature: number;
  humidity: number;
  airflow: number;
  manufacturer: string;
  model: string;
  collector: { uuid: string };
  description: string;
}
