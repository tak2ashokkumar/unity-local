import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, forkJoin } from 'rxjs';
import { DB_TYPES, GET_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_EXCEL_DATA_BY_DEVICE_TYPE, SAVE_FILE_DETAILS_TO_TEMP } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DatabaseCRUDDBType } from 'src/app/united-cloud/shared/entities/database-servers-crud.type';
import { DatabaseServer } from 'src/app/united-cloud/shared/entities/database-servers.type';

@Injectable()
export class ExcelOnBoardingDatabaseService {
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  private setParams(arr: string[]) {
    let params: HttpParams = new HttpParams();
    arr.forEach(cabId => {
      params = params.append('uuid', cabId);
    });
    return params;
  }

  getDatabases(arr: string[]) {
    // return of(<ExcelOnBoardingDatabaseType[]>[
    //   {
    //     "name": "sample db",
    //     "db_type": "My SQL",
    //     "port": 22,
    //     "management_ip": "10.128.129.101",
    //     "onboarding_status": null,
    //     "unique_id": "e80920e2-dbfc-4295-8ace-3135a881e3e2"
    //   }
    // ]);
    return this.http.get<ExcelOnBoardingDatabaseType[]>(GET_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.DB_SERVER), { params: this.setParams(arr) });
  }

  getDropdownData() {
    const dbTypes = this.http.get<DatabaseCRUDDBType[]>(DB_TYPES());
    return forkJoin([dbTypes]);
  }

  converToViewdata(data: ExcelOnBoardingDatabaseType[]) {
    let viewData: ExcelOnBoardingDatabaseViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnBoardingDatabaseViewdata();
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
        'db_type': [{ value: d.db_type, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator]],
        'port': [{ value: d.port, disabled: view.onboarded }, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'management_ip': [{ value: d.management_ip, disabled: view.onboarded }, [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      });

      viewData.push(view);
    });
    return viewData;
  }

  validationMessages = {
    'name': {
      'required': 'Database name is required'
    },
    'db_type': {
      'required': 'Database type is required'
    },
    'port': {
      'required': 'Port is required',
      'min': 'Minimum value should be greater than 0'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    }
  }

  saveAll(data: ExcelOnBoardingDatabaseFormdata[]): Observable<DatabaseServer[]> {
    return this.http.post<DatabaseServer[]>(SAVE_EXCEL_DATA_BY_DEVICE_TYPE(DeviceMapping.DB_SERVER), data);
  }

  saveToTemp(data: ExcelOnBoardingDatabaseFormdata[]): Observable<DatabaseServer[]> {
    return this.http.post<DatabaseServer[]>(SAVE_FILE_DETAILS_TO_TEMP(), { device: data, device_type: 'Databases' });
  }
}

export interface ExcelOnBoardingDatabaseFormdata {
  name: string;
  db_type: number;
  port: number;
  management_ip: string;
}

export interface ExcelOnBoardingDatabaseType {
  onboarding_status: null | 'Onboarded' | 'Failed';
  name: string;
  db_type: string;
  port: number;
  management_ip: string;
  unique_id: string;

  file_name?: string;
  uuid?: string;
}

export class ExcelOnBoardingDatabaseViewdata {
  constructor() {
    this.resetFormErrors();
  }
  uniqueId: string;
  onboarded: boolean;
  onboardedClass: 'text-success' | 'text-danger' | 'text-primary';

  data: ExcelOnBoardingDatabaseType;

  form: FormGroup;

  formErrors: any;
  validationMessages: any;

  resetFormErrors() {
    this.formErrors = {
      'name': '',
      'port': '',
      'db_type': '',
      'management_ip': ''
    }
  }

  nonFieldErr: string;
}