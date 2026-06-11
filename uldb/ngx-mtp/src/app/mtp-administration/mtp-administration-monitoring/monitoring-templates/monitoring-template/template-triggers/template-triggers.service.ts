import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_ALL_METRICS_TRIGGERS, GET_METRICS_TRIGGERS } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class TemplateTriggersService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getTriggers(criteria: SearchCriteria, templateId: string): Observable<PaginatedResult<MetricTriggers>> {
    return this.tableService.getData<PaginatedResult<MetricTriggers>>(GET_METRICS_TRIGGERS(templateId), criteria);
  }
  getAllTriggers(criteria: SearchCriteria, templateId: string): Observable<PaginatedResult<MetricTriggers>> {
    return this.tableService.getData<PaginatedResult<MetricTriggers>>(GET_ALL_METRICS_TRIGGERS(templateId), criteria);
  }

  convertToViewData(triggers: MetricTriggers[]): MetricTriggersViewData[] {
    let viewData: MetricTriggersViewData[] = [];
    triggers.map((trigger: MetricTriggers) => {
      let data = new MetricTriggersViewData();
      data.triggerId = trigger.trigger_id;
      data.name = trigger.name;
      data.expression = trigger.expression;
      data.status = trigger.status;
      data.severity = trigger.severity;
      data.isDefault = trigger.default;

      viewData.push(data);
    });
    return viewData;
  }

  delete(id: number) {
    return this.http.delete(`customer/mtp/template-manage/delete_trigger/?trigger_id=${id}`);

  }

  put(id: number, data: any) {
    return this.http.put<ToggleStatus>(`customer/mtp/template-manage/trigger_status/?trigger_id=${id}`, data);
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

