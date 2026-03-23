import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { JiraInstance, JiraInstanceProjects } from 'src/app/shared/SharedEntityTypes/jira.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UsiJiraCrudService {

  private showProjectsAnnouncedSource = new Subject<string>();
  showProjectsAnnounced$ = this.showProjectsAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  showProjects(uuid: string) {
    this.showProjectsAnnouncedSource.next(uuid);
  }

  deleteAccount(id: string) {
    this.deleteAnnouncedSource.next(id);
  }

  getInstanceDetails(instanceId: string) {
    return this.http.get<JiraInstance>(`customer/jira/instances/${instanceId}/`);
  }

  buildIntegrationForm(instance: JiraInstance): FormGroup {
    if (instance) {
      return this.builder.group({
        'uuid': [instance.uuid, [Validators.required, NoWhitespaceValidator]],
        'name': [instance ? instance.name : '', [Validators.required, NoWhitespaceValidator]],
        'email': [instance ? instance.email : '', [Validators.required, Validators.email, NoWhitespaceValidator]],
        'jira_url': [instance ? instance.jira_url : '', [Validators.required, NoWhitespaceValidator]],
        'api_token': [instance ? instance.api_token : '', [Validators.required, NoWhitespaceValidator]],
        'is_default': [instance ? instance.is_default : false],
        'access_type': [instance ? instance.access_type : '']
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'email': ['', [Validators.required, Validators.email, NoWhitespaceValidator]],
        'jira_url': ['', [Validators.required, NoWhitespaceValidator]],
        'api_token': ['', [Validators.required, NoWhitespaceValidator]],
        'is_default': [false],
        'access_type': ['admin', [Validators.required]]
      });
    }
  }

  resetIntegrationFormErrors(): any {
    let formErrors = {
      'uuid': '',
      'name': '',
      'email': '',
      'jira_url': '',
      'api_token': '',
      'access_type': '',
    };
    return formErrors;
  }

  integrationFormvalidationMessages = {
    'uuid': {
      'required': 'Account ID is required'
    },
    'name': {
      'required': 'Name is required'
    },
    'email': {
      'required': 'Email is required'
    },
    'jira_url': {
      'required': 'Instance URL is required'
    },
    'api_token': {
      'required': 'API Token is required'
    },
    'access_type': {
      'required': 'Access type is required'
    },
  };

  save(formdata: any, id?: string): Observable<any> {
    if (id) {
      return this.http.put<any>(`customer/jira/instances/${id}/`, formdata);
    } else {
      return this.http.post<any>(`customer/jira/instances/`, formdata);
    }
  }

  getProjects(instanceId: string): Observable<JiraInstanceProjects> {
    return this.http.get<JiraInstanceProjects>(`customer/jira/instances/${instanceId}/projects_list/`);
  }

  convertToProjectViewData(projects: JiraInstanceProjects): JiraInstanceProjectViewdata[] {
    let viewData: JiraInstanceProjectViewdata[] = [];
    projects.project_list.forEach(p => {
      let a: JiraInstanceProjectViewdata = new JiraInstanceProjectViewdata();
      a.id = p.project_id;
      a.name = p.project_name;
      a.serviceDeskId = p.serviceDeskId;
      a.projectKey = p.project_key;
      viewData.push(a);
    });
    if (projects.projects_selected.length) {
      viewData.forEach(v => {
        let project = projects.projects_selected.find(sp => sp.project_id == v.id);
        if (project) {
          v.isSelected = true;
        }
      });
    };
    return viewData;
  }

  delete(id: string) {
    return this.http.delete(`/customer/jira/instances/${id}/`);
  }
}

export class JiraInstanceProjectViewdata {
  constructor() { }
  id: string;
  name: string;
  serviceDeskId: string;
  projectKey: string;
  isSelected: boolean = false;
}