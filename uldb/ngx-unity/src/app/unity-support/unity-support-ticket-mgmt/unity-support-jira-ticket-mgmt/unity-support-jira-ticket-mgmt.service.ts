import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JiraInstance, JiraInstanceProjects } from 'src/app/shared/SharedEntityTypes/jira.type';

@Injectable({
  providedIn: 'root'
})
export class UnitySupportJiraTicketMgmtService {

  constructor(private http: HttpClient,) { }

  getProjects(instanceId: string): Observable<JiraInstanceProjects> {
    return this.http.get<JiraInstanceProjects>(`/customer/jira/instances/${instanceId}/projects_list/`);
  }

  getInstanceDetails(instanceId: string): Observable<JiraInstance> {
    return this.http.get<JiraInstance>(`customer/jira/instances/${instanceId}/`);
  }
}
