import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ADD_AGENT_CONFIGURATIONS, DELETE_AGENT_CONFIGURATION, EDIT_AGENT_CONFIGURATION } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AgentConfigurationViewData } from '../advanced-discovery-connectivity.service';
import { DeviceDiscoveryAgentConfigurationType } from '../agent-config.type';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class AdvancedDiscoveryConnectivityCrudService {

  private addOrEditAnnouncedSource = new Subject<AgentConfigurationViewData>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<AgentConfigurationViewData>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  private crudAnnouncedSource = new Subject<any>();
  crudAnnounced$ = this.crudAnnouncedSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userInfo: UserInfoService,
    private appService: AppLevelService) { }

  addOrEdit(view: AgentConfigurationViewData) {
    this.addOrEditAnnouncedSource.next(view);
  }

  deleteAccount(view: AgentConfigurationViewData) {
    this.deleteAnnouncedSource.next(view);
  }

  crudAnnounced() {
    this.crudAnnouncedSource.next();
  }

  resetFormErrors(): any {
    let formErrors = {
      'name': '',
      'ip_address': '',
      'ssh_port': '',
      'ssh_username': '',
      'ssh_password': '',
      'snmp_community': '',
      'sudo_password': ''
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
    },
    'sudo_password': {
      'required': 'Password is required'
    }
  };

  buildForm(data?: AgentConfigurationViewData): FormGroup {
    this.resetFormErrors();
    if (data) {
      return this.builder.group({
        'uuid': [data.uuid],
        'host_name': [{ value: data.testResult.host_name, disabled: true }],
        'name': [data.agentName, [Validators.required, NoWhitespaceValidator]],
        'ip_address': [data.ipAddress, [Validators.required, NoWhitespaceValidator]],
        'ssh_port': [data.sshPort, [NoWhitespaceValidator]],
        'ssh_username': [data.sshUser, [Validators.required, NoWhitespaceValidator]],
        'snmp_community': [data.snmpCommunity, [NoWhitespaceValidator]]
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'ip_address': ['', [Validators.required, NoWhitespaceValidator]],
        'ssh_port': ['', [NoWhitespaceValidator]],
        'ssh_username': ['', [Validators.required, NoWhitespaceValidator]],
        'ssh_authtype': ['password'],
        'ssh_password': ['', [Validators.required, NoWhitespaceValidator]],
        'snmp_community': ['', [NoWhitespaceValidator]],
      });
    }
  }

  resetPrivateFormErrors() {
    return {
      'pkey': ''
    };
  }

  privateKeyValidationMessages = {
    'pkey': {
      'required': 'Private Key is required'
    }
  }

  buildPrivateKeyForm() {
    return this.builder.group({
      'pkey': ['', [Validators.required]]
    });
  }


  toFormData<T>(formValue: T, formValue1?: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    if (formValue1) {
      for (const key of Object.keys(formValue1)) {
        const value = formValue1[key];
        formData.append(key, this.appService.convertToBinary(value));
      }
    }
    return formData;
  }

  addConfigurations(data: FormData) {
    // return of({ "id": 42, "name": "asdasdas", "ip_address": "111.111.111.112", "poller_id": null, "status": "Failed", "uuid": "8888cd69-2b43-46d9-9bc2-312daab6437e", "poller_name": "Aerys-1", "ssh_username": "customer@unitedlayer.com", "ssh_password": "password", "ssh_port": 11, "snmp_community": null, "web_username": null, "web_password": null, "deployment_status": 2, "pyro_port": 9090, "rdp_access_name": "https://rdp-8888cd69-312daab6437e.uproxy-alpha.unitedlayer.com", "created_at": "2020-12-07T01:38:58.493547-08:00", "updated_at": "2020-12-07T01:38:58.493567-08:00", "customer": 22 }).pipe(delay(2000));
    return this.http.post<FormData>(ADD_AGENT_CONFIGURATIONS(), data);
  }

  updateConfigurations(uuid:string, data: FormData) {
    // return of({ "id": 42, "name": "asdasdas", "ip_address": "111.111.111.112", "poller_id": null, "status": "Failed", "uuid": "8888cd69-2b43-46d9-9bc2-312daab6437e", "poller_name": "Aerys-1", "ssh_username": "customer@unitedlayer.com", "ssh_password": "password", "ssh_port": 11, "snmp_community": null, "web_username": null, "web_password": null, "deployment_status": 2, "pyro_port": 9090, "rdp_access_name": "https://rdp-8888cd69-312daab6437e.uproxy-alpha.unitedlayer.com", "created_at": "2020-12-07T01:38:58.493547-08:00", "updated_at": "2020-12-07T01:38:58.493567-08:00", "customer": 22 }).pipe(delay(2000));
    return this.http.put<FormData>(EDIT_AGENT_CONFIGURATION(uuid), data);
  }

  deleteConfig(uuid: string) {
    // return of({}).pipe(delay(2000));
    return this.http.delete(DELETE_AGENT_CONFIGURATION(uuid));
  }
}
