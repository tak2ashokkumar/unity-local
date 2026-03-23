import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable } from 'rxjs';
import { CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_DISCOVERY_SCAN_OP, PRIVATE_CLOUDS, STORAGE_DEVICE_OS, STORAGE_MANUFACTURERS, STORAGE_MODELS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { StorageCRUDManufacturer, StorageCRUDModel, StorageDeviceCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/storage-device-crud.type';
import { DeviceDiscoveryScanOp } from '../device-discovery-scan-op.type';

@Injectable()
export class DeviceDiscoveryStorageService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getStorageDevices(): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.get<DeviceDiscoveryScanOp[]>(DEVICE_DISCOVERY_SCAN_OP(DeviceMapping.STORAGE_DEVICES));
  }

  getDropdownData() {
    const manufacturers = this.http.get<StorageCRUDManufacturer[]>(STORAGE_MANUFACTURERS());
    const operatingSystems = this.http.get<StorageDeviceCRUDOperatingSystem[]>(STORAGE_DEVICE_OS());
    const privateClouds = this.http.get<PrivateClouds[]>(PRIVATE_CLOUDS(), { params: new HttpParams().set('page_size', '0') });
    const cabinets = this.http.get<CabinetFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.CABINET_VIZ));
    return forkJoin([operatingSystems, privateClouds, cabinets, manufacturers]);
  }

  getModels(manufacturer: string): Observable<Array<StorageCRUDModel>> {
    return this.http.get<Array<StorageCRUDModel>>(STORAGE_MODELS(manufacturer));
  }

  convertToViewData(ops: DeviceDiscoveryScanOp[]): DevDisStorageViewdata[] {
    let viewData: DevDisStorageViewdata[] = [];
    ops.map((op: DeviceDiscoveryScanOp, index: number) => {
      let data = new DevDisStorageViewdata();
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

      data.form = this.createStorageForm(op);
      data.formErrors = this.resetStorageDeviceFormErrors();
      data.validationMessages = this.storageDeviceFormValidationMessages;
      data.nonFieldErr = '';
      viewData.push(data);
    });
    return viewData;
  }

  createStorageForm(storage?: DeviceDiscoveryScanOp): FormGroup {
    this.resetStorageDeviceFormErrors();
    return this.builder.group({
      'unique_id': [storage.unique_id, [Validators.required, NoWhitespaceValidator]],
      'name': [storage.hostname ? storage.hostname : '', [Validators.required, NoWhitespaceValidator]],
      'manufacturer': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
      }),
      'model': this.builder.group({
        'id': ['', [Validators.required, NoWhitespaceValidator]]
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
      'observium_id': [{ value: storage.observium_id, disabled: true }]
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
    }
  }

  saveAll(data: DeviceDiscoveryStorageFormData[]): Observable<DeviceDiscoveryScanOp[]> {
    return this.http.post<DeviceDiscoveryScanOp[]>(CREATE_DEVICE_DISCOVERY_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES), data);
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

  index: number;
  isOpen: boolean;
  openEnabled: boolean;

  form: FormGroup
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string;
  models: StorageCRUDModel[];
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
}
