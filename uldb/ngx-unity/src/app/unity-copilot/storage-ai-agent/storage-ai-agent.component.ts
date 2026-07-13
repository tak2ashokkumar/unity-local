import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'storage-ai-agent',
  templateUrl: './storage-ai-agent.component.html',
  styleUrls: ['./storage-ai-agent.component.scss']
})
export class StorageAiAgentComponent implements OnInit, OnDestroy {
  subscr: Subscription;
  tabItems: TabData[] = tabData;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unity-copilot/storage-ai-agent') {
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
    url: '/unity-copilot/storage-ai-agent/dashboard',
  },
];