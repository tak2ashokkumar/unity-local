import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonitoringTemplates } from './monitoring-templates/monitoring-template/monitoring-template.service';
import { GET_ALL_TEMPLATES } from 'src/app/shared/api-endpoint.const';
import { MonitoringTemplatesDiscoveredComponents } from 'src/app/shared/SharedEntityTypes/monitoring.type';

@Injectable()
export class MtpAdministrationMonitoringService {

  constructor(private http: HttpClient) { }

  getTemplates(): Observable<MonitoringTemplates[]> {
    const params: HttpParams = new HttpParams().set('page_size', 0)
    return this.http.get<MonitoringTemplates[]>(GET_ALL_TEMPLATES(), { params: params });
  }

  getTemplateComponents(templateId: number) {
    return this.http.get<MonitoringTemplatesDiscoveredComponents[]>(`customer/mtp/template-rules/?template_id=${templateId}&page_size=0`)
  }
}
