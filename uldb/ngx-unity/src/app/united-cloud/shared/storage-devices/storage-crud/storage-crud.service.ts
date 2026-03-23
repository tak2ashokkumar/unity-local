import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, PRIVATE_CLOUD_FAST_BY_DC_ID, STORAGE_DEVICE_DELETE, STORAGE_DEVICE_OS, STORAGE_DEVICE_UPDATE, STORAGE_MANUFACTURERS, STORAGE_MODELS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DevicesCrudMonitoringService } from '../../devices-crud-monitoring/devices-crud-monitoring.service';
import { SNMPCrudTypeClass } from '../../entities/snmp-crud.type';
import { StorageCRUDManufacturer, StorageCRUDModel, StorageDeviceCRUDOperatingSystem } from '../../entities/storage-device-crud.type';
import { StorageDevice } from '../../entities/storage-device.type';

@Injectable()
export class StorageCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder, private http: HttpClient,
    private snmpCrudSvc: DevicesCrudMonitoringService,
    private userInfo: UserInfoService) { }

  addOrEditStorage(deviceId: string) {
    this.addOrEditAnnouncedSource.next(deviceId);
  }

  deleteStorage(deviceId: string) {
    this.deleteAnnouncedSource.next(deviceId);
  }

  getManufacturers() {
    return this.http.get<StorageCRUDManufacturer[]>(STORAGE_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<Array<StorageCRUDModel>> {
    return this.http.get<Array<StorageCRUDModel>>(STORAGE_MODELS(manufacturer));
  }

  getOperatingSystem() {
    return this.http.get<StorageDeviceCRUDOperatingSystem[]>(STORAGE_DEVICE_OS());
  }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  createStorageDevice(data: StorageCRUDFormData): Observable<StorageDevice[]> {
    return this.http.post<StorageDevice[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES), data);
  }

  updateStorageDevice(data: StorageCRUDFormData, uuid: string): Observable<StorageDevice[]> {
    return this.http.put<StorageDevice[]>(STORAGE_DEVICE_UPDATE(uuid), data);
  }

  deleteStorageDevice(storageDeviceId: string): Observable<any> {
    return this.http.delete(STORAGE_DEVICE_DELETE(storageDeviceId));
  }

  createStorageDeviceForm(storageDeviceId?: string): Observable<FormGroup> {
    if (storageDeviceId) {
      return this.http.get<StorageDevice>(STORAGE_DEVICE_UPDATE(storageDeviceId)).pipe(
        map(sd => {
          let form = this.builder.group({
            'name': [sd.name, [Validators.required, NoWhitespaceValidator]],
            'management_ip': [sd.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'manufacturer': this.builder.group({
              'id': [sd.manufacturer ? sd.manufacturer.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'model': this.builder.group({
              'id': [sd.model ? sd.model.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'os': this.builder.group({
              'id': [sd.os ? sd.os.id : '', [Validators.required, NoWhitespaceValidator]],
            }),
            'datacenter': this.builder.group({
              'uuid': [sd.datacenter ? sd.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'cabinet': this.builder.group({
              'id': [sd.cabinet ? sd.cabinet.id : '', [NoWhitespaceValidator]]
            }),
            'private_cloud': this.builder.group({
              'id': [sd.private_cloud ? sd.private_cloud.id : '', [NoWhitespaceValidator]]
            }),
            'position': [{ value: sd.cabinet ? sd.position : '', disabled: sd.cabinet ? false : true }, [Validators.min(0), NoWhitespaceValidator]],
            'size': [sd.size, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'asset_tag': [sd.asset_tag, [NoWhitespaceValidator]],
            'tags': [sd.tags.filter(tg => tg)],
            'custom_attribute_data': [sd.custom_attribute_data],
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [sd.collector ? sd.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          this.snmpCrudSvc.addOrEdit(sd);
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],

        'manufacturer': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]],
        }),
        'model': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'os': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]],
        }),
        'datacenter': this.builder.group({
          'uuid': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'cabinet': this.builder.group({
          'id': ['', [NoWhitespaceValidator]]
        }),
        'private_cloud': this.builder.group({
          'id': ['', [NoWhitespaceValidator]]
        }),
        'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
        'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'asset_tag': ['', [NoWhitespaceValidator]],
        'tags': [[]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        this.snmpCrudSvc.addOrEdit(null);
        return form;
      }));
    }
  }

  resetStorageDeviceFormErrors() {
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
      'datacenter': {
        'uuid': ''
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
      'collector': {
        'uuid': ''
      }
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
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }
}

export class StorageCRUDFormData extends SNMPCrudTypeClass {
  name: string;
  private_cloud: {
    id: string;
  }
  manufacturer: {
    id: string;
  }
  model: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  position: number;
  size: number;
  os: {
    id: string;
  }
  management_ip: string;
  collector: {
    uuid: string;
  };
  asset_tag: string;
}
