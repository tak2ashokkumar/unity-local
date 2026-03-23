import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { BMServer_MANUFACTURERS, BMServer_MODELS, BMServer_OS, BMServer_PRIVATE_CLOUD_FAST, CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BMServerCRUDManufacturer, BMServerCRUDModel, BMServerCRUDOperatingSystem, BMServerCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/bm-server-crud.type';
import { BMServer } from 'src/app/united-cloud/shared/entities/bm-server.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvanceAdvancedDiscoveryScanOpRes, AdvancedDiscoveryScanOp, AdvancedDiscoveryScanOpInterface } from '../advanced-discovery-scan-op.type';

@Injectable()
export class AdvancedDiscoveryServersService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getServers(): Observable<AdvanceAdvancedDiscoveryScanOpRes> {
    return this.http.get<AdvanceAdvancedDiscoveryScanOpRes>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId(), DeviceMapping.BARE_METAL_SERVER));
  }

  getDropdownData() {
    const manufacturers = this.http.get<BMServerCRUDManufacturer[]>(BMServer_MANUFACTURERS());
    const operatingSystems = this.http.get<BMServerCRUDOperatingSystem[]>(BMServer_OS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([manufacturers, operatingSystems, dc]);
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getModels(manufacturer: string): Observable<Array<BMServerCRUDModel>> {
    return this.http.get<Array<BMServerCRUDModel>>(BMServer_MODELS(manufacturer));
  }

  convertToViewData(ops: AdvancedDiscoveryScanOp[]): DevDisServerViewdata[] {
    let viewData: DevDisServerViewdata[] = [];
    ops.map((op: AdvancedDiscoveryScanOp, index: number) => {
      let data = new DevDisServerViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.uuid;
      data.hostname = op.hostname;
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

      data.form = this.createBMSForm(op);
      data.formErrors = this.resetBMSFormErrors();
      data.validationMessages = this.bmsValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createBMSForm(server: AdvancedDiscoveryScanOp): FormGroup {
    this.resetBMSFormErrors();
    return this.builder.group({
      'unique_id': [server.uuid, [Validators.required, NoWhitespaceValidator]],
      'name': [server.hostname ? server.hostname : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
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
      'asset_tag': [, [NoWhitespaceValidator]],
      'observium_id': [{ value: server.observium_id, disabled: true }],
      'bmc_type': ['', [Validators.required, NoWhitespaceValidator]],
      'os_type': [{ value: server.OStype, disabled: true }],
      'serial_number': [ server.SerialNumber ? server.SerialNumber : '', [Validators.required, NoWhitespaceValidator]],
      'mac_address': [{ value: server.MacAddress, disabled: true }],
      'version_number': [{ value: server.version, disabled: true }],
      'discovery_method': [{ value: server.discovery_method, disabled: true }],
      'first_discovered': [{ value: server.first_discovered, disabled: true }],
      'last_discovered': [{ value: server.last_discovered, disabled: true }],
      'uptime':[server.uptime],
      'interfaces': [server.Interfaces],
      'collector': [server.collector]
    });
  }

  createIPMIForm(): FormGroup {
    return this.builder.group({
      'ip': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'username': ['', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'proxy_url': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  createDARCForm(): FormGroup {
    return this.builder.group({
      'version': ['', [Validators.required, NoWhitespaceValidator]],
      'ip': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'username': ['', [Validators.required, Validators.maxLength(20), NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'proxy_url': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetBMSFormErrors() {
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
      'bmc_type': '',
      'serial_number': ''
    };
  }

  resetIPMIFormErrors() {
    return {
      'ip': '',
      'username': '',
      'password': '',
      'proxy_url': ''
    };
  }

  resetDRACFormErrors() {
    return {
      'version': '',
      'ip': '',
      'username': '',
      'password': '',
      'proxy_url': ''
    };
  }

  bmsValidationMessages = {
    'name': {
      'required': 'BMS name is required'
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
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
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
      'min': 'Minimum value should be greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'os': {
      'id': {
        'required': 'OS is required'
      }
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'bmc_type': {
      'required': 'BM Controller is required'
    },
    'serial_number': {
      'required': 'Serial Number is required'
    }
  }

  IPMIFormMessages = {
    'ip': {
      'required': 'IP is required',
      'ip': 'Invalid IP'
    },
    'username': {
      'required': 'Username  is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'proxy_url': {
      'required': 'Proxy URL is required'
    }
  }

  DRACFormMessages = {
    'version': {
      'required': 'DRAC Version is required'
    },
    'ip': {
      'required': 'IP address is required',
      'ip': 'Invalid IP'
    },
    'username': {
      'required': 'Username  is required',
      'maxlength': 'Username can have maximum of 20 characters',
    },
    'password': {
      'required': 'Password is required'
    },
    'proxy_url': {
      'required': 'Proxy URL is required'
    }
  }

  saveAll(data: DeviceDiscoveryServerFormData[]): Observable<BMServer[]> {
    return this.http.post<BMServer[]>(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE('','',DeviceMapping.BARE_METAL_SERVER), data);
  }
}

export class DevDisServerViewdata {
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
  uptime:string;

  index: number;
  isOpen: boolean;
  openEnabled: boolean;

  bmcType: string;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;

  otherForm: FormGroup;
  otherFormErrors: any;
  otherFormValidationMessages: any;
  models: BMServerCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];
}

export class DeviceDiscoveryServerFormData {
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

  bmc_type: string;
  asset_tag: string;
  observium_id: string;
  serial_number: string;

  version?: number;
  ip?: string;
  username?: string;
  password?: string;
  proxy_url?: string;
  interfaces: AdvancedDiscoveryScanOpInterface;
}
