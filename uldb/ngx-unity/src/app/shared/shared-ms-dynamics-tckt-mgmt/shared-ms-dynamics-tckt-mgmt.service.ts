import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { Observable, forkJoin, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DYNAMICCRM_FEEDBACK_TICKETS, DYNAMICCRM_FEEDBACK_TICKETS_REPORT, DYNAMICCRM_FEEDBACK_TICKET_GRAPHS, DYNAMICCRM_TICKETS, DYNAMICCRM_TICKETS_REPORT, DYNAMICCRM_TICKET_GRAPHS, GET_DYNAMIC_CRM_FEEDBACK_TICKET_PRIORITIES, GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATES, GET_DYNAMIC_CRM_FEEDBACK_TICKET_TYPES, GET_DYNAMIC_CRM_TICKET_PRIORITIES, GET_DYNAMIC_CRM_TICKET_STATES, GET_DYNAMIC_CRM_TICKET_TYPES, SYNC_DYNAMIC_CRM_TICKET_ATTRIBUTES } from '../api-endpoint.const';
import { PaginatedResult } from '../SharedEntityTypes/paginated.type';
import { SearchCriteria } from '../table-functionality/search-criteria';
import { TableApiServiceService } from '../table-functionality/table-api-service.service';
import { UserInfoService } from '../user-info.service';
import { MSDynamicsTicketGraphType, MSDynamicsTicketType } from './ms-dynamics-ticket-type';
import { DynamicCrmFeedbackTicketPriorityType, DynamicCrmFeedbackTicketStateType, DynamicCrmFeedbackTicketType, DynamicCrmTicketPriorityType, DynamicCrmTicketStateType, DynamicCrmTicketType } from '../SharedEntityTypes/crm.type';
import { catchError } from 'rxjs/operators';
import { AppUtilityService } from '../app-utility/app-utility.service';


