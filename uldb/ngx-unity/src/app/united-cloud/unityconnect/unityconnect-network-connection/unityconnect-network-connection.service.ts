import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_PORTS_BY_DEVICE, GET_UNITED_CONNECT_PORTS, UNITED_CONNECT_PORTS_CRUD } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceFast, DeviceType } from 'src/app/shared/SharedEntityTypes/device-response.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnityConnectNetworkConnection } from './unityconnect-network-connection.type';

@Injectable()
export class UnityconnectNetworkConnectionService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getPorts(): Observable<UnityConnectNetworkConnection[]> {
    return this.http.get<UnityConnectNetworkConnection[]>(`${GET_UNITED_CONNECT_PORTS()}?page_size=0`);
  }

  convertToViewData(connections: UnityConnectNetworkConnection[]): UnityConnectPortsViewData[] {
    let viewData: UnityConnectPortsViewData[] = [];
    connections.map(c => {
      let a: UnityConnectPortsViewData = new UnityConnectPortsViewData();
      a.uuid = c.uuid;
      a.mappedName = c.mapped_name ? c.mapped_name : 'N/A';
      a.portName = c.port_name ? c.port_name : 'N/A';

      a.deviceId = c.device_uuid;
      a.deviceName = c.device_name;
      a.deviceType = c.device_type;


      a.bitsSent = c.monitored_data.bits_sent;
      a.bitsReceived = c.monitored_data.bits_received;
      a.speed = c.monitored_data.speed;

      a.macAddress = 'N/A';

      viewData.push(a);
    })
    return viewData;
  }

  buildPortForm(view: any): FormGroup {
    return this.builder.group({
      'device_type': ['', [Validators.required]],
      'device': ['', [Validators.required]],
      'mapped_name': ['', [Validators.required, NoWhitespaceValidator]],
      'port': ['', [Validators.required]],
      'snmp_index': [''],
      'port_name': ['']
    })
  }

  resetPortFormErrors(): any {
    return {
      'device_type': '',
      'device': '',
      'mapped_name': '',
      'port': '',
    }
  }

  portFormValidataionMessages = {
    'device_type': {
      'required': 'device type selection is required'
    },
    'device': {
      'required': 'device selection is required'
    },
    'mapped_name': {
      'required': 'Port name is required'
    },
    'port': {
      'required': 'Port selection is required'
    }
  };

  getDevicesByDeviceType(deviceType: DeviceMapping): Observable<DeviceFast[]> {
    return this.http.get<DeviceFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(deviceType));
  }

  getPortsByDevice(deviceType: string, deviceId: string): Observable<any[]> {
    return this.http.get<any[]>(GET_PORTS_BY_DEVICE(deviceType, deviceId));
  }

  addPort(formData: any) {
    return this.http.post(UNITED_CONNECT_PORTS_CRUD(formData.device_type.apiMapping, formData.device.uuid), formData);
  }

  updatePort(viewId: string, formData: any) {
    return this.http.put('', formData);
  }

  deletePort(viewId: string) {
    return this.http.delete(`/customer/zabbix/mapped_ports/${viewId}/`);
  }
}

export class UnityConnectPortsViewData {
  constructor() { }
  uuid: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;

  mappedName: string;
  portName: string;

  bitsSent: number;
  bitsReceived: number;
  speed: number;
  macAddress: string;
}

export const deviceTypes: DeviceType[] = [
  { 'name': 'switch', 'displayName': 'Switch', 'mapping': DeviceMapping.SWITCHES, 'apiMapping': 'switches' },
  { 'name': 'firewall', 'displayName': 'Firewall', 'mapping': DeviceMapping.FIREWALL, 'apiMapping': 'firewalls' },
]
