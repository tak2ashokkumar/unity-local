import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_GRAPH_BY_GRAPH_TYPE, SYSTEM_MONITORING_WIDGET, ZABBIX_DEVICE_GRAPHS, ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator, DeviceModelMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ObserviumGraphUtil } from 'src/app/shared/observium-graph-util/observium-graph-util.service';
import { GraphData } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { MonitoringPerformanceWidget, MonitoringPerformanceWidgetDevice, ZabbixMonitoringGraph } from './performance.type';

@Injectable()
export class PerformanceService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private observiumGraphUtil: ObserviumGraphUtil) { }

  getWidgets(): Observable<MonitoringPerformanceWidget[]> {
    return this.http.get<MonitoringPerformanceWidget[]>(SYSTEM_MONITORING_WIDGET(), { params: { 'page_size': '0' } });
  }

  convertToViewData(widgets: MonitoringPerformanceWidget[]): PerformanceWidgetViewData[] {
    let viewData: PerformanceWidgetViewData[] = [];
    widgets.map(wd => {
      if (wd.widget_data) {
        let a: PerformanceWidgetViewData = new PerformanceWidgetViewData();
        a.widgetId = wd.id;
        a.deviceType = DEVICE_TYPES.find(dt => dt.modelMapping == wd.widget_data.device_type);;
        a.device = wd.device;
        a.graphs = [];
        wd.widget_data.graphs.map(wdg => {
          let g: PerformanceWidgetGraphViewData = new PerformanceWidgetGraphViewData();
          if (wdg.graphid) {
            g.graphid = wdg.graphid;
          }
          g.name = wdg.name;
          a.graphs.push(g);
        })
        viewData.push(a);
      }
    })
    return viewData;
  }

  getGraphImages(deviceType: PerformanceWidgetDeviceTypeMapping, device: MonitoringPerformanceWidgetDevice, graph: PerformanceWidgetGraphViewData): Observable<Map<string, string>> {
    if (device.monitoring.observium) {
      const params = new HttpParams().set('graph_type', graph.name).set('legend', 'no').set('height', '150').set('width', '200');
      return this.http.get<GraphData>(GET_GRAPH_BY_GRAPH_TYPE(deviceType.mapping, device.uuid), { params: params })
        .pipe(
          map((res) => {
            return new Map<string, string>().set(graph.name, Object.values(res).pop());
          }),
          catchError((error: HttpErrorResponse) => {
            return of(new Map<string, string>().set(graph.name, null));
          })
        )
    } else {
      return this.http.get<{ [key: string]: string }>(ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE(deviceType.mapping, device.uuid, graph.graphid))
        .pipe(
          map((res) => {
            return new Map<string, string>().set(graph.name, Object.values(res).pop());
          }),
          catchError((error: HttpErrorResponse) => {
            return of(new Map<string, string>().set(graph.name, null));
          })
        );
    }
  }

  getDevices(deviceType: PerformanceWidgetDeviceTypeMapping): Observable<MonitoringPerformanceWidgetDevice[]> {
    return this.http.get<MonitoringPerformanceWidgetDevice[]>(DEVICES_FAST_BY_DEVICE_TYPE(deviceType.mapping), { params: { 'is_shared': false, 'page_size': '0' } })
      .pipe(map(devices => devices.filter(d => d.monitoring && d.monitoring.configured)));
  }

  getDeviceGraphNames(deviceType: PerformanceWidgetDeviceTypeMapping, device: MonitoringPerformanceWidgetDevice): Observable<PerformanceWidgetGraphViewData[]> {
    if (device.monitoring.observium) {
      return of(this.observiumGraphUtil.getGraphTypes(deviceType.mapping))
        .pipe(
          map(graphs => {
            let viewData: PerformanceWidgetGraphViewData[] = [];
            graphs.map(g => {
              let a: PerformanceWidgetGraphViewData = new PerformanceWidgetGraphViewData();
              a.name = g.graphType;
              viewData.push(a);
            })
            return viewData;
          })
        );;
    } else {
      return this.http.get<ZabbixMonitoringGraph[]>(ZABBIX_DEVICE_GRAPHS(deviceType.mapping, device.uuid))
        .pipe(
          map(graphs => {
            let viewData: PerformanceWidgetGraphViewData[] = [];
            graphs.map(g => {
              let a: PerformanceWidgetGraphViewData = new PerformanceWidgetGraphViewData();
              a.graphid = g.graph_id;
              a.name = g.name;
              viewData.push(a);
            })
            return viewData;
          })
        );
    }
  }

  getDevicesAndGraphNames(widget: PerformanceWidgetViewData): Observable<any> {
    const devices = this.http.get<MonitoringPerformanceWidgetDevice[]>(DEVICES_FAST_BY_DEVICE_TYPE(widget.deviceType.mapping), { params: { 'page_size': '0' } })
    let deviceGraphNames;
    if (widget.device.monitoring.observium) {
      deviceGraphNames = of(this.observiumGraphUtil.getGraphTypes(widget.deviceType.mapping))
    } else {
      deviceGraphNames = this.http.get<ZabbixMonitoringGraph[]>(ZABBIX_DEVICE_GRAPHS(widget.deviceType.mapping, widget.device.uuid))
    }
    return forkJoin([
      devices.pipe(map(devices => devices.filter(d => d.monitoring && d.monitoring.configured))),
      deviceGraphNames.pipe(
        map((graphs: any[]) => {
          let viewData: PerformanceWidgetGraphViewData[] = [];
          graphs.map(g => {
            let a: PerformanceWidgetGraphViewData = new PerformanceWidgetGraphViewData();
            if (widget.device.monitoring.observium) {
              a.name = g.graphType;
            } else {
              if (g.graph_id) {
                a.graphid = g.graph_id;
              }
              a.name = g.name;
            }
            viewData.push(a);
          })
          return viewData;
        })
      ),
    ]);
  }

  buildWidgetForm(widget?: PerformanceWidgetViewData, devices?: MonitoringPerformanceWidgetDevice[], graphs?: PerformanceWidgetGraphViewData[]): FormGroup {
    if (widget) {
      let obj: any = Object.assign({}, widget);
      obj.device = devices.find(d => d.uuid == obj.device.uuid);
      let temp = [];
      obj.graphs.forEach(g => {
        temp.push(graphs.find(dg => dg.name == g.name));
      })
      obj.graphs = temp;
      let form = this.builder.group({
        'device_type': [obj.deviceType, [Validators.required, NoWhitespaceValidator]],
        'device': [obj.device, [Validators.required, NoWhitespaceValidator]],
        'graphs': [obj.graphs, [Validators.required]],
      });
      return form;
    } else {
      return this.builder.group({
        'device_type': ['', [Validators.required, NoWhitespaceValidator]],
        'device': ['', [Validators.required, NoWhitespaceValidator]],
        'graphs': [[], [Validators.required]],
      })
    }
  }

  resetWidgetFormErrors() {
    return {
      'device_type': '',
      'device': '',
      'graphs': '',
    };
  }

  widgetFormValidationMessages = {
    'device_type': {
      'required': 'Device type is required'
    },
    'device': {
      'required': 'Device selection is mandatory'
    },
    'graphs': {
      'required': 'Graph selection is mandatory'
    },
  }

  createWidget(formData: PerformanceWidgetFormData) {
    let obj: any = Object.assign({}, formData);
    obj.device_type = obj.device_type.modelMapping;
    return this.http.post(SYSTEM_MONITORING_WIDGET(), obj);
  }

  updateWidget(widgetId: number, formData: PerformanceWidgetFormData) {
    let obj: any = Object.assign({}, formData);
    obj.device_type = obj.device_type.modelMapping;
    return this.http.put(SYSTEM_MONITORING_WIDGET(widgetId.toString()), obj);
  }

  deleteWidget(widgetId: number) {
    return this.http.delete(SYSTEM_MONITORING_WIDGET(widgetId.toString()));
  }
}

