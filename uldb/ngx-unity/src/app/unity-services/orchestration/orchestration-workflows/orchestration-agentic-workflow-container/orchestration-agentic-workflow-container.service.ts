import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrchestrationWorkflowMetadata } from '../../orchestration.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UnityWorkflowViewData } from '../orchestration-workflow-crud/orchestration-workflow-crud.service';
import { nodeTypes, TaskDetailsModel } from './orchestration-agentic-workflow-container.type';
import { OrchestrationWorkflowCrudUtilsService } from '../orchestration-workflow-crud/orchestration-workflow-crud.utils.service';
import { environment } from 'src/environments/environment';
import { playbookTypes } from '../../orchestration-tasks/orchestration-tasks.service';
import { CeleryTask, EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { UnityWorkflow } from '../orchestration-workflows.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { WorkflowLogs } from '../../orchestration-executions/orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.type';
import { WorkflowLogsViewData } from '../../orchestration-executions/orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.service';

@Injectable({
  providedIn: 'root'
})
export class OrchestrationAgenticWorkflowContainerService {

  toolsList = [];

  constructor(
    private builder: FormBuilder,
    private http: HttpClient,
    private crudSvc: OrchestrationWorkflowCrudUtilsService,
    private appService: AppLevelService,
  ) { }



  // ********* Input Templates Supporting Code Start ************ //
  getTaskInputTemplates(): Observable<inputTemplateType[]> {
    return this.http.get<inputTemplateType[]>(`/orchestration/input_template/?page_size=0`);
  }
  getTemplatesByTaskId(taskId: string) {
    return this.http.get<TaskDetailsModel>(`/orchestration/tasks/${taskId}/`);
  }

  getSourceTaskDetails(uuid) {
    return this.http.get<TaskDetailsModel>(`rest/orchestration/service_operation/${uuid}/`);
  }

  // ********* Input Templates Supporting Code Start ************ //

  //********************************************* Drawflow Plot Start ***************************************************//
  getMetadata(): Observable<OrchestrationWorkflowMetadata> {
    return this.http.get<OrchestrationWorkflowMetadata>(`/orchestration/workflows/get_metadata/`);
  }
  //********************************************* Drawflow Plot End ***************************************************//

  getWorkflowDetails(workflowId: string): Observable<any> {
    // return this.http.get<any>(GET_WORKFLOW_DETAILS());
    return this.http.get<any>(`rest/orchestration/agentic_workflow/${workflowId}/`);
  }


  saveWorkFlow(obj: any, workflowId?: string): Observable<CeleryTask> | any {
    let url = '';
    if (workflowId) {
      if (obj.update_meta) {
        url = `rest/orchestration/agentic_workflow/${workflowId}/?update_meta=true`;
        return this.http.put(url, obj.workflow_data);
      } else {
        url = `rest/orchestration/agentic_workflow/${workflowId}/`;
        return this.http.put<CeleryTask>(url, obj);
      }
    } else {
      url = 'rest/orchestration/agentic_workflow/';
      return this.http.post<CeleryTask>(url, obj);
    }
  }

  postRealTimeWorkflow(obj: any): any {
    let url = 'rest/orchestration/agentic_workflow_preview/';
    return this.http.post<any>(url, obj);
  }

  // pollRealTimeWorkflow(uuid: string): any {
  //   let url = `rest/orchestration/agentic_workflow_preview/${uuid}`;
  //   return this.http.get<any>(url);
  // }

  pollRealTimeWorkflow(uuid): Observable<any> {
    return this.http.get<any>(`rest/orchestration/agentic_workflow_preview/${uuid}/`).pipe(
      switchMap(res => this.appService.pollForAgenticWfExecute(uuid, 2))
    );
  }

  convertToEntityTaskRelation(workflowId: string, workflowName: string, taskId: string): EntityTaskRelation {
    return { entityId: workflowId, entityName: workflowName, taskId: taskId };
  }

  getExecutionLogs(workflowId: string): Observable<WorkflowLogs> {
    return this.http.get<WorkflowLogs>(`rest/orchestration/agentic_workflow_preview/${workflowId}/execution_log/`);
  }

  convertToExecutionLogViewData(data: WorkflowLogs): WorkflowLogsViewData {
    let viewData: WorkflowLogsViewData = new WorkflowLogsViewData();
    viewData.executionLog = data.execution_log;
    return viewData;
  }


  buildWorkflowDetailsForm(d: any): FormGroup {
    if (d) {
      let form = this.builder.group({
        'name': [d.name, [Validators.required]],
        'description': [d.description ? d.description : ''],
      })
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required]],
        'description': [''],
      })
    }
  }

  resetWorkflowDetailsFormErrors() {
    return {
      'name': '',
      'category': ''
    }
  }

  workflowDetailsFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'category': {
      'required': 'Category is required'
    }
  }

  convertToWorkflowPopupViewData(d?: any): UnityWorkflowViewData {
    let a = new UnityWorkflowViewData();
    if (d.uuid) {
      a.id = d.uuid;
    }
    a.name = d.name;
    a.description = d.description;
    return a;
  }

  getCenterImageUrl(type: string) {
    switch (type) {
      case nodeTypes.ManualTrigger:
        return `${environment.assetsUrl}external-brand/workflow/Manual.svg`;
      case nodeTypes.ScheduleTrigger:
        return `${environment.assetsUrl}external-brand/workflow/Schedule.svg`;
      case nodeTypes.OnChatMessageTrigger:
        return `${environment.assetsUrl}external-brand/workflow/onChatMassage.svg`;
      case nodeTypes.Email:
        return `${environment.assetsUrl}external-brand/workflow/Mail.svg`;
      case nodeTypes.Chart:
        return `${environment.assetsUrl}external-brand/workflow/Chart.svg`;
      case nodeTypes.IfElse:
        return `${environment.assetsUrl}external-brand/workflow/IfElse.svg`;
      case nodeTypes.Switch:
        return `${environment.assetsUrl}external-brand/workflow/Switch.svg`;
      case nodeTypes.Wait:
        return `${environment.assetsUrl}external-brand/workflow/wait.svg`;
      case nodeTypes.Source:
        return `${environment.assetsUrl}external-brand/workflow/Source.svg`;
      case nodeTypes.LLM:
        return `${environment.assetsUrl}external-brand/workflow/LLM.svg`;
      case nodeTypes.AIAgent:
        return `${environment.assetsUrl}external-brand/workflow/AIAgent.svg`;
      case nodeTypes.ItsmTrigger:
        return `${environment.assetsUrl}external-brand/workflow/ITSM-Event-Trigger-4.svg`;
      case nodeTypes.WebhookTrigger:
        return `${environment.assetsUrl}external-brand/workflow/webhook-trigger-new.svg`;
      case nodeTypes.AimlEventTrigger:
        return `${environment.assetsUrl}external-brand/workflow/aiml-event-trigger1.svg`;
      case nodeTypes.CreateITSMTicket:
        return `${environment.assetsUrl}external-brand/workflow/ITSM.svg`;
      case nodeTypes.UpdateITSMTicket:
        return `${environment.assetsUrl}external-brand/workflow/ITSM.svg`;
      case nodeTypes.CommentInITSMTicket:
        return `${environment.assetsUrl}external-brand/workflow/ITSM.svg`;
      case nodeTypes.GetITSMTicket:
        return `${environment.assetsUrl}external-brand/workflow/ITSM.svg`;
      case nodeTypes.Action:
        return `${environment.assetsUrl}external-brand/workflow/actions_task.svg`;
      default:
        // handle dynamic group like playbookTypes
        if (this.isPlaybookType(type)) {
          return this.crudSvc.getTaskTargetImage(type);
        }
        return '';
    }
  }

  isPlaybookType(val: string): val is playbookTypes {
    return Object.values(playbookTypes).includes(val as playbookTypes);
  }

  isTriggerNode(val: string) {
    if (val === nodeTypes.ManualTrigger || val === nodeTypes.ScheduleTrigger || val === nodeTypes.OnChatMessageTrigger ||
      val === nodeTypes.ItsmTrigger || val === nodeTypes.WebhookTrigger || val === nodeTypes.AimlEventTrigger) {
      return true;
    } else {
      return false;
    }
  }

  // formatDuration(dur: string) {
  //   let modifiedDuration;
  //   let initialDuration = dur?.split('.')[0];
  //   let initialDurArr = initialDuration?.split(':');
  //   if (initialDurArr[0] === '00' && initialDurArr[1] === '00') {
  //     modifiedDuration = `${initialDurArr[2]} secs`;
  //   } else if (initialDurArr[0] === '00' && (initialDurArr[1] !== '00' && initialDurArr[2] !== '00')) {
  //     modifiedDuration = `${initialDurArr[1]} min ${initialDurArr[2]} secs`;
  //   } else if (initialDurArr[0] !== '00' && (initialDurArr[1] === '00' && initialDurArr[2] === '00')) {
  //     modifiedDuration = `${initialDurArr[0]} hours`;
  //   } else if (initialDurArr[0] !== '00' && (initialDurArr[1] !== '00' && initialDurArr[2] === '00')) {
  //     modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins`;
  //   } else {
  //     modifiedDuration = `${initialDurArr[0]} hours ${initialDurArr[1]} mins ${initialDurArr[2]} secs`;
  //   }
  //   return modifiedDuration;
  // }

  formatDuration(dur: string): string {
    if (!dur) return '';

    const [time, fraction] = dur.split('.');
    const [h, m, s] = time.split(':').map(Number);

    const ms = fraction ? Number(`0.${fraction}`) : 0;
    const totalSeconds = h * 3600 + m * 60 + s + ms;

    // < 1 second → show decimal seconds
    if (totalSeconds < 1) {
      return `${totalSeconds.toFixed(1)} sec`;
    }

    // < 60 seconds
    if (h === 0 && m === 0) {
      return `${s} sec`;
    }

    // < 1 hour
    if (h === 0) {
      return s > 0
        ? `${m} mins ${s} sec`
        : `${m} mins`;
    }

    // >= 1 hour
    let result = `${h} hours`;
    if (m > 0) result += ` ${m} mins`;
    if (s > 0) result += ` ${s} sec`;

    return result;
  }


}