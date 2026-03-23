import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UnitySetupCustomAttribute } from 'src/app/shared/SharedEntityTypes/device-custom-attributes.type';

@Injectable()
export class UnitySetupCustomAttributesCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getAttributeDetails(attrId: string): Observable<UnitySetupCustomAttribute> {
    return this.http.get<UnitySetupCustomAttribute>(`/customer/custom_attributes/${attrId}/`)
  }

  buildForm(data?: UnitySetupCustomAttribute): FormGroup {
    if (data) {
      let form = this.builder.group({
        "name": [data.name, [Validators.required, NoWhitespaceValidator]],
        "resource_type": [data.resource_type, [Validators.required, NoWhitespaceValidator]],
        "value_type": [data.value_type, [Validators.required, NoWhitespaceValidator]],
      })
      switch (data.value_type) {
        case 'Integer':
          form.addControl('default_value', new FormControl(data.default_value, [RxwebValidators.numeric({ allowDecimal: false }), NoWhitespaceValidator]));
          break;
        case 'Char':
          form.addControl('default_value', new FormControl(data.default_value, [Validators.pattern(/^[\s\S]+$/), NoWhitespaceValidator]));
          break;
        default:
          form.addControl('default_value', new FormControl(data.default_value));
      }
      if (data.choice_values?.length) {
        form.addControl('choice_values', this.builder.array(
          data.choice_values.map((v: string) => new FormControl(v, [Validators.required, NoWhitespaceValidator]))
        ))
      }
      return form;
    } else {
      let form = this.builder.group({
        "name": ['', [Validators.required, NoWhitespaceValidator]],
        "resource_type": ['', [Validators.required, NoWhitespaceValidator]],
        "value_type": ['', [Validators.required, NoWhitespaceValidator]],
        'default_value': ['']
      })
      return form;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'resource_type': '',
      'value_type': '',
      'choice_values': [],
      'default_value': ''
    };
  }

  formValidationMessages() {
    let msgs = {
      'name': {
        'required': 'Name is required'
      },
      'resource_type': {
        'required': 'Resource type is required'
      },
      'value_type': {
        'required': 'Value type is required'
      },
      'choice_values': [],
      'default_value': {
        'pattern': 'Default value should be of String type',
        'numeric': 'Default value should be of Integer type'
      }
    }
    return msgs;
  }

  save(data: any, attrId?: string) {
    if (attrId) {
      return this.http.put(`/customer/custom_attributes/${attrId}/`, data);
    } else {
      return this.http.post(`/customer/custom_attributes/`, data);
    }
  }
}
