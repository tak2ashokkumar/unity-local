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
export class ZabbixIotDeviceSmartPduDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDropdownData() {
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([datacenters]);
  }

  getDeviceDetails(deviceId: string): Observable<SmartPduType> {
    return this.http.get<SmartPduType>(DEVICE_BY_ID(DeviceMapping.SMART_PDU, deviceId));
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  buildDetailForm(d: SmartPduType): FormGroup {
    return this.builder.group({
      'name': [d.name],
      'ip_address': [d.ip_address],
      'serial_number': [d.serial_number],
      'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
      'uptime': [d.uptime],
      'power': [d.power],
      'current': [d.current],
      'voltage': [d.voltage],
      'manufacturer': [d.manufacturer],
      'model': [d.model],
      'collector': this.builder.group({
        'uuid': [d.collector ? d.collector.uuid : '', [Validators.required]]
      }),
      'firmware': [d.firmware],
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

  buildLocationForm(d: SmartPduType): FormGroup {
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

  updateDevice(uuid: string, data: SmartPduFormDataType) {
    return this.http.put(DEVICE_BY_ID(DeviceMapping.SMART_PDU, uuid), data);
  }

}

export interface SmartPduType {
  id: number;
  uuid: string;
  name: string;
  asset_tag: string;
  description: string;
  power: number;
  current: number;
  voltage: number;
  outlet_status: string;
  pdu_object_oid: string;
  uptime: string;
  serial_number: string;
  firmware: string;
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

export interface CabinetType {
  id: number;
  name: string;
  uuid: string;
}

export interface StatusType {
  status: string;
  category: string;
}

export interface CollectorType {
  name: string;
  uuid: string;
}

export interface SmartPduFormDataType {
  name: string;
  ip_address: string;
  serial_number: string;
  asset_tag: string;
  cabinet: CabinetType;
  firmware: string;
  uptime: string;
  power: number;
  current: number;
  voltage: number;
  manufacturer: string;
  model: string;
  collector: { uuid: string };
  description: string;
}