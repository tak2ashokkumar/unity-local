import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthType, ConditionInvestigationFloatingTerminalService } from '../condition-investigation-floating-terminal.service';
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
  termInput: { input: any, auth: AuthType };
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.termService.unregisterTerminal(this.input.tabId);
    this.term.dispose();
    this.wsClient.close();
  }

  initTerminal() {
    this.currentCommand = '';
    this.exitCommandSent = false;
    document.getElementById('term-' + this.index).setAttribute('style', 'height:' + Math.round(window.innerHeight - document.getElementsByClassName('terminal-container')[0].getBoundingClientRect().top) + 'px;');
    this.term = new Terminal({ cursorBlink: true });
    this.term.loadAddon(this.fitAddon);
    this.term.open(document.getElementById('term-' + this.index));
    this.fitAddon.fit();
    let obj = Object.assign({ hostname: this.auth.host, port: this.auth.port, collector_uuid: this.auth.collector_uuid, password: this.auth.password, username: this.auth.username, conversation_id: this.auth.conversation_id, uuid: this.input.tabId, tab_type: this.auth.tab_type, org_id: this.auth.org_id, user_id: this.auth.user_id, agent_id: this.auth.agent_id, connection_type: this.auth.connection_type,transport: this.auth.transport,shell: this.auth.shell,pkey: this.auth.pkey }, this.getRowsCols());
    this.wsClient = new WSSHClient(obj);
    this.termService.registerTerminal(this.input.tabId, this.wsClient, this.tabType);
    this.termService.setTabRunning(this.input.tabId, false);
    this.term.write(`Connecting to ${this.input.deviceName}...`);
    this.wsClient.connect();
    this.subscribeToEvent();

  }

  subscribeToEvent() {
    this.wsClient.onOpen.subscribe(res => {
      this.wsClient.sendInitData();
      this.term.focus();
      this.term.onData((data: any) => {
        this.sendDataToClient(data);
      });
    });

    this.wsClient.onMessage.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.term.write(res);

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
      this.term.write(`\rconnection closed\r\n`);
      if (!this.exitCommandSent) {
        this.term.write("Enter Y to reconnect...\r\n");
      }
    });

    this.wsClient.onError.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.term.write('Error: ' + res + '\r\n');
    });
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
