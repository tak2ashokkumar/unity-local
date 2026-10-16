import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../shared/SharedEntityTypes/paginated.type';
import { TenantListData } from '../shared/SharedEntityTypes/tenants.type';
import { MTPServiceNowTicketType, MTPTicket, MTPTicketPriorityType, MTPTicketStatusType, ServiceNowChoices } from '../shared/SharedEntityTypes/ticket-mgmt.type';
import { AppUtilityService, DateRange, NoWhitespaceValidator, UnityTimeDuration } from '../shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from '../shared/table-functionality/search-criteria';
import { TableApiServiceService } from '../shared/table-functionality/table-api-service.service';
import { DOWNLOAD_SERVICE_NOW_TENANT_REPORT, GET_MTP_TICKET_PRIORITIES, GET_MTP_TICKET_STATUS, GET_SERVICE_NOW_TENANT_REPORT, GET_SERVICE_NOW_TENANT_TICKET_PRIORITIES, GET_SERVICE_NOW_TENANT_TICKETS, GET_SERVICE_NOW_TENANT_TICKET_STATES, GET_TENANTS, SYNC_MTP_TICKET_ATTRIBUTES } from '../shared/api-endpoint.const';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class MtpTicketMgmtService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private util: AppUtilityService,
    private tableService: TableApiServiceService,) { }

  getTenants(): Observable<TenantListData> {
    return this.http.get<TenantListData>(GET_TENANTS());
  }

  getTicketStatus(instanceId: string): Observable<MTPTicketStatusType[]> {
    return this.http.get<MTPTicketStatusType[]>(GET_MTP_TICKET_STATUS(instanceId));
  }

  getServiceNowTicketStatus(tenantUuid: string, ticketType: string): Observable<ServiceNowChoices[]> {
    return this.http.get<ServiceNowChoices[]>(GET_SERVICE_NOW_TENANT_TICKET_STATES(tenantUuid, ticketType));
  }

  getTicketStatusByITSMType(instanceId: string, itsmType: string, tenantUuid?: string, ticketType?: string): Observable<MTPTicketStatusType[] | ServiceNowChoices[]> {
    if (itsmType == 'servicenow') {
      return this.getServiceNowTicketStatus(tenantUuid, ticketType);
    }
    return this.getTicketStatus(instanceId);
  }

  getPriorities(instanceId: string): Observable<MTPTicketPriorityType[]> {
    return this.http.get<MTPTicketPriorityType[]>(GET_MTP_TICKET_PRIORITIES(instanceId));
  }

  getServiceNowTicketPriorities(tenantUuid: string, ticketType: string): Observable<ServiceNowChoices[]> {
    return this.http.get<ServiceNowChoices[]>(GET_SERVICE_NOW_TENANT_TICKET_PRIORITIES(tenantUuid, ticketType));
  }

  getTicketPriorityByITSMType(instanceId: string, itsmType: string, tenantUuid?: string, ticketType?: string): Observable<MTPTicketPriorityType[] | ServiceNowChoices[]> {
    if (itsmType == 'servicenow') {
      return this.getServiceNowTicketPriorities(tenantUuid, ticketType);
    }
    return this.getPriorities(instanceId);
  }

  buildForm(dateRange: DateRange): FormGroup {
    return this.builder.group({
      'status': ['all'],
      'priority': ['all'],
      'tenant': [''],
      'itsm_type': [{ value: '', disabled: true }],
      'ticket_type': ['all'],
      'from': [new Date(dateRange.from), [Validators.required, NoWhitespaceValidator]],
      'to': [new Date(dateRange.to), [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }

  getDateRangeByPeriod(durationRange: UnityTimeDuration): DateRange {
    const format = new DateRange().format;
    switch (durationRange) {
      case UnityTimeDuration.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().format(format) };
      case UnityTimeDuration.LAST_WEEK:
        return { from: moment().subtract(7, 'd').startOf('d').format(format), to: moment().format(format) };
      case UnityTimeDuration.LAST_MONTH:
        return { from: moment().subtract(30, 'd').startOf('d').format(format), to: moment().format(format) };
      default: return null;
    }
  }

  getDynamicCRMTickets(instanceId: string, criteria: SearchCriteria, formData: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('start_date', moment(formData.from).toISOString());
    params = params.append('end_date', moment(formData.to).toISOString());

    if (formData.tenant) {
      params = params.append('tenant', formData.tenant);
    }
    if (formData.ticket_type && formData.ticket_type != 'all') {
      params = params.append('ticket_type', formData.ticket_type);
    }
    if (formData.status && formData.status != 'all') {
      params = params.append('status', formData.status);
    }
    if (formData.priority && formData.priority != 'all') {
      params = params.append('priority', formData.priority);
    }

    return this.http.get<PaginatedResult<MTPTicket>>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/`, { params: params });
  }

  getServiceNowTickets(criteria: SearchCriteria, formData: any): Observable<PaginatedResult<MTPServiceNowTicketType>> {
    let params = new HttpParams();
    const pageNo = criteria.pageNo || 1;
    const pageSize = criteria.pageSize || PAGE_SIZES.DEFAULT_PAGE_SIZE;
    const searchValue = criteria.params && criteria.params[0] ? criteria.params[0]['search_key'] : '';
    const ordering = this.getServiceNowOrdering(criteria.sortColumn, criteria.sortDirection);

    params = params.set('tenant', formData.tenant);
    params = params.set('page_size', pageSize.toString());
    params = params.set('offset', ((pageNo - 1) * pageSize).toString());
    params = params.set('start_date', moment(formData.from).format('YYYY-MM-DD'));
    params = params.set('end_date', moment(formData.to).format('YYYY-MM-DD'));

    if (formData.ticket_type && formData.ticket_type != 'all') {
      params = params.set('ticket_type', formData.ticket_type);
    }
    if (searchValue) {
      params = params.set('search', searchValue.trim());
    }
    if (formData.status && formData.status != 'all') {
      params = params.set('state', formData.status);
    }
    if (formData.priority && formData.priority != 'all') {
      params = params.set('priority', formData.priority);
    }
    if (ordering) {
      params = params.set('ordering', ordering);
    }

    return this.http.get<PaginatedResult<MTPServiceNowTicketType>>(GET_SERVICE_NOW_TENANT_TICKETS(), { params })
      .pipe(map((res: PaginatedResult<MTPServiceNowTicketType>) => {
        return {
          ...res,
          count: Number(res.count || 0)
        };
      }));
  }

  getTicketsByITSMType(instanceId: string, criteria: SearchCriteria, formData: any): Observable<PaginatedResult<MTPTicket> | PaginatedResult<MTPServiceNowTicketType>> {
    if (formData.itsm_type == 'servicenow') {
      return this.getServiceNowTickets(criteria, formData);
    }
    return this.getDynamicCRMTickets(instanceId, criteria, formData);
  }

  convertToViewData(tickets: MTPTicket[]): MTPTicketViewData[] {
    let viewData: MTPTicketViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    tickets.map(t => {
      let a = new MTPTicketViewData();
      a.ticketId = t.ticket_uuid;
      a.ticketNumber = t.ticket_number;
      a.title = t.title;
      a.description = t.description;
      a.ticketType = t.ticket_type;
      a.ticketTypeName = t.ticket_type_name;
      a.priority = t.priority;
      a.priorityName = t.priority_name;
      a.status = t.status;
      a.statusReason = t.status_reason;
      a.statusReasonName = t.status_reason_name;
      a.createdOn = t.created_on ? datePipe.transform(t.created_on.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      a.modifiedOn = t.modified_on ? datePipe.transform(t.modified_on.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      a.resolvedOn = t.resolved_on ? datePipe.transform(t.resolved_on.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
      a.ticketOwner = t.ticket_owner;
      a.contact = t.contact;
      a.customerId = t.customer_id;
      a.customerName = t.customer_name;
      a.assignee = t.assignee_name;
      a.responseTime = t.response_time ? t.response_time : 'NA';
      a.responseTimeClass = t.response_time && t.response_time.startsWith("-") ? 'text-danger' : '';
      a.resolutionTime = t.resolution_time ? t.resolution_time : 'NA';
      a.resolutionTimeClass = t.resolution_time && t.resolution_time.startsWith("-") ? 'text-danger' : '';
      a.nextSLA = t.next_sla;
      viewData.push(a);
    })
    return viewData;
  }

  convertServiceNowToViewData(tickets: MTPServiceNowTicketType[]): MTPServiceNowTicketViewData[] {
    let viewData: MTPServiceNowTicketViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);

    tickets.map((ticket: MTPServiceNowTicketType) => {
      let a = new MTPServiceNowTicketViewData();
      a.ticketId = ticket.task_effective_number ? ticket.task_effective_number.display_value : ticket.number ? ticket.number.display_value : 'N/A';
      a.ticketType = this.getServiceNowTicketType(a.ticketId);
      a.sysId = ticket.sys_id ? ticket.sys_id.value : '';
      a.shortDescription = ticket.short_description ? ticket.short_description.display_value : 'N/A';
      a.state = ticket.state ? ticket.state.display_value : 'N/A';
      a.priority = ticket.priority ? ticket.priority.display_value : 'N/A';
      a.description = ticket.description ? ticket.description.display_value : 'N/A';
      a.openedAt = ticket.opened_at && ticket.opened_at.value ? datePipe.transform(ticket.opened_at.value.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      a.updatedOn = ticket.sys_updated_on && ticket.sys_updated_on.value ? datePipe.transform(ticket.sys_updated_on.value.replace(/\s/g, 'T'), environment.unityDateFormat) : 'N/A';
      a.resolution = ticket.resolved_at && ticket.resolved_at.value
        ? datePipe.transform(ticket.resolved_at.value.replace(/\s/g, 'T'), environment.unityDateFormat)
        : a.state;
      viewData.push(a);
    });

    return viewData;
  }

  private getServiceNowTicketType(ticketId: string): string {
    if (!ticketId) {
      return '';
    }

    const normalizedTicketId = ticketId.toUpperCase();

    if (normalizedTicketId.startsWith('CHG')) {
      return 'change_request';
    }

    if (normalizedTicketId.startsWith('INC')) {
      return 'incident';
    }

    if (normalizedTicketId.startsWith('PRB')) {
      return 'problem';
    }

    return '';
  }

  private getServiceNowOrdering(sortColumn: string, sortDirection: '' | 'asc' | 'desc'): string {
    if (!sortColumn) {
      return '';
    }

    const allowedFields = ['state', 'priority', 'opened_at', 'sys_updated_on'];
    if (allowedFields.indexOf(sortColumn) === -1) {
      return '';
    }

    return sortDirection === 'desc' ? `-${sortColumn}` : sortColumn;
  }

  syncAttributes(instanceId: string) {
    return this.http.post(SYNC_MTP_TICKET_ATTRIBUTES(instanceId), null);
  }

  downloadDynamicCRMReport(instanceId: string, formData: any) {
    let params = new HttpParams().set('page', 1).set('page_size', 10);
    params = params.append('start_date', moment(formData.from).toISOString());
    params = params.append('end_date', moment(formData.to).toISOString());
    return this.http.get<{ data: string }>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/download_report/`, { params: params });
  }

  downloadServiceNowReport(tenantUuid: string, fileType: string = 'csv') {
    return this.http.get<{ data: string }>(DOWNLOAD_SERVICE_NOW_TENANT_REPORT(tenantUuid, fileType));
  }

  getServiceNowReportUrl(fileName: string, fileType: string = 'csv') {
    return GET_SERVICE_NOW_TENANT_REPORT(fileName, fileType);
  }
}

export class MTPTicketViewData {
  ticketId: string;
  ticketNumber: string;
  title: string;
  ticketType: string;
  ticketTypeName: string;
  priority: string;
  priorityName: string;
  status: string;
  statusReason: string;
  statusReasonName: string;
  createdOn: string;
  modifiedOn: string;
  description: string;
  resolvedOn: string;
  ticketOwner: string;
  contact: string;
  customerId: string;
  customerName: string;
  assignee: string;
  responseTime: string;
  responseTimeClass: string;
  resolutionTime: string;
  resolutionTimeClass: string;
  nextSLA: string;
}

export class MTPServiceNowTicketViewData {
  ticketId: string;
  ticketType: string;
  sysId: string;
  shortDescription: string;
  state: string;
  priority: string;
  description: string;
  openedAt: string;
  updatedOn: string;
  resolution: string;
}

export enum MS_DYNAMICS_TICKET_TYPE {
  CHANGE = 'Change',
  INCIDENT = 'Incident',
  PROBLEM = 'Problem',
  QUESTION = 'Question',
  REQUEST = 'Request'
}

export const DYNAMIC_CRM_TICKET_TYPES = [
  MS_DYNAMICS_TICKET_TYPE.INCIDENT, MS_DYNAMICS_TICKET_TYPE.CHANGE, MS_DYNAMICS_TICKET_TYPE.PROBLEM, MS_DYNAMICS_TICKET_TYPE.QUESTION, MS_DYNAMICS_TICKET_TYPE.REQUEST,
];

export enum CRMTicketPriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  NORMAL = 'Normal',
  LOW = 'Low'
}

