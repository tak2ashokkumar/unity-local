import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DOWNLOAD_NAGIOS_INSTANCE, GET_NAGIOS_INSTANCE, TOGGLE_NAGIOS_INSTANCE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ZabbixInstanceType } from './usi-event-ingestion-zabbix-crud/zabbix-instance-type';
import { UsiEventIntestionAccountType } from '../unity-setup-integration.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class UsiEventIngestionZabbixService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getAccounts() {
    let params = new HttpParams().set('page_size', 0);
    return this.http.get<UsiEventIntestionAccountType[]>(`/customer/monitoring-tool/zabbix/accounts/`, { params: params });
  }

  convertToViewData(data: UsiEventIntestionAccountType[]): ZabbixAccountViewData[] {
    let viewData: ZabbixAccountViewData[] = [];
    data.forEach(a => {
      let d: ZabbixAccountViewData = new ZabbixAccountViewData();
      d.uuid = a.uuid;
      d.name = a.name;
      d.url = a?.event_inbound_webhook?.webhook_url ? a?.event_inbound_webhook?.webhook_url : '';
      d.token = a?.event_inbound_webhook?.token ? a?.event_inbound_webhook?.token : '';
      d.ingestEvent = a.ingest_event;
      d.ingestEventIcon = a.ingest_event ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      d.downloadURL = `/customer/monitoring-tool/zabbix/accounts/${d.uuid}/download_script`;
      viewData.push(d);
    })
    return viewData;
  }

  buildPayloadForm(): FormGroup {
    return this.builder.group({
      'payload': ['', [Validators.required]],
      'response': ['']
    });
  }

  resetPaylodFormErrors() {
    return {
      'payload': '',
      'response': ''
    }
  }

  payloadValidationMessages = {
    'payload': {
      'required': 'Payload is required'
    }
  }

  getPayloadResponse(data: any, instanceId: string) {
    return this.http.post(`/customer/monitoring-tool/zabbix/accounts/${instanceId}/event_inbound_webhook/test_payload/`, data
      , { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    )
  }
}

export class ZabbixAccountViewData {
  constructor() { }
  uuid: string;
  name: string;
  url: string;
  downloadURL: string;
  token: string;
  ingestEvent: boolean;
  ingestEventIcon: string;
}