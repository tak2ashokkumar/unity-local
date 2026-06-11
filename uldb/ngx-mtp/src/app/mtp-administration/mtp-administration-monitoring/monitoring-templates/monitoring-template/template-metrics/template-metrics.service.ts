import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_TEMPLATE_METRICS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class TemplateMetricsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getMetrics(criteria: SearchCriteria, templateId: string, componentId: string): Observable<PaginatedResult<TemplateMetrics>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    if (componentId) {
      return this.http.get<PaginatedResult<TemplateMetrics>>(`/customer/mtp/item-prototypes/?template_id=${templateId}&search=${componentId}`, { params: params });
    } else {
      return this.http.get<PaginatedResult<TemplateMetrics>>(GET_TEMPLATE_METRICS(templateId), { params: params });
    }
  }

  convertToViewData(metrics: TemplateMetrics[]): TemplateMetricViewData[] {
    let viewData: TemplateMetricViewData[] = [];
    metrics.map((metric: TemplateMetrics) => {
      let data = new TemplateMetricViewData();
      data.itemId = metric.item_id;
      data.name = metric.name;
      data.itemKey = metric.item_key;
      data.description = metric.description ? metric.description : 'NA';
      data.interval = metric.interval;
      data.status = metric.status;
      data.triggers = metric.triggers;
      data.isDefault = metric.default;
      data.masterItem = metric.master_item;
      data.isDisabled = metric.master_item.length || metric.default ? true : false;
      data.editBtnClass = data.isDisabled ? 'action-icons-disabled' : 'action-icons';
      data.editTooltip = data.isDisabled ? 'Edit disabled' : 'Edit';
      data.eventForm = this.buildChangeForm(data.name, data.interval);
      data.eventFormErrors = this.resetFormErrors();
      data.eventValidationMessages = this.validationMessages;
      data.onForm = false;
      viewData.push(data);
    });
    return viewData;
  }

  filterTemplate(templates: any[], targetID: number): any | undefined {
    return templates.find(template => template.templateID === targetID);
  }

  toggleStatus(id: number, status: string, componentId: string) {
    if (componentId) {
      return this.http.put<ToggleStatus>(`customer/mtp/template-manage/prototype_item_status/?item_id=${id}`, { 'status': status });
    } else {
      return this.http.put<ToggleStatus>(`customer/mtp/template-manage/metric_status/?item_id=${id}`, { 'status': status });
    }
  }

  edit(id: number, sn: any, componentId: string) {
    if (componentId) {
      return this.http.put(`customer/mtp/template-manage/prototype_item/?item_id=${id}`, sn);
    } else {
      return this.http.put(`customer/mtp/template-manage/update_metric/?item_id=${id}`, sn);
    }
  }

  delete(id: number, componentId: string) {
    if (componentId) {
      return this.http.delete(`customer/mtp/template-manage/delete_prototype_item/?item_id=${id}`);
    } else {
      return this.http.delete(`customer/mtp/template-manage/delete_metric/?item_id=${id}`);
    }
  }

  buildChangeForm(name: string, interval: string): FormGroup {
    if (name) {
      return this.builder.group({
        'item_name': [name, [Validators.required, NoWhitespaceValidator]],
        'interval': [interval, [Validators.required, NoWhitespaceValidator]]
      });
    }
  }

  resetFormErrors(): any {
    let formErrors = {
      'item_name': '',
      'interval': '',
    }
    return formErrors;
  }

  validationMessages = {
    'item_name': {
      'required': 'Name is required'
    },
    'interval': {
      'required': 'Interval is required'
    },
  }

}

export interface TemplateMetrics {
  item_id: number;
  name: string;
  item_key: string;
  interval: string;
  status: string;
  triggers: number;
  value_type: string;
  'default': boolean;
  description: string;
  master_item: string;
}

export class ToggleStatus {
  status: string;
}

export class TemplateMetricViewData {
  itemId: number;
  name: string;
  itemKey: string;
  description: string;
  interval: string;
  status: string;
  triggers: number;
  isDefault: boolean;
  onForm: boolean;
  eventForm: FormGroup;
  eventFormErrors: any;
  eventValidationMessages: any;
  isError: boolean;
  masterItem: string;
  isDisabled: boolean;
  editBtnClass: string;
  editTooltip: string;
  constructor() { }

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



