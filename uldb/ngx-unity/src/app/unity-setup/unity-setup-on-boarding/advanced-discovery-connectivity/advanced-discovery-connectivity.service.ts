import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { GET_AGENT_CONFIGURATIONS, TEST_AGENT_CONNECTION } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ConnectionTestResult, DeviceDiscoveryAgentConfigurationType } from './agent-config.type';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { AppLevelService } from 'src/app/app-level.service';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';

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
      vd.agentName = config.name;
      vd.ipAddress = config.ip_address;
      vd.sshUser = config.ssh_username;
      vd.sshPort = config.ssh_port.toString();
      vd.createdOn = config.created_at ? this.utilSvc.toUnityOneDateFormat(config.created_at) : 'N/A';
      vd.deplymentState = config.status;
      vd.snmpCommunity = config.snmp_community;
      vd.testResult = config.test_result;
      if(vd.testResult){
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

  testPing(data: any , uuid: string): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(`/customer/agent/config/${uuid}/network_ping/`, data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  testTelnet(data: any , uuid: string): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(`/customer/agent/config/${uuid}/network_telnet/`, data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  testTraceRoute(data: any , uuid: string): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(`/customer/agent/config/${uuid}/network_traceroute/`, data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
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
