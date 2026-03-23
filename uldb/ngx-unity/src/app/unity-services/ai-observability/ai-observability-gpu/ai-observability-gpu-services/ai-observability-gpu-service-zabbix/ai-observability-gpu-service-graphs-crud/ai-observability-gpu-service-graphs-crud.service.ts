import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';

@Injectable()
export class AiObservabilityGpuServiceGraphsCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getGraphList(device: DeviceTabData): Observable<PaginatedResult<GPUGraphCRUDType>> {
    return this.http.get<PaginatedResult<GPUGraphCRUDType>>(`/customer/observability/gpus/${device.uuid}/graphs/`);
  }

  convertGraphsToViewData(graphList: GPUGraphCRUDType[]): GpuGraphCRUDViewdata[] {
    let viewData: GpuGraphCRUDViewdata[] = [];
    if (graphList.length) {
      graphList.map(g => {
        let graph = new GpuGraphCRUDViewdata();
        // graph.serviceUuid = g.service_uuid;
        graph.name = g.name;
        graph.items = g.metric_names?.length ? g.metric_names[0] : '';
        graph.extraItems = g.metric_names?.length > 1 ? g.metric_names.slice(1) : [];
        graph.extraItemsLength = graph.extraItems.length;
        viewData.push(graph);
      });
    }
    return viewData;
  }

  getGraphItems(device: DeviceTabData): Observable<string[]> {
    return this.http.get<string[]>(`/customer/observability/gpus/${device.uuid}/metric_names/`);
  }

  createGraphForm(): FormGroup {
    return this.builder.group({
      'service_uuid': ['', [Validators.required]],
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'metric_names': [[], [Validators.required]],
    });
  }

  resetGraphFormErrors() {
    return {
      'service_uuid': '',
      'name': '',
      'metric_names': '',
    };
  }

  graphFormValidationMessages = {
    'service_uuid': {
      'required': 'Graph name is required'
    },
    'name': {
      'required': 'Graph name is required'
    },
    'metric_names': {
      'required': 'Item selection is mandatory'
    },
  }

  createGraph(device: any, formdata: any): Observable<any[]> {
    return this.http.post<any[]>(`/customer/observability/service_graphs/`, formdata);
  }

}

export class GpuGraphCRUDViewdata {
    name: string;
    items: string;
    extraItems: string[];
    extraItemsLength: number;
    serviceUuid: string;
    service_uuid: string;
    constructor(){}
}

export interface GPUGraphCRUDType {
    uuid: string;
    name: string;
    metric_names: string[];
    service_name: string;
    service_uuid: string;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
}

// export interface GpuGraphCRUDItems {
//   // item_id: number;
//   // name: string;
//   // key: string;
//   // value_type: string;
//   metric_names: string[];
// }
