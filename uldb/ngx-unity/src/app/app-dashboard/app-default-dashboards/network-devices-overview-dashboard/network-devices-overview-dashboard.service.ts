import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_ALERT_DETAILS, GET_NETWORK_SUMMARY, GET_NETWORK_SUMMARY_INTERFACE_DETAILS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { NetworkSummary, NetworkSummaryAlertsBySeverity, NetworkSummaryAlertsDetails, NetworkSummaryInterfaceDetails, NetworkSummaryInterfaceSummary, NetworkSummaryModels, NetworkSummaryStatusByGroup, Top10Utilization } from 'src/app/shared/SharedEntityTypes/dashboard/network-devices-overview-dashboard.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NetworkDevicesOverviewDashboardService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private chartConfigService: ChartConfigService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private appService: AppLevelService) { }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ), { params: new HttpParams().set('page_size', 0) });
  }

  getNetworkSummaryData(criteria: SearchCriteria): Observable<NetworkSummary> {
    return this.tableService.getData<NetworkSummary>(GET_NETWORK_SUMMARY(), criteria);
  }

  convertToNetworkSummaryData(data: NetworkSummary): NetworkSummaryViewData {
    let view: NetworkSummaryViewData = new NetworkSummaryViewData();
    view.totalDevices = data.total_devices;
    view.switches = data.switch;
    view.firewalls = data.firewall;
    view.loadBalancers = data.load_balancer;
    return view;
  }

  getStatusByGroupData(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<CeleryTask>(`/customer/network_device_group/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  setStatusByChildren(subNodes: NetworkStatusByGroupData[]) {
    switch (true) {
      case subNodes.every(node => node.status == 'up'): return 'up';
      case subNodes.every(node => node.status == 'down'): return 'down';
      case subNodes.every(node => node.status == 'unknown'): return 'unknown';
      case subNodes.every(node => node.status == 'up'): return 'unknown';
      default: return 'amber';
    }
  }

  convertToStatusByGroupViewData(data: NetworkSummaryStatusByGroup, viewData: NetworkStatusByGroupViewData) {
    let manufacturerData = <NetworkSummaryModels[]>Object.values(data);
    manufacturerData.map(mfd => {
      let mfr = new NetworkStatusByGroupData();
      mfr.name = mfd.manufacturer_name;
      mfr.nodeType = 'Manufacturer';
      if (mfd.models && Object.keys(mfd.models).length) {
        Object.keys(mfd.models).forEach(modelName => {
          let mdl = new NetworkStatusByGroupData();
          mdl.name = modelName;
          mdl.nodeType = 'Model';
          mfd.models[modelName].map(device => {
            let c = new NetworkStatusByGroupData();
            c.name = device.name;
            c.nodeType = 'Device';
            c.type = device.device_type;
            c.status = device.status;
            c.uuid = device.uuid;
            c.monitoring = device.monitoring;
            mdl.nodes.push(c);
          });
          mdl.status = this.setStatusByChildren(mdl.nodes);
          mfr.nodes.push(mdl);
        })
      }
      mfr.status = this.setStatusByChildren(mfr.nodes);
      viewData.manufacturerViewData.push(mfr);
    })
    viewData.manufacturerViewData.forEach(mfvd => {
      viewData.modelViewData = viewData.modelViewData.concat(mfvd.nodes);
    })
    viewData.modelViewData.forEach(mvd => {
      viewData.deviceViewData = viewData.deviceViewData.concat(mvd.nodes);
    })
    viewData.displayViewData = viewData.manufacturerViewData;
  }

  getAlertsBySeverityData(criteria: SearchCriteria): Observable<NetworkSummaryAlertsBySeverity> {
    return this.tableService.getData<NetworkSummaryAlertsBySeverity>(GET_ALERT_DETAILS(), criteria);
  }

  convertToAlertsBySeverityData(data: NetworkSummaryAlertsBySeverity): NetworkSummaryAlertsBySeverityViewData {
    let view: NetworkSummaryAlertsBySeverityViewData = new NetworkSummaryAlertsBySeverityViewData();
    view.total = data.events_data?.total_events;
    view.critical = data.events_data?.total_critical;
    view.warning = data.events_data?.total_warning;
    view.information = data.events_data?.total_information;
    view.lastWeekTotal = data.last_week_events_data?.last_week_total_events;
    view.lastWeekCritical = data.last_week_events_data?.last_week_total_critical;
    view.lastWeekWarning = data.last_week_events_data?.last_week_total_warning;
    view.lastWeekInformation = data.last_week_events_data?.last_week_total_information;
    return view;
  }

  convertToAlertsBySeverityChartData(res: NetworkSummaryAlertsBySeverity): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'bar';
    view.legend = false;
    let data: number[] = [];
    let colors: string[] = [];
    view.lables.push('Critical', 'Warning', 'Information');
    data.push(res.events_data?.total_critical, res.events_data?.total_warning, res.events_data?.total_information);
    colors.push('#cc0000', '#ff8800', '#378ad8');
    view.datasets.push({ data: [...data], maxBarThickness: 25 });
    view.colors.push({ backgroundColor: colors });
    view.options = this.chartConfigService.getDefaultVerticalBarChartOptions();
    view.options.layout.padding = { top: 20, right: 20, bottom: 10, left: 20 }
    view.options['title'] = { display: true, text: 'Events By Severity', position: 'bottom', padding: 5 };
    return view;
  }

  getInterfaceSummaryData(criteria: SearchCriteria): Observable<NetworkSummaryInterfaceSummary> {
    const params = new HttpParams().set('summary', true);
    return this.http.get<NetworkSummaryInterfaceSummary>(GET_NETWORK_SUMMARY_INTERFACE_DETAILS(), { params: params });
  }

  convertToInterfaceSummaryChartData(interfaces: NetworkSummaryInterfaceSummary): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;
    view.piedata.push(interfaces.total_up, interfaces.total_down, interfaces.total_unknown);
    view.lables.push(`Up: ${interfaces.total_up}`, `Down: ${interfaces.total_down}`, `Unknown: ${interfaces.total_unknown}`);
    view.colors.push({ backgroundColor: NetworkSummaryChartColors });
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.legend.position = 'bottom';
    view.options.legend.labels = { boxWidth: 20, padding: 10, usePointStyle: true };
    view.options.cutoutPercentage = 60;
    let centerTextArr: Array<{ text: string, fontSize: string }> = [];
    centerTextArr.push({ text: 'Total', fontSize: `15px` });
    centerTextArr.push({ text: interfaces.total_interfaces.toString(), fontSize: `15px` });
    view.customPlugin = this.chartConfigService.textAtCenterOfPieChartPlugin(centerTextArr);
    return view;
  }

  getUtilizationData(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<CeleryTask>(`customer/cpu_memory_usage/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  convertToCpuUtilizationViewData(data: Top10Utilization[]): NetworkSummaryUtilizationViewData[] {
    let viewData: NetworkSummaryUtilizationViewData[] = [];
    data.forEach(u => {
      let view: NetworkSummaryUtilizationViewData = new NetworkSummaryUtilizationViewData();
      view.host.name = u.host?.host_name;
      view.lastValue = u.lastvalue;
      view.host.type = u.host?.host_type;
      view.host.uuid = u.host?.host_uuid;
      view.name = u.name;
      view.monitoring = u.host?.host_monitoring?.configured;
      viewData.push(view);
    })
    return viewData;
  }

  convertToMemoryUtilizationViewData(data: Top10Utilization[]): NetworkSummaryUtilizationViewData[] {
    let viewData: NetworkSummaryUtilizationViewData[] = [];
    data.forEach(u => {
      let view: NetworkSummaryUtilizationViewData = new NetworkSummaryUtilizationViewData();
      view.host.name = u.host?.host_name;
      view.lastValue = u.lastvalue;
      view.host.type = u.host?.host_type;
      view.host.uuid = u.host?.host_uuid;
      view.name = u.name;
      view.monitoring = u.host?.host_monitoring?.configured;
      viewData.push(view);
    })
    return viewData;
  }

  getAlertsDetailsData(criteria: SearchCriteria): Observable<TaskStatus> {
    // return this.tableService.getData<PaginatedResult<NetworkSummaryAlertsDetails>>(GET_ALERT_LIST(), criteria);
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<CeleryTask>(`customer/alert_detail_list/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  convertToAlertDetailsViewData(data: NetworkSummaryAlertsDetails[]): NetworkSummaryAlertsDetailsViewData[] {
    let viewData: NetworkSummaryAlertsDetailsViewData[] = [];
    data.map(ns => {
      let view: NetworkSummaryAlertsDetailsViewData = new NetworkSummaryAlertsDetailsViewData();
      view.id = ns.id;
      view.uuid = ns.uuid;
      view.eventCount = ns.event_count;
      view.alertTime = ns.alert_datetime ? this.utilSvc.toUnityOneDateFormat(ns.alert_datetime) : 'N/A';
      view.deviceName = ns.device_name;
      view.severity = ns.severity;
      view.description = ns.description;
      switch (ns.severity) {
        case 'Critical':
          view.severityClass = 'fas fa-exclamation-circle text-danger fa-lg';
          break;
        case 'Warning':
          view.severityClass = 'fas fa-exclamation-circle text-warning fa-lg';
          break
        case 'Information':
          view.severityClass = 'fas fa-info-circle text-primary fa-lg';
          break;
      }
      view.duration = ns.alert_duration;
      viewData.push(view);
    });
    return viewData;
  }

  buildForm(columns: TableColumnMapping[]): FormGroup {
    return this.builder.group({
      'columns': [columns],
      'interfaceDetail': ['receive']
    });
  }

  getInterfaceDetailsData(criteria: SearchCriteria): Observable<PaginatedResult<NetworkSummaryInterfaceDetails>> {
    // return this.tableService.getData<PaginatedResult<NetworkSummaryInterfaceDetails>>(GET_NETWORK_SUMMARY_INTERFACE_DETAILS(), criteria);
    const params = new HttpParams().set('page_size', 10).set('filter_type', criteria.params[0].filter_type);
    return this.http.get<PaginatedResult<NetworkSummaryInterfaceDetails>>(GET_NETWORK_SUMMARY_INTERFACE_DETAILS(), { params: params });
  }

  convertToInterfaceDetailsViewData(data: NetworkSummaryInterfaceDetails[]): NetworkSummaryInterfaceDetailsViewData[] {
    let viewData: NetworkSummaryInterfaceDetailsViewData[] = [];
    data.map(i => {
      let view: NetworkSummaryInterfaceDetailsViewData = new NetworkSummaryInterfaceDetailsViewData();
      view.name = i.interface_name;
      view.itemId = i.interface_itemid;
      view.hostName = i.host?.name;
      view.hostType = i.host?.device_type;
      view.hostId = i.host?.device_uuid;
      view.receive = i.receive?.converted_value;
      view.transmit = i.transmit?.converted_value;
      view.bandwidth = i.bandwidth?.converted_value;
      view.speed = i.speed?.converted_value;
      view.inboundDiscarded = i.inbound_discarded?.value;
      view.inboundWithError = i.inbound_with_error?.value;
      view.outboundDiscarded = i.outbound_discarded?.value;
      view.outboundWithError = i.outbound_with_error?.value;
      viewData.push(view);
    });
    return viewData;
  }

  syncInterfaceDetails(criteria: SearchCriteria): Observable<TaskStatus> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<CeleryTask>(`/customer/interface_task/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTaskByUrl(`customer/interface_task/`, res.task_id, 2, 1000).pipe(take(1))), take(1));
  }
}

