import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, COLLECTOR_LIST_FOR_MANUAL_ONBOARDING, DEVICES_FAST_BY_DEVICE_TYPE, GET_EXCEL_DATA_BY_DEVICE_TYPE, PRIVATE_CLOUD_FAST_BY_DC_ID, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP, SWITCH_MANUFACTURERS, SWITCH_MODELS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { SwitchCRUDManufacturer, SwitchCRUDModel } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { Switch } from 'src/app/united-cloud/shared/entities/switch.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ExcelOnBoardingSwitchesService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getSwitches(arr: string[]) {
    // return of(<ExcelOnBoardingSwitchType[]>[
    //   {
    //     "name": "FirewallTest1",
    //     "cabinet": "CabinetTest1",
    //     "asset_tag": "AsesetTag1",
    //     "management_ip": "192.168.0.1",
    //     "position": 3,
    //     "model": "ASA 5506-K9",
    //     "manufacturer": "Cisco",
    //     "onboarding_status": null,
    //     "cloud": "Test1",
    //     "size": 2
    //   }
    // ]);
    return this.http.get<ExcelOnBoardingSwitchType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.SWITCHES), { params: this.setParams(arr) });
  }

  getDropdownData() {
    const manufacturers = this.http.get<SwitchCRUDManufacturer[]>(SWITCH_MANUFACTURERS());
    const dc = this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
    const collectors = this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
    return forkJoin([manufacturers, dc,collectors]);
  }

  getModels(manufacturer: string) {
    return this.http.get<Array<SwitchCRUDModel>>(SWITCH_MODELS(manufacturer)).pipe(map((res: any) => {
      return new Map<string, Array<SwitchCRUDModel>>().set(manufacturer, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, Array<SwitchCRUDModel>>().set(manufacturer, []));
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

  converToViewdata(data: ExcelOnBoardingSwitchType[]) {
    let viewData: ExcelOnBoardingSwitchViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingSwitchViewdata();
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
      'required': 'Switch name is required'
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

  saveAll(data: ExcelOnBoardingSwitchFormdata[]): Observable<Switch[]> {
    return this.http.post<Switch[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.SWITCHES), data);
  }

  saveToTemp(data: ExcelOnBoardingSwitchFormdata[]): Observable<Switch[]> {
    return this.http.post<Switch[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Switches' });
  }
}

export interface ExcelOnBoardingSwitchFormdata {
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

export interface ExcelOnBoardingSwitchType {
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
  cloud: string;
  size: number;
  file_name?: string;
  uuid?: string;
  snmp_ip: string;
}

export class ExcelOnBoardingSwitchViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  selectedManufacturerId: string;
  selectedModelId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingSwitchType;

  models: SwitchCRUDModel[];
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