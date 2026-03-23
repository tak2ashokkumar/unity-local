import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ADD_AGENT_CONFIGURATIONS, DELETE_AGENT_CONFIGURATION, GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AgentConfigurationType } from './agent-config.type';

@Injectable()
export class AgentConfigurationService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getConfigurations() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<AgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
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
    'ssh_port': {
      'required': 'SSH port is required'
    },
    'ssh_username': {
      'required': 'User name is required'
    },
    'ssh_password': {
      'required': 'Password is required'
    }
  };

  buildForm(): FormGroup {
    this.resetFormErrors();
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
      'ip_address': ['', [Validators.required, NoWhitespaceValidator]],
      'ssh_port': ['', [Validators.required, NoWhitespaceValidator]],
      'ssh_username': ['', [Validators.required, NoWhitespaceValidator]],
      'ssh_password': ['', [Validators.required, NoWhitespaceValidator]],
      'snmp_community': ['', [NoWhitespaceValidator]],
    });
  }

  addConfigurations(data: AgentConfigurationType) {
    return this.http.post<AgentConfigurationType>(ADD_AGENT_CONFIGURATIONS(), data);
  }

  deleteConfig(uuid: string) {
    return this.http.delete(DELETE_AGENT_CONFIGURATION(uuid));
  }
}

export class AgentConfigurationViewData {
  constructor() { }
  agentName: string;
  ipAddress: string;
  sshUser: string;
  sshPort: string;
  createdOn: string;
  deplymentState: string;
  uuid: string;
}