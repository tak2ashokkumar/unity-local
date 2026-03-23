import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { GPUMetrices } from 'src/app/shared/SharedEntityTypes/ai-observability.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AiObservabilityGpuServiceMetricesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,) { }

  getMetrices(criteria: SearchCriteria): Observable<PaginatedResult<GPUMetrices>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<GPUMetrices>>(`/customer/observability/gpu_metrics/`, { params: params });
  }

  convertToViewData(data: GPUMetrices[]): GPUMetricsViewData[] {
    let viewData: GPUMetricsViewData[] = [];
    data.forEach(d => {
      let a = new GPUMetricsViewData();
      a.name = d.metric_name;
      a.value = d.value;
      a.gpuName = d.gpu_name;
      a.gpuId = d.gpu_uuid;
      a.deploymentEnvironment = d.deployment_environment;
      a.serviceName = d.service_name;
      a.serviceId = d.service_uuid;
      a.timestamp = d.timestamp ? this.utilSvc.toUnityOneDateFormat(d.timestamp) : 'N/A';
      viewData.push(a);
    })
    return viewData;
  }
}


export class GPUMetricsViewData {
  constructor() { };
  name: string;
  value: number;
  gpuName: string;
  gpuId: string;
  deploymentEnvironment: string;
  timestamp: string;
  serviceName: string;
  serviceId: string;
}