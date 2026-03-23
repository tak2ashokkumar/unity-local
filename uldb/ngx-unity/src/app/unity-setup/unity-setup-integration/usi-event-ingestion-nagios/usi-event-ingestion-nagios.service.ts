import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UsiEventIntestionAccountType } from '../unity-setup-integration.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class UsiEventIngestionNagiosService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getAccounts() {
    let params = new HttpParams().set('page_size', 0);
    return this.http.get<UsiEventIntestionAccountType[]>(`/customer/monitoring-tool/nagios/accounts/`, { params: params });
  }

  convertToViewData(data: UsiEventIntestionAccountType[]): NagiosAccountViewData[] {
    let viewData: NagiosAccountViewData[] = [];
    data.forEach(a => {
      let d: NagiosAccountViewData = new NagiosAccountViewData();
      d.uuid = a.uuid;
      d.name = a.name;
      d.url = a?.event_inbound_webhook?.webhook_url ? a?.event_inbound_webhook?.webhook_url : '';
      d.token = a?.event_inbound_webhook?.token ? a?.event_inbound_webhook?.token : '';
      d.ingestEvent = a.ingest_event;
      d.ingestEventIcon = a.ingest_event ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      d.downloadURL = `/customer/monitoring-tool/nagios/accounts/${d.uuid}/download_script`;
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
    return this.http.post(`/customer/monitoring-tool/nagios/accounts/${instanceId}/event_inbound_webhook/test_payload/`, data
      , { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    )
  }
}

export class NagiosAccountViewData {
  constructor() { }
  uuid: string;
  name: string;
  url: string;
  downloadURL: string;
  token: string;
  ingestEvent: boolean;
  ingestEventIcon: string;
}

