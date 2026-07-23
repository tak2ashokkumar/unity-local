import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { UserInfoService } from '../user-info.service';
import { ConditionInvestigationAuthModalService } from './condition-investigation-auth-modal/condition-investigation-auth-modal.service';
import { ConditionInvestigationFloatingTerminalService } from './condition-investigation-floating-terminal/condition-investigation-floating-terminal.service';
import { ConditionInvestigationNewTerminalService } from './condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { ConditionInvestigationTerminalWindowRegistryService } from './condition-investigation-new-terminal/condition-investigation-terminal-window-registry.service';
import { DATABASE_CONNECTION_TYPE } from './condition-investigation-db-connection.const';

export interface CliCommandContext {
  command: string;
  conditionId: string | number;
  conversationId: string;
  tabType?: 'sameTab' | 'newTab';
  application?: string;
  title?: string;
  commandDetails?: any;
  forceDeviceChange?: boolean;
  tabId?: string;
  device?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationCliCommandService {
  private activeCommandContextSource = new BehaviorSubject<CliCommandContext | null>(null);
  activeCommandContext$ = this.activeCommandContextSource.asObservable();

  constructor(
    private authApi: ConditionInvestigationAuthModalService,
    private terminalService: ConditionInvestigationNewTerminalService,
    private floatingTerminalService: ConditionInvestigationFloatingTerminalService,
    private windowRegistry: ConditionInvestigationTerminalWindowRegistryService,
    private userInfoService: UserInfoService,
  ) { }

  executeCommandFlow(context: CliCommandContext, forceDeviceChange: boolean = false): Observable<any> {
    const commandContext = this.normalizeContext(context, forceDeviceChange);
    this.setActiveCommandContext(commandContext);

    if (forceDeviceChange) {
      this.openCredentialsModal(commandContext);
      return of({ opened_credentials_modal: true });
    }

    return this.authApi.getDefaultDevice(commandContext.conditionId, commandContext.conversationId).pipe(
      take(1),
      switchMap((device: any) => {
        if (device && device.id) {
          return this.executeWithDefaultDevice(commandContext, device);
        }
        this.openCredentialsModal(commandContext);
        return of({ opened_credentials_modal: true });
      })
    );
  }

  executeWithDefaultDevice(context: CliCommandContext, device: any): Observable<any> {
    const commandContext = this.normalizeContext({
      ...context,
      device: this.safeDevice(this.normalizeDeviceCredentials(device)),
    }, false);
    const credentials = this.normalizeDeviceCredentials(device);
    const tabType = commandContext.tabType || 'sameTab';
    const tabParam = tabType === 'sameTab' ? 'same' : 'new';
    const shell = credentials.connection_type === 'winrm' ? credentials.shell : '';

    this.setActiveCommandContext({
      ...commandContext,
      device: this.safeDevice(credentials),
    });

    return this.authApi.getTab(tabParam, commandContext.conversationId, credentials.host, shell, this.getSessionLookupConnection(credentials)).pipe(
      take(1),
      map((res: any) => {
        const backendTabId = res?.tab_id;
        if (backendTabId) {
          const executed = this.executeInExistingTab(backendTabId, commandContext, credentials);
          if (executed) {
            this.setActiveCommandContext({
              ...commandContext,
              tabId: backendTabId,
              device: this.safeDevice(credentials),
            });
            return { reused_session: true, tab_id: backendTabId };
          }
        }

        this.openCredentialsModal({
          ...commandContext,
          device: this.safeDevice(credentials),
        });
        return { opened_credentials_modal: true };
      })
    );
  }

  executeWithCredentials(context: CliCommandContext, device: any): Observable<any> {
    const commandContext = this.normalizeContext(context, false);
    const credentials = this.normalizeDeviceCredentials(device);
    const tabType = commandContext.tabType || 'sameTab';
    const tabParam = tabType === 'sameTab' ? 'same' : 'new';
    const shell = credentials.connection_type === 'winrm' ? credentials.shell : '';

    this.setActiveCommandContext({
      ...commandContext,
      device: this.safeDevice(credentials),
    });

    return this.authApi.getTab(tabParam, commandContext.conversationId, credentials.host, shell, this.getSessionLookupConnection(credentials)).pipe(
      take(1),
      map((res: any) => {
        const backendTabId = res?.tab_id;
        if (backendTabId) {
          const executed = this.executeInExistingTab(backendTabId, commandContext, credentials);
          if (executed) {
            this.setActiveCommandContext({
              ...commandContext,
              tabId: backendTabId,
              device: this.safeDevice(credentials),
            });
            return { reused_session: true, tab_id: backendTabId };
          }
        }

        const tabId = this.openFreshTerminal(commandContext, credentials);
        this.setActiveCommandContext({
          ...commandContext,
          tabId,
          device: this.safeDevice(credentials),
        });
        return { reused_session: false, tab_id: tabId };
      })
    );
  }

  saveDefaultDevice(context: CliCommandContext, device: any): Observable<any> {
    const credentials = this.normalizeDeviceCredentials(device);
    return this.authApi.saveDefaultDevice({
      condition_id: context.conditionId,
      conversation_id: context.conversationId,
      device_name: credentials.device_name || credentials.host,
      device_ip_address: credentials.host,
      port: credentials.port,
      username: credentials.username,
      collector_uuid: credentials.collector_uuid,
      connection_type: credentials.connection_type,
      engine: credentials.connection_type === DATABASE_CONNECTION_TYPE ? credentials.engine : null,
      database: credentials.connection_type === DATABASE_CONNECTION_TYPE ? credentials.database : null,
      shell: credentials.connection_type === 'winrm' ? credentials.shell : null,
      is_default: true,
    });
  }

  setActiveCommandContext(context: CliCommandContext | null) {
    this.activeCommandContextSource.next(context);
  }

  private openCredentialsModal(context: CliCommandContext) {
    this.terminalService.setPendingCommandContext(context);
    this.terminalService.setPendingTabType(context.tabType || 'sameTab');
    this.terminalService.setConversationId(context.conversationId);
    this.terminalService.setBackendTabId(null);
    this.terminalService.openTerminal(context);
  }

  private executeInExistingTab(tabId: string, context: CliCommandContext, credentials: any): boolean {
    if ((context.tabType || 'sameTab') === 'sameTab') {
      const executed = this.floatingTerminalService.executeInTerminal(tabId, context.command, 'sameTab');
      if (executed) {
        this.floatingTerminalService.switchToTab(tabId);
      }
      return executed;
    }

    localStorage.setItem('terminal_command', context.command);
    const focused = this.windowRegistry.focus(tabId);
    if (!focused || typeof BroadcastChannel === 'undefined') {
      localStorage.removeItem('terminal_command');
      return false;
    }

    const channel = new BroadcastChannel('terminal-tabs');
    channel.postMessage({ type: 'PING', tabId });
    setTimeout(() => channel.close(), 1000);
    return true;
  }

  private openFreshTerminal(context: CliCommandContext, credentials: any): string {
    const tabType = context.tabType || 'sameTab';
    const tabId = this.generateTabId();
    const input = { tabId, deviceName: credentials.device_name || credentials.host };
    const auth = this.buildAuthPayload(context, credentials, tabType);

    localStorage.setItem('terminal_command', context.command);

    if (tabType === 'sameTab') {
      this.terminalService.openTerminalDirect(input, auth);
      return tabId;
    }

    const newWin = window.open(
      `/main#/terminal-new-tab?conversationId=${context.conversationId}&tabId=${tabId}`,
      '_blank'
    );
    if (newWin) {
      this.windowRegistry.register(tabId, newWin);
      this.sendTerminalDataToNewTab(tabId, input, auth);
    }
    return tabId;
  }

  private buildAuthPayload(context: CliCommandContext, credentials: any, tabType: 'sameTab' | 'newTab') {
    return {
      host: credentials.host,
      port: credentials.port,
      username: credentials.username,
      password: credentials.password,
      conversation_id: context.conversationId,
      tab_type: tabType === 'sameTab' ? 'same' : 'new',
      collector_uuid: credentials.collector_uuid,
      org_id: this.userInfoService.userOrgId,
      user_id: `${this.userInfoService.userDetails.id}`,
      connection_type: credentials.connection_type,
      ...(credentials.connection_type === DATABASE_CONNECTION_TYPE && {
        engine: credentials.engine,
        database: credentials.database,
      }),
      ...(credentials.connection_type === 'winrm' && {
        transport: credentials.transport,
        shell: credentials.shell,
      }),
    };
  }

  private getSessionLookupConnection(credentials: any) {
    if (credentials.connection_type !== DATABASE_CONNECTION_TYPE) {
      return null;
    }
    return {
      connection_type: credentials.connection_type,
      engine: credentials.engine,
      database: credentials.database,
    };
  }

  private normalizeContext(context: CliCommandContext, forceDeviceChange: boolean): CliCommandContext {
    return {
      ...context,
      command: `${context.command || ''}`.trim(),
      tabType: context.tabType || 'sameTab',
      forceDeviceChange,
    };
  }

  private normalizeDeviceCredentials(device: any) {
    const collectorUuid = device.collector_uuid || device.collector?.uuid;
    const connectionType = device.connection_type || 'ssh';
    const host = device.host || device.device_ip_address;

    return {
      device_name: device.device_name || device.deviceName || host,
      host,
      port: Number(device.port || (connectionType === 'winrm' ? 5985 : 22)),
      username: device.username,
      password: device.password,
      collector_uuid: collectorUuid,
      connection_type: connectionType,
      engine: connectionType === DATABASE_CONNECTION_TYPE ? device.engine : null,
      database: connectionType === DATABASE_CONNECTION_TYPE ? (device.database || device.database_name) : null,
      transport: connectionType === 'winrm' ? (device.transport || 'ntlm') : null,
      shell: connectionType === 'winrm' ? (device.shell || 'cmd') : null,
    };
  }

  private safeDevice(device: any) {
    return {
      device_name: device.device_name || device.host,
      device_ip_address: device.host || device.device_ip_address,
      host: device.host,
      port: device.port,
      username: device.username,
      collector_uuid: device.collector_uuid,
      connection_type: device.connection_type,
      engine: device.engine,
      database: device.database,
      transport: device.transport,
      shell: device.shell,
    };
  }

  private generateTabId(): string {
    return 'tab-' + Math.random().toString(36).substring(2, 10);
  }

  private sendTerminalDataToNewTab(tabId: string, input: any, auth: any) {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }
    const channel = new BroadcastChannel('terminal-tabs');
    const payload = {
      type: 'OPEN_TERMINAL',
      tabId,
      terminalData: { input, auth },
    };
    let attempts = 0;
    let interval: any;
    const send = () => {
      channel.postMessage(payload);
      attempts++;
      if (attempts >= 10) {
        clearInterval(interval);
        channel.close();
      }
    };
    send();
    interval = setInterval(send, 250);
  }
}
