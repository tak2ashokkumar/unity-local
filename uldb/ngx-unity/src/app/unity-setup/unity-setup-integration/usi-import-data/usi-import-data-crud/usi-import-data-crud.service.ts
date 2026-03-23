import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ImportSustainabilityFormData } from './usi-import-sustainability-data/usi-import-sustainability-data.service';
import { ImportSustainabilityAwsFormData } from './usi-import-sustainability-data/usi-import-aws-data/usi-import-aws-data.service';
import { UPLOAD_IMPORT_AWS_DATA_FILE } from 'src/app/shared/api-endpoint.const';


@Injectable()
export class UsiImportDataCrudService {
  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private invalidAnnouncedSource = new Subject<string>();
  invalidAnnounced$ = this.invalidAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService) { }

  annouceSubmit() {
    this.submitAnnouncedSource.next();
  }

  annouceInvalid() {
    this.invalidAnnouncedSource.next();
  }

  announceHandleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  buildForm(): FormGroup {
    return this.builder.group({
      'platform': ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetFormErrors(): any {
    let formErrors = {
      platform: ''
    };
    return formErrors;
  }

  validationMessages = {
    platform: {
      required: 'Platform type is required',
    }
  };

  private converToAwsFormData(data: ImportSustainabilityAwsFormData, formData: FormData): FormData {
    formData.append('account_name', data.account_name);
    if (data.new_account_name) {
      formData.append('new_account_name', data.new_account_name);
    }
    formData.append('account_id', data.account_id);
    if (data.new_account_id) {
      formData.append('new_account_id', data.new_account_id);
    }
    formData.append('description', data.description);
    formData.append('aws_file', data.aws_file);
    formData.append('api_endpoint', UPLOAD_IMPORT_AWS_DATA_FILE());
    return formData;
  }

  private convertToSustainabilityFormData(data: ImportSustainabilityFormData, formData: FormData): FormData {
    formData.append('cloud_type', data.cloud_type);
    if (data.cloud_type == 'AWS') {
      formData = this.converToAwsFormData(<ImportSustainabilityAwsFormData>data, formData);
    } else if (data.cloud_type == 'GCP') {
      //future implmentation
    }
    return formData;
  }

  convertToFormData(data: ImportDataForm) {
    let formData = new FormData();
    formData.append('platform', data.platform);
    if (data.platform == 'sustainability') {
      formData = this.convertToSustainabilityFormData(<ImportSustainabilityFormData>data, formData);
    } else if (data.platform == 'aiops') {
      //future implmentation
    }
    return formData;
  }

  submitFormData(formData: FormData) {
    let url = formData.get('api_endpoint');
    formData.delete('api_endpoint');
    return this.http.post(url.toString(), formData);
  }
}

export interface ImportDataForm {
  platform: string;
}