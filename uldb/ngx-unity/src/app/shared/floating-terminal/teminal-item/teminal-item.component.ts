import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Terminal } from 'xterm';
// import { fit } from 'xterm/lib/addons/fit/fit';
import { FitAddon } from 'xterm-addon-fit';
import { FloatingTerminalInput, FloatingTerminalService } from '../floating-terminal.service';
import { AuthType, CheckAuthService, ConsoleAccessInput } from '../../check-auth/check-auth.service';
import { WSSHClient } from '../../app-xterm/WSSHClient';

@Component({
  selector: 'teminal-item',
  templateUrl: './teminal-item.component.html',
  styleUrls: ['./teminal-item.component.scss']
})
export class TeminalItemComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input()
  termInput: { input: ConsoleAccessInput, auth: AuthType };
  @Input()
  index: number;

  input: ConsoleAccessInput;
  auth: AuthType;
  show: boolean = true;
  term: Terminal;
  wsClient: WSSHClient;
  fitAddon = new FitAddon();
  private currentCommand = '';
  private exitCommandSent = false;
  private reconnecting = false;
  constructor(private termService: FloatingTerminalService, private authService: CheckAuthService) {
    this.termService.resizeAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      setTimeout(() => {
        if (document.getElementById('term-' + this.index)) {
          document.getElementById('term-' + this.index).setAttribute('style', 'height:' + Math.round(window.innerHeight - document.getElementsByClassName('terminal-container')[0].getBoundingClientRect().top) + 'px;');
          console.log('calling fit')
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
    let obj = Object.assign({ hostname: this.auth.host, port: this.auth.port, password: this.auth.password, username: this.auth.username, uuid: this.input.deviceId, org_id: this.auth.org_id, agent_id: this.auth.agent_id, pkey: this.auth.pkey }, this.getRowsCols());
    this.wsClient = new WSSHClient(obj);
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
      // this.term.on('paste', (data) => {
      //   this.sendDataToClient(data);
      // });
    });

    this.wsClient.onMessage.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.term.write(res);
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
    } else if ((data == 'y' || data == 'Y') && !this.reconnecting) {
      this.reconnect();
    }
  }

  // Re-establishing an SSH session after a disconnect must go back through the
  // credential prompt rather than silently replaying the cached password/pkey
  // from the original connection.
  reconnect() {
    this.reconnecting = true;
    this.auth = null;
    this.authService.checkAuth({
      label: this.input.deviceName, deviceType: this.input.deviceType,
      deviceId: this.input.deviceId, managementIp: this.input.managementIp, port: this.input.port,
      newTab: false, deviceName: this.input.deviceName, userName: this.input.userName,
      osType: this.input.osType, ipType: this.input.ipType
    }).pipe(take(1)).subscribe(res => {
      this.reconnecting = false;
      if (res != null) {
        this.auth = res;
        this.term.dispose();
        this.initTerminal();
      } else {
        this.term.write("\rReconnect cancelled.\r\nEnter Y to reconnect...\r\n");
      }
    });
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
