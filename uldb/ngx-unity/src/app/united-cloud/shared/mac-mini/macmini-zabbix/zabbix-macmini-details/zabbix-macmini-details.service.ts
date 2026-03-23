import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin } from 'rxjs';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_BY_ID, DEVICE_MANUFACTURERS, DEVICE_MODELS, DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE, DEVICE_UPTIME_BY_DEVICE_ID, GET_AGENT_CONFIGURATIONS, MAC_OS, PRIVATE_CLOUD_FAST_BY_DC_ID, UNITY_CREDENTIALS_FAST, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { MacMiniCRUDManufacturer, MacMiniCRUDModel, MacMiniCRUDOperatingSystem } from '../../../entities/mac-mini-crud.type';
import { MacMini } from '../../../entities/mac-mini.type';
import { map } from 'rxjs/operators';

@Injectable()
export class ZabbixMacminiDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getDropdownData() {
    const manufacturers = this.http.get<MacMiniCRUDManufacturer[]>(DEVICE_MANUFACTURERS(DeviceMapping.MAC_MINI));
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const os = this.http.get<MacMiniCRUDOperatingSystem[]>(MAC_OS());
    return forkJoin([manufacturers, datacenters, os]);
  }

  getDeviceDetails(deviceId: string): Observable<MacMini> {
    return this.http.get<MacMini>(DEVICE_BY_ID(DeviceMapping.MAC_MINI, deviceId));
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

  getModels(manufacturer: string): Observable<Array<MacMiniCRUDModel>> {
    return this.http.get<Array<MacMiniCRUDModel>>(DEVICE_MODELS(DeviceMapping.MAC_MINI, manufacturer));
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  buildDetailForm(d: MacMini): FormGroup {
    return this.builder.group({
      'name': [d.name, [Validators.required, NoWhitespaceValidator]],
      'dns_name': [d.dns_name, [NoWhitespaceValidator]],
      'ip_address': [d.ip_address, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'domain': [d.domain, [NoWhitespaceValidator]],
      'environment': [d.environment, [NoWhitespaceValidator]],
      'availability_status': [d.status, []],
      'serial_number': [d.serial_number, [Validators.required, NoWhitespaceValidator]],
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
        'uuid': [d.collector ? d.collector.uuid : '', Validators.required]
      }),
      'discovery_method': [{ value: d.discovery_method, disabled: true }, [NoWhitespaceValidator]],
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
      'ip_address': '',
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
    }
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
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

  buildMetaDataForm(d: MacMini): FormGroup {
    return this.builder.group({
      'num_cpus': [d.num_cores, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'num_cores': [d.num_cores, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'memory_mb': [d.memory_mb, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'capacity_gb': [d.capacity_gb, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'end_of_life': [d.end_of_life, [NoWhitespaceValidator]],
      'end_of_support': [d.end_of_support, [NoWhitespaceValidator]],
      'end_of_service': [d.end_of_service, [NoWhitespaceValidator]]
    })
  }

  resetMetaDataFormErrors() {
    return {
      'num_cpus': '',
      'num_cores': '',
      'memory_mb': '',
      'capacity_gb': '',
    }
  }

  metaDataFormValidationMessages = {
    'num_cpus': {
      'required': "Number of CPU's is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'num_cores': {
      'required': "CPU cores is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'memory_mb': {
      'required': "Memory is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'capacity_gb': {
      'required': "Storage is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
  }

  buildLocationForm(d: MacMini): FormGroup {
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
      // 'position': [d.cabinet ? d.position : '', [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      // 'size': [d.size, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
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
      // 'position': '',
      // 'size': '',
    }
  }

  locationFormValidationMessages = {
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    // 'position': {
    //   'pattern': 'Enter a numeric value',
    //   'min': 'Minimum value should be is greater than or equal to 0'
    // },
    // 'size': {
    //   'required': 'Size is required',
    //   'pattern': 'Enter a numeric value',
    //   'min': 'Minimum value should be greater than or equal to 1'
    // },
  }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI, deviceId));
  }

  updateDevice(uuid: string, data: any): Observable<MacMini> {
    return this.http.put<MacMini>(DEVICE_BY_ID(DeviceMapping.MAC_MINI, uuid), data);
  }

  syncUptime(uuid: string): Observable<any> {
    return this.http.get<any>(DEVICE_UPTIME_BY_DEVICE_ID(DeviceMapping.MAC_MINI, uuid));
  }

  syncSerialNumber(uuid: string): Observable<string> {
    return this.http.get<string>(DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI, uuid));
  }
}
