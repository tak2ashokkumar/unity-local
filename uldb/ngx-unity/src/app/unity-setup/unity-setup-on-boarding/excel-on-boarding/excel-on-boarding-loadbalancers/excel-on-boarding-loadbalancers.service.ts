import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, COLLECTOR_LIST_FOR_MANUAL_ONBOARDING, DEVICES_FAST_BY_DEVICE_TYPE, GET_EXCEL_DATA_BY_DEVICE_TYPE, LOAD_BALANCER_MANUFACTURERS, LOAD_BALANCER_MODELS, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { LoadBalancerCRUDManufacturer, LoadBalancerCRUDModel } from 'src/app/united-cloud/shared/entities/loadbalancer-crud.type';
import { LoadBalancer } from 'src/app/united-cloud/shared/entities/loadbalancer.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ExcelOnBoardingLoadbalancersService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getLoadbalancers(arr: string[]) {
    // return of(<ExcelOnBoardingLoadbalancerType[]>[
    //   {
    //     "name": "LBTest1",
    //     "cabinet": "CabinetTest1",
    //     "asset_tag": "AssetTag1",
    //     "management_ip": "192.168.0.1",
    //     "position": 2,
    //     "model": "F5-BIG-LTM-2000S",
    //     "manufacturer": "Intel",
    //     "onboarding_status": null,
    //     "cloud": "credit",
    //     "size": 2
    // }
    // ]);
    return this.http.get<ExcelOnBoardingLoadbalancerType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER), { params: this.setParams(arr) });
  }

  getDropdownData() {
    const manufacturers = this.http.get<LoadBalancerCRUDManufacturer[]>(LOAD_BALANCER_MANUFACTURERS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const collectors = this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
    return forkJoin([manufacturers,dc,collectors]);
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
    return this.http.get<Array<LoadBalancerCRUDModel>>(LOAD_BALANCER_MODELS(manufacturer)).pipe(map((res: any) => {
      return new Map<string, Array<LoadBalancerCRUDModel>>().set(manufacturer, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, Array<LoadBalancerCRUDModel>>().set(manufacturer, []));
    }));
  }

  converToViewdata(data: ExcelOnBoardingLoadbalancerType[]) {
    let viewData: ExcelOnBoardingLoadbalancerViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingLoadbalancerViewdata();
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
        'manufacturer': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
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
        'cloud': [{ value: [], disabled: view.onboarded }],
        'snmp_ip': [{ value: d.snmp_ip, disabled: view.onboarded }, [NoWhitespaceValidator]],
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'name': {
      'required': 'Loadbalancer name is required'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
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
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  saveAll(data: ExcelOnBoardingLoadbalancerFormdata[]): Observable<LoadBalancer[]> {
    return this.http.post<LoadBalancer[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.LOAD_BALANCER), data);
  }

  saveToTemp(data: ExcelOnBoardingLoadbalancerFormdata[]): Observable<LoadBalancer[]> {
    return this.http.post<LoadBalancer[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Load_Balancers' });
  }
}

export interface ExcelOnBoardingLoadbalancerFormdata {
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

export interface ExcelOnBoardingLoadbalancerType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  name: string;
  datacenter: string;
  collector: string;
  cabinet: string;
  asset_tag: string;
  unique_id: string;
  management_ip: string;
  position: number;
  model: string;
  manufacturer: string;
  cloud: string;
  size: number;
  file_name?: string;
  uuid?: string;
  snmp_ip: string;
}

export class ExcelOnBoardingLoadbalancerViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  selectedManufacturerId: string;
  selectedModelId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingLoadbalancerType;

  models: LoadBalancerCRUDModel[];
  cabinets: CabinetFast[];
  clouds: DeviceCRUDPrivateCloudFast[];

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
      'name': '',
      'manufacturer': '',
      'model': {
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
      'position': '',
      'size': '',
      'management_ip': '',
      'asset_tag': '',
    }
  }

  nonFieldErr: string;
}