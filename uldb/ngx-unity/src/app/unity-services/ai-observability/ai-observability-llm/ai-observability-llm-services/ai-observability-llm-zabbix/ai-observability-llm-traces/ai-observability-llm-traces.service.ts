import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { LLMTraces } from 'src/app/shared/SharedEntityTypes/ai-observability.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AiObservabilityLlmTracesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
  private sanitizer: DomSanitizer) { }

  getTraces(criteria: SearchCriteria): Observable<PaginatedResult<LLMTraces>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<LLMTraces>>(`/customer/observability/llm_traces/`, { params: params });
  }

  convertToViewData(data: LLMTraces[]): LLMTracesViewData[] {
    let viewData: LLMTracesViewData[] = [];
    data.forEach(d => {
      let view = new LLMTracesViewData();
      view.traceId = d.trace_id;
      view.spanId = d.span_id;
      view.spanKind = d.span_kind;
      view.timestamp = d.timestamp ? this.utilSvc.toUnityOneDateFormat(d.timestamp) : 'N/A';
      view.statusCode = d.status_code;
      view.deploymentEnvironment = d.deployment_environment;

      view.genAIRequestModel = d.gen_ai_request_model;
      view.genAIResponseModel = d.gen_ai_response_model;
      view.genAIServerTimePerOutputToken = d.gen_ai_server_time_per_output_token;
      view.genAIServerTimeToFirstToken = d.gen_ai_server_time_to_first_token;
      view.genAIRequestMaxTokens = d.gen_ai_request_max_tokens;
      view.genAIRequestTemperature = d.gen_ai_request_temperature;
      view.genAIRequestTopP = d.gen_ai_request_top_p;
      view.genAIResponseId = d.gen_ai_response_id;
      view.genAIResponseFinishReasons = d.gen_ai_response_finish_reasons;
      view.genAIOutputType = d.gen_ai_output_type;

      view.genAIUsageInputTokens = d.gen_ai_usage_input_tokens;
      view.genAIUsageOutputTokens = d.gen_ai_usage_output_tokens;
      view.genAIClientTokenUsage = d.gen_ai_client_token_usage;
      view.genAIUsageCost = d.gen_ai_usage_cost;
      view.genAIPrompt = d.gen_ai_prompt;
      view.genAICompletion = d.gen_ai_completion;

      view.genAISystem = d.gen_ai_system;
      view.genAIOperationName = d.gen_ai_operation_name;
      view.requestDuration = this.utilSvc.formatDuration(this.utilSvc.getDurationData(d.end_time, d.start_time));
      view.serverAddress = d.server_address;
      view.serverPort = d.server_port;

      viewData.push(view);
    })
    return viewData;
  }
}

export class LLMTracesViewData {
  constructor() { };
  traceId: string;
  spanId: string;
  spanKind: string;
  timestamp: string;
  statusCode: string;
  deploymentEnvironment: string;

  genAIRequestModel: string;
  genAIResponseModel: string;
  genAIServerTimePerOutputToken: number;
  genAIServerTimeToFirstToken: number;
  genAIRequestMaxTokens: number;
  genAIRequestTemperature: number;
  genAIRequestTopP: number;
  genAIResponseId: string;
  genAIResponseFinishReasons: string;
  genAIOutputType: string;

  genAIUsageInputTokens: number;
  genAIUsageOutputTokens: number;
  genAIClientTokenUsage: number;
  genAIUsageCost: number;
  genAIPrompt: string;
  genAICompletion: string;

  genAISystem: string;
  genAIOperationName: string;
  requestDuration: string;
  serverAddress: string;
  serverPort: string;
}
