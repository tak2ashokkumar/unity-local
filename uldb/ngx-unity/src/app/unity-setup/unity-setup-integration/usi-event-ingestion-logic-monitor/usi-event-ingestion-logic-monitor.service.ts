import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DOWNLOAD_NAGIOS_INSTANCE, GET_NAGIOS_INSTANCE, TOGGLE_NAGIOS_INSTANCE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { LogicMonitorInstanceType } from './usi-event-ingestion-logic-monitor-crud/usi-event-ingestion-logic-monitor-crud.type';
import { UsiEventIntestionAccountType } from '../unity-setup-integration.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UsiEventIngestionLogicMonitorService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getAccounts() {
    let params = new HttpParams().set('page_size', 0);
    return this.http.get<UsiEventIntestionAccountType[]>(`/customer/monitoring-tool/logicmonitor/accounts/`, { params: params });
  }

  convertToViewData(data: UsiEventIntestionAccountType[]): LogicMonitorAccountViewData[] {
    let viewData: LogicMonitorAccountViewData[] = [];
    data.forEach(a => {
      let d: LogicMonitorAccountViewData = new LogicMonitorAccountViewData();
      d.uuid = a.uuid;
      d.name = a.name;
      d.url = a?.event_inbound_webhook?.webhook_url ? a?.event_inbound_webhook?.webhook_url : '';
      d.token = a?.event_inbound_webhook?.token ? a?.event_inbound_webhook?.token : '';
      d.ingestEvent = a.ingest_event;
      d.ingestEventIcon = a.ingest_event ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
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
    return this.http.post(`/customer/monitoring-tool/logicmonitor/accounts/${instanceId}/event_inbound_webhook/test_payload/`, data
      , { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    )
  }
}

export class LogicMonitorAccountViewData {
  constructor() { }
  uuid: string;
  name: string;
  url: string;
  token: string;
  ingestEvent: boolean;
  ingestEventIcon: string;
}