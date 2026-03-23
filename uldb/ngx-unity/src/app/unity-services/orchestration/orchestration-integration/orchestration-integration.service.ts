import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ORCHESTRATION_ADD_INSTANCE, ORCHESTRATION_DELETE_INSTANCE, ORCHESTRATION_EDIT_INSTANCE, TOGGLE_STATUS } from 'src/app/shared/api-endpoint.const';
import { OrchestrationInstanceDataType } from './orchestration-integration.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class OrchestrationIntegrationService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }

  getInstances(criteria: SearchCriteria): Observable<InstanceFormData[]> {
    return this.tableService.getData<InstanceFormData[]>(ORCHESTRATION_ADD_INSTANCE(), criteria);
  }

  convertToViewData(data: InstanceFormData[]): InstanceViewData[] {
    let viewData: InstanceViewData[] = [];
    data.forEach(a => {
      let id: InstanceViewData = new InstanceViewData();
      id.uuid = a.uuid;
      id.instanceName = a.name;
      id.instanceType = a.type;
      id.instanceStatus = a.repo_status;
      id.instanceDescription = a.description;
      id.ansibleRepoUrl = a.ansible_repo_url;
      id.username = a.username;
      id.password = a.password;
      id.defaultBranch = a.default_branch;
      id.playbooksPath = a.playbooks_path;
      id.rolePath = a.role_path;
      id.groupVariablePath = a.group_variable_path;
      id.hostVariablePath = a.host_variable_path;
      id.description = a.description;
      id.status = a.repo_status == 'Enabled' ? true : false;
      id.statusIcon = id.status ? 'fa-toggle-on' : 'fa-toggle-off';
      id.statusTooltip = id.status ? 'Enable' : 'Disable';
      id.instanceConnectivity = a.connectivity;
      id.instanceIcon = "fa-exclamation-circle text-danger";
      if (a.connectivity == true) {
        id.instanceIcon = "fa-check-circle text-success";
      }
      viewData.push(id);
    });
    return viewData;
  }


  updateTask(uuid: string, data: InstanceFormData) {
    return this.http.put<InstanceFormData>(ORCHESTRATION_EDIT_INSTANCE(uuid), data);
  }

  createTask(obj: InstanceFormData): Observable<InstanceFormData> {
    return this.http.post<InstanceFormData>(ORCHESTRATION_ADD_INSTANCE(), obj);
  }

  toggleStatus(uuid: string, data: string) {
    return this.http.request('get', TOGGLE_STATUS(uuid, data));
  }

  deleteInstance(uuid: string) {
    return this.http.delete(ORCHESTRATION_DELETE_INSTANCE(uuid));
  }

  createForm(task: InstanceViewData): FormGroup {
    if (task) {
      let form = this.builder.group({
        'name': [task.instanceName, [Validators.required, NoWhitespaceValidator]],
        'ansible_repo_url': [task.ansibleRepoUrl, [Validators.required, NoWhitespaceValidator]],
        'username': [task.username, [Validators.required, NoWhitespaceValidator]],
        'password': [task.password, [Validators.required, NoWhitespaceValidator]],
        'default_branch': [task.defaultBranch, [Validators.required, NoWhitespaceValidator]],
        'playbooks_path': [task.playbooksPath, [Validators.required, NoWhitespaceValidator]],
        'role_path': [task.rolePath, [Validators.required, NoWhitespaceValidator]],
        'group_variable_path': [task.groupVariablePath, [Validators.required, NoWhitespaceValidator]],
        'host_variable_path': [task.hostVariablePath, [Validators.required, NoWhitespaceValidator]],
        'description': [task.description, [Validators.required, NoWhitespaceValidator]],
      });
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'ansible_repo_url': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'default_branch': ['', [Validators.required, NoWhitespaceValidator]],
        'playbooks_path': ['', [Validators.required, NoWhitespaceValidator]],
        'role_path': ['', [Validators.required, NoWhitespaceValidator]],
        'group_variable_path': ['', [Validators.required, NoWhitespaceValidator]],
        'host_variable_path': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }


  resetIntegrationFormErrors() {
    return {
      'name': '',
      'repo_url': '',
      'username': '',
      'password': '',
      'defult_branch': '',
      'playbooks_path': '',
      'role_path': '',
      'group_variable_path': '',
      'host_variable_path': '',
      'description': '',
    }
  }

  taskValidationMessages = {
    'name': {
      'required': 'Name is mandatory'
    },
    'repo_url': {
      'required': 'Repo URL is mandatory'
    },
    'username': {
      'required': 'Username is mandatory'
    },
    'password': {
      'required': 'Password is mandatory'
    },
    'defult_branch': {
      'required': 'Default Branch is mandatory'
    },
    'playbooks_path': {
      'required': 'Playbooks path is mandatory'
    },
    'role_path': {
      'required': 'Role path is mandatory'
    },
    'group_variable_path': {
      'required': 'Group variable path is mandatory'
    },
    'host_variable_path': {
      'required': 'Host variable path is mandatory'
    },
    'description': {
      'required': 'Description is mandatory'
    },

  }
}

export class InstanceViewData {

  constructor() { }
  uuid: string;
  instanceName: string;
  instanceType: string;
  instanceStatus: string;
  instanceDescription: string;
  instanceConnectivity: boolean;
  instanceIcon: string;
  statusIcon: string;
  statusTooltip: string;
  status: boolean;
  ansibleRepoUrl: string;
  username: string;
  password: string;
  defaultBranch: string;
  playbooksPath: string;
  rolePath: string;
  groupVariablePath: string;
  hostVariablePath: string;
  description: string;
}

export interface InstanceFormData {
  uuid: string;
  name: string;
  description: string;
  connectivity: boolean;
  username: string;
  default_branch: string;
  master_repo: boolean;
  customer: number;
  created_at: string;
  updated_at: string;
  user: string;
  password: string;
  ansible_repo_url: string;
  host_variable_path: string;
  playbooks_path: string;
  role_path: string;
  group_variable_path: string;
  repo_status: string;
  type: string;
}
