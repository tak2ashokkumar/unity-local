import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { CRMTenant } from 'src/app/shared/SharedEntityTypes/tenants.type';
import { MTPTicketInstance, MTPTicketPriorityType, MTPTicketType } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { catchError } from 'rxjs/operators';
import { GET_MTP_TICKET_PRIORITIES, GET_MTP_TICKET_TYPES } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class MtpCreateTicketService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userInfo: UserInfoService,
    private appService: AppLevelService,) { }

  getInstance() {
    return this.http.get<MTPTicketInstance[]>(`/customer/mtp_dynamics_crm/instances/?page_size=0`);
  }

  getCRMTenants(instanceId: string) {
    return this.http.get<CRMTenant[]>(`/customer/mtp_dynamics_crm/instances/${instanceId}/crmtenants/?page_size=0`);
  }

  getTicketTypes(instanceId: string): Observable<MTPTicketType[]> {
    return this.http.get<MTPTicketType[]>(GET_MTP_TICKET_TYPES(instanceId));
  }

  getPriorities(instanceId: string): Observable<MTPTicketPriorityType[]> {
    return this.http.get<MTPTicketPriorityType[]>(GET_MTP_TICKET_PRIORITIES(instanceId));
  }

  getDropdownData(instanceId: string): Observable<{ tenants: CRMTenant[], types: MTPTicketType[], priorities: MTPTicketPriorityType[] }> {
    return forkJoin({
      tenants: this.getCRMTenants(instanceId).pipe(catchError(error => of(undefined))),
      types: this.getTicketTypes(instanceId).pipe(catchError(error => of(undefined))),
      priorities: this.getPriorities(instanceId).pipe(catchError(error => of(undefined))),
    })
  }

  buildForm(): FormGroup {
    this.resetFormErrors();
    let form = this.builder.group({
      'subject': ['', [Validators.required, NoWhitespaceValidator]],
      'collaborators': ['', NoWhitespaceValidator],
      'type': [''],
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
}
