import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';

@Injectable()
export class MtpAdministrationNotificationEventCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder
  ) { }

  getInstance() {
    return this.http.get<MTPTicketInstance[]>(`/customer/mtp_dynamics_crm/instances/?page_size=0`);
  }

  getCRMTenants(instanceId: string) {
    return this.http.get<CRMTenantDataType[]>(`/customer/mtp_dynamics_crm/instances/${instanceId}/crmtenants/?page_size=0`);
  }

  createForm(eventId?: string, instanceId?: string): Observable<FormGroup> {
    if (eventId && instanceId) {
      return this.http.get<eventDataType>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notification/${eventId}/`).pipe(map(event => {
        let form = this.builder.group({
          'ticket_type': [event.ticket_type, [Validators.required]],
          'severity': [event.severity, [Validators.required]],
          'event': [event.event, [Validators.required]],
          'tenant': [event.tenant, [Validators.required]],
          'event_status': [event.event_status, [Validators.required]]
        })
        return form;
      }))
    } else {
      return of(this.builder.group({
        'ticket_type': ['', [Validators.required]],
        'severity': ['', [Validators.required]],
        'event': [[], [Validators.required]],
        'tenant': [[], [Validators.required]],
        'event_status': [false, [Validators.required]]
      })).pipe(map(form => {
        return form;
      }))
    }
  }

  resetFormErrors() {
    return {
      'ticket_type': '',
      'severity': '',
      'event': '',
      'tenant': '',
      'event_status': '',
    };
  }

  validationMessages = {
    'ticket_type': {
      'required': 'Type is required'
    },
    'severity': {
      'required': 'Severity is required'
    },
    'event': {
      'required': 'Event is required'
    },
    'tenant': {
      'required': 'Tenant is required'
    },
    'event_status': {
      'required': 'Status is required'
    },
  }

  createEvent(instanceId: string, obj: any) {
    return this.http.post<eventDataType>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notification/`, obj);
  }

  updateEvent(eventId: string, instanceId: string, obj: any) {
    return this.http.patch<eventDataType>(`/customer/mtp_dynamics_crm/instances/${instanceId}/notification/${eventId}/`, obj);
  }

}

export interface eventDataType {
  tenant: number[];
  ticket_type: string[];
  severity: string[];
  event: string[];
  event_status: boolean;
}

export interface CRMTenantDataType {
  uuid: string;
  name: string;
  tenant_uuid: string;
  parent_account: number;
  account_uuid: string;
  id: number;
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
    value: 'Critical'
  },
  // {
  //   label: 'Warning',
  //   value: 'warning'
  // },
  // {
  //   label: 'Information',
  //   value: 'information'
  // },
  {
    label: 'High',
    value: 'High'
  },
  {
    label: 'Low',
    value: 'Low'
  },
  {
    label: 'Normal',
    value: 'Normal'
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