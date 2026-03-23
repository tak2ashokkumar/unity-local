import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Observable } from 'rxjs';
import { ZABBIX_DEVICE_GRAPH_IMAGE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { InfrastructureDeviceInterface, InfrastructureInterfaceAlerts, InfrastructureInterfaceDetails, InfrastructureRecentAlerts } from './infrastructure-interface-details.type';

@Injectable()
export class InfrastructureInterfaceDetailsService {

  constructor(private http: HttpClient,
    private buiilder: FormBuilder,
    private util: AppUtilityService,
    private chartConfigService: ChartConfigService,) { }

  getDateRangeByPeriod(graphRange: CustomDeviceGraphRange): DateRange {
    const format = new DateRange().format;
    switch (graphRange) {
      case CustomDeviceGraphRange.LAST_24_HOURS:
        return { from: moment().subtract(1, 'd').format(), to: moment().subtract(1, 'm').format(format) };
      case CustomDeviceGraphRange.YESTERDAY:
        return { from: moment().subtract(1, 'd').startOf('d').format(format), to: moment().subtract(1, 'd').endOf('d').format(format) };
      case CustomDeviceGraphRange.LAST_WEEK:
        return { from: moment().subtract(1, 'w').startOf('w').format(format), to: moment().subtract(1, 'w').endOf('w').format(format) };
      case CustomDeviceGraphRange.LAST_MONTH:
        return { from: moment().subtract(1, 'M').startOf('M').format(format), to: moment().subtract(1, 'M').endOf('M').format(format) };
      case CustomDeviceGraphRange.LAST_YEAR:
        return { from: moment().subtract(1, 'y').startOf('y').format(format), to: moment().subtract(1, 'y').endOf('y').format(format) };
      default: return null;
    }
  }

  buildForm(dateRange: DateRange): FormGroup {
    this.resetFormErrors();
    return this.buiilder.group({
      'period': [CustomDeviceGraphRange.LAST_24_HOURS, [Validators.required]],
      'from': [{ value: new Date(dateRange.from), disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'to': [{ value: new Date(dateRange.to), disabled: true }, [Validators.required, NoWhitespaceValidator]],
    }, { validators: this.util.dateRangeValidator('from', 'to') });
  }

  resetFormErrors(): any {
    let formErrors = {
      'period': '',
      'from': '',
      'to': '',
    };
    return formErrors;
  }

  validationMessages = {
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

  getNetworkInterfaceDetails(interfaceId: string): Observable<InfrastructureInterfaceDetails> {
    return this.http.get<InfrastructureInterfaceDetails>(`/customer/interface_item/?interface_id=${interfaceId}`)
  }

  convertToInterfaceSummaryData(data: InfrastructureDeviceInterface): DeviceInterfaceDetailsViewData {
    let view: DeviceInterfaceDetailsViewData = new DeviceInterfaceDetailsViewData();
    view.host.deviceUuid = data.host.device_uuid;
    view.host.deviceType = data.host.device_type;
    view.interfaceName = data.interface_name;
    view.receive.convertedValue = data.receive.converted_value;
    view.transmit.convertedValue = data.transmit.converted_value;
    view.bandwidth.convertedValue = data.bandwidth.converted_value;
    view.speed.convertedValue = data.speed.converted_value;
    view.inboundDiscarded.value = data.inbound_discarded.value;
    view.inboundWithError.value = data.inbound_with_error.value;
    view.outboundDiscarded.value = data.outbound_discarded.value;
    view.outboundWithError.value = data.outbound_with_error.value;
    view.interfaceStatus = data.interface_status;
    switch (data.interface_status) {
      case '1': view.deviceStatusIcon = 'fa-circle text-success'; break;
      case '2': view.deviceStatusIcon = 'fa-circle text-danger'; break;
      default: view.deviceStatusIcon = 'fa-exclamation-circle text-secondary';
    }
    return view;
  }

  convertToInterfaceAlertsChartData(data: InfrastructureInterfaceAlerts): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;
    view.piedata.push(data.critical, data.warning, data.information);
    view.lables.push(`Critical: ${data.critical}`, `Warning: ${data.warning}`, `Info: ${data.information}`);
    view.colors.push({ backgroundColor: ['#cc0000', '#ff8800', '#378ad8'] });
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.legend.position = 'bottom';
    view.options.legend.labels = { boxWidth: 20, padding: 5, usePointStyle: true };
    view.options.cutoutPercentage = 60;
    let centerTextArr: Array<{ text: string, fontSize: string }> = [];
    centerTextArr.push({ text: 'Total', fontSize: `15px` });
    centerTextArr.push({ text: data.total.toString(), fontSize: `15px` });
    view.customPlugin = this.chartConfigService.textAtCenterOfPieChartPlugin(centerTextArr);
    return view;
  }

  convertToInterfaceAlertsViewData(alerts: InfrastructureRecentAlerts[]): DeviceInterfaceRecentAlertsViewData[] {
    let viewData: DeviceInterfaceRecentAlertsViewData[] = [];
    alerts.forEach(a => {
      let view: DeviceInterfaceRecentAlertsViewData = new DeviceInterfaceRecentAlertsViewData();
      view.id = a.id;
      view.description = a.description;
      view.source = a.source
      view.count = a.event_count;
      view.acknowledged = a.is_acknowledged ? 'Yes' : 'No';
      view.duration = a.alert_duration;
      view.severity = a.severity;
      switch (a.severity) {
        case 'Critical':
          view.severityClass = 'fas fa-exclamation-circle text-danger';
          break;
        case 'Warning':
          view.severityClass = 'fas fa-exclamation-circle text-warning fa-lg';
          break
        case 'Information':
          view.severityClass = 'fas fa-info-circle text-primary fa-lg';
          break;
      }
      viewData.push(view);
    });
    return viewData;
  }

  getGraph(deviceId: string, deviceType: DeviceMapping, graphId: string, formData: any): Observable<{ [key: string]: string }> {
    const format = new DateRange().format;
    const params = new HttpParams().set('from', moment(formData['from']).format(format)).set('to', moment(formData['to']).format(format));
    return this.http.get<{ [key: string]: string }>(ZABBIX_DEVICE_GRAPH_IMAGE(deviceType, deviceId, graphId), { params: params })
  }
}
export class DeviceInterfaceDetailsViewData {
  constructor() { }
  NetworkInterfaceDetailsLoader: string = 'NetworkInterfaceDetailsLoader'
  host: DeviceInterfaceHost = new DeviceInterfaceHost();
  interfaceName: string;
  interfaceStatus: string;
  interfaceItemid: string;
  deviceStatusIcon: string;
  receive: DeviceInterfaceReceive = new DeviceInterfaceReceive();
  transmit: DeviceInterfaceTransmit = new DeviceInterfaceTransmit();
  bandwidth: DeviceInterfaceBandwidth = new DeviceInterfaceBandwidth();
  speed: DeviceInterfaceSpeed = new DeviceInterfaceSpeed();
  inboundDiscarded: DeviceInterfaceInboundDiscarded = new DeviceInterfaceInboundDiscarded();
  inboundWithError: DeviceInterfaceInboundWithError = new DeviceInterfaceInboundWithError();
  outboundDiscarded: DeviceInterfaceOutboundDiscarded = new DeviceInterfaceOutboundDiscarded();
  outboundWithError: DeviceInterfaceOutboundWithError = new DeviceInterfaceOutboundWithError();
}
export class DeviceInterfaceHost {
  constructor() { }
  name: string;
  hostId: number;
  deviceUuid: string;
  deviceType: string;
}
export class DeviceInterfaceReceive {
  constructor() { }
  name: string;
  value: string;
  itemId: string;
  convertedValue: string;
  graphId: string;
}
export class DeviceInterfaceTransmit {
  constructor() { }
  name: string;
  value: string;
  itemId: string;
  convertedValue: string;
  graphId: string;
}
export class DeviceInterfaceBandwidth {
  constructor() { }
  name: string;
  value: string;
  itemId: string;
  convertedValue: string;
  graphId: string;
}
export class DeviceInterfaceSpeed {
  constructor() { }
  name: string;
  value: string;
  itemId: string;
  convertedValue: string;
  graphId: string;
}
export class DeviceInterfaceInboundDiscarded {
  constructor() { }
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}
export class DeviceInterfaceInboundWithError {
  constructor() { }
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}
export class DeviceInterfaceOutboundDiscarded {
  constructor() { }
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}
export class DeviceInterfaceOutboundWithError {
  constructor() { }
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}
export class NetworkInterfaceDetailsGraphViewdata {
  constructor() { }
  graphid: string;
  name: string;
  image: string;
}

export enum CustomDeviceGraphRange {
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

export class DeviceInterfaceRecentAlertsViewData {
  id: number;
  description: string;
  source: string;
  count: number = 0;
  acknowledged: string;
  duration: string;
  severity: string;
  severityClass: string;
}