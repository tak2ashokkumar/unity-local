import { Component, OnInit } from '@angular/core';
import { NaciNewTerminalService } from '../naci-new-terminal/naci-new-terminal.service';
import { ActivatedRoute } from '@angular/router';
import { NaciFloatingTerminalService } from '../naci-floating-terminal/naci-floating-terminal.service';

@Component({
  selector: 'naci-terminal-new-tab',
  templateUrl: './naci-terminal-new-tab.component.html',
  styleUrls: ['./naci-terminal-new-tab.component.scss']
})
export class NaciTerminalNewTabComponent implements OnInit {

  terminalData: any;
  private channel: BroadcastChannel;
  private currentTabId: string;
  private registered: boolean = false;

  constructor(private terminalService: NaciNewTerminalService,
    private route: ActivatedRoute,
    private floatingTerminalService: NaciFloatingTerminalService
  ) { }

  ngOnInit(): void {
    console.log('naci new terminal tab');

    this.channel = new BroadcastChannel('terminal-tabs');

    this.channel.onmessage = (event) => {
      console.log('=== NEW TAB received message ===', event.data);
      const { type, tabId, command } = event.data;

      // ✅ Always resolve currentTabId from service as fallback
      if (!this.currentTabId) {
        this.currentTabId = this.terminalService.getBackendTabId();
      }

      if (type === 'REGISTER_ACK' && tabId === this.currentTabId) {
        console.log('REGISTER_ACK received for:', this.currentTabId);
        this.registered = true;
        return;
      }

      if (type === 'PING') {
        console.log('PING received, executing command');
        this.currentTabId = tabId; // lock it in
        this.channel.postMessage({ type: 'PONG', tabId });
        window.focus();

        const cmd = localStorage.getItem('terminal_command');
        if (cmd) {
          setTimeout(() => {
            this.floatingTerminalService.executeInTerminal(tabId, cmd, 'newTab');
            localStorage.removeItem('terminal_command');
          }, 300);
        }
      }

      if (type === 'FOCUS_AND_EXECUTE' && tabId === this.currentTabId) {
        this.channel.postMessage({ type: 'PONG', tabId });
        window.focus();
        setTimeout(() => {
          if (command) {
            localStorage.setItem('terminal_command', command);
          }
        }, 200);
      }
    };

    const tabId = this.route.snapshot.queryParamMap.get('tabId');
    if (tabId) {
      this.currentTabId = tabId;
      this.terminalService.setBackendTabId(tabId);
    }

    // ✅ Keep currentTabId in sync when auth component sets it
    // (first open — tabId comes from auth submit, not URL)
    this.terminalService.backendTabId$.subscribe(id => {
      if (id && id !== this.currentTabId) {
        console.log('=== currentTabId updated from service:', id);
        this.currentTabId = id;
      }
    });

    this.terminalService.setPendingTabType('newTab');

    const conversationId = this.route.snapshot.queryParamMap.get('conversationId');
    if (conversationId) {
      this.terminalService.setConversationId(conversationId);
    }

    setTimeout(() => {
      this.terminalService.openTerminal();
    }, 0);

    this.terminalService.terminalData$.subscribe(data => {
      this.terminalData = data;
    });
  }

}
