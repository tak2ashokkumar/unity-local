import { Injectable } from '@angular/core';
import { GET_TICKET_MGMT_LIST } from 'src/app/shared/api-endpoint.const';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { HttpClient } from '@angular/common/http';
import { JiraInstanceProjects } from 'src/app/shared/SharedEntityTypes/jira.type';
import { Observable } from 'rxjs';

@Injectable()
export class DashboardTicketMgmtService {

  constructor(private http: HttpClient) { }

  getTcktMgmtList(){
    return this.http.get<TicketMgmtList[]>(GET_TICKET_MGMT_LIST());
  }

  getJiraProjects(instanceId: string): Observable<JiraInstanceProjects> {
    return this.http.get<JiraInstanceProjects>(`/customer/jira/instances/${instanceId}/projects_list/`);
  }
}
