import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { VectorDBTraces } from 'src/app/shared/SharedEntityTypes/ai-observability.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AiObservabilityVectorDbServiceTracesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getTraces(criteria: SearchCriteria): Observable<PaginatedResult<VectorDBTraces>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<VectorDBTraces>>(`/customer/observability/vector_db_traces/`, { params: params });
  }

  convertToViewData(data: VectorDBTraces[]): VectorDBTracesViewData[] {
    let viewData: VectorDBTracesViewData[] = [];
    data.forEach(d => {
      let viewTrace = new VectorDBTracesViewData();
      viewTrace.traceId = d.trace_id;
      viewTrace.spanId = d.span_id;
      viewTrace.spanKind = d.span_kind;
      viewTrace.timestamp = d.timestamp ? this.utilSvc.toUnityOneDateFormat(d.timestamp) : 'N/A';
      viewTrace.statusCode = d.status_code;
      viewTrace.deploymentEnvironment = d.deployment_environment;
      viewTrace.dbCollectionName = d.db_collection_name;
      viewTrace.dbOperationName = d.db_operation_name;
      viewTrace.dbStatement = d.db_statement;
      viewTrace.dbSystemName = d.db_system_name;
      viewTrace.dbVectorCount = d.db_vector_count;
      viewTrace.genAIOperationName = d.gen_ai_operation_name;
      viewTrace.serverAddress = d.service_name;
      viewTrace.serverPort = d.service_uuid;
      viewTrace.requestDuration = this.utilSvc.formatDuration(this.utilSvc.getDurationData(d.end_time, d.start_time));
      viewData.push(viewTrace);
    })
    return viewData;
  }
}

export class VectorDBTracesViewData {
  constructor() { };
  traceId: string;
  spanId: string;
  spanKind: string;
  timestamp: string;
  statusCode: string;
  deploymentEnvironment: string;
  dbCollectionName: string;
  dbOperationName: string;
  dbStatement: string;
  dbSystemName: string;
  dbVectorCount: number;
  genAIOperationName: string;
  requestDuration: string;
  serverAddress: string;
  serverPort: string;
}
