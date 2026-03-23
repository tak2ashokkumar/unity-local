import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin } from 'rxjs';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast, DatacenterInDevice } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceFast } from 'src/app/shared/SharedEntityTypes/device-response.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_BY_ID, DEVICE_INTERFACES_BY_DEVICE_ID, DEVICE_MANUFACTURERS, DEVICE_MODELS, DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE, DEVICE_UPTIME_BY_DEVICE_ID, GET_AGENT_CONFIGURATIONS, PRIVATE_CLOUD_FAST_BY_DC_ID, UNITY_CREDENTIALS_FAST, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { LoadBalancerCRUDManufacturer, LoadBalancerCRUDModel } from '../../../entities/loadbalancer-crud.type';
import { LoadBalancer } from '../../../entities/loadbalancer.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
import { map } from 'rxjs/operators';

@Injectable()
export class ZabbixLoadbalancerDetailsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDropdownData() {
    const manufacturers = this.http.get<LoadBalancerCRUDManufacturer[]>(DEVICE_MANUFACTURERS(DeviceMapping.LOAD_BALANCER));
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([manufacturers, datacenters]);
  }

  getDeviceDetails(deviceId: string): Observable<LoadBalancer> {
    return this.http.get<LoadBalancer>(DEVICE_BY_ID(DeviceMapping.LOAD_BALANCER, deviceId));
  }

  getCredentials(): Observable<Array<UnityCredentialsFast>> {
    return this.http.get<Array<UnityCredentialsFast>>(UNITY_CREDENTIALS_FAST(), { params: new HttpParams().set('page_size', 0) }).pipe(
      map(credentials =>
        credentials.map(c => ({
          ...c,
          nameWithType: `${c.name} (${c.connection_type})`,
          isDisabled: false
        }))
      )
    );
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: new HttpParams().set('page_size', 0) });
  }

  getModels(manufacturer: string): Observable<Array<LoadBalancerCRUDModel>> {
    return this.http.get<Array<LoadBalancerCRUDModel>>(DEVICE_MODELS(DeviceMapping.LOAD_BALANCER, manufacturer));
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getPDUs(): Observable<DeviceFast[]> {
    return this.http.get<DeviceFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.PDU));
  }

  buildDetailForm(d: LoadBalancer): FormGroup {
    return this.builder.group({
      'name': [d.name, [Validators.required, NoWhitespaceValidator]],
      'dns_name': [d.dns_name, [NoWhitespaceValidator]],
      'management_ip': [d.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'domain': [d.domain, [NoWhitespaceValidator]],
      'environment': [d.environment, [NoWhitespaceValidator]],
      'availability_status': [d.status, []],
      'serial_number': [d.serial_number, [NoWhitespaceValidator]],
      'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
      'manufacturer': [d.manufacturer_id, [Validators.required, NoWhitespaceValidator]],
      'model': this.builder.group({
        'id': [d.model_id, [Validators.required, NoWhitespaceValidator]]
      }),
      'os_type': [d.os_type, [NoWhitespaceValidator]],
      'os_name': [d.os_name, [NoWhitespaceValidator]],
      'version_number': [d.version_number, [NoWhitespaceValidator]],
      // 'credentials': this.builder.group({
      //   'uuid': [d.credentials ? d.credentials.uuid : '']
      // }),
      'credentials_m2m': [d.credentials_m2m ? d.credentials_m2m.map(c => c.uuid) : []],
      'credentials_type': [d.credentials_type ? d.credentials_type : ''],
      'collector': this.builder.group({
        'uuid': [d.collector ? d.collector.uuid : '', Validators.required]
      }),
      'discovery_method': [d.discovery_method, [NoWhitespaceValidator]],
      'first_discovered': [d.first_discovered, [NoWhitespaceValidator]],
      'last_discovered': [d.last_discovered, [NoWhitespaceValidator]],
      'uptime': [{ value: d.uptime, disabled: true }, [NoWhitespaceValidator]],
      'last_rebooted': [d.last_rebooted, [NoWhitespaceValidator]],
      'description': [d.description, [NoWhitespaceValidator]],
      'note': [d.note, [NoWhitespaceValidator]],
    })
  }

  resetDetailFormErrors() {
    return {
      'name': '',
      'dns_name': '',
      'management_ip': '',
      'serial_number': '',
      'asset_tag': '',
      'manufacturer': '',
      'model': {
        'id': ''
      },
      'os_type': '',
      'os_name': '',
      'version_number': '',
      'collector': {
        'uuid': ''
      },
      'discovery_method': '',
      'first_discovered': '',
      'last_discovered': '',
      'uptime': '',
      'last_rebooted': '',
      'description': '',
      'note': '',
    }
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
    },
    'model': {
      'id': {
        'required': 'Model is required'
      }
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }

  buildMetaDataForm(d: LoadBalancer): FormGroup {
    return this.builder.group({
      'cpu': [d.cpu, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'memory': [d.memory, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'fan': [d.fan, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'firmware_version': [d.firmware_version, [NoWhitespaceValidator]],
      // 'power_supply1': this.builder.group({
      //   'id': [device.power_supply1 ? device.power_supply1.uuid, [Validators.required, NoWhitespaceValidator]]
      // }),
      'last_updated': [d.last_updated, [NoWhitespaceValidator]],
      'end_of_life': [d.end_of_life, [NoWhitespaceValidator]],
      'end_of_support': [d.end_of_support, [NoWhitespaceValidator]],
      'end_of_service': [d.end_of_service, [NoWhitespaceValidator]]
    })
  }

  resetMetaDataFormErrors() {
    return {
      'cpu': '',
      'memory': '',
      'fan': '',
      'firmware_version': '',
      'last_updated': ''
    }
  }

  metaDataFormValidationMessages = {
    'cpu': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'memory': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'fan': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
  }

  buildLocationForm(d: LoadBalancer): FormGroup {
    return this.builder.group({
      'datacenter': this.builder.group({
        'uuid': [d.datacenter ? d.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'cloud': [d.cloud, []],
      'cabinet': this.builder.group({
        'id': [d.cabinet ? d.cabinet.id : '', [NoWhitespaceValidator]]
      }),
      'position': [d.cabinet ? d.position : '', [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'size': [d.size, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
      // 'power_socket1': [d.power_socket1, [NoWhitespaceValidator]],
      // 'power_socket2': [d.power_socket2, [NoWhitespaceValidator]],
    })
  }

  resetLocationFormErrors() {
    return {
      'datacenter': {
        'uuid': ''
      },
      'cloud': '',
      'cabinet': {
        'id': ''
      },
      'position': '',
      'size': '',
    }
  }

  locationFormValidationMessages = {
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'position': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be greater than or equal to 1'
    },
  }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER, deviceId));
  }

  updateDevice(uuid: string, data: any): Observable<LoadBalancer> {
    return this.http.put<LoadBalancer>(DEVICE_BY_ID(DeviceMapping.LOAD_BALANCER, uuid), data);
  }

  syncUptime(uuid: string): Observable<any> {
    return this.http.get<any>(DEVICE_UPTIME_BY_DEVICE_ID(DeviceMapping.LOAD_BALANCER, uuid));
  }

  syncSerialNumber(uuid: string): Observable<string> {
    return this.http.get<string>(DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER, uuid));
  }

  syncLogicalSystem(uuid: string): Observable<any> {
    return this.http.get<any>(`customer/load_balancers/${uuid}/logical_system/`);
  }

  syncResourcePool(uuid: string): Observable<any> {
    return this.http.get<any>(`customer/load_balancers/${uuid}/resource_pool/`);
  }
}

export class DeviceDetailsViewData {
  constructor() { }
  deviceId: string;
  deviceType: string;
  name: string;
  manufacturer: string;
  manufacturerId: string;
  model: string;
  modelId: string;
  managementIp: string;
  isShared: boolean;
  tags: string[];
  assetTag: string;
  status: string;

  datacenter: DatacenterInDevice;
  cabinet: CabinetFast;
  position: number;
  size: number;
  SNMPIP: string;

  cloud: any[];
  monitoring: DeviceMonitoringType;
}
