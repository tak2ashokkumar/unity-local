import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { GET_AGENT_CONFIGURATIONS, TEST_AGENT_CONNECTION, UPDATE_AGENT_CONFIGURATION_IP_ADDRESS, UPDATE_AGENT_CONFIGURATION_TTL } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ConnectionTestResult, DeviceDiscoveryAgentConfigurationType } from './agent-config.type';
import { UpdateCollectorIpPayload, UpdateCollectorTtlPayload } from './advanced-discovery-connectivity.type';

@Injectable()
export class AdvancedDiscoveryConnectivityService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private appService: AppLevelService) { }

  getConfigurations() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  convertToViewData(data: DeviceDiscoveryAgentConfigurationType[]) {
    let viewData: AgentConfigurationViewData[] = [];
    data.map(config => {
      let vd = new AgentConfigurationViewData();
      vd.uuid = config.uuid;
      vd.agentName = this.toDisplayValue(config.name);
      vd.ipAddress = this.toDisplayValue(config.ip_address);
      vd.sshUser = this.toDisplayValue(config.ssh_username);
      vd.sshPort = this.toDisplayValue(config.ssh_port);
      vd.createdOn = config.created_at ? this.utilSvc.toUnityOneDateFormat(config.created_at) : 'N/A';
      vd.deplymentState = this.toDisplayValue(config.status);
      vd.snmpCommunity = this.toDisplayValue(config.snmp_community);
      vd.certTtl = config.cert_ttl;
      vd.certValid = this.toDisplayValue(config.cert_valid);
      vd.certStatus = this.toDisplayValue(config.cert_status);
      vd.certValidTill = config.cert_expiry ? this.utilSvc.toUnityOneDateFormat(config.cert_expiry) : 'NA';
      vd.testResult = config.test_result;
      if (vd.testResult) {
        vd.testResult.date = config.test_result && config.test_result.date ? this.utilSvc.toUnityOneDateFormat(config.test_result.date) : 'N/A';
      }
      if (this.userInfo.isManagementEnabled) {
        vd.isNewTabEnabled = true;
        vd.newTabToolipMessage = 'Open In New Tab';
        vd.newTabConsoleAccessUrl = VM_CONSOLE_CLIENT();
      } else {
        vd.isNewTabEnabled = false;
        vd.newTabToolipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      }
      viewData.push(vd);
    });
    return viewData;
  }

  getConsoleAccessInput(view: AgentConfigurationViewData): ConsoleAccessInput {
    return {
      label: DeviceMapping.COLLECTOR, deviceType: DeviceMapping.COLLECTOR, deviceId: view.uuid, newTab: false,
      deviceName: view.agentName, port: Number(view.sshPort), userName: view.sshUser
    };
  }

  testConnection(data: AgentConfigurationViewData) {
    return this.http.get<ConnectionTestResult>(TEST_AGENT_CONNECTION(data.uuid)).pipe(
      map(res => {
        data.testResult = res;
        data.testResult.date = res.date ? this.utilSvc.toUnityOneDateFormat(res.date) : 'N/A';
        return data;
      })
    );
  }

  buildPingOrTracerouteForm() {
    return this.builder.group({
      'ip': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]]
    });
  }

  buildTelnetForm() {
    return this.builder.group({
      'host': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'port': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  testNetworkFormValidationMessages = {
    'ip': {
      'required': 'Ip Address is required'
    },
    'host': {
      'required': 'Ip Address / Host is required'
    },
    'port': {
      'required': 'Port number is required'
    }
  }

  resetTestNetworkFormErrors() {
    return {
      'ip': '',
      'host': '',
      'port': ''
    };
  }

  buildUpdateIpForm(ipAddress?: string) {
    return this.builder.group({
      'ip_address': [ipAddress && ipAddress !== 'NA' ? ipAddress : '', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]]
    });
  }

  buildUpdateTtlForm(ttl?: number | string) {
    return this.builder.group({
      'cert_ttl': [ttl || 30, [Validators.required, Validators.min(1)]]
    });
  }

  updateCollectorIp(uuid: string, payload: UpdateCollectorIpPayload) {
    return this.http.put(UPDATE_AGENT_CONFIGURATION_IP_ADDRESS(uuid), payload);
  }

  updateCollectorTtl(uuid: string, payload: UpdateCollectorTtlPayload) {
    return this.http.put(UPDATE_AGENT_CONFIGURATION_TTL(uuid), payload);
  }

  resetUpdateIpFormErrors() {
    return {
      'ip_address': ''
    };
  }

  resetUpdateTtlFormErrors() {
    return {
      'cert_ttl': ''
    };
  }

  updateIpFormValidationMessages = {
    'ip_address': {
      'required': 'Management IP is required'
    }
  };

  updateTtlFormValidationMessages = {
    'cert_ttl': {
      'required': 'TTL in Days is required',
      'min': 'TTL in Days should be greater than 0'
    }
  };

  testPing(data: any, uuid: string): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(`/customer/agent/config/${uuid}/network_ping/`, data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  testTelnet(data: any, uuid: string): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(`/customer/agent/config/${uuid}/network_telnet/`, data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  testTraceRoute(data: any, uuid: string): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(`/customer/agent/config/${uuid}/network_traceroute/`, data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  private toDisplayValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'NA';
    }
    return value.toString();
  }

}

export class AgentConfigurationViewData {
  constructor() { }
  agentName: string;
  ipAddress: string;
  sshUser: string;
  sshAuth: string;
  sshPort: string;
  createdOn: string;
  deplymentState: string;
  uuid: string;
  snmpCommunity: string;
  testResult: ConnectionTestResult;
  certTtl: number | string;
  certValid: string;
  certStatus: string;
  certValidTill: string;

  isNewTabEnabled: boolean;
  newTabToolipMessage: string;
  newTabConsoleAccessUrl: string;

  private _testing: boolean = false;

  get testing() {
    return this._testing;
  }

  set testing(b: boolean) {
    this._testing = b;
  }

  get testConnectionIcon() {
    return this._testing ? 'fa fa-spinner fa-spin' : ' fas fa-wifi';
  }

  get testConnectionTooltipMsg() {
    if (this._testing) {
      return '';
    } else {
      return 'Test Connection';
    }
  }
}

export enum NetworkConnectionTypeOption {
  PING = 'ping',
  TELNET = 'telnet',
  TRACEROUTE = 'traceroute'
}
