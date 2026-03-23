import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'ai-observability-llm',
  templateUrl: './ai-observability-llm.component.html',
  styleUrls: ['./ai-observability-llm.component.scss']
})
export class AiObservabilityLlmComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = llmTabData;
  subscr: Subscription;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/ai-observability/llm') {
          this.router.navigate([this.tabItems[0].url]);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscr.unsubscribe();
  }

}

const llmTabData: TabData[] = [
  {
    name: 'Summary',
    url: '/services/ai-observability/llm/summary',
  },
  {
    name: 'Services',
    url: '/services/ai-observability/llm/services',
  }
]