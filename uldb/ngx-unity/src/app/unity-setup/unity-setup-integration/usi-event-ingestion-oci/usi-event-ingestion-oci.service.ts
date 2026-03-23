import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_NAGIOS_INSTANCE, TOGGLE_NAGIOS_INSTANCE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { OciInstanceType } from './usi-event-ingestion-oci-crud/usi-event-ingestion-oci-crud.type';

@Injectable()
export class UsiEventIngestionOciService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService ) { }

  getInstances() {
    let params = new HttpParams().set('page_size', 0);
    params = params.append('source', 'Oci');
    return this.http.get<OciInstanceType[]>(GET_NAGIOS_INSTANCE(), { params: params });
  }

  convertToViewData(data: OciInstanceType[]): OciInstanceViewData[] {
    let viewData: OciInstanceViewData[] = [];
    data.forEach(a => {
      let d: OciInstanceViewData = new OciInstanceViewData();
      d.id = a.id;
      d.uuid = a.uuid;
      d.name = a.name;
      d.type = a.ingestion_type;
      d.typeUrl = a.webhook_url;
      d.url = a.host_identity;
      d.lastIngestion = a.last_ingestion ? this.utilSvc.toUnityOneDateFormat(a.last_ingestion) : 'N/A';
      d.enabled = a.enabled;
      d.statusIconTooltip = a.enabled ? 'Disable' : 'Enable';
      d.statusIconClass = a.enabled ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
      d.downloadURL = '';
      d.token = a.token;
      d.isCopied = false;
      d.copyKeyTooltipMessage = 'Copy Key To Clipboard';
      viewData.push(d);
    })
    return viewData;
  }

  toggleInstance(uuid: string) {
    return this.http.get(TOGGLE_NAGIOS_INSTANCE(uuid));
  }
}

export class OciInstanceViewData {
  constructor() { }
  uuid: string;
  id: string;
  name: string;
  type: string;
  typeUrl: string;
  url: string;
  lastIngestion: string;
  enabled: boolean;
  statusIconTooltip: string;
  statusIconClass: string;
  downloadURL?: string;
  token: string;
  isCopied: boolean;
  copyKeyTooltipMessage: string;
}

