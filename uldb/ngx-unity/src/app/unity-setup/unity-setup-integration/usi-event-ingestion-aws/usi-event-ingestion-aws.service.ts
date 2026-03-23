import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DOWNLOAD_NAGIOS_INSTANCE, GET_NAGIOS_INSTANCE, TOGGLE_NAGIOS_INSTANCE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AwsInstanceType } from './usi-event-ingestion-aws-crud/usi-event-ingestion-aws.type';

@Injectable()
export class UsiEventIngestionAwsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getInstances() {
    let params = new HttpParams().set('page_size', 0);
    params = params.append('source', 'Aws');
    return this.http.get<AwsInstanceType[]>(GET_NAGIOS_INSTANCE(), { params: params });
  }

  convertToViewData(data: AwsInstanceType[]): AwsInstanceViewData[] {
    let viewData: AwsInstanceViewData[] = [];
    data.forEach(a => {
      let d: AwsInstanceViewData = new AwsInstanceViewData();
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
      d.downloadURL = DOWNLOAD_NAGIOS_INSTANCE(a.uuid);
      d.token = a.token;
      d.isCopied = false;
      d.copyKeyTooltipMessage = 'Copy Key To Clipboard';
      d.subscribeUrl = a.subscribe_url;
      d.isSubscribeUrlCopied = false;
      d.subscribeUrlTooltipMessage = 'Copy subscribe url to clipboard';
      viewData.push(d);
    })
    return viewData;
  }

  toggleInstance(uuid: string) {
    return this.http.get(TOGGLE_NAGIOS_INSTANCE(uuid));
  }
}

export class AwsInstanceViewData {
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
  subscribeUrl: string;
  isSubscribeUrlCopied: boolean;
  subscribeUrlTooltipMessage: string;
}
