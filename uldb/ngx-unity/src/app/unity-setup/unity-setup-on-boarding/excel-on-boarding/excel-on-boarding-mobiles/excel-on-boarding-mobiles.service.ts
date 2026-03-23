import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING, DEVICE_TAG_LIST_BY_DEVICE_TYPE, GET_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ExcelOnBoardingMobilesService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getMobiles(arr: string[]) {
    // return of(<ExcelOnBoardingMobileType[]>[
    //   {
    //     "tagged_device": "Mac 3",
    //     "name": "MBDeviceTest1",
    //     "platform": "ios",
    //     "device_type": "Smartphone",
    //     "serial_number": "TestSerialNumber",
    //     "model": "S9",
    //     "ip_address": "192.168.0.1",
    //     "onboarding_status": null
    // }
    // ]);
    return this.http.get<ExcelOnBoardingMobileType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.MOBILE_DEVICE), { params: this.setParams(arr) });
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]>{
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
  }

  getSelectedTagDevices(platform: string, search: string): Observable<Map<string, Array<ExcelMobileTagDevice>>> {
    let params = new HttpParams().set('search', search);
    if (platform == 'Android') {
      return this.http.get<Array<ExcelMobileTagDevice>>(DEVICE_TAG_LIST_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), { params: params }).pipe(map((res: any) => {
        return new Map<string, Array<ExcelMobileTagDevice>>().set(platform, res);
      }), catchError((error: HttpErrorResponse) => {
        return of(new Map<string, Array<ExcelMobileTagDevice>>().set(platform, []));
      }));
    } else if (platform == 'ios') {
      return this.http.get<Array<ExcelMobileTagDevice>>(DEVICE_TAG_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI), { params: params }).pipe(map((res: any) => {
        return new Map<string, Array<ExcelMobileTagDevice>>().set(platform, res);
      }), catchError((error: HttpErrorResponse) => {
        return of(new Map<string, Array<ExcelMobileTagDevice>>().set(platform, []));
      }));
    }
  }

  getTagDevices(platform: string, search: string): Observable<Array<ExcelMobileTagDevice>> {
    let params = new HttpParams().set('search', search);
    if (platform == 'Android') {
      return this.http.get<Array<ExcelMobileTagDevice>>(DEVICE_TAG_LIST_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), { params: params });
    } else if (platform == 'ios') {
      return this.http.get<Array<ExcelMobileTagDevice>>(DEVICE_TAG_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI), { params: params });
    }
  }


  converToViewdata(data: ExcelOnBoardingMobileType[]) {
    let viewData: ExcelOnBoardingMobilesViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingMobilesViewdata();
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
        'serial_number': [{ value: d.serial_number, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'name': [{ value: d.name, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'unique_id': [{ value: d.unique_id, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'model': [{ value: d.model ? d.model : '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'ip_address': [{ value: d.ip_address, disabled: view.onboarded }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'device_type': [{ value: d.device_type, disabled: view.onboarded }, [Validators.required]],
        'platform': [{ value: d.platform, disabled: view.onboarded }, [Validators.required]],
        'tagged_device': [{ value: [], disabled: view.onboarded }],
        'collector': this.builder.group({
          'uuid': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        // 'snmp_ip': [{ value: d.snmp_ip, disabled: view.onboarded }, [NoWhitespaceValidator]],
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'serial_number': {
      'required': 'Serial number is required'
    },
    'name': {
      'required': 'Name is required'
    },
    'model': {
      'required': 'Model is required'
    },
    'ip_address': {
      'ip': 'Invalid IP'
    },
    'device_type': {
      'required': 'Type is required'
    },
    'platform': {
      'required': 'Type is required'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
  }

  saveAll(data: ExcelOnBoardingMobileFormdata[]): Observable<ExcelOnBoardingMobileType[]> {
    return this.http.post<ExcelOnBoardingMobileType[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.MOBILE_DEVICE), data);
  }

  saveToTemp(data: ExcelOnBoardingMobileFormdata[]): Observable<ExcelOnBoardingMobileType[]> {
    return this.http.post<ExcelOnBoardingMobileType[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Mobile_Devices' });
  }
}

export interface ExcelOnBoardingMobileFormdata {
  serial_number: string,
  name: string,
  model: string,
  ip_address: string,
  device_type: string,
  platform: string
  tagged_device: ExcelMobileTagDevice;
  snmp_ip: string;
}

export interface ExcelOnBoardingMobileType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  tagged_device: string;
  name: string;
  unique_id: string;
  platform: string;
  device_type: string;
  serial_number: string;
  model: string;
  ip_address: string;
  file_name?: string;
  uuid?: string;
  snmp_ip: string;
  collector: string;
}

export class ExcelOnBoardingMobilesViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  onboarded: boolean;
  tagDevices: ExcelMobileTagDevice[] = [];
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingMobileType;

  form: FormGroup;

  formErrors: any;
  validationMessages: any;
  tagDeviceErr: boolean;
  asyncSelected: string;

  resetFormErrors() {
    this.formErrors = {
      'serial_number': '',
      'name': '',
      'model': '',
      'ip_address': '',
      'device_type': '',
      'platform': '',
      'tagged_device': '',
      'collector': {
        'uuid': ''
      },
    }
  }

  nonFieldErr: string;
}
export interface ExcelMobileTagDevice {
  id: number;
  name: string;
}