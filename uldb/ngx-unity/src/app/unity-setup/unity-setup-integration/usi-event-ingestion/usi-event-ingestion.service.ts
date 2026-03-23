import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UsiEventIngestionService {

  constructor(private builder: FormBuilder) { }

  buildPayloadForm(): FormGroup {
    return this.builder.group({
      'payload': ['', [Validators.required]],
      'response': ['']
    });
  }

  resetPaylodFormErrors() {
    return {
      'payload': '',
      'response': ''
    }
  }

  payloadValidationMessages = {
    'payload': {
      'required': 'Payload is required'
    }
  }
}