export const DYNAMIC_CRM_TICKET_PRIORITIES = [
  CRMTicketPriority.CRITICAL, CRMTicketPriority.HIGH, CRMTicketPriority.NORMAL, CRMTicketPriority.LOW
];

export enum MS_DYNAMICS_TICKET_STATUS {
  NEW = 'New',
  ASSIGNED = 'Assigned',
  INPROGRESS = 'In Progress',
  PENDING = 'Pending',
  ONHOLD = 'On Hold',
  RESOLVED = 'Resolved',
  CLOSE = 'Close',
}

export const DYNAMIC_CRM_TICKET_STATUS = [
  MS_DYNAMICS_TICKET_STATUS.NEW,
  MS_DYNAMICS_TICKET_STATUS.ASSIGNED,
  MS_DYNAMICS_TICKET_STATUS.INPROGRESS,
  MS_DYNAMICS_TICKET_STATUS.PENDING,
  MS_DYNAMICS_TICKET_STATUS.ONHOLD,
  MS_DYNAMICS_TICKET_STATUS.RESOLVED,
  MS_DYNAMICS_TICKET_STATUS.CLOSE,
];

export interface MTPTicketInput {
  subject: string;
  metadata: string;

  type?: string;
  staticType?: boolean;
  aiops?: boolean;
  feedback?: boolean;
  webaccess?: boolean;

  //only for JIRA
  projectId?: string;
  queueId?: string;
}
