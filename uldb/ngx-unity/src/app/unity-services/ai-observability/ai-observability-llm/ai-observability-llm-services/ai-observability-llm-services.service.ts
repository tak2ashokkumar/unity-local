import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AiObservabilityLlmServicesService {

  constructor(
    private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getLLMData(criteria: SearchCriteria): Observable<PaginatedResult<LLMModelDataType>> {
    return this.tableService.getData<PaginatedResult<LLMModelDataType>>('/customer/observability/llms/', criteria);
  }

  convertToViewData(data: LLMModelDataType[]): LLMModel[] {
    let viewData: LLMModel[] = [];
    if (data) {
      data.map(d => {
        let view: LLMModel = new LLMModel();
        view.uuid = d.uuid;
        view.name = d.name;
        view.type = d.request_models?.length ? d.request_models[0] : '';
        view.extraTypes = d.request_models?.length > 1 ? d.request_models.slice(1) : [];
        view.extraTypesLength = view.extraTypes.length;
        view.totalTokenUsage = d.tokens_usage;
        view.averageRespTime = d.average_response_time;
        view.prompt = d.last_prompt;
        viewData.push(view);
      })
    }
    return viewData;
  }

}

export interface LLMModelDataType {
  uuid: string;
  name: string;
  service_type: string;
  request_models: string[];
  tokens_usage: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  average_response_time: string;
  average_request_temperature: number;
  last_prompt: string;
  server_addresses: string[];
  server_ports: string[];
  created_at: string;
  updated_at: string;
}

export class LLMModel {
  uuid: string;
  name: string;
  type: string;
  extraTypes: string[];
  extraTypesLength: number;
  totalTokenUsage: number;
  averageRespTime: string;
  prompt: string;
  constructor() { }
}
