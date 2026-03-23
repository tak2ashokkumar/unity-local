import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, GET_ADVANCED_DISCOVERY_SCAN_OUTPUT, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE, STORAGE_DEVICE_OS, STORAGE_MANUFACTURERS, STORAGE_MODELS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { StorageCRUDManufacturer, StorageCRUDModel, StorageDeviceCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/storage-device-crud.type';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { AdvanceAdvancedDiscoveryScanOpRes, AdvancedDiscoveryScanOp, AdvancedDiscoveryScanOpInterface } from '../advanced-discovery-scan-op.type';

@Injectable()
export class AdvancedDiscoveryStorageService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private discoveryService: AdvancedDeviceDiscoveryService) { }

  getStorageDevices(): Observable<AdvanceAdvancedDiscoveryScanOpRes> {
    return this.http.get<AdvanceAdvancedDiscoveryScanOpRes>(GET_ADVANCED_DISCOVERY_SCAN_OUTPUT(this.discoveryService.getSelectedDiscoveryId(), DeviceMapping.STORAGE_DEVICES));
  }

  getDropdownData() {
    const manufacturers = this.http.get<StorageCRUDManufacturer[]>(STORAGE_MANUFACTURERS());
    const operatingSystems = this.http.get<StorageDeviceCRUDOperatingSystem[]>(STORAGE_DEVICE_OS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    return forkJoin([manufacturers, operatingSystems, dc]);
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getModels(manufacturer: string): Observable<Array<StorageCRUDModel>> {
    return this.http.get<Array<StorageCRUDModel>>(STORAGE_MODELS(manufacturer));
  }

  convertToViewData(ops: AdvancedDiscoveryScanOp[]): DevDisStorageViewdata[] {
    let viewData: DevDisStorageViewdata[] = [];
    ops.map((op: AdvancedDiscoveryScanOp, index: number) => {
      let data = new DevDisStorageViewdata();
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

      data.form = this.createStorageForm(op);
      data.formErrors = this.resetStorageDeviceFormErrors();
      data.validationMessages = this.storageDeviceFormValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createStorageForm(storage?: AdvancedDiscoveryScanOp): FormGroup {
    this.resetStorageDeviceFormErrors();
    return this.builder.group({
      'unique_id': [storage.uuid, [Validators.required, NoWhitespaceValidator]],
      'name': [storage.hostname ? storage.hostname : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'datacenter': this.builder.group({
        'uuid': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'private_cloud': this.builder.group({
        'id': ['', [NoWhitespaceValidator]]
      }),
      'cabinet': this.builder.group({
        'id': ['', [NoWhitespaceValidator]]
      }),
      'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
      'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'os': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]],
      }),
      'management_ip': [{ value: storage.ip_address ? storage.ip_address : '', disabled: storage.ip_address ? true : false }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'asset_tag': ['', [NoWhitespaceValidator]],
      'observium_id': [{ value: storage.observium_id, disabled: true }],
      'os_type': [{ value: storage.OStype, disabled: true }],
      'serial_number': [ storage.SerialNumber ? storage.SerialNumber : '', [Validators.required, NoWhitespaceValidator]],
      'mac_address': [{ value: storage.MacAddress, disabled: true }],
      'version_number': [{ value: storage.version, disabled: true }],
      'discovery_method': [{ value: storage.discovery_method, disabled: true }],
      'first_discovered': [{ value: storage.first_discovered, disabled: true }],
      'last_discovered': [{ value: storage.last_discovered, disabled: true }],
      'uptime': [storage.uptime],
      'interfaces': [storage.Interfaces],
      'collector': [storage.collector]
    });
  }

  resetStorageDeviceFormErrors() {
    return {
      'name': '',
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
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
      'os': {
        'id': ''
      },
      'management_ip': '',
      'asset_tag': '',
      'serial_number': ''
    };
  }

  storageDeviceFormValidationMessages = {
    'name': {
      'required': 'Storage Device name is required'
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
    'serial_number': {
      'required': 'Serial Number is required'
    }
  }

  saveAll(data: DeviceDiscoveryStorageFormData[]): Observable<AdvancedDiscoveryScanOp[]> {
    return this.http.post<AdvancedDiscoveryScanOp[]>(SAVE_ADVANCED_SCAN_DEVICE_BY_DEVICETYPE('','',DeviceMapping.STORAGE_DEVICES), data);
  }
}

export class DevDisStorageViewdata {
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

  form: FormGroup
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: StorageCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];
}

export class DeviceDiscoveryStorageFormData {
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
  private_cloud: {
    id: string;
  }
  management_ip: string;
  cabinet: {
    id: string;
  }
  position: number;
  size: number;
  asset_tag: string;
  observium_id: string;
  serial_number: string;
  interfaces: AdvancedDiscoveryScanOpInterface;
}

