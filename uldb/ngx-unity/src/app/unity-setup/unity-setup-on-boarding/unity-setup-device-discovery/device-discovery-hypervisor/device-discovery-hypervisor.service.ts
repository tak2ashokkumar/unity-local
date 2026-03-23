import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable } from 'rxjs';
import { CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_DISCOVERY_SCAN_OP, HYPERVISOR_MANUFACTURERS, HYPERVISOR_MODELS, HYPERVISOR_OS, HYPERVISOR_PRIVATE_CLOUD_FAST } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { HypervisorCRUDManufacturer, HypervisorCRUDModel, HypervisorCRUDOperatingSystem, HypervisorCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/hypervisor-crud.type';
import { DeviceDiscoveryScanOp } from '../device-discovery-scan-op.type';

@Injectable()
export class DeviceDiscoveryHypervisorService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getHypervisor(): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.get<DeviceDiscoveryScanOp[]>(DEVICE_DISCOVERY_SCAN_OP(DeviceMapping.HYPERVISOR));
  }

  getDropdownData() {
    const manufacturers = this.http.get<HypervisorCRUDManufacturer[]>(HYPERVISOR_MANUFACTURERS());
    const operatingSystems = this.http.get<HypervisorCRUDOperatingSystem[]>(HYPERVISOR_OS());
    const privateClouds = this.http.get<HypervisorCRUDPrivateCloudFast[]>(HYPERVISOR_PRIVATE_CLOUD_FAST());
    const cabinets = this.http.get<CabinetFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.CABINET_VIZ));
    return forkJoin([manufacturers, operatingSystems, privateClouds, cabinets]);
  }

  getModels(manufacturer: string): Observable<Array<HypervisorCRUDModel>> {
    return this.http.get<Array<HypervisorCRUDModel>>(HYPERVISOR_MODELS(manufacturer));
  }

  convertToViewData(ops: DeviceDiscoveryScanOp[]): DevDisHypervisorViewdata[] {
    let viewData: DevDisHypervisorViewdata[] = [];
    ops.map((op: DeviceDiscoveryScanOp, index: number) => {
      let data = new DevDisHypervisorViewdata();
      data.deviceType = op.device_type;
      data.uniqueId = op.unique_id;
      data.hostname = op.hostname;
      data.manufacturer = op.manufaturer;
      data.model = op.model;
      data.os = op.os ? op.os : 'NA';
      data.version = op.version;
      data.ip = op.ip_address;
      data.observiumId = op.observium_id;
      data.cabinet = '';

      data.index = index;
      data.isOpen = false;
      data.openEnabled = op.db_pk ? false : true;

      data.form = this.createHypervisorForm(op);
      data.formErrors = this.resetHypervisorsFormErrors();
      data.validationMessages = this.hypervisorsValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createHypervisorForm(server: DeviceDiscoveryScanOp): FormGroup {
    this.resetHypervisorsFormErrors();
    return this.builder.group({
      'unique_id': [server.unique_id, [Validators.required, NoWhitespaceValidator]],
      'name': [server.hostname ? server.hostname : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': [server.manufaturer ? server.manufaturer : '', [Validators.required, NoWhitespaceValidator]]
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
      'observium_id': [{ value: server.observium_id, disabled: true }]
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
      'cabinet': {
        'id': ''
      },
      'asset_tag': '',
      'management_ip': '',
      'ip_address': '',
      'snmp_community': '',
      'backend_url': ''
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
    }
  }

  saveAll(data: DeviceDiscoveryHypervisorFormData[]): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.post<DeviceDiscoveryScanOp[]>(CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR), data);
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

  index: number;
  isOpen: boolean;
  openEnabled: boolean;

  form: FormGroup
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: HypervisorCRUDModel[];
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
}
