import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppUtilityService } from '../app-utility/app-utility.service';
import { JiraTicketIssueType, JiraTicketPriorityType, JiraTicketQueueType, JiraTicketStatusType, JiraTicketType, JiraTicketsGraphData } from '../SharedEntityTypes/jira.type';
import { PaginatedResult } from '../SharedEntityTypes/paginated.type';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { TableApiServiceService } from '../table-functionality/table-api-service.service';

@Injectable({
  providedIn: 'root'
})
export class SharedJiraTcktMgmtService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getQueues(instanceId: string, projectId: string, serviceDeskId: string): Observable<JiraTicketQueueType[]> {
    return this.http.get<JiraTicketQueueType[]>(`/customer/jira/instances/${instanceId}/all_queues/?project_id=${projectId}&serviceDeskId=${serviceDeskId}`);
  }

  getIssueTypes(instanceId: string, projectId: string): Observable<JiraTicketIssueType[]> {
    return this.http.get<JiraTicketIssueType[]>(`/customer/jira/instances/${instanceId}/issue_types/?project_id=${projectId}`);
  }

  getStatusTypes(instanceId: string, projectId: string) {
    return this.http.get<JiraTicketStatusType[]>(`/customer/jira/instances/${instanceId}/status/?project_id=${projectId}`);
  }

  getPriorityTypes(instanceId: string, projectId: string): Observable<JiraTicketPriorityType[]> {
    return this.http.get<JiraTicketPriorityType[]>(`/customer/jira/instances/${instanceId}/priority/?project_id=${projectId}`);
  }

  getFilterDropdownData(instanceId: string, criteria: SearchCriteria) {
    return forkJoin<JiraTicketIssueType[], JiraTicketStatusType[], JiraTicketPriorityType[]>(
      this.getIssueTypes(instanceId, criteria.params[0]['project_id']).pipe(catchError(error => of(undefined))),
      this.getStatusTypes(instanceId, criteria.params[0]['project_id']).pipe(catchError(error => of(undefined))),
      this.getPriorityTypes(instanceId, criteria.params[0]['project_id']).pipe(catchError(error => of(undefined))),
    )
  }

  buildFilterForm(queue: string) {
    let form = this.builder.group({
      'search_key': [null],
      'status': [null],
      'dateRange': [[moment().subtract(2, 'weeks'), moment()]],
      'start_date': [null],
      'end_date': [null],
      'priority': [null],
      'ticket_type': [null],
      'queue_id': [queue ? queue : null]
    });
    return form;
  }

  setDateRange(criteria: SearchCriteria) {
    if (criteria.params[0].start_date && criteria.params[0].end_date) {
      criteria.params[0].start_date = moment(criteria.params[0].start_date).startOf('d').toISOString();
      criteria.params[0].end_date = moment(criteria.params[0].end_date).endOf('d').toISOString();
    }
  }

  getTicketChartsData(instanceId: string, criteria: SearchCriteria): Observable<JiraTicketsGraphData> {
    this.setDateRange(criteria);
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<JiraTicketsGraphData>(`/customer/jira/instances/${instanceId}/get_graph_data/`, { params: params });
  }

  getTickets(instanceId: string, criteria: SearchCriteria): Observable<PaginatedResult<JiraTicketType>> {
    this.setDateRange(criteria);
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<JiraTicketType>>(`customer/jira/instances/${instanceId}/all_tickets_list/`, { params: params });
  }

  converToViewData(instanceId: string, projectId: string, tickets: JiraTicketType[]): JiraTicketViewData[] {
    let viewData: JiraTicketViewData[] = [];
    tickets.map(ticket => {
      let a: JiraTicketViewData = new JiraTicketViewData();
      // a.ticketId = ticket.ticket_uuid;
      a.ticketType = ticket.ticket_type ? ticket.ticket_type : 'N/A'
      a.ticketNumber = ticket.ticket_number ? ticket.ticket_number : 'N/A';
      a.title = ticket.title ? ticket.title : 'N/A';
      // a.description = ticket.description ? ticket.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      a.statusReason = ticket.status_reason ? ticket.status_reason : 'N/A';
      a.status = ticket.status ? ticket.status : 'N/A';
      a.priority = ticket.priority ? ticket.priority : 'N/A';
      a.openedAt = ticket.created_on ? this.utilSvc.toUnityOneDateFormat(ticket.created_on) : '';
      a.updatedOn = ticket.modified_on ? this.utilSvc.toUnityOneDateFormat(ticket.modified_on) : '';
      a.detailsUrl = `/support/ticketmgmt/${instanceId}/jira/projects/${projectId}/${ticket.ticket_number}/details`;
      viewData.push(a);
    });
    return viewData;
  }

  downloadReport(instanceId: string, criteria: SearchCriteria, feedback: boolean) {
    this.setDateRange(criteria);
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<{ data: string }>(`/customer/jira/instances/download_report/`, { params: params });
  }
}

export class JiraTicketViewData {
  ticketId: string;
  ticketType: string;
  ticketNumber: string;
  title: string;
  status: string;
  statusReason: string;
  priority: string;
  description: string;

  openedAt: string;
  updatedOn: string;
  detailsUrl: string;
}

export const JIRA_TICKET_STATES: Array<{ key: string, value: number }> = [
  {
    'key': 'Active',
    'value': 0
  },
  {
    'key': 'Resolved',
    'value': 1
  },
  {
    'key': 'Cancelled',
    'value': 2
  },
];

export const JIRA_TICKET_PRIORITIES: Array<{ key: string, value: number }> = [
  {
    'key': 'Critical',
    'value': 1
  },
  {
    'key': 'High',
    'value': 2
  },
  {
    'key': 'Normal',
    'value': 3
  },
  {
    'key': 'Low',
    'value': 100000004
  },
];

