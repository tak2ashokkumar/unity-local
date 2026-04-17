import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'naci-new-terminal',
  templateUrl: './naci-new-terminal.component.html',
  styleUrls: ['./naci-new-terminal.component.scss']
})
export class NaciNewTerminalComponent implements OnInit {

  @Input() config: any;

  @ViewChild('terminal', { static: true }) terminalElement: ElementRef;

  term: Terminal;
  fitAddon: FitAddon;
  ws: WebSocket;
  tabId: string = '';

  ngOnInit() {
    this.initTerminal();
    this.connectWebSocket();
  }

  ngOnDestroy() {
    this.ws?.close();
    this.term?.dispose();
  }

  initTerminal() {
    this.term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9'
      }
    });

    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);

    this.term.open(this.terminalElement.nativeElement);

    setTimeout(() => {
      this.fitAddon.fit();
      this.term.focus();
    }, 0);
  }

  generateTabId(): string {
    return 'tab-' + Math.random().toString(36).substring(2, 10);
  }

  connectWebSocket() {
    const tabId = this.generateTabId();
    this.ws = new WebSocket(`ws://10.192.11.57:8006/ws/terminal/${tabId}`);

    this.term.write('Connecting...\r\n');

    this.ws.onopen = () => {
      this.term.write('Connected\r\n');

      this.ws.send(JSON.stringify({
        type: 'init',
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
        agent_id: this.config.agent_id,
        org_id: this.config.org_id,
        conversation_id: this.config.conversation_id
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'error') {
          this.term.write(`\r\nError: ${msg.message}\r\n`);
          return;
        }

        if (msg.type === 'session') {
          this.term.write(`\r\nSession started: ${msg.session_id}\r\n`);
          return;
        }

      } catch {

        this.term.write(event.data);
      }
    };

    this.ws.onclose = () => {
      this.term.write('\r\nConnection closed\r\n');
    };

    this.ws.onerror = () => {
      this.term.write('\r\nConnection error\r\n');
    };

    this.term.onData(data => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'input',
          data
        }));
      }
    });
  }

}
