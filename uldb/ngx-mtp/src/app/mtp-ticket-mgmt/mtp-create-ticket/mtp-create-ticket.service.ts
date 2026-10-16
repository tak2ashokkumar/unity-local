import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { TenantListData } from 'src/app/shared/SharedEntityTypes/tenants.type';
import { MTPServiceNowTicketType, MTPTicketInstance, MTPTicketPriorityType, MTPTicketType, ServiceNowChoices } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { catchError } from 'rxjs/operators';
import { CREATE_SERVICE_NOW_TENANT_TICKET, GET_MTP_TICKET_PRIORITIES, GET_MTP_TICKET_TYPES, GET_SERVICE_NOW_TENANT_TICKET_BY_ID, GET_SERVICE_NOW_TENANT_TICKET_PRIORITIES, PUT_SERVICE_NOW_TENANT_TICKET } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class MtpCreateTicketService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userInfo: UserInfoService,
    private appService: AppLevelService,) { }

  getInstance(): Observable<MTPTicketInstance[]> {
    return this.http.get<MTPTicketInstance[]>(`/customer/mtp_dynamics_crm/instances/?page_size=0`);
  }

  getCRMTenants() {
    return this.http.get<TenantListData>(`/customer/mtp/tenant/`);
  }

  getTicketTypes(instanceId: string): Observable<MTPTicketType[]> {
    return this.http.get<MTPTicketType[]>(GET_MTP_TICKET_TYPES(instanceId));
  }

  getPriorities(instanceId: string): Observable<MTPTicketPriorityType[]> {
    return this.http.get<MTPTicketPriorityType[]>(GET_MTP_TICKET_PRIORITIES(instanceId));
  }

  getServiceNowTicketPriorities(tenantUuid: string, ticketType: string): Observable<ServiceNowChoices[]> {
    return this.http.get<ServiceNowChoices[]>(GET_SERVICE_NOW_TENANT_TICKET_PRIORITIES(tenantUuid, ticketType));
  }

  getServiceNowTicketData(tenantUuid: string, ticketId: string, ticketType: string): Observable<MTPServiceNowTicketType> {
    return this.http.get<MTPServiceNowTicketType>(GET_SERVICE_NOW_TENANT_TICKET_BY_ID(tenantUuid, ticketId, ticketType));
  }

  getDropdownData(instanceId: string): Observable<{ tenants: TenantListData, types: MTPTicketType[], priorities: MTPTicketPriorityType[] }> {
    return forkJoin({
      tenants: this.getCRMTenants().pipe(catchError(error => of(undefined))),
      types: this.getTicketTypes(instanceId).pipe(catchError(error => of(undefined))),
      priorities: this.getPriorities(instanceId).pipe(catchError(error => of(undefined))),
    })
  }

  buildForm(): FormGroup {
    this.resetFormErrors();
    let form = this.builder.group({
      'subject': ['', [Validators.required, NoWhitespaceValidator]],
      'collaborators': ['', NoWhitespaceValidator],
      'itsm_type': [{ value: '', disabled: true }, [Validators.required]],
      'type': ['', [Validators.required]],
      'priority': ['', [Validators.required, NoWhitespaceValidator]],
      // 'metadata': ['', NoWhitespaceValidator],
      'description': ['', [Validators.required, NoWhitespaceValidator]],
      'tenant': ['', [Validators.required, NoWhitespaceValidator]]
    });
    return form;
  }

  resetFormErrors(): any {
    let formErrors: any = {
      'subject': '',
      'itsm_type': '',
      'priority': '',
      'type': '',
      'description': '',
      'tenant': '',
    };
    return formErrors;
  }

  validationMessages = {
    'subject': {
      'required': 'Subject is required'
    },
    'type': {
      'required': 'Ticket type is required'
    },
    'itsm_type': {
      'required': 'ITSM Type is required'
    },
    'priority': {
      'required': 'Priority is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'tenant': {
      'required': 'Tenant is required'
    },
  };

  buildAttachmentForm() {
    return this.builder.group({});
  }

  toFormData<T>(formValue: T, formValue1: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }

    for (const key of Object.keys(formValue1)) {
      const value = formValue1[key];
      formData.append(key, this.appService.convertToBinary(value));
    }
    return formData;
  }

  saveTicket(instanceId: string, formdata: any): Observable<any> {
    return this.http.post<any>(`/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/`, formdata);
  }

  saveServiceNowTicket(tenantUuid: string, ticketType: string, formdata: any): Observable<any> {
    return this.http.post<any>(CREATE_SERVICE_NOW_TENANT_TICKET(tenantUuid, ticketType), formdata);
  }

  updateServiceNowTicket(tenantUuid: string, ticketType: string, ticketId: string, formdata: any): Observable<any> {
    return this.http.put<any>(PUT_SERVICE_NOW_TENANT_TICKET(tenantUuid, ticketType, ticketId), formdata);
  }

  convertServiceNowTicketToEditViewData(ticket: MTPServiceNowTicketType): MTPServiceNowEditTicketViewData {
    let viewData = new MTPServiceNowEditTicketViewData();
    viewData.subject = ticket.short_description ? ticket.short_description.display_value : '';
    viewData.description = ticket.description ? ticket.description.display_value : '';
    viewData.priority = ticket.priority ? ticket.priority.value : '';
    viewData.collaborators = ticket.collaborators ? ticket.collaborators.display_value : ticket.watch_list ? ticket.watch_list.display_value : '';
    return viewData;
  }
}

export class MTPServiceNowEditTicketViewData {
  subject: string;
  collaborators: string;
  priority: string;
  description: string;
}
