import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { DeviceMapping, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { map } from 'rxjs/operators';
import { UserInfoService } from '../user-info.service';
import { DEVICE_ZABBIX_EMAIL_ALERT_CONFIG, LIST_USER } from '../api-endpoint.const';
import { DeviceZabbixAlertNotification } from './device-zabbix-email-notification.type';

@Injectable({
  providedIn: 'root'
})
export class DeviceZabbixEmailNotificationService {
  private notificationAnnouncedSource = new Subject<{ deviceId: string, deviceType: DeviceMapping }>();
  notificationAnnounced$ = this.notificationAnnouncedSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userInfo: UserInfoService, ) { }

  notify(deviceId: string, deviceType: DeviceMapping) {
    this.notificationAnnouncedSource.next({ deviceId: deviceId, deviceType: deviceType });
  }

  getDeviceZabbixAlertConfig(deviceId: string, deviceType: DeviceMapping): Observable<DeviceZabbixAlertNotification> {
    return this.http.get<DeviceZabbixAlertNotification>(DEVICE_ZABBIX_EMAIL_ALERT_CONFIG(deviceType, deviceId));
  }

  addUserName(users: User[]) {
    users.map(user => {
      user['full_name'] = `${user.first_name} ${user.last_name}(${user.email})`;
    })
    return users;
  }

  getUserList(): Observable<User[]> {
    return this.http.get<User[]>(`${LIST_USER()}?page_size=0`)
      .pipe(map(res => this.addUserName(res)));
  }

  buildZabbixEmailNotificationForm() {
    return this.builder.group({
      'input': ['', [Validators.required, NoWhitespaceValidator]],
    })
  }

  resetZabbixEmailNotificationFormErrors(): any {
    let formErrors = {
      'input': '',
    };
    return formErrors;
  }

  zabbixEmailNotificationFormValidationMessages = {
    'input': {
      'required': 'User is required',
    },
  };

  manageZabbixNotification(deviceId: string, deviceType: DeviceMapping, isEnabled: boolean): Observable<any> {
    return this.http.patch<any>(DEVICE_ZABBIX_EMAIL_ALERT_CONFIG(deviceType, deviceId), { 'is_enabled': isEnabled });
  }

  saveZabbixNotificationEmails(deviceId: string, deviceType: DeviceMapping, users: User[]): Observable<any> {
    let data = [];
    users.map(user => {
      data.push({ 'id': user.id });
    });
    return this.http.patch<any>(DEVICE_ZABBIX_EMAIL_ALERT_CONFIG(deviceType, deviceId), { 'users': data });
  }
}
