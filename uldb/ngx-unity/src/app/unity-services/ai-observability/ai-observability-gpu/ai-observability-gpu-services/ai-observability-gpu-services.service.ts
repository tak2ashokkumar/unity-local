import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AiObservabilityGpuServicesService {

  constructor(
    private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getGpuData(criteria: SearchCriteria): Observable<PaginatedResult<GpuModelDataType>> {
    return this.tableService.getData<PaginatedResult<GpuModelDataType>>('/customer/observability/gpus/', criteria);
  }

  convertToViewData(data: GpuModelDataType[]): GpuModel[] {
    let viewData: GpuModel[] = [];
    if (data.length) {
      data.map(d => {
        let view: GpuModel = new GpuModel();
        view.uuid = d.uuid;
        view.name = d.name;
        view.gpuUtilization = d.gpu_utilization+'%';
        view.memoryUsage = d.memory_usage+'%';
        view.temperature = d.temperature+'C';
        view.powerDraw = d.power_draw+'W';
        view.powerLimit = d.power_limit+'W';        
        viewData.push(view);
      })
    }
    return viewData;
  }

}

export interface GpuModelDataType {
  uuid: string;
  name: string;
  service_type: string;
  gpu_uuid: string;
  gpu_utilization: number;
  memory_usage: number;
  temperature: number;
  power_draw: number;
  power_limit: number;
  created_at: string;
  updated_at: string;
}
export class GpuModel {
  uuid: string;
  name: string;
  type: string;
  gpuUtilization: string;
  memoryUsage: string;
  temperature: string;
  powerDraw: string;
  powerLimit: string;
  constructor() { }
}
