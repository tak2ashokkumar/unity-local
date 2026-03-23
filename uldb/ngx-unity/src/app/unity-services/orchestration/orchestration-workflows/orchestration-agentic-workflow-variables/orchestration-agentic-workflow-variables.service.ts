import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InputParamsType } from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationAgenticWorkflowVariablesService {

  constructor(private fb: FormBuilder) { }

  createWorkflowVarsForm(): FormGroup {
    return this.fb.group({
      variables: this.fb.array([
        // this.createWorkflowVarGroup()
      ])
    });
  }

  createWorkflowVarGroup(data?: any): FormGroup {
    return this.fb.group({
      param_name: [data?.param_name ?? '', [Validators.required, paramNameValidator]],
      param_type: [data?.param_type ?? '', Validators.required],
      default_value: [data?.default_value ?? '', Validators.required]
    });
  }


  workflowVarFormErrors() {
    return {
      'variables': []
    };
  }

  workflowVarFormValidationMessage = {
    'variables': {
      'param_name': {
        'required': 'Variabe Name is required.',
        'invalidParamName': 'Must start with a letter or underscore; only letters, numbers, and underscores allowed.'
      },
      'param_type': {
        'required': 'Variabe Type is required.'
      },
      'default_value': {
        'required': 'Default Value is required.'
      }
    }
  }

}


export function paramNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const regex = /^[A-Za-z_][A-Za-z0-9_]*$/;
  return regex.test(value) ? null : { invalidParamName: true };
}