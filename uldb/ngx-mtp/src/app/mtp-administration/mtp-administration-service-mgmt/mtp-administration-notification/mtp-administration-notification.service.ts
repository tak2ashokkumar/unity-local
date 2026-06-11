import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { CRMTenantDataType } from './mtp-administration-notification-event-crud/mtp-administration-notification-event-crud.service';

@Injectable()
export class MtpAdministrationNotificationService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,) { }

  getEvents(criteria: SearchCriteria, instanceId: string): Observable<PaginatedResult<AlertNotificationSettings>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<AlertNotificationSettings>>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notification/`, { params: params });
  }

  getInstance() {
    return this.http.get<MTPTicketInstance[]>(`/customer/mtp_dynamics_crm/instances/?page_size=0`);
  }

  getCRMTenants(instanceId: string) {
    return this.http.get<CRMTenantDataType[]>(`/customer/mtp_dynamics_crm/instances/${instanceId}/crmtenants/?page_size=0`);
  }

  convertToViewData(groupSettings: AlertNotificationSettings[]): AlertNotificationSettingsViewData[] {
    let viewData: AlertNotificationSettingsViewData[] = [];
    groupSettings.map(s => {
      let a = new AlertNotificationSettingsViewData();
      a.eventId = s.uuid;
      a.tenants = s.tenant_names.length ? s.tenant_names : [];
      a.tenantName = s.tenant_names.length ? s.tenant_names.getFirst() : '';
      a.tenantBadgeCount = s.tenant_names.length ? s.tenant_names.length - 1 : 0;
      a.tenantNameList = a.tenants.length ? a.tenants.slice(1) : [];
      a.events = s.event.length ? s.event : [];
      a.event = s.event.length ? s.event.getFirst() : '';
      a.eventBadgeCount = s.event.length ? s.event.length - 1 : 0;
      a.eventsList = a.events.length ? a.events.slice(1) : [];
      a.ticketType = s.ticket_type;
      a.severity = s.severity;
      a.eventStatus = s.event_status;
      viewData.push(a);
    })
    return viewData;
  }

  toggleStatus(uuid: string, status: boolean, instanceId: string) {
    return this.http.patch<any>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notification/${uuid}/`, { 'event_status': status });
  }

  deleteEvent(uuid: string, instanceId: string) {
    return this.http.delete<any>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notification/${uuid}/`);
  }
}

export class AlertNotificationSettingsViewData {
  eventId: string;
  ticketType: string[];
  severity: string[];
  eventStatus: boolean;
  events: string[];
  event: string;
  eventBadgeCount: number;
  eventsList: string[];
  tenants: string[];
  tenantName: string;
  tenantBadgeCount: number;
  tenantNameList: string[];
}

export interface AlertNotificationSettings {
  uuid: string;
  tenant_names: string[];
  ticket_type: string[];
  severity: string[];
  event: string[];
  email_list: null;
  event_status: boolean;
  user: string;
  created_by: number;
}

export const ticketTypeOptions = [
  {
    label: 'Incident',
    value: 'Incident'
  },
  {
    label: 'Problem',
    value: 'Problem'
  },
  {
    label: 'Change',
    value: 'Change'
  },
  {
    label: 'Service Request',
    value: 'Service Request'
  },
  {
    label: 'Question',
    value: 'Question'
  },
]

export const severityOptions = [
  {
    label: 'Critical',
    value: 'critical'
  },
  {
    label: 'Warning',
    value: 'warning'
  },
  {
    label: 'Information',
    value: 'information'
  },
  {
    label: 'High',
    value: 'High'
  },
  {
    label: 'Low',
    value: 'Low'
  },
]

export const statusOptions = [
  {
    label: 'Enable',
    value: 'enabled'
  },
  {
    label: 'Disable',
    value: 'disabled'
  },
]

export const eventOptions = [
  {
    label: 'Create',
    value: 'Create'
  },
  {
    label: 'Update',
    value: 'Update'
  },
  {
    label: 'Resolve',
    value: 'Resolve'
  },
  {
    label: 'Status Change',
    value: 'Status Change'
  },
]
