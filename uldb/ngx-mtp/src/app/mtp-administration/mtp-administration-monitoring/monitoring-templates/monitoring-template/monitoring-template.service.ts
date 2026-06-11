import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonitoringTemplatesDiscoveredComponents } from 'src/app/shared/SharedEntityTypes/monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_ALL_TEMPLATES } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class MonitoringTemplateService {

  constructor(private http: HttpClient) { }

  // getTemplates(): Observable<MonitoringTemplates[]> {
  //   const params: HttpParams = new HttpParams().set('page_size', 0)
  //   return this.http.get<MonitoringTemplates[]>(GET_ALL_TEMPLATES(), { params: params });
  // }

  convertToViewData(templates: MonitoringTemplates[]): TemplateViewData[] {
    let viewData: TemplateViewData[] = [];
    templates.map((template: MonitoringTemplates) => {
      let data = new TemplateViewData();
      data.templateID = template.template_id;
      data.templateName = template.template_name;
      data.templateType = template.template_data.type;
      data.templateMetricsCount = template.template_data.metrics;
      data.templateGraphsCount = template.template_data.graphs;
      data.templateTriggersCount = template.template_data.triggers;
      data.templateIsDefault = template.template_data.default;
      viewData.push(data);
    });
    return viewData;
  }

  // getTemplateComponents(templateId: number) {
  //   return this.http.get<MonitoringTemplatesDiscoveredComponents[]>(`customer/mtp/template-rules/?template_id=${templateId}&page_size=0`)
  // }
}

export class TemplateViewData {
  templateID: number;
  templateName: string;
  templateType: string;
  templateMetricsCount: number;
  templateGraphsCount: number;
  templateTriggersCount: number;
  templateIsDefault: boolean;
}

export class MonitoringTemplates {
  template_id: number;
  template_name: string;
  template_data: MonitoringTemplatesData;
}

export class MonitoringTemplatesData {
  metrics: number;
  graphs: number;
  'default': boolean;
  type: string;
  triggers: number;
}
