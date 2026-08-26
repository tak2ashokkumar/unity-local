import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthType, CliTerminalLifecycleEvent, ConditionInvestigationFloatingTerminalService } from '../condition-investigation-floating-terminal.service';
import { Terminal } from 'xterm';
import { WSSHClient } from '../condition-investigation-wssh-client';
import { FitAddon } from 'xterm-addon-fit';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'condition-investigation-floating-terminal-item',
  templateUrl: './condition-investigation-floating-terminal-item.component.html',
  styleUrls: ['./condition-investigation-floating-terminal-item.component.scss']
})
export class ConditionInvestigationFloatingTerminalItemComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input()
  termInput: { input: any, auth: AuthType, terminalSnapshot?: string };
  @Input()
  index: number;
  isRunning: boolean = false;
  @Input() tabType: 'sameTab' | 'newTab';

  input: any;
  auth: AuthType;
  show: boolean = true;
  term: Terminal;
  wsClient: WSSHClient;
  fitAddon = new FitAddon();
  private currentCommand = '';
  private exitCommandSent = false;
  private lifecycleCompleted = false;
  private suppressInitialConnectionOutput = false;
  private initialConnectionReady = false;
  private initialInputSent = false;
  private terminalHistory = '';

  constructor(private termService: ConditionInvestigationFloatingTerminalService) {
    this.termService.resizeAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      setTimeout(() => {
        if (document.getElementById('term-' + this.index)) {
          document.getElementById('term-' + this.index).setAttribute('style', 'height:' + Math.round(window.innerHeight - document.getElementsByClassName('terminal-container')[0].getBoundingClientRect().top) + 'px;');
          // fit(this.term);
          this.fitAddon.fit();
          this.wsClient.sendResizeData(this.getRowsCols());
        }
      }, 0);
    });
  }

  ngOnInit() {
    this.input = this.termInput.input;
    this.auth = this.termInput.auth;
    setTimeout(() => {
      this.initTerminal();
    }, 0);
  }

  ngOnDestroy() {
    this.emitTerminalClosedIfNeeded('Terminal closed before command completed.');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.termService.unregisterTerminal(this.input.tabId);
    this.term?.dispose();
    this.wsClient?.close();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    this.emitTerminalClosedIfNeeded('Terminal tab closed before command completed.');
  }

  initTerminal() {
    this.currentCommand = '';
    this.exitCommandSent = false;
    this.lifecycleCompleted = false;
    this.suppressInitialConnectionOutput = Boolean(this.termInput.terminalSnapshot);
    this.initialConnectionReady = false;
    this.initialInputSent = false;
    this.terminalHistory = this.termInput.terminalSnapshot || '';
    document.getElementById('term-' + this.index).setAttribute('style', 'height:' + Math.round(window.innerHeight - document.getElementsByClassName('terminal-container')[0].getBoundingClientRect().top) + 'px;');
    this.term = new Terminal({ cursorBlink: true });
    this.term.loadAddon(this.fitAddon);
    this.term.open(document.getElementById('term-' + this.index));
    this.fitAddon.fit();
    if (this.termInput.terminalSnapshot) {
      this.term.write(this.termInput.terminalSnapshot);
    }
    let obj = Object.assign({ hostname: this.auth.host, port: this.auth.port, collector_uuid: this.auth.collector_uuid, password: this.auth.password, username: this.auth.username, conversation_id: this.auth.conversation_id, uuid: this.input.tabId, tab_type: this.auth.tab_type, org_id: this.auth.org_id, user_id: this.auth.user_id, agent_id: this.auth.agent_id, connection_type: this.auth.connection_type, engine: this.auth.engine, database: this.auth.database, transport: this.auth.transport, shell: this.auth.shell, pkey: this.auth.pkey }, this.getRowsCols());
    this.wsClient = new WSSHClient(obj);
    this.termService.registerTerminal(this.input.tabId, this.wsClient, this.tabType);
    this.termService.setTabRunning(this.input.tabId, false);
    if (!this.suppressInitialConnectionOutput) {
      this.writeTerminal(`Connecting to ${this.input.deviceName}...`);
    }
    this.wsClient.connect();
    this.subscribeToEvent();

  }

  getTerminalSnapshot(): string {
    return this.terminalHistory;
  }

  subscribeToEvent() {
    this.wsClient.onOpen.subscribe(res => {
      this.wsClient.sendInitData();
      this.term.focus();
      this.term.onData((data: any) => {
        this.sendDataToClient(data);
      });
    });

    this.wsClient.onInput.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.initialInputSent = true;
      if (this.initialConnectionReady) {
        this.suppressInitialConnectionOutput = false;
      }
    });

    this.wsClient.onMessage.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const lifecycleEvent = this.parseLifecycleEvent(res);
      if (lifecycleEvent) {
        this.handleLifecycleEvent(lifecycleEvent);
        return;
      }

      if (this.suppressInitialConnectionOutput) {
        if (this.wsClient.isShellReady(res)) {
          this.initialConnectionReady = true;
          if (this.initialInputSent) {
            this.suppressInitialConnectionOutput = false;
          }
        }
        return;
      }

      this.writeTerminal(res);

      // VERY IMPORTANT: detect command start
      if (!this.isRunning && this.wsClient['_commandSent']) {
        this.isRunning = true;
        this.termService.setTabRunning(this.input.tabId, true);
      }

      // detect command end (basic heuristic)
      if (this.wsClient.isShellReady(res)) {
        this.isRunning = false;
        this.termService.setTabRunning(this.input.tabId, false);
      }
    });

    this.wsClient.onClose.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.writeTerminal(`\rconnection closed\r\n`);
      this.emitTerminalClosedIfNeeded('Terminal connection closed before command completed.');
      if (!this.exitCommandSent) {
        this.writeTerminal("Enter Y to reconnect...\r\n");
      }
    });

    this.wsClient.onError.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.writeTerminal('Error: ' + res + '\r\n');
    });
  }

  private writeTerminal(data: string) {
    this.terminalHistory += data;
    this.term.write(data);
  }

  private parseLifecycleEvent(raw: any): any | null {
    if (typeof raw !== 'string') {
      return null;
    }
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      return null;
    }
    try {
      const parsed = JSON.parse(trimmed);
      const type = parsed.type || parsed.event;
      if (type === 'error') {
        return {
          ...parsed,
          type: 'command_failed',
          reason: 'terminal_error',
          error: parsed.message || 'Terminal connection failed.'
        };
      }
      if (['command_started', 'command_completed', 'command_failed'].includes(type)) {
        return { ...parsed, type };
      }
    } catch { }
    return null;
  }

  private handleLifecycleEvent(event: any) {
    if (event.type === 'command_completed' || event.type === 'command_failed') {
      this.lifecycleCompleted = true;
    }
    if (event.type === 'command_started') {
      this.isRunning = true;
      this.termService.setTabRunning(this.input.tabId, true);
    } else {
      this.isRunning = false;
      this.termService.setTabRunning(this.input.tabId, false);
    }

    this.termService.emitCommandLifecycle({
      type: event.type,
      tabId: this.input.tabId,
      tabType: this.tabType,
      conversationId: this.auth.conversation_id,
      command: event.command,
      cli_audit_log_id: event.cli_audit_log_id || event.cliAuditLogId || event.audit_log_id || event.auditLogId || event.id,
      error: event.error || event.message,
      payload: event,
    });
  }

  private emitTerminalClosedIfNeeded(error: string) {
    if (!this.input?.tabId || this.lifecycleCompleted || this.exitCommandSent) {
      return;
    }
    const event: CliTerminalLifecycleEvent = {
      type: 'command_failed',
      tabId: this.input.tabId,
      tabType: this.tabType,
      conversationId: this.auth?.conversation_id,
      error,
      payload: {
        reason: 'terminal_closed',
      },
    };
    this.lifecycleCompleted = true;
    this.isRunning = false;
    this.termService.setTabRunning(this.input.tabId, false);
    this.termService.emitCommandLifecycle(event);
  }

  sendDataToClient(data: any) {
    if (!this.wsClient.isConnectionClosed() && !this.wsClient.isConnecting()) {
      this.trackExitCommand(data);
      this.wsClient.sendClientData(data);
    } else if (data == 'y' || data == 'Y') {
      this.term.dispose();
      this.initTerminal();
    }
  }

  trackExitCommand(data: any) {
    const input = String(data);
    for (const char of input) {
      if (char === '\r' || char === '\n') {
        if (this.currentCommand.trim().toLowerCase() === 'exit') {
          this.exitCommandSent = true;
        }
        this.currentCommand = '';
      } else if (char === '\u007f' || char === '\b') {
        this.currentCommand = this.currentCommand.slice(0, -1);
      } else if (char >= ' ') {
        this.currentCommand += char;
      }
    }
  }

  getRowsCols() {
    let ele = document.getElementById('term-' + this.index);
    let subjectRow = document.querySelector('#term-' + this.index + ' .xterm-char-measure-element');
    subjectRow.setAttribute('style', 'display:inline');
    subjectRow.innerHTML = 'W';
    let characterWidth = subjectRow.getBoundingClientRect().width;
    subjectRow.setAttribute('style', 'display:""');
    let characterHeight = subjectRow.getBoundingClientRect().height;
    let rows = Math.round((ele.clientHeight - 17) / characterHeight);
    let cols = Math.round((ele.clientWidth - 17) / characterWidth);
    return { 'rows': rows, 'cols': cols };
  }

}
