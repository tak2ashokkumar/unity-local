import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'database-ai-agent',
  templateUrl: './database-ai-agent.component.html',
  styleUrls: ['./database-ai-agent.component.scss']
})
export class DatabaseAiAgentComponent implements OnInit, OnDestroy {
  subscr: Subscription;
  tabItems: TabData[] = tabData;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.redirectToDefaultTab();

    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.redirectToDefaultTab();
      }
    });
  }

  ngOnDestroy() {
    this.subscr?.unsubscribe();
  }

  private redirectToDefaultTab(): void {
    if (this.router.url === '/unity-copilot/database-ai-agent') {
      this.router.navigate([this.tabItems[0]?.url]);
    }
  }
}

const tabData: TabData[] = [
  {
    name: 'Dashboard',
    url: '/unity-copilot/database-ai-agent/dashboard',
  },
];
