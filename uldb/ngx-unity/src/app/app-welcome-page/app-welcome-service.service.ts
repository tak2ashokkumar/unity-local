import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENABLE_WELCOME_PAGE } from '../shared/api-endpoint.const';

@Injectable()
export class AppWelcomeServiceService {

  constructor(private http: HttpClient) { }

  setWelcomePageSetting(welcomePage: boolean) {
    return this.http.post(ENABLE_WELCOME_PAGE(), { enable_welcome_page: welcomePage });
  }

  convertToCollectorCertiifcateViewData(data: CollectorCertificateType[]): CollectorCertificateViewData {
    let viewData: CollectorCertificateViewData = new CollectorCertificateViewData();
    if (data.length) {
      viewData.collectorMessage = data[0].message;
      viewData.collectorMessageBadgeCount = data.length - 1;
      viewData.collectorsMessagesList = data.slice(1).map((d) => d.message);
    }
    return viewData;
  }

  getCollectorCertificateData(): Observable<CollectorCertificateType[]> {
    return this.http.get<CollectorCertificateType[]>(`/customer/agent/config/certificate-notifications/`);
  }

  accessKnowledgeService() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer extremely-insecure-cucumber',
      'access_token': 'extremely-insecure-cucumber'
    });
    return this.http.get(`http://10.192.11.235:4000/search/?query=a&top_n=5`, { headers: headers });
  }
}

export class CollectorCertificateViewData {
  loader: string = 'ColletorCertificateLoader';
  collectorMessage: string;
  collectorMessageBadgeCount: number = 0;
  collectorsMessagesList: string[] = [];
}

export interface CollectorCertificateType {
  id: number;
  uuid: string;
  collector_name: string;
  cert_host_name: string;
  cert_expiry: string;
  remaining_days: number;
  status: string;
  message: string;
  summary_message: string;
}