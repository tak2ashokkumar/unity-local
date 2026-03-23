import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UnityWorkflowTasksViewData, UnityWorkflowViewData, unityWorkflowTaskTypes } from './orchestration-workflow-crud.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { UnityWorkflowTask } from '../orchestration-workflows.type';
import { environment } from 'src/environments/environment';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationWorkflowCrudUtilsService {

  constructor(private builder: FormBuilder,) { }

  getInitialWorkflowTasks(): UnityWorkflowTask[] {
    return [
      {
        "name": "Start",
        "name_id": "start",
        "type": "Start Task",
        "category": null,
        "target_type": null,
        "task": null,
        "dependencies": [],
        "timeout": null,
        "retries": 0,
        "status": 0,
        "created_at": "",
        "updated_at": "",
        "edited_by": null,
        "created_by": null
      },
      {
        "name": "End",
        "name_id": "end",
        "type": "End Task",
        "category": null,
        "target_type": null,
        "task": null,
        "dependencies": ["start"],
        "timeout": null,
        "retries": 0,
        "status": 0,
        "created_at": "",
        "updated_at": "",
        "edited_by": null,
        "created_by": null
      }
    ]
  }

  getTaskTypeIcon(dt: UnityWorkflowTask) {
    switch (dt.type) {
      case unityWorkflowTaskTypes.INTEGRATION: return `fas fa-wrench`;
      case unityWorkflowTaskTypes.CONDITION: return `fas fa-tasks`;
      case unityWorkflowTaskTypes.WORKFLOW: return `fas fa-network-wired`;
      case unityWorkflowTaskTypes.TASK:
      case unityWorkflowTaskTypes.ANSIBLE:
      case unityWorkflowTaskTypes.TERRAFORM:
      case unityWorkflowTaskTypes.BASH:
      case unityWorkflowTaskTypes.POWERSHELL:
      case unityWorkflowTaskTypes.PYTHON:
      case unityWorkflowTaskTypes.REST_API: return `fas fa-clipboard-check`;
      default: return null;
    }
  }

  getTaskTargetImage(target: string) {
    switch (target) {
      case 'bmc-helix': return `${environment.assetsUrl}external-brand/logos/bmc-helix-logo.svg`;
      case unityWorkflowTaskTypes.ANSIBLE: return `${environment.assetsUrl}external-brand/logos/Anisble.svg`;
      case unityWorkflowTaskTypes.TERRAFORM: return `${environment.assetsUrl}external-brand/logos/Terraform.svg`;
      case unityWorkflowTaskTypes.BASH: return `${environment.assetsUrl}external-brand/logos/Bash.svg`;
      case unityWorkflowTaskTypes.POWERSHELL: return `${environment.assetsUrl}external-brand/logos/PowerShell.svg`;
      case unityWorkflowTaskTypes.PYTHON: return `${environment.assetsUrl}external-brand/logos/Python.svg`;
      case unityWorkflowTaskTypes.REST_API: return `${environment.assetsUrl}external-brand/logos/Rest_Api.svg`;
      default: return null;
    }
  }

  getSelectedNodeImage(target: string) {
    switch (target) {
      case unityWorkflowTaskTypes.SWITCH: return `${environment.assetsUrl}external-brand/logos/switch.svg`;
      case unityWorkflowTaskTypes.IF: return `${environment.assetsUrl}external-brand/logos/If_else.svg`;
      case unityWorkflowTaskTypes.EMAIL: return 'fas fa-envelope';
      case unityWorkflowTaskTypes.SOURCE: return 'fas fa-sign-in-alt';
      case unityWorkflowTaskTypes.LLM: return `${environment.assetsUrl}external-brand/logos/stars.svg`;
      case unityWorkflowTaskTypes.CHART: return 'fas fa-chart-pie';
      default: return null;
    }
  }

  convertToNameId(input: string): string {
    // Convert to lowercase
    input = input.toLowerCase()
    // Replace spaces and non - alphanumeric characters with underscores
    input = input.replace(/[^A-Z0-9]+/ig, "_");
    // Remove leading and trailing white space and line terminator characters from a string.
    input = input.trim();
    // Remove leading underscores
    input = input.replace(/^_/, '')
    // Remove trailing underscores
    input = input.replace(/_+$/, '')
    // Add 't' at the start if the string if it starts with a number
    if (input && input.match(/^\d/)) {
      input = 'task_' + input;
    }
    return input
  }

  buildWorkflowDetailsForm(d: UnityWorkflowViewData): FormGroup {
    if (d) {
      let form = this.builder.group({
        'workflow_name': [d.workflow_name, [Validators.required]],
        'description': [d.description ? d.description : ''],
        'category': [d.category, [Validators.required]],
        'target_type': [d.target_type, [Validators.required]],
      })
      if (d.target_type == 'Cloud') {
        form.addControl('cloud', new FormControl(d.cloud ? d.cloud : '', [Validators.required]));
      }
      return form;
    } else {
      return this.builder.group({
        'workflow_name': ['', [Validators.required]],
        'description': [''],
        'category': ['', [Validators.required]],
        'target_type': ['', [Validators.required]],
      })
    }
  }

  resetWorkflowDetailsFormErrors() {
    return {
      'workflow_name': '',
      'category': '',
      'target_type': '',
      'cloud': ''
    }
  }

  workflowDetailsFormValidationMessages = {
    'workflow_name': {
      'required': 'Name is required'
    },
    'category': {
      'required': 'Category is required'
    },
    'target_type': {
      'required': 'Target Type is required'
    },
    'cloud': {
      'required': 'Cloud Type is required'
    }
  }


  buildIntegrationForm(): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required]],
      'integration_type': ['bmc-helix', [Validators.required]]
    })
  }

  resetIntegrationFormErrors() {
    return {
      'name': '',
      'integration_type': ''
    }
  }

  integrationFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'integration_type': {
      'required': 'Integration Type is required'
    }
  }

  buildWorkflowForm(): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required]],
      'workflow_type': ['', [Validators.required]]
    })
  }

  resetWorkflowFormErrors() {
    return {
      'name': '',
      'workflow_type': ''
    }
  }

  workflowFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'workflow_type': {
      'required': 'Workflow Type is required'
    }
  }

  buildTaskForm(task?: UnityWorkflowTasksViewData): FormGroup {
    return this.builder.group({
      'task_category': [task ? task.category : '', [Validators.required]],
      'task': [task ? task : '', [Validators.required]]
    })
  }

  resetTaskFormErrors() {
    return {
      'task_category': '',
      'task': ''
    }
  }

  taskFormValidationMessages = {
    'task_category': {
      'required': 'Task Category is required'
    },
    'task': {
      'required': 'Task is required'
    }
  }

  buildTaskInputForm(task: UnityWorkflowTasksViewData, templates: inputTemplateType[]): FormGroup {
    // console.log('in buildTaskInputForm task : ', task)
    if (task && task.inputs && task.inputs.length) {
      let inputs = this.builder.array(
        task.inputs.map((param, i) => {
          let inp: FormGroup = this.builder.group({
            'name': [param.param_name, [Validators.required]],
            'type': [param.param_type]
            // 'value': [param.default_value, [Validators.required]],
          })
          if (param.param_type == 'Input Template') {
            let template = templates.find(t => t.uuid == param.template);
            if (template) {
              inp.addControl('template', new FormControl({ value: template.uuid, disabled: true }, [Validators.required]));
              if (param.attribute) {
                inp.addControl('attribute', new FormControl({ value: param.attribute, disabled: true }, [Validators.required]));
              }
            } else {
              inp.addControl('default_value', new FormControl('', [Validators.required]));
            }
          } else {
            inp.addControl('default_value', new FormControl(param.default_value, [Validators.required]));
          }
          return inp;
        })
      );
      return this.builder.group({
        'inputs': inputs
      });
    }
    return null;
  }

  buildTaskOutputForm(task?: UnityWorkflowTasksViewData): FormGroup {
    let form = this.builder.group({
      'name': ['outputs', [Validators.required]],
      'value': ['', [Validators.required]],
    })
    return form;
  }

  resetTaskInputFormErrors() {
    return {
      'name': '',
      'value': ''
    }
  }

  taskInputFormValidationMessages = {
    'name': {
      'required': 'key is required'
    },
    'value': {
      'required': 'value is required'
    }
  }

  buildConditionForm(sourceTask: UnityWorkflowTasksViewData, targetTask: UnityWorkflowTasksViewData, tasks: UnityWorkflowTasksViewData[], current?: UnityWorkflowTasksViewData): FormGroup {
    let conditionTasks = tasks.filter(t => t.type == unityWorkflowTaskTypes.CONDITION);
    if (current) {
      return this.builder.group({
        'name': [current.name, [Validators.required, NoWhitespaceValidator]],
        'conditions': this.builder.array(
          current.conditions.map((cdn, i) => {
            let condition: FormGroup = this.builder.group({
              'source_task': [{ value: '', disabled: true }, [Validators.required]],
              'output_parameter': [, [Validators.required]],
              'operator': ['', [Validators.required]],
              'value': ['', [Validators.required]],
              'target_task': [{ value: targetTask ? targetTask.name_id : '', disabled: true }, [Validators.required]],
              'condition_new_task': [null]
            })
            return condition;
          })
        )
      })
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'conditions': this.builder.array([
          this.builder.group({
            'source_task': [{ value: sourceTask ? sourceTask.name_id : '', disabled: true }, [Validators.required]],
            'output_parameter': [''],
            'operator': ['', [Validators.required]],
            'value': ['', [Validators.required]],
            'target_task': [{ value: targetTask ? targetTask.name_id : '', disabled: true }, [Validators.required]],
            'condition_new_task': [null]
          })
        ]),
      },
        {
          validators: [this.conditionAlreadyExistsValidator(conditionTasks)],
          updateOn: 'blur',
        })
      return form;
    }
  }

  conditionAlreadyExistsValidator(conditionTasks: UnityWorkflowTasksViewData[]): ValidatorFn {
    return (formGroup: FormGroup) => {
      const nameControl = formGroup.get('name');
      if (!nameControl) {
        return null;
      }

      const nameValue = nameControl.value;
      if (!nameValue) {
        return null;
      }

      if (conditionTasks.find(ct => ct.name == nameValue)) {
        return { alreadyExists: true }; // This is our error!
      }

      return null;
    };
  }

  resetConditionFormErrors() {
    return {
      'name': '',
      'conditions': [this.resetConditionErrors()],
    }
  }

  resetConditionErrors() {
    return {
      'source_task': '',
      'operator': '',
      'value': '',
      'target_task': ''
    }
  }

  conditionFormValidationMessages = {
    'name': {
      'required': 'Condition Name is required',
      'alreadyExists': 'Conditon name should be unique'
    },
    'conditions': {
      'source_task': {
        'required': 'Source task is required'
      },
      'operator': {
        'required': 'Operator is required'
      },
      'value': {
        'required': 'Value is required'
      },
      'target_task': {
        'required': 'Target task is required'
      }
    },
  }
}

const OPERATOR_MAPPING = {
  "==": "==",
  "!=": "!=",
  ">=": ">=",
  "<=": "<=",
  ">": ">",
  "<": "<",
  "contains": "Contains",
  "not_contains": "Not Contains",
};
export const conditionOperators = Object.keys(OPERATOR_MAPPING).map(key => ({
  label: OPERATOR_MAPPING[key],
  value: key
}));
