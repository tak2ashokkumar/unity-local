import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GET_REPORTING_CLOUD_NAMES_BY_CLOUD_TYPE } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class PrivateCloudReportCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private router: Router) { }

  getCloudNames(clouds: string[]) {
    let params: HttpParams = new HttpParams();
    clouds.forEach(cloud => {
      params = params.append('cloud', cloud);
    });
    return this.http.get<ReportPrivateCloudNamesType[]>(GET_REPORTING_CLOUD_NAMES_BY_CLOUD_TYPE(), { params: params });
  }

  buildForm(privateCloud: ManageReportPrivateCloudFormData) {
    return this.builder.group({
      'cloudType': ['private', [Validators.required]],
      'cloud': [privateCloud ? privateCloud.cloud : [], [Validators.required]],
      'cloudName': [privateCloud ? privateCloud.cloudName : [], [Validators.required]],
      'report_url': [this.router.url]
    });
  }

  resetFormErrors() {
    return {
      'cloudType': '',
      'cloud': '',
      'cloudName': ''
    };
  }

  formValidationMessages = {
    'cloudType': {
      'required': 'Cloud type is required'
    },
    'cloud': {
      'required': 'Select atleast one cloud'
    },
    'cloudName': {
      'required': 'Select atleast one cloud name'
    }
  }
}

/**
 * Dropdown data related classes
 */
export class ReportPrivateCloudNamesType {
  constructor() { }
  name: string;
  uuid: string;
  platform_type: string;
}

export interface ManageReportPrivateCloudFormData {
  cloudType: string[];
  cloud: string[];
  cloudName: string;
  report_url: string;
}