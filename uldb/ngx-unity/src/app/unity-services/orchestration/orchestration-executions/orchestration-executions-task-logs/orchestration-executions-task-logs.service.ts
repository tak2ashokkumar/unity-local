import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ORCHESTRATION_EXECUTION_TASKS, ORCHESTRATION_EXECUTION_TASK_LOGS, ORCHESTRATION_EXECUTION_TASK_OUTPUT } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationExecutionsTaskLogsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getTaskDetails(uuid: string) {
    return this.http.get(ORCHESTRATION_EXECUTION_TASKS(uuid));
  }

  getExecutionLogs(uuid: string) {
    return this.http.get(ORCHESTRATION_EXECUTION_TASK_LOGS(uuid));
  }

  getOutputDetails(uuid: string) {
    return this.http.get(ORCHESTRATION_EXECUTION_TASK_OUTPUT(uuid));
  }

  converToTaskDetailsViewData(data: TaskDetailsModel) {
    let finalTaskDetails: TaskDetailsViewModel;
    const parametersFormArray = this.builder.array(
      Array.isArray(data.parameters) ? data.parameters.map(p => this.builder.group({
        param_name: [p.param_name],
        value: [p.value],
      })) : []
    );
    finalTaskDetails = {
      templateName: data.task_name,
      type: 'Task',
      startTime: data.start_time ? this.utilSvc.toUnityOneDateFormat(data.start_time, 'H:mm:ss') : 'NA',
      startDate: data.start_time ? data.start_time.split('T')[0] : '',
      startedBy: data.user,
      duration: data.duration ? this.formatDuration(data.duration) : '',
      status: data.execution_status,
      parameters: parametersFormArray
    }
    return finalTaskDetails;
  }

  convertToExecutionLogViewData(data: LogsResponse) {
    let finalLogsViewData: LogsViewData;
    finalLogsViewData = {
      executionLog: data.execution_log
    }
    return finalLogsViewData;
  }

  covertToOutputViewData(data: OutputResponse) {
    let finalOutputData: OutputViewData;
    finalOutputData = {
      executionStatus: data.execution_status,
      output: data.output,
      taskName: data.task_name
    }
    return finalOutputData;
  }

  formatDuration(dur: string) {
    let modifiedDuration;
    let initialDuration = dur?.split('.')[0];
    let initialDurArr = initialDuration?.split(':');
    if (initialDurArr[0] === '00' && initialDurArr[1] === '00') {
      modifiedDuration = `${initialDurArr[2]} secs`;
    } else if (initialDurArr[0] === '00' && (initialDurArr[1] !== '00' && initialDurArr[2] !== '00')) {
      modifiedDuration = `${initialDurArr[1]} min ${initialDurArr[2]} secs`;
    } else if (initialDurArr[0] !== '00' && (initialDurArr[1] === '00' && initialDurArr[2] === '00')) {
      modifiedDuration = `${initialDurArr[0]} hours`;
    } else if (initialDurArr[0] !== '00' && (initialDurArr[1] !== '00' && initialDurArr[2] === '00')) {
      modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins`;
    } else {
      modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins ${initialDurArr[2]} secs`;
    }
    return modifiedDuration;
  }
}

export class TaskDetailsViewModel {
  templateName: string;
  type: string;
  startTime: string;
  startDate: string;
  startedBy: string | number;
  duration: string;
  status: string;
  parameters: FormArray
}
export interface TaskDetailsModel {
  created_by: string | number;
  duration: string;
  end_time: string;
  execution_status: string;
  playbook_name: string;
  playbook_type: string;
  start_time: string;
  task_name: string;
  credentials: string;
  datetime: string;
  description: string;
  parameters: TerraFormParams[] | Scripts | {};
  playbook_content: string;
  playbook_uuid: string;
  source: string;
  task_fk: string;
  type: string;
  user: string;
  uuid: string;
}

export interface TerraFormParams {
  param_name: string,
  mandatory: boolean,
  param_type: string,
  placeholder: string,
  default_value: any;
  attribute: string,
  value: string,
  template: string,
  template_name: string
}

export interface Scripts {
  arguments: string;
}

export interface LogsResponse {
  execution_log: string;
}

export interface LogsViewData {
  executionLog: string;
}

export interface OutputResponse {
  execution_status: string;
  output: string;
  task_name: string;
}

export interface OutputViewData {
  executionStatus: string;
  output: string;
  taskName: string;
}
