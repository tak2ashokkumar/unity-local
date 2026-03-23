import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class EventMgmtReportCrudService {

  constructor( private builder: FormBuilder) { }

  buildForm(events: ManageReportEventFormData){
    return this.builder.group({
      'active': ['true'],
      'duration': ['all'],
      'report_type': [events ? events.report_type : '',[Validators.required]]
    })
  }
 
  resetFormErrors() {
    return {
      'active': '',
      'duration': '',
      'report_type': '',
    };
  }

  formValidationMessages = {
    'report_type':{
      'required': 'Report type is required'
    }
  }
}

export interface ManageReportEventFormData {
  active: boolean;
  duration: string;
  report_type: string;
}