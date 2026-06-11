import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_TEMPLATE_GRAPHS, GET_TEMPLATE_METRICS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class TemplateGraphsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private builder: FormBuilder,) { }

  getGraphs(templateId: string, componentId: string, criteria: SearchCriteria): Observable<PaginatedResult<TemplateGraphs>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    if (componentId) {
      return this.http.get<PaginatedResult<TemplateGraphs>>(`/customer/mtp/graph-prototypes/?template_id=${templateId}&search=${componentId}`, { params: params })
    } else {
      return this.http.get<PaginatedResult<TemplateGraphs>>(GET_TEMPLATE_GRAPHS(templateId), { params: params });
    }
  }

  convertToViewData(graphs: TemplateGraphs[]): TemplateGraphViewData[] {
    let viewData: TemplateGraphViewData[] = [];
    graphs.map((graph: TemplateGraphs) => {
      let data = new TemplateGraphViewData();
      data.graphId = graph.graph_id;
      data.name = graph.name;
      data.graphtype = graph.graphtype;
      data.isDefault = graph.default;
      data.itemId = graph.item_id;
      viewData.push(data);
    });
    return viewData;
  }

  getMetrics(templateId: string, componentId: string): Observable<TemplateMetrics[]> {
    const params: HttpParams = new HttpParams().set('page_size', 0)
    if (componentId) {
      return this.http.get<TemplateMetrics[]>(`/customer/mtp/item-prototypes/?template_id=${templateId}&search=${componentId}`, { params: params });
    } else {
      return this.http.get<TemplateMetrics[]>(GET_TEMPLATE_METRICS(templateId), { params: params });
    }
  }

  buildCloneForm(view: TemplateGraphViewData): FormGroup {
    if (view) {
      return this.builder.group({
        'name': [view.name, [Validators.required, NoWhitespaceValidator]],
        'graph_type': [view.graphtype, [Validators.required, NoWhitespaceValidator]],
        'item_id': [view.itemId, [Validators.required]],
      })
    }
    else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'graph_type': ['', [Validators.required, NoWhitespaceValidator]],
        'item_id': [[], [Validators.required]],
      })
    }

  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'graph_type': '',
      'item_id': '',
    }
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required',
    },
    'graph_type': {
      'required': 'Type is required',
    },
    'item_id': {
      'required': 'Items are required',
    }
  }

  create(componentId: string, sn: any) {
    if (componentId) {
      return this.http.post(`/customer/mtp/template-manage/create_prototype_graph/`, sn);
    } else {
      return this.http.post(`/customer/mtp/template-manage/create_graph/`, sn);
    }
  }

  update(componentId: string, id: number, sn: any) {
    if (componentId) {
      return this.http.put(`/customer/mtp/template-manage/update_prototype_graph/?graph_id=${id}`, sn);
    } else {
      return this.http.put(`/customer/mtp/template-manage/update_graph/?graph_id=${id}`, sn);
    }
  }

  delete(componentId: string, id: number) {
    if (componentId) {
      return this.http.delete(`/customer/mtp/template-manage/delete_prototype_graph/?graph_id=${id}`);
    } else {
      return this.http.delete(`/customer/mtp/template-manage/delete_graph/?graph_id=${id}`);
    }
  }
}

export interface TemplateGraphs {
  graph_id: number;
  name: string;
  graphtype: string;
  default: boolean;
  item_id: string[]
}

export class TemplateGraphViewData {
  graphId: number;
  name: string;
  graphtype: string;
  isDefault: boolean;
  itemId: string[]

}

export class TemplateMetrics {
  item_id: number;
  name: string;
  item_key: string;
  interval: string;
  status: string;
  triggers: number;
  default: boolean;
}

export class TemplateMetricsListViewData {
  itemId: number;
  name: string;
  constructor() { }
}