import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { MonitoringTemplates, MonitoringTemplatesDiscoveredComponents } from 'src/app/shared/SharedEntityTypes/monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_ALL_TEMPLATES } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class MonitoringTemplatesService {

  constructor(private tableService: TableApiServiceService,
    private builder: FormBuilder,
    private http: HttpClient) { }

  getTemplates(criteria: SearchCriteria): Observable<PaginatedResult<MonitoringTemplates>> {
    return this.tableService.getData<PaginatedResult<MonitoringTemplates>>(GET_ALL_TEMPLATES(), criteria);
  }

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
      data.eventForm = this.buildChangeForm(data.templateName);
      data.onForm = false;
      data.isError = false;
      viewData.push(data);
    });
    return viewData;
  }

  buildCloneForm(): FormGroup {
    return this.builder.group({
      'template_name': ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  buildChangeForm(name: string): FormGroup {
    if (name) {
      return this.builder.group({
        'template_name': [name, [Validators.required, NoWhitespaceValidator]]
      });
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'template_name': '',
    }
    return formErrors;
  }

  validationMessages = {
    'template_name': {
      'required': 'Name is required'
    },
  }

  update(id: number, sn: any) {
    return this.http.post<MonitoringTemplates>(`customer/mtp/template-manage/cloned_template/?template_id=${id}`, sn);
  }

  edit(id: number, sn: any) {
    return this.http.put<MonitoringTemplates>(`customer/mtp/template-manage/update_template/?template_id=${id}`, sn);
  }

  delete(id: number) {
    return this.http.delete(`customer/mtp/template-manage/delete_template/?template_id=${id}`);
  }

  getTemplateComponents(template: TemplateViewData) {
    return this.http.get<MonitoringTemplatesDiscoveredComponents[]>(`customer/mtp/template-rules/?template_id=${template.templateID}&page_size=0`, { headers: Handle404Header })
      .pipe(
        map((res: MonitoringTemplatesDiscoveredComponents[]) => {
          if (res) {
            template.componentCount = res.length;
            template.components = this.convertToComponentsViewData(res);
          }
          return template;
        })
      );;
  }

  convertToComponentsViewData(components: MonitoringTemplatesDiscoveredComponents[]): TemplateComponentsViewData[] {
    let viewData: TemplateComponentsViewData[] = [];
    components.map(c => {
      let a = new TemplateComponentsViewData();
      a.ruleId = c.discovery_rule_id;
      a.ruleName = c.discovery_rule_name;
      a.triggerCount = c.trigger_count;
      a.graphCount = c.graph_count;
      a.itemCount = c.item_count;
      viewData.push(a);
    })
    return viewData;
  }
}

export class TemplateViewData {
  templateID: number;
  templateName: string;
  templateType: string;
  templateMetricsCount: number;
  templateGraphsCount: number;
  templateTriggersCount: number;
  templateIsDefault: boolean;
  onForm: boolean;
  eventForm: FormGroup;
  isError: boolean;
  isOpen: boolean = false;
  componentCount: number = 0;
  components: TemplateComponentsViewData[] = [];
}

export class TemplateComponentsViewData {
  ruleId: number;
  ruleName: string;
  triggerCount: number;
  graphCount: number;
  itemCount: number;
}