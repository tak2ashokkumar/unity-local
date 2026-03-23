import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DB_GRAPHS, DB_GRAPH_ITEMS, MANAGE_DB_GRAPH } from 'src/app/shared/api-endpoint.const';
import { DatabaseMonitoringGraph, DabaseMonitoringGraphItems } from '../database-monitoring.type';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class DatabaseMonitoringGraphCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder, ) { }

  getGraphList(instanceId: string): Observable<DatabaseMonitoringGraph[]> {
    return this.http.get<DatabaseMonitoringGraph[]>(DB_GRAPHS(instanceId));
  }

  convertGraphsToViewData(graphList: DatabaseMonitoringGraph[]): DBMonitoringGraphListView[] {
    let viewData: DBMonitoringGraphListView[] = [];
    graphList.map(g => {
      let a: DBMonitoringGraphListView = new DBMonitoringGraphListView();
      a.graphid = g.graph_id.toString();
      a.name = g.name;
      a.graphType = g.graph_type;
      a.items = g.item_ids;
      a.canEdit = g.can_update;
      a.editBtnTooltipMsg = g.can_update ? 'Edit' : 'Non editable';
      a.canDelete = g.can_delete;
      a.deleteBtnTooltipMsg = g.can_delete ? 'Delete' : 'Non deletable';

      viewData.push(a);
    })
    return viewData;
  }

  getGraphItems(instanceId: string): Observable<DabaseMonitoringGraphItems[]> {
    return this.http.get<DabaseMonitoringGraphItems[]>(DB_GRAPH_ITEMS(instanceId));
  }

  createDbGraphForm(graph?: DBMonitoringGraphListView): FormGroup {
    if (graph) {
      return this.builder.group({
        'name': [graph.name, [Validators.required, NoWhitespaceValidator]],
        'graph_type': [graph.graphType, [Validators.required, NoWhitespaceValidator]],
        'item_ids': [graph.items, [Validators.required]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'graph_type': ['', [Validators.required, NoWhitespaceValidator]],
        'item_ids': [[], [Validators.required]],
      });
    }
  }

  resetDBGraphFormErrors() {
    return {
      'name': '',
      'graph_type': '',
      'item_ids': '',
    };
  }

  dbGraphFormValidationMessages = {
    'name': {
      'required': 'Graph name is required'
    },
    'graph_type': {
      'required': 'Graph type is required'
    },
    'item_ids': {
      'required': 'Item selection is mandatory'
    },
  }

  createGraph(dbInstanceId: string, formdata: any): Observable<any[]> {
    return this.http.post<any[]>(DB_GRAPHS(dbInstanceId), formdata);
  }

  updateGraph(dbInstanceId: string, graphId: string, formdata: any): Observable<any[]> {
    return this.http.put<any[]>(MANAGE_DB_GRAPH(dbInstanceId, graphId), formdata);
  }

  deleteGraph(dbInstanceId: string, graphId: string): Observable<any> {
    return this.http.delete(MANAGE_DB_GRAPH(dbInstanceId, graphId));
  }
}

export class DBMonitoringGraphListView {
  graphid: string;
  name: string;
  graphType: string;
  items: string[];
  canEdit: boolean;
  editBtnTooltipMsg: string;
  canDelete: boolean;
  deleteBtnTooltipMsg: string
  constructor() { }
}
