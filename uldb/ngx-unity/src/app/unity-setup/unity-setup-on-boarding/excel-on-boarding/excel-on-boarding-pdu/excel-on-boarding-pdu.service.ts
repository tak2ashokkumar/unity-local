import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { COLLECTOR_LIST_FOR_MANUAL_ONBOARDING, DEVICE_MODELS, FIREWALL_CABINETS, GET_EXCEL_DATA_BY_DEVICE_TYPE, PDU_MANUFACTURERS, PDU_MODELS, PDU_POWER_CIRCUITS, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PDUCRUDCabinet, PDUCRUDManufacturer, PDUCRUDModel, PDUCRUDPowerCircuit } from 'src/app/shared/pdu-crud/pdu-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class ExcelOnBoardingPduService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getPDUs(arr: string[]) {
    // return of(<ExcelOnBoardingPDUType[]>[
    //   {
    //   {
    //     "power_circuit": "1177 (208W/30A)",
    //     "pdu_type": "VERTICAL",
    //     "name": "PDUTest1",
    //     "pdu_model": "AP7802",
    //     "onboarding_status": null,
    //     "cabinet": "CabinetTest1",
    //     "asset_tag": "AssetTag1",
    //     "position": "D",
    //     "ip_address": "192.168.0.1",
    //     "sockets": 21,
    //     "size": 2
    // }
    // ]);
    return this.http.get<ExcelOnBoardingPDUType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.PDU), { params: this.setParams(arr) });
  }

  getDropdownData() {
    const manufacturers = this.http.get<PDUCRUDManufacturer[]>(PDU_MANUFACTURERS());
    // const models = this.http.get<PDUCRUDModel[]>(PDU_MODELS());
    const cabinets = this.http.get<PDUCRUDCabinet[]>(FIREWALL_CABINETS());
    const pc = this.http.get<PDUCRUDPowerCircuit[]>(PDU_POWER_CIRCUITS());
    const collectors = this.http.get<DeviceDiscoveryAgentConfigurationType[]>(COLLECTOR_LIST_FOR_MANUAL_ONBOARDING());
    return forkJoin([manufacturers, cabinets, pc , collectors]);
  }

  getModels(manufacturer: string) {
    return this.http.get<PDUCRUDModel[]>(DEVICE_MODELS(DeviceMapping.PDU, manufacturer)).pipe(map((res: any) => {
      return new Map<string, PDUCRUDModel[]>().set(manufacturer, res);
    }), catchError((error: HttpErrorResponse) => {
      return of(new Map<string, PDUCRUDModel[]>().set(manufacturer, []));
    }));
  }

  converToViewdata(data: ExcelOnBoardingPDUType[]) {
    let viewData: ExcelOnBoardingPDUViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingPDUViewdata();
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
        'asset_tag': [{ value: d.asset_tag, disabled: view.onboarded }, [NoWhitespaceValidator]],
        'manufacturer': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'model': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'collector': this.builder.group({
          'uuid': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'pdu_type': [{ value: d.pdu_type, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'cabinet': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]]
        }),
        'power_circuit': this.builder.group({
          'id': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        }),
        'position': [{ value: d.position, disabled: view.onboarded }, [Validators.min(0), NoWhitespaceValidator]],
        'size': [{ value: d.size, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'sockets': [{ value: d.sockets, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'management_ip': [{ value: d.ip_address, disabled: view.onboarded }, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'snmp_ip': [{ value: d.snmp_ip, disabled: view.onboarded }, [NoWhitespaceValidator]],
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'name': {
      'required': 'PDU name is required'
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
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
    'pdu_type': {
      'required': 'PDU Type is required'
    },
    'cabinet': {
      'id': {
        'required': 'Cabinet is required'
      }
    },
    'power_circuit': {
      'id': {
        'required': 'Power Circuit is required'
      }
    },
    'position': {
      'required': 'Position is required',
      'min': 'Minimum value should be greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'sockets': {
      'required': 'Number of Sockets are required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  saveAll(data: ExcelOnBoardingPDUFormdata[]): Observable<ExcelOnBoardingPDUType[]> {
    return this.http.post<ExcelOnBoardingPDUType[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.PDU), data);
  }

  saveToTemp(data: ExcelOnBoardingPDUFormdata[]): Observable<ExcelOnBoardingPDUType[]> {
    return this.http.post<ExcelOnBoardingPDUType[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'PDUs' });
  }
}

export interface ExcelOnBoardingPDUFormdata {
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

export interface ExcelOnBoardingPDUType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  power_circuit: string;
  pdu_type: string;
  name: string;
  unique_id: string;
  manufacturer: string;
  model: string;
  collector: string;
  cabinet: string;
  asset_tag: string;
  position: string;
  ip_address: string;
  sockets: number;
  size: number;
  file_name?: string;
  uuid?: string;
  snmp_ip: string;
}

export class ExcelOnBoardingPDUViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  selectedManufacturerId: string;
  selectedModelId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingPDUType;

  models: PDUCRUDModel[];

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
      'name': '',
      'asset_tag': '',
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
      'collector': {
        'uuid': ''
      },
      'pdu_type': '',
      'cabinet': {
        'id': ''
      },
      'power_circuit': {
        'id': ''
      },
      'position': '',
      'size': '',
      'sockets': '',
      'management_ip': '',
    }
  }

  nonFieldErr: string;
}