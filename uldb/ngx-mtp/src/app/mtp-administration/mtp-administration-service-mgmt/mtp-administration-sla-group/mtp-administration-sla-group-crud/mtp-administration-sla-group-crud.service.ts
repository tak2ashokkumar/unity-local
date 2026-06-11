import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CREATE_MTP_ADMINISTRATION_SLA_GROUP, MTP_ADMINISTRATION_SLA_GET_CRM_INSTANCES, MTP_ADMINISTRATION_SLA_GET_TENANTS_BY_CRM_INSTANCE_ID, MTP_ADMINISTRATION_SLA_GROUP_BY_ID } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { MtpAdministrationSlaCRMInstance, MtpAdministrationSlaCRMTenants, MtpAdministrationSlaGroupCrudType, MtpAdministrationSlaGroupType } from './mtp-administration-sla-group-crud.type';

@Injectable()
export class MtpAdministrationSlaGroupCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getTenants(instanceId: string) {
    return this.http.get<MtpAdministrationSlaCRMTenants[]>(MTP_ADMINISTRATION_SLA_GET_TENANTS_BY_CRM_INSTANCE_ID(instanceId));
    // return this.http.get<MtpAdministrationSlaCRMTenants[]>(`/customer/mtp_dynamics_crm/instances/${instanceId}/mtpslagroup/assign_sla_tenants/`);
  }

  createForm(obj?: { groupId?: string, instanceId: string }): Observable<FormGroup> {
    if (obj) {
      return this.http.get<MtpAdministrationSlaGroupType>(MTP_ADMINISTRATION_SLA_GROUP_BY_ID(obj.instanceId, obj.groupId)).pipe(
        map(g => {
          let form = this.builder.group({
            'name': [g.name, [Validators.required, NoWhitespaceValidator]],
            'description': [g.description],
            'tenants': [g.tenants]
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': [''],
        'tenants': [[]]
      })).pipe(map(form => {
        return form;
      }));
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'tenants': ''
    };
  }

  validationMessages = {
    'name': {
      'required': 'Group name is required'
    },
    'tenants': {
      'required': 'Select atleast one tenant'
    }
  }

  createGroup(instanceId: string, obj: MtpAdministrationSlaGroupCrudType) {
    return this.http.post<MtpAdministrationSlaGroupCrudType>(CREATE_MTP_ADMINISTRATION_SLA_GROUP(instanceId), obj);
  }

  updateGroup(instanceId: string, groupId: string, obj: MtpAdministrationSlaGroupCrudType) {
    return this.http.put<MtpAdministrationSlaGroupCrudType>(MTP_ADMINISTRATION_SLA_GROUP_BY_ID(instanceId, groupId), obj);
  }
}
