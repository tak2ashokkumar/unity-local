import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { PublicCloudFast } from 'src/app/shared/SharedEntityTypes/public-cloud.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { AWS_CO2_DATA, GET_LDAP_CONFIG, PUBLIC_CLOUDS_FAST } from 'src/app/shared/api-endpoint.const';
import { LDAPConfigType } from '../unity-setup-ldap-config/unity-setup-ldap-config.type';
import { DeviceDiscoveryAgentConfigurationType } from '../unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { AwsImportDataType } from './usi-import-data/usi-import-data.service';
import { workflowIntegration } from './usi-workflow-integration/usi-workflow-integration.type';

@Injectable()
export class UnitySetupIntegrationService {

  constructor(private http: HttpClient) { }

  getTicketManagementList() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<TicketMgmtList[]>(`customer/itsm_accounts/`, { params: params })
  }

  getPublicClouds(): Observable<PublicCloudFast[]> {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<PublicCloudFast[]>(PUBLIC_CLOUDS_FAST(), { params: params });
  }

  getEventSources(): Observable<AIMLSourceData[]> {
    return this.http.get<AIMLSourceData[]>(`customer/aiops/event-source/?page_size=0`).pipe(map(res => res.filter(r => r.source)));
  }

  getLDAPConfigs(): Observable<LDAPConfigType[]> {
    return this.http.get<LDAPConfigType[]>(GET_LDAP_CONFIG());
  }

  getSustanabilityData(): Observable<AwsImportDataType[]> {
    return this.http.get<AwsImportDataType[]>(AWS_CO2_DATA(), { params: new HttpParams().set('page_size', '0') });
  }

  getWorkflowIntegrations(): Observable<workflowIntegration[]> {
    return this.http.get<workflowIntegration[]>('customer/workflow/integration/', { params: new HttpParams().set('page_size', '0') });
  }

  getOntapClusters(): Observable<UsiOntapCluster[]> {
    return this.http.get<UsiOntapCluster[]>('customer/fast/storagedevices/', { params: new HttpParams().set('page_size', '0').set('is_cluster', 'true') });
  }

  getPureStorageClusters(): Observable<any[]> {
    return this.http.get<any[]>(`customer/pure_storage/`, { params: new HttpParams().set('page_size', '0') });
  }

  getNetworkControllersList(): Observable<NerworkControllersType[]> {
    return this.http.get<NerworkControllersType[]>(`/customer/integration/network_controller_accounts`, { params: new HttpParams().set('page_size', '0') });
  }

  getVaultsList(): Observable<any[]> {
    return this.http.get<any[]>(`/customer/cyberark/accounts/`, { params: new HttpParams().set('page_size', '0') });
  }

  getOthersList(): Observable<OthersListType[]> {
    return this.http.get<OthersListType[]>(`/customer/integrations/others`, { params: new HttpParams().set('page_size', '0') });
  }

}

export const Categories = [
  { name: 'ITSM' },
  { name: 'Public Clouds' },
  { name: 'Private Clouds' },
  { name: 'LDAP' },
  { name: 'Storage' },
  { name: 'Import Data' },
  { name: 'Event Ingestion' },
  { name: 'Workflow' },
  { name: 'Network Controllers' },
  { name: 'Vaults' },
  { name: 'Others' }
];

// we are using this interface mainly for event ingestion common component form
export interface UsiAccount {
  //these below four properties are common in the api respose of public clouds(azure,aws etcc) and evnet ingestion(zabbix,nagios etc).
  uuid: string;
  name: string;
  event_inbound_webhook: UsiEventIngestion;

  ingest_event?: boolean;

  // these below fields are related to public clouds(azure,aws etc) these are not coming for event ingestiong(zabbix,nagios etc) made it has optional.
  discover_resources?: boolean;
  discover_dependency?: boolean;
  is_managed?: boolean;
  schedule_meta?: UnityScheduleType;
  colocation_cloud?: DatacenterFast;
  hostname?: string;
  username?: string;
  password?: string;
  resource_pool_name?: string;
  collector?: DeviceDiscoveryAgentConfigurationType;

  //these below fields are added for evnet ingestion
  ticket_subject_format: string,
}

export interface UsiEventIngestion {
  webhook_url: string;
  token: string;
  attribute_map: UsiEventIngestionAttribute[]
}

export interface UsiEventIngestionFields {
  meta_data: UsiEventIngestionParams[];
  attribute_map: UsiEventIngestionAttribute[]
}

export interface UsiEventIngestionParams {
  type: string;
  required: boolean;
  display_name: string;
  name: string;
  choices: any[];
}
export interface UsiEventIngestionAttribute {
  unity_attribute: string;
  mapped_attribute_expression: string;
  expression_type: string;
  regular_expression: string;
  choice_map: any[];
  custom_field?: string;
}

export interface UsiEventIntestionAccountType {
  uuid: string;
  name: string;
  event_inbound_webhook: UsiEventIngestion;
  ingest_event: boolean;
}

export class UsiAccountViewData {
  uuid: string;
  name: string;
  url: string;
  token: string;
  discoverResources: boolean;
  discoverResourcesIcon: string
  discoverDependency: boolean;
  discoverDependencyIcon: string;
  isManaged: boolean;
  isManagedIcon: string;
  ingestEvent: boolean;
  ingestEventIcon: string;
  syncInProgress: boolean = false;
}

export interface UsiEventIngestionTableColumnsModel {
  discoverReourcesFlag: boolean,
  discoverTopologyFlag: boolean,
  manageAccountFlag: boolean,
  eventIngestionFlag: boolean
};

export interface UsiEventIngestionTablleActionsModel {
  syncFlag: boolean,
  scheduleHistoryFlag: boolean,
  testPayloadFlag: boolean,
  copyKeyFlag: boolean,
  copyUrlFlag: boolean,
  editFlag: boolean,
  deleteFlaag: boolean
};

export interface UsiOntapCluster {
  name: string;
  id: number;
  uuid: string;
}

export interface OthersListType {
  uuid: string;
  name: string;
  type: string;
}

export interface NerworkControllersType extends OthersListType { }