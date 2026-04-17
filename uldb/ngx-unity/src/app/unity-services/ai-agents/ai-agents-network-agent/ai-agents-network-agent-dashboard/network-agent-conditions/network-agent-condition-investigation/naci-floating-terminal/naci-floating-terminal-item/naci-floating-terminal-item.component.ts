import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Terminal } from 'xterm';
import { WSSHClient } from '../naci-wssh-client';
import { FitAddon } from 'xterm-addon-fit';
import { AuthType, NaciFloatingTerminalService } from '../naci-floating-terminal.service';

@Component({
  selector: 'naci-floating-terminal-item',
  templateUrl: './naci-floating-terminal-item.component.html',
  styleUrls: ['./naci-floating-terminal-item.component.scss']
})
export class NaciFloatingTerminalItemComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  @Input()
  termInput: { input: any, auth: AuthType };
  @Input()
  index: number;

  input: any;
  auth: AuthType;
  show: boolean = true;
  term: Terminal;
  wsClient: WSSHClient;
  fitAddon = new FitAddon();
  constructor(private termService: NaciFloatingTerminalService) {
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
    this.term.dispose();
    this.wsClient.close();
  }

  initTerminal() {
    document.getElementById('term-' + this.index).setAttribute('style', 'height:' + Math.round(window.innerHeight - document.getElementsByClassName('terminal-container')[0].getBoundingClientRect().top) + 'px;');
    this.term = new Terminal({ cursorBlink: true });
    this.term.loadAddon(this.fitAddon);
    this.term.open(document.getElementById('term-' + this.index));
    this.fitAddon.fit();
    let obj = Object.assign({ hostname: this.auth.host, port: this.auth.port, password: this.auth.password, username: this.auth.username, conversation_id: this.auth.conversation_id , uuid: this.input.deviceId, org_id: this.auth.org_id, agent_id: this.auth.agent_id, pkey: this.auth.pkey }, this.getRowsCols());
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
      this.term.write("Enter Y to reconnect...\r\n");
    });

    this.wsClient.onError.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.term.write('Error: ' + res + '\r\n');
    });
  }

  sendDataToClient(data: any) {
    if (!this.wsClient.isConnectionClosed() && !this.wsClient.isConnecting()) {
      this.wsClient.sendClientData(data);
    } else if (data == 'y' || data == 'Y') {
      this.term.dispose();
      this.initTerminal();
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
