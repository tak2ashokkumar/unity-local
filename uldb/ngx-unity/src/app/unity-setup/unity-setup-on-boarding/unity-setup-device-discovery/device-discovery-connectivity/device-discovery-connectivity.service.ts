import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ADD_AGENT_CONFIGURATIONS, DELETE_AGENT_CONFIGURATION, GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AgentConfigurationType } from '../../on-boarding/connect-to-unity/agent-configuration/agent-config.type';

@Injectable()
export class DeviceDiscoveryConnectivityService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getConfigurations() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<AgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
    // return of([{ "id": 42, "name": "asdasdas", "ip_address": "111.111.111.112", "poller_id": null, "status": "Failed", "uuid": "8888cd69-2b43-46d9-9bc2-312daab6437e", "poller_name": "Aerys-1", "ssh_username": "customer@unitedlayer.com", "ssh_password": "password", "ssh_port": 11, "snmp_community": null, "web_username": null, "web_password": null, "deployment_status": 2, "pyro_port": 9090, "rdp_access_name": "https://rdp-8888cd69-312daab6437e.uproxy-alpha.unitedlayer.com", "created_at": "2020-12-07T01:38:58.493547-08:00", "updated_at": "2020-12-07T01:38:58.493567-08:00", "customer": 22 }])
  }

  convertToViewData(data: AgentConfigurationType[]) {
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
      viewData.push(vd);
    });
    return viewData;
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'ip_address': '',
      'ssh_port': '',
      'ssh_username': '',
      'ssh_password': '',
      'snmp_community': ''
    };
    return formErrors;
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'ip_address': {
      'required': 'IP Address is required'
    },
    'ssh_username': {
      'required': 'User name is required'
    },
    'ssh_password': {
      'required': 'Password is required'
    }
  };

  buildForm(data?: AgentConfigurationViewData): FormGroup {
    this.resetFormErrors();
    if (data) {
      return this.builder.group({
        'uuid': [data.uuid],
        'name': [data.agentName, [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'ip_address': ['', [Validators.required, NoWhitespaceValidator]],
        'ssh_port': ['', [NoWhitespaceValidator]],
        'ssh_username': ['', [Validators.required, NoWhitespaceValidator]],
        'ssh_password': ['', [Validators.required, NoWhitespaceValidator]],
        'snmp_community': ['', [NoWhitespaceValidator]],
      });
    }
  }

  addConfigurations(data: AgentConfigurationType) {
    return this.http.post<AgentConfigurationType>(ADD_AGENT_CONFIGURATIONS(), data);
  }

  editConfigurations(data: AgentConfigurationType) {
    return this.http.put<AgentConfigurationType>(ADD_AGENT_CONFIGURATIONS(), data);
  }

  deleteConfig(uuid: string) {
    return this.http.delete(DELETE_AGENT_CONFIGURATION(uuid));
  }
}

export class AgentConfigurationViewData {
  constructor() {
    this.updating = false;
  }
  agentName: string;
  ipAddress: string;
  sshUser: string;
  sshPort: string;
  createdOn: string;
  deplymentState: string;
  uuid: string;

  updating: boolean;
}