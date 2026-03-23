import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'ai-observability',
  templateUrl: './ai-observability.component.html',
  styleUrls: ['./ai-observability.component.scss']
})
export class AiObservabilityComponent implements OnInit, OnDestroy {

  tabItems: TabData[] = [];
  subscr: Subscription;

  previousUrl: string = null;
  currentUrl: string = null;

  constructor(private router: Router) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = _clone(this.currentUrl);
        this.currentUrl = _clone(event.url);
        if (event.url === '/services/ai-observability') {
          this.setTabs();
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

  setTabs() {
    if (this.previousUrl) {
      if (this.previousUrl.includes('llm')) {
        this.tabItems = llmTabData;
      }
      else if (this.previousUrl.includes('gpu')) {
        this.tabItems = gpuTabData;
      }
      else if (this.previousUrl.includes('vector-db')) {
        this.tabItems = vectorDbTabData;
      }
      else {
        this.tabItems = llmTabData; // to load a default view
      }
    }
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


const gpuTabData: TabData[] = [
  {
    name: 'Summary',
    url: '/services/ai-observability/gpu/summary',
  },
  {
    name: 'Services',
    url: '/services/ai-observability/gpu/services',
  }
]


const vectorDbTabData: TabData[] = [
  {
    name: 'Summary',
    url: '/services/ai-observability/vector-db/summary',
  },
  {
    name: 'Services',
    url: '/services/ai-observability/vector-db/services',
  }
]