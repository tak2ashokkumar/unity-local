import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of } from 'rxjs';
import { GET_DATA_CENTER_EXCEL_DATA, SAVE_DATA_CENTER_EXCEL_DATA, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';

@Injectable()
export class ExcelOnBoardingDataCentersService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getDCs(arr: string[]) {
    // return of(<ExcelOnBoardingDCType[]>[
    //   {
    //     "name": "DatacentreTest1",
    //     "onboarding_status": null,
    //   }
    // ]);
    return this.http.get<ExcelOnBoardingDCType[]>(GET_DATA_CENTER_EXCEL_DATA(), { params: this.setParams(arr) });
  }


  converToViewdata(data: ExcelOnBoardingDCType[]) {
    let viewData: ExcelOnBoardingDCViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingDCViewdata();
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
        'searchlocation': [{ value: '', disabled: view.onboarded }, [Validators.required]],
        'location': ['', [RxwebValidators.compare({ fieldName: 'searchlocation' })]],
        'lat': ['', RxwebValidators.required({
          conditionalExpression: (x: any) =>
            x.location && x.lat == '' && x.long == ''
        })],
        'long': ['']
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'searchlocation': {
      'required': 'Location is required',
    },
    'location': {
      'compare': 'Please select a valid location'
    },
    'lat': {
      'required': 'Please select a valid location'
    },
    'long': {
    }
  }

  saveAll(data: ExcelOnBoardingDCFormdata[]): Observable<DataCenter[]> {
    return this.http.post<DataCenter[]>(SAVE_DATA_CENTER_EXCEL_DATA(), data);
  }

  saveToTemp(data: ExcelOnBoardingDCFormdata[]): Observable<DataCenter[]> {
    return this.http.post<DataCenter[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Datacenters' });
  }
}

export interface ExcelOnBoardingDCFormdata {
  name: string;
  location: string
  lat: string;
  long: string;
}

export interface ExcelOnBoardingDCType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  name: string;
  location: string;
  file_name?: string;
  uuid?: string;
  unique_id: string;
}

export class ExcelOnBoardingDCViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingDCType;

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
      'name': '',
      'searchlocation': '',
      'location': '',
      'lat': '',
      'long': ''
    }
  }

  nonFieldErr: string;
}