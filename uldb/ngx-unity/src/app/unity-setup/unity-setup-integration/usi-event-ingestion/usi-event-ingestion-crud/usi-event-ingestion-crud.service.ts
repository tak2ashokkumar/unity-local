import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UsiAccount, UsiEventIngestionParams } from '../../unity-setup-integration.service';

@Injectable({
  providedIn: 'root'
})
export class UsiEventIngestionService {
  constructor(private builder: FormBuilder) { }

  buildEventIngestionForm(params: UsiEventIngestionParams[], data?: UsiAccount): FormGroup {
    if (data && data.event_inbound_webhook) {
      let form = this.builder.group({
        'event_inbound_api': [null],
        'event_inbound_webhook': this.builder.group({
          'method': [{ value: 'webhook', disabled: true }],
          'webhook_url': [data?.event_inbound_webhook?.webhook_url],
          'token': [data?.event_inbound_webhook?.token],
          'attribute_map': this.builder.array([]),
          'additional_attribute': this.builder.group({
            'unity_attribute': ['', Validators.required],
            'display_name': [''],
            'expression_type': ['simple'],
            'mapped_attribute_expression': [''],
            'regular_expression': [''],
            'choice_map': this.builder.array([]),
          }),
          'additional_attribute_map': this.builder.array([])
        }),
        'ticket_subject_format':[data?.ticket_subject_format],
      });
      if (!data.event_inbound_webhook.attribute_map.length) {
        if (params && params.length) {
          params.forEach(param => {
            if (param.required) {
              const attribute = this.builder.group({
                'unity_attribute': [param.name],
                'display_name': [param.display_name],
                'mapped_attribute_expression': ['', [Validators.required, NoWhitespaceValidator]],
                'expression_type': ['simple'],
                'regular_expression': [''],
                'choice_map': this.builder.array([])
              });
              let attributes = (form.get('event_inbound_webhook') as FormGroup).get('attribute_map') as FormArray;
              attributes.push(attribute);
              if (param.choices && param.choices.length) {
                param.choices.forEach(c => {
                  const choice = this.builder.group({
                    'unity_value': [c[0]],
                    'display_value': [c[1]],
                    'mapped_value': ['', [Validators.required, NoWhitespaceValidator]]//required
                  });
                  (attributes.at(attributes.length - 1).get('choice_map') as FormArray).push(choice);
                });
              }
            }
          });
        }
      }
      return form;
    } else {
      let form = this.builder.group({
        'event_inbound_api': [null],
        'event_inbound_webhook': this.builder.group({
          'method': [{ value: 'webhook', disabled: true }],
          'webhook_url': [''],
          'token': [''],
          'attribute_map': this.builder.array([]),
          'additional_attribute': this.builder.group({
            'unity_attribute': ['', Validators.required],
            'display_name': [''],
            'expression_type': ['simple'],
            'mapped_attribute_expression': [''],
            'regular_expression': [''],
            'choice_map': this.builder.array([]),
          }),
          'additional_attribute_map': this.builder.array([])
        }),
        'ticket_subject_format': [''],
      })
      if (params && params.length) {
        params.forEach(param => {
          if (param.required) {
            const attribute = this.builder.group({
              'unity_attribute': [param.name],
              'display_name': [param.display_name],
              'mapped_attribute_expression': ['', [Validators.required, NoWhitespaceValidator]],
              'expression_type': ['simple'],
              'regular_expression': [''],
              'choice_map': this.builder.array([])
            });
            let attributes = (form.get('event_inbound_webhook') as FormGroup).get('attribute_map') as FormArray;
            attributes.push(attribute);
            if (param.choices && param.choices.length) {
              param.choices.forEach(c => {
                const choice = this.builder.group({
                  'unity_value': [c[0]],
                  'display_value': [c[1]],
                  'mapped_value': ['', [Validators.required, NoWhitespaceValidator]]//required
                });
                (attributes.at(attributes.length - 1).get('choice_map') as FormArray).push(choice);
              });
            }
          }
        });
      }
      return form;
    }
  }

  resetEventIngestionFormErrors() {
    return {
      'event_inbound_webhook': {}
    }
  }

  eventIngestionValidationMessages = {
    'event_inbound_webhook': {
      'attribute_map': {
        'mapped_attribute_expression': {
          'required': 'Mapping is required'
        },
        'choice_map': {
          'mapped_value': {
            'required': 'Mapping is required'
          }
        }
      },
      'additional_attribute': {
        'unity_attribute': {
          'required': 'Attribute is required'
        },
        'mapped_attribute_expression': {
          'required': 'Mapping is required'
        },
        'choice_map': {
          'mapped_value': {
            'required': 'Mapping is required'
          }
        },
        'custom_field': {
          'required': 'Custom Attribute value is required'
        }
      },
      'additional_attribute_map': {
        'mapped_attribute_expression': {
          'required': 'Mapping is required'
        },
        'choice_map': {
          'mapped_value': {
            'required': 'Mapping is required'
          }
        },
        'custom_field': {
          'required': 'Custom Attribute value is required'
        }
      },
    }
  }

  resetAttributeErrors() {
    return {
      'mapped_attribute_expression': '',
      'choice_map': []
    };
  }

  resetAdditionalresetAttributeErrors() {
    return {
      'unity_attribute': '',
      'mapped_attribute_expression': '',
      'custom_field': '',
      'choice_map': []
    };
  }
}

export interface eventIngestionChoiceMapType {
  unity_value: string;
  mapped_value: string;
}