export class NetworkSummaryViewData {
  constructor() { }
  totalDevicesLoader: string = 'NetworkSummaryTotalDevicesLoader';
  devicesLoader: string = 'NetworkSummaryDevicesLoaderLoader';
  totalDevices: NetworkSummaryDetailsViewData;
  switches: NetworkSummaryDetailsViewData;
  firewalls: NetworkSummaryDetailsViewData;
  loadBalancers: NetworkSummaryDetailsViewData;
}

export class NetworkSummaryDetailsViewData {
  constructor() { }
  total: number;
  up: number;
  down: number;
  unknown: number;
}

// Status By Group Widget
export class NetworkStatusByGroupViewData {
  viewTypes: string[] = ['Manufacturer', 'Model', 'Device'];
  selectedViewType: string = 'Manufacturer';
  loader: string = 'NetworkSummaryStatusByGroupLoader';
  deviceViewData: NetworkStatusByGroupData[] = [];
  modelViewData: NetworkStatusByGroupData[] = [];
  manufacturerViewData: NetworkStatusByGroupData[] = [];
  displayViewData: NetworkStatusByGroupData[] = [];
}

export class NetworkStatusByGroupData {
  uuid?: string;
  name: string;
  nodeType: string;
  status: string;
  selected: boolean = false;
  type: string;
  monitoring: DeviceMonitoringType;
  nodes?: NetworkStatusByGroupData[] = [];
}

