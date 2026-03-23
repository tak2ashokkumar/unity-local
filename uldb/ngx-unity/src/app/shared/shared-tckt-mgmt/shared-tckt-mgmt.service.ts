import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TicketViewData } from 'src/app/shared/SharedEntityTypes/ticket-view.type';
import { CHECK_USER_IN_ZENDESK, GET_OPEN_TICKET_COUNT, GET_TICKETS_BY_TYPE, GET_TICKET_GRAPH_DATA, GET_TICKET_METRICS } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { CeleryTask } from '../SharedEntityTypes/celery-task.type';
import { TaskStatus } from '../SharedEntityTypes/task-status.type';
import { AppUtilityService, TICKET_TYPE } from '../app-utility/app-utility.service';


@Injectable({
  providedIn: 'root'
})
export class SharedTcktMgmtService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getTicketsByType(criteria: SearchCriteria): Observable<PaginatedResult<Ticket>> {
    return this.tableService.getData<PaginatedResult<Ticket>>(GET_TICKETS_BY_TYPE(), criteria);
  }

  private getIds(tickets: Ticket[]): { id: number }[] {
    let arr: { id: number }[] = [];
    tickets.map(ticket => {
      arr.push({ id: ticket.id });
    });
    return arr;
  }

  getTicketMetrics(tickets: Ticket[]): Observable<TicketMetric> {
    return this.http.post<TicketMetric>(GET_TICKET_METRICS(), this.getIds(tickets));
  }

  private getWithParam(criteria: SearchCriteria) {
    let params: HttpParams = new HttpParams();
    if (criteria.params) {
      criteria.params.forEach(element => {
        for (const key in element) {
          if (element.hasOwnProperty(key) && element[key]) {
            params = params.set(key, element[key]);
          }
        }
      });
    }
    return params.keys().length ? params : null;
  }

  getOpenTicketsCount(criteria: SearchCriteria): Observable<OpenTicketsCount> {
    return this.http.get<OpenTicketsCount>(GET_OPEN_TICKET_COUNT(), { params: this.getWithParam(criteria) });
  }

  checkUserInZendesk() {
    return this.http.get<{ status: string, status_message: string }>(CHECK_USER_IN_ZENDESK());
  }

  getTicketsGraphData(criteria: SearchCriteria): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(GET_TICKET_GRAPH_DATA(), { params: this.getWithParam(criteria) })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))), take(1));
  }

  buildFilterForm() {
    return this.builder.group({
      'status': ['open'],
      'tickets_for': ['all_tickets'],
      'search': [''],
      'priority': [''],
      'dateRange': [[moment().subtract(2, 'weeks'), moment()]],
      'start_date': [''],
      'end_date': ['']
    });
  }

  getDetailsUrl(instanceId: string, type: string, ticketId: number, feedback?: boolean) {
    switch (type) {
      case TICKET_TYPE.TASK:
        return `/support/ticketmgmt/${instanceId}/changetickets/${ticketId}/details`;
      case TICKET_TYPE.INCIDENT:
        return `/support/ticketmgmt/${instanceId}/existingtickets/${ticketId}/details`;
      case TICKET_TYPE.PROBLEM:
      case TICKET_TYPE.QUESTION:
        if (feedback) {
          return `/support/feedback/${ticketId}/details`;
        }
        return `/support/ticketmgmt/${instanceId}/servicerequests/${ticketId}/details`;
    }
  }

  converToViewData(instanceId: string, tickets: Ticket[], feedback?: boolean): TicketViewData[] {
    let viewData: TicketViewData[] = [];
    tickets.map((ticket: Ticket) => {
      let a: TicketViewData = new TicketViewData();
      a.id = ticket.id;
      a.subject = ticket.subject;
      a.status = ticket.status;
      a.priority = ticket.priority;
      a.created_at = ticket.created_at ? this.utilSvc.toUnityOneDateFormat(ticket.created_at) : 'N/A';
      a.detailsUrl = this.getDetailsUrl(instanceId, ticket.type, ticket.id, feedback);
      viewData.push(a);
    });
    return viewData;
  }
}