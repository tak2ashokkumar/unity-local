import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ORCHESTRATION_ADD_PLAYBOOK, ORCHESTRATION_DELETE_PLAYBOOK, ORCHESTRATION_EDIT_PLAYBOOK, ORCHESTRATION_GET_PLAYBOOKS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { OrchestrationHistoryDataType, OrchestrationPlaybookDataType } from '../../../orchestration-tasks/orchestration-task.type';

@Injectable()
export class OrchestrationIntegrationDetailsPlaybookService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getPlaybooks(uuid: string) {
    return this.http.get<OrchestrationPlaybookDataType[]>(ORCHESTRATION_GET_PLAYBOOKS(uuid), { params: new HttpParams().set('page_size', 0) });
  }

  convertToViewData(data: OrchestrationPlaybookDataType[]): PlaybooksViewData[] {
    let viewData: PlaybooksViewData[] = [];
    data.map(a => {
      let pd: PlaybooksViewData = new PlaybooksViewData();
      pd.uuid = a.uuid;
      pd.playbookName = a.name;
      pd.playbookType = a.type;
      pd.playbookDescription = a.description;
      pd.playbookFile = a.playbook;
      pd.playbookFileName = a.playbook ? a.playbook.split('/').pop() : null;
      pd.isPlaybookDefault = a.default;
      pd.playbookContent = a.content;
      pd.repoFk = a.repo_fk;
      if (a.default) {
        pd.editPlaybooktoolTipMessage = 'Cannot Edit default playbook';
        pd.deletePlaybooktoolTipMessage = 'Cannot Delete default playbook';
      } else {
        pd.editPlaybooktoolTipMessage = 'Edit';
        pd.deletePlaybooktoolTipMessage = 'Delete';
      }
      viewData.push(pd);
    });
    return viewData;
  }

  buildDetailsForm(data: PlaybooksViewData): FormGroup {
    return this.builder.group({
      'name': [data.playbookName],
      'type': [data.playbookType],
      'description': [data.playbookDescription],
      'content': [data.playbookContent]
    });
  }

  createPlaybookForm(playbook: PlaybooksViewData): FormGroup {
    if (playbook) {
      let form = this.builder.group({
        'name': [playbook.playbookName, [Validators.required, NoWhitespaceValidator]],
        'type': [playbook.playbookType, [Validators.required, NoWhitespaceValidator]],
        'description': [playbook.playbookDescription, [Validators.required, NoWhitespaceValidator]],
        'playbook': [playbook.playbookFile, [Validators.required]],
      });
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'type': ['Custom', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'playbook': ['', [Validators.required]]
      });
    }
  }

  resetPlaybookFormErrors() {
    return {
      'name': '',
      'type': '',
      'description': '',
      'playbook': ''
    }
  }

  playbookValidationMessages = {
    'name': {
      'required': 'Name Selection is Mandatory'
    },
    'type': {
      'required': 'Type Selection is Mandatory'
    },
    'description': {
      'required': 'Description Selection is Mandatory'
    },
    'playbook': {
      'required': 'Playbook File Selection is Mandatory'
    }
  }

  private manageFormData(obj: any, fileToUpload: File, repoId: string) {
    const formData = new FormData();
    formData.append('name', obj.name);
    formData.append('type', obj.type);
    formData.append('description', obj.description);
    formData.append('playbook', fileToUpload);
    formData.append('repo_fk', repoId);
    return formData;
  }

  createPlaybook(obj: PlaybooksViewData, fileToUpload: File, repoId: string): Observable<OrchestrationPlaybookDataType> {
    const formData = this.manageFormData(obj, fileToUpload, repoId);
    return this.http.post<OrchestrationPlaybookDataType>(ORCHESTRATION_ADD_PLAYBOOK(), formData);
  }

  updatePlaybook(uuid: string, obj: PlaybooksViewData, repoId: string, fileToUpload?: File): Observable<OrchestrationPlaybookDataType> {
    if (fileToUpload) {
      const formData = this.manageFormData(obj, fileToUpload, repoId);
      return this.http.patch<OrchestrationPlaybookDataType>(ORCHESTRATION_EDIT_PLAYBOOK(uuid), formData);
    } else {
      return this.http.patch<OrchestrationPlaybookDataType>(ORCHESTRATION_EDIT_PLAYBOOK(uuid), obj);
    }
  }

  deletePlaybook(uuid: string) {
    return this.http.delete(ORCHESTRATION_DELETE_PLAYBOOK(uuid));
  }

  getHistoryData(playbookUuid: string, repoUuid: string) {
    return this.http.get<OrchestrationHistoryDataType[]>(`/orchestration/execute/${repoUuid}/${playbookUuid}/get_playbook_task/`);
  }

  convertToHistoryViewData(data: OrchestrationHistoryDataType[]): HistoryViewData[] {
    let viewHistoryData: HistoryViewData[] = [];
    data.map(a => {
      let hd: HistoryViewData = new HistoryViewData();
      hd.taskName = a.task_name;
      hd.executionStartTime = a.start_time ? this.utilSvc.toUnityOneDateFormat(a.start_time) : 'NA';
      hd.executionEndTime = a.end_time ? this.utilSvc.toUnityOneDateFormat(a.end_time) : 'NA';
      hd.executionDuration = a.duration ? a.duration : 'NA';
      hd.executionStatus = a.execution_status;
      if (a.execution_status == 'Completed') {
        hd.statusIcon = "fa-check-circle text-success";
      } else if (a.execution_status == 'Failed') {
        hd.statusIcon = "fa-exclamation-circle text-danger";
      } else {
        hd.statusIcon = "fas fa-spinner fa-spin fa-info-circle text-primary";
      }
      hd.executionUser = a.user;
      viewHistoryData.push(hd);
    });
    return viewHistoryData;
  }

}

export class PlaybooksViewData {
  constructor() { }
  uuid: string;
  playbookName: string;
  playbookType: string;
  playbookDescription: string;
  playbookFile: string;
  playbookFileName: string;
  isPlaybookDefault: boolean;
  playbookContent: string;
  editPlaybooktoolTipMessage: string;
  deletePlaybooktoolTipMessage: string;
  repoFk: string;
}

export class HistoryViewData {
  constructor() { }
  taskName: string;
  executionStartTime: string;
  executionEndTime: string;
  executionDuration: string;
  executionStatus: string;
  executionUser: string;
  statusIcon: string;
}

