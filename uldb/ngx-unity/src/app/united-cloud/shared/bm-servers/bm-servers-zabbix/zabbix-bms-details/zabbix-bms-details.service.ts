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
import { BMServer_OS, CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_BY_ID, DEVICE_MANUFACTURERS, DEVICE_MODELS, DEVICE_POWER_STATUS_BY_DEVICE_TYPE, DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE, DEVICE_UPTIME_BY_DEVICE_ID, GET_AGENT_CONFIGURATIONS, PRIVATE_CLOUD_FAST_BY_DC_ID, UNITY_CREDENTIALS_FAST, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { BMServerCRUDManufacturer, BMServerCRUDModel, BMServerCRUDOperatingSystem } from '../../../entities/bm-server-crud.type';
import { BMServer, BMServerPowerStatus } from '../../../entities/bm-server.type';
import { map, switchMap, take } from 'rxjs/operators';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class ZabbixBmsDetailsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService) { }

  getDropdownData(deviceId: string) {
    const powerStatus = this.http.get<BMServerPowerStatus>(DEVICE_POWER_STATUS_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, deviceId));
    const manufacturers = this.http.get<BMServerCRUDManufacturer[]>(DEVICE_MANUFACTURERS(DeviceMapping.BARE_METAL_SERVER));
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const os = this.http.get<BMServerCRUDOperatingSystem[]>(BMServer_OS());
    return forkJoin([powerStatus, manufacturers, datacenters, os]);
  }

  getDeviceDetails(deviceId: string): Observable<BMServer> {
    return this.http.get<BMServer>(DEVICE_BY_ID(DeviceMapping.BARE_METAL_SERVER, deviceId));
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

  getModels(manufacturer: string): Observable<Array<BMServerCRUDModel>> {
    return this.http.get<Array<BMServerCRUDModel>>(DEVICE_MODELS(DeviceMapping.BARE_METAL_SERVER, manufacturer));
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

  buildDetailForm(d: BMServer): FormGroup {
    return this.builder.group({
      'name': [d.server.name, [Validators.required, NoWhitespaceValidator]],
      'dns_name': [d.server.dns_name, [NoWhitespaceValidator]],
      'management_ip': [d.server.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'domain': [d.server.domain, [NoWhitespaceValidator]],
      'environment': [d.server.environment, [NoWhitespaceValidator]],
      'availability_status': [d.server.status, []],
      'serial_number': [d.server.serial_number, [NoWhitespaceValidator]],
      'asset_tag': [d.server.asset_tag, [NoWhitespaceValidator]],
      'out_of_band_management_ip': [d.server.out_of_band_management_ip, [NoWhitespaceValidator]],
      'out_of_band_management_type': [d.server.out_of_band_management_type, [NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': [d.server.manufacturer ? d.server.manufacturer.id : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'model': this.builder.group({
        'id': [d.server.model ? d.server.model.id : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'hypervisor': [d.server.hypervisor, [NoWhitespaceValidator]],
      'os': this.builder.group({
        'id': [d.os ? d.os.id : '', [Validators.required, NoWhitespaceValidator]],
      }),
      'os_build_version': [d.server.os_build_version ? d.server.os_build_version : '', [NoWhitespaceValidator]],
      // 'credentials': this.builder.group({
      //   'uuid': [d.server.credentials ? d.server.credentials.uuid : '']
      // }),
      'credentials_m2m': [d.server.credentials_m2m ? d.server.credentials_m2m.map(c => c.uuid) : []],
      'credentials_type': [d.server.credentials_type ? d.server.credentials_type : ''],
      'collector': this.builder.group({
        'uuid': [d.server.collector ? d.server.collector.uuid : '', [Validators.required]]
      }),
      'discovery_method': [d.server.discovery_method, [NoWhitespaceValidator]],
      'first_discovered': [d.server.first_discovered, [NoWhitespaceValidator]],
      'last_discovered': [d.server.last_discovered, [NoWhitespaceValidator]],
      'uptime': [{ value: d.server.uptime, disabled: true }, [NoWhitespaceValidator]],
      'last_rebooted': [d.server.last_rebooted, [NoWhitespaceValidator]],
      'description': [d.server.description, [NoWhitespaceValidator]],
      'note': [d.server.note, [NoWhitespaceValidator]],
      'life_cycle_stage': [d.life_cycle_stage ? d.life_cycle_stage : 'Operational', [NoWhitespaceValidator]],
      'life_cycle_stage_status': [d.life_cycle_stage_status ? d.life_cycle_stage_status : 'In Use', [NoWhitespaceValidator]]
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
      'hypervisor': '',
      'os': {
        'id': ''
      },
      'out_of_band_management_ip': '',
      'out_of_band_management_type': '',
      'manufacturer': {
        'id': ''
      },
      'model': {
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
      'os_build_version': '',
      'life_cycle_stage': '',
      'life_cycle_stage_status': '',
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
    'os': {
      'id': {
        'required': 'OS is required'
      }
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
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
    'life_cycle_stage': {
      'required': 'Life Cycle Stage is required'
    },
    'life_cycle_stage_status': {
      'required': 'Life Cycle Stage Status is required'
    },
  }

  buildMetaDataForm(d: BMServer): FormGroup {
    return this.builder.group({
      'num_cpus': [d.server.num_cpus, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'num_cores': [d.server.num_cores, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'logical_cpu': [d.server.logical_cpu, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'memory_mb': [d.server.memory_mb, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'capacity_gb': [d.server.capacity_gb, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'fan': [d.server.fan, [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'firmware_version': [d.server.firmware_version, [NoWhitespaceValidator]],
      'used_storage': [d.used_storage, [Validators.required, Validators.pattern("^[0-9]*\\.?[0-9]+$"), Validators.min(0), NoWhitespaceValidator]],
      'available_storage': [d.available_storage, [Validators.required, Validators.pattern("^[0-9]*\\.?[0-9]+$"), Validators.min(0), NoWhitespaceValidator]],

      // 'power_supply1': this.builder.group({
      //   'id': [device.power_supply1 ? device.power_supply1.uuid, [Validators.required, NoWhitespaceValidator]]
      // }),
      'last_updated': [d.server.last_updated, [NoWhitespaceValidator]],
      'end_of_life': [d.server.end_of_life, [NoWhitespaceValidator]],
      'end_of_support': [d.server.end_of_support, [NoWhitespaceValidator]],
      'end_of_service': [d.server.end_of_service, [NoWhitespaceValidator]]
    })
  }

  resetMetaDataFormErrors() {
    return {
      'num_cpus': '',
      'num_cores': '',
      'logical_cpu': '',
      'memory_mb': '',
      'capacity_gb': '',
      'used_storage': '',
      'available_storage': '',
      'fan': '',
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
    'logical_cpu': {
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
    'used_storage': {
      'required': "Storage is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'available_storage': {
      'required': "Storage is required",
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'fan': {
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 0'
    },
  }

  buildLocationForm(d: BMServer): FormGroup {
    return this.builder.group({
      'datacenter': this.builder.group({
        'uuid': [d.server.datacenter ? d.server.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'private_cloud': this.builder.group({
        'id': [d.server.private_cloud ? d.server.private_cloud.id : '', [NoWhitespaceValidator]],
      }),
      'cabinet': this.builder.group({
        'id': [d.server.cabinet ? d.server.cabinet.id : '', [NoWhitespaceValidator]]
      }),
      'position': [d.server.cabinet ? d.server.position : '', [Validators.pattern("^[0-9]*$"), Validators.min(0), NoWhitespaceValidator]],
      'size': [d.server.size, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
      'power_socket1': [d.server.power_socket1, [NoWhitespaceValidator]],
      'power_socket2': [d.server.power_socket2, [NoWhitespaceValidator]],
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

  getPowerStatus(deviceId: string): Observable<BMServerPowerStatus> {
    return this.http.get<BMServerPowerStatus>(DEVICE_POWER_STATUS_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, deviceId));
  }

  getDeviceData(deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, deviceId));
  }

  updateDevice(uuid: string, data: any): Observable<BMServer> {
    return this.http.put<BMServer>(DEVICE_BY_ID(DeviceMapping.BARE_METAL_SERVER, uuid), data);
  }

  syncUptime(uuid: string): Observable<any> {
    return this.http.get<any>(DEVICE_UPTIME_BY_DEVICE_ID(DeviceMapping.BARE_METAL_SERVER, uuid));
  }

  syncSerialNumber(uuid: string): Observable<string> {
    return this.http.get<string>(DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER, uuid));
  }

  discoverDeviceDetails(uuid: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(`/customer/bm_servers/${uuid}/scan_device/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }
}
