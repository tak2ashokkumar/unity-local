import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep as _clone } from 'lodash-es';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UnityWorkflowTasksViewData, UnityWorkflowViewData, unityWorkflowTaskTypes } from '../../orchestration-workflows/orchestration-workflow-crud/orchestration-workflow-crud.service';
import { OrchestrationTaskParameters } from '../../orchestration.type';
import { WorkflowLogDetails, WorkflowLogTasksExecution } from '../orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Injectable()
export class OrchestrationExecutionLogsWorkflowWidgetService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  convertToViewData(d: WorkflowLogDetails): UnityWorkflowViewData {
    let a = new UnityWorkflowViewData();
    a.id = d.workflow;
    a.workflow_name = d.workflow_name;
    a.description = d.description;
    a.category = d.category;
    a.target_type = d.target_type;
    a.cloud = d.cloud;
    if (d.tasks_execution && d.tasks_execution.length) {
      d.tasks_execution.forEach(t => {
        t.dependencies = t.dependencies.reduce(function (a, b) { if (a.indexOf(b) < 0) a.push(b); return a; }, []);
      })
    }

    let multiLevelTasks: Array<UnityWorkflowTasksViewData[]> = [];
    if (d.design_data && d.design_data.length) {
      d.design_data.forEach(params => {
        params.forEach(p => {
          p.dependencies = p.dependencies.reduce(function (a, b) { if (a.indexOf(b) < 0) a.push(b); return a; }, []);
        })
      })
      multiLevelTasks = d.design_data;
    }

    multiLevelTasks.map(mlt => {
      mlt.map(t => {
        let tsk = d.tasks_execution.find(task => task.name_id == t.name_id);
        if (tsk) {
          t.execution_status = tsk.execution_status;
        }
      })
    })
    a.multiLevelTasks = multiLevelTasks;
    return a;
  }

  buildTaskInputForm(task?: UnityWorkflowTasksViewData): FormGroup {
    if (task) {
      if (task.inputs instanceof Array) {
        let inputs = this.builder.array(
          task?.inputs?.map((param, i) => {
            let inp: FormGroup = this.builder.group({
              'name': [param.param_name, [Validators.required]],
              'value': [{ value: param.default_value, disabled: true }, [Validators.required]],
            })
            return inp;
          })
        );
        return this.builder.group({
          'inputs': inputs
        });
      } else if ((typeof task.inputs == 'object') && task.inputs.arguments) {
        let form = this.builder.group({
          'name': ['arguments', [Validators.required]],
          'value': [{ value: task.inputs.arguments, disabled: true }, [Validators.required]],
        })
        return form;
      } else if ((typeof task.inputs == 'object') && task.inputs.message) {
        let form = this.builder.group({
          'name': ['message', [Validators.required]],
          'value': [{ value: task.inputs.message, disabled: true }, [Validators.required]],
        })
        return form;
      } else if ((typeof task.inputs == 'object')) {
        let keys = Object.keys(task.inputs);
        let inputs = this.builder.array(
          keys.map((key, i) => {
            let inp: FormGroup = this.builder.group({
              'name': [key, [Validators.required]],
              'value': [{ value: task.inputs[key], disabled: true }, [Validators.required]],
            })
            return inp;
          })
        );
        return this.builder.group({
          'inputs': inputs
        });
      }
    }
    return null;
  }

  buildTaskOutputForm(task?: UnityWorkflowTasksViewData): FormGroup {
    if (task) {
      if (task.outputs instanceof Array) {
        let outputs = this.builder.array(
          task?.outputs?.map((param, i) => {
            let inp: FormGroup = this.builder.group({
              'name': [param.param_name, [Validators.required]],
              'value': [{ value: param.default_value, disabled: true }, [Validators.required]],
            })
            return inp;
          })
        );
        return this.builder.group({
          'outputs': outputs
        });
      } else if ((typeof task.outputs == 'object')) {
        let keys = Object.keys(task.outputs);
        if (keys.length) {
          let outputs = this.builder.array(
            keys.map((key, i) => {
              let inp: FormGroup = this.builder.group({
                'name': [key, [Validators.required]],
                'value': [{ value: task.outputs[key], disabled: true }, [Validators.required]],
              })
              return inp;
            })
          );
          return this.builder.group({
            'outputs': outputs
          });
        }
      }
    }
    return null;
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
}