export class NetworkSummaryAlertsBySeverityViewData {
  constructor() { }
  loader: string = 'NetworkSummaryAlertsBySeverityLoader';
  chartData: UnityChartData;
  total: number;
  critical: number;
  warning: number;
  information: number;
  lastWeekTotal: number;
  lastWeekCritical: number;
  lastWeekWarning: number;
  lastWeekInformation: number;
}

export class NetworkSummaryInterfaceSummaryViewData {
  constructor() { }
  loader: string = 'NetworkSummaryInterfaceSummaryLoader';
  chartData: UnityChartData;
  total: number;
  up: number;
  down: number;
  disabled: number;
}

export class NetworkSummaryUtilizationViewData {
  constructor() { }
  loader: string = 'NetworkSummaryCpuUtilizationLoader';
  itemid: string;
  lastValue: number;
  hostId: string;
  key: string;
  name: string;
  host: NetwrokSummaryHostViewData = new NetwrokSummaryHostViewData();
  monitoring: boolean;
}

export class NetwrokSummaryHostViewData {
  constructor() { }
  name: string;
  id: number;
  uuid: string;
  type: string;
  deviceMapping: DeviceMapping;
}

export class NetworkSummaryAlertsDetailsViewData {
  constructor() { }
  loader: string = 'NetworkSummaryAlertsDetailsLoader';
  id: number;
  uuid: string;
  eventCount: number;
  alertTime: string;
  deviceName: string;
  severity: string;
  description: string;
  duration: string;
  severityClass: string;
}

