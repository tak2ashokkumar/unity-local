import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';

@Component({
  selector: 'condition-investigation-terminal-new-tab',
  templateUrl: './condition-investigation-terminal-new-tab.component.html',
  styleUrls: ['./condition-investigation-terminal-new-tab.component.scss']
})
export class ConditionInvestigationTerminalNewTabComponent implements OnInit {
  terminalData: any;

  constructor(private terminalService: ConditionInvestigationNewTerminalService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
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
