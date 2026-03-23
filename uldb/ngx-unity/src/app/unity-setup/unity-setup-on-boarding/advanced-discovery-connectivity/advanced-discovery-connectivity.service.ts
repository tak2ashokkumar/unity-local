import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE, VM_CONSOLE_CLIENT } from 'src/app/app-constants';
import { GET_AGENT_CONFIGURATIONS, TEST_AGENT_CONNECTION } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ConnectionTestResult, DeviceDiscoveryAgentConfigurationType } from './agent-config.type';

@Injectable()
export class AdvancedDiscoveryConnectivityService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private utilSvc: AppUtilityService) { }

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
