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
export class ZabbixIotDeviceRfidReaderDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDropdownData() {
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([datacenters]);
  }

  getDeviceDetails(deviceId: string): Observable<RfidReaderType> {
    return this.http.get<RfidReaderType>(DEVICE_BY_ID(DeviceMapping.RFID_READER, deviceId));
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  buildDetailForm(d: RfidReaderType): FormGroup {
    return this.builder.group({
      'name': [d.name],
      'ip_address': [d.ip_address],
      'location': [d.location],
      'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
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

  buildLocationForm(d: RfidReaderType): FormGroup {
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

  updateDevice(uuid: string, data: RfidReaderFormDataType) {
    return this.http.put(DEVICE_BY_ID(DeviceMapping.RFID_READER, uuid), data);
  }

}

export interface RfidReaderType {
  id: number;
  uuid: string;
  name: string;
  asset_tag: string;
  description: string;
  location: string;
  last_seen: string;
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

export interface CollectorType {
  uuid: string;
  name: string;
  id: number;
}

export interface CabinetType {
  id: number;
  name: string;
  uuid: string;
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

export interface RfidReaderFormDataType {
  name: string;
  ip_address: string;
  location: string;
  asset_tag: string;
  manufacturer: string;
  model: string;
  cabinet: CabinetType;
  collector: { uuid: string };
  description: string;
}