import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CREATE_MTP_ADMINISTRATION_SLA_GROUP, MTP_ADMINISTRATION_SLA_GET_CRM_INSTANCES, MTP_ADMINISTRATION_SLA_GET_TENANTS_BY_CRM_INSTANCE_ID, MTP_ADMINISTRATION_SLA_GROUP_BY_ID } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { MtpAdministrationSlaCRMInstance, MtpAdministrationSlaCRMTenants, MtpAdministrationSlaGroupType } from './mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.type';

@Injectable()
export class MtpAdministrationSlaGroupService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private tableSvc: TableApiServiceService) { }

  getCrmInstance() {
    return this.http.get<PaginatedResult<MtpAdministrationSlaCRMInstance>>(MTP_ADMINISTRATION_SLA_GET_CRM_INSTANCES());
  }

  getTenants(instanceId: string) {
    return this.http.get<MtpAdministrationSlaCRMTenants[]>(MTP_ADMINISTRATION_SLA_GET_TENANTS_BY_CRM_INSTANCE_ID(instanceId));
  }

  getSlaGroups(instanceId: string, criteria: SearchCriteria) {
    return this.tableSvc.getData<PaginatedResult<MtpAdministrationSlaGroupType>>(CREATE_MTP_ADMINISTRATION_SLA_GROUP(instanceId), criteria);
  }

  convertToViewdata(data: MtpAdministrationSlaGroupType[]) {
    let arr: SlaGroupViewdata[] = [];
    data.forEach(group => {
      let view = new SlaGroupViewdata();
      view.uuid = group.uuid;
      view.slaId = group.sla_id;
      view.name = group.name;
      view.description = group.description ? group.description : 'NA';
      if(group.tenant_names && group.tenant_names.length){
        let tenants = group.tenant_names.filter(t => t);
        view.tenants = tenants.length ? tenants : ['NA'];
      }else{
        view.tenants = ['NA']
      }
      arr.push(view);
    });
    return arr;
  }

  buildFilterForm() {
    return this.builder.group({
      'tenants': [[]]
    });
  }

  deleteGroup(instanceId: string, groupId: string) {
    return this.http.delete(MTP_ADMINISTRATION_SLA_GROUP_BY_ID(instanceId, groupId));
  }
}

export class SlaGroupViewdata {
  constructor() { }
  uuid: string;
  slaId: string;
  name: string;
  description: string;
  tenants: string[];
}

