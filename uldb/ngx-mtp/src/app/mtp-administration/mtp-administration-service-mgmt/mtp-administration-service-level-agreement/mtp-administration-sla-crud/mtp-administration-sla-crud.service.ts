import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CREATE_MTP_ADMINISTRATION_SLA_GROUP, GET_MTP_KPIS, GET_MTP_TICKET_PRIORITIES, GET_MTP_TICKET_STATUS, GET_MTP_TICKET_TYPES, MTP_ADMINISTRATION_SLA_ITEM_BY_INSTANCEID_AND_ITEM_ID } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { MtpAdministrationSlaGroupType } from '../../mtp-administration-sla-group/mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.type';
import { MtpAdministrationSlaItemType, MtpCrmContactsType, MtpKpiType } from './mtp-administration-sla-crud.type';
import { MTPTicketPriorityType, MTPTicketStatusType, MTPTicketType } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';

@Injectable()
export class MtpAdministrationSlaCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getSlaGroups(instanceId: string) {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<MtpAdministrationSlaGroupType[]>(CREATE_MTP_ADMINISTRATION_SLA_GROUP(instanceId), { params: params });
  }

  getTicketTypes(instanceId: string): Observable<MTPTicketType[]> {
    return this.http.get<MTPTicketType[]>(GET_MTP_TICKET_TYPES(instanceId));
  }

  getKpis(instanceId: string): Observable<MtpKpiType[]> {
    return this.http.get<MtpKpiType[]>(GET_MTP_KPIS(instanceId));
  }

  getPriorities(instanceId: string): Observable<MTPTicketPriorityType[]> {
    return this.http.get<MTPTicketPriorityType[]>(GET_MTP_TICKET_PRIORITIES(instanceId));
  }

  getTicketStatus(instanceId: string): Observable<MTPTicketStatusType[]> {
    return this.http.get<MTPTicketStatusType[]>(GET_MTP_TICKET_STATUS(instanceId));
  }

  getDropdownData(instanceId: string): Observable<{ slaGroups: MtpAdministrationSlaGroupType[], types: MTPTicketType[], kpis: MtpKpiType[], status: MTPTicketStatusType[], slaPriorities: MTPTicketPriorityType[] }> {
    return forkJoin({
      slaGroups: this.getSlaGroups(instanceId).pipe(catchError(error => of(undefined))),
      types: this.getTicketTypes(instanceId).pipe(catchError(error => of(undefined))),
      kpis: this.getKpis(instanceId).pipe(catchError(error => of(undefined))),
      status: this.getTicketStatus(instanceId).pipe(catchError(error => of(undefined))),
      slaPriorities: this.getPriorities(instanceId).pipe(catchError(error => of(undefined))),
    });
  }

  getCrmContacts(instanceId: string, tenants?: string[]) {
    let params: HttpParams = new HttpParams();
    if (tenants && tenants.length) {
      tenants.map(t => {
        params = params.append('tenant', t);
      })
    }
    return this.http.get<MtpCrmContactsType[]>(`/customer/mtp_dynamics_crm/instances/${instanceId}/crmcontacts/`, { params: params })
  }

  createForm(obj?: { itemId?: string, instanceId: string }, responseSlaKpiList?: MtpKpiType[], resolutionSlaKpiList?: MtpKpiType[], responseSuccessConditionList?: MTPTicketStatusType[]): Observable<FormGroup> {
    if (obj) {
      return this.http.get<MtpAdministrationSlaItemType>(MTP_ADMINISTRATION_SLA_ITEM_BY_INSTANCEID_AND_ITEM_ID(obj.instanceId, obj.itemId)).pipe(
        map(item => {
          let responseSlaKpiObj: MtpKpiType = responseSlaKpiList.find((responseSlaKpi) => responseSlaKpi.msdyn_slakpiid == item.response_sla_kpi.msdyn_slakpiid);
          let resolutionSlaKpiObj: MtpKpiType = resolutionSlaKpiList.find((resolutionSlaKpi) => resolutionSlaKpi.msdyn_slakpiid == item.resolution_sla_kpi.msdyn_slakpiid);
          let responseSuccessConditionObj: MTPTicketStatusType = responseSuccessConditionList.find((response) => response.display_name == item.response_success_condition_values_map.display_name);
          let form: FormGroup = this.builder.group({
            'uuid': [item.uuid],
            'sla_group': [{ value: item.sla_group, disabled: true }, [Validators.required, NoWhitespaceValidator]],
            'name': [item.name, [Validators.required, NoWhitespaceValidator]],
            'request_type': [{ value: item.request_type, disabled: true }, [Validators.required]],
            'response_sla_kpi': [{ value: responseSlaKpiObj, disabled: true }, [Validators.required]],
            'resolution_sla_kpi': [{ value: resolutionSlaKpiObj, disabled: true }, [Validators.required]],
            'response_success_condition_values_map': [{ value: responseSuccessConditionObj, disabled: true }, [Validators.required]],
            'resolution_success_condition_values_map': [{ value: item.resolution_success_condition_values_map, disabled: true }, [Validators.required]],
            'priority': [{ value: item.priority, disabled: true }, [Validators.required]],
            'response_sla_hr': [item.response_sla_hr, [Validators.required, Validators.min(0)]],
            'response_sla_min': [item.response_sla_min, [Validators.required, Validators.min(0), Validators.max(59)]],
            'response_emails': [item.response_emails],
            'response_reminder_percentage': [item.response_reminder_percentage, [Validators.required]],
            'resolution_sla_hr': [item.resolution_sla_hr, [Validators.required, Validators.min(0)]],
            'resolution_sla_min': [item.resolution_sla_min, [Validators.required, Validators.min(0), Validators.max(59)]],
            'resolution_emails': [item.resolution_emails],
            'resolution_reminder_percentage': [item.resolution_reminder_percentage, [Validators.required]],
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'sla_group': ['', [Validators.required, NoWhitespaceValidator]],
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'request_type': ['', [Validators.required]],
        'response_sla_kpi': ['', [Validators.required]],
        'resolution_sla_kpi': ['', [Validators.required]],
        'response_success_condition_values_map': ['', [Validators.required]],
        'resolution_success_condition_values_map': [[], [Validators.required]],
        'priority': ['', [Validators.required]],
        'response_sla_hr': [null, [Validators.required, Validators.min(0)]],
        'response_sla_min': [null, [Validators.required, Validators.min(0), Validators.max(59)]],
        'response_emails': [[]],
        'response_reminder_percentage': ['', [Validators.required]],
        'resolution_sla_hr': [null, [Validators.required, Validators.min(0)]],
        'resolution_sla_min': [null, [Validators.required, Validators.min(0), Validators.max(59)]],
        'resolution_emails': [[]],
        'resolution_reminder_percentage': ['', [Validators.required]],
      })).pipe(map(form => {
        return form;
      }));
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'sla_group': '',
      'request_type': '',
      'response_sla_kpi': '',
      'resolution_sla_kpi': '',
      'response_success_condition_values_map': '',
      'resolution_success_condition_values_map': '',
      'priority': '',
      'response_sla_hr': '',
      'response_sla_min': '',
      'response_emails': '',
      'response_reminder_percentage': '',
      'resolution_sla_hr': '',
      'resolution_sla_min': '',
      'resolution_emails': '',
      'resolution_reminder_percentage': '',
    };
  }

  validationMessages = {
    'sla_group': {
      'required': 'SLA group is required'
    },
    'name': {
      'required': 'Group name is required'
    },
    'request_type': {
      'required': 'Request type is required'
    },
    'response_sla_kpi': {
      'required': 'KPI response is required'
    },
    'resolution_sla_kpi': {
      'required': 'KPI resolution is required'
    },
    'response_success_condition_values_map': {
      'required': 'Response success condition is required'
    },
    'resolution_success_condition_values_map': {
      'required': 'Resolution success condition is required'
    },
    'priority': {
      'required': 'Priority is required'
    },
    'response_sla_hr': {
      'required': 'Hours is required',
      'min': 'Enter a valid time'
    },
    'response_sla_min': {
      'required': 'Minutes is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    // 'response_emails': {
    //   'required': 'Response emails is required'
    // },
    'response_reminder_percentage': {
      'required': 'Reminder is required'
    },
    'resolution_sla_hr': {
      'required': 'Hours is required',
      'min': 'Enter a valid time'
    },
    'resolution_sla_min': {
      'required': 'Minutes is required',
      'min': 'Enter a valid time',
      'max': 'Enter a valid time'
    },
    // 'resolution_emails': {
    //   'required': 'Resolution emails is required'
    // },
    'resolution_reminder_percentage': {
      'required': 'Reminder is required'
    },
  }

  createItem(instanceId: string, obj: MtpAdministrationSlaItemType) {
    return this.http.post<MtpAdministrationSlaItemType>(`/customer/mtp_dynamics_crm/instances/${instanceId}/crmslaitem/`, obj);
  }

  updateItem(instanceId: string, obj: MtpAdministrationSlaItemType) {
    return this.http.put<MtpAdministrationSlaItemType>(`/customer/mtp_dynamics_crm/instances/${instanceId}/crmslaitem/${obj.uuid}/`, obj);
  }

}

export class SlaItemCrudSlaGroupViewdata {
  constructor() { }
  sla_id: string;
  name: string;
}