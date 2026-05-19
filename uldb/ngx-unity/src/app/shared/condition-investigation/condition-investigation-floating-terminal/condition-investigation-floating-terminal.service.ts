import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DeviceMapping } from '../../app-utility/app-utility.service';
import { map, shareReplay } from 'rxjs/operators';
import { CONSOLE_ACCESS_DETAILS_BY_DEVICE_TYPE } from '../../api-endpoint.const';
import { WSSHClient } from './condition-investigation-wssh-client';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationFloatingTerminalService {

  private tabState: Map<string, { running: boolean, lastUsed: number }> = new Map();
  private terminalRegistry: Map<string, { client: WSSHClient, type: 'sameTab' | 'newTab' }> = new Map();
  private termAnnouncedSource = new Subject<any>();
  private resizeAnnouncedSource = new Subject<string>();
  private tabChangeAnnouncedSource = new Subject<{ deviceId: string, deviceType: DeviceMapping }>();
  private isOpenAnnouncedSource = new Subject<boolean>();
  private switchTabSource = new Subject<string>();
  constructor(private http: HttpClient) { }


  // Observable string streams
  termAnnounced$ = this.termAnnouncedSource.asObservable();
  resizeAnnounced$ = this.resizeAnnouncedSource.asObservable();
  tabChangeAnnounced$ = this.tabChangeAnnouncedSource.asObservable().pipe(shareReplay(1));
  isOpenAnnounced$ = this.isOpenAnnouncedSource.asObservable().pipe(shareReplay(1));
  switchTab$ = this.switchTabSource.asObservable();

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

  registerTerminal(tabId: string, wsClient: WSSHClient, type: 'sameTab' | 'newTab') {
    this.terminalRegistry.set(tabId, {
      client: wsClient,
      type
    });
  }

  unregisterTerminal(tabId: string) {
    const entry = this.terminalRegistry.get(tabId);
    if (entry?.client) {
      try {
        entry.client.close();
      } catch { }
    }
    this.terminalRegistry.delete(tabId);
    this.tabState.delete(tabId);
  }

  executeInTerminal(tabId: string, command: string, type: 'sameTab' | 'newTab'): boolean {
    const entry = this.terminalRegistry.get(tabId);
    if (!entry) return false;
    const client = entry.client;
    if (client && !client.isConnectionClosed()) {
      client.sendClientData(command + '\n');
      return true;
    }
    return false;
  }

  hasTerminal(deviceId: string): boolean {
    return this.terminalRegistry.has(deviceId);
  }

  setTabRunning(tabId: string, running: boolean) {
    const existing = this.tabState.get(tabId) || { running: false, lastUsed: Date.now() };

    this.tabState.set(tabId, {
      ...existing,
      running,
      lastUsed: Date.now()
    });
  }

  getRunningTab(type: 'sameTab' | 'newTab'): string | null {
    for (let [key, val] of this.tabState.entries()) {
      const entry = this.terminalRegistry.get(key);

      if (entry && entry.type === type && val.running) {
        return key;
      }
    }
    return null;
  }

  getRecentTab(type: 'sameTab' | 'newTab'): string | null {
    let max = 0;
    let selected = null;

    this.tabState.forEach((val, key) => {
      const entry = this.terminalRegistry.get(key);

      if (!entry || entry.type !== type) return;

      if (val.lastUsed > max && !val.running) {
        max = val.lastUsed;
        selected = key;
      }
    });

    return selected;
  }

  switchToTab(tabId: string) {
    this.switchTabSource.next(tabId);
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
  tab_type?: string;
  collector_uuid: string;
}