export class NetworkSummaryInterfaceDetailsViewData {
  constructor() { }
  loader: string = 'NetworkSummaryInterfaceDetailsLoader';
  itemId: string;
  name: string;
  status: string;
  hostName: string;
  hostType: string;
  hostId: string;
  receive: string;
  transmit: string;
  bandwidth: string;
  speed: string;
  inboundDiscarded: string;
  inboundWithError: string;
  outboundDiscarded: string;
  outboundWithError: string;
}

export const NetworkSummaryChartColors: string[] = [
  'rgb(12 187 112)', 'rgb(204 0 0)', 'rgb(217 217 217)'
];

export const interfaceColumnMapping: Array<TableColumnMapping> = [
  {
    'name': 'Host',
    'key': 'hostName',
    'default': true,
    'mandatory': true,
    // 'type': 'btn-link'
  },
  {
    'name': 'Device Type',
    'key': 'hostType',
    'default': true,
    'mandatory': true,
    // 'type': 'btn-link'
  },
  // {
  //   'name': 'Interface Name',
  //   'key': 'name',
  //   'default': true,
  //   'mandatory': true,
  //   'type': 'btn-link'
  // },
  {
    'name': 'Receive',
    'key': 'receive',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'Transmit',
    'key': 'transmit',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'Bandwidth',
    'key': 'bandwidth',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'Speed',
    'key': 'speed',
    'default': true,
    'mandatory': true,
    'type': 'btn-link'
  },
  {
    'name': 'Inbound Discarded',
    'key': 'inboundDiscarded',
    'default': false,
    'mandatory': false,
    // 'type': 'btn-link'
  },
  {
    'name': 'Inbound with error',
    'key': 'inboundWithError',
    'default': false,
    'mandatory': false,
    // 'type': 'btn-link'
  },
  {
    'name': 'Outbound Discarded',
    'key': 'outboundDiscarded',
    'default': false,
    'mandatory': false,
    // 'type': 'btn-link'
  },
  {
    'name': 'Outbound with error',
    'key': 'outboundWithError',
    'default': false,
    'mandatory': false,
    // 'type': 'btn-link'
  },
];