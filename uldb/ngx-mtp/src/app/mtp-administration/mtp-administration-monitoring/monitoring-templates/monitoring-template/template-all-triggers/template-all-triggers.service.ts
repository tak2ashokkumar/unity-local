import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_ALL_METRICS_TRIGGERS } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class TemplateAllTriggersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getTriggers(templateId: string, componentId: string, criteria: SearchCriteria): Observable<PaginatedResult<MetricTriggers>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    if (componentId) {
      return this.http.get<PaginatedResult<MetricTriggers>>(`/customer/mtp/trigger-prototypes/?template_id=${templateId}&search=${componentId}`, { params: params })
    } else {
      return this.http.get<PaginatedResult<MetricTriggers>>(GET_ALL_METRICS_TRIGGERS(templateId), { params: params });
    }
  }

  convertToViewData(triggers: MetricTriggers[]): MetricTriggersViewData[] {
    let viewData: MetricTriggersViewData[] = [];
    triggers.map((trigger: MetricTriggers) => {
      let data = new MetricTriggersViewData();
      data.name = trigger.name;
      data.triggerId = trigger.trigger_id;
      data.expression = trigger.expression;
      data.status = trigger.status;
      data.severity = trigger.severity;
      data.isDefault = trigger.default;
      viewData.push(data);
    });
    return viewData;
  }

  toggleStatus(componentId: string, id: number, status: string) {
    if (componentId) {
      return this.http.put<ToggleStatus>(`customer/mtp/template-manage/prototype_trigger_status/?trigger_id=${id}`, { 'status': status });
    } else {
      return this.http.put<ToggleStatus>(`customer/mtp/template-manage/trigger_status/?trigger_id=${id}`, { 'status': status });
    }
  }

  delete(componentId: string, id: number) {
    if (componentId) {
      return this.http.delete(`customer/mtp/template-manage/delete_prototype_trigger/?trigger_id=${id}`);
    } else {
      return this.http.delete(`customer/mtp/template-manage/delete_trigger/?trigger_id=${id}`);
    }
  }
}


export class ToggleStatus {
  status: string;
}

export class MetricTriggers {
  trigger_id: number;
  name: string;
  expression: string;
  status: string;
  severity: string;
  default: boolean
}

export class MetricTriggersViewData {
  triggerId: number;
  name: string;
  expression: string;
  status: string;
  severity: string;
  isDefault: boolean;
  constructor() { }
}

