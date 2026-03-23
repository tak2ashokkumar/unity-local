import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CHECK_AUTH_BY_DEVICE_TYPE } from '../api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable({
  providedIn: 'root'
})
export class CheckAuthService {

  private authAnnouncedSource = new Subject<ConsoleAccessInput>();
  private authConfirmedSource = new Subject<AuthType>();

  // Observable string streams
  authAnnounced$ = this.authAnnouncedSource.asObservable();
  private authConfirmed$ = this.authConfirmedSource.asObservable();

  constructor(private builder: FormBuilder,
    private appService: AppLevelService,
    private http: HttpClient) { }

  checkAuth(input: ConsoleAccessInput): Observable<AuthType> {
    this.authAnnouncedSource.next(input);
    return this.authConfirmed$;
  }

  authConfirmed(data: AuthType) {
    this.authConfirmedSource.next(data);
  }

  resetFormErrors(): any {
    let formErrors = {
      'port': '',
      'username': '',
      'password': '',
      'invalidCred': ''
    };
    return formErrors;
  }

  validationMessages = {
    'port': {
      'required': 'Port is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    }
  };

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

  buildForm(input: ConsoleAccessInput): FormGroup {
    return this.builder.group({
      'host': [input.managementIp, NoWhitespaceValidator],
      'port': [input.port ? input.port : '', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      'username': [input.userName ? input.userName : '', [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]],
      'authtype': ['password'],
      'os_type' : [input.osType ? input.osType : ''],
      'ip_type' : [input.ipType ? input.ipType : '']
    });
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

  validateAuth(deviceType: DeviceMapping, deviceId: string, data: FormData): Observable<any> {
    return this.http.post(CHECK_AUTH_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }
}

export interface AuthType {
  host: string;
  port: number;
  username: string;
  password?: string;
  agent_id?: string;
  org_id?: string;
  pkey?: string;
  ipType?: string;
  osType?: string;
}
export interface TerminalInput extends AuthType {
  uuid: string;
}
export interface ConsoleAccessInput {
  label: string;
  deviceType: DeviceMapping;
  deviceId: string;
  managementIp?: string;
  port?: number;
  newTab: boolean;
  deviceName: string;
  userName?: string;
  ipType?: string;
  osType?: string;
}