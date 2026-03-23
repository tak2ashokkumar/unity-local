import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { UnityCredentialsFast } from 'src/app/shared/SharedEntityTypes/unity-credentials.type';
import { DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_BY_ID, DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE, DEVICE_UPTIME_BY_DEVICE_ID, GET_ADVANCED_DISCOVERY_CREDENTIALS, GET_AGENT_CONFIGURATIONS, UNITY_CREDENTIALS_FAST, UPDATE_VM_DETAILS_BY_DEVICE_TYPE, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ZabbixVmsDetailsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private util: AppUtilityService,
    private appService: AppLevelService) { }

  getDropdownData(deviceType: DeviceMapping, deviceId: string) {
    const deviceStatus = this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(deviceType, deviceId));
    const datacenters = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([deviceStatus, datacenters]);
  }

  getDeviceDetails(deviceType: DeviceMapping, deviceId: string): Observable<any> {
    return this.http.get<any>(DEVICE_BY_ID(deviceType, deviceId));
  }

  syncPerformance(deviceId: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(`/rest/vmware/migrate/${deviceId}/sync_performace/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
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

  getPowerStatus(d: any) {
    return d.status ? d.status : (d.state ? d.state : null);
  }

  getOs(os: any) {
    return os ? typeof os == 'string' ? os : os.full_name : os;
  }

  getSSROS(device: any) {
    return device.os ? typeof device.os == 'string' ? device.ssr_os : device.os.platform_type : null;
  }

  getCollectorId(d: any) {
    if (d.collector) {
      return d.collector.uuid;
    } else if (d.cloud) {
      return d.cloud.collector ? d.cloud.collector.uuid : '';
    } else if (d.private_cloud) {
      return d.private_cloud.collector ? d.private_cloud.collector.uuid : ''
    }
    return '';
  }

  buildDetailForm(d: any, platformType: DeviceMapping): FormGroup {
    let form = this.builder.group({
      'name': [{ value: d.name, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'dns_name': [d.dns_name, [NoWhitespaceValidator]],
      // 'ip_address': [d.ip_address, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'domain': [d.domain, [NoWhitespaceValidator]],
      'environment': [d.environment, [NoWhitespaceValidator]],
      'availability_status': [{ value: this.getPowerStatus(d), disabled: true }, []],
      'serial_number': [d.serial_number, [NoWhitespaceValidator]],
      'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
      'manufacturer': [{ value: d.manufacturer, disabled: true }, [NoWhitespaceValidator]],
      'model': [d.model, [NoWhitespaceValidator]],
      // 'os': [this.getOs(d.os), this.getOs(d.os) ? [Validators.required, NoWhitespaceValidator] : [NoWhitespaceValidator]],
      'os_build_version': [d.os_build_version, [NoWhitespaceValidator]],
      'hypervisor': [d.hypervisor, [NoWhitespaceValidator]],
      'mac_address': [d.mac_address, [NoWhitespaceValidator]],
      'service_pack': [d.service_pack, [NoWhitespaceValidator]],
      'template': [{ value: d.is_template, disabled: true }, [NoWhitespaceValidator]],
      // 'credentials': this.builder.group({
      //   'uuid': [d.credentials ? d.credentials.uuid : '']
      // }),
      'credentials_m2m': [d.credentials_m2m ? d.credentials_m2m.map(c => c.uuid) : []],
      'credentials_type': [d.credentials_type ? d.credentials_type : ''],
      'collector': this.builder.group({
        'uuid': [{ value: this.getCollectorId(d), disabled: true }, []]
      }),
      'discovery_method': [{ value: d.discovery_method, disabled: true }, [NoWhitespaceValidator]],
      'first_discovered': [{ value: d.first_discovered, disabled: true }, [NoWhitespaceValidator]],
      'last_discovered': [{ value: d.last_discovered, disabled: true }, [NoWhitespaceValidator]],
      'uptime': [{ value: d.uptime, disabled: true }, [NoWhitespaceValidator]],
      'last_rebooted': [{ value: d.last_rebooted, disabled: true }, [NoWhitespaceValidator]],
      'description': [d.description, [NoWhitespaceValidator]],
      'note': [d.note, [NoWhitespaceValidator]],      
      'life_cycle_stage': [d.life_cycle_stage ? d.life_cycle_stage : 'Operational', [NoWhitespaceValidator]],
      'life_cycle_stage_status': [d.life_cycle_stage_status ? d.life_cycle_stage_status : 'In Use', [NoWhitespaceValidator]]
    })

    this.addOSControl(d, form, platformType);
    this.addIPControl(d, form, platformType);
    return form;
  }

  addIPControl(d: any, form: FormGroup, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
      case DeviceMapping.HYPER_V:
        form.addControl('management_ip', new FormControl(d.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
        break;
      default:
        form.addControl('ip_address', new FormControl(d.ip_address, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
        break;
    }
  }

  addOSControl(d: any, form: FormGroup, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        form.addControl('os_name', new FormControl(d.os_name, d.os_name ? [Validators.required, NoWhitespaceValidator] : [NoWhitespaceValidator]));
        break;
      default:
        form.addControl('os', new FormControl(this.getOs(d.os), this.getOs(d.os) ? [Validators.required, NoWhitespaceValidator] : [NoWhitespaceValidator]));
        break;
    }
  }

  resetDetailFormErrors() {
    return {
      'name': '',
      'dns_name': '',
      'ip_address': '',
      'management_ip': '',
      'environment': '',
      'serial_number': '',
      'asset_tag': '',
      'manufacturer': '',
      'model': '',
      'os': '',
      'os_build_version': '',
      'mac_address': '',
      'template': '',
      'credentials': '',
      'credentials_type': '',
      // 'collector': {
      //   'uuid': ''
      // },
      'discovery_method': '',
      'first_discovered': '',
      'last_discovered': '',
      'uptime': '',
      'last_rebooted': '',
      'description': '',
      'note': '',
      'life_cycle_stage': '',
      'life_cycle_stage_status': '',
    }
  }

  detailFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'ip_address': {
      'ip': 'Invalid IP'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
    },
    'os': {
      'required': 'os is required'
    },
    // 'collector': {
    //   'uuid': {
    //     'required': 'Collector is required'
    //   }
    // },    
    'life_cycle_stage': {
      'required': 'Life Cycle Stage is required'
    },
    'life_cycle_stage_status': {
      'required': 'Life Cycle Stage Status is required'
    },
  }

  buildMetaDataForm(d: any, platformType: DeviceMapping): FormGroup {
    let form = this.builder.group({
      // 'cpu': [d.vcpus, d.vcpus ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
      'cpu_core': [d.cpu_core, d.cpu_core ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
      // 'memory': [d.memory, d.memory ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
      // 'storage': [d.storage, d.storage ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]],
      'firmware_version': [d.firmware_version, [NoWhitespaceValidator]],
      'last_updated': [{ value: d.last_updated, disabled: true }, [NoWhitespaceValidator]],
    })
    this.addCPUControl(d, form, platformType);
    this.addStorageControl(d, form, platformType);
    this.addMemoryControl(d, form, platformType);
    this.addHardDisksContorl(d, form, platformType);
    return form;
  }

  addCPUControl(d: any, form: FormGroup, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        form.addControl('vcpus', new FormControl(d.vcpus, d.vcpus ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]));
        break;
      default:
        form.addControl('cpu', new FormControl(d.vcpus, d.vcpus ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]));
        break;
    }
  }

  addMemoryControl(d: any, form: FormGroup, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        form.addControl('guest_memory', new FormControl(d.guest_memory, d.guest_memory ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]));
        form.addControl('available_memory', new FormControl(d.available_memory ? d.available_memory : ''));
        form.addControl('used_memory', new FormControl(d.used_memory ? d.used_memory : ''));
        break;
      default:
        form.addControl('memory', new FormControl(d.memory, this.getMemoryControlValidators(d.memory, platformType)));
        break;
    }
  }

  getMemoryControlValidators(hasValue: any, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.HYPER_V:
        return hasValue ? [Validators.required, greaterThanZero(), NoWhitespaceValidator] : [greaterThanZero(), NoWhitespaceValidator];
      default:
        return hasValue ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator];
    }
  }

  addStorageControl(d: any, form: FormGroup, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        form.addControl('disk_space', new FormControl(d.disk_space, d.disk_space ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator]));
        form.addControl('available_storage', new FormControl(d.available_storage ? d.available_storage : ''));
        form.addControl('used_storage', new FormControl(d.used_storage ? d.used_storage : ''));
        break;
      default:
        form.addControl('storage', new FormControl(d.storage, this.getStorageControlValidators(d.storage, platformType)));
        break;
    }
  }

  getStorageControlValidators(hasValue: any, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.HYPER_V:
        return hasValue ? [Validators.required, greaterThanZero(), NoWhitespaceValidator] : [greaterThanZero(), NoWhitespaceValidator];
      default:
        return hasValue ? [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator] : [Validators.pattern("^[0-9]*$"), Validators.min(1), NoWhitespaceValidator];
    }
  }

  addHardDisksContorl(d: any, form: FormGroup, platformType: DeviceMapping) {
    switch (platformType) {
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE:
        form.addControl('hard_disks', this.getVmwareVMHardDisksFormArray(d));
        break;
    }
  }

  getVmwareVMHardDisksFormArray(d: any) {
    return this.builder.array(
      d.hard_disks.map(d => this.builder.group({
        'disk_label': [{ value: d.disk_label, disabled: true }],
        'disk_file_name': [{ value: d.disk_file_name, disabled: true }],
        'disk_size': [{ value: d.disk_size, disabled: true }],
        'disk_size_unit': [{ value: d.disk_size_unit, disabled: true }],
      }))
    )
  }

  resetMetaDataFormErrors() {
    return {
      'cpu': '',
      'vcpus': '',
      'cpu_core': '',
      'memory': '',
      'guest_memory': '',
      'available_memory': '',
      'used_memory': '',
      'storage': '',
      'available_storage': '',
      'used_storage': '',
      'disk_space': '',
      'firmware_version': '',
      'last_updated': ''
    }
  }

  metaDataFormValidationMessages = {
    'cpu': {
      'required': 'CPUs is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 1'
    },
    'vcpus': {
      'required': 'CPUs is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 1'
    },
    'cpu_core': {
      'required': 'CPU Core is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 1'
    },
    'memory': {
      'required': 'Memory is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 1',
      'greaterThanZero': 'Minimum Value should be greater than 0'
    },
    'guest_memory': {
      'required': 'Memory is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 1'
    },
    'storage': {
      'required': 'Storage is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 1',
      'greaterThanZero': 'Minimum Value should be greater than 0'
    },
    'disk_space': {
      'required': 'Storage is required',
      'pattern': 'Enter a numeric value',
      'min': 'Minimum value should be is greater than or equal to 1'
    },
  }

  buildLocationForm(d: any): FormGroup {
    return this.builder.group({
      'datacenter': [d.datacenter, [Validators.required, NoWhitespaceValidator]],
      'cloud': [d.cloud ? d.cloud.name : d.private_cloud ? d.private_cloud.name : '', [Validators.required]],
      'hypervisor': [d.hypervisor, [NoWhitespaceValidator]],
    })
  }

  resetLocationFormErrors() {
    return {
      'datacenter': {
        'uuid': ''
      },
      'cloud': '',
    }
  }

  locationFormValidationMessages = {
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'cloud': {
      'required': 'Cloud is required'
    }
  }

  getDeviceData(deviceType: DeviceMapping, deviceId: string): Observable<DeviceData> {
    return this.http.get<DeviceData>(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  updateDevice(deviceType: DeviceMapping, uuid: string, data: any): Observable<any> {
    return this.http.put<any>(UPDATE_VM_DETAILS_BY_DEVICE_TYPE(deviceType, uuid), data);
  }

  syncUptime(deviceType: DeviceMapping, uuid: string): Observable<any> {
    return this.http.get<any>(DEVICE_UPTIME_BY_DEVICE_ID(deviceType, uuid));
  }

  syncSerialNumber(deviceType: DeviceMapping, uuid: string): Observable<string> {
    return this.http.get<string>(DEVICE_SERIAL_NUMBER_BY_DEVICE_TYPE(deviceType, uuid))
  }

  discoverDeviceDetails(uuid: string): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(`/rest/vmware/migrate/${uuid}/scan_device/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }
}

export class virtualMachineDetailsViewData {
  constructor() { }
  name: string;
  dnsName: string;
  ipAddress: string;
  template: boolean;
  availabilityStatus: string;
  environment: string;
  os: string;
  servicePack: string;
  serialNumber: string;
  assetTag: string;
  discoveryMethod: string;
  firstDiscovered: string;
  lastDiscovered: string;
  lastRebooted: string;
  description: string;
  note: string;
}

function greaterThanZero(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value > 0 ? null : { greaterThanZero: true };
  };
}