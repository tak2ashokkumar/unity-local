import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BMServer_MANUFACTURERS, BMServer_MODELS, BMServer_OS, BMServer_PRIVATE_CLOUD_FAST, CABINET_FAST_BY_DEVICE_ID, COLLECTOR_LIST_FOR_MANUAL_ONBOARDING, DEVICES_FAST_BY_DEVICE_TYPE, GET_EXCEL_DATA_BY_DEVICE_TYPE, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { BMServerSidePlatformMapping, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BMServerCRUDManufacturer, BMServerCRUDModel, BMServerCRUDOperatingSystem, BMServerCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/bm-server-crud.type';
import { BMServer } from 'src/app/united-cloud/shared/entities/bm-server.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ExcelOnBoardingBmsService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getBms(arr: string[]) {
    // return of(<ExcelOnBoardingBmsType[]>[
    //   {
    //     "controller_type": "DRAC",
    //     "capacity": 8,
    //     "name": "BMSTest1",
    //     "cores": 2,
    //     "cpus": 2,
    //     "cabinet": "CabinetTest1",
    //     "asset_tag": "AssetTag3",
    //     "management_ip": "192.168.0.1",
    //     "memory": 8,
    //     "position": 1,
    //     "model": "Test2",
    //     "manufacturer": "Cisco",
    //     "os": "Ubuntu 12.04",
    //     "onboarding_status": null,
    //     "cloud": "credit",
    //     "size": 1
    //   }
    // ]);
    return this.http.get<ExcelOnBoardingBmsType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), { params: this.setParams(arr) });
  }

  getDropdownData() {
    const manufacturers = this.http.get<BMServerCRUDManufacturer[]>(BMServer_MANUFACTURERS());
    const operatingSystems = this.http.get<BMServerCRUDOperatingSystem[]>(BMServer_OS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const collectors = this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
    return forkJoin([manufacturers, operatingSystems, dc, collectors]);
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

  getModels(manufacturer: string) {
    return this.http.get<Array<BMServerCRUDModel>>(BMServer_MODELS(manufacturer)).pipe(map((res: any) => {
      return new Map<string, Array<BMServerCRUDModel>>().set(manufacturer, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, Array<BMServerCRUDModel>>().set(manufacturer, []));
    }));
  }

  converToViewdata(data: ExcelOnBoardingBmsType[]) {
    let viewData: ExcelOnBoardingBmsViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingBmsViewdata();
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
        'management_ip': [{ value: d.management_ip, disabled: view.onboarded }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'num_cpus': [{ value: d.num_cpus, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'num_cores': [{ value: d.num_cores, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'memory_mb': [{ value: d.memory_mb, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'capacity_gb': [{ value: d.capacity_gb, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'position': [{ value: d.position, disabled: view.onboarded }, [Validators.min(0), NoWhitespaceValidator]],
        'size': [{ value: d.size, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'asset_tag': [{ value: d.asset_tag, disabled: view.onboarded }, [NoWhitespaceValidator]],
        'bmc_type': [{ value: d.bmc_type, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'version': [{ value: d.version ? d.version : '', disabled: view.onboarded }],
        'ip': [{ value: d.ip ? d.ip : '', disabled: view.onboarded }],
        'username': [{ value: d.username ? d.username : '', disabled: view.onboarded }],
        'password': [{ value: '', disabled: view.onboarded }],
        'proxy_url': [{ value: d.proxy_url ? d.proxy_url : '', disabled: view.onboarded }],
        'snmp_ip': [{ value: d.snmp_ip ? d.snmp_ip : '', disabled: view.onboarded }],
      });
      if (view.form.get('version').value == BMServerSidePlatformMapping.DRAC) {
        view.form.get('version').enable();
      } else {
        view.form.get('version').disable();
      }
      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'name': {
      'required': 'Bare Metal Server name is required'
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

  saveAll(data: ExcelOnBoardingBmsFormdata[]): Observable<BMServer[]> {
    return this.http.post<BMServer[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), data);
  }

  saveToTemp(data: ExcelOnBoardingBmsFormdata[]): Observable<BMServer[]> {
    return this.http.post<BMServer[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Bare_Metals' });
  }
}

export interface ExcelOnBoardingBmsFormdata {
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

  version?: number;
  ip?: string;
  username?: string;
  password?: string;
  proxy_url?: string;
  snmp_ip: string;
}

export interface ExcelOnBoardingBmsType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  memory_mb: number;
  unique_id: string;
  name: string;
  num_cpus: number;
  capacity_gb: number;
  num_cores: number;
  datacenter: string;
  collector: string;
  cabinet: string;
  asset_tag: string;
  management_ip: string;
  position: number;
  bmc_type: string;
  model: string;
  manufacturer: string;
  os: string;
  private_cloud: string;
  size: number;
  file_name?: string;
  uuid?: string;
  snmp_ip: string;
  proxy_url: string;
  version: string;
  ip: string;
  username: string;
}

export class ExcelOnBoardingBmsViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  selectedManufacturerId: string;
  selectedModelId: string;
  onboarded: boolean;

  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingBmsType;

  models: BMServerCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
      'name': '',
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
      'asset_tag': '',
      'management_ip': '',
      'bmc_type': '',
      'version': '',
      'ip': '',
      'username': '',
      'password': '',
      'proxy_url': ''
    }
  }

  nonFieldErr: string;
}