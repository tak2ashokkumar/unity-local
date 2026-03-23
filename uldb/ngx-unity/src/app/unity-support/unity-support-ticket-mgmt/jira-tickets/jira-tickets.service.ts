import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JiraInstance } from 'src/app/shared/SharedEntityTypes/jira.type';

@Injectable({
  providedIn: 'root'
})
export class JiraTicketsService {

  constructor(private http: HttpClient,) { }

  getProjects(instanceId: string): Observable<any[]> {
    return this.http.get<any[]>(`/customer/jira/instances/${instanceId}/projects_list/`);
  }

  getInstanceDetails(instanceId: string): Observable<JiraInstance> {
    return this.http.get<JiraInstance>(`customer/jira/instances/${instanceId}/`);
  }
}
