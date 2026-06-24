import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'compute-ai-agent',
  templateUrl: './compute-ai-agent.component.html',
  styleUrls: ['./compute-ai-agent.component.scss']
})
export class ComputeAiAgentComponent implements OnInit {
  subscr: Subscription;
  tabItems: TabData[] = tabData;
  
  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unity-copilot/compute-ai-agent') {
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
    url: '/unity-copilot/compute-ai-agent/dashboard',
  },
];