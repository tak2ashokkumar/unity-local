import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { GET_TENANTS, MTP_USER_MANAGEMENT_AUTO_REMEDIATION, MTP_USER_MANAGEMENT_DETAILS } from 'src/app/shared/api-endpoint.const';
import { TenantsInfoType, mtpAutoRemediationType } from './mtp-administration-auto-remediation.type';

@Injectable()
export class MtpAdministrationAutoRemediationService {

    constructor(
        private userInfo: UserInfoService,
        private http: HttpClient,
        private tableService: TableApiServiceService) { }


    // getautoRemediationDetails(criteria: SearchCriteria): Observable<PaginatedResult<mtpAutoRemediationType>> {
    //     return this.tableService.getData<PaginatedResult<mtpAutoRemediationType>>(MTP_USER_MANAGEMENT_DETAILS(), criteria);
    // }
    getautoRemediationDetailsWithoutPagination(): Observable<mtpAutoRemediationType> {
        return this.http.get<mtpAutoRemediationType>(MTP_USER_MANAGEMENT_DETAILS());
    }

    // toggleRemediationSettings(uuid:string): Observable<mtpAutoRemediationType> {
    //     return this.http.put<mtpAutoRemediationType>(MTP_USER_MANAGEMENT_AUTO_REMEDIATION(uuid));
    // }

    getAutoRem(criteria: SearchCriteria): Observable<PaginatedResult<mtpAutoRemediationType>> {
        // console.log(this.tableService.getWithParam(criteria));
        return this.tableService.getData<PaginatedResult<mtpAutoRemediationType>>(MTP_USER_MANAGEMENT_DETAILS(), criteria);
    }

    getAutoRemData(uuid: string): Observable<mtpAutoRemediationType> {
        // console.log('inside Service file');
        return this.http.get<mtpAutoRemediationType>(MTP_USER_MANAGEMENT_AUTO_REMEDIATION(uuid));
    }

    sendAutoRemData(obj: mtpAutoRemediationType, uuid: string): Observable<mtpAutoRemediationType> {
        return this.http.put<mtpAutoRemediationType>(MTP_USER_MANAGEMENT_AUTO_REMEDIATION(uuid), obj);
    }

    getTenants(): Observable<TenantsInfoType[]> {
        return this.http.get<TenantsInfoType[]>(GET_TENANTS());
    }

    convertToViewData(data: mtpAutoRemediationType[]): mtpAutoRemediationViewData[] {
        let viewData: mtpAutoRemediationViewData[] = [];
        data.map(s => {
            let a: mtpAutoRemediationViewData = new mtpAutoRemediationViewData();
            a.id = s.id;
            a.organizationName = s.organization_name;
            a.uuid = s.uuid;
            a.autoRemediationEnabled = s.auto_remediation_enabled;
            a.autoTicketingEnabled = s.auto_ticketing_enabled;
            a.contentType = s.content_type;
            a.ticketingInstance = s.ticketing_instance;
            a.objectId = s.object_id;
            a.autoTicketingSeverity = s.auto_ticketing_severity;
            a.autoTicketingDelay = s.auto_ticketing_delay;
            a.organization = s.organization;
            a.contentType = s.content_type;
            a.itemSelected = false;
            viewData.push(a);
        })

        return viewData;

    }

}

export class mtpAutoRemediationViewData {
    id: number;
    uuid: string;
    organizationName: string;
    autoRemediationEnabled: boolean;
    autoTicketingEnabled: boolean;
    objectId: number;
    ticketingInstance: MtpOrganizationSettingsTicketInstanceViewData;
    autoTicketingSeverity: string[];
    autoTicketingDelay: number;
    organization: number;
    itemSelected: boolean;
    contentType: string;

    constructor() { };
}

export interface MtpOrganizationSettingsTicketInstanceViewData {
    'default': boolean;
    type: string;
    name: string;
    uuid: string;
}