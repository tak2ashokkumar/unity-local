import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable({
  providedIn: 'root'
})
export class UsfSoftwareService {
  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  form: FormGroup;

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilService: AppUtilityService) { }

  createForm(d: any) {
    this.buildForm(d)
  }

  submit() {
    this.submitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  buildForm(obj?: any) {
    if (obj) {
      this.form = this.builder.group({
        'software_type': [obj.software_type, [Validators.required]],
        'software_application': [obj.software_application, [Validators.required]],
        'software_technology_type': [obj.software_technology_type, [Validators.required]],
        'software_product_edition': [obj.software_product_edition, [Validators.required]],
        'software_metrics_type': [obj.software_metrics_type, [Validators.required]],
        'software_metrics_unit': [obj.software_metrics_unit, [Validators.required]],
        'software_rate_value': [obj.software_rate_value, [Validators.required]],
        'software_rate_frequency': [obj.software_rate_frequency, [Validators.required]],
        'software_support_type': [obj.software_support_type, [Validators.required]]
      });
    } else {
      this.form = this.builder.group({        
        'software_type': ['', [Validators.required]],
        'software_application': [null, [Validators.required]],
        'software_technology_type': ['', [Validators.required]],
        'software_product_edition': ['', [Validators.required]],
        'software_metrics_type': ['', [Validators.required]],
        'software_metrics_unit': [null, [Validators.required]],
        'software_rate_value': [null, [Validators.required]],
        'software_rate_frequency': ['', [Validators.required]],
        'software_support_type': ['', [Validators.required]]      
      });
    }
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  getFormValue() {
    return this.form.getRawValue();
  }

  resetFormErrors() {
    return {
      'software_type': '',
      'software_application': '',
      'software_technology_type': '',
      'software_product_edition': '',
      'software_metrics_type': '',
      'software_metrics_unit': '',
      'software_rate_value': '',
      'software_rate_frequency': '',
      'software_support_type': '',
    }
  }

  formValidationMessages = {
    'software_type': {
      'required': 'Software Type is required',
    },
    'software_application': {
      'required': ' Applications/Services is required',
    },
    'software_technology_type': {
      'required': ' Technology Type is required',
    },
    'software_product_edition': {
      'required': ' Product Edition is required',
    },
    'software_metrics_type': {
      'required': ' Metrics Type is required',
    },
    'software_metrics_unit': {
      'required': ' Metrics Unit is required',
    },
    'software_rate_value': {
      'required': ' Rate Value is required',
    },
    'software_rate_frequency': {
      'required': ' Rate Frequency is required',
    },
    'software_support_type': {
      'required': ' Support Type is required',
    },
  }

}

export const SoftwareTypes = ['Middleware', 'Database', 'Operating System', 'Security software'];
export const TechnologyTypes = ['OpenStack','PostgreSQL','HTTP Server','OpenShift','Jenkins','Big-IP','Microsoft 365','Azure Sentinel'];
export const ProductEditions = ['Premium', 'Standard', 'Basic', 'Enterprise'];
export const MetricsTypes = ['GB', 'Count', 'Users'];
export const RateFrequencies = ['Hourly','Daily','Monthly','Job Run','Session'];
export const SupportTypes = ['Basic','Enterprise'];