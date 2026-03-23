import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from 'angular-calendar';
import { Observable } from 'rxjs';
import { DATA_CENTERS, GET_CABINET_EXCEL_DATA, SAVE_CABINET_EXCEL_DATA, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';

@Injectable()
export class ExcelOnBoardingCabinetsService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getCabinets(arr: string[]) {
    // return of(<ExcelOnBoardingCabinetType[]>[
    //   {
    //     "datacenter": "JAP",
    //     "name": "CabinetTest1",
    //     "renewal": null,
    //     "contract_end_date": "None",
    //     "cost": 100,
    //     "contract_start_date": "2020-10-03 00:00:00",
    //     "annual_escalation": 20,
    //     "model": "Standard Cab",
    //     "size": 42,
    //     "onboarding_status": null
    //   },
    //   {
    //     "datacenter": "test2",
    //     "name": "CabinetTest2",
    //     "renewal": null,
    //     "contract_end_date": "None",
    //     "cost": 100,
    //     "contract_start_date": "2020-10-03 00:00:00",
    //     "annual_escalation": 20,
    //     "model": "Standard Cab",
    //     "size": 42,
    //     "onboarding_status": null
    //   }
    // ]);
    return this.http.get<ExcelOnBoardingCabinetType[]>(GET_CABINET_EXCEL_DATA(), { params: this.setParams(arr) });
  }

  getDataCenters(): Observable<DataCenter[]> {
    return this.http.get<DataCenter[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
  }

  converToViewdata(data: ExcelOnBoardingCabinetType[]) {
    let viewData: ExcelOnBoardingCabinetViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingCabinetViewdata();
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
        'size': [{ value: d.size, disabled: view.onboarded }, [Validators.required, Validators.min(1), Validators.max(72)]],
        'model': [{ value: d.model, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'contract_start_date': [{ value: d.contract_start_date ? new Date(d.contract_start_date) : null, disabled: view.onboarded }],
        'contract_end_date': [{ value: d.contract_end_date ? new Date(d.contract_end_date) : null, disabled: view.onboarded }],
        'renewal': [{ value: d.renewal, disabled: view.onboarded }],
        'cost': [{ value: d.cost, disabled: view.onboarded }, [Validators.min(0)]],
        'datacenter': [{ value: '', disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'annual_escalation': [{ value: d.annual_escalation, disabled: view.onboarded }, [Validators.min(0), Validators.max(100)]],
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'model': {
      'required': 'Model is required'
    },
    'size': {
      'required': 'Size is required',
      'max': 'Maximum value should be less than or equal to 72',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'datacenter': {
      'required': 'Datacenter is required'
    },
    'contract_end_date': {
      'min': 'Contract end date should be after Start date'
    },
    'cost': {
      'min': 'Cost should be in positive values'
    },
    'annual_escalation': {
      'min': 'Percentage should be in positive values',
      'max': 'Percentage can be maximum of 100'
    }
  }

  saveAll(data: ExcelOnBoardingCabinetFormdata[]): Observable<ExcelOnBoardingCabinetType[]> {
    return this.http.post<ExcelOnBoardingCabinetType[]>(SAVE_CABINET_EXCEL_DATA(), data);
  }

  saveToTemp(data: ExcelOnBoardingCabinetFormdata[]): Observable<ExcelOnBoardingCabinetType[]> {
    return this.http.post<ExcelOnBoardingCabinetType[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Cabinets' });
  }
}

export interface ExcelOnBoardingCabinetFormdata {
  datacenter: string;
  name: string;
  renewal: null;
  contract_end_date: string;
  cost: number;
  contract_start_date: string;
  annual_escalation: number;
  model: string;
  size: number;
}

export interface ExcelOnBoardingCabinetType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  datacenter: string;
  unique_id: string;
  name: string;
  renewal: null;
  contract_end_date: string;
  cost: number;
  contract_start_date: string;
  annual_escalation: number;
  model: string;
  size: number;
  // type: string;
  file_name?: string;
  uuid?: string;
}

export class ExcelOnBoardingCabinetViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingCabinetType;

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
      'name': '',
      'model': '',
      'size': '',
      'datacenter': '',
      'contract_end_date': '',
      'cost': '',
      'annual_escalation': '',
    }
  }

  nonFieldErr: string;
}