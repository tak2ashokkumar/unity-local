import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MANAGE_ZABBIX_DEVICE_GRAPH, ZABBIX_DEVICE_GRAPHS, ZABBIX_DEVICE_GRAPH_NUMBERIC_ITEMS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { ZabbixMonitoringGraphCRUD, ZabbixMonitoringGraphCRUDItems } from './zabbix-graph-crud.type';

@Injectable()
export class ZabbixGraphCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getGraphList(device: DeviceTabData): Observable<ZabbixMonitoringGraphCRUD[]> {
    return this.http.get<ZabbixMonitoringGraphCRUD[]>(ZABBIX_DEVICE_GRAPHS(device.deviceType, device.uuid));
  }

  convertGraphsToViewData(graphList: ZabbixMonitoringGraphCRUD[]): ZabbixMonitoringGraphCRUDViewdata[] {
    let viewData: ZabbixMonitoringGraphCRUDViewdata[] = [];
    graphList.map(g => {
      let a: ZabbixMonitoringGraphCRUDViewdata = new ZabbixMonitoringGraphCRUDViewdata();
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

  getGraphItems(device: DeviceTabData): Observable<ZabbixMonitoringGraphCRUDItems[]> {
    return this.http.get<ZabbixMonitoringGraphCRUDItems[]>(ZABBIX_DEVICE_GRAPH_NUMBERIC_ITEMS(device.deviceType, device.uuid))
      .pipe(
        map(items => items.length && items.filter(itm => itm.value_type != 'str'))
      );
  }

  createGraphForm(graph?: ZabbixMonitoringGraphCRUDViewdata): FormGroup {
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

  createGraph(device: DeviceTabData, formdata: any): Observable<any[]> {
    return this.http.post<any[]>(ZABBIX_DEVICE_GRAPHS(device.deviceType, device.uuid), formdata);
  }

  updateGraph(device: DeviceTabData, graphId: string, formdata: any): Observable<any[]> {
    return this.http.put<any[]>(MANAGE_ZABBIX_DEVICE_GRAPH(device.deviceType, device.uuid, graphId), formdata);
  }

  deleteGraph(device: DeviceTabData, graphId: string): Observable<any> {
    return this.http.delete(MANAGE_ZABBIX_DEVICE_GRAPH(device.deviceType, device.uuid, graphId));
  }
}

export class ZabbixMonitoringGraphCRUDViewdata {
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
