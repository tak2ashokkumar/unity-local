import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_GRAPH_BY_GRAPH_TYPE, SYSTEM_MONITORING_WIDGET, ZABBIX_DEVICE_GRAPHS, ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, DeviceModelMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ObserviumGraphUtil } from 'src/app/shared/observium-graph-util/observium-graph-util.service';
import { GraphData } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { SystemMonitoringWidget, SystemMonitoringWidgetDevice, ZabbixMonitoringGraph } from './system-monitoring.type';
import * as moment from 'moment';

@Injectable()
export class SystemService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private observiumGraphUtil: ObserviumGraphUtil,
    private util: AppUtilityService) { }

  getWidgets(): Observable<SystemMonitoringWidget[]> {
    return this.http.get<SystemMonitoringWidget[]>(SYSTEM_MONITORING_WIDGET(), { params: { 'page_size': '0' } });
  }

  convertToViewData(widgets: SystemMonitoringWidget[]): SystemMonitoringWidgetViewData[] {
    let viewData: SystemMonitoringWidgetViewData[] = [];
    widgets.map(wd => {
      if (wd.device && wd.device.monitoring && wd.widget_data) {
        let a: SystemMonitoringWidgetViewData = new SystemMonitoringWidgetViewData();
        a.widgetId = wd.id;
        a.deviceType = DEVICE_TYPES.find(dt => dt.modelMapping == wd.widget_data.device_type);;
        a.device = wd.device;
        a.graphs = [];
        wd.widget_data.graphs.map(wdg => {
          if (wdg) {
            let g: SystemMonitoringWidgetGraphViewData = new SystemMonitoringWidgetGraphViewData();
            if (wdg.graphid) {
              g.graphid = wdg.graphid;
            }
            g.name = wdg.name;
            a.graphs.push(g);
          }
        })
        viewData.push(a);
      }
    })
    return viewData;
  }

  getGraphImages(deviceType: SystemMonitoringWidgetDeviceTypeMapping, device: SystemMonitoringWidgetDevice, graph: SystemMonitoringWidgetGraphViewData, formData: any): Observable<Map<string, string>> {
    const format = new DateRange().format;
    if (device.monitoring.observium) {
      const params = new HttpParams().set('graph_type', graph.name).set('legend', 'no').set('height', '150').set('width', '200').set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
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
      const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
      return this.http.get<{ [key: string]: string }>(ZABBIX_DEVICE_GRAPH_BY_DEVICE_TYPE(deviceType.mapping, device.uuid, graph.graphid), { params: params })
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

  buildDateRangeFilterForm(dateRange: DateRange): FormGroup {
    this.resetDateRangeFilterFormErrors();
    return this.builder.group({
      'period': [DateRangeOptions.LAST_24_HOURS, [Validators.required]],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }

  resetDateRangeFilterFormErrors(): any {
    let formErrors = {
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  dateRangeFilterFormValidationMessages = {
    'period': {
      'required': 'Graph Period is required'
    },
    'from': {
      'required': 'From date is required'
    },
    'to': {
      'required': 'To date is required'
    }
  };

  getDateRangeByPeriod(graphRange: DateRangeOptions): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case DateRangeOptions.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case DateRangeOptions.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case DateRangeOptions.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case DateRangeOptions.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case DateRangeOptions.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  getDevices(deviceType: SystemMonitoringWidgetDeviceTypeMapping): Observable<SystemMonitoringWidgetDevice[]> {
    return this.http.get<SystemMonitoringWidgetDevice[]>(DEVICES_FAST_BY_DEVICE_TYPE(deviceType.mapping, false))
      .pipe(map(devices => devices.filter(d => d.monitoring && d.monitoring.configured)));
  }

  getDeviceGraphNames(deviceType: SystemMonitoringWidgetDeviceTypeMapping, device: SystemMonitoringWidgetDevice): Observable<SystemMonitoringWidgetGraphViewData[]> {
    if (device.monitoring.observium) {
      return of(this.observiumGraphUtil.getGraphTypes(deviceType.mapping))
        .pipe(
          map(graphs => {
            let viewData: SystemMonitoringWidgetGraphViewData[] = [];
            graphs.map(g => {
              let a: SystemMonitoringWidgetGraphViewData = new SystemMonitoringWidgetGraphViewData();
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
            let viewData: SystemMonitoringWidgetGraphViewData[] = [];
            graphs.map(g => {
              let a: SystemMonitoringWidgetGraphViewData = new SystemMonitoringWidgetGraphViewData();
              a.graphid = g.graph_id;
              a.name = g.name;
              viewData.push(a);
            })
            return viewData;
          })
        );
    }
  }

  getDevicesAndGraphNames(widget: SystemMonitoringWidgetViewData): Observable<any> {
    const devices = this.http.get<SystemMonitoringWidgetDevice[]>(DEVICES_FAST_BY_DEVICE_TYPE(widget.deviceType.mapping, false))
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
          let viewData: SystemMonitoringWidgetGraphViewData[] = [];
          graphs.map(g => {
            let a: SystemMonitoringWidgetGraphViewData = new SystemMonitoringWidgetGraphViewData();
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

  buildWidgetForm(widget?: SystemMonitoringWidgetViewData, devices?: SystemMonitoringWidgetDevice[], graphs?: SystemMonitoringWidgetGraphViewData[]): FormGroup {
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
        // 'device': ['', [Validators.required, NoWhitespaceValidator]],
        // 'graphs': [[], [Validators.required]],
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

  createWidget(formData: SystemMonitoringWidgetFormData) {
    let obj: any = Object.assign({}, formData);
    obj.device_type = obj.device_type.modelMapping;
    return this.http.post(SYSTEM_MONITORING_WIDGET(), obj);
  }

  updateWidget(widgetId: number, formData: SystemMonitoringWidgetFormData) {
    let obj: any = Object.assign({}, formData);
    obj.device_type = obj.device_type.modelMapping;
    return this.http.put(SYSTEM_MONITORING_WIDGET(widgetId.toString()), obj);
  }

  deleteWidget(widgetId: number) {
    return this.http.delete(SYSTEM_MONITORING_WIDGET(widgetId.toString()));
  }
}

export class SystemMonitoringWidgetViewData {
  widgetId: number;
  deviceType: SystemMonitoringWidgetDeviceTypeMapping;
  device: SystemMonitoringWidgetDevice;
  graphs: SystemMonitoringWidgetGraphViewData[];
  constructor() { }
}

export class SystemMonitoringWidgetGraphViewData {
  graphid?: number;
  name: string;
  image?: string;
  isLoaded?: boolean;
  constructor() { }
}

export class SystemMonitoringWidgetFormData {
  device_type: SystemMonitoringWidgetDeviceTypeMapping;
  device: SystemMonitoringWidgetDevice;
  graphs: SystemMonitoringWidgetGraphViewData[];
}

export class SystemMonitoringWidgetDeviceTypeMapping {
  type: string;
  mapping: DeviceMapping;
  modelMapping: DeviceModelMapping;
  constructor() { }
}

export const DEVICE_TYPES: SystemMonitoringWidgetDeviceTypeMapping[] = [
  { type: 'Switch', mapping: DeviceMapping.SWITCHES, modelMapping: DeviceModelMapping.SWITCHES },
  { type: 'Firewall', mapping: DeviceMapping.FIREWALL, modelMapping: DeviceModelMapping.FIREWALL },
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
  { type: 'Custom Virtual Machines', mapping: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.CUSTOM_VIRTUAL_MACHINE },
];

export enum DateRangeOptions {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}