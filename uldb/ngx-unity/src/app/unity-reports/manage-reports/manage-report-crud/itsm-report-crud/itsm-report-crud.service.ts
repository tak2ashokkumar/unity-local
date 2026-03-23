import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_UUID_FOR_ITSM } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class ItsmReportCrudService {

  constructor(private builder: FormBuilder, private http: HttpClient,) { }

  getUuidForItsm(): Observable<ItsmUuidData[]> {
    return this.http.get<ItsmUuidData[]>(GET_UUID_FOR_ITSM())
  }

  buildForm(itsm: ManageReportItsmFormData, uuid: string) {
    return this.builder.group({
      'duration': [itsm ? itsm.duration : [], [Validators.required]],
      'uuid': [uuid ? uuid : [], []],
      'report_type': [itsm ? itsm.report_type : [], [Validators.required]],
    });
  }

  resetFormErrors() {
    return {
      'duration': '',
      'report_type': ''
    };
  }

  formValidationMessages = {
    'duration': {
      'required': 'Status selection is mandatory'
    },
    'report_type': {
      'required': 'ITSM Type is mandatory'
    }
  }
}

export interface ManageReportItsmFormData {
  duration: string;
  uuid: string;
  report_type: string;
}

export interface ItsmUuidData {
  'default': boolean;
  type: string;
  uuid: string;
  name: string;
}