@Injectable({
  providedIn: 'root'
})
export class SharedMsDynamicsTcktMgmtService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getTicketStates(instanceId: string, feedback: boolean): Observable<DynamicCrmTicketStateType[] | DynamicCrmFeedbackTicketStateType[]> {
    if (feedback) {
      return this.http.get<DynamicCrmFeedbackTicketStateType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_STATES());
    } else {
      return this.http.get<DynamicCrmTicketStateType[]>(GET_DYNAMIC_CRM_TICKET_STATES(instanceId));
    }
  }

  getTicketTypes(instanceId: string, feedback: boolean): Observable<DynamicCrmTicketType[] | DynamicCrmFeedbackTicketType[]> {
    if (feedback) {
      return this.http.get<DynamicCrmFeedbackTicketType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_TYPES());
    } else {
      return this.http.get<DynamicCrmTicketType[]>(GET_DYNAMIC_CRM_TICKET_TYPES(instanceId));
    }
  }

  getPriorities(instanceId: string, feedback: boolean): Observable<DynamicCrmTicketPriorityType[] | DynamicCrmFeedbackTicketPriorityType[]> {
    if (feedback) {
      return this.http.get<DynamicCrmFeedbackTicketPriorityType[]>(GET_DYNAMIC_CRM_FEEDBACK_TICKET_PRIORITIES());
    } else {
      return this.http.get<DynamicCrmTicketPriorityType[]>(GET_DYNAMIC_CRM_TICKET_PRIORITIES(instanceId));
    }
  }

  getDropdownData(instanceId: string, feedback: boolean): Observable<{ states: DynamicCrmTicketStateType[] | DynamicCrmFeedbackTicketStateType[], priorities: DynamicCrmTicketPriorityType[] | DynamicCrmFeedbackTicketPriorityType[] }> {
    return forkJoin({
      states: this.getTicketStates(instanceId, feedback).pipe(catchError(error => of(undefined))),
      priorities: this.getPriorities(instanceId, feedback).pipe(catchError(error => of(undefined))),
    })
  }

  syncAttributes(instanceId: string) {
    return this.http.post(SYNC_DYNAMIC_CRM_TICKET_ATTRIBUTES(instanceId), null);
  }

  buildFilterForm(isFeedback: boolean) {
    let form = this.builder.group({
      'status': [null],
      'priority': [null],
      'dateRange': [[moment().subtract(2, 'weeks'), moment()]],
      'start_date': [null],
      'end_date': [null],
      'search_key': [null],
    });

    if (!isFeedback) {
      form.addControl('ticket_type', new FormControl(null));
    }
    return form;
  }

  setDateRange(criteria: SearchCriteria) {
    if (criteria.params[0].start_date && criteria.params[0].end_date) {
      criteria.params[0].start_date = moment(criteria.params[0].start_date).startOf('d').toISOString();
      criteria.params[0].end_date = moment(criteria.params[0].end_date).endOf('d').toISOString();
    }
  }

  getTicketsByType(instanceId: string, criteria: SearchCriteria, feedback: boolean): Observable<PaginatedResult<MSDynamicsTicketType>> {
    this.setDateRange(criteria);
    const params: HttpParams = this.tableService.getWithParam(criteria);
    if (feedback) {
      return this.http.get<PaginatedResult<MSDynamicsTicketType>>(DYNAMICCRM_FEEDBACK_TICKETS(), { params: params });
    } else {
      return this.http.get<PaginatedResult<MSDynamicsTicketType>>(DYNAMICCRM_TICKETS(instanceId), { params: params });
    }
  }

  getDetailsUrl(instanceId: string, ticketId: string, feedback?: boolean) {
    if (feedback) {
      return `/support/feedback/${ticketId}/details`;
    }
    return `/support/ticketmgmt/${instanceId}/dynamics-crm-tickets/${ticketId}/details`;
    // switch (type) {
    //   case MS_DYNAMICS_TICKET_TYPE.CHANGE:
    //     return `/support/ticketmgmt/${instanceId}/dynamics-crm-changes/${ticketId}/details`;
    //   case MS_DYNAMICS_TICKET_TYPE.INCIDENT:
    //     return `/support/ticketmgmt/${instanceId}/dynamics-crm-incidents/${ticketId}/details`;
    //   case MS_DYNAMICS_TICKET_TYPE.PROBLEM:
    //     if (feedback) {
    //       return `/support/feedback/${ticketId}/details`;
    //     }
    //     return `/support/ticketmgmt/${instanceId}/dynamics-crm-problems/${ticketId}/details`;
    //   case MS_DYNAMICS_TICKET_TYPE.QUESTION:
    //     return `/support/ticketmgmt/${instanceId}/dynamics-crm-questions/${ticketId}/details`;
    //   case MS_DYNAMICS_TICKET_TYPE.REQUEST:
    //     return `/support/ticketmgmt/${instanceId}/dynamics-crm-requests/${ticketId}/details`;
    //   default:
    //     return `/support/ticketmgmt/${instanceId}/dynamics-crm-tickets/${ticketId}/details`;
    // }
  }

  converToViewData(instanceId: string, tickets: MSDynamicsTicketType[], feedback?: boolean): MSDynamicsTicketViewData[] {
    let viewData: MSDynamicsTicketViewData[] = [];
    tickets.map(ticket => {
      let a: MSDynamicsTicketViewData = new MSDynamicsTicketViewData();
      a.ticketId = ticket.ticket_uuid;
      a.ticketType = ticket.ticket_type ? ticket.ticket_type : 'N/A'
      a.ticketNumber = ticket.ticket_number ? ticket.ticket_number : 'N/A';
      a.title = ticket.title ? ticket.title : 'N/A';
      a.description = ticket.description ? ticket.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
      a.statusReason = ticket.status_reason ? ticket.status_reason : 'N/A';
      a.status = ticket.status ? ticket.status : 'N/A';
      a.priority = ticket.priority ? ticket.priority : 'N/A';
      a.openedAt = ticket.created_on ? this.utilSvc.toUnityOneDateFormat(ticket.created_on) : '';
      a.updatedOn = ticket.modified_on ? this.utilSvc.toUnityOneDateFormat(ticket.modified_on) : '';
      a.detailsUrl = this.getDetailsUrl(instanceId, a.ticketId, feedback);
      viewData.push(a);
    });
    return viewData;
  }

  getTicketChartsData(instanceId: string, criteria: SearchCriteria, feedback: boolean): Observable<MSDynamicsTicketGraphType> {
    this.setDateRange(criteria);
    let params: HttpParams = this.tableService.getWithParam(criteria);
    if (feedback) {
      return this.http.get<MSDynamicsTicketGraphType>(DYNAMICCRM_FEEDBACK_TICKET_GRAPHS(), { params: params });
    } else {
      return this.http.get<MSDynamicsTicketGraphType>(DYNAMICCRM_TICKET_GRAPHS(instanceId), { params: params });
    }
  }

  downloadReport(instanceId: string, criteria: SearchCriteria, feedback: boolean) {
    this.setDateRange(criteria);
    let params: HttpParams = this.tableService.getWithParam(criteria);
    if (feedback) {
      return this.http.get<{ data: string }>(DYNAMICCRM_FEEDBACK_TICKETS_REPORT(), { params: params });
    } else {
      return this.http.get<{ data: string }>(DYNAMICCRM_TICKETS_REPORT(instanceId), { params: params });
    }
  }
}

export class MSDynamicsTicketViewData {
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

export const CRM_TICKET_STATES: Array<{ key: string, value: number }> = [
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

export const CRM_TICKET_PRIORITIES: Array<{ key: string, value: number }> = [
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
