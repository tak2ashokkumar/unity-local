import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MANAGE_ZABBIX_DEVICE_GRAPH, ZABBIX_DEVICE_GRAPHS, ZABBIX_DEVICE_GRAPH_NUMBERIC_ITEMS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { VmsZabbixMonitoringGraph, VmsZabbixMonitoringGraphItems } from '../vms-zabbix-monitoring.type';

@Injectable()
export class ZabbixVmsGraphCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getGraphList(deviceId: string, deviceType: DeviceMapping): Observable<VmsZabbixMonitoringGraph[]> {
    return this.http.get<VmsZabbixMonitoringGraph[]>(ZABBIX_DEVICE_GRAPHS(deviceType, deviceId));
  }

  convertGraphsToViewData(graphList: VmsZabbixMonitoringGraph[]): VmsMonitoringGraphsViewdata[] {
    let viewData: VmsMonitoringGraphsViewdata[] = [];
    graphList.map(g => {
      let a: VmsMonitoringGraphsViewdata = new VmsMonitoringGraphsViewdata();
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

  getGraphItems(deviceId: string, deviceType: DeviceMapping): Observable<VmsZabbixMonitoringGraphItems[]> {
    return this.http.get<VmsZabbixMonitoringGraphItems[]>(ZABBIX_DEVICE_GRAPH_NUMBERIC_ITEMS(deviceType, deviceId));
  }

  createGraphForm(graph?: VmsMonitoringGraphsViewdata): FormGroup {
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

  resetGraphFormErrors() {
    return {
      'name': '',
      'graph_type': '',
      'item_ids': '',
    };
  }

  graphFormValidationMessages = {
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

  createGraph(deviceId: string, deviceType: DeviceMapping, formdata: any): Observable<any[]> {
    return this.http.post<any[]>(ZABBIX_DEVICE_GRAPHS(deviceType, deviceId), formdata);
  }

  updateGraph(deviceId: string, deviceType: DeviceMapping, graphId: string, formdata: any): Observable<any[]> {
    return this.http.put<any[]>(MANAGE_ZABBIX_DEVICE_GRAPH(deviceType, deviceId, graphId), formdata);
  }

  deleteGraph(deviceId: string, deviceType: DeviceMapping, graphId: string): Observable<any> {
    return this.http.delete(MANAGE_ZABBIX_DEVICE_GRAPH(deviceType, deviceId, graphId));
  }
}

export class VmsMonitoringGraphsViewdata {
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
