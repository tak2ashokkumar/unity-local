import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { CREATE_MTP_ADMINISTRATION_SLA_GROUP, GET_SLA_ITEM_BY_INSTANCEID, MTP_ADMINISTRATION_SLA_GET_CRM_INSTANCES, MTP_ADMINISTRATION_SLA_GET_TENANTS_BY_CRM_INSTANCE_ID, MTP_ADMINISTRATION_SLA_ITEM_BY_INSTANCEID_AND_ITEM_ID } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { MtpAdministrationSlaCRMInstance, MtpAdministrationSlaCRMTenants, MtpAdministrationSlaGroupType } from '../mtp-administration-sla-group/mtp-administration-sla-group-crud/mtp-administration-sla-group-crud.type';
import { SlaGroupViewdata } from '../mtp-administration-sla-group/mtp-administration-sla-group.service';
import { MtpAdministrationSlaItemType } from './mtp-administration-sla-crud/mtp-administration-sla-crud.type';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MtpAdministrationServiceLevelAgreementService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private tableSvc: TableApiServiceService) { }

  getTenants(instanceId: string) {
    return this.http.get<MtpAdministrationSlaCRMTenants[]>(MTP_ADMINISTRATION_SLA_GET_TENANTS_BY_CRM_INSTANCE_ID(instanceId));
  }

  getSlaGroups(instanceId: string) {
    return this.http.get<MtpAdministrationSlaGroupType[]>(CREATE_MTP_ADMINISTRATION_SLA_GROUP(instanceId), { params: new HttpParams().set('page_size', 0) });
  }

  getDropdownData(cmrInstanceId: string): Observable<{ slaGroups: MtpAdministrationSlaGroupType[], tenants: MtpAdministrationSlaCRMTenants[] }> {
    return forkJoin({
      slaGroups: this.getSlaGroups(cmrInstanceId).pipe(catchError(error => of(undefined))),
      tenants: this.getTenants(cmrInstanceId).pipe(catchError(error => of(undefined))),
    });
  }

  convertToGroupViewdata(data: MtpAdministrationSlaGroupType[]) {
    let arr: SlaGroupViewdata[] = [];
    data.forEach(group => {
      let view = new SlaGroupViewdata();
      view.uuid = group.uuid;
      view.name = group.name;
      view.slaId = group.sla_id;
      arr.push(view);
    });
    return arr;
  }

  getSlaItems(instanceId: string, criteria: SearchCriteria, groupId: string) {
    let params: HttpParams = this.tableSvc.getWithParam(criteria);
    if (groupId) {
      params = params.append('group', groupId);
    }
    // else {

    //   return this.tableSvc.getData<PaginatedResult<MtpAdministrationSlaItemType>>(GET_SLA_ITEM_BY_INSTANCEID(instanceId), criteria);
    // }

    return this.http.get<PaginatedResult<MtpAdministrationSlaItemType>>(GET_SLA_ITEM_BY_INSTANCEID(instanceId), { params: params });
  }

  convertToViewdata(data: MtpAdministrationSlaItemType[]) {
    let arr: SlaItemViewdata[] = [];
    data.forEach(item => {
      let view = new SlaItemViewdata();
      view.itemId = item.uuid;
      view.groupId = item.sla_group;

      view.name = item.name;
      view.ticketType = item.request_type;
      view.priority = item.priority;
      view.tenants = item.tenant_names;
      arr.push(view);
    });
    return arr;
  }

  buildFilterForm() {
    return this.builder.group({
      'ticket_type': [''],
      'status': [''],
      'group': [[]],
      'tenants': [[]]
    });
  }

  deleteItem(instanceId: string, itemId: string) {
    return this.http.delete(MTP_ADMINISTRATION_SLA_ITEM_BY_INSTANCEID_AND_ITEM_ID(instanceId, itemId));
  }
}

export class SlaItemViewdata {
  constructor() { }
  itemId: string;
  groupId: number;
  name: string;
  ticketType: string;
  priority: string;
  tenants: string[];
}