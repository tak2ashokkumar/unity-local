import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { ConditionInvestigationFloatingTerminalService } from '../condition-investigation-floating-terminal/condition-investigation-floating-terminal.service';

@Component({
  selector: 'condition-investigation-terminal-new-tab',
  templateUrl: './condition-investigation-terminal-new-tab.component.html',
  styleUrls: ['./condition-investigation-terminal-new-tab.component.scss']
})
export class ConditionInvestigationTerminalNewTabComponent implements OnInit {
  terminalData: any;
  private channel: BroadcastChannel;
  private currentTabId: string;
  private registered: boolean = false;

  constructor(private terminalService: ConditionInvestigationNewTerminalService,
    private route: ActivatedRoute,
    private floatingTerminalService: ConditionInvestigationFloatingTerminalService) { }

  ngOnInit(): void {
    this.channel = new BroadcastChannel('terminal-tabs');

    this.channel.onmessage = (event) => {
      const { type, tabId } = event.data;
      if (type === 'PING') {
        this.currentTabId = tabId;
        window.focus();
        const cmd = localStorage.getItem('terminal_command');
        if (cmd) {
          setTimeout(() => {
            this.floatingTerminalService.executeInTerminal(tabId, cmd, 'newTab');
            localStorage.removeItem('terminal_command');
          }, 300);
        }
      }
    };

    const tabId = this.route.snapshot.queryParamMap.get('tabId');
    const conversationId = this.route.snapshot.queryParamMap.get('conversationId');

    if (tabId) this.currentTabId = tabId;
    if (conversationId) this.terminalService.setConversationId(conversationId);

    this.terminalService.setPendingTabType('newTab');

    // ✅ read from localStorage and open terminal directly
    const savedInput = localStorage.getItem('new_tab_input');
    const savedAuth = localStorage.getItem('new_tab_auth');

    console.log('savedInput:', savedInput);
    console.log('savedAuth:', savedAuth);

    if (savedInput && savedAuth) {
      const input = JSON.parse(savedInput);
      const auth = JSON.parse(savedAuth);
      localStorage.removeItem('new_tab_input');
      localStorage.removeItem('new_tab_auth');
      // ✅ directly set terminalData — no need to go through service
      this.terminalData = { input, auth };
    }

    this.terminalService.terminalData$.subscribe(data => {
      this.terminalData = data;
    });
  }


}
