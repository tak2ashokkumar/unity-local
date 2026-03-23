import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Injectable()
export class UsffComputeService {

  private computeSubmitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.computeSubmitAnnouncedSource.asObservable();

  form: FormGroup;

  constructor(private builder: FormBuilder) { }

  submit() {
    this.computeSubmitAnnouncedSource.next();
  }

  buildForm(data: any): FormGroup {
    return this.builder.group({
      'compute': this.builder.array([
        this.builder.group({
          'device': ['', [Validators.required]],
          'status': ['']
        })
      ])
    })
  }

  resetFormErrors() {
    return {
      'compute': [this.resetComputeFormErrors()]
    }
  }

  resetComputeFormErrors() {
    return {
      'device': '',
      'status': ''
    }
  }

  validationMessages = {
    'compute': {
      'device': {
        'required': 'Device is required.'
      }
    }
  }

  updateForm(form: FormGroup) {
    this.form = form;
  }

  getForm(): FormGroup {
    return this.form
  }
}
