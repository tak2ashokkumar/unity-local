import { DatePipe, formatNumber } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartData, ChartLegendLabelItem, ChartOptions, ChartTooltipItem } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label } from 'ng2-charts';
import { Observable, of, Subject } from 'rxjs';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { ZABBIX_ALERT_ACTIONS, ZABBIX_ALERT_BULK_ACTIONS, ZABBIX_ALL_ALERTS, ZABBIX_ALL_ALERTS_SUMMARY, ZABBIX_GROUP_BY_ALERTS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { RandColorGeneratorService } from 'src/app/shared/rand-color-generator.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnityViewAlert, UnityViewGroupByAlert } from '../unity-alerts.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { map } from 'rxjs/operators';

@Injectable()
export class UnityAlertsViewService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private colorSvc: RandColorGeneratorService,
    @Inject(LOCALE_ID) public locale: string,
    private builder: FormBuilder,
    private user: UserInfoService) { }

  getAlertSummary(criteria: SearchCriteria) {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<UnityAlertSummaryType>(ZABBIX_ALL_ALERTS_SUMMARY(), { params: params });
  }

  getAlerts(criteria: SearchCriteria): Observable<PaginatedResult<UnityViewAlert>> {
    return this.tableService.getData<PaginatedResult<UnityViewAlert>>(ZABBIX_ALL_ALERTS(), criteria);
  }

  convertToViewObj(alert: UnityViewAlert) {
    let a = new UnityAlertsViewdata();
    a.id = alert.id;
    a.deviceId = alert.device_uuid;
    a.deviceName = alert.device_name;
    a.deviceType = this.getDeviceTypeDisplayNames(alert.device_type);
    a.deviceMapping = this.getDeviceMappingByDeviceType(alert.device_type);
    a.deviceApiMapping = this.getDeviceAPIMappingByDeviceType(alert.device_type);
    a.deviceCloud = alert.device_cloud;
    a.managementIp = alert.management_ip ? alert.management_ip : 'N/A';
    a.isShared = alert.is_shared;

    a.alert = alert.alert;
    a.alertTime = alert.alert_time;
    a.recoveryTime = alert.recovery_time;
    a.duration = alert.duration;

    a.acknowledged = alert.acknowledged ? alert.acknowledged : 'N/A';
    a.triggerId = alert.trigger_id;

    a.host = alert.host;
    a.hostIP = alert.host_ip;

    a.status = alert.status.toLowerCase();
    if (alert.status == 'RESOLVED') {
      a.isRecentlyResolved = true;
      a.statusTextColor = 'text-success';
      a.isAcknowledgeEnabled = false;
      a.acknowledgeTooltipMessage = 'Cannot acknowledge a Resolved Alert';
      a.isChangeSeverityEnabled = false;
      a.changeSeverityTooltipMessage = 'Cannot change severity for a Resolved Alert';
      a.isCloseProblemEnabled = false;
      a.closeProblemTooltipMessage = 'Cannot close a Resolved Alert';
      a.selectEnabled = false;
    } else {
      a.statusTextColor = 'text-danger';
      a.isAcknowledgeEnabled = true;
      a.acknowledgeTooltipMessage = 'Acknowledge';
      a.isChangeSeverityEnabled = true;
      a.changeSeverityTooltipMessage = 'Change Severity';
      a.isCloseProblemEnabled = true;
      a.closeProblemTooltipMessage = 'Close Problem';
      a.selectEnabled = true;
    }

    a.severity = alert.severity;
    if (a.severity == 'Critical') {
      a.severityBg = 'bg-danger';
      a.severityClass = 'text-danger';
    } else if (a.severity == 'Warning') {
      a.severityBg = 'bg-warning';
      a.severityClass = 'text-warning';
    } else {
      a.severityBg = 'bg-primary';
      a.severityClass = 'text-primary';
    }

    if (this.user.isManagementEnabled) {
      if (alert.is_shared) {
        a.isNewTabEnabled = false;
        a.newTabTootipMessage = 'Non Manageable Shared Device';
      } else if (!alert.management_ip) {
        a.isNewTabEnabled = false;
        a.newTabTootipMessage = 'Managament IP not available.';
      } else {
        if (a.deviceApiMapping) {
          a.isNewTabEnabled = true;
          a.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
          a.newTabTootipMessage = 'Manage In New Tab';
        } else {
          a.isNewTabEnabled = false;
          a.newTabTootipMessage = `Management not available for ${a.deviceType}`;
        }
      }
    } else {
      a.isNewTabEnabled = false;
      a.newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }

    if (this.user.isDashboardOnlyUser) {
      a.isAcknowledgeEnabled = false;
      a.isChangeSeverityEnabled = false;
      a.isCloseProblemEnabled = false;
      a.isNewTabEnabled = false;
      a.isCreateTicketEnabled = false;
    }
    return a;
  }

  convertToViewdata(alerts: UnityViewAlert[]) {
    let viewData: UnityAlertsViewdata[] = [];
    alerts.forEach(alert => {
      viewData.push(this.convertToViewObj(alert));
    });
    return viewData;
  }

  getGroupByAlerts(criteria: SearchCriteria): Observable<any> {
    return this.tableService.getData<UnityViewGroupByAlert>(ZABBIX_GROUP_BY_ALERTS(), criteria)
      .pipe(map(alerts => {
        Object.keys(alerts).forEach((key) => {
          let arr = alerts[key];
          if (arr.length > 1) {
            if (arr[0].status == 'RESOLVED') {
              let targetIndex = 0;
              for (let i = 1; i < arr.length; i++) {
                if (arr[i].status != 'RESOLVED') {
                  targetIndex = i;
                  break;
                }
              }
              if (targetIndex) {
                [arr[0], arr[targetIndex]] = [arr[targetIndex], arr[0]];
              }
            }
          }
        });
        return alerts;
      }));
  }

  convertToGroupByViewData(alerts: UnityViewGroupByAlert, viewAttribute: string) {
    let alertsInView: UnityAlertsViewdata[] = [];
    Object.keys(alerts).map((k, index) => {
      if (alerts[k].length > 1) {
        let firstObj = this.convertToViewObj(alerts[k][0]);
        firstObj[viewAttribute] = k;
        firstObj.isGrouped = true;
        firstObj.selectEnabled = true;
        alertsInView.push(firstObj);
      } else {
        let obj = this.convertToViewObj(alerts[k][0]);
        obj[viewAttribute] = k;
        alertsInView.push(obj);
      }
    });
    return alertsInView;
  }

  getDeviceTypeDisplayNames(deviceType: string): string {
    switch (deviceType) {
      case 'switch': return 'Switch';
      case 'firewall': return 'Firewall';
      case 'load_balancer': return 'Load Balancer';
      case 'hypervisor': return 'Hypervisor';
      case 'bm_server': return 'Bare Metal';
      case 'storage_device': return 'Storage';
      case 'mac_device': return 'Mac Device';
      case 'custom': return 'Custom Device';
      case 'pdu': return 'PDU';
      case 'vm': return 'VM';
      default: return 'N/A';
    }
  }

  getDeviceMappingByDeviceType(devicetype: string): DeviceMapping {
    switch (devicetype) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'hypervisor': return DeviceMapping.HYPERVISOR;
      case 'bm_server': return DeviceMapping.BARE_METAL_SERVER;
      case 'storage_device': return DeviceMapping.STORAGE_DEVICES;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'custom': return DeviceMapping.OTHER_DEVICES;
      case 'pdu': return DeviceMapping.PDU;
      case 'vm': return DeviceMapping.VIRTUAL_MACHINE;
      default: return DeviceMapping.OTHER_DEVICES;
    }
  }

  getDeviceAPIMappingByDeviceType(devicetype: string): string {
    switch (devicetype) {
      case 'switch': return 'switches';
      case 'firewall': return 'firewalls';
      case 'load_balancer': return 'load_balancers';
      case 'hypervisor': return 'servers';
      case 'bm_server': return 'servers';
      case 'storage_device': return 'storage';
      case 'mac_device': return 'macdevices';
      case 'pdu': return null;
      case 'custom': return null;
      case 'vm': return 'vcenter';
      default: return null;
    }
  }

  convertToSummaryViewdata(summary: UnityAlertSummaryType) {
    let viewData: UnityAlertsSummaryViewdata = new UnityAlertsSummaryViewdata();
    viewData.total = summary.total_count ? summary.total_count : 0;
    viewData.critical = summary.Critical ? summary.Critical : 0;
    viewData.warning = summary.Warning ? summary.Warning : 0;
    viewData.information = summary.Information ? summary.Information : 0;
    viewData.pduAlertCount = summary.pdu;
    viewData.bmsAlertCount = summary.bm_server;
    viewData.vmsAlertCount = summary.vm;
    viewData.fwAlertCount = summary.firewall;
    viewData.switchAlertCount = summary.switch;
    viewData.lbsAlertCount = summary.load_balancer;
    viewData.macAlertCount = summary.mac_device;
    viewData.sanAlertCount = summary.storage_device;
    return viewData;
  }

  getAlertPercentage(deviceAlertCount: number, totalAlertCount: number): number {
    if (totalAlertCount) {
      let cal = deviceAlertCount / totalAlertCount * 100;
      if (Number.isInteger(cal)) {
        return cal;
      } else {
        return Number(formatNumber(cal, this.locale, '1.0-2'));
      }
    } else {
      return 0;
    }
  }

  convertToAlertChartData(summary: UnityAlertsSummaryViewdata): UnityAlertChartDataView {
    let cd: UnityAlertChartDataView = new UnityAlertChartDataView();
    cd.type = 'pie';
    cd.options = this.getDefaultPieChartOptions();
    cd.legend = true;
    cd.options.title = { display: true, text: 'Device Type - Alert (%)', fontSize: 15 };
    cd.lables = ['PDUs', 'SANs', 'Bare Metals', 'Vms', 'Firewalls', 'Switches', 'Load Balancers', 'Mac Minis'];
    cd.piedata = [
      this.getAlertPercentage(summary.pduAlertCount, summary.total),
      this.getAlertPercentage(summary.sanAlertCount, summary.total),
      this.getAlertPercentage(summary.bmsAlertCount, summary.total),
      this.getAlertPercentage(summary.vmsAlertCount, summary.total),
      this.getAlertPercentage(summary.fwAlertCount, summary.total),
      this.getAlertPercentage(summary.switchAlertCount, summary.total),
      this.getAlertPercentage(summary.lbsAlertCount, summary.total),
      this.getAlertPercentage(summary.macAlertCount, summary.total),
    ];

    let colors = this.colorSvc.getRandomColorSet(cd.lables.length);
    cd.colors = [
      {
        backgroundColor: colors
      }
    ];
    return cd;
  }

  private getDefaultPieChartOptions(): ChartOptions {
    return {
      responsive: true,
      layout: { padding: 0 },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 20, padding: 20, usePointStyle: true },
        onClick: (event: MouseEvent, legendItem: ChartLegendLabelItem) => {
          event.stopPropagation();
        }
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (item: ChartTooltipItem, data: ChartData) => {
            return `${data.datasets[0].data[item.index]}%`
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            return data.labels[item[0].index].toString()
          },
        }
      },
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            return `${value}`;
          },
          font: { size: 10 },
          color: '#fff'
        },
        outlabels: {
          display: false
        }
      },
    }
  }

  buildBulkActionForm(ids: Set<number>): FormGroup {
    return this.builder.group({
      'ids': [Array.from(ids)],
      'action': ['acknowledge'],
      'message': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetBulkActionFormErrors() {
    return {
      'message': '',
      'severity': '',
    };
  }

  bulkActionFormValidationMessages = {
    'message': {
      'required': 'Message is required'
    },
    'severity': {
      'required': 'Severity is required'
    },
  };

  bulkActionAlert(formData: any): Observable<any> {
    return this.http.put<any>(ZABBIX_ALERT_BULK_ACTIONS(), formData);
  }

  buildAcknowledgeForm(alert: string): FormGroup {
    return this.builder.group({
      'alert': [{ value: alert, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'action': ['acknowledge'],
      'message': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetAcknowledgeFormErrors() {
    return {
      'message': '',
    };
  }

  acknowledgeFormValidationMessages = {
    'message': {
      'required': 'Message is required'
    },
  };

  acknowledgeAlert(alertId: number, formData: any): Observable<any> {
    return this.http.put<any>(ZABBIX_ALERT_ACTIONS(alertId), formData);
  }

  buildChangeSeverityForm(view: UnityAlertsViewdata): FormGroup {
    return this.builder.group({
      'alert': [{ value: view.alert, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'action': ['change_severity'],
      'message': ['', [Validators.required, NoWhitespaceValidator]],
      'severity': [view.severity, [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetChangeSeverityFormErrors() {
    return {
      'message': '',
      'severity': '',
    };
  }

  changeSeverityFormValidationMessages = {
    'message': {
      'required': 'Message is required'
    },
    'severity': {
      'required': 'Severity is required'
    },
  };

  changeAlertSeverity(alertId: number, formData: any): Observable<any> {
    return this.http.put<any>(ZABBIX_ALERT_ACTIONS(alertId), formData);
  }

  buildCloseProblemForm(alert: string): FormGroup {
    return this.builder.group({
      'alert': [{ value: alert, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      'action': ['close'],
      'message': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetCloseProblemFormErrors() {
    return {
      'message': '',
    };
  }

  closeProblemFormValidationMessages = {
    'message': {
      'required': 'Message is required'
    },
  };

  closeProblem(alertId: number, formData: any): Observable<any> {
    return this.http.put<any>(ZABBIX_ALERT_ACTIONS(alertId), formData);
  }

  getConsoleAccessInput(alert: UnityAlertsViewdata): ConsoleAccessInput {
    return {
      label: alert.deviceMapping, deviceType: alert.deviceMapping, deviceId: alert.deviceId,
      newTab: false, deviceName: alert.deviceName, managementIp: alert.managementIp
    };
  }

  sendErrorEmail() {
    return this.http.get('customer/reports/websocket_failed/');
  }
}

export class UnityAlertChartDataView {
  type: string;
  lables: Label[] = [];
  options: ChartOptions;
  piedata: number[] = [];
  colors: Color[] = [];
  legend: boolean = false;
  plugins: any = [pluginDataLabels];
  constructor() { }
}

export const alertGroupTypes: Array<{ name: string, key: string, mapping: string }> = [
  { 'name': 'Default', 'key': null, 'mapping': 'allAlerts' },
  { 'name': 'Group by Trigger', 'key': 'trigger_id', 'mapping': 'triggerId' },
  { 'name': 'Group by Device', 'key': 'device_name', 'mapping': 'deviceName' },
  { 'name': 'Group by Severity', 'key': 'severity', 'mapping': 'severity' },
]

export class UnityAlertsViewdata {
  constructor() { }
  id: number;
  deviceId: string
  deviceName: string;
  deviceType: string;
  deviceMapping: DeviceMapping;
  deviceApiMapping: string;
  deviceCloud: string[];
  managementIp: string;
  isShared: boolean;

  alert: string;
  alertTime: string;
  isRecentAlert: boolean = false;
  recoveryTime: string;
  isRecentlyResolved: boolean = false;
  duration: string;
  acknowledged: string;
  triggerId: number;

  host: any;
  hostIP: string;

  severity: string;
  severityBg: 'bg-warning' | 'bg-danger' | 'bg-primary';
  severityClass: 'text-warning' | 'text-danger' | 'text-primary';

  status: string;
  statusTextColor: 'text-success' | 'text-danger';

  isNewTabEnabled: boolean;
  newTabTootipMessage: string;
  newTabConsoleAccessUrl: string;

  isAcknowledgeEnabled: boolean;
  acknowledgeTooltipMessage: string;

  isChangeSeverityEnabled: boolean;
  changeSeverityTooltipMessage: string;

  isCloseProblemEnabled: boolean;
  closeProblemTooltipMessage: string;

  isCreateTicketEnabled: boolean = true;

  isGrouped: boolean = false;
  isGroupOpen: boolean = false;
  isSubMember: boolean = false;
  isSelected: boolean = false;
  selectEnabled: boolean = false;
}

export class UnityAlertsSummaryViewdata {
  constructor() { }
  total: number = 0;
  critical: number = 0;
  warning: number = 0;
  information: number = 0;
  pduAlertCount: number = 0;
  bmsAlertCount: number = 0;
  vmsAlertCount: number = 0;
  fwAlertCount: number = 0;
  switchAlertCount: number = 0;
  lbsAlertCount: number = 0;
  macAlertCount: number = 0;
  sanAlertCount: number = 0;
}

export interface UnityAlertSummaryType {
  load_balancer: number;
  mac_device: number;
  Information: number;
  firewall: number;
  vm: number;
  Critical: number;
  hypervisor: number;
  pdu: number;
  switch: number;
  Warning: number;
  bm_server: number;
  total_count: number;
  storage_device: number;
}

declare var MozWebSocket: {
  prototype: WebSocket;
  new(url: string, protocols?: string | string[]): WebSocket;
  readonly CLOSED: number;
  readonly CLOSING: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
};

export interface UnityAlertWSOption {
  org_id: string;
}

export class UnityAlertsWSClient {
  private connection: WebSocket;
  private wsOptions: UnityAlertWSOption;
  private triesCounter: number = 0;
  closeOnConnect: boolean = false;

  private openEvent = new Subject<any>();
  onOpen: Observable<any> = this.openEvent.asObservable();

  private closeEvent = new Subject<any>();
  onClose: Observable<any> = this.closeEvent.asObservable();

  private errorEvent = new Subject<any>();
  onError: Observable<any> = this.errorEvent.asObservable();

  private messageEvent = new Subject<any>();
  onMessage: Observable<any> = this.messageEvent.asObservable();


  constructor(options: UnityAlertWSOption) {
    this.wsOptions = options;
  }

  getHostUrl(): string {
    if (environment.production) {
      return window.location.host;
    } else {
      return window.location.host.split(':')[0] + ':8080';
    }
  }

  getEndpoint(): string {
    if (window.location.protocol == 'https:') {
      var protocol = 'wss://';
    } else {
      var protocol = 'ws://';
    }
    let session_key = document.cookie.split(";").reduce((ac, cv, i) => Object.assign(ac, { [cv.split('=')[0].trim()]: cv.split('=')[1].trim() }), {});
    session_key['PROXY_ID'] = session_key['PROXY_ID'] ? session_key['PROXY_ID'] : '';
    return `${protocol}${this.getHostUrl()}/websockcomm/?session_key=${session_key['PROXY_ID']}`;
  }

  private connectSocket() {
    this.triesCounter++;
    let endpoint: string = this.getEndpoint();
    if ('WebSocket' in window) {
      this.connection = new WebSocket(endpoint);
    } else if ('MozWebSocket' in window) {
      this.connection = new MozWebSocket(endpoint);
    }
    else {
      this.errorEvent.next('WebSocket Not Supported');
      return;
    }
    this.connection.onopen = (evt: Event) => {
      console.log('socket connected at : ', new Date());
      if (this.closeOnConnect) {
        this.close();
      } else {
        this.openEvent.next();
      }
    };

    this.connection.onmessage = (evt: MessageEvent) => {
      console.log('message received at : ', new Date());
      this.messageEvent.next(evt.data);
    };

    this.connection.onclose = (evt: CloseEvent) => {
      console.log('socket closed at : ', new Date());
      this.closeEvent.next(evt.reason);
    };

    this.connection.onerror = (evt: Event) => {
      if (this.triesCounter == 3) {
        console.log('socket failed to connect at : ', new Date())
        this.errorEvent.next();
      } else {
        setTimeout(() => {
          this.connectSocket();
        }, 1500);
      }
    }
  }

  connect() {
    this.triesCounter = 0;
    this.connectSocket();
  }

  isConnectionClosed(): boolean {
    return this.connection.readyState == this.connection.CLOSED;
  }

  isConnecting(): boolean {
    return this.connection ? this.connection.readyState == this.connection.CONNECTING : true;
  }

  send(data: any) {
    this.connection.send(JSON.stringify(data));
  }

  close() {
    if (this.connection) {
      this.connection.close();
    } else if (this.isConnecting()) {
      this.closeOnConnect = true;
    }
  }
}
