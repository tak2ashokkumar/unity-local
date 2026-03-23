import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { VALIDATE_POWER_TOGGLE_BY_DEVICE_TYPE, TOGGLE_POWER_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class ServerPowerToggleService {
  private toggleAnnouncedSource = new Subject<PowerToggleInput>();
  private toggledSource = new Subject<any>();

  toggleAnnounced$ = this.toggleAnnouncedSource.asObservable();
  toggledSuccessAnnounced$ = this.toggledSource.asObservable();
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  togglePower(input: PowerToggleInput) {
    this.toggleAnnouncedSource.next(input);
    return this.toggledSuccessAnnounced$;
  }

  toggledSuccess(res: any) {
    this.toggledSource.next(res);
  }

  resetFormErrors(): any {
    let formErrors = {
      'username': '',
      'password': '',
      'invalidCred': ''
    };
    return formErrors;
  }

  validationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    }
  };
  buildForm(input: PowerToggleInput): FormGroup {
    this.resetFormErrors();
    let form = this.builder.group({
      'username': [input.userName, [Validators.required, NoWhitespaceValidator]],
      'password': ['', [Validators.required, NoWhitespaceValidator]]
    });
    if (input.extraParams) {
      Object.keys(input.extraParams).map(key => form.setControl(key, new FormControl(input.extraParams[key])))
    }
    return form;
  }

  validateAuth(deviceType: DeviceMapping, deviceId: string, data: any): Observable<any> {
    return this.http.post(VALIDATE_POWER_TOGGLE_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  togglePowerStatus(input: PowerToggleInput, data?: any): Observable<any> {
    return this.http.post(TOGGLE_POWER_BY_DEVICE_TYPE(input.deviceType, input.deviceId, input.currentPowerStatus), data);
  }
}

export interface PowerToggleInput {
  confirmTitle: string;
  confirmMessage: string;
  deviceType: DeviceMapping;
  deviceName: string;
  deviceId: string;
  userName: string;
  currentPowerStatus: boolean;
  extraParams?: { [key: string]: string };
}