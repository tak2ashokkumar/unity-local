import { Component, OnInit, Input, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Terminal } from 'xterm';
// import { fit } from 'xterm/lib/addons/fit/fit';
import { WSSHClient, WSOption } from './WSSHClient';
import { AuthType, TerminalInput } from '../check-auth/check-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserInfoService } from '../user-info.service';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'app-xterm',
  templateUrl: './app-xterm.component.html',
  styleUrls: ['./app-xterm.component.scss']
})
export class AppXtermComponent implements OnInit, OnDestroy {
  //To connect to WSSH
  @Input() input: TerminalInput;
  term: Terminal;
  wsClient: WSSHClient;
  private ngUnsubscribe = new Subject();
  fitAddon = new FitAddon();
  constructor(private router: Router,
    private route: ActivatedRoute) { }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: Event) {
    setTimeout(() => {
      this.setHeightToContainer();
      if (this.input) {
        // fit(this.term);
        this.fitAddon.fit();
        this.wsClient.sendResizeData(this.getRowsCols());
      }
    }, 0);
  }

  isNewTab() {
    return this.router.url.match('unityterminal');
  }

  ngOnInit() {
    setTimeout(() => {
      this.setHeightToContainer();
      if (this.input) {
        this.initTerminal();
      }
    }, 0);
  }


  ngOnDestroy() {
    if (this.input) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
      this.term.dispose();
      this.wsClient.close();
    }
  }

  setHeightToContainer() {
    let ele = document.getElementsByClassName('terminal-container')[0];
    ele.setAttribute('style', 'height:' + Math.round(window.innerHeight - ele.getBoundingClientRect().top) + 'px;');
    document.getElementById('terminal').setAttribute('style', 'height:' + Math.round(window.innerHeight - ele.getBoundingClientRect().top - 30) + 'px;');
  }

  initTerminal() {
    this.term = new Terminal({ cursorBlink: true });
    this.term.loadAddon(this.fitAddon);
    this.term.open(document.getElementById('terminal'));
    this.fitAddon.fit();
    // fit(this.term);
    let obj = Object.assign({ hostname: this.input.host, port: this.input.port, password: this.input.password, username: this.input.username, uuid: this.input.uuid, org_id: this.input.org_id, agent_id: this.input.agent_id, pkey:this.input.pkey }, this.getRowsCols());
    this.wsClient = new WSSHClient(obj);
    this.term.write('Connecting...');
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
      // this.term.on('paste', function (data) {
      //   this.sendDataToClient(data);
      // });
    });

    this.wsClient.onMessage.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.term.write(res);
    });

    this.wsClient.onClose.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.term.write("\rconnection closed\r\n");
      this.term.write("Enter Y to reconnect...\r\n");
    });

    this.wsClient.onError.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.term.write('Error: ' + res + '\r\n');
    });
  }

  sendDataToClient(data: any) {
    if (!this.wsClient.isConnectionClosed()) {
      this.wsClient.sendClientData(data);
    } else if (data == 'y' || data == 'Y') {
      this.term.dispose();
      this.initTerminal();
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  getRowsCols() {
    let ele = document.getElementById('terminal');
    let subjectRow = document.getElementsByClassName('xterm-char-measure-element')[0];
    subjectRow.setAttribute('style', 'display:inline');
    subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
    let characterWidth = subjectRow.getBoundingClientRect().width;
    subjectRow.setAttribute('style', 'display:""');
    let characterHeight = subjectRow.getBoundingClientRect().height;
    let rows = Math.round((ele.clientHeight - 17) / characterHeight);
    let cols = Math.round((ele.clientWidth - 17) / characterWidth);
    return { 'rows': rows, 'cols': cols };
  }
}
