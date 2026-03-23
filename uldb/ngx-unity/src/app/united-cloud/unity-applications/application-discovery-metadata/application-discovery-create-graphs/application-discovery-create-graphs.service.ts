import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { ApplicationMonitoringGraphCRUD, MonitoringGraphCRUDItems } from './application-discovery-create-graphs.type';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class ApplicationDiscoveryCreateGraphsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getGraphList(device: DeviceTabData): Observable<ApplicationMonitoringGraphCRUD> {
    return this.http.get<ApplicationMonitoringGraphCRUD>(`/apm/monitoring/app_metrics_enabled_list/?uuid=${device.uuid}`);
  }

  convertGraphsToViewData(graphList: ApplicationMonitoringGraphCRUD): ApplicationMonitoringGraphCRUDViewdata {
    let viewData: ApplicationMonitoringGraphCRUDViewdata = new ApplicationMonitoringGraphCRUDViewdata();
    viewData.appMetricEnabledList = graphList.app_metrics_enabled_list;
    // graphList.app_metrics_enabled_list.map(g => {
    //   let a: ApplicationMonitoringGraphCRUDViewdata = new ApplicationMonitoringGraphCRUDViewdata();
    //   // a.graphid = g.graph_id.toString();
    //   a.appMetricEnabledList = g.app_metrics_enabled_list;
    //   // a.graphType = g.graph_type;
    //   // a.items = g.item_ids;
    //   // a.canEdit = g.can_update;
    //   // a.editBtnTooltipMsg = g.can_update ? 'Edit' : 'Non editable';
    //   // a.canDelete = g.can_delete;
    //   // a.deleteBtnTooltipMsg = g.can_delete ? 'Delete' : 'Non deletable';

    //   viewData.push(a);
    // })
    return viewData;
  }

  getGraphItems(device: DeviceTabData): Observable<MonitoringGraphCRUDItems> {
    // return this.http.get<ZabbixMonitoringGraphCRUDItems[]>(ZABBIX_DEVICE_GRAPH_NUMBERIC_ITEMS(device.deviceType, device.uuid))
    //   .pipe(
    //     map(items => items.length && items.filter(itm => itm.value_type != 'str'))
    //   );

    return this.http.get<any>(`/apm/monitoring/app_metrics_list/?uuid=${device.uuid}`);
  }

  createGraphForm(): FormGroup {
    return this.builder.group({
      'uuid': ['', [Validators.required]],
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'metric_names': [[], [Validators.required]],
    });
  }

  resetGraphFormErrors() {
    return {
      'name': '',
      'graph_type': '',
      'item_ids': '',
    };
  }

  graphFormValidationMessages = {
    'uuid': {
      'required': 'Graph name is required'
    },
    'name': {
      'required': 'Graph name is required'
    },
    'metric_names': {
      'required': 'Item selection is mandatory'
    },
  }

  createGraph(device: DeviceTabData, formdata: any): Observable<any[]> {
    return this.http.post<any[]>(`/apm/graphs/enable_graphs/`, formdata);
  }

  // updateGraph(device: DeviceTabData, graphId: string, formdata: any): Observable<any[]> {
  //   return this.http.put<any[]>(MANAGE_ZABBIX_DEVICE_GRAPH(device.deviceType, device.uuid, graphId), formdata);
  // }

  // deleteGraph(device: DeviceTabData, graphId: string): Observable<any> {
  //   return this.http.delete(MANAGE_ZABBIX_DEVICE_GRAPH(device.deviceType, device.uuid, graphId));
  // }
}

export class ApplicationMonitoringGraphCRUDViewdata {
  appMetricEnabledList: string[];
}