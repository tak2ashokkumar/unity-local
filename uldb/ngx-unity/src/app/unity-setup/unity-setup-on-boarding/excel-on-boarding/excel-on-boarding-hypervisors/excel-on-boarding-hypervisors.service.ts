import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, COLLECTOR_LIST_FOR_MANUAL_ONBOARDING, DEVICES_FAST_BY_DEVICE_TYPE, GET_EXCEL_DATA_BY_DEVICE_TYPE, HYPERVISOR_MANUFACTURERS, HYPERVISOR_MODELS, HYPERVISOR_OS, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { HypervisorCRUDManufacturer, HypervisorCRUDModel, HypervisorCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/hypervisor-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ExcelOnBoardingHypervisorsService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getHypervisors(arr: string[]) {
    // return of(<ExcelOnBoardingHypervisorType[]>[
    //   {
    // "memory_mb": 4,
    // "name": "HypTest1",
    // "num_cpus": 2,
    // "capacity_gb": 4,
    // "num_cores": 2,
    // "virtualization_type": "ESXi",
    // "onboarding_status": null,
    // "cabinet": "CabinetTest1",
    // "asset_tag": "AssetTag4",
    // "management_ip": "192.168.0.1",
    // "position": 1,
    // "model": "Model1",
    // "manufacturer": "Generic",
    // "os": "Windows 8.1",
    // "private_cloud": "G3KVMLAB1",
    // "size": 2
    // }
    // ]);
    return this.http.get<ExcelOnBoardingHypervisorType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR), { params: this.setParams(arr) });
  }

  getDropdownData() {
    const manufacturers = this.http.get<HypervisorCRUDManufacturer[]>(HYPERVISOR_MANUFACTURERS());
    const operatingSystems = this.http.get<HypervisorCRUDOperatingSystem[]>(HYPERVISOR_OS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const collectors = this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
    return forkJoin([manufacturers, operatingSystems, dc , collectors]);
  }

  getModels(manufacturer: string) {
    return this.http.get<Array<HypervisorCRUDModel>>(HYPERVISOR_MODELS(manufacturer)).pipe(map((res: any) => {
      return new Map<string, Array<HypervisorCRUDModel>>().set(manufacturer, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, Array<HypervisorCRUDModel>>().set(manufacturer, []));
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

  converToViewdata(data: ExcelOnBoardingHypervisorType[]) {
    let viewData: ExcelOnBoardingHypervisorViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingHypervisorViewdata();
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
        'model': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'datacenter': this.builder.group({
          'uuid': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'collector': this.builder.group({
          'uuid': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'cabinet': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [NoWhitespaceValidator]]
        }),
        'position': [{ value: d.position, disabled: view.onboarded }, [Validators.min(0), NoWhitespaceValidator]],
        'size': [{ value: d.size, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'management_ip': [{ value: d.management_ip, disabled: view.onboarded }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'asset_tag': [{ value: d.asset_tag, disabled: view.onboarded }, [NoWhitespaceValidator]],
        'manufacturer': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'os': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        }),
        'num_cpus': [{ value: d.num_cpus, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'num_cores': [{ value: d.num_cores, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'memory_mb': [{ value: d.memory_mb, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'capacity_gb': [{ value: d.capacity_gb, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'private_cloud': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [NoWhitespaceValidator]],
        }),
        'virtualization_type': [{ value: d.virtualization_type, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'snmp_ip': [{ value: d.snmp_ip, disabled: view.onboarded }, [NoWhitespaceValidator]],
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
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
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
    'cabinet': {
      'id': {
        'required': 'Cabinet is required'
      }
    },
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  saveAll(data: ExcelOnBoardingHypervisorFormdata[]): Observable<ExcelOnBoardingHypervisorType[]> {
    return this.http.post<ExcelOnBoardingHypervisorType[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR), data);
  }

  saveToTemp(data: ExcelOnBoardingHypervisorFormdata[]): Observable<ExcelOnBoardingHypervisorType[]> {
    return this.http.post<ExcelOnBoardingHypervisorType[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Hypervisors' });
  }
}

export interface ExcelOnBoardingHypervisorFormdata {
  name: string;
  manufacturer: string;
  model: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  position: number;
  size: number;
  management_ip: string;
  asset_tag: string;
  cloud: PrivateCLoudFast[];
  snmp_ip: string;
}

export interface ExcelOnBoardingHypervisorType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  memory_mb: number;
  name: string;
  unique_id: string;
  num_cpus: number;
  capacity_gb: number;
  num_cores: number;
  virtualization_type: string;
  datacenter: string;
  collector: string;
  cabinet: string;
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

export class ExcelOnBoardingHypervisorViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  selectedManufacturerId: string;
  selectedModelId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingHypervisorType;

  models: HypervisorCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
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
      'collector': {
        'uuid': ''
      },
      'cabinet': {
        'id': ''
      },
      'asset_tag': '',
      'management_ip': ''
    }
  }

  nonFieldErr: string;
}