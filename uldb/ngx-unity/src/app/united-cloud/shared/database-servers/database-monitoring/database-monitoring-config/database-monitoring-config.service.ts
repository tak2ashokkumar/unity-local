import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DB_ENABLE_MONITORING, DB_SERVERS, DB_TOGGLE_MONITORING, MONITORING_CONFIGURATION_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { DatabaseServer } from '../../../entities/database-servers.type';

@Injectable()
export class DatabaseMonitoringConfigService {
  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getMonitoringConfig(dbIntanceId: string) {
    return this.http.get<DBMonitoringDetailsType>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(DeviceMapping.DB_SERVER, dbIntanceId));
  }

  getDB(dbIntanceId: string) {
    return this.http.get<DatabaseServer>(DB_SERVERS(dbIntanceId));
  }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  createConnectionForm(details: DBMonitoringDetailsType): FormGroup {
    if (details) {
      return this.builder.group({
        'connection_type': [{ value: details.connection_type, disabled: (details && details.connection_type) ? true : false }, [Validators.required]]
      });
    } else {
      return this.builder.group({
        'connection_type': [{ value: '', disabled: false }, [Validators.required, NoWhitespaceValidator]]
      });
    }
  }

  createODBCForm(details: DBMonitoringDetailsType): FormGroup {
    let odbcForm = this.builder.group({});
    if (details) {
      odbcForm.addControl('data_source_name', new FormControl(details.data_source_name, [Validators.required, NoWhitespaceValidator]));
      odbcForm.addControl('driver', new FormControl(details.driver, [Validators.required, NoWhitespaceValidator]))
      odbcForm.addControl('username', new FormControl(details.username, [Validators.required, NoWhitespaceValidator]))
      odbcForm.addControl('service_name', new FormControl(details.service_name, [Validators.required, NoWhitespaceValidator]))
      odbcForm.addControl('password', new FormControl('', [Validators.required, NoWhitespaceValidator]))
    } else {
      odbcForm.addControl('data_source_name', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      odbcForm.addControl('driver', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      odbcForm.addControl('username', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      odbcForm.addControl('service_name', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      odbcForm.addControl('password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }
    return odbcForm;
  }

  createAgentForm(details: DBMonitoringDetailsType, dbType: string): FormGroup {
    let agentForm = this.builder.group({});
    if (details) {
      if (dbType == 'Oracle') {
        agentForm.addControl('connection_string', new FormControl(details.connection_string, [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('service_name', new FormControl(details.service_name, [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('username', new FormControl(details.username, [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('password', new FormControl(details.password, [Validators.required, NoWhitespaceValidator]));
      } else if (dbType == 'MySQL') {
        agentForm.addControl('username', new FormControl(details.username, [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('password', new FormControl(details.password, [Validators.required, NoWhitespaceValidator]));
      }
    } else {
      if (dbType == 'Oracle') {
        agentForm.addControl('connection_string', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('service_name', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('username', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else if (dbType == 'MySQL') {
        agentForm.addControl('username', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        agentForm.addControl('password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      }
    }
    return agentForm;
  }

  resetFormErrors() {
    return {
      'connection_type': ''
    };
  }

  resetODBCFormErrors() {
    return {
      'data_source_name': '',
      'driver': '',
      'username': '',
      'password': '',
      'service_name': ''
    }
  }

  resetAgentFormErrors() {
    return {
      'connection_string': '',
      'service_name': '',
      // 'oracle_user': '',
      // 'oracle_password': '',
      'username': '',
      'password': '',
    }
  }

  formValidationMessages = {
    'connection_type': {
      'required': 'Connection type is required'
    }
  }

  odbcFormValidationMessages = {
    'data_source_name': {
      'required': 'Data Source Name is required'
    },
    'driver': {
      'required': 'Driver is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'service_name': {
      'required': 'Service name is required'
    }
  }

  agentFormValidationMessages = {
    'connection_string': {
      'required': 'Connection string is required'
    },
    'service_name': {
      'required': 'Service name is required'
    },
    // 'oracle_user': {
    //   'required': 'Username is required'
    // },
    // 'oracle_password': {
    //   'required': 'Password is required'
    // },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    },
  }

  enableMonitoring(dbInstanceId: string, data: DBMonitoringDetailsType): Observable<DBMonitoringDetailsType> {
    return this.http.post<DBMonitoringDetailsType>(DB_ENABLE_MONITORING(dbInstanceId), data);
  }

  updateMonitoring(dbInstanceId: string, data: DBMonitoringDetailsType): Observable<DBMonitoringDetailsType> {
    return this.http.put<DBMonitoringDetailsType>(DB_ENABLE_MONITORING(dbInstanceId), data);
  }

  deleteMonitoring(dbInstanceId: string): Observable<DBMonitoringDetailsType> {
    return this.http.delete<DBMonitoringDetailsType>(DB_ENABLE_MONITORING(dbInstanceId));
  }

  toggleMonitoring(dbIntanceId: string, enabled: boolean) {
    return this.http.request<DBMonitoringDetailsType>('put', DB_TOGGLE_MONITORING(dbIntanceId, enabled ? 'stop' : 'start'));
  }
}
export class DBMonitoringDetailsType {
  connection_type: string;
  data_source_name?: string;
  driver?: string;
  username?: string;
  password?: string;
  service_name?: string;

  connection_string?: string;
  oracle_service_name?: string;
  // oracle_user?: string;
  // oracle_password?: string;
}
