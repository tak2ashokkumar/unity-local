import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_ALERT_DETAILS, GET_ALERT_LIST, GET_NETWORK_INTERFACE_SUMMARY, GET_NETWORK_SUMMARY, GET_NETWORK_SUMMARY_CPU_MEMORY_UTILIZATION, GET_NETWORK_SUMMARY_INTERFACE_DETAILS, GET_NETWORK_SUMMARY_STATUS_BY_GROUP } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, ChartPluginTypes, UnityChartData } from 'src/app/shared/chart-config.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { NetworkSummary, NetworkSummaryAlertsBySeverity, NetworkSummaryAlertsDetails, NetworkSummaryInterfaceDetails, NetworkSummaryInterfaceSummary, NetworkSummaryStatusByGroup, NetworkSummaryUtilization, TopUtilization } from './network-summary.type';

@Injectable()
export class NetworkSummaryService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService,
    private tableService: TableApiServiceService) { }

  getDatacenter(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ), { params: new HttpParams().set('page_size', 0) })
  }

  getNetworkSummaryData(criteria: SearchCriteria): Observable<any> {
    return this.tableService.getData<any>(GET_NETWORK_SUMMARY(), criteria);
  }

  getStatusByGroupData(criteria: SearchCriteria): Observable<NetworkSummaryStatusByGroup[]> {
    return this.tableService.getData<NetworkSummaryStatusByGroup[]>(GET_NETWORK_SUMMARY_STATUS_BY_GROUP(), criteria);
  }

  getAlertsBySeverityData(criteria: SearchCriteria): Observable<NetworkSummaryAlertsBySeverity> {
    return this.tableService.getData<NetworkSummaryAlertsBySeverity>(GET_ALERT_DETAILS(), criteria);
  }

  getCpuUtilizationData(criteria: SearchCriteria): Observable<NetworkSummaryUtilization> {
    return this.tableService.getData<NetworkSummaryUtilization>(GET_NETWORK_SUMMARY_CPU_MEMORY_UTILIZATION(), criteria);
  }

  getMemoryUtilizationData(): Observable<any> {
    return this.http.get<any>('');
  }

  getInterfaceSummaryData(criteria: SearchCriteria): Observable<NetworkSummaryInterfaceSummary> {
    return this.tableService.getData<NetworkSummaryInterfaceSummary>(GET_NETWORK_INTERFACE_SUMMARY(), criteria);
  }

  getAlertsDetailsData(criteria: SearchCriteria): Observable<PaginatedResult<NetworkSummaryAlertsDetails>> {
    return this.tableService.getData<PaginatedResult<NetworkSummaryAlertsDetails>>(GET_ALERT_LIST(), criteria);
  }

  getInterfaceDetailsData(criteria: SearchCriteria): Observable<NetworkSummaryInterfaceDetails[]> {
    return this.tableService.getData<NetworkSummaryInterfaceDetails[]>(GET_NETWORK_SUMMARY_INTERFACE_DETAILS(), criteria);
  }

  convertToNetworkSummaryData(data: NetworkSummary): NetworkSummaryViewData {
    let view: NetworkSummaryViewData = new NetworkSummaryViewData();
    view.totalDevices = data.total_devices;
    view.switches = data.switch;
    view.firewalls = data.firewall;
    view.loadBalancers = data.load_balancer;
    return view;
  }

  convertToStatusByGroupViewData(data: any): any[] {
    let view: any[] = [];
    return view;
  }

  convertToAlertsBySeverityChartData(res: NetworkSummaryAlertsBySeverity): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'bar';
    view.legend = false;
    let data: number[] = [];
    let colors: string[] = [];
    view.lables.push('Critical', 'Warning', 'Information');
    data.push(res.alerts_data.total_critical, res.alerts_data.total_warning, res.alerts_data.total_information);
    colors.push('#cc0000', '#ff8800', '#378ad8');
    view.datasets.push({ data: [...data], maxBarThickness: 30 });
    view.colors.push({ backgroundColor: colors });
    view.options = this.chartConfigService.getDefaultVerticalBarChartOptions();
    view.options['title'] = {
      display: true,
      text: 'Alerts By Severity',
      position: 'bottom'
    }
    return view;
  }

  convertToAlertsBySeverityData(data: NetworkSummaryAlertsBySeverity): NetworkSummaryAlertsBySeverityViewData {
    let view: NetworkSummaryAlertsBySeverityViewData = new NetworkSummaryAlertsBySeverityViewData();
    view.total = data.alerts_data.total_alerts;
    view.critical = data.alerts_data.total_critical;
    view.warning = data.alerts_data.total_warning;
    view.information = data.alerts_data.total_information;
    view.lastWeekTotal = data.last_week_alerts_data.last_week_total_alerts;
    view.lastWeekCritical = data.last_week_alerts_data.last_week_total_critical;
    view.lastWeekWarning = data.last_week_alerts_data.last_week_total_warning;
    view.lastWeekInformation = data.last_week_alerts_data.last_week_total_information;
    return view;
  }

  convertToCpuUtilizationViewData(data: TopUtilization[]): NetworkSummaryUtilizationViewData[] {
    let viewData: NetworkSummaryUtilizationViewData[] = [];
    data.map(u => {
      let view: NetworkSummaryUtilizationViewData = new NetworkSummaryUtilizationViewData();
      // view.hostName = u.host.host_name;
      view.lastValue = u.lastvalue;
      // view.hostType = u.host.host_type;
      // view.hostUUID = u.host.host_uuid;
      viewData.push(view);
    })
    return viewData;
  }

  convertToMemoryUtilizationViewData(data: TopUtilization[]): NetworkSummaryUtilizationViewData[] {
    let viewData: NetworkSummaryUtilizationViewData[] = [];
    data.map(u => {
      let view: NetworkSummaryUtilizationViewData = new NetworkSummaryUtilizationViewData();
      // view.hostName = u.host.host_name;
      view.lastValue = u.lastvalue;
      // view.hostType = u.host.host_type;
      // view.hostUUID = u.host.host_uuid;
      viewData.push(view);
    })
    return viewData;
  }

  convertToInterfaceSummaryChartData(interfaces: NetworkSummaryInterfaceSummary): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;
    let pc: string[] = NetworkSummaryChartColors;
    view.piedata.push(interfaces.total_up, interfaces.total_down, interfaces.total_disabled);
    view.lables.push(`Up: ${interfaces.total_up}`, `Down: ${interfaces.total_down}`, `Disabled: ${interfaces.total_disabled}`);
    view.colors.push({ backgroundColor: pc });
    view.options = this.chartConfigService.getDefaultPieChartOptions(ChartPluginTypes.outLabels);
    view.options.plugins.outlabels.display = false;
    view.options.legend.position = 'bottom';
    view.options.legend.labels = {
      boxWidth: 25, padding: 10, usePointStyle: true,
      generateLabels: (chart: Chart) => this.chartConfigService.getLegendLabels(chart, 30)
    };
    return view;
  }

  convertToAlertDetailsViewData(data: NetworkSummaryAlertsDetails[]): NetworkSummaryAlertsDetailsViewData[] {
    let viewData: NetworkSummaryAlertsDetailsViewData[] = [];
    data.map(ns => {
      let view: NetworkSummaryAlertsDetailsViewData = new NetworkSummaryAlertsDetailsViewData();
      view.id = ns.id;
      view.name = ns.device_name;
      view.severity = ns.severity;
      view.description = ns.description;
      switch (ns.severity) {
        case 'Critical':
          view.severityClass = 'fas fa-exclamation-triangle text-danger';
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

  convertToInterfaceDetailsViewData(data: NetworkSummaryInterfaceDetails[]): NetworkSummaryInterfaceDetailsViewData[] {
    let viewData: NetworkSummaryInterfaceDetailsViewData[] = [];
    data.map(i => {
      let view: NetworkSummaryInterfaceDetailsViewData = new NetworkSummaryInterfaceDetailsViewData();
      view.host = new NetwrokSummaryHostViewData();
      view.receive = new InterfaceDetailPropertyViewData();
      view.transmit = new InterfaceDetailPropertyViewData();
      view.bandwidth = new InterfaceDetailViewData();
      view.speed = new InterfaceDetailViewData();
      view.inboundDiscarded = new InterfaceDetailPropertyViewData();
      view.inboundWithError = new InterfaceDetailPropertyViewData();
      view.outboundDiscarded = new InterfaceDetailPropertyViewData();
      view.outboundWithError = new InterfaceDetailPropertyViewData();
      view.host.name = i.host.name;
      view.host.type = i.host.device_type;
      view.host.uuid = i.host.device_uuid;
      view.name = i.interface_name;
      view.itemId = i.interface_itemid;
      view.receive.value = i.receive.value;
      view.transmit.value = i.transmit.value;
      view.bandwidth.convertedValue = i.bandwidth.converted_value;
      view.speed.convertedValue = i.speed.converted_value;
      view.inboundDiscarded.value = i.inbound_discarded.value;
      view.inboundWithError.value = i.inbound_with_error.value;
      view.outboundDiscarded.value = i.outbound_discarded.value;
      view.outboundWithError.value = i.outbound_with_error.value;
      viewData.push(view);
    });
    return viewData;
  }
}

export class NetworkSummaryViewData {
  constructor() { }
  totalDevicesLoader: string = 'NetworkSummaryTotalDevicesLoader'
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

export class NetworkSummaryUtilizationViewData {
  constructor() { }
  loader: string = 'NetworkSummaryCpuUtilizationLoader';
  itemid: string;
  lastValue: number;
  hostId: string;
  key: string;
  name: string;
  hostName: string;
  hostType: string;
  hostUUID: string;
}

// export class NetworkSummaryMemoryUtilizationViewData {
//   constructor() { }
//   loader: string = 'NetworkSummaryMemoryUtilizationLoader';
//   itemid: string;
//   lastValue: number;
//   hostId: string;
//   key: string;
//   name: string;
//   hostName: string;
//   hostType: string;
//   hostUUID: string;
// }

export class NetworkSummaryInterfaceSummaryViewData {
  constructor() { }
  loader: string = 'NetworkSummaryInterfaceSummaryLoader';
  chartData: UnityChartData;
  total: number;
  up: number;
  down: number;
  disabled: number;
}

export class NetworkSummaryAlertsDetailsViewData {
  constructor() { }
  loader: string = 'NetworkSummaryAlertsDetailsLoader';
  id: number;
  name: string;
  severity: string;
  description: string;
  duration: string;
  severityClass: string;
}

export class NetworkSummaryInterfaceDetailsViewData {
  constructor() { }
  loader: string = 'NetworkSummaryInterfaceDetailsLoader';
  host: NetwrokSummaryHostViewData;
  name: string;
  itemId: string;
  receive: InterfaceDetailPropertyViewData;
  transmit: InterfaceDetailPropertyViewData;
  bandwidth: InterfaceDetailViewData;
  speed: InterfaceDetailViewData;
  inboundDiscarded: InterfaceDetailPropertyViewData;
  inboundWithError: InterfaceDetailPropertyViewData;
  outboundDiscarded: InterfaceDetailPropertyViewData;
  outboundWithError: InterfaceDetailPropertyViewData;
}

export class NetwrokSummaryHostViewData {
  constructor() { }
  name: string;
  id: number;
  uuid: string;
  type: string;
}

export class InterfaceDetailPropertyViewData {
  constructor() { }
  name: string;
  value: string;
  id: string;
}

export class InterfaceDetailViewData extends InterfaceDetailPropertyViewData {
  convertedValue: string;
}

export const NetworkSummaryChartColors: string[] = [
  'rgb(12 187 112)', 'rgb(204 0 0)', 'rgb(217 217 217)'
];

export class NetworkSummaryManufacturer {
  name: string;
  isSelected: boolean = false;
}