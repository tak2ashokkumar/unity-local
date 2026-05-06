import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'ai-agents-network-agent',
  templateUrl: './ai-agents-network-agent.component.html',
  styleUrls: ['./ai-agents-network-agent.component.scss'],
})
export class AiAgentsNetworkAgentComponent implements OnInit, OnDestroy {
  subscr: Subscription;
  tabItems: TabData[] = tabData;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/ops-co-pilot/network-ai-agent') {
          this.router.navigate([this.tabItems[0]?.url]);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscr?.unsubscribe();
  }
}

const tabData: TabData[] = [
  {
    name: 'Dashboard',
    url: '/services/ops-co-pilot/network-ai-agent/dashboard',
  },
  // {
  //   name: 'Network Agent Hub',
  //   url: '/services/ops-co-pilot/network-ai-agent/network-agent-hub',
  // }
];