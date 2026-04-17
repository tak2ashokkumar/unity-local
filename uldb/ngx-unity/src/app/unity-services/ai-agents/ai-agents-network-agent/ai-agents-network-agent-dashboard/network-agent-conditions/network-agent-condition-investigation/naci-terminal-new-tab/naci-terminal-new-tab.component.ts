import { Component, OnInit } from '@angular/core';
import { NaciNewTerminalService } from '../naci-new-terminal/naci-new-terminal.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'naci-terminal-new-tab',
  templateUrl: './naci-terminal-new-tab.component.html',
  styleUrls: ['./naci-terminal-new-tab.component.scss']
})
export class NaciTerminalNewTabComponent implements OnInit {

  terminalData: any;

  constructor(private terminalService: NaciNewTerminalService,
    private route: ActivatedRoute
  ) { }

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
