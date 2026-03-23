import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, COLLECTOR_LIST_FOR_MANUAL_ONBOARDING, DEVICES_FAST_BY_DEVICE_TYPE, GET_EXCEL_DATA_BY_DEVICE_TYPE, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP, STORAGE_DEVICE_OS, STORAGE_MANUFACTURERS, STORAGE_MODELS } from 'src/app/shared/api-endpoint.const';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { StorageCRUDManufacturer, StorageCRUDModel, StorageDeviceCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/storage-device-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ExcelOnBoardingStorageService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getStorages(arr: string[]) {
    // return of(<ExcelOnBoardingStorageType[]>[
    //   {
    //     "name": "StorageTest1",
    //     "onboarding_status": null,
    //     "cabinet": "1z",
    //     "asset_tag": "AssetTag5",
    //     "management_ip": "192.168.0.1",
    //     "position": 1,
    //     "model": "Storage name1",
    //     "manufacturer": "storage manufacturer 3",
    //     "os": "CentOS",
    //     "private_cloud": "hyperv",
    //     "size": 1
    //   }
    // ]);
    return this.http.get<ExcelOnBoardingStorageType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES), { params: this.setParams(arr) });
  }

  getDropdownData() {
    const manufacturers = this.http.get<StorageCRUDManufacturer[]>(STORAGE_MANUFACTURERS());
    const operatingSystems = this.http.get<StorageDeviceCRUDOperatingSystem[]>(STORAGE_DEVICE_OS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const collectors = this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
    return forkJoin([manufacturers, operatingSystems, dc , collectors]);
  }

  getModels(manufacturer: string) {
    return this.http.get<Array<StorageCRUDModel>>(STORAGE_MODELS(manufacturer)).pipe(map((res: any) => {
      return new Map<string, Array<StorageCRUDModel>>().set(manufacturer, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, Array<StorageCRUDModel>>().set(manufacturer, []));
    }));
  }

  getCabinets(dcId: string): Observable<Map<string, CabinetFast[]>> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId)).pipe(map((res: any) => {
      return new Map<string, Array<CabinetFast>>().set(dcId, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, Array<CabinetFast>>().set(dcId, []));
    }));
  }

  getPrivateClouds(dcId: string): Observable<Map<string, DeviceCRUDPrivateCloudFast[]>> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId)).pipe(map((res: any) => {
      return new Map<string, Array<DeviceCRUDPrivateCloudFast>>().set(dcId, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, Array<DeviceCRUDPrivateCloudFast>>().set(dcId, []));
    }));
  }

  converToViewdata(data: ExcelOnBoardingStorageType[]) {
    let viewData: ExcelOnBoardingStorageViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingStorageViewdata();
      view.uniqueId = d.unique_id;
      view.data = d;
      view.onboarded = d.onboarding_status == 'Onboarded';
      if (d.onboarding_status == 'Onboarded') {
        view.onboardedClass = 'text-success';
      } else if (d.onboarding_status == 'Failed') {
        view.onboardedClass = 'text-danger';
      } else {
        view.onboardedClass = 'text-primary';
      }
      view.validationMessages = this.validationMessages;
      view.form = this.builder.group({
        'name': [{ value: d.name, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'unique_id': [{ value: d.unique_id, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'manufacturer': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'model': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'os': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        }),
        'datacenter': this.builder.group({
          'uuid': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'collector': this.builder.group({
          'uuid': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'private_cloud': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [NoWhitespaceValidator]],
        }),
        'cabinet': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [NoWhitespaceValidator]]
        }),
        'position': [{ value: d.position, disabled: view.onboarded }, [Validators.min(0), NoWhitespaceValidator]],
        'size': [{ value: d.size, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'management_ip': [{ value: d.management_ip, disabled: view.onboarded }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'asset_tag': [{ value: d.asset_tag, disabled: view.onboarded }, [NoWhitespaceValidator]],
        'snmp_ip': [{ value: d.snmp_ip, disabled: view.onboarded }, [NoWhitespaceValidator]],
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'name': {
      'required': 'Storage name is required'
    },
    'manufacturer': {
      'id': {
        'required': 'Manufacturer is required'
      }
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
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
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  saveAll(data: ExcelOnBoardingStorageFormdata[]): Observable<StorageType[]> {
    return this.http.post<StorageType[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.STORAGE_DEVICES), data);
  }

  saveToTemp(data: ExcelOnBoardingStorageFormdata[]): Observable<StorageType[]> {
    return this.http.post<StorageType[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Storage' });
  }
}

export interface ExcelOnBoardingStorageFormdata {
  name: string;
  cabinet: {
    id: string;
  }
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
  position: number;
  size: number;
  management_ip: string;
  asset_tag: string;
  cloud: PrivateCLoudFast[];
  snmp_ip: string;
}

export interface ExcelOnBoardingStorageType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  name: string;
  datacenter: string;
  collector: string;
  cabinet: string;
  unique_id: string;
  asset_tag: string;
  management_ip: string;
  position: number;
  model: string;
  manufacturer: string;
  os: string;
  private_cloud: string;
  size: number;
  file_name?: string;
  uuid?: string;
  snmp_ip: string;
}

export class ExcelOnBoardingStorageViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  selectedManufacturerId: string;
  selectedModelId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingStorageType;

  models: StorageCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
      'name': '',
      'os': {
        'id': ''
      },
      'datacenter': {
        'uuid': ''
      },
      'collector': {
        'uuid': ''
      },
      'cabinet': {
        'id': ''
      },
      'private_cloud': {
        'id': ''
      },
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
      'position': '',
      'size': '',
      'management_ip': '',
      'asset_tag': '',
    }
  }

  nonFieldErr: string;
}