import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DOWNLOAD_SERVICE_NOW_REPORT, GET_SERVICE_NOW_GRAPH_DATA, GET_SERVICE_NOW_PRIORITIES, GET_SERVICE_NOW_REPORT, GET_SERVICE_NOW_STATES, GET_SERVICE_NOW_TICKET_BY_TYPE } from '../api-endpoint.const';
import { AppUtilityService, SERVICE_NOW_TICKET_TYPE } from '../app-utility/app-utility.service';
import { PaginatedResult } from '../SharedEntityTypes/paginated.type';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { TableApiServiceService } from '../table-functionality/table-api-service.service';
import { ServiceNowChoices, ServiceNowGraphData, ServiceNowTicketType } from './service-now-ticket-type';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceNowMgmtService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getTicketsByType(instanceId: string, criteria: SearchCriteria): Observable<PaginatedResult<ServiceNowTicketType>> {
    return this.http.get<PaginatedResult<ServiceNowTicketType>>(GET_SERVICE_NOW_TICKET_BY_TYPE(instanceId), { params: this.tableService.getWithParam(criteria) });
  }

  private getState(instanceId: string, ticketType: string) {
    return this.http.get<ServiceNowChoices[]>(GET_SERVICE_NOW_STATES(instanceId, ticketType));
  }

  private getPriority(instanceId: string, ticketType: string) {
    return this.http.get<ServiceNowChoices[]>(GET_SERVICE_NOW_PRIORITIES(instanceId, ticketType));
  }

  getTicketsGraphData(instanceId: string, criteria: SearchCriteria): Observable<ServiceNowGraphData> {
    return this.http.get<ServiceNowGraphData>(GET_SERVICE_NOW_GRAPH_DATA(instanceId), { params: this.tableService.getWithParam(criteria) });
  }

  downloadReport(instanceId: string, criteria: SearchCriteria) {
    let params: HttpParams = new HttpParams().set('file_type', 'csv');
    const filterParams = criteria && criteria.params && criteria.params.length ? criteria.params[0] : {};

    if (filterParams['ticket_type']) {
      params = params.set('ticket_type', filterParams['ticket_type']);
    }

    if (filterParams['search']) {
      params = params.set('search', filterParams['search']);
    }

    if (filterParams['state']) {
      params = params.set('state', Array.isArray(filterParams['state']) ? filterParams['state'].join(',') : filterParams['state']);
    }

    if (filterParams['priority']) {
      params = params.set('priority', Array.isArray(filterParams['priority']) ? filterParams['priority'].join(',') : filterParams['priority']);
    }

    if (filterParams['start_date']) {
      params = params.set('start_date', filterParams['start_date']);
    }

    if (filterParams['end_date']) {
      params = params.set('end_date', filterParams['end_date']);
    }

    if (criteria && criteria.sortColumn) {
      params = params.set('ordering', criteria.sortDirection == 'desc' ? `-${criteria.sortColumn}` : criteria.sortColumn);
    }

    return this.http.get<{ data: string }>(DOWNLOAD_SERVICE_NOW_REPORT(instanceId), { params: params });
  }

  getReportUrl(instanceId: string, fileName: string, fileType: string = 'csv') {
    return `${GET_SERVICE_NOW_REPORT(instanceId)}?file_name=${fileName}&file_type=${fileType}`;
  }

  getStatePriorityGraphDataWithForkjoin(instanceId: string, criteria: SearchCriteria) {
    return forkJoin<ServiceNowChoices[], ServiceNowChoices[], ServiceNowGraphData>(
      this.getState(instanceId, criteria.params[0]['ticket_type']).pipe(catchError(error => of(undefined))),
      this.getPriority(instanceId, criteria.params[0]['ticket_type']).pipe(catchError(error => of(undefined))),
      this.getTicketsGraphData(instanceId, criteria).pipe(catchError(error => of(undefined)))
    )
  }

  private getIds(tickets: Ticket[]): { id: number }[] {
    let arr: { id: number }[] = [];
    tickets.map(ticket => {
      arr.push({ id: ticket.id });
    });
    return arr;
  }

  buildFilterForm(ticketType: string) {
    let form = this.builder.group({
      'state': [''],
      'tickets_for': [''],
      'search': [''],
      'priority': [''],
      'dateRange': [[moment().subtract(2, 'weeks'), moment()]],
      'start_date': [''],
      'end_date': ['']
    });

    if (!ticketType) {
      form.addControl('ticket_type', new FormControl(null));
    }

    return form;
  }

  /**
   * we have two kinds of details pages based on the type of ticket,if the ticket type is Change Reqest 
   * we are loading NowTicketDetailsComponent component else we are loading NowEnhancedTicketDetailsComponent component(for type Incident and Problem).
   * NowEnhancedTicketDetailsComponent has the enhanced details page where we give the service now ticket details to Chatgpt
   * llm model which analyses and provides the SOP(standard Operating Procedure),Simialr Tickets, etc.
   * for the ticket Type Change Request we are not loading the NowEnhancedTicketDetailsComponent, has the Change Request ticket type
   * will include some approval from the management, etc.
   * @param instanceId Servicenow account/instance id
   * @param type Service now ticket type(change request,incident,problem)
   * @param ticketId from Ticket details api json sys_id->value is taken as ticketId for showing details of Change Reqeuest ticket type
   * @param enhacedDetailsTicketId from Ticket details api json number->value is taken as enhacedDetailsTicketId for showing details of Incident and Problem ticket type
   * @param isEnhanceDetailsPage boolean value for differentiating to go NowTicketDetailsComponent or NowEnhancedTicketDetailsComponent
   * @returns route url based on ticket type and isEnhanceDetailsPage
   */
  getDetailsUrl(instanceId: string, type: string, ticketId: string, enhacedDetailsTicketId: string, isEnhanceDetailsPage: boolean) {
    switch (type) {
      case SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST:
        return `/support/ticketmgmt/${instanceId}/nowchange/${ticketId}/details`;
      case SERVICE_NOW_TICKET_TYPE.INCIDENT:
        return `/support/ticketmgmt/${instanceId}/nowincident/${enhacedDetailsTicketId}/enhanced-details`;
      case SERVICE_NOW_TICKET_TYPE.PROBLEM:
        return `/support/ticketmgmt/${instanceId}/nowproblem/${enhacedDetailsTicketId}/enhanced-details`;
      default:
        return `/support/ticketmgmt/${instanceId}/nowtickets/${isEnhanceDetailsPage ? enhacedDetailsTicketId : ticketId}/${isEnhanceDetailsPage ? 'enhanced-details' : 'details'}`;
    }
  }

  converToViewData(instanceId: string, tickets: ServiceNowTicketType[], type: SERVICE_NOW_TICKET_TYPE): ServiceNowTicketViewData[] {
    let viewData: ServiceNowTicketViewData[] = [];
    tickets.map((ticket: ServiceNowTicketType) => {
      let a: ServiceNowTicketViewData = new ServiceNowTicketViewData();
      a.ticketId = ticket.number ? ticket.number.display_value : '';
      a.ticketType = ticket.ticket_type ? ticket.ticket_type : type;
      a.enhacedDetailsTicketId = ticket.number ? ticket.number.value : '';
      a.isEnhanceDetailsPage = ticket.ticket_type == SERVICE_NOW_TICKET_TYPE.INCIDENT || ticket.ticket_type == SERVICE_NOW_TICKET_TYPE.PROBLEM;
      a.shortDescription = ticket.short_description ? ticket.short_description.display_value : '';
      a.description = ticket.description ? ticket.description.display_value.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      a.state = ticket.state ? ticket.state.display_value : '';
      a.priority = ticket.priority ? ticket.priority.display_value : '';
      a.urgency = ticket.urgency ? ticket.urgency.display_value || 'N/A' : '';
      a.severity = ticket.severity ? ticket.severity.display_value || 'N/A' : '';
      a.sysId = ticket.sys_id ? ticket.sys_id.value : '';
      a.openedAt = ticket.opened_at && ticket.opened_at.value ? this.utilSvc.toUnityOneDateFormat(ticket.opened_at.value) : '';
      a.resolvedAt = ticket.resolved_at && ticket.resolved_at.value ? this.utilSvc.toUnityOneDateFormat(ticket.resolved_at.value) : a.state;
      a.updatedOn = ticket.sys_updated_on && ticket.sys_updated_on.value ? this.utilSvc.toUnityOneDateFormat(ticket.sys_updated_on.value) : '';
      a.detailsUrl = this.getDetailsUrl(instanceId, a.ticketType as SERVICE_NOW_TICKET_TYPE, a.sysId, a.enhacedDetailsTicketId, a.isEnhanceDetailsPage);
      viewData.push(a);
    });
    return viewData;
  }
}
export class ServiceNowTicketViewData {
  ticketId: string;
  ticketType: string;
  enhacedDetailsTicketId: string;
  isEnhanceDetailsPage: boolean;
  sysId: string;
  state: string;
  priority: string;
  shortDescription: string;
  description: string;
  urgency: string;
  severity: string;

  openedAt: string;
  resolvedAt: string;
  updatedOn: string;
  detailsUrl: string;
}
