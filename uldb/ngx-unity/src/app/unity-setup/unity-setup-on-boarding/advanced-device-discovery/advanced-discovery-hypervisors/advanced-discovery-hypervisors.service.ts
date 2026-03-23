import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, HYPERVISOR_MANUFACTURERS, HYPERVISOR_MODELS, HYPERVISOR_OS, HYPERVISOR_PRIVATE_CLOUD_FAST, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { HypervisorCRUDManufacturer, HypervisorCRUDModel, HypervisorCRUDOperatingSystem, HypervisorCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/hypervisor-crud.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvanceAdvancedDiscoveryScanOpRes, AdvancedDiscoveryScanOp, AdvancedDiscoveryScanOpInterface } from '../advanced-discovery-scan-op.type';

@Injectable()
export class AdvancedDiscoveryHypervisorsService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getHypervisor(): Observable<AdvanceAdvancedDiscoveryScanOpRes> {
    return this.http.get<AdvanceAdvancedDiscoveryScanOpRes>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId(), DeviceMapping.HYPERVISOR));
  }

  getDropdownData() {
    const manufacturers = this.http.get<HypervisorCRUDManufacturer[]>(HYPERVISOR_MANUFACTURERS());
    const operatingSystems = this.http.get<HypervisorCRUDOperatingSystem[]>(HYPERVISOR_OS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([manufacturers, operatingSystems, dc]);
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getModels(manufacturer: string): Observable<Array<HypervisorCRUDModel>> {
    return this.http.get<Array<HypervisorCRUDModel>>(HYPERVISOR_MODELS(manufacturer));
  }

  convertToViewData(ops: AdvancedDiscoveryScanOp[]): DevDisHypervisorViewdata[] {
    let viewData: DevDisHypervisorViewdata[] = [];
    ops.map((op: AdvancedDiscoveryScanOp, index: number) => {
      let data = new DevDisHypervisorViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.uuid;
      data.hostname = op.name;
      data.manufacturer = op.manufacturer;
      data.model = op.model;
      data.os = op.os ? op.os : 'NA';
      data.version = op.version;
      data.ip = op.ip_address;
      data.observiumId = op.observium_id;
      data.cabinet = '';
      data.uptime = op.uptime;
      data.index = index;
      data.isOpen = false;
      data.openEnabled = op.onboarded_status ? false : true;
      data.form = this.createHypervisorForm(op);
      data.formErrors = this.resetHypervisorsFormErrors();
      data.validationMessages = this.hypervisorsValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createHypervisorForm(server: AdvancedDiscoveryScanOp): FormGroup {
    this.resetHypervisorsFormErrors();
    return this.builder.group({
      'unique_id': [server.uuid, [Validators.required, NoWhitespaceValidator]],
      'name': [server.name ? server.name : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': [server.manufacturer ? server.manufacturer : '', [Validators.required, NoWhitespaceValidator]]
      }),
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'os': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]],
      }),
      'management_ip': [{ value: server.ip_address ? server.ip_address : '', disabled: server.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'num_cpus': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'num_cores': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'memory_mb': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'capacity_gb': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'datacenter': this.builder.group({
        'uuid': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'private_cloud': this.builder.group({
        'id': ['', [NoWhitespaceValidator]],
      }),
      'cabinet': this.builder.group({
        'id': ['', [NoWhitespaceValidator]]
      }),
      'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
      'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'virtualization_type': ['', [Validators.required, NoWhitespaceValidator]],
      'asset_tag': [, [NoWhitespaceValidator]],
      'observium_id': [{ value: server.observium_id, disabled: true }],
      'os_type': [{ value: server.OStype, disabled: true }],
      'serial_number': [server.serial_number ? server.serial_number : '', [Validators.required, NoWhitespaceValidator]],
      'mac_address': [{ value: server.MacAddress, disabled: true }],
      'version_number': [{ value: server.version, disabled: true }],
      'discovery_method': [{ value: server.discovery_method, disabled: true }],
      'first_discovered': [{ value: server.first_discovered, disabled: true }],
      'last_discovered': [{ value: server.last_discovered, disabled: true }],
      'uptime': [server.uptime],
      'interfaces': [server.Interfaces],
      'collector': [server.collector]
    });
  }

  resetHypervisorsFormErrors() {
    return {
      'name': '',
      'private_cloud': {
        'id': ''
      },
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
      'num_cpus': '',
      'num_cores': '',
      'memory_mb': '',
      'capacity_gb': '',
      'position': '',
      'size': '',
      'virtualization_type': '',
      'os': {
        'id': ''
      },
      'datacenter': {
        'uuid': ''
      },
      'cabinet': {
        'id': ''
      },
      'asset_tag': '',
      'management_ip': '',
      'ip_address': '',
      'snmp_community': '',
      'backend_url': '',
      'serial_number': ''
    };
  }

  hypervisorsValidationMessages = {
    'name': {
      'required': 'Hypervisor name is required'
    },
    'private_cloud': {
      'id': {
        'required': 'Private cloud is required'
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
    'num_cpus': {
      'required': 'Number of CPUs is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'num_cores': {
      'required': 'Number of cores is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'memory_mb': {
      'required': 'Memory in MB is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'capacity_gb': {
      'required': 'Capacity in GB is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'position': {
      'required': 'Position is required',
      'min': 'Minimum value should be greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'virtualization_type': {
      'required': 'Virtualization Type is required'
    },
    'os': {
      'id': {
        'required': 'OS is required'
      }
    },
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'cabinet': {
      'id': {
        'required': 'Cabinet is required'
      }
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'ip_address': {
      'required': 'SNMP IP is required',
      'ip': 'Invalid IP'
    },
    'snmp_community': {
      'required': 'SNMP String is required'
    },
    'backend_url': {
      'required': 'Web Url is required'
    },
    'serial_number': {
      'required': 'Serial Number is required'
    }
  }

  saveAll(data: DeviceDiscoveryHypervisorFormData[]): Observable<AdvancedDiscoveryScanOp[]> {
    return this.http.post<AdvancedDiscoveryScanOp[]>(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE('','',DeviceMapping.HYPERVISOR), data);
  }
}

export class DevDisHypervisorViewdata {
  deviceType: string;
  uniqueId: string;
  hostname: string;
  manufacturer: string;
  model: string;
  os: string;
  version: string;
  ip: string;
  observiumId: string;
  cabinet: string;
  uptime: string;

  index: number;
  isOpen: boolean;
  openEnabled: boolean;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: HypervisorCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];
}

export class DeviceDiscoveryHypervisorFormData {
  unique_id: string;
  name: string;
  manufacturer: {
    id: string;
  }
  model: {
    id: string;
  }
  os: {
    id: string;
  }
  management_ip: string;

  num_cpus: number;
  num_cores: number;
  memory_mb: number;
  capacity_gb: number;

  private_cloud: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  position: number;
  size: number;

  virtualization_type: string;
  asset_tag: string;
  observium_id: string;
  serial_number: string;
  interfaces: AdvancedDiscoveryScanOpInterface;
}