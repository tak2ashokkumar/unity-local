import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin } from 'rxjs';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceFast } from 'src/app/shared/SharedEntityTypes/device-response.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_BY_ID, DEVICE_MANUFACTURERS, DEVICE_MODELS, DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE, DEVICE_UPTIME_BY_DEVICE_ID, GET_AGENT_CONFIGURATIONS, PRIVATE_CLOUD_FAST_BY_DC_ID, STORAGE_DEVICE_OS, UNITY_CREDENTIALS_FAST, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { StorageCRUDManufacturer, StorageCRUDModel, StorageDeviceCRUDOperatingSystem } from '../../../entities/storage-device-crud.type';
import { StorageDevice } from '../../../entities/storage-device.type';
import { map } from 'rxjs/operators';

@Injectable()
export class ZabbixStorageDetailsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getDropdownData() {
    const manufacturers = this.http.get<StorageCRUDManufacturer[]>(DEVICE_MANUFACTURERS(DeviceMapping.STORAGE_DEVICES));
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const os = this.http.get<StorageDeviceCRUDOperatingSystem[]>(STORAGE_DEVICE_OS());
    return forkJoin([manufacturers, datacenters, os]);
  }

  getDeviceDetails(deviceId: string): Observable<StorageDevice> {
    return this.http.get<StorageDevice>(DEVICE_BY_ID(DeviceMapping.STORAGE_DEVICES, deviceId));
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

  getModels(manufacturer: string): Observable<Array<StorageCRUDModel>> {
    return this.http.get<Array<StorageCRUDModel>>(DEVICE_MODELS(DeviceMapping.STORAGE_DEVICES, manufacturer));
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

  buildDetailForm(d: StorageDevice): FormGroup {
    return this.builder.group({
      'name': [d.name, [Validators.required, NoWhitespaceValidator]],
      'dns_name': [d.dns_name, [NoWhitespaceValidator]],
      'management_ip': [d.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'domain': [d.domain, [NoWhitespaceValidator]],
      'environment': [d.environment, [NoWhitespaceValidator]],
      'availability_status': [d.status, []],
      'serial_number': [d.serial_number, [NoWhitespaceValidator]],
      'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': [d.manufacturer ? d.manufacturer.id : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'model': this.builder.group({
        'id': [d.model ? d.model.id : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'os': this.builder.group({
        'id': [d.os ? d.os.id : '', [Validators.required, NoWhitespaceValidator]],
      }),
      // 'credentials': this.builder.group({
      //   'uuid': [d.credentials ? d.credentials.uuid : '']
      // }),
      'credentials_m2m': [d.credentials_m2m ? d.credentials_m2m.map(c => c.uuid) : []],
      'credentials_type': [d.credentials_type ? d.credentials_type : ''],
      'collector': this.builder.group({
        'uuid': [d.collector ? d.collector.uuid : '', [Validators.required]]
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
      'environment': '',
      'serial_number': '',
      'asset_tag': '',
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
      'os': {
        'id': ''
      },
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
    'ip_address': {
      'ip': 'Invalid IP'
    },
    'manufacturer': {
      'id': {
        'required': 'Manufacturer is required'
      }
    },
    'model': {
      'id': {
        'required': 'Model is required'
      }
    },
    'os': {
      'id': {
        'required': 'OS is required'
      }
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }

  buildMetaDataForm(d: StorageDevice): FormGroup {
    return this.builder.group({
      'cpu': [d.cpu, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'logical_cpu': [d.logical_cpu, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'storage_capacity': [d.storage_capacity, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'storage_used': [d.storage_used, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'memory': [d.memory, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'fan': [d.fan, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'last_updated': [d.last_updated, [NoWhitespaceValidator]],
      'end_of_life': [d.end_of_life, [NoWhitespaceValidator]],
      'end_of_support': [d.end_of_support, [NoWhitespaceValidator]],
      'end_of_service': [d.end_of_service, [NoWhitespaceValidator]]
    })
  }

  resetMetaDataFormErrors() {
    return {
      'cpu': '',
      'logical_cpu': '',
      'storage_capacity': '',
      'storage_used': '',
      'memory': '',
      'fan': '',
      'last_updated': ''
    }
  }

  metaDataFormValidationMessages = {
    'cpu': {
      // 'required': "Number of CPU's is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'logical_cpu': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'storage_capacity': {
      // 'required': "Storage Capacity is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'storage_used': {
      // 'required': "CPU cores is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'memory': {
      // 'required': "Memory is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'fan': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
  }

  buildLocationForm(d: StorageDevice): FormGroup {
    return this.builder.group({
      'datacenter': this.builder.group({
        'uuid': [d.datacenter ? d.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'private_cloud': this.builder.group({
        'id': [d.private_cloud ? d.private_cloud.id : '', [NoWhitespaceValidator]],
      }),
      'cabinet': this.builder.group({
        'id': [d.cabinet ? d.cabinet.id : '', [NoWhitespaceValidator]]
      }),
      'position': [d.cabinet ? d.position : '', [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'size': [d.size, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
    })
  }

  resetLocationFormErrors() {
    return {
      'datacenter': {
        'uuid': ''
      },
      'private_cloud': {
        'id': ''
      },
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
    return this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES, deviceId));
  }

  updateDevice(uuid: string, data: any): Observable<StorageDevice> {
    return this.http.put<StorageDevice>(DEVICE_BY_ID(DeviceMapping.STORAGE_DEVICES, uuid), data);
  }

  syncUptime(uuid: string): Observable<any> {
    return this.http.get<any>(DEVICE_UPTIME_BY_DEVICE_ID(DeviceMapping.STORAGE_DEVICES, uuid));
  }

  syncSerialNumber(uuid: string): Observable<string> {
    return this.http.get<string>(DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES, uuid));
  }
}
