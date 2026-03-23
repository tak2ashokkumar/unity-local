import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Injectable()
export class UsffOsConfigService {

  private osSubmitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.osSubmitAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder) { }

  submit() {
    this.osSubmitAnnouncedSource.next();
  }

  buildForm(data: any): FormGroup {
    return this.builder.group({
      'os': this.builder.array([
        this.builder.group({
          'device': ['', [Validators.required]],
          'status': ['']
        })
      ])
    })
  }

  resetFormErrors() {
    return {
      'os': [this.resetComputeFormErrors()]
    }
  }

  resetComputeFormErrors() {
    return {
      'device': '',
      'status': ''
    }
  }

  validationMessages = {
    'os': {
      'device': {
        'required': 'Device is required.'
      }
    }
  }
}