export class PerformanceWidgetViewData {
  widgetId: number;
  deviceType: PerformanceWidgetDeviceTypeMapping;
  device: MonitoringPerformanceWidgetDevice;
  graphs: PerformanceWidgetGraphViewData[];
  constructor() { }
}

export class PerformanceWidgetGraphViewData {
  graphid?: number;
  name: string;
  image?: string;
  isLoaded?: boolean;
  constructor() { }
}

export class PerformanceWidgetFormData {
  device_type: PerformanceWidgetDeviceTypeMapping;
  device: MonitoringPerformanceWidgetDevice;
  graphs: PerformanceWidgetGraphViewData[];
}

export class PerformanceWidgetDeviceTypeMapping {
  type: string;
  mapping: DeviceMapping;
  modelMapping: DeviceModelMapping;
  constructor() { }
}

export const DEVICE_TYPES: PerformanceWidgetDeviceTypeMapping[] = [
  { type: 'Switch', mapping: DeviceMapping.SWITCHES, modelMapping: DeviceModelMapping.SWITCHES },
  { type: 'Firewal', mapping: DeviceMapping.FIREWALL, modelMapping: DeviceModelMapping.FIREWALL },
  { type: 'Load Balancer', mapping: DeviceMapping.LOAD_BALANCER, modelMapping: DeviceModelMapping.LOAD_BALANCER },
  { type: 'Hypervisor', mapping: DeviceMapping.HYPERVISOR, modelMapping: DeviceModelMapping.HYPERVISOR },
  { type: 'Bare Metal Server', mapping: DeviceMapping.BARE_METAL_SERVER, modelMapping: DeviceModelMapping.BARE_METAL_SERVER },
  { type: 'Storage Device', mapping: DeviceMapping.STORAGE_DEVICES, modelMapping: DeviceModelMapping.STORAGE_DEVICES },
  { type: 'MAC Device', mapping: DeviceMapping.MAC_MINI, modelMapping: DeviceModelMapping.MAC_MINI },
  { type: 'Database Server', mapping: DeviceMapping.DB_SERVER, modelMapping: DeviceModelMapping.DB_SERVER },
  { type: 'PDU', mapping: DeviceMapping.PDU, modelMapping: DeviceModelMapping.PDU },
  { type: 'Vcenter Virtual Machines', mapping: DeviceMapping.VMWARE_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.VMWARE_VIRTUAL_MACHINE },
  { type: 'Vcloud Virtual Machines', mapping: DeviceMapping.VCLOUD, modelMapping: DeviceModelMapping.VCLOUD },
  { type: 'Hyper-V Virtual Machines', mapping: DeviceMapping.HYPER_V, modelMapping: DeviceModelMapping.HYPER_V },
  { type: 'ESXI Virtual Machines', mapping: DeviceMapping.ESXI, modelMapping: DeviceModelMapping.ESXI },
  { type: 'OpenStack Virtual Machines', mapping: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.OPENSTACK_VIRTUAL_MACHINE },
];