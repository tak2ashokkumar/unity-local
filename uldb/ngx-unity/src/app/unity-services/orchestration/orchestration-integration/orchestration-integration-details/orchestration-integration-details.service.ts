import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrchestrationViewDetailDataType, Results, ScriptDataType } from './orchestration-integration-details.type';
import { ORCHESTRATION_VIEW_DETAILS } from 'src/app/shared/api-endpoint.const';
import { environment } from 'src/environments/environment';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Injectable()
export class OrchestrationIntegrationDetailsService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService) { }

  getDetails(repoId: string, criteria: SearchCriteria): Observable<any> {
    // return this.http.get<any>(`/orchestration/scripts/${repoId}/get_repo_playbook/`);
    return this.tableService.getData<PaginatedResult<any>>(`/orchestration/scripts/${repoId}/get_repo_playbook/`, criteria);
  }

  getSummaryDetails(repoId: string): Observable<any> {
    return this.http.get<any>(`/orchestration/scripts/${repoId}/list_summary/`);
  }

  cloneData(uuid: string, scriptName: string) {
    const req = {
      name: scriptName
    };
    return this.http.post(`/orchestration/scripts/${uuid}/clone/`, req);
  }

  deleteScript(uuid: string) {
    return this.http.delete(`/orchestration/scripts/${uuid}/`);
  }

  convertToViewData(data: ScriptDataType[]) {
    let viewData: ScriptViewDataType[] = [];
    data.forEach((d) => {
      let view: ScriptViewDataType = new ScriptViewDataType();
      view.uuid = d.uuid;
      view.name = d.name;
      view.scriptType = d.script_type ? d.script_type : 'N/A';
      view.description = d.description;
      view.content = d.content ? d.content : 'N/A';
      view.editedBy = d.edited_by ? d.edited_by : 'N/A';
      view.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'NA';
      view.updatedAt = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'NA';
      view.createdBy = d.created_by ? d.created_by : 'N/A';
      view.createdByName = d.created_by_name ? d.created_by_name : 'N/A';
      view.type = d.is_default ? 'Default' : 'Custom';
      viewData.push(view);
    })
    return viewData;
  }

  convertToListSummaryViewData(data: Results) {
    let listSummaryViewData: ListSummaryViewModel = new ListSummaryViewModel();
    let modifiedScript: ScriptType[] = [];
    data.by_script_type.map(val => {
      let t: ScriptType = new ScriptType();
      t.count = val.count;
      t.icon = `${environment.assetsUrl + val.icon}`;
      t.name = val.name;

      if (val.name == 'Bash Script') {
        t.tooltipMessage = 'Bash Script';
      } else if (val.name == 'Ansible Playbook') {
        t.tooltipMessage = 'Ansible Playbook';
      } else if (val.name == 'Terraform Script') {
        t.tooltipMessage = 'Terraform Script';
      } else if (val.name == 'Python Script') {
        t.tooltipMessage = 'Python Script';
      } else if (val.name == 'Powershell Script') {
        t.tooltipMessage = 'Powershell Script';
      } else if (val.name == 'Rest API') {
        t.tooltipMessage = 'Rest API';
      }
      modifiedScript.push(t);
    });
    let modifiedType: ScriptCountByType = new ScriptCountByType();
    modifiedType.default = data.by_type.default;
    modifiedType.custom = data.by_type.custom;
    listSummaryViewData.totalScripts = data.total_scripts;
    listSummaryViewData.byScriptType = modifiedScript;
    listSummaryViewData.byType = modifiedType;
    listSummaryViewData.repoName = data.repo_name;
    return listSummaryViewData;
  }

  buildDetailsForm(data: ScriptViewDataType): FormGroup {
    return this.builder.group({
      'name': [data.name],
      'type': [data.type],
      'description': [data.description],
      'content': [data.content]
    });
  }
}

export class ScriptViewDataType {
  constructor() { }
  uuid: string;
  name: string;
  scriptType: string;
  description: string;
  content: any | null;
  editedBy: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  type: string;
}

export class ScriptType {
  constructor() { };
  count: number;
  name: string;
  icon: string | null;
  tooltipMessage: string;
}

export class ScriptCountByType {
  constructor() { };
  default: number;
  custom: number;
}

export class ListSummaryViewModel {
  constructor() { };
  byScriptType: ScriptType[];
  byType: ScriptCountByType;
  totalScripts: number;
  repoName: string;
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

export const DOWNLOAD_URL = (scriptUUID) => `/orchestration/scripts/${scriptUUID}/download/`;
export const SCRIPT_CHOICES = [
  { value: 'Ansible Playbook', label: 'Ansible Playbook' },
  { value: 'Terraform Script', label: 'Terraform Script' },
  { value: 'Bash Script', label: 'Bash Script' },
  { value: 'Python Script', label: 'Python Script' },
  { value: 'Powershell Script', label: 'Powershell Script' }
];
