import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../shared/SharedEntityTypes/paginated.type';
import { CRMTenant } from '../shared/SharedEntityTypes/tenants.type';
import { MTPTicket, MTPTicketChartData, MTPTicketPriorityType, MTPTicketStatusType, MTPTicketsByPriorityData, MTPTicketsByResponseTimeData, MTPTicketsByStatusReasonData, MTPTicketsByTenantData } from '../shared/SharedEntityTypes/ticket-mgmt.type';
import { AppUtilityService, DateRange, NoWhitespaceValidator, UnityTimeDuration, incidantTicketStatusTypes } from '../shared/app-utility/app-utility.service';
import { ChartConfigService, NON_RELATED_COLOR_CODES, UnityChartData } from '../shared/chart-config.service';
import { SearchCriteria } from '../shared/table-functionality/search-criteria';
import { TableApiServiceService } from '../shared/table-functionality/table-api-service.service';
import { GET_MTP_TICKET_PRIORITIES, GET_MTP_TICKET_STATUS, SYNC_MTP_TICKET_ATTRIBUTES } from '../shared/api-endpoint.const';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MtpTicketMgmtService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private util: AppUtilityService,
    private chartConfigService: ChartConfigService,
    private tableService: TableApiServiceService,) { }

  getCRMTenants(instanceId: string) {
    return this.http.get<CRMTenant[]>(`/customer/mtp_dynamics_crm/instances/${instanceId}/crmtenants/?page_size=0`);
  }

  getTicketStatus(instanceId: string): Observable<MTPTicketStatusType[]> {
    return this.http.get<MTPTicketStatusType[]>(GET_MTP_TICKET_STATUS(instanceId));
  }

  getPriorities(instanceId: string): Observable<MTPTicketPriorityType[]> {
    return this.http.get<MTPTicketPriorityType[]>(GET_MTP_TICKET_PRIORITIES(instanceId));
  }

  getDropdownData(instanceId: string): Observable<{ tenants: CRMTenant[], status: MTPTicketStatusType[], priorities: MTPTicketPriorityType[] }> {
    return forkJoin({
      tenants: this.getCRMTenants(instanceId).pipe(catchError(error => of(undefined))),
      status: this.getTicketStatus(instanceId).pipe(catchError(error => of(undefined))),
      priorities: this.getPriorities(instanceId).pipe(catchError(error => of(undefined))),
    })
  }

  buildForm(dateRange: DateRange): FormGroup {
    return this.builder.group({
      'status': [''],
      'priority': [''],
      'period': [UnityTimeDuration.LAST_WEEK, [Validators.required]],
      'tenant': [''],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
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

  getTickets(instanceId: string, criteria: SearchCriteria, formData: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('start_date', moment(formData.from).toISOString());
    params = params.append('end_date', moment(formData.to).toISOString());
    if (formData.tenant) {
      params = params.append('tenant', formData.tenant);
    }
    if (formData.status) {
      params = params.append('status', formData.status);
    }
    if (formData.priority) {
      params = params.append('priority', formData.priority);
    }
    return this.http.get<PaginatedResult<MTPTicket>>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/`, { params: params })
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

  getChartData(instanceId: string, criteria: SearchCriteria, formData: any) {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('start_date', moment(formData.from).toISOString());
    params = params.append('end_date', moment(formData.to).toISOString());
    if (formData.tenant) {
      params = params.append('tenant', formData.tenant);
    }
    return this.http.get<MTPTicketChartData>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/get_graph_data/`, { params: params })
  }

  convertToTicketsByStatusChartData(data: MTPTicketsByStatusReasonData): UnityChartData {
    let a: UnityChartData = new UnityChartData();
    a.type = 'doughnut';
    a.legend = true;
    Object.keys(data).forEach((s) => {
      a.lables.push(s);
    });
    let pc: string[] = [];
    a.lables.forEach((lb, index) => {
      a.piedata.push(data[<string>lb]);
      pc.push(NON_RELATED_COLOR_CODES[index]);
    });
    a.colors.push({ backgroundColor: pc });
    a.options = this.chartConfigService.getDefaultPieChartOptions();
    a.options.legend.position = 'right';
    a.options.legend.labels = {
      boxWidth: 25, padding: 5, usePointStyle: false,
      generateLabels: (chart: Chart) => this.chartConfigService.getLegendLabels(chart, 30)
    };
    return a;
  }

  convertToTicketsByPriorityChartData(data: MTPTicketsByPriorityData): UnityChartData {
    let a: UnityChartData = new UnityChartData();
    a.type = 'doughnut';
    a.legend = true;
    Object.keys(data).map(p => {
      a.lables.push(p);
    });
    let pc: string[] = [];
    a.lables.forEach((lb, index) => {
      a.piedata.push(data[<string>lb]);
      switch (<string>lb) {
        case 'Critical': pc.push('#CC0000'); break;
        case 'High': pc.push('#FF8800'); break;
        case 'Normal': pc.push('#0B69C2'); break;
        case 'Low': pc.push('#0CBB70'); break;
      }
      if (index > 3) {
        pc.push(NON_RELATED_COLOR_CODES[index - 3 - 1]);
      }
    })
    a.colors.push({ backgroundColor: pc });
    a.options = this.chartConfigService.getDefaultPieChartOptions();
    a.options.legend.position = 'right';
    a.options.legend.labels = {
      boxWidth: 25, padding: 10, usePointStyle: true,
      generateLabels: (chart: Chart) => this.chartConfigService.getLegendLabels(chart, 30)
    };
    return a;
  }

  convertToTicketsByTenantData(data: MTPTicketsByTenantData): UnityChartData {
    let a: UnityChartData = new UnityChartData();
    a.type = 'doughnut';
    a.legend = true;
    Object.keys(data).map(k => {
      a.lables.push(k);
    })
    let pc: string[] = [];
    a.lables.forEach((lb, index) => {
      a.piedata.push(data[<string>lb]);
      pc.push(NON_RELATED_COLOR_CODES[index]);
    });
    a.colors.push({ backgroundColor: pc });
    a.options = this.chartConfigService.getDefaultPieChartOptions();
    a.options.legend.position = 'right';
    a.options.legend.labels = {
      boxWidth: 25, padding: 2, usePointStyle: false,
      generateLabels: (chart: Chart) => this.chartConfigService.getLegendLabels(chart, 30)
    };
    return a;
  }

  convertToOpenTicketsByResponseTimeChartData(data: MTPTicketsByResponseTimeData): UnityChartData {
    let a: UnityChartData = new UnityChartData();
    a.type = 'doughnut';
    a.legend = true;
    Object.keys(data).map(k => {
      a.lables.push(k);
    })
    let pc: string[] = [];
    a.lables.forEach((lb, index) => {
      a.piedata.push(data[<string>lb]);
      switch (<string>lb) {
        case 'greaterthan_month': pc.push('#CC0000'); break;
        case 'one_month': pc.push('#FF8800'); break;
        case 'one_week': pc.push('#0B69C2'); break;
        case 'one_day': pc.push('#0CBB70'); break;
      }
    });
    a.colors.push({ backgroundColor: pc });
    a.options = this.chartConfigService.getDefaultPieChartOptions();
    a.options.legend.position = 'right';
    a.options.legend.labels = {
      boxWidth: 25, padding: 10, usePointStyle: true,
      generateLabels: (chart: Chart) => this.chartConfigService.getLegendLabels(chart, 30)
    };
    return a;
  }

  syncAttributes(instanceId: string) {
    return this.http.post(SYNC_MTP_TICKET_ATTRIBUTES(instanceId), null);
  }

  downloadReport(instanceId: string, formData: any) {
    let params = new HttpParams().set('page', 1).set('page_size', 10);
    params = params.append('start_date', moment(formData.from).toISOString());
    params = params.append('end_date', moment(formData.to).toISOString());
    return this.http.get<{ data: string }>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/download_report/`, { params: params });
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
