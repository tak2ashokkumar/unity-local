import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ImportDataForm } from '../usi-import-data-crud.service';

@Injectable()
export class UsiImportSustainabilityDataService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }


  buildForm(): FormGroup {
    return this.builder.group({
      'cloud_type': ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetFormErrors(): any {
    let formErrors = {
      cloud_type: ''
    };
    return formErrors;
  }

  validationMessages = {
    cloud_type: {
      required: 'Cloud type is required',
    }
  };
}

export interface ImportSustainabilityFormData extends ImportDataForm {
  cloud_type: string;
}
