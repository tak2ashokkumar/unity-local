import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrchestrationWorkflowMetadata } from '../../orchestration.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UnityWorkflowViewData } from '../orchestration-workflow-crud/orchestration-workflow-crud.service';
import { nodeTypes, TaskDetailsModel, unityWorkflowTaskTypes } from './wf-dynamic-container.type';
import { environment } from 'src/environments/environment';
import { playbookTypes } from '../../orchestration-tasks/orchestration-tasks.service';
import { CeleryTask, EntityTaskRelation } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { WorkflowLogs } from '../../orchestration-executions/orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.type';
import { WorkflowLogsViewData } from '../../orchestration-executions/orchestration-executions-workflow-logs/orchestration-executions-workflow-logs.service';

@Injectable({
  providedIn: 'root'
})
export class WfDynamicContainerService {

  toolsList = [];
  private optionStoreCache: Record<string, any[]> = {};

  constructor(
    private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService,
  ) { }

  getNodeConfiguration(endpoint: string): Observable<any> {
    return this.http.get(endpoint);
  }



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
    return this.http.get<any>(`api/orchestration/v1/dynamic_workflows/${workflowId}/`);
  }


  saveWorkFlow(obj: any, workflowId?: string): Observable<CeleryTask> | any {
    let url = '';
    if (workflowId) {
      if (obj.update_meta) {
        url = `rest/orchestration/agentic_workflow/${workflowId}/?update_meta=true`;
        return this.http.put(url, obj.workflow_data);
      } else {
        url = `api/orchestration/v1/dynamic_workflows/${workflowId}/`;
        return this.http.put<CeleryTask>(url, obj);
      }
    } else {
      url = 'api/orchestration/v1/dynamic_workflows/';
      return this.http.post<CeleryTask>(url, obj);
    }
  }

  postRealTimeWorkflow(obj: any): any {
    let url = 'api/orchestration/v1/dynamic_workflow_preview/';
    return this.http.post<any>(url, obj);
  }

  // pollRealTimeWorkflow(uuid: string): any {
  //   let url = `rest/orchestration/agentic_workflow_preview/${uuid}`;
  //   return this.http.get<any>(url);
  // }

  pollRealTimeWorkflow(uuid): Observable<any> {
    return this.http.get<any>(`api/orchestration/v1/dynamic_workflow_preview/${uuid}/`).pipe(
      switchMap(res => this.appService.pollForAgenticWfExecute(uuid, 2))
    );
  }

  convertToEntityTaskRelation(workflowId: string, workflowName: string, taskId: string): EntityTaskRelation {
    return { entityId: workflowId, entityName: workflowName, taskId: taskId };
  }

  getExecutionLogs(workflowId: string): Observable<WorkflowLogs> {
    return this.http.get<WorkflowLogs>(`api/orchestration/v1/dynamic_workflow_preview/${workflowId}/execution_log/`);
  }

  getOptionCache(key: string): any[] | null {
    return this.optionStoreCache[key] || null;
  }

  setOptionCache(key: string, value: any[]): void {
    this.optionStoreCache[key] = value;
  }

  clearOptionCache(): void {
    this.optionStoreCache = {};
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


  getNewCenterImageUrl(iconPath?: string): string {
    const normalizedIconPath = iconPath?.trim();

    if (!normalizedIconPath) {
      return '';
    }

    if (
      /^(?:https?:)?\/\//.test(normalizedIconPath) ||
      /^(?:data|blob):/.test(normalizedIconPath)
    ) {
      return normalizedIconPath;
    }

    const assetsUrl = environment.assetsUrl.endsWith('/')
      ? environment.assetsUrl
      : `${environment.assetsUrl}/`;
    const relativeIconPath = normalizedIconPath.replace(/^\/+/, '');
    const relativeAssetsUrl = assetsUrl.replace(/^\/+/, '');

    // API responses and saved workflows may contain either an asset-relative
    // path or the already-prefixed asset path. Do not prefix the latter twice.
    if (relativeIconPath.startsWith(relativeAssetsUrl)) {
      return assetsUrl.startsWith('/')
        ? `/${relativeIconPath}`
        : relativeIconPath;
    }

    return `${assetsUrl}${relativeIconPath}`;
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

  isAINode(val: string) {
    if (val === nodeTypes.AIAgent || val === nodeTypes.LLM) {
      return true;
    } else {
      return false;
    }
  }

  isFlowControlNode(val: string) {
    if (val === nodeTypes.IfElse || val === nodeTypes.Switch || val === nodeTypes.Wait) {
      return true;
    } else {
      return false;
    }
  }

  isOrcPlayBook(type: string) {
    return this.isPlaybookType(type);
  }

  isSourceTaskOrAction(type: string) {
    if (type === nodeTypes.Source || nodeTypes.Action) {
      return true;
    } else {
      return false;
    }
  }

  isITSM(type: string) {
    if (type === nodeTypes.CreateITSMTicket || nodeTypes.UpdateITSMTicket ||
      type === nodeTypes.CommentInITSMTicket || nodeTypes.GetITSMTicket
    ) {
      return true;
    } else {
      return false;
    }
  }

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

  // getStatusFaClass(status?: string): string {
  //   switch (status) {
  //     case 'Success': return 'fas fa-check-circle text-success';
  //     case 'Failed': return 'fas fa-exclamation-circle text-danger';
  //     case 'Stopped': return 'fas fa-exclamation-circle text-danger';
  //     case 'Skipped': return 'fas fa-clock text-warning';
  //     case 'Queued': return 'fas fa-clock text-muted';
  //     case 'Canceled': return 'fas fa-exclamation-circle text-danger';
  //     case 'Running': return 'fas fa-spinner fa-spin text-primary';
  //     case 'Started': return 'fas fa-spinner fa-spin text-primary';
  //     default: return ''; 
  //   }
  // }


}

export interface OnChatExecution {
  chat_response: string;
  status: "Running" | "Success" | "Failed";
}

export function JsonValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'object') {
    return null;
  }
  try {
    JSON.parse(value);
    return null;
  } catch {
    return { invalidJson: true };
  }
}
