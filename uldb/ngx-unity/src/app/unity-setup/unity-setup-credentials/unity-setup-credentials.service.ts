import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS, UNITY_CREDENTIALS_BY_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnitySetupCredentials } from './unity-setup-credentials.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class UnitySetupCredentialsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getCredentials(criteria: SearchCriteria): Observable<PaginatedResult<UnitySetupCredentials>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<UnitySetupCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: params });
  }

  convertToViewData(data: UnitySetupCredentials[]): UnitySetupCredentialsViewData[] {
    let viewData: UnitySetupCredentialsViewData[] = [];
    data.map((d: UnitySetupCredentials) => {
      let a: UnitySetupCredentialsViewData = new UnitySetupCredentialsViewData();
      a.id = d.uuid;
      a.name = d.name;
      a.description = d.description;
      a.type = d.type;
      a.createdBy = d.created_by;
      a.modifiedBy = d.updated_by;
      a.modifiedDate = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      // a.devices = d.devices.map(device => device.name);
      a.devices = d.devices.length ? d.devices.map(device => device.name) : [];
      a.device = d.devices.length ? d.devices[0]?.name : '';
      a.devicesBadgeCount = d.devices.length ? d.devices.length - 1 : 0;
      a.devicesList = a.devices.length ? a.devices.slice(1) : [];
      viewData.push(a);
    })
    return viewData;
  }

  deleteCredential(uuid: string) {
    return this.http.delete(UNITY_CREDENTIALS_BY_ID(uuid));
  }
}

export class UnitySetupCredentialsViewData {
  constructor() { }
  id: string;
  name: string;
  description: string;
  type: string;
  createdBy: string;
  modifiedBy: string;
  modifiedDate: string;
  devices: string[];
  device: string;
  devicesBadgeCount: number;
  devicesList: string[];
}

export const credentialsTypesList: LabelValueType[] = [
  {
    'label': 'SNMPv1',
    'value': 'SNMPv1'
  },
  {
    'label': 'SNMPv2',
    'value': 'SNMPv2'
  },
  {
    'label': 'SNMPv3',
    'value': 'SNMPv3'
  },
  {
    'label': 'SSH',
    'value': 'SSH'
  },
  {
    'label': 'SSH Key',
    'value': 'SSH Key'
  },
  {
    'label': 'Windows',
    'value': 'Windows'
  },
  {
    'label': 'Default',
    'value': 'Default'
  },
  {
    'label': 'REDFISH',
    'value': 'REDFISH'
  },
  {
    'label': 'Database',
    'value': 'DATABASE'
  },
  {
    'label': 'API User',
    'value': 'API User'
  },
  {
    'label': 'API Token',
    'value': 'API Token'
  },
  {
    'label': 'CyberArk',
    'value': 'CyberArk'
  }
]