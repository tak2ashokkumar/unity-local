import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DeviceMapping } from '../../app-utility/app-utility.service';
import { map, shareReplay } from 'rxjs/operators';
import { CONSOLE_ACCESS_DETAILS_BY_DEVICE_TYPE } from '../../api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationFloatingTerminalService {

  constructor(private http: HttpClient) { }

  private termAnnouncedSource = new Subject<any>();
  private resizeAnnouncedSource = new Subject<string>();
  private tabChangeAnnouncedSource = new Subject<{ deviceId: string, deviceType: DeviceMapping }>();
  private isOpenAnnouncedSource = new Subject<boolean>();

  // Observable string streams
  termAnnounced$ = this.termAnnouncedSource.asObservable();
  resizeAnnounced$ = this.resizeAnnouncedSource.asObservable();
  tabChangeAnnounced$ = this.tabChangeAnnouncedSource.asObservable().pipe(shareReplay(1));
  isOpenAnnounced$ = this.isOpenAnnouncedSource.asObservable().pipe(shareReplay(1));

  getDetails(deviceType: DeviceMapping, deviceId: string): Observable<string> {
    return this.http.get(CONSOLE_ACCESS_DETAILS_BY_DEVICE_TYPE(deviceType, deviceId)).pipe(map((res: { management_ip: string }) => { return res['management_ip'] }));
  }

  openTerminal(input: any) {
    this.termAnnouncedSource.next(input);
  }

  resizEnd(height: string) {
    this.resizeAnnouncedSource.next(height);
  }

  termToggled(isOpen: boolean) {
    this.isOpenAnnouncedSource.next(isOpen);
  }

  tabChanged(deviceId: string, deviceType: DeviceMapping) {
    this.tabChangeAnnouncedSource.next({ deviceId: deviceId, deviceType: deviceType });
  }
}

export interface FloatingTerminalInput {
  name: string;
  ip: string;
  port: string;
  deviceId: string;
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
  conversation_id: string;
  collector_uuid: string;
}
